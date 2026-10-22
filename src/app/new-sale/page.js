'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import CustomerModal from '@/components/customers/CustomerModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SaleSuccessModal from '@/components/sales/SaleSuccessModal';
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  RotateCcw,
  Banknote,
  QrCode,
  CreditCard,
  Building,
} from 'lucide-react';

export default function NewSalePage() {
  const { products, customers, addSale } = useWarehouse();
  const { showToast } = useToast();

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Customer Selection State
  const [customerId, setCustomerId] = useState('walk-in');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Sale Items State: Array of { product, packs, loose, pricePerBottle }
  const [saleItems, setSaleItems] = useState([
    {
      productId: 'prod-1',
      packs: 3,
      loose: 0,
      pricePerBottle: 38,
    },
    {
      productId: 'prod-2',
      packs: 2,
      loose: 0,
      pricePerBottle: 38,
    },
  ]);

  // Payment State
  const [cashAmount, setCashAmount] = useState(2000);
  const [upiAmount, setUpiAmount] = useState(1000);
  const [creditAmount, setCreditAmount] = useState(1560);

  // Modals
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isConfirmSaleOpen, setIsConfirmSaleOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // Available brands for filter
  const brandsList = useMemo(() => {
    const bSet = new Set(products.map((p) => p.brand));
    return ['All', ...Array.from(bSet)];
  }, [products]);

  // Filtered Products for catalogue selector
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      const matchesSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.size.toLowerCase().includes(productSearch.toLowerCase());
      return matchesBrand && matchesSearch;
    });
  }, [products, selectedBrand, productSearch]);

  // Selected Customer details
  const selectedCustomer = useMemo(() => {
    if (customerId === 'walk-in') {
      return {
        id: 'walk-in',
        name: 'Walk-in Retailer (Cash / Spot Pay)',
        outstandingBalance: 0,
        creditLimit: 0,
        phone: 'Instant Counter',
      };
    }
    return customers.find((c) => c.id === customerId) || null;
  }, [customerId, customers]);

  // Add product to sale list
  const handleAddProductToSale = (prod) => {
    const existingIndex = saleItems.findIndex((item) => item.productId === prod.id);
    if (existingIndex >= 0) {
      // Increment packs
      const updated = [...saleItems];
      updated[existingIndex].packs += 1;
      setSaleItems(updated);
      showToast(`Added 1 more ${prod.packType || 'crate'} of ${prod.name}`, 'info');
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
      showToast(`Added ${prod.name} to bill`, 'info');
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...saleItems];
    updated[index][field] = value;
    setSaleItems(updated);
  };

  const handleRemoveItem = (index) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations for line items
  const processedItems = useMemo(() => {
    return saleItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const packSize = Number(prod?.bottlesPerPack || 24);
      const totalBottles = (Number(item.packs || 0) * packSize) + Number(item.loose || 0);
      const lineTotal = totalBottles * Number(item.pricePerBottle || 0);
      const isStockSufficient = prod ? totalBottles <= prod.totalBottles : true;

      return {
        ...item,
        product: prod,
        packSize,
        totalBottles,
        lineTotal,
        isStockSufficient,
      };
    });
  }, [saleItems, products]);

  // Bill Total
  const billTotal = useMemo(() => {
    return processedItems.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [processedItems]);

  // Payment totals
  const totalPaid = Number(cashAmount || 0) + Number(upiAmount || 0);
  const totalAllocated = totalPaid + Number(creditAmount || 0);
  const paymentDifference = billTotal - totalAllocated;
  const isPaymentValid = Math.abs(paymentDifference) < 1;
  const isCreditAllowed = !(Number(creditAmount || 0) > 0 && customerId === 'walk-in');

  // Quick Payment helpers
  const handleSetAllCash = () => {
    setCashAmount(billTotal);
    setUpiAmount(0);
    setCreditAmount(0);
  };

  const handleSetAllUpi = () => {
    setCashAmount(0);
    setUpiAmount(billTotal);
    setCreditAmount(0);
  };

  const handleSetBalanceToCredit = () => {
    if (customerId === 'walk-in') {
      showToast('Credit cannot be given to Walk-in customers. Please select a customer.', 'error');
      return;
    }
    const remainder = Math.max(0, billTotal - totalPaid);
    setCreditAmount(remainder);
  };

  const handleClearSale = () => {
    setSaleItems([]);
    setCashAmount(0);
    setUpiAmount(0);
    setCreditAmount(0);
    showToast('Sale cleared', 'info');
  };

  const handleConfirmSale = () => {
    if (processedItems.length === 0) {
      showToast('Cannot complete an empty sale', 'error');
      return;
    }

    if (!isPaymentValid) {
      showToast('Payment breakdown must match the Bill Total', 'error');
      return;
    }

    if (!isCreditAllowed) {
      showToast('Credit payment requires a registered wholesale customer', 'error');
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
        cash: Number(cashAmount || 0),
        upi: Number(upiAmount || 0),
        credit: Number(creditAmount || 0),
      },
    };

    const newSale = addSale(salePayload);
    setCompletedSale(newSale);

    showToast(`Bill #${newSale.billNumber} created successfully!`, 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of Sale (New Bill)"
        description="Fast wholesale dispatch counter. Add crates and loose bottles, configure mixed payments, and issue immediate bills."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Bill</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Selector Catalog (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col h-[750px]">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Product Catalog</h3>
            <p className="text-xs text-slate-500">Click any product to add to the active bill</p>
          </div>

          {/* Search & Brand Filter */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cold drinks..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {brandsList.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition ${
                    selectedBrand === brand
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredProducts.map((prod) => {
              const isLow = prod.totalBottles <= (prod.lowStockThreshold || 150);
              const isOut = prod.totalBottles === 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOut && handleAddProductToSale(prod)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 select-none ${
                    isOut
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {prod.brand} • {prod.size} • ({prod.bottlesPerPack} btls/{prod.packType || 'crate'})
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      ₹{prod.sellingPrice}/btl
                    </div>
                    <div
                      className={`text-[10px] font-semibold mt-0.5 ${
                        isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {prod.totalBottles} in stock
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isOut}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Sale / Bill Builder (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer Selection Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Customer & Credit Terms
              </label>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900"
              >
                <option value="walk-in">Walk-in Retailer (Cash / Instant)</option>
                <optgroup label="Registered Wholesale Retailers">
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Due: {formatCurrency(c.outstandingBalance)})
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Outstanding Badge Preview */}
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Current Outstanding:</span>
                  <span className="ml-1.5 font-bold text-rose-600">
                    {formatCurrency(selectedCustomer?.outstandingBalance || 0)}
                  </span>
                </div>
                {selectedCustomer?.creditLimit > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Limit: {formatCurrency(selectedCustomer.creditLimit)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sale Items Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Bill Items ({saleItems.length})
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-900">
                Total Units: {processedItems.reduce((acc, i) => acc + i.totalBottles, 0)} bottles
              </span>
            </div>

            {saleItems.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                Bill is currently empty. Click on any beverage product on the left catalog to add.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">Packs</th>
                      <th className="py-2 px-3">Loose</th>
                      <th className="py-2 px-3 text-right">Total Btls</th>
                      <th className="py-2 px-3 text-right">Price/Btl (₹)</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                      <th className="py-2 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 truncate max-w-[160px]">
                            {item.product?.name || 'Drink'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.product?.size} • ({item.packSize} btls/{item.product?.packType || 'cr'})
                          </div>
                          {!item.isStockSufficient && (
                            <span className="text-[10px] text-rose-600 font-bold block">
                              Warning: Only {item.product?.totalBottles} left!
                            </span>
                          )}
                        </td>

                        {/* Packs input */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={item.packs}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'packs', Math.max(0, parseInt(e.target.value) || 0))
                            }
                            className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded text-center bg-white"
                          />
                        </td>

                        {/* Loose input */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={item.loose}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'loose', Math.max(0, parseInt(e.target.value) || 0))
                            }
                            className="w-14 px-2 py-1 text-xs font-medium border border-slate-200 rounded text-center bg-white"
                          />
                        </td>

                        {/* Total Bottles */}
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {item.totalBottles}
                        </td>

                        {/* Editable Price */}
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            step="0.5"
                            value={item.pricePerBottle}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'pricePerBottle', parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-1.5 py-1 text-xs border border-slate-200 rounded text-right bg-white"
                          />
                        </td>

                        {/* Line Total */}
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(item.lineTotal)}
                        </td>

                        {/* Remove */}
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
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

            {/* Bill Subtotal Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Gross Bill Amount:</span>
              <span className="text-2xl font-black text-slate-900">{formatCurrency(billTotal)}</span>
            </div>
          </div>

          {/* Payment Section (Mixed Payments: Cash, UPI, Credit) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Payment Collection Breakdown
                </h4>
                <p className="text-xs text-slate-500">Accept mixed cash, UPI, and credit</p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleSetAllCash}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                >
                  All Cash
                </button>
                <button
                  type="button"
                  onClick={handleSetAllUpi}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                >
                  All UPI
                </button>
                <button
                  type="button"
                  onClick={handleSetBalanceToCredit}
                  className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 font-semibold text-amber-800 border border-amber-200 transition"
                >
                  Remainder to Credit
                </button>
              </div>
            </div>

            {/* Payment Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cash Input */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash Payment (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* UPI Input */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl">
                <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>UPI Payment (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Credit Input */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Credit Given (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>

            {/* Validation Message Box */}
            <div className="pt-2">
              {!isPaymentValid ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-900">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Payment Mismatch: Allocated <strong>{formatCurrency(totalAllocated)}</strong> of{' '}
                      <strong>{formatCurrency(billTotal)}</strong>.
                    </span>
                  </div>
                  <span className="font-bold">
                    {paymentDifference > 0 ? `₹${paymentDifference} Remaining` : `₹${Math.abs(paymentDifference)} Excess`}
                  </span>
                </div>
              ) : !isCreditAllowed ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Credit is recorded ({formatCurrency(creditAmount)}), but customer is set to Walk-in. Please select or register a verified wholesale customer.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment breakdown exactly matches the bill total. Ready to finalize.</span>
                  </div>
                  <span className="font-bold">Total: {formatCurrency(billTotal)}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Clear Sale
              </button>
              <button
                type="button"
                disabled={saleItems.length === 0 || !isPaymentValid || !isCreditAllowed}
                onClick={handleConfirmSale}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Complete Sale ({formatCurrency(billTotal)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Modal Shortcut */}
      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      {/* Confirmation to Clear Sale */}
      <ConfirmationModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={handleClearSale}
        title="Clear Current Sale"
        message="Are you sure you want to discard all items in this bill?"
        confirmText="Discard Bill"
        isDanger={true}
      />

      {/* Sale Success Invoice Modal */}
      <SaleSuccessModal
        isOpen={!!completedSale}
        onClose={() => setCompletedSale(null)}
        sale={completedSale}
        onNewSale={() => {
          setSaleItems([]);
          setCashAmount(0);
          setUpiAmount(0);
          setCreditAmount(0);
        }}
      />
    </div>
  );
}
