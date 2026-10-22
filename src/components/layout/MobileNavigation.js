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
  X,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileNavigation({ isOpen, onClose }) {
  const pathname = usePathname();
  const { settings } = useWarehouse();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav_dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav_stock_in'), href: '/stock-in', icon: PackagePlus },
    { name: t('nav_stock_out'), href: '/stock-out', icon: PackageMinus },
    { name: t('nav_inventory'), href: '/inventory', icon: Boxes },
  ];

  return (
    <>
      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 left-0 w-60 bg-white shadow-xl flex flex-col z-10">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 truncate">
                {settings.warehouseName || 'Warehouse'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === '/stock-out' && pathname === '/new-sale');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-100">
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('nav_settings')}</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Simple 4-Item Bottom Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/stock-out' && pathname === '/new-sale');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 text-xs font-bold transition ${
                isActive ? 'text-slate-900 font-black' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
