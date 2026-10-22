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
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const { products, deleteProduct } = useWarehouse();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const brandOptions = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand)));
    return ['ALL', ...brands];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;
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
  }, [products, selectedBrand, searchTerm]);

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      showToast('Product removed from catalog', 'info');
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader
        title={t('prod_title')}
        description={t('prod_subtitle')}
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

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="ALL">{t('all_brands')}</option>
          {brandOptions.filter((b) => b !== 'ALL').map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            actionLabel={t('cancel')}
            onAction={() => {
              setSearchTerm('');
              setSelectedBrand('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">{t('inv_col_product')}</th>
                  <th className="py-2.5 px-3">{t('inv_col_brand')}</th>
                  <th className="py-2.5 px-3">Pack Unit</th>
                  <th className="py-2.5 px-3 text-right">{t('inv_col_cost_price')}</th>
                  <th className="py-2.5 px-3 text-right">{t('inv_col_sell_price')}</th>
                  <th className="py-2.5 px-3 text-center">{t('status')}</th>
                  <th className="py-2.5 px-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {prod.name}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {prod.size}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{prod.brand}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {prod.bottlesPerPack} btls / {prod.packType || 'crate'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{Number(prod.purchaseRate).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{Number(prod.sellingPrice).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(prod)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded"
                          title={t('edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(prod.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />

      <ConfirmationModal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={confirmDelete}
        title={t('delete')}
        message="Remove this beverage product from your catalog?"
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isDanger={true}
      />
    </div>
  );
}
