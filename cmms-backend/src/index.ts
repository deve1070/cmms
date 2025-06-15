import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { mapToFrontendRole, LoginResponse, BackendUserRole } from './types/auth';
import { authenticateToken, AuthRequest } from './middleware/auth';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Role } from './config/permissions';
import usersRouter from './routes/users';
import equipmentRouter from './routes/equipment';
import workOrdersRouter from './routes/workOrders';
import maintenanceRouter from './routes/maintenance';
import reportsRouter from './routes/reports';
import budgetsRouter from './routes/budgets';
import complianceRouter from './routes/compliance';
import contractsRouter from './routes/contracts';
import issueReportsRouter from './routes/issueReports';

const app = express();
const port = 3002;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create HTTP server and WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket client connected');
  
  ws.on('message', (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data);
      
      // Broadcast to all clients except sender
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'notification',
            data: `New message: ${data.content}`
          }));
        }
      });
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to WebSocket server'
  }));
});

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3004', 'http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// JSON response middleware
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      websocket: wss.clients.size
    }
  });
});

// Enhanced login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.error('Missing credentials:', { username: !!username, password: !!password });
      return res.status(400).json({ 
        error: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const user = await prisma.user.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        department: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        status: true
      }
    });

    console.log('User from database:', { 
      found: !!user,
      username: user?.username,
      role: user?.role,
      status: user?.status
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLogin: new Date().toISOString()
      }
    });

    const token = jwt.sign({ 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]')
    }, JWT_SECRET, { expiresIn: '24h' });

    const response = {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: mapToFrontendRole(user.role as BackendUserRole),
        department: user.department || undefined,
        permissions: JSON.parse(user.permissions || '[]'),
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    };

    console.log('Sending login response:', {
      userId: response.user.id,
      username: response.user.username,
      role: response.user.role
    });

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_FAILED'
    });
  }
});

// Enhanced auth check endpoint
app.get('/api/auth/check', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'User not authenticated',
      code: 'NOT_AUTHENTICATED'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        department: true,
        permissions: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Map the user data to include parsed permissions and proper date formatting
    const mappedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: mapToFrontendRole(user.role as BackendUserRole),
      department: user.department || undefined,
      permissions: JSON.parse(user.permissions || '[]'),
      status: user.status,
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    res.json({ user: mappedUser });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      error: 'Authentication check failed',
      code: 'AUTH_CHECK_FAILED'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    // Broadcast logout notification via WebSocket
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user_logout',
          data: {
            userId: req.user!.id,
            timestamp: new Date().toISOString()
          }
        }));
      }
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_FAILED'
    });
  }
});

// Protected example endpoint
app.get('/api/protected', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  res.json({ 
    message: 'Access granted to protected resource',
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

// Equipment routes
app.get('/api/equipment', async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        maintenanceHistory: true,
        workOrders: true,
        maintenanceReports: true,
      },
    });
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

app.get('/api/equipment/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: req.params.id },
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

app.post('/api/equipment', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const equipment = await prisma.equipment.create({
      data: req.body
    });
    res.json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

app.put('/api/equipment/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const equipment = await prisma.equipment.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

app.delete('/api/equipment/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.equipment.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// Work orders routes
app.get('/api/work-orders', async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        equipment: true,
        assignedTo: true,
        reportedBy: true,
      },
    });
    res.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

app.get('/api/work-orders/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: {
        equipment: true,
        assignedTo: true,
        reportedBy: true
      }
    });
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    res.json(workOrder);
  } catch (error) {
    console.error('Error fetching work order:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

app.post('/api/work-orders', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const workOrder = await prisma.workOrder.create({
      data: {
        ...req.body,
        reportedBy: { connect: { id: req.user?.id } }
      },
      include: {
        equipment: true,
        assignedTo: true,
        reportedBy: true
      }
    });
    res.json(workOrder);
  } catch (error) {
    console.error('Error creating work order:', error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

app.put('/api/work-orders/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const workOrder = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        equipment: true,
        assignedTo: true,
        reportedBy: true
      }
    });
    res.json(workOrder);
  } catch (error) {
    console.error('Error updating work order:', error);
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

app.delete('/api/work-orders/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.workOrder.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error('Error deleting work order:', error);
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

// Maintenance routes
app.get('/api/maintenance', async (req, res) => {
  try {
    const maintenanceReports = await prisma.maintenanceReport.findMany({
      include: {
        equipment: true,
        performedBy: true,
      },
    });
    res.json(maintenanceReports);
  } catch (error) {
    console.error('Error fetching maintenance reports:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance reports' });
  }
});

app.get('/api/maintenance/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const maintenance = await prisma.maintenanceReport.findUnique({
      where: { id: req.params.id },
      include: {
        equipment: true,
        performedBy: true
      }
    });
    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance report not found' });
    }
    res.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance report:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance report' });
  }
});

app.post('/api/maintenance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      equipmentId,
      type,
      description,
      date,
      partsUsed,
      findings,
      recommendations,
      nextDueDate
    } = req.body;

    // Create maintenance report
    const maintenance = await prisma.maintenanceReport.create({
      data: {
        equipmentId,
        type,
        description,
        date: new Date(date),
        partsUsed,
        findings,
        recommendations,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        performedById: req.user?.id || '',
        status: 'Completed'
      },
      include: {
        equipment: true,
        performedBy: true
      }
    });

    // Update the corresponding work order status
    await prisma.workOrder.updateMany({
      where: {
        equipmentId: equipmentId,
        status: {
          in: ['In Progress', 'Assigned']
        }
      },
      data: {
        status: 'Completed',
        completedAt: new Date(),
        completionNotes: description
      }
    });

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error creating maintenance report:', error);
    res.status(500).json({ error: 'Failed to create maintenance report' });
  }
});

app.put('/api/maintenance/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const maintenance = await prisma.maintenanceReport.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        equipment: true,
        performedBy: true
      }
    });
    res.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance report:', error);
    res.status(500).json({ error: 'Failed to update maintenance report' });
  }
});

app.delete('/api/maintenance/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.maintenanceReport.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Maintenance report deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance report:', error);
    res.status(500).json({ error: 'Failed to delete maintenance report' });
  }
});

// Spare parts routes
app.get('/api/spare-parts', async (req, res) => {
  try {
    const spareParts = await prisma.sparePart.findMany({
      include: {
        equipment: true,
      },
    });
    res.json(spareParts);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    res.status(500).json({ error: 'Failed to fetch spare parts' });
  }
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/issue-reports', issueReportsRouter);

// Token refresh endpoint
app.get('/api/auth/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      // First try to verify the token
      decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
        email: string;
        role: string;
        permissions: string[];
      };
    } catch (verifyError) {
      // If verification fails, try to decode without verification
      try {
        decoded = jwt.decode(token) as {
          id: string;
          username: string;
          email: string;
          role: string;
          permissions: string[];
        };
      } catch (decodeError) {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        permissions: true,
        status: true
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'User not found or inactive',
        code: 'INVALID_USER'
      });
    }

    // Generate a new token
    const newToken = jwt.sign({ 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]')
    }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Start both HTTP and WebSocket servers
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`WebSocket server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    wss.close(() => {
      console.log('WebSocket server closed');
      prisma.$disconnect().then(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  });
});