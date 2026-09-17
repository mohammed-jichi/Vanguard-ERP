import React from 'react';

/**
 * Vanguard ERP - Enterprise Report Typography & Contrast Tokens
 * Baseline Reference: Image 1 (Income Statement Standard)
 *
 * Rules:
 * 1. Deep contrast, dark charcoal for descriptions, solid slate for codes, solid black for headers.
 * 2. Zero solid badge/pill containers (no rounded backgrounds, no borders, no icons).
 * 3. Pure bold semantic text in uppercase with tracking-wide.
 * 4. High-contrast metrics for production logs (Royal Blue, Forest Green, Amber/Rose).
 * 5. Uniform py-2 px-3 cell padding and border-y-2 border-slate-900 headers.
 */

// ============================================================================
// 1. PAYMENT METHODS (Pure text, no badges)
// ============================================================================
export function getPaymentMethodTextClass(paymentType?: string): string {
  const norm = paymentType?.toUpperCase().trim() || '';
  if (norm.includes('CASH') && norm.includes('USD')) {
    return 'text-emerald-700 font-bold tracking-wide uppercase';
  }
  if (norm.includes('CASH') && norm.includes('EUR')) {
    return 'text-sky-700 font-bold tracking-wide uppercase';
  }
  if (norm.includes('CASH')) {
    return 'text-emerald-800 font-bold tracking-wide uppercase';
  }
  if (norm.includes('CARD') && norm.includes('USD')) {
    return 'text-blue-700 font-bold tracking-wide uppercase';
  }
  if (norm.includes('CARD') && norm.includes('EUR')) {
    return 'text-indigo-700 font-bold tracking-wide uppercase';
  }
  if (norm.includes('CARD') || norm.includes('VISA') || norm.includes('MASTERCARD')) {
    return 'text-blue-800 font-bold tracking-wide uppercase';
  }
  if (norm.includes('WHISH') || norm.includes('WALLET')) {
    return 'text-purple-700 font-bold tracking-wide uppercase';
  }
  if (norm.includes('SPLIT') || norm.includes('MIXED')) {
    return 'text-teal-700 font-bold tracking-wide uppercase';
  }
  if (norm.includes('ON ACC') || norm.includes('CREDIT') || norm.includes('ACCOUNT')) {
    return 'text-amber-800 font-bold tracking-wide uppercase';
  }
  if (norm.includes('COD') || norm.includes('CASH_ON_DELIVERY') || norm.includes('VAULT_CASH')) {
    return 'text-slate-800 font-bold tracking-wide uppercase';
  }
  return 'text-slate-800 font-bold tracking-wide uppercase';
}

export function getCurrencyTextClass(currency?: string): string {
  const code = currency?.toUpperCase().trim() || 'LBP';
  switch (code) {
    case 'USD':
      return 'text-emerald-700 font-bold font-mono';
    case 'EUR':
      return 'text-blue-700 font-bold font-mono';
    case 'GBP':
      return 'text-purple-700 font-bold font-mono';
    default:
      return 'text-slate-700 font-bold font-mono';
  }
}

// ============================================================================
// 2. ORDER & PRODUCTION STATUSES (Pure text, no badges)
// ============================================================================
export function getReportStatusTextClass(status?: string): string {
  switch (status?.toUpperCase().trim()) {
    case 'COMPLETED':
    case 'DELIVERED':
    case 'OPTIMAL':
    case 'ACTIVE':
    case 'CLEARED':
    case 'ON_TRACK':
    case 'FAVORABLE':
      return 'text-emerald-700 font-bold tracking-wide uppercase';
    case 'IN_PROGRESS':
    case 'REFILL_IN_PROGRESS':
    case 'ON_ROUTE':
    case 'DISPATCHED':
      return 'text-blue-700 font-bold tracking-wide uppercase';
    case 'QUALITY_HOLD':
    case 'HOLD':
    case 'QUEUED':
    case 'CALIBRATION':
    case 'PENDING':
    case 'SCHEDULED':
    case 'PREPARING':
    case 'DRAINING':
    case 'CHURN_RISK':
    case 'MEDIUM':
      return 'text-amber-700 font-bold tracking-wide uppercase';
    case 'CANCELLED':
    case 'FAILED':
    case 'URGENT':
    case 'HIGH':
    case 'HIGH_RISK':
    case 'INACTIVE':
      return 'text-rose-700 font-bold tracking-wide uppercase';
    case 'MOVED_TO_POS_PICKUP':
      return 'text-purple-700 font-bold tracking-wide uppercase';
    default:
      return 'text-slate-700 font-bold tracking-wide uppercase';
  }
}

