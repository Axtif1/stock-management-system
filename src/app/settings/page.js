'use client';

import React, { useState } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Building2, Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { settings, resetToDefaultData } = useWarehouse();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [warehouseName, setWarehouseName] = useState(settings.warehouseName || '');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    settings.warehouseName = warehouseName;
    if (typeof window !== 'undefined') {
      localStorage.setItem('wm_min_settings_v2', JSON.stringify({ warehouseName }));
    }
    showToast(language === 'hi' ? 'Settings save ho gayi!' : 'Settings saved!', 'success');
  };

  const handleReset = () => {
    resetToDefaultData();
    setWarehouseName('Om Sai Cold Drinks Depot');
    showToast(language === 'hi' ? 'Demo stock reset ho gaya!' : 'Demo stock reset!', 'info');
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-10">
      <PageHeader
        title={t('nav_settings')}
        description={language === 'hi' ? 'Warehouse ki settings' : 'Warehouse preferences'}
      />

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {language === 'hi' ? 'Warehouse / Godown Ka Naam' : 'Warehouse Name'}
          </label>
          <input
            type="text"
            required
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reset_demo')}</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('save')}</span>
          </button>
        </div>
      </form>

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
    </div>
  );
}
