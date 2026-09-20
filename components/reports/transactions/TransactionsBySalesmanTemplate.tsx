'use client';

import React, { useMemo } from 'react';
import {
  TransactionsByDateMasterDocument,
  TransactionsByDateDocumentProps,
} from './TransactionsByDateMasterDocument';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

export interface TransactionsBySalesmanTemplateProps extends TransactionsByDateDocumentProps {}

/**
 * TransactionsBySalesmanTemplate
 * Canonical Master Component delegate enforcing Single Source of Truth via TransactionsByDateMasterDocument.
 * Conforms directly to MasterReportDocument accounting standards with full 1:1 salesman filter parity.
 */
export const TransactionsBySalesmanTemplate: React.FC<TransactionsBySalesmanTemplateProps> = (props) => {
  const { invoices, filterValues = {}, reportTitle, primaryMode, ...rest } = props;

  const filteredInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;
    return applyGlobalReportFilters(invoices, filterValues);
  }, [invoices, filterValues]);

  return (
    <TransactionsByDateMasterDocument
      {...rest}
      primaryMode="Transactions by Salesman"
      reportTitle={reportTitle || 'Transactions by Salesman'}
      invoices={filteredInvoices || invoices}
      filterValues={filterValues}
    />
  );
};

export default TransactionsBySalesmanTemplate;
