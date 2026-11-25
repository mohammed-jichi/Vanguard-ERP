/**
 * Vanguard ERP / Vanguard ERP - End of Day Models & Live Seed Data
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

const formatEodDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

/** Neutral starting state: no invoices, today's live date. Real figures are hydrated from tenants.feature_flags. */
export const INITIAL_EOD_BRANCHES: OmegaBranchEod[] = [
  {
    BRANCHID: 1,
    BARANCHNAME: 'Main Branch',
    OMEGA_CUSTID: 1300,
    end_of_day: formatEodDate(new Date()),
    status: 'Pending EOD',
    invoicesCount: 0,
    grossSales: 0,
    netSales: 0,
    cashUsd: 0,
    cashLbp: 0,
    cardPayments: 0,
    omnichannel: 0,
    taxVat: 0,
    voidsCount: 0,
    discounts: 0,
    cashier: '\u2014'
  }
];
