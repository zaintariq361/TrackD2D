'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Map, Target, Kanban, Activity, Building2,
  UserCircle, BarChart3, Brain, Settings, Zap, ChevronLeft,
  ChevronRight, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/store';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Territory Map', href: '/territory', icon: Map },
  { label: 'Leads', href: '/leads', icon: Target },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Activities', href: '/activities', icon: Activity },
  { label: 'Companies', href: '/companies', icon: Building2 },
  { label: 'Contacts', href: '/contacts', icon: UserCircle },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Intelligence', href: '/intelligence', icon: Brain },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  const collapsed = sidebarCollapsed;
  const width = collapsed ? 68 : 240;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[#111111] border-r border-[#2A2A2A] flex flex-col z-30 overflow-hidden"
      style={{ width }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[#2A2A2A] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-[#090909]" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white font-bold text-base tracking-tight whitespace-nowrap"
            >
              TrackD2D
            </motion.span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'nav-item w-full',
                isActive && 'active',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-[#2A2A2A] p-2 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-2xs text-text-tertiary truncate capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'nav-item w-full text-danger hover:bg-danger/10 hover:text-danger',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!collapsed)}
        className="absolute top-4 -right-3 w-6 h-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#222222] transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}
