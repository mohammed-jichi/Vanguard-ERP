'use client';

import React from 'react';
import {
  TimeAndAttendanceMasterDocument,
} from '../hr/TimeAndAttendanceMasterDocument';

export interface EmployeeAttendanceTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
  reportTitle?: string;
  fromDate?: string;
  toDate?: string;
  branch?: string;
  filterValues?: Record<string, any>;
}

/**
 * EmployeeAttendanceTemplate
 * Canonical Master Component delegate enforcing Single Source of Truth via TimeAndAttendanceMasterDocument.
 * Conforms directly to MasterReportDocument accounting standards.
 */
export const EmployeeAttendanceTemplate: React.FC<EmployeeAttendanceTemplateProps> = ({
  hideToolbar = true,
  dynamicPeriodText,
  executionDate = '06-Sep-2026',
  reportTitle = 'Employee attendance',
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
  branch = 'Main Branch (Choueifat Main Facility)',
  filterValues = {},
}) => {
  const period = dynamicPeriodText || `Period: ${fromDate} to ${toDate}`;

  return (
    <TimeAndAttendanceMasterDocument
      reportKey={reportTitle}
      reportTitle={reportTitle}
      dynamicPeriodText={period}
      executionDate={executionDate}
      branch={branch}
      filterValues={filterValues}
    />
  );
};

export default EmployeeAttendanceTemplate;
