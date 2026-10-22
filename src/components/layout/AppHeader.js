'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, RotateCcw } from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function AppHeader({ onOpenMobileNav }) {
  const pathname = usePathname();
  const { settings, resetToDefaultData } = useWarehouse();
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const [showResetModal, setShowResetModal] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return t('nav_dashboard');
      case '/stock-in':
        return t('nav_stock_in');
      case '/stock-out':
      case '/new-sale':
        return t('nav_stock_out');
      case '/inventory':
        return t('nav_inventory');
      case '/settings':
        return t('nav_settings');
      default:
        return t('nav_dashboard');
    }
  };

  const handleReset = () => {
    resetToDefaultData();
    showToast(
      language === 'hi' ? 'Demo stock reset ho gaya!' : 'Demo stock reset to default!',
      'info'
    );
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-3 sm:px-4">
        {/* Left: Mobile Drawer Trigger & Page Name */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {getPageTitle(pathname)}
            </h1>
            <div className="text-[11px] text-slate-400 truncate hidden sm:block">
              {settings.warehouseName}
            </div>
          </div>
        </div>

        {/* Right: Language Switcher [ EN | HI ] + Reset */}
        <div className="flex items-center gap-2">
          {/* Segmented language switcher */}
          <div
            className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
            role="group"
            aria-label="Language"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
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
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
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
            title={t('reset_demo')}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title={t('reset_demo')}
        message={t('reset_confirm')}
        confirmText={t('save')}
        cancelText={t('cancel')}
        isDanger={true}
      />
    </>
  );
}
