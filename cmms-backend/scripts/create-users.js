const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  {
    username: 'biomedical',
    email: 'biomedical@example.com',
    password: 'biomedical123',
    role: 'BiomedicalEngineer',
    permissions: ['view_equipment', 'manage_equipment', 'view_maintenance', 'manage_maintenance', 'view_reports', 'generate_reports']
  },
  {
    username: 'maintenance',
    email: 'maintenance@example.com',
    password: 'maintenance123',
    role: 'MaintenanceTechnician',
    permissions: ['view_work_orders', 'manage_work_orders', 'view_equipment', 'update_equipment_status', 'view_maintenance', 'manage_maintenance']
  },
  {
    username: 'labtech',
    email: 'labtech@example.com',
    password: 'labtech123',
    role: 'LabTechnician',
    permissions: ['view_equipment', 'report_issues', 'view_work_orders', 'view_reports']
  }
];

async function createUsers() {
  try {
    console.log('Starting user creation...');
    
    for (const user of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: user.username },
            { email: user.email }
          ]
        }
      });

      if (existingUser) {
        console.log(`User ${user.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          permissions: JSON.stringify(user.permissions),
          status: 'active'
        }
      });

      console.log(`Created user: ${newUser.username} with role ${newUser.role}`);
    }

    console.log('User creation completed!');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers(); 