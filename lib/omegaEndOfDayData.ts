/**
 * Omega ERP / Vanguard ERP - End of Day Models & Live Seed Data
 * Module: EndOfDayView (ID: 190, Parent: 1)
 * Branch: 22901 - Zeit w zaytoun ljanoub
 */

export interface OmegaBranchEod {
  BRANCHID: number;
  BARANCHNAME: string;
  OMEGA_CUSTID: number;
  end_of_day: string;
  status: 'Closed' | 'Pending EOD' | 'In Shift';
  invoicesCount: number;
  grossSales: number;
  netSales: number;
  cashUsd: number;
  cashLbp: number;
  cardPayments: number;
  omnichannel: number;
  taxVat: number;
  voidsCount: number;
  discounts: number;
  cashier: string;
}

export const INITIAL_EOD_BRANCHES: OmegaBranchEod[] = [
  {
    BRANCHID: 1,
    BARANCHNAME: 'Southern Olive and Oil Products - Main',
    OMEGA_CUSTID: 22901,
    end_of_day: 'Sep 05, 2026',
    status: 'Pending EOD',
    invoicesCount: 142,
    grossSales: 5290.00,
    netSales: 4765.77,
    cashUsd: 3120.00,
    cashLbp: 144500000,
    cardPayments: 510.00,
    omnichannel: 230.00,
    taxVat: 524.23,
    voidsCount: 3,
    discounts: 110.00,
    cashier: 'Mohammed Jichi (Cashier Thermal)'
  }
];
