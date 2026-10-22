'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ProductFormModal from '@/components/inventory/ProductFormModal';
import ProductDetailModal from '@/components/inventory/ProductDetailModal';
import { Boxes, Plus, Eye, Edit2 } from 'lucide-react';

export default function InventoryPage() {
  const { products, settings } = useWarehouse();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL | LOW

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const brandOptions = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand)));
    return ['ALL', ...brands];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;
      const threshold = p.lowStockThreshold || settings.lowStockAlertThreshold || 150;
      if (stockFilter === 'LOW' && p.totalBottles > threshold) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedBrand, stockFilter, searchTerm, settings]);

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsAddEditModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader
        title={t('inv_title')}
        description={t('inv_subtitle')}
        actions={
          <button
            type="button"
            onClick={handleAddNew}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t('inv_add_product')}</span>
          </button>
        }
      />

      {/* Clean Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder={t('inv_search_placeholder')}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Brand select */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">{t('all_brands')}</option>
            {brandOptions.filter((b) => b !== 'ALL').map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          {/* Quick Low Stock Toggle */}
          <button
            type="button"
            onClick={() => setStockFilter(stockFilter === 'ALL' ? 'LOW' : 'ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              stockFilter === 'LOW'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t('inv_filter_low_stock')}
          </button>
        </div>
      </div>

      {/* Clean Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No items found"
            description="Try adjusting your search or brand filter."
            actionLabel={t('cancel')}
            onAction={() => {
              setSearchTerm('');
              setSelectedBrand('ALL');
              setStockFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">{t('inv_col_product')}</th>
                  <th className="py-2.5 px-3">{t('inv_col_brand')}</th>
                  <th className="py-2.5 px-3 text-center">{t('inv_col_crates')}</th>
                  <th className="py-2.5 px-3 text-center">{t('inv_col_loose')}</th>
                  <th className="py-2.5 px-3 text-right">{t('inv_col_total_bottles')}</th>
                  <th className="py-2.5 px-3 text-right">{t('inv_col_sell_price')}</th>
                  <th className="py-2.5 px-3 text-center">{t('inv_col_status')}</th>
                  <th className="py-2.5 px-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const packSize = Number(prod.bottlesPerPack || 24);
                  const crates = Math.floor(prod.totalBottles / packSize);
                  const loose = prod.totalBottles % packSize;

                  const threshold = prod.lowStockThreshold || settings.lowStockAlertThreshold || 150;
                  let status = 'In Stock';
                  if (prod.totalBottles === 0) status = 'Out of Stock';
                  else if (prod.totalBottles <= threshold) status = 'Low Stock';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[11px] text-slate-400">{prod.size}</div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-medium">{prod.brand}</td>

                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                        {crates} <span className="text-[10px] text-slate-400 font-normal">({packSize}/cr)</span>
                      </td>

                      <td className="py-2.5 px-3 text-center text-slate-600">{loose}</td>

                      <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                        {formatNumber(prod.totalBottles)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{Number(prod.sellingPrice).toFixed(1)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={status} />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingProduct(prod)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(prod)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        productToEdit={editingProduct}
      />

      <ProductDetailModal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={(prod) => handleEdit(prod)}
      />
    </div>
  );
}
