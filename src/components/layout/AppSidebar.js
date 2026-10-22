'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  Boxes,
  Settings,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AppSidebar() {
  const pathname = usePathname();
  const { settings } = useWarehouse();
  const { t } = useLanguage();

  // Strictly 4 Primary Navigation Options
  const primaryNavItems = [
    {
      name: t('nav_dashboard'),
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: t('nav_stock_in'),
      href: '/stock-in',
      icon: PackagePlus,
      color: 'text-emerald-600',
    },
    {
      name: t('nav_stock_out'),
      href: '/stock-out',
      icon: PackageMinus,
      color: 'text-blue-600',
    },
    {
      name: t('nav_inventory'),
      href: '/inventory',
      icon: Boxes,
      color: 'text-slate-600',
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-100 gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
          CD
        </div>
        <div className="font-bold text-xs text-slate-900 truncate">
          {settings.warehouseName || 'Warehouse'}
        </div>
      </div>

      {/* 4 Main Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {primaryNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/stock-out' && pathname === '/new-sale');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : item.color || 'text-slate-500'
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Small Secondary Option: Settings */}
      <div className="p-3 border-t border-slate-100">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition ${
            pathname === '/settings' ? 'bg-slate-100 text-slate-900' : ''
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>{t('nav_settings')}</span>
        </Link>
      </div>
    </aside>
  );
}
