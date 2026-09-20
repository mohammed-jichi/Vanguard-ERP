'use client';

import React from 'react';
import {
  CustomerSalesReportMasterDocument,
  CustomerSalesReportMasterDocumentProps,
} from './CustomerSalesReportMasterDocument';

export interface CustomerSalesDetailTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  fromDate?: string;
  toDate?: string;
  topN?: number;
  branch?: string;
  filterValues?: Record<string, any>;
}

/**
 * CustomerSalesDetailTemplate
 * Canonical Master Component delegate enforcing Single Source of Truth via CustomerSalesReportMasterDocument.
 * Conforms directly to MasterReportDocument accounting standards.
 */
export const CustomerSalesDetailTemplate: React.FC<CustomerSalesDetailTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Sales by customer In Detail',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  topN = 10,
  branch = 'Main Branch (Choueifat Main Facility)',
  filterValues = {},
}) => {
  const period = dynamicPeriodText || `Period: ${fromDate} to ${toDate}`;

  return (
    <CustomerSalesReportMasterDocument
      reportKey={reportTitle}
      reportTitle={reportTitle}
      dynamicPeriodText={period}
      executionDate={executionDate}
      branch={branch}
      filterValues={filterValues}
    />
  );
};

export default CustomerSalesDetailTemplate;
