'use client';

import React from 'react';
import { X, CheckCircle, Clock, IndianRupee, Shuffle, Footprints, AlertCircle, Sparkles } from 'lucide-react';
import CrowdIndicator from './CrowdIndicator';
import TransitStatusBadge from './TransitStatusBadge';

interface RouteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: any[];
  onSelectRoute: (routeId: string) => void;
}

export function RouteComparisonModal({
  isOpen,
  onClose,
  routes = [],
  onSelectRoute,
}: RouteComparisonModalProps) {
  if (!isOpen || routes.length === 0) return null;

  // Comparison matrix factors
  const factors = [
    { key: 'travelTime', label: 'Travel Time', format: (r: any) => `${r.estimatedTime + (r.delayMinutes || 0)} mins` },
    { key: 'fare', label: 'Fare', format: (r: any) => `₹${r.fare}` },
    { key: 'transfers', label: 'Transfers', format: (r: any) => (r.transfers === 0 ? 'Direct (0)' : `${r.transfers} transfer`) },
    { key: 'walkingTime', label: 'Walking', format: (r: any) => `${r.walkingTime || 4} mins` },
    { key: 'crowdLevel', label: 'Crowd Level', format: (r: any) => <CrowdIndicator level={r.crowdLevel} size="sm" /> },
    { key: 'delayMinutes', label: 'Live Delay', format: (r: any) => <TransitStatusBadge status={r.status} delayMinutes={r.delayMinutes} /> },
    { key: 'co2SavedKg', label: 'CO2 Saved', format: (r: any) => `~${r.co2SavedKg || 1.8} kg` },
    { key: 'frequency', label: 'Frequency', format: (r: any) => `Every ${r.frequencyMinutes || 5} min` },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Route Comparison Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side factor analysis to help you pick the best commute option
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-l-xl w-44">
                  Factor
                </th>
                {routes.map((routeItem: any, idx: number) => {
                  const r = routeItem.route || routeItem;
                  return (
                    <th
                      key={r.routeId || idx}
                      className="p-3.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/20 min-w-[200px]"
                    >
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
                        Route {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="font-semibold text-sm truncate">{r.name}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {factors.map((factor) => (
                <tr key={factor.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-800/20">
                    {factor.label}
                  </td>
                  {routes.map((routeItem: any, idx: number) => {
                    const r = routeItem.route || routeItem;
                    return (
                      <td key={r.routeId || idx} className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">
                        {factor.format(r)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Selection Row */}
              <tr>
                <td className="p-3.5 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-800/20">
                  Action
                </td>
                {routes.map((routeItem: any, idx: number) => {
                  const r = routeItem.route || routeItem;
                  return (
                    <td key={r.routeId || idx} className="p-3.5">
                      <button
                        onClick={() => {
                          onSelectRoute(r.routeId || r.id);
                          onClose();
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        Choose Route {String.fromCharCode(65 + idx)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RouteComparisonModal;
