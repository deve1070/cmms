import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all contracts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        equipment: true
      }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Create new contract
router.post('/', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { vendor, equipmentId, startDate, endDate, details } = req.body;

    // Validate required fields
    if (!vendor || !equipmentId || !startDate || !endDate || !details) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['vendor', 'equipmentId', 'startDate', 'endDate', 'details']
      });
    }

    const newContract = await prisma.contract.create({
      data: {
        vendor,
        equipmentId,
        startDate,
        endDate,
        details,
        status: new Date() < new Date(endDate) ? 'Active' : 'Expired'
      },
      include: {
        equipment: true
      }
    });
    res.status(201).json(newContract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Update contract
router.put('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor, equipmentId, startDate, endDate, details, status } = req.body;

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        vendor,
        equipmentId,
        startDate,
        endDate,
        details,
        status
      },
      include: {
        equipment: true
      }
    });
    res.json(updatedContract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contract.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Get contract by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        equipment: true
      }
    });
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

export default router;