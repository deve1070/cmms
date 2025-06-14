import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { Role } from '../config/permissions';

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

    // Transform the data to match the frontend's expected structure
    const transformedContracts = contracts.map(contract => ({
      id: contract.id,
      title: `${contract.vendor} - ${contract.equipment.manufacturerName} ${contract.equipment.modelNumber}`,
      type: 'preventive', // Default type
      vendor: contract.vendor,
      equipmentId: contract.equipmentId,
      equipment: {
        id: contract.equipment.id,
        model: contract.equipment.modelNumber,
        serialNumber: contract.equipment.serialNumber
      },
      startDate: contract.startDate,
      endDate: contract.endDate,
      details: contract.details,
      status: contract.status.toLowerCase() as 'active' | 'expired' | 'pending' | 'cancelled',
      value: 0, // Default value
      renewalTerms: 'Annual', // Default value
      paymentTerms: 'Net 30', // Default value
      terms: contract.details,
      contactPerson: 'N/A', // Default value
      contactEmail: 'N/A', // Default value
      contactPhone: 'N/A' // Default value
    }));

    res.json(transformedContracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Create new contract
router.post('/', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
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
router.put('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
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
router.delete('/:id', authenticateToken, authorizeRole([Role.ADMIN]), async (req, res) => {
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