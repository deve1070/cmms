import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';
import { Role } from '../config/permissions';

const router = Router();
const prisma = new PrismaClient();

// Get all contracts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        equipment: true
      }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Create new contract
router.post('/', authenticateToken, checkRole([Role.ADMIN]), async (req, res) => {
  try {
    let { vendor, equipmentId, startDate, endDate, details, status, renewalReminderDate } = req.body;

    // Validate required fields
    if (!vendor || !equipmentId || !startDate || !endDate || !details) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['vendor', 'equipmentId', 'startDate', 'endDate', 'details'],
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate.' });
    }

    // Auto-calculate renewalReminderDate if not provided: 30 days before endDate
    let parsedRenewalReminderDate;
    if (renewalReminderDate) {
      parsedRenewalReminderDate = new Date(renewalReminderDate);
      if (isNaN(parsedRenewalReminderDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for renewalReminderDate.' });
      }
    } else {
      parsedRenewalReminderDate = new Date(parsedEndDate);
      parsedRenewalReminderDate.setDate(parsedEndDate.getDate() - 30);
    }

    // Determine status if not provided, or validate if provided
    if (!status) {
      status = new Date() < parsedEndDate ? 'Active' : 'Expired';
    } else if (!['Active', 'Expired', 'Pending Renewal', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }


    const newContract = await prisma.contract.create({
      data: {
        vendor,
        equipmentId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        details,
        status,
        renewalReminderDate: parsedRenewalReminderDate,
      },
      include: {
        equipment: true,
      },
    });
    res.status(201).json(newContract);
  } catch (error: any) {
    console.error('Error creating contract:', error);
    if (error.code === 'P2003') { // Foreign key constraint failed
       return res.status(400).json({ error: `Invalid equipmentId: ${req.body.equipmentId} does not exist.` });
    }
    res.status(500).json({ error: 'Failed to create contract', details: error.message });
  }
});

// Update contract
router.put('/:id', authenticateToken, checkRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor, equipmentId, startDate, endDate, details, status, renewalReminderDate } = req.body;

    const dataToUpdate: any = {};

    if (vendor !== undefined) dataToUpdate.vendor = vendor;
    if (equipmentId !== undefined) dataToUpdate.equipmentId = equipmentId;
    if (details !== undefined) dataToUpdate.details = details;
    if (status !== undefined) {
      if (!['Active', 'Expired', 'Pending Renewal', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }
      dataToUpdate.status = status;
    }

    if (startDate !== undefined) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) return res.status(400).json({ error: 'Invalid startDate format.' });
        dataToUpdate.startDate = parsedStartDate;
    }
    if (endDate !== undefined) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) return res.status(400).json({ error: 'Invalid endDate format.' });
        dataToUpdate.endDate = parsedEndDate;
        // If endDate is updated, and no specific renewalReminderDate is given, recalculate it
        if (renewalReminderDate === undefined) {
            dataToUpdate.renewalReminderDate = new Date(parsedEndDate);
            dataToUpdate.renewalReminderDate.setDate(parsedEndDate.getDate() - 30);
        }
    }
    if (renewalReminderDate !== undefined) {
        const parsedRenewalReminderDate = new Date(renewalReminderDate);
        if (isNaN(parsedRenewalReminderDate.getTime())) return res.status(400).json({ error: 'Invalid renewalReminderDate format.' });
        dataToUpdate.renewalReminderDate = parsedRenewalReminderDate;
    }
     // If status or endDate is being updated, re-evaluate overall status
    if (dataToUpdate.endDate || dataToUpdate.status === undefined) { // if endDate changed or status not explicitly set
        const currentEndDate = dataToUpdate.endDate || (await prisma.contract.findUnique({where: {id}}))?.endDate;
        if (currentEndDate && dataToUpdate.status === undefined) { // only update status if not explicitly provided
             dataToUpdate.status = new Date() < new Date(currentEndDate) ? 'Active' : 'Expired';
        }
    }


    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: "No valid fields provided for update." });
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: dataToUpdate,
      include: {
        equipment: true,
      },
    });
    res.json(updatedContract);
  } catch (error: any) {
    console.error(`Error updating contract ${req.params.id}:`, error);
     if (error.code === 'P2025') {
        return res.status(404).json({ error: `Contract with ID ${req.params.id} not found.` });
    } else if (error.code === 'P2003') {
       return res.status(400).json({ error: `Invalid equipmentId if provided.` });
    }
    res.status(500).json({ error: 'Failed to update contract', details: error.message });
  }
});

// Delete contract
router.delete('/:id', authenticateToken, checkRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contract.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Get contract by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        equipment: true
      }
    });
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});


// POST /update-expiring-statuses - New endpoint to update statuses
router.post(
  '/update-expiring-statuses',
  authenticateToken,
  checkRole([Role.ADMIN]),
  async (req, res) => {
    try {
      const now = new Date();
      const reminderThresholdDays = req.body.reminderThresholdDays || 30; // Default to 30 days

      const reminderDateCutoff = new Date(now);
      reminderDateCutoff.setDate(now.getDate() + reminderThresholdDays);

      let updatedCount = 0;
      const errors: any[] = [];

      // Update to "Expired"
      const newlyExpired = await prisma.contract.updateMany({
        where: {
          status: 'Active', // Or 'Pending Renewal'
          endDate: {
            lt: now,
          },
        },
        data: {
          status: 'Expired',
        },
      });
      updatedCount += newlyExpired.count;

      // Update to "Pending Renewal"
      // This will catch contracts whose endDate is within the reminderThresholdDays from now
      // OR contracts whose specific renewalReminderDate is past or today, but are not yet expired.
      const pendingRenewal = await prisma.contract.updateMany({
        where: {
          status: 'Active',
          endDate: {
            gte: now // Not yet expired
          },
          OR: [
            { endDate: { lte: reminderDateCutoff } }, // End date is near
            { renewalReminderDate: { lte: now } }    // Specific reminder date is past/today
          ]
        },
        data: {
          status: 'Pending Renewal',
        },
      });
      updatedCount += pendingRenewal.count;

      res.json({
        message: 'Contract statuses updated based on expiration.',
        updatedCount,
        newlyExpired: newlyExpired.count,
        pendingRenewal: pendingRenewal.count,
      });
    } catch (error: any) {
      console.error('Error updating contract statuses:', error);
      res.status(500).json({ error: 'Failed to update contract statuses.', details: error.message });
    }
  }
);

export default router;