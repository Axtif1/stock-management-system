'use client';

import React, { useState } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Building2, Clock, Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetToDefaultData } = useWarehouse();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({ ...settings });
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    showToast(
      language === 'hi' ? 'Settings save ho gayi!' : 'Settings updated successfully',
      'success'
    );
  };

  const handleReset = () => {
    resetToDefaultData();
    setFormData({ ...settings });
    showToast(
      language === 'hi' ? 'Demo data shuruwat jaisa ho gaya' : 'Demo data reset to factory state',
      'success'
    );
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        title={t('sett_title')}
        description={t('sett_subtitle')}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warehouse Identification */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Warehouse Identification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warehouse / Agency Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.warehouseName}
                onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proprietor / Manager
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warehouse Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Operating Standards */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operating Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Safety Stock Alert (Bottles)
              </label>
              <input
                type="number"
                min="10"
                value={formData.lowStockAlertThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockAlertThreshold: parseInt(e.target.value) || 150,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Bottles Per Crate
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultPackSize}
                onChange={(e) =>
                  setFormData({ ...formData, defaultPackSize: parseInt(e.target.value) || 24 })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('sett_reset_btn')}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>{t('sett_save_btn')}</span>
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title={t('sett_reset_btn')}
        message="Reset all test sales, stock entries, and newly created products back to default factory demo state?"
        confirmText={t('save')}
        cancelText={t('cancel')}
        isDanger={true}
      />
    </div>
  );
}
