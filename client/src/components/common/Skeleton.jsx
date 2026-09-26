import React from 'react';

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/40 animate-pulse">
      <div className="aspect-[2/3] bg-slate-700/50 w-full" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-slate-700/60 rounded w-3/4" />
        <div className="h-3 bg-slate-700/40 rounded w-1/2" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 bg-slate-700/30 rounded-full w-14" />
          <div className="h-5 bg-slate-700/30 rounded-full w-14" />
        </div>
      </div>
    </div>
  );
};

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};
