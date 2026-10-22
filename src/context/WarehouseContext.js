'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_STOCK_IN,
  INITIAL_STOCK_OUT,
  INITIAL_SETTINGS,
} from '@/data/mockData';

const WarehouseContext = createContext(null);

const STORAGE_KEYS = {
  PRODUCTS: 'wm_min_products_v2',
  STOCK_IN: 'wm_min_stock_in_v2',
  STOCK_OUT: 'wm_min_stock_out_v2',
  SETTINGS: 'wm_min_settings_v2',
};

export function WarehouseProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [stockInLog, setStockInLog] = useState(INITIAL_STOCK_IN);
  const [stockOutLog, setStockOutLog] = useState(INITIAL_STOCK_OUT);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const savedIn = localStorage.getItem(STORAGE_KEYS.STOCK_IN);
        const savedOut = localStorage.getItem(STORAGE_KEYS.STOCK_OUT);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedIn) setStockInLog(JSON.parse(savedIn));
        if (savedOut) setStockOutLog(JSON.parse(savedOut));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.warn('Could not read from local storage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.STOCK_IN, JSON.stringify(stockInLog));
      localStorage.setItem(STORAGE_KEYS.STOCK_OUT, JSON.stringify(stockOutLog));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save to local storage', e);
    }
  }, [products, stockInLog, stockOutLog, settings, isHydrated]);

  // Stock In: Add incoming boxes
  const addStockIn = ({ productId, productName, boxes }) => {
    const boxCount = Number(boxes || 0);
    if (boxCount <= 0) return;

    let targetProductId = productId;
    let finalName = productName;

    // Check if adding a brand new product
    if (!targetProductId || targetProductId === 'new') {
      const newId = `prod-${Date.now()}`;
      targetProductId = newId;
      finalName = productName.trim();

      const newProduct = {
        id: newId,
        name: finalName,
        totalReceived: boxCount,
        totalGiven: 0,
        remainingBoxes: boxCount,
      };

      setProducts((prev) => [newProduct, ...prev]);
    } else {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== targetProductId) return p;
          finalName = p.name;
          const newReceived = (p.totalReceived || 0) + boxCount;
          const given = p.totalGiven || 0;
          return {
            ...p,
            totalReceived: newReceived,
            remainingBoxes: newReceived - given,
          };
        })
      );
    }

    // Add entry to Stock In Log
    const entry = {
      id: `in-${Date.now()}`,
      productId: targetProductId,
      productName: finalName,
      boxes: boxCount,
      timestamp: new Date().toISOString(),
    };

    setStockInLog((prev) => [entry, ...prev]);
    return entry;
  };

  // Stock Out: Record boxes given out (Maal Diya)
  const addStockOut = ({ productId, boxes }) => {
    const boxCount = Number(boxes || 0);
    if (boxCount <= 0) return false;

    let productName = '';

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        productName = p.name;
        const newGiven = (p.totalGiven || 0) + boxCount;
        const received = p.totalReceived || 0;
        return {
          ...p,
          totalGiven: newGiven,
          remainingBoxes: Math.max(0, received - newGiven),
        };
      })
    );

    const entry = {
      id: `out-${Date.now()}`,
      productId,
      productName,
      boxes: boxCount,
      timestamp: new Date().toISOString(),
    };

    setStockOutLog((prev) => [entry, ...prev]);
    return entry;
  };

  // Add Product (Direct catalog creation)
  const addProduct = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const newProduct = {
      id: `prod-${Date.now()}`,
      name: trimmed,
      totalReceived: 0,
      totalGiven: 0,
      remainingBoxes: 0,
    };

    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  // Update Product Name
  const updateProduct = (id, newName) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p))
    );
  };

  // Delete Product
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Reset to initial box demo data
  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setStockInLog(INITIAL_STOCK_IN);
    setStockOutLog(INITIAL_STOCK_OUT);
    setSettings(INITIAL_SETTINGS);
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
  };

  // Dynamic Stock Calculations (Box-based)
  const getTodayStats = () => {
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayInBoxes = stockInLog
      .filter((e) => e.timestamp && e.timestamp.startsWith(todayStr))
      .reduce((acc, e) => acc + Number(e.boxes || 0), 0);

    const todayOutBoxes = stockOutLog
      .filter((e) => e.timestamp && e.timestamp.startsWith(todayStr))
      .reduce((acc, e) => acc + Number(e.boxes || 0), 0);

    // Box 1: Total number of BOX currently remaining across all products
    const totalRemainingBoxes = products.reduce(
      (acc, p) => acc + Number(p.remainingBoxes || 0),
      0
    );

    // Box 2: Total number of BOX given out across all products
    const totalGivenBoxes = products.reduce(
      (acc, p) => acc + Number(p.totalGiven || 0),
      0
    );

    return {
      todayInBoxes,
      todayOutBoxes,
      totalRemainingBoxes,
      totalGivenBoxes,
    };
  };

  return (
    <WarehouseContext.Provider
      value={{
        isHydrated,
        products,
        stockInLog,
        stockOutLog,
        settings,
        addStockIn,
        addStockOut,
        addProduct,
        updateProduct,
        deleteProduct,
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
