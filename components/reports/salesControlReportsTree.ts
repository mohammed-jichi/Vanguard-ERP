import { ReportCategoryGroup } from './ReportPageLayout';

export interface SalesReportMeta {
  name: string;
  category: string;
  subGroup?: string;
  code: string;
  description?: string;
}

/**
 * Authentic 1:1 Omega tree for "Sales Control Reports" verbatim hierarchy & casing
 */
export const SALES_CONTROL_OMEGA_TREE: ReportCategoryGroup[] = [
  {
    title: 'Internal Control',
    items: [
      'Summary of voids',
      'Summary of refunds',
      'Duplicate Invoices',
      'Meter Report',
      'No Sale',
      'Transactions on Hold',
      'User Log Report',
      'Discount Summary',
    ],
  },
  {
    title: 'Financial',
    subGroups: [
      {
        title: 'Statistics',
        items: [
          'Sales Summary',
          'Statistics by Workstation',
          'Statistics by Department',
          'Summary of Sales by Employee',
          'Sales by Employee by Category',
          'Sales by Supplier',
          'Delivery Orders by Date and Branch',
        ],
      },
      {
        title: 'Tax Reports',
        items: [
          'Tax Summary',
          'Tax Summary Comparative',
        ],
      },
      {
        title: 'Discount Reports',
        items: [
          'Summary of Discount by Divisions',
          'Discount By Category by Department',
          'Summary of Discount',
          'Discount By Description by Employee',
          'Summary of Discount By Items Amount',
          'Discount Summary',
        ],
      },
      {
        title: 'Payments',
        items: [
          'Summary of Payment.',
          'Summary of Payment by Department',
          'Summary of payment by workstation',
          'Summary of Payment by Employee',
          'Advanced Payment History',
          'Paid In/Out',
          'Customer Payments',
          'List of Layaway Sales',
          'Layaway History',
          'List of Pending Invoices with Advance Payment',
        ],
      },
      {
        title: 'Internal Control',
        items: [
          'Meter Report',
          'No Sale',
          'Transactions on Hold',
          'User Log Report',
        ],
      },
      {
        title: 'Profit Summary',
        items: [
          'Profit by Invoices Summary',
          'Profit by item summary',
          'Profit by category summary',
          'Profit by category by department',
          'Profit By Invoices',
        ],
      },
      {
        title: 'Comparative',
        items: [
          'Sales summary by day',
          'Daily Sales',
          'Comparative Yearly Sales',
          'Comparative Monthly Sales',
          'Comparative Monthly Sales by Employee',
        ],
      },
      {
        title: 'Transaction Summary',
        items: [
          'Transactions by Date',
          'Credit Sales',
          'Credit Card Report',
          'Electronic Journal',
        ],
      },
      {
        title: 'Time sales analysis',
        items: [
          'Timer Report Group by transaction count',
          'Time report by date',
          'Time report - Average Check',
          'Time report By EOD date',
          'Transaction Report by Time',
        ],
      },
    ],
  },
  {
    title: 'Product Sales',
    subGroups: [
      {
        title: 'Product Sales',
        items: [
          'Summary of Sales By Items',
          'Sales by Items',
          'Sales details for one sales item',
          'Sales By Customer By Items',
          'Daily Sales By Items',
          'Sales By Categories',
          'Sales By Divisions',
          'Sales Items by Transaction',
          'Not Sold Items',
          'Sold Serial Numbers',
        ],
      },
      {
        title: 'Comparative By Branch',
        items: [
          'Sales By Category',
          'Sales By Division',
          'Sales By Groups',
          'Sales By Items',
        ],
      },
      {
        title: 'Top Performers',
        items: [
          'Top N sold by Quantity',
          'Top N sold by Amount',
        ],
      },
      {
        title: 'Voids & Refunds',
        items: [
          'Summary of voids',
          'Summary of refunds',
          'Details of refunds',
        ],
      },
    ],
  },
  {
    title: 'Customer Sales',
    subGroups: [
      {
        title: 'Top Performers',
        items: [
          'Top N Customers by Amount',
        ],
      },
      {
        title: 'Customers & Delivery',
        items: [
          'Sales by customer In Detail',
          'Sales by zone',
          'Delivery Sales Summary',
          'Drivers History',
        ],
      },
    ],
  },
  {
    title: "Today's & History",
    subGroups: [
      {
        title: "Today's Sales",
        items: [
          "Today's Statistics",
          "Today's Summary of payment",
          "Today's summary by Employee",
          "Today's Transactions",
        ],
      },
      {
        title: 'History',
        items: [
          'Preview Older Sales',
          'Main Reading History',
        ],
      },
    ],
  },
  {
    title: 'Time & Attendance',
    items: [
      'Employee attendance',
      'Time And Attendance',
      'Labor Cost',
    ],
  },
  {
    title: 'Lists',
    items: [
      'Customer List Standard',
      'Not Active Customers',
      'New Customers',
      'Black List Customers',
    ],
  },
];

