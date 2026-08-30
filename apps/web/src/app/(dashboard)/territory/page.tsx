'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Users, Target, TrendingUp, ZoomIn, ZoomOut, Layers, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getScoreColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

const territories = [
  {
    id: '1', name: 'Downtown Core', color: '#F5C518', leads: 234, won: 28,
    revenue: 124000, score: 87, reps: ['Jordan Reed', 'Maya Chen'],
    coords: { x: 50, y: 35 }, radius: 120,
    topLeads: [
      { name: 'Sunrise Coffee Roasters', score: 92, status: 'QUALIFIED', value: 8400 },
      { name: 'Harbor View Dental', score: 88, status: 'PROPOSAL', value: 12000 },
      { name: 'Summit Legal Group', score: 85, status: 'NEGOTIATION', value: 18500 },
    ],
  },
  {
    id: '2', name: 'Northside District', color: '#3B82F6', leads: 187, won: 19,
    revenue: 89000, score: 74, reps: ['Tyler Brooks'],
    coords: { x: 40, y: 20 }, radius: 100,
    topLeads: [
      { name: 'Peak Performance Gym', score: 79, status: 'CONTACTED', value: 6200 },
      { name: 'Bloom Floral Studio', score: 71, status: 'QUALIFIED', value: 4800 },
      { name: 'Bright Minds Tutoring', score: 68, status: 'NEW', value: 3400 },
    ],
  },
  {
    id: '3', name: 'Eastside Commercial', color: '#10B981', leads: 156, won: 14,
    revenue: 67000, score: 68, reps: ['Priya Sharma'],
    coords: { x: 70, y: 55 }, radius: 90,
    topLeads: [
      { name: 'Westside Auto Repair', score: 74, status: 'QUALIFIED', value: 9200 },
      { name: 'Ridgeline HVAC', score: 69, status: 'CONTACTED', value: 7100 },
      { name: 'Metro Print Works', score: 65, status: 'NEW', value: 3800 },
    ],
  },
  {
    id: '4', name: 'Westside Residential', color: '#8B5CF6', leads: 123, won: 9,
    revenue: 43000, score: 58, reps: ['Chris Navarro'],
    coords: { x: 25, y: 60 }, radius: 80,
    topLeads: [
      { name: 'GreenLeaf Landscaping', score: 64, status: 'CONTACTED', value: 5400 },
      { name: 'HomeFix Contractors', score: 59, status: 'NEW', value: 4100 },
      { name: 'Cozy Corner Bakery', score: 55, status: 'NEW', value: 2800 },
    ],
  },
];

const mockLeads = [
  { x: 48, y: 33, score: 92, name: 'Sunrise Coffee' },
  { x: 52, y: 37, score: 88, name: 'Harbor View' },
  { x: 46, y: 38, score: 85, name: 'Summit Legal' },
  { x: 39, y: 19, score: 79, name: 'Peak Gym' },
  { x: 42, y: 22, score: 71, name: 'Bloom Floral' },
  { x: 69, y: 53, score: 74, name: 'Westside Auto' },
  { x: 72, y: 57, score: 69, name: 'Ridgeline HVAC' },
  { x: 24, y: 59, score: 64, name: 'GreenLeaf' },
  { x: 27, y: 62, score: 59, name: 'HomeFix' },
  { x: 55, y: 42, score: 45, name: 'Corner Cafe' },
  { x: 35, y: 48, score: 38, name: 'Quick Lube' },
  { x: 63, y: 30, score: 82, name: 'City Spa' },
];

const mapStyles = ['dark', 'satellite', 'heatmap'] as const;

