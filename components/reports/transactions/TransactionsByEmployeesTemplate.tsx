import React, { useState } from 'react';

export const TransactionsByEmployeesTemplate = () => {
  const [uiGroupedByServer, setUiGroupedByServer] = useState(false);
  const [uiRealDate, setUiRealDate] = useState(false);
  const [activeGroupedByServer, setActiveGroupedByServer] = useState(false);
  const [activeRealDate, setActiveRealDate] = useState(false);

  const handleFilter = () => {
    setActiveGroupedByServer(uiGroupedByServer);
    setActiveRealDate(uiRealDate);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="filters-container w-full max-w-[1400px] bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-[700px]">
            <select 
              className="w-full lg:col-span-2 border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"
              defaultValue="Transactions by Employees"
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
            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>First Quarter</option>
              <option>Second Quarter</option>
              <option>Third Quarter</option>
              <option>Fourth Quarter</option>
              <option>This Year</option>
              <option>Last Year</option>
              <option>Date Range</option>
              <option>EOD Date</option>
            </select>
            <input 
              type="text" 
              defaultValue="Aug, 2026" 
              className="w-full border border-slate-300 rounded p-1.5 !text-black !font-bold !bg-white !opacity-100 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              style={{ backgroundColor: '#ffffff', color: '#000000', opacity: 1, fontWeight: 700 }} 
            />
            
            <div className="flex flex-col gap-1 w-full mt-2 lg:col-span-2">
              <label className="text-[11px] font-bold text-slate-700">Server</label>
              <select className="w-full md:w-[340px] border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer">
                <option>All Servers</option>
                <option>Cashier N2</option>
                <option>Cashier NK</option>
                <option>Cashier R</option>
                <option>Hiba Aloulou</option>
              </select>
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer mt-1">
                <input type="checkbox" checked={uiGroupedByServer} onChange={(e) => setUiGroupedByServer(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Grouped By Server
              </label>
            </div>

            <select className="w-full border border-slate-400 rounded p-1.5 text-[13px] !text-black !font-bold !opacity-100 !bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm cursor-pointer"><option>Southern Olive Oil S.A.R.L</option></select>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-800 cursor-pointer">
                <input type="checkbox" checked={uiRealDate} onChange={(e) => setUiRealDate(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 accent-[#195a96]" />
                Real Date
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
          <div className="text-center font-bold text-[12px] mb-4">Transactions by Employees</div>
          <div className="flex justify-between items-center text-[11px] font-bold w-full">
            <div>28-Aug-26</div>
            <div>From Date: 01-Aug-2026 To Date: 28-Aug-2026</div>
            <div>Page 1 of 14</div>
          </div>
          <div className="w-full mt-1 overflow-x-auto print:overflow-visible pb-4">
            <table className="w-full min-w-[800px] border-collapse border-t border-b border-black text-[11px] whitespace-nowrap">
              <thead>
                <tr className="font-bold text-black border-b border-black">
                  <th className="py-1 px-1 text-left">Invoice#</th>
                  <th className="py-1 px-1 text-left">Date</th>
                  <th className="py-1 px-1 text-left">Time</th>
                  <th className="py-1 px-1 text-left">Customer ID</th>
                  <th className="py-1 px-1 text-left">Customer Name</th>
                  <th className="py-1 px-1 text-right">Amount</th>
                  <th className="py-1 px-1 text-right">Disc.</th>
                  <th className="py-1 px-1 text-right">Tax</th>
                  <th className="py-1 px-1 text-right">Total</th>
                  <th className="py-1 px-1 text-right">Print#</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold"><td colSpan={10} className="py-1 px-1">Southern Olive Oil S.A.R.L</td></tr>
                <tr className="font-bold"><td colSpan={10} className="py-1 px-1">Hiba Aloulou</td></tr>
                <tr>
                    <td className="py-1 px-1">102971</td>
                    <td className="py-1 px-1">01-Aug-2026</td>
                    <td className="py-1 px-1">10.57</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">1,260,000.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">1,260,000.00</td>
                    <td className="py-1 px-1 text-right">2</td>
                </tr>
                <tr>
                    <td className="py-1 px-1">102972</td>
                    <td className="py-1 px-1">01-Aug-2026</td>
                    <td className="py-1 px-1">11.42</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">1,620,000.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">1,620,000.00</td>
                    <td className="py-1 px-1 text-right">2</td>
                </tr>
                <tr>
                    <td className="py-1 px-1">102973</td>
                    <td className="py-1 px-1">01-Aug-2026</td>
                    <td className="py-1 px-1">11.45</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">90,000.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">90,000.00</td>
                    <td className="py-1 px-1 text-right">1</td>
                </tr>
                <tr>
                    <td className="py-1 px-1">102974</td>
                    <td className="py-1 px-1">01-Aug-2026</td>
                    <td className="py-1 px-1">11.50</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">9,000,000.00</td>
                    <td className="py-1 px-1 text-right">900,000.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">8,100,000.00</td>
                    <td className="py-1 px-1 text-right">2</td>
                </tr>
                <tr>
                    <td className="py-1 px-1">102975</td>
                    <td className="py-1 px-1">01-Aug-2026</td>
                    <td className="py-1 px-1">12.08</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">315,000.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">315,000.00</td>
                    <td className="py-1 px-1 text-right">1</td>
                </tr>
                 <tr>
                    <td className="py-1 px-1">102976</td>
                    <td className="py-1 px-1">01-Aug-2026</td>
                    <td className="py-1 px-1">12.09</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">990,000.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">990,000.00</td>
                    <td className="py-1 px-1 text-right">2</td>
                </tr>
                 <tr>
                    <td className="py-1 px-1">...</td>
                    <td className="py-1 px-1">...</td>
                    <td className="py-1 px-1">...</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">...</td>
                    <td className="py-1 px-1 text-right">...</td>
                    <td className="py-1 px-1 text-right">...</td>
                    <td className="py-1 px-1 text-right">...</td>
                    <td className="py-1 px-1 text-right">...</td>
                </tr>
                 <tr>
                    <td className="py-1 px-1">103287</td>
                    <td className="py-1 px-1">27-Aug-2026</td>
                    <td className="py-1 px-1">6.33 PM</td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1"></td>
                    <td className="py-1 px-1 text-right">27,000,000.00</td>
                    <td className="py-1 px-1 text-right">4,050,000.0</td>
                    <td className="py-1 px-1 text-right">0.00</td>
                    <td className="py-1 px-1 text-right">22,950,000.00</td>
                    <td className="py-1 px-1 text-right">2</td>
                </tr>
                <tr className="font-bold border-t border-black">
                    <td colSpan={8} className="py-1 px-1">Total Sales:</td>
                    <td className="py-1 px-1 text-right">1,370,226,600.00</td>
                    <td className="py-1 px-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

           {/* Matching the exact footer block from image_a576fc.png */}
          <div className="w-full mt-8">
            <div className="border-t-[2px] border-b-[1px] border-black py-0.5 mb-1 w-full"></div>
            <div className="flex justify-between items-center text-[10px] font-bold w-full">
              <div className="text-black">REP_S_00004</div>
              <div className="text-blue-700 text-center flex-1">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
              <div className="text-right"><a href="https://www.vanguarderp.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer">www.vanguarderp.com</a></div>
            </div>
            
            <div className="mt-8 text-[11px] font-bold">
               <div className="flex w-full">
                  <div className="w-[30%]">Total</div>
                  <div className="w-[70%] text-right pr-[8%] flex justify-end gap-8">
                     <span>1,425,857,050.00</span>
                     <span>55,630,450.</span>
                     <span>0.00</span>
                     <span>1,370,226,600.00</span>
                  </div>
               </div>
               <div className="flex w-full"><div className="w-[30%]">Gross Sales:</div><div className="w-[70%] pl-8">1,370,226,600.00</div></div>
               <div className="flex w-full"><div className="w-[30%]">Total Tax:</div><div className="w-[70%] pl-8 text-right pr-[85%]">0.00</div></div>
               <div className="flex w-full"><div className="w-[30%]">Total Service:</div><div className="w-[70%] pl-8 text-right pr-[85%]">0.00</div></div>
               <div className="flex w-full"><div className="w-[30%]">Total Discount:</div><div className="w-[70%] pl-8">55,630,450.00</div></div>
               <div className="flex w-full"><div className="w-[30%]">Net Sales:</div><div className="w-[70%] pl-8">1,370,226,600.00</div></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
