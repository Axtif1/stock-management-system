'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Banknote,
  QrCode,
  CreditCard,
  TrendingUp,
  Boxes,
  CheckCircle2,
} from 'lucide-react';

export default function EODReportPage() {
  const { sales, stockEntries, repayments, products, settings } = useWarehouse();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Filter sales and repayments for the selected date
  const filteredSales = useMemo(() => {
    return sales.filter((s) => s.timestamp && s.timestamp.startsWith(selectedDate));
  }, [sales, selectedDate]);

  const filteredRepayments = useMemo(() => {
    return repayments.filter((r) => r.date && r.date.startsWith(selectedDate));
  }, [repayments, selectedDate]);

  // Essential Values
  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
  const salesCash = filteredSales.reduce((acc, s) => acc + Number(s.paymentBreakdown?.cash || 0), 0);
  const salesUpi = filteredSales.reduce((acc, s) => acc + Number(s.paymentBreakdown?.upi || 0), 0);
  const newCreditGiven = filteredSales.reduce((acc, s) => acc + Number(s.paymentBreakdown?.credit || 0), 0);

  const repaymentsTotal = filteredRepayments.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const repaymentsCash = filteredRepayments
    .filter((r) => r.paymentMode === 'Cash')
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const repaymentsUpi = filteredRepayments
    .filter((r) => r.paymentMode === 'UPI')
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);

  const totalCashCollected = salesCash + repaymentsCash;
  const totalUpiCollected = salesUpi + repaymentsUpi;

  // Closing Stock Total
  const totalClosingStockBottles = products.reduce((acc, p) => acc + Number(p.totalBottles || 0), 0);

  // Product-wise stock & sales summary
  const productSummary = useMemo(() => {
    return products.map((prod) => {
      const soldBottles = filteredSales.reduce((acc, s) => {
        const item = s.items?.find((i) => i.productId === prod.id);
        return acc + (item ? Number(item.totalBottles || 0) : 0);
      }, 0);

      const packSize = Number(prod.bottlesPerPack || 24);
      const cratesSold = Math.floor(soldBottles / packSize);
      const looseSold = soldBottles % packSize;

      const revenue = soldBottles * Number(prod.sellingPrice || 0);

      return {
        id: prod.id,
        name: prod.name,
        brand: prod.brand,
        size: prod.size,
        packSize,
        soldBottles,
        cratesSold,
        looseSold,
        revenue,
        closingBottles: prod.totalBottles,
        closingCrates: Math.floor(prod.totalBottles / packSize),
        closingLoose: prod.totalBottles % packSize,
      };
    });
  }, [products, filteredSales]);

  // CSV Generation
  const handleDownloadCsv = () => {
    const rows = [
      ['END OF DAY REPORT', selectedDate],
      ['Warehouse', settings.warehouseName],
      [],
      ['1. Total Sales', totalSalesAmount],
      ['2. Cash Received', totalCashCollected],
      ['3. UPI Received', totalUpiCollected],
      ['4. Credit Given Today', newCreditGiven],
      ['5. Credit Repayments Received', repaymentsTotal],
      ['6. Warehouse Closing Stock (Bottles)', totalClosingStockBottles],
      [],
      ['PRODUCT SUMMARY'],
      ['Product Name', 'Brand', 'Size', 'Sold (Bottles)', 'Sold (Crates+Loose)', 'Revenue', 'Closing Stock (Bottles)'],
      ...productSummary.map((p) => [
        p.name,
        p.brand,
        p.size,
        p.soldBottles,
        `${p.cratesSold} cr + ${p.looseSold} btls`,
        p.revenue,
        p.closingBottles,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EOD_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV downloaded', 'success');
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header and Print / Export Controls */}
      <div className="no-print">
        <PageHeader
          title={t('eod_title')}
          description={t('eod_subtitle')}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('eod_print_btn')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('eod_download_csv_btn')}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Sheet */}
      <div className="space-y-5 print-page">
        {/* Printable Header */}
        <div className="hidden print-only border-b border-slate-400 pb-3 mb-3">
          <h1 className="text-lg font-black text-black">{settings.warehouseName}</h1>
          <p className="text-xs text-slate-600">Daily Closing Report — {formatDate(selectedDate)}</p>
        </div>

        {/* 6 Essential Values Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title={t('eod_total_sales')}
            value={formatCurrency(totalSalesAmount)}
            subtext={`${filteredSales.length} bills`}
            icon={TrendingUp}
            variant="brand"
          />

          <StatCard
            title={t('eod_cash_received')}
            value={formatCurrency(totalCashCollected)}
            subtext="Galla cash"
            icon={Banknote}
            variant="success"
          />

          <StatCard
            title={t('eod_upi_received')}
            value={formatCurrency(totalUpiCollected)}
            subtext="Bank / QR"
            icon={QrCode}
            variant="brand"
          />

          <StatCard
            title={t('eod_credit_given')}
            value={formatCurrency(newCreditGiven)}
            subtext="To retailers"
            icon={CreditCard}
            variant="warning"
          />

          <StatCard
            title={t('eod_repayments_received')}
            value={formatCurrency(repaymentsTotal)}
            subtext="Cleared dues"
            icon={CheckCircle2}
            variant="success"
          />

          <StatCard
            title={t('eod_closing_stock')}
            value={`${formatNumber(totalClosingStockBottles)}`}
            subtext={t('bottles')}
            icon={Boxes}
            variant="default"
          />
        </div>

        {/* Simple Product-Wise Stock Summary */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print-card">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t('eod_summary_table_title')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">{t('eod_col_product')}</th>
                  <th className="py-2.5 px-3">{t('inv_col_brand')}</th>
                  <th className="py-2.5 px-3 text-right">{t('eod_col_bottles_sold')}</th>
                  <th className="py-2.5 px-3">{t('eod_col_crates_equivalent')}</th>
                  <th className="py-2.5 px-3 text-right">{t('eod_col_revenue')}</th>
                  <th className="py-2.5 px-3 text-right">{t('eod_closing_stock')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productSummary.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.name} <span className="font-normal text-slate-400">({item.size})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.brand}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {item.soldBottles} btls
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.soldBottles > 0 ? `${item.cratesSold} cr + ${item.looseSold} btls` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                      {item.closingBottles} btls ({item.closingCrates} cr + {item.closingLoose})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
