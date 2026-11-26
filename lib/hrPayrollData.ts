export const ymdNow = () => new Date().toISOString().slice(0, 10);

// ---------- Time off reasons ----------
export interface TimeOffReason {
  id: string;
  description: string;
  paidStatus: 'Paid' | 'Unpaid';
}

export const DEFAULT_TIME_OFF_REASONS: TimeOffReason[] = [
  'Annual leave',
  'Sick leave',
  'Maternity leave',
  'Medical appointment',
  'Personal leave',
  'Family emergency',
  'Force majeure',
  'Leave without pay',
  'Marriage leave',
  'Bereavement',
  'Work-related injury leave',
  'Relocation or transport disruption'
].map((description, i) => ({ id: `reason-${i + 1}`, description, paidStatus: description === 'Leave without pay' ? 'Unpaid' : 'Paid' }));

// ---------- Earnings & deductions labels ----------
export type LabelType = 'Earnings' | 'Deduction';

export interface EarningDeductionLabel {
  id: string;
  description: string;
  type: LabelType;
  createdDate: string;
  isDefault: boolean;
  employerContribution: boolean;
}

const labelSeed: [string, LabelType, boolean][] = [
  ['Extra Shift', 'Earnings', false],
  ['Bonus', 'Earnings', false],
  ['Employee Discounts', 'Earnings', false],
  ['Transportation', 'Earnings', false],
  ['Maternity/Paternity Leave', 'Earnings', false],
  ['Wellness Programs', 'Earnings', false],
  ['Childcare Assistance', 'Earnings', false],
  ['Tuition Reimbursement / Education Assistance', 'Earnings', false],
  ['Retirement Plans', 'Deduction', true],
  ['Health Insurance', 'Deduction', true],
  ['Travel and Accommodation', 'Earnings', false],
  ['Performance Bonuses', 'Earnings', false],
  ['Paid Time Off (PTO)', 'Earnings', false],
  ['Life Insurance', 'Deduction', true],
  ['Social Security Tax', 'Deduction', true],
  ['Late Arrival', 'Deduction', false],
  ['Days Off', 'Deduction', false]
];

export const DEFAULT_LABELS: EarningDeductionLabel[] = labelSeed.map(([description, type, employerContribution], i) => ({
  id: `label-${i + 1}`,
  description,
  type,
  createdDate: ymdNow(),
  isDefault: true,
  employerContribution
}));

// ---------- Payment settings ----------
export const FREQUENCIES = ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly', '6 Weeks', '6 Months', 'Yearly', 'One-Time'];
export const FREQ_FACTOR: Record<string, number> = { Daily: 30, Weekly: 4.33, Biweekly: 2.17, Monthly: 1, Quarterly: 1 / 3, '6 Weeks': 0.72, '6 Months': 1 / 6, Yearly: 1 / 12, 'One-Time': 0 };

export interface LabelRate {
  id: string;
  rate: number;
  description: string;
}

export interface PaymentSetting {
  id: string;
  labelType: LabelType;
  labelName: string;
  rateId: string;
  rate: number;
  method: 'Fixed Amount' | 'Percentage';
  frequency: string;
  remarks: string;
}

/** Monthly amount in USD of a payment setting for an employee whose monthly base is `baseUsd`. */
export function settingMonthlyUsd(s: PaymentSetting, baseUsd: number): number {
  const amount = s.method === 'Percentage' ? (baseUsd * s.rate) / 100 : s.rate;
  return amount * (FREQ_FACTOR[s.frequency] ?? 1);
}

// ---------- Schedule templates ----------
export interface TemplateDay {
  active: boolean;
  slots: { start: string; end: string }[];
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  code: string;
  days: Record<string, TemplateDay>;
}

export const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const emptyTemplateDays = (): Record<string, TemplateDay> =>
  Object.fromEntries(WEEK.map((d) => [d, { active: false, slots: [{ start: '08:00', end: '16:30' }] }]));

// ---------- Salary / currency ----------
export interface SalaryHolder {
  baseSalary?: number;
  salaryCurrency?: 'USD' | 'LBP';
}

export function baseSalaryIn(e: SalaryHolder, currency: 'USD' | 'LBP', rate: number): number {
  const base = Number(e.baseSalary) || 0;
  const from = e.salaryCurrency === 'LBP' ? 'LBP' : 'USD';
  if (from === currency) return base;
  return from === 'LBP' ? base / (rate || 1) : base * rate;
}

export const fmtMoney = (v: number, currency: 'USD' | 'LBP') =>
  currency === 'USD' ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${Math.round(v).toLocaleString('en-US')} LL`;

// ---------- Payroll runs ----------
export interface PayrollLine {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  labelType: 'Earning' | 'Deduction';
  label: string;
  amount: number; // in the run currency
  remark: string;
  employer?: boolean;
}

export interface PayrollRun {
  id: string;
  year: number;
  month: number; // 1-12
  brand: string;
  branch: string;
  label: string;
  totalSalary: number;
  currency: 'USD' | 'LBP';
  status: 'Draft' | 'Posted';
  lines: PayrollLine[];
  savedAt?: string;
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Last 12 months ending with the current live month (newest first). */
export function rolling12Months(now = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
  });
}
