import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.compliance.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.report.deleteMany();
  await prisma.maintenanceHistory.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const engineerPassword = await bcrypt.hash('engineer123', 10);
  const technicianPassword = await bcrypt.hash('tech123', 10);
  const labTechPassword = await bcrypt.hash('labtech123', 10);

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        email: 'admin@example.com',
        permissions: JSON.stringify(['read', 'write']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
    prisma.user.create({
      data: {
        username: 'labtech',
        password: await bcrypt.hash('labtech123', 10),
        role: 'laboratory technician',
        email: 'labtech@example.com',
        permissions: JSON.stringify(['read', 'write']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
    prisma.user.create({
      data: {
        username: 'biomedical',
        password: await bcrypt.hash('biomedical123', 10),
        role: 'biomedical engineer',
        email: 'biomedical@example.com',
        permissions: JSON.stringify(['read', 'write']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
    prisma.user.create({
      data: {
        username: 'maintenance',
        password: await bcrypt.hash('maintenance123', 10),
        role: 'engineer for maintenance',
        email: 'maintenance@example.com',
        permissions: JSON.stringify(['read', 'write']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  ]);

  // Create sample equipment (5 for each type)
  const microscopes = await Promise.all([
    prisma.equipment.create({
      data: {
        serialNumber: 'MIC-001',
        manufacturerName: 'Olympus',
        modelNumber: 'BX53',
        manufacturerServiceNumber: 'OLY-12345',
        vendorName: 'Olympus',
        vendorCode: 'OLY',
        locationDescription: 'Lab 101',
        locationCode: 'L101',
        purchasePrice: 15000.00,
        installationDate: new Date('2023-01-15').toISOString(),
        warrantyExpirationDate: new Date('2026-01-15').toISOString(),
        status: 'Operational',
        category: 'Microscope',
        department: 'Biology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'MIC-002',
        manufacturerName: 'Nikon',
        modelNumber: 'Eclipse E200',
        manufacturerServiceNumber: 'NIK-54321',
        vendorName: 'Nikon',
        vendorCode: 'NIK',
        locationDescription: 'Lab 102',
        locationCode: 'L102',
        purchasePrice: 12000.00,
        installationDate: new Date('2023-02-20').toISOString(),
        warrantyExpirationDate: new Date('2026-02-20').toISOString(),
        status: 'Operational',
        category: 'Microscope',
        department: 'Biology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'MIC-003',
        manufacturerName: 'Leica',
        modelNumber: 'DM750',
        manufacturerServiceNumber: 'LEI-98765',
        vendorName: 'Leica',
        vendorCode: 'LEI',
        locationDescription: 'Lab 103',
        locationCode: 'L103',
        purchasePrice: 18000.00,
        installationDate: new Date('2023-03-10').toISOString(),
        warrantyExpirationDate: new Date('2026-03-10').toISOString(),
        status: 'Operational',
        category: 'Microscope',
        department: 'Biology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'MIC-004',
        manufacturerName: 'Zeiss',
        modelNumber: 'Axio Observer',
        manufacturerServiceNumber: 'ZEI-45678',
        vendorName: 'Zeiss',
        vendorCode: 'ZEI',
        locationDescription: 'Lab 104',
        locationCode: 'L104',
        purchasePrice: 20000.00,
        installationDate: new Date('2023-04-05').toISOString(),
        warrantyExpirationDate: new Date('2026-04-05').toISOString(),
        status: 'Operational',
        category: 'Microscope',
        department: 'Biology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'MIC-005',
        manufacturerName: 'Olympus',
        modelNumber: 'CX43',
        manufacturerServiceNumber: 'OLY-67890',
        vendorName: 'Olympus',
        vendorCode: 'OLY',
        locationDescription: 'Lab 105',
        locationCode: 'L105',
        purchasePrice: 10000.00,
        installationDate: new Date('2023-05-20').toISOString(),
        warrantyExpirationDate: new Date('2026-05-20').toISOString(),
        status: 'Operational',
        category: 'Microscope',
        department: 'Biology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
  ]);

  const centrifuges = await Promise.all([
    prisma.equipment.create({
      data: {
        serialNumber: 'CEN-001',
        manufacturerName: 'Eppendorf',
        modelNumber: '5810R',
        manufacturerServiceNumber: 'EPP-12345',
        vendorName: 'Eppendorf',
        vendorCode: 'EPP',
        locationDescription: 'Lab 201',
        locationCode: 'L201',
        purchasePrice: 8000.00,
        installationDate: new Date('2023-01-15').toISOString(),
        warrantyExpirationDate: new Date('2026-01-15').toISOString(),
        status: 'Operational',
        category: 'Centrifuge',
        department: 'Chemistry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'CEN-002',
        manufacturerName: 'Thermo Fisher',
        modelNumber: 'Sorvall ST 16R',
        manufacturerServiceNumber: 'THF-54321',
        vendorName: 'Thermo Fisher',
        vendorCode: 'THF',
        locationDescription: 'Lab 202',
        locationCode: 'L202',
        purchasePrice: 10000.00,
        installationDate: new Date('2023-02-20').toISOString(),
        warrantyExpirationDate: new Date('2026-02-20').toISOString(),
        status: 'Operational',
        category: 'Centrifuge',
        department: 'Chemistry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'CEN-003',
        manufacturerName: 'Beckman Coulter',
        modelNumber: 'Allegra X-15R',
        manufacturerServiceNumber: 'BEC-98765',
        vendorName: 'Beckman Coulter',
        vendorCode: 'BEC',
        locationDescription: 'Lab 203',
        locationCode: 'L203',
        purchasePrice: 12000.00,
        installationDate: new Date('2023-03-10').toISOString(),
        warrantyExpirationDate: new Date('2026-03-10').toISOString(),
        status: 'Operational',
        category: 'Centrifuge',
        department: 'Chemistry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'CEN-004',
        manufacturerName: 'Sigma',
        modelNumber: '3-18KS',
        manufacturerServiceNumber: 'SIG-45678',
        vendorName: 'Sigma',
        vendorCode: 'SIG',
        locationDescription: 'Lab 204',
        locationCode: 'L204',
        purchasePrice: 9000.00,
        installationDate: new Date('2023-04-05').toISOString(),
        warrantyExpirationDate: new Date('2026-04-05').toISOString(),
        status: 'Operational',
        category: 'Centrifuge',
        department: 'Chemistry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'CEN-005',
        manufacturerName: 'Eppendorf',
        modelNumber: '5424R',
        manufacturerServiceNumber: 'EPP-67890',
        vendorName: 'Eppendorf',
        vendorCode: 'EPP',
        locationDescription: 'Lab 205',
        locationCode: 'L205',
        purchasePrice: 7000.00,
        installationDate: new Date('2023-05-20').toISOString(),
        warrantyExpirationDate: new Date('2026-05-20').toISOString(),
        status: 'Operational',
        category: 'Centrifuge',
        department: 'Chemistry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
  ]);

  const analyzers = await Promise.all([
    prisma.equipment.create({
      data: {
        serialNumber: 'ANA-001',
        manufacturerName: 'Roche',
        modelNumber: 'Cobas c501',
        manufacturerServiceNumber: 'ROC-12345',
        vendorName: 'Roche',
        vendorCode: 'ROC',
        locationDescription: 'Lab 301',
        locationCode: 'L301',
        purchasePrice: 25000.00,
        installationDate: new Date('2023-01-15').toISOString(),
        warrantyExpirationDate: new Date('2026-01-15').toISOString(),
        status: 'Operational',
        category: 'Analyzer',
        department: 'Clinical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'ANA-002',
        manufacturerName: 'Siemens',
        modelNumber: 'ADVIA 1800',
        manufacturerServiceNumber: 'SIE-54321',
        vendorName: 'Siemens',
        vendorCode: 'SIE',
        locationDescription: 'Lab 302',
        locationCode: 'L302',
        purchasePrice: 30000.00,
        installationDate: new Date('2023-02-20').toISOString(),
        warrantyExpirationDate: new Date('2026-02-20').toISOString(),
        status: 'Operational',
        category: 'Analyzer',
        department: 'Clinical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'ANA-003',
        manufacturerName: 'Abbott',
        modelNumber: 'Architect c8000',
        manufacturerServiceNumber: 'ABB-98765',
        vendorName: 'Abbott',
        vendorCode: 'ABB',
        locationDescription: 'Lab 303',
        locationCode: 'L303',
        purchasePrice: 28000.00,
        installationDate: new Date('2023-03-10').toISOString(),
        warrantyExpirationDate: new Date('2026-03-10').toISOString(),
        status: 'Operational',
        category: 'Analyzer',
        department: 'Clinical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'ANA-004',
        manufacturerName: 'Beckman Coulter',
        modelNumber: 'AU5800',
        manufacturerServiceNumber: 'BEC-45678',
        vendorName: 'Beckman Coulter',
        vendorCode: 'BEC',
        locationDescription: 'Lab 304',
        locationCode: 'L304',
        purchasePrice: 27000.00,
        installationDate: new Date('2023-04-05').toISOString(),
        warrantyExpirationDate: new Date('2026-04-05').toISOString(),
        status: 'Operational',
        category: 'Analyzer',
        department: 'Clinical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
    prisma.equipment.create({
      data: {
        serialNumber: 'ANA-005',
        manufacturerName: 'Roche',
        modelNumber: 'Cobas e601',
        manufacturerServiceNumber: 'ROC-67890',
        vendorName: 'Roche',
        vendorCode: 'ROC',
        locationDescription: 'Lab 305',
        locationCode: 'L305',
        purchasePrice: 22000.00,
        installationDate: new Date('2023-05-20').toISOString(),
        warrantyExpirationDate: new Date('2026-05-20').toISOString(),
        status: 'Operational',
        category: 'Analyzer',
        department: 'Clinical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }),
  ]);

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
      equipmentId: microscopes[0].id
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
      equipmentId: centrifuges[0].id
    }
  });

  // Create sample work orders
  const workOrder1 = await prisma.workOrder.create({
    data: {
      equipmentId: microscopes[0].id,
      issue: 'Lens calibration needed',
      type: 'Preventive',
      priority: 'Medium',
      status: 'Reported',
      reportedBy: users[1].id,
      reportedAt: new Date('2023-06-01').toISOString(),
      assignedTo: users[2].id,
      assignedAt: new Date('2023-06-02').toISOString(),
      estimatedCompletion: new Date('2023-06-10').toISOString(),
      description: 'Microscope lens requires calibration for accurate results.',
      symptoms: 'Blurry images',
      impact: 'Reduced accuracy in experiments',
      actions: null,
      notes: null,
      sparePartsNeeded: null,
      partsUsed: null,
      completionNotes: null,
      completedAt: null,
      cost: null,
      createdAt: new Date('2023-06-01').toISOString(),
      updatedAt: new Date('2023-06-01').toISOString()
    }
  });

  const workOrder2 = await prisma.workOrder.create({
    data: {
      equipmentId: centrifuges[0].id,
      issue: 'Rotor replacement required',
      type: 'Corrective',
      priority: 'High',
      status: 'In Progress',
      reportedBy: users[1].id,
      reportedAt: new Date('2023-07-01').toISOString(),
      assignedTo: users[2].id,
      assignedAt: new Date('2023-07-02').toISOString(),
      estimatedCompletion: new Date('2023-07-10').toISOString(),
      description: 'Centrifuge rotor is damaged and needs replacement.',
      symptoms: 'Unusual noise, vibration',
      impact: 'Cannot run samples',
      actions: 'Ordered new rotor',
      notes: null,
      sparePartsNeeded: 'Centrifuge Rotor',
      partsUsed: null,
      completionNotes: null,
      completedAt: null,
      cost: null,
      createdAt: new Date('2023-07-01').toISOString(),
      updatedAt: new Date('2023-07-01').toISOString()
    }
  });

  // Create sample contracts
  const microscopeContract = await prisma.contract.create({
    data: {
      vendor: 'Olympus Service',
      equipmentId: microscopes[0].id,
      startDate: '2023-01-15',
      endDate: '2026-01-15',
      details: 'Annual maintenance and calibration service',
      status: 'Active'
    }
  });

  const centrifugeContract = await prisma.contract.create({
    data: {
      vendor: 'Eppendorf Service',
      equipmentId: centrifuges[0].id,
      startDate: '2023-02-20',
      endDate: '2025-02-20',
      details: 'Quarterly maintenance service',
      status: 'Active'
    }
  });

  // Create sample maintenance history
  const maintenance1 = await prisma.maintenanceHistory.create({
    data: {
      equipmentId: microscopes[0].id,
      type: 'Preventive',
      description: 'Regular calibration and cleaning',
      performedBy: users[2].id,
      date: '2023-06-15',
      cost: 500.00,
      partsUsed: 'Cleaning solution, calibration tools'
    }
  });

  const maintenance2 = await prisma.maintenanceHistory.create({
    data: {
      equipmentId: centrifuges[0].id,
      type: 'Corrective',
      description: 'Rotor replacement',
      performedBy: users[2].id,
      date: '2023-07-15',
      cost: 1200.00,
      partsUsed: 'New rotor'
    }
  });

  // Create sample reports
  const report1 = await prisma.report.create({
    data: {
      type: 'Performance',
      title: 'Monthly Equipment Performance Report',
      content: 'Detailed analysis of equipment performance and maintenance activities.',
      generatedAt: '2023-06-30',
      generatedBy: users[0].id,
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
      generatedBy: users[0].id,
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

  // Create sample compliance records
  const compliance1 = await prisma.compliance.create({
    data: {
      equipmentId: microscopes[0].id,
      standard: 'ISO 15189',
      status: 'Compliant',
      lastCheck: '2023-06-01',
      nextDue: '2023-12-01',
      notes: 'All requirements met.'
    }
  });

  const compliance2 = await prisma.compliance.create({
    data: {
      equipmentId: centrifuges[0].id,
      standard: 'ISO 15189',
      status: 'Compliant',
      lastCheck: '2023-06-01',
      nextDue: '2023-12-01',
      notes: 'All requirements met.'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 