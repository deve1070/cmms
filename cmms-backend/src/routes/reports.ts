import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/auth'; // Combined AuthRequest
import { Role } from '../config/permissions'; // Added Role import

const router = Router();
const prisma = new PrismaClient();

// Get performance reports
router.get('/performance', authenticateToken, authorizeRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
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
router.get('/financial', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
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
router.get('/compliance', authenticateToken, authorizeRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
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
router.post('/', authenticateToken, authorizeRole([Role.ADMIN]), async (req: AuthRequest, res) => {
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
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
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

export default router;