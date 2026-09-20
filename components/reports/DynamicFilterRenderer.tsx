'use client';

import React from 'react';
import { Filter, RotateCcw, Check, ChevronDown } from 'lucide-react';

// ============================================================================
// 1. DYNAMIC FILTER SCHEMA DEFINITIONS & TYPES
// ============================================================================

export type FilterFieldType = 'select' | 'text' | 'checkbox' | 'toggle' | 'number';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterCondition {
  field: string;
  equals?: any;
  notEquals?: any;
  in?: any[];
  isTruthy?: boolean;
}

export interface DynamicFilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  defaultValue?: any;
  placeholder?: string;
  className?: string;
  dependsOn?: FilterCondition;
  tooltip?: string;
}

export interface ReportFilterSchema {
  reportKeyOrPattern: string; // Exact report name or substring match pattern
  fields: DynamicFilterField[];
}

// ============================================================================
// 2. CONTEXTUAL FILTER SCHEMAS FOR SALES, INVENTORY, ACCOUNTING & LOYALTY
// ============================================================================

export const REPORT_FILTER_SCHEMAS: ReportFilterSchema[] = [
  // 1. TAX REPORTS SCHEMA
  {
    reportKeyOrPattern: 'Tax',
    fields: [
      {
        id: 'taxCategory',
        label: 'Tax Category',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Tax Categories', value: 'ALL' },
          { label: 'Standard VAT (11%)', value: 'VAT_11' },
          { label: 'Reduced VAT (5%)', value: 'VAT_05' },
          { label: 'Zero-Rated / Exempt', value: 'EXEMPT' },
          { label: 'Export Tax Free', value: 'EXPORT_FREE' },
        ],
      },
      {
        id: 'taxRateFilter',
        label: 'Effective Tax Rate',
        type: 'select',
        defaultValue: 'ALL',
        dependsOn: { field: 'taxCategory', notEquals: 'EXEMPT' },
        options: [
          { label: 'Any Rate', value: 'ALL' },
          { label: 'Exactly 11.0%', value: '11' },
          { label: 'Exactly 5.0%', value: '5' },
          { label: 'Withholding Tax (7.5%)', value: '7.5' },
        ],
      },
      {
        id: 'includeExemptSubtotal',
        label: 'Include Exempt Lines',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        id: 'vatDeclarationFormat',
        label: 'Declaration Output',
        type: 'select',
        defaultValue: 'LEBANESE_MOF_STANDARD',
        dependsOn: { field: 'includeExemptSubtotal', isTruthy: true },
        options: [
          { label: 'Lebanese MoF Official Form', value: 'LEBANESE_MOF_STANDARD' },
          { label: 'Detailed Tax Invoice Breakdown', value: 'DETAILED_INVOICE' },
          { label: 'Customs & Clearance Audit', value: 'CUSTOMS_CLEARANCE' },
        ],
      },
    ],
  },

  // 2. DRIVER & COURIER / DELIVERY REPORTS SCHEMA
  {
    reportKeyOrPattern: 'Driver',
    fields: [
      {
        id: 'courierDriver',
        label: 'Assigned Driver',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Courier Fleet', value: 'ALL' },
          { label: 'Fadi Abou Assi (G-183921)', value: 'DRV_FADI' },
          { label: 'Mohammad Al-Husseini (T-492102)', value: 'DRV_MOHAMMAD' },
          { label: 'Charbel Rahme (B-310928)', value: 'DRV_CHARBEL' },
          { label: 'Tarek Khoury (Z-102948)', value: 'DRV_TAREK' },
        ],
      },
      {
        id: 'deliveryZone',
        label: 'Delivery Zone / Corridor',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Delivery Zones', value: 'ALL' },
          { label: 'Beirut Greater Area & Suburbs', value: 'BEIRUT' },
          { label: 'Mount Lebanon & Metn', value: 'MOUNT_LEBANON' },
          { label: 'South Coast Corridor (Sidon/Tyre)', value: 'SOUTH' },
          { label: 'North Hub (Tripoli/Batroun)', value: 'NORTH' },
          { label: 'Bekaa Valley (Chtaura/Zahle)', value: 'BEKAA' },
        ],
      },
      {
        id: 'deliveryStatusFilter',
        label: 'Fulfillment State',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Fulfillment States', value: 'ALL' },
          { label: 'Dispatched & On Route', value: 'ON_ROUTE' },
          { label: 'Delivered & Handed Over', value: 'DELIVERED' },
          { label: 'Returned / Rejected at Door', value: 'REJECTED' },
          { label: 'Cash Pending Remittance', value: 'CASH_PENDING' },
        ],
      },
      {
        id: 'showPendingCashOnly',
        label: 'Cash Pending Only',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  // 3. PROFIT & MARGIN REPORTS SCHEMA
  {
    reportKeyOrPattern: 'Profit',
    fields: [
      {
        id: 'marginBasis',
        label: 'Cost Calculation Basis',
        type: 'select',
        defaultValue: 'WEIGHTED_AVG',
        options: [
          { label: 'Weighted Average Cost (WAC)', value: 'WEIGHTED_AVG' },
          { label: 'Last Purchase Cost (LPC)', value: 'LAST_PURCHASE' },
          { label: 'Standard Catalog Cost', value: 'STANDARD_COST' },
          { label: 'Landed Cost (Incl. Duties & Freight)', value: 'LANDED_COST' },
        ],
      },
      {
        id: 'profitThreshold',
        label: 'Minimum Gross Margin %',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Margins', value: 'ALL' },
          { label: 'Negative Margins (Loss Leaders)', value: 'NEGATIVE' },
          { label: 'Low Margin (< 15%)', value: 'LOW' },
          { label: 'Target Margin (15% - 35%)', value: 'TARGET' },
          { label: 'High Margin (> 35%)', value: 'HIGH' },
        ],
      },
      {
        id: 'includeDiscountsInCost',
        label: 'Deduct Invoice Discounts',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        id: 'showOverheadBurden',
        label: 'Include Allocated OPEX Burden',
        type: 'checkbox',
        defaultValue: false,
        dependsOn: { field: 'marginBasis', equals: 'LANDED_COST' },
      },
    ],
  },

  // 4. CASCADING BRANCH & WORKSTATION TRANSACTION SCHEMA
  {
    reportKeyOrPattern: 'Transactions',
    fields: [
      {
        id: 'branch',
        label: 'Operating Branch Facility',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Branches (Consolidated)', value: 'ALL' },
          { label: 'Main Branch (Choueifat Facility)', value: 'Main Branch' },
          { label: 'Sidon Hub & Plant', value: 'Sidon Hub' },
          { label: 'Beirut Gourmet Depot (Verdun)', value: 'Beirut Gourmet Depot' },
          { label: 'Tripoli Northern Depot', value: 'Tripoli Depot' },
        ],
      },
      {
        id: 'workstation',
        label: 'Specific Workstation / Register',
        type: 'select',
        defaultValue: 'ALL',
        dependsOn: { field: 'branch', notEquals: 'ALL' },
        options: [
          { label: 'All Workstations in Branch', value: 'ALL' },
          { label: 'POS Terminal 01 - Cash Counter', value: 'POS-01' },
          { label: 'POS Terminal 02 - Wholesale Desk', value: 'POS-02' },
          { label: 'Drive-Thru / Quick Counter', value: 'POS-03' },
          { label: 'Dispatch Handover Terminal', value: 'POS-DSP' },
        ],
      },
      {
        id: 'paymentMode',
        label: 'Payment Tender',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Payment Modes', value: 'ALL' },
          { label: 'Cash Tender ($ / LBP)', value: 'CASH' },
          { label: 'Whish Money Transfer', value: 'WHISH' },
          { label: 'Credit Card / Visa POS', value: 'CARD' },
          { label: 'Credit Customer (On Account)', value: 'CREDIT' },
        ],
      },
      {
        id: 'groupByDate',
        label: 'Group by Date / Shift',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
  },

  // 5. INVENTORY & STOCK MOVEMENT SCHEMA
  {
    reportKeyOrPattern: 'Inventory',
    fields: [
      {
        id: 'stockValuationMethod',
        label: 'Valuation Formula',
        type: 'select',
        defaultValue: 'WAC',
        options: [
          { label: 'Weighted Average Cost (WAC)', value: 'WAC' },
          { label: 'FIFO (First-In, First-Out)', value: 'FIFO' },
          { label: 'Replacement Cost', value: 'REPLACEMENT' },
          { label: 'Selling Retail Price', value: 'RETAIL' },
        ],
      },
      {
        id: 'stockThresholdFilter',
        label: 'Stock Level Alert',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Stock Levels', value: 'ALL' },
          { label: 'Below Reorder Minimum', value: 'BELOW_MIN' },
          { label: 'Negative Balances (Critical)', value: 'NEGATIVE' },
          { label: 'Overstocked (> 90 Days Demand)', value: 'OVERSTOCKED' },
          { label: 'Zero Stock (Out of Stock)', value: 'OUT_OF_STOCK' },
        ],
      },
      {
        id: 'includeZeroBalances',
        label: 'Include Zero Balances',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
  },

  // 6. LOYALTY & POINTS SCHEMA
  {
    reportKeyOrPattern: 'Points',
    fields: [
      {
        id: 'memberTier',
        label: 'Loyalty Membership Tier',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Loyalty Tiers', value: 'ALL' },
          { label: 'Platinum Elite Members', value: 'PLATINUM' },
          { label: 'Gold Preferred Accounts', value: 'GOLD' },
          { label: 'Silver Standard Accounts', value: 'SILVER' },
          { label: 'Bronze Entry Level', value: 'BRONZE' },
        ],
      },
      {
        id: 'pointTransactionType',
        label: 'Ledger Activity Type',
        type: 'select',
        defaultValue: 'ALL',
        options: [
          { label: 'All Point Activities', value: 'ALL' },
          { label: 'Purchase Accruals (+)', value: 'PURCHASE_ACCRUAL' },
          { label: 'Bonus & Campaign Points (+)', value: 'BONUS' },
          { label: 'Gift & Voucher Redemptions (-)', value: 'REDEMPTION' },
          { label: 'Expired Points Revocations (-)', value: 'EXPIRATION' },
          { label: 'Manual Manager Adjustments', value: 'MANUAL_ENTRY' },
        ],
      },
      {
        id: 'expiryWindowDays',
        label: 'Expiration Forecast Horizon',
        type: 'select',
        defaultValue: '30',
        options: [
          { label: 'Next 30 Days', value: '30' },
          { label: 'Next 60 Days', value: '60' },
          { label: 'Next 90 Days (Quarterly)', value: '90' },
          { label: 'Fiscal Year End (31-Dec)', value: 'YEAREND' },
        ],
      },
    ],
  },
];

