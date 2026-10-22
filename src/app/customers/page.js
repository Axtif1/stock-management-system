'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import CustomerModal from '@/components/customers/CustomerModal';
import RepaymentModal from '@/components/customers/RepaymentModal';
import CustomerLedgerModal from '@/components/customers/CustomerLedgerModal';
import { UserPlus, Wallet, FileText, Edit2, CreditCard } from 'lucide-react';

export default function CustomersPage() {
  const { customers } = useWarehouse();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [creditOnly, setCreditOnly] = useState(false);

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [repaymentCustomerId, setRepaymentCustomerId] = useState(null);
  const [ledgerCustomer, setLedgerCustomer] = useState(null);

  // Total Outstanding
  const totalOutstanding = useMemo(() => {
    return customers.reduce((acc, c) => acc + Number(c.outstandingBalance || 0), 0);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (creditOnly && Number(c.outstandingBalance || 0) <= 0) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [customers, creditOnly, searchTerm]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader
        title={t('cust_title')}
        description={t('cust_subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRepaymentCustomerId('')}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{t('cust_record_payment_btn')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCustomer(null);
                setIsAddCustomerOpen(true);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>{t('cust_add_btn')}</span>
            </button>
          </div>
        }
      />

      {/* Single Clean Total Due Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold">{t('cust_total_outstanding')}</span>
          <div className="text-2xl font-black text-rose-600 mt-0.5">
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <span className="font-bold text-slate-800">
            {customers.filter((c) => c.outstandingBalance > 0).length}
          </span>{' '}
          {t('cust_stores_count')}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <button
          type="button"
          onClick={() => setCreditOnly(!creditOnly)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
            creditOnly
              ? 'bg-rose-100 text-rose-900 border-rose-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {creditOnly ? 'Show All Customers' : 'Show Outstanding Only'}
        </button>
      </div>

      {/* Customer List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customers found"
            actionLabel={t('cancel')}
            onAction={() => {
              setSearchTerm('');
              setCreditOnly(false);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">{t('cust_col_name')}</th>
                  <th className="py-2.5 px-3">{t('cust_col_contact')}</th>
                  <th className="py-2.5 px-3 text-right">{t('cust_col_outstanding')}</th>
                  <th className="py-2.5 px-3 text-right">{t('cust_col_limit')}</th>
                  <th className="py-2.5 px-3 text-center">{t('status')}</th>
                  <th className="py-2.5 px-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const hasDue = Number(c.outstandingBalance || 0) > 0;
                  const isNearLimit = Number(c.outstandingBalance || 0) >= Number(c.creditLimit || 20000);
                  let status = 'Good Standing';
                  if (isNearLimit) status = 'Warning';
                  else if (hasDue) status = 'Active';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{c.address}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{c.contactPerson || '—'}</div>
                        <div className="text-[11px] text-slate-400">{c.phone}</div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`text-sm font-black ${
                            hasDue ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(c.outstandingBalance)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                        {formatCurrency(c.creditLimit)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={status} />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRepaymentCustomerId(c.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                            title={t('cust_record_payment_btn')}
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLedgerCustomer(c)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                            title={t('cust_view_ledger')}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomer(c);
                              setIsAddCustomerOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title={t('edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Modals */}
      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setEditingCustomer(null);
        }}
        customerToEdit={editingCustomer}
      />

      <RepaymentModal
        isOpen={repaymentCustomerId !== null}
        onClose={() => setRepaymentCustomerId(null)}
        initialCustomerId={repaymentCustomerId}
      />

      <CustomerLedgerModal
        isOpen={!!ledgerCustomer}
        onClose={() => setLedgerCustomer(null)}
        customer={ledgerCustomer}
        onRecordPayment={(cid) => setRepaymentCustomerId(cid)}
      />
    </div>
  );
}
