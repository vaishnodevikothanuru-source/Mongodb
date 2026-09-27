import React from 'react';
import Link from 'next/link';
import { Navigation, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Error 404
        </span>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Transit Stop Not Found
        </h1>

        <p className="text-xs text-slate-500 leading-relaxed">
          The route, station, or page you are looking for has been moved or is currently not in service.
        </p>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Commuter Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
