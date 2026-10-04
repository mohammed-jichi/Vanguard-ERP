'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import {
  LEBANESE_CITIES_FULL,
  LebaneseCityEntry,
  searchLebaneseCitiesFull,
} from '@/lib/lebaneseCities';

export interface SelectCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: LebaneseCityEntry) => void;
  selectedCity?: string;
}

export function SelectCityModal({
  isOpen,
  onClose,
  onSelect,
  selectedCity = '',
}: SelectCityModalProps) {
  const { t, isRtl } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(150);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setVisibleCount(150);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter cities using the comprehensive Lebanese directory
  const filteredCities = useMemo(() => {
    return searchLebaneseCitiesFull(searchQuery);
  }, [searchQuery]);

  // Increase visible count when scrolling near bottom
  const handleScroll = () => {
    const el = listContainerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 150) {
      if (visibleCount < filteredCities.length) {
        setVisibleCount((prev) => Math.min(prev + 100, filteredCities.length));
      }
    }
  };

  const displayedCities = useMemo(() => {
    return filteredCities.slice(0, visibleCount);
  }, [filteredCities, visibleCount]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('hr.select_city', 'Select City')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('hr.city_lebanon', 'City / Town')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(150);
              }}
              placeholder={t('hr.search_city_name', 'Search city name...')}
              className={`w-full py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:ring-blue-500 transition-all ${
                isRtl ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9 text-left'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(150);
                  searchInputRef.current?.focus();
                }}
                className={`absolute top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                  isRtl ? 'left-2.5' : 'right-2.5'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Results List */}
        <div
          ref={listContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-slate-900"
        >
          {displayedCities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
              <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-1" />
              <p>
                {t('hr.no_cities_found', 'No cities found matching')} &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            displayedCities.map((city, idx) => {
              const formattedValue = `${city.name} - ${city.district}`;
              const isSelected =
                selectedCity === formattedValue ||
                selectedCity === city.name ||
                selectedCity.startsWith(city.name);

              return (
                <button
                  key={`${city.name}-${city.district}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelect(city);
                    onClose();
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold border border-primary/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {city.name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {city.district}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-semibold group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                    {city.district}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {filteredCities.length} {t('hr.city_lebanon', 'Cities')}
            {visibleCount < filteredCities.length && ` (showing ${visibleCount})`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectCityModal;
