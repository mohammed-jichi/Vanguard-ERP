'use client';

import React from 'react';

interface UserLogReportTemplateProps {
  fromDate?: string;
  toDate?: string;
}

export const UserLogReportTemplate: React.FC<UserLogReportTemplateProps> = ({
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
}) => {
  const logEntries = [
    {
      branch: 'Southern Olive Oil Products - Choueifat',
      module: 'Adjustment',
      user: 'Mohammed Jichi',
      date: '01-Aug-2026 10:14 AM',
      action: 'Save & Post',
      computer: 'POS-DESK-01',
      reference: '41',
    },
    {
      branch: 'Southern Olive Oil Products - Choueifat',
      module: 'Sales Invoicing',
      user: 'Hiba Aloulou',
      date: '01-Aug-2026 11:30 AM',
      action: 'Print Invoice',
      computer: 'POS-DESK-02',
      reference: '103098',
    },
    {
      branch: 'Southern Olive Oil Products - Choueifat',
      module: 'Sales Invoicing',
      user: 'Cashier R',
      date: '02-Aug-2026 02:45 PM',
      action: 'Void Item Authorized',
      computer: 'POS-DESK-01',
      reference: '103125',
    },
    {
      branch: 'Southern Olive Oil Products - Choueifat',
      module: 'Cash Drawer',
      user: 'Hussein Mahdi',
      date: '02-Aug-2026 07:00 PM',
      action: 'End of Day Reconciliation',
      computer: 'POS-DESK-01',
      reference: 'EOD-892',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex justify-between items-start text-xs font-bold mb-1">
        <span className="text-blue-700 text-sm">Southern Olive Oil Products S.A.R.L</span>
        <span className="text-base text-slate-900 font-bold">User Log Report</span>
        <span className="text-slate-500 font-mono text-[11px]">System Audit</span>
      </div>

      <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Printed: 27-Aug-2026</span>
        <span>From Date: {fromDate} To Date: {toDate}</span>
        <span>Page 1 of 1</span>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
              <th className="py-2 px-2 normal-case w-[18%]">user</th>
              <th className="py-2 px-2 normal-case w-[18%]">date</th>
              <th className="py-2 px-2 normal-case w-[18%]">module</th>
              <th className="py-2 px-2 normal-case w-[24%]">action</th>
              <th className="py-2 px-2 normal-case w-[12%]">computer name</th>
              <th className="py-2 px-2 normal-case w-[10%] text-right pr-2">reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            <tr>
              <td colSpan={6} className="py-1.5 px-2 font-bold underline bg-slate-50 text-slate-900">
                Branch : Southern Olive Oil Products S.A.R.L
              </td>
            </tr>
            {logEntries.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-2 font-bold text-slate-900">{log.user}</td>
                <td className="py-1.5 px-2 font-mono text-slate-600">{log.date}</td>
                <td className="py-1.5 px-2 font-semibold text-slate-800">{log.module}</td>
                <td className="py-1.5 px-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action.includes('Void')
                        ? 'bg-amber-100 text-amber-800'
                        : log.action.includes('Save')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="py-1.5 px-2 font-mono text-slate-600">{log.computer}</td>
                <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 pr-2">
                  {log.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Total Logged Actions: {logEntries.length}</span>
        <span>Security Level: Full Audit Trail Enabled</span>
      </div>
    </div>
  );
};
