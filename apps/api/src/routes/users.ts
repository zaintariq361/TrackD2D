import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/users
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        lastLocationLat: true,
        lastLocationLng: true,
        lastLocationAt: true,
        createdAt: true,
        _count: { select: { assignedLeads: true, activities: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/reps/locations
router.get('/reps/locations', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reps = await prisma.user.findMany({
      where: {
        organizationId: req.user!.organizationId,
        isActive: true,
        role: { in: ['REP', 'MANAGER'] },
        lastLocationLat: { not: null },
        lastLocationLng: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        lastLocationLat: true,
        lastLocationLng: true,
        lastLocationAt: true,
      },
    });
    res.json({ success: true, data: reps });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        lastLocationLat: true,
        lastLocationLng: true,
        lastLocationAt: true,
        settings: true,
        createdAt: true,
        _count: { select: { assignedLeads: true, activities: true } },
        territoryAssignments: {
          where: { isActive: true },
          include: { territory: { select: { id: true, name: true, color: true } } },
        },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// POST /api/users — invite user (admin only)
router.post(
  '/',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new AppError('A user with this email already exists', 409);

      const hashed = await bcrypt.hash(password || Math.random().toString(36).slice(-10), 12);

      const user = await prisma.user.create({
        data: {
          organizationId: req.user!.organizationId,
          email,
          password: hashed,
          firstName,
          lastName,
          role: role || 'REP',
          phone,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/users/:id
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const target = await prisma.user.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    });
    if (!target) throw new AppError('User not found', 404);

    // Only admins can change roles
    if (req.body.role && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Only admins can change roles', 403);
    }

    // Only self or admin can update
    if (req.params.id !== req.user!.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('You can only update your own profile', 403);
    }

    // Never update password through this route
    const { password, organizationId, ...safeData } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: safeData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        settings: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
