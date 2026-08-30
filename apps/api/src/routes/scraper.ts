import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { scraperService } from '../services/scraper.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, requireRole('ADMIN', 'MANAGER', 'SUPER_ADMIN'));

// POST /api/scraper/google-places
router.post('/google-places', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { query, lat, lng, radiusMeters = 5000 } = req.body;

    if (!query) throw new AppError('query is required', 400);
    if (!lat || !lng) throw new AppError('lat and lng are required', 400);

    const results = await scraperService.searchGooglePlaces(
      query,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusMeters),
      req.user!.organizationId,
    );

    res.json({ success: true, data: { results, count: results.length } });
  } catch (err) {
    next(err);
  }
});

// POST /api/scraper/import
router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { results, territoryId, assignedRepId } = req.body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      throw new AppError('results array is required and must not be empty', 400);
    }

    const imported = await scraperService.importLeads(
      results,
      req.user!.organizationId,
      territoryId,
      assignedRepId,
    );

    res.status(201).json({ success: true, data: imported });
  } catch (err) {
    next(err);
  }
});

// GET /api/scraper/jobs
router.get('/jobs', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const [jobs, total] = await Promise.all([
      prisma.scraperJob.findMany({
        where: { organizationId: req.user!.organizationId },
        skip,
        take: parseInt(limit as string, 10),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.scraperJob.count({
        where: { organizationId: req.user!.organizationId },
      }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
