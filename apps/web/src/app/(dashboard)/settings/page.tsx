'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Users, Puzzle, Key, Webhook, CreditCard,
  CheckCircle, XCircle, Globe, Copy, Trash2, Plus, Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'integrations', label: 'Integrations', icon: Puzzle },
  { key: 'api-keys', label: 'API Keys', icon: Key },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'billing', label: 'Billing', icon: CreditCard },
];

const integrations = [
  { name: 'Clearbit', emoji: '🔍', desc: 'Company data enrichment and firmographics', connected: true },
  { name: 'Hunter.io', emoji: '🎯', desc: 'Email finder and verifier', connected: true },
  { name: 'Apollo.io', emoji: '🚀', desc: 'B2B contact and company database', connected: false },
  { name: 'Google Maps', emoji: '🗺️', desc: 'Territory visualization and routing', connected: true },
  { name: 'Google Places', emoji: '📍', desc: 'Business data from Google Places API', connected: true },
  { name: 'Twilio', emoji: '📱', desc: 'SMS and voice communications', connected: false },
  { name: 'SendGrid', emoji: '✉️', desc: 'Transactional email delivery', connected: true },
  { name: 'OpenAI', emoji: '🤖', desc: 'AI scoring and insights generation', connected: true },
  { name: 'Mapbox', emoji: '🗾', desc: 'Advanced interactive maps', connected: false },
];

const teamMembers = [
  { name: 'Jordan Reed', email: 'jordan@democorp.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-08-30' },
  { name: 'Maya Chen', email: 'maya@democorp.com', role: 'REP', status: 'ACTIVE', lastLogin: '2026-08-30' },
  { name: 'Tyler Brooks', email: 'tyler@democorp.com', role: 'REP', status: 'ACTIVE', lastLogin: '2026-08-29' },
  { name: 'Priya Sharma', email: 'priya@democorp.com', role: 'REP', status: 'ACTIVE', lastLogin: '2026-08-28' },
  { name: 'Chris Navarro', email: 'chris@democorp.com', role: 'REP', status: 'INACTIVE', lastLogin: '2026-08-20' },
];

const apiKeys = [
  { id: '1', preview: 'sk_live_', provider: 'Clearbit', usageCount: 4821, lastUsed: '2 hours ago' },
  { id: '2', preview: 'AIzaSyC7', provider: 'Google Maps', usageCount: 12340, lastUsed: '5 min ago' },
  { id: '3', preview: 'hunter_', provider: 'Hunter.io', usageCount: 1234, lastUsed: '1 day ago' },
  { id: '4', preview: 'SG.xyz_', provider: 'SendGrid', usageCount: 892, lastUsed: '3 hours ago' },
  { id: '5', preview: 'sk-proj-', provider: 'OpenAI', usageCount: 5621, lastUsed: '1 hour ago' },
];

