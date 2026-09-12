'use client';

import React from 'react';

interface SalesByCustomerByItemsTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  fromDate?: string;
  toDate?: string;
  showRate?: boolean;
  groupByDate?: boolean;
  useUnitCost?: boolean;
  topN?: number;
}

export const SalesByCustomerByItemsTemplate: React.FC<SalesByCustomerByItemsTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Sales By Customer By Items',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  showRate = false,
  groupByDate = true,
  useUnitCost = false,
  topN = 10,
}) => {
  const isDaily = reportTitle.toLowerCase().includes('daily');
  const isNotSold = reportTitle.toLowerCase().includes('not sold');
  const isSerial = reportTitle.toLowerCase().includes('serial');
  const isTopSold = reportTitle.toLowerCase().includes('top');
  const isCategoryOrDiv = reportTitle.toLowerCase().includes('categor') || reportTitle.toLowerCase().includes('division') || reportTitle.toLowerCase().includes('group');

  const defaultItems = [
    { rank: 1, customer: 'Al-Baraka Supermarket S.A.R.L', itemCode: 'OIL-001', itemName: 'Extra Virgin Olive Oil 17.5L Standard Product', qty: 25, unitPrice: 110.00, totalValue: 2750.00, cost: 85.00, date: '01-Aug-2026' },
    { rank: 2, customer: 'Al-Baraka Supermarket S.A.R.L', itemCode: 'OIL-002', itemName: 'Extra Virgin Olive Oil 1L Standard Product Standard Product', qty: 120, unitPrice: 8.50, totalValue: 1020.00, cost: 6.20, date: '02-Aug-2026' },
    { rank: 3, customer: 'Karem Assaf Grocery', itemCode: 'OIL-001', itemName: 'Extra Virgin Olive Oil 17.5L Standard Product', qty: 15, unitPrice: 110.00, totalValue: 1650.00, cost: 85.00, date: '03-Aug-2026' },
    { rank: 4, customer: 'Karem Assaf Grocery', itemCode: 'OIL-004', itemName: 'Molasses Pomegranate Molasses Local 500 ml', qty: 60, unitPrice: 6.00, totalValue: 360.00, cost: 4.10, date: '04-Aug-2026' },
    { rank: 5, customer: 'Ahmad Al-Hajj Wholesale', itemCode: 'OIL-001', itemName: 'Extra Virgin Olive Oil 17.5L Standard Product', qty: 40, unitPrice: 110.00, totalValue: 4400.00, cost: 85.00, date: '05-Aug-2026' },
    { rank: 6, customer: 'Ahmad Al-Hajj Wholesale', itemCode: 'OIL-003', itemName: 'Standard Product Local gStandard Product Standard ProductOlive Oil KgStandard Product', qty: 30, unitPrice: 18.00, totalValue: 540.00, cost: 13.50, date: '06-Aug-2026' },
  ];

  const notSoldItems = [
    { itemCode: 'SP-109', itemName: 'Local Zaatar Standard ProductKgStandard Product 500g', category: 'Herbal Preserves', lastSold: '14-Jun-2026', stockOnHand: 140, unitCost: '$3.20' },
    { itemCode: 'SP-204', itemName: 'Standard Product Standard Product Standard Product Local 250 ml', category: 'Distilled Water', lastSold: '22-May-2026', stockOnHand: 85, unitCost: '$2.80' },
    { itemCode: 'SP-311', itemName: 'Jam Fig Standard ProductWalnut 400g', category: 'Confectionery', lastSold: '02-Jul-2026', stockOnHand: 60, unitCost: '$4.10' },
  ];

  const displayedItems = isTopSold ? defaultItems.slice(0, topN) : defaultItems;

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Product Sales Management
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        {reportTitle} {isTopSold ? `(Top ${topN})` : ''}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Printed: {executionDate}</span>
        <span>{dynamicPeriodText || `From Date: ${fromDate} To Date: ${toDate}`}</span>
        <span>Page 1 of 1</span>
      </div>

      {isNotSold ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                <th className="py-2 px-2 normal-case w-[15%]">item code</th>
                <th className="py-2 px-2 normal-case w-[35%]">item description</th>
                <th className="py-2 px-2 normal-case w-[20%]">category</th>
                <th className="py-2 px-2 normal-case w-[15%]">last sold date</th>
                <th className="py-2 px-2 normal-case w-[15%] text-right pr-2">stock on hand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {notSoldItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono font-bold text-slate-900">{item.itemCode}</td>
                  <td className="py-2 px-2 text-slate-800 font-sans">{item.itemName}</td>
                  <td className="py-2 px-2 text-slate-600">{item.category}</td>
                  <td className="py-2 px-2 font-mono text-slate-500">{item.lastSold}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-red-700 pr-2">{item.stockOnHand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                {isTopSold && <th className="py-2 px-2 normal-case w-[6%] text-center">#</th>}
                {groupByDate && <th className="py-2 px-2 normal-case w-[12%]">date</th>}
                <th className="py-2 px-2 normal-case w-[22%]">customer name</th>
                <th className="py-2 px-2 normal-case w-[12%]">item code</th>
                <th className="py-2 px-2 normal-case w-[24%]">item description</th>
                <th className="py-2 px-2 normal-case w-[8%] text-center">qty</th>
                {useUnitCost && <th className="py-2 px-2 normal-case w-[10%] text-right">unit cost ($)</th>}
                <th className="py-2 px-2 normal-case w-[10%] text-right">unit price ($)</th>
                <th className="py-2 px-2 normal-case w-[12%] text-right">total ($)</th>
                {showRate && <th className="py-2 px-2 normal-case w-[14%] text-right pr-2">total (L.L.)</th>}
                {useUnitCost && <th className="py-2 px-2 normal-case w-[10%] text-right pr-2">profit ($)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {displayedItems.map((row, idx) => {
                const totalLL = (row.totalValue * 89500).toLocaleString();
                const profit = ((row.unitPrice - row.cost) * row.qty).toFixed(2);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    {isTopSold && <td className="py-2 px-2 text-center font-bold text-[#195a96]">{row.rank}</td>}
                    {groupByDate && <td className="py-2 px-2 font-mono text-slate-600">{row.date}</td>}
                    <td className="py-2 px-2 font-bold text-slate-900">{row.customer}</td>
                    <td className="py-2 px-2 font-mono text-slate-600">{row.itemCode}</td>
                    <td className="py-2 px-2 font-sans text-slate-800">{row.itemName}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold">{row.qty}</td>
                    {useUnitCost && <td className="py-2 px-2 text-right font-mono text-slate-500">${row.cost.toFixed(2)}</td>}
                    <td className="py-2 px-2 text-right font-mono text-slate-700">${row.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800">${row.totalValue.toFixed(2)}</td>
                    {showRate && <td className="py-2 px-2 text-right font-mono text-slate-700 pr-2">{totalLL}</td>}
                    {useUnitCost && <td className="py-2 px-2 text-right font-mono font-bold text-blue-700 pr-2">${profit}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Total Records Displayed: {isNotSold ? notSoldItems.length : defaultItems.length}</span>
        <span>
          Total Value:{' '}
          {isNotSold
            ? 'Stagnant Stock Value: $1,132.00'
            : '$10,720.00 Gross Sales'}
        </span>
      </div>
    </div>
  );
};
