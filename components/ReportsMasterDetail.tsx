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
                  {selectedReport && selectedReport.toLowerCase().includes('refund') ? (
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

                      {/* ACTIVE REPORT DEMO DATA TABLE */}
                      <div className="w-full space-y-4 text-left mt-6">
                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left font-sans">
                            <thead className="bg-[#475569] text-white font-bold uppercase text-[11px] tracking-wider">
                              <tr>
                                <th className="py-3 px-4">Record Ref</th>
                                <th className="py-3 px-4">Module / Entity</th>
                                <th className="py-3 px-4 text-center">Date</th>
                                <th className="py-3 px-4 text-right">Value (LL)</th>
                                <th className="py-3 px-4 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-[#195a96]">REC-2026-081</td>
                                <td className="py-3 px-4 font-bold">Beirut Central Branch POS</td>
                                <td className="py-3 px-4 text-center font-mono">Aug 27, 2026</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">1,969,200,000 LL</td>
                                <td className="py-3 px-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Verified</span></td>
                              </tr>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-[#195a96]">REC-2026-080</td>
                                <td className="py-3 px-4 font-bold">Choueifat Press Production</td>
                                <td className="py-3 px-4 text-center font-mono">Aug 26, 2026</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">8,856,000,000 LL</td>
                                <td className="py-3 px-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Verified</span></td>
                              </tr>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-[#195a96]">REC-2026-079</td>
                                <td className="py-3 px-4 font-bold">Jbaa Olive Hub Wholesale</td>
                                <td className="py-3 px-4 text-center font-mono">Aug 25, 2026</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">6,858,000,000 LL</td>
                                <td className="py-3 px-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Verified</span></td>
                              </tr>
                            </tbody>
                          </table>
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
