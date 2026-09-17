'use client';

import React, { useMemo } from 'react';
import {
  TransactionsByDateMasterDocument,
  TransactionsByDateDocumentProps,
} from './TransactionsByDateMasterDocument';
import { applyGlobalReportFilters } from '@/lib/reportFilterEngine';

export interface TransactionsByDateTemplateProps extends TransactionsByDateDocumentProps {}

/**
 * TransactionsByDateTemplate
 * Wraps TransactionsByDateMasterDocument with strict global filter engine normalization.
 * Conforms directly to MasterReportDocument accounting standard.
 */
export const TransactionsByDateTemplate: React.FC<TransactionsByDateTemplateProps> = (props) => {
  const { invoices, filterValues = {}, ...rest } = props;

  // When custom invoice array is provided, run it through the central filter pipeline
  const filteredInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;
    return applyGlobalReportFilters(invoices, filterValues);
  }, [invoices, filterValues]);

  return (
    <TransactionsByDateMasterDocument
      {...rest}
      invoices={filteredInvoices || invoices}
      filterValues={filterValues}
    />
  );
};

export { TransactionsByDateMasterDocument };
export default TransactionsByDateTemplate;

