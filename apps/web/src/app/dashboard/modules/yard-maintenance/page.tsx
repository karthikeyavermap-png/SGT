'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  AlertTriangle,
  Droplet,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  PlusCircle,
  FileText,
} from 'lucide-react';
import {
  YardAllowance,
  DiagnosticLog,
  OilFillRecord,
  YardExpense,
  getYardAllowances,
  getDiagnosticLogs,
  getOilFillRecords,
  getYardExpenses,
} from '@/lib/modules-api';

export default function YardMaintenanceModulePage() {
  const [activeTab, setActiveTab] = useState<'allowances' | 'diagnostics' | 'oil' | 'accounts'>('allowances');
  const [allowances, setAllowances] = useState<YardAllowance[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticLog[]>([]);
  const [oilFills, setOilFills] = useState<OilFillRecord[]>([]);
  const [expenses, setExpenses] = useState<YardExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [a, d, o, e] = await Promise.all([
        getYardAllowances(),
        getDiagnosticLogs(),
        getOilFillRecords(),
        getYardExpenses(),
      ]);
      setAllowances(a);
      setDiagnostics(d);
      setOilFills(o);
      setExpenses(e);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/modules"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wrench className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">Yard Maintenance Module</h1>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              YM_Mod
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 pl-8">
            Manage staff allowances, crane diagnostics telemetry, oil fills, and engineering maintenance accounts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('allowances')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'allowances'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          Staff Allowances ({allowances.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'diagnostics'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Equipment Diagnostics ({diagnostics.length})
        </button>

        <button
          onClick={() => setActiveTab('oil')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'oil'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplet className="h-4 w-4" />
          Oil Fills & Lubrication ({oilFills.length})
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'accounts'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Maintenance Accounts ({expenses.length})
        </button>
      </div>

      {/* Tab 1: Allowances */}
      {activeTab === 'allowances' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Staff Operational Allowances & Overtime</h3>
              <p className="text-xs text-slate-400">Night shift, hazard duty, and heavy cargo allowances</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Total Approved: ₹{allowances.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Staff Name</th>
                  <th className="pb-3 font-semibold">Designation / Role</th>
                  <th className="pb-3 font-semibold">Allowance Type</th>
                  <th className="pb-3 font-semibold">Shift Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Approved By</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allowances.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-white">{a.staffName}</td>
                    <td className="py-3 text-slate-300">{a.role}</td>
                    <td className="py-3 font-mono text-indigo-400">{a.allowanceType}</td>
                    <td className="py-3 text-slate-400">{a.shiftDate}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{a.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-300">{a.approvedBy || 'Pending Approval'}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          a.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Equipment Telemetry & Diagnostic Fault Logs</h3>
              <p className="text-xs text-slate-400">Crane engines, hydraulic pumps, twistlocks, and telemetry readings</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Equipment</th>
                  <th className="pb-3 font-semibold">Component</th>
                  <th className="pb-3 font-semibold">Fault Code</th>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Telemetry Sensor Metric</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {diagnostics.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-indigo-300">{d.equipmentCode}</td>
                    <td className="py-3 font-semibold text-white">{d.component}</td>
                    <td className="py-3 font-mono text-amber-400">{d.faultCode}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          d.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
                            : d.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                            : d.severity === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {d.severity}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-cyan-300">{d.telemetryMetric || 'N/A'}</td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">{d.description}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Oil Fills */}
      {activeTab === 'oil' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Lubrication & Oil Replenishment Logs</h3>
              <p className="text-xs text-slate-400">Hydraulic reservoirs, engine lube, and travel gearboxes</p>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              Total Liters: {oilFills.reduce((acc, curr) => acc + curr.litersFilled, 0)} L
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Equipment</th>
                  <th className="pb-3 font-semibold">Oil Specification</th>
                  <th className="pb-3 font-semibold">Liters Filled</th>
                  <th className="pb-3 font-semibold">Hour Meter Reading</th>
                  <th className="pb-3 font-semibold">Cost (INR)</th>
                  <th className="pb-3 font-semibold">Technician</th>
                  <th className="pb-3 font-semibold">Service Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {oilFills.map((o, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-white">{o.equipmentCode}</td>
                    <td className="py-3 font-mono text-indigo-400">{o.oilType}</td>
                    <td className="py-3 font-bold text-emerald-400">{o.litersFilled} Liters</td>
                    <td className="py-3 text-slate-300 font-mono">{o.readingHours} hrs</td>
                    <td className="py-3 font-bold text-slate-200">₹{o.costInr.toLocaleString()}</td>
                    <td className="py-3 text-slate-300">{o.technicianName}</td>
                    <td className="py-3 text-slate-400 text-[11px] max-w-xs truncate">{o.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Maintenance Accounts */}
      {activeTab === 'accounts' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Yard Engineering Maintenance Accounts</h3>
              <p className="text-xs text-slate-400">Spare parts, third-party structural tests, and consumables</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Total Incurred: ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Vendor / Supplier</th>
                  <th className="pb-3 font-semibold">Invoice Ref</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-amber-400">{e.category}</td>
                    <td className="py-3 font-semibold text-white">{e.description}</td>
                    <td className="py-3 text-slate-300">{e.vendorName}</td>
                    <td className="py-3 font-mono text-slate-400">{e.invoiceRef || 'N/A'}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{e.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          e.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

