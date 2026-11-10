'use client';

import React, { useState } from 'react';
import {
  Layers,
  TrainTrack,
  Truck,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  Clock,
  Weight,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Box,
} from 'lucide-react';
import {
  YardBlock,
  Rake,
  TruckVisit,
  CustomerOrder,
  Invoice,
  DemurrageRecord,
  AnalyticsSummary,
  fetchYardBlocks,
  fetchRakes,
  fetchTrucks,
  fetchOrders,
  fetchInvoices,
  fetchDemurrageRecords,
  fetchAnalyticsSummary,
} from '@/lib/sgt-api';

export default function SgtOperationsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'yard' | 'transport' | 'commercial' | 'analytics'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Initial mock state loaded synchronously
  const [blocks, setBlocks] = useState<YardBlock[]>([
    { id: 1, blockCode: 'BLOCK-A', name: 'Heavy Steel & HR Coils Yard', totalBays: 10, totalRows: 4, maxTier: 3, totalCapacity: 120, currentOccupancy: 94 },
    { id: 2, blockCode: 'BLOCK-B', name: 'Bulk Minerals & Pellets', totalBays: 12, totalRows: 4, maxTier: 4, totalCapacity: 160, currentOccupancy: 118 },
    { id: 3, blockCode: 'BLOCK-C', name: 'Cement & Dry Bulk Clinker', totalBays: 8, totalRows: 4, maxTier: 3, totalCapacity: 80, currentOccupancy: 41 },
    { id: 4, blockCode: 'BLOCK-D', name: 'Empty Container Staging', totalBays: 10, totalRows: 3, maxTier: 4, totalCapacity: 100, currentOccupancy: 32 },
  ]);

  const [rakes, setRakes] = useState<Rake[]>([
    { id: 1, rakeNumber: 'RK-2026-ER-01', trainOperator: 'Indian Railways (East Coast)', totalWagons: 45, status: 'DISCHARGING', freeDetentionHours: 8.0, actualDetentionHours: 6.8, arrivalTime: 'Today, 06:15 AM' },
    { id: 2, rakeNumber: 'RK-2026-SER-14', trainOperator: 'South Eastern Freight', totalWagons: 58, status: 'COMPLETED', freeDetentionHours: 8.0, actualDetentionHours: 11.5, arrivalTime: 'Yesterday, 02:20 PM' },
    { id: 3, rakeNumber: 'RK-2026-WR-09', trainOperator: 'Western Railway Logistics', totalWagons: 50, status: 'INSPECTION', freeDetentionHours: 8.0, actualDetentionHours: 2.1, arrivalTime: 'Today, 10:45 AM' },
  ]);

  const [trucks, setTrucks] = useState<TruckVisit[]>([
    { id: 1, truckNumber: 'MH-12-QZ-4921', driverName: 'Rajesh Sharma', transporterName: 'Om Logistics', stage: 'WEIGH_OUT', tareWeightTons: 15.6, grossWeightTons: 44.2, netCargoTons: 28.6, gateInTime: '10:15 AM', tatMinutes: 47 },
    { id: 2, truckNumber: 'KA-04-AK-8119', driverName: 'Manjunath Gowda', transporterName: 'VRL Logistics', stage: 'GATE_OUT', tareWeightTons: 16.6, grossWeightTons: 48.0, netCargoTons: 31.4, gateInTime: '10:30 AM', gateOutTime: '11:12 AM', tatMinutes: 42 },
    { id: 3, truckNumber: 'OD-05-BX-2204', driverName: 'Bikash Mahapatra', transporterName: 'Blue Dart Surface', stage: 'YARD_TRANSFER', tareWeightTons: 15.7, grossWeightTons: 42.5, netCargoTons: 26.8, gateInTime: '11:00 AM', tatMinutes: 58 },
    { id: 4, truckNumber: 'TS-09-EA-3341', driverName: 'K. Venkatesh', transporterName: 'Gati Cargo', stage: 'WEIGH_IN', tareWeightTons: 15.8, grossWeightTons: 45.1, netCargoTons: 29.3, gateInTime: '11:45 AM', tatMinutes: 40 },
  ]);

  const [orders, setOrders] = useState<CustomerOrder[]>([
    { id: 1, orderNumber: 'ORD-2026-901', customerName: 'Tata Steel Ltd.', customerCode: 'CUST-TATA', commodity: 'Cold Rolled Steel', quantityTons: 3500.0, ratePerTon: 180.0, totalContractValue: 630000.0, status: 'PROCESSING' },
    { id: 2, orderNumber: 'ORD-2026-902', customerName: 'JSW Infrastructure', customerCode: 'CUST-JSW', commodity: 'Iron Ore Pellets', quantityTons: 4200.0, ratePerTon: 140.0, totalContractValue: 588000.0, status: 'CONFIRMED' },
    { id: 3, orderNumber: 'ORD-2026-899', customerName: 'UltraTech Cement Ltd.', customerCode: 'CUST-ULTRA', commodity: 'Dry Flyash & Clinker', quantityTons: 2800.0, ratePerTon: 125.0, totalContractValue: 350000.0, status: 'BILLED' },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 1, invoiceNumber: 'INV-SGT-2026-0042', customerName: 'UltraTech Cement Ltd.', customerCode: 'CUST-ULTRA', handlingCharges: 350000.0, storageCharges: 24000.0, demurrageCharges: 4500.0, taxAmount: 68130.0, totalAmount: 446630.0, status: 'PAID', issueDate: '2026-11-07' },
    { id: 2, invoiceNumber: 'INV-SGT-2026-0043', customerName: 'Tata Steel Ltd.', customerCode: 'CUST-TATA', handlingCharges: 630000.0, storageCharges: 45000.0, demurrageCharges: 6750.0, taxAmount: 122715.0, totalAmount: 804465.0, status: 'PENDING', issueDate: '2026-11-09' },
  ]);

  const [demurrage, setDemurrage] = useState<DemurrageRecord[]>([
    { id: 1, referenceId: 'RK-2026-ER-01', referenceType: 'RAKE', customerCode: 'CUST-TATA', freeHoursAllowed: 8.0, totalHoursHeld: 17.0, billableDemurrageHours: 9.0, hourlyRate: 750.0, totalDemurrageAmount: 6750.0, status: 'INVOICED' },
    { id: 2, referenceId: 'TRK-MH12-4921', referenceType: 'TRUCK', customerCode: 'CUST-JSW', freeHoursAllowed: 6.0, totalHoursHeld: 9.5, billableDemurrageHours: 3.5, hourlyRate: 600.0, totalDemurrageAmount: 2100.0, status: 'ACCRUING' },
  ]);

  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    yard: { totalSlots: 460, occupiedSlots: 285, occupancyPercentage: 62.0, totalCapacityTons: 85000, currentTons: 56100 },
    transport: { averageRakeTatHours: 7.2, targetRakeTatHours: 8.0, rakesHandledToday: 4, rakesDetained: 1, averageTruckTatMinutes: 46.8, targetTruckTatMinutes: 45.0 },
    commercial: { totalRevenueInr: 28450000.0, handledTonnageMT: 148500.0, totalDemurrageBilledInr: 384000.0 }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [b, r, t, o, inv, dem, a] = await Promise.all([
        fetchYardBlocks(),
        fetchRakes(),
        fetchTrucks(),
        fetchOrders(),
        fetchInvoices(),
        fetchDemurrageRecords(),
        fetchAnalyticsSummary()
      ]);
      setBlocks(b);
      setRakes(r);
      setTrucks(t);
      setOrders(o);
      setInvoices(inv);
      setDemurrage(dem);
      setAnalytics(a);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">Smart Goods Terminal (SGT)</h1>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              Microservices Architecture
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time logistics orchestration across Yard, Rail/Road Transport, Commercial Contracts, and Python Analytics Engine.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          {refreshing ? 'Refreshing Nodes...' : 'Sync Microservices'}
        </button>
      </div>

      {/* Services Health Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Yard Service</p>
            <p className="text-[10px] text-slate-400">Spring Boot :8081</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Transport Service</p>
            <p className="text-[10px] text-slate-400">Spring Boot :8082</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Commercial Service</p>
            <p className="text-[10px] text-slate-400">Spring Boot :8083</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-pulse" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Kafka Broker</p>
            <p className="text-[10px] text-slate-400">KRaft Cluster :9092</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Analytics Engine</p>
            <p className="text-[10px] text-slate-400">FastAPI :8000</p>
          </div>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Yard Stacking Density</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{analytics.yard.occupancyPercentage}%</div>
          <p className="mt-1 text-[11px] text-slate-400">
            {analytics.yard.occupiedSlots} of {analytics.yard.totalSlots} container slots in use
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Rake Turnaround (TAT)</span>
            <TrainTrack className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{analytics.transport.averageRakeTatHours} hrs</div>
          <p className="mt-1 text-[11px] text-emerald-400">
            Within target threshold (&lt; {analytics.transport.targetRakeTatHours} hrs)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Truck Gate-to-Gate</span>
            <Truck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{analytics.transport.averageTruckTatMinutes} min</div>
          <p className="mt-1 text-[11px] text-slate-400">
            Weighbridge + Yard handling duration
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Billed Revenue</span>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ₹{(analytics.commercial.totalRevenueInr / 10000000).toFixed(2)} Cr
          </div>
          <p className="mt-1 text-[11px] text-purple-300">
            {analytics.commercial.handledTonnageMT.toLocaleString()} MT handled to date
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Architecture Overview
        </button>

        <button
          onClick={() => setActiveTab('yard')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'yard'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Yard & Stacking
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'transport'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrainTrack className="h-4 w-4" />
          Rail Rakes & Road Trucks
        </button>

        <button
          onClick={() => setActiveTab('commercial')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'commercial'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Commercial & Demurrage
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'analytics'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Analytics & Heatmaps
        </button>
      </div>

      {/* Tab 1: Architecture Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-base font-bold text-white">Event-Driven Microservices Topology</h2>
            <p className="mt-1 text-xs text-slate-400">
              Each domain executes as an autonomous service, persisting to its own database schema and streaming domain events through Apache Kafka.
            </p>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
              {/* ASCII / Visual Flow */}
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-6 py-3 text-center shadow-lg shadow-indigo-500/10">
                  <p className="text-xs font-bold text-indigo-300">API Gateway & React Frontend UI</p>
                  <p className="text-[10px] text-indigo-400/80">Reverse Proxy :8080 | Next.js :3000</p>
                </div>

                <div className="text-indigo-400 text-xs">▼ REST Traffic Routing</div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-3xl">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                    <p className="text-xs font-bold text-emerald-300">Yard Service</p>
                    <p className="text-[10px] text-slate-400">Spring Boot :8081</p>
                    <p className="mt-2 text-[10px] text-emerald-400/90 font-mono">yard_db (PostgreSQL)</p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                    <p className="text-xs font-bold text-emerald-300">Transport Service</p>
                    <p className="text-[10px] text-slate-400">Spring Boot :8082</p>
                    <p className="mt-2 text-[10px] text-emerald-400/90 font-mono">transport_db (PostgreSQL)</p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center">
                    <p className="text-xs font-bold text-emerald-300">Commercial Service</p>
                    <p className="text-[10px] text-slate-400">Spring Boot :8083</p>
                    <p className="mt-2 text-[10px] text-emerald-400/90 font-mono">commercial_db (PostgreSQL)</p>
                  </div>
                </div>

                <div className="text-amber-400 text-xs">▼ Domain Events (CONTAINER_PLACED, RAKE_STATUS_CHANGED, DEMURRAGE_ACCRUED)</div>

                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-8 py-3 text-center w-full max-w-xl">
                  <p className="text-xs font-bold text-amber-300">Apache Kafka Event Broker (KRaft Mode)</p>
                  <p className="text-[10px] text-amber-400/80">Topics: sgt.yard.events | sgt.transport.events | sgt.commercial.events</p>
                </div>

                <div className="text-cyan-400 text-xs">▼ Real-Time Ingestion & Metric Aggregation</div>

                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-8 py-3 text-center w-full max-w-xl">
                  <p className="text-xs font-bold text-cyan-300">Analytics & Report Engine</p>
                  <p className="text-[10px] text-cyan-400/80">Python 3.12 / FastAPI :8000 | Pandas / NumPy KPI Calculation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Yard Management */}
      {activeTab === 'yard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {blocks.map((b) => {
              const pct = Math.round((b.currentOccupancy / b.totalCapacity) * 100);
              return (
                <div key={b.blockCode} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                      {b.blockCode}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{pct}% Occupied</span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">{b.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{b.currentOccupancy} / {b.totalCapacity} Slots</span>
                    <span>{b.totalBays} Bays × {b.totalRows} Rows</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 80 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Yard Bay Grid Matrix */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">BLOCK-A: Heavy Steel Yard Stacking Matrix</h3>
                <p className="text-xs text-slate-400">Live view of Bay 01 to 08 slots across Row 1-4 and Tiers 1-3</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-3 w-3 rounded bg-emerald-500/30 border border-emerald-500/50" /> Available
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-3 w-3 rounded bg-indigo-500/50 border border-indigo-400" /> Occupied
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-3 w-3 rounded bg-amber-500/50 border border-amber-400" /> Reserved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Array.from({ length: 24 }).map((_, i) => {
                const bay = Math.floor(i / 3) + 1;
                const tier = (i % 3) + 1;
                const isOccupied = i % 4 !== 1;
                const containerId = isOccupied ? `MSCU-892${100 + i}` : null;

                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-2 text-center transition hover:scale-105 cursor-pointer ${
                      isOccupied
                        ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-200'
                        : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-semibold">
                      B{bay.toString().padStart(2, '0')}-T{tier}
                    </div>
                    <div className="mt-1 text-[9px] truncate">
                      {containerId ? containerId : 'EMPTY'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Transport & Logistics */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          {/* Rail Rakes Timetable */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrainTrack className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Rail Freight Rakes In-Terminal</h3>
              </div>
              <span className="text-xs text-slate-400">Free Demurrage Window: 8.0 hrs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Rake Number</th>
                    <th className="pb-3 font-semibold">Operator</th>
                    <th className="pb-3 font-semibold">Wagons</th>
                    <th className="pb-3 font-semibold">Arrival Time</th>
                    <th className="pb-3 font-semibold">Turnaround (TAT)</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rakes.map((r) => {
                    const isOverstayed = r.actualDetentionHours > r.freeDetentionHours;
                    return (
                      <tr key={r.rakeNumber} className="hover:bg-slate-800/30">
                        <td className="py-3 font-mono font-semibold text-white">{r.rakeNumber}</td>
                        <td className="py-3 text-slate-300">{r.trainOperator}</td>
                        <td className="py-3 text-slate-300">{r.totalWagons} BCN Wagons</td>
                        <td className="py-3 text-slate-400">{r.arrivalTime}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className={isOverstayed ? 'font-bold text-rose-400' : 'text-slate-200'}>
                              {r.actualDetentionHours} hrs
                            </span>
                            {isOverstayed && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                                Demurrage
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                              r.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : r.status === 'DISCHARGING'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Road Truck Gate & Weighbridge */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Road Truck Gate & Weighbridge Transactions</h3>
              </div>
              <span className="text-xs text-slate-400">Target TAT: 45 min</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Truck Number</th>
                    <th className="pb-3 font-semibold">Driver / Transporter</th>
                    <th className="pb-3 font-semibold">Gross / Tare / Net Weight</th>
                    <th className="pb-3 font-semibold">Gate In Time</th>
                    <th className="pb-3 font-semibold">Turnaround (TAT)</th>
                    <th className="pb-3 font-semibold">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {trucks.map((t) => (
                    <tr key={t.truckNumber} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-semibold text-white">{t.truckNumber}</td>
                      <td className="py-3">
                        <div className="font-medium text-slate-200">{t.driverName}</div>
                        <div className="text-[10px] text-slate-400">{t.transporterName}</div>
                      </td>
                      <td className="py-3 text-slate-300 font-mono">
                        {t.grossWeightTons}T / {t.tareWeightTons}T →{' '}
                        <span className="font-bold text-emerald-400">{t.netCargoTons}T Net</span>
                      </td>
                      <td className="py-3 text-slate-400">{t.gateInTime}</td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            (t.tatMinutes || 0) > 45 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {t.tatMinutes} mins
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {t.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Commercial & Demurrage */}
      {activeTab === 'commercial' && (
        <div className="space-y-6">
          {/* Customer Orders */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-sm font-bold text-white mb-4">Customer Commercial Contracts & Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Order #</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Commodity</th>
                    <th className="pb-3 font-semibold">Volume</th>
                    <th className="pb-3 font-semibold">Rate</th>
                    <th className="pb-3 font-semibold">Total Value</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((o) => (
                    <tr key={o.orderNumber} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-semibold text-indigo-400">{o.orderNumber}</td>
                      <td className="py-3 font-semibold text-white">{o.customerName}</td>
                      <td className="py-3 text-slate-300">{o.commodity}</td>
                      <td className="py-3 text-slate-300">{o.quantityTons.toLocaleString()} MT</td>
                      <td className="py-3 text-slate-400">₹{o.ratePerTon}/MT</td>
                      <td className="py-3 font-bold text-emerald-400">₹{o.totalContractValue.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Demurrage Incurred */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Accrued Demurrage & Detention Penalties</h3>
              </div>
              <span className="text-xs text-rose-400 font-semibold">Demurrage Rate: ₹600 - ₹750 / hr</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Reference ID</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Free Allowed</th>
                    <th className="pb-3 font-semibold">Actual Held</th>
                    <th className="pb-3 font-semibold">Billable Excess</th>
                    <th className="pb-3 font-semibold">Accrued Demurrage</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {demurrage.map((d) => (
                    <tr key={d.referenceId} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-semibold text-white">{d.referenceId}</td>
                      <td className="py-3 text-slate-300">{d.referenceType}</td>
                      <td className="py-3 font-semibold text-slate-200">{d.customerCode}</td>
                      <td className="py-3 text-slate-400">{d.freeHoursAllowed} hrs</td>
                      <td className="py-3 text-rose-400 font-bold">{d.totalHoursHeld} hrs</td>
                      <td className="py-3 text-amber-400 font-bold">+{d.billableDemurrageHours} hrs</td>
                      <td className="py-3 font-mono font-bold text-rose-400">₹{d.totalDemurrageAmount.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            d.status === 'INVOICED'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Analytics & Heatmaps */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-sm font-bold text-white mb-2">Rail Rake SLA Compliance vs Target (8 hrs)</h3>
              <p className="text-xs text-slate-400 mb-4">Turnaround comparison between current shifts</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Average Rake TAT (Actual)</span>
                    <span className="font-bold text-emerald-400">7.2 hrs</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>SLA Threshold Maximum</span>
                    <span className="font-bold text-slate-400">8.0 hrs</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Truck TAT (Average Gate-to-Gate)</span>
                    <span className="font-bold text-amber-400">46.8 mins (Target: 45 min)</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '104%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-sm font-bold text-white mb-2">Revenue Contribution by Key Customer</h3>
              <p className="text-xs text-slate-400 mb-4">Handling fees, storage tariffs, and detention charges</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-white">Tata Steel Ltd. (CUST-TATA)</p>
                    <p className="text-[10px] text-slate-400">62,000 MT Throughput</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">₹1.24 Cr</p>
                    <p className="text-[10px] text-slate-500">43.6% Share</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-white">JSW Infrastructure (CUST-JSW)</p>
                    <p className="text-[10px] text-slate-400">51,000 MT Throughput</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">₹96.5 Lakh</p>
                    <p className="text-[10px] text-slate-500">33.9% Share</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-white">UltraTech Cement Ltd. (CUST-ULTRA)</p>
                    <p className="text-[10px] text-slate-400">35,500 MT Throughput</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">₹64.0 Lakh</p>
                    <p className="text-[10px] text-slate-500">22.5% Share</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

