'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { PackagePlus, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function StockInPage() {
  const { products, suppliers, stockEntries, addStockEntry } = useWarehouse();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  // Selected Brand & Product
  const [selectedBrand, setSelectedBrand] = useState('Coca-Cola');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Core Form Fields
  const [crates, setCrates] = useState(5);
  const [unitsPerPack, setUnitsPerPack] = useState(24);
  const [looseBottles, setLooseBottles] = useState(0);
  const [purchaseRate, setPurchaseRate] = useState(31.5);
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');

  // Advanced / Optional fields toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Brands list
  const brandList = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  // Products filtered by selected brand
  const brandProducts = useMemo(() => {
    return products.filter((p) => p.brand === selectedBrand);
  }, [products, selectedBrand]);

  // Active product
  const activeProduct = useMemo(() => {
    if (selectedProductId) {
      const found = products.find((p) => p.id === selectedProductId);
      if (found) return found;
    }
    return brandProducts[0] || products[0];
  }, [products, selectedProductId, brandProducts]);

  // When brand or product changes, update defaults
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    const firstInBrand = products.find((p) => p.brand === brand);
    if (firstInBrand) {
      setSelectedProductId(firstInBrand.id);
      setUnitsPerPack(Number(firstInBrand.bottlesPerPack || 24));
      setPurchaseRate(Number(firstInBrand.purchaseRate || 0));
    }
  };

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitsPerPack(Number(prod.bottlesPerPack || 24));
      setPurchaseRate(Number(prod.purchaseRate || 0));
    }
  };

  // Live Calculations
  const numCrates = Number(crates || 0);
  const numUnitsPerPack = Number(unitsPerPack || 24);
  const numLoose = Number(looseBottles || 0);
  const totalBottles = numCrates * numUnitsPerPack + numLoose;
  const totalPurchaseValue = totalBottles * Number(purchaseRate || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!activeProduct) {
      showToast('Please select a valid product', 'error');
      return;
    }

    if (totalBottles <= 0) {
      showToast(language === 'hi' ? 'Kripya bottles ki quantity dalein' : 'Quantity must be greater than 0', 'error');
      return;
    }

    addStockEntry({
      productId: activeProduct.id,
      productName: `${activeProduct.name} ${activeProduct.size}`,
      brand: activeProduct.brand,
      supplier: supplier || 'Company Depo',
      crates: numCrates,
      bottlesPerCrate: numUnitsPerPack,
      looseBottles: numLoose,
      totalBottles,
      purchaseRate: Number(purchaseRate || 0),
      purchaseRateUnit: 'bottle',
      totalAmount: totalPurchaseValue,
      invoiceNumber: invoiceNumber || '',
      date: new Date(dateReceived).toISOString(),
      notes,
    });

    showToast(
      language === 'hi'
        ? `+${totalBottles} bottles ${activeProduct.name} stock me jud gayi!`
        : `Added +${totalBottles} bottles of ${activeProduct.name} to warehouse!`,
      'success'
    );

    setCrates(0);
    setLooseBottles(0);
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={t('stock_in_title')}
        description={t('stock_in_subtitle')}
      />

      {/* Main Clean Stock Entry Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Brand & Product Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('stock_in_brand')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900"
              >
                {brandList.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('stock_in_product')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={activeProduct?.id || ''}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900"
              >
                {brandProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.size}) — [{p.totalBottles} in stock]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantities: Crates, Units per pack, Loose bottles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3.5 sm:p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('stock_in_crates')}
              </label>
              <input
                type="number"
                min="0"
                value={crates}
                onChange={(e) => setCrates(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('stock_in_units_per_pack')}
              </label>
              <input
                type="number"
                min="1"
                value={unitsPerPack}
                onChange={(e) => setUnitsPerPack(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('stock_in_loose')}
              </label>
              <input
                type="number"
                min="0"
                value={looseBottles}
                onChange={(e) => setLooseBottles(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Purchase Rate & Optional Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('stock_in_rate')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('stock_in_supplier')} <span className="text-slate-400 font-normal">({t('optional')})</span>
              </label>
              <input
                type="text"
                placeholder={t('stock_in_supplier_placeholder')}
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Optional / Advanced Fields Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>{showAdvanced ? t('stock_in_hide_options') : t('stock_in_more_options')}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t('stock_in_invoice_no')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-9812"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    value={dateReceived}
                    onChange={(e) => setDateReceived(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {t('notes')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Truck MH-04"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Automatic Calculation Banner & Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-slate-500 block">{t('stock_in_total_quantity')}:</span>
                <span className="text-lg font-black text-emerald-700">
                  {totalBottles} {t('bottles')}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-slate-500 block">{t('stock_in_total_value')}:</span>
                <span className="text-lg font-black text-slate-900">
                  {formatCurrency(totalPurchaseValue)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center justify-center gap-2 shadow-xs"
            >
              <PackagePlus className="w-4 h-4 text-emerald-400" />
              <span>{t('stock_in_save_btn')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simple Recent Stock Entries List */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          {t('stock_in_recent_title')}
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {stockEntries.slice(0, 4).map((entry) => (
            <div key={entry.id} className="py-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="font-bold text-slate-900">{entry.productName}</div>
                <div className="text-[11px] text-slate-400">
                  {entry.supplier} • {entry.crates} crates + {entry.looseBottles} loose
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-600">+{entry.totalBottles} btls</span>
                <div className="text-[10px] text-slate-400">{formatCurrency(entry.totalAmount)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
