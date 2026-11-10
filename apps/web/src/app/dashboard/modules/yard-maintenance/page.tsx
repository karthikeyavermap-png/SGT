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
  PlusCircle,
  X,
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
  createYardAllowance,
  createDiagnosticLog,
  createOilFillRecord,
  createYardExpense,
} from '@/lib/modules-api';

export default function YardMaintenanceModulePage() {
  const [activeTab, setActiveTab] = useState<'allowances' | 'diagnostics' | 'oil' | 'accounts'>('allowances');
  const [allowances, setAllowances] = useState<YardAllowance[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticLog[]>([]);
  const [oilFills, setOilFills] = useState<OilFillRecord[]>([]);
  const [expenses, setExpenses] = useState<YardExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState<'allowance' | 'diagnostic' | 'oil' | 'expense' | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states
  const [allowanceForm, setAllowanceForm] = useState({
    staffName: '',
    role: 'Crane Operator',
    allowanceType: 'OVERTIME' as const,
    amount: 1500,
    shiftDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [diagForm, setDiagForm] = useState({
    equipmentCode: 'RMG-01',
    component: 'Hydraulic System',
    faultCode: 'HYD-WARN-01',
    severity: 'MEDIUM' as const,
    description: '',
    hoursLogged: 3000,
    telemetryMetric: 'Pressure: 190 Bar, Temp: 75°C',
    reportedBy: 'Technician',
  });

  const [oilForm, setOilForm] = useState({
    equipmentCode: 'RS-01',
    oilType: 'HYDRAULIC_ISO_68' as const,
    litersFilled: 40,
    readingHours: 2500,
    costInr: 12000,
    technicianName: 'Suresh More',
    notes: 'Scheduled fluid top-up',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'SPARE_PARTS' as const,
    description: '',
    vendorName: '',
    amount: 25000,
    invoiceRef: '',
  });

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

  const handleCreateAllowance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createYardAllowance(allowanceForm);
      if (res) {
        setAllowances([res, ...allowances]);
        setModalType(null);
        setAllowanceForm({
          staffName: '',
          role: 'Crane Operator',
          allowanceType: 'OVERTIME',
          amount: 1500,
          shiftDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateDiag = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createDiagnosticLog(diagForm);
      if (res) {
        setDiagnostics([res, ...diagnostics]);
        setModalType(null);
        setDiagForm({
          equipmentCode: 'RMG-01',
          component: 'Hydraulic System',
          faultCode: 'HYD-WARN-01',
          severity: 'MEDIUM',
          description: '',
          hoursLogged: 3000,
          telemetryMetric: 'Pressure: 190 Bar, Temp: 75°C',
          reportedBy: 'Technician',
        });
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateOil = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createOilFillRecord(oilForm);
      if (res) {
        setOilFills([res, ...oilFills]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createYardExpense(expenseForm);
      if (res) {
        setExpenses([res, ...expenses]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

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

        {/* Action Button depending on Tab */}
        <div>
          {activeTab === 'allowances' && (
            <button
              onClick={() => setModalType('allowance')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Log Allowance
            </button>
          )}
          {activeTab === 'diagnostics' && (
            <button
              onClick={() => setModalType('diagnostic')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Report Fault
            </button>
          )}
          {activeTab === 'oil' && (
            <button
              onClick={() => setModalType('oil')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Record Oil Fill
            </button>
          )}
          {activeTab === 'accounts' && (
            <button
              onClick={() => setModalType('expense')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Log Maintenance Expense
            </button>
          )}
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

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">
                {modalType === 'allowance' && 'Log Staff Operational Allowance'}
                {modalType === 'diagnostic' && 'Report Machinery Diagnostic Fault'}
                {modalType === 'oil' && 'Record Oil Fill & Lubrication'}
                {modalType === 'expense' && 'Log Yard Maintenance Expense'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalType === 'allowance' && (
              <form onSubmit={handleCreateAllowance} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Staff Name</label>
                  <input
                    type="text"
                    required
                    value={allowanceForm.staffName}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, staffName: e.target.value })}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Role</label>
                    <input
                      type="text"
                      required
                      value={allowanceForm.role}
                      onChange={(e) => setAllowanceForm({ ...allowanceForm, role: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Allowance Type</label>
                    <select
                      value={allowanceForm.allowanceType}
                      onChange={(e: any) => setAllowanceForm({ ...allowanceForm, allowanceType: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="OVERTIME">OVERTIME</option>
                      <option value="HAZARD_PAY">HAZARD_PAY</option>
                      <option value="NIGHT_SHIFT">NIGHT_SHIFT</option>
                      <option value="PER_DIEM">PER_DIEM</option>
                      <option value="SPECIAL_DUTY">SPECIAL_DUTY</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={allowanceForm.amount}
                      onChange={(e) => setAllowanceForm({ ...allowanceForm, amount: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Shift Date</label>
                    <input
                      type="date"
                      required
                      value={allowanceForm.shiftDate}
                      onChange={(e) => setAllowanceForm({ ...allowanceForm, shiftDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Operational Duty Notes</label>
                  <textarea
                    rows={2}
                    value={allowanceForm.notes}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, notes: e.target.value })}
                    placeholder="Specific heavy stacking or vessel discharge details"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Recording...' : 'Submit Allowance'}
                </button>
              </form>
            )}

            {modalType === 'diagnostic' && (
              <form onSubmit={handleCreateDiag} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Equipment Code</label>
                    <input
                      type="text"
                      required
                      value={diagForm.equipmentCode}
                      onChange={(e) => setDiagForm({ ...diagForm, equipmentCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Severity</label>
                    <select
                      value={diagForm.severity}
                      onChange={(e: any) => setDiagForm({ ...diagForm, severity: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Component</label>
                  <input
                    type="text"
                    required
                    value={diagForm.component}
                    onChange={(e) => setDiagForm({ ...diagForm, component: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Telemetry Sensor Metric</label>
                  <input
                    type="text"
                    value={diagForm.telemetryMetric}
                    onChange={(e) => setDiagForm({ ...diagForm, telemetryMetric: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fault Description</label>
                  <textarea
                    rows={2}
                    required
                    value={diagForm.description}
                    onChange={(e) => setDiagForm({ ...diagForm, description: e.target.value })}
                    placeholder="Abnormal vibration, pressure fluctuation, or code"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Logging...' : 'Log Machinery Fault'}
                </button>
              </form>
            )}

            {modalType === 'oil' && (
              <form onSubmit={handleCreateOil} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Equipment Code</label>
                    <input
                      type="text"
                      required
                      value={oilForm.equipmentCode}
                      onChange={(e) => setOilForm({ ...oilForm, equipmentCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Oil Type</label>
                    <select
                      value={oilForm.oilType}
                      onChange={(e: any) => setOilForm({ ...oilForm, oilType: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="HYDRAULIC_ISO_68">HYDRAULIC_ISO_68</option>
                      <option value="ENGINE_15W40">ENGINE_15W40</option>
                      <option value="GEAR_SAE_90">GEAR_SAE_90</option>
                      <option value="TRANSMISSION_ATF">TRANSMISSION_ATF</option>
                      <option value="SYNTHETIC_GREASE">SYNTHETIC_GREASE</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Liters Filled</label>
                    <input
                      type="number"
                      required
                      value={oilForm.litersFilled}
                      onChange={(e) => setOilForm({ ...oilForm, litersFilled: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Cost (INR)</label>
                    <input
                      type="number"
                      required
                      value={oilForm.costInr}
                      onChange={(e) => setOilForm({ ...oilForm, costInr: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Recording...' : 'Record Fluid Replenishment'}
                </button>
              </form>
            )}

            {modalType === 'expense' && (
              <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    placeholder="e.g. Wire rope replacement"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Vendor Name</label>
                    <input
                      type="text"
                      required
                      value={expenseForm.vendorName}
                      onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Maintenance Expense'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
