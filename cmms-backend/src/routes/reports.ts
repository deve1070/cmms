import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole, AuthRequest } from '../middleware/auth'; // Combined AuthRequest
import { Role } from '../config/permissions'; // Added Role import

const router = Router();
const prisma = new PrismaClient();

// Get performance reports
router.get('/performance', authenticateToken, checkRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
  try {
    const { startDate, endDate, equipmentId } = req.query;
    const reports = await prisma.report.findMany({
      where: {
        type: 'Performance',
        period: {
          gte: startDate as string,
          lte: endDate as string
        }
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance reports' });
  }
});

// Get financial reports
router.get('/financial', authenticateToken, checkRole([Role.ADMIN]), async (req, res) => {
  try {
    const { year, month, category } = req.query;
    const reports = await prisma.report.findMany({
      where: {
        type: 'Financial',
        period: `${year}-${month}`,
        ...(category && { category: category as string })
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial reports' });
  }
});

// Get compliance reports
router.get('/compliance', authenticateToken, checkRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
  try {
    const { standard, status } = req.query;
    const reports = await prisma.report.findMany({
      where: {
        type: 'Compliance',
        ...(standard && { standard: standard as string }),
        ...(status && { status: status as string })
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch compliance reports' });
  }
});

// Generate new report
router.post('/', authenticateToken, checkRole([Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const { type, title, content, period, metrics } = req.body;

    // Validate required fields
    if (!type || !title || !content || !period || !metrics) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'title', 'content', 'period', 'metrics']
      });
    }

    const report = await prisma.report.create({
      data: {
        type,
        title,
        content,
        period,
        metrics: JSON.stringify(metrics),
        generatedAt: new Date().toISOString(),
        generatedBy: req.user?.id || 'system'
      }
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, checkRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.report.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});


// --- Helper function to calculate cost from partsUsed JSON ---
interface PartsUsedEntry {
  id: string;
  quantity: number;
}

async function calculatePartsCost(partsUsedString: string | null): Promise<number> {
  if (!partsUsedString) {
    return 0;
  }
  try {
    const partsUsedArray = JSON.parse(partsUsedString) as PartsUsedEntry[];
    if (!Array.isArray(partsUsedArray) || partsUsedArray.length === 0) {
      return 0;
    }

    const partIds = partsUsedArray.map(p => p.id);
    const sparePartsData = await prisma.sparePart.findMany({
      where: { id: { in: partIds } },
      select: { id: true, unitCost: true },
    });

    const unitCostsMap = new Map(sparePartsData.map(p => [p.id, p.unitCost]));
    let totalCost = 0;

    for (const partEntry of partsUsedArray) {
      const unitCost = unitCostsMap.get(partEntry.id);
      if (unitCost) {
        totalCost += unitCost * partEntry.quantity;
      } else {
        console.warn(`Spare part with ID ${partEntry.id} not found for cost calculation.`);
      }
    }
    return totalCost;
  } catch (error) {
    console.error('Error calculating parts cost:', error);
    return 0; // Or throw error to be handled by caller
  }
}


// --- Report Generation Functions ---

async function generateEquipmentDowntimeReport(periodStart: Date, periodEnd: Date, generatedByUserId: string, prismaInstance: PrismaClient) {
  const workOrders = await prismaInstance.workOrder.findMany({
    where: {
      type: 'Corrective', // Assuming Corrective WOs imply downtime
      status: 'Completed',
      completedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      reportedAt: { not: null }, // Ensure reportedAt exists to calculate downtime
    },
    include: {
      equipment: {
        select: { id: true, manufacturerName: true, modelNumber: true, serialNumber: true },
      },
    },
  });

  const downtimeByEquipment: Record<string, { equipmentName: string, totalDowntimeHours: number, workOrderCount: number }> = {};

  for (const wo of workOrders) {
    if (wo.completedAt && wo.reportedAt) {
      const downtimeMillis = new Date(wo.completedAt).getTime() - new Date(wo.reportedAt).getTime();
      const downtimeHours = downtimeMillis / (1000 * 60 * 60);

      if (!downtimeByEquipment[wo.equipmentId]) {
        downtimeByEquipment[wo.equipmentId] = {
          equipmentName: `${wo.equipment.manufacturerName} ${wo.equipment.modelNumber} (S/N: ${wo.equipment.serialNumber})`,
          totalDowntimeHours: 0,
          workOrderCount: 0,
        };
      }
      downtimeByEquipment[wo.equipmentId].totalDowntimeHours += downtimeHours;
      downtimeByEquipment[wo.equipmentId].workOrderCount++;
    }
  }

  const content = Object.entries(downtimeByEquipment).map(([equipmentId, data]) => ({
    equipmentId,
    ...data,
    averageDowntimeHours: data.workOrderCount > 0 ? data.totalDowntimeHours / data.workOrderCount : 0,
  }));

  const totalDowntimeAllEquipment = content.reduce((sum, item) => sum + item.totalDowntimeHours, 0);
  const totalWOsContributing = workOrders.length;

  const report = await prismaInstance.report.create({
    data: {
      type: 'Performance',
      title: `Equipment Downtime Report (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()})`,
      content: JSON.stringify(content),
      period: `${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
      generatedBy: generatedByUserId,
      metrics: JSON.stringify({ totalDowntimeAllEquipment, totalWOsContributing }),
    },
  });
  return report;
}

async function generateMaintenanceCostsReport(periodStart: Date, periodEnd: Date, generatedByUserId: string, prismaInstance: PrismaClient) {
  const workOrders = await prismaInstance.workOrder.findMany({
    where: {
      status: 'Completed', // Consider only completed work orders for costs
      completedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      equipment: {
        select: { id: true, manufacturerName: true, modelNumber: true, serialNumber: true },
      },
    }
  });

  // Note: This simple sum of MaintenanceHistory costs might double count if WOs also log these.
  // A more robust system might link MaintenanceHistory directly to a WorkOrder or have distinct cost types.
  const maintenanceHistoryCosts = await prismaInstance.maintenanceHistory.aggregate({
    _sum: { cost: true },
    where: {
      date: { // Assuming 'date' field in MaintenanceHistory is a string like 'YYYY-MM-DD'
        gte: periodStart.toISOString().split('T')[0],
        lte: periodEnd.toISOString().split('T')[0],
      },
      cost: { not: null }
    },
  });

  const costsByEquipment: Record<string, { equipmentName: string, totalDirectCosts: number, totalPartsCost: number, totalCombinedCost: number, workOrderCount: number }> = {};
  let overallTotalPartsCost = 0;
  let overallTotalDirectCost = 0;

  for (const wo of workOrders) {
    const partsCostForWO = await calculatePartsCost(wo.partsUsed);
    const directCostWO = wo.cost || 0;

    if (!costsByEquipment[wo.equipmentId]) {
      costsByEquipment[wo.equipmentId] = {
        equipmentName: `${wo.equipment.manufacturerName} ${wo.equipment.modelNumber} (S/N: ${wo.equipment.serialNumber})`,
        totalDirectCosts: 0,
        totalPartsCost: 0,
        totalCombinedCost: 0,
        workOrderCount: 0,
      };
    }
    costsByEquipment[wo.equipmentId].totalDirectCosts += directCostWO;
    costsByEquipment[wo.equipmentId].totalPartsCost += partsCostForWO;
    costsByEquipment[wo.equipmentId].totalCombinedCost += directCostWO + partsCostForWO;
    costsByEquipment[wo.equipmentId].workOrderCount++;

    overallTotalPartsCost += partsCostForWO;
    overallTotalDirectCost += directCostWO;
  }

  const content = Object.values(costsByEquipment);
  const totalMaintenanceSpendFromWOs = overallTotalDirectCost + overallTotalPartsCost;
  // This is a rough sum, be cautious about interpretation due to potential overlaps noted above.
  const grandTotalMaintenanceSpend = totalMaintenanceSpendFromWOs + (maintenanceHistoryCosts._sum.cost || 0);


  const report = await prismaInstance.report.create({
    data: {
      type: 'Financial',
      title: `Maintenance Costs Report (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()})`,
      content: JSON.stringify(content),
      period: `${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
      generatedBy: generatedByUserId,
      metrics: JSON.stringify({
        totalWorkOrderCosts: totalMaintenanceSpendFromWOs,
        totalMaintenanceHistoryDirectCosts: maintenanceHistoryCosts._sum.cost || 0,
        grandTotalMaintenanceSpend
      }),
    },
  });
  return report;
}


// --- API Endpoints for Report Generation ---

router.post(
  '/generate/downtime',
  authenticateToken,
  checkRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]),
  async (req: AuthRequest, res) => {
    try {
      const { periodStart, periodEnd } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(403).json({ error: "User ID not found in token." });
      if (!periodStart || !periodEnd) {
        return res.status(400).json({ error: 'periodStart and periodEnd are required.' });
      }

      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for periodStart or periodEnd.' });
      }
      if (startDate > endDate) {
        return res.status(400).json({ error: 'periodStart cannot be after periodEnd.' });
      }

      const report = await generateEquipmentDowntimeReport(startDate, endDate, userId, prisma);
      res.status(201).json(report);
    } catch (error: any) {
      console.error("Error generating downtime report:", error);
      res.status(500).json({ error: 'Failed to generate downtime report.', details: error.message });
    }
  }
);


// --- Staff Efficiency Report ---

async function generateStaffEfficiencyReport(periodStart: Date, periodEnd: Date, generatedByUserId: string, prismaInstance: PrismaClient) {
  const completedWorkOrders = await prismaInstance.workOrder.findMany({
    where: {
      status: 'Completed',
      completedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      assignedTo: {
        not: null, // Ensure there is an assignee
      },
      // Ensure reportedAt and completedAt are not null for time calculation
      reportedAt: { not: null },
    },
    select: {
      assignedTo: true,
      type: true,
      reportedAt: true,
      completedAt: true,
      // id: true, // For debugging if needed
    },
  });

  if (completedWorkOrders.length === 0) {
    // Create an empty content report if no relevant work orders
     const emptyReport = await prismaInstance.report.create({
      data: {
        type: 'StaffEfficiency',
        title: `Staff Efficiency Report (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}) - No Data`,
        content: JSON.stringify([]),
        period: `${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
        generatedBy: generatedByUserId,
        metrics: JSON.stringify({ totalCompletedWorkOrders: 0, overallAvgCompletionTimeHours: 0, totalTechniciansReported: 0 }),
      },
    });
    return emptyReport;
  }

  const assigneesUsernames = [...new Set(completedWorkOrders.map(wo => wo.assignedTo).filter(Boolean) as string[])];

  const users = await prismaInstance.user.findMany({
    where: {
      username: { in: assigneesUsernames }, // Assuming assignedTo stores username. If it's ID, this needs adjustment.
    },
    select: {
      id: true,
      username: true,
    },
  });
  const userMap = new Map(users.map(u => [u.username, u]));

  const efficiencyData: any[] = [];
  let totalCompletionTimeHoursOverall = 0;
  let totalWorkOrdersOverall = 0;

  for (const assigneeUsername of assigneesUsernames) {
    const userDetails = userMap.get(assigneeUsername);
    if (!userDetails) {
      console.warn(`User details not found for assignee: ${assigneeUsername}. Skipping in report.`);
      continue;
    }

    const techWorkOrders = completedWorkOrders.filter(wo => wo.assignedTo === assigneeUsername);
    const totalCompleted = techWorkOrders.length;
    totalWorkOrdersOverall += totalCompleted;

    const completedByType: Record<string, number> = {};
    let totalCompletionTimeForTech = 0;

    for (const wo of techWorkOrders) {
      if (wo.type) {
        completedByType[wo.type] = (completedByType[wo.type] || 0) + 1;
      }
      if (wo.completedAt && wo.reportedAt) { // Null check already done by query, but good practice
        totalCompletionTimeForTech += new Date(wo.completedAt).getTime() - new Date(wo.reportedAt).getTime();
      }
    }

    const avgCompletionTimeMillis = totalCompleted > 0 ? totalCompletionTimeForTech / totalCompleted : 0;
    const avgCompletionTimeHours = parseFloat((avgCompletionTimeMillis / (1000 * 60 * 60)).toFixed(2));
    totalCompletionTimeHoursOverall += avgCompletionTimeMillis / (1000 * 60 * 60);


    efficiencyData.push({
      technicianId: userDetails.id, // Using actual user ID from User model
      technicianName: userDetails.username,
      totalCompleted,
      completedByType,
      avgCompletionTimeHours,
    });
  }

  const overallAvgCompletionTime = totalWorkOrdersOverall > 0 ? parseFloat((totalCompletionTimeHoursOverall / efficiencyData.length).toFixed(2)) : 0; // Avg of avgs per tech or overall avg? This is avg of tech avgs.

  const report = await prismaInstance.report.create({
    data: {
      type: 'StaffEfficiency', // New specific type
      title: `Staff Efficiency Report (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()})`,
      content: JSON.stringify(efficiencyData),
      period: `${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
      generatedBy: generatedByUserId,
      metrics: JSON.stringify({
        totalCompletedWorkOrders: totalWorkOrdersOverall,
        overallAvgCompletionTimeHours: overallAvgCompletionTime, // This is average of per-technician averages
        totalTechniciansReported: efficiencyData.length
      }),
    },
  });
  return report;
}


router.post(
  '/generate/staff-efficiency',
  authenticateToken,
  checkRole([Role.ADMIN]), // Or other manager roles
  async (req: AuthRequest, res) => {
    try {
      const { periodStart, periodEnd } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(403).json({ error: "User ID not found in token." });
      if (!periodStart || !periodEnd) {
        return res.status(400).json({ error: 'periodStart and periodEnd are required.' });
      }

      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for periodStart or periodEnd.' });
      }
      if (startDate > endDate) {
        return res.status(400).json({ error: 'periodStart cannot be after periodEnd.' });
      }

      const report = await generateStaffEfficiencyReport(startDate, endDate, userId, prisma);
      res.status(201).json(report);
    } catch (error: any) {
      console.error("Error generating staff efficiency report:", error);
      res.status(500).json({ error: 'Failed to generate staff efficiency report.', details: error.message });
    }
  }
);

router.post(
  '/generate/maintenance-costs',
  authenticateToken,
  checkRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]),
  async (req: AuthRequest, res) => {
    try {
      const { periodStart, periodEnd } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(403).json({ error: "User ID not found in token." });
      if (!periodStart || !periodEnd) {
        return res.status(400).json({ error: 'periodStart and periodEnd are required.' });
      }

      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for periodStart or periodEnd.' });
      }
      if (startDate > endDate) {
        return res.status(400).json({ error: 'periodStart cannot be after periodEnd.' });
      }

      const report = await generateMaintenanceCostsReport(startDate, endDate, userId, prisma);
      res.status(201).json(report);
    } catch (error: any)
       console.error("Error generating maintenance costs report:", error);
      res.status(500).json({ error: 'Failed to generate maintenance costs report.', details: error.message });
    }
  }
);


export default router;