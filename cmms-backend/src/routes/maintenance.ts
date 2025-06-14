import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../config/permissions';

const router = Router();
const prisma = new PrismaClient();

// Get all maintenance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const maintenanceRecords = await prisma.maintenanceHistory.findMany({
      include: {
        equipment: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(maintenanceRecords);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
});

// Get maintenance record by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const maintenanceRecord = await prisma.maintenanceHistory.findUnique({
      where: { id },
      include: {
        equipment: true
      }
    });

    if (!maintenanceRecord) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json(maintenanceRecord);
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance record' });
  }
});

// Create new maintenance record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      equipmentId,
      type,
      description,
      performedBy,
      date,
      cost,
      partsUsed
    } = req.body;

    const maintenanceRecord = await prisma.maintenanceHistory.create({
      data: {
        equipmentId,
        type,
        description,
        performedBy,
        date,
        cost,
        partsUsed
      },
      include: {
        equipment: true
      }
    });

    res.status(201).json(maintenanceRecord);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ error: 'Failed to create maintenance record' });
  }
});

// Update maintenance record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      description,
      performedBy,
      date,
      cost,
      partsUsed
    } = req.body;

    const maintenanceRecord = await prisma.maintenanceHistory.update({
      where: { id },
      data: {
        type,
        description,
        performedBy,
        date,
        cost,
        partsUsed
      },
      include: {
        equipment: true
      }
    });

    res.json(maintenanceRecord);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ error: 'Failed to update maintenance record' });
  }
});

// Delete maintenance record
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.maintenanceHistory.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ error: 'Failed to delete maintenance record' });
  }
});

export default router; 