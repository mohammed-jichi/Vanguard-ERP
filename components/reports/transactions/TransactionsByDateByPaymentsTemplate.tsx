'use client';

import React, { useMemo } from 'react';
import {
  TransactionsByDateMasterDocument,
  TransactionsByDateDocumentProps,
} from './TransactionsByDateMasterDocument';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

export interface TransactionsByDateByPaymentsTemplateProps extends TransactionsByDateDocumentProps {}

/**
 * TransactionsByDateByPaymentsTemplate
 * Canonical Master Component delegate enforcing Single Source of Truth via TransactionsByDateMasterDocument.
 * Conforms directly to MasterReportDocument accounting standards.
 */
export const TransactionsByDateByPaymentsTemplate: React.FC<TransactionsByDateByPaymentsTemplateProps> = (props) => {
  const { invoices, filterValues = {}, reportTitle, primaryMode, ...rest } = props;

  const filteredInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;
    return applyGlobalReportFilters(invoices, filterValues);
  }, [invoices, filterValues]);

  return (
    <TransactionsByDateMasterDocument
      {...rest}
      primaryMode="Transactions by Date by Payments"
      reportTitle={reportTitle || 'Transactions by Date by Payments'}
      invoices={filteredInvoices || invoices}
      filterValues={filterValues}
    />
  );
};

export default TransactionsByDateByPaymentsTemplate;
