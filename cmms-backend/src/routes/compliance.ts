import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../config/permissions';

const router = Router();
const prisma = new PrismaClient();

// Get compliance status
router.get('/', authenticateToken, authorizeRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
  try {
    const { equipmentId, standard, status } = req.query;
    const compliance = await prisma.compliance.findMany({
      where: {
        ...(equipmentId && { equipmentId: equipmentId as string }),
        ...(standard && { standard: standard as string }),
        ...(status && { status: status as string })
      },
      include: {
        equipment: true
      }
    });

    // Transform the data to match the frontend's expected structure
    const transformedCompliance = compliance.map(record => ({
      id: record.id,
      title: `${record.standard} Compliance`,
      description: `Compliance requirement for ${record.equipment.manufacturerName} ${record.equipment.modelNumber}`,
      standard: record.standard,
      category: 'regulatory',
      requirement: record.standard,
      status: record.status.toLowerCase() as 'expired' | 'pending' | 'compliant' | 'non-compliant',
      dueDate: record.nextDue,
      lastChecked: record.lastCheck,
      assignedTo: 'System',
      priority: 'medium' as const,
      notes: record.notes
    }));

    res.json(transformedCompliance);
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    res.status(500).json({ error: 'Failed to fetch compliance records' });
  }
});

// Create compliance record
router.post('/', authenticateToken, authorizeRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
  try {
    const { equipmentId, standard, status, lastCheck, nextDue, notes } = req.body;

    // Validate required fields
    if (!equipmentId || !standard || !status || !lastCheck || !nextDue) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['equipmentId', 'standard', 'status', 'lastCheck', 'nextDue']
      });
    }

    // Validate dates
    const lastCheckDate = new Date(lastCheck);
    const nextDueDate = new Date(nextDue);
    if (isNaN(lastCheckDate.getTime()) || isNaN(nextDueDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format'
      });
    }

    const compliance = await prisma.compliance.create({
      data: {
        equipmentId,
        standard,
        status,
        lastCheck,
        nextDue,
        notes
      },
      include: {
        equipment: true
      }
    });
    res.status(201).json(compliance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create compliance record' });
  }
});

// Update compliance status
router.patch('/:id', authenticateToken, authorizeRole([Role.ADMIN, Role.BIOMEDICAL_ENGINEER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lastCheck, nextDue, notes } = req.body;

    // Validate dates if provided
    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck);
      if (isNaN(lastCheckDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid lastCheck date format'
        });
      }
    }

    if (nextDue) {
      const nextDueDate = new Date(nextDue);
      if (isNaN(nextDueDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid nextDue date format'
        });
      }
    }

    const compliance = await prisma.compliance.update({
      where: { id },
      data: {
        status,
        lastCheck,
        nextDue,
        notes
      },
      include: {
        equipment: true
      }
    });
    res.json(compliance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update compliance record' });
  }
});

// Get compliance analytics
router.get('/analytics', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
  try {
    const compliance = await prisma.compliance.findMany({
      include: {
        equipment: true
      }
    });

    const analytics = {
      totalRecords: compliance.length,
      byStatus: compliance.reduce((acc, c) => {
        const status = c.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStandard: compliance.reduce((acc, c) => {
        acc[c.standard] = (acc[c.standard] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      upcomingDue: compliance.filter(c => {
        const nextDue = new Date(c.nextDue);
        const today = new Date();
        const diffDays = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      }).map(c => ({
        id: c.id,
        title: `${c.standard} Compliance`,
        description: `Compliance requirement for ${c.equipment.manufacturerName} ${c.equipment.modelNumber}`,
        standard: c.standard,
        category: 'regulatory',
        requirement: c.standard,
        status: c.status.toLowerCase() as 'expired' | 'pending' | 'compliant' | 'non-compliant',
        dueDate: c.nextDue,
        lastChecked: c.lastCheck,
        assignedTo: 'System',
        priority: 'medium' as const,
        notes: c.notes
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error generating compliance analytics:', error);
    res.status(500).json({ error: 'Failed to generate compliance analytics' });
  }
});

// Delete compliance record
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.compliance.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete compliance record' });
  }
});

export default router; 