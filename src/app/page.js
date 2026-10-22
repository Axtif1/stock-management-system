'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PackagePlus, PackageMinus, FileText, Printer, X, Boxes, CheckCircle2 } from 'lucide-react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { products, settings, stockInLog, stockOutLog, getTodayStats } = useWarehouse();
  const { t, language } = useLanguage();
  const [showEodModal, setShowEodModal] = useState(false);

  const stats = getTodayStats();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">
      {/* Top Warehouse Title & Daily Summary Trigger */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {settings.warehouseName}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {todayFormatted} • {t('dash_title')}
          </p>
        </div>

        {/* Small Daily Summary Button */}
        <button
          type="button"
          onClick={() => setShowEodModal(true)}
          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1 shadow-xs"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'hi' ? 'Aaj Ka Hisab' : 'Daily Report'}</span>
        </button>
      </div>

      {/* 1. Two Summary Boxes (Side-by-side on Mobile) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Box 1: Total Stock Remaining */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block leading-tight">
            {t('dash_total_remaining_stock')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {stats.totalRemainingBoxes}{' '}
            <span className="text-xs font-bold text-slate-500">BOX</span>
          </div>
        </div>

        {/* Box 2: Total Stock Given */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block leading-tight">
            {t('dash_total_stock_given')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {stats.totalGivenBoxes}{' '}
            <span className="text-xs font-bold text-slate-500">BOX</span>
          </div>
        </div>
      </div>

      {/* Two Prominent Action Buttons: + Maal Aaya / − Maal Diya */}
      <div className="grid grid-cols-2 gap-3 pt-0.5">
        <Link
          href="/stock-in"
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition shadow-sm text-center"
        >
          <PackagePlus className="w-7 h-7 sm:w-8 sm:h-8 mb-0.5" />
          <span className="text-sm sm:text-base font-black tracking-tight leading-tight">
            {language === 'hi' ? '+ Maal Aaya' : '+ Stock In'}
          </span>
          <span className="text-[10px] opacity-90 font-medium">
            {language === 'hi' ? 'Naye BOX Jodein' : 'Add Boxes'}
          </span>
        </Link>

        <Link
          href="/stock-out"
          className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition shadow-sm text-center"
        >
          <PackageMinus className="w-7 h-7 sm:w-8 sm:h-8 mb-0.5 text-blue-400" />
          <span className="text-sm sm:text-base font-black tracking-tight leading-tight">
            {language === 'hi' ? '− Maal Diya' : '− Stock Out'}
          </span>
          <span className="text-[10px] text-slate-300 font-medium">
            {language === 'hi' ? 'Diye Hue BOX' : 'Give Boxes'}
          </span>
        </Link>
      </div>

      {/* Simple Product Summary Cards */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          {language === 'hi' ? 'Current Stock (BOX)' : 'Current Stock Summary (BOX)'}
        </div>

        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-3"
          >
            {/* Product Name & Total Aaye / Total Diye */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {prod.name}
              </h3>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 font-semibold">
                <span>
                  {t('total_received')}: <strong className="text-slate-800">{prod.totalReceived || 0} BOX</strong>
                </span>
                <span>•</span>
                <span>
                  {t('total_given')}: <strong className="text-slate-800">{prod.totalGiven || 0} BOX</strong>
                </span>
              </div>
            </div>

            {/* Remaining Boxes (Large Numbers) */}
            <div className="text-right shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t('remaining')}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {prod.remainingBoxes ?? (prod.totalReceived - prod.totalGiven)}{' '}
                <span className="text-xs font-bold text-slate-500">BOX</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple EOD Report Modal */}
      {showEodModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-100">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('eod_title')}</h3>
                <p className="text-xs text-slate-500">{todayFormatted}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('eod_print')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEodModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Table: Only Product, Received Today, Given Today, Remaining */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-2">{t('eod_col_product')}</th>
                    <th className="py-2 text-center">{t('eod_col_received_today')}</th>
                    <th className="py-2 text-center">{t('eod_col_given_today')}</th>
                    <th className="py-2 text-right">{t('eod_col_remaining')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => {
                    const inToday = stockInLog
                      .filter((e) => e.productId === prod.id && e.timestamp?.startsWith(todayStr))
                      .reduce((acc, e) => acc + Number(e.boxes || 0), 0);

                    const outToday = stockOutLog
                      .filter((e) => e.productId === prod.id && e.timestamp?.startsWith(todayStr))
                      .reduce((acc, e) => acc + Number(e.boxes || 0), 0);

                    return (
                      <tr key={prod.id}>
                        <td className="py-2.5 font-bold text-slate-900">{prod.name}</td>
                        <td className="py-2.5 text-center text-emerald-700 font-bold">
                          {inToday > 0 ? `+${inToday}` : '0'} BOX
                        </td>
                        <td className="py-2.5 text-center text-blue-700 font-bold">
                          {outToday > 0 ? `-${outToday}` : '0'} BOX
                        </td>
                        <td className="py-2.5 text-right font-black text-slate-900 text-sm">
                          {prod.remainingBoxes} BOX
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setShowEodModal(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
