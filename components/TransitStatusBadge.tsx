import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface TransitStatusBadgeProps {
  status: 'on-time' | 'delayed' | 'disrupted' | 'cancelled' | string;
  delayMinutes?: number;
}

export function TransitStatusBadge({ status = 'on-time', delayMinutes = 0 }: TransitStatusBadgeProps) {
  const normStatus = (status || 'on-time').toLowerCase();

  if (normStatus === 'delayed' || delayMinutes > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Delayed {delayMinutes ? `+${delayMinutes}m` : ''}</span>
      </span>
    );
  }

  if (normStatus === 'disrupted' || normStatus === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span className="capitalize">{normStatus}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>On Time</span>
    </span>
  );
}

export default TransitStatusBadge;
