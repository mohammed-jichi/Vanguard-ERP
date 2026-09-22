/**
 * Vanguard ERP - Pressing Mill Types & Interfaces
 * Pure English types supporting i18n localization keys.
 */

export type OliveVariety = 'Souri' | 'Nabali' | 'Shami' | 'Baladi_Mixed' | 'Grossa';

export type OilGrade = 'Extra_Virgin' | 'Virgin' | 'Ordinary_Virgin' | 'Lampante' | 'Settling_Raw';

export type TankStatus = 'Active_Filling' | 'Full_Cured' | 'Settling' | 'Ready_For_Bottling' | 'Sanitized_Empty';

export type SettlementMethod = 'Cash' | 'In_Kind' | 'Mixed';

export type TicketStatus = 'Weighed' | 'In_Queue' | 'Crushing' | 'Malaxing' | 'Separated' | 'Settled' | 'Dispatched';

export interface ScaleTicket {
  id: string;
  ticketNumber: string;
  date: string;
  time: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  vehiclePlate: string;
  variety: OliveVariety;
  grossWeight: number; // KG
  tareWeight: number; // KG
  netWeight: number; // KG
  acidityTestPct: number; // %
  targetTankId: string;
  settlementMethod: SettlementMethod;
  cashFeeRatePerKg: number; // USD / KG
  inKindRetentionPct: number; // e.g. 10%
  mixedCashAmount?: number;
  mixedOilDeductionKg?: number;
  estimatedYieldPct: number; // e.g. 20%
  actualYieldPct?: number;
  estimatedOilKg: number;
  actualOilKg?: number;
  tinCountEquivalent: number; // 15 KG per standard 16L tin
  pomaceKg: number; // ~40% of net olives
  status: TicketStatus;
  notes?: string;
}

export interface PressingLineState {
  lineId: string;
  lineName: string;
  model: string;
  maxCapacityTonsPerHour: number;
  status: 'Running' | 'Idle' | 'Maintenance' | 'Washing';
  currentBatchId?: string;
  currentFarmerName?: string;
  batchProgressPct: number;
  malaxingTemperatureC: number; // Must stay < 27 C for cold press certification
  decanterRpm: number;
  separatorRpm: number;
  flowRateLitersPerHour: number;
  totalCrushedTodayKg: number;
}

export interface StainlessTank {
  id: string; // T-01 to T-50
  tankNumber: number;
  title: string;
  grade: OilGrade;
  capacityLiters: number;
  currentLevelLiters: number;
  acidityPct: number;
  internalTempC: number;
  nitrogenBlanketed: boolean;
  status: TankStatus;
  harvestYear: number;
  allocatedFarmerOrBatch?: string;
  lastSanitizedDate: string;
}

export interface SettlementVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  ticketId: string;
  ticketNumber: string;
  farmerName: string;
  netOliveKg: number;
  oilYieldKg: number;
  tinCountTotal: number;
  method: SettlementMethod;
  cashAmountDueUSD: number;
  cashAmountDueLBP: number;
  retainedOilKg: number;
  retainedTins: number;
  growerReleasedTins: number;
  paymentStatus: 'Paid' | 'Pending' | 'Credited_To_Account';
}

export interface OilDispatchPass {
  id: string;
  passNumber: string;
  date: string;
  farmerName: string;
  ticketNumber: string;
  tinsReleased: number;
  litersReleased: number;
  receiverName: string;
  vehiclePlate: string;
  authorizedBy: string;
  gatePassStatus: 'Draft' | 'Approved' | 'Dispatched';
}

export interface POSCartItem {
  id: string;
  type: 'Sealed_Tin' | 'Bottle' | 'Bulk_Tap' | 'Pomace' | 'Reverse_Buy_In';
  title: string;
  tankId?: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  unitPriceLBP: number;
  totalUSD: number;
  totalLBP: number;
}

export interface FarmerAccountLedger {
  id: string;
  farmerName: string;
  phone: string;
  address: string;
  totalIntakeHistoricalKg: number;
  oilDepositsInSiloKg: number;
  tinBalanceAvailable: number;
  cashBalanceUSD: number;
  lastActiveDate: string;
}

export interface MillSettingsConfig {
  facilityName: string;
  millLocation: string;
  line1ThroughputTonsPerHour: number;
  line2ThroughputTonsPerHour: number;
  standardRetentionPct: number; // e.g. 10%
  defaultCashFeePerKgUSD: number; // e.g. 0.08
  standardTinKg: number; // 15.0 KG per 16L tin
  usdToLbpRate: number; // e.g. 89500
  coldPressMaxTempC: number; // 27.0
  totalStainlessTanksCount: number; // 50
}
