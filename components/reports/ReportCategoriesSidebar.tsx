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

export interface ReportSubFolder {
  id: string;
  name: string;
  reports: ReportItem[];
}

export interface ReportCategory {
  id: string;
  name: string;
  reports?: ReportItem[];
  subFolders?: ReportSubFolder[];
}

interface ReportCategoriesSidebarProps {
  categories?: ReportCategory[];
  onSelectReport?: (report: ReportItem) => void;
  activeReportId?: string | null;
}

const DEFAULT_VANGUARD_CATEGORIES: ReportCategory[] = [
  {
    id: 'recently-viewed',
    name: 'Recently Viewed',
    reports: [
      { id: 'rv-cust-std', title: 'Customer List Standard' },
      { id: 'rv-voids', title: 'Summary of voids' },
      { id: 'rv-read-hist', title: 'Main Reading History' },
      { id: 'rv-refunds', title: 'Summary of refunds' },
      { id: 'rv-today-stats', title: "Today's Statistics" },
    ],
  },
  {
    id: 'internal-control',
    name: 'Internal Control',
    reports: [
      { id: 'ic-voids', title: 'Summary of voids' },
      { id: 'ic-refunds', title: 'Summary of refunds' },
      { id: 'ic-dup-inv', title: 'Duplicate Invoices' },
      { id: 'ic-meter', title: 'Meter Report' },
      { id: 'ic-no-sale', title: 'No Sale' },
      { id: 'ic-user-log', title: 'User Log Report' },
      { id: 'ic-disc-sum', title: 'Discount Summary' },
    ],
    subFolders: [
      {
        id: 'ic-transactions',
        name: 'Transactions',
        reports: [
          { id: 'ic-tx-date', title: 'Transactions by Date' },
          { id: 'ic-tx-inv', title: 'Transactions by Invoice Number' },
          { id: 'ic-tx-salesman', title: 'Transactions by Salesman' },
          { id: 'ic-tx-date-pmt', title: 'Transactions by Date by Payments' },
          { id: 'ic-tx-cust', title: 'Transactions by Customers' },
          { id: 'ic-tx-cust-grp', title: 'Transactions by Customers by Groups' },
          { id: 'ic-tx-cust-det', title: 'Transactions by Customers details' },
          { id: 'ic-tx-cust-emp', title: 'Transactions by Customers by Employee' },
          { id: 'ic-tx-emp-pmt', title: 'Transactions by Employees by Payment' },
          { id: 'ic-tx-ws', title: 'Transactions by Workstation' },
          { id: 'ic-tx-emp', title: 'Transactions by Employees' },
          { id: 'ic-tx-src', title: 'Transactions By Source' },
          { id: 'ic-tx-hold', title: 'Transactions on Hold' },
        ],
      },
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    reports: [
      { id: 'fin-sales-sum', title: 'Sales Summary' },
      { id: 'fin-stats-ws', title: 'Statistics by Workstation' },
      { id: 'fin-stats-dept', title: 'Statistics by Department' },
      { id: 'fin-sum-emp', title: 'Summary of Sales by Employee' },
      { id: 'fin-emp-cat', title: 'Sales by Employee by Category' },
      { id: 'fin-sales-supp', title: 'Sales by Supplier' },
      { id: 'fin-del-orders', title: 'Delivery Orders by Date and Branch' },
      { id: 'fin-tax-sum', title: 'Tax Summary' },
      { id: 'fin-tax-comp', title: 'Tax Summary Comparative' },
      { id: 'fin-disc-div', title: 'Summary of Discount by Divisions' },
      { id: 'fin-disc-cat-dept', title: 'Discount By Category by Department' },
      { id: 'fin-disc-sum-gen', title: 'Summary of Discount' },
      { id: 'fin-disc-desc-emp', title: 'Discount By Description by Employee' },
      { id: 'fin-disc-items', title: 'Summary of Discount By Items Amount' },
      { id: 'fin-disc-sum', title: 'Discount Summary' },
      { id: 'fin-pmt-sum', title: 'Summary of Payment.' },
      { id: 'fin-pmt-dept', title: 'Summary of Payment by Department' },
      { id: 'fin-pmt-ws', title: 'Summary of payment by workstation' },
      { id: 'fin-pmt-emp', title: 'Summary of Payment by Employee' },
      { id: 'fin-adv-pmt', title: 'Advanced Payment History' },
      { id: 'fin-paid-in-out', title: 'Paid In/Out' },
      { id: 'fin-cust-pmt', title: 'Customer Payments' },
      { id: 'fin-layaway-sales', title: 'List of Layaway Sales' },
      { id: 'fin-layaway-hist', title: 'Layaway History' },
      { id: 'fin-pending-inv-adv', title: 'List of Pending Invoices with Advance Payment' },
      { id: 'fin-profit-inv-sum', title: 'Profit by Invoices Summary' },
      { id: 'fin-profit-item-sum', title: 'Profit by item summary' },
      { id: 'fin-profit-cat-sum', title: 'Profit by category summary' },
      { id: 'fin-profit-cat-dept', title: 'Profit by category by department' },
      { id: 'fin-profit-inv', title: 'Profit By Invoices' },
      { id: 'fin-sales-sum-day', title: 'Sales summary by day' },
      { id: 'fin-daily-sales', title: 'Daily Sales' },
      { id: 'fin-comp-yearly', title: 'Comparative Yearly Sales' },
      { id: 'fin-comp-monthly', title: 'Comparative Monthly Sales' },
      { id: 'fin-comp-monthly-emp', title: 'Comparative Monthly Sales by Employee' },
      { id: 'fin-tx-date', title: 'Transactions by Date' },
      { id: 'fin-credit-sales', title: 'Credit Sales' },
      { id: 'fin-credit-card', title: 'Credit Card Report' },
      { id: 'fin-timer-grp', title: 'Timer Report Group by transaction count' },
      { id: 'fin-time-date', title: 'Time report by date' },
      { id: 'fin-time-avg-chk', title: 'Time report - Average Check' },
      { id: 'fin-time-eod', title: 'Time report By EOD date' },
      { id: 'fin-tx-time', title: 'Transaction Report by Time' },
    ],
  },
  {
    id: 'product-sales',
    name: 'Product Sales',
    reports: [
      { id: 'summary-sales-items', title: 'Summary of Sales By Items' },
      { id: 'sales-by-items', title: 'Sales by Items' },
      { id: 'sales-details-one-item', title: 'Sales details for one sales item' },
      { id: 'sales-customer-by-items', title: 'Sales By Customer By Items' },
      { id: 'daily-sales-items', title: 'Daily Sales By Items' },
      { id: 'sales-by-categories', title: 'Sales By Categories' },
      { id: 'sales-by-divisions', title: 'Sales By Divisions' },
      { id: 'sales-items-transaction', title: 'Sales Items by Transaction' },
      { id: 'not-sold-items', title: 'Not Sold Items' },
      { id: 'sold-serial-numbers', title: 'Sold Serial Numbers' },
      { id: 'prod-sales-cat', title: 'Sales By Category' },
      { id: 'prod-sales-div', title: 'Sales By Division' },
      { id: 'prod-sales-grp', title: 'Sales By Groups' },
      { id: 'prod-top-qty', title: 'Top N sold by Quantity' },
      { id: 'prod-top-amt', title: 'Top N sold by Amount' },
      { id: 'prod-sum-voids', title: 'Summary of voids' },
      { id: 'prod-sum-refunds', title: 'Summary of refunds' },
      { id: 'prod-det-refunds', title: 'Details of refunds' },
    ],
  },
  {
    id: 'customer-sales',
    name: 'Customer Sales',
    reports: [
      { id: 'cust-top-amt', title: 'Top N Customers by Amount' },
      { id: 'cust-detail', title: 'Sales by customer In Detail' },
      { id: 'cust-zone', title: 'Sales by zone' },
      { id: 'cust-del-sum', title: 'Delivery Sales Summary' },
      { id: 'cust-drivers-hist', title: 'Drivers History' },
    ],
  },
  {
    id: 'todays-history',
    name: "Today's & History",
    reports: [
      { id: 'today-stats', title: "Today's Statistics" },
      { id: 'today-pmt-sum', title: "Today's Summary of payment" },
      { id: 'today-emp-sum', title: "Today's summary by Employee" },
      { id: 'today-tx', title: "Today's Transactions" },
      { id: 'today-prev-older', title: 'Preview Older Sales' },
      { id: 'today-reading-hist', title: 'Main Reading History' },
    ],
  },
  {
    id: 'time-attendance',
    name: 'Time & Attendance',
    reports: [
      { id: 'ta-emp-att', title: 'Employee attendance' },
      { id: 'ta-time-att', title: 'Time And Attendance' },
      { id: 'ta-labor-cost', title: 'Labor Cost' },
    ],
  },
  {
    id: 'lists',
    name: 'Lists',
    reports: [
      { id: 'list-cust-std', title: 'Customer List Standard' },
      { id: 'list-not-active', title: 'Not Active Customers' },
      { id: 'list-new-cust', title: 'New Customers' },
      { id: 'list-black-list', title: 'Black List Customers' },
    ],
  },
];

export default function ReportCategoriesSidebar({
  categories = DEFAULT_VANGUARD_CATEGORIES,
  onSelectReport,
  activeReportId = null,
}: ReportCategoriesSidebarProps) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openSubFolderIds, setOpenSubFolderIds] = useState<Record<string, boolean>>({
    'ic-transactions': true,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const toggleSubFolder = (folderId: string) => {
    setOpenSubFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const matchesSearch = (str: string) =>
    str.toLowerCase().includes(searchQuery.toLowerCase().trim());

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    if (matchesSearch(cat.name)) return true;
    if (cat.reports && cat.reports.some((r) => matchesSearch(r.title))) return true;
    if (
      cat.subFolders &&
      cat.subFolders.some(
        (sf) =>
          matchesSearch(sf.name) || sf.reports.some((r) => matchesSearch(r.title))
      )
    ) {
      return true;
    }
    return false;
  });

  return (
    <aside className="w-full max-w-[280px] bg-card rounded-xl border border-border shadow-xs p-4 font-sans select-none">
      
      {/* 1. Card Header */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-9 h-9 rounded-xl border border-border bg-muted flex items-center justify-center text-foreground shadow-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h2 className="text-[15px] font-bold tracking-tight text-foreground">
          Search Reports
        </h2>
      </div>

      {/* 2. Search Input */}
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
          placeholder="Search reports..."
          className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* 3. Category Accordion List */}
      <div className="divide-y divide-border border-t border-border">
        {filteredCategories.map((category) => {
          const isOpen = openCategoryId === category.id || (!!searchQuery && filteredCategories.length <= 3);
          const visibleDirectReports = (category.reports || []).filter(
            (r) => !searchQuery || matchesSearch(r.title)
          );
          const visibleSubFolders = (category.subFolders || [])
            .map((sf) => ({
              ...sf,
              reports: (sf.reports || []).filter(
                (r) => !searchQuery || matchesSearch(r.title) || matchesSearch(sf.name)
              ),
            }))
            .filter((sf) => !searchQuery || sf.reports.length > 0);

          return (
            <div key={category.id} className="border-b border-border">
              <div 
                onClick={() => toggleCategory(category.id)}
                className="report-category-header text-foreground font-semibold text-sm px-4 py-3 border-b border-border/60 bg-card hover:bg-muted/50 flex justify-between items-center cursor-pointer select-none sticky top-0 z-10 transition-colors"
              >
                <span className="text-foreground">
                  {category.name || 'Recently Viewed'}
                </span>

                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`lucide lucide-chevron-down text-muted-foreground transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* Sub-Reports List if Accordion is Open */}
              {isOpen && (
                <div className="bg-muted/30 px-2 py-1.5 space-y-1 border-t border-border/60">
                  {/* Direct Leaf Items */}
                  {visibleDirectReports.map((report) => {
                    const isSelected = activeReportId === report.id;
                    return (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => onSelectReport && onSelectReport(report)}
                        className={`w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-medium shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card'
                        }`}
                      >
                        {report.title}
                      </button>
                    );
                  })}

                  {/* Collapsible Sub-Folders (e.g. Transactions) */}
                  {visibleSubFolders.map((subFolder) => {
                    const isSubOpen =
                      openSubFolderIds[subFolder.id] !== undefined
                        ? openSubFolderIds[subFolder.id]
                        : true;

                    return (
                      <div
                        key={subFolder.id}
                        className="mt-1 pt-1 border-t border-border/60 bg-card/60 rounded-lg p-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSubFolder(subFolder.id)}
                          className="w-full flex items-center justify-between text-left py-1 px-2 text-[11.5px] font-semibold text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>📁</span>
                            <span>{subFolder.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({subFolder.reports.length})
                            </span>
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {isSubOpen ? '▲' : '▼'}
                          </span>
                        </button>

                        {isSubOpen && (
                          <div className="pl-3 pr-1 pt-1 space-y-0.5 border-l-2 border-border ml-1.5 mt-0.5">
                            {subFolder.reports.map((report) => {
                              const isSelected = activeReportId === report.id;
                              return (
                                <button
                                  key={report.id}
                                  type="button"
                                  onClick={() => onSelectReport && onSelectReport(report)}
                                  className={`w-full text-left py-1.5 px-2 rounded-lg text-[11.5px] transition-colors ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground font-medium shadow-2xs'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-card'
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
              )}
            </div>
          );
        })}
      </div>

    </aside>
  );
}
