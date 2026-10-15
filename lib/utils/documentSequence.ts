/**
 * Vanguard ERP - Unified 7-Digit Sequential Document Numbering Engine
 *
 * All printable and auditable business documents adhere to the standardized 7-digit format:
 * [FirstDigit][6-Digit Counter starting at 002601]
 *
 * Matrix of First Digits:
 * - SALES_INVOICE      -> '0' -> 0002601, 0002602, 0002603...
 * - QUOTATION          -> '1' -> 1002601, 1002602, 1002603...
 * - DELIVERY_NOTE      -> '2' -> 2002601, 2002602, 2002603...
 * - PURCHASE_ORDER     -> '3' -> 3002601, 3002602, 3002603...
 * - CREDIT_NOTE        -> '4' -> 4002601, 4002602, 4002603...
 * - CUSTOMER_RECEIPT   -> '5' -> 5002601, 5002602, 5002603...
 * - CASH_VOUCHER       -> '6' -> 6002601, 6002602, 6002603... (Paid In / Paid Out)
 * - STOCK_TRANSFER     -> '7' -> 7002601, 7002602, 7002603...
 * - INVENTORY_ADJUSTMENT-> '8' -> 8002601, 8002602, 8002603...
 * - MAIN_READING       -> '9' -> 9002601, 9002602, 9002603... (X/Z POS Readings)
 *
 * Storage & Sync:
 * - LocalStorage key: 'vanguard_doc_sequences_v1'
 * - Realtime Window Event: 'vanguard_document_sequence_updated'
 * - Cloud Persist: Supabase tenants.feature_flags.document_sequences
 */

import { supabase } from '@/lib/supabaseClient';

export type DocumentSequenceType =
  | 'SALES_INVOICE'
  | 'QUOTATION'
  | 'DELIVERY_NOTE'
  | 'PURCHASE_ORDER'
  | 'CREDIT_NOTE'
  | 'CUSTOMER_RECEIPT'
  | 'CASH_VOUCHER'
  | 'STOCK_TRANSFER'
  | 'INVENTORY_ADJUSTMENT'
  | 'MAIN_READING';

export const DOCUMENT_PREFIX_DIGITS: Record<DocumentSequenceType, string> = {
  SALES_INVOICE: '0',
  QUOTATION: '1',
  DELIVERY_NOTE: '2',
  PURCHASE_ORDER: '3',
  CREDIT_NOTE: '4',
  CUSTOMER_RECEIPT: '5',
  CASH_VOUCHER: '6',
  STOCK_TRANSFER: '7',
  INVENTORY_ADJUSTMENT: '8',
  MAIN_READING: '9',
};

export const BASE_SEQUENCE_START = 2601;
export const DOCUMENT_SEQUENCES_STORAGE_KEY = 'vanguard_doc_sequences_v1';
export const DOCUMENT_SEQUENCE_UPDATED_EVENT = 'vanguard_document_sequence_updated';

export type DocumentSequencesState = Record<DocumentSequenceType, number>;

export const DEFAULT_DOCUMENT_SEQUENCES: DocumentSequencesState = {
  SALES_INVOICE: BASE_SEQUENCE_START,
  QUOTATION: BASE_SEQUENCE_START,
  DELIVERY_NOTE: BASE_SEQUENCE_START,
  PURCHASE_ORDER: BASE_SEQUENCE_START,
  CREDIT_NOTE: BASE_SEQUENCE_START,
  CUSTOMER_RECEIPT: BASE_SEQUENCE_START,
  CASH_VOUCHER: BASE_SEQUENCE_START,
  STOCK_TRANSFER: BASE_SEQUENCE_START,
  INVENTORY_ADJUSTMENT: BASE_SEQUENCE_START,
  MAIN_READING: BASE_SEQUENCE_START,
};

/**
 * Standard formatting formula: [FirstDigit][6-Digit Counter starting at 002601]
 * e.g., prefix '0' and counter 2601 => '0002601'
 */
export const formatDocNumber = (prefixDigit: string, counter: number): string => {
  return `${prefixDigit}${String(counter).padStart(6, '0')}`;
};

