'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  X,
  Search,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  useLanguage,
  LanguageCode,
  ALL_LANGUAGES,
  PINNED_LANGUAGES,
  EXTENDED_LANGUAGES,
  LanguageMeta
} from '@/lib/LanguageContext';

interface LanguageSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageSwitcherModal({ isOpen, onClose }: LanguageSwitcherModalProps) {
  const { language, setLanguage, dir, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut listener to close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLanguages = ALL_LANGUAGES.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.nativeName.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        dir={dir}
        className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 animate-zoomIn flex flex-col max-h-[85vh] font-sans"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'اختر لغة النظام' : 'Select System Language'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {ALL_LANGUAGES.length} Languages
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'ar'
                  ? 'التبديل بين اللغات العالمية وضبط اتجاه الشاشة (RTL / LTR) لحظياً'
                  : 'Toggle interface language with automated document direction (RTL / LTR) switching'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Search Input */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث باسم اللغة أو الرمز (مثل English, Deutsch, Türkçe)...'
                  : 'Search world languages by name or code (e.g. Arabic, German, Spanish)...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Languages Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {/* Top 5 Pinned Section (if no active search) */}
          {!searchQuery && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'ar' ? 'اللغات الرئيسية المفضلة' : 'Top 5 Pinned Languages'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PINNED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`p-3 rounded-2xl border text-start transition-all flex items-center justify-between cursor-pointer ${
                      language === item.code
                        ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{item.nativeName}</div>
                        <div className="text-[10.5px] text-slate-500 font-medium">{item.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {item.dir}
                      </span>
                      {language === item.code && (
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extended World Languages Section */}
          <div>
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
              <span>{language === 'ar' ? 'كافة اللغات العالمية المدعومة' : 'All World Languages'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLanguages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`p-3 rounded-2xl border text-start transition-all flex items-center justify-between cursor-pointer ${
                    language === item.code
                      ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flag}</span>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{item.nativeName}</div>
                      <div className="text-[10.5px] text-slate-500 font-medium">{item.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {item.dir}
                    </span>
                    {language === item.code && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {filteredLanguages.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
                  {language === 'ar' ? 'لا توجد لغة مطابقة لبحثك' : 'No languages match your search query.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-mono">
            Active: <strong className="text-slate-800 uppercase">{language} ({dir})</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
