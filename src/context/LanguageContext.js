'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('wm_lang');
        if (savedLang === 'hi' || savedLang === 'en') {
          setLanguageState(savedLang);
        }
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }
    setIsReady(true);
  }, []);

  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'hi') return;
    setLanguageState(newLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wm_lang', newLang);
      }
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, []);

  const t = useCallback(
    (key, fallback = '') => {
      const langDict = translations[language] || translations.en;
      if (langDict && langDict[key] !== undefined) {
        return langDict[key];
      }
      const fallbackDict = translations.en;
      if (fallbackDict && fallbackDict[key] !== undefined) {
        return fallbackDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
