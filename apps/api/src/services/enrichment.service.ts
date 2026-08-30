import axios from 'axios';
import { PrismaClient, ApiProvider } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class EnrichmentService {
  async queueEnrichment(entityType: string, entityId: string, _orgId: string) {
    const providers: ApiProvider[] = ['GOOGLE_PLACES', 'CLEARBIT'];
    for (const provider of providers) {
      try {
        await prisma.enrichmentQueue.create({
          data: { entityType, entityId, provider },
        });
      } catch {
        // skip duplicates
      }
    }
  }

  async enrichLead(leadId: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;

    await prisma.lead.update({ where: { id: leadId }, data: { enrichmentStatus: 'IN_PROGRESS' } });

    const data: Record<string, unknown> = {};

    try {
      if (config.apis.googlePlaces && (lead.placeId || (lead.businessName && lead.lat && lead.lng))) {
        const gp = await this.googlePlaces(lead.businessName ?? '', lead.lat, lead.lng, lead.placeId);
        if (gp) data.googlePlaces = gp;
      }

      const domain = lead.businessWebsite
        ? this.extractDomain(lead.businessWebsite)
        : lead.businessEmail?.split('@')[1];

      if (config.apis.clearbit && domain) {
        const cb = await this.clearbit(domain);
        if (cb) data.clearbit = cb;
      }

      await prisma.lead.update({
        where: { id: leadId },
        data: { enrichmentStatus: 'COMPLETED', enrichedAt: new Date(), enrichmentData: data },
      });
      logger.info(`Enriched lead ${leadId}`);
    } catch (err) {
      logger.error(`Enrichment failed for lead ${leadId}`, err);
      await prisma.lead.update({ where: { id: leadId }, data: { enrichmentStatus: 'FAILED' } });
    }
  }

  async processQueue() {
    const items = await prisma.enrichmentQueue.findMany({
      where: { status: 'PENDING', attempts: { lt: 3 }, scheduledAt: { lte: new Date() } },
      orderBy: [{ priority: 'asc' }, { scheduledAt: 'asc' }],
      take: 10,
    });

    for (const item of items) {
      await prisma.enrichmentQueue.update({
        where: { id: item.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date(), attempts: { increment: 1 } },
      });
      try {
        if (item.entityType === 'Lead') await this.enrichLead(item.entityId);
        await prisma.enrichmentQueue.update({
          where: { id: item.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      } catch (err) {
        const retry = new Date(Date.now() + Math.pow(2, item.attempts) * 60_000);
        await prisma.enrichmentQueue.update({
          where: { id: item.id },
          data: {
            status: item.attempts >= 2 ? 'FAILED' : 'PENDING',
            lastError: (err as Error).message,
            scheduledAt: retry,
          },
        });
      }
    }
  }

  private async googlePlaces(name: string, lat: number | null, lng: number | null, placeId?: string | null) {
    try {
      let url: string;
      if (placeId) {
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_phone_number,website,business_status,opening_hours&key=${config.apis.googlePlaces}`;
      } else {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${name} ${lat},${lng}`)}&key=${config.apis.googlePlaces}`;
      }
      const { data } = await axios.get(url, { timeout: 5000 });
      const r = placeId ? data.result : data.results?.[0];
      if (!r) return null;
      return {
        rating: r.rating,
        userRatingsTotal: r.user_ratings_total,
        phone: r.formatted_phone_number,
        website: r.website,
        status: r.business_status,
      };
    } catch {
      return null;
    }
  }

  private async clearbit(domain: string) {
    try {
      const { data } = await axios.get(
        `https://company.clearbit.com/v2/companies/find?domain=${domain}`,
        { headers: { Authorization: `Bearer ${config.apis.clearbit}` }, timeout: 5000 },
      );
      return {
        name: data.name,
        industry: data.category?.industry,
        employeeCount: data.metrics?.employees,
        revenue: data.metrics?.annualRevenue,
        founded: data.foundedYear,
        logo: data.logo,
      };
    } catch {
      return null;
    }
  }

  async findEmailWithHunter(firstName: string, lastName: string, domain: string): Promise<string | null> {
    if (!config.apis.hunterIo) return null;
    try {
      const { data } = await axios.get('https://api.hunter.io/v2/email-finder', {
        params: { first_name: firstName, last_name: lastName, domain, api_key: config.apis.hunterIo },
        timeout: 5000,
      });
      return data?.data?.email ?? null;
    } catch {
      return null;
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }
}

export const enrichmentService = new EnrichmentService();
export default enrichmentService;