// ============================================================================
// 3. UNIFIED DYNAMIC FILTER RENDERER COMPONENT
// ============================================================================

export interface DynamicFilterRendererProps {
  reportName: string;
  filterValues: Record<string, any>;
  onFilterChange: (fieldId: string, value: any) => void;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
  customExtraControls?: React.ReactNode;
  className?: string;
}

/**
 * DynamicFilterRenderer
 * Inspects the selected report name, dynamically pulls matching conditional schema fields,
 * and renders dependent cascading filter inputs inside the authentic Omega light workplace.
 */
export default function DynamicFilterRenderer({
  reportName,
  filterValues,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  customExtraControls,
  className = '',
}: DynamicFilterRendererProps) {
  // Find matching schema based on reportName pattern
  const activeSchema = React.useMemo(() => {
    const found = REPORT_FILTER_SCHEMAS.find((s) =>
      reportName.toLowerCase().includes(s.reportKeyOrPattern.toLowerCase())
    );
    return found || null;
  }, [reportName]);

  // Helper to evaluate cascading/conditional dependencies
  const isFieldVisible = (field: DynamicFilterField): boolean => {
    if (!field.dependsOn) return true;
    const { field: depField, equals, notEquals, in: inList, isTruthy } = field.dependsOn;
    const parentVal = filterValues[depField];

    if (equals !== undefined && parentVal !== equals) return false;
    if (notEquals !== undefined && parentVal === notEquals) return false;
    if (inList !== undefined && !inList.includes(parentVal)) return false;
    if (isTruthy !== undefined && Boolean(parentVal) !== isTruthy) return false;

    return true;
  };

  const visibleFields = (activeSchema?.fields || []).filter(isFieldVisible);

  return (
    <div
      className={`bg-card rounded-xl border border-border p-4 shadow-xs space-y-3 select-none ${className}`}
    >
      {/* Top Banner indicating dynamic parameter binding */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center font-bold text-xs">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground tracking-tight">
              Report Parameters: <span className="text-primary font-semibold">{reportName}</span>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {visibleFields.length > 0
                ? `${visibleFields.length} contextual filters active for this report sheet.`
                : 'Standard filter controls active for this view.'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Standard Vanguard Design System Buttons */}
        <div className="flex items-center gap-2">
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-slate-200 text-foreground transition-colors border border-border shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {onApplyFilters && (
            <button
              type="button"
              onClick={onApplyFilters}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-slate-800 text-primary-foreground transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Filter Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Contextual / Dynamic & Cascading Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {visibleFields.map((field) => {
          const currentValue =
            filterValues[field.id] !== undefined
              ? filterValues[field.id]
              : field.defaultValue;

          if (field.type === 'select') {
            return (
              <div key={field.id} className={`flex flex-col gap-1 ${field.className || 'w-48'}`}>
                <label
                  htmlFor={field.id}
                  className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <select
                    id={field.id}
                    value={currentValue ?? ''}
                    onChange={(e) => onFilterChange(field.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-2xs appearance-none cursor-pointer pr-7"
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <div
                key={field.id}
                className="flex items-center gap-2 pt-4 px-2 cursor-pointer select-none"
                onClick={() => onFilterChange(field.id, !currentValue)}
              >
                <input
                  type="checkbox"
                  id={field.id}
                  checked={Boolean(currentValue)}
                  onChange={(e) => onFilterChange(field.id, e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor={field.id}
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  {field.label}
                </label>
              </div>
            );
          }

          if (field.type === 'text') {
            return (
              <div key={field.id} className={`flex flex-col gap-1 ${field.className || 'w-48'}`}>
                <label
                  htmlFor={field.id}
                  className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider"
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  id={field.id}
                  value={currentValue ?? ''}
                  placeholder={field.placeholder || ''}
                  onChange={(e) => onFilterChange(field.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            );
          }

          return null;
        })}

        {/* Any extra custom controls injected by the parent page */}
        {customExtraControls}
      </div>
    </div>
  );
}
