'use client';

import React, { useState } from 'react';

export const VANGUARD_CATEGORIES = [
  { id: 'recently-viewed', title: 'Recently Viewed' },
  { id: 'internal-control', title: 'Internal Control' },
  { id: 'financial', title: 'Financial' },
  { id: 'product-sales', title: 'Product Sales' },
  { id: 'customer-sales', title: 'Customer Sales' },
  { id: 'todays-history', title: "Today's & History" },
  { id: 'time-attendance', title: 'Time & Attendance' },
  { id: 'lists', title: 'Lists' },
];

export function VanguardReportsSidebar({ onSelectCategory }: { onSelectCategory?: (id: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('recently-viewed');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = VANGUARD_CATEGORIES.filter((cat) =>
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
        <h1 className="text-[22px] font-bold text-[#1e293b] leading-tight">Sales Reports</h1>
        <div className="flex items-center gap-1.5 text-xs text-[#527a9e] mt-1 font-medium">
          <span>Home</span>
          <span className="text-slate-400">/</span>
          <span className="text-[#527a9e]">Sales Reports</span>
        </div>
      </div>

      {/* 2. Vanguard Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-[15px] font-bold text-[#1a629b] tracking-tight">Search Reports</h2>
        </div>

        {/* Search Box */}
        <div className="relative mb-3">
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"
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
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1a629b] focus:ring-1 focus:ring-[#1a629b] transition-all"
          />
        </div>

        {/* Categories List */}
        <ul className="divide-y divide-slate-200 border-t border-slate-200">
          {filteredCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{ color: '#1a629b' }}
                  className={`w-full text-left py-2.5 px-2 text-[13.5px] font-bold transition-all rounded block ${
                    isActive
                      ? 'bg-blue-50/80 text-[#0d3f66] pl-3'
                      : 'hover:bg-slate-50 hover:text-[#0d3f66] hover:pl-3'
                  }`}
                >
                  {cat.title}
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
