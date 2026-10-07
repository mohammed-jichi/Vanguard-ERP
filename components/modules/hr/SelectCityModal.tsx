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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t('hr.select_city', 'Select City')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('hr.city_lebanon', 'City / Town')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-2 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(150);
              }}
              placeholder={t('hr.search_city_name', 'Search city name...')}
              className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'
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
                className={`absolute top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer ${
                  isRtl ? 'left-2.5' : 'right-2.5'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100"
        >
          {displayedCities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium flex flex-col items-center justify-center gap-2">
              <MapPin className="w-8 h-8 text-slate-300 stroke-1" />
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
                  className={`w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition cursor-pointer text-left ${
                    isSelected ? 'bg-primary/5 text-primary' : 'text-slate-900'
                  }`}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-semibold text-slate-900">
                      {city.name}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {city.district}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md shrink-0">
                    {city.district}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {filteredCities.length} {t('hr.city_lebanon', 'Cities')}
            {visibleCount < filteredCities.length && ` (showing ${visibleCount})`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-700 hover:bg-slate-200/70 border border-slate-200 rounded-lg px-4 py-2 font-medium transition cursor-pointer text-xs bg-white"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectCityModal;