/**
 * Extracts the 6-digit counter number from any document number string.
 * Strips legacy prefixes (e.g. INV-2026-0002601, CRN-, PO-, etc.) if present.
 */
export function extractDocCounter(docNumber: string | number | undefined | null, expectedPrefixDigit?: string): number | null {
  if (docNumber === undefined || docNumber === null) return null;
  const str = String(docNumber).trim();
  if (!str) return null;

  // 1. Direct exact 7-digit pattern: e.g. "0002601" or "1002601"
  const directMatch = str.match(/^([0-9])([0-9]{6})$/);
  if (directMatch) {
    if (!expectedPrefixDigit || directMatch[1] === expectedPrefixDigit) {
      return parseInt(directMatch[2], 10);
    }
  }

  // 2. Embedded 7-digit number inside legacy text: e.g. "INV-2026-0002601", "CRN-4002601", "DN-2002601"
  const prefixPattern = expectedPrefixDigit !== undefined ? expectedPrefixDigit : '[0-9]';
  const embeddedRegex = new RegExp(`(?:^|[^0-9])(${prefixPattern})([0-9]{6})(?:$|[^0-9])`);
  const embeddedMatch = str.match(embeddedRegex);
  if (embeddedMatch) {
    return parseInt(embeddedMatch[2], 10);
  }

  // 3. Fallback: If string is pure digits and >= 2601
  const digitsOnly = str.replace(/\D/g, '');
  if (digitsOnly.length >= 4) {
    const val = parseInt(digitsOnly, 10);
    if (val >= BASE_SEQUENCE_START && val < 1000000) {
      return val;
    }
  }

  return null;
}

/**
 * Returns currently cached document sequences synchronously from localStorage.
 */
export function getCachedDocSequences(): DocumentSequencesState {
  if (typeof window === 'undefined') return { ...DEFAULT_DOCUMENT_SEQUENCES };
  try {
    const raw = localStorage.getItem(DOCUMENT_SEQUENCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const state: DocumentSequencesState = { ...DEFAULT_DOCUMENT_SEQUENCES };
      for (const key of Object.keys(DEFAULT_DOCUMENT_SEQUENCES) as DocumentSequenceType[]) {
        if (typeof parsed[key] === 'number' && parsed[key] >= BASE_SEQUENCE_START) {
          state[key] = parsed[key];
        }
      }
      return state;
    }
  } catch (err) {
    console.warn('Failed to parse cached doc sequences:', err);
  }
  return { ...DEFAULT_DOCUMENT_SEQUENCES };
}

/**
 * Persists document sequences to localStorage, dispatches realtime event,
 * and dual-syncs to Supabase feature_flags.
 */
export function saveDocSequences(sequences: DocumentSequencesState, tenantId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOCUMENT_SEQUENCES_STORAGE_KEY, JSON.stringify(sequences));
    window.dispatchEvent(new CustomEvent(DOCUMENT_SEQUENCE_UPDATED_EVENT, { detail: sequences }));
  } catch (err) {
    console.warn('Failed to save document sequences to localStorage:', err);
  }

  // Dual persist to Supabase tenants.feature_flags (non-blocking)
  const targetTenantId = (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-'))
    ? tenantId
    : '00000000-0000-0000-0000-000000000001';

  try {
    Promise.resolve(
      supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle()
    )
      .then(async ({ data }) => {
        const flags = (data?.feature_flags as Record<string, any>) || {};
        await supabase
          .from('tenants')
          .update({
            feature_flags: {
              ...flags,
              document_sequences: sequences
            }
          })
          .eq('id', targetTenantId);
      })
      .catch(() => {});
  } catch {}
}

/**
 * Returns the next sequential 7-digit number for the given document type WITHOUT incrementing
 * the stored counter. This prevents wasting document numbers on page reloads or view navigation.
 *
 * If existingNumbers are provided, it guarantees that the returned number is strictly greater
 * than the highest existing sequential number of that document type.
 */
