import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { enrichmentService } from '../services/enrichment.service';
import { scoringService } from '../services/scoring.service';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.post('/lead/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await enrichmentService.enrichLead(req.params.id); res.json(await prisma.lead.findUnique({ where: { id: req.params.id }, select: { enrichmentStatus: true, enrichmentData: true, enrichedAt: true } })); } catch (e) { next(e); }
});

router.post('/score/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json({ score: await scoringService.scoreLead(req.params.id) }); } catch (e) { next(e); }
});

router.post('/score-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await scoringService.scoreAllLeads(req.user!.organizationId)); } catch (e) { next(e); }
});

router.get('/queue', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await prisma.enrichmentQueue.findMany({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }, orderBy: { scheduledAt: 'asc' }, take: 50 })); } catch (e) { next(e); }
});

export default router;
