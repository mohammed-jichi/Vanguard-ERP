'use client';

import React from 'react';

interface CustomerListStandardTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  filterStatus?: string;
}

export const CustomerListStandardTemplate: React.FC<CustomerListStandardTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Customer List Standard',
  filterStatus = 'All',
}) => {
  const allCustomers = [
    {
      name: 'Ahmad Al-Hajj',
      code: 'CUST-10021',
      phone: '+961 03 458 912',
      address: 'Sidon Main St.',
      group: 'Wholesales / Clients',
      balance: '$1,450.00',
      status: 'Active',
    },
    {
      name: 'Karem Assaf Grocery',
      code: 'CUST-10024',
      phone: '+961 07 721 004',
      address: 'Tyre Souk',
      group: 'Wholesales / Clients',
      balance: '$3,820.00',
      status: 'Active',
    },
    {
      name: 'Noura Haddad',
      code: 'CUST-10030',
      phone: '+961 70 882 119',
      address: 'Beirut Hamra',
      group: 'Wholesales / Clients',
      balance: '$0.00',
      status: 'New',
    },
    {
      name: 'Al-Baraka Supermarket S.A.R.L',
      code: 'CUST-10015',
      phone: '+961 01 820 441',
      address: 'Choueifat Commercial Blvd',
      group: 'Key Accounts',
      balance: '$8,240.00',
      status: 'Active',
    },
    {
      name: 'Marwan Chehab Store',
      code: 'CUST-10044',
      phone: '+961 05 430 112',
      address: 'Aley High Street',
      group: 'Retail Outlets',
      balance: '$920.00',
      status: 'Not Active',
    },
    {
      name: 'Ziad Al-Rifai Trading',
      code: 'CUST-10009',
      phone: '+961 03 991 228',
      address: 'Tripoli Al-Mina',
      group: 'Wholesales / Clients',
      balance: '$12,450.00',
      status: 'Blacklist',
    },
  ];

  // Filter based on report title
  const displayedCustomers = allCustomers.filter((c) => {
    if (reportTitle.toLowerCase().includes('not active')) return c.status === 'Not Active';
    if (reportTitle.toLowerCase().includes('new')) return c.status === 'New';
    if (reportTitle.toLowerCase().includes('black')) return c.status === 'Blacklist';
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-blue-700 font-bold text-[14px]">
          Southern Olive Oil Products S.A.R.L
        </div>
        <div className="text-right text-[11px] font-mono text-slate-500">
          Client Relationship & Accounts
        </div>
      </div>

      <div className="text-center font-bold text-[16px] text-slate-900 mb-2">
        {reportTitle}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono border-b border-black pb-1 mb-4 text-slate-800">
        <span>Printed: {executionDate}</span>
        <span>Grouping: Wholesales / Clients / Key Accounts</span>
        <span>Page 1 of 1</span>
      </div>

      {/* Customer Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
        <table className="w-full table-fixed text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-black font-bold text-black leading-tight bg-slate-100">
              <th className="py-2 px-2 normal-case w-[25%]">customer name</th>
              <th className="py-2 px-2 normal-case w-[13%]">code #</th>
              <th className="py-2 px-2 normal-case w-[17%]">phone</th>
              <th className="py-2 px-2 normal-case w-[20%]">address</th>
              <th className="py-2 px-2 normal-case w-[13%] text-center">status</th>
              <th className="py-2 px-2 normal-case w-[12%] text-right pr-2">balance ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-[10.5px]">
            {displayedCustomers.map((cust, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-2 font-bold text-slate-900">{cust.name}</td>
                <td className="py-1.5 px-2 font-mono text-slate-600">{cust.code}</td>
                <td className="py-1.5 px-2 font-mono text-slate-600">{cust.phone}</td>
                <td className="py-1.5 px-2 text-slate-700">{cust.address}</td>
                <td className="py-1.5 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      cust.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cust.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : cust.status === 'Not Active'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cust.status}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800 pr-2">
                  {cust.balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black mt-4 pt-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700">
        <span>Total Customers Displayed: {displayedCustomers.length}</span>
        <span>
          Total Receivables Balance:{' '}
          {displayedCustomers
            .reduce((acc, c) => acc + parseFloat(c.balance.replace(/[^0-9.-]+/g, '')), 0)
            .toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </span>
      </div>
    </div>
  );
};
