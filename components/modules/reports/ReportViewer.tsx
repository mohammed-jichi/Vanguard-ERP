'use client';

import React, { useState } from 'react';
import MasterReportContainer from '@/components/modules/reports/MasterReportContainer';
import SalesByItemsReport from '@/components/modules/reports/SalesByItemsReport';

interface ReportViewerProps {
  activeReportId?: string;
  activeReportTitle?: string;
}

export default function UniversalReportViewer({
  activeReportId = 'sales-by-items',
  activeReportTitle = 'Sales by Items',
}: ReportViewerProps) {
  const [period, setPeriod] = useState<string>('This Month');
  const [dateDisplay, setDateDisplay] = useState<string>('Aug, 2026');
  const [branch, setBranch] = useState<string>('All Branches');
  const [invoicesType, setInvoicesType] = useState<string>('All Invoices');

  return (
    <div className="w-full font-sans text-slate-800">
      
      {/* =================================================================== */}
      {/* 1. GLOBAL CSS ANTI-GHOST OVERRIDES (APPLIED ACROSS ALL REPORTS)     */}
      {/* =================================================================== */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Force solid, high-contrast, non-ghost styling on ALL inputs and selects */
        select, select option, input[type="text"], input[type="date"] {
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          background-color: #ffffff !important;
          opacity: 1 !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          border: 1.5px solid #94a3b8 !important;
          border-radius: 4px !important;
        }
        select:focus, input:focus {
          border-color: #1a629b !important;
          outline: none !important;
          box-shadow: 0 0 0 1px #1a629b !important;
        }
        /* Enforce Omega TH normal-case on all tables */
        th {
          text-transform: none !important;
          font-family: Arial, Helvetica, sans-serif !important;
        }
      `}} />

      {/* =================================================================== */}
      {/* 2. DYNAMIC REPORT DISPATCHER WRAPPED IN MASTER CONTAINER             */}
      {/* =================================================================== */}
      {activeReportId === 'sales-by-items' ? (
        /* Full Multi-Mode Engine for Sales by Items */
        <SalesByItemsReport />
      ) : (
        /* Universal Template for All Other System Reports (Summary, Customers, etc.) */
        <MasterReportContainer
          reportTitle={activeReportTitle}
          reportId={activeReportId.toUpperCase()}
          dateDisplay={dateDisplay}
          totalPages={3}
          currentPage={1}
          filtersComponent={
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-2 py-1 min-w-[140px]"
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                  <option value="This Year">This Year</option>
                </select>
                <input 
                  type="text" 
                  value={dateDisplay} 
                  onChange={(e) => setDateDisplay(e.target.value)}
                  className="px-2 py-1 min-w-[160px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Branch</label>
                  <select 
                    value={branch} 
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-2 py-1"
                  >
                    <option value="All Branches">All Branches</option>
                    <option value="choueifat">فرع الشويفات</option>
                    <option value="beirut">فرع بيروت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-0.5">Invoices</label>
                  <select 
                    value={invoicesType} 
                    onChange={(e) => setInvoicesType(e.target.value)}
                    className="w-full px-2 py-1"
                  >
                    <option value="All Invoices">All Invoices</option>
                    <option value="POS Invoices">POS Invoices</option>
                  </select>
                </div>
              </div>
            </div>
          }
        >
          {/* Universal Omega Table Matrix (Auto-Rendered) */}
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="border-b border-black text-black font-bold normal-case text-[11px]">
                <th className="py-[2px] px-1 normal-case w-1/2">description</th>
                <th className="py-[2px] px-1 normal-case text-center">barcode</th>
                <th className="py-[2px] px-1 normal-case text-right">qty</th>
                <th className="py-[2px] px-1 normal-case text-right">total amount</th>
              </tr>
            </thead>
            <tbody className="text-[11px] leading-tight font-sans">
              <tr>
                <td colSpan={4} className="py-1 font-bold">Branch: Southern Olive Oil Products S.A.R.L (Choueifat)</td>
              </tr>
              <tr>
                <td className="py-[2px] px-1 pl-4">زيت زيتون خضير بلدي 17.5 ليتر</td>
                <td className="py-[2px] px-1 text-center font-mono">11101</td>
                <td className="py-[2px] px-1 text-right">9.00</td>
                <td className="py-[2px] px-1 text-right">113,400,000.00</td>
              </tr>
              <tr>
                <td className="py-[2px] px-1 pl-4">زيت زيتون فرجن بلدي 17.5 ليتر</td>
                <td className="py-[2px] px-1 text-center font-mono">11234</td>
                <td className="py-[2px] px-1 text-right">45.00</td>
                <td className="py-[2px] px-1 text-right">405,000,000.00</td>
              </tr>
              <tr className="border-t border-black font-bold">
                <td colSpan={2} className="py-[2px] px-1 pl-2">Total Amount</td>
                <td className="py-[2px] px-1 text-right">54.00</td>
                <td className="py-[2px] px-1 text-right">518,400,000.00</td>
              </tr>
            </tbody>
          </table>
        </MasterReportContainer>
      )}

    </div>
  );
}
