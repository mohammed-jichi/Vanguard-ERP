'use client';

import React, { useMemo } from 'react';
import {
  TransactionsByDateMasterDocument,
  TransactionsByDateDocumentProps,
} from './TransactionsByDateMasterDocument';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

export interface DuplicateInvoicesTemplateProps extends TransactionsByDateDocumentProps {}

/**
 * DuplicateInvoicesTemplate
 * Canonical Master Component delegate enforcing Single Source of Truth via TransactionsByDateMasterDocument.
 * Conforms directly to MasterReportDocument accounting standards.
 */
export const DuplicateInvoicesTemplate: React.FC<DuplicateInvoicesTemplateProps> = (props) => {
  const { invoices, filterValues = {}, reportTitle, primaryMode, ...rest } = props;

  const filteredInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;
    return applyGlobalReportFilters(invoices, filterValues);
  }, [invoices, filterValues]);

  return (
    <TransactionsByDateMasterDocument
      {...rest}
      primaryMode="Duplicate Invoices"
      reportTitle={reportTitle || 'Duplicate Invoices'}
      invoices={filteredInvoices || invoices}
      filterValues={filterValues}
    />
  );
};

export default DuplicateInvoicesTemplate;
