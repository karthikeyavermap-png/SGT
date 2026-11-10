'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Users,
  Navigation,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Gauge,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  FleetVehicle,
  DriverRecord,
  TripRecord,
  getFleetVehicles,
  getDrivers,
  getTrips,
  updateTripStatus,
} from '@/lib/modules-api';

export default function TransportFleetModulePage() {
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles' | 'drivers'>('trips');
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [v, d, t] = await Promise.all([
        getFleetVehicles(),
        getDrivers(),
        getTrips(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setTrips(t);
    }
    loadData();
  }, []);

  const handleCompleteTrip = async (tripId: string) => {
    setUpdatingId(tripId);
    try {
      await updateTripStatus(
        tripId,
        'DELIVERED',
        'Cargo arrived and discharged at terminal dock. Signed waybill uploaded.',
        98560
      );
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                status: 'DELIVERED',
                actualArrival: 'Just now',
                driverNotes: 'Cargo arrived and discharged at terminal dock. Signed waybill uploaded.',
              }
            : t
        )
      );
    } finally {
      setUpdatingId(null);
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Truck className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">Transport &amp; Fleet Module</h1>
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              FD_Mod
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 pl-8">
            Manage heavy vehicles, driver manifests, trip dispatches, and real-time transit updates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'trips'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="h-4 w-4" />
          Trip Details &amp; Execution ({trips.length})
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'vehicles'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="h-4 w-4" />
          Fleet Vehicles ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'drivers'
              ? 'border-amber-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          Drivers Directory ({drivers.length})
        </button>
      </div>

      {/* Tab 1: Trips */}
      {activeTab === 'trips' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Active Cargo Trips &amp; Driver Dispatches</h3>
              <p className="text-xs text-slate-400">Track departure, estimated arrival, odometer readings, and driver notes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Trip ID</th>
                  <th className="pb-3 font-semibold">Route (Origin → Destination)</th>
                  <th className="pb-3 font-semibold">Vehicle &amp; Driver</th>
                  <th className="pb-3 font-semibold">Cargo Payload</th>
                  <th className="pb-3 font-semibold">Timeline</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Driver Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trips.map((t) => (
                  <tr key={t.tripNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-amber-400">{t.tripNumber}</td>
                    <td className="py-3">
                      <div className="font-semibold text-white">{t.origin}</div>
                      <div className="text-[10px] text-slate-400">↳ {t.destination}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-mono text-slate-200">{t.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-400">{t.driverName}</div>
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{t.cargoDescription}</div>
                      <div className="text-[10px] font-bold text-emerald-400">{t.weightTons} MT</div>
                    </td>
                    <td className="py-3 text-slate-400">
                      <div>Dep: {t.departureTime}</div>
                      <div className="text-[10px] text-slate-500">Est: {t.estimatedArrival}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          t.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : t.status === 'IN_TRANSIT'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {t.status === 'IN_TRANSIT' ? (
                        <button
                          onClick={() => handleCompleteTrip(t.id || t.tripNumber)}
                          disabled={updatingId === (t.id || t.tripNumber)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                        >
                          <FileCheck className="h-3 w-3" />
                          Mark Delivered
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Heavy Fleet Vehicles Registry</h3>
              <p className="text-xs text-slate-400">Prime movers, multi-axle trailers, and internal tug tractors</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Vehicle Number</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Make &amp; Model</th>
                  <th className="pb-3 font-semibold">Payload Capacity</th>
                  <th className="pb-3 font-semibold">Fitness Expiry</th>
                  <th className="pb-3 font-semibold">Odometer</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vehicles.map((v) => (
                  <tr key={v.vehicleNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-white">{v.vehicleNumber}</td>
                    <td className="py-3 font-mono text-amber-400">{v.vehicleType}</td>
                    <td className="py-3 text-slate-300">{v.makeModel}</td>
                    <td className="py-3 font-bold text-emerald-400">{v.capacityTons} MT</td>
                    <td className="py-3 text-slate-400">{v.fitnessExpiry}</td>
                    <td className="py-3 font-mono text-slate-300">{v.lastOdometerKm.toLocaleString()} km</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          v.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : v.status === 'IN_TRANSIT'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Drivers */}
      {activeTab === 'drivers' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Drivers Directory</h3>
              <p className="text-xs text-slate-400">Licensing, experience, safety ratings, and assigned vehicles</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Driver Name</th>
                  <th className="pb-3 font-semibold">License Number</th>
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Safety Rating</th>
                  <th className="pb-3 font-semibold">Contact</th>
                  <th className="pb-3 font-semibold">Assigned Vehicle</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drivers.map((d) => (
                  <tr key={d.licenseNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-white">{d.driverName}</td>
                    <td className="py-3 font-mono text-slate-400">{d.licenseNumber}</td>
                    <td className="py-3 text-slate-300">{d.experienceYears} Years</td>
                    <td className="py-3">
                      <span className="font-bold text-amber-400">★ {d.safetyRating}</span>
                    </td>
                    <td className="py-3 text-slate-300">{d.contactNumber}</td>
                    <td className="py-3 font-mono text-cyan-300">{d.assignedVehicleNumber || 'Unassigned'}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          d.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
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
      )}
    </div>
  );
}

