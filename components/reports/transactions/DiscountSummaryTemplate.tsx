'use client';

import React from 'react';
import { StandardReportHeader, StandardReportFooter } from '../UnifiedPrintableReportSheet';

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
      {/* Standardized 3-Zone Corporate Header */}
      <StandardReportHeader
        companyName="Southern Olive Oil S.A.R.L."
        hqAddress="Choueifat Central Highway, Lebanon"
        companyWebsite="www.southernolive-lb.com"
        hqPhone="Tel / Support: +961 05 430 000"
        printDate="27-Aug-2026"
        reportTitle="Discount Summary Report"
        periodText={`Period: ${fromDate} - ${toDate}`}
        facilityName="Facility: Choueifat Main Plant"
        facilityAddress="Industrial Zone, Old Saida Rd"
        facilityDirect="Dispatch / Cell: +961 70 000000"
        pageInfo="Page 1 of 1"
      />

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

      {/* Standardized Corporate Printable Footer */}
      <StandardReportFooter
        reportCode="REP_S_00250"
        copyrightNotice="Copyright © 2026 Vanguard ERP. All Rights Reserved."
        websiteUrl="www.vanguard-erp.net"
      />
    </div>
  );
};
