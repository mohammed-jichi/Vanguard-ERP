/**
 * Vanguard ERP / Vanguard ERP - More Setup Models & Live Seed Data
 * Section: Void Reasons, VAT Exemption Reasons, Message on Invoice
 * Branch: 22901 - Main Branch
 */

export interface OmegaBranchOption {
  BRANCHID: number | string;
  BARANCHNAME: string;
}

export const OMEGA_BRANCHES: OmegaBranchOption[] = [
  { BRANCHID: 1, BARANCHNAME: 'Main Branch' }
];

// ==========================================
// 1. VOID REASONS
// ==========================================
export interface OmegaVoidReason {
  ID: number;
  VOIDID: number;
  BRAND_ID: number;
  BRANCHID: number;
  VOIDDESCRIPTION: string;
  DISCONTINUED: number; // -1 = Discontinued, 0 = Active
  branch_excp: Array<{ BRANCHID: number; BARANCHNAME: string }>;
}

export const INITIAL_VOID_REASONS: OmegaVoidReason[] = [];

// ==========================================
// 2. VAT EXEMPTION REASONS
// ==========================================
export interface OmegaVatExemptionReason {
  ID: number;
  VATEXEMPTIONREASON: string;
}

export const INITIAL_VAT_EXEMPTIONS: OmegaVatExemptionReason[] = [];

// ==========================================
// 3. MESSAGE ON INVOICE
// ==========================================
export interface OmegaInvoiceMessage {
  ID: number;
  MESSAGEID: number;
  BRAND_ID: number;
  FORBRANCH: number;
  BRANCHID: number;
  MESSAGEDESC: string;
  MESSAGETITLE: string;
  STATUS: number; // -1 = Default / True, 0 = Normal / False
  BARANCHNAME: string;
  MSGID?: number;
}

export const INITIAL_INVOICE_MESSAGES: OmegaInvoiceMessage[] = [];