const webhooks = [
  { url: 'https://app.example.com/hooks/trackd2d', events: ['lead.created', 'lead.won'], status: 'ACTIVE', delivered: 1420, failed: 3 },
  { url: 'https://zapier.com/hooks/catch/xxx/yyy/', events: ['activity.created', 'lead.updated'], status: 'ACTIVE', delivered: 872, failed: 0 },
  { url: 'https://api.slack.com/incoming/T01...', events: ['lead.won', 'deal.closed'], status: 'PAUSED', delivered: 234, failed: 12 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [orgName, setOrgName] = useState('Demo Corp');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('REP');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-5xl">
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your organization and preferences</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-5">
        {/* Tab sidebar */}
        <div className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'nav-item w-full',
                    activeTab === tab.key && 'active'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 space-y-4">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>Update your organization details</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Organization Name</label>
                    <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="max-w-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Logo</label>
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#2A2A2A] flex flex-col items-center justify-center text-text-tertiary hover:border-accent/50 hover:text-accent transition-colors cursor-pointer">
                      <Globe className="h-6 w-6 mb-1" />
                      <span className="text-2xs">Upload</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-sm">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Timezone</label>
                      <select className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/30">
                        <option>America/Chicago</option>
                        <option>America/New_York</option>
                        <option>America/Los_Angeles</option>
                        <option>America/Denver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Currency</label>
                      <select className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/30">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>CAD</option>
                      </select>
                    </div>
                  </div>
                  <Button size="sm">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>{teamMembers.length} members in your organization</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member.email}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                                {member.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <span className="text-white text-sm font-medium">{member.name}</span>
                            </div>
                          </td>
                          <td className="text-xs font-mono">{member.email}</td>
                          <td>
                            <Badge variant={member.role === 'ADMIN' ? 'accent' : 'default'} className="text-2xs">{member.role}</Badge>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <div className={cn('w-1.5 h-1.5 rounded-full', member.status === 'ACTIVE' ? 'bg-success' : 'bg-text-tertiary')} />
                              <span className="text-xs">{member.status}</span>
                            </div>
                          </td>
                          <td className="text-xs">{member.lastLogin}</td>
                          <td>
                            <button className="text-text-tertiary hover:text-danger transition-colors p-1 rounded hover:bg-danger/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invite Team Member</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address</label>
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        icon={<Mail className="h-4 w-4" />}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="h-10 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                      >
                        <option value="REP">Sales Rep</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <Button size="default">
                      <Plus className="h-4 w-4" /> Send Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {integrations.map((int) => (
                <Card key={int.name} className={cn(int.connected && 'border-success/20')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{int.emoji}</span>
                      {int.connected ? (
                        <div className="flex items-center gap-1 text-success text-xs font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Connected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-text-tertiary text-xs font-medium">
                          <XCircle className="h-3.5 w-3.5" /> Not Connected
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{int.name}</p>
                    <p className="text-xs text-text-secondary leading-relaxed mb-3">{int.desc}</p>
                    <Button variant={int.connected ? 'secondary' : 'outline'} size="sm" className="w-full">
                      {int.connected ? 'Configure' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* API KEYS */}
          {activeTab === 'api-keys' && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage your third-party API credentials</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-3.5 w-3.5" /> Add Key
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Key Preview</th>
                        <th>Provider</th>
                        <th>Usage</th>
                        <th>Last Used</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-text-secondary font-mono bg-[#1A1A1A] px-2 py-0.5 rounded">
                                {key.preview}••••••••
                              </code>
                              <button className="text-text-tertiary hover:text-white transition-colors">
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="text-sm font-medium text-white">{key.provider}</td>
                          <td className="text-xs">{key.usageCount.toLocaleString()} calls</td>
                          <td className="text-xs">{key.lastUsed}</td>
                          <td>
                            <button className="text-text-tertiary hover:text-danger transition-colors p-1 rounded hover:bg-danger/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Receive real-time event notifications</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="h-3.5 w-3.5" /> Add Webhook
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {webhooks.map((wh, idx) => (
                      <div key={idx} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <code className="text-xs text-accent font-mono break-all">{wh.url}</code>
                          <Badge variant={wh.status === 'ACTIVE' ? 'success' : 'default'} className="shrink-0 text-2xs">{wh.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {wh.events.map((ev) => (
                            <span key={ev} className="px-1.5 py-0.5 bg-[#090909] border border-[#2A2A2A] rounded text-2xs text-text-secondary font-mono">{ev}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-tertiary">
                          <span className="text-success">{wh.delivered} delivered</span>
                          {wh.failed > 0 && <span className="text-danger">{wh.failed} failed</span>}
                          <button className="text-text-tertiary hover:text-danger transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <Card className="border-accent/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="accent" className="mb-3">Pro Plan</Badge>
                      <h3 className="text-2xl font-black text-white mb-1">$149 <span className="text-base font-normal text-text-secondary">/month</span></h3>
                      <p className="text-sm text-text-secondary">Up to 15 users · Unlimited leads · AI scoring</p>
                    </div>
                    <Button variant="secondary" size="sm">Manage Plan</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Leads Used', value: '1,247', limit: '∞', color: '#F5C518' },
                  { label: 'Active Users', value: '5', limit: '15', color: '#10B981' },
                  { label: 'API Calls (mo)', value: '24,850', limit: '100,000', color: '#3B82F6' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <div className="text-lg font-bold text-white">{stat.value}<span className="text-sm font-normal text-text-tertiary"> / {stat.limit}</span></div>
                      <div className="text-xs text-text-secondary mt-0.5">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="text-base font-bold text-white mb-2">Ready for Enterprise?</h3>
                  <p className="text-sm text-text-secondary mb-4">Unlimited users, custom integrations, dedicated support, and SLA guarantee.</p>
                  <Button>Contact Sales</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
