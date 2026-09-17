import { ReportCategoryGroup } from './ReportPageLayout';

export interface InventoryReportMeta {
  name: string;
  category: string;
  subGroup?: string;
  code: string;
  isLink?: boolean;
  href?: string;
  description?: string;
}

/**
 * Authentic 1:1 Omega tree for "Inventory Reports" (Operations Center)
 */
export const INVENTORY_CONTROL_OMEGA_TREE: ReportCategoryGroup[] = [
  {
    title: 'Recommended',
    items: [
      'Purchase With all Details',
      'Wastage Report',
      'Inventory report',
      'Stock Transaction History',
      'Transactions Summary',
    ],
  },
  {
    title: 'Inventory',
    items: [
      'Inventory report',
      'Inventory report Summary',
      'Inventory report by supplier',
      'Inventory Report By Color and Size',
      'Inventory report based on selling price',
      'Stock Movement',
      'Stock Movement By Supplier',
      'Inventory report for expiry',
      'Inventory History',
      'Inventory history by category by location',
      'Inventory History Summary',
      'Overstock Report',
    ],
  },
  {
    title: 'Purchases',
    items: [
      'Purchase by supplier by item(original and landing cost)',
      'Purchase by location by category',
      'Purchase Master Report For All Branches',
      'Consolidated Purchase Summary By Invoice By Supplier',
      'Purchase Report From Supplier By Cat. Including Tax',
      'Purchase Report By Category By Divisions',
      'Purchase order with all details',
      'List of remarks by items',
      'Purchase Report',
      'Purchase With all Details',
      'Purchase by month',
      'Purchase items cost',
      'Purchase Summary by invoice by supplier',
      'Purchase Summary by invoice',
      'Purchase Summary by supplier',
      'Purchase details by supplier',
      'Purchase details by date',
      'Purchase by category',
      'Purchase by item by supplier',
      'Purchase by item by location',
      'Supplier Discount',
      'Purchased Serial Number',
    ],
  },
  {
    title: 'Sales',
    items: [
      {
        name: 'Sales Reports',
        href: '/sales-control/reports',
        isExternalLink: true,
      },
      'Profit by Item',
      'Sales By Driver Report',
    ],
  },
  {
    title: 'Stock Movement',
    subGroups: [
      {
        title: 'Consumptions',
        items: [
          'Stock Transaction History',
          'Sales vs quantity received',
          'Transactions Summary',
          'Item Consumption Based on Production and Wastage',
          'Product Purchase/Sales By Color',
        ],
      },
      {
        title: 'Cost Variations',
        items: [
          'Average cost variation (Crosstab)',
          'Average cost variation summary group by supplier',
          'Average cost variation summary by item',
          'Unit Cost Variation',
          'Inventory Items Price Variation',
        ],
      },
    ],
  },
  {
    title: 'Transactions',
    subGroups: [
      {
        title: 'Requisitions',
        items: [
          'Requisition Summary',
          'Requisitions By Item',
          'Requisitions By Location',
          'Grouped By Location By Item',
          'Summary By Group',
          'Summary to Location By Group',
          'Summary By Group W/O Items',
          'Summary By Category By Location',
          'Requisitions to Location',
          'Requisitions From Location',
          'Transfered Serial Numbers',
          'Transfer Report By Item By Date',
        ],
      },
      {
        title: 'Wastage',
        items: [
          'Wastage Report',
          'Wastage by Serial Number',
        ],
      },
      {
        title: 'Adjustments',
        items: [
          'Inventory Adjustments',
          'Not Adjusted Items',
        ],
      },
      {
        title: 'Production',
        items: [
          'Inventory Production',
          'Inventory Production Summary By Date',
        ],
      },
    ],
  },
  {
    title: 'Reordering',
    items: [
      'Reorder suggestion',
    ],
  },
  {
    title: 'Input Forms',
    items: [
      'Inventory Worksheet',
      'Wastage Sheet',
      'Production Sheet',
    ],
  },
  {
    title: 'Lists',
    subGroups: [
      {
        title: 'Logs',
        items: [
          'User Log Report',
        ],
      },
      {
        title: 'List Reports',
        items: [
          'Programming Summary',
          'List of Suppliers',
          'Inventory Items Ingredients',
          'Items Link Between Brands',
          'List of Inventory Items - PLU For Scale',
          'List of Included Items',
          'List of Newly Created Inventory Items',
          'Warehouse Report',
        ],
      },
    ],
  },
];

/**
 * Authentic Omega report code catalog mappings
 */