export default function TerritoryPage() {
  const [selectedTerritory, setSelectedTerritory] = useState<typeof territories[0] | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'heatmap'>('dark');
  const [zoom, setZoom] = useState(1);

  const getDotColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 45) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-0 -m-6 overflow-hidden">
      {/* Left: Territory List */}
      <div className="w-72 bg-[#111111] border-r border-[#2A2A2A] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h2 className="text-sm font-semibold text-white mb-3">Territories</h2>
          <div className="flex rounded-lg border border-[#2A2A2A] overflow-hidden text-xs">
            {mapStyles.map((s) => (
              <button
                key={s}
                onClick={() => setMapStyle(s)}
                className={cn(
                  'flex-1 py-1.5 font-medium capitalize transition-colors',
                  mapStyle === s ? 'bg-accent text-[#090909]' : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A]'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {territories.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTerritory(selectedTerritory?.id === t.id ? null : t)}
              className={cn(
                'w-full text-left p-3 rounded-xl border transition-all',
                selectedTerritory?.id === t.id
                  ? 'border-[color:var(--tc)] bg-[color:var(--tc)]/10'
                  : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
              )}
              style={{ '--tc': t.color } as React.CSSProperties}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-sm font-medium text-white">{t.name}</span>
                <ChevronRight className="h-3 w-3 text-text-tertiary ml-auto" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs font-bold text-white">{t.leads}</div>
                  <div className="text-2xs text-text-tertiary">Leads</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-success">{t.won}</div>
                  <div className="text-2xs text-text-tertiary">Won</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-accent">{t.score}</div>
                  <div className="text-2xs text-text-tertiary">Score</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {t.reps.map((rep) => (
                  <div key={rep} className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xs font-bold" title={rep}>
                    {rep.charAt(0)}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Map */}
      <div className="flex-1 relative bg-[#090909] overflow-hidden">
        {/* Map note */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#1A1A1A]/90 border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-text-secondary">
          Add <code className="text-accent">NEXT_PUBLIC_MAPBOX_TOKEN</code> for real maps
        </div>

        {/* Simulated map with grid */}
        <div
          className={cn(
            'absolute inset-0 bg-grid',
            mapStyle === 'satellite' && 'opacity-50',
            mapStyle === 'heatmap' && 'opacity-30'
          )}
          style={
            mapStyle === 'satellite'
              ? { background: 'linear-gradient(135deg, #0a1628 0%, #1a2a1a 50%, #1a1a2a 100%)' }
              : mapStyle === 'heatmap'
              ? { background: 'radial-gradient(ellipse at 50% 35%, rgba(245,197,24,0.2) 0%, transparent 60%), #090909' }
              : undefined
          }
        />

        {/* Territory overlays */}
        {territories.map((t) => (
          <div
            key={t.id}
            className="absolute rounded-full border-2 transition-all duration-300 cursor-pointer"
            style={{
              left: `${t.coords.x}%`,
              top: `${t.coords.y}%`,
              width: t.radius * zoom,
              height: t.radius * zoom,
              transform: 'translate(-50%, -50%)',
              borderColor: t.color,
              backgroundColor: `${t.color}15`,
              opacity: selectedTerritory && selectedTerritory.id !== t.id ? 0.4 : 1,
            }}
            onClick={() => setSelectedTerritory(selectedTerritory?.id === t.id ? null : t)}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-white drop-shadow-lg text-center px-2 leading-tight">{t.name}</span>
              <span className="text-2xs font-bold mt-0.5" style={{ color: t.color }}>{t.leads} leads</span>
            </div>
          </div>
        ))}

        {/* Lead dots */}
        {mockLeads.map((lead, idx) => (
          <div
            key={idx}
            className="absolute w-3 h-3 rounded-full border-2 border-[#090909] cursor-pointer transition-transform hover:scale-150 z-10"
            style={{
              left: `${lead.x}%`,
              top: `${lead.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: getDotColor(lead.score),
            }}
            title={`${lead.name} (Score: ${lead.score})`}
          />
        ))}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
            className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#222222] transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#222222] transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-[#111111]/90 border border-[#2A2A2A] rounded-lg p-3 z-10">
          <p className="text-2xs text-text-tertiary mb-2 font-medium uppercase tracking-wider">Lead Score</p>
          <div className="space-y-1.5">
            {[{ label: 'High (70+)', color: '#10B981' }, { label: 'Med (45-69)', color: '#F59E0B' }, { label: 'Low (<45)', color: '#EF4444' }].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-[#090909]" style={{ backgroundColor: l.color }} />
                <span className="text-2xs text-text-secondary">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Territory detail */}
      <AnimatePresence>
        {selectedTerritory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111111] border-l border-[#2A2A2A] flex flex-col overflow-hidden shrink-0"
          >
            <div className="p-5 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTerritory.color }} />
                <h2 className="text-sm font-bold text-white">{selectedTerritory.name}</h2>
              </div>
              <p className="text-xs text-text-secondary">Territory Intelligence</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Total Leads', value: selectedTerritory.leads, icon: Target },
                  { label: 'Deals Won', value: selectedTerritory.won, icon: TrendingUp },
                  { label: 'Revenue', value: formatCurrency(selectedTerritory.revenue), icon: TrendingUp },
                  { label: 'Avg Score', value: selectedTerritory.score, icon: Map },
                ].map((s) => (
                  <div key={s.label} className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-2xs text-text-tertiary">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Reps */}
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Assigned Reps</p>
                <div className="space-y-2">
                  {selectedTerritory.reps.map((rep) => (
                    <div key={rep} className="flex items-center gap-2 bg-[#1A1A1A] rounded-lg p-2 border border-[#2A2A2A]">
                      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">
                        {rep.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm text-white font-medium">{rep}</span>
                      <div className="ml-auto w-2 h-2 rounded-full bg-success" title="Active" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Leads */}
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Top Priority Leads</p>
                <div className="space-y-2">
                  {selectedTerritory.topLeads.map((lead) => (
                    <div key={lead.name} className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-white leading-tight">{lead.name}</p>
                        <span className="text-xs font-bold ml-2 shrink-0" style={{ color: getScoreColor(lead.score) }}>
                          {lead.score}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={lead.score >= 70 ? 'success' : 'default'} className="text-2xs">{lead.status}</Badge>
                        <span className="text-xs text-accent font-medium">{formatCurrency(lead.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
