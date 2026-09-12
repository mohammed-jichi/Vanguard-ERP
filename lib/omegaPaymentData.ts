// Vanguard ERP - Omega ERP Payment Types Live Simulation Data
// Extracted from Customer 22901 (شركة منتجات الزيتون والزيت الجنوبية S.A.R.L - Zeit w zaytoun ljanoub)

export interface OmegaPaymentType {
  ID: number;
  PAYMENTID: number;
  PAYIDBRANCHID: number;
  BRAND_ID: number;
  BRANCHID: number;
  PAYMENTTYPE: string;
  PAYMENTCURRENCY: number;
  CREDIT: number;
  CREDITVALUE?: string;
  ACCNO: string | null;
  DEPOSITACCNO: string | null;
  CHANGESTATUS: number;
  PAYMENTSTATUS?: string;
  CREDITCARDOPTIONS: number | null;
  OPENCASHDRAWER: boolean | null;
  MESSAGEONINVID: number;
  COMMISSIONCHARGE: number | null;
  PREPAIDTYPE: number | null;
  PRICEOFTICKET: number | null;
  PRICE2OFTICKET: number | null;
  INSTRUCTION: string | null;
  SORTING: number;
  NOTACTIVE: number;
  TOTALEXCEPTIONS?: number;
  sd_paymenttype_brand_branch?: { BRANCHID: number; BRANCHNAME: string }[];
}

export interface OmegaCurrency {
  ID: number;
  BRAND_ID: number;
  BRANCHID: number;
  DESCRIPTION: string;
  RATE: number;
  SYNBOL: string;
  ASYNBOL: string;
  DIGITNUMBER: number;
  BACKRATE: number;
  DECIMALNBRINV: number | null;
  maincurrency: number;
}

export interface OmegaInvoiceMessage {
  ID: number;
  MESSAGEID: number;
  BRAND_ID: number;
  FORBRANCH: number;
  BRANCHID: number;
  MESSAGEDESC: string;
  MESSAGETITLE: string;
  STATUS: number;
}

export interface OmegaAccount {
  account_number: string;
  account_name: string;
  account_type: string;
  currency: string;
  balance?: number;
}

export interface OmegaPaymentBill {
  ID: number;
  TYPES: string;
  PAYMENTID: number;
  PAYMENTTYPE: string;
  PICTURE?: string;
}

export const OMEGA_PAYMENT_TYPES_OPTIONS = [
  { value: 0, description: "Credit" },
  { value: 1, description: "Credit Card" },
  { value: 2, description: "Room Charge" },
  { value: 3, description: "Cash" },
  { value: 4, description: "Ticket Restaurant" },
  { value: 5, description: "Gift Certificate or coupons" },
  { value: 7, description: "Check" }
];

export const OMEGA_CREDIT_CARD_OPTIONS = [
  { value: 0, description: "Null" },
  { value: 1, description: "Show Credit Card Details" },
  { value: 2, description: "Read Credit Card" },
  { value: 3, description: "Enter The Credit Card Number Only" }
];

export const OMEGA_TICKET_OPTIONS = [
  { value: 1, description: "Regular Ticket" },
  { value: 2, description: "Prepaid Ticket" },
  { value: 3, description: "Yearly Membership" }
];

export const OMEGA_PAYMENT_STATUS_OPTIONS = [
  { value: 0, description: "Tip Entry" },
  { value: 1, description: "Change" }
];

export const OMEGA_BRANCHES = [
  {
    BRANCHID: 1,
    BARANCHNAME: "Zeit w zaytoun ljanoub",
    OTHERNAME: "شركة منتجات الزيتون والزيت الجنوبية S.A.R.L",
    CITY: "Kfarchima",
    STREET: "Old Saida Raod",
    PHONE1: "707673828"
  }
];

export const OMEGA_CURRENCIES: OmegaCurrency[] = [
  {
    ID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: "LBP",
    RATE: 1,
    SYNBOL: "LL",
    ASYNBOL: "LL",
    DIGITNUMBER: 0,
    BACKRATE: 1,
    DECIMALNBRINV: 0,
    maincurrency: 1
  },
  {
    ID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: "USD",
    RATE: 90000,
    SYNBOL: "$",
    ASYNBOL: "$",
    DIGITNUMBER: 2,
    BACKRATE: 90000,
    DECIMALNBRINV: 0,
    maincurrency: 2
  },
  {
    ID: 4088,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: "EURO",
    RATE: 2000,
    SYNBOL: "EU",
    ASYNBOL: "EU",
    DIGITNUMBER: 2,
    BACKRATE: 2000,
    DECIMALNBRINV: 0,
    maincurrency: 3
  },
  {
    ID: 4089,
    BRAND_ID: 9606,
    BRANCHID: 1,
    DESCRIPTION: "Lebanese Pound",
    RATE: 90000,
    SYNBOL: "L.B",
    ASYNBOL: "L.B.P",
    DIGITNUMBER: 0,
    BACKRATE: 90000,
    DECIMALNBRINV: null,
    maincurrency: 3
  }
];

