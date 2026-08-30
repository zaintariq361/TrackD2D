import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/contacts
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { companyId, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

    const where: Record<string, unknown> = { organizationId: req.user!.organizationId };
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: parseInt(limit as string, 10),
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true, logoUrl: true, domain: true },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await prisma.contact.create({
      data: { ...req.body, organizationId: req.user!.organizationId },
      include: {
        company: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/contacts/:id
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, organizationId: req.user!.organizationId },
    });
    if (!existing) throw new AppError('Contact not found', 404);

    const { organizationId, ...safeData } = req.body;
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: safeData,
      include: {
        company: { select: { id: true, name: true } },
      },
    });
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

export default router;
