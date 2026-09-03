import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type UserRole = 'ADMIN' | 'MEMBER' | 'TEAM_LEADER';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: UserRole;
    organizationId?: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or invalid format (Bearer token expected)' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'ats_tasknera_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret) as { userId: string; email: string; role?: UserRole; organizationId?: string };
    if (!decoded.organizationId) {
      decoded.organizationId = 'org-tasknera';
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

export const optionalProtect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'ats_tasknera_super_secret_jwt_key_2026';
      const decoded = jwt.verify(token, secret) as { userId: string; email: string; role?: UserRole; organizationId?: string };
      if (!decoded.organizationId) {
        decoded.organizationId = 'org-tasknera';
      }
      req.user = decoded;
    } catch (error) {
      // Ignore token decode errors in optional mode
    }
  }
  next();
};

/**
 * Role-Based Access Control (RBAC) authorization middleware
 * @param allowedRoles Array of roles permitted to access the route
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userRole = req.user.role || 'MEMBER';

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Forbidden: Access restricted. Role "${userRole}" is not authorized for this resource.`,
        requiredRoles: allowedRoles
      });
      return;
    }

    next();
  };
};

