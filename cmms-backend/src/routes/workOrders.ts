import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all work orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        equipment: true
      }
    });
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// Create new work order
router.post('/', authenticateToken, checkRole(['Admin', 'Technician', 'Engineer']), async (req, res) => {
  try {
    const { equipmentId, issue, type, assignedTo, reportedBy, actions } = req.body;
    const newWorkOrder = await prisma.workOrder.create({
      data: {
        equipmentId,
        issue,
        type,
        assignedTo,
        reportedBy,
        actions,
        createdAt: new Date().toISOString()
      },
      include: {
        equipment: true
      }
    });
    res.status(201).json(newWorkOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// Update work order
router.put('/:id', authenticateToken, checkRole(['Admin', 'Technician', 'Engineer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actions, completedAt } = req.body;
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        status,
        actions,
        completedAt: completedAt || null
      },
      include: {
        equipment: true
      }
    });

    // If work order is completed, create maintenance history entry
    if (status === 'Completed' && !completedAt) {
      await prisma.maintenanceHistory.create({
        data: {
          equipmentId: updatedWorkOrder.equipmentId,
          type: updatedWorkOrder.type,
          description: updatedWorkOrder.issue,
          performedBy: updatedWorkOrder.assignedTo,
          date: new Date().toISOString(),
          partsUsed: updatedWorkOrder.actions
        }
      });
    }

    res.json(updatedWorkOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// Delete work order
router.delete('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.workOrder.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

// Get work order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        equipment: true
      }
    });
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

export default router;