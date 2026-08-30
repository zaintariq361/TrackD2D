import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getDashboardStats(orgId: string) {
    const now = new Date();
    const w1 = new Date(now.getTime() - 7 * 864e5);
    const w2 = new Date(now.getTime() - 14 * 864e5);
    const m1 = new Date(now.getTime() - 30 * 864e5);

    const [
      totalLeads, newW1, newW2,
      totalActivities, actW1, actW2,
      wonDeals, wonMonth,
      hotLeads,
      recentActivities,
      topReps,
      leadsByStatus,
      activitiesByType,
      revenue,
    ] = await Promise.all([
      prisma.lead.count({ where: { organizationId: orgId, isArchived: false } }),
      prisma.lead.count({ where: { organizationId: orgId, createdAt: { gte: w1 } } }),
      prisma.lead.count({ where: { organizationId: orgId, createdAt: { gte: w2, lt: w1 } } }),
      prisma.activity.count({ where: { organizationId: orgId } }),
      prisma.activity.count({ where: { organizationId: orgId, createdAt: { gte: w1 } } }),
      prisma.activity.count({ where: { organizationId: orgId, createdAt: { gte: w2, lt: w1 } } }),
      prisma.lead.count({ where: { organizationId: orgId, status: 'WON' } }),
      prisma.lead.count({ where: { organizationId: orgId, status: 'WON', closedAt: { gte: m1 } } }),
      prisma.lead.count({ where: { organizationId: orgId, score: { gte: 70 }, isArchived: false } }),
      prisma.activity.findMany({
        where: { organizationId: orgId, createdAt: { gte: w1 } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          lead: { select: { id: true, businessName: true, title: true } },
        },
      }),
      prisma.user.findMany({
        where: { organizationId: orgId, isActive: true },
        select: {
          id: true, firstName: true, lastName: true, avatar: true,
          activities: { where: { createdAt: { gte: m1 } }, select: { id: true } },
          assignedLeads: { where: { status: 'WON', closedAt: { gte: m1 } }, select: { dealValue: true } },
        },
        take: 10,
      }),
      prisma.lead.groupBy({ by: ['status'], where: { organizationId: orgId, isArchived: false }, _count: true }),
      prisma.activity.groupBy({ by: ['type'], where: { organizationId: orgId, createdAt: { gte: m1 } }, _count: true }),
      prisma.lead.aggregate({ where: { organizationId: orgId, status: 'WON' }, _sum: { dealValue: true }, _avg: { dealValue: true } }),
    ]);

    const dailyActivity = await this.dailyActivity(orgId, 14);

    const leadsGrowth = newW2 > 0 ? (((newW1 - newW2) / newW2) * 100).toFixed(1) : newW1 > 0 ? '100' : '0';
    const activitiesGrowth = actW2 > 0 ? (((actW1 - actW2) / actW2) * 100).toFixed(1) : actW1 > 0 ? '100' : '0';

    return {
      kpis: {
        totalLeads,
        leadsGrowth,
        totalActivities,
        activitiesGrowth,
        wonDeals,
        wonDealsThisMonth: wonMonth,
        totalRevenue: revenue._sum.dealValue ?? 0,
        avgDealValue: revenue._avg.dealValue ?? 0,
        highScoreLeads: hotLeads,
        conversionRate: totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(1) : '0',
      },
      recentActivities,
      topReps: topReps
        .map((r) => ({
          id: r.id,
          name: `${r.firstName} ${r.lastName}`,
          avatar: r.avatar,
          activities: r.activities.length,
          conversions: r.assignedLeads.length,
          revenue: r.assignedLeads.reduce((s, l) => s + (l.dealValue ?? 0), 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
      leadsByStatus,
      activitiesByType,
      dailyActivity,
    };
  }

  async getTerritoryPerformance(orgId: string) {
    return prisma.territory.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      include: {
        leads: { where: { isArchived: false }, select: { status: true, score: true, dealValue: true } },
        assignments: {
          where: { isActive: true },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
  }

  async getRepPerformance(orgId: string, repId?: string, days = 30) {
    const since = new Date(Date.now() - days * 864e5);
    const where = { organizationId: orgId, createdAt: { gte: since }, ...(repId ? { userId: repId } : {}) };
    const [activities, won] = await Promise.all([
      prisma.activity.groupBy({ by: ['userId', 'type'], where, _count: true }),
      prisma.lead.findMany({
        where: { organizationId: orgId, status: 'WON', ...(repId ? { assignedRepId: repId } : {}), closedAt: { gte: since } },
        select: { dealValue: true, assignedRepId: true },
      }),
    ]);
    return { activities, dealsWon: won.length, revenue: won.reduce((s, l) => s + (l.dealValue ?? 0), 0) };
  }

  async getLeadFunnel(orgId: string) {
    const stages = ['PROSPECTING', 'QUALIFICATION', 'NEEDS_ANALYSIS', 'VALUE_PROPOSITION', 'DECISION_MAKERS', 'PERCEPTION_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    const counts = await prisma.lead.groupBy({
      by: ['pipelineStage'],
      where: { organizationId: orgId, isArchived: false },
      _count: true,
      _sum: { dealValue: true },
    });
    return stages.map((stage) => {
      const d = counts.find((c) => c.pipelineStage === stage);
      return { stage, count: d?._count ?? 0, value: d?._sum?.dealValue ?? 0 };
    });
  }

  private async dailyActivity(orgId: string, days: number) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const nd = new Date(d); nd.setDate(nd.getDate() + 1);
      const [activities, leads] = await Promise.all([
        prisma.activity.count({ where: { organizationId: orgId, createdAt: { gte: d, lt: nd } } }),
        prisma.lead.count({ where: { organizationId: orgId, createdAt: { gte: d, lt: nd } } }),
      ]);
      result.push({ date: d.toISOString().split('T')[0], activities, leads });
    }
    return result;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
