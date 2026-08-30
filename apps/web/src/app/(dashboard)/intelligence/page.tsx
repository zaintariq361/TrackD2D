'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Brain, Zap, TrendingUp, Target, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, getScoreBadgeClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

const scoreDistribution = [
  { range: '0-10', count: 8, fill: '#EF4444' },
  { range: '11-20', count: 12, fill: '#EF4444' },
  { range: '21-30', count: 24, fill: '#EF4444' },
  { range: '31-40', count: 38, fill: '#F59E0B' },
  { range: '41-50', count: 62, fill: '#F59E0B' },
  { range: '51-60', count: 87, fill: '#F59E0B' },
  { range: '61-70', count: 124, fill: '#F5C518' },
  { range: '71-80', count: 156, fill: '#10B981' },
  { range: '81-90', count: 98, fill: '#10B981' },
  { range: '91-100', count: 34, fill: '#059669' },
];

const knockSuggestions = [
  { id: '1', businessName: 'City Spa & Wellness', score: 82, type: 'Wellness', suggestion: 'Decision maker available today', bestTime: 'Today 2pm', value: 11000 },
  { id: '2', businessName: 'Lakeside Chiropractic', score: 81, type: 'Healthcare', suggestion: 'Referral from warm contact', bestTime: 'Thu 10am', value: 10200 },
  { id: '3', businessName: 'Summit Pediatrics', score: 87, type: 'Healthcare', suggestion: 'Awaiting proposal response', bestTime: 'Today 3pm', value: 15500 },
  { id: '4', businessName: 'Northgate Pharmacy', score: 76, type: 'Healthcare', suggestion: 'Website visit spike detected', bestTime: 'Wed 11am', value: 8900 },
  { id: '5', businessName: 'Harbor View Dental', score: 88, type: 'Healthcare', suggestion: 'Follow up on proposal sent', bestTime: 'Tomorrow 9am', value: 12000 },
  { id: '6', businessName: 'Peak Performance Gym', score: 79, type: 'Fitness', suggestion: 'Manager callback due today', bestTime: 'Today 4pm', value: 6200 },
  { id: '7', businessName: 'Ironclad Fitness', score: 66, type: 'Fitness', suggestion: 'New location opening soon', bestTime: 'Fri 10am', value: 5600 },
  { id: '8', businessName: 'Metro Print Works', score: 62, type: 'Printing', suggestion: 'Contract renewal window open', bestTime: 'Thu 2pm', value: 3800 },
  { id: '9', businessName: 'Westside Auto Repair', score: 74, type: 'Automotive', suggestion: 'Owner was unavailable last visit', bestTime: 'Wed 9am', value: 9200 },
  { id: '10', businessName: 'GreenLeaf Landscaping', score: 59, type: 'Landscaping', suggestion: 'Busy season starting soon', bestTime: 'Fri 8am', value: 5400 },
];

const aiInsightsFeed = [
  { type: 'prediction', icon: '🎯', title: 'High Close Probability Cluster', content: 'Three Healthcare leads (Harbor View, Lakeside, Summit Pediatrics) show similar buying signals. A coordinated push this week could yield $37.7K in closed deals.', confidence: 84, lead: 'Multiple' },
  { type: 'anomaly', icon: '⚡', title: 'Engagement Spike Detected', content: 'Northgate Pharmacy visited your website 8 times in 24 hours. High intent signal — reach out immediately.', confidence: 91, lead: 'Northgate Pharmacy' },
  { type: 'suggestion', icon: '💡', title: 'Optimal Territory Route', content: 'Tuesday morning: Summit Legal → Harbor View Dental → City Spa saves 42 minutes vs. current route plan.', confidence: 88, lead: 'Jordan Reed' },
  { type: 'prediction', icon: '📈', title: 'Seasonal Opportunity Window', content: 'Food & Beverage leads historically convert 34% higher in September. Prioritize Sunrise Coffee and Cozy Corner Bakery now.', confidence: 76, lead: 'Seasonal' },
  { type: 'anomaly', icon: '🔔', title: 'Stale Lead Alert', content: '7 leads have had no activity in 14+ days. Risk of going cold. Auto-schedule follow-up calls?', confidence: 95, lead: 'Multiple' },
];

const repIntelligence = [
  { name: 'Jordan Reed', bestTerritory: 'Downtown Core', avgScore: 87, conversion: 13.8, color: '#F5C518' },
  { name: 'Maya Chen', bestTerritory: 'Northside + Healthcare', avgScore: 82, conversion: 14.9, color: '#10B981' },
  { name: 'Tyler Brooks', bestTerritory: 'Eastside Commercial', avgScore: 74, conversion: 13.2, color: '#3B82F6' },
  { name: 'Priya Sharma', bestTerritory: 'Westside Residential', avgScore: 71, conversion: 11.5, color: '#8B5CF6' },
  { name: 'Chris Navarro', bestTerritory: 'Outer Suburbs', avgScore: 68, conversion: 10.9, color: '#F59E0B' },
];

