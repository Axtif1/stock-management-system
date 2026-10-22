'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CheckCircle2, Printer, ShoppingBag, ArrowRight } from 'lucide-react';

export default function SaleSuccessModal({ isOpen, onClose, sale, onNewSale }) {
  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Invoice Generated"
      subtitle={`Bill #${sale.billNumber} • ${formatDate(sale.timestamp)}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Success Icon Header */}
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Sale Completed Successfully</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer: <strong className="text-slate-800">{sale.customerName}</strong>
          </p>
        </div>

        {/* Bill Breakdown */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 text-xs">
          <div className="font-semibold text-slate-800 border-b border-slate-200 pb-2">
            Sold Items ({sale.items?.length || 0})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {sale.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-700">
                <span className="truncate max-w-[200px]">
                  {item.name} ({item.totalBottles} btls)
                </span>
                <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
            <span>Bill Total:</span>
            <span>{formatCurrency(sale.totalAmount)}</span>
          </div>

          {/* Payment breakdown */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-slate-400 block">Cash</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(sale.paymentBreakdown?.cash || 0)}
              </span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-slate-400 block">UPI</span>
              <span className="font-bold text-indigo-700">
                {formatCurrency(sale.paymentBreakdown?.upi || 0)}
              </span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-slate-400 block">Credit</span>
              <span className="font-bold text-amber-700">
                {formatCurrency(sale.paymentBreakdown?.credit || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNewSale) onNewSale();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <span>Start Next Bill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
