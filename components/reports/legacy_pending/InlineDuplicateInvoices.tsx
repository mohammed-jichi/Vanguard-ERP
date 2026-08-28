import React from 'react';

interface InlineDuplicateInvoicesProps {
  fromDate?: string;
  toDate?: string;
}

export const InlineDuplicateInvoices: React.FC<InlineDuplicateInvoicesProps> = ({ fromDate, toDate }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white font-sans text-black">
      {/* Header */}
      <div className="text-blue-700 font-bold text-[13px] mb-2">
        Southern Olive Oil Products S.A.R.L
      </div>
      
      <div className="text-center font-bold text-[13px] mb-4">
        Duplicate Invoices Report
      </div>
      
      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
        <div>27-Aug-2026</div>
        <div className="flex gap-4">
          <span>From Date: {fromDate || '01-Aug-2026'}</span>
          <span>To Date: {toDate || '27-Aug-2026'}</span>
        </div>
        <div>Page 1 10</div>
      </div>

      {/* Table Header with thick borders */}
      <div className="border-t-[2px] border-b-[2px] border-black py-1 mb-2">
        <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold">
          <div>Invoice #</div>
          <div>Date</div>
          <div>Time</div>
          <div>Order #</div>
          <div className="text-center">Cust. #</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Discount</div>
          <div className="text-center">TaxPay Type</div>
          <div className="text-right">Total</div>
          <div className="text-right">Print#</div>
        </div>
      </div>

      {/* Branch Info */}
      <div className="text-[11px] font-bold mb-4">
        Branch: Southern Olive Oil Products S.A.R.L
      </div>

      {/* Group 1 Header */}
      <div className="text-[11px] font-bold mb-2">
        Sale Date: 2026-08-01
      </div>

      {/* Data Rows Group 1 */}
      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
        <div>102971</div><div>01-Aug-2026</div><div>10:57</div><div></div><div className="text-center">1</div><div className="text-right">1260000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">1260000.00</div><div className="text-right">2</div>
      </div>
      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
        <div>102972</div><div>01-Aug-2026</div><div>11:42</div><div></div><div className="text-center">1</div><div className="text-right">1620000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">1620000.00</div><div className="text-right">2</div>
      </div>
      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
        <div>102974</div><div>01-Aug-2026</div><div>11:50</div><div></div><div className="text-center">1</div><div className="text-right">9000000.00</div><div className="text-right">900000.00</div><div className="text-center">0.00CASH</div><div className="text-right">8100000.00</div><div className="text-right">2</div>
      </div>
      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
        <div>102976</div><div>01-Aug-2026</div><div>12:09</div><div></div><div className="text-center">1</div><div className="text-right">990000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">990000.00</div><div className="text-right">2</div>
      </div>
      <div className="grid grid-cols-[60px_80px_40px_50px_50px_1fr_80px_90px_1fr_50px] gap-2 text-[11px] font-bold mb-1">
        <div>102979</div><div>01-Aug-2026</div><div>12:46</div><div></div><div className="text-center">1</div><div className="text-right">12225000.00</div><div className="text-right">0.00</div><div className="text-center">0.00CASH</div><div className="text-right">12225000.00</div><div className="text-right">2</div>
      </div>

      {/* Group 2 Header */}
      <div className="text-[11px] font-bold mt-4 mb-2">
        Sale Date: 2026-08-02
      </div>
    </div>
  );
};
