'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_BRANDS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_STOCK_ENTRIES,
  INITIAL_SALES,
  INITIAL_REPAYMENTS,
  INITIAL_SETTINGS,
} from '@/data/mockData';

const WarehouseContext = createContext(null);

const STORAGE_KEYS = {
  PRODUCTS: 'wm_products_v1',
  CUSTOMERS: 'wm_customers_v1',
  STOCK_ENTRIES: 'wm_stock_entries_v1',
  SALES: 'wm_sales_v1',
  REPAYMENTS: 'wm_repayments_v1',
  SETTINGS: 'wm_settings_v1',
  BRANDS: 'wm_brands_v1',
  SUPPLIERS: 'wm_suppliers_v1',
};

export function WarehouseProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [stockEntries, setStockEntries] = useState(INITIAL_STOCK_ENTRIES);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [repayments, setRepayments] = useState(INITIAL_REPAYMENTS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
        const savedStock = localStorage.getItem(STORAGE_KEYS.STOCK_ENTRIES);
        const savedSales = localStorage.getItem(STORAGE_KEYS.SALES);
        const savedRepayments = localStorage.getItem(STORAGE_KEYS.REPAYMENTS);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const savedBrands = localStorage.getItem(STORAGE_KEYS.BRANDS);
        const savedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);

        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedStock) setStockEntries(JSON.parse(savedStock));
        if (savedSales) setSales(JSON.parse(savedSales));
        if (savedRepayments) setRepayments(JSON.parse(savedRepayments));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedBrands) setBrands(JSON.parse(savedBrands));
        if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
      }
    } catch (e) {
      console.warn('Could not read from local storage, using initial mock data.', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to local storage whenever state changes (if hydrated)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.STOCK_ENTRIES, JSON.stringify(stockEntries));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      localStorage.setItem(STORAGE_KEYS.REPAYMENTS, JSON.stringify(repayments));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Could not persist to local storage', e);
    }
  }, [products, customers, stockEntries, sales, repayments, settings, brands, suppliers, isHydrated]);

  // Product Operations
  const addProduct = (newProd) => {
    const totalBottles = (Number(newProd.fullPacks || 0) * Number(newProd.bottlesPerPack || 24)) + Number(newProd.looseBottles || 0);
    const product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      totalBottles,
      isActive: newProd.isActive !== undefined ? newProd.isActive : true,
    };
    setProducts((prev) => [product, ...prev]);
    return product;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updatedFields };
        const bottlesPerPack = Number(merged.bottlesPerPack || 24);
        let totalBottles = merged.totalBottles;
        if (updatedFields.fullPacks !== undefined || updatedFields.looseBottles !== undefined) {
          totalBottles = (Number(merged.fullPacks || 0) * bottlesPerPack) + Number(merged.looseBottles || 0);
        } else if (updatedFields.totalBottles !== undefined) {
          totalBottles = Number(updatedFields.totalBottles);
          merged.fullPacks = Math.floor(totalBottles / bottlesPerPack);
          merged.looseBottles = totalBottles % bottlesPerPack;
        }
        return {
          ...merged,
          totalBottles,
          fullPacks: Math.floor(totalBottles / bottlesPerPack),
          looseBottles: totalBottles % bottlesPerPack,
        };
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Stock In Operations
  const addStockEntry = (entry) => {
    const totalBottles = Number(entry.totalBottles || 0);
    const newEntry = {
      ...entry,
      id: `stk-${Date.now()}`,
      date: entry.date || new Date().toISOString(),
    };

    setStockEntries((prev) => [newEntry, ...prev]);

    // Update product inventory
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== entry.productId) return p;
        const newTotal = p.totalBottles + totalBottles;
        const packSize = Number(p.bottlesPerPack || 24);
        return {
          ...p,
          totalBottles: newTotal,
          fullPacks: Math.floor(newTotal / packSize),
          looseBottles: newTotal % packSize,
        };
      })
    );

    return newEntry;
  };

  // Sales Operations
  const addSale = (saleData) => {
    const newSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      billNumber: saleData.billNumber || `BILL-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`,
      timestamp: saleData.timestamp || new Date().toISOString(),
      status: 'Completed',
    };

    setSales((prev) => [newSale, ...prev]);

    // Deduct stock for each sold item
    if (Array.isArray(saleData.items)) {
      setProducts((prev) =>
        prev.map((prod) => {
          const soldItem = saleData.items.find((item) => item.productId === prod.id);
          if (!soldItem) return prod;

          const soldBottles = Number(soldItem.totalBottles || 0);
          const newTotal = Math.max(0, prod.totalBottles - soldBottles);
          const packSize = Number(prod.bottlesPerPack || 24);

          return {
            ...prod,
            totalBottles: newTotal,
            fullPacks: Math.floor(newTotal / packSize),
            looseBottles: newTotal % packSize,
          };
        })
      );
    }

    // If credit given, update customer's outstanding balance
    const creditAmount = Number(saleData.paymentBreakdown?.credit || 0);
    if (creditAmount > 0 && saleData.customerId && saleData.customerId !== 'walk-in') {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== saleData.customerId) return c;
          const newOutstanding = Number(c.outstandingBalance || 0) + creditAmount;
          return {
            ...c,
            outstandingBalance: newOutstanding,
            status: newOutstanding >= Number(c.creditLimit || 20000) ? 'Warning' : 'Active',
          };
        })
      );
    }

    return newSale;
  };

  // Customer Operations
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      outstandingBalance: Number(customerData.outstandingBalance || 0),
      creditLimit: Number(customerData.creditLimit || 20000),
      lastPaymentDate: null,
      status: customerData.status || 'Active',
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id, updatedFields) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  // Repayment Operations
  const recordRepayment = (repaymentData) => {
    const amount = Number(repaymentData.amount || 0);
    const newRepayment = {
      ...repaymentData,
      id: `rep-${Date.now()}`,
      amount,
      date: repaymentData.date || new Date().toISOString(),
    };

    setRepayments((prev) => [newRepayment, ...prev]);

    // Reduce customer's outstanding balance
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== repaymentData.customerId) return c;
        const newOutstanding = Math.max(0, Number(c.outstandingBalance || 0) - amount);
        return {
          ...c,
          outstandingBalance: newOutstanding,
          lastPaymentDate: newRepayment.date,
          status: newOutstanding === 0 ? 'Good Standing' : 'Active',
        };
      })
    );

    return newRepayment;
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Reset to initial demo data
  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setStockEntries(INITIAL_STOCK_ENTRIES);
    setSales(INITIAL_SALES);
    setRepayments(INITIAL_REPAYMENTS);
    setSettings(INITIAL_SETTINGS);
    setBrands(INITIAL_BRANDS);
    setSuppliers(INITIAL_SUPPLIERS);
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
  };

  // Computed Warehouse Statistics
  const getTodayStats = () => {
    // Current date filter
    const todayStr = new Date().toISOString().slice(0, 10);

    const todaySalesList = sales.filter((s) => s.timestamp && s.timestamp.startsWith(todayStr));
    const todaySalesTotal = todaySalesList.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);

    const salesCashToday = todaySalesList.reduce((acc, s) => acc + Number(s.paymentBreakdown?.cash || 0), 0);
    const salesUpiToday = todaySalesList.reduce((acc, s) => acc + Number(s.paymentBreakdown?.upi || 0), 0);
    const creditGivenToday = todaySalesList.reduce((acc, s) => acc + Number(s.paymentBreakdown?.credit || 0), 0);

    const todayRepaymentsList = repayments.filter((r) => r.date && r.date.startsWith(todayStr));
    const repaymentsCashToday = todayRepaymentsList.filter((r) => r.paymentMode === 'Cash').reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const repaymentsUpiToday = todayRepaymentsList.filter((r) => r.paymentMode === 'UPI').reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const totalRepaymentsToday = repaymentsCashToday + repaymentsUpiToday;

    const totalCashReceived = salesCashToday + repaymentsCashToday;
    const totalUpiReceived = salesUpiToday + repaymentsUpiToday;

    const totalOutstandingCredit = customers.reduce((acc, c) => acc + Number(c.outstandingBalance || 0), 0);
    const totalStockRemaining = products.reduce((acc, p) => acc + Number(p.totalBottles || 0), 0);
    const lowStockProducts = products.filter((p) => p.totalBottles <= (p.lowStockThreshold || settings.lowStockAlertThreshold || 150));

    // Estimated today gross profit
    let todayCostOfGoods = 0;
    todaySalesList.forEach((s) => {
      s.items?.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod ? Number(prod.purchaseRate || 0) : Number(item.pricePerBottle * 0.8);
        todayCostOfGoods += unitCost * Number(item.totalBottles || 0);
      });
    });
    const estimatedGrossProfit = Math.max(0, todaySalesTotal - todayCostOfGoods);

    return {
      todaySalesTotal,
      salesCashToday,
      salesUpiToday,
      repaymentsCashToday,
      repaymentsUpiToday,
      totalCashReceived,
      totalUpiReceived,
      creditGivenToday,
      totalRepaymentsToday,
      totalOutstandingCredit,
      totalStockRemaining,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      todaySalesList,
      estimatedGrossProfit,
    };
  };

  return (
    <WarehouseContext.Provider
      value={{
        isHydrated,
        products,
        customers,
        stockEntries,
        sales,
        repayments,
        settings,
        brands,
        suppliers,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockEntry,
        addSale,
        addCustomer,
        updateCustomer,
        recordRepayment,
        updateSettings,
        resetToDefaultData,
        getTodayStats,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
}