const KNOWN_INVENTORY_CODES: Record<string, string> = {
  'Purchase With all Details': 'REP_PUR_001',
  'Wastage Report': 'REP_WST_001',
  'Inventory report': 'REP_INV_001',
  'Stock Transaction History': 'REP_SM_001',
  'Transactions Summary': 'REP_SM_003',
  'Inventory report Summary': 'REP_INV_002',
  'Inventory report by supplier': 'REP_INV_003',
  'Inventory Report By Color and Size': 'REP_INV_004',
  'Inventory report based on selling price': 'REP_INV_005',
  'Stock Movement': 'REP_INV_006',
  'Stock Movement By Supplier': 'REP_INV_007',
  'Inventory report for expiry': 'REP_INV_008',
  'Inventory History': 'REP_INV_009',
  'Inventory history by category by location': 'REP_INV_010',
  'Inventory History Summary': 'REP_INV_011',
  'Overstock Report': 'REP_INV_012',
  'Purchase by supplier by item(original and landing cost)': 'REP_PUR_002',
  'Purchase by location by category': 'REP_PUR_003',
  'Purchase Master Report For All Branches': 'REP_PUR_004',
  'Consolidated Purchase Summary By Invoice By Supplier': 'REP_PUR_005',
  'Purchase Report From Supplier By Cat. Including Tax': 'REP_PUR_006',
  'Purchase Report By Category By Divisions': 'REP_PUR_007',
  'Purchase order with all details': 'REP_PUR_008',
  'List of remarks by items': 'REP_PUR_009',
  'Purchase Report': 'REP_PUR_010',
  'Purchase by month': 'REP_PUR_011',
  'Purchase items cost': 'REP_PUR_012',
  'Purchase Summary by invoice by supplier': 'REP_PUR_013',
  'Purchase Summary by invoice': 'REP_PUR_014',
  'Purchase Summary by supplier': 'REP_PUR_015',
  'Purchase details by supplier': 'REP_PUR_016',
  'Purchase details by date': 'REP_PUR_017',
  'Purchase by category': 'REP_PUR_018',
  'Purchase by item by supplier': 'REP_PUR_019',
  'Purchase by item by location': 'REP_PUR_020',
  'Supplier Discount': 'REP_PUR_021',
  'Purchased Serial Number': 'REP_PUR_022',
  'Sales Reports': 'LINK_SALES_001',
  'Profit by Item': 'REP_SAL_001',
  'Sales By Driver Report': 'REP_SAL_002',
  'Sales vs quantity received': 'REP_SM_002',
  'Item Consumption Based on Production and Wastage': 'REP_SM_004',
  'Product Purchase/Sales By Color': 'REP_SM_005',
  'Average cost variation (Crosstab)': 'REP_CV_001',
  'Average cost variation summary group by supplier': 'REP_CV_002',
  'Average cost variation summary by item': 'REP_CV_003',
  'Unit Cost Variation': 'REP_CV_004',
  'Inventory Items Price Variation': 'REP_CV_005',
  'Requisition Summary': 'REP_REQ_001',
  'Requisitions By Item': 'REP_REQ_002',
  'Requisitions By Location': 'REP_REQ_003',
  'Grouped By Location By Item': 'REP_REQ_004',
  'Summary By Group': 'REP_REQ_005',
  'Summary to Location By Group': 'REP_REQ_006',
  'Summary By Group W/O Items': 'REP_REQ_007',
  'Summary By Category By Location': 'REP_REQ_008',
  'Requisitions to Location': 'REP_REQ_009',
  'Requisitions From Location': 'REP_REQ_010',
  'Transfered Serial Numbers': 'REP_REQ_011',
  'Transfer Report By Item By Date': 'REP_REQ_012',
  'Wastage by Serial Number': 'REP_WST_002',
  'Inventory Adjustments': 'REP_ADJ_001',
  'Not Adjusted Items': 'REP_ADJ_002',
  'Inventory Production': 'REP_PRD_001',
  'Inventory Production Summary By Date': 'REP_PRD_002',
  'Reorder suggestion': 'REP_REO_001',
  'Inventory Worksheet': 'FRM_INV_001',
  'Wastage Sheet': 'FRM_WST_001',
  'Production Sheet': 'FRM_PRD_001',
  'User Log Report': 'LST_LOG_001',
  'Programming Summary': 'LST_REP_001',
  'List of Suppliers': 'LST_REP_002',
  'Inventory Items Ingredients': 'LST_REP_003',
  'Items Link Between Brands': 'LST_REP_004',
  'List of Inventory Items - PLU For Scale': 'LST_REP_005',
  'List of Included Items': 'LST_REP_006',
  'List of Newly Created Inventory Items': 'LST_REP_007',
  'Warehouse Report': 'LST_REP_008',
};

/**
 * Builds flattened report metadata list with authentic codes
 */
export function buildInventoryReportsFlatList(): InventoryReportMeta[] {
  const result: InventoryReportMeta[] = [];
  let autoCode = 500;

  for (const group of INVENTORY_CONTROL_OMEGA_TREE) {
    if (group.items) {
      for (const item of group.items) {
        const name = typeof item === 'string' ? item : item.name;
        const isLink = typeof item !== 'string' ? item.isExternalLink : name === 'Sales Reports';
        const href = typeof item !== 'string' && item.href ? item.href : name === 'Sales Reports' ? '/sales-control/reports' : undefined;
        const code = KNOWN_INVENTORY_CODES[name] || `REP_INV_${String(autoCode++).padStart(5, '0')}`;
        result.push({
          name,
          category: group.title,
          code,
          isLink,
          href,
        });
      }
    }

    if (group.subGroups) {
      for (const sub of group.subGroups) {
        for (const item of sub.items) {
          const name = typeof item === 'string' ? item : item.name;
          const isLink = typeof item !== 'string' ? item.isExternalLink : name === 'Sales Reports';
          const href = typeof item !== 'string' && item.href ? item.href : name === 'Sales Reports' ? '/sales-control/reports' : undefined;
          const code = KNOWN_INVENTORY_CODES[name] || `REP_INV_${String(autoCode++).padStart(5, '0')}`;
          result.push({
            name,
            category: group.title,
            subGroup: sub.title,
            code,
            isLink,
            href,
          });
        }
      }
    }
  }

  return result;
}

export const ALL_INVENTORY_CONTROL_REPORTS = buildInventoryReportsFlatList();

export const INVENTORY_REPORTS_BY_NAME: Record<string, InventoryReportMeta> = ALL_INVENTORY_CONTROL_REPORTS.reduce(
  (acc, rep) => {
    if (!acc[rep.name]) {
      acc[rep.name] = rep;
    }
    return acc;
  },
  {} as Record<string, InventoryReportMeta>
);

export function getInventoryReportMeta(reportName: string): InventoryReportMeta {
  return (
    INVENTORY_REPORTS_BY_NAME[reportName] || {
      name: reportName,
      category: 'Inventory',
      code: 'REP_INV_001',
    }
  );
}
