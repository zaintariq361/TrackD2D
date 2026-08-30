import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/companies
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, industry, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const where: Record<string, unknown> = { organizationId: req.user!.organizationId };
    if (industry) where.industry = industry;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit as string, 10),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { leads: true, contacts: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        companies,
        total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
      include: {
        _count: { select: { leads: true, contacts: true } },
        contacts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            isDecisionMaker: true,
          },
        },
        leads: {
          where: { isArchived: false },
          orderBy: { score: 'desc' },
          take: 10,
          select: {
            id: true,
            businessName: true,
            status: true,
            score: true,
            pipelineStage: true,
          },
        },
      },
    });
    if (!company) throw new AppError('Company not found', 404);
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
});

// POST /api/companies
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.create({
      data: { ...req.body, organizationId: req.user!.organizationId },
    });
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/companies/:id
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.company.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    });
    if (!existing) throw new AppError('Company not found', 404);

    const { organizationId, ...safeData } = req.body;
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: safeData,
    });
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
});

export default router;
