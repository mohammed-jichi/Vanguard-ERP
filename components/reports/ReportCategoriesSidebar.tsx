'use client';

import React, { useState } from 'react';

/**
 * Interface definition for Report Categories and Child Reports
 */
export interface ReportItem {
  id: string;
  title: string;
  code?: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  reports?: ReportItem[];
}

interface ReportCategoriesSidebarProps {
  categories?: ReportCategory[];
  onSelectReport?: (report: ReportItem) => void;
  activeReportId?: string | null;
}

const DEFAULT_OMEGA_CATEGORIES: ReportCategory[] = [
  { id: 'recently-viewed', name: 'Recently Viewed', reports: [] },
  { id: 'internal-control', name: 'Internal Control', reports: [] },
  { id: 'financial', name: 'Financial', reports: [] },
  { id: 'product-sales', name: 'Product Sales', reports: [] },
  { id: 'customer-sales', name: 'Customer Sales', reports: [] },
  { id: 'todays-history', name: "Today's & History", reports: [] },
  { id: 'time-attendance', name: 'Time & Attendance', reports: [] },
  { id: 'lists', name: 'Lists', reports: [] },
];

export default function ReportCategoriesSidebar({
  categories = DEFAULT_OMEGA_CATEGORIES,
  onSelectReport,
  activeReportId = null,
}: ReportCategoriesSidebarProps) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <aside className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-200 shadow-sm p-4 font-sans select-none">
      
      {/* 1. Card Header */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 
          style={{ color: '#1a629b' }} 
          className="text-[15px] font-bold tracking-tight text-[#1a629b]"
        >
          Search Reports
        </h2>
      </div>

      {/* 2. Search Input */}
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
          placeholder="Search reports..."
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1a629b] focus:ring-1 focus:ring-[#1a629b] transition-all"
        />
      </div>

      {/* 3. Category Accordion List with FORCED OMEGA BLUE */}
      <div className="divide-y divide-slate-200 border-t border-slate-200">
        {filteredCategories.map((category) => {
          const isOpen = openCategoryId === category.id;
          return (
            <div key={category.id} className="border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between py-2.5 px-2 hover:bg-blue-50/40 rounded transition-colors text-left group"
              >
                {/* Title in Omega Blue */}
                <span
                  style={{ color: '#1a629b' }}
                  className="text-[13.5px] font-bold text-[#1a629b] group-hover:text-[#0c3e66] transition-colors"
                >
                  {category.name}
                </span>

                {/* Chevron Icon in Omega Blue */}
                <svg
                  style={{ color: '#1a629b' }}
                  className={`w-3.5 h-3.5 text-[#1a629b] transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sub-Reports List if Accordion is Open */}
              {isOpen && category.reports && category.reports.length > 0 && (
                <div className="bg-slate-50/70 px-2 py-1.5 space-y-0.5 border-t border-slate-100">
                  {category.reports.map((report) => {
                    const isSelected = activeReportId === report.id;
                    return (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => onSelectReport && onSelectReport(report)}
                        className={`w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#1a629b] text-white font-medium'
                            : 'text-slate-600 hover:text-[#1a629b] hover:bg-white'
                        }`}
                      >
                        {report.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </aside>
  );
}
