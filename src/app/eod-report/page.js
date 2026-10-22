'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatNumber, formatDate, formatTimeOnly } from '@/utils/formatters';
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
  PackageCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function EODReportPage() {
  const { sales, stockEntries, repayments, products, customers, settings } = useWarehouse();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Filter records by selected date
  const filteredSales = useMemo(() => {
    return sales.filter((s) => s.timestamp && s.timestamp.startsWith(selectedDate));
  }, [sales, selectedDate]);

  const filteredStock = useMemo(() => {
    return stockEntries.filter((e) => e.date && e.date.startsWith(selectedDate));
  }, [stockEntries, selectedDate]);

  const filteredRepayments = useMemo(() => {
    return repayments.filter((r) => r.date && r.date.startsWith(selectedDate));
  }, [repayments, selectedDate]);

  // Aggregate Numbers
  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
  const salesCash = filteredSales.reduce((acc, s) => acc + Number(s.paymentBreakdown?.cash || 0), 0);
  const salesUpi = filteredSales.reduce((acc, s) => acc + Number(s.paymentBreakdown?.upi || 0), 0);
  const newCreditGiven = filteredSales.reduce((acc, s) => acc + Number(s.paymentBreakdown?.credit || 0), 0);

  const repaymentsCash = filteredRepayments
    .filter((r) => r.paymentMode === 'Cash')
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const repaymentsUpi = filteredRepayments
    .filter((r) => r.paymentMode === 'UPI')
    .reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const totalRepayments = repaymentsCash + repaymentsUpi;

  const totalCashCollected = salesCash + repaymentsCash;
  const totalUpiCollected = salesUpi + repaymentsUpi;

  // Product-wise sales breakdown
  const productWiseSales = useMemo(() => {
    const summary = {};
    filteredSales.forEach((s) => {
      s.items?.forEach((item) => {
        if (!summary[item.productId]) {
          const prod = products.find((p) => p.id === item.productId);
          summary[item.productId] = {
            productId: item.productId,
            name: item.name,
            brand: prod?.brand || 'Various',
            size: prod?.size || '',
            packSize: prod?.bottlesPerPack || 24,
            packType: prod?.packType || 'crate',
            totalBottles: 0,
            revenue: 0,
            cost: 0,
          };
        }
        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod ? Number(prod.purchaseRate || 0) : Number(item.pricePerBottle * 0.8);

        summary[item.productId].totalBottles += Number(item.totalBottles || 0);
        summary[item.productId].revenue += Number(item.lineTotal || 0);
        summary[item.productId].cost += unitCost * Number(item.totalBottles || 0);
      });
    });

    return Object.values(summary).map((item) => ({
      ...item,
      profit: Math.max(0, item.revenue - item.cost),
      packs: Math.floor(item.totalBottles / item.packSize),
      loose: item.totalBottles % item.packSize,
    }));
  }, [filteredSales, products]);

  const totalCostOfGoods = productWiseSales.reduce((acc, p) => acc + p.cost, 0);
  const estimatedGrossProfit = Math.max(0, totalSalesAmount - totalCostOfGoods);

  // Stock received today bottles
  const totalStockReceived = filteredStock.reduce((acc, e) => acc + Number(e.totalBottles || 0), 0);

  // Total closing stock
  const totalClosingStockBottles = products.reduce((acc, p) => acc + Number(p.totalBottles || 0), 0);

  // Download Local CSV
  const handleDownloadCsv = () => {
    const rows = [
      ['END OF DAY REPORT', selectedDate],
      ['Warehouse', settings.warehouseName],
      ['Owner', settings.ownerName],
      ['GSTIN', settings.gstin],
      [],
      ['FINANCIAL SUMMARY'],
      ['Total Sales Revenue', totalSalesAmount],
      ['Total Cash Collected', totalCashCollected],
      ['Total UPI Collected', totalUpiCollected],
      ['New Credit Given', newCreditGiven],
      ['Credit Repayments Collected', totalRepayments],
      ['Estimated Gross Profit', estimatedGrossProfit],
      [],
      ['PRODUCT WISE SALES DISPATCH'],
      ['Product Name', 'Brand', 'Total Bottles Sold', 'Crates/Loose', 'Revenue', 'Est Profit'],
      ...productWiseSales.map((p) => [
        p.name,
        p.brand,
        p.totalBottles,
        `${p.packs} ${p.packType} + ${p.loose} btls`,
        p.revenue,
        p.profit,
      ]),
      [],
      ['CUSTOMER CREDIT REPAYMENTS'],
      ['Customer', 'Amount', 'Payment Mode', 'Reference'],
      ...filteredRepayments.map((r) => [
        r.customerName,
        r.amount,
        r.paymentMode,
        r.referenceNumber,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EOD_Report_${selectedDate}_${settings.warehouseName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('EOD Report CSV downloaded successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Print/Export Bar */}
      <div className="no-print">
        <PageHeader
          title="End-of-Day Closing Report"
          description="Comprehensive daily closing reconciliation for cash drawers, UPI settlement, outward dispatches, and warehouse closing stock."
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
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Report</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download CSV</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="space-y-6 print-page">
        {/* Printable Official Header (Shown during print) */}
        <div className="hidden print-only border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-black">{settings.warehouseName}</h1>
              <p className="text-xs text-slate-600">{settings.address}</p>
              <p className="text-xs text-slate-600">
                GSTIN: {settings.gstin} • Phone: {settings.phone}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold uppercase text-slate-800">
                Daily Closing Shift Report
              </h2>
              <p className="text-xs font-semibold">Report Date: {formatDate(selectedDate)}</p>
              <p className="text-[10px] text-slate-500">Printed on {new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* 6 Closing Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total Day Sales"
            value={formatCurrency(totalSalesAmount)}
            subtext={`${filteredSales.length} bills generated`}
            icon={TrendingUp}
            variant="brand"
          />

          <StatCard
            title="Cash In Drawer"
            value={formatCurrency(totalCashCollected)}
            subtext={`Sales: ${formatCurrency(salesCash)} + Repay: ${formatCurrency(repaymentsCash)}`}
            icon={Banknote}
            variant="success"
          />

          <StatCard
            title="UPI / Bank Settled"
            value={formatCurrency(totalUpiCollected)}
            subtext={`Sales: ${formatCurrency(salesUpi)} + Repay: ${formatCurrency(repaymentsUpi)}`}
            icon={QrCode}
            variant="brand"
          />

          <StatCard
            title="New Credit Given"
            value={formatCurrency(newCreditGiven)}
            subtext="Recorded to retailer ledgers"
            icon={CreditCard}
            variant="warning"
          />

          <StatCard
            title="Repayments Recv"
            value={formatCurrency(totalRepayments)}
            subtext={`${filteredRepayments.length} clearance entries`}
            icon={CheckCircle2}
            variant="success"
          />

          <StatCard
            title="Est. Gross Margin"
            value={formatCurrency(estimatedGrossProfit)}
            subtext="Revenue minus purchase cost"
            icon={Boxes}
            variant="default"
          />
        </div>

        {/* Product-wise Sales Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print-card">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Product-Wise Sales & Dispatch Volume
              </h3>
              <p className="text-xs text-slate-500">Quantities sold broken down by unit packs</p>
            </div>
            <span className="text-xs font-bold text-slate-700">
              Total Dispatched:{' '}
              {formatNumber(productWiseSales.reduce((acc, p) => acc + p.totalBottles, 0))} bottles
            </span>
          </div>

          {productWiseSales.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No sales recorded for this date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-4">Beverage Product</th>
                    <th className="py-2.5 px-4">Brand</th>
                    <th className="py-2.5 px-4">Pack Conversion</th>
                    <th className="py-2.5 px-4 text-right">Total Bottles Sold</th>
                    <th className="py-2.5 px-4 text-right">Sales Revenue</th>
                    <th className="py-2.5 px-4 text-right">Estimated Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productWiseSales.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-4 text-slate-600">{item.brand}</td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {item.packs} {item.packType}s + {item.loose} loose
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">
                        {formatNumber(item.totalBottles)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                        +{formatCurrency(item.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2-Column Split: Stock Received Today & Customer Credit Repayments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock Received Today */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print-card">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Stock Received Today ({filteredStock.length})
              </h3>
              <span className="text-xs font-semibold text-emerald-700">
                +{formatNumber(totalStockReceived)} Bottles In
              </span>
            </div>

            {filteredStock.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No inward stock entries received on this date.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {filteredStock.map((entry) => (
                  <div key={entry.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{entry.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        {entry.supplier} • {entry.crates} crates + {entry.looseBottles} loose
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600">+{entry.totalBottles} btls</span>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(entry.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Credit Repayments */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print-card">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Customer Repayments Collected ({filteredRepayments.length})
              </h3>
              <span className="text-xs font-semibold text-emerald-700">
                {formatCurrency(totalRepayments)} Settled
              </span>
            </div>

            {filteredRepayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No debt repayments logged on this date.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {filteredRepayments.map((rep) => (
                  <div key={rep.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{rep.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        Mode: <strong>{rep.paymentMode}</strong> • Ref: {rep.referenceNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(rep.amount)}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {formatTimeOnly(rep.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Closing Warehouse Stock Balance Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs print-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Warehouse Closing Stock Summary
            </h4>
            <p className="text-xs text-slate-500">
              End-of-shift net bottles remaining in cold storage
            </p>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <span className="text-xs text-slate-500">Active SKUs</span>
              <div className="text-lg font-bold text-slate-900">{products.length} Items</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Total Remaining</span>
              <div className="text-xl font-extrabold text-slate-900">
                {formatNumber(totalClosingStockBottles)} Bottles
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500">Total Credit Outstanding</span>
              <div className="text-xl font-extrabold text-rose-600">
                {formatCurrency(
                  customers.reduce((acc, c) => acc + Number(c.outstandingBalance || 0), 0)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Printable Signature Section */}
        <div className="hidden print-only pt-8 grid grid-cols-2 gap-8 text-xs text-center">
          <div className="border-t border-slate-400 pt-2">
            <span className="font-bold">Prepared by: Shift Operator / Counter Cashier</span>
          </div>
          <div className="border-t border-slate-400 pt-2">
            <span className="font-bold">Verified by: Warehouse Owner / Authorized Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
}
