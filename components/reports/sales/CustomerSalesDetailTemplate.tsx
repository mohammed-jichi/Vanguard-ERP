'use client';

import React from 'react';

interface CustomerSalesDetailTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  fromDate?: string;
  toDate?: string;
  topN?: number;
}

export const CustomerSalesDetailTemplate: React.FC<CustomerSalesDetailTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Sales by customer In Detail',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  topN = 10,
}) => {
  const isZoneReport = reportTitle.toLowerCase().includes('zone');
  const isDeliverySummary = reportTitle.toLowerCase().includes('delivery');
  const isDriverHistory = reportTitle.toLowerCase().includes('driver');
  const isTopCustomers = reportTitle.toLowerCase().includes('top');

  // 1. Sales by Zone
  const zoneRows = [
    { zone: 'South Lebanon Governorate', city: 'Tyr (Standard Product)', topSku: 'EVOO 16L Metallic Tin', units: '480 Tins', revenue: '$33,600.00', share: '42.5%' },
    { zone: 'South Lebanon Governorate', city: 'Saida (Standard Product)', topSku: 'EVOO 1L Glass Bottle', units: '1,850 Bottles', revenue: '$15,725.00', share: '19.9%' },
    { zone: 'Nabatieh Governorate', city: 'Nabatieh (Standard Product)', topSku: 'EVOO 16L Metallic Tin', units: '210 Tins', revenue: '$14,700.00', share: '18.6%' },
    { zone: 'Beirut Governorate', city: 'Beirut Central District', topSku: 'Organic EVOO 500ml Marasca', units: '1,400 Bottles', revenue: '$11,900.00', share: '15.1%' },
    { zone: 'Mount Lebanon', city: 'Chouf / Aley', topSku: 'EVOO 1L Glass Bottle', units: '380 Bottles', revenue: '$3,230.00', share: '3.9%' },
  ];

  // 2. Delivery Orders Summary
  const deliveryRows = [
    { orderId: 'DO-8891', customer: 'Al-Baraka Supermarket', destination: 'Choueifat Blvd', driver: 'Ziad Kassis', status: 'Delivered', amount: '$1,450.00' },
    { orderId: 'DO-8892', customer: 'Karem Assaf Grocery', destination: 'Tyre Souk', driver: 'Rabih Ammar', status: 'Delivered', amount: '$3,820.00' },
    { orderId: 'DO-8893', customer: 'Ahmad Al-Hajj Wholesale', destination: 'Sidon Boulevard', driver: 'Rabih Ammar', status: 'In Transit', amount: '$2,100.00' },
    { orderId: 'DO-8894', customer: 'Hamra Gourmet Store', destination: 'Beirut Hamra', driver: 'Ziad Kassis', status: 'Delivered', amount: '$890.00' },
  ];

  // 3. Customer Detail Default
  const customerDetailRows = [
    { customer: 'Al-Baraka Supermarket S.A.R.L', invoice: 'INV-103350', date: '12-Aug-2026', itemsCount: 14, subtotal: '$2,800.00', discount: '$100.00', netTotal: '$2,700.00' },
    { customer: 'Al-Baraka Supermarket S.A.R.L', invoice: 'INV-103395', date: '22-Aug-2026', itemsCount: 8, subtotal: '$1,550.00', discount: '$50.00', netTotal: '$1,500.00' },
    { customer: 'Karem Assaf Grocery', invoice: 'INV-103310', date: '08-Aug-2026', itemsCount: 22, subtotal: '$3,820.00', discount: '$0.00', netTotal: '$3,820.00' },
    { customer: 'Ahmad Al-Hajj Wholesale', invoice: 'INV-103280', date: '05-Aug-2026', itemsCount: 12, subtotal: '$2,100.00', discount: '$50.00', netTotal: '$2,050.00' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Commercial Distribution & Logistics
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        {reportTitle}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Printed: {executionDate}</span>
        <span>From Date: {fromDate} To Date: {toDate}</span>
        <span>Page 1 of 1</span>
      </div>

      {isZoneReport ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                <th className="py-2 px-2 normal-case w-[25%]">governorate / zone</th>
                <th className="py-2 px-2 normal-case w-[20%]">primary city</th>
                <th className="py-2 px-2 normal-case w-[25%]">top selling sku</th>
                <th className="py-2 px-2 normal-case w-[12%] text-center">units sold</th>
                <th className="py-2 px-2 normal-case w-[18%] text-right pr-2">gross sales ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {zoneRows.map((z, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-bold text-slate-900">{z.zone}</td>
                  <td className="py-2 px-2 text-slate-700">{z.city}</td>
                  <td className="py-2 px-2 font-medium text-slate-800">{z.topSku}</td>
                  <td className="py-2 px-2 text-center font-mono">{z.units}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800 pr-2">{z.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isDeliverySummary || isDriverHistory ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full table-fixed text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
                <th className="py-2 px-2 normal-case w-[15%]">order id</th>
                <th className="py-2 px-2 normal-case w-[30%]">customer</th>
                <th className="py-2 px-2 normal-case w-[22%]">destination</th>
                <th className="py-2 px-2 normal-case w-[18%]">driver</th>
                <th className="py-2 px-2 normal-case w-[15%] text-right pr-2">order amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {deliveryRows.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono font-bold text-blue-700">{d.orderId}</td>
                  <td className="py-2 px-2 font-bold text-slate-900">{d.customer}</td>
                  <td className="py-2 px-2 text-slate-700">{d.destination}</td>
                  <td className="py-2 px-2 font-medium text-slate-800">{d.driver}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800 pr-2">{d.amount}</td>
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
                <th className="py-2 px-2 normal-case w-[32%]">customer name</th>
                <th className="py-2 px-2 normal-case w-[15%]">invoice #</th>
                <th className="py-2 px-2 normal-case w-[15%]">date</th>
                <th className="py-2 px-2 normal-case w-[12%] text-center">items</th>
                <th className="py-2 px-2 normal-case w-[13%] text-right">subtotal ($)</th>
                <th className="py-2 px-2 normal-case w-[13%] text-right pr-2">net total ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
              {(isTopCustomers && topN ? customerDetailRows.slice(0, topN) : customerDetailRows).map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-bold text-slate-900">{c.customer}</td>
                  <td className="py-2 px-2 font-mono text-slate-600">{c.invoice}</td>
                  <td className="py-2 px-2 font-mono text-slate-600">{c.date}</td>
                  <td className="py-2 px-2 text-center font-mono">{c.itemsCount}</td>
                  <td className="py-2 px-2 text-right font-mono">{c.subtotal}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-emerald-800 pr-2">{c.netTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Logistics Provider: SuperSonic Fleet Services</span>
        <span>Total Verified Ledger: 100% Reconciled</span>
      </div>
    </div>
  );
};
