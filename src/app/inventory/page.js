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
import ProductDetailModal from '@/components/inventory/ProductDetailModal';
import {
  Boxes,
  Plus,
  Eye,
  Edit2,
  PackagePlus,
  ArrowUpDown,
  Filter,
  AlertTriangle,
} from 'lucide-react';

export default function InventoryPage() {
  const { products, settings } = useWarehouse();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL | LOW | OUT | IN
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'quantity_desc' | 'quantity_asc' | 'margin'

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Available brands for filter dropdown
  const brandOptions = useMemo(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand)));
    return [
      { label: 'All Brands', value: 'ALL' },
      ...brands.map((b) => ({ label: b, value: b })),
    ];
  }, [products]);

  // Stock status filter options
  const stockOptions = [
    { label: 'All Stock Levels', value: 'ALL' },
    { label: 'Low Stock Only', value: 'LOW' },
    { label: 'In Stock Only', value: 'IN' },
    { label: 'Out of Stock Only', value: 'OUT' },
  ];

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Brand filter
        if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;

        // Stock status filter
        const threshold = p.lowStockThreshold || settings.lowStockAlertThreshold || 150;
        const isOut = p.totalBottles === 0;
        const isLow = p.totalBottles <= threshold && !isOut;
        const isIn = p.totalBottles > threshold;

        if (stockFilter === 'LOW' && !isLow) return false;
        if (stockFilter === 'OUT' && !isOut) return false;
        if (stockFilter === 'IN' && !isIn) return false;

        // Search term
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
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'quantity_desc') return b.totalBottles - a.totalBottles;
        if (sortBy === 'quantity_asc') return a.totalBottles - b.totalBottles;
        if (sortBy === 'margin') {
          const marginA = a.sellingPrice - a.purchaseRate;
          const marginB = b.sellingPrice - b.purchaseRate;
          return marginB - marginA;
        }
        return 0;
      });
  }, [products, selectedBrand, stockFilter, searchTerm, sortBy, settings]);

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsAddEditModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsAddEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Stock & Inventory"
        description="Live view of full crates, cartons, loose units, purchase valuations and low-stock alerts."
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Search by beverage, brand, SKU..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="Brand"
            value={selectedBrand}
            onChange={setSelectedBrand}
            options={brandOptions}
          />

          <FilterDropdown
            label="Stock Status"
            value={stockFilter}
            onChange={setStockFilter}
            options={stockOptions}
          />

          {/* Sort dropdown */}
          <div className="relative inline-flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-7 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer appearance-none"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="quantity_desc">Sort: Highest Stock</option>
              <option value="quantity_asc">Sort: Lowest Stock</option>
              <option value="margin">Sort: Highest Profit Margin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {processedProducts.length === 0 ? (
          <EmptyState
            title="No inventory records found"
            description="No cold-drink items matched your current search filters."
            actionLabel="Reset Filters"
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
                  <th className="py-3 px-4">Beverage Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-center">Full Crates/Packs</th>
                  <th className="py-3 px-4 text-center">Loose Bottles</th>
                  <th className="py-3 px-4 text-right">Total Bottles</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Cost Rate</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedProducts.map((prod) => {
                  const packSize = Number(prod.bottlesPerPack || 24);
                  const fullPacks = Math.floor(prod.totalBottles / packSize);
                  const loose = prod.totalBottles % packSize;

                  const threshold = prod.lowStockThreshold || settings.lowStockAlertThreshold || 150;
                  let status = 'In Stock';
                  if (prod.totalBottles === 0) status = 'Out of Stock';
                  else if (prod.totalBottles <= threshold) status = 'Low Stock';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {prod.sku || 'SKU N/A'} • {prod.category || 'Carbonated'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {prod.brand}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {prod.size}
                      </td>

                      {/* Crates */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-900">{fullPacks}</span>
                        <span className="text-[10px] text-slate-400 block">
                          ({packSize} btls/{prod.packType || 'cr'})
                        </span>
                      </td>

                      {/* Loose */}
                      <td className="py-3 px-4 text-center font-medium text-slate-700 whitespace-nowrap">
                        {loose} btls
                      </td>

                      {/* Total Bottles */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatNumber(prod.totalBottles)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(prod.sellingPrice).toFixed(1)}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                        ₹{Number(prod.purchaseRate).toFixed(1)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Stock Breakdown"
                            onClick={() => setViewingProduct(prod)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit Product Details"
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
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

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        productToEdit={editingProduct}
      />

      {/* View Product Details Modal */}
      <ProductDetailModal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={(prod) => handleEdit(prod)}
      />
    </div>
  );
}
