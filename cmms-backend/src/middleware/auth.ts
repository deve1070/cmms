import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Role, Permission } from '../config/permissions';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role; // Updated to use Role enum
    permissions: Permission[]; // Updated to use Permission enum array
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      role: user.role as Role, // Cast to Role enum
      permissions: JSON.parse(user.permissions) as Permission[] // Cast to Permission enum array
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const checkRole = (roles: Role[]) => { // Updated parameter type
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.role || !roles.includes(req.user.role)) { // Added null check for req.user.role
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const checkPermission = (permission: Permission) => { // Updated parameter type
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) { // Added null check for req.user.permissions
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};