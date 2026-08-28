'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  FileText,
  ChevronDown,
  Download,
  Printer,
  Menu,
  CheckCircle2,
  Filter,
  ZoomIn,
  ZoomOut,
  Settings
} from 'lucide-react';

type ReportMenuItemFlat = {
  category: string;
  type: 'flat';
  items: string[];
};

type ReportMenuItemNested = {
  category: string;
  type: 'nested';
  groups: {
    name: string;
    items: string[];
  }[];
};

type ReportMenuItem = ReportMenuItemFlat | ReportMenuItemNested;

const reportMenuData: ReportMenuItem[] = [
  {
    category: "Recently Viewed",
    type: "flat",
    items: ["Customer List Standard", "Summary of voids", "Main Reading History", "Summary of refunds", "Today's Statistics"]
  },
  {
    category: "Internal Control",
    type: "flat",
    items: ["Summary of voids", "Summary of refunds", "Duplicate Invoices", "Meter Report", "No Sale", "Transactions on Hold", "User Log Report", "Discount Summary"]
  },
  {
    category: "Financial",
    type: "nested",
    groups: [
      { name: "Statistics", items: ["Sales Summary", "Statistics by Workstation", "Statistics by Department", "Summary of Sales by Employee", "Sales by Employee by Category", "Sales by Supplier", "Delivery Orders by Date and Branch"] },
      { name: "Tax Reports", items: ["Tax Summary", "Tax Summary Comparative"] },
      { name: "Discount Reports", items: ["Summary of Discount by Divisions", "Discount By Category by Department", "Summary of Discount", "Discount By Description by Employee", "Summary of Discount By Items Amount", "Discount Summary"] },
      { name: "Payments", items: ["Summary of Payment", "Summary of Payment by Department", "Summary of payment by workstation", "Summary of Payment by Employee", "Advanced Payment History", "Paid In/Out", "Customer Payments", "List of Layaway Sales", "Layaway History", "List of Pending Invoices with Advance Payment"] },
      { name: "Internal Control", items: ["Meter Report", "No Sale", "Transactions on Hold", "User Log Report"] },
      { name: "Profit Summary", items: ["Profit by Invoices Summary", "Profit by item summary", "Profit by category summary", "Profit by category by department", "Profit By Invoices"] },
      { name: "Comparative", items: ["Sales summary by day", "Daily Sales", "Comparative Yearly Sales", "Comparative Monthly Sales", "Comparative Monthly Sales by Employee"] },
      { name: "Transaction Summary", items: ["Transactions by Date", "Credit Sales", "Credit Card Report", "Electronic Journal"] },
      { name: "Time sales analysis", items: ["Timer Report Group by transaction count", "Time report by date", "Time report - Average Check", "Time report By EOD date", "Transaction Report by Time"] }
    ]
  },
  {
    category: "Product Sales",
    type: "nested",
    groups: [
      { name: "Product Sales", items: ["Summary of Sales By Items", "Sales by Items", "Sales details for one sales item", "Sales By Customer By Items", "Daily Sales By Items", "Sales By Categories", "Sales By Divisions", "Sales Items by Transaction", "Not Sold Items", "Sold Serial Numbers"] },
      { name: "Comparative By Branch", items: ["Sales By Category", "Sales By Division", "Sales By Groups", "Sales By Items"] },
      { name: "Top Performers", items: ["Top N sold by Quantity", "Top N sold by Amount"] },
      { name: "Voids & Refunds", items: ["Summary of voids", "Summary of refunds", "Details of refunds"] }
    ]
  },
  {
    category: "Customer Sales",
    type: "nested",
    groups: [
      { name: "Top Performers", items: ["Top N Customers by Amount"] },
      { name: "Customers & Delivery", items: ["Sales by customer In Detail", "Sales by zone", "Delivery Sales Summary", "Drivers History"] }
    ]
  },
  {
    category: "Today's & History",
    type: "nested",
    groups: [
      { name: "Today's Sales", items: ["Today's Statistics", "Today's Summary of payment", "Today's summary by Employee", "Today's Transactions"] },
      { name: "History", items: ["Preview Older Sales", "Main Reading History"] }
    ]
  },
  {
    category: "Time & Attendance",
    type: "flat",
    items: ["Employee attendance", "Time And Attendance", "Labor Cost"]
  },
  {
    category: "Lists",
    type: "flat",
    items: ["Customer List Standard", "Not Active Customers", "New Customers", "Black List Customers"]
  }
];

interface ReportsMasterDetailProps {
  onBack?: () => void;
}

