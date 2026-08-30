'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReportCategoriesSidebar, { ReportItem } from '@/components/modules/reports/ReportCategoriesSidebar';
import DynamicMasterReportViewer from '@/components/modules/reports/DynamicMasterReportViewer';

// Category Slugs Mapping
const CATEGORY_SLUG_MAP: Record<string, { id: string; code: string; title: string; category: string }> = {
  'internal-control': { id: 'ic_01', code: 'REP_IC_001', title: 'Summary of Voids', category: 'Internal Control' },
  'financial': { id: 'fin_01', code: 'REP_F_101', title: 'Sales Summary', category: 'Financial' },
  'product-sales': { id: 'prod_02', code: 'REP_S_00191', title: 'Sales by Items', category: 'Product Sales' },
  'customer-sales': { id: 'cust_01', code: 'REP_C_101', title: 'Top N Customers by Amount', category: 'Customer Sales' },
  'todays-history': { id: 'td_01', code: 'REP_TH_101', title: "Today's Statistics", category: "Today's and History" },
  'time-attendance': { id: 'ta_01', code: 'REP_TA_001', title: 'Employee Attendance', category: 'Time and Attendance' },
  'lists': { id: 'list_01', code: 'REP_L_001', title: 'Customer List Standard', category: 'Lists' },
};

export default function DynamicReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const slugArray = (params?.slug as string[]) || [];
  const currentCategorySlug = slugArray[0] || 'internal-control';

  const defaultReport = CATEGORY_SLUG_MAP[currentCategorySlug] || CATEGORY_SLUG_MAP['internal-control'];
  const [activeReport, setActiveReport] = useState<ReportItem>(defaultReport);
  const [showCatalog, setShowCatalog] = useState(true);

  // Sync active report when URL category slug changes
  useEffect(() => {
    if (CATEGORY_SLUG_MAP[currentCategorySlug]) {
      setActiveReport(CATEGORY_SLUG_MAP[currentCategorySlug]);
    }
  }, [currentCategorySlug]);

  const handleSelectReport = (rep: ReportItem) => {
    setActiveReport(rep);
    // Find category slug to update URL
    const categoryKey = Object.keys(CATEGORY_SLUG_MAP).find(
      (k) => CATEGORY_SLUG_MAP[k].category.toLowerCase() === rep.category.toLowerCase()
    );
    if (categoryKey && categoryKey !== currentCategorySlug) {
      router.push(`/backoffice/reportview/${categoryKey}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 text-left select-none">
      
      {/* Top Header Control Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            {showCatalog ? '◀ Hide Catalog' : '▶ Show Report Categories'}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Category URL:</span>
            <span className="font-mono text-[#1a629b] font-bold">/backoffice/reportview/{currentCategorySlug}</span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              [{activeReport.code}] {activeReport.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          Southern Olive Oil Products S.A.R.L - Omega Matrix Engine
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (93 Reports Tree) */}
        {showCatalog && (
          <div className="w-[280px] h-[calc(100vh-48px)] bg-white border-r border-slate-300 print:hidden shrink-0">
            <ReportCategoriesSidebar
              activeReportId={activeReport.id}
              onSelectReport={handleSelectReport}
            />
          </div>
        )}

        {/* Right A4 Document Matrix */}
        <div className="flex-1 h-[calc(100vh-48px)] overflow-y-auto p-4 md:p-6 bg-[#f1f5f9] custom-scrollbar">
          <DynamicMasterReportViewer
            key={`${activeReport.id}-${activeReport.code}`}
            reportCode={activeReport.code}
            reportTitle={activeReport.title}
            category={activeReport.category}
          />
        </div>

      </div>

    </div>
  );
}
