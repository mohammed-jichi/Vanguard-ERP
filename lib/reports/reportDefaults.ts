/**
 * Report date defaults.
 *
 * The bundled report datasets (attendance punches, payroll runs, BLOM transfers, cash wage
 * vouchers) are seeded for September 2026. Opening reports on the live "This Month" preset
 * would select a month with no seed data and render blank sheets, so report screens start
 * on this fixed period instead. Users can still pick any other preset or custom range.
 */

export const SEED_REPORT_FROM_DATE = '2026-09-01';
export const SEED_REPORT_TO_DATE = '2026-09-30';

/**
 * Preset label used for a fixed custom range.
 * - `'Custom'` matches the standard period options (`getStandardPeriodOptions`).
 * - `'Date Range'` matches the UnifiedModuleReportsHub period select.
 */
export type CustomRangePresetLabel = 'Custom' | 'Date Range';

export interface DefaultReportDateRange {
  preset: CustomRangePresetLabel;
  period: CustomRangePresetLabel;
  fromDate: string;
  toDate: string;
}

export function getDefaultReportDateRange(presetLabel: CustomRangePresetLabel = 'Custom'): DefaultReportDateRange {
  return {
    preset: presetLabel,
    period: presetLabel,
    fromDate: SEED_REPORT_FROM_DATE,
    toDate: SEED_REPORT_TO_DATE,
  };
}
