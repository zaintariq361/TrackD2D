import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { leadsService } from '../services/leads.service';
import { LeadStatus, LeadSource } from '@prisma/client';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const r = await leadsService.getLeads(req.user!.organizationId, {
      status: req.query.status as LeadStatus,
      territoryId: req.query.territoryId as string,
      assignedRepId: req.query.assignedRepId as string,
      search: req.query.search as string,
      source: req.query.source as LeadSource,
      minScore: req.query.minScore ? Number(req.query.minScore) : undefined,
      maxScore: req.query.maxScore ? Number(req.query.maxScore) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: Math.min(Number(req.query.limit ?? 20), 100),
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });
    res.json(r);
  } catch (e) { next(e); }
});

router.get('/nearby', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radiusKm = '5' } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
    res.json(await leadsService.getNearbyLeads(req.user!.organizationId, Number(lat), Number(lng), Number(radiusKm)));
  } catch (e) { next(e); }
});

router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await leadsService.getLeadStats(req.user!.organizationId, req.query.period as string)); } catch (e) { next(e); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await leadsService.getLeadById(req.params.id, req.user!.organizationId)); } catch (e) { next(e); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await leadsService.createLead(req.user!.organizationId, { ...req.body, assignedRepId: req.body.assignedRepId ?? req.user!.id })); } catch (e) { next(e); }
});

router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await leadsService.updateLead(req.params.id, req.user!.organizationId, req.body)); } catch (e) { next(e); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { await leadsService.deleteLead(req.params.id, req.user!.organizationId); res.json({ message: 'Archived' }); } catch (e) { next(e); }
});

router.post('/bulk-assign', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await leadsService.bulkAssign(req.body.leadIds, req.user!.organizationId, req.body.assignedRepId)); } catch (e) { next(e); }
});

router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await leadsService.importLeads(req.user!.organizationId, req.body.leads)); } catch (e) { next(e); }
});

export default router;
