'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  RotateCcw,
  Calendar,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AppHeader({ onOpenMobileNav }) {
  const pathname = usePathname();
  const { settings, resetToDefaultData, getTodayStats } = useWarehouse();
  const { showToast } = useToast();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const stats = getTodayStats();

  const pageTitles = {
    '/': 'Dashboard Overview',
    '/stock-in': 'Incoming Stock Entry',
    '/new-sale': 'Point of Sale (New Bill)',
    '/inventory': 'Warehouse Stock & Inventory',
    '/customers': 'Customer Ledger & Outstanding',
    '/eod-report': 'End-of-Day Closing Report',
    '/products': 'Product & Pack Configuration',
    '/settings': 'Warehouse & System Settings',
  };

  const currentTitle = pageTitles[pathname] || 'Warehouse Management';

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleReset = () => {
    resetToDefaultData();
    showToast('Demo data successfully restored to factory defaults', 'success');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {todayFormatted}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline text-emerald-600 font-semibold">
                Shift: Day (Open)
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Reset */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            title="Reset Mock Data"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Low Stock Indicator */}
          {stats.lowStockCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{stats.lowStockCount} Low Stock Items</span>
            </div>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {settings.ownerName ? settings.ownerName.charAt(0) : 'R'}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-slate-800 leading-tight">
                  {settings.ownerName || 'Warehouse Admin'}
                </div>
                <div className="text-[10px] text-slate-500">Wholesale Manager</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-in zoom-in-95 duration-100"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{settings.ownerName}</div>
                  <div className="text-slate-500 truncate">{settings.phone}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    GSTIN: {settings.gstin}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    <span>Reset All Mock Data</span>
                  </button>
                </div>

                <div className="px-3.5 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Version 1.0.0</span>
                  <span className="text-emerald-600 font-medium">Local Mode</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation for demo reset */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Reset Demo Data"
        message="This will reset all inventory, sales, customer balances, and repayments to the default realistic demo state. Any test entries created will be cleared."
        confirmText="Reset Now"
        isDanger={true}
      />
    </>
  );
}
