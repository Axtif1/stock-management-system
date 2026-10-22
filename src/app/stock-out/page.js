'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import { PackageMinus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StockOutPage() {
  const { products, addStockOut, stockOutLog } = useWarehouse();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [boxesGiven, setBoxesGiven] = useState(1);

  // Active product
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const availableBoxes = activeProduct ? Number(activeProduct.remainingBoxes || 0) : 0;
  const numGiven = Number(boxesGiven || 0);
  const remainingAfter = Math.max(0, availableBoxes - numGiven);
  const isExceeding = numGiven > availableBoxes;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!activeProduct) return;

    if (numGiven <= 0) {
      showToast(t('out_error_zero'), 'error');
      return;
    }

    if (isExceeding) {
      showToast(t('out_error_exceeds'), 'error');
      return;
    }

    addStockOut({
      productId: activeProduct.id,
      boxes: numGiven,
    });

    showToast(
      language === 'hi'
        ? `${activeProduct.name} ke ${numGiven} BOX diye gaye! Bacha: ${remainingAfter} BOX`
        : `Gave ${numGiven} BOX of ${activeProduct.name}! Remaining: ${remainingAfter} BOX`,
      'success'
    );

    setBoxesGiven(1);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      <PageHeader
        title={language === 'hi' ? 'Maal Diya (Stock Out)' : 'Stock Out'}
        description={language === 'hi' ? 'Kitne BOX diye entry karein' : 'Record boxes given out'}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('out_select_product')}
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setBoxesGiven(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — (Bache: {p.remainingBoxes} BOX)
                </option>
              ))}
            </select>
          </div>

          {/* Available stock display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">{t('out_available')}:</span>
            <span className="text-lg font-black text-slate-900">
              {availableBoxes} BOX
            </span>
          </div>

          {/* Number of BOX given out */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('out_boxes_label')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={availableBoxes}
                step="1"
                required
                value={boxesGiven}
                onChange={(e) => setBoxesGiven(parseInt(e.target.value) || 0)}
                className={`w-full px-3.5 py-3 text-xl font-black bg-white border rounded-xl focus:ring-2 focus:ring-slate-900 ${
                  isExceeding
                    ? 'border-rose-400 text-rose-600 focus:ring-rose-500'
                    : 'border-slate-200 text-slate-900'
                }`}
              />
              <span className="font-extrabold text-slate-500 text-sm">BOX</span>
            </div>
            {isExceeding && (
              <p className="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t('out_error_exceeds')}</span>
              </p>
            )}
          </div>

          {/* Remaining after entry live preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {t('out_remaining_after')}:
            </span>
            <span className={`text-lg font-black ${isExceeding ? 'text-rose-600' : 'text-slate-900'}`}>
              {remainingAfter} BOX
            </span>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isExceeding || availableBoxes === 0 || numGiven <= 0}
            className="w-full py-3.5 px-4 text-base font-black text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-98 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <PackageMinus className="w-5 h-5 text-blue-400" />
            <span>{t('out_save_btn')}</span>
          </button>
        </form>
      </div>

      {/* Recent Outgoing Entries */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          {t('out_recent_title')}
        </h4>
        <div className="divide-y divide-slate-100 text-xs">
          {stockOutLog.slice(0, 4).map((entry) => (
            <div key={entry.id} className="py-2 flex items-center justify-between">
              <span className="font-bold text-slate-900">{entry.productName}</span>
              <span className="font-black text-blue-700">−{entry.boxes} BOX</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
