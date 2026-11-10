'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LifeBuoy,
  Ticket,
  BarChart3,
  UserCheck,
  LogOut,
  Shield,
  PlusCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@repo/shared';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  const roleBadgeColor = {
    [UserRole.ADMIN]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    [UserRole.AGENT]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    [UserRole.CUSTOMER]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }[user.role as UserRole] || 'bg-slate-700 text-slate-300';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900/50 md:flex">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30">
            <LifeBuoy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">PulseDesk</h1>
            <p className="text-[11px] font-medium text-slate-400">Enterprise Support</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              pathname === '/dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Ticket className="h-4 w-4" />
            Ticket Queue
          </Link>

          {user.role !== UserRole.CUSTOMER && (
            <Link
              href="/dashboard?assignedToMe=true"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
            >
              <UserCheck className="h-4 w-4" />
              Assigned to Me
            </Link>
          )}

          <div className="pt-4 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Info
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 font-medium text-slate-300">
              <Layers className="h-4 w-4 text-indigo-400" />
              Cross-Platform Ready
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Web Next.js & Mobile Expo synchronizing via shared types & REST JWT contract.
            </p>
          </div>
        </nav>

        {/* User Card at Bottom */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/80 p-3 border border-slate-800/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${roleBadgeColor}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              {user.role === UserRole.CUSTOMER ? 'Customer Support Portal' : 'Agent Operations Desk'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleBadgeColor}`}>
                {user.role} VIEW
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
