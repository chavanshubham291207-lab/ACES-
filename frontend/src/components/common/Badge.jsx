import React from 'react';

export const RoleBadge = ({ role }) => {
  const styles = {
    'Super Admin': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    'President': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Vice President': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    'Secretary': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Treasurer': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Team Lead': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    'Member': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[role] || styles['Member']}`}>
      {role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const isPresent = status === 'Present' || status === 'active';
  const isLate = status === 'Late';

  return (
    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase border ${
      isPresent
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
        : isLate
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
    }`}>
      {status}
    </span>
  );
};
