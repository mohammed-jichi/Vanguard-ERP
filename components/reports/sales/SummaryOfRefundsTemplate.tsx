'use client';

import React from 'react';

interface SummaryOfRefundsTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  fromDate?: string;
  toDate?: string;
  reportTitle?: string;
}

export const SummaryOfRefundsTemplate: React.FC<SummaryOfRefundsTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  reportTitle = 'Summary of refunds',
}) => {
  const refunds = [
    {
      branch: 'Main Branch',
      eodDate: '11-08-2026',
      invoiceNumber: '103098',
      customer: 'Direct Retail Customer',
      qty: '-0.90',
      description: 'Fine Coriander Bulk Kg',
      totalPrice: '-630,000.00',
      subTotal: '-630,000.00',
      discount: '0.00',
      tax: '0.00',
      grandTotal: '-630,000.00',
    },
    {
      branch: 'Main Branch',
      eodDate: '14-08-2026',
      invoiceNumber: '103142',
      customer: 'Al-Hajj Grocery',
      qty: '-1.00',
      description: 'Extra Virgin Olive Oil 1L',
      totalPrice: '-360,000.00',
      subTotal: '-360,000.00',
      discount: '0.00',
      tax: '0.00',
      grandTotal: '-360,000.00',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Vanguard ERP - Sales Control
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        {reportTitle}
      </div>

      <div className="flex justify-between items-center text-[11px] mb-3 font-mono border-b border-black pb-1.5 text-slate-700">
        <div>Printed: {executionDate}</div>
        <div>
          <span>from date: {fromDate}</span> <span className="ml-4">to date: {toDate}</span>
        </div>
        <div>Page 1 of 1</div>
      </div>

      {/* Refunds Content */}
      <div className="space-y-6">
        {refunds.map((ref, idx) => (
          <div key={idx} className="border-b border-slate-300 pb-4">
            <div className="flex justify-between items-start text-[11px] font-mono mb-2">
              <div className="space-y-0.5">
                <div>
                  <strong className="underline text-slate-900">Branch name:</strong>{' '}
                  <span className="font-semibold">{ref.branch}</span>
                </div>
                <div>
                  <strong className="text-slate-800">EOD date:</strong> {ref.eodDate}
                </div>
                <div>
                  <strong className="text-slate-800">Invoice number:</strong> {ref.invoiceNumber}
                </div>
              </div>
              <div>
                <strong className="text-slate-800">Customer:</strong> {ref.customer}
              </div>
            </div>

            <table className="w-full text-left border-collapse text-[11px] mb-2">
              <thead>
                <tr className="border-b border-black font-bold text-black leading-tight bg-slate-50">
                  <th className="py-1 px-2 normal-case w-[20%] text-center">qty</th>
                  <th className="py-1 px-2 normal-case w-[55%]">description</th>
                  <th className="py-1 px-2 normal-case w-[25%] text-right pr-4">total price (LBP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr className="text-red-700 font-bold">
                  <td className="py-1 px-2 text-center">{ref.qty}</td>
                  <td className="py-1 px-2 font-sans">{ref.description}</td>
                  <td className="py-1 px-2 text-right pr-4">{ref.totalPrice}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end pt-1">
              <div className="w-64 text-[11px] font-mono space-y-0.5 bg-slate-50 p-2 rounded border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sub total:</span>{' '}
                  <strong className="text-red-700">{ref.subTotal}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Discount:</span> <span>{ref.discount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax:</span> <span>{ref.tax}</span>
                </div>
                <div className="flex justify-between border-t border-black pt-0.5 font-bold">
                  <span>Grand total:</span>{' '}
                  <strong className="text-red-700">{ref.grandTotal}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Box */}
      <div className="pt-4 border-t-2 border-black flex justify-between items-end mt-4">
        <div className="text-[10.5px] font-mono text-slate-600">
          <div>Printed from Sales Control Reports</div>
          <div>Period: {fromDate} to {toDate}</div>
        </div>
        <div className="w-64 text-xs font-mono space-y-1 bg-red-50/50 p-3 rounded border border-red-200">
          <div className="flex justify-between">
            <span className="text-slate-700">Total refunds:</span>{' '}
            <strong className="text-red-700">-990,000.00 LBP</strong>
          </div>
          <div className="flex justify-between border-t border-red-300 pt-1 font-bold text-sm">
            <span>Net refund total:</span>{' '}
            <strong className="text-red-700">-990,000.00 LBP</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
