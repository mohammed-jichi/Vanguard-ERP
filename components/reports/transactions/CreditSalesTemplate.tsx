'use client';

import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, Printer, Download } from 'lucide-react';
import { applyGlobalReportFilters, resolveActiveCurrencyFromFilters } from '@/lib/reportFilterEngine';
import { convertCurrency, formatCurrencyAmount } from '@/lib/currencyEngine';

export interface CreditSalesRecord {
  clientName: string;
  code: string;
  check: string;
  date: string;
  orderDate?: string;
  amount: number;
  paymentTerms: string;
  branch: string;
  payment_method: string;
  salesman?: string;
  workstation?: string;
}

export interface CreditSalesTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  showRate?: boolean;
  groupByDate?: boolean;
  branch?: string;
  filterValues?: Record<string, any>;
}

const DEFAULT_CREDIT_SALES: CreditSalesRecord[] = [
  {
    clientName: 'Jichi Mohammed',
    code: 'CLI-001',
    check: '100105',
    date: '01-Jan-26',
    orderDate: '2026-01-01',
    amount: 1580000.0,
    paymentTerms: '30 Days',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'STORE CREDIT',
    salesman: 'Ahmad Ali Kassem',
    workstation: 'WS-01',
  },
  {
    clientName: 'Al-Hajj Grocery S.A.R.L',
    code: 'CLI-042',
    check: '100118',
    date: '12-Aug-26',
    orderDate: '2026-08-12',
    amount: 3450000.0,
    paymentTerms: '15 Days',
    branch: 'Main Branch (Choueifat Main Facility)',
    payment_method: 'STORE CREDIT',
    salesman: 'Hiba Aloulou',
    workstation: 'WS-01',
  },
  {
    clientName: 'Cedars Gourmet Market',
    code: 'CLI-088',
    check: '100142',
    date: '18-Aug-26',
    orderDate: '2026-08-18',
    amount: 4890000.0,
    paymentTerms: '45 Days',
    branch: 'Beirut Depot',
    payment_method: 'STORE CREDIT',
    salesman: 'Hussein Mahdi',
    workstation: 'WS-02',
  },
  {
    clientName: 'South Wholesale Traders Co.',
    code: 'CLI-105',
    check: '100165',
    date: '22-Aug-26',
    orderDate: '2026-08-22',
    amount: 8200000.0,
    paymentTerms: '60 Days',
    branch: 'Sidon Hub',
    payment_method: 'STORE CREDIT',
    salesman: 'Ahmad Ali Kassem',
    workstation: 'WS-03',
  },
];

