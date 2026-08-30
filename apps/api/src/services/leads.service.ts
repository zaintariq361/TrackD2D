import { PrismaClient, LeadStatus, LeadSource, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { enrichmentService } from './enrichment.service';
import { scoringService } from './scoring.service';

const prisma = new PrismaClient();

export interface LeadFilters {
  status?: LeadStatus;
  territoryId?: string;
  assignedRepId?: string;
  search?: string;
  source?: LeadSource;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class LeadsService {
  async getLeads(orgId: string, filters: LeadFilters = {}) {
    const {
      status,
      territoryId,
      assignedRepId,
      search,
      source,
      minScore,
      maxScore,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.LeadWhereInput = {
      organizationId: orgId,
      isArchived: false,
    };

    if (status) where.status = status;
    if (territoryId) where.territoryId = territoryId;
    if (assignedRepId) where.assignedRepId = assignedRepId;
    if (source) where.source = source;
    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) (where.score as Prisma.FloatFilter).gte = minScore;
      if (maxScore !== undefined) (where.score as Prisma.FloatFilter).lte = maxScore;
    }
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessEmail: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const validSortFields = ['createdAt', 'score', 'priority', 'updatedAt', 'lastContactedAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
        include: {
          assignedRep: {
            select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
          },
          territory: { select: { id: true, name: true, color: true } },
          company: { select: { id: true, name: true, logoUrl: true } },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, type: true, outcome: true, createdAt: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeadById(id: string, orgId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId: orgId },
      include: {
        assignedRep: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true },
        },
        territory: true,
        company: true,
        contact: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        aiInsights: {
          where: { isActioned: false },
          orderBy: { createdAt: 'desc' },
        },
        scoreHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    return lead;
  }

  async createLead(orgId: string, data: Prisma.LeadUncheckedCreateInput) {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });

    // Queue enrichment and score in background
    try {
      await enrichmentService.queueEnrichment('Lead', lead.id, orgId);
      setTimeout(() => scoringService.scoreLead(lead.id).catch(logger.error.bind(logger)), 1000);
    } catch (err) {
      logger.warn(`Failed to queue enrichment for lead ${lead.id}`, { err });
    }

    return lead;
  }

  async updateLead(
    id: string,
    orgId: string,
    data: Partial<Prisma.LeadUncheckedUpdateInput>,
  ) {
    const existing = await prisma.lead.findFirst({
      where: { id, organizationId: orgId, isArchived: false },
    });
    if (!existing) {
      throw new AppError('Lead not found', 404);
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });

    return lead;
  }

  async deleteLead(id: string, orgId: string) {
    const existing = await prisma.lead.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new AppError('Lead not found', 404);
    }

    await prisma.lead.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async getNearbyLeads(orgId: string, lat: number, lng: number, radiusKm: number) {
    // Haversine distance in raw SQL (PostgreSQL)
    const radiusMeters = radiusKm * 1000;
    const leads = await prisma.$queryRaw<
      Array<{ id: string; businessName: string | null; lat: number | null; lng: number | null; distance_m: number }>
    >`
      SELECT
        id,
        "businessName",
        lat,
        lng,
        (
          6371000 * acos(
            LEAST(1, cos(radians(${lat})) * cos(radians(lat)) *
            cos(radians(lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(lat)))
          )
        ) AS distance_m
      FROM "Lead"
      WHERE
        "organizationId" = ${orgId}
        AND "isArchived" = false
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND (
          6371000 * acos(
            LEAST(1, cos(radians(${lat})) * cos(radians(lat)) *
            cos(radians(lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(lat)))
          )
        ) <= ${radiusMeters}
      ORDER BY distance_m ASC
      LIMIT 100
    `;

    return leads;
  }

  async getLeadStats(orgId: string, period: string = '30d') {
    const days = parseInt(period.replace('d', ''), 10) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [total, byStatus, bySource, recentActivity, highScore] = await Promise.all([
      prisma.lead.count({ where: { organizationId: orgId, isArchived: false } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId: orgId, isArchived: false },
        _count: { status: true },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where: { organizationId: orgId, isArchived: false },
        _count: { source: true },
      }),
      prisma.activity.count({
        where: { organizationId: orgId, createdAt: { gte: since } },
      }),
      prisma.lead.count({
        where: { organizationId: orgId, isArchived: false, score: { gte: 70 } },
      }),
    ]);

    const won = byStatus.find((s) => s.status === 'WON')?._count.status ?? 0;
    const conversionRate = total > 0 ? (won / total) * 100 : 0;

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
      bySource: bySource.map((s) => ({ source: s.source, count: s._count.source })),
      recentActivity,
      highScore,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  async bulkAssign(leadIds: string[], orgId: string, assignedRepId: string) {
    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds }, organizationId: orgId },
      data: { assignedRepId, updatedAt: new Date() },
    });
    return { updated: result.count };
  }

  async importLeads(orgId: string, leads: Prisma.LeadUncheckedCreateInput[]) {
    // Collect existing placeIds and emails to dedup
    const placeIds = leads
      .map((l) => l.placeId)
      .filter((p): p is string => !!p);

    const existingPlaceIds = placeIds.length
      ? new Set(
          (
            await prisma.lead.findMany({
              where: { organizationId: orgId, placeId: { in: placeIds } },
              select: { placeId: true },
            })
          ).map((l) => l.placeId),
        )
      : new Set<string | null>();

    const newLeads = leads.filter(
      (l) => !l.placeId || !existingPlaceIds.has(l.placeId as string),
    );

    if (newLeads.length === 0) {
      return { imported: 0, skipped: leads.length };
    }

    const created = await prisma.lead.createMany({
      data: newLeads.map((l) => ({ ...l, organizationId: orgId })),
      skipDuplicates: true,
    });

    return { imported: created.count, skipped: leads.length - created.count };
  }
}

export const leadsService = new LeadsService();
export default leadsService;
