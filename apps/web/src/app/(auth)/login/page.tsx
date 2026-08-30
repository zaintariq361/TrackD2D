'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, MapPin, Brain, BarChart3, Target, Star, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const featureCards = [
  { icon: Brain, title: 'AI Lead Scoring', desc: 'Every lead scored 0–100 using 40+ signals' },
  { icon: MapPin, title: 'Territory Maps', desc: 'Visual route optimization for field reps' },
  { icon: Target, title: 'Data Enrichment', desc: 'Auto-enrich with Google, Clearbit, Apollo' },
  { icon: BarChart3, title: 'Rep Analytics', desc: 'Real-time activity tracking and leaderboards' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      setAuth(
        data.user as Parameters<typeof setAuth>[0],
        data.organization as Parameters<typeof setAuth>[1],
        data.accessToken,
        data.refreshToken
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    // Demo login with mock data
    setAuth(
      { id: 'demo-1', firstName: 'Alex', lastName: 'Morgan', email: 'alex@demo.com', role: 'ADMIN' },
      { id: 'org-1', name: 'Demo Corp', slug: 'demo-corp', plan: 'PRO' },
      'demo-token',
      'demo-refresh'
    );
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-[#090909]">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col w-[55%] bg-[#111111] border-r border-[#2A2A2A] relative overflow-hidden p-12">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#090909]" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TrackD2D</span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Feed your reps{' '}
              <span className="text-gradient">before they knock.</span>
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-md">
              AI-powered field sales intelligence that scores every lead, maps every territory, and tracks every rep — in real time.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mb-auto">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="glass-card p-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{feat.title}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 pt-8 border-t border-[#2A2A2A] mt-8">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-accent fill-accent" />
              <span className="text-sm font-semibold text-white">4.9/5</span>
              <span className="text-xs text-text-tertiary">rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-white">SOC2</span>
              <span className="text-xs text-text-tertiary">Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-info" />
              <span className="text-sm font-semibold text-white">GPS</span>
              <span className="text-xs text-text-tertiary">Tracking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-text-tertiary" />
              <span className="text-xs text-text-tertiary">256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#090909]" />
            </div>
            <span className="text-white font-bold text-lg">TrackD2D</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-text-secondary text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email address</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-tertiary hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>

            <Button type="button" variant="secondary" className="w-full" onClick={handleDemo}>
              Try Demo
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-tertiary">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-accent hover:underline font-medium">
              Register
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
