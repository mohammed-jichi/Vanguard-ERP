import React from 'react';

interface FallbackMeterReportProps {
  fromDate?: string;
  toDate?: string;
}

export const FallbackMeterReport: React.FC<FallbackMeterReportProps> = ({ fromDate, toDate }) => {
  return (
    <div className="w-full font-sans text-black overflow-x-auto print:overflow-visible bg-slate-100 print:bg-white py-6 print:py-0 flex justify-center">
      {/* The A4 Paper Simulator (794px width) */}
      <div className="report-wrapper transition-transform duration-200 origin-top bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px]">
        {/* Header Section */}
        <div className="text-blue-700 font-bold text-[12px] mb-4">
          Southern Olive Oil Products S.A.R.L
        </div>
        
        <div className="text-center font-bold text-[12px] mb-4">
          Meter Report
        </div>
        
        <div className="flex justify-between items-center text-[11px] font-bold mb-1">
          <div>27-Aug-2026</div>
          <div className="flex gap-4">
            <span>From Date: {fromDate || '01-Aug-2026'}</span>
            <span>To Date: {toDate || '27-Aug-2026'}</span>
          </div>
          <div>Page 1 of 4</div>
        </div>

        {/* Table Header with thick borders */}
        <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
          <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] font-bold text-black">
            <div>Branch Name</div>
            <div>Date</div>
            <div>By Employee</div>
            <div>To Employee</div>
          </div>
        </div>

        {/* Main Branch Title */}
        <div className="text-[11px] mb-1">
          Branch: Southern Olive Oil Products S.A.R.L
        </div>

        {/* EOD Group: 01-Aug-2026 */}
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>EOD Date</div>
          <div>01-Aug-2026</div>
          <div></div>
          <div></div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>01-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>01-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>

        {/* EOD Group: 02-Aug-2026 */}
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1 mt-2">
          <div>EOD Date</div>
          <div>02-Aug-2026</div>
          <div></div>
          <div></div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>02-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>02-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>02-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>02-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>

        {/* EOD Group: 03-Aug-2026 */}
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1 mt-2">
          <div>EOD Date</div>
          <div>03-Aug-2026</div>
          <div></div>
          <div></div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>03-08-2026 00.00.00</div>
          <div>Hiba Aloulou</div>
          <div>Server Hiba Aloulou</div>
        </div>
        <div className="grid grid-cols-[220px_150px_150px_1fr] gap-2 text-[11px] mb-1">
          <div>Southern Olive Oil Products S.A.R.L</div>
          <div>03-08-2026 00.00.00</div>
          <div>Mahdi</div>
          <div>Server Hiba Aloulou</div>
        </div>
      </div>
    </div>
  );
};
