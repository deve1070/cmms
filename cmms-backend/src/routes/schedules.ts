import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';
import { Role } from '../config/permissions'; // Assuming Role enum is here

const router = Router();
const prisma = new PrismaClient();

// Helper function to calculate the next due date
const calculateNextDueDate = (currentNextDueDate: Date, frequency: string): Date => {
  const newDate = new Date(currentNextDueDate);
  switch (frequency.toLowerCase()) {
    case 'daily':
      newDate.setDate(newDate.getDate() + 1);
      break;
    case 'weekly':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'quarterly':
      newDate.setMonth(newDate.getMonth() + 3);
      break;
    case 'annually':
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
    default:
      // Fallback or error for unknown frequency, or default to weekly/monthly
      console.warn(`Unknown frequency: ${frequency}. Defaulting to monthly.`);
      newDate.setMonth(newDate.getMonth() + 1);
      break;
  }
  return newDate;
};

// POST /generate-work-orders
router.post(
  '/generate-work-orders',
  authenticateToken,
  checkRole([Role.ADMIN]), // Or a new system-level permission if preferred
  async (req, res) => {
    let generatedCount = 0;
    let errorCount = 0;
    const errors: { scheduleId: string, error: string }[] = [];

    try {
      const now = new Date();
      const dueSchedules = await prisma.preventiveMaintenanceSchedule.findMany({
        where: {
          isActive: true,
          nextDueDate: {
            lte: now, // Less than or equal to now
          },
        },
        include: {
          equipment: true, // To get equipment details if needed for WO description
        }
      });

      if (dueSchedules.length === 0) {
        return res.status(200).json({ message: 'No preventive maintenance work orders due at this time.', generatedCount, errorCount });
      }

      for (const schedule of dueSchedules) {
        try {
          // Create Work Order
          await prisma.workOrder.create({
            data: {
              equipmentId: schedule.equipmentId,
              issue: schedule.taskDescription, // Use taskDescription from schedule as issue
              type: 'Preventive', // Predefined type
              priority: 'Medium', // Default priority, or make it configurable in schedule
              status: schedule.assignedToUserId ? 'Assigned' : 'Reported',
              reportedBy: 'System Scheduler',
              reportedAt: now,
              assignedTo: schedule.assignedToUserId || undefined, // Set if available
              description: `Preventive maintenance based on schedule: ${schedule.taskDescription} for ${schedule.equipment.manufacturerName} ${schedule.equipment.modelNumber} (S/N: ${schedule.equipment.serialNumber}). Frequency: ${schedule.frequency}.`,
              // Optional: Add more details like symptoms, impact, actions if they can be templated or derived
            },
          });

          // Update Schedule
          const newNextDueDate = calculateNextDueDate(schedule.nextDueDate, schedule.frequency);
          await prisma.preventiveMaintenanceSchedule.update({
            where: { id: schedule.id },
            data: {
              lastGeneratedDate: now,
              nextDueDate: newNextDueDate,
            },
          });
          generatedCount++;
        } catch (e: any) {
          console.error(`Failed to generate Work Order for schedule ${schedule.id}:`, e);
          errors.push({ scheduleId: schedule.id, error: e.message || 'Unknown error' });
          errorCount++;
        }
      }

      res.status(200).json({
        message: `Work order generation process completed.`,
        generatedCount,
        errorCount,
        ...(errorCount > 0 && { errors }),
      });

    } catch (error: any) {
      console.error('Error in PM Work Order generation process:', error);
      res.status(500).json({ error: 'Failed to generate PM work orders.', details: error.message });
    }
  }
);

// --- CRUD for PreventiveMaintenanceSchedule ---

// GET / (Get All Schedules)
router.get(
  '/',
  authenticateToken,
  checkRole([Role.ADMIN]),
  async (req, res) => {
    try {
      const schedules = await prisma.preventiveMaintenanceSchedule.findMany({
        include: {
          equipment: {
            select: {
              id: true,
              modelNumber: true,
              serialNumber: true,
              manufacturerName: true,
            },
          },
          assignedToUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          nextDueDate: 'asc',
        },
      });
      res.json(schedules);
    } catch (error: any) {
      console.error('Error fetching PM schedules:', error);
      res.status(500).json({ error: 'Failed to fetch PM schedules.', details: error.message });
    }
  }
);

