import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { config } from '../config';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    email: string;
    role: UserRole;
  };
}

interface JwtPayload {
  userId: string;
  organizationId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Not authenticated', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

export default authenticate;
