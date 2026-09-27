'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Route as RouteIcon,
  Radio,
  Star,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import CrowdIndicator from '@/components/CrowdIndicator';
import TransitStatusBadge from '@/components/TransitStatusBadge';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'routes' | 'updates' | 'users' | 'feedback'>('routes');
  const [stats, setStats] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Route Modal
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteType, setNewRouteType] = useState('metro');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newFare, setNewFare] = useState(35);
  const [newTime, setNewTime] = useState(30);

  // Broadcast Alert Modal
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertRouteId, setAlertRouteId] = useState('MTR-BLU-01');
  const [alertDelay, setAlertDelay] = useState(10);
  const [alertCrowd, setAlertCrowd] = useState<'low' | 'moderate' | 'high'>('high');
  const [alertStatus, setAlertStatus] = useState('delayed');
  const [alertMsg, setAlertMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, routesRes, updatesRes, usersRes, fbRes] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/routes').then((r) => r.json()),
        fetch('/api/transit/updates').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/feedback').then((r) => r.json()),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (routesRes.routes) setRoutes(routesRes.routes);
      if (updatesRes.updates) setUpdates(updatesRes.updates);
      if (usersRes.users) setUsersList(usersRes.users);
      if (fbRes.feedbacks) setFeedbacks(fbRes.feedbacks);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRouteName,
          transportType: newRouteType,
          origin: newOrigin,
          destination: newDest,
          fare: Number(newFare),
          estimatedTime: Number(newTime),
          distance: 18,
          transfers: 0,
          walkingTime: 4,
          crowdLevel: 'low',
          status: 'on-time',
        }),
      });
      setRouteModalOpen(false);
      await fetchAdminData();
    } catch (e) {}
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm('Delete this route from transit authority database?')) {
      try {
        await fetch(`/api/routes/${id}`, { method: 'DELETE' });
        setRoutes((prev) => prev.filter((r) => r.routeId !== id && r.id !== id && r._id !== id));
      } catch (e) {}
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedRoute = routes.find((r) => r.routeId === alertRouteId) || routes[0];
      await fetch('/api/transit/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: alertRouteId,
          routeName: selectedRoute?.name || 'Corridor',
          transportType: selectedRoute?.transportType || 'metro',
          delay: Number(alertDelay),
          crowdLevel: alertCrowd,
          status: alertStatus,
          message: alertMsg || `Delay notice of +${alertDelay}m broadcasted to commuter radar`,
          severity: alertDelay > 8 ? 'warning' : 'info',
        }),
      });
      setAlertModalOpen(false);
      await fetchAdminData();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Transit Authority Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Admin Command & Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage network routes, broadcast live delay alerts, and review commuter satisfaction feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Broadcast Live Delay</span>
            </button>
            <button
              onClick={() => setRouteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transit Route</span>
            </button>
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* System KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Commuters</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalUsers || usersList.length || 2}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active transit profiles</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Corridors</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {routes.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Metro, Bus & Train Lines</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Daily Route Searches</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats?.dailySearches || 1420}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Scored by AI Engine</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Commuter Feedback</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {feedbacks.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Avg Rating 4.8 / 5.0</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'routes', label: `Transit Corridors (${routes.length})`, icon: RouteIcon },
            { id: 'updates', label: `Live Broadcasts (${updates.length})`, icon: Radio },
            { id: 'users', label: `User Accounts (${usersList.length})`, icon: Users },
            { id: 'feedback', label: `Commuter Feedback (${feedbacks.length})`, icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Routes Management */}
        {activeTab === 'routes' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Transit Routes & Schedules
              </h3>
              <button
                onClick={() => setRouteModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                + Add Route
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Route ID & Name</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Origin → Destination</th>
                    <th className="p-4">Time / Fare</th>
                    <th className="p-4">Status & Crowd</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {routes.map((r) => (
                    <tr key={r.routeId || r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white">{r.name}</span>
                        <span className="block text-[10px] text-slate-400">{r.routeId}</span>
                      </td>
                      <td className="p-4 uppercase font-bold text-emerald-600">{r.transportType}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {r.origin} → {r.destination}
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {r.estimatedTime}m • ₹{r.fare}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TransitStatusBadge status={r.status} delayMinutes={r.delayMinutes} />
                          <CrowdIndicator level={r.crowdLevel} size="sm" />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/routes/${r.routeId || r.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="View"
                          >
                            <RouteIcon className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteRoute(r.routeId || r.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Live Updates Management */}
        {activeTab === 'updates' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Broadcasts Dispatched
              </h3>
              <button
                onClick={() => setAlertModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs"
              >
                + New Delay Broadcast
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {updates.map((up) => (
                <div
                  key={up.id || up._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {up.routeName}
                      </span>
                      <TransitStatusBadge status={up.status} delayMinutes={up.delay} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{up.message}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(up.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: User Accounts */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Commuter & Operator Accounts
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Home Location</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id || u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{u.homeLocation?.name || 'Sector 14'}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Commuter Feedback */}
        {activeTab === 'feedback' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Commuter Feedback & Ratings
            </h3>

            <div className="space-y-3 text-xs">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id || fb._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {fb.userName} ({fb.routeName})
                    </span>
                    <span className="text-amber-500 font-bold">★ {fb.rating} / 5</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">&ldquo;{fb.comment}&rdquo;</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Crowd observed: {fb.crowdFeedback}</span>
                    <span>• Delay: +{fb.delayFeedbackMinutes || 0} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Route Modal */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add New Transit Route
            </h3>
            <form onSubmit={handleCreateRoute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Route Name
                </label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Metro Silver Line Express"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Mode
                  </label>
                  <select
                    value={newRouteType}
                    onChange={(e) => setNewRouteType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="metro">Metro</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={newFare}
                    onChange={(e) => setNewFare(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Estimated Travel Time (Minutes)
                </label>
                <input
                  type="number"
                  value={newTime}
                  onChange={(e) => setNewTime(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Broadcast Transit Delay Notice
            </h3>
            <form onSubmit={handleBroadcastAlert} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Corridor Line
                </label>
                <select
                  value={alertRouteId}
                  onChange={(e) => setAlertRouteId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                >
                  {routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.name} ({r.routeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Delay (Minutes)
                  </label>
                  <input
                    type="number"
                    value={alertDelay}
                    onChange={(e) => setAlertDelay(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Crowd Level
                  </label>
                  <select
                    value={alertCrowd}
                    onChange={(e) => setAlertCrowd(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="low">Low (🟢)</option>
                    <option value="moderate">Moderate (🟡)</option>
                    <option value="high">High (🔴)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Broadcast Message
                </label>
                <textarea
                  value={alertMsg}
                  onChange={(e) => setAlertMsg(e.target.value)}
                  rows={2}
                  placeholder="e.g. Signal optimization causing 10 min headway delay"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                >
                  Broadcast to Radar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
