'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';

export default function CustomerModal({ isOpen, onClose, customerToEdit = null }) {
  const { addCustomer, updateCustomer } = useWarehouse();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    creditLimit: 20000,
    outstandingBalance: 0,
    notes: '',
  });

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        contactPerson: customerToEdit.contactPerson || '',
        phone: customerToEdit.phone || '',
        address: customerToEdit.address || '',
        creditLimit: customerToEdit.creditLimit || 20000,
        outstandingBalance: customerToEdit.outstandingBalance || 0,
        notes: customerToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        address: '',
        creditLimit: 20000,
        outstandingBalance: 0,
        notes: '',
      });
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Store / Customer name is required', 'error');
      return;
    }

    const payload = {
      ...formData,
      creditLimit: Number(formData.creditLimit) || 0,
      outstandingBalance: Number(formData.outstandingBalance) || 0,
    };

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, payload);
      showToast(`Updated customer "${formData.name}"`, 'success');
    } else {
      addCustomer(payload);
      showToast(`Added customer "${formData.name}"`, 'success');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? 'Edit Customer Profile' : 'Add Wholesale Customer'}
      subtitle="Register retailer store details and credit terms"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Store / Business Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Balaji Kirana & Cold Drinks"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Bhai"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98200 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Shop Address / Location
          </label>
          <textarea
            rows="2"
            placeholder="Shop number, market, road..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Credit Limit (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial / Existing Outstanding (₹)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.outstandingBalance}
              onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Payment Preferences
          </label>
          <input
            type="text"
            placeholder="e.g. Always pays by UPI on Tuesday"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
          />
        </div>

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
            {customerToEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
