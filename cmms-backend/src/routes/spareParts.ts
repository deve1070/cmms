import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all spare parts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const parts = await prisma.sparePart.findMany();
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spare parts' });
  }
});

// Create new spare part
router.post('/', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { name, quantity, threshold, category, unitCost, supplier, location, minOrderQty, leadTime } = req.body;
    const newPart = await prisma.sparePart.create({
      data: {
        name,
        quantity,
        threshold,
        category,
        unitCost,
        supplier,
        location,
        minOrderQty,
        leadTime,
        lastUpdated: new Date().toISOString()
      }
    });
    res.status(201).json(newPart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create spare part' });
  }
});

// Update spare part
router.put('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, threshold, category, unitCost, supplier, location, minOrderQty, leadTime } = req.body;
    const updatedPart = await prisma.sparePart.update({
      where: { id },
      data: {
        name,
        quantity,
        threshold,
        category,
        unitCost,
        supplier,
        location,
        minOrderQty,
        leadTime,
        lastUpdated: new Date().toISOString(),
        alert: quantity < threshold ? 'Low stock - order more' : null
      }
    });
    res.json(updatedPart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update spare part' });
  }
});

// Delete spare part
router.delete('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sparePart.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete spare part' });
  }
});

// Get spare part usage history
router.get('/:id/usage', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usageHistory = await prisma.maintenanceHistory.findMany({
      where: {
        partsUsed: {
          contains: id
        }
      },
      include: {
        equipment: true
      }
    });
    res.json(usageHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

export default router;