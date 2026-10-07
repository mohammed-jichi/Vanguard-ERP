'use client';

import React, { useMemo } from 'react';
import MasterReportDocument from '@/components/reports/MasterReportDocument';
import { ReportMetadata, ReportColumn, GrandTotal } from '@/types/reports';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

interface CustomerRecord {
  code: string;
  name: string;
  phone: string;
  address: string;
  group: string;
  status: string;
  balanceUsd: string;
  balanceLbp: string;
  branch: string;
  channel: string;
  date: string;
}

interface CustomerListStandardTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

const ALL_CUSTOMERS_MASTER: CustomerRecord[] = [];

export const CustomerListStandardTemplate: React.FC<CustomerListStandardTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Customer List Standard',
  branch = 'Southern Olive and Oil Products - Main',
  filterValues = {},
}) => {
  // Resolve canonical report code
  const reportCode = useMemo(() => {
    const t = reportTitle.toLowerCase();
    if (t.includes('not active')) return 'REP_S_00311';
    if (t.includes('new')) return 'REP_S_00312';
    if (t.includes('black')) return 'REP_S_00313';
    return 'REP_S_00310';
  }, [reportTitle]);

  // Filter according to both report route and filterValues
  const filteredCustomers = useMemo(() => {
    const titleLower = reportTitle.toLowerCase();
    let records = ALL_CUSTOMERS_MASTER;

    // 1. Report Route Filter
    if (titleLower.includes('not active')) {
      records = records.filter((c) => c.status === 'Not Active');
    } else if (titleLower.includes('new')) {
      records = records.filter((c) => c.status === 'New');
    } else if (titleLower.includes('black')) {
      records = records.filter((c) => c.status === 'Blacklist');
    }

    // 2. Pass through unified global report filter engine
    records = applyGlobalReportFilters(records, filterValues);

    // 3. Category grouping helper
    if (filterValues.customerCategory && filterValues.customerCategory !== 'ALL') {
      const cat = String(filterValues.customerCategory).toUpperCase();
      records = records.filter((c) => {
        if (cat === 'WHOLESALE') return c.group.includes('Wholesale');
        if (cat === 'RETAIL') return c.group.includes('Retail');
        if (cat === 'KEY_ACCOUNTS') return c.group.includes('Key Accounts');
        if (cat === 'HORECA') return c.group.includes('Horeca');
        return true;
      });
    }

    // 4. Balance specific filters
    if (filterValues.balanceFilter) {
      if (filterValues.balanceFilter === 'WITH_BALANCE') {
        records = records.filter((c) => parseFloat(c.balanceUsd.replace(/[^0-9.-]+/g, '')) > 0);
      } else if (filterValues.balanceFilter === 'ZERO_BALANCE') {
        records = records.filter((c) => parseFloat(c.balanceUsd.replace(/[^0-9.-]+/g, '')) === 0);
      }
    }

    if (filterValues.minOverdueBalance && Number(filterValues.minOverdueBalance) > 0) {
      const min = Number(filterValues.minOverdueBalance);
      records = records.filter((c) => parseFloat(c.balanceUsd.replace(/[^0-9.-]+/g, '')) >= min);
    }

    return records;
  }, [reportTitle, filterValues]);

  // Aggregate balance
  const totalBalanceNum = useMemo(() => {
    return filteredCustomers.reduce((acc, c) => acc + parseFloat(c.balanceUsd.replace(/[^0-9.-]+/g, '')), 0);
  }, [filteredCustomers]);

  const totalBalanceUsd = `$${totalBalanceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const meta: ReportMetadata = {
    reportTitle,
    companyName: 'Southern Olive Oil S.A.R.L.',
    subtitle: 'Lists & Customer Master Register',
    code: reportCode,
    dateRange: dynamicPeriodText || 'Master Directory Audit Window',
    generatedDate: executionDate,
    branch: branch,
    systemSource: 'Vanguard ERP Customer Master Kernel',
    pageNumber: 1,
    totalPages: 1,
  };

  const columns: ReportColumn<CustomerRecord>[] = [
    { key: 'code', label: 'Customer #', width: '12%', align: 'left', isMonospace: true },
    { key: 'name', label: 'Customer Name / Commercial Title', width: '26%', align: 'left' },
    { key: 'phone', label: 'Contact Phone', width: '14%', align: 'left', isMonospace: true },
    { key: 'address', label: 'Registered Delivery Address', width: '18%', align: 'left' },
    { key: 'group', label: 'Customer Classification', width: '16%', align: 'left' },
    {
      key: 'balanceUsd',
      label: 'AR Balance ($)',
      width: '14%',
      align: 'right',
      isMonospace: true,
      render: (row) => (
        <span className={parseFloat(row.balanceUsd.replace(/[^0-9.-]+/g, '')) > 0 ? 'text-amber-950 font-bold' : 'text-slate-600'}>
          {row.balanceUsd}
        </span>
      ),
    },
  ];

  const grandTotal: GrandTotal = {
    label: `Total Customers Listed (${filteredCustomers.length} Records):`,
    value: totalBalanceUsd,
  };

  return (
    <MasterReportDocument<CustomerRecord>
      meta={meta}
      columns={columns}
      flatRows={filteredCustomers}
      grandTotal={grandTotal}
    />
  );
};

export default CustomerListStandardTemplate;

