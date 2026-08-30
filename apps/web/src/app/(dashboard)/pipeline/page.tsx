'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, BarChart2, Zap } from 'lucide-react';
import { formatCurrency, getScoreBadgeClass, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const stages = [
  { key: 'PROSPECTING', label: 'Prospecting', color: '#3B82F6' },
  { key: 'QUALIFICATION', label: 'Qualification', color: '#F5C518' },
  { key: 'NEEDS_ANALYSIS', label: 'Needs Analysis', color: '#8B5CF6' },
  { key: 'PROPOSAL', label: 'Proposal', color: '#F59E0B' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: '#EF4444' },
  { key: 'WON', label: 'Won', color: '#10B981' },
  { key: 'LOST', label: 'Lost', color: '#666666' },
];

const mockDeals = [
  { id: '1', name: 'Sunrise Coffee Roasters', value: 8400, score: 92, stage: 'PROPOSAL', rep: 'JR', company: 'Food & Bev', daysInStage: 3 },
  { id: '2', name: 'Harbor View Dental', value: 12000, score: 88, stage: 'PROPOSAL', rep: 'JR', company: 'Healthcare', daysInStage: 5 },
  { id: '3', name: 'Summit Legal Group', value: 18500, score: 85, stage: 'NEGOTIATION', rep: 'JR', company: 'Legal', daysInStage: 7 },
  { id: '4', name: 'Peak Performance Gym', value: 6200, score: 79, stage: 'QUALIFICATION', rep: 'MC', company: 'Fitness', daysInStage: 2 },
  { id: '5', name: 'Westside Auto Repair', value: 9200, score: 74, stage: 'NEEDS_ANALYSIS', rep: 'PS', company: 'Automotive', daysInStage: 4 },
  { id: '6', name: 'Bloom Floral Studio', value: 4800, score: 71, stage: 'NEEDS_ANALYSIS', rep: 'MC', company: 'Retail', daysInStage: 1 },
  { id: '7', name: 'Bright Minds Tutoring', value: 3400, score: 68, stage: 'PROSPECTING', rep: 'TB', company: 'Education', daysInStage: 0 },
  { id: '8', name: 'Ridgeline HVAC', value: 7100, score: 65, stage: 'QUALIFICATION', rep: 'MC', company: 'Services', daysInStage: 3 },
  { id: '9', name: 'Metro Print Works', value: 3800, score: 62, stage: 'PROSPECTING', rep: 'TB', company: 'Printing', daysInStage: 1 },
  { id: '10', name: 'GreenLeaf Landscaping', value: 5400, score: 59, stage: 'QUALIFICATION', rep: 'CN', company: 'Landscaping', daysInStage: 6 },
  { id: '11', name: 'City Spa & Wellness', value: 11000, score: 82, stage: 'NEEDS_ANALYSIS', rep: 'JR', company: 'Wellness', daysInStage: 2 },
  { id: '12', name: 'Northgate Pharmacy', value: 8900, score: 76, stage: 'PROPOSAL', rep: 'MC', company: 'Healthcare', daysInStage: 8 },
  { id: '13', name: 'Prestige Law Offices', value: 24000, score: 90, stage: 'WON', rep: 'JR', company: 'Legal', daysInStage: 0 },
  { id: '14', name: 'Lakeside Chiropractic', value: 10200, score: 81, stage: 'NEGOTIATION', rep: 'JR', company: 'Healthcare', daysInStage: 4 },
  { id: '15', name: 'Summit Pediatrics', value: 15500, score: 87, stage: 'PROPOSAL', rep: 'MC', company: 'Healthcare', daysInStage: 6 },
  { id: '16', name: 'Ironclad Fitness', value: 5600, score: 66, stage: 'PROSPECTING', rep: 'TB', company: 'Fitness', daysInStage: 2 },
  { id: '17', name: 'RoofRight Pro', value: 0, score: 43, stage: 'LOST', rep: 'CN', company: 'Construction', daysInStage: 0 },
  { id: '18', name: 'Quick Kuts Barbershop', value: 2200, score: 52, stage: 'QUALIFICATION', rep: 'CN', company: 'Salon', daysInStage: 5 },
  { id: '19', name: 'HomeFix Contractors', value: 4100, score: 57, stage: 'PROSPECTING', rep: 'CN', company: 'Construction', daysInStage: 3 },
  { id: '20', name: 'Cozy Corner Bakery', value: 2800, score: 48, stage: 'PROSPECTING', rep: 'CN', company: 'Food & Bev', daysInStage: 1 },
];

const totalValue = mockDeals.filter((d) => d.stage !== 'LOST').reduce((sum, d) => sum + d.value, 0);
const wonDeals = mockDeals.filter((d) => d.stage === 'WON').length;
const winRate = Math.round((wonDeals / mockDeals.filter((d) => ['WON', 'LOST'].includes(d.stage)).length) * 100);

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function PipelinePage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Pipeline</h1>
          <p className="text-sm text-text-secondary">Visual deal board across all stages</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="text-white font-semibold">{formatCurrency(totalValue)}</span>
            <span className="text-text-secondary">pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-white font-semibold">{winRate}%</span>
            <span className="text-text-secondary">win rate</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-info" />
            <span className="text-white font-semibold">{mockDeals.length}</span>
            <span className="text-text-secondary">deals</span>
          </div>
        </div>
      </motion.div>

      {/* Kanban board */}
      <motion.div variants={item} className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {stages.map((stage) => {
          const deals = mockDeals.filter((d) => d.stage === stage.key);
          const stageTotal = deals.reduce((sum, d) => sum + d.value, 0);
          const isWon = stage.key === 'WON';
          const isLost = stage.key === 'LOST';

          return (
            <div
              key={stage.key}
              className={cn(
                'shrink-0 w-60 rounded-xl border flex flex-col',
                isWon ? 'border-success/30 bg-success/5' : isLost ? 'border-danger/10 bg-danger/5' : 'border-[#2A2A2A] bg-[#111111]'
              )}
            >
              {/* Column header */}
              <div className="p-3 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-semibold text-white">{stage.label}</span>
                  <span className="ml-auto text-xs text-text-tertiary bg-[#1A1A1A] px-1.5 py-0.5 rounded-full">{deals.length}</span>
                </div>
                {stageTotal > 0 && (
                  <p className="text-xs font-medium" style={{ color: stage.color }}>{formatCurrency(stageTotal)}</p>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-280px)] no-scrollbar">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className={cn(
                      'rounded-xl border p-3 cursor-pointer transition-all hover:border-[#3A3A3A]',
                      isWon ? 'bg-success/10 border-success/20' : isLost ? 'bg-danger/5 border-danger/10 opacity-60' : 'bg-[#1A1A1A] border-[#2A2A2A]'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-semibold text-white leading-tight pr-2">{deal.name}</p>
                      <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-bold border shrink-0', getScoreBadgeClass(deal.score))}>
                        {deal.score >= 70 && <Zap className="h-2 w-2" />}
                        {deal.score}
                      </span>
                    </div>
                    {deal.value > 0 && (
                      <p className="text-sm font-bold" style={{ color: isWon ? '#10B981' : '#F5C518' }}>{formatCurrency(deal.value)}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xs font-bold">
                        {deal.rep}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xs text-text-tertiary">{deal.company}</span>
                        {deal.daysInStage > 0 && (
                          <span className={cn('text-2xs px-1 rounded', deal.daysInStage > 6 ? 'text-danger bg-danger/10' : 'text-text-tertiary')}>
                            {deal.daysInStage}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {deals.length === 0 && (
                  <div className="text-center py-6 text-2xs text-text-tertiary">No deals</div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
