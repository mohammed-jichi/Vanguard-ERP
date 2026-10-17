'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTenant } from '@/lib/TenantContext';

/**
 * Sanitizes and normalizes branch/facility names:
 * Purges duplicate "Branch: Branch:" and legacy distorted naming.
 */
export function sanitizeFacilityName(branch?: string): string {
  if (!branch) return 'Facility: [1300-01] Main';
  const lower = branch.trim().toLowerCase();

  // Consolidated enterprise check
  if (
    lower === 'all' ||
    lower === 'all branches' ||
    lower === 'all operating branches' ||
    lower === 'all facilities' ||
    lower.includes('consolidated') ||
    lower.includes('enterprise - 1300')
  ) {
    return 'Consolidated - All Facilities';
  }

  let cleaned = branch
    .replace(/^Branch:\s*/gi, '')
    .replace(/^Branch:\s*/gi, '')
    .replace(/^Facility:\s*/gi, '')
    .trim();

  // Purge legacy distortions
  cleaned = cleaned.replace(/\s*\(\s*Zeit w zaytoun ljanoub\s*\)/gi, '');
  cleaned = cleaned.replace(/Zeit w zaytoun ljanoub/gi, 'Main');
  cleaned = cleaned.replace(/\s*\(\s*Choueifat Main Facility\s*\)/gi, '');
  cleaned = cleaned.replace(/Choueifat Main Plant/gi, 'Main');
  cleaned = cleaned.replace(/1300-01 - Choueifat Main Facility/gi, '[1300-01] Main');
  cleaned = cleaned.replace(/Southern Olive and Oil Products - Main/gi, 'Main');
  cleaned = cleaned.replace(/Southern Olive and Oil Products/gi, 'Main');

  if (cleaned.startsWith('[1300-') || cleaned.startsWith('Facility: [1300-')) {
    cleaned = cleaned.replace(/\[1300-01\]\s*(Southern Olive and Oil Products - )?Main/gi, '[1300-01] Main');
    return cleaned.startsWith('Facility:') ? cleaned : `Facility: ${cleaned}`;
  }

  if (cleaned.startsWith('1300-01')) {
    return 'Facility: [1300-01] Main';
  }

  if (cleaned.startsWith('1300-')) {
    const match = cleaned.match(/^(1300-\d+)\s*[-–•:]*\s*(.*)$/);
    if (match) {
      const sub = match[2] || 'Branch Facility';
      const cleanSub = sub.replace(/Southern Olive and Oil Products - /gi, '').trim();
      return `Facility: [${match[1]}] ${cleanSub}`;
    }
    return `Facility: [${cleaned}]`;
  }

  if (
    !cleaned ||
    lower === 'main branch' ||
    lower.includes('southern olive and oil products - main') ||
    lower.includes('southern olive and oil products') ||
    lower.includes('choueifat') ||
    cleaned === 'Main'
  ) {
    return 'Facility: [1300-01] Main';
  }

  return `Facility: ${cleaned}`;
}

export interface Corporate3ZoneHeaderProps {
  // Left Zone (Head Office / Company Details)
  companyName?: string;
  companyArabicName?: string;
  companyTaxNumber?: string;
  hqAddress?: string;
  companyWebsite?: string;
  hqPhone?: string;
  printDate?: string;

  // Center Zone (Dynamic Document Title & Metadata)
  documentTitle: string;
  voucherCode?: string;
  voucherLabel?: string;
  refNumber?: string;
  hideStatusBadge?: boolean;
  transactionDate?: string;
  status?: string;
  periodText?: string;

  // Right Zone (Active Branch / Facility Details)
  facilityName?: string;
  facilityAddress?: string;
  facilityDirect?: string;
  facilityEmail?: string;
  pageInfo?: string;

  className?: string;
}

