import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../config/permissions';
import { Request, Response } from 'express';

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
router.post('/', authenticateToken, authorizeRole([Role.ADMIN, Role.MAINTENANCE_TECHNICIAN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
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
        // createdAt is handled by @default(now()) in schema
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
router.put('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.MAINTENANCE_TECHNICIAN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
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
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
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

// Log part usage for a work order
router.post('/:id/parts', authenticateToken, authorizeRole([Role.ADMIN, Role.MAINTENANCE_TECHNICIAN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { partId, quantity } = req.body;

    // First check if the work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id }
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Then check if the part exists and has enough quantity
    const part = await prisma.sparePart.findUnique({
      where: { id: partId }
    });

    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }

    if (part.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough parts in stock' });
    }

    // Create the part usage record
    const partUsage = await prisma.partUsage.create({
      data: {
        workOrderId: id,
        partId,
        quantity,
        usedAt: new Date().toISOString()
      }
    });

    // Update the part quantity
    await prisma.sparePart.update({
      where: { id: partId },
      data: {
        quantity: part.quantity - quantity
      }
    });

    res.status(201).json(partUsage);
  } catch (error) {
    console.error('Error logging part usage:', error);
    res.status(500).json({ error: 'Failed to log part usage' });
  }
});

router.get('/activities', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limit to last 100 activities
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;