export const OMEGA_INVOICE_MESSAGES: OmegaInvoiceMessage[] = [
  {
    ID: 2,
    MESSAGEID: 1001,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    MESSAGEDESC: "Your feedback matters! Scan the QR code to share your experience.",
    MESSAGETITLE: "Feedback",
    STATUS: 0
  },
  {
    ID: 1,
    MESSAGEID: 1000,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    MESSAGEDESC: "Unlock rewards: Scan now for exclusive loyalty benefits!",
    MESSAGETITLE: "MERITS",
    STATUS: 0
  },
  {
    ID: 3,
    MESSAGEID: 1002,
    BRAND_ID: 9606,
    FORBRANCH: 1,
    BRANCHID: 1,
    MESSAGEDESC: "إن البضاعة المباعة لا ترد وتبدل فقط",
    MESSAGETITLE: "No Return Policy",
    STATUS: -1
  }
];

export const OMEGA_ACCOUNTS: OmegaAccount[] = [
  {
    account_number: "58100010",
    account_name: "Bank Audi - POS Card Settlement (LBP)",
    account_type: "Bank",
    currency: "LBP",
    balance: 14250000
  },
  {
    account_number: "58100020",
    account_name: "Bank Audi - POS USD Visa/MC Terminal",
    account_type: "Bank",
    currency: "USD",
    balance: 8420.5
  },
  {
    account_number: "51100010",
    account_name: "Cash in Hand - Main POS Cashbox LBP",
    account_type: "Cash",
    currency: "LBP",
    balance: 38750000
  },
  {
    account_number: "51100020",
    account_name: "Cash in Hand - Register 1 Drawer (USD)",
    account_type: "Cash",
    currency: "USD",
    balance: 3120.0
  },
  {
    account_number: "41100010",
    account_name: "Trade Customers - General Credit Receivables",
    account_type: "Receivable",
    currency: "USD",
    balance: 12450.0
  },
  {
    account_number: "41100050",
    account_name: "Gift Certificates & Vouchers Clearing",
    account_type: "Liability",
    currency: "USD",
    balance: 450.0
  },
  {
    account_number: "51200010",
    account_name: "Petty Cash Box - Management Reserve",
    account_type: "Cash",
    currency: "USD",
    balance: 1500.0
  }
];