/**
 * Standardized Corporate Document Header with 2-Column Top Row & Centered Title:
 * +---------------------------------------------------------------------------------------------------------+
 * | [TOP-LEFT: Company Details]                           | [TOP-RIGHT: Facility Details]                   |
 * | Southern Olive and Oil Products S.A.R.L.              | Facility: [1300-01] Main                        |
 * | منتوجات زيت وزيتون الجنوب ش.م.م                      | Industrial Zone, Old Saida Rd                   |
 * | Tax ID / MOF #: 3491820-601                           | Cell: +961 70 000 000                           |
 * | Old Saida Road, Choueifat, Lebanon                    | Email: sales@southernolive-lb.com               |
 * | www.southernolive-lb.com                              | Page 1 of 1                                     |
 * | Tel / Support: +961 05 430 000                        |                                                 |
 * +---------------------------------------------------------------------------------------------------------+
 * |                                            SALES INVOICE                                                |
 * |                                       Invoice #: 2026-21889                                             |
 * |                                  Date: 14-Oct-2026 • Ref #: REF-8901                                    |
 * +---------------------------------------------------------------------------------------------------------+
 */
export function Corporate3ZoneHeader({
  companyName = 'Southern Olive and Oil Products S.A.R.L.',
  companyArabicName = 'منتوجات زيت وزيتون الجنوب ش.م.م',
  companyTaxNumber,
  hqAddress = 'Old Saida Road, Choueifat, Lebanon',
  companyWebsite = 'www.southernolive-lb.com',
  hqPhone = '+961 05 430 000',
  printDate: _printDate,
  documentTitle,
  voucherCode,
  voucherLabel,
  refNumber,
  hideStatusBadge = false,
  transactionDate,
  status,
  periodText,
  facilityName = 'Facility: [1300-01] Main',
  facilityAddress = 'Industrial Zone, Old Saida Rd',
  facilityDirect = 'Cell: +961 70 000 000',
  facilityEmail = 'Email: sales@southernolive-lb.com',
  pageInfo = 'Page 1 of 1',
  className = '',
}: Corporate3ZoneHeaderProps) {
  const { t } = useLanguage();

  let tenantTaxNumber: string | undefined;
  try {
    const tenantCtx = useTenant();
    if (
      tenantCtx?.currentTenant?.taxIdentificationNumber &&
      !tenantCtx.currentTenant.taxIdentificationNumber.includes('7489201')
    ) {
      tenantTaxNumber = tenantCtx.currentTenant.taxIdentificationNumber;
    }
  } catch (_e) {
    // Graceful fallback if invoked outside TenantProvider
  }

  const resolvedTaxNumber = companyTaxNumber || tenantTaxNumber || '3491820-601';

  const cleanFacility = sanitizeFacilityName(facilityName);
  const cleanWebsite = companyWebsite.replace(/^https?:\/\//i, '');
  const isConsolidated =
    cleanFacility.toLowerCase().includes('consolidated') ||
    cleanFacility.toLowerCase().includes('enterprise');
  const resolvedAddress = isConsolidated
    ? 'Enterprise Consolidated Audit'
    : facilityAddress;

  const resolvedDirectRaw = isConsolidated
    ? 'Tenant Master Central Dispatch'
    : facilityDirect;
  const cleanDirect = resolvedDirectRaw
    .replace(/^(Dispatch\s*\/\s*Cell|Dispatch|Cell):\s*/i, '')
    .trim();
  const displayDirect = isConsolidated
    ? resolvedDirectRaw
    : `Cell: ${cleanDirect || '+961 70 000 000'}`;

  const cleanEmail = (facilityEmail || 'sales@southernolive-lb.com')
    .replace(/^Email:\s*/i, '')
    .trim();
  const displayEmail = `Email: ${cleanEmail}`;

  const cleanHqPhone = hqPhone
    .replace(/^(Tel\s*\/\s*Support|Tel\s*\/\s*Direct|Tel):\s*/i, '')
    .trim();
  const displayHqPhone = `Tel / Support: ${cleanHqPhone || '+961 05 430 000'}`;

  const isInvoiceDoc =
    documentTitle?.toUpperCase().includes('INVOICE') ||
    Boolean(voucherCode && voucherCode.toUpperCase().startsWith('INV'));

  const defaultVoucherPrefix =
    voucherLabel || (isInvoiceDoc ? 'Invoice #' : 'Ref #');

  // Strip redundant INV- prefix from displayed invoice number
  let cleanVoucherCode = voucherCode || '';
  if (isInvoiceDoc && cleanVoucherCode) {
    cleanVoucherCode = cleanVoucherCode
      .replace(/^Invoice\s*(#|No:?):?\s*/i, '')
      .replace(/^INV-/i, '')
      .trim();
  }

  const formattedVoucherDisplay = cleanVoucherCode
    ? isInvoiceDoc
      ? `${defaultVoucherPrefix}: ${cleanVoucherCode}`
      : cleanVoucherCode.includes('#') ||
        cleanVoucherCode.startsWith('Ref') ||
        cleanVoucherCode.startsWith('Doc') ||
        cleanVoucherCode.startsWith('Invoice')
      ? cleanVoucherCode
      : `${defaultVoucherPrefix}: ${cleanVoucherCode}`
    : '';

  // Internal POSTED / ledger tags should not be rendered on customer-facing invoices
  const shouldRenderStatusBadge =
    Boolean(status) &&
    !hideStatusBadge &&
    !(isInvoiceDoc && status?.toUpperCase() === 'POSTED');

  return (
    <div
      className={`w-full pb-3 mb-4 border-b-2 border-slate-900 font-sans text-slate-800 ${className}`}
    >
      {/* 1. TOP ROW: Company Left vs Facility Right */}
      <div className="flex justify-between items-start text-[11px] leading-tight mb-3">
        {/* Top-Left Block (Company Details) */}
        <div className="text-left flex flex-col justify-start space-y-0.5">
          <div className="font-black text-[13.5px] text-slate-950 tracking-tight">
            {t(companyName, companyName)}
          </div>
          {companyArabicName && (
            <div className="text-slate-700 font-bold text-[11px] font-arabic">
              {companyArabicName}
            </div>
          )}
          <div className="text-slate-600 font-mono text-[10.5px]">
            Tax ID / MOF #: {resolvedTaxNumber}
          </div>
          <div className="text-slate-600 font-medium">
            {t(hqAddress, hqAddress)}
          </div>
          <div>
            <a
              href={`https://${cleanWebsite}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline font-mono text-[10.5px]"
            >
              {cleanWebsite}
            </a>
          </div>
          <div className="text-slate-600 font-mono text-[10.5px]">
            {displayHqPhone}
          </div>
        </div>

        {/* Top-Right Block (Facing Company Details) */}
        <div className="text-right flex flex-col justify-start items-end space-y-0.5">
          <div className="font-bold text-[13px] text-slate-900">
            {t(cleanFacility, cleanFacility)}
          </div>
          <div className="text-slate-600 font-medium">
            {t(resolvedAddress, resolvedAddress)}
          </div>
          <div className="text-slate-600 font-mono text-[10.5px]">
            {displayDirect}
          </div>
          <div className="text-slate-600 font-mono text-[10.5px]">
            {displayEmail}
          </div>
          <div className="text-slate-500 font-mono text-[10px] pt-0.5">
            {pageInfo}
          </div>
        </div>
      </div>

      {/* 2. CENTER SECTION: Title & Invoice / Reference Number Formatting */}
      <div className="text-center flex flex-col items-center justify-center pt-2 border-t border-slate-200">
        <h1 className="font-black text-[18px] sm:text-[20px] text-slate-950 tracking-tight uppercase leading-snug">
          {t(documentTitle, documentTitle)}
        </h1>

        {voucherCode && (
          <div className="mt-1 font-mono font-bold text-[13px] text-slate-900 bg-slate-100/80 px-2.5 py-0.5 rounded border border-slate-300">
            {formattedVoucherDisplay}
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-700 font-mono">
          {transactionDate && (
            <span>
              {transactionDate.startsWith('Date:')
                ? transactionDate
                : `Date: ${transactionDate}`}
            </span>
          )}
          {refNumber !== undefined && (
            <>
              {transactionDate && <span>•</span>}
              <span>Ref #: {refNumber || '—'}</span>
            </>
          )}
          {shouldRenderStatusBadge && (
            <>
              {(transactionDate || refNumber !== undefined) && <span>•</span>}
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] uppercase ${
                  status!.toLowerCase().includes('post') ||
                  status!.toLowerCase().includes('approv') ||
                  status!.toLowerCase().includes('confirm')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : status!.toLowerCase().includes('draft')
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                }`}
              >
                {status}
              </span>
            </>
          )}
        </div>

        {periodText && (
          <div className="mt-0.5 text-[10.5px] font-mono font-semibold text-slate-600">
            {periodText}
          </div>
        )}
      </div>
    </div>
  );
}

export interface CorporatePrintableFooterProps {
  voucherCode?: string;
  isInvoice?: boolean;
  copyrightNotice?: string;
  websiteUrl?: string;
  className?: string;
}

/**
 * Standardized Corporate Printable Document Footer
 * Enforces clean, single-line border-separated footer at bottom edge:
 * - Left: Unique Document Voucher Reference Code (e.g. Invoice No: 2026-0042)
 * - Center: Copyright © 2026 Vanguard ERP. All Rights Reserved.
 * - Right: www.vanguard-erp.net
 */
export function CorporatePrintableFooter({
  voucherCode = 'INV-2026-0001',
  isInvoice,
  copyrightNotice = 'Copyright © 2026 Vanguard ERP. All Rights Reserved.',
  websiteUrl = 'www.vanguard-erp.net',
  className = '',
}: CorporatePrintableFooterProps) {
  const { t } = useLanguage();

  const isInvoiceDoc =
    isInvoice !== undefined
      ? isInvoice
      : Boolean(
          voucherCode &&
            (voucherCode.toUpperCase().startsWith('INV') ||
              voucherCode.toUpperCase().includes('INVOICE') ||
              /^\d{4}-\d+$/.test(voucherCode.trim()))
        );

  const defaultPrefix = isInvoiceDoc ? 'Invoice No:' : 'Ref:';

  let cleanVoucher = voucherCode ? voucherCode.trim() : '';
  if (isInvoiceDoc && cleanVoucher) {
    cleanVoucher = cleanVoucher
      .replace(/^Invoice\s*(No|#):?\s*/i, '')
      .replace(/^INV-/i, '')
      .trim();
  }

  const formattedRef = cleanVoucher
    ? isInvoiceDoc
      ? `Invoice No: ${cleanVoucher}`
      : cleanVoucher.startsWith('Ref:') ||
        cleanVoucher.startsWith('Doc Ref:') ||
        cleanVoucher.startsWith('Invoice No:') ||
        cleanVoucher.startsWith('Invoice #')
      ? cleanVoucher
      : `${defaultPrefix} ${cleanVoucher}`
    : 'Ref: VANGUARD-DOC';

  const cleanUrl = websiteUrl.replace(/^https?:\/\//i, '');

  return (
    <div
      style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
      className={`mt-8 pt-3 border-t border-slate-400 flex items-center justify-between text-[10px] font-sans text-slate-700 print:mt-2 print:pt-1 ${className}`}
    >
      <span className="font-mono font-bold tracking-wider text-slate-900">
        {formattedRef}
      </span>
      <span className="text-slate-600 font-medium text-center flex-1 px-4">
        {t(copyrightNotice, copyrightNotice)}
      </span>
      <div className="text-right">
        <a
          href={`https://${cleanUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline font-mono text-[10px]"
        >
          {cleanUrl}
        </a>
      </div>
    </div>
  );
}

export default Corporate3ZoneHeader;
