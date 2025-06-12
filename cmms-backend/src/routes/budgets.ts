import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get budget overview
router.get('/', authenticateToken, checkRole(['Admin', 'Engineer']), async (req, res) => {
  try {
    const { year, month, department } = req.query;
    const budgets = await prisma.budget.findMany({
      where: {
        year: year as string,
        month: month as string,
        ...(department && { department: department as string })
      }
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create new budget
router.post('/', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { year, month, category, allocated, department } = req.body;

    // Validate required fields
    if (!year || !month || !category || !allocated || !department) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['year', 'month', 'category', 'allocated', 'department']
      });
    }

    // Validate numeric fields
    if (isNaN(allocated) || allocated < 0) {
      return res.status(400).json({
        error: 'Invalid allocated amount'
      });
    }

    const budget = await prisma.budget.create({
      data: {
        year,
        month,
        category,
        allocated,
        spent: 0,
        department
      }
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Update budget spending
router.patch('/:id/spend', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount'
      });
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        spent: {
          increment: amount
        }
      }
    });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget spending' });
  }
});

// Get budget analytics
router.get('/analytics', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { year, department } = req.query;

    // Validate year
    if (!year) {
      return res.status(400).json({
        error: 'Year is required'
      });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        year: year as string,
        ...(department && { department: department as string })
      }
    });

    const analytics = {
      totalAllocated: budgets.reduce((sum, b) => sum + b.allocated, 0),
      totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
      byCategory: budgets.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.spent;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate budget analytics' });
  }
});

// Delete budget
router.delete('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.budget.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router; 