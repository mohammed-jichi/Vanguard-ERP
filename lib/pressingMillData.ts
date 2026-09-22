import {
  StainlessTank,
  PressingLineState,
  ScaleTicket,
  SettlementVoucher,
  OilDispatchPass,
  FarmerAccountLedger,
  MillSettingsConfig
} from '@/types/pressingMill';

export const INITIAL_MILL_SETTINGS: MillSettingsConfig = {
  facilityName: 'Southern Olive Oil Products S.A.R.L - Choueifat Central Mill',
  millLocation: 'Choueifat Industrial Zone, Mount Lebanon',
  line1ThroughputTonsPerHour: 4.5,
  line2ThroughputTonsPerHour: 3.2,
  standardRetentionPct: 10,
  defaultCashFeePerKgUSD: 0.08,
  standardTinKg: 15.0,
  usdToLbpRate: 89500,
  coldPressMaxTempC: 27.0,
  totalStainlessTanksCount: 50
};

// Generate 50 realistic stainless steel tanks (T-01 to T-50)
export const INITIAL_TANKS: StainlessTank[] = Array.from({ length: 50 }, (_, i) => {
  const num = i + 1;
  const id = `TK-${String(num).padStart(2, '0')}`;
  
  // Distribute tanks across grades
  if (num <= 15) {
    // 1-15: Extra Virgin (EVOO) Premium
    const cap = num <= 5 ? 20000 : 15000;
    const current = Math.min(cap, Math.round((cap * (0.65 + (num % 5) * 0.07))));
    return {
      id,
      tankNumber: num,
      title: `Tank ${String(num).padStart(2, '0')} - Single Estate Extra Virgin`,
      grade: 'Extra_Virgin',
      capacityLiters: cap,
      currentLevelLiters: current,
      acidityPct: Number((0.25 + (num * 0.02) % 0.45).toFixed(2)),
      internalTempC: Number((15.8 + (num % 4) * 0.3).toFixed(1)),
      nitrogenBlanketed: true,
      status: current >= cap ? 'Full_Cured' : 'Active_Filling',
      harvestYear: 2026,
      allocatedFarmerOrBatch: `Batch Lot #EV-${202600 + num}`,
      lastSanitizedDate: '2026-09-18'
    };
  } else if (num <= 30) {
    // 16-30: Virgin Olive Oil (VOO)
    const cap = 12000;
    const current = Math.round(cap * (0.50 + (num % 6) * 0.08));
    return {
      id,
      tankNumber: num,
      title: `Tank ${String(num).padStart(2, '0')} - Mountain Virgin Olive Oil`,
      grade: 'Virgin',
      capacityLiters: cap,
      currentLevelLiters: current,
      acidityPct: Number((0.70 + (num * 0.03) % 0.6).toFixed(2)),
      internalTempC: Number((16.2 + (num % 3) * 0.4).toFixed(1)),
      nitrogenBlanketed: true,
      status: 'Ready_For_Bottling',
      harvestYear: 2026,
      allocatedFarmerOrBatch: `Batch Lot #VO-${202600 + num}`,
      lastSanitizedDate: '2026-09-15'
    };
  } else if (num <= 40) {
    // 31-40: Decanter Settling & Sedimentation
    const cap = 8000;
    const current = Math.round(cap * (0.35 + (num % 5) * 0.10));
    return {
      id,
      tankNumber: num,
      title: `Tank ${String(num).padStart(2, '0')} - Decanter Settling Silo`,
      grade: 'Settling_Raw',
      capacityLiters: cap,
      currentLevelLiters: current,
      acidityPct: Number((0.65 + (num * 0.02) % 0.4).toFixed(2)),
      internalTempC: 18.2,
      nitrogenBlanketed: false,
      status: 'Settling',
      harvestYear: 2026,
      allocatedFarmerOrBatch: `Intake Settling Line ${num % 2 === 0 ? '02' : '01'}`,
      lastSanitizedDate: '2026-09-20'
    };
  } else {
    // 41-50: Sanitized & Available Empty Tanks
    return {
      id,
      tankNumber: num,
      title: `Tank ${String(num).padStart(2, '0')} - Stainless Buffer Silo (Sanitized)`,
      grade: 'Extra_Virgin',
      capacityLiters: 15000,
      currentLevelLiters: 0,
      acidityPct: 0.0,
      internalTempC: 16.0,
      nitrogenBlanketed: true,
      status: 'Sanitized_Empty',
      harvestYear: 2026,
      lastSanitizedDate: '2026-09-21'
    };
  }
});

