'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Phone, Mail, Calendar, Target, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityIcon, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const todayStats = [
  { label: "Today's Knocks", value: 47, icon: Target, color: '#F5C518' },
  { label: 'Calls Made', value: 23, icon: Phone, color: '#3B82F6' },
  { label: 'Emails Sent', value: 18, icon: Mail, color: '#8B5CF6' },
  { label: 'Meetings Held', value: 4, icon: Calendar, color: '#10B981' },
];

const activities = [
  { id: '1', type: 'KNOCK', lead: 'Sunrise Coffee Roasters', rep: 'Jordan Reed', repInitials: 'JR', outcome: 'INTERESTED', notes: 'Met with owner Maria. Very interested in the territory analytics feature.', time: '2026-08-30T09:15:00', date: 'Today' },
  { id: '2', type: 'CALL', lead: 'Peak Performance Gym', rep: 'Maya Chen', repInitials: 'MC', outcome: 'CALLBACK', notes: 'Spoke with front desk. Manager James will call back Monday morning.', time: '2026-08-30T08:42:00', date: 'Today' },
  { id: '3', type: 'EMAIL', lead: 'Harbor View Dental', rep: 'Tyler Brooks', repInitials: 'TB', outcome: 'RESPONDED', notes: 'Sent follow-up proposal. Dr. Patel responded positively.', time: '2026-08-30T08:10:00', date: 'Today' },
  { id: '4', type: 'MEETING', lead: 'Westside Auto Repair', rep: 'Priya Sharma', repInitials: 'PS', outcome: 'DEMO_SCHEDULED', notes: 'Full demo scheduled for Wednesday at 2pm.', time: '2026-08-30T07:30:00', date: 'Today' },
  { id: '5', type: 'KNOCK', lead: 'Bloom Floral Studio', rep: 'Chris Navarro', repInitials: 'CN', outcome: 'NOT_INTERESTED', notes: 'Owner just signed with a competitor last month.', time: '2026-08-29T16:20:00', date: 'Yesterday' },
  { id: '6', type: 'DEMO', lead: 'Summit Legal Group', rep: 'Jordan Reed', repInitials: 'JR', outcome: 'PROPOSAL_SENT', notes: 'Excellent demo. All 4 partners in attendance. Sent $18,500 proposal.', time: '2026-08-29T14:00:00', date: 'Yesterday' },
  { id: '7', type: 'CALL', lead: 'Ridgeline HVAC', rep: 'Maya Chen', repInitials: 'MC', outcome: 'WON', notes: 'Verbal commitment received! Sending contract now.', time: '2026-08-29T11:30:00', date: 'Yesterday' },
  { id: '8', type: 'KNOCK', lead: 'Bright Minds Tutoring', rep: 'Tyler Brooks', repInitials: 'TB', outcome: 'FOLLOW_UP', notes: 'Director is interested but needs board approval. Following up next week.', time: '2026-08-29T10:15:00', date: 'Yesterday' },
  { id: '9', type: 'EMAIL', lead: 'City Spa & Wellness', rep: 'Jordan Reed', repInitials: 'JR', outcome: 'RESPONDED', notes: 'Sent ROI calculator. Owner shared with business partner.', time: '2026-08-29T09:00:00', date: 'Yesterday' },
  { id: '10', type: 'CALL', lead: 'Northgate Pharmacy', rep: 'Maya Chen', repInitials: 'MC', outcome: 'NO_ANSWER', notes: 'No answer. Left voicemail. Will try again tomorrow.', time: '2026-08-28T15:45:00', date: 'Aug 28' },
  { id: '11', type: 'MEETING', lead: 'Lakeside Chiropractic', rep: 'Jordan Reed', repInitials: 'JR', outcome: 'PROPOSAL_SENT', notes: 'In-person meeting. Very warm lead via referral from Harbor View Dental.', time: '2026-08-28T13:00:00', date: 'Aug 28' },
  { id: '12', type: 'KNOCK', lead: 'GreenLeaf Landscaping', rep: 'Chris Navarro', repInitials: 'CN', outcome: 'CALLBACK', notes: 'Owner was on a job site. Will call tonight.', time: '2026-08-28T11:20:00', date: 'Aug 28' },
  { id: '13', type: 'NOTE', lead: 'Metro Print Works', rep: 'Tyler Brooks', repInitials: 'TB', outcome: 'NOTE', notes: 'Added research notes: 4.8 Google rating, 3 employees, been in business 12 years.', time: '2026-08-27T16:00:00', date: 'Aug 27' },
  { id: '14', type: 'KNOCK', lead: 'Ironclad Fitness', rep: 'Tyler Brooks', repInitials: 'TB', outcome: 'INTERESTED', notes: 'Owner Kevin was very receptive. Wants a demo next week.', time: '2026-08-27T10:30:00', date: 'Aug 27' },
  { id: '15', type: 'CALL', lead: 'Summit Pediatrics', rep: 'Maya Chen', repInitials: 'MC', outcome: 'FOLLOW_UP', notes: 'Board meeting is Oct 1. Decision will be made then.', time: '2026-08-27T09:15:00', date: 'Aug 27' },
];

