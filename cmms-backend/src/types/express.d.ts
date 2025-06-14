import { Role, Permission } from '../config/permissions';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      permissions: Permission[];
      username: string;
      email: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: Express.User;
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Express.Response,
  next: Express.NextFunction
) => void | Promise<void>;