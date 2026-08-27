'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  FileText,
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  CreditCard,
  Clock,
  ChevronRight,
  Download,
  Printer,
  Filter,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Menu
} from 'lucide-react';

interface ReportItem {
  id: string;
  name: string;
  category: string;
  description: string;
  lastRun?: string;
}

interface ReportsMasterDetailProps {
  onBack?: () => void;
}

const CATEGORIES = [
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
  { id: 'internal-control', label: 'Internal Control', icon: Layers },
  { id: 'financial', label: 'Financial', icon: CreditCard },
  { id: 'product-sales', label: 'Product Sales', icon: BarChart3 },
  { id: 'customer-sales', label: 'Customer Sales', icon: Users },
  { id: 'todays-history', label: "Today's & History", icon: Calendar },
  { id: 'time-attendance', label: 'Time & Attendance', icon: Clock },
  { id: 'lists', label: 'Lists', icon: FileText }
];

const MOCK_REPORTS: Record<string, ReportItem[]> = {
  'recently-viewed': [
    { id: 'REP-001', name: 'Daily Cashier Shift Balance & Z-Report', category: 'Financial', description: 'Real-time shift log, cash drawer Reconciliation, and card terminal batch summaries.', lastRun: 'Today 12:45 PM' },
    { id: 'REP-002', name: 'Product Profit Margin & Revenue Matrix', category: 'Product Sales', description: 'Itemized net revenue, cost of goods sold (COGS), and net margin percentage.', lastRun: 'Aug 26, 2026' }
  ],
  'internal-control': [
    { id: 'REP-101', name: 'Cashier Void & Refund Audit Log', category: 'Internal Control', description: 'Tracks modified invoices, line-item deletions, manual overrides, and cash drawer opens.', lastRun: 'Aug 25, 2026' },
    { id: 'REP-102', name: 'Inventory Shrinkage & Loss Register', category: 'Internal Control', description: 'Audit log of damaged goods, pressing losses, and stock adjustment variances.', lastRun: 'Aug 24, 2026' }
  ],
  'financial': [
    { id: 'REP-201', name: 'Daily Cashier Shift Balance & Z-Report', category: 'Financial', description: 'Detailed breakdown of receipts by cash (LBP/USD), credit card, and receivables.', lastRun: 'Today 12:45 PM' },
    { id: 'REP-202', name: 'Accounts Receivable (A/R) Aging Summary', category: 'Financial', description: 'Outstanding customer debt balances grouped by 30, 60, and 90+ days aging.', lastRun: 'Aug 26, 2026' },
    { id: 'REP-203', name: 'Territorial Tax & MOF VAT Ledger', category: 'Financial', description: 'Official tax declaration statement for Lebanese Ministry of Finance (MOF).', lastRun: 'Aug 20, 2026' }
  ],
  'product-sales': [
    { id: 'REP-301', name: 'Product Sales Volume & Revenue Ranking', category: 'Product Sales', description: 'Ranked list of top-selling olive oil SKU packages, tin sizes, and retail bottles.', lastRun: 'Aug 27, 2026' },
    { id: 'REP-302', name: 'Fast vs Slow Stock Movement Analysis', category: 'Product Sales', description: 'Velocity report measuring inventory turnover rates across retail branches.', lastRun: 'Aug 22, 2026' }
  ],
  'customer-sales': [
    { id: 'REP-401', name: 'Top Tier Key Customer Revenue Ranking', category: 'Customer Sales', description: 'Revenue contribution per commercial client, wholesaler, and retail distributor.', lastRun: 'Aug 26, 2026' },
    { id: 'REP-402', name: 'Territorial Sales Distribution (Lebanon)', category: 'Customer Sales', description: 'Geographic sales density across Beirut, Choueifat, Jbaa, Sidon, and Tyre.', lastRun: 'Aug 25, 2026' }
  ],
  'todays-history': [
    { id: 'REP-501', name: 'Live Operations Shift Log', category: "Today's & History", description: 'Hourly transaction velocity and active terminal cashier metrics.', lastRun: 'Just now' },
    { id: 'REP-502', name: 'Historical Monthly Revenue Trend (2024-2026)', category: "Today's & History", description: 'Multi-year comparative sales performance and seasonal growth velocity.', lastRun: 'Aug 15, 2026' }
  ],
  'time-attendance': [
    { id: 'REP-601', name: 'Cashier & Press Worker Biometric Attendance Log', category: 'Time & Attendance', description: 'Clock-in, clock-out timestamps, overtime hours, and shift compliance register.', lastRun: 'Aug 27, 2026' }
  ],
  'lists': [
    { id: 'REP-701', name: 'Master Commercial Customer Directory', category: 'Lists', description: 'Complete listing of all corporate accounts, contact details, and credit limits.', lastRun: 'Aug 20, 2026' },
    { id: 'REP-702', name: 'Active Product Catalog & Price Matrix', category: 'Lists', description: 'Exportable master price list for all active inventory SKUs and unit rates.', lastRun: 'Aug 20, 2026' }
  ]
};

