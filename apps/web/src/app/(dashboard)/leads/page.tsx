'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Plus, Download, Zap, Grid3X3, List,
  Target, MoreHorizontal, MapPin, Phone, Star, Building2,
  Coffee, Wrench, Stethoscope, Scale, Dumbbell, Scissors,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, timeAgo, getScoreBadgeClass, getStatusBadgeClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Status = 'ALL' | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
type View = 'list' | 'grid';

const industryIcons: Record<string, React.ElementType> = {
  'Food & Beverage': Coffee, 'Healthcare': Stethoscope, 'Legal': Scale,
  'Fitness': Dumbbell, 'Automotive': Wrench, 'Salon': Scissors,
  'Floral': Star, 'Education': Building2, 'HVAC': Wrench, 'Printing': Building2,
  'Landscaping': MapPin, 'Construction': Building2,
};

const mockLeads = [
  { id: '1', businessName: 'Sunrise Coffee Roasters', industry: 'Food & Beverage', score: 92, status: 'QUALIFIED', source: 'Door Knock', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Jordan Reed', dealValue: 8400, lastContact: '2026-08-28', aiSuggestion: 'Best time: Tuesday 10am. Decision maker available mornings.' },
  { id: '2', businessName: 'Harbor View Dental', industry: 'Healthcare', score: 88, status: 'PROPOSAL', source: 'Referral', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Jordan Reed', dealValue: 12000, lastContact: '2026-08-27', aiSuggestion: 'High budget signals. Send proposal by Thursday.' },
  { id: '3', businessName: 'Summit Legal Group', industry: 'Legal', score: 85, status: 'NEGOTIATION', source: 'Cold Call', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Jordan Reed', dealValue: 18500, lastContact: '2026-08-26', aiSuggestion: 'Price-sensitive. Offer quarterly payment plan.' },
  { id: '4', businessName: 'Peak Performance Gym', industry: 'Fitness', score: 79, status: 'CONTACTED', source: 'Door Knock', city: 'Round Rock', state: 'TX', enrichment: 'ENRICHED', repName: 'Maya Chen', dealValue: 6200, lastContact: '2026-08-25', aiSuggestion: 'Call back Monday. Asked about fitness-specific features.' },
  { id: '5', businessName: 'Westside Auto Repair', industry: 'Automotive', score: 74, status: 'QUALIFIED', source: 'Door Knock', city: 'Austin', state: 'TX', enrichment: 'PENDING', repName: 'Priya Sharma', dealValue: 9200, lastContact: '2026-08-24', aiSuggestion: 'Owner is decision maker. Open to demo this week.' },
  { id: '6', businessName: 'Bloom Floral Studio', industry: 'Floral', score: 71, status: 'QUALIFIED', source: 'Email', city: 'Cedar Park', state: 'TX', enrichment: 'ENRICHED', repName: 'Maya Chen', dealValue: 4800, lastContact: '2026-08-23', aiSuggestion: 'Seasonal peak approaching. Urgency angle works well.' },
  { id: '7', businessName: 'Bright Minds Tutoring', industry: 'Education', score: 68, status: 'NEW', source: 'Door Knock', city: 'Georgetown', state: 'TX', enrichment: 'NOT_ENRICHED', repName: 'Tyler Brooks', dealValue: 3400, lastContact: '2026-08-22', aiSuggestion: 'Enrich first. Limited data currently available.' },
  { id: '8', businessName: 'Ridgeline HVAC', industry: 'HVAC', score: 65, status: 'CONTACTED', source: 'Door Knock', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Maya Chen', dealValue: 7100, lastContact: '2026-08-21', aiSuggestion: 'Follow up on quote sent last week.' },
  { id: '9', businessName: 'Metro Print Works', industry: 'Printing', score: 62, status: 'NEW', source: 'Web', city: 'Austin', state: 'TX', enrichment: 'PENDING', repName: 'Tyler Brooks', dealValue: 3800, lastContact: '2026-08-20', aiSuggestion: 'High Google review count. Strong candidate for outreach.' },
  { id: '10', businessName: 'GreenLeaf Landscaping', industry: 'Landscaping', score: 59, status: 'CONTACTED', source: 'Door Knock', city: 'Pflugerville', state: 'TX', enrichment: 'NOT_ENRICHED', repName: 'Chris Navarro', dealValue: 5400, lastContact: '2026-08-19', aiSuggestion: 'Callback requested. Enrich before next visit.' },
  { id: '11', businessName: 'City Spa & Wellness', industry: 'Salon', score: 82, status: 'QUALIFIED', source: 'Referral', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Jordan Reed', dealValue: 11000, lastContact: '2026-08-18', aiSuggestion: 'Owner interested in analytics dashboard. Demo ready.' },
  { id: '12', businessName: 'HomeFix Contractors', industry: 'Construction', score: 57, status: 'NEW', source: 'Door Knock', city: 'Leander', state: 'TX', enrichment: 'NOT_ENRICHED', repName: 'Chris Navarro', dealValue: 4100, lastContact: '2026-08-17', aiSuggestion: 'No data enriched. Start with basic contact.' },
  { id: '13', businessName: 'Cozy Corner Bakery', industry: 'Food & Beverage', score: 48, status: 'NEW', source: 'Door Knock', city: 'Kyle', state: 'TX', enrichment: 'NOT_ENRICHED', repName: 'Chris Navarro', dealValue: 2800, lastContact: '2026-08-16', aiSuggestion: 'Low score. Low priority unless enrichment improves data.' },
  { id: '14', businessName: 'Northgate Pharmacy', industry: 'Healthcare', score: 76, status: 'CONTACTED', source: 'Cold Call', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Maya Chen', dealValue: 8900, lastContact: '2026-08-15', aiSuggestion: 'Pharmacist is decision maker. Email follow-up works best.' },
  { id: '15', businessName: 'Lakeside Chiropractic', industry: 'Healthcare', score: 81, status: 'QUALIFIED', source: 'Referral', city: 'Round Rock', state: 'TX', enrichment: 'ENRICHED', repName: 'Jordan Reed', dealValue: 10200, lastContact: '2026-08-14', aiSuggestion: 'Referral from Harbor View. High trust. Close this week.' },
  { id: '16', businessName: 'Ironclad Fitness', industry: 'Fitness', score: 66, status: 'NEW', source: 'Door Knock', city: 'Austin', state: 'TX', enrichment: 'PENDING', repName: 'Tyler Brooks', dealValue: 5600, lastContact: '2026-08-13', aiSuggestion: 'Growing gym. 3 locations potential.' },
  { id: '17', businessName: 'RoofRight Pro', industry: 'Construction', score: 43, status: 'LOST', source: 'Cold Call', city: 'Buda', state: 'TX', enrichment: 'ENRICHED', repName: 'Chris Navarro', dealValue: 0, lastContact: '2026-08-12', aiSuggestion: 'Went with competitor. Follow up in 6 months.' },
  { id: '18', businessName: 'Prestige Law Offices', industry: 'Legal', score: 90, status: 'WON', source: 'Referral', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Jordan Reed', dealValue: 24000, lastContact: '2026-08-10', aiSuggestion: 'Closed! Upsell opportunity for branch 2.' },
  { id: '19', businessName: 'Quick Kuts Barbershop', industry: 'Salon', score: 52, status: 'CONTACTED', source: 'Door Knock', city: 'Hutto', state: 'TX', enrichment: 'NOT_ENRICHED', repName: 'Chris Navarro', dealValue: 2200, lastContact: '2026-08-09', aiSuggestion: 'Owner hesitant. Share ROI case study.' },
  { id: '20', businessName: 'Summit Pediatrics', industry: 'Healthcare', score: 87, status: 'PROPOSAL', source: 'Referral', city: 'Austin', state: 'TX', enrichment: 'ENRICHED', repName: 'Maya Chen', dealValue: 15500, lastContact: '2026-08-08', aiSuggestion: 'Proposal reviewed. Awaiting board decision.' },
];

const statuses: Status[] = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

const enrichmentBadge = (s: string) => {
  if (s === 'ENRICHED') return <Badge variant="success" className="text-2xs">Enriched</Badge>;
  if (s === 'PENDING') return <Badge variant="warning" className="text-2xs">Pending</Badge>;
  return <Badge variant="default" className="text-2xs">Not Enriched</Badge>;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState<Status>('ALL');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = mockLeads.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (search && !l.businessName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hotLeads = mockLeads.filter((l) => l.score >= 80).length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Leads</h1>
          <p className="text-sm text-text-secondary">
            {mockLeads.length} total · <span className="text-accent font-medium">{hotLeads} hot</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Zap className="h-3.5 w-3.5" /> Score All
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" /> Import
          </Button>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> New Lead
          </Button>
        </div>
      </motion.div>

      {/* Status tabs */}
      <motion.div variants={item} className="flex gap-1 flex-wrap">
        {statuses.map((s) => {
          const count = s === 'ALL' ? mockLeads.length : mockLeads.filter((l) => l.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-accent text-[#090909]'
                  : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A] border border-[#2A2A2A]'
              )}
            >
              {s} <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </motion.div>

      {/* Search + view toggle */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search businesses..."
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" size="icon" title="Filters">
          <Filter className="h-4 w-4" />
        </Button>
        <div className="flex rounded-lg border border-[#2A2A2A] overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={cn('p-2 transition-colors', view === 'list' ? 'bg-accent text-[#090909]' : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A]')}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('grid')}
            className={cn('p-2 transition-colors', view === 'grid' ? 'bg-accent text-[#090909]' : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A]')}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl p-3"
        >
          <span className="text-sm font-medium text-accent">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" size="sm">Assign Rep</Button>
            <Button variant="secondary" size="sm">Update Status</Button>
            <Button variant="danger" size="sm">Archive</Button>
          </div>
        </motion.div>
      )}

      {/* List view */}
      {view === 'list' && (
        <motion.div variants={item} className="glass-card overflow-x-auto">
          <table className="data-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="w-8"><input type="checkbox" className="rounded" onChange={(e) => {
                  if (e.target.checked) setSelected(new Set(filtered.map((l) => l.id)));
                  else setSelected(new Set());
                }} /></th>
                <th>Business</th>
                <th>Score</th>
                <th>Status</th>
                <th>Source</th>
                <th>Location</th>
                <th>Enrichment</th>
                <th>Rep</th>
                <th>Value</th>
                <th>Last Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const Icon = industryIcons[lead.industry] || Building2;
                return (
                  <tr key={lead.id} className={cn(selected.has(lead.id) && 'bg-accent/5')}>
                    <td><input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded" /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-text-secondary" />
                        </div>
                        <div>
                          <a href={`/leads/${lead.id}`} className="text-white font-medium text-sm hover:text-accent transition-colors">{lead.businessName}</a>
                          <p className="text-2xs text-text-tertiary">{lead.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border', getScoreBadgeClass(lead.score))}>
                        {lead.score >= 70 && <Zap className="h-2.5 w-2.5" />}
                        {lead.score}
                      </span>
                    </td>
                    <td>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getStatusBadgeClass(lead.status))}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="text-xs">{lead.source}</td>
                    <td className="text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-text-tertiary shrink-0" />
                        {lead.city}, {lead.state}
                      </div>
                    </td>
                    <td>{enrichmentBadge(lead.enrichment)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent text-2xs font-bold">
                          {lead.repName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-xs">{lead.repName.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="text-accent font-medium text-sm">{lead.dealValue > 0 ? formatCurrency(lead.dealValue) : '—'}</td>
                    <td className="text-xs">{timeAgo(lead.lastContact)}</td>
                    <td>
                      <button className="text-text-tertiary hover:text-white p-1 rounded-lg hover:bg-[#1A1A1A] transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((lead) => {
            const Icon = industryIcons[lead.industry] || Building2;
            return (
              <motion.div key={lead.id} variants={item}>
                <Card className="hover:border-[#3A3A3A] transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-text-secondary" />
                      </div>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border', getScoreBadgeClass(lead.score))}>
                        {lead.score >= 70 && <Zap className="h-2.5 w-2.5" />}
                        {lead.score}
                      </span>
                    </div>
                    <a href={`/leads/${lead.id}`} className="text-sm font-semibold text-white hover:text-accent transition-colors block mb-1 leading-tight">
                      {lead.businessName}
                    </a>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={cn('px-1.5 py-0.5 rounded text-2xs font-medium border', getStatusBadgeClass(lead.status))}>
                        {lead.status}
                      </span>
                    </div>
                    {lead.aiSuggestion && (
                      <p className="text-2xs text-text-tertiary leading-relaxed mb-2 line-clamp-2">{lead.aiSuggestion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-2xs text-text-secondary">
                        <MapPin className="h-3 w-3" />
                        {lead.city}
                      </div>
                      <span className="text-xs font-semibold text-accent">{lead.dealValue > 0 ? formatCurrency(lead.dealValue) : '—'}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      <motion.div variants={item} className="flex items-center justify-between py-2">
        <span className="text-sm text-text-secondary">Showing {filtered.length} of {mockLeads.length}</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((p) => (
            <button key={p} className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              p === 1 ? 'bg-accent text-[#090909]' : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A] border border-[#2A2A2A]'
            )}>{p}</button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
