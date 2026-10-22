'use client';

import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  badge,
}) {
  const variantStyles = {
    default: {
      border: 'border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
    success: {
      border: 'border-emerald-200/90',
      iconBg: 'bg-emerald-50 text-emerald-700',
      valueColor: 'text-emerald-950',
    },
    warning: {
      border: 'border-amber-200/90',
      iconBg: 'bg-amber-50 text-amber-700',
      valueColor: 'text-amber-950',
    },
    danger: {
      border: 'border-rose-200/90',
      iconBg: 'bg-rose-50 text-rose-700',
      valueColor: 'text-rose-950',
    },
    brand: {
      border: 'border-blue-200/90',
      iconBg: 'bg-blue-50 text-blue-700',
      valueColor: 'text-blue-950',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${style.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight truncate ${style.valueColor}`}>
              {value}
            </h3>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${style.iconBg}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
