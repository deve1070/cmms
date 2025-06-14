import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';
import { Role, Permission } from '../config/permissions';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: Role;
    permissions: Permission[];
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: Function) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      username: string;
      email: string;
      role: Role;
      permissions: Permission[];
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role.toUpperCase();
    const hasRole = roles.some(role => role.toUpperCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'ROLE_UNAUTHORIZED',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

export const authorizePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Missing required permission',
        code: 'PERMISSION_DENIED',
        requiredPermission: permission
      });
    }
    next();
  };
};

export const authMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      username: string;
      email: string;
      role: Role;
      permissions: Permission[];
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};