export const INITIAL_PAYMENT_TYPES: OmegaPaymentType[] = [
  {
    ID: 2678,
    PAYMENTID: 1,
    PAYIDBRANCHID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    PAYMENTTYPE: "CASH",
    PAYMENTCURRENCY: 1,
    CREDIT: 3,
    CREDITVALUE: "Cash",
    ACCNO: "51100010",
    DEPOSITACCNO: null,
    CHANGESTATUS: 1,
    PAYMENTSTATUS: "Change",
    CREDITCARDOPTIONS: null,
    OPENCASHDRAWER: true,
    MESSAGEONINVID: 1001,
    COMMISSIONCHARGE: null,
    PREPAIDTYPE: null,
    PRICEOFTICKET: null,
    PRICE2OFTICKET: null,
    INSTRUCTION: null,
    SORTING: 1,
    NOTACTIVE: 0,
    TOTALEXCEPTIONS: 0,
    sd_paymenttype_brand_branch: []
  },
  {
    ID: 2680,
    PAYMENTID: 18,
    PAYIDBRANCHID: 118,
    BRAND_ID: 9606,
    BRANCHID: 1,
    PAYMENTTYPE: "CASH USD",
    PAYMENTCURRENCY: 2,
    CREDIT: 3,
    CREDITVALUE: "Cash",
    ACCNO: "51100020",
    DEPOSITACCNO: null,
    CHANGESTATUS: 1,
    PAYMENTSTATUS: "Change",
    CREDITCARDOPTIONS: null,
    OPENCASHDRAWER: true,
    MESSAGEONINVID: 1001,
    COMMISSIONCHARGE: null,
    PREPAIDTYPE: null,
    PRICEOFTICKET: null,
    PRICE2OFTICKET: null,
    INSTRUCTION: null,
    SORTING: 118,
    NOTACTIVE: 0,
    TOTALEXCEPTIONS: 0,
    sd_paymenttype_brand_branch: []
  },
  {
    ID: 2679,
    PAYMENTID: 15,
    PAYIDBRANCHID: 115,
    BRAND_ID: 9606,
    BRANCHID: 1,
    PAYMENTTYPE: "CREDIT",
    PAYMENTCURRENCY: 1,
    CREDIT: 0,
    CREDITVALUE: "Credit",
    ACCNO: "41100010",
    DEPOSITACCNO: null,
    CHANGESTATUS: 1,
    PAYMENTSTATUS: "Change",
    CREDITCARDOPTIONS: null,
    OPENCASHDRAWER: false,
    MESSAGEONINVID: 0,
    COMMISSIONCHARGE: null,
    PREPAIDTYPE: null,
    PRICEOFTICKET: null,
    PRICE2OFTICKET: null,
    INSTRUCTION: null,
    SORTING: 115,
    NOTACTIVE: 0,
    TOTALEXCEPTIONS: 0,
    sd_paymenttype_brand_branch: []
  },
  {
    ID: 2681,
    PAYMENTID: 20,
    PAYIDBRANCHID: 120,
    BRAND_ID: 9606,
    BRANCHID: 1,
    PAYMENTTYPE: "CREDIT CARD",
    PAYMENTCURRENCY: 1,
    CREDIT: 1,
    CREDITVALUE: "Credit Card",
    ACCNO: "58100010",
    DEPOSITACCNO: "58100010",
    CHANGESTATUS: 1,
    PAYMENTSTATUS: "Change",
    CREDITCARDOPTIONS: 1,
    OPENCASHDRAWER: false,
    MESSAGEONINVID: 1000,
    COMMISSIONCHARGE: 1.5,
    PREPAIDTYPE: null,
    PRICEOFTICKET: null,
    PRICE2OFTICKET: null,
    INSTRUCTION: null,
    SORTING: 120,
    NOTACTIVE: 0,
    TOTALEXCEPTIONS: 0,
    sd_paymenttype_brand_branch: []
  },
  {
    ID: 2682,
    PAYMENTID: 21,
    PAYIDBRANCHID: 121,
    BRAND_ID: 9606,
    BRANCHID: 1,
    PAYMENTTYPE: "CREDIT CARD USD",
    PAYMENTCURRENCY: 2,
    CREDIT: 1,
    CREDITVALUE: "Credit Card",
    ACCNO: "58100020",
    DEPOSITACCNO: "58100020",
    CHANGESTATUS: 1,
    PAYMENTSTATUS: "Change",
    CREDITCARDOPTIONS: 1,
    OPENCASHDRAWER: false,
    MESSAGEONINVID: 1000,
    COMMISSIONCHARGE: 1.8,
    PREPAIDTYPE: null,
    PRICEOFTICKET: null,
    PRICE2OFTICKET: null,
    INSTRUCTION: null,
    SORTING: 121,
    NOTACTIVE: 0,
    TOTALEXCEPTIONS: 0,
    sd_paymenttype_brand_branch: []
  }
];

export const INITIAL_PAYMENT_BILLS: OmegaPaymentBill[] = [
  { ID: 1, TYPES: "100,000 LBP", PAYMENTID: 1, PAYMENTTYPE: "CASH" },
  { ID: 2, TYPES: "500,000 LBP", PAYMENTID: 1, PAYMENTTYPE: "CASH" },
  { ID: 3, TYPES: "1,000,000 LBP", PAYMENTID: 1, PAYMENTTYPE: "CASH" },
  { ID: 4, TYPES: "$5 USD", PAYMENTID: 18, PAYMENTTYPE: "CASH USD" },
  { ID: 5, TYPES: "$10 USD", PAYMENTID: 18, PAYMENTTYPE: "CASH USD" },
  { ID: 6, TYPES: "$20 USD", PAYMENTID: 18, PAYMENTTYPE: "CASH USD" },
  { ID: 7, TYPES: "$50 USD", PAYMENTID: 18, PAYMENTTYPE: "CASH USD" },
  { ID: 8, TYPES: "$100 USD", PAYMENTID: 18, PAYMENTTYPE: "CASH USD" }
];