export const INITIAL_PRESSING_LINES: PressingLineState[] = [
  {
    lineId: 'LINE-01',
    lineName: 'Pressing Line 01 (Choueifat)',
    model: 'Alfa Laval 3-Phase Continuous Line',
    maxCapacityTonsPerHour: 4.5,
    status: 'Running',
    currentBatchId: 'B-2026-0142',
    currentFarmerName: 'Jaber Estate (Hasbaya Souri)',
    batchProgressPct: 74,
    malaxingTemperatureC: 26.6,
    decanterRpm: 3200,
    separatorRpm: 6400,
    flowRateLitersPerHour: 680,
    totalCrushedTodayKg: 18450
  },
  {
    lineId: 'LINE-02',
    lineName: 'Pressing Line 02 (South Plant)',
    model: 'Pieralisi 2-Phase Ecological Unit',
    maxCapacityTonsPerHour: 3.2,
    status: 'Running',
    currentBatchId: 'B-2026-0143',
    currentFarmerName: 'Khoury Cooperative (Nabali)',
    batchProgressPct: 91,
    malaxingTemperatureC: 25.4,
    decanterRpm: 3450,
    separatorRpm: 6800,
    flowRateLitersPerHour: 720,
    totalCrushedTodayKg: 14200
  }
];

export const INITIAL_SCALE_TICKETS: ScaleTicket[] = [
  {
    id: 'ST-001',
    ticketNumber: 'TK-2026-0142',
    date: '2026-09-22',
    time: '08:30 AM',
    farmerId: 'FRM-01',
    farmerName: 'Abu Hassan Jaber',
    farmerPhone: '+961 3 452 189',
    vehiclePlate: 'B 145920 (Toyota Hilux)',
    variety: 'Souri',
    grossWeight: 4850,
    tareWeight: 1400,
    netWeight: 3450,
    acidityTestPct: 0.55,
    targetTankId: 'TK-01',
    settlementMethod: 'In_Kind',
    cashFeeRatePerKg: 0.08,
    inKindRetentionPct: 10,
    estimatedYieldPct: 20.0,
    actualYieldPct: 20.5,
    estimatedOilKg: 690,
    actualOilKg: 707,
    tinCountEquivalent: 47.1,
    pomaceKg: 1380,
    status: 'Crushing',
    notes: 'Early morning harvest from Hasbaya groves.'
  },
  {
    id: 'ST-002',
    ticketNumber: 'TK-2026-0143',
    date: '2026-09-22',
    time: '09:45 AM',
    farmerId: 'FRM-02',
    farmerName: 'Michel El-Khoury',
    farmerPhone: '+961 70 881 234',
    vehiclePlate: 'M 21908 (Mercedes Truck)',
    variety: 'Nabali',
    grossWeight: 6200,
    tareWeight: 1800,
    netWeight: 4400,
    acidityTestPct: 0.68,
    targetTankId: 'TK-02',
    settlementMethod: 'Cash',
    cashFeeRatePerKg: 0.08,
    inKindRetentionPct: 10,
    estimatedYieldPct: 20.0,
    actualYieldPct: 21.2,
    estimatedOilKg: 880,
    actualOilKg: 933,
    tinCountEquivalent: 62.2,
    pomaceKg: 1760,
    status: 'Malaxing',
    notes: 'Premium high-altitude Nabali olives.'
  },
  {
    id: 'ST-003',
    ticketNumber: 'TK-2026-0144',
    date: '2026-09-22',
    time: '11:15 AM',
    farmerId: 'FRM-03',
    farmerName: 'Chouf Olive Farmers Union',
    farmerPhone: '+961 5 501 192',
    vehiclePlate: 'T 4401 (Agricultural Tractor)',
    variety: 'Shami',
    grossWeight: 3100,
    tareWeight: 950,
    netWeight: 2150,
    acidityTestPct: 0.85,
    targetTankId: 'TK-16',
    settlementMethod: 'Mixed',
    cashFeeRatePerKg: 0.08,
    inKindRetentionPct: 10,
    mixedCashAmount: 86.00,
    mixedOilDeductionKg: 21.5,
    estimatedYieldPct: 20.0,
    estimatedOilKg: 430,
    tinCountEquivalent: 28.7,
    pomaceKg: 860,
    status: 'In_Queue',
    notes: 'Mixed settlement: $86.00 cash + 21.5 KG oil deducted.'
  }
];

