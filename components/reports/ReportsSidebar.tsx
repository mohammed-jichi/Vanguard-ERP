'use client';

import React, { useState } from 'react';

interface ReportsSidebarProps {
  activeCategory?: string;
  onSelectCategory?: (key: string, name: string) => void;
}

export const ReportsSidebar: React.FC<ReportsSidebarProps> = ({
  activeCategory = 'product-sales',
  onSelectCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState(activeCategory);

  const categories = [
    { key: 'recently-viewed', name: 'Recently Viewed' },
    { key: 'internal-control', name: 'Internal Control' },
    { key: 'financial', name: 'Financial' },
    { key: 'product-sales', name: 'Product Sales' },
    { key: 'customer-sales', name: 'Customer Sales' },
    { key: 'todays-history', name: "Today's & History" },
    { key: 'time-attendance', name: 'Time & Attendance' },
    { key: 'lists', name: 'Lists' },
  ];

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (key: string, name: string) => {
    setSelectedKey(key);
    if (onSelectCategory) {
      onSelectCategory(key, name);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('omegaReportCategoryChanged', {
        detail: { key, name }
      }));
    }
  };

  return (
    <div className="reports-module-wrapper p-6 bg-[#f8fafc] min-h-screen">
      
      {/* 1. Top Section Header & Breadcrumbs (Omega Style) */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[#1e293b] leading-tight tracking-tight">Sales Reports</h1>
        <nav className="flex items-center gap-1.5 text-xs text-[#527a9e] mt-1 font-medium">
          <a href="#" className="hover:underline text-[#527a9e]">Home</a>
          <span className="text-slate-400">/</span>
          <span className="text-[#527a9e]">Sales Reports</span>
        </nav>
      </div>

      {/* 2. Omega Reports Sidebar Card */}
      <aside className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 select-none">
        
        {/* Card Header: Menu Button + Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer transition-colors">
            <i className="fa-solid fa-bars text-sm"></i>
          </div>
          <h2 className="text-[15px] font-bold text-[#1a629b] tracking-tight">Search Reports</h2>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..." 
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1a629b] focus:ring-1 focus:ring-[#1a629b] transition-all"
          />
        </div>

        {/* Reports Categories List (Exact Omega Blue & Dividers) */}
        <ul className="divide-y divide-slate-200/70 border-t border-slate-200/70 text-left">
          {filteredCategories.map((cat) => {
            const isActive = selectedKey === cat.key;
            return (
              <li key={cat.key} className="report-cat-item">
                <button 
                  onClick={() => handleSelect(cat.key, cat.name)} 
                  className={`report-cat-btn w-full text-left py-2.5 px-1.5 text-[13.5px] font-bold rounded transition-colors flex items-center justify-between group ${
                    isActive 
                      ? 'bg-blue-50/60 text-[#0d3f66] pl-2.5' 
                      : 'text-[#1a629b] hover:text-[#0f446e] hover:bg-slate-50/80'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

      </aside>

    </div>
  );
};

export default ReportsSidebar;
