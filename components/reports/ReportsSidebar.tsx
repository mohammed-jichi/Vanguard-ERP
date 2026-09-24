'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export const VANGUARD_CATEGORIES = [
  { id: 'recently-viewed', title: 'Recently Viewed', key: 'recently_viewed' },
  { id: 'internal-control', title: 'Internal Control', key: 'internal_control' },
  { id: 'financial', title: 'Financial', key: 'financial' },
  { id: 'product-sales', title: 'Product Sales', key: 'product_sales' },
  { id: 'customer-sales', title: 'Customer Sales', key: 'customer_sales' },
  { id: 'todays-history', title: "Today's & History", key: 'todays_history' },
  { id: 'time-attendance', title: 'Time & Attendance', key: 'time_attendance' },
  { id: 'lists', title: 'Lists', key: 'lists' },
];

export function VanguardReportsSidebar({ onSelectCategory }: { onSelectCategory?: (id: string) => void }) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('recently-viewed');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = VANGUARD_CATEGORIES.filter((cat) =>
    t(cat.key, cat.title).toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    cat.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  return (
    <div className="w-full max-w-[280px] select-none p-2">
      {/* 1. Page Header */}
      <div className="mb-4">
        <h1 className="text-[22px] font-bold text-foreground leading-tight">{t('sales_reports', 'Sales Reports')}</h1>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
          <span>{t('home', 'Home')}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{t('sales_reports', 'Sales Reports')}</span>
        </div>
      </div>

      {/* 2. Vanguard Card Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl border border-border bg-muted flex items-center justify-center text-foreground shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-[15px] font-bold text-foreground tracking-tight">{t('search_reports', 'Search Reports')}</h2>
        </div>

        {/* Search Box */}
        <div className="relative mb-3">
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder', 'Search...')}
            className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Categories List */}
        <ul className="divide-y divide-border border-t border-border">
          {filteredCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left py-2.5 px-2 text-[13.5px] font-medium transition-all rounded-lg block ${
                    isActive
                      ? 'bg-muted text-foreground font-bold pl-3'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:pl-3'
                  }`}
                >
                  {t(cat.key, cat.title)}
                </button>
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
}

export const ReportsSidebar = VanguardReportsSidebar;
export default VanguardReportsSidebar;
