import React, { useState } from 'react';

export const TransactionsByCustomersDetailsTemplate = () => {
  const [uiSummary, setUiSummary] = useState(true);
  const [activeSummary, setActiveSummary] = useState(true);

  const handleFilter = () => setActiveSummary(uiSummary);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1000px]">
            <select 
              className="w-full lg:col-span-3 border border-slate-300 rounded p-1.5 text-[13px] text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              defaultValue="Transactions by Customers details"
              onChange={(e) => {
                 if ((window as any).setSelectedReport) {
                   (window as any).setSelectedReport(e.target.value);
                 }
              }}
            >
              <option>Transactions by Salesman</option>
              <option>Transactions by Date</option>
              <option>Transactions by Employees by Payment</option>
              <option>Transactions by Customers by Employee</option>
              <option>Transactions by Invoice Number</option>
              <option>Duplicate Invoices</option>
              <option>Transactions by Date by Payments</option>
              <option>Transactions by Customers</option>
              <option>Transactions by Customers by Groups</option>
              <option>Transactions by Customers details</option>
              <option>Transactions by Workstation</option>
              <option>Transactions by Employees</option>
              <option>Transactions By Source</option>
            </select>
            <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><option>This Year</option></select>
            <input type="text" defaultValue="2026" className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            <div className="hidden lg:block"></div>
            <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><option>Southern Olive Oil S.A.R.L</option></select>
            <select className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><option>All Invoices</option></select>
            <input type="text" defaultValue="Hussein Daik" className="w-full border border-slate-300 rounded p-1.5 text-[13px] text-slate-900 font-medium bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            <div className="flex items-center gap-2 mt-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={uiSummary} onChange={(e) => setUiSummary(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Summary
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[150px]">
            <button onClick={handleFilter} className="px-4 py-2 bg-[#475569] text-white rounded text-[13px] font-bold hover:bg-slate-700 w-full transition-colors cursor-pointer">Filter Report</button>
            <button className="px-4 py-2 bg-[#5e3b3b] text-white rounded text-[13px] font-bold hover:bg-red-900 w-full transition-colors cursor-pointer">Reset Filters</button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] bg-white font-sans text-black mt-2">
        <div className="report-wrapper transition-transform duration-200 origin-top">
          <div className="text-blue-700 font-bold text-[12px] mb-2">Southern Olive Oil S.A.R.L</div>
          <div className="text-center font-bold text-[12px] mb-4">Transactions by Customers Details</div>
          <div className="flex justify-between items-center text-[11px] font-bold w-full">
            <div>28-Aug-26</div>
            <div>From Date: 01-Jan-2026 To Date: 28-Aug-2026</div>
            <div>Page 1 of 2</div>
          </div>
          <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
            <table className="w-full min-w-[1000px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
              <thead>
                <tr className="font-bold text-black border-b border-black">
                  <th className="py-1 px-1 text-left">Invoice</th>
                  <th className="py-1 px-1 text-left">Date</th>
                  <th className="py-1 px-1 text-left">Time</th>
                  <th className="py-1 px-1 text-left">Order #</th>
                  <th className="py-1 px-1 text-left">Emplyee Name</th>
                  <th className="py-1 px-1 text-right">Disc</th>
                  <th className="py-1 px-1 text-right">Tax</th>
                  <th className="py-1 px-1 text-right">Total</th>
                  <th className="py-1 px-1 text-right">Item Name</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold"><td colSpan={9} className="py-1 px-1">Southern Olive Oil S.A.R.L</td></tr>
                <tr className="font-bold"><td colSpan={9} className="py-1 px-1">Hussein Daik</td></tr>
                <tr className="font-bold"><td colSpan={9} className="py-1 px-1">19-Feb-2026</td></tr>
                <tr>
                    <td className="py-1 px-1">4000022</td>
                    <td className="py-1 px-1">19-Feb-2026</td>
                    <td className="py-1 px-1">12:52</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1">Mahdi</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right"></td>
                    <td className="py-1 px-1 text-right">706,968,000.00</td>
                    <td className="py-1 px-1 text-right"></td>
                </tr>
                {!activeSummary && (
                  <>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">القنية زيت زيتون خضير بلدي 1500 مل*6</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق خل ابيض 500مل*12قنينة</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق خل تفاح بلدي 500مل*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق خل حصرم 500مل*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق دبس خروب 1300غ*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق دبس رمان 500 مل*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق رب بندورة 650غ*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق رعتر أحمر حلبي 500غ*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق رعتر بلدي 600غ*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق زيتون اخضر محشي جزر و</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق زيتون اسود أول 650غ*12</td></tr>
                    <tr><td colSpan={8}></td><td className="py-1 px-1 text-right">صندوق سماق 350غ*12</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="report-footer flex justify-between items-center text-[10px] font-bold w-full mt-12 border-t border-black pt-1">
            <div className="text-black">REP_S_00247</div>
            <div className="text-black text-center flex-1">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
            <div className="text-right"><a href="https://www.vanguarderp.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer">www.vanguarderp.com</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};
