'use client';

import QuotationWorkstation, {
  QuotationRecord,
  QuotationItem,
  INITIAL_QUOTATIONS,
  formatLiveTodayDate,
  getMonthStartDate,
  getMonthEndDate,
  downloadQuotationPdfFile
} from '@/components/QuotationWorkstation';

export default QuotationWorkstation;

export {
  QuotationWorkstation as QuotationsView,
  QuotationWorkstation,
  formatLiveTodayDate,
  getMonthStartDate,
  getMonthEndDate,
  downloadQuotationPdfFile,
  INITIAL_QUOTATIONS
};

export type { QuotationRecord, QuotationItem };
