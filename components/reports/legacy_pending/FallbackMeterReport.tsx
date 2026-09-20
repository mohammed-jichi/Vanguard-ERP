'use client';

import React from 'react';
import { MeterReportTemplate } from '@/components/reports/sales/MeterReportTemplate';

interface FallbackMeterReportProps {
  fromDate?: string;
  toDate?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

export const FallbackMeterReport: React.FC<FallbackMeterReportProps> = ({
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  filterValues = {},
}) => {
  return (
    <MeterReportTemplate
      fromDate={fromDate}
      toDate={toDate}
      branch={branch}
      filterValues={filterValues}
      reportTitle="Meter & Shift Reading Register (Z-Report Audit)"
      code="REP_S_00189"
    />
  );
};

export default FallbackMeterReport;
