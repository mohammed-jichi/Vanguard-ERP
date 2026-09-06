import React from 'react';
import { OmnichannelPaymentsReportTemplate } from './OmnichannelPaymentsReportTemplate';

interface CreditCardReportTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
}

export const CreditCardReportTemplate: React.FC<CreditCardReportTemplateProps> = ({
  hideToolbar = false,
  dynamicPeriodText,
  executionDate
}) => {
  return <OmnichannelPaymentsReportTemplate />;
};
