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
  X,
  RotateCcw,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';

export default function MobileNavigation({ isOpen, onClose }) {
  const pathname = usePathname();
  const { settings, resetToDefaultData } = useWarehouse();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Stock In', href: '/stock-in', icon: PackagePlus },
    { name: 'New Sale (POS)', href: '/new-sale', icon: ShoppingCart, accent: true },
    { name: 'Inventory', href: '/inventory', icon: Boxes },
    { name: 'Customers & Credit', href: '/customers', icon: Users },
    { name: 'EOD Report', href: '/eod-report', icon: FileText },
    { name: 'Products', href: '/products', icon: Tag },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  CD
                </div>
                <div className="font-bold text-sm text-slate-900 truncate">
                  {settings.warehouseName || 'Warehouse'}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom drawer actions */}
            <div className="p-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Fixed Quick Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            pathname === '/' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="mt-0.5">Overview</span>
        </Link>

        <Link
          href="/stock-in"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            pathname === '/stock-in' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <PackagePlus className="w-5 h-5" />
          <span className="mt-0.5">Stock In</span>
        </Link>

        <Link
          href="/new-sale"
          className="flex flex-col items-center -mt-4 bg-emerald-600 text-white p-2.5 rounded-full shadow-md hover:bg-emerald-700 transition"
        >
          <ShoppingCart className="w-5 h-5" />
        </Link>

        <Link
          href="/inventory"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            pathname === '/inventory' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span className="mt-0.5">Stock</span>
        </Link>

        <Link
          href="/eod-report"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition ${
            pathname === '/eod-report' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="mt-0.5">EOD Report</span>
        </Link>
      </div>
    </>
  );
}
