'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Train,
  Bus,
  Footprints,
  Clock,
  IndianRupee,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Navigation2,
  Sparkles,
  Zap,
  Leaf,
  Layers,
  Info,
} from 'lucide-react';
import CrowdIndicator from './CrowdIndicator';
import TransitStatusBadge from './TransitStatusBadge';
import { ScoredRoute } from '@/lib/recommendation';

interface RouteCardProps {
  scoredRoute: ScoredRoute | any;
  isSelected?: boolean;
  isCompared?: boolean;
  onToggleCompare?: () => void;
  onSelect?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function RouteCard({
  scoredRoute,
  isSelected = false,
  isCompared = false,
  onToggleCompare,
  onSelect,
  onSave,
  isSaved = false,
}: RouteCardProps) {
  const [showWhyReason, setShowWhyReason] = useState(false);
  const route = scoredRoute.route || scoredRoute;
  const score = scoredRoute.score || 85;
  const whyReason =
    scoredRoute.whyThisRoute ||
    'Recommended for balanced speed, economical pricing, and comfortable crowd levels.';
  const badge = scoredRoute.badge;

  const getModeIcon = (mode: string) => {
    switch ((mode || '').toLowerCase()) {
      case 'metro':
        return <Train className="w-4 h-4 text-blue-500" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-amber-500" />;
      case 'train':
        return <Train className="w-4 h-4 text-purple-500" />;
      case 'walk':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      default:
        return <Shuffle className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900 ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl dark:border-emerald-500'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Banner for Badges / Best Overall */}
      {badge && (
        <div className="absolute -top-3 left-6 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="w-3.5 h-3.5" />
            {badge}
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Header: Route Name, Mode Badges, Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase">
                {getModeIcon(route.transportType)}
                <span>{route.transportType}</span>
              </span>

              <TransitStatusBadge status={route.status} delayMinutes={route.delayMinutes} />

              <CrowdIndicator level={route.crowdLevel} size="sm" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {route.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {route.origin} → {route.destination}
            </p>
          </div>

          {/* Recommendation Match Score */}
          <div className="text-right flex-shrink-0 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
              Match Score
            </span>
            <div className="flex items-baseline justify-end gap-0.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-300">
                {score}
              </span>
              <span className="text-xs font-semibold text-emerald-600/70">/100</span>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Travel Time</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {route.estimatedTime + (route.delayMinutes || 0)} mins
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Fare</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{route.fare}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Shuffle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Transfers</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {route.transfers === 0 ? 'Direct (0)' : `${route.transfers} transfer`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Walk Time</span>
              <span className="font-bold text-slate-900 dark:text-white">{route.walkingTime || 4} mins</span>
            </div>
          </div>
        </div>

        {/* Why this route Accordion */}
        <div className="mt-3.5">
          <button
            onClick={() => setShowWhyReason(!showWhyReason)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why this route recommendation?</span>
            </div>
            {showWhyReason ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showWhyReason && (
            <div className="p-3 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800 animate-in fade-in">
              <p className="font-medium text-slate-800 dark:text-slate-200">{whyReason}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-500" /> Saves ~{route.co2SavedKg || 1.8}kg CO2
                </span>
                <span>• Frequency: every {route.frequencyMinutes || 5} mins</span>
                {route.airConditioned && <span>• AC Equipped</span>}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Compare */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Compare Checkbox */}
          {onToggleCompare && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={onToggleCompare}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Compare</span>
            </label>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {onSave && (
              <button
                onClick={onSave}
                title="Save Journey"
                className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            )}

            <Link
              href={`/routes/${route.routeId || route.id}`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Step-by-Step
            </Link>

            <button
              onClick={onSelect}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow transition-all active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
              }`}
            >
              {isSelected ? 'Selected Route' : 'Select on Map'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteCard;
