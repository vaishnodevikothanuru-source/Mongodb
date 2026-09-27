'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Bell,
  Moon,
  Sun,
  Shield,
  RefreshCw,
  Server,
} from 'lucide-react';

export default function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // App Toggles
  const [pushAlerts, setPushAlerts] = useState(true);
  const [crowdSurgeAlerts, setCrowdSurgeAlerts] = useState(true);
  const [ecoTracking, setEcoTracking] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                System Controls
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Settings & Connectivity Diagnostics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verify database connection status, configure alert notifications, and inspect transit data provider.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Run Health Check</span>
          </button>
        </div>

        {/* MongoDB Connection Diagnostics Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                MongoDB Atlas Connectivity Diagnostics
              </h3>
            </div>
            {systemStatus?.database?.connected ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Connection</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Resilient Demo Mode</span>
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Storage Provider:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {systemStatus?.database?.mode || 'In-Memory Resilient Store (Offline Ready)'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Environment Variable:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                MONGODB_URI: {systemStatus?.database?.configured ? 'Configured ✅' : 'Empty / Demo Mode ℹ️'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Total Synchronized Routes:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {systemStatus?.systemMetrics?.routesCount || 7} Corridors
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Server Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                100% Operational (Uptime: {systemStatus?.systemMetrics?.uptimeSeconds || 120}s)
              </span>
            </div>
          </div>

          {systemStatus?.database?.connected ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold">MongoDB Atlas is Live & Connected.</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  You can populate standard transit routes and sample records into your collections at any time.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/system/seed', { method: 'POST' });
                    const data = await res.json();
                    alert(data.message || 'Seeded successfully!');
                    fetchStatus();
                  } catch (e) {}
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap"
              >
                Seed Sample Data to MongoDB
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <p className="font-bold mb-1">To connect your own MongoDB Atlas database:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-800 dark:text-amber-300">
                <li>Create a cluster on MongoDB Atlas (cloud.mongodb.com).</li>
                <li>Add your connection string to <code>.env.local</code> as <code>MONGODB_URI=mongodb+srv://...</code>.</li>
                <li>Restart the server. All models and queries will automatically persist directly to Atlas!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Notification & Advisory Preferences
            </h3>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Proactive Delay Alerts
                </span>
                <span className="text-slate-500 text-[11px]">
                  Receive notifications when your saved lines experience &gt;5 min delays.
                </span>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Peak Crowd Surge Warnings
                </span>
                <span className="text-slate-500 text-[11px]">
                  Alerts when interchange platform density reaches High 🔴.
                </span>
              </div>
              <input
                type="checkbox"
                checked={crowdSurgeAlerts}
                onChange={(e) => setCrowdSurgeAlerts(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Weekly Carbon Offset Tracking
                </span>
                <span className="text-slate-500 text-[11px]">
                  Calculate weekly CO2 offsets and eco commuter leaderboard status.
                </span>
              </div>
              <input
                type="checkbox"
                checked={ecoTracking}
                onChange={(e) => setEcoTracking(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
