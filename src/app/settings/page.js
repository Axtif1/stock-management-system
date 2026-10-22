'use client';

import React, { useState } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
  Settings,
  Building2,
  Clock,
  Shield,
  Palette,
  RotateCcw,
  CheckCircle2,
  Save,
  Boxes,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, resetToDefaultData } = useWarehouse();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ ...settings });
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    showToast('Warehouse configurations updated successfully', 'success');
  };

  const handleReset = () => {
    resetToDefaultData();
    setFormData({ ...settings });
    showToast('Factory demo defaults restored', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse & System Settings"
        description="Configure depot branding, operational parameters, default pack conversion rates, and localized Indian business formats."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Warehouse Profile Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Wholesale Depot Identification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warehouse / Agency Trade Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.warehouseName}
                onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proprietor / Manager Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Phone / Contact
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Number (Indian Goods & Services Tax)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warehouse Physical Gala / Yard Address
              </label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Operational & Regional Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Regional & System Standards</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Currency Format
              </label>
              <input
                type="text"
                disabled
                value={formData.currency || 'INR (₹)'}
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400">Indian Rupee (Lakhs & Crores formatting)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Timezone
              </label>
              <input
                type="text"
                disabled
                value={formData.timezone || 'Asia/Kolkata (IST)'}
                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400">Indian Standard Time (UTC+05:30)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Date Format
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Warehouse Safety Stock Alert Threshold (Bottles)
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
              <span className="text-[11px] text-slate-400">
                Triggers warning badge when bottle count drops below this quantity
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Packaging Unit Configuration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.defaultPackSize}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultPackSize: parseInt(e.target.value) || 24 })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.defaultPackName}
                  onChange={(e) => setFormData({ ...formData, defaultPackName: e.target.value })}
                  placeholder="crates"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Default pack size (e.g., 24 bottles per crate)
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data Retention Preference
            </label>
            <input
              type="text"
              disabled
              value={formData.dataRetentionPreference || '48 hours local memory cache'}
              className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400">
              Demo state cached locally in your browser session for 48 hours
            </span>
          </div>
        </div>

        {/* Theme & Display Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Palette className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Display & Visual Presentation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Theme Profile
              </label>
              <select
                value={formData.themePreference}
                onChange={(e) => setFormData({ ...formData, themePreference: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="Light (High Contrast Logistics)">Light (High Contrast Logistics - Recommended)</option>
                <option value="Clean Slate Minimal">Clean Slate Minimal</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showProfitMargin}
                  onChange={(e) =>
                    setFormData({ ...formData, showProfitMargin: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                />
                <span className="text-xs font-medium text-slate-700">
                  Display estimated profit margin calculations on dashboards
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Factory State</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Reset Demo Data"
        message="Are you sure you want to restore factory default demo data? All test sales, stock entries, and newly created products will be refreshed."
        confirmText="Restore Factory Demo"
        isDanger={true}
      />
    </div>
  );
}
