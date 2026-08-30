import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface ScoringFactors {
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  employeeCount: number;
  industry: string;
  previousInteractions: number;
  dataCompleteness: number;
  hasLinkedIn: boolean;
}

export class ScoringService {
  async scoreLead(leadId: string): Promise<number> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          company: true,
          activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
      });
      if (!lead) return 0;

      const factors: ScoringFactors = {
        hasEmail: !!(lead.businessEmail || lead.company?.email),
        hasPhone: !!(lead.businessPhone || lead.company?.phone),
        hasWebsite: !!(lead.businessWebsite || lead.company?.website),
        hasLinkedIn: !!(lead.company?.linkedinUrl),
        employeeCount: lead.company?.employeeCount ?? 0,
        industry: lead.businessType || lead.company?.industry || '',
        previousInteractions: lead.activities.length,
        dataCompleteness: this.dataCompleteness(lead),
      };

      const score = this.calculate(factors);

      await prisma.leadScoreHistory.create({
        data: { leadId, score, factors: factors as unknown as Record<string, unknown> },
      });

      const suggestedAction = this.suggestedAction(score, factors);
      const bestTimeToVisit = this.bestTime(factors.industry);

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score,
          priority: Math.round(score),
          conversionProbability: score / 100,
          suggestedAction,
          bestTimeToVisit,
        },
      });

      return score;
    } catch (err) {
      logger.error(`Scoring failed for lead ${leadId}`, err);
      return 0;
    }
  }

  async scoreAllLeads(orgId: string) {
    const leads = await prisma.lead.findMany({
      where: { organizationId: orgId, isArchived: false },
      select: { id: true },
    });
    const results = await Promise.allSettled(leads.map((l) => this.scoreLead(l.id)));
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    logger.info(`Scored ${succeeded}/${leads.length} leads for org ${orgId}`);
    return { scored: succeeded, total: leads.length };
  }

  private calculate(f: ScoringFactors): number {
    let s = 0;
    s += f.dataCompleteness * 20;
    if (f.hasEmail) s += 7;
    if (f.hasPhone) s += 5;
    if (f.hasWebsite) s += 3;
    if (f.hasLinkedIn) s += 5;
    const emp = f.employeeCount;
    if (emp >= 50) s += 20;
    else if (emp >= 20) s += 15;
    else if (emp >= 10) s += 10;
    else if (emp >= 5) s += 6;
    else if (emp > 0) s += 3;
    const hi = ['software', 'finance', 'healthcare', 'real estate', 'construction', 'manufacturing', 'retail', 'restaurant', 'legal', 'dental'];
    if (hi.some((i) => f.industry.toLowerCase().includes(i))) s += 15;
    else if (f.industry) s += 8;
    s += Math.min(f.previousInteractions * 3, 15);
    return Math.min(Math.round(s), 100);
  }

  private dataCompleteness(lead: Record<string, unknown>): number {
    const fields = [lead.businessName, lead.businessEmail, lead.businessPhone, lead.businessWebsite, lead.addressLine1, lead.city, lead.lat, lead.lng];
    const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
    return filled / fields.length;
  }

  private suggestedAction(score: number, f: ScoringFactors): string {
    if (score >= 80) return 'High priority — visit immediately';
    if (!f.hasPhone && !f.hasEmail) return 'Enrich contact info first';
    if (f.previousInteractions === 0) return 'Initial outreach recommended';
    if (score >= 50) return 'Schedule visit this week';
    return 'Add to nurture queue';
  }

  private bestTime(industry: string): string {
    const map: Record<string, string> = {
      restaurant: 'Tue–Thu, 2PM–4PM (off-peak)',
      retail: 'Mon–Wed, 10AM–12PM',
      healthcare: 'Tue–Thu, 9AM–11AM',
      'real estate': 'Mon–Fri, 10AM–4PM',
      construction: 'Mon–Fri, 7AM–9AM',
    };
    const ind = industry.toLowerCase();
    for (const [key, val] of Object.entries(map)) {
      if (ind.includes(key)) return val;
    }
    return 'Mon–Fri, 10AM–5PM';
  }
}

export const scoringService = new ScoringService();
export default scoringService;
