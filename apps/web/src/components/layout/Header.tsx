'use client';

import { Bell, Plus, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/territory': 'Territory Map',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/activities': 'Activities',
  '/companies': 'Companies',
  '/contacts': 'Contacts',
  '/analytics': 'Analytics',
  '/intelligence': 'AI Intelligence',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { organization } = useAuthStore();

  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] || 'TrackD2D';

  return (
    <header className="fixed top-0 right-0 left-0 h-14 bg-[#090909]/90 backdrop-blur-sm border-b border-[#2A2A2A] flex items-center px-4 gap-4 z-20">
      <div className="w-[240px] shrink-0" /> {/* Sidebar spacer */}
      <h1 className="text-sm font-semibold text-white hidden md:block">{title}</h1>

      <div className="flex-1 max-w-sm hidden md:block">
        <Input
          placeholder="Search leads, companies..."
          icon={<Search className="h-4 w-4" />}
          className="h-8 text-xs bg-[#111111]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {organization && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-text-secondary font-medium">
            {organization.name}
          </span>
        )}

        <button className="relative w-9 h-9 rounded-lg bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>

        <Button size="sm" onClick={() => router.push('/leads?new=true')} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Lead
        </Button>
      </div>
    </header>
  );
}
