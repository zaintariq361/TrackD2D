import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await analyticsService.getDashboardStats(req.user!.organizationId)); } catch (e) { next(e); }
});

router.get('/territories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await analyticsService.getTerritoryPerformance(req.user!.organizationId)); } catch (e) { next(e); }
});

router.get('/reps', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await analyticsService.getRepPerformance(req.user!.organizationId, req.query.repId as string, Number(req.query.days ?? 30))); } catch (e) { next(e); }
});

router.get('/funnel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await analyticsService.getLeadFunnel(req.user!.organizationId)); } catch (e) { next(e); }
});

export default router;
