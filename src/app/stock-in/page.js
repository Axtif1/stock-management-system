'use client';

import React, { useState } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import { PackagePlus, Plus, ArrowLeft } from 'lucide-react';

export default function StockInPage() {
  const { products, addStockIn } = useWarehouse();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [boxesReceived, setBoxesReceived] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();

    const boxCount = Number(boxesReceived || 0);
    if (boxCount <= 0) {
      showToast(language === 'hi' ? 'Kam se kam 1 BOX dalein' : 'Enter at least 1 box', 'error');
      return;
    }

    if (isNewProduct && !newProductName.trim()) {
      showToast(language === 'hi' ? 'Item ka naam likhein' : 'Enter product name', 'error');
      return;
    }

    addStockIn({
      productId: isNewProduct ? 'new' : selectedProductId,
      productName: isNewProduct ? newProductName : '',
      boxes: boxCount,
    });

    const displayName = isNewProduct
      ? newProductName.trim()
      : products.find((p) => p.id === selectedProductId)?.name || 'Drink';

    showToast(
      language === 'hi'
        ? `+${boxCount} BOX ${displayName} stock me jud gaye!`
        : `Added +${boxCount} BOX of ${displayName}!`,
      'success'
    );

    // Reset box count
    setBoxesReceived(10);
    if (isNewProduct) {
      setNewProductName('');
      setIsNewProduct(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      <PageHeader
        title={language === 'hi' ? 'Maal Aaya (Stock In)' : 'Stock In'}
        description={language === 'hi' ? 'Kitne BOX aaye entry karein' : 'Record incoming boxes'}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                {t('in_select_product')}
              </label>
              <button
                type="button"
                onClick={() => setIsNewProduct(!isNewProduct)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                {isNewProduct ? t('in_select_existing_toggle') : t('in_add_new_toggle')}
              </button>
            </div>

            {isNewProduct ? (
              <input
                type="text"
                required
                placeholder={t('in_new_product_placeholder')}
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
              />
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Bache: {p.remainingBoxes} BOX)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Number of BOX received */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('in_boxes_label')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={boxesReceived}
                onChange={(e) => setBoxesReceived(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-3 text-xl font-black text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
              <span className="font-extrabold text-slate-500 text-sm">BOX</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <PackagePlus className="w-5 h-5" />
            <span>{language === 'hi' ? 'Save Maal Aaya' : 'Save Stock In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
