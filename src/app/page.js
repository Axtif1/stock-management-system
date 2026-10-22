'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Banknote,
  QrCode,
  CreditCard,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  PackagePlus,
  FileText,
  ArrowRight,
  Flame,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { formatCurrency, formatNumber, formatDate, formatTimeOnly } from '@/utils/formatters';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/layout/PageHeader';
import ProductDetailModal from '@/components/inventory/ProductDetailModal';

export default function DashboardPage() {
  const { products, sales, stockEntries, getTodayStats } = useWarehouse();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const stats = getTodayStats();

  // Low stock products
  const lowStockItems = stats.lowStockProducts.slice(0, 5);

  // Recent sales (latest 5)
  const recentSales = [...sales].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  // Best selling products calculation from sales
  const salesByProduct = {};
  sales.forEach((s) => {
    s.items?.forEach((item) => {
      salesByProduct[item.productId] = (salesByProduct[item.productId] || 0) + Number(item.totalBottles || 0);
    });
  });

  const bestSellers = Object.entries(salesByProduct)
    .map(([productId, quantity]) => {
      const prod = products.find((p) => p.id === productId);
      return {
        product: prod || { name: 'Unknown Item', brand: 'Various', size: '' },
        quantity,
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  // Stock received today (total bottles)
  const todayStr = new Date().toISOString().slice(0, 10);
  const stockReceivedToday = stockEntries
    .filter((e) => e.date && e.date.startsWith(todayStr))
    .reduce((acc, e) => acc + Number(e.totalBottles || 0), 0);

  // Stock sold today (total bottles)
  const stockSoldToday = stats.todaySalesList.reduce((acc, s) => {
    return acc + (s.items?.reduce((iAcc, item) => iAcc + Number(item.totalBottles || 0), 0) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Warehouse Operations Dashboard"
        description="Live overview of cold-drink inventory, wholesale sales, cash flow, and credit balances."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/stock-in"
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <PackagePlus className="w-4 h-4 text-slate-500" />
              <span>Stock In</span>
            </Link>
            <Link
              href="/eod-report"
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>EOD Report</span>
            </Link>
            <Link
              href="/new-sale"
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>New Sale (POS)</span>
            </Link>
          </div>
        }
      />

      {/* 6 Core Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySalesTotal)}
          subtext={`${stats.todaySalesList.length} bills generated`}
          icon={TrendingUp}
          variant="brand"
        />

        <StatCard
          title="Cash Received"
          value={formatCurrency(stats.totalCashReceived)}
          subtext={`Incl. ${formatCurrency(stats.repaymentsCashToday)} repayments`}
          icon={Banknote}
          variant="success"
        />

        <StatCard
          title="UPI Received"
          value={formatCurrency(stats.totalUpiReceived)}
          subtext={`Incl. ${formatCurrency(stats.repaymentsUpiToday)} repayments`}
          icon={QrCode}
          variant="brand"
        />

        <StatCard
          title="Credit Given"
          value={formatCurrency(stats.creditGivenToday)}
          subtext="To verified retailers"
          icon={CreditCard}
          variant="warning"
        />

        <StatCard
          title="Total Outstanding"
          value={formatCurrency(stats.totalOutstandingCredit)}
          subtext="All customer dues"
          icon={AlertTriangle}
          variant="danger"
        />

        <StatCard
          title="Stock Remaining"
          value={`${formatNumber(stats.totalStockRemaining)} btls`}
          subtext={`${products.length} catalog items`}
          icon={Boxes}
          variant="default"
        />
      </div>

      {/* Stock Movement Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Stock Movement Flow</h3>
            <p className="text-xs text-slate-500">Live throughput of crates and loose units across all brands</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-10 text-center w-full md:w-auto">
          <div>
            <span className="text-xs font-medium text-slate-500">Received In</span>
            <div className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5">
              +{formatNumber(stockReceivedToday)} btls
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Dispatched (Sales)</span>
            <div className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
              -{formatNumber(stockSoldToday)} btls
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Est. Gross Margin</span>
            <div className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
              {formatCurrency(stats.estimatedGrossProfit)}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Recent Sales & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Sales Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Recent Sales</h3>
              <p className="text-xs text-slate-500">Latest wholesale dispatches & invoices</p>
            </div>
            <Link
              href="/new-sale"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Create Bill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-4">Bill No</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Items Summary</th>
                  <th className="py-2.5 px-4 text-right">Bill Total</th>
                  <th className="py-2.5 px-4">Payment Split</th>
                  <th className="py-2.5 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {sale.billNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {sale.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate">
                      {sale.items?.map((i) => `${i.name} (${i.totalBottles})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {sale.paymentBreakdown?.cash > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            ₹{sale.paymentBreakdown.cash} C
                          </span>
                        )}
                        {sale.paymentBreakdown?.upi > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                            ₹{sale.paymentBreakdown.upi} U
                          </span>
                        )}
                        {sale.paymentBreakdown?.credit > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            ₹{sale.paymentBreakdown.credit} Cr
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                      {formatTimeOnly(sale.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Low Stock Alerts & Fast Replenish */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Low-Stock Watchlist</h3>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {stats.lowStockCount} Items
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  All items are well stocked above safety threshold!
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-2.5 flex items-center justify-between gap-3 group cursor-pointer"
                    onClick={() => setSelectedProduct(prod)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {prod.brand} • {prod.size}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-600">
                        {prod.totalBottles} left
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Min {prod.lowStockThreshold}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/stock-in"
              className="w-full py-2 px-3 text-xs font-semibold text-center text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Record Inward Stock Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Best-Selling Products */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Fast-Moving / Best-Selling SKUs</h3>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {bestSellers.map(({ product, quantity }, idx) => (
            <div
              key={product.id || idx}
              onClick={() => setSelectedProduct(product)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Rank #{idx + 1}</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  {quantity} bottles sold
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {product.brand} • {product.size}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">In Stock:</span>
                <span className="font-bold text-slate-800">{product.totalBottles || 0} bottles</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  );
}
