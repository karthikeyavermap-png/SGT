'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, LifeBuoy, User, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <LifeBuoy className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
            PulseDesk Ticketing
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your enterprise service desk
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@example.com')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-900/50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('agent@example.com')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 px-2 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-900/50"
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              Agent
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer@example.com')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-900/50"
            >
              <User className="h-3.5 w-3.5" />
              Customer
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/40 p-3.5 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Password
              </label>
              <span className="text-xs text-slate-400">(Default: Password123!)</span>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Sign in to Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Create customer account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

