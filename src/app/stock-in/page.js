'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import ProductFormModal from '@/components/inventory/ProductFormModal';
import {
  PackagePlus,
  PlusCircle,
  Calculator,
  Search,
  Building,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export default function StockInPage() {
  const { products, suppliers, stockEntries, addStockEntry } = useWarehouse();
  const { showToast } = useToast();

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [crates, setCrates] = useState(5);
  const [bottlesPerCrate, setBottlesPerCrate] = useState(24);
  const [looseBottles, setLooseBottles] = useState(6);
  const [purchaseRate, setPurchaseRate] = useState(31.5);
  const [purchaseRateUnit, setPurchaseRateUnit] = useState('bottle'); // 'bottle' | 'crate'
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Selected Product Reference
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // Sync default pack configuration when product changes
  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setBottlesPerCrate(Number(prod.bottlesPerPack || 24));
      setPurchaseRate(Number(prod.purchaseRate || 0));
    }
  };

  // Filter products for dropdown
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Live conversion calculations
  const numCrates = Number(crates || 0);
  const btlPerCrate = Number(bottlesPerCrate || 24);
  const loose = Number(looseBottles || 0);
  const totalBottlesReceived = numCrates * btlPerCrate + loose;

  // Estimated purchase value
  let estimatedPurchaseValue = 0;
  if (purchaseRateUnit === 'bottle') {
    estimatedPurchaseValue = totalBottlesReceived * Number(purchaseRate || 0);
  } else {
    // per crate/pack
    const effectiveCrates = numCrates + loose / btlPerCrate;
    estimatedPurchaseValue = effectiveCrates * Number(purchaseRate || 0);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      showToast('Please select a valid product', 'error');
      return;
    }

    if (totalBottlesReceived <= 0) {
      showToast('Total bottles received must be greater than zero', 'error');
      return;
    }

    // Save Stock Entry
    addStockEntry({
      productId: selectedProduct.id,
      productName: `${selectedProduct.name} ${selectedProduct.size}`,
      brand: selectedProduct.brand,
      supplier: supplier || 'Company Direct Bottler',
      crates: numCrates,
      bottlesPerCrate: btlPerCrate,
      looseBottles: loose,
      totalBottles: totalBottlesReceived,
      purchaseRate: Number(purchaseRate || 0),
      purchaseRateUnit,
      totalAmount: estimatedPurchaseValue,
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
      date: new Date(dateReceived).toISOString(),
      notes,
    });

    showToast(
      `Stock In Success: +${totalBottlesReceived} bottles of ${selectedProduct.name} recorded!`,
      'success'
    );

    // Reset some form values
    setCrates(0);
    setLooseBottles(0);
    setNotes('');
    setInvoiceNumber('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Stock Entry"
        description="Record fresh consignments from bottlers and company depots with automatic crate-to-bottle conversion."
        actions={
          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Add New Product to Catalog</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Inward Stock Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Selection with Search */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Select Beverage Product <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  + Add Product Shortcut
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search brand or product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.brand} - {p.name} ({p.size}) [Current: {p.totalBottles} btls]
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                  <span>
                    Current Warehouse Holding:{' '}
                    <strong className="text-slate-800">{selectedProduct.totalBottles} bottles</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Configured Pack Size:{' '}
                    <strong className="text-slate-800">{selectedProduct.bottlesPerPack} bottles/{selectedProduct.packType || 'crate'}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Supplier & Consignment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier / Bottling Depo <span className="text-rose-500">*</span>
                </label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                  <option value="Direct Primary Bottler">Direct Primary Bottler Consignment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date Received <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Quantity Breakdown: Crates, Bottles per Crate, Loose Bottles */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
                <span>Quantity Consignment Breakdown</span>
                <span className="text-emerald-700 font-semibold lowercase">Automatic Conversion</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Number of Crates / Packs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={crates}
                    onChange={(e) => setCrates(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-200 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400">Full {selectedProduct?.packType || 'crate'} units</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Bottles per Crate / Pack
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bottlesPerCrate}
                    onChange={(e) => setBottlesPerCrate(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-200 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400">Bottles in one full unit</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Additional Loose Bottles
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={looseBottles}
                    onChange={(e) => setLooseBottles(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-200 rounded-lg"
                  />
                  <span className="text-[11px] text-slate-400">Extra single bottles</span>
                </div>
              </div>

              {/* Dynamic conversion alert banner */}
              <div className="p-3 bg-white border border-emerald-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs text-slate-700">
                    Formula: ({numCrates} {selectedProduct?.packType || 'crates'} × {btlPerCrate} btls) + {loose} loose
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 mr-2">Net Quantity:</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {totalBottlesReceived} Bottles Received
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Rate & Invoice Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchaseRate}
                    onChange={(e) => setPurchaseRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rate Unit
                </label>
                <select
                  value={purchaseRateUnit}
                  onChange={(e) => setPurchaseRateUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  <option value="bottle">Per Single Bottle</option>
                  <option value="crate">Per Full Crate / Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice / Challan No
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-9842"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Notes / Delivery Details
              </label>
              <input
                type="text"
                placeholder="e.g. Empty crates returned, truck registration MH-04-AB-1234"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Live Estimated Value & Submit */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">Estimated Consignment Value</span>
                <div className="text-xl font-bold text-slate-900">
                  {formatCurrency(estimatedPurchaseValue)}
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xs"
              >
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                <span>Save Stock Entry</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Inward Consignment Summary Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Live Inward Preview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-900 text-right">{selectedProduct?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Brand / Size:</span>
                <span className="text-slate-700">{selectedProduct?.brand} • {selectedProduct?.size}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Crates & Loose:</span>
                <span className="font-medium text-slate-800">
                  {numCrates} {selectedProduct?.packType || 'crates'} + {loose} loose
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Units:</span>
                <span className="font-bold text-emerald-600 text-sm">+{totalBottlesReceived} Bottles</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">After Stock In:</span>
                <span className="font-bold text-slate-900">
                  {(selectedProduct?.totalBottles || 0) + totalBottlesReceived} Bottles
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Estimated Cost:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(estimatedPurchaseValue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
            <h4 className="font-bold mb-1 flex items-center gap-1.5">
              <span>Pro Tip for Fast Stock-In</span>
            </h4>
            <p className="leading-relaxed text-emerald-900">
              Entering stock immediately updates your live warehouse inventory and increases the stock available for Point of Sale.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Stock Entries Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Stock Entries Log</h3>
            <p className="text-xs text-slate-500">Complete audit trail of incoming factory consignments</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {stockEntries.length} Inward Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Supplier</th>
                <th className="py-2.5 px-4">Pack Breakdown</th>
                <th className="py-2.5 px-4 text-right">Total Bottles</th>
                <th className="py-2.5 px-4 text-right">Rate</th>
                <th className="py-2.5 px-4 text-right">Total Value</th>
                <th className="py-2.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                    {formatDate(entry.date)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {entry.productName}
                    <div className="text-[11px] font-normal text-slate-400">{entry.brand}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                    {entry.supplier}
                    {entry.invoiceNumber && (
                      <div className="text-[10px] font-mono text-slate-400">{entry.invoiceNumber}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {entry.crates} crates ({entry.bottlesPerCrate}/cr) + {entry.looseBottles} loose
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                    +{formatNumber(entry.totalBottles)} btls
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                    ₹{entry.purchaseRate}/{entry.purchaseRateUnit || 'btl'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(entry.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-[160px] truncate">
                    {entry.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Shortcut Modal */}
      <ProductFormModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />
    </div>
  );
}
