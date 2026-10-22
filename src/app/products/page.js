'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import FilterDropdown from '@/components/ui/FilterDropdown';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ProductFormModal from '@/components/inventory/ProductFormModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function ProductsPage() {
  const { products, deleteProduct } = useWarehouse();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const brandOptions = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand)));
    return [
      { label: 'All Brands', value: 'ALL' },
      ...brands.map((b) => ({ label: b, value: b })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q))
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
    <div className="space-y-6">
      <PageHeader
        title="Beverage Products & Pack Setup"
        description="Configure SKUs, custom pack sizes (not limited to 24 bottles/crate), wholesale selling prices, and replenishment thresholds."
        actions={
          <button
            type="button"
            onClick={handleAddNew}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Product</span>
          </button>
        }
      />

      {/* Search and Brand Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search product name, SKU, pack..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterDropdown
            label="Filter Brand"
            value={selectedBrand}
            onChange={setSelectedBrand}
            options={brandOptions}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No beverage products found"
            description="Try adjusting your brand filter or search term."
            actionLabel="Reset Search"
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
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Bottle Size</th>
                  <th className="py-3 px-4">Pack Configuration</th>
                  <th className="py-3 px-4 text-right">Cost (₹/btl)</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Margin / Unit</th>
                  <th className="py-3 px-4 text-center">Alert Threshold</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const purchaseRate = Number(prod.purchaseRate || 0);
                  const sellingPrice = Number(prod.sellingPrice || 0);
                  const margin = Math.max(0, sellingPrice - purchaseRate);
                  const packSize = Number(prod.bottlesPerPack || 24);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {prod.sku || 'SKU N/A'} • {prod.category}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {prod.brand}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {prod.size}
                      </td>

                      {/* Configured Pack Size */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {packSize} bottles / {prod.packType || 'crate'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Full unit = {packSize} units
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                        ₹{purchaseRate.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                        +₹{margin.toFixed(2)}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ₹{(margin * packSize).toFixed(0)}/{prod.packType || 'crate'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-medium text-slate-600 whitespace-nowrap">
                        {prod.lowStockThreshold || 150} btls
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            prod.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prod.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit Product"
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Product"
                            onClick={() => setDeletingProductId(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={confirmDelete}
        title="Remove Beverage Product"
        message="Are you sure you want to delete this product from your catalog? Existing sales history will remain preserved."
        confirmText="Delete Product"
        isDanger={true}
      />
    </div>
  );
}
