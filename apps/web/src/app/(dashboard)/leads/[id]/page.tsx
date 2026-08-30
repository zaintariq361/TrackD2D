'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, MessageSquare, Zap, MapPin, Phone,
  Mail, Globe, Clock, Star, CheckCircle, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivityIcon, formatCurrency, timeAgo, getScoreColor, getScoreBadgeClass, getStatusBadgeClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockLead = {
  id: '1',
  businessName: 'Sunrise Coffee Roasters',
  industry: 'Food & Beverage',
  score: 87,
  status: 'QUALIFIED',
  source: 'Door Knock',
  dealValue: 8400,
  city: 'Austin', state: 'TX', zip: '78701',
  street: '1204 S Congress Ave',
  phone: '+1 (512) 555-0101',
  email: 'hello@sunrisecoffee.com',
  website: 'sunrisecoffee.com',
  ownerName: 'Maria Santos',
  ownerTitle: 'Founder & Owner',
  enrichment: 'ENRICHED',
  repName: 'Jordan Reed',
  repInitials: 'JR',
  lastContact: '2026-08-28',
  createdAt: '2026-08-10',
  googleRating: 4.8,
  googleReviews: 312,
  yearEstablished: 2018,
  employees: 12,
  revenue: '$1.2M',
  description: 'Artisan coffee roastery with 2 Austin locations. Specializes in single-origin beans and wholesale to local restaurants.',
};

const mockActivities = [
  { type: 'KNOCK', outcome: 'INTERESTED', notes: 'Met with Maria Santos (owner). Very interested in route analytics. Scheduled follow-up.', rep: 'Jordan Reed', repInitials: 'JR', time: '2026-08-28T10:30:00' },
  { type: 'CALL', outcome: 'RESPONDED', notes: 'Called to confirm interest. Maria asked about pricing for team of 5 reps.', rep: 'Jordan Reed', repInitials: 'JR', time: '2026-08-25T14:15:00' },
  { type: 'EMAIL', outcome: 'RESPONDED', notes: 'Sent ROI calculator PDF. Maria replied within 2 hours with questions about integration.', rep: 'Jordan Reed', repInitials: 'JR', time: '2026-08-22T09:00:00' },
  { type: 'KNOCK', outcome: 'FOLLOW_UP', notes: 'First visit. Met employee, Maria was not in. Left brochure and business card.', rep: 'Jordan Reed', repInitials: 'JR', time: '2026-08-15T11:00:00' },
];

const aiInsights = [
  { type: 'suggestion', icon: '💡', title: 'Best Contact Window', content: 'Maria Santos is typically available Tuesday-Thursday, 9am–11am. Avoid Monday mornings (receiving day) and Friday afternoons.', confidence: 92 },
  { type: 'prediction', icon: '🎯', title: 'Close Probability', content: 'Based on engagement signals, this lead has a 78% probability of closing within 14 days if proposal is sent by September 5.', confidence: 78 },
  { type: 'anomaly', icon: '⚡', title: 'Rising Interest Signal', content: 'Website traffic from this company domain spiked 340% in the last 48hrs, suggesting active research of your product.', confidence: 85 },
  { type: 'suggestion', icon: '🔑', title: 'Value Proposition', content: 'Emphasize territory analytics and route optimization. Maria mentioned efficiency as a top priority in previous conversations.', confidence: 89 },
];

const enrichmentData = {
  googlePlaces: {
    rating: 4.8, reviews: 312, category: 'Coffee Shop', priceLevel: '$$',
    hours: 'Mon–Fri 6am–6pm, Sat–Sun 7am–5pm', verified: true,
    photoCount: 48, recentActivity: 'New menu posted 2 weeks ago',
  },
  clearbit: {
    domain: 'sunrisecoffee.com', employees: 12, revenue: '$1.2M',
    techStack: ['Shopify', 'Square POS', 'Mailchimp'],
    socialProfiles: { instagram: '@sunrisecoffeeatx', facebook: 'SunriseCoffeeATX' },
  },
};