export default function ReportsMasterDetail({ onBack }: ReportsMasterDetailProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReportListOpen, setIsReportListOpen] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>('This Month');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('All Invoices');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Recently Viewed": true,
    "Internal Control": true,
    "Financial": true,
    "Product Sales": true,
    "Customer Sales": true,
    "Today's & History": true,
    "Time & Attendance": true,
    "Lists": true
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Statistics": true,
    "Product Sales": true,
    "Payments": true,
    "Today's Sales": true
  });

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleSelectReportItem = (item: string) => {
    setSelectedReport(item);
    setIsReportListOpen(false);
  };

  const handleResetFilters = () => {
    setPeriod('This Month');
    setFromDate('');
    setToDate('');
    setSelectedBranch('All Branches');
    setInvoiceFilter('All Invoices');
  };

  const showInvoiceFilter = selectedReport
    ? !['void', 'refund', 'attendance', 'list', 'log', 'meter', 'no sale'].some(keyword => selectedReport.toLowerCase().includes(keyword))
    : false;

  return (
    <div className="w-full space-y-6 font-sans dir-ltr">
      {/* 1. CLEAN TOP PAGE HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs flex items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Sales Reports</span>
            <span className="bg-blue-50 text-[#195a96] border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Executive Master-Detail
            </span>
          </h2>
        </div>

        {/* RIGHT-ALIGNED PROFESSIONAL RETURN BUTTON */}
        <button
          onClick={() => {
            if (onBack) onBack();
            else if (typeof window !== 'undefined') window.history.back();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-bold transition-all ml-auto cursor-pointer border border-slate-300 shadow-xs shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>Return to Hub</span>
        </button>
      </div>

      {/* 2. TWO-COLUMN MASTER-DETAIL GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mt-6">
        
        {/* LEFT PANEL (REPORT CATEGORIES & ACCORDION MENU) */}
        {isReportListOpen && (
          <div className="col-span-12 md:col-span-3 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col transition-all duration-300">
            
            {/* SEARCH HEADER */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/60 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 placeholder-slate-400 font-medium"
              />
            </div>

            {/* ACCORDION MENU LIST */}
            <div className="overflow-y-auto max-h-[620px] bg-white divide-y divide-slate-100">
              {reportMenuData.map((section) => {
                const matchesSearch = (itemStr: string) =>
                  itemStr.toLowerCase().includes(searchQuery.toLowerCase());

                const isCatExpanded = !!expandedCategories[section.category] || !!searchQuery;

                if (section.type === 'flat') {
                  const filteredItems = searchQuery
                    ? section.items.filter(matchesSearch)
                    : section.items;

                  if (searchQuery && filteredItems.length === 0) return null;

                  return (
                    <div key={section.category} className="py-1">
                      <div
                        onClick={() => toggleCategory(section.category)}
                        className="text-[#195a96] !text-[#195a96] font-bold text-sm px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center cursor-pointer select-none sticky top-0 z-10"
                      >
                        <span>{section.category}</span>
                        <ChevronDown
                          size={16}
                          className={`text-[#195a96] transition-transform duration-200 ${
                            isCatExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {isCatExpanded && (
                        <div className="category-content">
                          {filteredItems.map((item) => {
                            const isSelected = selectedReport === item;
                            return (
                              <div
                                key={item}
                                onClick={() => handleSelectReportItem(item)}
                                className={`block w-full text-left px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-50 text-[#195a96] !text-[#195a96] font-bold border-l-4 border-[#195a96]'
                                    : 'text-slate-600 hover:!text-[#195a96] hover:bg-slate-50'
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

                // NESTED GROUPS
                const filteredGroups = section.groups
                  .map(group => ({
                    ...group,
                    items: searchQuery
                      ? group.items.filter(matchesSearch)
                      : group.items
                  }))
                  .filter(group => !searchQuery || group.items.length > 0 || group.name.toLowerCase().includes(searchQuery.toLowerCase()));

                if (searchQuery && filteredGroups.length === 0) return null;

                return (
                  <div key={section.category} className="py-1">
                    <div
                      onClick={() => toggleCategory(section.category)}
                      className="text-[#195a96] !text-[#195a96] font-bold text-sm px-4 py-3 border-b border-slate-100 bg-white flex justify-between items-center cursor-pointer select-none sticky top-0 z-10"
                    >
                      <span>{section.category}</span>
                      <ChevronDown
                        size={16}
                        className={`text-[#195a96] transition-transform duration-200 ${
                          isCatExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {isCatExpanded && (
                      <div className="category-content">
                        {filteredGroups.map((group) => {
                          const isExpanded = !!expandedGroups[group.name] || !!searchQuery;
                          return (
                            <div key={group.name}>
                              <div
                                onClick={() => toggleGroup(group.name)}
                                className="flex justify-between items-center px-4 py-2 text-[13px] font-bold text-slate-700 hover:!text-[#195a96] hover:bg-slate-50 cursor-pointer select-none border-b border-slate-50 transition-colors"
                              >
                                <span>{group.name}</span>
                                <ChevronDown
                                  size={14}
                                  className={`text-slate-400 transition-transform ${
                                    isExpanded ? 'rotate-180 text-[#195a96]' : ''
                                  }`}
                                />
                              </div>

                              {isExpanded && (
                                <div className="bg-slate-50/40">
                                  {group.items.map((item) => {
                                    const isSelected = selectedReport === item;
                                    return (
                                      <div
                                        key={item}
                                        onClick={() => handleSelectReportItem(item)}
                                        className={`block w-full text-left pl-8 pr-4 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                                          isSelected
                                            ? 'bg-slate-50 text-[#195a96] !text-[#195a96] font-bold border-l-4 border-[#195a96]'
                                            : 'text-slate-500 hover:!text-[#195a96] hover:bg-slate-50'
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
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RIGHT PANEL (REPORT VIEWER - DYNAMIC SPAN: col-span-9 or col-span-12) */}
        <div className={`col-span-12 ${isReportListOpen ? 'md:col-span-9' : 'md:col-span-12'} transition-all duration-300`}>
          
          {!selectedReport ? (
            /* DEFAULT "NO REPORT SELECTED" WATERMARK SCREEN */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs min-h-[600px] p-6 relative flex flex-col justify-between overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsReportListOpen(!isReportListOpen)}
                    title={isReportListOpen ? "Hide Report Categories" : "Show Report Categories"}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">No Report Selected</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Choose a report category from the left panel to load live system analytics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-auto py-8 flex flex-col items-center justify-center text-center relative w-full">
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="relative flex justify-center py-4">
                    <svg className="w-80 h-44 text-slate-100 stroke-current opacity-90 mx-auto" viewBox="0 0 400 200" fill="none" strokeWidth="2.5">
                      <path d="M10 150 Q 60 120, 110 160 T 210 80 T 310 120 T 390 40" stroke="currentColor" />
                      <path d="M10 180 Q 80 140, 150 170 T 250 110 T 350 150 T 390 90" stroke="currentColor" strokeDasharray="6 6" opacity="0.6" />
                      <circle cx="210" cy="80" r="4" fill="#cbd5e1" />
                      <circle cx="390" cy="40" r="4" fill="#cbd5e1" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-700 text-base">No Report Selected</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    Select a report item from the Left Panel list to view detailed transaction logs, financial breakdowns, and inventory performance statistics.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Vanguard ERP Executive Reporting Engine</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          ) : (
            /* ACTIVE REPORT DETAILED VIEW: TWO-CARD LAYOUT */
            <div className="w-full space-y-6">
              
              {/* CARD 1: THE FILTERS CARD (TOP) */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm w-full">
                {/* HEADER AREA */}
                <div className="flex justify-between items-start p-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsReportListOpen(!isReportListOpen)}
                      title={isReportListOpen ? "Hide Report Categories" : "Show Report Categories"}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Filters</h4>
                      <span className="text-xs text-slate-500 block mt-0.5">{selectedReport}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button className="w-32 bg-[#475569] hover:bg-[#334155] text-white py-2 rounded text-sm font-medium block text-center transition-colors cursor-pointer">
                      Filter Report
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="w-32 bg-[#5c3a3a] hover:bg-[#4a2e2e] text-white py-2 rounded text-sm block text-center font-medium transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* INPUTS AREA */}
                <div className="p-4 flex flex-wrap gap-4 items-center">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="border border-slate-300 rounded p-1.5 text-sm w-48 !bg-white !text-slate-900 !outline-none focus:ring-2 focus:ring-[#195a96] font-medium cursor-pointer shadow-2xs"
                  >
                    <option value="Today" className="!text-slate-900 bg-white">Today</option>
                    <option value="This Month" className="!text-slate-900 bg-white">This Month</option>
                    <option value="This Quarter" className="!text-slate-900 bg-white">This Quarter</option>
                    <option value="This Year" className="!text-slate-900 bg-white">This Year</option>
                    <option value="Date Range" className="!text-slate-900 bg-white">Date Range</option>
                  </select>

                  {period === 'Date Range' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">From</span>
                      <input 
                        type="date" 
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        className="border border-slate-300 rounded p-1.5 text-sm w-36 !bg-white !text-slate-900 font-bold outline-none focus:ring-2 focus:ring-[#195a96]" 
                      />
                      <span className="text-sm font-bold text-slate-700">To</span>
                      <input 
                        type="date" 
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)} 
                        className="border border-slate-300 rounded p-1.5 text-sm w-36 !bg-white !text-slate-900 font-bold outline-none focus:ring-2 focus:ring-[#195a96]" 
                      />
                    </div>
                  ) : (
                    <div className="border border-slate-300 rounded p-1.5 text-sm min-w-[200px] bg-slate-100 text-slate-900 font-bold flex items-center cursor-not-allowed select-none">
                      Aug 1 - Aug 31, 2026
                    </div>
                  )}

                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="border border-slate-300 rounded p-1.5 text-sm w-48 !bg-white !text-slate-900 !outline-none focus:ring-2 focus:ring-[#195a96] font-medium cursor-pointer shadow-2xs"
                  >
                    <option className="!text-slate-900 bg-white">All Branches</option>
                    <option className="!text-slate-900 bg-white">Beirut Central Branch</option>
                    <option className="!text-slate-900 bg-white">Choueifat Press Branch</option>
                    <option className="!text-slate-900 bg-white">Jbaa Hub</option>
                  </select>

                  {showInvoiceFilter && !['Profit by category summary', 'Profit by category by department', 'Profit by item summary', 'Profit by Invoices Summary', 'Profit By Invoices'].includes(selectedReport || '') && (
                    <select
                      value={invoiceFilter}
                      onChange={(e) => setInvoiceFilter(e.target.value)}
                      className="border border-slate-300 rounded p-1.5 text-sm w-48 !bg-white !text-slate-900 !outline-none focus:ring-2 focus:ring-[#195a96] font-medium cursor-pointer shadow-2xs"
                    >
                      <option className="!text-slate-900 bg-white">All Invoices</option>
                      <option className="!text-slate-900 bg-white">Paid Invoices Only</option>
                      <option className="!text-slate-900 bg-white">Credit & Pending Invoices</option>
                    </select>
                  )}

                  {selectedReport === 'Duplicate Invoices' && (
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                      Show Rate
                    </label>
                  )}

                  {selectedReport === 'Statistics by Workstation' && (
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                      Real Date
                    </label>
                  )}

                  {selectedReport === 'Sales by Employee by Category' && (
                    <>
                      <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                        Real Date
                      </label>
                      <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                        Show Graph
                      </label>
                    </>
                  )}

                  {selectedReport === 'Tax Summary' && (
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                      Real Date
                    </label>
                  )}

                  {selectedReport === 'Discount By Description by Employee' && (
                    <>
                      <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 font-bold bg-white">
                        <option>All Types</option>
                      </select>
                      <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 font-bold bg-white">
                        <option>All Discounts</option>
                      </select>
                    </>
                  )}

                  {(selectedReport === 'Summary of Payment.' || selectedReport === 'Summary of Payment' || selectedReport === 'Summary of Payment by Department' || selectedReport === 'Summary of payment by workstation') && (
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                      Real Date
                    </label>
                  )}

                  {selectedReport === 'Summary of Payment by Employee' && (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-4">
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[200px] font-bold bg-white">
                          <option>All Invoices</option>
                        </select>
                        <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                          Real Date
                        </label>
                      </div>
                      <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer mt-1">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                        Summary
                      </label>
                    </div>
                  )}

                  {selectedReport === 'Paid In/Out' && (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex gap-4">
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[200px] font-bold bg-white">
                          <option>All Servers</option>
                        </select>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[200px] font-bold bg-white">
                          <option>All Servers</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer mt-1">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                        All Dates
                      </label>
                    </div>
                  )}

                  {selectedReport === 'Customer Payments' && (
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" defaultChecked />
                      Grouped By Server
                    </label>
                  )}

                  {selectedReport === 'Profit by Invoices Summary' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Invoice #:</span>
                      <input type="text" className="border border-slate-300 rounded p-1.5 text-sm w-36 !bg-white !text-slate-900 font-bold outline-none focus:ring-2 focus:ring-[#195a96]" defaultValue="103070" />
                    </div>
                  )}

                  {selectedReport === 'Profit by item summary' && (
                    <>
                      <select className="border border-slate-300 rounded p-1.5 text-sm w-48 !bg-white !text-slate-900 !outline-none focus:ring-2 focus:ring-[#195a96] font-medium cursor-pointer shadow-2xs">
                        <option>All Groups</option>
                        <option>حبوب فلت</option>
                        <option>زيت زيتون خضير مفرق</option>
                      </select>
                      <select className="border border-slate-300 rounded p-1.5 text-sm w-48 !bg-white !text-slate-900 !outline-none focus:ring-2 focus:ring-[#195a96] font-medium cursor-pointer shadow-2xs">
                        <option>All Categories</option>
                        <option>Raw Materials</option>
                        <option>جملة</option>
                      </select>
                      <div className="w-full flex flex-wrap gap-6 items-center mt-1">
                        <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" defaultChecked />
                          Use Unit Cost
                        </label>
                        <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" defaultChecked />
                          Group by supplier by location
                        </label>
                      </div>
                    </>
                  )}

                  {selectedReport === 'Profit by category summary' && (
                    <>
                      <select className="border border-slate-300 rounded p-1.5 text-sm w-48 !bg-white !text-slate-900 !outline-none focus:ring-2 focus:ring-[#195a96] font-medium cursor-pointer shadow-2xs">
                        <option>All Categories</option>
                        <option>Raw Materials</option>
                        <option>جملة</option>
                        <option>عروض</option>
                        <option>مفرق</option>
                      </select>
                      <div className="w-full flex items-center gap-4 mt-1">
                        <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                          <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                          Use Unit Cost
                        </label>
                      </div>
                    </>
                  )}

                  {selectedReport === 'Profit by category by department' && (
                    <div className="w-full flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                        Use Unit Cost
                      </label>
                    </div>
                  )}

                  {selectedReport === 'Sales summary by day' && (
                    <div className="w-full flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                        Summary
                      </label>
                    </div>
                  )}

                  {selectedReport === 'Daily Sales' && (
                    <div className="flex gap-4 items-center mt-2">
                    </div>
                  )}

                  {selectedReport === 'Comparative Yearly Sales' && (
                    <div className="flex gap-16 mt-2 w-full">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700">Branch</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[250px] bg-slate-50">
                          <option>All Branches</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700">Year</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[250px] bg-slate-50">
                          <option>All Years</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedReport === 'Comparative Monthly Sales' && (
                    <div className="flex gap-16 mt-2 w-full">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700">Branch</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[250px] bg-slate-50">
                          <option>All Branches</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700">Year</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[250px] bg-slate-50">
                          <option>2026</option>
                          <option>2025</option>
                          <option>All Years</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedReport === 'Comparative Monthly Sales by Employee' && (
                    <div className="flex gap-4 mt-2 w-full">
                      <div className="flex flex-col gap-2 w-1/3">
                        <label className="text-[12px] font-bold text-slate-700">Branch</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50 w-full">
                          <option>All Branches</option>
                          <option>Southern Olive Oil S.A.R.L</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2 w-1/3">
                        <label className="text-[12px] font-bold text-slate-700">Year</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50 w-full">
                          <option>2026</option>
                          <option>2025</option>
                          <option>All Years</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2 w-1/3">
                        <label className="text-[12px] font-bold text-slate-700">Employee</label>
                        <select className="border border-slate-300 rounded p-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50 w-full">
                          <option>All Employees</option>
                          <option>Cashier N2</option>
                          <option>Cashier NK</option>
                          <option>Cashier R</option>
                          <option>Hiba Aloulou</option>
                          <option>Mahdi</option>
                          <option>Nour Yazbeck</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: THE REPORT DATA CARD (BOTTOM) */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[400px] flex flex-col w-full">
                {/* HEADER AREA */}
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                  <h3 className="font-bold text-slate-900 text-sm">{selectedReport}</h3>

                  <div className="flex items-center gap-2">
                    <button className="bg-[#2e7d32] hover:bg-[#236327] text-white p-1.5 rounded transition-colors cursor-pointer" title="Zoom In">
                      <ZoomIn size={16} />
                    </button>
                    <button className="bg-[#2e7d32] hover:bg-[#236327] text-white p-1.5 rounded transition-colors cursor-pointer" title="Zoom Out">
                      <ZoomOut size={16} />
                    </button>
                    <button className="bg-[#475569] hover:bg-[#334155] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5">
                      <Printer size={15} /> Print Report
                    </button>
                    <button className="bg-[#475569] hover:bg-[#334155] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5">
                      <Download size={15} /> Export Report
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 text-xs ml-2 cursor-pointer" title="Settings">
                      ⚙️
                    </button>
                  </div>
                </div>

                {/* BODY AREA */}
                <div className="flex-1 bg-white p-8 font-sans text-black overflow-auto min-h-[500px]">
                  {selectedReport === 'Comparative Monthly Sales by Employee' ? (
                    /* COMPARATIVE MONTHLY SALES BY EMPLOYEE REPORT TEMPLATE */
                    <div className="w-full max-w-[1400px] mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Comparative Monthly Net Sales By Employee
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>28-08-2026</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Strict Native Table Implementation */}
                      <div className="w-full mt-1 overflow-x-auto pb-4">
                        <table className="w-full border-collapse border-t border-l border-r border-black text-[11px] break-all">
                          <thead>
                            <tr className="font-bold text-black text-center bg-white">
                              <th colSpan={3} className="border-none bg-transparent"></th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">January</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">February</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">March</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">April</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">May</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">June</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">July</th>
                              <th className="border border-black py-1.5 px-1 w-[7%]">August</th>
                              <th className="border border-black py-1.5 px-1 w-[8%] bg-[#cce5ff]">Total By Year</th>
                              <th className="border border-black py-1.5 px-1 w-[8%] bg-[#cce5ff]">Monthly Average</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="font-normal bg-white text-center">
                              <td rowSpan={7} className="border border-black font-bold p-1 w-[8%] align-middle">Southern Olive Oil S.A.R.L</td>
                              <td rowSpan={7} className="border border-black font-bold p-1 w-[4%] align-middle">2026</td>
                              <td className="border border-black p-1 w-[7%]">Cashier N2</td>
                              <td className="border border-black p-1">74,960,900.00</td>
                              <td className="border border-black p-1">177,901,600.00</td>
                              <td className="border border-black p-1">226,406,100.00</td>
                              <td className="border border-black p-1">322,850,450.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">802,119,050.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">66,843,254.17</td>
                            </tr>
                            <tr className="font-normal bg-white text-center">
                              <td className="border border-black p-1">Cashier NK</td>
                              <td className="border border-black p-1">498,835,400.00</td>
                              <td className="border border-black p-1">439,413,800.00</td>
                              <td className="border border-black p-1">458,850.00</td>
                              <td className="border border-black p-1">142,402,450.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">1,081,110,500.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">90,092,541.67</td>
                            </tr>
                            <tr className="font-normal bg-white text-center">
                              <td className="border border-black p-1">Cashier R</td>
                              <td className="border border-black p-1">386,491,050.00</td>
                              <td className="border border-black p-1">587,849,542.00</td>
                              <td className="border border-black p-1">59,943,850.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">1,034,284,442.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">86,190,370.17</td>
                            </tr>
                            <tr className="font-normal bg-white text-center">
                              <td className="border border-black p-1">Hiba Aloulou</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">381,671,600.00</td>
                              <td className="border border-black p-1">1,493,219,324.78</td>
                              <td className="border border-black p-1">1,243,561,600.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">3,118,452,524.78</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">259,871,043.73</td>
                            </tr>
                            <tr className="font-normal bg-white text-center">
                              <td className="border border-black p-1">Mahdi</td>
                              <td className="border border-black p-1">2,144,645,080.00</td>
                              <td className="border border-black p-1">895,931,000.00</td>
                              <td className="border border-black p-1">45,935,000.00</td>
                              <td className="border border-black p-1">182,596,650.00</td>
                              <td className="border border-black p-1">187,758,050.00</td>
                              <td className="border border-black p-1">257,090,350.00</td>
                              <td className="border border-black p-1">291,091,990.00</td>
                              <td className="border border-black p-1">267,490,000.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">4,272,538,120.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">356,044,843.33</td>
                            </tr>
                            <tr className="font-normal bg-white text-center">
                              <td className="border border-black p-1">Nour Yazbeck</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">4,832,000.00</td>
                              <td className="border border-black p-1">24,083,800.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1">0.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">28,915,800.00</td>
                              <td className="border border-black p-1 bg-[#cce5ff]">2,409,650.00</td>
                            </tr>
                            <tr className="font-bold bg-[#cce5ff] text-center">
                              <td className="border border-black p-1">Total By Employee</td>
                              <td className="border border-black p-1">3,104,932,430.00</td>
                              <td className="border border-black p-1">2,101,095,942.00</td>
                              <td className="border border-black p-1">332,743,800.00</td>
                              <td className="border border-black p-1">647,849,550.00</td>
                              <td className="border border-black p-1">192,590,050.00</td>
                              <td className="border border-black p-1">662,845,750.00</td>
                              <td className="border border-black p-1">1,784,311,314.78</td>
                              <td className="border border-black p-1">1,511,051,600.00</td>
                              <td className="border border-black p-1">10,337,420,436.78</td>
                              <td className="border border-black p-1">861,451,703.06</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* VANGUARD PRINT FOOTER WITH CLICKABLE LINK */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-20 w-full"></div>
                      <div className="flex justify-between items-center text-[10px] font-bold w-full">
                        <div className="text-black">REP_S_00134</div>
                        <div className="text-black text-center flex-1">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-right">
                          <a href="https://www.vanguarderp.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer">www.vanguarderp.com</a>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Comparative Monthly Sales' ? (
                    /* COMPARATIVE MONTHLY SALES REPORT TEMPLATE (CLEANED DEDUPLICATED) */
                    <div className="w-full max-w-7xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Title & Pagination Info (Toolbar removed to prevent double rendering) */}
                      <div className="text-center font-bold text-[13px] mb-4">
                        Comparative Monthly Sales
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full min-w-[1000px]">
                        <div>28-Aug-26</div>
                        <div className="pl-16">Year: 2026</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Strict Native Table Implementation */}
                      <div className="w-full mt-1 overflow-x-auto pb-4">
                        <table className="w-full min-w-[1000px] border-collapse border-t border-l border-r border-black text-[11px]">
                          <thead>
                            <tr className="font-bold text-black text-center bg-white">
                              <th className="border-b border-r border-black py-2.5 w-[5%]"></th>
                              <th className="border-b border-r border-black py-2.5 w-[11%]"></th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">JANUARY</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">FEBRUARY</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">MARCH</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">APRIL</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">MAY</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">JUNE</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">JULY</th>
                              <th className="border-b border-r border-black py-2.5 w-[9%]">AUGUST</th>
                              <th className="border-b border-black py-2.5 w-[12%]">TOTAL BY YEAR</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="font-normal bg-white">
                              <td rowSpan={2} className="border-b border-r border-black font-bold text-center w-[5%] align-middle">2026</td>
                              <td className="border-b border-r border-black p-2 text-center w-[11%] font-medium">Southern Olive Oil S.A.R.L</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">3,108,541,520.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">2,101,815,950.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">332,743,800.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">648,713,550.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">192,590,050.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">665,865,750.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">1,818,326,325.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">1,564,432,050.00</td>
                              <td className="border-b border-black text-right pr-2 py-2 w-[12%] font-normal">10,433,028,995.00</td>
                            </tr>
                            <tr className="font-bold bg-white">
                              <td className="border-b border-r border-black p-2 text-center w-[11%]">Total</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">3,108,541,520.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">2,101,815,950.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">332,743,800.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">648,713,550.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">192,590,050.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">665,865,750.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">1,818,326,325.00</td>
                              <td className="border-b border-r border-black text-right pr-2 py-2 w-[9%]">1,564,432,050.00</td>
                              <td className="border-b border-black text-right pr-2 py-2 w-[12%]">10,433,028,995.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-20 w-full min-w-[1000px]"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold min-w-[1000px]">
                        <div className="text-black text-left">REP_S_00134</div>
                        <div className="text-black text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-black text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Comparative Yearly Sales' ? (
                    /* COMPARATIVE YEARLY SALES REPORT TEMPLATE (EXACT OMEGA REPLICA) */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Comparative Yearly Sales
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>28-Aug-26</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header */}
                      <div className="border-t border-b border-black py-0.5 mb-1">
                        <div className="grid grid-cols-[1fr_150px_150px] text-[11px] font-bold text-black w-full">
                          <div>Branch Name</div>
                          <div className="text-right pr-16">Year</div>
                          <div className="text-right pr-2">Total Amount</div>
                        </div>
                      </div>

                      {/* Data Section */}
                      <div className="text-[11px] leading-tight w-full">
                        {/* Branch Name */}
                        <div className="font-bold my-1">Southern Olive Oil S.A.R.L</div>
                        
                        <div className="grid grid-cols-[1fr_150px_150px] font-normal w-full mb-1">
                          <div></div>
                          <div className="text-right pr-16">2025</div>
                          <div className="text-right pr-2">153,913,400.00</div>
                        </div>

                        <div className="grid grid-cols-[1fr_150px_150px] font-normal w-full mb-2">
                          <div></div>
                          <div className="text-right pr-16">2026</div>
                          <div className="text-right pr-2">10,433,028,995.00</div>
                        </div>

                        {/* Branch Total */}
                        <div className="grid grid-cols-[1fr_150px_150px] font-bold w-full mb-1 border-t border-slate-200 pt-1">
                          <div></div>
                          <div className="text-right pr-4">Total by Branch :</div>
                          <div className="text-right pr-2">10,586,942,395.00</div>
                        </div>

                        {/* Grand Total */}
                        <div className="border-t border-b border-black py-0.5 grid grid-cols-[1fr_150px_150px] font-bold w-full mt-4 mb-24">
                          <div></div>
                          <div className="text-right pr-4">Grand Total:</div>
                          <div className="text-right pr-2">10,586,942,395.00</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00334</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Daily Sales' ? (
                    /* DAILY SALES REPORT TEMPLATE (WITH BLUE TOTAL COLUMN AND GRIDLINES) */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Daily Sales
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-2 w-full">
                        <div>28-Aug-26</div>
                        <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 28-Aug-2026</div>
                        <div>Page 1 of 2</div>
                      </div>

                      {/* Main Table Grid with Borders & Light Blue Total Column */}
                      <div className="w-full border border-black text-[11px]">
                        {/* Table Header */}
                        <div className="flex w-full font-bold text-black border-b border-black bg-slate-100">
                          <div className="w-[20%] p-1.5 border-r border-black">Date / Branch</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-center">Beirut Central Branch</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-center">Choueifat Press Branch</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-center">Jbaa Hub</div>
                          <div className="w-[20%] p-1.5 text-center bg-[#dbeafe]">Total</div>
                        </div>

                        {/* Data Rows with Double-Stacked Values */}
                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Saturday 01 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>157,490,000.00</div>
                            <div className="text-slate-600 text-[10px]">2,280,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>157,490,000.00</div>
                            <div className="text-slate-700 text-[10px]">2,280,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Sunday 02 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>11,520,000.00</div>
                            <div className="text-slate-600 text-[10px]">1,450,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>11,520,000.00</div>
                            <div className="text-slate-700 text-[10px]">1,450,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Monday 03 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>102,455,000.00</div>
                            <div className="text-slate-600 text-[10px]">3,120,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>102,455,000.00</div>
                            <div className="text-slate-700 text-[10px]">3,120,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Tuesday 04 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>44,089,500.00</div>
                            <div className="text-slate-600 text-[10px]">1,890,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>44,089,500.00</div>
                            <div className="text-slate-700 text-[10px]">1,890,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Wednesday 05 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>119,597,000.00</div>
                            <div className="text-slate-600 text-[10px]">4,250,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>119,597,000.00</div>
                            <div className="text-slate-700 text-[10px]">4,250,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Thursday 06 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>29,942,600.00</div>
                            <div className="text-slate-600 text-[10px]">2,780,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>29,942,600.00</div>
                            <div className="text-slate-700 text-[10px]">2,780,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Friday 07 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>23,835,000.00</div>
                            <div className="text-slate-600 text-[10px]">5,600,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>23,835,000.00</div>
                            <div className="text-slate-700 text-[10px]">5,600,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Saturday 08 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>73,787,500.00</div>
                            <div className="text-slate-600 text-[10px]">3,410,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>73,787,500.00</div>
                            <div className="text-slate-700 text-[10px]">3,410,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Monday 10 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>84,784,000.00</div>
                            <div className="text-slate-600 text-[10px]">9,000,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>84,784,000.00</div>
                            <div className="text-slate-700 text-[10px]">9,000,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Tuesday 11 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>31,143,000.00</div>
                            <div className="text-slate-600 text-[10px]">4,120,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>31,143,000.00</div>
                            <div className="text-slate-700 text-[10px]">4,120,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Wednesday 12 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>27,168,000.00</div>
                            <div className="text-slate-600 text-[10px]">2,670,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>27,168,000.00</div>
                            <div className="text-slate-700 text-[10px]">2,670,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Thursday 13 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>44,536,200.00</div>
                            <div className="text-slate-600 text-[10px]">6,890,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>44,536,200.00</div>
                            <div className="text-slate-700 text-[10px]">6,890,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Friday 14 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>41,485,000.00</div>
                            <div className="text-slate-600 text-[10px]">3,540,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>41,485,000.00</div>
                            <div className="text-slate-700 text-[10px]">3,540,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Saturday 15 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>19,116,000.00</div>
                            <div className="text-slate-600 text-[10px]">8,120,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>19,116,000.00</div>
                            <div className="text-slate-700 text-[10px]">8,120,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Sunday 16 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>36,294,000.00</div>
                            <div className="text-slate-600 text-[10px]">2,340,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>36,294,000.00</div>
                            <div className="text-slate-700 text-[10px]">2,340,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Monday 17 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>50,099,550.00</div>
                            <div className="text-slate-600 text-[10px]">5,180,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>50,099,550.00</div>
                            <div className="text-slate-700 text-[10px]">5,180,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Tuesday 18 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>53,415,000.00</div>
                            <div className="text-slate-600 text-[10px]">3,890,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>53,415,000.00</div>
                            <div className="text-slate-700 text-[10px]">3,890,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Wednesday 19 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>92,846,250.00</div>
                            <div className="text-slate-600 text-[10px]">4,760,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>92,846,250.00</div>
                            <div className="text-slate-700 text-[10px]">4,760,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Thursday 20 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>36,345,000.00</div>
                            <div className="text-slate-600 text-[10px]">7,230,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>36,345,000.00</div>
                            <div className="text-slate-700 text-[10px]">7,230,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Friday 21 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>48,766,500.00</div>
                            <div className="text-slate-600 text-[10px]">2,980,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>48,766,500.00</div>
                            <div className="text-slate-700 text-[10px]">2,980,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Saturday 22 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>277,330,000.00</div>
                            <div className="text-slate-600 text-[10px]">6,120,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>277,330,000.00</div>
                            <div className="text-slate-700 text-[10px]">6,120,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Sunday 23 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>21,100,000.00</div>
                            <div className="text-slate-600 text-[10px]">3,450,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>21,100,000.00</div>
                            <div className="text-slate-700 text-[10px]">3,450,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Monday 24 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>20,605,000.00</div>
                            <div className="text-slate-600 text-[10px]">5,890,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>20,605,000.00</div>
                            <div className="text-slate-700 text-[10px]">5,890,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Tuesday 25 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>63,301,500.00</div>
                            <div className="text-slate-600 text-[10px]">4,320,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>63,301,500.00</div>
                            <div className="text-slate-700 text-[10px]">4,320,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Wednesday 26 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>61,970,000.00</div>
                            <div className="text-slate-600 text-[10px]">8,950,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>61,970,000.00</div>
                            <div className="text-slate-700 text-[10px]">8,950,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Thursday 27 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>64,695,000.00</div>
                            <div className="text-slate-600 text-[10px]">6,430,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>64,695,000.00</div>
                            <div className="text-slate-700 text-[10px]">6,430,000.00</div>
                          </div>
                        </div>

                        <div className="flex w-full border-b border-black font-normal">
                          <div className="w-[20%] p-1.5 border-r border-black font-bold">Friday 28 08 2026</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-600 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#dbeafe] font-medium">
                            <div>0.00</div>
                            <div className="text-slate-700 text-[10px]">0.00</div>
                          </div>
                        </div>

                        {/* Grand Totals Row */}
                        <div className="flex w-full font-bold bg-slate-100">
                          <div className="w-[20%] p-1.5 border-r border-black">Total:</div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>1,637,716,600.00</div>
                            <div className="text-slate-700 text-[10px]">120,590,000.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-700 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 border-r border-black text-right">
                            <div>0.00</div>
                            <div className="text-slate-700 text-[10px]">0.00</div>
                          </div>
                          <div className="w-[20%] p-1.5 text-right bg-[#bfdbfe]">
                            <div>1,637,716,600.00</div>
                            <div className="text-slate-900 text-[10px]">120,590,000.00</div>
                          </div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-8 w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00042</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Sales summary by day' ? (
                    /* SALES SUMMARY BY DAY REPORT TEMPLATE (FAILSAFE 9-COLUMN FLEXBOX) */
                    <div className="w-full max-w-7xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Daily sales summary
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>28-Aug-26</div>
                        <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 28-Aug-2026</div>
                        <div>Page 1 of 2</div>
                      </div>

                      {/* Main Table Header (Strict Flexbox, 9 Columns) */}
                      <div className="flex w-full border-t border-b border-black py-0.5 mb-1 text-[11px] font-bold text-black">
                        <div className="w-[16%]">Date</div>
                        <div className="w-[12%] text-right">Sub Total</div>
                        <div className="w-[12%] text-right">Discount</div>
                        <div className="w-[8.8%] text-right">Tax 1</div>
                        <div className="w-[8.8%] text-right">Tax 2</div>
                        <div className="w-[8.8%] text-right">Tax 3</div>
                        <div className="w-[8.8%] text-right">Tax 4</div>
                        <div className="w-[8.8%] text-right">Tax 5</div>
                        <div className="w-[16%] text-right">Total</div>
                      </div>

                      {/* Data Section */}
                      <div className="text-[11px] leading-tight w-full">
                        <div className="font-bold underline mb-0.5">Southern Olive Oil S.A.R.L</div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Saturday 01 08 2026</div>
                          <div className="w-[12%] text-right">171,890,000.</div>
                          <div className="w-[12%] text-right">14,400,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">157,490,000.000</div>
                        </div>
                        
                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Sunday 02 08 2026</div>
                          <div className="w-[12%] text-right">11,520,000.0</div>
                          <div className="w-[12%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">11,520,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Monday 03 08 2026</div>
                          <div className="w-[12%] text-right">103,355,000.</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">102,455,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Tuesday 04 08 2026</div>
                          <div className="w-[12%] text-right">44,989,500.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">44,089,500.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Wednesday 05 08<br/>2026</div>
                          <div className="w-[12%] text-right">124,097,000.</div>
                          <div className="w-[12%] text-right">4,500,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">119,597,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Thursday 06 08 2026</div>
                          <div className="w-[12%] text-right">30,842,600.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">29,942,600.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Friday 07 08 2026</div>
                          <div className="w-[12%] text-right">23,835,000.0</div>
                          <div className="w-[12%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">23,835,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Saturday 08 08 2026</div>
                          <div className="w-[12%] text-right">77,877,500.0</div>
                          <div className="w-[12%] text-right">4,090,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">73,787,500.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Monday 10 08 2026</div>
                          <div className="w-[12%] text-right">90,184,000.0</div>
                          <div className="w-[12%] text-right">5,400,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">84,784,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Tuesday 11 08 2026</div>
                          <div className="w-[12%] text-right">32,043,000.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">31,143,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Wednesday 12 08<br/>2026</div>
                          <div className="w-[12%] text-right">28,068,000.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">27,168,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Thursday 13 08 2026</div>
                          <div className="w-[12%] text-right">44,536,200.0</div>
                          <div className="w-[12%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">44,536,200.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Friday 14 08 2026</div>
                          <div className="w-[12%] text-right">45,235,000.0</div>
                          <div className="w-[12%] text-right">3,750,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">41,485,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Saturday 15 08 2026</div>
                          <div className="w-[12%] text-right">19,116,000.0</div>
                          <div className="w-[12%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">19,116,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Sunday 16 08 2026</div>
                          <div className="w-[12%] text-right">37,194,000.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">36,294,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Monday 17 08 2026</div>
                          <div className="w-[12%] text-right">50,550,000.0</div>
                          <div className="w-[12%] text-right">450,450.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">50,099,550.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Tuesday 18 08 2026</div>
                          <div className="w-[12%] text-right">59,715,000.0</div>
                          <div className="w-[12%] text-right">6,300,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">53,415,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Wednesday 19 08<br/>2026</div>
                          <div className="w-[12%] text-right">98,246,250.0</div>
                          <div className="w-[12%] text-right">5,400,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">92,846,250.000</div>
                        </div>

                        <div className="flex w-full font-normal mb-1">
                          <div className="w-[16%]">Thursday 20 08 2026</div>
                          <div className="w-[12%] text-right">36,345,000.0</div>
                          <div className="w-[12%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">36,345,000.000</div>
                        </div>

                        {/* PAGE 2 HEADER */}
                        <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full mt-8">
                          <div>28-Aug-26</div>
                          <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 28-Aug-2026</div>
                          <div>Page 2 of 2</div>
                        </div>
                        
                        <div className="flex w-full border-t border-b border-black py-0.5 mb-1 mt-1 text-[11px] font-bold text-black">
                          <div className="w-[16%]">Date</div>
                          <div className="w-[12%] text-right">Sub Total</div>
                          <div className="w-[12%] text-right">Discount</div>
                          <div className="w-[8.8%] text-right">Tax 1</div>
                          <div className="w-[8.8%] text-right">Tax 2</div>
                          <div className="w-[8.8%] text-right">Tax 3</div>
                          <div className="w-[8.8%] text-right">Tax 4</div>
                          <div className="w-[8.8%] text-right">Tax 5</div>
                          <div className="w-[16%] text-right">Total</div>
                        </div>

                        {/* Page 2 Data */}
                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Friday 21 08 2026</div>
                          <div className="w-[12%] text-right">49,756,500.0</div>
                          <div className="w-[12%] text-right">990,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">48,766,500.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Saturday 22 08 2026</div>
                          <div className="w-[12%] text-right">278,230,000.</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">277,330,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Sunday 23 08 2026</div>
                          <div className="w-[12%] text-right">21,100,000.0</div>
                          <div className="w-[12%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">21,100,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Monday 24 08 2026</div>
                          <div className="w-[12%] text-right">21,505,000.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">20,605,000.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Tuesday 25 08 2026</div>
                          <div className="w-[12%] text-right">64,201,500.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">63,301,500.000</div>
                        </div>

                        <div className="flex w-full font-normal">
                          <div className="w-[16%]">Wednesday 26 08<br/>2026</div>
                          <div className="w-[12%] text-right">62,870,000.0</div>
                          <div className="w-[12%] text-right">900,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">61,970,000.000</div>
                        </div>

                        <div className="flex w-full font-normal mb-1">
                          <div className="w-[16%]">Thursday 27 08 2026</div>
                          <div className="w-[12%] text-right">68,745,000.0</div>
                          <div className="w-[12%] text-right">4,050,000.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">64,695,000.000</div>
                        </div>

                        {/* Grand Totals */}
                        <div className="flex w-full font-bold">
                          <div className="w-[16%]">Total Branch:</div>
                          <div className="w-[12%] text-right">1,696,047,05</div>
                          <div className="w-[12%] text-right">58,330,450.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">1,637,716,600.000</div>
                        </div>
                        
                        <div className="flex w-full font-bold mb-12">
                          <div className="w-[16%]">Total:</div>
                          <div className="w-[12%] text-right">1,696,047,05</div>
                          <div className="w-[12%] text-right">58,330,450.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[8.8%] text-right">0.000</div>
                          <div className="w-[16%] text-right">1,637,716,600.000</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00193</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Profit By Invoices' ? (
                    /* PROFIT BY INVOICES REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Profit By Invoices
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>27-Aug-26</div>
                        <div className="flex justify-center flex-1">From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To Date: 27-Aug-2026</div>
                        <div>Page 1 of 131</div>
                      </div>

                      {/* Main Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold text-black w-full">
                          <div>Product Description</div>
                          <div className="text-right">Qty</div>
                          <div className="text-right">Total Cost</div>
                          <div className="text-right">% Cost</div>
                          <div className="text-right">Total Price</div>
                          <div className="text-right">% Profit</div>
                          <div className="text-right">R. Profit</div>
                        </div>
                      </div>

                      {/* Data Section */}
                      <div className="text-[11px] font-bold leading-tight w-full mb-2">
                        <div>Branch Name: Southern Olive Oil S.A.R.L</div>
                      </div>

                      {/* Invoice 102971 */}
                      <div className="text-[11px] font-bold leading-tight w-full mb-1">
                        Customer Name: null null
                      </div>
                      
                      {/* Corrected Date/Invoice Alignment */}
                      <div className="grid grid-cols-[3fr_1fr_4.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="text-right pr-4">Date:</div>
                        <div className="text-right">01/08/2026</div>
                        <div className="text-left pl-4">Invoicenumber:102971</div>
                      </div>

                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-medium mb-1 w-full">
                        <div>زيت زيتون فرجن 1 ليتر</div>
                        <div className="text-right">2.00</div>
                        <div className="text-right">640,653.75</div>
                        <div className="text-right">50.85</div>
                        <div className="text-right">1,260,000.00</div>
                        <div className="text-right">49.15</div>
                        <div className="text-right">619,346.25</div>
                      </div>

                      {/* Corrected Subtotals 102971 */}
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="text-right pr-2 underline">Total Including Discount:</div>
                        <div className="text-right">2.00</div>
                        <div className="text-right">640,653.75</div>
                        <div className="text-right">50.85</div>
                        <div className="text-right">1,260,000.00</div>
                        <div className="text-right">49.15</div>
                        <div className="text-right">619,346.25</div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Amount:</div>
                        <div className="text-right">1,260,000.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Tax:</div>
                        <div className="text-right">0.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Discount:</div>
                        <div className="text-right">0.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Net Sale:</div>
                        <div className="text-right">1,260,000.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-6">
                        <div className="col-span-4 text-right pr-2">Total Excluding Discount:</div>
                        <div className="text-right">1,260,000.00</div>
                        <div></div>
                        <div className="text-right">619,346.25</div>
                      </div>

                      {/* Invoice 102972 */}
                      <div className="text-[11px] font-bold leading-tight w-full mb-1">
                        Customer Name: null null
                      </div>
                      
                      {/* Corrected Date/Invoice Alignment */}
                      <div className="grid grid-cols-[3fr_1fr_4.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="text-right pr-4">Date:</div>
                        <div className="text-right">01/08/2026</div>
                        <div className="text-left pl-4">Invoicenumber:102972</div>
                      </div>

                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-medium mb-1 w-full">
                        <div>زيت زيتون خضير بلدي 1 ليتر</div>
                        <div className="text-right">2.00</div>
                        <div className="text-right">979,000.00</div>
                        <div className="text-right">60.43</div>
                        <div className="text-right">1,620,000.00</div>
                        <div className="text-right">39.57</div>
                        <div className="text-right">641,000.00</div>
                      </div>

                      {/* Corrected Subtotals 102972 */}
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="text-right pr-2 underline">Total Including Discount:</div>
                        <div className="text-right">2.00</div>
                        <div className="text-right">979,000.00</div>
                        <div className="text-right">60.43</div>
                        <div className="text-right">1,620,000.00</div>
                        <div className="text-right">39.57</div>
                        <div className="text-right">641,000.00</div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Amount:</div>
                        <div className="text-right">1,620,000.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Tax:</div>
                        <div className="text-right">0.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Discount:</div>
                        <div className="text-right">0.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-1">
                        <div className="col-span-4 text-right pr-2">Net Sale:</div>
                        <div className="text-right">1,620,000.00</div>
                        <div className="col-span-2"></div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr] gap-2 text-[11px] font-bold w-full mb-8">
                        <div className="col-span-4 text-right pr-2">Total Excluding Discount:</div>
                        <div className="text-right">1,620,000.00</div>
                        <div></div>
                        <div className="text-right">641,000.00</div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Profit by category by department' ? (
                    /* PROFIT BY CATEGORY BY DEPARTMENT REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Profit by Category by Department
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>27-Aug-2026</div>
                        <div>Years:2026 Month:8</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header (Thin lines) */}
                      <div className="border-t border-b border-black py-0.5 mb-1">
                        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] text-[11px] font-bold text-black w-full">
                          <div>Division</div>
                          <div className="text-right">Quantity</div>
                          <div className="text-right">Total Price</div>
                          <div className="text-right">Total Cost</div>
                          <div className="text-right">Total Cost %</div>
                          <div className="text-right">Total Profit</div>
                          <div className="text-right">Total Profit %</div>
                        </div>
                      </div>

                      {/* Data Section (Strictly normal font weight for labels and rows, tightly packed) */}
                      <div className="text-[11px] font-normal leading-tight w-full">
                        <div>Branch: Southern Olive Oil S.A.R.L</div>
                        <div>Department: MAIN DEPARTMENT</div>
                        <div>Category Name: Raw Materials</div>

                        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>Plastic</div>
                          <div className="text-right">70.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">17,865,000.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">-17,865,000.00</div>
                          <div className="text-right">0.00</div>
                        </div>
                        
                        {/* Subtotal (Bold, with top border) */}
                        <div className="border-t border-black grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] font-bold w-full mt-0.5 mb-0.5">
                          <div>Total By Category:</div>
                          <div className="text-right">70.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">17,865,000.</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">-17,865,000.0</div>
                          <div className="text-right">0.00</div>
                        </div>

                        <div>Category Name: جملة</div>
                        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>مكعزلة جملة</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                        </div>

                        <div className="border-t border-black grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] font-bold w-full mt-0.5 mb-0.5">
                          <div>Total By Category:</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                        </div>

                        <div>Category Name: عروض</div>
                        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>عروض</div>
                          <div className="text-right">50.00</div>
                          <div className="text-right">486,000,000</div>
                          <div className="text-right">398,372,400.0</div>
                          <div className="text-right">81.97</div>
                          <div className="text-right">87,627,600.00</div>
                          <div className="text-right">18.03</div>
                        </div>

                        <div className="border-t border-black grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] font-bold w-full mt-0.5 mb-0.5">
                          <div>Total By Category:</div>
                          <div className="text-right">50.00</div>
                          <div className="text-right">486,000,000</div>
                          <div className="text-right">398,372,400</div>
                          <div className="text-right">81.97</div>
                          <div className="text-right">87,627,600.00</div>
                          <div className="text-right">18.03</div>
                        </div>

                        <div>Category Name: مفرق</div>
                        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>براد</div>
                          <div className="text-right">1.27</div>
                          <div className="text-right">546,600.00</div>
                          <div className="text-right">397,944.00</div>
                          <div className="text-right">72.80</div>
                          <div className="text-right">148,656.00</div>
                          <div className="text-right">27.20</div>
                          
                          <div>بهارات مفرق</div>
                          <div className="text-right">4.95</div>
                          <div className="text-right">3,570,000.0</div>
                          <div className="text-right">1,693,395.00</div>
                          <div className="text-right">47.43</div>
                          <div className="text-right">1,876,605.00</div>
                          <div className="text-right">52.57</div>

                          <div>زيوت مفرق</div>
                          <div className="text-right">246.47</div>
                          <div className="text-right">781,995,700</div>
                          <div className="text-right">458,677,490.6</div>
                          <div className="text-right">58.65</div>
                          <div className="text-right">323,318,209.32</div>
                          <div className="text-right">41.35</div>

                          <div>عسل مفرق</div>
                          <div className="text-right">6.00</div>
                          <div className="text-right">9,360,000.0</div>
                          <div className="text-right">4,354,560.00</div>
                          <div className="text-right">46.52</div>
                          <div className="text-right">5,005,440.00</div>
                          <div className="text-right">53.48</div>

                          <div>كيلو مفرق</div>
                          <div className="text-right">37.90</div>
                          <div className="text-right">14,721,000.</div>
                          <div className="text-right">9,655,200.00</div>
                          <div className="text-right">65.59</div>
                          <div className="text-right">5,065,800.00</div>
                          <div className="text-right">34.41</div>

                          <div>مجففات</div>
                          <div className="text-right">1.00</div>
                          <div className="text-right">725,000.00</div>
                          <div className="text-right">405,000.00</div>
                          <div className="text-right">55.86</div>
                          <div className="text-right">320,000.00</div>
                          <div className="text-right">44.14</div>

                          <div>محمصة مفرق</div>
                          <div className="text-right">0.25</div>
                          <div className="text-right">393,750.00</div>
                          <div className="text-right">281,250.00</div>
                          <div className="text-right">71.43</div>
                          <div className="text-right">112,500.00</div>
                          <div className="text-right">28.57</div>

                          <div>مربيات مفرق</div>
                          <div className="text-right">4.00</div>
                          <div className="text-right">990,000.00</div>
                          <div className="text-right">605,404.80</div>
                          <div className="text-right">61.15</div>
                          <div className="text-right">384,595.20</div>
                          <div className="text-right">38.85</div>

                          <div>مرطبان</div>
                          <div className="text-right">34.00</div>
                          <div className="text-right">11,285,000.</div>
                          <div className="text-right">6,755,290.56</div>
                          <div className="text-right">59.86</div>
                          <div className="text-right">4,529,709.44</div>
                          <div className="text-right">40.14</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-12 w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Profit by category summary' ? (
                    /* PROFIT BY CATEGORY SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Theoretical Profit By Category
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>27-Aug-2026</div>
                        <div>Years:2026 Month:8</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header (Thin lines, tightly packed) */}
                      <div className="border-t border-b border-black py-0.5 mb-1">
                        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] text-[11px] font-bold text-black w-full">
                          <div>Category</div>
                          <div className="text-right">Quantity</div>
                          <div className="text-right">Total Price</div>
                          <div className="text-right">Total Cost</div>
                          <div className="text-right">Total Cost %</div>
                          <div className="text-right">Total Profit</div>
                          <div className="text-right">Total Profit %</div>
                        </div>
                      </div>

                      {/* Data Section (Strictly normal font weight, tightly packed) */}
                      <div className="text-[11px] font-normal leading-tight w-full">
                        <div>Branch: Southern Olive Oil S.A.R.L</div>

                        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>Raw Materials</div>
                          <div className="text-right">70.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">17,865,000.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">-17,865,000.00</div>
                          <div className="text-right">0.00</div>
                        </div>
                        
                        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>جملة</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                        </div>
                        
                        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>عروض</div>
                          <div className="text-right">50.00</div>
                          <div className="text-right">486,000,000.0</div>
                          <div className="text-right">398,372,400.00</div>
                          <div className="text-right">81.97</div>
                          <div className="text-right">87,627,600.00</div>
                          <div className="text-right">18.03</div>
                        </div>
                        
                        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div>مفرق</div>
                          <div className="text-right">384.94</div>
                          <div className="text-right">830,032,050.0</div>
                          <div className="text-right">487,480,494.57</div>
                          <div className="text-right">58.73</div>
                          <div className="text-right">342,551,555.43</div>
                          <div className="text-right">41.27</div>
                        </div>
                        
                        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full mb-1">
                          <div>عروض</div>
                          <div className="text-right">24.00</div>
                          <div className="text-right">248,400,000.0</div>
                          <div className="text-right">219,318,140.16</div>
                          <div className="text-right">88.29</div>
                          <div className="text-right">29,081,859.84</div>
                          <div className="text-right">11.71</div>
                        </div>

                        {/* Total By Branch (Bold, Thin Borders) */}
                        <div className="border-t border-b border-black py-0.5 grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] font-bold w-full mb-8">
                          <div>Total By Branch:</div>
                          <div className="text-right">528.94</div>
                          <div className="text-right">1,564,432,050</div>
                          <div className="text-right">1,123,036,034.7</div>
                          <div className="text-right">71.79</div>
                          <div className="text-right">441,396,015.27</div>
                          <div className="text-right">28.21</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Profit by item summary' ? (
                    /* PROFIT BY ITEM SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Theoretical Profit By Item
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>27-Aug-26</div>
                        <div>From Date: 01-Aug-2026</div>
                        <div>To Date: 28-Aug-2026</div>
                        <div>Page 1 of 8</div>
                      </div>

                      {/* Main Table Header (Thin lines) */}
                      <div className="border-t border-b border-black py-0.5 mb-1">
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] text-[11px] font-bold text-black w-full">
                          <div>Product Desc</div>
                          <div className="text-right">Qty</div>
                          <div className="text-right">Total Price</div>
                          <div className="text-right">Total Cost</div>
                          <div className="text-right">Total Cost %</div>
                          <div className="text-right">Total Profit</div>
                          <div className="text-right">Total Profit %</div>
                        </div>
                      </div>

                      {/* Data Section (Strictly packed, normal font for numbers) */}
                      <div className="text-[11px] leading-tight w-full">
                        <div className="font-bold underline">Southern Olive Oil S.A.R.L</div>
                        <div className="font-bold">MAIN DEPARTMENT</div>
                        <div className="font-bold">Raw Materials</div>
                        <div className="font-bold">Plastic</div>

                        <div className="font-bold text-center w-full mt-1">SOOL</div>
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full items-center">
                          <div className="font-bold">P Blue Gallon 10 Liters</div>
                          <div className="text-right font-normal">23.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">5,175,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">-5,175,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                        </div>

                        <div className="font-bold text-center w-full mt-1">SOOL</div>
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full items-center">
                          <div className="font-bold">P Blue Gallon 20 Litres</div>
                          <div className="text-right font-normal">47.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">12,690,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">-12,690,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                        </div>

                        <div className="border-t border-dashed border-black grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full mt-1 pt-0.5">
                          <div className="font-bold">Total By Division:</div>
                          <div className="text-right font-normal">70.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">17,865,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">-17,865,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                        </div>
                        
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full">
                          <div className="font-bold">Total By Category:</div>
                          <div className="text-right font-normal">70.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">17,865,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">-17,865,000.00</div>
                          <div className="text-right font-normal">0.00</div>
                        </div>

                        <div className="font-bold mt-1">جملة</div>
                        <div className="font-bold">مكعزلة جملة</div>

                        <div className="font-bold text-center w-full mt-1">SOOL</div>
                        <div className="grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full items-center">
                          <div className="font-bold">صندوق لبنة معزة مكعزلة سادة</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                        </div>

                        <div className="border-t border-dashed border-black grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_1.5fr_1fr] w-full mt-1 pt-0.5 mb-16">
                          <div className="font-bold">Total By Division:</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                          <div className="text-right font-normal">0.00</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Profit by Invoices Summary' ? (
                    /* PROFIT BY INVOICES SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-6">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-6">
                        Profit By Invoice
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1 w-full">
                        <div>27-Aug-26</div>
                        <div>Invoice # :103070</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header (Thin lines) */}
                      <div className="border-t border-b border-black py-0.5 mb-1">
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold text-black w-full">
                          <div>Product Description</div>
                          <div className="text-right">Qty</div>
                          <div className="text-right">Total Cost</div>
                          <div className="text-right">% Cost</div>
                          <div className="text-right">Total Price</div>
                          <div className="text-right">% Profit</div>
                          <div className="text-right">R. Profit</div>
                          <div className="text-right">R. % Profit</div>
                        </div>
                      </div>

                      {/* Data Section (Strictly normal font, tightly packed) */}
                      <div className="text-[11px] leading-tight w-full mb-1">
                        <div>Branch Name: Southern Olive Oil S.A.R.L</div>
                        <div>Customer Name:</div>
                        <div className="flex gap-4">
                          <div>Date:</div>
                          <div>10/08/2026 11.07.58</div>
                        </div>
                      </div>

                      {/* Data Rows */}
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-normal w-full">
                        <div>P Blue Gallon 20 Litres</div>
                        <div className="text-right">1.00</div>
                        <div className="text-right">270000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">-3.00</div>
                        <div className="text-right">-270000.00</div>
                        <div className="text-right">-100.00</div>
                      </div>
                      <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-normal w-full">
                        <div>تنكة زيت زيتون فرجن بلدي 17.5 ليتر</div>
                        <div className="text-right">1.00</div>
                        <div className="text-right">5125230.00</div>
                        <div className="text-right">56.95</div>
                        <div className="text-right">9000000.00</div>
                        <div className="text-right">43.05</div>
                        <div className="text-right">3874770.00</div>
                        <div className="text-right">75.60</div>
                      </div>

                      {/* Summary Block */}
                      <div className="border-t border-black pt-0.5 mt-1 mb-1">
                        
                        {/* Total including Discount */}
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold w-full">
                          <div className="col-span-2">Total including Discount :</div>
                          <div className="text-right">5395230.00</div>
                          <div className="text-right">59.95</div>
                          <div className="text-right">9000000.00</div>
                          <div className="text-right">40.05</div>
                          <div className="text-right">3604770.00</div>
                          <div className="text-right">66.81</div>
                        </div>
                        
                        {/* Subtotals aligned exactly to Omega's weird offset offset */}
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold w-full">
                          <div className="col-span-5 text-right pr-2">Amount :</div>
                          <div className="text-right">9000000.0</div>
                          <div className="col-span-2"></div>
                        </div>
                        
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold w-full">
                          <div className="col-span-5 text-right pr-2">Tax :</div>
                          <div className="text-right">0.0</div>
                          <div className="col-span-2"></div>
                        </div>
                        
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold w-full">
                          <div className="col-span-5 text-right pr-2">Discount :</div>
                          <div className="text-right">900000.0</div>
                          <div className="col-span-2"></div>
                        </div>
                        
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold w-full">
                          <div className="col-span-5 text-right pr-2">Net Sales :</div>
                          <div className="text-right">8100000.0</div>
                          <div className="col-span-2"></div>
                        </div>
                        
                        {/* Total Excluding Discount */}
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_1fr_1.5fr_1fr_1.5fr_1.5fr] text-[11px] font-bold w-full mb-16">
                          <div className="col-span-5 text-right pr-2">Total Excluding Discount :</div>
                          <div className="text-right">8100000.0</div>
                          <div className="text-right">2704770.0</div>
                          <div className="text-right">50.13261714514</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00357</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Transactions on Hold' ? (
                    /* TRANSACTIONS ON HOLD REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        History of Transactions on Hold
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div>From Date :01-Jan-2026 &nbsp;&nbsp;&nbsp;&nbsp; To Date: 31-Mar-2026</div>
                        <div>Page 1 of1</div>
                      </div>

                      {/* Workstation Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
                        <div className="flex text-[11px] font-bold w-full">
                          <div className="w-[30%] text-right pr-4">Workstation :</div>
                          <div className="w-[70%]">1 Showroom 1</div>
                        </div>
                      </div>

                      {/* Data Section */}
                      <div className="text-[11px] leading-tight w-full">
                        {/* Group Date */}
                        <div className="font-bold mb-1 mt-2">09 January 2026</div>
                        
                        {/* Employee Info */}
                        <div className="flex flex-col font-bold mb-4">
                          <div className="grid grid-cols-[100px_1fr]">
                            <div>Employee ID :</div>
                            <div>1</div>
                          </div>
                          <div className="grid grid-cols-[100px_1fr]">
                            <div>Employee Name:</div>
                            <div>Mahdi</div>
                          </div>
                        </div>

                        {/* Table Headers (Replicating the exact Omega typo: Unit Price twice) */}
                        <div className="grid grid-cols-[20%_10%_30%_20%_20%] font-bold mb-2 w-full">
                          <div>Date</div>
                          <div>Qty</div>
                          <div>Description</div>
                          <div className="text-center">Unit Price</div>
                          <div className="text-right">Unit Price</div>
                        </div>

                        {/* Table Row */}
                        <div className="grid grid-cols-[20%_10%_30%_20%_20%] font-bold mb-1 w-full">
                          <div>09/01/2026 12.16.10</div>
                          <div>-1.0</div>
                          <div>قرفة سيجار مرطبان</div>
                          <div className="text-center">200000.0</div>
                          <div className="text-right">-200000.0</div>
                        </div>

                        {/* Group Footer */}
                        <div className="border-t border-black mt-2 pt-1 flex justify-end font-bold mb-8">
                          <div className="mr-8">Amount :</div>
                          <div>-200000.0</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'No Sale' ? (
                    /* NO SALE REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        No Sale Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div>From Date: 01-Jan-2026 &nbsp;&nbsp;&nbsp;&nbsp; To Date: 31-Mar-2026</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header - Fixed Overflow */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 text-[11px] font-bold text-black w-full">
                          <div>Employee Name</div>
                          <div>Date</div>
                          <div className="text-right">Workstation</div>
                        </div>
                      </div>

                      {/* Data Section */}
                      <div className="text-[11px] font-medium leading-tight w-full">
                        <div className="mb-2">Branch Name: Southern Olive Oil S.A.R.L</div>
                        
                        {/* 01-Jan-26 */}
                        <div className="mb-1 pl-12">EOD Date:01-Jan-26</div>
                        
                        <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 mb-1">
                          <div>Ricky</div>
                          <div>01/01/2026 6.23 PM</div>
                          <div className="text-right">1</div>
                        </div>
                        <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 mb-4">
                          <div>Cashier R</div>
                          <div>01/01/2026 4.00 PM</div>
                          <div className="text-right">1</div>
                        </div>

                        {/* 24-Feb-26 */}
                        <div className="mb-1 pl-12">EOD Date:24-Feb-26</div>
                        
                        <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 mb-8">
                          <div>Cashier N2</div>
                          <div>24/02/2026 1.15 PM</div>
                          <div className="text-right">1</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Meter Report' ? (
                    /* METER REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Meter Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div>From Date: 01-Aug-2026 &nbsp;&nbsp;&nbsp;&nbsp; To Date: 27-Aug-2026</div>
                        <div>Page 1 of 4</div>
                      </div>

                      {/* Main Table Header - Expanded to full width */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 text-[11px] font-bold text-black w-full">
                          <div>Branch Name</div>
                          <div>Date</div>
                          <div>By Employee</div>
                          <div>To Employee</div>
                        </div>
                      </div>

                      {/* Data Section */}
                      <div className="text-[11px] font-medium leading-tight w-full">
                        <div className="mb-2 font-bold">Branch: Southern Olive Oil S.A.R.L</div>
                        
                        {/* 01-Aug-2026 */}
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div className="font-bold">EOD Date</div>
                          <div className="font-bold">01-Aug-2026</div>
                          <div></div>
                          <div></div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>01-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-4">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>01-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>

                        {/* 02-Aug-2026 */}
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div className="font-bold">EOD Date</div>
                          <div className="font-bold">02-Aug-2026</div>
                          <div></div>
                          <div></div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>02-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>02-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>02-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-4">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>02-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>

                        {/* 03-Aug-2026 */}
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div className="font-bold">EOD Date</div>
                          <div className="font-bold">03-Aug-2026</div>
                          <div></div>
                          <div></div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>03-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>03-08-2026 00.00.00</div>
                          <div>Mahdi</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-4">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>03-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>

                        {/* 04-Aug-2026 */}
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div className="font-bold">EOD Date</div>
                          <div className="font-bold">04-Aug-2026</div>
                          <div></div>
                          <div></div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-4">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>04-08-2026 00.00.00</div>
                          <div>Mahdi</div>
                          <div>Server Hiba Aloulou</div>
                        </div>

                        {/* 05-Aug-2026 */}
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div className="font-bold">EOD Date</div>
                          <div className="font-bold">05-Aug-2026</div>
                          <div></div>
                          <div></div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>05-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>05-08-2026 00.00.00</div>
                          <div>Mahdi</div>
                          <div>Main Reading</div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-4">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>05-08-2026 00.00.00</div>
                          <div>Mahdi</div>
                          <div>Server Hiba Aloulou</div>
                        </div>

                        {/* 06-Aug-2026 */}
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-1">
                          <div className="font-bold">EOD Date</div>
                          <div className="font-bold">06-Aug-2026</div>
                          <div></div>
                          <div></div>
                        </div>
                        <div className="grid grid-cols-[30%_25%_25%_20%] gap-4 mb-8">
                          <div>Southern Olive Oil S.A.R.L</div>
                          <div>06-08-2026 00.00.00</div>
                          <div>Hiba Aloulou</div>
                          <div>Server Hiba Aloulou</div>
                        </div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'List of Pending Invoices with Advance Payment' ? (
                    /* LIST OF PENDING INVOICES WITH ADVANCE PAYMENT REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[13px] underline mb-4">
                        List of Pending Invoices with Advance Payment
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-4">
                        <div>27/08/2026</div>
                        <div>From Date: {fromDate || '01-Aug-2026'} To Date: {toDate || '27-Aug-2026'}</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black flex text-[11px] font-bold py-1 mb-2 bg-gray-50">
                        <div className="w-[15%] px-2">Date</div>
                        <div className="w-[15%]">Invoice #</div>
                        <div className="w-[25%]">Customer</div>
                        <div className="w-[15%] text-right">Invoice Amount</div>
                        <div className="w-[15%] text-right">Advance Paid</div>
                        <div className="w-[15%] text-right pr-2">Pending Balance</div>
                      </div>

                      {/* Record 1 */}
                      <div className="flex text-[11px] font-medium mt-2 mb-2">
                        <div className="w-[15%] px-2">05/08/2026</div>
                        <div className="w-[15%]">INV-2026-115</div>
                        <div className="w-[25%] font-bold">Yehya Kassem</div>
                        <div className="w-[15%] text-right">80,000,000.00</div>
                        <div className="w-[15%] text-right text-green-700">20,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 font-bold text-red-600">60,000,000.00</div>
                      </div>
                      
                      {/* Record 2 */}
                      <div className="flex text-[11px] font-medium mt-2 mb-4">
                        <div className="w-[15%] px-2">18/08/2026</div>
                        <div className="w-[15%]">INV-2026-128</div>
                        <div className="w-[25%] font-bold">Jichi Hussien</div>
                        <div className="w-[15%] text-right">120,000,000.00</div>
                        <div className="w-[15%] text-right text-green-700">50,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 font-bold text-red-600">70,000,000.00</div>
                      </div>
                      
                      {/* Grand Totals */}
                      <div className="border-t-[2px] border-black pt-1 flex text-[11px] font-bold mb-12 mt-4">
                        <div className="w-[55%] text-right pr-4">Grand Total:</div>
                        <div className="w-[15%] text-right">200,000,000.00</div>
                        <div className="w-[15%] text-right text-green-700">70,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 text-red-600">130,000,000.00</div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : (selectedReport === 'Layaway History' || selectedReport === 'Layaway History.') ? (
                    /* LAYAWAY HISTORY REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[13px] underline mb-4">
                        Layaway History
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-4">
                        <div>27/08/2026</div>
                        <div>From Date: {fromDate || '01-Aug-2026'} To Date: {toDate || '27-Aug-2026'}</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black flex text-[11px] font-bold py-1 mb-2 bg-gray-50">
                        <div className="w-[15%] px-2">Date</div>
                        <div className="w-[15%]">Ticket #</div>
                        <div className="w-[25%]">Customer</div>
                        <div className="w-[15%]">Action</div>
                        <div className="w-[15%] text-right">Amount</div>
                        <div className="w-[15%] text-right pr-2">Ticket Balance</div>
                      </div>

                      {/* Record 1 */}
                      <div className="flex text-[11px] font-medium mt-2">
                        <div className="w-[15%] px-2">15/08/2026</div>
                        <div className="w-[15%]">LAY-0005</div>
                        <div className="w-[25%] font-bold">Yehya Kassem</div>
                        <div className="w-[15%]">Initial Deposit</div>
                        <div className="w-[15%] text-right text-green-700">10,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 font-bold text-red-600">40,000,000.00</div>
                      </div>
                      
                      {/* Record 2 */}
                      <div className="flex text-[11px] font-medium mt-2 mb-2">
                        <div className="w-[15%] px-2">20/08/2026</div>
                        <div className="w-[15%]">LAY-0005</div>
                        <div className="w-[25%] font-bold">Yehya Kassem</div>
                        <div className="w-[15%]">Partial Payment</div>
                        <div className="w-[15%] text-right text-green-700">20,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 font-bold text-red-600">20,000,000.00</div>
                      </div>
                      
                      <div className="border-b border-dotted border-gray-400 mb-2 w-full"></div>

                      {/* Record 3 */}
                      <div className="flex text-[11px] font-medium mt-2 mb-4">
                        <div className="w-[15%] px-2">25/08/2026</div>
                        <div className="w-[15%]">LAY-0006</div>
                        <div className="w-[25%] font-bold">Jichi Hussien</div>
                        <div className="w-[15%]">Initial Deposit</div>
                        <div className="w-[15%] text-right text-green-700">5,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 font-bold text-red-600">15,000,000.00</div>
                      </div>
                      
                      {/* Grand Totals */}
                      <div className="border-t-[2px] border-black pt-1 flex text-[11px] font-bold mb-12 mt-4">
                        <div className="w-[70%] text-right pr-4">Total Collected (Period):</div>
                        <div className="w-[15%] text-right text-green-700">35,000,000.00</div>
                        <div className="w-[15%] text-right pr-2"></div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'List of Layaway Sales' ? (
                    /* LIST OF LAYAWAY SALES REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black mt-2">
                      
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[13px] underline mb-4">
                        List of Layaway Sales
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-4">
                        <div>27/08/2026</div>
                        <div>From Date: {fromDate || '01-Aug-2026'} To Date: {toDate || '27-Aug-2026'}</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black flex text-[11px] font-bold py-1 mb-2 bg-gray-50">
                        <div className="w-[15%] px-2">Date</div>
                        <div className="w-[15%]">Ticket #</div>
                        <div className="w-[25%]">Customer</div>
                        <div className="w-[15%] text-right">Total Amount</div>
                        <div className="w-[15%] text-right">Deposit Paid</div>
                        <div className="w-[15%] text-right pr-2">Balance Due</div>
                      </div>

                      {/* Record 1 */}
                      <div className="flex text-[11px] font-bold mt-2">
                        <div className="w-[15%] px-2">22/08/2026</div>
                        <div className="w-[15%]">LAY-0001</div>
                        <div className="w-[25%]">Colonel Mahmoud</div>
                        <div className="w-[15%] text-right">248,400,000.00</div>
                        <div className="w-[15%] text-right">48,400,000.00</div>
                        <div className="w-[15%] text-right pr-2 text-red-600">200,000,000.00</div>
                      </div>
                      
                      {/* Details for Record 1 */}
                      <div className="border-b border-dotted border-gray-400 pb-2 mb-2">
                        <div className="flex text-[10px] font-medium text-gray-700 mt-1 italic">
                          <div className="w-[15%] px-2"></div>
                          <div className="w-[40%]">-&gt; زيت للمعمل (200 Liters)</div>
                          <div className="w-[15%] text-right"></div>
                          <div className="w-[15%] text-right"></div>
                          <div className="w-[15%] text-right pr-2"></div>
                        </div>
                      </div>

                      {/* Record 2 */}
                      <div className="flex text-[11px] font-bold mt-2">
                        <div className="w-[15%] px-2">25/08/2026</div>
                        <div className="w-[15%]">LAY-0002</div>
                        <div className="w-[25%]">Hussein Deek</div>
                        <div className="w-[15%] text-right">15,000,000.00</div>
                        <div className="w-[15%] text-right">5,000,000.00</div>
                        <div className="w-[15%] text-right pr-2 text-red-600">10,000,000.00</div>
                      </div>
                      
                      {/* Details for Record 2 */}
                      <div className="border-b border-dotted border-gray-400 pb-2 mb-2">
                        <div className="flex text-[10px] font-medium text-gray-700 mt-1 italic">
                          <div className="w-[15%] px-2"></div>
                          <div className="w-[40%]">-&gt; 12 كيلو مكدوس</div>
                          <div className="w-[15%] text-right"></div>
                          <div className="w-[15%] text-right"></div>
                          <div className="w-[15%] text-right pr-2"></div>
                        </div>
                      </div>
                      
                      {/* Grand Totals */}
                      <div className="border-t-[2px] border-black pt-1 flex text-[11px] font-bold mb-12 mt-4">
                        <div className="w-[55%] text-right pr-4">Grand Total:</div>
                        <div className="w-[15%] text-right">263,400,000.00</div>
                        <div className="w-[15%] text-right">53,400,000.00</div>
                        <div className="w-[15%] text-right pr-2">210,000,000.00</div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 mt-auto w-full"></div>
                      <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold">
                        <div className="text-black text-left">REP_S_00247</div>
                        <div className="text-blue-700 text-center">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                        <div className="text-blue-700 text-right">www.vanguarderp.com</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Customer Payments' ? (
                    /* CUSTOMER PAYMENTS (GROUPED BY SERVER) REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Customer Payments
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[100px_90px_90px_100px_90px_120px_60px_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Receipt #</div>
                          <div>Date</div>
                          <div>Type</div>
                          <div>Server</div>
                          <div>Workstation</div>
                          <div className="text-right">Amount</div>
                          <div>Currency</div>
                          <div className="text-right">Equivalent Amount</div>
                        </div>
                      </div>

                      {/* Branch Header */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Southern Olive Oil S.A.R.L
                      </div>

                      {/* Employee Group: Mahdi */}
                      <div className="text-[11px] font-bold mb-1">Mahdi</div>

                      {/* Customer Name Row */}
                      <div className="text-[11px] font-bold mb-1 pl-2 underline">Hiba Aloulou</div>

                      {/* Data Row */}
                      <div className="grid grid-cols-[100px_90px_90px_100px_90px_120px_60px_1fr] gap-2 text-[11px] mb-1 font-medium pl-2">
                        <div>100325</div>
                        <div>25-Aug-26</div>
                        <div>INV</div>
                        <div>Mahdi</div>
                        <div>2000</div>
                        <div className="text-right">-2.484E8</div>
                        <div>L.L.</div>
                        <div className="text-right">-248,400,000.00</div>
                      </div>

                      {/* Dotted border separator */}
                      <div className="border-t border-dashed border-black pt-1 mb-1"></div>

                      {/* Subtotal for Hiba Aloulou */}
                      <div className="flex justify-between text-[11px] font-bold text-[#195a96] mb-1">
                        <div>Total for Hiba Aloulou:</div>
                        <div>-248,400,000.00</div>
                      </div>

                      {/* Date Subtotal */}
                      <div className="flex justify-between text-[11px] font-bold text-slate-900 mb-4">
                        <div>25-Aug-2026:</div>
                        <div>-248,400,000.00</div>
                      </div>

                      {/* Server Subtotal */}
                      <div className="flex justify-between text-[11px] font-bold text-[#195a96] mb-4">
                        <div>Total for Mahdi:</div>
                        <div>-248,400,000.00</div>
                      </div>

                      {/* Branch Subtotal */}
                      <div className="flex justify-between text-[11px] font-bold text-slate-900 mb-4">
                        <div>Total for Southern Olive Oil S.A.R.L:</div>
                        <div>-248,400,000.00</div>
                      </div>

                      {/* Grand Total Footer */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1"></div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <div>Total:</div>
                        <div>-248,400,000.00</div>
                      </div>

                      {/* VANGUARD PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Paid In/Out' ? (
                    /* PAID IN/OUT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Paid In / Out Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[80px_90px_100px_100px_1fr_100px_100px] gap-2 text-[11px] font-bold text-black">
                          <div>Ref #</div>
                          <div>Date</div>
                          <div>Server</div>
                          <div>Workstation</div>
                          <div>Reason</div>
                          <div>Pay Mode</div>
                          <div className="text-right">Amount</div>
                        </div>
                      </div>

                      {/* Branch Header */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Southern Olive Oil S.A.R.L
                      </div>

                      {/* Paid Ins Section */}
                      <div className="text-[11px] font-bold mb-1">PAID IN</div>
                      <div className="grid grid-cols-[80px_90px_100px_100px_1fr_100px_100px] gap-2 text-[11px] mb-1 font-medium pl-2">
                        <div>1001</div>
                        <div>05-Aug-26</div>
                        <div>Mahdi</div>
                        <div>1</div>
                        <div>Opening Float</div>
                        <div>CASH</div>
                        <div className="text-right">500,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-3 pl-2 border-t border-dashed border-black pt-1">
                        <div>Total Paid In</div>
                        <div>500,000.00</div>
                      </div>

                      {/* Paid Outs Section */}
                      <div className="text-[11px] font-bold mb-1">PAID OUT</div>
                      <div className="grid grid-cols-[80px_90px_100px_100px_1fr_100px_100px] gap-2 text-[11px] mb-1 font-medium pl-2">
                        <div>2001</div>
                        <div>12-Aug-26</div>
                        <div>Hiba Aloulou</div>
                        <div>1</div>
                        <div>Supplies Expense</div>
                        <div>CASH</div>
                        <div className="text-right">150,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-4 pl-2 border-t border-dashed border-black pt-1">
                        <div>Total Paid Out</div>
                        <div>150,000.00</div>
                      </div>

                      {/* Grand Total Footer */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1"></div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <div>Net Paid In / Out:</div>
                        <div>350,000.00</div>
                      </div>

                      {/* PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : (selectedReport === 'Advanced payment History' || selectedReport === 'Advanced Payment History') ? (
                    /* ADVANCED PAYMENT HISTORY REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Advanced payment History
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[100px_100px_1fr_150px_150px] gap-2 text-[11px] font-bold text-black">
                          <div>Date</div>
                          <div>Receipt #</div>
                          <div>Customer</div>
                          <div>Payment Mode</div>
                          <div className="text-right">Amount</div>
                        </div>
                      </div>

                      {/* Sample Data Row 1 */}
                      <div className="grid grid-cols-[100px_100px_1fr_150px_150px] gap-2 text-[11px] mb-1 font-medium">
                        <div>27-Aug-26</div>
                        <div>RCPT-1001</div>
                        <div>Hussein Deek</div>
                        <div>CASH USD</div>
                        <div className="text-right">20.00</div>
                      </div>

                      {/* Sample Data Row 2 */}
                      <div className="grid grid-cols-[100px_100px_1fr_150px_150px] gap-2 text-[11px] mb-8 font-medium">
                        <div>27-Aug-26</div>
                        <div>RCPT-1002</div>
                        <div>Mr. Dayek</div>
                        <div>CASH</div>
                        <div className="text-right">50,000.00</div>
                      </div>

                      {/* Grand Total Footer */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1"></div>
                      <div className="grid grid-cols-[100px_100px_1fr_150px_150px] gap-2 text-[11px] font-bold">
                        <div className="col-span-4">Total</div>
                        <div className="text-right">51,780.00</div>
                      </div>

                      {/* PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of Payment by Employee' ? (
                    /* SUMMARY OF PAYMENT BY EMPLOYEE REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of payment by Salesman
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div>Page 1 of 5</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="flex justify-between text-[11px] font-bold text-black">
                          <div>Payment Type</div>
                          <div>Amount</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Southern Olive Oil S.A.R.L
                      </div>

                      {/* 01-Aug-26 Group */}
                      <div className="text-[11px] font-bold mb-1">01-Aug-26</div>
                      <div className="text-[11px] mb-1 font-medium">Hiba Aloulou</div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div>157,490,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <div>Total for Hiba Aloulou</div>
                        <div>157,490,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-4">
                        <div>01-Aug-2026</div>
                        <div>157,490,000.00</div>
                      </div>

                      {/* 02-Aug-26 Group */}
                      <div className="text-[11px] font-bold mb-1">02-Aug-26</div>
                      <div className="text-[11px] mb-1 font-medium">Hiba Aloulou</div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div>11,520,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <div>Total for Hiba Aloulou</div>
                        <div>11,520,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-4">
                        <div>02-Aug-2026</div>
                        <div>11,520,000.00</div>
                      </div>

                      {/* 03-Aug-26 Group */}
                      <div className="text-[11px] font-bold mb-1">03-Aug-26</div>
                      <div className="text-[11px] mb-1 font-medium">Hiba Aloulou</div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div>102,455,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <div>Total for Hiba Aloulou</div>
                        <div>102,455,000.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold mb-8">
                        <div>03-Aug-2026</div>
                        <div>102,455,000.00</div>
                      </div>

                      {/* Grand Total Footer */}
                      <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1"></div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <div>Total</div>
                        <div>1,511,051,600.00</div>
                      </div>

                      {/* PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of payment by workstation' ? (
                    /* SUMMARY OF PAYMENT BY WORKSTATION REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of payment by workstation
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div className="text-right">Mode 1</div>
                          <div className="text-right">Mode 2</div>
                          <div className="text-right">Mode 3</div>
                          <div className="text-right">Mode 4</div>
                          <div className="text-right">Total</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Southern Olive Oil S.A.R.L
                      </div>

                      {/* Workstation 1 */}
                      <div className="text-[11px] mb-2 font-bold underline text-center">
                        Workstation 1
                      </div>

                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div className="text-right">1,249,151,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,249,151,600.00</div>
                      </div>
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH USD</div>
                        <div className="text-right">13,500,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">13,500,000.00</div>
                      </div>
                      
                      <div className="border-b border-dashed border-black mb-1"></div>
                      
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-bold">
                        <div>Total by workstation 1</div>
                        <div className="text-right">1,262,651,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,262,651,600.00</div>
                      </div>

                      {/* Workstation 2000 */}
                      <div className="text-[11px] mb-2 font-bold underline text-center">
                        Workstation 2000
                      </div>

                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH USD</div>
                        <div className="text-right">248,400,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">248,400,000.00</div>
                      </div>
                      
                      <div className="border-b border-dashed border-black mb-1"></div>
                      
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Total by workstation 2000</div>
                        <div className="text-right">248,400,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">248,400,000.00</div>
                      </div>
                      
                      {/* Total By Branch */}
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold mt-1">
                        <div>Total By Branch:</div>
                        <div className="text-right">1,511,051,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,511,051,600.00</div>
                      </div>

                      {/* PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of Payment by Department' ? (
                    /* SUMMARY OF PAYMENT BY DEPARTMENT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of payment by department
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div className="text-right">Mode 1</div>
                          <div className="text-right">Mode 2</div>
                          <div className="text-right">Mode 3</div>
                          <div className="text-right">Mode 4</div>
                          <div className="text-right">Total</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Southern Olive Oil S.A.R.L
                      </div>

                      {/* MAIN DEPARTMENT */}
                      <div className="text-[11px] mb-2 font-bold underline text-center">
                        MAIN DEPARTMENT
                      </div>

                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div className="text-right">1,249,151,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,249,151,600.00</div>
                      </div>
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH USD</div>
                        <div className="text-right">13,500,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">13,500,000.00</div>
                      </div>
                      
                      <div className="border-b border-dashed border-black mb-1"></div>
                      
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-bold">
                        <div>Total by Department: MAIN DEPARTMENT</div>
                        <div className="text-right">1,262,651,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,262,651,600.00</div>
                      </div>

                      {/* Showroom */}
                      <div className="text-[11px] mb-2 font-bold underline text-center">
                        Showroom
                      </div>

                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH USD</div>
                        <div className="text-right">248,400,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">248,400,000.00</div>
                      </div>
                      
                      <div className="border-b border-dashed border-black mb-1"></div>
                      
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Total by Department: Showroom</div>
                        <div className="text-right">248,400,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">248,400,000.00</div>
                      </div>
                      
                      {/* Total By Branch */}
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold mt-1">
                        <div>Total By Branch:</div>
                        <div className="text-right">1,511,051,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,511,051,600.00</div>
                      </div>

                      {/* PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : (selectedReport === 'Summary of Payment.' || selectedReport === 'Summary of Payment') ? (
                    /* SUMMARY OF PAYMENT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of Payments
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="text-center">Year: 2026 - Month: 8</div>
                        <div className="text-right">Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="flex justify-between text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div>Total</div>
                        </div>
                      </div>

                      {/* Branch Title */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive Oil S.A.R.L
                      </div>

                      {/* Data Rows */}
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div>1,249,151,600.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] mb-4 font-medium">
                        <div>CASH USD</div>
                        <div>261,900,000.00</div>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-between text-[11px] mb-1 font-bold">
                        <div>Total by branch:</div>
                        <div>1,511,051,600.00</div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <div>Total:</div>
                        <div>1,511,051,600.00</div>
                      </div>

                      {/* PRINT FOOTER */}
                      <div className="mt-8 border-t border-slate-300 pt-2 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center font-mono">
                          <div>REP_S_00247</div>
                          <div>Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                          <div><a href="https://www.vanguarderp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">www.vanguarderp.com</a></div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of Payment by Department' ? (
                    /* SUMMARY OF PAYMENT BY DEPARTMENT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of payment by department
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div className="text-right">Mode 1</div>
                          <div className="text-right">Mode 2</div>
                          <div className="text-right">Mode 3</div>
                          <div className="text-right">Mode 4</div>
                          <div className="text-right">Total</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Southern Olive Oil S.A.R.L
                      </div>

                      {/* MAIN DEPARTMENT */}
                      <div className="text-[11px] mb-2 font-bold underline text-center">
                        MAIN DEPARTMENT
                      </div>

                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH</div>
                        <div className="text-right">1,249,151,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,249,151,600.00</div>
                      </div>
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH USD</div>
                        <div className="text-right">13,500,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">13,500,000.00</div>
                      </div>
                      
                      <div className="border-b border-dashed border-black mb-1"></div>
                      
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-bold">
                        <div>Total by Department: MAIN DEPARTMENT</div>
                        <div className="text-right">1,262,651,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,262,651,600.00</div>
                      </div>

                      {/* Showroom */}
                      <div className="text-[11px] mb-2 font-bold underline text-center">
                        Showroom
                      </div>

                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>CASH USD</div>
                        <div className="text-right">248,400,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">248,400,000.00</div>
                      </div>
                      
                      <div className="border-b border-dashed border-black mb-1"></div>
                      
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Total by Department: Showroom</div>
                        <div className="text-right">248,400,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">248,400,000.00</div>
                      </div>
                      
                      {/* Total By Branch */}
                      <div className="grid grid-cols-[250px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold mt-1">
                        <div>Total By Branch:</div>
                        <div className="text-right">1,511,051,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,511,051,600.00</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Discount Summary' ? (
                    /* DISCOUNT SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive Oil S.A.R.L
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Discount Summary
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div>Year: 2026 - Month: 8</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Separator Line */}
                      <div className="border-b-[1.5px] border-black mb-4"></div>

                      {/* Data Table */}
                      <table className="w-[400px] border-collapse border border-black text-[11px] font-bold text-black">
                        <tbody>
                          <tr>
                            <td className="border border-black p-1.5 w-[220px]"></td>
                            <td className="border border-black p-1.5 text-center w-[180px]">Total Discount</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5 pl-2">Southern Olive Oil S.A.R.L</td>
                            <td className="border border-black p-1.5 text-right pr-2">56,080,449.97</td>
                          </tr>
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5 pl-2">Total</td>
                            <td className="border border-black p-1.5 text-right pr-2">56,080,449.97</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : selectedReport === 'Summary of Discount By Items Amount' ? (
                    /* SUMMARY OF DISCOUNT GROUPED BY ITEMS TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of Discount Grouped by Items
                      </div>
                      
                      <div className="grid grid-cols-3 text-[11px] font-bold mb-1 items-center">
                        <div>27-Aug-2026</div>
                        <div className="text-center">
                          <span className="mr-6">From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div className="text-right">Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
                        <div className="grid grid-cols-[100px_1fr_150px_150px] gap-2 text-[11px] font-bold text-black">
                          <div>Invoice</div>
                          <div>Product Description</div>
                          <div>Discount Amount</div>
                          <div>Employee Name</div>
                        </div>
                      </div>

                      {/* Groupings */}
                      <div className="text-[11px] mb-1 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>
                      <div className="text-[11px] mb-1 font-bold">
                        Category: عروض
                      </div>
                      <div className="text-[11px] mb-1 font-bold">
                        Division: عروض
                      </div>
                      <div className="text-[11px] mb-2 font-bold">
                        Group: عروض
                      </div>

                      {/* Data Row */}
                      <div className="grid grid-cols-[100px_1fr_150px_150px] gap-2 text-[11px] mb-1 font-medium">
                        <div>4000034</div>
                        <div>Fixed Offer</div>
                        <div></div>
                        <div>Mahdi</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Discount By Description by Employee' ? (
                    /* DISCOUNT BY DESCRIPTION BY EMPLOYEE REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Discount by Description by Employee
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
                        <div className="grid grid-cols-[120px_1fr_120px_120px] gap-2 text-[11px] font-bold text-black">
                          <div>Employee ID</div>
                          <div>Employee Name</div>
                          <div className="text-right">Discount %</div>
                          <div className="text-right">Amount</div>
                        </div>
                      </div>

                      {/* Grouping: Branch */}
                      <div className="text-[11px] mb-1 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Grouping: Description */}
                      <div className="text-[11px] mb-1 font-bold pl-2">
                        Description: Discount
                      </div>

                      {/* Employee 1: Mahdi */}
                      <div className="grid grid-cols-[120px_1fr_120px_120px] gap-2 text-[11px] mb-1 font-medium pl-4">
                        <div>1</div>
                        <div>Mahdi</div>
                        <div className="text-right">0.00%</div>
                        <div className="text-right">2,700,000.00</div>
                      </div>

                      {/* Employee 2: Hiba Aloulou */}
                      <div className="grid grid-cols-[120px_1fr_120px_120px] gap-2 text-[11px] mb-2 font-medium pl-4">
                        <div>10</div>
                        <div>Hiba Aloulou</div>
                        <div className="text-right">0.00%</div>
                        <div className="text-right">42,000,000.00</div>
                      </div>

                      {/* Total By Discount */}
                      <div className="border-t border-black pt-1 mb-3">
                        <div className="grid grid-cols-[120px_1fr_120px_120px] gap-2 text-[11px] font-bold">
                          <div className="col-span-2">Total By Discount:</div>
                          <div className="text-right">0.00%</div>
                          <div className="text-right">44,700,000.00</div>
                        </div>
                      </div>

                      {/* Next Grouping */}
                      <div className="text-[11px] font-bold pl-2">
                        Description: AMOUNT DISCOUNT
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of Discount' ? (
                    /* SUMMARY OF DISCOUNT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of Discount
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="text-center">Year: 2026 - Month: 8</div>
                        <div className="text-right">Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
                        <div className="flex justify-between text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div>Total</div>
                        </div>
                      </div>

                      {/* Branch Title */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Data Rows */}
                      <div className="flex justify-between text-[11px] mb-1 font-bold uppercase">
                        <div>AMOUNT DISCOUNT</div>
                        <div>11,380,449.97</div>
                      </div>
                      <div className="flex justify-between text-[11px] mb-4 font-bold uppercase">
                        <div>DISCOUNT</div>
                        <div>44,700,000.00</div>
                      </div>

                      {/* Total Row */}
                      <div className="flex justify-between text-[11px] font-bold">
                        <div>Total By Branch</div>
                        <div>56,080,449.97</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Discount By Category by Department' ? (
                    /* DISCOUNT BY CATEGORY BY DEPARTMENT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Discount by Category by Department
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Separator Line */}
                      <div className="border-b-[1.5px] border-black mb-4"></div>

                      {/* Data Table */}
                      <div className="flex justify-center">
                        <table className="w-[600px] border-collapse border border-black text-[11px] font-bold text-black text-center">
                          <thead>
                            <tr>
                              <th className="border border-black p-1.5 w-[150px]" colSpan={2}></th>
                              <th className="border border-black p-1.5 w-[150px]">MAIN<br/>DEPARTMENT</th>
                              <th className="border border-black p-1.5 w-[150px] bg-[#cce5ff]">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Row 1 */}
                            <tr>
                              <td className="border border-black p-1.5" rowSpan={3}>
                                Southern Olive and Oil<br/>Products
                              </td>
                              <td className="border border-black p-1.5">مفرق</td>
                              <td className="border border-black p-1.5">54,542,762.47</td>
                              <td className="border border-black p-1.5 bg-[#cce5ff]">54,542,762.47</td>
                            </tr>
                            {/* Row 2 */}
                            <tr>
                              <td className="border border-black p-1.5">عروض</td>
                              <td className="border border-black p-1.5">1,537,687.50</td>
                              <td className="border border-black p-1.5 bg-[#cce5ff]">1,537,687.50</td>
                            </tr>
                            {/* Row 3 */}
                            <tr>
                              <td className="border border-black p-1.5">Raw Materials</td>
                              <td className="border border-black p-1.5">0.00</td>
                              <td className="border border-black p-1.5 bg-[#cce5ff]">0.00</td>
                            </tr>
                            {/* Total Row */}
                            <tr className="bg-[#cce5ff]">
                              <td className="border border-black p-1.5 text-center" colSpan={2}>Total</td>
                              <td className="border border-black p-1.5">56,080,449.97</td>
                              <td className="border border-black p-1.5">56,080,449.97</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of Discount by Divisions' ? (
                    /* SUMMARY OF DISCOUNT BY DIVISIONS REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of Discount by Divisions
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-16">
                          <span>From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[1fr_120px] text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div className="text-right">Amount</div>
                        </div>
                      </div>

                      {/* Branch & Department Info */}
                      <div className="text-[11px] mb-1 font-medium">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>
                      <div className="text-[11px] mb-2 font-medium">
                        Department: MAIN DEPARTMENT
                      </div>

                      {/* Data Rows */}
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: Plastic</div><div className="text-right">0.00</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: بهارات مفرق</div><div className="text-right">14,232.73</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: زيوت مفرق</div><div className="text-right">52,866,758.13</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: عروض</div><div className="text-right">1,537,687.50</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: كيلو مفرق</div><div className="text-right">341,379.31</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: مربيات مفرق</div><div className="text-right">180,000.00</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: مرطبان</div><div className="text-right">1,014,995.92</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-1 font-medium">
                        <div>Division: مقطرات ومدبسات مفرق</div><div className="text-right">85,396.38</div>
                      </div>
                      <div className="grid grid-cols-[1fr_120px] text-[11px] mb-2 font-medium">
                        <div>Division: مونة بلدية مفرق</div><div className="text-right">40,000.00</div>
                      </div>

                      {/* Totals */}
                      <div className="border-t border-black mt-2 pt-1 flex justify-end">
                        <div className="grid grid-cols-[150px_120px] text-[11px] font-bold mb-1">
                          <div className="text-right pr-2">Total By Department:</div>
                          <div className="text-right">56,080,449.97</div>
                        </div>
                      </div>
                      <div className="border-b border-black pb-1 flex justify-end">
                        <div className="grid grid-cols-[150px_120px] text-[11px] font-bold">
                          <div className="text-right pr-2">Total By Branch:</div>
                          <div className="text-right">56,080,449.97</div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Tax Summary Comparative' ? (
                    /* TAX SUMMARY COMPARATIVE REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Tax Summary
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div>Year: 2026 - Month: 8</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Separator Line */}
                      <div className="border-b-[1.5px] border-black mb-4"></div>

                      {/* Data Table */}
                      <table className="w-[450px] border-collapse border border-black text-[11px] font-bold text-black">
                        <thead>
                          <tr>
                            <td className="border border-black p-1.5 w-[100px]"></td>
                            <td className="border border-black p-1.5 text-center leading-tight w-[175px]">
                              Southern Olive and Oil Products
                            </td>
                            <td className="border border-black p-1.5 text-center bg-[#cce5ff] w-[175px]">
                              Total
                            </td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-black p-1.5 pl-2">Tax1</td>
                            <td className="border border-black p-1.5 text-right pr-2">0.00</td>
                            <td className="border border-black p-1.5 text-right pr-2 bg-[#cce5ff]">0.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : selectedReport === 'Tax Summary' ? (
                    /* TAX SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Tax Summary
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
                        <div className="grid grid-cols-[100px_1fr_80px_140px_120px_140px_140px] gap-2 text-[11px] font-bold text-black">
                          <div>Tax Code</div>
                          <div>Description</div>
                          <div className="text-right">Rate %</div>
                          <div className="text-right">Excl. Amt</div>
                          <div className="text-right">Tax Amt</div>
                          <div className="text-right">Incl. Amt</div>
                          <div className="text-right">Total Net Sales</div>
                        </div>
                      </div>

                      {/* Branch Title */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Zero Tax Row */}
                      <div className="grid grid-cols-[100px_1fr_80px_140px_120px_140px_140px] gap-2 text-[11px] mb-1 font-medium">
                        <div>VAT 0%</div>
                        <div>Non Taxable / Exempted</div>
                        <div className="text-right">0.00%</div>
                        <div className="text-right">1,511,051,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,511,051,600.00</div>
                      </div>

                      <div className="border-t border-black my-2"></div>

                      {/* Total Row */}
                      <div className="grid grid-cols-[100px_1fr_80px_140px_120px_140px_140px] gap-2 text-[11px] font-bold">
                        <div className="col-span-2">Total Branch:</div>
                        <div className="text-right">0.00%</div>
                        <div className="text-right">1,511,051,600.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,511,051,600.00</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Delivery Orders by Date and Branch' ? (
                    /* DELIVERY ORDERS BY DATE AND BRANCH REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Orders Summary By Branch By Date
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: 01-Aug-2026</span>
                          <span>To Date: 27-Aug-2026</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-2">
                        <div className="grid grid-cols-[60px_60px_130px_110px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Brand ID</div>
                          <div>Branch ID</div>
                          <div>Branch Name</div>
                          <div>Order Date</div>
                          <div className="text-right">Dine IN</div>
                          <div className="text-right">Quick</div>
                          <div className="text-right">Delivery</div>
                          <div className="text-right">Pickup</div>
                          <div className="text-right">Drive</div>
                        </div>
                      </div>

                      {/* Data Rows mapped from reference image */}
                      {[
                        { date: 'August 01, 2026', dineIn: '21.00' },
                        { date: 'August 02, 2026', dineIn: '5.00' },
                        { date: 'August 03, 2026', dineIn: '10.00' },
                        { date: 'August 04, 2026', dineIn: '12.00' },
                        { date: 'August 05, 2026', dineIn: '19.00' },
                        { date: 'August 06, 2026', dineIn: '9.00' },
                        { date: 'August 07, 2026', dineIn: '8.00' },
                        { date: 'August 08, 2026', dineIn: '15.00' },
                        { date: 'August 10, 2026', dineIn: '13.00' },
                        { date: 'August 11, 2026', dineIn: '16.00' },
                        { date: 'August 12, 2026', dineIn: '13.00' },
                        { date: 'August 13, 2026', dineIn: '15.00' },
                        { date: 'August 14, 2026', dineIn: '11.00' },
                        { date: 'August 15, 2026', dineIn: '8.00' },
                        { date: 'August 16, 2026', dineIn: '11.00' },
                        { date: 'August 17, 2026', dineIn: '12.00' },
                        { date: 'August 18, 2026', dineIn: '11.00' },
                        { date: 'August 19, 2026', dineIn: '14.00' }
                      ].map((row, idx) => (
                        <div key={idx} className="grid grid-cols-[60px_60px_130px_110px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-2 font-medium items-start">
                          <div>9606</div>
                          <div>1</div>
                          <div className="leading-tight">Southern Olive and Oil Products</div>
                          <div>{row.date}</div>
                          <div className="text-right">{row.dineIn}</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                        </div>
                      ))}
                    </div>
                  ) : selectedReport === 'Sales by Supplier' ? (
                    /* SALES BY SUPPLIER REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Sales By Supplier
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div>Year: 2026 - Month: 8</div>
                        <div>Page 1 of 4</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] font-bold text-black">
                          <div>Barcode</div>
                          <div>Description</div>
                          <div className="text-right">Qty</div>
                          <div className="text-right">Total</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch Name: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Supplier 1 */}
                      <div className="text-[11px] font-bold mb-1">Supplier :Abbas & Hussein Dirani</div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>11262</div>
                        <div>مرطبان مربى تين معقود مع سمسم و جوز 800غ</div>
                        <div className="text-right">1.00</div>
                        <div className="text-right">360,000.00</div>
                      </div>
                      <div className="border-b border-dashed border-black mb-1"></div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-4 font-bold">
                        <div className="col-span-2">Abbas & Hussein Dirani</div>
                        <div className="text-right">1.00</div>
                        <div className="text-right">360,000.00</div>
                      </div>

                      {/* Supplier 2 */}
                      <div className="text-[11px] font-bold mb-1">Supplier :C-Way Trading</div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>10706</div>
                        <div>برغل اسمر خشن</div>
                        <div className="text-right">7.60</div>
                        <div className="text-right">760,000.00</div>
                      </div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>10707</div>
                        <div>برغل اسمر ناعم</div>
                        <div className="text-right">6.00</div>
                        <div className="text-right">720,000.00</div>
                      </div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>10746</div>
                        <div>كيوي حامض</div>
                        <div className="text-right">1.00</div>
                        <div className="text-right">725,000.00</div>
                      </div>
                      <div className="border-b border-dashed border-black mb-1"></div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-4 font-bold">
                        <div className="col-span-2">C-Way Trading</div>
                        <div className="text-right">14.60</div>
                        <div className="text-right">2,205,000.00</div>
                      </div>

                      {/* Supplier 3 */}
                      <div className="text-[11px] font-bold mb-1">Supplier :Clatchy</div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>11276</div>
                        <div>لوز صنوبري</div>
                        <div className="text-right">0.25</div>
                        <div className="text-right">393,750.00</div>
                      </div>
                      <div className="border-b border-dashed border-black mb-1"></div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-4 font-bold">
                        <div className="col-span-2">Clatchy</div>
                        <div className="text-right">0.25</div>
                        <div className="text-right">393,750.00</div>
                      </div>

                      {/* Supplier 4 */}
                      <div className="text-[11px] font-bold mb-1">Supplier :Ezzeddin</div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>10661</div>
                        <div>أرز أمريكي</div>
                        <div className="text-right">2.00</div>
                        <div className="text-right">180,000.00</div>
                      </div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>10675</div>
                        <div>شعيرية</div>
                        <div className="text-right">2.00</div>
                        <div className="text-right">180,000.00</div>
                      </div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>5601001120503</div>
                        <div>نستله حليب مكثف محلى 370 غرام</div>
                        <div className="text-right">1.00</div>
                        <div className="text-right">300,000.00</div>
                      </div>
                      <div className="border-b border-dashed border-black mb-1"></div>
                      <div className="grid grid-cols-[120px_1fr_60px_100px] gap-2 text-[11px] mb-4 font-bold">
                        <div className="col-span-2">Ezzeddin</div>
                        <div className="text-right">5.00</div>
                        <div className="text-right">660,000.00</div>
                      </div>

                      {/* Supplier 5 */}
                      <div className="text-[11px] font-bold mb-1">Supplier :Mrs Randa</div>
                    </div>
                  ) : selectedReport === 'Sales by Employee by Category' ? (
                    /* SALES BY EMPLOYEE BY CATEGORY REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Sales by Employee by Category
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[140px_100px_100px_1fr_120px_140px_140px_140px_120px_100px] gap-2 text-[11px] font-bold text-black">
                          <div>Category</div>
                          <div className="text-right">Net Sales</div>
                          <div className="text-right">Subtotal</div>
                          <div className="text-right">Discount</div>
                          <div className="text-right">Tax</div>
                          <div className="text-right">Service</div>
                          <div className="text-right">Gross Profit</div>
                          <div className="text-right">Qty</div>
                          <div className="text-right">Customers</div>
                          <div className="text-right">Rate%</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Employee: Hiba Aloulou */}
                      <div className="text-[11px] mb-1 font-bold">
                        Employee: Hiba Aloulou
                      </div>
                      <div className="grid grid-cols-[140px_100px_100px_1fr_120px_140px_140px_140px_120px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>Zaytoun & Extra</div>
                        <div className="text-right">1,243,561,600.00</div>
                        <div className="text-right">1,294,242,050.00</div>
                        <div className="text-right">50,680,450.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,420.00</div>
                        <div className="text-right">291</div>
                        <div className="text-right">82.30%</div>
                      </div>
                      <div className="border-t border-black my-1"></div>
                      <div className="grid grid-cols-[140px_100px_100px_1fr_120px_140px_140px_140px_120px_100px] gap-2 text-[11px] mb-4 font-bold">
                        <div>Total Employee</div>
                        <div className="text-right">1,243,561,600.00</div>
                        <div className="text-right">1,294,242,050.00</div>
                        <div className="text-right">50,680,450.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">1,420.00</div>
                        <div className="text-right">291</div>
                        <div className="text-right">82.30%</div>
                      </div>

                      {/* Employee: Mahdi */}
                      <div className="text-[11px] mb-1 font-bold">
                        Employee: Mahdi
                      </div>
                      <div className="grid grid-cols-[140px_100px_100px_1fr_120px_140px_140px_140px_120px_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>Showroom Oil</div>
                        <div className="text-right">267,490,000.00</div>
                        <div className="text-right">270,190,000.00</div>
                        <div className="text-right">2,700,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">180.00</div>
                        <div className="text-right">1</div>
                        <div className="text-right">17.70%</div>
                      </div>
                      <div className="border-t border-black my-1"></div>
                      <div className="grid grid-cols-[140px_100px_100px_1fr_120px_140px_140px_140px_120px_100px] gap-2 text-[11px] mb-4 font-bold">
                        <div>Total Employee</div>
                        <div className="text-right">267,490,000.00</div>
                        <div className="text-right">270,190,000.00</div>
                        <div className="text-right">2,700,000.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">0.00</div>
                        <div className="text-right">180.00</div>
                        <div className="text-right">1</div>
                        <div className="text-right">17.70%</div>
                      </div>

                      {/* Total Branch */}
                      <div className="border-t-[2px] border-black pt-1">
                        <div className="grid grid-cols-[140px_100px_100px_1fr_120px_140px_140px_140px_120px_100px] gap-2 text-[11px] font-bold">
                          <div>Total Branch</div>
                          <div className="text-right">1,511,051,600.00</div>
                          <div className="text-right">1,564,432,050.00</div>
                          <div className="text-right">53,380,450.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">0.00</div>
                          <div className="text-right">1,600.00</div>
                          <div className="text-right">292</div>
                          <div className="text-right">100.00%</div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Summary of Sales by Employee' ? (
                    /* SUMMARY OF SALES BY EMPLOYEE REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of Sales by Employee
                      </div>
                      
                      <div className="grid grid-cols-4 text-[11px] font-bold mb-1 items-center">
                        <div>27-Aug-2026</div>
                        <div className="text-center">Year: 2026 - Month: 8</div>
                        <div className="text-center">Prepared by: Mohammed</div>
                        <div className="text-right">Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[50px_250px_1fr_1fr_1fr_100px] gap-2 text-[11px] font-bold text-black">
                          <div>ID</div>
                          <div>Employee Name</div>
                          <div className="text-right">Net Sales</div>
                          <div className="text-right">Subtotal</div>
                          <div className="text-right">Discount</div>
                          <div className="text-right">Tax</div>
                        </div>
                      </div>

                      {/* Branch Title */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Data Rows */}
                      <div className="grid grid-cols-[50px_250px_1fr_1fr_1fr_100px] gap-2 text-[11px] mb-1 font-medium">
                        <div>10</div>
                        <div>Hiba Aloulou</div>
                        <div className="text-right">1,243,561,600.00</div>
                        <div className="text-right">1,294,242,050.00</div>
                        <div className="text-right">50,680,450.00</div>
                        <div className="text-right">0.00</div>
                      </div>
                      
                      <div className="grid grid-cols-[50px_250px_1fr_1fr_1fr_100px] gap-2 text-[11px] mb-4 font-medium">
                        <div>1</div>
                        <div>Mahdi</div>
                        <div className="text-right">267,490,000.00</div>
                        <div className="text-right">270,190,000.00</div>
                        <div className="text-right">2,700,000.00</div>
                        <div className="text-right">0.00</div>
                      </div>

                      {/* Total Row */}
                      <div className="grid grid-cols-[50px_250px_1fr_1fr_1fr_100px] gap-2 text-[11px] font-bold">
                        <div className="col-span-2">Total By Branch:</div>
                        <div className="text-right">1,511,051,600.00</div>
                        <div className="text-right">1,564,432,050.00</div>
                        <div className="text-right">53,380,450.00</div>
                        <div className="text-right">0.00</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Statistics by Department' ? (
                    /* STATISTICS BY DEPARTMENT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Statistics by Department
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div>Year: 2026 - Month: 8</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Main Separator Line */}
                      <div className="border-b-[1.5px] border-black mb-4"></div>

                      {/* Data Table */}
                      <table className="w-[650px] border-collapse border border-black text-[11px] font-bold text-black">
                        <thead>
                          <tr className="bg-[#cce5ff]">
                            <th className="border border-black p-1.5 w-[110px]"></th>
                            <th className="border border-black p-1.5 w-[100px]"></th>
                            <th className="border border-black p-1.5 text-left w-[140px]">MAIN<br/>DEPARTME</th>
                            <th className="border border-black p-1.5 text-left w-[140px]">Showroom</th>
                            <th className="border border-black p-1.5 text-left w-[140px]">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Main Branch Data */}
                          <tr>
                            <td className="border border-black p-1.5 align-top" rowSpan={6}>Southern Olive and Oil Products</td>
                            <td className="border border-black p-1.5">Amount</td>
                            <td className="border border-black p-1.5">1,316,032,050</td>
                            <td className="border border-black p-1.5">248,400,000.0</td>
                            <td className="border border-black p-1.5">1,564,432,050</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5">Tax</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5">Service</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5">Subtotal</td>
                            <td className="border border-black p-1.5">1,316,032,050</td>
                            <td className="border border-black p-1.5">248,400,000.0</td>
                            <td className="border border-black p-1.5">1,564,432,050</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5">Discount</td>
                            <td className="border border-black p-1.5">53,380,450.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">53,380,450.00</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1.5">Net Total</td>
                            <td className="border border-black p-1.5">1,262,651,600</td>
                            <td className="border border-black p-1.5">248,400,000.0</td>
                            <td className="border border-black p-1.5">1,511,051,600</td>
                          </tr>

                          {/* Totals Section (Blue Background) */}
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5" rowSpan={6}></td>
                            <td className="border border-black p-1.5">Amount</td>
                            <td className="border border-black p-1.5">1,316,032,05</td>
                            <td className="border border-black p-1.5">248,400,000.</td>
                            <td className="border border-black p-1.5">1,564,432,050</td>
                          </tr>
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5">Tax</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                          </tr>
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5">Service</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">0.00</td>
                          </tr>
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5">Subtotal</td>
                            <td className="border border-black p-1.5">1,316,032,05</td>
                            <td className="border border-black p-1.5">248,400,000.</td>
                            <td className="border border-black p-1.5">1,564,432,050</td>
                          </tr>
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5">Discount</td>
                            <td className="border border-black p-1.5">53,380,450.0</td>
                            <td className="border border-black p-1.5">0.00</td>
                            <td className="border border-black p-1.5">53,380,450.00</td>
                          </tr>
                          <tr className="bg-[#cce5ff]">
                            <td className="border border-black p-1.5">Net Total</td>
                            <td className="border border-black p-1.5">1,262,651,60</td>
                            <td className="border border-black p-1.5">248,400,000.</td>
                            <td className="border border-black p-1.5">1,511,051,600</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : selectedReport === 'Statistics by Workstation' ? (
                    /* STATISTICS BY WORKSTATION REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Statistics by Workstation
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div className="text-right">Mode 1</div>
                          <div className="text-right">Mode 2</div>
                          <div className="text-right">Mode 3</div>
                          <div className="text-right">Mode 4</div>
                          <div className="text-right">Total</div>
                        </div>
                      </div>

                      {/* Branch Title Underlined */}
                      <div className="text-[11px] mb-2 font-bold underline">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Workstation: 1 */}
                      <div className="text-[11px] mb-1 font-bold">
                        Workstation: 1
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Gross Sales</div><div className="text-right">1,316,032,050.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,316,032,050.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Tax</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Service</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Discount</div><div className="text-right">53,380,450.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">53,380,450.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Revenue</div><div className="text-right">1,262,651,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,262,651,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Sales</div><div className="text-right">1,262,651,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,262,651,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-2 font-medium">
                        <div>Number of Customers</div><div className="text-right">291</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">291</div>
                      </div>

                      {/* Dashed Separator */}
                      <div className="border-t border-dashed border-black my-3"></div>

                      {/* Workstation: 2000 */}
                      <div className="text-[11px] mb-1 font-bold">
                        Workstation: 2000
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Gross Sales</div><div className="text-right">248,400,000.00</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">248,400,000.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Tax</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Service</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Discount</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Revenue</div><div className="text-right">248,400,000.00</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">248,400,000.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Sales</div><div className="text-right">248,400,000.00</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">248,400,000.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-2 font-medium">
                        <div>Number of Customers</div><div className="text-right">1</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">1</div>
                      </div>

                      {/* Dashed Separator */}
                      <div className="border-t border-dashed border-black my-3"></div>

                      {/* Consolidation by branch */}
                      <div className="text-[11px] mb-1 font-bold">
                        Consolidation by branch
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Gross Sales</div><div className="text-right">1,564,432,050.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,564,432,050.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Tax</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Service</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Discount</div><div className="text-right">53,380,450.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">53,380,450.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Revenue</div><div className="text-right">1,511,051,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,511,051,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Sales</div><div className="text-right">1,511,051,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,511,051,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-medium">
                        <div>Number of Customers</div><div className="text-right">292</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">292</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Sales Summary' ? (
                    /* SALES SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Statistics Summary Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div>Year: 2026 - Month: 8</div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Description</div>
                          <div className="text-right">Mode 1</div>
                          <div className="text-right">Mode 2</div>
                          <div className="text-right">Mode 3</div>
                          <div className="text-right">Mode 4</div>
                          <div className="text-right">Total</div>
                        </div>
                      </div>

                      {/* Branch Title */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Department: MAIN DEPARTMENT */}
                      <div className="text-[11px] mb-1 font-bold">
                        Department: MAIN DEPARTMENT
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Gross Sales</div><div className="text-right">1,316,032,050.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,316,032,050.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Tax</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Service</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Discount</div><div className="text-right">53,380,450.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">53,380,450.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Revenue</div><div className="text-right">1,262,651,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,262,651,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Sales</div><div className="text-right">1,262,651,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,262,651,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-medium">
                        <div>Number of Customers</div><div className="text-right">291</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">291</div>
                      </div>

                      {/* Department: Showroom */}
                      <div className="text-[11px] mb-1 font-bold">
                        Department: Showroom
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Gross Sales</div><div className="text-right">248,400,000.00</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">248,400,000.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Tax</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Service</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Discount</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Revenue</div><div className="text-right">248,400,000.00</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">248,400,000.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Sales</div><div className="text-right">248,400,000.00</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">248,400,000.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-medium">
                        <div>Number of Customers</div><div className="text-right">1</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">1</div>
                      </div>

                      {/* Consolidation by branch */}
                      <div className="text-[11px] mb-1 font-bold">
                        Consolidation by branch
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Gross Sales</div><div className="text-right">1,564,432,050.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,564,432,050.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Tax</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Service</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-medium">
                        <div>Discount</div><div className="text-right">53,380,450.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">53,380,450.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Revenue</div><div className="text-right">1,511,051,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,511,051,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-1 font-bold">
                        <div>Net Sales</div><div className="text-right">1,511,051,600.0</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">0.000</div><div className="text-right">1,511,051,600.000</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] gap-2 text-[11px] mb-4 font-medium">
                        <div>Number of Customers</div><div className="text-right">292</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">0</div><div className="text-right">292</div>
                      </div>
                    </div>
                  ) : selectedReport === 'User Log Report' ? (
                    /* USER LOG REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        User Log Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 29</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] font-bold text-black">
                          <div>User</div>
                          <div>Date</div>
                          <div>Module</div>
                          <div>Action</div>
                          <div>Computer Name</div>
                          <div>Reference</div>
                        </div>
                      </div>

                      {/* Branch Title */}
                      <div className="text-[11px] mb-1 font-bold">
                        Branch : Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Module Group: Adjustment */}
                      <div className="text-[11px] mb-2 font-bold">
                        Module : Adjustment
                      </div>

                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>41</div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>40</div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>40</div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>39</div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>38</div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>37</div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-4 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Adjustment</div><div>Save & Post</div><div></div><div>36</div>
                      </div>

                      {/* Module Group: Inventory Ing */}
                      <div className="text-[11px] mb-2 font-bold">
                        Module : Inventory Ing
                      </div>

                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>22-Aug-2026</div><div>Inventory Ing</div><div>UPDATE Fixed Offer</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE مرطبان شطة حارة بلدي 1000ع</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE صندوق زيتون اسود مقطع 650ع*12</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE مرطبان زيتون اسود بلدي 230ع</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE زيتون اسود أول</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE مرطبان زيتون اخضر مقطع 350ع</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE مرطبان زيتون اخضر مشوي 230ع</div><div></div><div></div>
                      </div>
                      <div className="grid grid-cols-[140px_100px_120px_1fr_120px_80px] gap-2 text-[11px] mb-1 font-bold">
                        <div>Mohammed</div><div>01-Aug-2026</div><div>Inventory Ing</div><div>UPDATE صندوق زيتون اخضر محشي ايزونا 350ع*12</div><div></div><div></div>
                      </div>
                    </div>
                  ) : selectedReport === 'Transactions on Hold' ? (
                    /* TRANSACTIONS ON HOLD REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        History of Transactions on Hold
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-4">
                          <span>From Date :01-Jan-2026</span>
                          <span>To Date: 31-Mar-2026</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Workstation Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1.5 mb-4 grid grid-cols-2 text-[11px] font-bold">
                        <div className="text-right pr-8">Workstation :</div>
                        <div className="text-left pl-8">1 Showroom 1</div>
                      </div>

                      {/* Date Header */}
                      <div className="text-[11px] font-bold mb-2">
                        09 January 2026
                      </div>

                      {/* Employee Info */}
                      <div className="text-[11px] font-bold mb-6">
                        <div className="grid grid-cols-[120px_1fr] mb-1">
                          <div>Employee ID :</div>
                          <div>1</div>
                        </div>
                        <div className="grid grid-cols-[120px_1fr]">
                          <div>Employee Name:</div>
                          <div>Mahdi</div>
                        </div>
                      </div>

                      {/* Columns Header */}
                      <div className="grid grid-cols-[140px_40px_1fr_100px_100px] gap-2 text-[11px] font-bold mb-2">
                        <div>Date</div>
                        <div>Qty</div>
                        <div>Description</div>
                        <div className="text-right">Unit Price</div>
                        <div className="text-right pr-2">Unit Price</div>
                      </div>

                      {/* Item Row */}
                      <div className="grid grid-cols-[140px_40px_1fr_100px_100px] gap-2 text-[11px] font-bold mb-2">
                        <div>09/01/2026 12.16.10</div>
                        <div>-1.0</div>
                        <div>قرفة سيجار مرطبان</div>
                        <div className="text-right">200000.0</div>
                        <div className="text-right pr-2">-200000.0</div>
                      </div>

                      {/* Total Amount */}
                      <div className="grid grid-cols-[140px_40px_1fr_100px_100px] gap-2 text-[11px] font-bold mb-2">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div className="text-right">Amount :</div>
                        <div className="text-right pr-2">-200000.0</div>
                      </div>

                      {/* Bottom Line */}
                      <div className="border-b border-black mt-2"></div>
                    </div>
                  ) : selectedReport === 'No Sale' ? (
                    /* NO SALE REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        No Sale Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-26</div>
                        <div className="flex gap-4">
                          <span>From Date: {fromDate || '01-Jan-2026'}</span>
                          <span>To Date: {toDate || '31-Mar-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] font-bold text-black">
                          <div>Employee Name</div>
                          <div>Date</div>
                          <div className="text-right pr-4">Workstation</div>
                        </div>
                      </div>

                      {/* Main Branch Title */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch Name: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* EOD Group: 01-Jan-26 */}
                      <div className="text-[11px] font-bold ml-12 mb-2 mt-2">
                        EOD Date:01-Jan-26
                      </div>
                      
                      <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] mb-1">
                        <div>Ricky</div>
                        <div>01/01/2026 6.23 PM</div>
                        <div className="text-right pr-8">1</div>
                      </div>
                      
                      <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] mb-1">
                        <div>Cashier R</div>
                        <div>01/01/2026 4.00 PM</div>
                        <div className="text-right pr-8">1</div>
                      </div>

                      {/* EOD Group: 24-Feb-26 */}
                      <div className="text-[11px] font-bold ml-12 mb-2 mt-4">
                        EOD Date:24-Feb-26
                      </div>
                      
                      <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] mb-1">
                        <div>Cashier N2</div>
                        <div>24/02/2026 1.15 PM</div>
                        <div className="text-right pr-8">1</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Meter Report' ? (
                    /* METER REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-4">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Meter Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4"><span>From Date: {fromDate || '01-Aug-2026'}</span><span>To Date: {toDate || '27-Aug-2026'}</span></div>
                        <div>Page 1 of 4</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] font-bold text-black">
                          <div>Branch Name</div>
                          <div>Date</div>
                          <div>By Employee</div>
                          <div>To Employee</div>
                        </div>
                      </div>

                      {/* Main Branch Title */}
                      <div className="text-[11px] mb-1">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* EOD Group: 01-Aug-2026 */}
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>EOD Date</div>
                        <div>01-Aug-2026</div>
                        <div></div>
                        <div></div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>01-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>01-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>

                      {/* EOD Group: 02-Aug-2026 */}
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1 mt-2">
                        <div>EOD Date</div>
                        <div>02-Aug-2026</div>
                        <div></div>
                        <div></div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>02-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>02-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>02-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>02-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>

                      {/* EOD Group: 03-Aug-2026 */}
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1 mt-2">
                        <div>EOD Date</div>
                        <div>03-Aug-2026</div>
                        <div></div>
                        <div></div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>03-08-2026 00.00.00</div>
                        <div>Hiba Aloulou</div>
                        <div>Server Hiba Aloulou</div>
                      </div>
                      <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
                        <div>Southern Olive and Oil Products</div>
                        <div>03-08-2026 00.00.00</div>
                        <div>Mahdi</div>
                        <div>Server Hiba Aloulou</div>
                      </div>
                    </div>
                  ) : selectedReport === 'Duplicate Invoices' ? (
                    /* DUPLICATE INVOICES REPORT TEMPLATE */
                    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header */}
                      <div className="text-blue-700 font-bold text-[13px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[13px] mb-4">
                        Duplicate Invoices Report
                      </div>
                      
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <div>27-Aug-2026</div>
                        <div className="flex gap-4"><span>From Date: {fromDate || '01-Aug-2026'}</span><span>To Date: {toDate || '27-Aug-2026'}</span></div>
                        <div>Page 1 10</div>
                      </div>

                      {/* Table Header with thick borders */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
                        <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold">
                          <div>Invoice #</div>
                          <div>Date</div>
                          <div>Time</div>
                          <div>Order #</div>
                          <div className="text-center">Cust. #</div>
                          <div className="text-right">Amount</div>
                          <div className="text-right">Discount</div>
                          <div className="text-center">TaxPay Type</div>
                          <div className="text-right">Total</div>
                          <div className="text-right">Print#</div>
                        </div>
                      </div>

                      {/* Branch Info */}
                      <div className="text-[11px] font-bold mb-4">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Group 1 Header */}
                      <div className="text-[11px] font-bold mb-2">
                        Sale Date: 2026-08-01
                      </div>

                      {/* Data Rows Group 1 */}
                      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
                        <div>102971</div><div>01-Aug-2026</div><div>10:57</div><div></div><div className="text-center">1</div><div className="text-right">1260000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">1260000.00</div><div className="text-right">2</div>
                      </div>
                      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
                        <div>102972</div><div>01-Aug-2026</div><div>11:42</div><div></div><div className="text-center">1</div><div className="text-right">1620000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">1620000.00</div><div className="text-right">2</div>
                      </div>
                      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
                        <div>102974</div><div>01-Aug-2026</div><div>11:50</div><div></div><div className="text-center">1</div><div className="text-right">9000000.00</div><div className="text-right">900000.00</div><div className="text-center">0.00CASH</div><div className="text-right">8100000.00</div><div className="text-right">2</div>
                      </div>
                      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
                        <div>102976</div><div>01-Aug-2026</div><div>12:09</div><div></div><div className="text-center">1</div><div className="text-right">990000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">990000.00</div><div className="text-right">2</div>
                      </div>
                      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
                        <div>102979</div><div>01-Aug-2026</div><div>12:46</div><div></div><div className="text-center">1</div><div className="text-right">12225000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">12225000.00</div><div className="text-right">2</div>
                      </div>

                      {/* Group 2 Header */}
                      <div className="text-[11px] font-bold mt-4 mb-2">
                        Sale Date: 2026-08-02
                      </div>
                    </div>
                  ) : selectedReport && selectedReport.toLowerCase().includes('refund') ? (
                    /* REFUND DETAILS REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[14px]">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[14px] mt-2 mb-4">
                        Details of refunds
                      </div>
                      
                      <div className="flex justify-between items-center text-[12px] mb-2 font-bold">
                        <div>27-Aug-26</div>
                        <div>From Date: {fromDate || '01-Aug-2026'} To Date: {toDate || '27-Aug-2026'}</div>
                        <div>Page 1 of 3</div>
                      </div>
                      
                      {/* Solid Separator Line */}
                      <div className="border-b border-black mb-4"></div>

                      {/* Meta Data Section */}
                      <div className="text-[12px] font-bold space-y-2 mb-6">
                        <div className="grid grid-cols-[130px_1fr]">
                          <span className="underline">Branch Name:</span>
                          <span className="underline">Southern Olive and Oil Products (SARL)</span>
                        </div>
                        <div className="grid grid-cols-[130px_1fr]">
                          <span>EOD Date:</span>
                          <span>11-08-2026</span>
                        </div>
                        <div className="flex justify-between w-full pr-48">
                          <div className="flex"><span className="w-[130px]">Invoice Number:</span><span>103098</span></div>
                          <div className="flex gap-4"><span>Customer</span><span className="font-normal">null null</span></div>
                        </div>
                      </div>

                      {/* Invoice Items Header */}
                      <div className="grid grid-cols-[130px_1fr_150px] text-[12px] font-bold mb-2">
                        <div className="text-center">QTY</div>
                        <div>Description</div>
                        <div className="text-right pr-4">Total Price</div>
                      </div>

                      {/* Invoice Item Row */}
                      <div className="grid grid-cols-[130px_1fr_150px] text-[12px] mb-8 font-bold">
                        <div className="text-center">-0.90</div>
                        <div>كزبرة ناعم كيلو</div>
                        <div className="text-right pr-4">-630,000.00</div>
                      </div>

                      {/* Totals Section */}
                      <div className="flex justify-end text-[12px] font-bold pr-4">
                        <div className="grid grid-cols-[100px_100px] gap-y-1 text-right">
                          <div className="text-left">Sub Total:</div><div>-630,000.00</div>
                          <div className="text-left">Discount:</div><div>0.00</div>
                          <div className="text-left">Tax:</div><div>0.00</div>
                          <div className="text-left">Service:</div><div>0.00</div>
                          <div className="text-left mt-2">Grand Total:</div><div className="mt-2">-630,000.00</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD TABLE TEMPLATE */
                    <>
                      {/* Top Header Area */}
                      <div className="relative mb-6">
                        {/* Company Name (Top Left, Blue) */}
                        <div className="text-blue-700 font-bold text-[15px] absolute top-0 left-0">
                          Southern Olive and Oil Products (SARL)
                        </div>
                        
                        {/* Report Title (Center) */}
                        <div className="text-center font-bold text-[15px] w-full pt-4">
                          {selectedReport || "Summary of voids"}
                        </div>
                        
                        {/* Prepared By (Right side, slightly lower) */}
                        <div className="text-right text-[13px] absolute top-8 right-0">
                          Prepared By: Mohammed
                        </div>
                      </div>

                      {/* Meta Information Line */}
                      <div className="flex justify-between items-center text-[13px] mb-4 font-medium border-b border-slate-200 pb-2">
                        <div>27-Aug-26</div>
                        <div className="flex gap-16">
                          <span>From Date: {fromDate || '01-Aug-2026'}</span>
                          <span>To Date: {toDate || '27-Aug-2026'}</span>
                        </div>
                        <div>Page 1 of 1</div>
                      </div>

                      {/* OMEGA COLUMN HEADERS */}
                      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-4">
                        <div className="grid grid-cols-[110px_110px_100px_70px_1fr_50px_90px_100px] gap-2 text-[11px] font-bold text-black px-2">
                          <div>Date</div>
                          <div>Order Date</div>
                          <div>Server</div>
                          <div>Invoice</div>
                          <div>Description</div>
                          <div className="text-center">QTY</div>
                          <div className="text-right">Value</div>
                          <div className="pl-4">Reason</div>
                        </div>
                      </div>

                      {/* BRANCH & REASON GROUPING */}
                      <div className="text-[12px] font-bold underline mb-4 px-2">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      <div className="text-[11px] font-bold text-center mb-2">تعداد خاطئ</div>

                      {/* Row 1 */}
                      <div className="grid grid-cols-[110px_110px_100px_70px_1fr_50px_90px_100px] gap-2 text-[11px] text-black px-2 mb-1">
                        <div>22-Aug-2026 5.31 PM</div>
                        <div>22-Aug-2026 5.31 PM</div>
                        <div>Hiba Aloulou</div>
                        <div>103225</div>
                        <div>عرض العطاء جديد</div>
                        <div className="text-center">1.00</div>
                        <div className="text-right">9,000,000.00</div>
                        <div className="pl-4">تعداد خاطئ</div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-[110px_110px_100px_70px_1fr_50px_90px_100px] gap-2 text-[11px] text-black px-2 mb-1">
                        <div>13-Aug-2026 6.58 PM</div>
                        <div>13-Aug-2026 6.58 PM</div>
                        <div>Hiba Aloulou</div>
                        <div>103125</div>
                        <div>ألفية زيت زيتون خضير بلدي 1000 مل</div>
                        <div className="text-center">1.00</div>
                        <div className="text-right">990,000.00</div>
                        <div className="pl-4">تعداد خاطئ</div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-[110px_110px_100px_70px_1fr_50px_90px_100px] gap-2 text-[11px] text-black px-2 mb-1">
                        <div>13-Aug-2026 6.58 PM</div>
                        <div>13-Aug-2026 6.58 PM</div>
                        <div>Hiba Aloulou</div>
                        <div>103125</div>
                        <div>حبوب اللقاح 360غ</div>
                        <div className="text-center">1.00</div>
                        <div className="text-right">900,000.00</div>
                        <div className="pl-4">تعداد خاطئ</div>
                      </div>

                      {/* TOTALS SECTION */}
                      <div className="mt-6 flex justify-end pr-[100px]">
                        <div className="grid grid-cols-[100px_50px_90px] gap-2 text-[11px] font-bold text-black text-right items-center">
                          <div>Total Voids:</div>
                          <div className="text-center">5.30</div>
                          <div>14,062,500.00</div>

                          <div>Total Qty:</div>
                          <div className="text-center">5.30</div>
                          <div></div>

                          <div>Total:</div>
                          <div></div>
                          <div>14,062,500.00</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* GLOBAL VANGUARD ERP COPYRIGHT FOOTER */}
        <div className="w-full flex justify-center items-center text-[11px] text-[#666666] py-6 mt-8">
          <span>© 2026 Vanguard ERP All rights reserved.</span>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">Terms and Conditions</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">Support</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:underline">Feedback</a>
        </div>

        {/* SETTINGS MODAL COMPONENT */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col my-8">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-[16px] font-bold text-slate-800">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold text-lg cursor-pointer">×</button>
              </div>

              <div className="p-4 bg-gray-50 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-[13px] font-bold text-slate-800">Default Date Range Selection</h3>
                    <button className="px-4 py-1.5 bg-[#475569] text-white rounded text-[13px] font-medium hover:bg-slate-700 cursor-pointer">Save</button>
                  </div>
                  <select className="border border-slate-300 rounded p-2 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 w-[250px] bg-white h-[38px]">
                    <option value="">Select Option...</option>
                    <option value="This Month">This Month</option>
                    <option value="EOD date">EOD date</option>
                  </select>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start w-full mb-2">
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-800">Toolbar Categories</h3>
                      <p className="text-[11px] text-slate-500">You can include up to 8 categories in the toolbar</p>
                    </div>
                    <button onClick={() => setIsCustomCategoryOpen(true)} className="px-4 py-1.5 bg-[#475569] text-white rounded text-[13px] font-medium hover:bg-slate-700 cursor-pointer">Custom Category</button>
                  </div>

                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
                    <input type="text" placeholder="Search..." className="w-full border border-slate-300 rounded p-2 pl-8 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {[
                      { label: 'Recently Viewed', checked: false, hasButton: false },
                      { label: 'Internal Control', checked: false, hasButton: false },
                      { label: 'Financial', checked: false, hasButton: true, subReports: ['Profit By Invoices', 'Comparative Monthly Sales'] },
                      { label: 'Product Sales', checked: false, hasButton: true, subReports: ['Sales summary by day', 'Profit by item summary'] },
                      { label: 'Customer Sales', checked: false, hasButton: true, subReports: ['Customer Statement'] },
                      { label: "Today's & History", checked: false, hasButton: true, subReports: ['Transactions on Hold'] },
                      { label: 'Time & Attendance', checked: false, hasButton: true, subReports: ['Attendance List'] },
                      { label: 'Lists', checked: false, hasButton: true, subReports: ['System Lists'] }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col border border-slate-200 rounded">
                        <div className="flex justify-between items-center p-3 bg-white rounded">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-[13px] text-slate-700">{item.label}</span>
                          </label>
                          {item.hasButton && (
                            <button 
                              onClick={() => setExpandedCategory(expandedCategory === item.label ? null : item.label)} 
                              className="border border-slate-300 rounded px-2 py-0.5 text-slate-500 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                            >
                              «
                            </button>
                          )}
                        </div>
                        {/* Accordion Dropdown for Sub-reports */}
                        {expandedCategory === item.label && item.subReports && (
                          <div className="flex flex-col gap-2 p-3 border-t border-slate-200 bg-slate-50">
                            {item.subReports.map((report, rIdx) => (
                              <label key={rIdx} className="flex items-center gap-3 cursor-pointer pl-7">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-[12px] text-slate-600">{report}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM CATEGORY MODAL */}
        {isCustomCategoryOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
              {/* Custom Category Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-[16px] font-bold text-slate-800">Custom Category</h2>
                <button onClick={() => setIsCustomCategoryOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold text-lg cursor-pointer">×</button>
              </div>

              {/* Custom Category Body */}
              <div className="p-4 bg-gray-50 flex flex-col gap-4">
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-[13px] font-bold text-slate-800">Category Name</label>
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 border border-slate-300 rounded p-2 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                      <button className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-medium hover:bg-slate-700 cursor-pointer">Save</button>
                    </div>
                  </div>
                  
                  <div className="relative w-full mt-2 border-t border-gray-100 pt-4">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 top-4 text-slate-400">🔍</span>
                    <input type="text" placeholder="Search Report" className="w-full border border-slate-300 rounded p-2 pl-8 text-[13px] text-slate-700 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
