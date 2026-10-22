'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Boxes,
  ShoppingCart,
  PackagePlus,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber, formatTimeOnly } from '@/utils/formatters';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/layout/PageHeader';

export default function DashboardPage() {
  const { sales, getTodayStats } = useWarehouse();
  const { t } = useLanguage();

  const stats = getTodayStats();

  // Low stock products (max 4 for clean presentation)
  const lowStockItems = stats.lowStockProducts.slice(0, 4);

  // Recent sales (latest 4 for clean presentation)
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  // Combined Cash + UPI received today
  const totalCashUpiReceived = stats.totalCashReceived + stats.totalUpiReceived;

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <PageHeader
        title={t('dash_title')}
        description={t('dash_subtitle')}
      />

      {/* 4 Essential Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t('dash_today_sales')}
          value={formatCurrency(stats.todaySalesTotal)}
          subtext={`${stats.todaySalesList.length} bills`}
          icon={TrendingUp}
          variant="brand"
        />

        <StatCard
          title={t('dash_cash_upi_received')}
          value={formatCurrency(totalCashUpiReceived)}
          subtext={`Cash: ${formatCurrency(stats.totalCashReceived)} | UPI: ${formatCurrency(stats.totalUpiReceived)}`}
          icon={Wallet}
          variant="success"
        />

        <StatCard
          title={t('dash_credit_given')}
          value={formatCurrency(stats.creditGivenToday)}
          subtext={`Total Due: ${formatCurrency(stats.totalOutstandingCredit)}`}
          icon={CreditCard}
          variant="warning"
        />

        <StatCard
          title={t('dash_remaining_stock')}
          value={`${formatNumber(stats.totalStockRemaining)}`}
          subtext={t('bottles')}
          icon={Boxes}
          variant="default"
        />
      </div>

      {/* Prominent Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/new-sale"
          className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">{t('dash_new_sale_btn')}</div>
              <div className="text-xs text-slate-400">Quick retail billing counter</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/stock-in"
          className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
              <PackagePlus className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold">{t('dash_add_stock_btn')}</div>
              <div className="text-xs text-slate-500">Record incoming crates</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 2 Focused Working Sections: Low Stock Watchlist & Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Alert List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">{t('dash_low_stock_title')}</h3>
              </div>
              <Link
                href="/inventory"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {t('dash_view_all_stock')}
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-1">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t('dash_no_low_stock')}
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div key={prod.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {prod.brand} • {prod.size}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600">
                        {prod.totalBottles} {t('bottles')}
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

          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              href="/stock-in"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 justify-center py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>{t('dash_add_stock_btn')}</span>
            </Link>
          </div>
        </div>

        {/* Recent Sales List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{t('dash_recent_sales_title')}</h3>
              <Link
                href="/eod-report"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {t('dash_view_all_sales')}
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-1">
              {recentSales.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t('dash_no_recent_sales')}
                </div>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {sale.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {sale.billNumber} • {formatTimeOnly(sale.timestamp)}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900">
                        {formatCurrency(sale.totalAmount)}
                      </div>
                      <div className="text-[10px] flex items-center gap-1 justify-end mt-0.5 font-medium">
                        {sale.paymentBreakdown?.cash > 0 && (
                          <span className="text-emerald-700">Cash</span>
                        )}
                        {sale.paymentBreakdown?.upi > 0 && (
                          <span className="text-indigo-700">UPI</span>
                        )}
                        {sale.paymentBreakdown?.credit > 0 && (
                          <span className="text-amber-700 font-bold">Udhaar</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              href="/new-sale"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 justify-center py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{t('dash_new_sale_btn')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
