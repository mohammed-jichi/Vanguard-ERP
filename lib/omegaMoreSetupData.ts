/**
 * Omega ERP / Vanguard ERP - More Setup Models & Live Seed Data
 * Section: Void Reasons, VAT Exemption Reasons, Message on Invoice
 * Branch: 22901 - Zeit w zaytoun ljanoub
 */

export interface OmegaBranchOption {
  BRANCHID: number | string;
  BARANCHNAME: string;
}

export const OMEGA_BRANCHES: OmegaBranchOption[] = [
  { BRANCHID: 1, BARANCHNAME: 'Zeit w zaytoun ljanoub' }
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

export const INITIAL_VOID_REASONS: OmegaVoidReason[] = [
  {
    ID: 2075,
    VOIDID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'COLD',
    DISCONTINUED: -1,
    branch_excp: []
  },
  {
    ID: 2076,
    VOIDID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'DELAY',
    DISCONTINUED: -1,
    branch_excp: []
  },
  {
    ID: 2077,
    VOIDID: 977,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'CHANGE HIS MIND',
    DISCONTINUED: 0,
    branch_excp: []
  },
  {
    ID: 2078,
    VOIDID: 1014,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'WASTE',
    DISCONTINUED: 0,
    branch_excp: []
  },
  {
    ID: 2079,
    VOIDID: 1015,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'KITCHEN MISTAKE',
    DISCONTINUED: 0,
    branch_excp: []
  },
  {
    ID: 2080,
    VOIDID: 1016,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'تعداد خاطئ',
    DISCONTINUED: 0,
    branch_excp: []
  },
  {
    ID: 2081,
    VOIDID: 1017,
    BRAND_ID: 9606,
    BRANCHID: 1,
    VOIDDESCRIPTION: 'مرتجع',
    DISCONTINUED: 0,
    branch_excp: []
  }
];

// ==========================================
// 2. VAT EXEMPTION REASONS
// ==========================================
export interface OmegaVatExemptionReason {
  ID: number;
  VATEXEMPTIONREASON: string;
}

export const INITIAL_VAT_EXEMPTIONS: OmegaVatExemptionReason[] = [
  {
    ID: 1,
    VATEXEMPTIONREASON: 'Export of goods outside Lebanon (Art. 11)'
  },
  {
    ID: 2,
    VATEXEMPTIONREASON: 'Diplomatic missions & international bodies (Art. 13)'
  },
  {
    ID: 3,
    VATEXEMPTIONREASON: 'International transport services - Air & Sea'
  },
  {
    ID: 4,
    VATEXEMPTIONREASON: 'Agricultural inputs & unprocessed farm products'
  },
  {
    ID: 5,
    VATEXEMPTIONREASON: 'Healthcare, medical supplies & pharmaceutical products'
  },
  {
    ID: 6,
    VATEXEMPTIONREASON: 'Educational & non-profit registered institutions'
  }
];

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

export const INITIAL_INVOICE_MESSAGES: OmegaInvoiceMessage[] = [
  {
    ID: 10994,
    MESSAGEID: 1000,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    MESSAGEDESC: 'Unlock rewards: Scan now for exclusive loyalty benefits!',
    MESSAGETITLE: 'MERITS',
    STATUS: 0,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    MSGID: 1
  },
  {
    ID: 10994,
    MESSAGEID: 1001,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    MESSAGEDESC: 'Your feedback matters! Scan the QR code to share your experience.',
    MESSAGETITLE: 'Feedback',
    STATUS: 0,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    MSGID: 2
  },
  {
    ID: 10994,
    MESSAGEID: 1002,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    MESSAGEDESC: 'إن البضاعة المباعة لا ترد وتبدل فقط',
    MESSAGETITLE: 'No Return Policy',
    STATUS: -1,
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
    MSGID: 3
  }
];
