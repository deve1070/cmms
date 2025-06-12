import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import equipmentRoutes from './routes/equipment';
import sparePartsRoutes from './routes/spareParts';
import workOrdersRoutes from './routes/workOrders';
import contractsRoutes from './routes/contracts';
import reportsRoutes from './routes/reports';
import budgetsRoutes from './routes/budgets';
import complianceRoutes from './routes/compliance';
import { authenticateToken } from './middleware/auth';

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Public routes
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    // Find user by username
    const user = await prisma.user.findFirst({
      where: { username }
    });

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, verifying password...');

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password verified, generating token...');

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

    // Return user data and token
    const response = {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: JSON.parse(user.permissions)
      }
    };

    console.log('Login successful for user:', username);
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mount routes with /api prefix
app.use('/api/equipment', equipmentRoutes);
app.use('/api/spare-parts', sparePartsRoutes);
app.use('/api/work-orders', workOrdersRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/compliance', complianceRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});