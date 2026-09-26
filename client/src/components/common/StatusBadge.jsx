import React from 'react';
import { getStatusBadgeStyle } from '../../utils/helpers';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const config = getStatusBadgeStyle(status);
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.class} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};