// ============================================================================
// 3. LOYALTY TIERS (Pure text, no badges)
// ============================================================================
export function getLoyaltyTierTextClass(tier?: string): string {
  switch (tier?.toUpperCase().trim()) {
    case 'PLATINUM':
      return 'text-purple-800 font-bold tracking-wide uppercase';
    case 'GOLD':
      return 'text-amber-700 font-bold tracking-wide uppercase';
    case 'SILVER':
      return 'text-slate-600 font-bold tracking-wide uppercase';
    case 'BRONZE':
      return 'text-amber-800 font-bold tracking-wide uppercase';
    default:
      return 'text-slate-800 font-bold tracking-wide uppercase';
  }
}

// ============================================================================
// 4. PRODUCTION LOG METRIC COLORS (High-contrast metrics)
// ============================================================================
export function getExtractedVolumeClass(): string {
  return 'text-blue-700 font-bold font-mono';
}

export function getYieldPercentClass(yieldPct: number): string {
  return yieldPct >= 22.0
    ? 'text-emerald-700 font-bold font-mono'
    : 'text-slate-800 font-bold font-mono';
}

export function getAcidityPercentClass(acidityPct: number): string {
  if (acidityPct <= 0.8) {
    return 'text-amber-700 font-bold font-mono';
  }
  return 'text-rose-700 font-bold font-mono';
}

// ============================================================================
// 5. SHARED TABLE CONTRAST TOKENS (Matching Image 1 Standard)
// ============================================================================
export const REPORT_TABLE_TOKENS = {
  headerRow: 'border-y-2 border-slate-900 font-bold text-xs bg-slate-50 text-slate-900',
  th: 'py-2 px-3 text-xs font-bold text-slate-900',
  td: 'py-2 px-3 text-xs',
  primaryText: 'font-medium text-slate-800',
  secondaryCode: 'font-mono text-xs text-slate-600',
  moneyUsd: 'font-mono font-bold text-slate-900',
  moneyLbp: 'font-mono text-xs text-slate-600 font-medium',
  footerRow: 'border-t-2 border-slate-900 font-bold bg-slate-50 text-xs text-slate-900',
} as const;

// ============================================================================
// 6. DECLARATIVE RENDERING COMPONENTS
// ============================================================================
export const SemanticPaymentText: React.FC<{ method?: string; className?: string }> = ({
  method,
  className = '',
}) => {
  if (!method) return null;
  return (
    <span className={`${getPaymentMethodTextClass(method)} ${className}`}>
      {method}
    </span>
  );
};

export const SemanticStatusText: React.FC<{ status?: string; className?: string }> = ({
  status,
  className = '',
}) => {
  if (!status) return null;
  const formatted = status.replace(/_/g, ' ');
  return (
    <span className={`${getReportStatusTextClass(status)} ${className}`}>
      {formatted}
    </span>
  );
};

export const SemanticTierText: React.FC<{ tier?: string; className?: string }> = ({
  tier,
  className = '',
}) => {
  if (!tier) return null;
  return (
    <span className={`${getLoyaltyTierTextClass(tier)} ${className}`}>
      {tier}
    </span>
  );
};
