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
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@lab.com',
      role: 'Admin',
      password: adminPassword,
      department: 'IT',
      permissions: JSON.stringify(['manage_users', 'manage_equipment', 'manage_budgets']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  const engineer = await prisma.user.create({
    data: {
      username: 'engineer',
      email: 'engineer@lab.com',
      role: 'Engineer',
      password: engineerPassword,
      department: 'Engineering',
      permissions: JSON.stringify(['manage_equipment', 'view_reports']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  const technician = await prisma.user.create({
    data: {
      username: 'technician',
      email: 'technician@lab.com',
      role: 'Technician',
      password: technicianPassword,
      department: 'Maintenance',
      permissions: JSON.stringify(['view_equipment', 'create_work_orders']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  const labTech = await prisma.user.create({
    data: {
      username: 'labtech',
      email: 'labtech@lab.com',
      role: 'LAB_TECH',
      password: labTechPassword,
      department: 'Laboratory',
      permissions: JSON.stringify(['view_equipment', 'report_issues', 'view_maintenance']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  // Create sample equipment
  const microscope = await prisma.equipment.create({
    data: {
      serialNumber: 'MIC-001',
      model: 'Olympus BX53',
      location: 'Lab 101',
      purchaseDate: '2023-01-15',
      warrantyDetails: '3 years warranty',
      category: 'Microscope',
      manufacturer: 'Olympus',
      department: 'Biology',
      cost: 15000.00,
      status: 'Operational'
    }
  });

  const centrifuge = await prisma.equipment.create({
    data: {
      serialNumber: 'CEN-001',
      model: 'Eppendorf 5810R',
      location: 'Lab 102',
      purchaseDate: '2023-02-20',
      warrantyDetails: '2 years warranty',
      category: 'Centrifuge',
      manufacturer: 'Eppendorf',
      department: 'Chemistry',
      cost: 8000.00,
      status: 'Operational'
    }
  });

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
      leadTime: 14
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
      leadTime: 21
    }
  });

  // Create sample work orders
  const workOrder1 = await prisma.workOrder.create({
    data: {
      equipmentId: microscope.id,
      issue: 'Lens calibration needed',
      type: 'Preventive',
      assignedTo: technician.id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      reportedBy: labTech.id
    }
  });

  const workOrder2 = await prisma.workOrder.create({
    data: {
      equipmentId: centrifuge.id,
      issue: 'Rotor replacement required',
      type: 'Corrective',
      assignedTo: technician.id,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      reportedBy: labTech.id,
      actions: 'Ordered new rotor'
    }
  });

  // Create sample contracts
  const microscopeContract = await prisma.contract.create({
    data: {
      vendor: 'Olympus Service',
      equipmentId: microscope.id,
      startDate: '2023-01-15',
      endDate: '2026-01-15',
      details: 'Annual maintenance and calibration service',
      status: 'Active'
    }
  });

  const centrifugeContract = await prisma.contract.create({
    data: {
      vendor: 'Eppendorf Service',
      equipmentId: centrifuge.id,
      startDate: '2023-02-20',
      endDate: '2025-02-20',
      details: 'Quarterly maintenance service',
      status: 'Active'
    }
  });

  // Create sample maintenance history
  const maintenance1 = await prisma.maintenanceHistory.create({
    data: {
      equipmentId: microscope.id,
      type: 'Preventive',
      description: 'Regular calibration and cleaning',
      performedBy: technician.id,
      date: '2023-06-15',
      cost: 500.00,
      partsUsed: 'Cleaning solution, calibration tools'
    }
  });

  const maintenance2 = await prisma.maintenanceHistory.create({
    data: {
      equipmentId: centrifuge.id,
      type: 'Corrective',
      description: 'Rotor bearing replacement',
      performedBy: technician.id,
      date: '2023-07-01',
      cost: 800.00,
      partsUsed: 'New bearing set'
    }
  });

  // Create sample reports
  const performanceReport = await prisma.report.create({
    data: {
      type: 'Performance',
      title: 'Q2 2023 Equipment Performance',
      content: 'Equipment uptime and maintenance analysis',
      generatedAt: new Date().toISOString(),
      generatedBy: admin.id,
      period: '2023-Q2',
      metrics: JSON.stringify({
        uptime: '98%',
        maintenanceCost: 5000,
        preventiveMaintenance: 8,
        correctiveMaintenance: 2
      })
    }
  });

  const financialReport = await prisma.report.create({
    data: {
      type: 'Financial',
      title: 'Q2 2023 Budget Report',
      content: 'Maintenance and parts spending analysis',
      generatedAt: new Date().toISOString(),
      generatedBy: admin.id,
      period: '2023-Q2',
      metrics: JSON.stringify({
        totalSpent: 15000,
        budgetUtilization: '75%',
        partsCost: 8000,
        serviceCost: 7000
      })
    }
  });

  // Create sample budgets
  const maintenanceBudget = await prisma.budget.create({
    data: {
      year: '2023',
      month: 'Q2',
      category: 'Maintenance',
      allocated: 20000.00,
      spent: 15000.00,
      department: 'All'
    }
  });

  const partsBudget = await prisma.budget.create({
    data: {
      year: '2023',
      month: 'Q2',
      category: 'Parts',
      allocated: 10000.00,
      spent: 8000.00,
      department: 'All'
    }
  });

  // Create sample compliance records
  const microscopeCompliance = await prisma.compliance.create({
    data: {
      equipmentId: microscope.id,
      standard: 'ISO 15189',
      status: 'Compliant',
      lastCheck: '2023-06-01',
      nextDue: '2023-12-01',
      notes: 'All requirements met'
    }
  });

  const centrifugeCompliance = await prisma.compliance.create({
    data: {
      equipmentId: centrifuge.id,
      standard: 'ISO 15189',
      status: 'Compliant',
      lastCheck: '2023-06-15',
      nextDue: '2023-12-15',
      notes: 'Regular calibration performed'
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