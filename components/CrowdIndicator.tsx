import React from 'react';
import { Users, AlertCircle } from 'lucide-react';

interface CrowdIndicatorProps {
  level: 'low' | 'moderate' | 'high' | string;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CrowdIndicator({ level = 'moderate', showBar = false, size = 'md' }: CrowdIndicatorProps) {
  const normLevel = (level || 'moderate').toLowerCase();

  let label = 'Moderate Crowd';
  let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  let dotColor = 'bg-amber-500';
  let barWidth = '50%';
  let barColor = 'bg-amber-500';
  let emoji = '🟡';

  if (normLevel === 'low') {
    label = 'Low Crowd (Seats Available)';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    dotColor = 'bg-emerald-500';
    barWidth = '22%';
    barColor = 'bg-emerald-500';
    emoji = '🟢';
  } else if (normLevel === 'high') {
    label = 'Heavy Crowding (Standing Only)';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    dotColor = 'bg-rose-500';
    barWidth = '88%';
    barColor = 'bg-rose-500';
    emoji = '🔴';
  }

  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${badgeColor} ${textSize}`}>
        <span className="text-xs">{emoji}</span>
        <span className="capitalize font-semibold">{normLevel}</span>
        <span className="hidden sm:inline text-opacity-80">Crowd</span>
      </div>
      {showBar && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 rounded-full ${barColor}`} style={{ width: barWidth }} />
        </div>
      )}
    </div>
  );
}

export default CrowdIndicator;