export const INITIAL_SETTLEMENTS: SettlementVoucher[] = [
  {
    id: 'SV-001',
    voucherNumber: 'SET-2026-0081',
    date: '2026-09-22',
    ticketId: 'ST-002',
    ticketNumber: 'TK-2026-0143',
    farmerName: 'Michel El-Khoury',
    netOliveKg: 4400,
    oilYieldKg: 933,
    tinCountTotal: 62.2,
    method: 'Cash',
    cashAmountDueUSD: 352.00,
    cashAmountDueLBP: 31504000,
    retainedOilKg: 0,
    retainedTins: 0,
    growerReleasedTins: 62.2,
    paymentStatus: 'Paid'
  },
  {
    id: 'SV-002',
    voucherNumber: 'SET-2026-0080',
    date: '2026-09-21',
    ticketId: 'ST-001',
    ticketNumber: 'TK-2026-0142',
    farmerName: 'Abu Hassan Jaber',
    netOliveKg: 3450,
    oilYieldKg: 707,
    tinCountTotal: 47.1,
    method: 'In_Kind',
    cashAmountDueUSD: 0,
    cashAmountDueLBP: 0,
    retainedOilKg: 70.7,
    retainedTins: 4.7,
    growerReleasedTins: 42.4,
    paymentStatus: 'Credited_To_Account'
  }
];

export const INITIAL_DISPATCH_PASSES: OilDispatchPass[] = [
  {
    id: 'DP-001',
    passNumber: 'GP-2026-0091',
    date: '2026-09-22',
    farmerName: 'Michel El-Khoury',
    ticketNumber: 'TK-2026-0143',
    tinsReleased: 62,
    litersReleased: 992,
    receiverName: 'Samer El-Khoury',
    vehiclePlate: 'M 21908',
    authorizedBy: 'Fadi Saade (Foreman)',
    gatePassStatus: 'Approved'
  },
  {
    id: 'DP-002',
    passNumber: 'GP-2026-0090',
    date: '2026-09-21',
    farmerName: 'Abu Hassan Jaber',
    ticketNumber: 'TK-2026-0142',
    tinsReleased: 42,
    litersReleased: 672,
    receiverName: 'Abu Hassan Jaber',
    vehiclePlate: 'B 145920',
    authorizedBy: 'Fadi Saade (Foreman)',
    gatePassStatus: 'Dispatched'
  }
];

