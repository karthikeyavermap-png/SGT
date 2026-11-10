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
  PlusCircle,
  X,
} from 'lucide-react';
import {
  FleetVehicle,
  DriverRecord,
  TripRecord,
  getFleetVehicles,
  getDrivers,
  getTrips,
  updateTripStatus,
  createTrip,
  createFleetVehicle,
  createDriver,
} from '@/lib/modules-api';

export default function TransportFleetModulePage() {
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles' | 'drivers'>('trips');
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal State
  const [modalType, setModalType] = useState<'trip' | 'vehicle' | 'driver' | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Forms
  const [tripForm, setTripForm] = useState({
    origin: 'Yard Bay A-01',
    destination: '',
    vehicleNumber: 'MH-12-QZ-4921',
    driverName: 'Rajesh Sharma',
    cargoDescription: 'Heavy Steel Coils',
    weightTons: 28.0,
    driverNotes: 'Green corridor transit',
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    vehicleType: 'PRIME_MOVER_40T' as const,
    makeModel: 'Tata Prima 4928.S',
    capacityTons: 40.0,
    fitnessExpiry: '2028-05-20',
    insuranceExpiry: '2028-04-10',
    lastOdometerKm: 120000,
  });

  const [driverForm, setDriverForm] = useState({
    driverName: '',
    licenseNumber: '',
    licenseExpiry: '2030-08-15',
    contactNumber: '+91 98230 00000',
    experienceYears: 8.0,
    assignedVehicleNumber: 'MH-12-QZ-4921',
  });

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

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createTrip(tripForm);
      if (res) {
        setTrips([res, ...trips]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createFleetVehicle(vehicleForm);
      if (res) {
        setVehicles([res, ...vehicles]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createDriver(driverForm);
      if (res) {
        setDrivers([res, ...drivers]);
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

        {/* Action Button depending on Tab */}
        <div>
          {activeTab === 'trips' && (
            <button
              onClick={() => setModalType('trip')}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Dispatch New Trip
            </button>
          )}
          {activeTab === 'vehicles' && (
            <button
              onClick={() => setModalType('vehicle')}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Add Fleet Vehicle
            </button>
          )}
          {activeTab === 'drivers' && (
            <button
              onClick={() => setModalType('driver')}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Onboard Driver
            </button>
          )}
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

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">
                {modalType === 'trip' && 'Dispatch New Cargo Trip'}
                {modalType === 'vehicle' && 'Register Fleet Vehicle'}
                {modalType === 'driver' && 'Onboard Commercial Driver'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalType === 'trip' && (
              <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Origin Point</label>
                    <input
                      type="text"
                      required
                      value={tripForm.origin}
                      onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Destination</label>
                    <input
                      type="text"
                      required
                      value={tripForm.destination}
                      onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                      placeholder="e.g. JNPT Terminal Gate 3"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Assigned Vehicle</label>
                    <input
                      type="text"
                      required
                      value={tripForm.vehicleNumber}
                      onChange={(e) => setTripForm({ ...tripForm, vehicleNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Driver Name</label>
                    <input
                      type="text"
                      required
                      value={tripForm.driverName}
                      onChange={(e) => setTripForm({ ...tripForm, driverName: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Cargo Description</label>
                    <input
                      type="text"
                      required
                      value={tripForm.cargoDescription}
                      onChange={(e) => setTripForm({ ...tripForm, cargoDescription: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payload (MT)</label>
                    <input
                      type="number"
                      required
                      value={tripForm.weightTons}
                      onChange={(e) => setTripForm({ ...tripForm, weightTons: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-amber-600 py-2.5 font-bold text-white transition hover:bg-amber-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Dispatching...' : 'Dispatch Vehicle on Route'}
                </button>
              </form>
            )}

            {modalType === 'vehicle' && (
              <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Vehicle Registration #</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                    placeholder="e.g. MH-12-AB-1234"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Vehicle Type</label>
                    <select
                      value={vehicleForm.vehicleType}
                      onChange={(e: any) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="PRIME_MOVER_40T">PRIME_MOVER_40T</option>
                      <option value="TRAILER_MULTI_AXLE">TRAILER_MULTI_AXLE</option>
                      <option value="TERMINAL_TUG_ITV">TERMINAL_TUG_ITV</option>
                      <option value="RIGID_TRUCK">RIGID_TRUCK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payload Tons</label>
                    <input
                      type="number"
                      required
                      value={vehicleForm.capacityTons}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, capacityTons: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-amber-600 py-2.5 font-bold text-white transition hover:bg-amber-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </form>
            )}

            {modalType === 'driver' && (
              <form onSubmit={handleCreateDriver} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    value={driverForm.driverName}
                    onChange={(e) => setDriverForm({ ...driverForm, driverName: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Commercial License #</label>
                    <input
                      type="text"
                      required
                      value={driverForm.licenseNumber}
                      onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      value={driverForm.experienceYears}
                      onChange={(e) => setDriverForm({ ...driverForm, experienceYears: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-amber-600 py-2.5 font-bold text-white transition hover:bg-amber-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Onboarding...' : 'Onboard Driver'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
