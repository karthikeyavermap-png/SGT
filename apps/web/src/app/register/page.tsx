'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LifeBuoy, User, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { UserRole } from '@repo/shared';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, password, role });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <LifeBuoy className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join PulseDesk enterprise ticketing workspace
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/40 p-3.5 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

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
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
              Account Role
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Shield className="h-4 w-4" />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-white shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={UserRole.CUSTOMER}>Customer (Standard User)</option>
                <option value={UserRole.AGENT}>Support Agent (Handle Tickets)</option>
                <option value={UserRole.ADMIN}>Administrator (Full Access)</option>
              </select>
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
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