export const INITIAL_FARMER_ACCOUNTS: FarmerAccountLedger[] = [
  {
    id: 'FRM-01',
    farmerName: 'Abu Hassan Jaber',
    phone: '+961 3 452 189',
    address: 'Hasbaya Groves, South Lebanon',
    totalIntakeHistoricalKg: 28450,
    oilDepositsInSiloKg: 420.5,
    tinBalanceAvailable: 28,
    cashBalanceUSD: 0,
    lastActiveDate: '2026-09-22'
  },
  {
    id: 'FRM-02',
    farmerName: 'Michel El-Khoury',
    phone: '+961 70 881 234',
    address: 'Kfar Matta, Mount Lebanon',
    totalIntakeHistoricalKg: 34100,
    oilDepositsInSiloKg: 0,
    tinBalanceAvailable: 0,
    cashBalanceUSD: -352.00,
    lastActiveDate: '2026-09-22'
  },
  {
    id: 'FRM-03',
    farmerName: 'Chouf Olive Farmers Union',
    phone: '+961 5 501 192',
    address: 'Baakline Central Office, Chouf',
    totalIntakeHistoricalKg: 62300,
    oilDepositsInSiloKg: 1140.0,
    tinBalanceAvailable: 76,
    cashBalanceUSD: 450.00,
    lastActiveDate: '2026-09-21'
  }
];

export const POS_CATALOG_ITEMS = [
  {
    id: 'POS-01',
    type: 'Sealed_Tin',
    title: 'Extra Virgin Olive Oil - 16L Standard Tin (15 KG)',
    unit: 'Tin',
    unitPriceUSD: 95.00,
    unitPriceLBP: 8502500,
    tankId: 'TK-01',
    stockAvailable: 240
  },
  {
    id: 'POS-02',
    type: 'Sealed_Tin',
    title: 'Heritage Virgin Olive Oil - 17.5L Heavy Tin (16.2 KG)',
    unit: 'Tin',
    unitPriceUSD: 105.00,
    unitPriceLBP: 9397500,
    tankId: 'TK-02',
    stockAvailable: 115
  },
  {
    id: 'POS-03',
    type: 'Bottle',
    title: 'Single Estate Extra Virgin Glass Bottle 750ml',
    unit: 'Bottle',
    unitPriceUSD: 7.50,
    unitPriceLBP: 671250,
    tankId: 'TK-05',
    stockAvailable: 580
  },
  {
    id: 'POS-04',
    type: 'Bottle',
    title: 'Dark UV Glass Cold Press 500ml Bottle',
    unit: 'Bottle',
    unitPriceUSD: 5.50,
    unitPriceLBP: 492250,
    tankId: 'TK-05',
    stockAvailable: 420
  },
  {
    id: 'POS-05',
    type: 'Bulk_Tap',
    title: 'Bulk Oil Tapped Fresh (Direct Tank 01 Extra Virgin)',
    unit: 'Liter',
    unitPriceUSD: 6.20,
    unitPriceLBP: 554900,
    tankId: 'TK-01',
    stockAvailable: 12400
  },
  {
    id: 'POS-06',
    type: 'Bulk_Tap',
    title: 'Bulk Oil Tapped Fresh (Direct Tank 02 Mountain Virgin)',
    unit: 'Liter',
    unitPriceUSD: 5.40,
    unitPriceLBP: 483300,
    tankId: 'TK-02',
    stockAvailable: 14100
  },
  {
    id: 'POS-07',
    type: 'Pomace',
    title: 'Compressed Dried Pomace (Jift) - 50 KG Sack',
    unit: 'Sack',
    unitPriceUSD: 4.50,
    unitPriceLBP: 402750,
    stockAvailable: 650
  },
  {
    id: 'POS-08',
    type: 'Pomace',
    title: 'Raw Pomace / Jift for Heating & Compost (Bulk Ton)',
    unit: 'Ton',
    unitPriceUSD: 70.00,
    unitPriceLBP: 6265000,
    stockAvailable: 45
  },
  {
    id: 'POS-09',
    type: 'Reverse_Buy_In',
    title: 'Reverse Buy-In: Farmer Oil Cash Procurement Into Tank Silo',
    unit: 'KG',
    unitPriceUSD: 5.00, // Procurement rate paid to farmer per KG
    unitPriceLBP: 447500,
    stockAvailable: 99999
  }
];