const outcomeColors: Record<string, 'success' | 'info' | 'accent' | 'warning' | 'danger' | 'default'> = {
  INTERESTED: 'success', CALLBACK: 'info', RESPONDED: 'accent', DEMO_SCHEDULED: 'warning',
  NOT_INTERESTED: 'danger', PROPOSAL_SENT: 'warning', WON: 'success', FOLLOW_UP: 'info',
  NO_ANSWER: 'default', NOTE: 'default',
};

const outcomeData = [
  { name: 'Interested', value: 4, color: '#10B981' },
  { name: 'Callback', value: 3, color: '#3B82F6' },
  { name: 'Proposal Sent', value: 2, color: '#F59E0B' },
  { name: 'Won', value: 1, color: '#059669' },
  { name: 'Follow Up', value: 3, color: '#8B5CF6' },
  { name: 'Not Interested', value: 1, color: '#EF4444' },
  { name: 'No Answer', value: 1, color: '#666666' },
];

const grouped = activities.reduce<Record<string, typeof activities>>((acc, act) => {
  if (!acc[act.date]) acc[act.date] = [];
  acc[act.date].push(act);
  return acc;
}, {});

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-white">Activity Log</h1>
        <p className="text-sm text-text-secondary">All field rep activities and outcomes</p>
      </motion.div>

      {/* Today stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {todayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-text-secondary">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Filters + chart */}
      <motion.div variants={item} className="flex gap-4">
        {/* Filters */}
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#111111] border border-[#2A2A2A] rounded-lg p-1">
            <Filter className="h-3.5 w-3.5 text-text-tertiary ml-1" />
            {['ALL', 'KNOCK', 'CALL', 'EMAIL', 'MEETING', 'DEMO'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  typeFilter === t ? 'bg-accent text-[#090909]' : 'text-text-secondary hover:text-white'
                )}
              >
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(grouped).map(([date, acts]) => {
            const filtered = acts.filter((a) => typeFilter === 'ALL' || a.type === typeFilter);
            if (filtered.length === 0) return null;
            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-[#2A2A2A]" />
                  <span className="text-xs font-medium text-text-tertiary px-2">{date}</span>
                  <div className="h-px flex-1 bg-[#2A2A2A]" />
                </div>
                <div className="space-y-2">
                  {filtered.map((act) => (
                    <Card key={act.id} className="hover:border-[#3A3A3A] transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl mt-0.5 shrink-0">{getActivityIcon(act.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div>
                                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{act.type}</span>
                                <p className="text-sm font-semibold text-white">{act.lead}</p>
                              </div>
                              <Badge variant={outcomeColors[act.outcome] || 'default'} className="shrink-0 text-2xs">
                                {act.outcome.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            {act.notes && <p className="text-xs text-text-secondary leading-relaxed">{act.notes}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent text-2xs font-bold">
                                  {act.repInitials}
                                </div>
                                <span className="text-xs text-text-tertiary">{act.rep}</span>
                              </div>
                              <span className="text-2xs text-text-tertiary">{timeAgo(act.time)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Outcome chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Outcome Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {outcomeData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {outcomeData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-text-secondary">{d.name}</span>
                    </div>
                    <span className="text-white font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
