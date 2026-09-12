'use client';

import React from 'react';

interface DiscountSummaryTemplateProps {
  fromDate?: string;
  toDate?: string;
}

export const DiscountSummaryTemplate: React.FC<DiscountSummaryTemplateProps> = ({
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
}) => {
  const discountRecords = [
    {
      branch: 'Main Branch',
      managerDiscounts: '60,550,000.00',
      loyaltyDiscounts: '59,300,000.00',
      seasonalOffers: '39,713,558.18',
      totalDiscount: '159,563,558.18',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex justify-between items-start text-xs font-bold mb-1">
        <span className="text-blue-700 text-sm">Southern Olive Oil Products S.A.R.L</span>
        <span className="text-base text-slate-900 font-bold">Discount Summary Report</span>
        <span className="text-slate-500 font-mono text-[11px]">Financial & Sales Control</span>
      </div>

      <div className="flex justify-between items-center text-[10.5px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Printed: 27-Aug-2026</span>
        <span>From Date: {fromDate} To Date: {toDate}</span>
        <span>Page 1 of 1</span>
      </div>

      <div className="border border-black rounded overflow-hidden bg-white shadow-xs">
        <table className="w-full table-fixed text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black font-bold bg-slate-100 text-black">
              <th className="py-2 px-3 border-r border-black w-[40%] normal-case">branch / division</th>
              <th className="py-2 px-2 border-r border-black w-[15%] text-right normal-case">manager discounts (LBP)</th>
              <th className="py-2 px-2 border-r border-black w-[15%] text-right normal-case">loyalty discounts (LBP)</th>
              <th className="py-2 px-2 border-r border-black w-[15%] text-right normal-case">seasonal offers (LBP)</th>
              <th className="py-2 px-3 text-right font-bold w-[15%] normal-case">total discount (LBP)</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs divide-y divide-slate-200">
            {discountRecords.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-2 px-3 border-r border-black font-bold font-sans text-slate-900">
                  {item.branch}
                </td>
                <td className="py-2 px-2 border-r border-black text-right text-slate-700">
                  {item.managerDiscounts}
                </td>
                <td className="py-2 px-2 border-r border-black text-right text-slate-700">
                  {item.loyaltyDiscounts}
                </td>
                <td className="py-2 px-2 border-r border-black text-right text-slate-700">
                  {item.seasonalOffers}
                </td>
                <td className="py-2 px-3 text-right font-bold text-red-700">
                  {item.totalDiscount}
                </td>
              </tr>
            ))}
            <tr className="bg-blue-50 font-bold border-t-2 border-black">
              <td className="py-2 px-3 border-r border-black font-sans text-slate-900">
                Consolidated Total
              </td>
              <td className="py-2 px-2 border-r border-black text-right">
                60,550,000.00
              </td>
              <td className="py-2 px-2 border-r border-black text-right">
                59,300,000.00
              </td>
              <td className="py-2 px-2 border-r border-black text-right">
                39,713,558.18
              </td>
              <td className="py-2 px-3 text-right text-red-700 text-sm">
                159,563,558.18
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Discount Policy: Authorizations strictly recorded</span>
        <span>Currency: Lebanese Pound (LBP)</span>
      </div>
    </div>
  );
};
