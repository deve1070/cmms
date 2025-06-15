import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role } from '../src/config/permissions';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data in the correct order
  console.log('Cleaning up existing data...');
  await prisma.partUsage.deleteMany();
  await prisma.maintenanceReport.deleteMany();
  await prisma.issueReport.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.maintenanceHistory.deleteMany();
  await prisma.compliance.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleanup complete.');

  // Create default user
  console.log('Creating default user...');
  const defaultUser = await prisma.user.create({
    data: {
      id: 'default-user',
      username: 'system',
      email: 'system@example.com',
      role: 'Admin',
      password: await bcrypt.hash('defaultpassword', 10),
      permissions: JSON.stringify(['all']),
      status: 'active'
    }
  });
  console.log('Default user created.');

  // Create equipment
  console.log('Creating equipment...');
  const equipment = await prisma.equipment.createMany({
    data: [
      {
        serialNumber: 'EQ001',
        manufacturerName: 'Siemens',
        modelNumber: 'S7-1200',
        manufacturerServiceNumber: 'MSN001',
        vendorName: 'Industrial Supplies Inc',
        vendorCode: 'V001',
        locationDescription: 'Main Laboratory',
        locationCode: 'LAB-01',
        purchasePrice: 15000.00,
        installationDate: new Date('2024-01-15'),
        warrantyExpirationDate: new Date('2027-01-15'),
        status: 'Operational',
        category: 'Analytical Equipment',
        department: 'Laboratory'
      },
      {
        serialNumber: 'EQ002',
        manufacturerName: 'Thermo Fisher',
        modelNumber: 'TSQ-9000',
        manufacturerServiceNumber: 'MSN002',
        vendorName: 'Lab Equipment Co',
        vendorCode: 'V002',
        locationDescription: 'Research Lab',
        locationCode: 'LAB-02',
        purchasePrice: 25000.00,
        installationDate: new Date('2024-02-01'),
        warrantyExpirationDate: new Date('2027-02-01'),
        status: 'Operational',
        category: 'Mass Spectrometer',
        department: 'Research'
      },
      {
        serialNumber: 'EQ003',
        manufacturerName: 'Agilent',
        modelNumber: '1260 Infinity',
        manufacturerServiceNumber: 'MSN003',
        vendorName: 'Scientific Supplies Ltd',
        vendorCode: 'V003',
        locationDescription: 'Quality Control Lab',
        locationCode: 'LAB-03',
        purchasePrice: 18000.00,
        installationDate: new Date('2024-03-01'),
        warrantyExpirationDate: new Date('2027-03-01'),
        status: 'Needs Maintenance',
        category: 'HPLC System',
        department: 'Quality Control'
      }
    ]
  });

  // Get the created equipment
  const createdEquipment = await prisma.equipment.findMany();

  // Create maintenance reports
  console.log('Creating maintenance reports...');
  const maintenanceReports = await Promise.all(
    createdEquipment.map(async (equipment) => {
      return prisma.maintenanceReport.create({
        data: {
          equipmentId: equipment.id,
          type: 'Preventive',
          description: `Regular maintenance check for ${equipment.modelNumber}`,
          performedById: defaultUser.id,
          date: new Date(),
          status: 'Completed',
          findings: 'Equipment in good condition',
          recommendations: 'Schedule next maintenance in 3 months',
          nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      });
    })
  );

  // Create issue reports
  console.log('Creating issue reports...');
  const issueReports = await Promise.all(
    createdEquipment.map(async (equipment) => {
      return prisma.issueReport.create({
        data: {
          equipmentId: equipment.id,
          issue: `Calibration needed for ${equipment.modelNumber}`,
          priority: 'Medium',
          description: 'Regular calibration check required',
          status: 'Pending',
          reportedById: defaultUser.id
        }
      });
    })
  );

  // Create sample spare parts
  const microscopeLens = await prisma.sparePart.create({
    data: {
      name: 'Microscope Objective Lens',
      quantity: 5,
      threshold: 2,
      lastUpdated: new Date().toISOString(),
      category: 'Optical',
      unitCost: 500.00,
      supplier: 'Olympus',
      location: 'Storage Room A',
      minOrderQty: 1,
      leadTime: 14,
      equipmentId: createdEquipment[0].id
    }
  });

  const centrifugeRotor = await prisma.sparePart.create({
    data: {
      name: 'Centrifuge Rotor',
      quantity: 3,
      threshold: 1,
      lastUpdated: new Date().toISOString(),
      category: 'Mechanical',
      unitCost: 1200.00,
      supplier: 'Eppendorf',
      location: 'Storage Room B',
      minOrderQty: 1,
      leadTime: 21,
      equipmentId: createdEquipment[1].id
    }
  });

  // Create work orders
  console.log('Creating work orders...');
  const workOrder1 = await prisma.workOrder.create({
    data: {
      equipmentId: createdEquipment[0].id,
      issue: 'Lens calibration needed',
      type: 'Preventive',
      priority: 'Medium',
      status: 'Reported',
      reportedById: defaultUser.id,
      reportedAt: new Date(),
      description: 'Regular calibration required for accurate measurements',
      symptoms: 'Slight deviation in readings',
      impact: 'May affect measurement accuracy'
    }
  });

  const workOrder2 = await prisma.workOrder.create({
    data: {
      equipmentId: createdEquipment[1].id,
      issue: 'Rotor replacement required',
      type: 'Corrective',
      priority: 'High',
      status: 'In Progress',
      reportedById: defaultUser.id,
      reportedAt: new Date(),
      description: 'Rotor showing signs of wear',
      symptoms: 'Unusual noise during operation',
      impact: 'May affect sample processing'
    }
  });

  // Create service contracts
  console.log('Creating service contracts...');
  const serviceContract1 = await prisma.contract.create({
    data: {
      vendor: 'Olympus Service',
      equipmentId: createdEquipment[0].id,
      startDate: '2023-01-15',
      endDate: '2026-01-15',
      details: 'Annual maintenance included',
      status: 'Active'
    }
  });

  const serviceContract2 = await prisma.contract.create({
    data: {
      vendor: 'Eppendorf Service',
      equipmentId: createdEquipment[1].id,
      startDate: '2023-02-20',
      endDate: '2025-02-20',
      details: 'Quarterly maintenance included',
      status: 'Active'
    }
  });

  // Create maintenance history
  console.log('Creating maintenance history...');
  const maintenance1 = await prisma.maintenanceHistory.create({
    data: {
      equipmentId: createdEquipment[0].id,
      type: 'Preventive',
      description: 'Regular calibration and cleaning',
      date: new Date().toISOString(),
      performedBy: defaultUser.id,
      cost: 500.00,
      partsUsed: 'Cleaning solution, calibration tools'
    }
  });

  const maintenance2 = await prisma.maintenanceHistory.create({
    data: {
      equipmentId: createdEquipment[1].id,
      type: 'Corrective',
      description: 'Rotor replacement',
      date: new Date().toISOString(),
      performedBy: defaultUser.id,
      cost: 1200.00,
      partsUsed: 'New rotor'
    }
  });

  // Create compliance records
  console.log('Creating compliance records...');
  const compliance1 = await prisma.compliance.create({
    data: {
      equipmentId: createdEquipment[0].id,
      standard: 'ISO 15189',
      status: 'Compliant',
      lastCheck: new Date().toISOString(),
      nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'All requirements met'
    }
  });

  const compliance2 = await prisma.compliance.create({
    data: {
      equipmentId: createdEquipment[1].id,
      standard: 'ISO 15189',
      status: 'Compliant',
      lastCheck: new Date().toISOString(),
      nextDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'All requirements met'
    }
  });

  // Create sample reports
  const report1 = await prisma.report.create({
    data: {
      type: 'Performance',
      title: 'Monthly Equipment Performance Report',
      content: 'Detailed analysis of equipment performance and maintenance activities.',
      generatedAt: '2023-06-30',
      generatedBy: defaultUser.id,
      period: '2023-06',
      metrics: JSON.stringify({ uptime: '95%', maintenanceCost: 5000, issues: 3 })
    }
  });

  const report2 = await prisma.report.create({
    data: {
      type: 'Financial',
      title: 'Q2 Maintenance Budget Report',
      content: 'Overview of maintenance costs and budget allocation.',
      generatedAt: '2023-06-30',
      generatedBy: defaultUser.id,
      period: '2023-Q2',
      metrics: JSON.stringify({ totalCost: 15000, budget: 20000, variance: 5000 })
    }
  });

  // Create sample budgets
  const budget1 = await prisma.budget.create({
    data: {
      year: '2023',
      month: '06',
      category: 'Maintenance',
      allocated: 20000.00,
      spent: 15000.00,
      department: 'Laboratory'
    }
  });

  const budget2 = await prisma.budget.create({
    data: {
      year: '2023',
      month: '07',
      category: 'Parts',
      allocated: 10000.00,
      spent: 5000.00,
      department: 'Laboratory'
    }
  });

  console.log('Database seeded successfully!');
  console.log('Created equipment:', createdEquipment.length);
  console.log('Created maintenance reports:', maintenanceReports.length);
  console.log('Created issue reports:', issueReports.length);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 