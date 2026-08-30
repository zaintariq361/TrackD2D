'use client';

import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, Activity, DollarSign,
  CheckCircle, BarChart2, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, timeAgo, getActivityIcon } from '@/lib/utils';
import { cn } from '@/lib/utils';

const activityTrend = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  activities: Math.floor(Math.random() * 40 + 20),
  leads: Math.floor(Math.random() * 15 + 5),
}));

const pipelineData = [
  { name: 'New', value: 142, color: '#3B82F6' },
  { name: 'Contacted', value: 98, color: '#F5C518' },
  { name: 'Qualified', value: 67, color: '#10B981' },
  { name: 'Proposal', value: 43, color: '#F59E0B' },
  { name: 'Negotiation', value: 21, color: '#8B5CF6' },
  { name: 'Won', value: 34, color: '#059669' },
];

const topReps = [
  { name: 'Jordan Reed', activities: 87, conversions: 12, revenue: 48200, cvr: 13.8 },
  { name: 'Maya Chen', activities: 74, conversions: 11, revenue: 39800, cvr: 14.9 },
  { name: 'Tyler Brooks', activities: 68, conversions: 9, revenue: 31500, cvr: 13.2 },
  { name: 'Priya Sharma', activities: 61, conversions: 7, revenue: 27400, cvr: 11.5 },
  { name: 'Chris Navarro', activities: 55, conversions: 6, revenue: 22100, cvr: 10.9 },
];

const recentActivity = [
  { type: 'KNOCK', lead: 'Sunrise Coffee Roasters', rep: 'Jordan Reed', outcome: 'INTERESTED', time: '3 min ago' },
  { type: 'CALL', lead: 'Peak Performance Gym', rep: 'Maya Chen', outcome: 'CALLBACK', time: '12 min ago' },
  { type: 'EMAIL', lead: 'Harbor View Dental', rep: 'Tyler Brooks', outcome: 'RESPONDED', time: '28 min ago' },
  { type: 'MEETING', lead: 'Westside Auto Repair', rep: 'Priya Sharma', outcome: 'DEMO_SCHEDULED', time: '45 min ago' },
  { type: 'KNOCK', lead: 'Bloom Floral Studio', rep: 'Chris Navarro', outcome: 'NOT_INTERESTED', time: '1 hr ago' },
  { type: 'DEMO', lead: 'Summit Legal Group', rep: 'Jordan Reed', outcome: 'PROPOSAL_SENT', time: '2 hrs ago' },
  { type: 'CALL', lead: 'Ridgeline HVAC', rep: 'Maya Chen', outcome: 'WON', time: '3 hrs ago' },
  { type: 'KNOCK', lead: 'Bright Minds Tutoring', rep: 'Tyler Brooks', outcome: 'FOLLOW_UP', time: '4 hrs ago' },
];

const kpis = [
  { label: 'Total Leads', value: 1247, growth: 12.4, icon: Target, color: '#3B82F6' },
  { label: 'Activities Today', value: 234, growth: 8.7, icon: Activity, color: '#F5C518' },
  { label: 'Deals Won', value: 34, growth: 15.2, icon: CheckCircle, color: '#10B981' },
  { label: 'Total Revenue', value: 284700, growth: 22.1, icon: DollarSign, color: '#059669', isCurrency: true },
  { label: 'Conversion Rate', value: 13.4, growth: -2.1, icon: BarChart2, color: '#8B5CF6', isPercent: true },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const outcomeColors: Record<string, string> = {
  INTERESTED: 'success', CALLBACK: 'info', RESPONDED: 'accent', DEMO_SCHEDULED: 'warning',
  NOT_INTERESTED: 'default', PROPOSAL_SENT: 'warning', WON: 'success', FOLLOW_UP: 'info',
} as const;

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.growth > 0;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}18` }}>
                    <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-success' : 'text-danger')}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(kpi.growth)}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">
                  {kpi.isCurrency ? formatCurrency(kpi.value) : kpi.isPercent ? `${kpi.value}%` : formatNumber(kpi.value)}
                </div>
                <div className="text-xs text-text-secondary">{kpi.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Activity Trend — 14 Days</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityTrend}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5C518" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                <XAxis dataKey="day" stroke="#666" tick={{ fontSize: 11 }} />
                <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Area type="monotone" dataKey="activities" stroke="#F5C518" strokeWidth={2} fill="url(#actGrad)" name="Activities" />
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} fill="url(#leadGrad)" name="New Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Pie */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {pipelineData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pipelineData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-text-secondary">{d.name}</span>
                  </div>
                  <span className="text-white font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Reps */}
        <Card>
          <CardHeader>
            <CardTitle>Top Reps This Month</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {topReps.map((rep, idx) => (
                <div key={rep.name} className="flex items-center gap-3">
                  <div className="w-6 text-xs text-text-tertiary font-medium shrink-0">#{idx + 1}</div>
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                    {rep.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{rep.name}</span>
                      <span className="text-xs text-accent font-semibold">{formatCurrency(rep.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#1A1A1A] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(rep.activities / 100) * 100}%` }} />
                      </div>
                      <span className="text-2xs text-text-tertiary whitespace-nowrap">{rep.activities} acts · {rep.cvr}% CVR</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 py-1">
                  <span className="text-lg mt-0.5 shrink-0">{getActivityIcon(act.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{act.lead}</p>
                    <p className="text-xs text-text-tertiary">{act.rep} · {act.time}</p>
                  </div>
                  <Badge variant={outcomeColors[act.outcome] as 'success' | 'info' | 'accent' | 'warning' | 'default' || 'default'} className="shrink-0 text-2xs">
                    {act.outcome.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Score', value: '72', suffix: '/100', color: '#10B981' },
          { label: 'Enriched Leads', value: '847', suffix: '', color: '#F5C518' },
          { label: 'Active Reps', value: '12', suffix: ' online', color: '#3B82F6' },
          { label: 'Territories', value: '8', suffix: ' active', color: '#8B5CF6' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
              <div>
                <div className="text-lg font-bold text-white">{stat.value}<span className="text-sm font-normal text-text-secondary">{stat.suffix}</span></div>
                <div className="text-xs text-text-tertiary">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}
