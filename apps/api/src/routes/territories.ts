import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await prisma.territory.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { assignments: { where: { isActive: true }, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } }, _count: { select: { leads: true } } },
      orderBy: { createdAt: 'desc' },
    }));
  } catch (e) { next(e); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const t = await prisma.territory.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
      include: { assignments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } }, leads: { where: { isArchived: false }, select: { id: true, businessName: true, title: true, lat: true, lng: true, score: true, status: true } } },
    });
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (e) { next(e); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await prisma.territory.create({ data: { ...req.body, organizationId: req.user!.organizationId } })); } catch (e) { next(e); }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await prisma.territory.update({ where: { id: req.params.id }, data: req.body })); } catch (e) { next(e); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await prisma.territory.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } }); res.json({ message: 'Deactivated' }); } catch (e) { next(e); }
});

router.post('/:id/assign', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const r = await prisma.territoryAssignment.upsert({
      where: { territoryId_userId: { territoryId: req.params.id, userId: req.body.userId } },
      create: { territoryId: req.params.id, userId: req.body.userId },
      update: { isActive: true, endDate: null },
    });
    res.json(r);
  } catch (e) { next(e); }
});

export default router;
