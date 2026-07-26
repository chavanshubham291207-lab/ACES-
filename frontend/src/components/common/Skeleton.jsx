import React from 'react';

export const CardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3"></div>
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="animate-pulse space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl w-full"></div>
    ))}
  </div>
);
