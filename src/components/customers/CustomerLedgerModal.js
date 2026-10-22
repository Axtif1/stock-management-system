'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { useWarehouse } from '@/context/WarehouseContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowDownLeft, ArrowUpRight, Phone, MapPin, Receipt, Wallet } from 'lucide-react';

export default function CustomerLedgerModal({
  isOpen,
  onClose,
  customer,
  onRecordPayment,
}) {
  const { sales, repayments } = useWarehouse();

  if (!customer) return null;

  // Filter sales that have credit given to this customer
  const customerSales = sales.filter(
    (s) => s.customerId === customer.id && Number(s.paymentBreakdown?.credit || 0) > 0
  );

  // Filter repayments made by this customer
  const customerRepayments = repayments.filter(
    (r) => r.customerId === customer.id
  );

  // Combine into a chronological ledger timeline
  const ledgerEntries = [
    ...customerSales.map((s) => ({
      id: s.id,
      date: s.timestamp,
      type: 'CREDIT_SALE',
      billNumber: s.billNumber,
      amount: Number(s.paymentBreakdown?.credit || 0),
      totalBill: Number(s.totalAmount || 0),
      details: `${s.items?.length || 0} items sold`,
    })),
    ...customerRepayments.map((r) => ({
      id: r.id,
      date: r.date,
      type: 'REPAYMENT',
      billNumber: r.referenceNumber || 'REPAYMENT',
      amount: Number(r.amount || 0),
      paymentMode: r.paymentMode,
      details: r.notes || `${r.paymentMode} Payment Received`,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${customer.name} — Credit Ledger`}
      subtitle={`Contact: ${customer.contactPerson || 'N/A'} • ${customer.phone || 'N/A'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Customer Balance Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-xs text-slate-500 font-medium">Net Outstanding</span>
            <div className="text-xl font-bold text-rose-600 mt-0.5">
              {formatCurrency(customer.outstandingBalance)}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Credit Limit</span>
            <div className="text-base font-semibold text-slate-800 mt-0.5">
              {formatCurrency(customer.creditLimit)}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Account Status</span>
            <div className="mt-1">
              <StatusBadge status={customer.status || 'Active'} />
            </div>
          </div>
        </div>

        {/* Action button inside ledger */}
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Transaction History ({ledgerEntries.length})
          </h4>
          {onRecordPayment && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRecordPayment(customer.id);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Record Repayment</span>
            </button>
          )}
        </div>

        {/* Ledger Entries Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-80 overflow-y-auto">
          {ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions recorded for this customer yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Reference / Bill</th>
                  <th className="py-2.5 px-3 text-right">Credit Added (+)</th>
                  <th className="py-2.5 px-3 text-right">Repayment (-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEntries.map((entry) => {
                  const isCredit = entry.type === 'CREDIT_SALE';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        {isCredit ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowUpRight className="w-3 h-3 text-amber-600" />
                            Credit Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            Repayment ({entry.paymentMode})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-700">{entry.billNumber}</span>
                        <div className="text-[11px] text-slate-400">{entry.details}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700 whitespace-nowrap">
                        {isCredit ? `+ ${formatCurrency(entry.amount)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {!isCredit ? `- ${formatCurrency(entry.amount)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Close Statement
          </button>
        </div>
      </div>
    </Modal>
  );
}
