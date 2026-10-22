'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import CustomerModal from '@/components/customers/CustomerModal';
import SaleSuccessModal from '@/components/sales/SaleSuccessModal';
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  UserPlus,
  RotateCcw,
  Banknote,
  QrCode,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

export default function NewSalePage() {
  const { products, customers, addSale } = useWarehouse();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  // 1. Customer Selection
  const [customerId, setCustomerId] = useState('walk-in');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // 2. Product Search
  const [productSearch, setProductSearch] = useState('');

  // 3. Sale Items: Array of { productId, packs, loose, pricePerBottle }
  const [saleItems, setSaleItems] = useState([
    {
      productId: 'prod-1',
      packs: 2,
      loose: 0,
      pricePerBottle: 38,
    },
  ]);

  // 5 & 6. Payment inputs (Cash and UPI)
  const [cashReceived, setCashReceived] = useState(0);
  const [upiReceived, setUpiReceived] = useState(0);

  // Success modal
  const [completedSale, setCompletedSale] = useState(null);

  // Selected Customer Details
  const selectedCustomer = useMemo(() => {
    if (customerId === 'walk-in') {
      return {
        id: 'walk-in',
        name: t('sale_walk_in'),
        outstandingBalance: 0,
        creditLimit: 0,
      };
    }
    return customers.find((c) => c.id === customerId) || null;
  }, [customerId, customers, t]);

  // Filter products for quick search
  const searchResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, productSearch]);

  // Add product to bill
  const handleAddProduct = (prod) => {
    const existingIndex = saleItems.findIndex((item) => item.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...saleItems];
      updated[existingIndex].packs += 1;
      setSaleItems(updated);
    } else {
      setSaleItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          packs: 1,
          loose: 0,
          pricePerBottle: Number(prod.sellingPrice || 0),
        },
      ]);
    }
    setProductSearch('');
    showToast(`${prod.name} added to bill`, 'info', 2000);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...saleItems];
    updated[index][field] = value;
    setSaleItems(updated);
  };

  const handleRemoveItem = (index) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Processed Items with Calculations
  const processedItems = useMemo(() => {
    return saleItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const packSize = Number(prod?.bottlesPerPack || 24);
      const totalBottles = Number(item.packs || 0) * packSize + Number(item.loose || 0);
      const lineTotal = totalBottles * Number(item.pricePerBottle || 0);
      return {
        ...item,
        product: prod,
        packSize,
        totalBottles,
        lineTotal,
      };
    });
  }, [saleItems, products]);

  // 4. Bill Total Amount
  const billTotal = useMemo(() => {
    return processedItems.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [processedItems]);

  // 7. Automatically calculate remaining credit
  const cashNum = Number(cashReceived || 0);
  const upiNum = Number(upiReceived || 0);
  const totalPaidNow = cashNum + upiNum;
  const remainingCredit = Math.max(0, billTotal - totalPaidNow);
  const excessPayment = Math.max(0, totalPaidNow - billTotal);

  // Quick preset buttons
  const handleAllCash = () => {
    setCashReceived(billTotal);
    setUpiReceived(0);
  };

  const handleAllUpi = () => {
    setCashReceived(0);
    setUpiReceived(billTotal);
  };

  const handleClearSale = () => {
    setSaleItems([]);
    setCashReceived(0);
    setUpiReceived(0);
  };

  // 8. Save the demo sale
  const handleSaveSale = () => {
    if (processedItems.length === 0) {
      showToast(language === 'hi' ? 'Kripya bill me items jodein' : 'Bill has no items', 'error');
      return;
    }

    if (remainingCredit > 0 && customerId === 'walk-in') {
      showToast(t('sale_credit_walkin_warning'), 'error');
      return;
    }

    const salePayload = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: processedItems.map((item) => ({
        productId: item.productId,
        name: `${item.product?.name || 'Drink'} ${item.product?.size || ''}`,
        packs: item.packs,
        bottlesPerPack: item.packSize,
        loose: item.loose,
        totalBottles: item.totalBottles,
        pricePerBottle: item.pricePerBottle,
        lineTotal: item.lineTotal,
      })),
      totalAmount: billTotal,
      paymentBreakdown: {
        cash: cashNum,
        upi: upiNum,
        credit: remainingCredit,
      },
    };

    const newSale = addSale(salePayload);
    setCompletedSale(newSale);

    showToast(
      language === 'hi'
        ? `Bill #${newSale.billNumber} ban gaya! Total: ${formatCurrency(billTotal)}`
        : `Bill #${newSale.billNumber} created successfully! Total: ${formatCurrency(billTotal)}`,
      'success'
    );
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title={t('sale_title')}
        description={t('sale_subtitle')}
        actions={
          <button
            type="button"
            onClick={handleClearSale}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('sale_clear_btn')}</span>
          </button>
        }
      />

      <div className="space-y-4">
        {/* Step 1: Customer Selection */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800">
              1. {t('sale_customer_label')}
            </label>
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('sale_add_customer_btn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
            >
              <option value="walk-in">{t('sale_walk_in')}</option>
              <optgroup label="Wholesale Customers">
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ({t('sale_current_due')}: {formatCurrency(c.outstandingBalance)})
                  </option>
                ))}
              </optgroup>
            </select>

            {customerId !== 'walk-in' && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between">
                <span className="text-slate-500">{t('sale_current_due')}:</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(selectedCustomer?.outstandingBalance || 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Product Search & Quick Add */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            2. {language === 'hi' ? 'Cold Drink Search Karke Jodein' : 'Search & Add Products'}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('sale_search_product')}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Quick Search Dropdown / Results Chips */}
          {searchResults.length > 0 && (
            <div className="mt-2.5 divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-md">
              {searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleAddProduct(prod)}
                  className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 cursor-pointer transition"
                >
                  <div>
                    <span className="font-bold text-slate-900">{prod.name}</span>
                    <span className="text-slate-500 ml-1.5">({prod.size})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">₹{prod.sellingPrice}/btl</span>
                    <span className="text-emerald-700 font-medium">
                      {prod.totalBottles} {t('sale_stock_left')}
                    </span>
                    <button
                      type="button"
                      className="px-2 py-1 bg-slate-900 text-white rounded font-bold text-[11px]"
                    >
                      {t('sale_add_to_bill')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Enter Crate & Loose Quantities Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">
                3. {t('sale_bill_items')} ({saleItems.length})
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700">
              Total Units: {processedItems.reduce((acc, i) => acc + i.totalBottles, 0)} {t('bottles')}
            </span>
          </div>

          {saleItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {t('sale_empty_bill')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-2 text-center">{t('sale_qty_packs')}</th>
                    <th className="py-2.5 px-2 text-center">{t('sale_qty_loose')}</th>
                    <th className="py-2.5 px-3 text-right">{t('inv_col_total_bottles')}</th>
                    <th className="py-2.5 px-3 text-right">{t('sale_selling_rate')}</th>
                    <th className="py-2.5 px-3 text-right">{t('total')}</th>
                    <th className="py-2.5 px-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.product?.name}</div>
                        <div className="text-[11px] text-slate-400">{item.product?.size}</div>
                      </td>

                      {/* Crates input */}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.packs}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'packs', Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-14 px-1.5 py-1 text-center font-bold border border-slate-200 rounded bg-white text-xs"
                        />
                      </td>

                      {/* Loose bottles input */}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.loose}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'loose', Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-12 px-1.5 py-1 text-center font-medium border border-slate-200 rounded bg-white text-xs"
                        />
                      </td>

                      {/* Total bottles */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {item.totalBottles} btls
                      </td>

                      {/* Selling rate */}
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.5"
                          value={item.pricePerBottle}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'pricePerBottle', parseFloat(e.target.value) || 0)
                          }
                          className="w-14 px-1 py-1 text-right font-semibold border border-slate-200 rounded bg-white text-xs"
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatCurrency(item.lineTotal)}
                      </td>

                      {/* Delete */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Bill Total Banner */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">{t('sale_bill_total')}:</span>
            <span className="text-2xl font-black text-slate-900">{formatCurrency(billTotal)}</span>
          </div>
        </div>

        {/* Steps 5, 6, 7: Payment Collection & Auto Credit Calculation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="text-xs font-bold text-slate-800">
              4. {language === 'hi' ? 'Payment Collection (Cash / UPI / Udhaar)' : 'Payment Collection'}
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={handleAllCash}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition"
              >
                All Cash
              </button>
              <button
                type="button"
                onClick={handleAllUpi}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition"
              >
                All UPI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cash Input */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>{t('sale_cash_received')}</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={cashReceived}
                onChange={(e) => setCashReceived(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* UPI Input */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>{t('sale_upi_received')}</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={upiReceived}
                onChange={(e) => setUpiReceived(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Automatically Calculated Remaining Credit */}
            <div className={`p-3 border rounded-xl ${remainingCredit > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>{t('sale_credit_remaining')}</span>
              </label>
              <div className="text-xl font-black text-amber-700 py-1">
                {formatCurrency(remainingCredit)}
              </div>
              <span className="text-[10px] text-slate-500">
                {remainingCredit > 0 ? 'Auto-calculated balance' : 'Fully paid'}
              </span>
            </div>
          </div>

          {/* Validation warning if Walk-in customer gets credit */}
          {remainingCredit > 0 && customerId === 'walk-in' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t('sale_credit_walkin_warning')}</span>
            </div>
          )}

          {/* Step 8: Complete Sale Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              disabled={saleItems.length === 0 || (remainingCredit > 0 && customerId === 'walk-in')}
              onClick={handleSaveSale}
              className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('sale_complete_btn')} ({formatCurrency(billTotal)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Modal Shortcut */}
      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      {/* Sale Success Invoice Modal */}
      <SaleSuccessModal
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
        onNewSale={() => {
          setSaleItems([]);
          setCashReceived(0);
          setUpiReceived(0);
        }}
      />
    </div>
  );
}
