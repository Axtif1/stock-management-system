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
  Flame,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';

export default function AppSidebar() {
  const pathname = usePathname();
  const { settings, getTodayStats } = useWarehouse();
  const stats = getTodayStats();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Stock In',
      href: '/stock-in',
      icon: PackagePlus,
      highlight: true,
    },
    {
      name: 'New Sale',
      href: '/new-sale',
      icon: ShoppingCart,
      badge: 'POS',
      accent: true,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Boxes,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      name: 'Customers & Credit',
      href: '/customers',
      icon: Users,
    },
    {
      name: 'EOD Report',
      href: '/eod-report',
      icon: FileText,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Tag,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tighter text-sm shadow-xs">
          CD
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-900 truncate tracking-tight">
            {settings.warehouseName || 'Cold-Drink Depot'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-500">Wholesale Ops</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-slate-100">
        <Link
          href="/new-sale"
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Sale</span>
        </Link>
        <Link
          href="/stock-in"
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <PackagePlus className="w-3.5 h-3.5 text-slate-600" />
          <span>Stock In</span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : item.accent ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live Warehouse Badge */}
      <div className="p-3 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between font-medium text-slate-700 mb-1">
            <span>Terminal</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {settings.ownerName} • {settings.timezone}
          </p>
        </div>
      </div>
    </aside>
  );
}
