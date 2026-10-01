import React from 'react';
import { StandardReportHeader, StandardReportFooter } from '../UnifiedPrintableReportSheet';

interface FallbackNoSaleProps {
  fromDate?: string;
  toDate?: string;
}

export const FallbackNoSale: React.FC<FallbackNoSaleProps> = ({ fromDate, toDate }) => {
  return (
    <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 print:bg-white py-6 print:py-0 flex justify-center">
      {/* The A4 Paper Simulator (794px width) */}
      <div className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]">
        {/* Standardized 3-Zone Corporate Header */}
        <StandardReportHeader
          companyName="Southern Olive Oil S.A.R.L."
          hqAddress="Choueifat Central Highway, Lebanon"
          companyWebsite="www.southernolive-lb.com"
          hqPhone="Tel / Support: +961 05 430 000"
          printDate="27-Aug-2026"
          reportTitle="No Sale Report"
          periodText={`Period: ${fromDate || '2026-01-01'} - ${toDate || '2026-03-31'}`}
          facilityName="Facility: Choueifat Main Plant"
          facilityAddress="Industrial Zone, Old Saida Rd"
          facilityDirect="Dispatch / Cell: +961 70 000000"
          pageInfo="Page 1 of 1"
        />

        {/* Table Header with thick borders */}
        <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
          <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] font-bold text-black">
            <div>Employee Name</div>
            <div>Date</div>
            <div className="text-right pr-4">Workstation</div>
          </div>
        </div>

        {/* Main Branch Title */}
        <div className="text-[11px] mb-2 font-bold">
          Facility: Choueifat Main Plant
        </div>

        {/* EOD Group: 01-Jan-26 */}
        <div className="text-[11px] font-bold ml-12 mb-2 mt-2">
          EOD Date:01-Jan-26
        </div>
        
        <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] mb-1">
          <div>Ricky</div>
          <div>01/01/2026 6.23 PM</div>
          <div className="text-right pr-8">1</div>
        </div>
        
        <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] mb-1">
          <div>Cashier R</div>
          <div>01/01/2026 4.00 PM</div>
          <div className="text-right pr-8">1</div>
        </div>

        {/* EOD Group: 24-Feb-26 */}
        <div className="text-[11px] font-bold ml-12 mb-2 mt-4">
          EOD Date:24-Feb-26
        </div>
        
        <div className="grid grid-cols-[300px_1fr_150px] gap-2 text-[11px] mb-1">
          <div>Cashier N2</div>
          <div>24/02/2026 1.15 PM</div>
          <div className="text-right pr-8">1</div>
        </div>

        {/* Standardized Corporate Printable Footer */}
        <StandardReportFooter
          reportCode="REP_S_00255"
          copyrightNotice="Copyright © 2026 Vanguard ERP. All Rights Reserved."
          websiteUrl="www.vanguard-erp.net"
        />
      </div>
    </div>
  );
};
