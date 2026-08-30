import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface PlaceResult {
  businessName: string;
  businessType?: string;
  businessPhone?: string;
  businessWebsite?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  rating?: number;
  reviewCount?: number;
}

export class ScraperService {
  async searchGooglePlaces(query: string, lat: number, lng: number, radiusMeters = 5000, orgId: string): Promise<PlaceResult[]> {
    if (!config.apis.googlePlaces) {
      logger.warn('Google Places API key not configured');
      return [];
    }

    const results: PlaceResult[] = [];
    let pageToken: string | undefined;
    let page = 0;
    const jobId = await this.createJob(orgId, query, `${lat},${lng}`, radiusMeters);

    try {
      do {
        const params: Record<string, string | number> = {
          query: `${query} near ${lat},${lng}`,
          location: `${lat},${lng}`,
          radius: radiusMeters,
          key: config.apis.googlePlaces,
        };
        if (pageToken) params.pagetoken = pageToken;

        const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', { params, timeout: 10000 });

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') break;

        for (const p of data.results ?? []) {
          results.push({
            businessName: p.name,
            businessType: p.types?.[0]?.replace(/_/g, ' '),
            lat: p.geometry?.location?.lat,
            lng: p.geometry?.location?.lng,
            placeId: p.place_id,
            rating: p.rating,
            reviewCount: p.user_ratings_total,
            addressLine1: p.formatted_address?.split(',')[0],
            city: p.formatted_address?.split(',')[1]?.trim(),
          });
        }

        pageToken = data.next_page_token;
        page++;
        if (pageToken) await new Promise((r) => setTimeout(r, 2000));
      } while (pageToken && page < 3);

      await prisma.scraperJob.update({ where: { id: jobId }, data: { status: 'completed', totalFound: results.length, progress: 100, completedAt: new Date() } });
    } catch (err) {
      logger.error('Google Places scrape failed', err);
      await prisma.scraperJob.update({ where: { id: jobId }, data: { status: 'failed' } });
    }

    return results;
  }

  async importLeads(results: PlaceResult[], orgId: string, territoryId?: string, assignedRepId?: string) {
    let imported = 0;
    let skipped = 0;

    for (const r of results) {
      const existing = r.placeId
        ? await prisma.lead.findFirst({ where: { organizationId: orgId, placeId: r.placeId } })
        : null;

      if (existing) { skipped++; continue; }

      await prisma.lead.create({
        data: {
          organizationId: orgId,
          businessName: r.businessName,
          title: r.businessName,
          businessType: r.businessType,
          businessPhone: r.businessPhone,
          businessWebsite: r.businessWebsite,
          addressLine1: r.addressLine1,
          city: r.city,
          lat: r.lat,
          lng: r.lng,
          placeId: r.placeId,
          source: 'GOOGLE_MAPS',
          territoryId,
          assignedRepId,
          enrichmentData: { googlePlaces: { rating: r.rating, reviewCount: r.reviewCount } },
        },
      });
      imported++;
    }

    return { imported, skipped };
  }

  private async createJob(orgId: string, query: string, location: string, radius: number) {
    const job = await prisma.scraperJob.create({ data: { organizationId: orgId, source: 'google_maps', query, location, radius, status: 'running', startedAt: new Date() } });
    return job.id;
  }
}

export const scraperService = new ScraperService();
export default scraperService;
