'use client';

import React from 'react';
import { SharedReportViewer } from '../registry';

export interface UserLogReportTemplateProps {
  fromDate?: string;
  toDate?: string;
}

/**
 * UserLogReportTemplate
 * Canonical delegate to SharedReportViewer for system user audit trail.
 */
export const UserLogReportTemplate: React.FC<UserLogReportTemplateProps> = ({
  fromDate = '01-Aug-2026',
  toDate = '27-Aug-2026',
}) => {
  return (
    <SharedReportViewer
      reportName="User Log Report"
      moduleContext="sales"
      dateRangeText={`Period: ${fromDate} to ${toDate}`}
    />
  );
};

export default UserLogReportTemplate;