const recentLeads = [
  { name: 'Summit Pediatrics', score: 87, enrichment: 'ENRICHED', addedAgo: '2 hours ago' },
  { name: 'Ironclad Fitness', score: 66, enrichment: 'PENDING', addedAgo: '4 hours ago' },
  { name: 'HomeFix Contractors', score: 57, enrichment: 'NOT_ENRICHED', addedAgo: '6 hours ago' },
  { name: 'Quick Kuts Barbershop', score: 52, enrichment: 'NOT_ENRICHED', addedAgo: '8 hours ago' },
  { name: 'Cozy Corner Bakery', score: 48, enrichment: 'NOT_ENRICHED', addedAgo: '1 day ago' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function IntelligencePage() {
  const totalLeads = scoreDistribution.reduce((s, d) => s + d.count, 0);
  const enrichedCount = 847;
  const pendingCount = 124;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">AI Intelligence Hub</h1>
            <Badge variant="accent" className="gap-1"><Brain className="h-3 w-3" /> Powered by AI</Badge>
          </div>
          <p className="text-sm text-text-secondary">Real-time lead scoring, insights, and smart suggestions</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:border-[#3A3A3A] transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </motion.div>

      {/* Score distribution + processing stats */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Score Distribution ({totalLeads} Leads)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#111111', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {scoreDistribution.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>AI Processing Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {[
              { label: 'Enriched', value: enrichedCount, total: totalLeads, color: '#10B981' },
              { label: 'Pending', value: pendingCount, total: totalLeads, color: '#F59E0B' },
              { label: 'Total Scored', value: totalLeads, total: totalLeads, color: '#F5C518' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{s.label}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="w-full bg-[#1A1A1A] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${(s.value / s.total) * 100}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[#2A2A2A]">
              <p className="text-xs text-text-secondary">Avg score: <span className="text-white font-bold">72</span> / 100</p>
              <p className="text-2xs text-text-tertiary mt-0.5">Last scored: 2 hours ago</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Knock Suggestions */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" /> Smart Knock Suggestions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {knockSuggestions.map((lead) => (
            <Card key={lead.id} className="hover:border-accent/30 transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-bold border', getScoreBadgeClass(lead.score))}>
                    <Zap className="h-2 w-2" />{lead.score}
                  </span>
                  <span className="text-2xs text-text-tertiary">{lead.type}</span>
                </div>
                <p className="text-xs font-semibold text-white leading-tight mb-1">{lead.businessName}</p>
                <p className="text-2xs text-text-secondary leading-relaxed mb-2">{lead.suggestion}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-accent" />
                    <span className="text-2xs text-accent font-medium">{lead.bestTime}</span>
                  </div>
                  <span className="text-2xs text-text-tertiary">{formatCurrency(lead.value)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* AI Insights + Rep Intelligence */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Insights Feed */}
        <div>
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" /> AI Insights Feed
          </h2>
          <div className="space-y-3">
            {aiInsightsFeed.map((insight, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{insight.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{insight.title}</p>
                        <span className="text-2xs text-text-tertiary ml-2 shrink-0">{insight.confidence}%</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed mb-2">{insight.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs text-text-tertiary">{insight.lead}</span>
                        <div className="w-20 bg-[#1A1A1A] rounded-full h-1">
                          <div className="h-1 rounded-full bg-accent" style={{ width: `${insight.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rep Intelligence + Auto Feed */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Rep Intelligence
            </h2>
            <Card>
              <CardContent className="pt-4 p-0">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>Rep</th>
                      <th>Best Territory</th>
                      <th>Avg Score</th>
                      <th>CVR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repIntelligence.map((rep) => (
                      <tr key={rep.name}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold" style={{ backgroundColor: `${rep.color}20`, color: rep.color }}>
                              {rep.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-white text-xs font-medium">{rep.name.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="text-xs">{rep.bestTerritory}</td>
                        <td>
                          <span className="text-xs font-bold" style={{ color: rep.color }}>{rep.avgScore}</span>
                        </td>
                        <td className="text-xs text-success font-medium">{rep.conversion}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-3">Auto Lead Feed</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {recentLeads.map((lead, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-bold border w-10 justify-center shrink-0', getScoreBadgeClass(lead.score))}>
                        {lead.score}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{lead.name}</p>
                        <p className="text-2xs text-text-tertiary">{lead.addedAgo}</p>
                      </div>
                      <Badge variant={lead.enrichment === 'ENRICHED' ? 'success' : lead.enrichment === 'PENDING' ? 'warning' : 'default'} className="text-2xs shrink-0">
                        {lead.enrichment === 'ENRICHED' ? 'Enriched' : lead.enrichment === 'PENDING' ? 'Pending' : 'Raw'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
