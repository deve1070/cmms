import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all equipment
router.get('/', authenticateToken, async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        maintenanceHistory: true,
        workOrders: true
      }
    });
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// Get equipment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        maintenanceHistory: true,
        workOrders: true
      }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// Create new equipment
router.post('/', authenticateToken, checkRole(['Admin', 'Engineer']), async (req, res) => {
  try {
    const equipment = await prisma.equipment.create({
      data: {
        serialNumber: req.body.serialNumber,
        manufacturerName: req.body.manufacturerName,
        modelNumber: req.body.modelNumber,
        manufacturerServiceNumber: req.body.manufacturerServiceNumber,
        vendorName: req.body.vendorName,
        vendorCode: req.body.vendorCode,
        locationDescription: req.body.locationDescription,
        locationCode: req.body.locationCode,
        purchasePrice: req.body.purchasePrice,
        installationDate: new Date(req.body.installationDate),
        warrantyExpirationDate: new Date(req.body.warrantyExpirationDate),
        status: req.body.status,
        category: req.body.category,
        department: req.body.department,
      },
    });
    res.json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// Update equipment
router.put('/:id', authenticateToken, checkRole(['Admin', 'Engineer']), async (req, res) => {
  try {
    const equipment = await prisma.equipment.update({
      where: { id: req.params.id },
      data: {
        serialNumber: req.body.serialNumber,
        manufacturerName: req.body.manufacturerName,
        modelNumber: req.body.modelNumber,
        manufacturerServiceNumber: req.body.manufacturerServiceNumber,
        vendorName: req.body.vendorName,
        vendorCode: req.body.vendorCode,
        locationDescription: req.body.locationDescription,
        locationCode: req.body.locationCode,
        purchasePrice: req.body.purchasePrice,
        installationDate: new Date(req.body.installationDate),
        warrantyExpirationDate: new Date(req.body.warrantyExpirationDate),
        status: req.body.status,
        category: req.body.category,
        department: req.body.department,
      },
    });
    res.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// Delete equipment
router.delete('/:id', authenticateToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Delete related records first
    await prisma.maintenanceHistory.deleteMany({
      where: { equipmentId: id }
    });

    await prisma.workOrder.deleteMany({
      where: { equipmentId: id }
    });

    await prisma.contract.deleteMany({
      where: { equipmentId: id }
    });

    await prisma.compliance.deleteMany({
      where: { equipmentId: id }
    });

    // Delete the equipment
    await prisma.equipment.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// Get equipment maintenance history
router.get('/:id/maintenance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const maintenanceHistory = await prisma.maintenanceHistory.findMany({
      where: { equipmentId: id },
      orderBy: { date: 'desc' }
    });
    res.json(maintenanceHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
});

// Add maintenance record
router.post('/:id/maintenance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, performedBy, date, cost, partsUsed } = req.body;

    // Validate required fields
    if (!type || !description || !performedBy || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['type', 'description', 'performedBy', 'date']
      });
    }

    const maintenance = await prisma.maintenanceHistory.create({
      data: {
        equipmentId: id,
        type,
        description,
        performedBy,
        date,
        cost,
        partsUsed
      }
    });

    // Update equipment's last maintenance date
    await prisma.equipment.update({
      where: { id },
      data: { }
    });

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add maintenance record' });
  }
});

export default router;