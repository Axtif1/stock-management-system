'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/formatters';
import { Banknote, QrCode } from 'lucide-react';

export default function RepaymentModal({
  isOpen,
  onClose,
  initialCustomerId = null,
}) {
  const { customers, recordRepayment } = useWarehouse();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

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
      const withDue = customers.find((c) => c.outstandingBalance > 0);
      setSelectedCustomerId(withDue ? withDue.id : customers[0].id);
    }
  }, [initialCustomerId, customers, isOpen, selectedCustomerId]);

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
      showToast(language === 'hi' ? 'Kripya amount dalein' : 'Enter a valid amount', 'error');
      return;
    }

    recordRepayment({
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Unknown Customer',
      amount: enteredAmount,
      paymentMode,
      referenceNumber: referenceNumber || (paymentMode === 'UPI' ? 'UPI-' + Date.now().toString().slice(-6) : 'CASH-' + Date.now().toString().slice(-4)),
      date: new Date(date).toISOString(),
      notes,
    });

    showToast(
      language === 'hi'
        ? `${selectedCustomer?.name} ki ${formatCurrency(enteredAmount)} payment jama ho gayi!`
        : `Repayment of ${formatCurrency(enteredAmount)} recorded for ${selectedCustomer?.name}`,
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
      title={t('cust_repay_title')}
      subtitle={t('cust_repay_subtitle')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('sale_customer_label')}
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900"
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
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t('sale_current_due')}:</span>
              <span className="font-bold text-rose-600">{formatCurrency(currentDue)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-200/60">
              <span className="text-slate-500">{t('cust_repay_balance_after')}:</span>
              <span className="font-bold text-slate-900">{formatCurrency(remainingDue)}</span>
            </div>
            {currentDue > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(currentDue))}
                className="mt-2 text-xs text-blue-600 font-bold block ml-auto hover:underline"
              >
                Full Due ({formatCurrency(currentDue)})
              </button>
            )}
          </div>
        )}

        {/* Repayment Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('cust_repay_amount')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
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

        {/* Payment Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {t('cust_repay_mode')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition ${
                paymentMode === 'UPI'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>{t('cust_repay_upi')}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('Cash')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition ${
                paymentMode === 'Cash'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>{t('cust_repay_cash')}</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
          >
            {t('cust_repay_save_btn')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
