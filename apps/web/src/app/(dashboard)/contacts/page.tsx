'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockContacts = [
  { id: '1', firstName: 'Maria', lastName: 'Santos', title: 'Owner', company: 'Sunrise Coffee Roasters', email: 'maria@sunrisecoffee.com', phone: '+1 (512) 555-0101', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '2', firstName: 'Dr. James', lastName: 'Patel', title: 'Practice Owner', company: 'Harbor View Dental', email: 'james@harborviewdental.com', phone: '+1 (512) 555-0102', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '3', firstName: 'Robert', lastName: 'Chen', title: 'Managing Partner', company: 'Summit Legal Group', email: 'rchen@summitlegal.com', phone: '+1 (512) 555-0103', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '4', firstName: 'James', lastName: 'Williams', title: 'General Manager', company: 'Peak Performance Gym', email: 'james@peakperformance.com', phone: '+1 (512) 555-0104', isDecisionMaker: false, enrichment: 'ENRICHED', linkedin: false },
  { id: '5', firstName: 'Mike', lastName: 'Torres', title: 'Owner', company: 'Westside Auto Repair', email: 'mike@westsideauto.com', phone: '+1 (512) 555-0105', isDecisionMaker: true, enrichment: 'PENDING', linkedin: false },
  { id: '6', firstName: 'Sophie', lastName: 'Laurent', title: 'Owner', company: 'Bloom Floral Studio', email: 'sophie@bloomfloral.com', phone: '+1 (512) 555-0106', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '7', firstName: 'Kevin', lastName: 'Park', title: 'CEO', company: 'Ridgeline HVAC', email: 'kevin@ridgelinehvac.com', phone: '+1 (512) 555-0107', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '8', firstName: 'Aisha', lastName: 'Johnson', title: 'Director', company: 'City Spa & Wellness', email: 'aisha@cityspa.com', phone: '+1 (512) 555-0108', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '9', firstName: 'Carlos', lastName: 'Rivera', title: 'Owner', company: 'GreenLeaf Landscaping', email: 'carlos@greenleaf.com', phone: '+1 (512) 555-0109', isDecisionMaker: true, enrichment: 'NOT_ENRICHED', linkedin: false },
  { id: '10', firstName: 'Emily', lastName: 'Zhang', title: 'Operations Manager', company: 'Metro Print Works', email: 'emily@metroprint.com', phone: '+1 (512) 555-0110', isDecisionMaker: false, enrichment: 'PENDING', linkedin: false },
  { id: '11', firstName: 'Dr. Sarah', lastName: 'Kim', title: 'Chiropractor / Owner', company: 'Lakeside Chiropractic', email: 'sarah@lakesidechiro.com', phone: '+1 (512) 555-0111', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '12', firstName: 'David', lastName: 'Hoffman', title: 'Senior Partner', company: 'Prestige Law Offices', email: 'dhoffman@prestigelaw.com', phone: '+1 (512) 555-0112', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '13', firstName: 'Lisa', lastName: 'Nakamura', title: 'Practice Manager', company: 'Harbor View Dental', email: 'lisa@harborviewdental.com', phone: '+1 (512) 555-0113', isDecisionMaker: false, enrichment: 'ENRICHED', linkedin: false },
  { id: '14', firstName: 'Tom', lastName: 'Bradley', title: 'Owner', company: 'Peak Performance Gym', email: 'tom@peakperformance.com', phone: '+1 (512) 555-0114', isDecisionMaker: true, enrichment: 'ENRICHED', linkedin: true },
  { id: '15', firstName: 'Nina', lastName: 'Vasquez', title: 'Store Manager', company: 'Cozy Corner Bakery', email: 'nina@cozycorner.com', phone: '+1 (512) 555-0115', isDecisionMaker: false, enrichment: 'NOT_ENRICHED', linkedin: false },
];

const enrichmentBadge = (s: string) => {
  if (s === 'ENRICHED') return <Badge variant="success" className="text-2xs">Enriched</Badge>;
  if (s === 'PENDING') return <Badge variant="warning" className="text-2xs">Pending</Badge>;
  return <Badge variant="default" className="text-2xs">Not Enriched</Badge>;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');

  const companies = ['All', ...Array.from(new Set(mockContacts.map((c) => c.company))).slice(0, 5)];

  const filtered = mockContacts.filter((c) => {
    if (companyFilter !== 'All' && c.company !== companyFilter) return false;
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase()) && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const decisionMakers = mockContacts.filter((c) => c.isDecisionMaker).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Contacts</h1>
          <p className="text-sm text-text-secondary">
            {mockContacts.length} total · <span className="text-accent font-medium">{decisionMakers} decision makers</span>
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Search contacts..."
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setCompanyFilter(c)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                companyFilter === c
                  ? 'bg-accent text-[#090909]'
                  : 'text-text-secondary hover:text-white hover:bg-[#1A1A1A] border border-[#2A2A2A]'
              )}
            >
              {c === 'All' ? 'All Companies' : c.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="glass-card overflow-x-auto">
        <table className="data-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Title</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Enrichment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {getInitials(contact.firstName, contact.lastName)}
                    </div>
                    <span className="text-white font-medium text-sm">{contact.firstName} {contact.lastName}</span>
                  </div>
                </td>
                <td className="text-xs">{contact.title}</td>
                <td className="text-xs text-text-secondary">{contact.company}</td>
                <td className="text-xs font-mono text-text-secondary">{contact.email}</td>
                <td className="text-xs font-mono text-text-secondary">{contact.phone}</td>
                <td>
                  {contact.isDecisionMaker && (
                    <Badge variant="accent" className="text-2xs">Decision Maker</Badge>
                  )}
                </td>
                <td>{enrichmentBadge(contact.enrichment)}</td>
                <td>
                  {contact.linkedin && (
                    <button className="text-text-tertiary hover:text-info transition-colors p-1 rounded-lg hover:bg-info/10 inline-flex">
                      <Linkedin className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