/**
 * Authentic Omega report code catalog mappings
 */
const KNOWN_REPORT_CODES: Record<string, string> = {
  'Transactions by Date': 'REP_S_00247',
  'Summary of Sales By Items': 'REP_S_00251',
  'Sales by Items': 'REP_S_00252',
  'Summary of voids': 'REP_S_00184',
  'Summary of Voids': 'REP_S_00184',
  'Summary of refunds': 'REP_S_00185',
  'Summary of Refunds': 'REP_S_00185',
  'Details of refunds': 'REP_S_00274',
  'Details of Refunds': 'REP_S_00274',
  'Duplicate Invoices': 'REP_S_00188',
  'Meter Report': 'REP_S_00189',
  'No Sale': 'REP_S_00190',
  'Transactions on Hold': 'REP_S_00191',
  'User Log Report': 'REP_S_00192',
  'Discount Summary': 'REP_S_00193',
  'Sales Summary': 'REP_S_00201',
  'Statistics by Workstation': 'REP_S_00202',
  'Statistics by Department': 'REP_S_00203',
  'Summary of Sales by Employee': 'REP_S_00204',
  'Sales by Employee by Category': 'REP_S_00205',
  'Sales by Supplier': 'REP_S_00206',
  'Delivery Orders by Date and Branch': 'REP_S_00207',
  'Tax Summary': 'REP_S_00210',
  'Tax Summary Comparative': 'REP_S_00211',
  'Summary of Discount by Divisions': 'REP_S_00212',
  'Discount By Category by Department': 'REP_S_00213',
  'Summary of Discount': 'REP_S_00214',
  'Discount By Description by Employee': 'REP_S_00215',
  'Summary of Discount By Items Amount': 'REP_S_00216',
  'Summary of Payment': 'REP_S_00220',
  'Summary of Payment.': 'REP_S_00220',
  'Summary of Payment by Department': 'REP_S_00221',
  'Summary of payment by workstation': 'REP_S_00222',
  'Summary of Payment by Employee': 'REP_S_00223',
  'Advanced Payment History': 'REP_S_00224',
  'Paid In/Out': 'REP_S_00225',
  'Customer Payments': 'REP_S_00226',
  'List of Layaway Sales': 'REP_S_00227',
  'Layaway History': 'REP_S_00228',
  'List of Pending Invoices with Advance Payment': 'REP_S_00229',
  'Profit by Invoices Summary': 'REP_S_00235',
  'Profit by item summary': 'REP_S_00236',
  'Profit by category summary': 'REP_S_00237',
  'Profit by category by department': 'REP_S_00238',
  'Profit By Invoices': 'REP_S_00239',
  'Sales summary by day': 'REP_S_00240',
  'Daily Sales': 'REP_S_00241',
  'Comparative Yearly Sales': 'REP_S_00242',
  'Comparative Monthly Sales': 'REP_S_00243',
  'Comparative Monthly Sales by Employee': 'REP_S_00244',
  'Credit Sales': 'REP_S_00245',
  'Credit Card Report': 'REP_S_00246',
  'Electronic Journal': 'REP_S_00248',
  'Timer Report Group by transaction count': 'REP_S_00253',
  'Time report by date': 'REP_S_00254',
  'Time report - Average Check': 'REP_S_00255',
  'Time report By EOD date': 'REP_S_00256',
  'Transaction Report by Time': 'REP_S_00257',
  'Sales details for one sales item': 'REP_S_00258',
  'Sales By Customer By Items': 'REP_S_00259',
  'Daily Sales By Items': 'REP_S_00260',
  'Sales By Categories': 'REP_S_00261',
  'Sales By Divisions': 'REP_S_00262',
  'Sales Items by Transaction': 'REP_S_00263',
  'Not Sold Items': 'REP_S_00264',
  'Sold Serial Numbers': 'REP_S_00265',
  'Sales By Category': 'REP_S_00266',
  'Sales By Division': 'REP_S_00267',
  'Sales By Groups': 'REP_S_00268',
  'Sales By Items': 'REP_S_00269',
  'Top N sold by Quantity': 'REP_S_00270',
  'Top N sold by Amount': 'REP_S_00271',
  'Top N Customers by Amount': 'REP_S_00280',
  'Sales by customer In Detail': 'REP_S_00281',
  'Sales by Zone': 'REP_S_00282',
  'Sales by zone': 'REP_S_00282',
  'Delivery Sales Summary': 'REP_S_00283',
  "Driver's History": 'REP_S_00284',
  'Drivers History': 'REP_S_00284',
  "Today's Statistics": 'REP_S_00187',
  "Today's Summary of payment": 'REP_SALES_004',
  "Today's summary by Employee": 'REP_SALES_003',
  "Today's Transactions": 'REP_S_00195',
  'Preview Older Sales': 'REP_S_00290',
  'Main Reading History': 'REP_S_00291',
  'Employee attendance': 'REP_S_00301',
  'Employee Attendance': 'REP_S_00301',
  'Time And Attendance': 'REP_S_00302',
  'Time and Attendance': 'REP_S_00302',
  'Labor Cost': 'REP_S_00303',
  'Customer List Standard': 'REP_S_00310',
  'Not Active Customers': 'REP_S_00311',
  'New Customers': 'REP_S_00312',
  'Black List Customers': 'REP_S_00313',
  'Blacklist Customers': 'REP_S_00313',
  'Duplicate Invoices / Audit Search': 'REP_S_00188',
  'Cashier Shift Ledger': 'REP_S_00253',
  'Void and Refund Audit Trail': 'REP_S_00254',
  'Transactions by Salesman': 'REP_S_00249',
  'Transactions by Employee by Payment': 'REP_S_00250',
  'Transactions by Customers by Employee': 'REP_S_00272',
  'Transactions by Invoice Number': 'REP_S_00273',
  'Transactions by Date by Payment': 'REP_S_00275',
  'Transactions by Customers': 'REP_S_00276',
  'Transactions by Customers by Groups': 'REP_S_00277',
  'Transactions by Customers Details': 'REP_S_00278',
  'Transactions by Workstation': 'REP_S_00279',
  'Transactions by Employees': 'REP_S_00286',
  'Transactions by Source': 'REP_S_00287',
};

