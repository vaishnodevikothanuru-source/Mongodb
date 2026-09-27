'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Sparkles, ArrowRight, Clock, ShieldCheck, Zap } from 'lucide-react';

interface DynamicAlternativeAlertProps {
  delayMinutes: number;
  routeName: string;
  alternativeRouteName?: string;
  alternativeRouteId?: string;
  timeSavingsText?: string;
  onSwitchRoute?: (routeId: string) => void;
}

export function DynamicAlternativeAlert({
  delayMinutes = 8,
  routeName = 'Metro Yellow Line',
  alternativeRouteName = 'Metro Blue Line → Bus 42',
  alternativeRouteId = 'MXD-MTR-BUS-42',
  timeSavingsText = '12 mins faster • Low crowd • ₹35',
  onSwitchRoute,
}: DynamicAlternativeAlertProps) {
  if (!delayMinutes || delayMinutes < 4) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-300 dark:border-amber-800/80 p-4 sm:p-5 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Delay & Recommendation Explanation */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30 flex-shrink-0 animate-bounce">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                Delay Alert: +{delayMinutes} mins
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Smart Bypass Ready
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
              Your route ({routeName}) has a {delayMinutes}-minute delay.
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Recommendation Engine generated an alternative bypass:{' '}
              <strong className="text-slate-900 dark:text-white">{alternativeRouteName}</strong> (
              {timeSavingsText}).
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => onSwitchRoute && onSwitchRoute(alternativeRouteId)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95"
          >
            <span>Switch to Faster Route</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DynamicAlternativeAlert;
