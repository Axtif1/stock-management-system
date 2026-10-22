'use client';

import React, { useState } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import { Printer, Calendar } from 'lucide-react';

export default function EODReportPage() {
  const { products, stockInLog, stockOutLog, settings } = useWarehouse();
  const { t, language } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-10">
      <div className="no-print">
        <PageHeader
          title={t('eod_title')}
          description={language === 'hi' ? 'Aaj kitne BOX aaye aur kitne diye' : 'Daily summary of incoming and outgoing boxes'}
          actions={
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('eod_print')}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs print-card space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h2 className="text-base font-black text-slate-900">{settings.warehouseName}</h2>
          <p className="text-xs text-slate-500 font-semibold">{t('eod_title')} — {selectedDate}</p>
        </div>

        <div className="overflow-x-auto">
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
                  .filter((e) => e.productId === prod.id && e.timestamp?.startsWith(selectedDate))
                  .reduce((acc, e) => acc + Number(e.boxes || 0), 0);

                const outToday = stockOutLog
                  .filter((e) => e.productId === prod.id && e.timestamp?.startsWith(selectedDate))
                  .reduce((acc, e) => acc + Number(e.boxes || 0), 0);

                return (
                  <tr key={prod.id}>
                    <td className="py-3 font-bold text-slate-900">{prod.name}</td>
                    <td className="py-3 text-center text-emerald-700 font-bold">
                      {inToday > 0 ? `+${inToday}` : '0'} BOX
                    </td>
                    <td className="py-3 text-center text-blue-700 font-bold">
                      {outToday > 0 ? `-${outToday}` : '0'} BOX
                    </td>
                    <td className="py-3 text-right font-black text-slate-900 text-sm">
                      {prod.remainingBoxes} BOX
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
