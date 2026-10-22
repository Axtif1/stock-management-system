'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/utils/formatters';
import { Banknote, QrCode, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function RepaymentModal({
  isOpen,
  onClose,
  initialCustomerId = null,
}) {
  const { customers, recordRepayment } = useWarehouse();
  const { showToast } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    } else if (customers.length > 0 && !selectedCustomerId) {
      // Pick first customer with outstanding balance
      const withDue = customers.find((c) => c.outstandingBalance > 0);
      setSelectedCustomerId(withDue ? withDue.id : customers[0].id);
    }
  }, [initialCustomerId, customers, isOpen]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentDue = Number(selectedCustomer?.outstandingBalance || 0);
  const enteredAmount = Number(amount || 0);
  const remainingDue = Math.max(0, currentDue - enteredAmount);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }

    if (enteredAmount <= 0) {
      showToast('Please enter a valid repayment amount greater than 0', 'error');
      return;
    }

    recordRepayment({
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Unknown Customer',
      amount: enteredAmount,
      paymentMode,
      referenceNumber: referenceNumber || (paymentMode === 'UPI' ? 'UPI-TRANS-' + Date.now().toString().slice(-6) : 'CASH-REC-' + Date.now().toString().slice(-4)),
      date: new Date(date).toISOString(),
      notes,
    });

    showToast(
      `Repayment of ${formatCurrency(enteredAmount)} recorded for ${selectedCustomer?.name}`,
      'success'
    );

    setAmount('');
    setNotes('');
    setReferenceNumber('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Repayment"
      subtitle="Log cash or UPI payment against customer's outstanding credit ledger"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Wholesale Customer <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — Due: {formatCurrency(c.outstandingBalance)}
              </option>
            ))}
          </select>
        </div>

        {/* Balance Preview Card */}
        {selectedCustomer && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Current Due</span>
                <div className="text-base font-bold text-rose-600 mt-0.5">
                  {formatCurrency(currentDue)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Paying Now</span>
                <div className="text-base font-bold text-emerald-600 mt-0.5">
                  {formatCurrency(enteredAmount)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Remaining Due</span>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {formatCurrency(remainingDue)}
                </div>
              </div>
            </div>

            {currentDue > 0 && (
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setAmount(String(currentDue))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Pay Full Balance ({formatCurrency(currentDue)})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Repayment Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Repayment Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">₹</span>
            <input
              type="number"
              min="1"
              step="1"
              required
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Payment Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition ${
                paymentMode === 'UPI'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>UPI / QR / Bank</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('Cash')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-semibold transition ${
                paymentMode === 'Cash'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Cash in Hand</span>
            </button>
          </div>
        </div>

        {/* Reference Number & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {paymentMode === 'UPI' ? 'UPI UTR / Reference No' : 'Receipt / Cash Voucher'}
            </label>
            <input
              type="text"
              placeholder={paymentMode === 'UPI' ? 'e.g. 429182948291' : 'Receipt #'}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Remarks
          </label>
          <input
            type="text"
            placeholder="e.g. Cleared bill dated 18th Oct"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
          >
            Save Repayment
          </button>
        </div>
      </form>
    </Modal>
  );
}
