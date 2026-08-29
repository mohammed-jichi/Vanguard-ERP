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
      
      {/* 1. Global CSS Override for Report Category Titles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Force Omega Blue on all Category Header text and icons */
        .report-category-header,
        .report-category-header span,
        div[class*="overflow-y-auto"] .sticky,
        div[class*="overflow-y-auto"] .sticky span,
        div[class*="overflow-y-auto"] .sticky svg {
          color: #195a96 !important;
          stroke: #195a96 !important;
          fill: none !important;
        }
      `}} />

      {/* 2. Card Header */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 
          style={{ color: '#195a96' }} 
          className="text-[15px] font-bold tracking-tight text-[#195a96]"
        >
          Search Reports
        </h2>
      </div>

      {/* 3. Search Input */}
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
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#195a96] focus:ring-1 focus:ring-[#195a96] transition-all"
        />
      </div>

      {/* 4. Category Accordion List with FORCED OMEGA BLUE */}
      <div className="divide-y divide-slate-200 border-t border-slate-200">
        {filteredCategories.map((category) => {
          const isOpen = openCategoryId === category.id;
          return (
            <div key={category.id} className="border-b border-slate-200">
              <div 
                style={{ color: '#195a96' }}
                onClick={() => toggleCategory(category.id)}
                className="report-category-header text-[#195a96] font-bold text-sm px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center cursor-pointer select-none sticky top-0 z-10"
              >
                <span style={{ color: '#195a96' }}>
                  {category.name || 'Recently Viewed'}
                </span>

                <svg 
                  style={{ color: '#195a96', stroke: '#195a96' }}
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#195a96" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`lucide lucide-chevron-down transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

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
                            ? 'bg-[#195a96] text-white font-medium'
                            : 'text-slate-600 hover:text-[#195a96] hover:bg-white'
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
