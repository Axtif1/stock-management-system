'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';

export default function ProductFormModal({ isOpen, onClose, productToEdit = null }) {
  const { addProduct, updateProduct, brands } = useWarehouse();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Coca-Cola',
    customBrand: '',
    size: '600ml PET',
    category: 'Carbonated',
    sku: '',
    packType: 'case',
    bottlesPerPack: 24,
    fullPacks: 10,
    looseBottles: 0,
    purchaseRate: 31.5,
    purchaseRateUnit: 'bottle',
    sellingPrice: 38.0,
    lowStockThreshold: 150,
    isActive: true,
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        brand: productToEdit.brand || 'Coca-Cola',
        customBrand: '',
        size: productToEdit.size || '',
        category: productToEdit.category || 'Carbonated',
        sku: productToEdit.sku || '',
        packType: productToEdit.packType || 'case',
        bottlesPerPack: productToEdit.bottlesPerPack || 24,
        fullPacks: productToEdit.fullPacks || 0,
        looseBottles: productToEdit.looseBottles || 0,
        purchaseRate: productToEdit.purchaseRate || 0,
        purchaseRateUnit: productToEdit.purchaseRateUnit || 'bottle',
        sellingPrice: productToEdit.sellingPrice || 0,
        lowStockThreshold: productToEdit.lowStockThreshold || 150,
        isActive: productToEdit.isActive !== undefined ? productToEdit.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        brand: brands[0] || 'Coca-Cola',
        customBrand: '',
        size: '600ml PET',
        category: 'Carbonated',
        sku: '',
        packType: 'case',
        bottlesPerPack: 24,
        fullPacks: 10,
        looseBottles: 0,
        purchaseRate: 31.5,
        purchaseRateUnit: 'bottle',
        sellingPrice: 38.0,
        lowStockThreshold: 150,
        isActive: true,
      });
    }
  }, [productToEdit, isOpen, brands]);

  const totalCalculatedBottles =
    (Number(formData.fullPacks || 0) * Number(formData.bottlesPerPack || 24)) +
    Number(formData.looseBottles || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    const finalBrand = formData.brand === 'Other' && formData.customBrand ? formData.customBrand : formData.brand;

    const payload = {
      ...formData,
      brand: finalBrand,
      bottlesPerPack: Number(formData.bottlesPerPack),
      fullPacks: Number(formData.fullPacks),
      looseBottles: Number(formData.looseBottles),
      purchaseRate: Number(formData.purchaseRate),
      sellingPrice: Number(formData.sellingPrice),
      lowStockThreshold: Number(formData.lowStockThreshold),
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
      showToast(`Updated "${formData.name}" successfully`, 'success');
    } else {
      addProduct(payload);
      showToast(`Added "${formData.name}" to inventory`, 'success');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product Configuration' : 'Add New Beverage Product'}
      subtitle="Configure pack sizes, rates, and stock thresholds"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brand <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="Other">+ Other Brand</option>
            </select>
            {formData.brand === 'Other' && (
              <input
                type="text"
                placeholder="Enter Brand Name"
                value={formData.customBrand}
                onChange={(e) => setFormData({ ...formData, customBrand: e.target.value })}
                className="mt-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Thums Up Charged"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Size, Category, SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bottle Size <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 600ml PET, 200ml Glass"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            >
              <option value="Carbonated">Carbonated Soft Drink</option>
              <option value="Returnable Glass">Returnable Glass Bottle (RGB)</option>
              <option value="Energy Drink">Energy Drink</option>
              <option value="Juice">Fruit Juice / Pulp</option>
              <option value="Packaged Water">Packaged Water</option>
              <option value="Soda & Tonic">Soda & Tonic Water</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code</label>
            <input
              type="text"
              placeholder="e.g. TU-600-PET"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Pack Configurations - Not Hardcoded 24! */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <span>Packaging & Unit Configuration</span>
            <span className="text-slate-500 font-normal lowercase">Flexible Pack Sizes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Pack Packaging Unit
              </label>
              <select
                value={formData.packType}
                onChange={(e) => setFormData({ ...formData, packType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="crate">Plastic / Wooden Crate</option>
                <option value="case">Corrugated Case</option>
                <option value="carton">Cardboard Carton</option>
                <option value="tray">Shrink Tray (Cans)</option>
                <option value="box">Multi-pack Box</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bottles per Pack Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.bottlesPerPack}
                onChange={(e) =>
                  setFormData({ ...formData, bottlesPerPack: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
              <span className="text-[11px] text-slate-400">
                (e.g., 24 for standard crate, 30 for Sting carton, 12 for 1.25L)
              </span>
            </div>
          </div>

          {/* Current / Initial Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Full Packs in Warehouse
              </label>
              <input
                type="number"
                min="0"
                value={formData.fullPacks}
                onChange={(e) =>
                  setFormData({ ...formData, fullPacks: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Additional Loose Bottles
              </label>
              <input
                type="number"
                min="0"
                value={formData.looseBottles}
                onChange={(e) =>
                  setFormData({ ...formData, looseBottles: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Live Conversion Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-950">
            <span className="font-medium">Total Stock Quantity Preview:</span>
            <span className="font-bold">
              {formData.fullPacks} {formData.packType}s × {formData.bottlesPerPack} + {formData.looseBottles} loose ={' '}
              <span className="text-emerald-700 text-sm">{totalCalculatedBottles} Total Bottles</span>
            </span>
          </div>
        </div>

        {/* Pricing & Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchase Cost (₹/bottle)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.purchaseRate}
              onChange={(e) => setFormData({ ...formData, purchaseRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Price (₹/bottle)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Low-Stock Alert (Bottles)
            </label>
            <input
              type="number"
              min="1"
              value={formData.lowStockThreshold}
              onChange={(e) =>
                setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 100 })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
          >
            {productToEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
