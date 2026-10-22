'use client';

import React from 'react';

export default function StatusBadge({ status, type = 'stock', size = 'md' }) {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  const normalized = String(status || '').toLowerCase().trim();

  if (['in stock', 'active', 'good standing', 'completed', 'paid'].includes(normalized)) {
    colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['low stock', 'warning', 'partially paid', 'due soon'].includes(normalized)) {
    colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['out of stock', 'critical', 'overdue', 'inactive', 'cancelled'].includes(normalized)) {
    colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['cash'].includes(normalized)) {
    colorClass = 'bg-green-50 text-green-800 border-green-200';
    dotColor = 'bg-green-500';
  } else if (['upi'].includes(normalized)) {
    colorClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    dotColor = 'bg-indigo-500';
  } else if (['credit'].includes(normalized)) {
    colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
}
