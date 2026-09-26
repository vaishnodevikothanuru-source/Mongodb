import React from 'react';
import { getPriorityBadgeStyle } from '../../utils/helpers';
import { Flame, Clock, Calendar } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const badgeClass = getPriorityBadgeStyle(priority);

  const getIcon = () => {
    if (priority === 'High') return <Flame className="w-3 h-3 text-rose-400" />;
    if (priority === 'Medium') return <Clock className="w-3 h-3 text-amber-400" />;
    return <Calendar className="w-3 h-3 text-slate-400" />;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeClass}`}
    >
      {getIcon()}
      {priority || 'Medium'} Priority
    </span>
  );
};
