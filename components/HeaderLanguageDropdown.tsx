'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe,
  Check,
  ChevronDown,
  Sparkles,
  RotateCcw,
  Languages as LanguagesIcon
} from 'lucide-react';
import { useLanguage, LanguageCode } from '@/lib/LanguageContext';

export interface NativeLangConfig {
  code: LanguageCode;
  nativeName: string;
  englishLabel: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const CORE_5_LANGUAGES: NativeLangConfig[] = [
  { code: 'ar', nativeName: 'العربية', englishLabel: 'Arabic', flag: '🇱🇧', dir: 'rtl' },
  { code: 'en', nativeName: 'English', englishLabel: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', englishLabel: 'French', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', englishLabel: 'Spanish', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fa', nativeName: 'فارسی', englishLabel: 'Persian', flag: '🇮🇷', dir: 'rtl' },
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function HeaderLanguageDropdown() {
  const { language, setLanguage, dir, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isGoogleTranslateOpen, setIsGoogleTranslateOpen] = useState(false);
  const [isGTranslateActive, setIsGTranslateActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if Google Translate was previously used
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasGoogTrans = document.cookie.includes('googtrans=') && !document.cookie.includes('googtrans=; expires');
      setIsGTranslateActive(hasGoogTrans);
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clear Google Translate cookie & revert
  const clearGoogleTranslate = useCallback(() => {
    if (typeof document === 'undefined') return;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    if (typeof window !== 'undefined' && window.location.hostname) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domainParts.slice(-2).join('.')};`;
      }
    }
    setIsGTranslateActive(false);

    // If an iframe or translated elements exist, reload or clean up
    const frame = document.querySelector('iframe.goog-te-banner-frame') as HTMLElement | null;
    if (frame) frame.style.display = 'none';
  }, []);

  // Initialize and load Google Translate widget
  const triggerGoogleTranslate = () => {
    setIsGoogleTranslateOpen((prev) => !prev);

    if (typeof window === 'undefined') return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          const slot = document.getElementById('vanguard_google_translate_slot');
          if (slot && slot.childElementCount === 0) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                autoDisplay: false,
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              },
              'vanguard_google_translate_slot'
            );
          }
        }
      } catch (err) {
        console.warn('Failed to initialize Google Translate element:', err);
      }
    };

    const scriptId = 'vanguard-google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  };

  const handleSelectNative = (code: LanguageCode) => {
    setLanguage(code);
    clearGoogleTranslate();
    setIsOpen(false);
  };

  const currentLangMeta = CORE_5_LANGUAGES.find((l) => l.code === language) || {
    code: language,
    nativeName: language.toUpperCase(),
    englishLabel: 'Language',
    flag: '🌐',
    dir: dir,
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 1. Header Clean Action Button */}
      <button
        type="button"
        id="vanguard-header-languages-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs select-none ${
          isOpen
            ? 'bg-slate-200 border-slate-300 text-slate-900 ring-2 ring-primary/20'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
        }`}
        title={t('language', 'Language')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-slate-600 shrink-0" />
        <span className="hidden sm:inline font-bold tracking-tight">
          {t('languages', 'Languages')}
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10.5px] font-mono font-black uppercase text-slate-700 shadow-3xs flex items-center gap-1">
          <span>{currentLangMeta.flag}</span>
          <span>{currentLangMeta.code}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-600' : ''
          }`}
        />
      </button>

      {/* 2. Compact Popover / Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute end-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 text-xs text-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Popover Header */}
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <LanguagesIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('select_language', 'System Languages')}</span>
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
              {dir.toUpperCase()}
            </span>
          </div>

          {/* 3. Core 5 Native System Languages */}
          <div className="py-1 px-1.5 space-y-1">
            {CORE_5_LANGUAGES.map((item) => {
              const isActive = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectNative(item.code)}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/30 text-slate-900 font-extrabold shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base shrink-0 leading-none">{item.flag}</span>
                    <div className="text-start flex flex-col">
                      <span className="text-xs leading-tight font-bold text-slate-900">
                        {item.nativeName}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {item.englishLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      {item.code}
                    </span>
                    {isActive ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 4. Horizontal Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* 5. Fallback / Universal Languages (Google Translate Integration) */}
          <div className="px-1.5 pt-0.5">
            <button
              type="button"
              onClick={triggerGoogleTranslate}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                isGoogleTranslateOpen
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-bold">
                  {t('more_languages_gt', 'More Languages (Google Translate)')}
                </span>
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">
                100+
              </span>
            </button>

            {/* Embedded Google Translate Widget Container */}
            {isGoogleTranslateOpen && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                <div className="text-[10.5px] text-slate-500 font-medium">
                  {t('select_any_language_on_the_fly', 'Select from 100+ global languages for automated on-the-fly translation:')}
                </div>

                <div
                  id="vanguard_google_translate_slot"
                  className="min-h-[36px] flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1"
                />

                {isGTranslateActive && (
                  <button
                    type="button"
                    onClick={clearGoogleTranslate}
                    className="w-full mt-1.5 py-1 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('restore_native_erp', 'Reset to Native ERP System')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
