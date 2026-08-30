'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.register(form);
      setAuth(
        data.user as Parameters<typeof setAuth>[0],
        data.organization as Parameters<typeof setAuth>[1],
        data.accessToken,
        data.refreshToken
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <Zap className="h-4 w-4 text-[#090909]" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TrackD2D</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-text-secondary text-sm">Start your field sales intelligence journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">First Name</label>
              <Input placeholder="Alex" value={form.firstName} onChange={handleChange('firstName')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Last Name</label>
              <Input placeholder="Morgan" value={form.lastName} onChange={handleChange('lastName')} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Organization Name</label>
            <Input placeholder="Acme Sales Co." value={form.organizationName} onChange={handleChange('organizationName')} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Work Email</label>
            <Input type="email" placeholder="you@company.com" value={form.email} onChange={handleChange('email')} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
            <Input type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange('password')} required minLength={8} />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-tertiary">
          Already have an account?{' '}
          <a href="/login" className="text-accent hover:underline font-medium">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