export const CreditSalesTemplate: React.FC<CreditSalesTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  showRate = false,
  groupByDate = true,
  branch = 'Main Branch (Choueifat Main Facility)',
  filterValues = {},
}) => {
  // Controls table visibility (Auto-rendered by default)
  const [isFiltered, setIsFiltered] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleFilter = () => setIsFiltered(true);
  const handleReset = () => setIsFiltered(false);

  const activeCurrency = useMemo(() => {
    return resolveActiveCurrencyFromFilters(filterValues, 'USD');
  }, [filterValues]);

  const filteredRows = useMemo(() => {
    return applyGlobalReportFilters(DEFAULT_CREDIT_SALES, filterValues);
  }, [filterValues]);

  const totalLbp = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRows]);

  const totalConverted = useMemo(() => {
    return convertCurrency(totalLbp, 'LBP', activeCurrency);
  }, [totalLbp, activeCurrency]);

  const branchDisplay = branch ? (branch.startsWith('Branch:') ? branch : `Branch: ${branch}`) : 'Branch: Main Branch';
  const periodDisplay = dynamicPeriodText ? dynamicPeriodText.replace(/^(Date|Period|Fiscal Cycle|Audit Window):\s*/i, '') : 'From Date: 01-Aug-2026 To Date: 31-Aug-2026';
  const colCount = 6 + (showRate ? 3 : 0) + (groupByDate ? 0 : -1);

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      {/* Force high-contrast text rendering */}
      <style dangerouslySetInnerHTML={{__html: `
        .force-black {
          color: #000000 !important;
          background-color: #ffffff !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #000000 !important; 
          font-weight: 700 !important;
        }
        .force-black option {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
      `}} />

      {!hideToolbar && (
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 gap-4 print:hidden shadow-sm mt-2">
        {/* Left side: Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
          <select defaultValue="This Month" className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] flex-grow sm:flex-grow-0">
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>First Quarter</option>
            <option>Second Quarter</option>
            <option>Third Quarter</option>
            <option>Fourth Quarter</option>
            <option>This Year</option>
            <option>Last Year</option>
            <option>Date Range</option>
            <option>EOD Date</option>
          </select>
          <input 
            type="text" 
            defaultValue="Aug 2026" 
            className="force-black border border-slate-400 rounded p-1.5 focus:outline-none focus:border-blue-600 shadow-sm text-[13px] w-[90px] text-center" 
          />
          <select className="border border-border rounded-lg p-1.5 focus:outline-none focus:border-primary shadow-xs text-xs flex-grow sm:flex-grow-0 bg-card text-foreground">
            <option>Main Branch</option>
          </select>

          {/* Grouped Buttons */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button 
              onClick={handleFilter} 
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-xs text-xs whitespace-nowrap cursor-pointer"
            >
              Filter
            </button>
            <button 
              onClick={handleReset} 
              className="px-4 py-1.5 bg-muted text-foreground border border-border rounded-lg font-medium hover:bg-slate-200 transition-colors shadow-xs text-xs whitespace-nowrap cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
        {/* Right side: Action Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} 
            className="p-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 shadow-sm" 
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))} 
            className="p-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 shadow-sm" 
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800"
          >
            <Printer size={15} /> Print
          </button>
          <button 
            className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-slate-800"
          >
            <Download size={15} /> Export
          </button>
        </div>
      </div>
      )}

      {/* REPORT BODY */}
      {/* Background wrapper to center the paper on screen */}
      <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 print:bg-white py-6 print:py-0 flex justify-center">
        {!isFiltered ? (
          <div className="w-full max-w-[794px] py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white shadow-sm print:hidden">
             <p className="text-slate-500 font-bold text-[14px]">Please select your filters and click "Filter" to view credit sales.</p>
          </div>
        ) : (
          /* The A4 Paper Simulator (794px width) */
          <div 
            className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]" 
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="text-blue-700 font-bold text-[12px] mb-6">Southern Olive Oil Products S.A.R.L</div>
            
            <div className="text-center font-bold text-[12px] mb-4">Credit Sales</div>
            
            <div className="flex justify-between items-end text-[11px] font-bold w-full border-b border-black pb-1 mb-1">
              <div>{executionDate}</div>
              <div className="text-center flex-1">{periodDisplay}</div>
              <div>Page 1 of 1</div>
            </div>

            <div className="w-full overflow-x-auto print:overflow-visible pb-4">
              <table className="w-full border-collapse text-[11px] whitespace-nowrap">
                <thead>
                  <tr className="font-bold text-black border-b border-black">
                    <th className="py-1 px-1 text-left">Client Name</th>
                    <th className="py-1 px-1 text-left">Code</th>
                    <th className="py-1 px-1 text-left">Check</th>
                    {groupByDate && <th className="py-1 px-1 text-center">Date</th>}
                    <th className="py-1 px-1 text-right">Amount (LBP)</th>
                    <th className="py-1 px-1 text-left pl-4">Payment Terms</th>
                    {showRate && <th className="py-1 px-1 text-center">Cur</th>}
                    {showRate && <th className="py-1 px-1 text-right">Rate</th>}
                    {showRate && <th className="py-1 px-1 text-right">{`Total (${activeCurrency})`}</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold">
                    <td colSpan={colCount} className="py-1 px-1 underline">{branchDisplay}</td>
                  </tr>
                  <tr className="font-bold">
                    <td colSpan={colCount} className="py-1 px-1">GENERAL</td>
                  </tr>
                  <tr className="font-bold">
                    <td colSpan={colCount} className="py-1 px-1">Payment Type: CREDIT</td>
                  </tr>

                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="py-8 text-center text-slate-500 font-medium italic">
                        No credit sales records matching active filters
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => {
                      const convertedRow = convertCurrency(row.amount, 'LBP', activeCurrency);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1 px-1 font-bold">{row.clientName}</td>
                          <td className="py-1 px-1 font-mono text-slate-500">{row.code}</td>
                          <td className="py-1 px-1 font-mono">{row.check}</td>
                          {groupByDate && <td className="py-1 px-1 text-center font-mono">{row.date}</td>}
                          <td className="py-1 px-1 text-right font-mono">{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-1 px-1 pl-4">{row.paymentTerms}</td>
                          {showRate && <td className="py-1 px-1 text-center font-bold text-slate-700">{activeCurrency}</td>}
                          {showRate && <td className="py-1 px-1 text-right font-mono text-slate-700">{activeCurrency === 'LBP' ? '1.00' : '89,500.00'}</td>}
                          {showRate && (
                            <td className="py-1 px-1 text-right font-mono text-slate-700 font-bold">
                              {formatCurrencyAmount(convertedRow, activeCurrency, true)}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                  
                  {/* Totals */}
                  {filteredRows.length > 0 && (
                    <>
                      <tr className="font-bold border-t border-slate-300">
                        <td colSpan={groupByDate ? 4 : 3} className="py-1 px-1 text-right">Total By Payment Type:</td>
                        <td className="py-1 px-1 text-right font-mono">{totalLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                        {showRate && (
                          <>
                            <td className="py-1 px-1 text-center">{activeCurrency}</td>
                            <td className="py-1 px-1 text-right font-mono">{activeCurrency === 'LBP' ? '1.00' : '89,500'}</td>
                            <td className="py-1 px-1 text-right font-mono font-bold">
                              {formatCurrencyAmount(totalConverted, activeCurrency, true)}
                            </td>
                          </>
                        )}
                      </tr>
                      <tr className="font-bold">
                        <td colSpan={groupByDate ? 4 : 3} className="py-1 px-1 text-right">Total By Branch:</td>
                        <td className="py-1 px-1 text-right font-mono">{totalLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                        {showRate && (
                          <>
                            <td className="py-1 px-1 text-center">{activeCurrency}</td>
                            <td className="py-1 px-1 text-right font-mono">{activeCurrency === 'LBP' ? '1.00' : '89,500'}</td>
                            <td className="py-1 px-1 text-right font-mono font-bold">
                              {formatCurrencyAmount(totalConverted, activeCurrency, true)}
                            </td>
                          </>
                        )}
                      </tr>
                      <tr className="font-bold border-t border-black">
                        <td colSpan={groupByDate ? 4 : 3} className="py-1 px-1 text-right underline">Grand Total:</td>
                        <td className="py-1 px-1 text-right font-mono">{totalLbp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                        {showRate && (
                          <>
                            <td className="py-1 px-1 text-center">{activeCurrency}</td>
                            <td className="py-1 px-1 text-right font-mono">{activeCurrency === 'LBP' ? '1.00' : '89,500'}</td>
                            <td className="py-1 px-1 text-right font-mono font-bold">
                              {formatCurrencyAmount(totalConverted, activeCurrency, true)}
                            </td>
                          </>
                        )}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* STANDARDIZED FOOTER */}
            <div className="w-full mt-12 border-t border-black pt-2 flex justify-between items-center text-[10px] font-bold text-black">
              <div className="text-left w-1/3">REP_S_00247</div>
              <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
              <div className="text-right w-1/3 text-blue-600">www.vanguarderp.com</div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

