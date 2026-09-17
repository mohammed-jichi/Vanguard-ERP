import { ReportCategoryGroup } from './ReportPageLayout';

export interface LoyaltyReportMeta {
  name: string;
  category: string;
  code: string;
  isShared?: boolean;
}

/**
 * Authentic 1:1 Omega tree for "Loyalty Management Reports"
 */
export const LOYALTY_MANAGEMENT_OMEGA_TREE: ReportCategoryGroup[] = [
  {
    title: 'Loyalty Management Reports',
    items: [
      'Best Customers',
      'Customers not Checking in',
      'Customer Points',
      'Customers Points Expiry',
      'Customers Cashback Expiry',
      'Transactions Points Expiry',
      'Collected vs Redeemed Points',
      'Collected vs Redeemed Cashback',
      'Customer Transactions',
      'Customer Transactions Summary',
      'Customer Checkins',
      'Checkins with no Transactions',
      'Manual Points Entry',
    ],
  },
];

const KNOWN_LOYALTY_CODES: Record<string, string> = {
  'Best Customers': 'REP_LOY_001',
  'Customers not Checking in': 'REP_LOY_002',
  'Customer Points': 'REP_LOY_003',
  'Customers Points Expiry': 'REP_LOY_004',
  'Customers Cashback Expiry': 'REP_LOY_005',
  'Transactions Points Expiry': 'REP_LOY_006',
  'Collected vs Redeemed Points': 'REP_LOY_007',
  'Collected vs Redeemed Cashback': 'REP_LOY_008',
  'Customer Transactions': 'REP_LOY_009',
  'Customer Transactions Summary': 'REP_LOY_010',
  'Customer Checkins': 'REP_LOY_011',
  'Checkins with no Transactions': 'REP_LOY_012',
  'Manual Points Entry': 'REP_LOY_013',
};

export function buildLoyaltyReportsFlatList(): LoyaltyReportMeta[] {
  return (LOYALTY_MANAGEMENT_OMEGA_TREE[0].items || []).map((item) => {
    const name = typeof item === 'string' ? item : item.name;
    const isShared =
      name === 'Best Customers' ||
      name === 'Customer Transactions' ||
      name === 'Customer Transactions Summary';
    return {
      name,
      category: 'Loyalty Management Reports',
      code: KNOWN_LOYALTY_CODES[name] || 'REP_LOY_001',
      isShared,
    };
  });
}

export const ALL_LOYALTY_REPORTS = buildLoyaltyReportsFlatList();

export const LOYALTY_REPORTS_BY_NAME: Record<string, LoyaltyReportMeta> = ALL_LOYALTY_REPORTS.reduce(
  (acc, rep) => {
    acc[rep.name] = rep;
    return acc;
  },
  {} as Record<string, LoyaltyReportMeta>
);

export function getLoyaltyReportMeta(reportName: string): LoyaltyReportMeta {
  return (
    LOYALTY_REPORTS_BY_NAME[reportName] || {
      name: reportName,
      category: 'Loyalty Management Reports',
      code: 'REP_LOY_001',
    }
  );
}
