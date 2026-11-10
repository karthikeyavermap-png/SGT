'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  UserRole,
  SystemModule,
  hasModuleAccess,
  MODULE_DESCRIPTIONS,
} from '@repo/shared';
import {
  Wrench,
  Truck,
  Receipt,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Compass,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function OperationalModulesHub() {
  const { user, login } = useAuth();
  const [switching, setSwitching] = useState(false);

  const currentRole = (user?.role as UserRole) || UserRole.SUPER_ADMIN;

  const quickRoles = [
    { role: UserRole.SUPER_ADMIN, label: 'Super Admin', email: 'superadmin@sgt.com', desc: 'Global Control (All Modules)' },
    { role: UserRole.REGIONAL_DIRECTOR, label: 'Regional Director', email: 'regional@sgt.com', desc: 'Regional Oversight (All Modules)' },
    { role: UserRole.YARD_MANAGER, label: 'Yard Manager', email: 'yardmgr@sgt.com', desc: 'Yard Maintenance Only' },
    { role: UserRole.FLEET_DISPATCHER, label: 'Fleet Dispatcher', email: 'dispatcher@sgt.com', desc: 'Transport & Fleet Only' },
    { role: UserRole.ACCOUNTS_EXECUTIVE, label: 'Accounts Exec', email: 'accounts@sgt.com', desc: 'Office & Accounts Only' },
    { role: UserRole.AUDITOR, label: 'Auditor', email: 'auditor@sgt.com', desc: 'Audit Scope (All Modules)' },
    { role: UserRole.DRIVER, label: 'Driver', email: 'driver@sgt.com', desc: 'Trip Execution Only' },
  ];

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    try {
      await login({ email, password: 'Password123!' });
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const isYardAccessible = hasModuleAccess(currentRole, SystemModule.YARD_MAINTENANCE);
  const isFleetAccessible = hasModuleAccess(currentRole, SystemModule.TRANSPORT_FLEET);
  const isAccountsAccessible = hasModuleAccess(currentRole, SystemModule.OFFICE_ACCOUNTS);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">SGT Operational Modules & RBAC Hub</h1>
            <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-xs font-semibold text-indigo-300">
              Role-Based Access Control
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Hierarchical authorization matrix enforcing strict module boundaries between Yard Operations, Transport Fleet, and Office Accounts.
          </p>
        </div>

        {/* Current User Role Pill */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{user?.name}</span>
              <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                {currentRole}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Logged in with session RBAC claims</p>
          </div>
        </div>
      </div>

      {/* Interactive Quick Role Switcher Bar */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Live RBAC Role Switcher (Test Module Access Controls)
          </div>
          <span className="text-[11px] text-slate-400">Click any role to instantly switch perspective</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {quickRoles.map((r) => {
            const isCurrent = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => handleQuickSwitch(r.email)}
                disabled={switching || isCurrent}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                } disabled:opacity-80`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold truncate">{r.label}</span>
                  {isCurrent && <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0" />}
                </div>
                <span className="mt-1 text-[9px] text-slate-500 line-clamp-1">{r.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Hierarchy Visual Graph */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">System Role Hierarchy & Module Access Mapping</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Visual mapping corresponding to the organization structure: Super Admin &amp; Regional Director govern all branches; operational managers control dedicated functional silos.
        </p>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
          <div className="flex flex-col items-center gap-4">
            {/* Global Level */}
            <div className="flex flex-col items-center">
              <div className="rounded-xl border border-purple-500/40 bg-purple-950/40 px-5 py-2.5 text-center shadow-lg shadow-purple-500/10">
                <p className="text-xs font-bold text-purple-200">Super Admin (SA)</p>
                <p className="text-[10px] text-purple-400">Global System Control &amp; Provisioning</p>
              </div>
              <div className="text-slate-500 text-xs py-1">▼</div>
              <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-5 py-2.5 text-center shadow-lg shadow-indigo-500/10">
                <p className="text-xs font-bold text-indigo-200">Regional Director (RD)</p>
                <p className="text-[10px] text-indigo-400">Multi-Yard &amp; Regional Operational Oversight</p>
              </div>
            </div>

            <div className="text-slate-500 text-xs py-1">▼ Branch &amp; Functional Managers</div>

            {/* Operational Managers Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 w-full max-w-4xl">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
                <p className="text-xs font-bold text-emerald-300">Yard Manager (YM)</p>
                <p className="text-[10px] text-slate-400">Yard Ops &amp; Maintenance</p>
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold">↳ Yard Maintenance</div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center">
                <p className="text-xs font-bold text-amber-300">Fleet Dispatcher (FD)</p>
                <p className="text-[10px] text-slate-400">Transport &amp; Drivers</p>
                <div className="mt-2 text-[10px] text-amber-400 font-semibold">↳ Transport &amp; Fleet</div>
              </div>

              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 text-center">
                <p className="text-xs font-bold text-blue-300">Accounts Exec (AE)</p>
                <p className="text-[10px] text-slate-400">Office Finance &amp; GST</p>
                <div className="mt-2 text-[10px] text-blue-400 font-semibold">↳ Office &amp; Accounts</div>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-center">
                <p className="text-xs font-bold text-cyan-300">Auditor (AU)</p>
                <p className="text-[10px] text-slate-400">Compliance &amp; Audit</p>
                <div className="mt-2 text-[10px] text-cyan-400 font-semibold">↳ Full Read/Audit</div>
              </div>
            </div>

            {/* Driver Field Level */}
            <div className="text-slate-500 text-xs">▼ Field Level</div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-6 py-2 text-center">
              <p className="text-xs font-bold text-amber-300">Driver (DR)</p>
              <p className="text-[10px] text-slate-400">Trip Execution &amp; Waybill Updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Operational Modules Launch Cards */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Core Operational Modules</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Module 1: Yard Maintenance */}
          <div
            className={`rounded-2xl border p-6 flex flex-col justify-between transition ${
              isYardAccessible
                ? 'border-emerald-500/40 bg-slate-900/70 hover:border-emerald-500/70'
                : 'border-slate-800/80 bg-slate-900/30 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Wrench className="h-6 w-6" />
                </div>
                {isYardAccessible ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accessible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> Restricted
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">Yard Maintenance Module</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Allowances, machine diagnostics &amp; telemetry, oil fill logs, and yard maintenance accounts.
              </p>

              <div className="mt-6 space-y-2.5 border-t border-slate-800/80 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Overtime &amp; Hazard Allowances:</span>
                  <span className="font-semibold text-emerald-400">3 Logged (₹5,500)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Equipment Diagnostics:</span>
                  <span className="font-semibold text-rose-400">1 Critical (RMG-01)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Lubrication &amp; Oil Fills:</span>
                  <span className="font-semibold text-slate-200">200 Liters (₹54.4k)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Maintenance Accounts:</span>
                  <span className="font-semibold text-slate-200">₹1,84,000 Incurred</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80">
              {isYardAccessible ? (
                <Link
                  href="/dashboard/modules/yard-maintenance"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Launch Yard Maintenance <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-400 border border-slate-800">
                  Requires <strong className="text-slate-200">Yard Manager</strong>, Regional Director, Auditor or Super Admin
                </div>
              )}
            </div>
          </div>

          {/* Module 2: Transport & Fleet */}
          <div
            className={`rounded-2xl border p-6 flex flex-col justify-between transition ${
              isFleetAccessible
                ? 'border-amber-500/40 bg-slate-900/70 hover:border-amber-500/70'
                : 'border-slate-800/80 bg-slate-900/30 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Truck className="h-6 w-6" />
                </div>
                {isFleetAccessible ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accessible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> Restricted
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">Transport &amp; Fleet Module</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Vehicles registry, driver rosters, trip dispatches, odometer telemetry &amp; delivery updates.
              </p>

              <div className="mt-6 space-y-2.5 border-t border-slate-800/80 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Fleet Vehicles:</span>
                  <span className="font-semibold text-slate-200">4 Prime Movers &amp; ITVs</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Active Drivers:</span>
                  <span className="font-semibold text-slate-200">3 Verified (Avg 4.8★)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Trip Dispatches:</span>
                  <span className="font-semibold text-amber-400">1 In-Transit, 1 Delivered</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Driver Updates:</span>
                  <span className="font-semibold text-emerald-400">Waypoint Notes Active</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80">
              {isFleetAccessible ? (
                <Link
                  href="/dashboard/modules/transport-fleet"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-500 shadow-md shadow-amber-600/20"
                >
                  Launch Transport &amp; Fleet <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-400 border border-slate-800">
                  Requires <strong className="text-slate-200">Fleet Dispatcher</strong>, Driver, Regional Director, Auditor or Super Admin
                </div>
              )}
            </div>
          </div>

          {/* Module 3: Office & Accounts */}
          <div
            className={`rounded-2xl border p-6 flex flex-col justify-between transition ${
              isAccountsAccessible
                ? 'border-blue-500/40 bg-slate-900/70 hover:border-blue-500/70'
                : 'border-slate-800/80 bg-slate-900/30 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Receipt className="h-6 w-6" />
                </div>
                {isAccountsAccessible ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accessible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
                    <Lock className="h-3.5 w-3.5" /> Restricted
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">Office &amp; Accounts Module</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Invoices (GST &amp; Non-GST), collections, operational expenses, and procurement purchase/sales ledger.
              </p>

              <div className="mt-6 space-y-2.5 border-t border-slate-800/80 pt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">GST / Non-GST Invoices:</span>
                  <span className="font-semibold text-emerald-400">₹13.24 Lakh Gross</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Payment Collections:</span>
                  <span className="font-semibold text-slate-200">₹9.80 Lakh RTGS/NEFT</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Operational Expenses:</span>
                  <span className="font-semibold text-slate-200">₹2.78 Lakh (Power/Fuel)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Purchases &amp; Sales:</span>
                  <span className="font-semibold text-blue-400">2 Active Contracts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80">
              {isAccountsAccessible ? (
                <Link
                  href="/dashboard/modules/office-accounts"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
                >
                  Launch Office &amp; Accounts <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-400 border border-slate-800">
                  Requires <strong className="text-slate-200">Accounts Executive</strong>, Regional Director, Auditor or Super Admin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

