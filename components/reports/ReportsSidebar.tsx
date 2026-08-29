'use client';

import React, { useState } from 'react';

interface ReportsSidebarProps {
  activeCategory?: string;
  onSelectCategory?: (key: string, name: string) => void;
}

export const ReportsSidebar: React.FC<ReportsSidebarProps> = ({
  activeCategory = 'Product Sales',
  onSelectCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState(activeCategory);

  const categories = [
    'Recently Viewed',
    'Internal Control',
    'Financial',
    'Product Sales',
    'Customer Sales',
    "Today's & History",
    'Time & Attendance',
    'Lists',
  ];

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (categoryTitle: string) => {
    setSelectedTitle(categoryTitle);
    if (onSelectCategory) {
      const key = categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      onSelectCategory(key, categoryTitle);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('omegaReportCategoryChanged', {
        detail: { name: categoryTitle }
      }));
    }
  };

  return (
    <div className="omega-reports-wrapper" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 className="omega-page-title text-[22px] font-bold text-[#2c3e50] mb-[2px]">Sales Reports</h1>
        <div className="omega-breadcrumb text-[13px] font-medium text-[#4a779d]">Home / Sales Reports</div>
      </div>

      {/* Main Card */}
      <div 
        className="omega-reports-card bg-white rounded-[18px] border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.03)] w-full max-w-[290px] p-[18px] select-none"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }}
      >
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div className="omega-menu-icon-btn w-[38px] h-[38px] rounded-[12px] border border-[#e2e8f0] bg-white text-[#334155] flex items-center justify-center shadow-sm">
            <i className="fa-solid fa-bars" style={{ fontSize: '14px' }}></i>
          </div>
          <div className="omega-search-header-title text-[15.5px] font-bold text-[#1a629b] tracking-[-0.2px]">Search Reports</div>
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '10px', fontSize: '12px', color: '#94a3b8' }}></i>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="omega-search-input border border-[#cbd5e1] rounded-[6px] py-[7px] pr-[10px] pl-[32px] text-[13px] text-[#334155] bg-white w-full outline-none focus:border-[#1a629b] focus:ring-1 focus:ring-[#1a629b]" 
            placeholder="Search..." 
          />
        </div>

        {/* Categories List */}
        <ul id="omegaCategoriesContainer" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {filteredCategories.map((cat, idx) => {
            const isActive = selectedTitle === cat;
            return (
              <li 
                key={cat} 
                className="omega-cat-item border-b border-[#e2e8f0]"
                style={idx === 0 ? { borderTop: '1px solid #e2e8f0' } : {}}
              >
                <button 
                  onClick={() => handleSelect(cat)} 
                  className={`omega-cat-btn w-full text-left py-[10px] px-[6px] text-[14px] font-bold rounded-[6px] transition-all cursor-pointer block ${
                    isActive 
                      ? 'active text-[#0c3e66] bg-[rgba(26,98,155,0.08)] pl-[10px]' 
                      : 'text-[#1a629b] hover:text-[#0c3e66] hover:bg-[rgba(26,98,155,0.05)] hover:pl-[10px]'
                  }`}
                  style={{
                    color: isActive ? '#0c3e66' : '#1a629b',
                    background: isActive ? 'rgba(26, 98, 155, 0.08)' : 'transparent',
                    border: 'none'
                  }}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
};

export default ReportsSidebar;
