'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Sanitizes and normalizes branch/facility names:
 * Purges duplicate "Branch: Branch:" and legacy distorted naming.
 */
export function sanitizeFacilityName(branch?: string): string {
  if (!branch) return 'Facility: [1300-01] Southern Olive and Oil Products - Main';
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
  cleaned = cleaned.replace(/Zeit w zaytoun ljanoub/gi, 'Southern Olive and Oil Products - Main');
  cleaned = cleaned.replace(/\s*\(\s*Choueifat Main Facility\s*\)/gi, '');
  cleaned = cleaned.replace(/Choueifat Main Plant/gi, 'Southern Olive and Oil Products - Main');

  if (cleaned.startsWith('[1300-') || cleaned.startsWith('Facility: [1300-')) {
    return cleaned.startsWith('Facility:') ? cleaned : `Facility: ${cleaned}`;
  }

  if (cleaned.startsWith('1300-01')) {
    return 'Facility: [1300-01] Southern Olive and Oil Products - Main';
  }

  if (cleaned.startsWith('1300-')) {
    const match = cleaned.match(/^(1300-\d+)\s*[-–•:]*\s*(.*)$/);
    if (match) {
      return `Facility: [${match[1]}] ${match[2] || 'Branch Facility'}`;
    }
    return `Facility: [${cleaned}]`;
  }

  if (
    !cleaned ||
    lower === 'main branch' ||
    lower.includes('southern olive and oil products - main') ||
    lower.includes('choueifat')
  ) {
    return 'Facility: [1300-01] Southern Olive and Oil Products - Main';
  }

  return `Facility: ${cleaned}`;
}

export interface Corporate3ZoneHeaderProps {
  // Left Zone (Head Office)
  companyName?: string;
  companyArabicName?: string;
  hqAddress?: string;
  companyWebsite?: string;
  hqPhone?: string;
  printDate?: string;

  // Center Zone (Dynamic Document Title & Metadata)
  documentTitle: string;
  voucherCode?: string;
  transactionDate?: string;
  status?: string;
  periodText?: string;

  // Right Zone (Active Branch / Facility)
  facilityName?: string;
  facilityAddress?: string;
  facilityDirect?: string;
  pageInfo?: string;

  className?: string;
}

/**
 * Standardized 3-Zone Corporate Document Header
 * +---------------------------------------------------------------------------------------------------------+
 * | [LEFT ZONE - Head Office]            |           [CENTER ZONE]          | [RIGHT ZONE - Active Branch]  |
 * | Southern Olive Oil S.A.R.L.          |           SALES INVOICE          | Facility: Choueifat Main Plant|
 * | منتوجات زيت وزيتون الجنوب ش.م.م     |      Ref #: INV-2026-0042        | Industrial Zone, Old Saida Rd |
 * | Choueifat Central Highway, Lebanon   |  Date: 01-Oct-2026 • Status: POST| Dispatch / Cell: +961 70 00000|
 * | www.southernolive-lb.com             |                                  | Page 1 of 1                   |
 * | Tel / Direct: +961 05 430 000        |                                  |                               |
 * | Print Date: 01-Oct-2026              |                                  |                               |
 * +---------------------------------------------------------------------------------------------------------+
 */
