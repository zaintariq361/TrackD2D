'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, Activity, DollarSign } from 'lucide-react';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';

const CHART_COLORS = ['#F5C518', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data.data),
    staleTime: 60_000,
  });

  const { data: repData } = useQuery({
    queryKey: ['rep-performance'],
    queryFn: () => api.get('/analytics/reps').then((r) => r.data.data),
    staleTime: 60_000,
  });

  const { data: funnelData } = useQuery({
    queryKey: ['funnel'],
    queryFn: () => api.get('/analytics/funnel').then((r) => r.data.data),
    staleTime: 60_000,
  });

  const kpis = dashData?.kpis;
  const dailyActivity = dashData?.dailyActivity ?? [];
  const leadsByStatus = dashData?.leadsByStatus ?? [];
  const topReps = dashData?.topReps ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Performance insights and trends</p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[#111111] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: kpis?.totalLeads, growth: kpis?.leadsGrowth, icon: Target, fmt: formatNumber },
            { label: 'Total Activities', value: kpis?.totalActivities, growth: kpis?.activitiesGrowth, icon: Activity, fmt: formatNumber },
            { label: 'Win Rate', value: kpis?.conversionRate, growth: null, icon: TrendingUp, fmt: (v: number) => `${v?.toFixed(1)}%` },
            { label: 'Active Reps', value: kpis?.activeReps, growth: null, icon: Users, fmt: formatNumber },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <kpi.icon className="w-4 h-4 text-[#F5C518]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{kpi.fmt(kpi.value ?? 0)}</p>
                  {kpi.growth != null && (
                    <div className={cn('flex items-center gap-1 text-xs mt-1', kpi.growth >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {kpi.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(kpi.growth).toFixed(1)}% vs last period
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily activity trend */}
        <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">14-Day Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyActivity}>
                <defs>
                  <linearGradient id="colActivities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="activities" stroke="#F5C518" strokeWidth={2} fill="url(#colActivities)" name="Activities" />
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} fill="none" name="New Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads by status */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leadsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {leadsByStatus.map((_: any, index: number) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rep performance */}
      {repData && repData.length > 0 && (
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Rep Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={repData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} />
                <Bar dataKey="totalActivities" name="Activities" fill="#F5C518" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closedWon" name="Won" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top reps table */}
      {topReps.length > 0 && (
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1A1A1A]">
              {topReps.map((rep: any, i: number) => (
                <div key={rep.id} className="flex items-center gap-4 px-6 py-3">
                  <span className="text-xs text-gray-600 w-5 text-right">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-semibold text-[#F5C518]">
                    {rep.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{rep.name}</p>
                    <p className="text-xs text-gray-500">{rep.totalActivities} activities</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">{rep.closedWon ?? 0} won</p>
                    <p className="text-xs text-gray-500">{rep.conversionRate?.toFixed(1) ?? 0}% CVR</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
