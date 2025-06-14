import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  authenticateToken,
  authorizeRole,
  authorizePermission,
  AuthRequest
} from '../middleware/auth';
import { Role, permissionsByRole, ROLES } from '../config/permissions';
import { mapToFrontendRole, BackendUserRole } from '../types/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const SALT_ROUNDS = 12;

// User Registration
router.post('/register', async (req, res) => {
  const { username, email, password, role = Role.LAB_TECHNICIAN } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Username, email and password are required',
      code: 'MISSING_FIELDS'
    });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Username or email already exists',
        code: 'USER_EXISTS'
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const permissions = permissionsByRole[role as Role] || [];

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        permissions: JSON.stringify(permissions)
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_FAILED'
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      code: 'MISSING_CREDENTIALS'
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userData } = user;

    res.json({
      user: {
        ...userData,
        permissions: JSON.parse(userData.permissions || '[]')
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_FAILED'
    });
  }
});

// Get Current User
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  res.json(req.user);
});

// Update User Profile
router.put(
  '/me',
  authenticateToken,
  async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { username, email } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { username, email },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          permissions: true
        }
      });

      res.json({
        ...updatedUser,
        permissions: JSON.parse(updatedUser.permissions || '[]')
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        error: 'Profile update failed',
        code: 'UPDATE_FAILED'
      });
    }
  }
);

// Admin-only: Create User
router.post(
  '/',
  authenticateToken,
  authorizeRole([Role.ADMIN]),
  async (req: AuthRequest, res) => {
    const { username, email, password, role = Role.LAB_TECHNICIAN } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Username or email already exists',
          code: 'USER_EXISTS'
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const permissions = permissionsByRole[role as Role] || [];

      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
          permissions: JSON.stringify(permissions)
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({
        error: 'Failed to create user',
        code: 'CREATION_FAILED'
      });
    }
  }
);

// Admin-only: Get All Users
router.get(
  '/',
  authenticateToken,
  authorizeRole([Role.ADMIN]),
  async (req: AuthRequest, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        code: 'FETCH_FAILED'
      });
    }
  }
);

// Admin-only: Update User Role
router.patch(
  '/:id/role',
  authenticateToken,
  authorizeRole([Role.ADMIN]),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(Role).includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        code: 'INVALID_ROLE'
      });
    }

    try {
      const permissions = permissionsByRole[role as Role] || [];
      const user = await prisma.user.update({
        where: { id },
        data: {
          role,
          permissions: JSON.stringify(permissions)
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        error: 'Failed to update user role',
        code: 'UPDATE_FAILED'
      });
    }
  }
);

// Admin-only: Update User Status
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRole([Role.ADMIN]),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        code: 'INVALID_STATUS'
      });
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { status },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({
        error: 'Failed to update user status',
        code: 'UPDATE_FAILED'
      });
    }
  }
);

// Admin-only: Delete User
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole([Role.ADMIN]),
  async (req: AuthRequest, res) => {
    const { id } = req.params;

    try {
      await prisma.user.delete({
        where: { id }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: 'Failed to delete user',
        code: 'DELETE_FAILED'
      });
    }
  }
);

export default router;