// POST / (Create New Schedule)
router.post(
  '/',
  authenticateToken,
  checkRole([Role.ADMIN]),
  async (req, res) => {
    try {
      const {
        equipmentId,
        taskDescription,
        frequency,
        nextDueDate,
        isActive = true, // Default to true if not provided
        assignedToUserId,
        notes,
      } = req.body;

      if (!equipmentId || !taskDescription || !frequency || !nextDueDate) {
        return res.status(400).json({
          error: 'Missing required fields: equipmentId, taskDescription, frequency, nextDueDate are required.',
        });
      }

      // Validate date format for nextDueDate
      const parsedNextDueDate = new Date(nextDueDate);
      if (isNaN(parsedNextDueDate.getTime())) {
          return res.status(400).json({ error: 'Invalid nextDueDate format.' });
      }

      const newSchedule = await prisma.preventiveMaintenanceSchedule.create({
        data: {
          equipmentId,
          taskDescription,
          frequency,
          nextDueDate: parsedNextDueDate,
          isActive,
          assignedToUserId: assignedToUserId || null, // Ensure null if empty string or undefined
          notes,
        },
        include: { // Include related data in the response
          equipment: { select: { id: true, modelNumber: true, serialNumber: true }},
          assignedToUser: { select: { id: true, username: true }},
        }
      });
      res.status(201).json(newSchedule);
    } catch (error: any) {
      console.error('Error creating PM schedule:', error);
      if (error.code === 'P2003' && error.meta?.field_name?.includes('equipmentId')) {
        return res.status(400).json({ error: `Equipment with ID ${req.body.equipmentId} not found.` });
      }
      if (error.code === 'P2003' && error.meta?.field_name?.includes('assignedToUserId')) {
        return res.status(400).json({ error: `User with ID ${req.body.assignedToUserId} not found.` });
      }
      res.status(500).json({ error: 'Failed to create PM schedule.', details: error.message });
    }
  }
);

// GET /:id (Get Single Schedule)
router.get(
  '/:id',
  authenticateToken,
  checkRole([Role.ADMIN]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const schedule = await prisma.preventiveMaintenanceSchedule.findUnique({
        where: { id },
        include: {
          equipment: {
            select: {
              id: true,
              modelNumber: true,
              serialNumber: true,
              manufacturerName: true,
              locationDescription: true,
            },
          },
          assignedToUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      if (!schedule) {
        return res.status(404).json({ error: 'PM Schedule not found.' });
      }
      res.json(schedule);
    } catch (error: any) {
      console.error(`Error fetching PM schedule ${id}:`, error);
      res.status(500).json({ error: 'Failed to fetch PM schedule.', details: error.message });
    }
  }
);

// PUT /:id (Update Schedule)
router.put(
  '/:id',
  authenticateToken,
  checkRole([Role.ADMIN]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const {
        equipmentId, // Usually not updated, but possible
        taskDescription,
        frequency,
        nextDueDate,
        isActive,
        assignedToUserId,
        notes,
      } = req.body;

      const dataToUpdate: any = {};
      if (equipmentId !== undefined) dataToUpdate.equipmentId = equipmentId;
      if (taskDescription !== undefined) dataToUpdate.taskDescription = taskDescription;
      if (frequency !== undefined) dataToUpdate.frequency = frequency;
      if (nextDueDate !== undefined) {
        const parsedNextDueDate = new Date(nextDueDate);
        if (isNaN(parsedNextDueDate.getTime())) {
            return res.status(400).json({ error: 'Invalid nextDueDate format.' });
        }
        dataToUpdate.nextDueDate = parsedNextDueDate;
      }
      if (isActive !== undefined) dataToUpdate.isActive = isActive;
      if (assignedToUserId !== undefined) dataToUpdate.assignedToUserId = assignedToUserId === '' ? null : assignedToUserId; // Allow unassigning
      if (notes !== undefined) dataToUpdate.notes = notes;

      // Prevent updating with an empty object
      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ error: "No fields provided for update." });
      }

      const updatedSchedule = await prisma.preventiveMaintenanceSchedule.update({
        where: { id },
        data: dataToUpdate,
        include: {
          equipment: { select: { id: true, modelNumber: true, serialNumber: true }},
          assignedToUser: { select: { id: true, username: true }},
        }
      });
      res.json(updatedSchedule);
    } catch (error: any) {
      console.error(`Error updating PM schedule ${id}:`, error);
      if (error.code === 'P2025') { // Record to update not found
        return res.status(404).json({ error: `PM Schedule with ID ${id} not found.` });
      }
      if (error.code === 'P2003' && error.meta?.field_name?.includes('equipmentId')) {
        return res.status(400).json({ error: `Equipment with ID ${req.body.equipmentId} not found.` });
      }
      if (error.code === 'P2003' && error.meta?.field_name?.includes('assignedToUserId')) {
        return res.status(400).json({ error: `User with ID ${req.body.assignedToUserId} not found.` });
      }
      res.status(500).json({ error: 'Failed to update PM schedule.', details: error.message });
    }
  }
);

// DELETE /:id (Delete Schedule)
router.delete(
  '/:id',
  authenticateToken,
  checkRole([Role.ADMIN]),
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.preventiveMaintenanceSchedule.delete({
        where: { id },
      });
      res.status(204).send(); // No content
    } catch (error: any) {
      console.error(`Error deleting PM schedule ${id}:`, error);
      if (error.code === 'P2025') { // Record to delete not found
        return res.status(404).json({ error: `PM Schedule with ID ${id} not found.` });
      }
      res.status(500).json({ error: 'Failed to delete PM schedule.', details: error.message });
    }
  }
);


export default router;
