// Vanguard ERP - Omega ERP Coupons & Gift Certificates Live Simulation Data
// Extracted from Customer 22901 (منتوجات زيت وزيتون الجنوب ش.م.م - Zeit w zaytoun ljanoub)

export interface OmegaVoucherCustomer {
  ID: number;
  NAME: string;
  PHONE: string;
  EMAIL: string;
}

export interface OmegaVoucherEmployee {
  EMPLOYEEID: number;
  NAME: string;
}

export interface OmegaVoucher {
  ID: number;
  COUPON_ID: string;
  BRAND_ID: number;
  BRANCHID: number;
  VOUCHER_TYPE: number; // 0 = Coupon, 1 = Gift Certificate
  COUPON_VALUE: number;
  COUPON_CURRENCY?: string;
  COUPON_EXPIRYDATE: string;
  CONSUMED: number; // 0 = Not consumed, -1 = Consumed
  expired: number; // 0 = No, 1 = Yes
  NOT_ACTIVE: number; // 0 = Active, 1 = Deactivated
  DATE_INSERT: string;
  DATE_UPDATED: string;
  ANYONE_CAN_USE: number; // 1 = Anyone, 0 = Assigned customer
  CUSTOMERID?: number | null;
  customerAssigned?: OmegaVoucherCustomer | null;
  PAYMENTTYPEID?: number | null;
  EMPLOYEEID?: number | null;
  employeeAssigned?: string | null;
}

export interface OmegaVoucherCounts {
  total: number;
  total_value: number;
  consumed: number;
  consumed_value: number;
  expiredNotConsumed: number;
  expiredNotConsumed_value: number;
  valid: number;
  valid_value: number;
}

export const VOUCHER_STATUS_OPTIONS = [
  { id: 0, description: "All" },
  { id: 1, description: "Valid" },
  { id: 2, description: "Consumed" },
  { id: 3, description: "Expired" },
  { id: 4, description: "Deactivated" }
];

export const VOUCHER_TYPE_OPTIONS = [
  { id: -1, description: "All" },
  { id: 0, description: "Coupon" },
  { id: 1, description: "Gift Certificate" }
];

export const OMEGA_EMPLOYEES: OmegaVoucherEmployee[] = [
  { EMPLOYEEID: 1, NAME: "Jawad Jichi (Store Manager)" },
  { EMPLOYEEID: 2, NAME: "Ali Hassan (Senior Cashier)" },
  { EMPLOYEEID: 3, NAME: "Hussein Rida (POS Operator)" },
  { EMPLOYEEID: 4, NAME: "Sarah Hamdan (Sales Representative)" }
];

export const OMEGA_CUSTOMERS: OmegaVoucherCustomer[] = [
  { ID: 101, NAME: "Ahmad Kassir", PHONE: "+961 70 123456", EMAIL: "ahmad.kassir@gmail.com" },
  { ID: 102, NAME: "Rami Mroueh", PHONE: "+961 3 456789", EMAIL: "rami.mroueh@hotmail.com" },
  { ID: 103, NAME: "Zeinab Chami", PHONE: "+961 71 987654", EMAIL: "zeinab.chami@outlook.com" },
  { ID: 104, NAME: "Mohamad Berri", PHONE: "+961 76 554433", EMAIL: "mohamad.berri@gmail.com" },
  { ID: 105, NAME: "Fatima Nasser", PHONE: "+961 3 112233", EMAIL: "fatima.nasser@gmail.com" }
];

export const INITIAL_VOUCHERS: OmegaVoucher[] = [];
