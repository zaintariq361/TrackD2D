import { Router, Response, NextFunction } from 'express';
import { PrismaClient, ActivityType } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { leadId, userId, type, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = { organizationId: req.user!.organizationId };
    if (leadId) where.leadId = leadId;
    if (userId) where.userId = userId;
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      prisma.activity.findMany({ where, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } }, lead: { select: { id: true, businessName: true, title: true } } }, skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.activity.count({ where }),
    ]);
    res.json({ data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (e) { next(e); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activity = await prisma.activity.create({
      data: { ...req.body, organizationId: req.user!.organizationId, userId: req.user!.id, completedAt: new Date() },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } }, lead: { select: { id: true, businessName: true } } },
    });
    if (req.body.leadId) {
      const upd: Record<string, unknown> = { lastContactedAt: new Date() };
      if (req.body.type === 'DOOR_KNOCK') upd.totalKnocks = { increment: 1 };
      if (req.body.type === 'CALL') upd.totalCalls = { increment: 1 };
      if (req.body.type === 'EMAIL') upd.totalEmails = { increment: 1 };
      await prisma.lead.update({ where: { id: req.body.leadId }, data: upd });
    }
    res.status(201).json(activity);
  } catch (e) { next(e); }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await prisma.activity.update({ where: { id: req.params.id }, data: req.body })); } catch (e) { next(e); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await prisma.activity.delete({ where: { id: req.params.id } }); res.json({ message: 'Deleted' }); } catch (e) { next(e); }
});

router.post('/track-location', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, accuracy, speed, heading } = req.body;
    await prisma.repTracking.create({ data: { userId: req.user!.id, lat, lng, accuracy, speed, heading } });
    await prisma.user.update({ where: { id: req.user!.id }, data: { lastLocationLat: lat, lastLocationLng: lng, lastLocationAt: new Date() } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