const tabs = ['Overview', 'Activities', 'AI Intelligence', 'Data Enrichment'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function LeadDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  const scoreColor = getScoreColor(mockLead.score);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-white">{mockLead.businessName}</h1>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border', getScoreBadgeClass(mockLead.score))}>
                <Zap className="h-3 w-3" />{mockLead.score}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getStatusBadgeClass(mockLead.status))}>
                {mockLead.status}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{mockLead.industry} · {mockLead.city}, {mockLead.state}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button size="sm">
            <MessageSquare className="h-3.5 w-3.5" /> Log Activity
          </Button>
        </div>
      </motion.div>

      {/* Main layout */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Tabs + content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab nav */}
          <div className="flex gap-1 border-b border-[#2A2A2A]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'text-accent border-accent'
                    : 'text-text-secondary border-transparent hover:text-white'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: MapPin, label: 'Address', value: `${mockLead.street}, ${mockLead.city}, ${mockLead.state} ${mockLead.zip}` },
                      { icon: Phone, label: 'Phone', value: mockLead.phone },
                      { icon: Mail, label: 'Email', value: mockLead.email },
                      { icon: Globe, label: 'Website', value: mockLead.website },
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.label} className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-2xs text-text-tertiary mb-0.5">{field.label}</p>
                            <p className="text-sm text-white">{field.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-text-secondary leading-relaxed">{mockLead.description}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                      <div className="text-lg font-bold text-white">{mockLead.employees}</div>
                      <div className="text-2xs text-text-tertiary">Employees</div>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                      <div className="text-lg font-bold text-accent">{mockLead.revenue}</div>
                      <div className="text-2xs text-text-tertiary">Est. Revenue</div>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                      <div className="text-lg font-bold text-white">{mockLead.yearEstablished}</div>
                      <div className="text-2xs text-text-tertiary">Est. Year</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deal Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Deal Value</p>
                      <p className="text-lg font-bold text-accent">{formatCurrency(mockLead.dealValue)}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Source</p>
                      <p className="text-sm text-white">{mockLead.source}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Owner</p>
                      <p className="text-sm text-white">{mockLead.ownerName}</p>
                      <p className="text-2xs text-text-tertiary">{mockLead.ownerTitle}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Created</p>
                      <p className="text-sm text-white">{timeAgo(mockLead.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activities */}
          {activeTab === 'Activities' && (
            <div className="space-y-3">
              {mockActivities.map((act, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5 shrink-0">{getActivityIcon(act.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{act.type}</span>
                          <Badge variant={act.outcome === 'INTERESTED' || act.outcome === 'RESPONDED' ? 'success' : act.outcome === 'FOLLOW_UP' ? 'info' : 'default'} className="text-2xs">
                            {act.outcome.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{act.notes}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent text-2xs font-bold">{act.repInitials}</div>
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
          )}

          {/* AI Intelligence */}
          {activeTab === 'AI Intelligence' && (
            <div className="space-y-4">
              <Card className="border-accent/30 shadow-premium">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <CardTitle>AI Sales Intelligence Report</CardTitle>
                    <Badge variant="accent" className="ml-auto text-2xs">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Sunrise Coffee Roasters is a high-priority lead with strong buying signals. The owner has demonstrated active interest through timely email responses and specific product questions. Revenue trajectory and tech stack suggest budget availability. Recommend sending formal proposal before Sep 5 to maximize close probability.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {aiInsights.map((insight, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{insight.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-white">{insight.title}</p>
                            <span className="text-xs font-medium text-text-tertiary">{insight.confidence}% confidence</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed mb-2">{insight.content}</p>
                          <div className="w-full bg-[#1A1A1A] rounded-full h-1">
                            <div
                              className="h-1 rounded-full bg-accent"
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Data Enrichment */}
          {activeTab === 'Data Enrichment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Enriched</Badge>
                  <span className="text-xs text-text-secondary">Last updated 2 days ago</span>
                </div>
                <Button variant="secondary" size="sm">
                  <RotateCcw className="h-3.5 w-3.5" /> Re-Enrich
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Google Places Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <span className="text-white font-bold">{enrichmentData.googlePlaces.rating}</span>
                        <span className="text-text-tertiary text-xs">({enrichmentData.googlePlaces.reviews} reviews)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Category</p>
                      <p className="text-sm text-white">{enrichmentData.googlePlaces.category}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Hours</p>
                      <p className="text-sm text-white">{enrichmentData.googlePlaces.hours}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Price Level</p>
                      <p className="text-sm text-white">{enrichmentData.googlePlaces.priceLevel}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-2xs text-text-tertiary mb-0.5">Recent Activity</p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                        <p className="text-sm text-white">{enrichmentData.googlePlaces.recentActivity}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clearbit Company Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Domain</p>
                      <p className="text-sm text-white font-mono">{enrichmentData.clearbit.domain}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Employees</p>
                      <p className="text-sm text-white">{enrichmentData.clearbit.employees}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Revenue</p>
                      <p className="text-sm text-accent font-medium">{enrichmentData.clearbit.revenue}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-text-tertiary mb-0.5">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {enrichmentData.clearbit.techStack.map((tech) => (
                          <span key={tech} className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-2xs text-text-secondary">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Score gauge */}
          <Card>
            <CardContent className="p-5">
              <div className="text-center mb-4">
                <div className="text-5xl font-black mb-1" style={{ color: scoreColor }}>{mockLead.score}</div>
                <div className="text-xs text-text-secondary">AI Lead Score</div>
              </div>
              <div className="w-full bg-[#1A1A1A] rounded-full h-2 mb-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${mockLead.score}%`, backgroundColor: scoreColor }} />
              </div>
              <div className="flex justify-between text-2xs text-text-tertiary">
                <span>0</span>
                <span className="text-success font-medium">High Intent (70+)</span>
                <span>100</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {[
                  { label: 'Door Knocks', value: 2, icon: '🚪' },
                  { label: 'Calls', value: 1, icon: '📞' },
                  { label: 'Emails', value: 1, icon: '📧' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span className="text-sm text-text-secondary">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assigned rep */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Assigned Rep</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold">
                  {mockLead.repInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{mockLead.repName}</p>
                  <p className="text-xs text-text-tertiary">Field Sales Rep</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-success" title="Active now" />
              </div>
            </CardContent>
          </Card>

          {/* Best time */}
          <Card className="border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-white">Best Time to Visit</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Tuesday–Thursday, 9am–11am. Owner Maria is most receptive in the morning before lunch rush.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
