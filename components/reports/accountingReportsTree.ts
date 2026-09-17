import { ReportCategoryGroup } from './ReportPageLayout';

export interface AccountingReportMeta {
  name: string;
  category: string;
  code: string;
  isShared?: boolean;
}

/**
 * Authentic 1:1 Omega tree for "Accounting Reports"
 */
export const ACCOUNTING_OMEGA_TREE: ReportCategoryGroup[] = [
  {
    title: 'Recommended',
    items: [
      'Income Statement',
      'Balance Sheet',
      'General Ledger',
    ],
  },
  {
    title: 'Financial',
    items: [
      'Income Statement',
      'Balance Sheet',
      'General Ledger',
      'Transaction Details',
      'Statement of Account',
      'Payment Reports',
      'Receipts Reports',
      'Trial Balance',
      'Tax Report',
      'User Log',
      'Cash Flow',
    ],
  },
  {
    title: 'Accounts Receivable & Payables',
    items: [
      'Receivables',
      'Payables',
    ],
  },
  {
    title: 'Customer Sales',
    items: [
      'Top Customers',
    ],
  },
  {
    title: 'Top Active',
    items: [
      'Top Suppliers',
    ],
  },
  {
    title: 'Accounts',
    items: [
      'Chart Of Accounts',
      'Budget Overview',
    ],
  },
];

const KNOWN_ACCOUNTING_CODES: Record<string, string> = {
  'Income Statement': 'REP_ACC_001',
  'Balance Sheet': 'REP_ACC_002',
  'General Ledger': 'REP_ACC_003',
  'Transaction Details': 'REP_ACC_004',
  'Statement of Account': 'REP_ACC_005',
  'Payment Reports': 'REP_ACC_006',
  'Receipts Reports': 'REP_ACC_007',
  'Trial Balance': 'REP_ACC_008',
  'Tax Report': 'REP_ACC_009',
  'User Log': 'REP_ACC_010',
  'Cash Flow': 'REP_ACC_011',
  'Receivables': 'REP_ACC_012',
  'Payables': 'REP_ACC_013',
  'Top Customers': 'REP_ACC_014',
  'Top Suppliers': 'REP_ACC_015',
  'Chart Of Accounts': 'REP_ACC_016',
  'Budget Overview': 'REP_ACC_017',
};

export function buildAccountingReportsFlatList(): AccountingReportMeta[] {
  const result: AccountingReportMeta[] = [];
  let auto = 100;

  for (const group of ACCOUNTING_OMEGA_TREE) {
    if (group.items) {
      for (const item of group.items) {
        const name = typeof item === 'string' ? item : item.name;
        const isShared =
          name === 'Top Customers' ||
          name === 'Top Suppliers' ||
          name === 'Payment Reports' ||
          name === 'Receipts Reports' ||
          name === 'Tax Report' ||
          name === 'User Log';

        result.push({
          name,
          category: group.title,
          code: KNOWN_ACCOUNTING_CODES[name] || `REP_ACC_${auto++}`,
          isShared,
        });
      }
    }
  }

  return result;
}

export const ALL_ACCOUNTING_REPORTS = buildAccountingReportsFlatList();

export const ACCOUNTING_REPORTS_BY_NAME: Record<string, AccountingReportMeta> = ALL_ACCOUNTING_REPORTS.reduce(
  (acc, rep) => {
    if (!acc[rep.name]) {
      acc[rep.name] = rep;
    }
    return acc;
  },
  {} as Record<string, AccountingReportMeta>
);

export function getAccountingReportMeta(reportName: string): AccountingReportMeta {
  return (
    ACCOUNTING_REPORTS_BY_NAME[reportName] || {
      name: reportName,
      category: 'Financial',
      code: 'REP_ACC_001',
    }
  );
}
