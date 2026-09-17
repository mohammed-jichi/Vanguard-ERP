'use client';

import React, { useState } from 'react';
import {
  Menu,
  Search,
  ChevronDown,
  Filter,
  RotateCcw,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  BarChart3,
  Settings,
  X
} from 'lucide-react';

export interface ReportCategoryGroup {
  name: string;
  items: string[];
}

export interface ReportCategory {
  category: string;
  type?: 'flat' | 'nested';
  items?: string[];
  groups?: ReportCategoryGroup[];
}

export interface UnifiedModuleReportsHubProps {
  moduleTitle: string;
  reportMenuData: ReportCategory[];
  selectedReport: string;
  onSelectReport: (reportName: string) => void;
  onFilterReport?: () => void;
  onResetFilters?: () => void;
  onReturnToHub?: () => void;
  filterControls?: React.ReactNode;
  children: React.ReactNode;
  activeCurrency?: 'LBP' | 'USD';
  onCurrencyChange?: (curr: 'LBP' | 'USD') => void;
  period?: string;
  setPeriod?: (val: string) => void;
  branch?: string;
  setBranch?: (val: string) => void;
  branchOptions?: string[];
}

export default function UnifiedModuleReportsHub({
  moduleTitle,
  reportMenuData,
  selectedReport,
  onSelectReport,
  onFilterReport,
  onResetFilters,
  onReturnToHub,
  filterControls,
  children,
  activeCurrency = 'USD',
  onCurrencyChange,
  period = 'This Month',
  setPeriod,
  branch = 'Main Branch',
  setBranch,
  branchOptions = ['Main Branch', 'Choueifat Main Facility', 'Beirut Gourmet Depot', 'Sidon Hub']
}: UnifiedModuleReportsHubProps) {
  const [isReportListOpen, setIsReportListOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    reportMenuData.forEach((c) => {
      initial[c.category] = true;
    });
    return initial;
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExport = () => {
    alert(`Exporting ${selectedReport} to CSV / Excel...`);
  };

  return (
    <div className="w-full space-y-4 font-sans dir-ltr">
      {/* Global CSS for Print Optimization and Standardized Form Controls */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 12mm 10mm 12mm 10mm;
          }
          .print-landscape {
            page-orientation: landscape;
          }
          .print-portrait {
            page-orientation: portrait;
          }
          * {
            min-width: 0 !important;
            overflow: visible !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
          .report-wrapper, table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
          }
          table th, table td {
            font-size: 8.5px !important;
            padding: 3px 4px !important;
            line-height: 1.2 !important;
          }
          header, nav, aside, .sidebar, footer, .print\\:hidden, [class*="print\\:hidden"] {
            display: none !important;
          }
          html, body, #__next, #root {
            background-color: #ffffff !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }

        .filters-container select,
        .filters-container input[type="text"],
        .filters-container input[type="date"],
        .filters-container input {
          background-color: #ffffff !important;
          border: 1px solid #94a3b8 !important;
          color: #000000 !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          padding: 6px 8px !important;
          border-radius: 4px !important;
          opacity: 1 !important;
        }

        .filters-container select:focus,
        .filters-container input:focus {
          border-color: #195a96 !important;
          outline: none !important;
          box-shadow: 0 0 0 1px #195a96 !important;
        }
      `}</style>

      {/* 1. TOP HEADER BAR WITH TOGGLE, ACTIVE REPORT PILL & ACTION BUTTONS */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4 w-full print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsReportListOpen(!isReportListOpen)}
            title={isReportListOpen ? 'Hide Report Categories' : 'Show Report Categories'}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0 flex items-center gap-2 text-xs font-bold"
          >
            <Menu className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">
              {isReportListOpen ? 'Hide Report Categories' : 'Show Report Categories'}
            </span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-xs hidden md:inline">
              Active Report:
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide">
              {selectedReport}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReturnToHub && (
            <button
              type="button"
              onClick={onReturnToHub}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Return to Hub</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => alert(`Opening Reports Builder for ${moduleTitle}...`)}
            className="px-3.5 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 bg-[#334155] hover:bg-[#1e293b] text-white transition-all cursor-pointer shadow-xs shrink-0"
          >
            <BarChart3 size={14} />
            <span className="hidden sm:inline">Reports Builder</span>
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN MASTER-DETAIL GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* LEFT COLUMN: CORRIDOR (CATEGORIES & ACCORDION SEARCH) */}
        {isReportListOpen && (
          <div className="col-span-12 md:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 print:hidden self-start">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 bg-white relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-slate-400 focus:bg-white text-slate-800 placeholder-slate-400 font-medium transition-colors"
              />
            </div>

            {/* Accordion Categories List */}
            <div className="overflow-y-auto max-h-[640px] bg-white divide-y divide-slate-100">
              {reportMenuData.map((section) => {
                const isCatExpanded = !!expandedCategories[section.category] || !!searchQuery;
                const filterMatch = (str: string) =>
                  str.toLowerCase().includes(searchQuery.toLowerCase());

                if (section.type === 'flat' || (!section.groups && section.items)) {
                  const filteredItems = searchQuery
                    ? (section.items || []).filter(filterMatch)
                    : section.items || [];

                  if (searchQuery && filteredItems.length === 0) return null;

                  return (
                    <div key={section.category} className="py-0.5">
                      <div
                        onClick={() => toggleCategory(section.category)}
                        className="text-slate-800 font-bold text-xs px-4 py-2.5 bg-white flex justify-between items-center cursor-pointer select-none border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <span>{section.category}</span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isCatExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {isCatExpanded && (
                        <div className="p-1 space-y-0.5">
                          {filteredItems.map((item, idx) => {
                            const isSelected = selectedReport === item;
                            return (
                              <div
                                key={`${section.category}__${item}__${idx}`}
                                onClick={() => onSelectReport(item)}
                                className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                {item}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Nested Groups
                const filteredGroups = (section.groups || [])
                  .map((grp) => ({
                    ...grp,
                    items: searchQuery ? grp.items.filter(filterMatch) : grp.items
                  }))
                  .filter((grp) => grp.items.length > 0);

                if (searchQuery && filteredGroups.length === 0) return null;

                return (
                  <div key={section.category} className="py-0.5">
                    <div
                      onClick={() => toggleCategory(section.category)}
                      className="text-slate-800 font-bold text-xs px-4 py-2.5 bg-white flex justify-between items-center cursor-pointer select-none border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <span>{section.category}</span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isCatExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {isCatExpanded && (
                      <div className="p-1 space-y-1">
                        {filteredGroups.map((group, gIdx) => (
                          <div key={`${section.category}__${group.name}__${gIdx}`} className="py-0.5">
                            <div className="px-3 py-1 text-[11px] font-bold text-slate-700">
                              {group.name}
                            </div>
                            <div className="space-y-0.5">
                              {group.items.map((item, iIdx) => {
                                const isSelected = selectedReport === item;
                                return (
                                  <div
                                    key={`${section.category}__${group.name}__${item}__${iIdx}`}
                                    onClick={() => onSelectReport(item)}
                                    className={`block w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                  >
                                    {item}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: FILTER BAR, ACTION TOOLBAR & REPORT SHEET */}
        <div
          className={`col-span-12 ${
            isReportListOpen ? 'md:col-span-9' : 'md:col-span-12'
          } transition-all duration-300 space-y-4`}
        >
          {/* 3. VANGUARD STANDARD FILTER CONTAINER */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-3 gap-3 print:hidden w-full filters-container">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Period Dropdown */}
              {setPeriod && (
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-40 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                  <option value="First Quarter">First Quarter</option>
                  <option value="Second Quarter">Second Quarter</option>
                  <option value="Third Quarter">Third Quarter</option>
                  <option value="Fourth Quarter">Fourth Quarter</option>
                  <option value="This Year">This Year</option>
                  <option value="Date Range">Date Range</option>
                </select>
              )}

              {/* Branch Dropdown */}
              {setBranch && (
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-48 !text-black !font-bold !bg-white focus:outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                >
                  {branchOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}

              {/* Module-Specific Custom Filter Fields */}
              {filterControls}

              {/* Currency Selector */}
              {onCurrencyChange && (
                <select
                  value={activeCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as 'LBP' | 'USD')}
                  className="border border-slate-400 rounded p-1.5 text-[13px] w-20 !text-black !font-bold !bg-white shadow-xs cursor-pointer"
                  title="Display Currency"
                >
                  <option value="USD">USD ($)</option>
                  <option value="LBP">LBP</option>
                </select>
              )}

              {/* Standard Navy Blue "Filter Report" Button */}
              <button
                type="button"
                onClick={onFilterReport}
                className="bg-[#334155] hover:bg-[#1e293b] text-white px-4 py-2 rounded-md text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Filter size={14} />
                <span>Filter Report</span>
              </button>

              {/* Standard Bordeaux/Burgundy "Reset Filters" Button */}
              <button
                type="button"
                onClick={onResetFilters}
                className="bg-[#5c2427] hover:bg-[#4a1d20] text-white px-4 py-2 rounded-md text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* 4. UPPER ACTION BAR: TITLE & ZOOM / PRINT / EXPORT BUTTONS */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4 print:hidden">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {selectedReport}
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                className="bg-[#1b5e20] hover:bg-[#144717] text-white p-2 rounded-md shadow-2xs transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                className="bg-[#1b5e20] hover:bg-[#144717] text-white p-2 rounded-md shadow-2xs transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#2d3748] hover:bg-[#1a202c] text-white font-medium text-xs py-2 px-4 rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="bg-[#2d3748] hover:bg-[#1a202c] text-white font-medium text-xs py-2 px-4 rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* 5. CENTERED REPORT VIEWPORT / PAPER CANVAS */}
          <div
            className="w-full bg-[#f4f6f9] border border-slate-200 rounded-xl p-4 sm:p-8 flex justify-center shadow-xs overflow-x-auto print:bg-white print:border-none print:p-0 print:shadow-none"
            style={{ minHeight: '650px' }}
          >
            <div
              className="w-full transition-transform duration-150 origin-top flex justify-center"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10 print:border-none print:shadow-none print:p-0 print:max-w-none">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
