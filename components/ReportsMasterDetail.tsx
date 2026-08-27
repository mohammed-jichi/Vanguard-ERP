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
  ZoomOut
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

                  {showInvoiceFilter && (
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

                  {(selectedReport === 'Summary of Payment.' || selectedReport === 'Summary of Payment') && (
                    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-800 ml-4 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-[#195a96]" />
                      Real Date
                    </label>
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
                  </div>
                </div>

                {/* BODY AREA */}
                <div className="flex-1 bg-white p-8 font-sans text-black overflow-auto min-h-[500px]">
                  {selectedReport === 'Summary of Payment.' || selectedReport === 'Summary of Payment' ? (
                    /* SUMMARY OF PAYMENT REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Southern Olive and Oil Products (SARL)
                      </div>
                      
                      <div className="text-center font-bold text-[12px] mb-4">
                        Summary of Payment
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
                        <div className="grid grid-cols-[140px_1fr_140px] gap-2 text-[11px] font-bold text-black">
                          <div>Code</div>
                          <div>Payment Method</div>
                          <div className="text-right">Amount</div>
                        </div>
                      </div>

                      {/* Grouping: Branch */}
                      <div className="text-[11px] mb-2 font-bold">
                        Branch: Southern Olive and Oil Products (SARL)
                      </div>

                      {/* Cash Row */}
                      <div className="grid grid-cols-[140px_1fr_140px] gap-2 text-[11px] mb-2 font-medium">
                        <div>1</div>
                        <div>Cash</div>
                        <div className="text-right">1,511,051,600.00</div>
                      </div>

                      <div className="border-t border-black pt-1">
                        <div className="grid grid-cols-[140px_1fr_140px] gap-2 text-[11px] font-bold">
                          <div className="col-span-2">Total By Branch:</div>
                          <div className="text-right">1,511,051,600.00</div>
                        </div>
                      </div>
                    </div>
                  ) : selectedReport === 'Discount Summary' ? (
                    /* DISCOUNT SUMMARY REPORT TEMPLATE */
                    <div className="w-full max-w-5xl mx-auto p-4 bg-white font-sans text-black">
                      {/* Header Section */}
                      <div className="text-blue-700 font-bold text-[12px] mb-2">
                        Zeit w zaytoun ljanoub
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
                            <td className="border border-black p-1.5 pl-2">Zeit w zaytoun ljanoub</td>
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

      </div>
    </div>
  );
}