export function Corporate3ZoneHeader({
  companyName = 'Southern Olive Oil S.A.R.L.',
  companyArabicName = 'منتوجات زيت وزيتون الجنوب ش.م.م',
  hqAddress = 'Old Saida Road, Choueifat, Lebanon',
  companyWebsite = 'www.southernolive-lb.com',
  hqPhone = 'Tel / Support: +961 05 430 000',
  printDate,
  documentTitle,
  voucherCode,
  transactionDate,
  status,
  periodText,
  facilityName = 'Facility: 1300-01 - Choueifat Main Facility',
  facilityAddress = 'Industrial Zone, Old Saida Rd',
  facilityDirect = 'Dispatch / Cell: +961 70 000 000',
  pageInfo = 'Page 1 of 1',
  className = '',
}: Corporate3ZoneHeaderProps) {
  const { t } = useLanguage();

  const rawDate =
    printDate ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const displayDate = rawDate.startsWith('Print Date:') || rawDate.startsWith('Date:')
    ? rawDate
    : `Print Date: ${rawDate}`;

  const cleanFacility = sanitizeFacilityName(facilityName);
  const cleanWebsite = companyWebsite.replace(/^https?:\/\//i, '');
  const isConsolidated = cleanFacility.toLowerCase().includes('consolidated') || cleanFacility.toLowerCase().includes('enterprise');
  const resolvedAddress = isConsolidated ? 'Enterprise Consolidated Audit' : facilityAddress;
  const resolvedDirect = isConsolidated ? 'Tenant Master Central Dispatch' : facilityDirect;

  return (
    <div className={`w-full pb-3 mb-4 border-b-2 border-slate-900 font-sans text-slate-800 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* [LEFT ZONE - Head Office] */}
        <div className="text-left flex flex-col justify-start text-[11px] leading-tight space-y-0.5">
          <div className="font-black text-[13.5px] text-slate-950 tracking-tight">
            {t(companyName, companyName)}
          </div>
          {companyArabicName && (
            <div className="text-slate-700 font-bold text-[11px] font-arabic">
              {companyArabicName}
            </div>
          )}
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
            {hqPhone.startsWith('Tel') ? hqPhone : `Tel / Support: ${hqPhone}`}
          </div>
          <div className="text-slate-500 font-mono text-[10px] pt-0.5">
            {displayDate}
          </div>
        </div>

        {/* [CENTER ZONE - Dynamic Document Title & Identification] */}
        <div className="text-center flex flex-col items-center justify-center pt-0.5">
          <h1 className="font-black text-[17px] sm:text-[19px] text-slate-950 tracking-tight uppercase leading-snug">
            {t(documentTitle, documentTitle)}
          </h1>

          {voucherCode && (
            <div className="mt-1 font-mono font-bold text-[13px] text-slate-900 bg-slate-100/80 px-2.5 py-0.5 rounded border border-slate-300">
              {voucherCode.includes('#') || voucherCode.startsWith('Ref') || voucherCode.startsWith('Doc')
                ? voucherCode
                : `Ref #: ${voucherCode}`}
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-700 font-mono">
            {transactionDate && (
              <span>
                {transactionDate.startsWith('Date:') ? transactionDate : `Date: ${transactionDate}`}
              </span>
            )}
            {transactionDate && status && <span>•</span>}
            {status && (
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] uppercase ${
                  status.toLowerCase().includes('post') || status.toLowerCase().includes('approv') || status.toLowerCase().includes('confirm')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : status.toLowerCase().includes('draft')
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                }`}
              >
                {status}
              </span>
            )}
          </div>

          {periodText && (
            <div className="mt-0.5 text-[10.5px] font-mono font-semibold text-slate-600">
              {periodText}
            </div>
          )}
        </div>

        {/* [RIGHT ZONE - Active Facility & Pagination] */}
        <div className="text-right flex flex-col justify-start items-end text-[11px] leading-tight space-y-0.5">
          <div className="font-bold text-[13px] text-slate-900">
            {t(cleanFacility, cleanFacility)}
          </div>
          <div className="text-slate-600 font-medium">
            {t(resolvedAddress, resolvedAddress)}
          </div>
          <div className="text-slate-600 font-mono text-[10.5px]">
            {resolvedDirect}
          </div>
          <div className="text-slate-500 font-mono text-[10px] pt-1">
            {pageInfo}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface CorporatePrintableFooterProps {
  voucherCode?: string;
  copyrightNotice?: string;
  websiteUrl?: string;
  className?: string;
}

/**
 * Standardized Corporate Printable Document Footer
 * Enforces clean, single-line border-separated footer at bottom edge:
 * - Left: Unique Document Voucher Reference Code (e.g. Ref: INV-2026-0042)
 * - Center: Copyright © 2026 Vanguard ERP. All Rights Reserved.
 * - Right: www.vanguard-erp.net
 */
export function CorporatePrintableFooter({
  voucherCode = 'INV-2026-0001',
  copyrightNotice = 'Copyright © 2026 Vanguard ERP. All Rights Reserved.',
  websiteUrl = 'www.vanguard-erp.net',
  className = '',
}: CorporatePrintableFooterProps) {
  const { t } = useLanguage();

  const formattedRef = voucherCode
    ? voucherCode.startsWith('Ref:') || voucherCode.startsWith('Doc Ref:')
      ? voucherCode
      : `Ref: ${voucherCode}`
    : 'Ref: VANGUARD-DOC';

  const cleanUrl = websiteUrl.replace(/^https?:\/\//i, '');

  return (
    <div
      className={`mt-8 pt-3 border-t border-slate-400 flex items-center justify-between text-[10px] font-sans text-slate-700 print:mt-4 ${className}`}
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
