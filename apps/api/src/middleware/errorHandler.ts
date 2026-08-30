import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] ${err.message}`, {
      path: req.path,
      method: req.method,
    });
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma known errors
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with that value already exists',
    });
    return;
  }

  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found',
    });
    return;
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};

export default errorHandler;
