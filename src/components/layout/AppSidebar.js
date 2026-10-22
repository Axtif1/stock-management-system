'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  Boxes,
  Users,
  FileText,
  Tag,
  Settings,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AppSidebar() {
  const pathname = usePathname();
  const { settings } = useWarehouse();
  const { t } = useLanguage();

  // 6 Primary Navigation Items
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
    },
    {
      name: t('nav_new_sale'),
      href: '/new-sale',
      icon: ShoppingCart,
      isSale: true,
    },
    {
      name: t('nav_inventory'),
      href: '/inventory',
      icon: Boxes,
    },
    {
      name: t('nav_customers'),
      href: '/customers',
      icon: Users,
    },
    {
      name: t('nav_eod_report'),
      href: '/eod-report',
      icon: FileText,
    },
  ];

  // Secondary Navigation Items (Products & Settings)
  const secondaryNavItems = [
    {
      name: t('nav_products'),
      href: '/products',
      icon: Tag,
    },
    {
      name: t('nav_settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
          CD
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-900 truncate">
            {settings.warehouseName || 'Cold-Drink Depot'}
          </div>
          <div className="text-[10px] text-slate-400">Wholesale Counter</div>
        </div>
      </div>

      {/* Primary Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {primaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : item.isSale
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-white' : item.isSale ? 'text-emerald-600' : 'text-slate-500'
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}

        {/* Subtle Separator for Secondary Items */}
        <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Setup
          </div>
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Warehouse Status Bottom */}
      <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        {settings.ownerName} • {settings.timezone}
      </div>
    </aside>
  );
}
