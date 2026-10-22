'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Boxes, PackageCheck, TrendingUp, IndianRupee, Layers } from 'lucide-react';

export default function ProductDetailModal({ isOpen, onClose, product, onEdit }) {
  if (!product) return null;

  const packSize = Number(product.bottlesPerPack || 24);
  const totalBottles = Number(product.totalBottles || 0);
  const fullPacks = Math.floor(totalBottles / packSize);
  const looseBottles = totalBottles % packSize;

  const purchaseRate = Number(product.purchaseRate || 0);
  const sellingPrice = Number(product.sellingPrice || 0);
  const marginPerBottle = Math.max(0, sellingPrice - purchaseRate);
  const marginPercent = purchaseRate > 0 ? ((marginPerBottle / purchaseRate) * 100).toFixed(1) : 0;

  const totalValueCost = totalBottles * purchaseRate;
  const totalValueRetail = totalBottles * sellingPrice;

  let stockStatus = 'In Stock';
  if (totalBottles === 0) stockStatus = 'Out of Stock';
  else if (totalBottles <= (product.lowStockThreshold || 150)) stockStatus = 'Low Stock';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`${product.brand} • ${product.size} (${product.sku || 'SKU N/A'})`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Top Status Banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-xs text-slate-500 font-medium">Inventory Status</span>
            <div className="mt-1">
              <StatusBadge status={stockStatus} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Category</span>
            <div className="text-sm font-semibold text-slate-900">{product.category || 'Carbonated'}</div>
          </div>
        </div>

        {/* Quantities Breakdown Card */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-slate-600" />
            Stock Holding Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500">Full {product.packType || 'Pack'}s</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{fullPacks}</div>
              <span className="text-[10px] text-slate-400">({packSize} btls/pack)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500">Loose Bottles</span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{looseBottles}</div>
              <span className="text-[10px] text-slate-400">Individual Units</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <span className="text-xs text-emerald-800 font-semibold">Total Bottles</span>
              <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{formatNumber(totalBottles)}</div>
              <span className="text-[10px] text-emerald-700">In Warehouse</span>
            </div>
          </div>
        </div>

        {/* Pricing & Margins */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-slate-600" />
            Pricing & Unit Margins
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-xs text-slate-500">Cost Rate</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">₹{purchaseRate.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400">per bottle</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Selling Price</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">₹{sellingPrice.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400">per bottle</span>
            </div>
            <div>
              <span className="text-xs text-emerald-700 font-semibold">Unit Profit</span>
              <div className="text-sm font-bold text-emerald-900 mt-0.5">₹{marginPerBottle.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-600">+{marginPercent}% margin</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Pack Profit</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                ₹{(marginPerBottle * packSize).toFixed(0)}
              </div>
              <span className="text-[10px] text-slate-400">per {product.packType || 'pack'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Stock Valuation:</span>
            <div className="flex gap-4">
              <span>
                Cost Value: <strong className="text-slate-800">{formatCurrency(totalValueCost)}</strong>
              </span>
              <span>
                Retail Value: <strong className="text-slate-900">{formatCurrency(totalValueRetail)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
            >
              Edit Configuration
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
