'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function DbStatusBanner() {
  const [dbState, setDbState] = useState<{ connected: boolean; mode: string; error: string | null } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.database) {
          setDbState(data.database);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  if (dismissed || !dbState) return null;

  if (dbState.connected) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>MongoDB Atlas Connected:</strong> Database is active and live synchronizing user profiles, routes, and commute logs.
            </span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Resilient Demo Mode Active:</strong> MongoDB URI not configured or offline. Running on full in-memory store with live seed data. (To connect MongoDB, provide <code>MONGODB_URI</code> in <code>.env.local</code>).
          </span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-amber-700 hover:text-amber-950 dark:text-amber-300">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default DbStatusBanner;