/**
 * Flattens the hierarchy into an array of report metadata with deterministic codes
 */
export function buildSalesReportsFlatList(): SalesReportMeta[] {
  const result: SalesReportMeta[] = [];
  let autoCode = 400;

  for (const group of SALES_CONTROL_OMEGA_TREE) {
    if (group.items) {
      for (const item of group.items) {
        const name = typeof item === 'string' ? item : item.name;
        const code = KNOWN_REPORT_CODES[name] || `REP_S_${String(autoCode++).padStart(5, '0')}`;
        result.push({
          name,
          category: group.title,
          code,
        });
      }
    }

    if (group.subGroups) {
      for (const sub of group.subGroups) {
        for (const item of sub.items) {
          const name = typeof item === 'string' ? item : item.name;
          const code = KNOWN_REPORT_CODES[name] || `REP_S_${String(autoCode++).padStart(5, '0')}`;
          result.push({
            name,
            category: group.title,
            subGroup: sub.title,
            code,
          });
        }
      }
    }
  }

  return result;
}

export const ALL_SALES_CONTROL_REPORTS = buildSalesReportsFlatList();

export const UNIQUE_SALES_CONTROL_REPORTS: SalesReportMeta[] = ALL_SALES_CONTROL_REPORTS.filter(
  (rep, index, self) => index === self.findIndex((r) => r.name === rep.name)
);

export const SALES_REPORTS_BY_NAME: Record<string, SalesReportMeta> = ALL_SALES_CONTROL_REPORTS.reduce(
  (acc, rep) => {
    // Keep first entry if duplicate exists
    if (!acc[rep.name]) {
      acc[rep.name] = rep;
    }
    return acc;
  },
  {} as Record<string, SalesReportMeta>
);

export function getSalesReportMeta(reportName: string): SalesReportMeta {
  return (
    SALES_REPORTS_BY_NAME[reportName] || {
      name: reportName,
      category: 'Sales Control',
      code: 'REP_S_00247',
    }
  );
}
