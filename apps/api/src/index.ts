import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { enrichmentService } from './services/enrichment.service';

import authRouter from './routes/auth';
import leadsRouter from './routes/leads';
import territoriesRouter from './routes/territories';
import activitiesRouter from './routes/activities';
import analyticsRouter from './routes/analytics';
import enrichmentRouter from './routes/enrichment';
import usersRouter from './routes/users';
import companiesRouter from './routes/companies';
import contactsRouter from './routes/contacts';
import scraperRouter from './routes/scraper';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// ─── Socket.io ────────────────────────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.frontendUrl || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    // lightweight JWT verify — reuse middleware logic
    const jwt = await import('jsonwebtoken');
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string; organizationId: string };
    socket.data.userId = payload.sub;
    socket.data.organizationId = payload.organizationId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const { userId, organizationId } = socket.data as { userId: string; organizationId: string };
  logger.info(`Socket connected: ${userId}`);

  // Join org room for broadcast events
  socket.join(`org:${organizationId}`);

  // Rep broadcasts their location
  socket.on('rep:location', async (data: { lat: number; lng: number }) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLocationLat: data.lat,
          lastLocationLng: data.lng,
          lastLocationAt: new Date(),
        },
      });
      // Broadcast to org (managers can see)
      socket.to(`org:${organizationId}`).emit('rep:location', {
        userId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('Error updating rep location:', err);
    }
  });

  socket.on('join:org', () => {
    socket.join(`org:${organizationId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${userId}`);
  });
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl || '*',
    credentials: true,
  }),
);
app.use(compression() as express.RequestHandler);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  }),
);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Auth-specific stricter limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many auth attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      db: 'connected',
    });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/territories', territoriesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/enrichment', enrichmentRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/scraper', scraperRouter);

// ─── 404 + Error handler ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Background: enrichment queue processor ───────────────────────────────────
const QUEUE_INTERVAL_MS = 30_000; // 30 seconds
setInterval(async () => {
  try {
    await enrichmentService.processQueue();
  } catch (err) {
    logger.error('Enrichment queue error:', err);
  }
}, QUEUE_INTERVAL_MS);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = config.port;

httpServer.listen(PORT, () => {
  logger.info(`🚀 TrackD2D API running on port ${PORT}`);
  logger.info(`📡 Socket.io enabled`);
  logger.info(`🔄 Enrichment queue processing every ${QUEUE_INTERVAL_MS / 1000}s`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
