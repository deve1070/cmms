import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';
import { Role, Permission } from '../config/permissions';
import { BackendUserRole, mapToFrontendRole } from '../types/auth';

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

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      email: string;
      role: Role;
      permissions: Permission[];
    };

    // Verify user still exists in database
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

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as Role,
      permissions: JSON.parse(user.permissions || '[]')
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
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

    // Map backend role to frontend role format
    const userRole = req.user.role as unknown as BackendUserRole;
    const hasRole = roles.some(role => {
      // Map backend role to frontend role
      const mappedRole = mapToFrontendRole(userRole);
      return mappedRole === role;
    });

    if (!hasRole) {
      console.error('Role mismatch:', {
        userRole: req.user.role,
        mappedRole: mapToFrontendRole(userRole),
        requiredRoles: roles
      });
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