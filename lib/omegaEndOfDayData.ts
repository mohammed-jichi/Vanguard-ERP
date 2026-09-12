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
    BARANCHNAME: 'Zeit w zaytoun ljanoub',
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
  },
  {
    BRANCHID: 2,
    BARANCHNAME: 'Beirut Distribution Hub',
    OMEGA_CUSTID: 22902,
    end_of_day: 'Sep 05, 2026',
    status: 'Closed',
    invoicesCount: 96,
    grossSales: 3450.00,
    netSales: 3108.11,
    cashUsd: 2100.00,
    cashLbp: 89000000,
    cardPayments: 340.00,
    omnichannel: 110.00,
    taxVat: 341.89,
    voidsCount: 1,
    discounts: 45.00,
    cashier: 'Hiba Aloulou (Register #2)'
  },
  {
    BRANCHID: 3,
    BARANCHNAME: 'Saida Regional Depot',
    OMEGA_CUSTID: 22903,
    end_of_day: 'Sep 04, 2026',
    status: 'Closed',
    invoicesCount: 78,
    grossSales: 2890.00,
    netSales: 2603.60,
    cashUsd: 1800.00,
    cashLbp: 68500000,
    cardPayments: 280.00,
    omnichannel: 95.00,
    taxVat: 286.40,
    voidsCount: 0,
    discounts: 30.00,
    cashier: 'Rami Mroueh'
  },
  {
    BRANCHID: 4,
    BARANCHNAME: 'Tyre Coastal Center',
    OMEGA_CUSTID: 22904,
    end_of_day: 'Sep 04, 2026',
    status: 'Closed',
    invoicesCount: 64,
    grossSales: 2150.00,
    netSales: 1936.94,
    cashUsd: 1400.00,
    cashLbp: 52000000,
    cardPayments: 190.00,
    omnichannel: 60.00,
    taxVat: 213.06,
    voidsCount: 2,
    discounts: 25.00,
    cashier: 'Ziad Zaher'
  }
];
