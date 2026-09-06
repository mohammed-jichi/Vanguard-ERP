'use client';

import React from 'react';

interface TransactionsOnHoldTemplateProps {
  fromDate?: string;
  toDate?: string;
}

export const TransactionsOnHoldTemplate: React.FC<TransactionsOnHoldTemplateProps> = ({
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
}) => {
  const onHoldItems = [
    {
      date: '14/12/2025 13.39.32',
      workstation: '1 Showroom 1',
      dateHeader: '14 December 2025',
      employeeId: '2',
      employeeName: 'Cashier R',
      qty: '1.0',
      description: 'Milk Tatra 400 g',
      unitPrice: '340,000.0',
      totalPrice: '340,000.0',
      totalAmount: '1,435,000.0 LBP',
    },
    {
      date: '18/12/2025 15.22.10',
      workstation: '2 Point of Sale',
      dateHeader: '18 December 2025',
      employeeId: '4',
      employeeName: 'Cashier M',
      qty: '2.0',
      description: 'Extra Virgin Olive Oil 500 ml',
      unitPrice: '250,000.0',
      totalPrice: '500,000.0',
      totalAmount: '500,000.0 LBP',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Top Header Area */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Internal Control Reports
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        History of Transactions on Hold
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono border-b border-black pb-1 text-slate-800 mb-4">
        <span>Printed: 27-Aug-2026</span>
        <span>From Date: {fromDate} To Date: {toDate}</span>
        <span>Page 1 of 1</span>
      </div>

      {/* Tables for each hold session */}
      <div className="space-y-6">
        {onHoldItems.map((item, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-white shadow-xs">
            <div className="border-b border-slate-300 pb-2 text-[11px] font-mono space-y-1 mb-2">
              <div>
                <strong>Workstation :</strong> {item.workstation} | <strong>Date:</strong> {item.dateHeader}
              </div>
              <div className="flex gap-6 text-slate-700">
                <span><strong>Employee ID:</strong> {item.employeeId}</span>
                <span><strong>Employee Name:</strong> {item.employeeName}</span>
              </div>
            </div>

            <table className="w-full table-fixed text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-black font-bold text-black leading-tight bg-slate-50">
                  <th className="py-1.5 px-2 normal-case w-[24%]">date</th>
                  <th className="py-1.5 px-2 normal-case w-[40%]">qty description</th>
                  <th className="py-1.5 px-2 normal-case w-[18%] text-right">unit price (LBP)</th>
                  <th className="py-1.5 px-2 normal-case w-[18%] text-right">total price (LBP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[10.5px] font-mono">
                <tr>
                  <td className="py-1.5 px-2">{item.date}</td>
                  <td className="py-1.5 px-2 font-bold font-sans">{item.qty} {item.description}</td>
                  <td className="py-1.5 px-2 text-right">{item.unitPrice}</td>
                  <td className="py-1.5 px-2 text-right font-bold text-slate-900">{item.totalPrice}</td>
                </tr>
              </tbody>
            </table>

            <div className="border-t border-black pt-2 flex justify-end font-mono font-bold text-xs mt-2">
              <span className="text-amber-800">Amount on hold: {item.totalAmount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Global Total */}
      <div className="border-t-2 border-black mt-6 pt-3 flex justify-between items-center text-xs font-mono font-bold">
        <span>Total Transactions on Hold: 2</span>
        <span>Consolidated Total: 1,935,000.0 LBP</span>
      </div>
    </div>
  );
};
