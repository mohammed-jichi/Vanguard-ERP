'use client';

import React, { useState } from 'react';
import MasterReportContainer from './MasterReportContainer';
import { MASTER_REPORTS_SCHEMAS, MasterReportSchema } from '@/config/reports.config';

interface DynamicMasterReportViewerProps {
  reportCode: string;
  reportTitle: string;
  category: string;
}

export default function DynamicMasterReportViewer({
  reportCode,
  reportTitle,
  category,
}: DynamicMasterReportViewerProps) {
  // Retrieve specific schema or fallback to standard Vanguard schema
  const schema: MasterReportSchema = MASTER_REPORTS_SCHEMAS[reportCode] || {
    id: 'generic',
    code: reportCode || 'REP_GEN_001',
    title: reportTitle || 'Standard Vanguard Matrix Report',
    category: category || 'General',
    filters: {
      enableBranch: true,
      enableRep: true,
      checkboxes: [{ id: 'active_only', label: 'Show Active Items Only', defaultChecked: true }],
    },
    columns: [
      { key: 'ref', header: 'reference #', widthPct: '15%', align: 'left', isMonospace: true },
      { key: 'date', header: 'date & time', widthPct: '18%', align: 'left', isMonospace: true },
      { key: 'description', header: 'item / account description', widthPct: '32%', align: 'left' },
      { key: 'user', header: 'user / rep', widthPct: '15%', align: 'left' },
      { key: 'amount', header: 'amount ($)', widthPct: '20%', align: 'right', isMonospace: true, isCurrency: true },
    ],
    sampleRowsGenerator: () => [
      { ref: 'REF-8801', date: '2026-08-28 10:15 AM', description: '17.5L Olive Oil Tin (Cold Pressed)', user: 'Ahmad Ali Kassem', amount: 110.0 },
      { ref: 'REF-8802', date: '2026-08-29 02:30 PM', description: 'Pomegranate Molasses 500ml x 12 Box', user: 'Hiba Aloulou', amount: 72.0 },
      { ref: 'REF-8803', date: '2026-08-30 09:00 AM', description: 'Eau de Javel 4L x 4 Carton', user: 'Hussein Mahdi', amount: 24.0 },
    ],
  };

  // Filter States
  const [periodPreset, setPeriodPreset] = useState('THIS_MONTH');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-31');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedRep, setSelectedRep] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState(schema.filters.modesList?.[0] || 'Detailed');
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>(
    (schema.filters.checkboxes || []).reduce((acc, cb) => ({ ...acc, [cb.id]: cb.defaultChecked }), {})
  );

  const rows = schema.sampleRowsGenerator();

  return (
    <MasterReportContainer
      reportTitle={schema.title}
      reportCode={schema.code}
      companyName="Southern Olive Oil Products S.A.R.L"
    >
      {/* 1. DYNAMIC CONTEXT-AWARE FILTER TOOLBAR (PRINT HIDDEN) */}
      <div className="bg-[#f1f5f9] p-3 rounded-lg border border-slate-300 mb-4 text-xs font-sans print:hidden select-none space-y-2.5">
        
        {/* Row 1: Modes (if supported) & Print/Export Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          {schema.filters.supportsModes && schema.filters.modesList ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">View Mode:</span>
              <div className="flex items-center bg-white p-0.5 rounded border border-slate-300">
                {schema.filters.modesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMode(m)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      selectedMode === m ? 'bg-[#1a629b] text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="font-bold text-slate-700 text-xs">
              Report Category: <span className="text-[#1a629b]">{schema.category}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#1a629b] hover:bg-[#124b77] text-white font-bold rounded text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span>🖨️ Print A4</span>
            </button>
          </div>
        </div>

        {/* Row 2: Dynamic Dropdowns (Only renders what this report needs) */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div>
            <label className="block font-bold text-slate-700 mb-0.5">Period:</label>
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value)}
              className="p-1 bg-white border border-slate-300 rounded font-semibold focus:outline-none cursor-pointer"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {schema.filters.enableBranch && (
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Branch:</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="p-1 bg-white border border-slate-300 rounded font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Branches</option>
                <option value="Choueifat">Choueifat Main Branch</option>
                <option value="Beirut">Beirut Branch</option>
              </select>
            </div>
          )}

          {schema.filters.enableRep && (
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Representative / Cashier:</label>
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="p-1 bg-white border border-slate-300 rounded font-bold text-[#1a629b] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Employees</option>
                <option value="Ahmad">Ahmad Ali Kassem</option>
                <option value="Hiba">Hiba Aloulou</option>
                <option value="Hussein">Hussein Mahdi</option>
              </select>
            </div>
          )}

          {/* Dynamic Checkboxes for this specific report */}
          {schema.filters.checkboxes && schema.filters.checkboxes.length > 0 && (
            <div className="flex items-center gap-3 pt-3 ml-2">
              {schema.filters.checkboxes.map((cb) => (
                <label key={cb.id} className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={checkboxStates[cb.id] ?? cb.defaultChecked}
                    onChange={(e) => setCheckboxStates({ ...checkboxStates, [cb.id]: e.target.checked })}
                    className="accent-[#1a629b] w-3.5 h-3.5 rounded cursor-pointer"
                  />
                  <span>{cb.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. STRICT VANGUARD A4 PRINT MATRIX (w-[794px] min-h-[1123px])          */}
      {/* =================================================================== */}
      <div className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans mx-auto border border-slate-200 shadow-sm print:border-none print:shadow-none print:m-0 print:p-6 select-none">
        
        {/* A4 Document Header */}
        <div className="border-b border-black pb-2 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-sm font-bold text-slate-900 uppercase">
                Southern Olive Oil Products S.A.R.L
              </h1>
              <h2 className="text-base font-bold mt-0.5">{schema.title}</h2>
            </div>
            <div className="text-right text-[10.5px] font-mono text-slate-600 space-y-0.5">
              <div><span className="font-bold">Code:</span> {schema.code}</div>
              <div><span className="font-bold">Period:</span> {fromDate} to {toDate}</div>
              <div><span className="font-bold">Branch:</span> {selectedBranch === 'ALL' ? 'All Operating Branches' : selectedBranch}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Fixed-Width Table */}
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-black bg-slate-50 font-bold text-black leading-tight">
              {schema.columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.widthPct }}
                  className={`py-1 px-1 normal-case ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 leading-normal align-top">
                {schema.columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-1.5 px-1 ${col.isMonospace ? 'font-mono' : ''} ${
                      col.align === 'right' ? 'text-right font-bold' : col.align === 'center' ? 'text-center font-bold' : 'text-left'
                    } ${col.key === 'description' ? 'font-bold text-slate-900 leading-snug whitespace-normal break-words' : ''}`}
                  >
                    {col.isCurrency && typeof row[col.key] === 'number'
                      ? row[col.key].toLocaleString('en-US', { minimumFractionDigits: 2 })
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Totals Footer */}
        <div className="border-t-2 border-black mt-4 pt-2 text-[11px] font-mono">
          <div className="flex justify-between items-center font-bold">
            <span>Total Records: {rows.length}</span>
            <span>Organization: Southern Olive Oil Products S.A.R.L</span>
            <span className="text-[#1a629b] text-xs">Status: Verified Matrix</span>
          </div>
        </div>

        {/* Official Print Footer */}
        <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
          <span>Printed from Vanguard ERP System</span>
          <span>Southern Olive Oil Products S.A.R.L - Confidential</span>
          <span>Page 1 of 1</span>
        </div>

      </div>
    </MasterReportContainer>
  );
}
