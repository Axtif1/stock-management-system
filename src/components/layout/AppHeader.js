'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, RotateCcw, Calendar, ChevronDown, Languages } from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AppHeader({ onOpenMobileNav }) {
  const pathname = usePathname();
  const { settings, resetToDefaultData } = useWarehouse();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return t('nav_dashboard');
      case '/stock-in':
        return t('nav_stock_in');
      case '/new-sale':
        return t('nav_new_sale');
      case '/inventory':
        return t('nav_inventory');
      case '/customers':
        return t('nav_customers');
      case '/eod-report':
        return t('nav_eod_report');
      case '/products':
        return t('nav_products');
      case '/settings':
        return t('nav_settings');
      default:
        return 'Cold-Drink Warehouse';
    }
  };

  const handleReset = () => {
    resetToDefaultData();
    showToast(
      language === 'hi' ? 'Demo data wapas shuruwat jaisa ho gaya' : 'Demo data restored to initial state',
      'success'
    );
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile menu button & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              {getPageTitle(pathname)}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span>{settings.warehouseName || 'Warehouse'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">{t('header_shift_open')}</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Language Switcher [ EN | HI ] + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Segmented Control: [ EN | HI ] */}
          <div
            className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
            role="group"
            aria-label="Language Switcher"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'hi'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HI
            </button>
          </div>

          {/* Quick Demo Reset */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            title={t('header_reset_demo')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('header_reset_demo')}</span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {settings.ownerName ? settings.ownerName.charAt(0) : 'R'}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-800">
                {settings.ownerName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs animate-in zoom-in-95 duration-100"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{settings.ownerName}</div>
                  <div className="text-[11px] text-slate-400">{settings.phone}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('header_reset_demo')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title={t('header_reset_demo')}
        message={
          language === 'hi'
            ? 'Kya aap sach me demo data wapas default karna chahte hain? Sabhi naye bills aur stock refresh ho jayenge.'
            : 'Reset all sample inventory and sales records back to initial factory demo state?'
        }
        confirmText={t('save')}
        cancelText={t('cancel')}
        isDanger={true}
      />
    </>
  );
}
