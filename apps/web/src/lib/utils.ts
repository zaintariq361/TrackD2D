import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#10B981';
  if (score >= 40) return '#F59E0B';
  return '#666666';
}

export function getScoreBadgeClass(score: number): string {
  if (score >= 70) return 'bg-success/10 text-success border-success/20';
  if (score >= 40) return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-white/5 text-text-secondary border-border';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: '#3B82F6',
    CONTACTED: '#F5C518',
    QUALIFIED: '#10B981',
    PROPOSAL: '#F59E0B',
    NEGOTIATION: '#8B5CF6',
    WON: '#059669',
    LOST: '#EF4444',
    ARCHIVED: '#666666',
    PROSPECTING: '#3B82F6',
    NEEDS_ANALYSIS: '#8B5CF6',
  };
  return map[status] || '#666666';
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-info/10 text-info border-info/20',
    CONTACTED: 'bg-accent/10 text-accent border-accent/20',
    QUALIFIED: 'bg-success/10 text-success border-success/20',
    PROPOSAL: 'bg-warning/10 text-warning border-warning/20',
    NEGOTIATION: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    LOST: 'bg-danger/10 text-danger border-danger/20',
    ARCHIVED: 'bg-white/5 text-text-secondary border-border',
  };
  return map[status] || 'bg-white/5 text-text-secondary border-border';
}

export function getActivityIcon(type: string): string {
  const map: Record<string, string> = {
    KNOCK: '🚪',
    CALL: '📞',
    EMAIL: '📧',
    MEETING: '🤝',
    DEMO: '💻',
    FOLLOW_UP: '🔔',
    NOTE: '📝',
    SMS: '💬',
  };
  return map[type] || '📋';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatAddress(parts: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string {
  return [parts.street, parts.city, parts.state, parts.zip]
    .filter(Boolean)
    .join(', ');
}

export function getEnrichmentStatusColor(status: string): string {
  const map: Record<string, string> = {
    ENRICHED: '#10B981',
    PENDING: '#F59E0B',
    FAILED: '#EF4444',
    NOT_ENRICHED: '#666666',
    PROCESSING: '#3B82F6',
  };
  return map[status] || '#666666';
}
