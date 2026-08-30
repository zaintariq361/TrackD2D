'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Globe, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const mockCompanies = [
  { id: '1', name: 'Sunrise Coffee Roasters', domain: 'sunrisecoffee.com', industry: 'Food & Beverage', employees: 12, revenue: '$1.2M', leads: 3, contacts: 4, enrichment: 'ENRICHED' },
  { id: '2', name: 'Harbor View Dental', domain: 'harborviewdental.com', industry: 'Healthcare', employees: 8, revenue: '$2.4M', leads: 2, contacts: 3, enrichment: 'ENRICHED' },
  { id: '3', name: 'Summit Legal Group', domain: 'summitlegal.com', industry: 'Legal', employees: 22, revenue: '$5.8M', leads: 2, contacts: 5, enrichment: 'ENRICHED' },
  { id: '4', name: 'Peak Performance Gym', domain: 'peakperformance.com', industry: 'Fitness', employees: 15, revenue: '$900K', leads: 1, contacts: 2, enrichment: 'ENRICHED' },
  { id: '5', name: 'Westside Auto Repair', domain: 'westsideauto.com', industry: 'Automotive', employees: 6, revenue: '$680K', leads: 1, contacts: 1, enrichment: 'PENDING' },
  { id: '6', name: 'Bloom Floral Studio', domain: 'bloomfloral.com', industry: 'Retail', employees: 4, revenue: '$320K', leads: 1, contacts: 2, enrichment: 'ENRICHED' },
  { id: '7', name: 'Ridgeline HVAC', domain: 'ridgelinehvac.com', industry: 'Services', employees: 9, revenue: '$1.1M', leads: 1, contacts: 2, enrichment: 'ENRICHED' },
  { id: '8', name: 'City Spa & Wellness', domain: 'cityspa.com', industry: 'Wellness', employees: 18, revenue: '$2.1M', leads: 1, contacts: 3, enrichment: 'ENRICHED' },
  { id: '9', name: 'GreenLeaf Landscaping', domain: 'greenleaf.com', industry: 'Landscaping', employees: 7, revenue: '$560K', leads: 1, contacts: 1, enrichment: 'NOT_ENRICHED' },
  { id: '10', name: 'Metro Print Works', domain: 'metroprint.com', industry: 'Printing', employees: 11, revenue: '$780K', leads: 1, contacts: 2, enrichment: 'PENDING' },
  { id: '11', name: 'Lakeside Chiropractic', domain: 'lakesidechiro.com', industry: 'Healthcare', employees: 5, revenue: '$720K', leads: 1, contacts: 2, enrichment: 'ENRICHED' },
  { id: '12', name: 'Prestige Law Offices', domain: 'prestigelaw.com', industry: 'Legal', employees: 30, revenue: '$8.2M', leads: 1, contacts: 4, enrichment: 'ENRICHED' },
];

const industries = ['All', 'Healthcare', 'Legal', 'Food & Beverage', 'Fitness', 'Automotive', 'Wellness', 'Services', 'Retail', 'Printing', 'Landscaping'];

const enrichmentBadge = (s: string) => {
  if (s === 'ENRICHED') return <Badge variant="success" className="text-2xs">Enriched</Badge>;
  if (s === 'PENDING') return <Badge variant="warning" className="text-2xs">Pending</Badge>;
  return <Badge variant="default" className="text-2xs">Not Enriched</Badge>;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');

  const filtered = mockCompanies.filter((c) => {
    if (industry !== 'All' && c.industry !== industry) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const enrichedCount = mockCompanies.filter((c) => c.enrichment === 'ENRICHED').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Companies</h1>
          <p className="text-sm text-text-secondary">
            {mockCompanies.length} total · <span className="text-success font-medium">{enrichedCount} enriched</span>
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Companies', value: mockCompanies.length, color: '#F5C518' },
          { label: 'Enriched', value: enrichedCount, color: '#10B981' },
          { label: 'Top Industry', value: 'Healthcare', color: '#3B82F6' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-text-secondary">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search companies..."
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {industries.slice(0, 6).map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                industry === ind
                  ? 'bg-accent text-[#090909]'
                  : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A] border border-[#2A2A2A]'
              )}
            >
              {ind}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="glass-card overflow-x-auto">
        <table className="data-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th>Company</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Employees</th>
              <th>Revenue</th>
              <th>Leads</th>
              <th>Contacts</th>
              <th>Enrichment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr key={company.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs font-bold text-text-secondary">
                      {company.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium text-sm">{company.name}</span>
                  </div>
                </td>
                <td className="text-xs font-mono text-text-secondary">{company.domain}</td>
                <td className="text-xs">{company.industry}</td>
                <td className="text-xs">{company.employees}</td>
                <td className="text-xs text-accent font-medium">{company.revenue}</td>
                <td>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-info/10 text-info text-xs font-bold">
                    {company.leads}
                  </span>
                </td>
                <td>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1A1A1A] text-text-secondary text-xs font-bold border border-[#2A2A2A]">
                    {company.contacts}
                  </span>
                </td>
                <td>{enrichmentBadge(company.enrichment)}</td>
                <td>
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-tertiary hover:text-accent transition-colors p-1 rounded-lg hover:bg-accent/10 inline-flex"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