export default function ReportsMasterDetail({ onBack }: ReportsMasterDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('recently-viewed');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReportListOpen, setIsReportListOpen] = useState<boolean>(true);

  const reportsList = MOCK_REPORTS[selectedCategory] || [];
  const filteredReports = reportsList.filter(rep =>
    rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rep.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 font-sans dir-ltr">
      {/* 1. CLEAN TOP PAGE HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs flex items-center justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Sales Reports</span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
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
        
        {/* LEFT PANEL (REPORT CATEGORIES & SUB-REPORTS - CONDITIONAL TOGGLE) */}
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

            {/* CATEGORY LIST */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[580px]">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <div key={cat.id}>
                    <div
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedReport(null);
                      }}
                      className={`p-4 text-sm font-semibold cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/70 text-blue-700 font-bold border-l-4 border-l-blue-600'
                          : 'text-blue-600 hover:bg-slate-50 hover:text-blue-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{cat.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-blue-600' : 'text-slate-300'}`} />
                    </div>

                    {/* SUB-REPORTS UNDER ACTIVE CATEGORY */}
                    {isSelected && (
                      <div className="bg-slate-50/80 px-3 py-2 space-y-1 border-b border-slate-100">
                        {filteredReports.length === 0 ? (
                          <p className="text-xs text-slate-400 italic px-3 py-2">No matching reports</p>
                        ) : (
                          filteredReports.map((rep) => {
                            const isRepSelected = selectedReport?.id === rep.id;
                            return (
                              <div
                                key={rep.id}
                                onClick={() => setSelectedReport(rep)}
                                className={`p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                                  isRepSelected
                                    ? 'bg-white text-slate-900 shadow-2xs font-bold border border-blue-200'
                                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isRepSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                                  <span className="truncate">{rep.name}</span>
                                </div>
                                {isRepSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RIGHT PANEL (REPORT VIEWER - DYNAMIC SPAN: col-span-9 or col-span-12) */}
        <div className={`col-span-12 ${isReportListOpen ? 'md:col-span-9' : 'md:col-span-12'} bg-white border border-slate-200 rounded-xl shadow-xs min-h-[600px] p-6 relative flex flex-col justify-between overflow-hidden transition-all duration-300`}>
          
          {/* VIEWER HEADER WITH INTERNAL HAMBURGER TOGGLE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsReportListOpen(!isReportListOpen)}
                  title={isReportListOpen ? "Hide Report Categories" : "Show Report Categories"}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {selectedReport ? selectedReport.name : 'No Report Selected'}
                </h3>
              </div>
              {selectedReport ? (
                <p className="text-xs text-slate-500 font-medium mt-1 ml-9">
                  {selectedReport.description} &bull; <span className="text-slate-400">Last executed: {selectedReport.lastRun}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 font-medium mt-1 ml-9">
                  Choose a report category from the left panel to load live system analytics.
                </p>
              )}
            </div>

            {selectedReport && (
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-all">
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-2xs">
                  <Printer className="w-3.5 h-3.5" /> Print Ledger
                </button>
              </div>
            )}
          </div>

          {/* VIEWER BODY (DEFAULT WATERMARK STATE vs SELECTED REPORT PREVIEW) */}
          <div className="my-auto py-12 flex flex-col items-center justify-center text-center relative w-full">
            {!selectedReport ? (
              <div className="space-y-4 max-w-md mx-auto">
                {/* SUBTLE FAINT WATERMARK SVG PATTERN */}
                <div className="relative flex justify-center py-4">
                  <svg className="w-80 h-44 text-slate-100 stroke-current opacity-90 mx-auto" viewBox="0 0 400 200" fill="none" strokeWidth="2.5">
                    <path d="M10 150 Q 60 120, 110 160 T 210 80 T 310 120 T 390 40" stroke="currentColor" />
                    <path d="M10 180 Q 80 140, 150 170 T 250 110 T 350 150 T 390 90" stroke="currentColor" strokeDasharray="6 6" opacity="0.6" />
                    <circle cx="210" cy="80" r="4" fill="#cbd5e1" />
                    <circle cx="390" cy="40" r="4" fill="#cbd5e1" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-700 text-base">Select a Report Category</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Click any category on the left panel to inspect detailed transaction records, financial audits, and sales metrics.
                </p>
              </div>
            ) : (
              /* ACTIVE REPORT DEMO DATA PREVIEW TABLE */
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Filter Range: YTD 2026</span>
                  <span className="font-bold text-blue-600">Branch: Southern Olive Oil SARL</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left font-sans">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
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
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">AUD-2026-081</td>
                        <td className="py-3 px-4 font-bold">Beirut Central Branch POS</td>
                        <td className="py-3 px-4 text-center font-mono">Aug 27, 2026</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">1,969,200,000 LL</td>
                        <td className="py-3 px-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Reconciled</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">AUD-2026-080</td>
                        <td className="py-3 px-4 font-bold">Choueifat Press Production</td>
                        <td className="py-3 px-4 text-center font-mono">Aug 26, 2026</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">8,856,000,000 LL</td>
                        <td className="py-3 px-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Reconciled</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">AUD-2026-079</td>
                        <td className="py-3 px-4 font-bold">Jbaa Olive Hub Wholesale</td>
                        <td className="py-3 px-4 text-center font-mono">Aug 25, 2026</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">6,858,000,000 LL</td>
                        <td className="py-3 px-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Reconciled</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* VIEWER FOOTER */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Vanguard ERP Executive Reporting Engine</span>
            <span>Page 1 of 1</span>
          </div>

        </div>

      </div>
    </div>
  );
}
