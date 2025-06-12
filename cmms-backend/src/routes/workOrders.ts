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
    const { equipmentId, issue, type, assignedTo, reportedBy, actions, description } = req.body;

    const workOrder = await prisma.workOrder.create({
      data: {
        equipmentId,
        issue,
        type,
        assignedTo: assignedTo || 'Unassigned',
        reportedBy,
        reportedAt: new Date().toISOString(),
        description,
        actions,
        createdAt: new Date().toISOString(),
        equipment: {
          connect: { id: equipmentId }
        }
      },
    });

    res.status(201).json(workOrder);
  } catch (error) {
    console.error('Error creating work order:', error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// Update work order
router.put('/:id', authenticateToken, checkRole(['Admin', 'Technician', 'Engineer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, actions } = req.body;

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        assignedTo: assignedTo || 'Unassigned',
        actions,
      },
    });

    res.json(workOrder);
  } catch (error) {
    console.error('Error updating work order:', error);
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