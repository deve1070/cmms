import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/auth';
import { Role } from '../config/permissions';

const router = Router();
const prisma = new PrismaClient();

// Get all issue reports
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const issueReports = await prisma.issueReport.findMany({
      include: {
        equipment: true,
        reportedBy: true,
        reviewedBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(issueReports);
  } catch (error) {
    console.error('Error fetching issue reports:', error);
    res.status(500).json({ error: 'Failed to fetch issue reports' });
  }
});

// Get issue report by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const issueReport = await prisma.issueReport.findUnique({
      where: { id },
      include: {
        equipment: true,
        reportedBy: true,
        reviewedBy: true
      }
    });

    if (!issueReport) {
      return res.status(404).json({ error: 'Issue report not found' });
    }

    res.json(issueReport);
  } catch (error) {
    console.error('Error fetching issue report:', error);
    res.status(500).json({ error: 'Failed to fetch issue report' });
  }
});

// Create new issue report
router.post('/', authenticateToken, authorizeRole([Role.LAB_TECHNICIAN]), async (req: AuthRequest, res) => {
  try {
    console.log('Received issue report request:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });

    const { equipmentId, issue, priority, description } = req.body;

    if (!equipmentId || !issue || !priority) {
      console.error('Missing required fields:', { equipmentId, issue, priority });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { equipmentId, issue, priority }
      });
    }

    // Verify equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    });

    if (!equipment) {
      console.error('Equipment not found:', equipmentId);
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Verify user exists
    if (!req.user?.id) {
      console.error('User not found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const issueReport = await prisma.issueReport.create({
      data: {
        equipment: { connect: { id: equipmentId } },
        issue,
        priority,
        description: description || '',
        status: 'Pending',
        reportedBy: { connect: { id: req.user.id } }
      },
      include: {
        equipment: true,
        reportedBy: true
      }
    });

    console.log('Created issue report:', issueReport);
    res.status(201).json(issueReport);
  } catch (error) {
    console.error('Error creating issue report:', error);
    res.status(500).json({ 
      error: 'Failed to create issue report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update issue report
router.put('/:id', authenticateToken, authorizeRole([Role.BIOMEDICAL_ENGINEER]), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const issueReport = await prisma.issueReport.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        reviewedBy: { connect: { id: req.user?.id } }
      },
      include: {
        equipment: true,
        reportedBy: true,
        reviewedBy: true
      }
    });

    res.json(issueReport);
  } catch (error) {
    console.error('Error updating issue report:', error);
    res.status(500).json({ error: 'Failed to update issue report' });
  }
});

// Delete issue report
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.issueReport.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting issue report:', error);
    res.status(500).json({ error: 'Failed to delete issue report' });
  }
});

export default router; 