'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function StatusBadge({ status, size = 'md' }) {
  const { t } = useLanguage();

  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  const normalized = String(status || '').toLowerCase().trim();

  if (['in stock', 'active', 'good standing', 'completed', 'paid', 'stock me hai'].includes(normalized)) {
    colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['low stock', 'warning', 'partially paid', 'due soon', 'stock kam hai'].includes(normalized)) {
    colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['out of stock', 'critical', 'overdue', 'inactive', 'cancelled', 'khatam ho gaya'].includes(normalized)) {
    colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  const statusKeyMap = {
    'in stock': 'status_in_stock',
    'low stock': 'status_low_stock',
    'out of stock': 'status_out_of_stock',
    'active': 'status_active',
    'warning': 'status_warning',
    'good standing': 'status_good_standing',
    'completed': 'status_completed',
  };

  const displayStatus = statusKeyMap[normalized] ? t(statusKeyMap[normalized]) : status;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${colorClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayStatus}</span>
    </span>
  );
}
