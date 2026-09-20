/**
 * ============================================================================
 * VANGUARD ERP — CENTRAL DYNAMIC PERIOD & DATE RANGE CALCULATION ENGINE
 * Universal, Real-Time Calendar Resolution Against Active System Clock
 * ============================================================================
 */

export interface DateRangeResolution {
  preset: string;
  fromDate: string; // ISO-8601 'YYYY-MM-DD' for native HTML5 <input type="date">
  toDate: string;   // ISO-8601 'YYYY-MM-DD' for native HTML5 <input type="date">
  startDate: string; // Alias for fromDate
  endDate: string;   // Alias for toDate
  displayPeriod: string; // Formatted 'DD-MMM-YYYY to DD-MMM-YYYY' or 'DD-MMM-YYYY'
  chipLabel: string; // Short human-readable summary badge (e.g., 'Today', 'Sep 2026', 'Q3 2026')
  isCustom: boolean;
  isQuarterDisabled?: boolean;
  warning?: string;
}

export interface PeriodOption {
  label: string;
  value: string;
  disabled?: boolean;
  tooltip?: string;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format local Date object to ISO string 'YYYY-MM-DD' without UTC shift
 */
export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format local Date object to display string 'DD-MMM-YYYY' (e.g. '17-Sep-2026')
 */
export function formatDisplayDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const monthName = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${monthName}-${year}`;
}

/**
 * Parse an ISO-8601 date string 'YYYY-MM-DD' or fallback to new Date()
 */
export function parseISODate(str?: string): Date {
  if (!str) return new Date();
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Calculate current calendar quarter (1 to 4)
 * Q1: Jan - Mar (months 0-2)
 * Q2: Apr - Jun (months 3-5)
 * Q3: Jul - Sep (months 6-8)
 * Q4: Oct - Dec (months 9-11)
 */
export function getCurrentQuarter(referenceDate: Date = new Date()): number {
  return Math.floor(referenceDate.getMonth() / 3) + 1;
}

/**
 * Guardrail check: Checks if a quarter has started by the given reference date.
 * Quarters in the future cannot be selected.
 */
export function isQuarterAvailable(quarter: number, referenceDate: Date = new Date()): boolean {
  const currentQ = getCurrentQuarter(referenceDate);
  return currentQ >= quarter;
}

/**
 * Generate standard period preset options with dynamic availability flags
 */
export function getStandardPeriodOptions(referenceDate: Date = new Date()): PeriodOption[] {
  const isQ4Available = isQuarterAvailable(4, referenceDate);
  const isQ3Available = isQuarterAvailable(3, referenceDate);
  const isQ2Available = isQuarterAvailable(2, referenceDate);

  return [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'First Quarter (Q1)', value: 'First Quarter' },
    {
      label: isQ2Available ? 'Second Quarter (Q2)' : 'Second Quarter (Q2 - Unentered)',
      value: 'Second Quarter',
      disabled: !isQ2Available,
      tooltip: !isQ2Available ? 'Q2 begins April 1st' : undefined,
    },
    {
      label: isQ3Available ? 'Third Quarter (Q3)' : 'Third Quarter (Q3 - Unentered)',
      value: 'Third Quarter',
      disabled: !isQ3Available,
      tooltip: !isQ3Available ? 'Q3 begins July 1st' : undefined,
    },
    {
      label: isQ4Available ? 'Fourth Quarter (Q4)' : 'Fourth Quarter (Q4 - Unentered)',
      value: 'Fourth Quarter',
      disabled: !isQ4Available,
      tooltip: !isQ4Available ? 'Q4 begins October 1st' : undefined,
    },
    { label: 'This Year', value: 'This Year' },
    { label: 'Custom Range', value: 'Custom' },
  ];
}

/**
 * Central Dynamic Date Range Resolver
 * Evaluates period presets in real-time against active system clock (`referenceDate = new Date()`).
 *
 * @param preset - The selected preset key (e.g. 'Today', 'This Month', 'First Quarter', 'Custom')
 * @param customFromDate - Current/custom fromDate ISO string (preserved when preset === 'Custom')
 * @param customToDate - Current/custom toDate ISO string (preserved when preset === 'Custom')
 * @param referenceDate - System clock reference date (defaults to new Date())
 */
export function resolveDateRangeFromPreset(
  preset: string = 'This Month',
  customFromDate?: string,
  customToDate?: string,
  referenceDate: Date = new Date()
): DateRangeResolution {
  const now = referenceDate;
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const normalizedPreset = String(preset || 'This Month').trim();
  const upperKey = normalizedPreset.toUpperCase().replace(/[\s\-_()]+/g, '_');

  let startDate: Date;
  let endDate: Date;
  let chipLabel = normalizedPreset;
  let isCustom = false;
  let isQuarterDisabled = false;
  let warning: string | undefined = undefined;

  switch (upperKey) {
    case 'TODAY': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate);
      chipLabel = 'Today';
      break;
    }

    case 'YESTERDAY': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(startDate);
      chipLabel = 'Yesterday';
      break;
    }

    case 'THIS_WEEK': {
      // Dynamic boundary from Monday to Sunday of current week
      const day = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
      const distanceToMonday = (day + 6) % 7;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
      chipLabel = `This Week: ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      break;
    }

    case 'THIS_MONTH': {
      // From 1st of current month to final day of current calendar month
      startDate = new Date(currentYear, currentMonthIdx, 1);
      endDate = new Date(currentYear, currentMonthIdx + 1, 0);
      chipLabel = `${MONTH_NAMES_SHORT[currentMonthIdx]}, ${currentYear}`;
      break;
    }

    case 'LAST_MONTH': {
      // Exact 1st to the final day of the previous calendar month
      startDate = new Date(currentYear, currentMonthIdx - 1, 1);
      endDate = new Date(currentYear, currentMonthIdx, 0);
      chipLabel = `${MONTH_NAMES_SHORT[startDate.getMonth()]}, ${startDate.getFullYear()}`;
      break;
    }

    case 'FIRST_QUARTER':
    case 'FIRST_QUARTER_Q1':
    case 'Q1': {
      // Jan 1 to Mar 31 of current year
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 2, 31);
      chipLabel = `Q1 ${currentYear}`;
      break;
    }

    case 'SECOND_QUARTER':
    case 'SECOND_QUARTER_Q2':
    case 'Q2': {
      // Apr 1 to Jun 30 of current year
      if (!isQuarterAvailable(2, now)) {
        isQuarterDisabled = true;
        warning = 'Second Quarter (Q2) has not started yet.';
        // Fallback to Q1 boundary
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 2, 31);
        chipLabel = `Q1 ${currentYear} (Q2 Unentered)`;
      } else {
        startDate = new Date(currentYear, 3, 1);
        endDate = new Date(currentYear, 5, 30);
        chipLabel = `Q2 ${currentYear}`;
      }
      break;
    }

    case 'THIRD_QUARTER':
    case 'THIRD_QUARTER_Q3':
    case 'Q3': {
      // Jul 1 to Sep 30 of current year
      if (!isQuarterAvailable(3, now)) {
        isQuarterDisabled = true;
        warning = 'Third Quarter (Q3) has not started yet.';
        // Fallback to Q2 boundary
        startDate = new Date(currentYear, 3, 1);
        endDate = new Date(currentYear, 5, 30);
        chipLabel = `Q2 ${currentYear} (Q3 Unentered)`;
      } else {
        startDate = new Date(currentYear, 6, 1);
        endDate = new Date(currentYear, 8, 30);
        chipLabel = `Q3 ${currentYear}`;
      }
      break;
    }

    case 'FOURTH_QUARTER':
    case 'FOURTH_QUARTER_Q4':
    case 'Q4': {
      // Oct 1 to Dec 31 of current year
      // Guardrail: If current date has NOT entered Q4 yet, prevent selection & fallback safely
      if (!isQuarterAvailable(4, now)) {
        isQuarterDisabled = true;
        warning = 'Fourth Quarter (Q4) has not started yet.';
        // Fallback safely to current active quarter boundary (e.g. Q3: Jul 1 to Sep 30)
        startDate = new Date(currentYear, 6, 1);
        endDate = new Date(currentYear, 8, 30);
        chipLabel = `Q3 ${currentYear} (Q4 Unentered)`;
      } else {
        startDate = new Date(currentYear, 9, 1);
        endDate = new Date(currentYear, 11, 31);
        chipLabel = `Q4 ${currentYear}`;
      }
      break;
    }

    case 'THIS_QUARTER': {
      const q = getCurrentQuarter(now);
      const startMonth = (q - 1) * 3;
      startDate = new Date(currentYear, startMonth, 1);
      endDate = new Date(currentYear, startMonth + 3, 0);
      chipLabel = `Q${q} ${currentYear}`;
      break;
    }

    case 'THIS_YEAR': {
      // Jan 1 of current year to active date (or end of current year)
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      chipLabel = `Year ${currentYear}`;
      break;
    }

    case 'LAST_YEAR': {
      startDate = new Date(currentYear - 1, 0, 1);
      endDate = new Date(currentYear - 1, 11, 31);
      chipLabel = `Year ${currentYear - 1}`;
      break;
    }

    case 'CUSTOM':
    case 'CUSTOM_RANGE':
    case 'CUSTOM_DATE_RANGE':
    case 'DATE_RANGE': {
      isCustom = true;
      if (customFromDate && customToDate) {
        startDate = parseISODate(customFromDate);
        endDate = parseISODate(customToDate);
      } else if (customFromDate) {
        startDate = parseISODate(customFromDate);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else {
        startDate = new Date(currentYear, currentMonthIdx, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }
      chipLabel = 'Custom Range';
      break;
    }

    default: {
      // Default to This Month
      startDate = new Date(currentYear, currentMonthIdx, 1);
      endDate = new Date(currentYear, currentMonthIdx + 1, 0);
      chipLabel = `${MONTH_NAMES_SHORT[currentMonthIdx]}, ${currentYear}`;
      break;
    }
  }

  const fromISO = formatISODate(startDate);
  const toISO = formatISODate(endDate);

  const displayPeriod =
    fromISO === toISO
      ? formatDisplayDate(startDate)
      : `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;

  return {
    preset: normalizedPreset,
    fromDate: fromISO,
    toDate: toISO,
    startDate: fromISO,
    endDate: toISO,
    displayPeriod,
    chipLabel,
    isCustom,
    isQuarterDisabled,
    warning,
  };
}

/**
 * Returns default initial date state for reporting components based on active system time
 */
export function getDefaultInitialDateRange(
  preset: string = 'This Month',
  referenceDate: Date = new Date()
): {
  preset: string;
  period: string;
  fromDate: string;
  toDate: string;
  startDate: string;
  endDate: string;
  displayPeriod: string;
} {
  const res = resolveDateRangeFromPreset(preset, undefined, undefined, referenceDate);
  return {
    preset: res.preset,
    period: res.preset,
    fromDate: res.fromDate,
    toDate: res.toDate,
    startDate: res.fromDate,
    endDate: res.toDate,
    displayPeriod: res.displayPeriod,
  };
}

/**
 * Check if preset requires custom date inputs
 */
export function isCustomDatePreset(preset?: string): boolean {
  if (!preset) return false;
  const p = preset.trim().toUpperCase().replace(/[- ]/g, '_');
  return (
    p === 'CUSTOM' ||
    p === 'CUSTOM_RANGE' ||
    p === 'CUSTOM_DATE_RANGE' ||
    p === 'DATE_RANGE'
  );
}

export function shouldShowEditableDateInputs(preset?: string): boolean {
  return isCustomDatePreset(preset);
}

