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
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileNavigation({ isOpen, onClose }) {
  const pathname = usePathname();
  const { settings } = useWarehouse();
  const { t } = useLanguage();

  const primaryNavItems = [
    { name: t('nav_dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav_stock_in'), href: '/stock-in', icon: PackagePlus },
    { name: t('nav_new_sale'), href: '/new-sale', icon: ShoppingCart, accent: true },
    { name: t('nav_inventory'), href: '/inventory', icon: Boxes },
    { name: t('nav_customers'), href: '/customers', icon: Users },
    { name: t('nav_eod_report'), href: '/eod-report', icon: FileText },
  ];

  const secondaryNavItems = [
    { name: t('nav_products'), href: '/products', icon: Tag },
    { name: t('nav_settings'), href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-10 animate-in slide-in-from-left duration-150">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
              <div className="font-bold text-sm text-slate-900 truncate">
                {settings.warehouseName || 'Warehouse'}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {primaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : item.accent
                        ? 'text-emerald-700 bg-emerald-50 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Quick Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-1 py-1 flex items-center justify-around shadow-sm">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            pathname === '/' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="mt-0.5">{t('nav_dashboard')}</span>
        </Link>

        <Link
          href="/stock-in"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            pathname === '/stock-in' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span className="mt-0.5">{t('nav_stock_in')}</span>
        </Link>

        {/* Center Prominent New Sale Button */}
        <Link
          href="/new-sale"
          className="flex flex-col items-center -mt-3 bg-emerald-600 text-white p-2.5 rounded-full shadow hover:bg-emerald-700 transition"
          aria-label={t('nav_new_sale')}
        >
          <ShoppingCart className="w-5 h-5" />
        </Link>

        <Link
          href="/inventory"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            pathname === '/inventory' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span className="mt-0.5">{t('nav_inventory')}</span>
        </Link>

        <Link
          href="/customers"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            pathname === '/customers' ? 'text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="mt-0.5">{t('nav_customers')}</span>
        </Link>
      </div>
    </>
  );
}
