'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouse } from '@/context/WarehouseContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import CustomerModal from '@/components/customers/CustomerModal';
import RepaymentModal from '@/components/customers/RepaymentModal';
import CustomerLedgerModal from '@/components/customers/CustomerLedgerModal';
import {
  Users,
  UserPlus,
  CreditCard,
  Banknote,
  Search,
  FileText,
  Edit2,
  Wallet,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function CustomersPage() {
  const { customers, repayments } = useWarehouse();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [creditFilter, setCreditFilter] = useState('ALL'); // ALL | OUTSTANDING | CLEAR

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [repaymentCustomerId, setRepaymentCustomerId] = useState(null);
  const [ledgerCustomer, setLedgerCustomer] = useState(null);

  // Computed Summaries
  const totalOutstanding = useMemo(() => {
    return customers.reduce((acc, c) => acc + Number(c.outstandingBalance || 0), 0);
  }, [customers]);

  const highCreditAccounts = useMemo(() => {
    return customers.filter((c) => Number(c.outstandingBalance || 0) >= Number(c.creditLimit || 20000));
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (creditFilter === 'OUTSTANDING' && Number(c.outstandingBalance || 0) <= 0) return false;
      if (creditFilter === 'CLEAR' && Number(c.outstandingBalance || 0) > 0) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [customers, creditFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers & Credit Management"
        description="Wholesale retailer credit ledgers, debt limits, repayment records, and transaction histories."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRepaymentCustomerId('')}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Record Repayment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCustomer(null);
                setIsAddCustomerOpen(true);
              }}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Add Customer</span>
            </button>
          </div>
        }
      />

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Outstanding Credit</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {customers.filter((c) => c.outstandingBalance > 0).length} buyer accounts
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Accounts Near/Over Limit</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {highCreditAccounts.length} Stores
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Requires follow-up before next delivery
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Repayments Logged Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {repayments.length} Payments
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recent payments through UPI & Cash
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search customer, phone, store..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCreditFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              creditFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setCreditFilter('OUTSTANDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              creditFilter === 'OUTSTANDING'
                ? 'bg-rose-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            With Outstanding ({customers.filter((c) => c.outstandingBalance > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setCreditFilter('CLEAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              creditFilter === 'CLEAR'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Zero Balance
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="No buyer store matched your search query."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchTerm('');
              setCreditFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Store / Business Name</th>
                  <th className="py-3 px-4">Contact Person & Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-right">Outstanding Due</th>
                  <th className="py-3 px-4">Last Payment</th>
                  <th className="py-3 px-4 text-center">Credit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const hasDue = Number(c.outstandingBalance || 0) > 0;
                  const isNearLimit =
                    Number(c.outstandingBalance || 0) >= Number(c.creditLimit || 20000);

                  let status = 'Good Standing';
                  if (isNearLimit) status = 'Warning';
                  else if (hasDue) status = 'Active';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        {c.notes && (
                          <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                            {c.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{c.contactPerson || '—'}</div>
                        <div className="text-[11px] text-slate-400">{c.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                        {c.address || '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatCurrency(c.creditLimit)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-extrabold ${
                            hasDue ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(c.outstandingBalance)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {c.lastPaymentDate ? formatDate(c.lastPaymentDate) : 'No payments yet'}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Record Repayment"
                            onClick={() => setRepaymentCustomerId(c.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="View Statement & Ledger"
                            onClick={() => setLedgerCustomer(c)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit Customer Profile"
                            onClick={() => {
                              setEditingCustomer(c);
                              setIsAddCustomerOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
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

      {/* Customer Add/Edit Modal */}
      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setEditingCustomer(null);
        }}
        customerToEdit={editingCustomer}
      />

      {/* Record Repayment Modal */}
      <RepaymentModal
        isOpen={repaymentCustomerId !== null}
        onClose={() => setRepaymentCustomerId(null)}
        initialCustomerId={repaymentCustomerId}
      />

      {/* Customer Ledger & Statement Modal */}
      <CustomerLedgerModal
        isOpen={!!ledgerCustomer}
        onClose={() => setLedgerCustomer(null)}
        customer={ledgerCustomer}
        onRecordPayment={(cid) => setRepaymentCustomerId(cid)}
      />
    </div>
  );
}
