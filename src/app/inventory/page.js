'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import Modal from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useWarehouse();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [productNameInput, setProductNameInput] = useState('');

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchTerm]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductNameInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setProductNameInput(prod.name);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productNameInput.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, productNameInput.trim());
    } else {
      addProduct(productNameInput.trim());
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id);
    showToast(
      language === 'hi'
        ? `"${deletingProduct.name}" hata diya gaya!`
        : `Deleted "${deletingProduct.name}" successfully!`,
      'info'
    );
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">
      <PageHeader
        title={t('inv_title')}
        description={language === 'hi' ? 'Kitne BOX aaye, diye aur bache' : 'Total boxes received, given, and remaining'}
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t('inv_add_btn')}</span>
          </button>
        }
      />

      {/* Search Bar */}
      <SearchInput
        placeholder={t('inv_search_placeholder')}
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Mobile-First Product Cards */}
      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No products found
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const received = Number(prod.totalReceived || 0);
            const given = Number(prod.totalGiven || 0);
            const remaining = received - given;

            return (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3"
              >
                {/* Product Name & Received/Given */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {prod.name}
                    </h3>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title={t('inv_edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeletingProduct(prod)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title={t('inv_delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2">
                    <span>
                      {t('total_received')}: <strong className="text-slate-800">{received} BOX</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {t('total_given')}: <strong className="text-slate-800">{given} BOX</strong>
                    </span>
                  </div>
                </div>

                {/* Remaining Quantity (Bache) */}
                <div className="text-right shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {t('remaining')}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {remaining} <span className="text-xs font-bold text-slate-500">BOX</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProduct ? t('inv_edit') : t('inv_add_btn')}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('in_select_product')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sprite 250ml"
              value={productNameInput}
              onChange={(e) => setProductNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog with Remaining Stock Warning */}
      {deletingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingProduct(null)}
          title={t('inv_delete_confirm_title')}
          maxWidth="max-w-sm"
        >
          <div className="space-y-3 pt-1">
            <p className="text-sm text-slate-700 font-medium">
              {t('inv_delete_confirm_msg')}
            </p>
            <div className="font-bold text-base text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {deletingProduct.name}
            </div>

            {/* Warning if product still has stock remaining */}
            {Number(deletingProduct.remainingBoxes || 0) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">
                  {t('inv_delete_warning').replace('{count}', deletingProduct.remainingBoxes)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                {t('inv_delete')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