export function peekNextDocNumber(
  docType: DocumentSequenceType,
  existingNumbers?: (string | { [key: string]: any })[]
): string {
  const prefixDigit = DOCUMENT_PREFIX_DIGITS[docType];
  const sequences = getCachedDocSequences();
  let candidateCounter = sequences[docType] || BASE_SEQUENCE_START;

  if (existingNumbers && Array.isArray(existingNumbers) && existingNumbers.length > 0) {
    let maxExistingCounter = 0;
    for (const item of existingNumbers) {
      let strVal = '';
      if (typeof item === 'string') {
        strVal = item;
      } else if (item && typeof item === 'object') {
        strVal =
          item.invoiceNumber ||
          item.invoiceNo ||
          item.quotationNumber ||
          item.quotationNo ||
          item.reqNo ||
          item.receiptNo ||
          item.movementNo ||
          item.poNumber ||
          item.ADJUSTID ||
          item.id ||
          '';
      }
      if (strVal) {
        const counter = extractDocCounter(strVal, prefixDigit);
        if (counter !== null && counter > maxExistingCounter) {
          maxExistingCounter = counter;
        }
      }
    }

    if (maxExistingCounter >= BASE_SEQUENCE_START) {
      candidateCounter = Math.max(candidateCounter, maxExistingCounter + 1);
    }
  }

  return formatDocNumber(prefixDigit, candidateCounter);
}

/**
 * Advances and persists the sequence counter when a document is saved or posted.
 * Returns the committed 7-digit document number.
 */
export function commitNextDocNumber(
  docType: DocumentSequenceType,
  usedNumber?: string,
  tenantId?: string
): string {
  const prefixDigit = DOCUMENT_PREFIX_DIGITS[docType];
  const sequences = getCachedDocSequences();
  let currentCounter = sequences[docType] || BASE_SEQUENCE_START;

  if (usedNumber) {
    const usedCounter = extractDocCounter(usedNumber, prefixDigit);
    if (usedCounter !== null && usedCounter >= BASE_SEQUENCE_START) {
      currentCounter = Math.max(currentCounter, usedCounter + 1);
    } else {
      currentCounter += 1;
    }
  } else {
    currentCounter += 1;
  }

  sequences[docType] = currentCounter;
  saveDocSequences(sequences, tenantId);

  return formatDocNumber(prefixDigit, currentCounter - 1);
}

/**
 * Clean legacy prefixes such as INV-2026-, INV-, DN-, CRN-, PO-, etc.
 * Returns clean document number or formatted 7-digit representation.
 */
export function cleanDocumentNumber(rawNo: string | undefined | null): string {
  if (!rawNo) return '';
  return String(rawNo).replace(/^(?:INV-2026-|INV-|CRN-2026-|CRN-|DN-|PO-2026-|PO-|RV-|PI-|PO-|TRN-2026-|TRN-|ADJ-|QT-2026-|QT-|QUO-2026-|QUO-)/i, '').trim();
}

/**
 * Formats a clean display label for UI headers and print headers.
 * e.g., "Invoice #0002601", "Quotation #1002601", "Delivery Note #2002601"
 */
export function formatDocLabel(docType: DocumentSequenceType, docNumber: string): string {
  const cleanNo = cleanDocumentNumber(docNumber);
  switch (docType) {
    case 'SALES_INVOICE':
      return `Invoice #${cleanNo}`;
    case 'QUOTATION':
      return `Quotation #${cleanNo}`;
    case 'DELIVERY_NOTE':
      return `Delivery Note #${cleanNo}`;
    case 'PURCHASE_ORDER':
      return `Purchase Order #${cleanNo}`;
    case 'CREDIT_NOTE':
      return `Credit Note #${cleanNo}`;
    case 'CUSTOMER_RECEIPT':
      return `Customer Receipt #${cleanNo}`;
    case 'CASH_VOUCHER':
      return `Cash Voucher #${cleanNo}`;
    case 'STOCK_TRANSFER':
      return `Transfer Note #${cleanNo}`;
    case 'INVENTORY_ADJUSTMENT':
      return `Adjustment #${cleanNo}`;
    case 'MAIN_READING':
      return `Reading Slip #${cleanNo}`;
    default:
      return `#${cleanNo}`;
  }
}
