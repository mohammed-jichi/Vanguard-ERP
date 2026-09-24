'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  ReportPagination,
  MetricCardItem,
  FilterOption,
  ReportCategoryGroup,
  DynamicReportFilterRenderer,
} from '@/components/reports/ReportPageLayout';
import {
  INVENTORY_CONTROL_OMEGA_TREE,
  ALL_INVENTORY_CONTROL_REPORTS,
  getInventoryReportMeta,
} from '@/components/reports/inventoryControlReportsTree';
import {
  getDefaultInitialDateRange,
  resolveDateRangeFromPreset,
} from '@/lib/dateRangeEngine';
import {
  Factory,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplets,
  Package,
  Truck,
  TrendingUp,
  RotateCcw,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  Check,
  ShieldAlert,
  Gauge,
  Activity,
  ClipboardCheck,
  Boxes,
  Thermometer,
  Zap,
  Info,
  Warehouse,
  Flame,
  FileText
} from 'lucide-react';

// ============================================================================
// 1. DATA MODELS & TYPES
// ============================================================================

export type OperationalReportSheetId =
  | 'REP_OPS_001' // Production & Extraction Logs
  | 'REP_OPS_002' // Pressing & Processing Cycles
  | 'REP_OPS_003' // Tank Farm & Silo Throughput
  | 'REP_OPS_004' // Work Orders & Assembly Tracking
  | 'REP_OPS_005'; // Dispatch Operations & Logistics

export interface ProductionLogRow {
  id: string;
  batchNumber: string;
  date: string;
  shift: string;
  line: string;
  category: string;
  growerSource: string;
  oliveIntakeKg: number;
  oilExtractedL: number;
  yieldPercent: number;
  acidityPercent: number;
  destinationTank: string;
  operator: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUALITY_HOLD';
}

export interface PressingCycleRow {
  id: string;
  cycleCode: string;
  line: string;
  date: string;
  category: string;
  oliveVariety: string;
  malaxationTempC: number;
  malaxationMinutes: number;
  decanterRpm: number;
  cycleDurationMin: number;
  throughputKgHr: number;
  operator: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CALIBRATION';
}

export interface TankThroughputRow {
  id: string;
  tankName: string;
  category: string;
  capacityL: number;
  initialVolumeL: number;
  inflowL: number;
  outflowL: number;
  currentBalanceL: number;
  fillPercentage: number;
  temperatureC: number;
  nitrogenBlanket: 'ACTIVE' | 'STANDBY';
  lastInspectionDate: string;
  status: 'OPTIMAL' | 'REFILL_IN_PROGRESS' | 'DRAINING';
}

export interface WorkOrderRow {
  id: string;
  workOrderCode: string;
  itemSku: string;
  itemDescription: string;
  category: string;
  line: string;
  targetUnits: number;
  completedUnits: number;
  scrapUnits: number;
  scrapRatePercent: number;
  targetDate: string;
  supervisor: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'SCHEDULED' | 'HOLD';
}

export interface DispatchRunRow {
  id: string;
  runCode: string;
  time: string;
  destination: string;
  carrierDriver: string;
  category: string;
  packagesCount: number;
  totalVolumeL: number;
  invoiceRef: string;
  qaReleaseStamp: string;
  dispatcher: string;
  status: 'DISPATCHED' | 'DELIVERED' | 'PREPARING';
}

// ============================================================================
// 2. MOCK DATA WITH LEBANESE SOUTHERN OLIVE OPERATIONS GROUNDING
// ============================================================================

const PRODUCTION_LOGS_DATA: ProductionLogRow[] = [
  {
    id: 'PRD-001',
    batchNumber: 'BCH-2026-901',
    date: '2026-09-15',
    shift: 'Shift A (06:00 - 14:00)',
    line: 'Pressing Line 01 (Choueifat)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Hasbaya Agricultural Syndicate',
    oliveIntakeKg: 12400,
    oilExtractedL: 2750,
    yieldPercent: 22.18,
    acidityPercent: 0.32,
    destinationTank: 'Tank T-01 (EVOO Bulk)',
    operator: 'Jad El-Hajj',
    status: 'COMPLETED',
  },
  {
    id: 'PRD-002',
    batchNumber: 'BCH-2026-902',
    date: '2026-09-15',
    shift: 'Shift A (06:00 - 14:00)',
    line: 'Pressing Line 02 (South Plant)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Marjeyoun Valley Groves',
    oliveIntakeKg: 15600,
    oilExtractedL: 3510,
    yieldPercent: 22.50,
    acidityPercent: 0.38,
    destinationTank: 'Tank T-03 (EVOO Reserve)',
    operator: 'Ahmad Zein',
    status: 'COMPLETED',
  },
  {
    id: 'PRD-003',
    batchNumber: 'BCH-2026-903',
    date: '2026-09-15',
    shift: 'Shift B (14:00 - 22:00)',
    line: 'Pressing Line 01 (Choueifat)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Koura High Groves',
    oliveIntakeKg: 9800,
    oilExtractedL: 2225,
    yieldPercent: 22.70,
    acidityPercent: 0.28,
    destinationTank: 'Tank T-02 (EVOO Premium)',
    operator: 'Rabih Karam',
    status: 'IN_PROGRESS',
  },
  {
    id: 'PRD-004',
    batchNumber: 'BCH-2026-904',
    date: '2026-09-15',
    shift: 'Shift B (14:00 - 22:00)',
    line: 'Pressing Line 02 (South Plant)',
    category: 'Virgin Olive Oil',
    growerSource: 'Nabatieh Farmers Cooperative',
    oliveIntakeKg: 14200,
    oilExtractedL: 2980,
    yieldPercent: 20.98,
    acidityPercent: 0.72,
    destinationTank: 'Tank T-06 (Virgin Standard)',
    operator: 'Mahmoud Sadek',
    status: 'IN_PROGRESS',
  },
  {
    id: 'PRD-005',
    batchNumber: 'BCH-2026-905',
    date: '2026-09-14',
    shift: 'Shift A (06:00 - 14:00)',
    line: 'Pressing Line 01 (Choueifat)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Chouf High Elevation Terraces',
    oliveIntakeKg: 11500,
    oilExtractedL: 2540,
    yieldPercent: 22.09,
    acidityPercent: 0.35,
    destinationTank: 'Tank T-01 (EVOO Bulk)',
    operator: 'Jad El-Hajj',
    status: 'COMPLETED',
  },
  {
    id: 'PRD-006',
    batchNumber: 'BCH-2026-906',
    date: '2026-09-14',
    shift: 'Shift B (14:00 - 22:00)',
    line: 'Pressing Line 02 (South Plant)',
    category: 'Virgin Olive Oil',
    growerSource: 'Deir Mimas Estate Farms',
    oliveIntakeKg: 13800,
    oilExtractedL: 2845,
    yieldPercent: 20.62,
    acidityPercent: 0.85,
    destinationTank: 'Tank T-07 (Quality Hold)',
    operator: 'Ahmad Zein',
    status: 'QUALITY_HOLD',
  },
  {
    id: 'PRD-007',
    batchNumber: 'BCH-2026-907',
    date: '2026-09-13',
    shift: 'Shift A (06:00 - 14:00)',
    line: 'Pressing Line 01 (Choueifat)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Hasbaya Agricultural Syndicate',
    oliveIntakeKg: 12000,
    oilExtractedL: 2680,
    yieldPercent: 22.33,
    acidityPercent: 0.31,
    destinationTank: 'Tank T-02 (EVOO Premium)',
    operator: 'Rabih Karam',
    status: 'COMPLETED',
  },
  {
    id: 'PRD-008',
    batchNumber: 'BCH-2026-908',
    date: '2026-09-13',
    shift: 'Shift B (14:00 - 22:00)',
    line: 'Pressing Line 01 (Choueifat)',
    category: 'Cold Extraction (<27°C)',
    growerSource: 'Bcheale Ancient Mill Trees',
    oliveIntakeKg: 4500,
    oilExtractedL: 1080,
    yieldPercent: 24.00,
    acidityPercent: 0.22,
    destinationTank: 'Tank T-05 (Ultra EVOO)',
    operator: 'Jad El-Hajj',
    status: 'COMPLETED',
  },
  {
    id: 'PRD-009',
    batchNumber: 'BCH-2026-909',
    date: '2026-09-12',
    shift: 'Shift A (06:00 - 14:00)',
    line: 'Pressing Line 02 (South Plant)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Zahrani Valley Plantations',
    oliveIntakeKg: 16000,
    oilExtractedL: 3490,
    yieldPercent: 21.81,
    acidityPercent: 0.41,
    destinationTank: 'Tank T-03 (EVOO Reserve)',
    operator: 'Mahmoud Sadek',
    status: 'COMPLETED',
  },
  {
    id: 'PRD-010',
    batchNumber: 'BCH-2026-910',
    date: '2026-09-11',
    shift: 'Shift B (14:00 - 22:00)',
    line: 'Pressing Line 01 (Choueifat)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    growerSource: 'Chouf High Elevation Terraces',
    oliveIntakeKg: 10800,
    oilExtractedL: 2410,
    yieldPercent: 22.31,
    acidityPercent: 0.33,
    destinationTank: 'Tank T-01 (EVOO Bulk)',
    operator: 'Rabih Karam',
    status: 'COMPLETED',
  }
];

const PRESSING_CYCLES_DATA: PressingCycleRow[] = [
  {
    id: 'CYC-001',
    cycleCode: 'CYC-L1-084',
    line: 'Pressing Line 01 (Choueifat)',
    date: '2026-09-15 08:15',
    category: 'Extra Virgin Olive Oil (EVOO)',
    oliveVariety: 'Souri & Baladi',
    malaxationTempC: 25.4,
    malaxationMinutes: 45,
    decanterRpm: 3150,
    cycleDurationMin: 52,
    throughputKgHr: 1450,
    operator: 'Jad El-Hajj',
    status: 'COMPLETED',
  },
  {
    id: 'CYC-002',
    cycleCode: 'CYC-L2-051',
    line: 'Pressing Line 02 (South Plant)',
    date: '2026-09-15 09:30',
    category: 'Extra Virgin Olive Oil (EVOO)',
    oliveVariety: 'Souri Single Variety',
    malaxationTempC: 24.8,
    malaxationMinutes: 50,
    decanterRpm: 3200,
    cycleDurationMin: 58,
    throughputKgHr: 1620,
    operator: 'Ahmad Zein',
    status: 'COMPLETED',
  },
  {
    id: 'CYC-003',
    cycleCode: 'CYC-L1-085',
    line: 'Pressing Line 01 (Choueifat)',
    date: '2026-09-15 11:00',
    category: 'Cold Extraction (<27°C)',
    oliveVariety: 'Ayrouni Green Harvest',
    malaxationTempC: 23.9,
    malaxationMinutes: 40,
    decanterRpm: 3100,
    cycleDurationMin: 48,
    throughputKgHr: 1380,
    operator: 'Jad El-Hajj',
    status: 'COMPLETED',
  },
  {
    id: 'CYC-004',
    cycleCode: 'CYC-L1-086',
    line: 'Pressing Line 01 (Choueifat)',
    date: '2026-09-15 14:30',
    category: 'Extra Virgin Olive Oil (EVOO)',
    oliveVariety: 'Baladi Traditional',
    malaxationTempC: 25.8,
    malaxationMinutes: 45,
    decanterRpm: 3150,
    cycleDurationMin: 50,
    throughputKgHr: 1420,
    operator: 'Rabih Karam',
    status: 'IN_PROGRESS',
  },
  {
    id: 'CYC-005',
    cycleCode: 'CYC-L2-052',
    line: 'Pressing Line 02 (South Plant)',
    date: '2026-09-15 15:00',
    category: 'Virgin Olive Oil',
    oliveVariety: 'Mixed South Harvest',
    malaxationTempC: 26.5,
    malaxationMinutes: 55,
    decanterRpm: 3000,
    cycleDurationMin: 62,
    throughputKgHr: 1550,
    operator: 'Mahmoud Sadek',
    status: 'IN_PROGRESS',
  },
  {
    id: 'CYC-006',
    cycleCode: 'CYC-L2-050',
    line: 'Pressing Line 02 (South Plant)',
    date: '2026-09-14 16:20',
    category: 'Virgin Olive Oil',
    oliveVariety: 'Mixed South Late Harvest',
    malaxationTempC: 27.2,
    malaxationMinutes: 60,
    decanterRpm: 2950,
    cycleDurationMin: 65,
    throughputKgHr: 1400,
    operator: 'Ahmad Zein',
    status: 'CALIBRATION',
  }
];

const TANK_THROUGHPUT_DATA: TankThroughputRow[] = [
  {
    id: 'TNK-01',
    tankName: 'Tank T-01 (Choueifat SS Bulk)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    capacityL: 50000,
    initialVolumeL: 38500,
    inflowL: 5290,
    outflowL: 2100,
    currentBalanceL: 41690,
    fillPercentage: 83.38,
    temperatureC: 16.4,
    nitrogenBlanket: 'ACTIVE',
    lastInspectionDate: '2026-09-14',
    status: 'OPTIMAL',
  },
  {
    id: 'TNK-02',
    tankName: 'Tank T-02 (Premium Grade EVOO)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    capacityL: 30000,
    initialVolumeL: 18200,
    inflowL: 4905,
    outflowL: 1600,
    currentBalanceL: 21505,
    fillPercentage: 71.68,
    temperatureC: 15.8,
    nitrogenBlanket: 'ACTIVE',
    lastInspectionDate: '2026-09-15',
    status: 'OPTIMAL',
  },
  {
    id: 'TNK-03',
    tankName: 'Tank T-03 (South Plant Silo A)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    capacityL: 60000,
    initialVolumeL: 42000,
    inflowL: 7000,
    outflowL: 3500,
    currentBalanceL: 45500,
    fillPercentage: 75.83,
    temperatureC: 16.8,
    nitrogenBlanket: 'ACTIVE',
    lastInspectionDate: '2026-09-13',
    status: 'REFILL_IN_PROGRESS',
  },
  {
    id: 'TNK-04',
    tankName: 'Tank T-04 (Bottling Buffer Silo)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    capacityL: 20000,
    initialVolumeL: 14500,
    inflowL: 3000,
    outflowL: 4200,
    currentBalanceL: 13300,
    fillPercentage: 66.50,
    temperatureC: 17.1,
    nitrogenBlanket: 'ACTIVE',
    lastInspectionDate: '2026-09-15',
    status: 'DRAINING',
  },
  {
    id: 'TNK-05',
    tankName: 'Tank T-05 (Ultra-Cold Reserve)',
    category: 'Cold Extraction (<27°C)',
    capacityL: 15000,
    initialVolumeL: 8200,
    inflowL: 1080,
    outflowL: 450,
    currentBalanceL: 8830,
    fillPercentage: 58.87,
    temperatureC: 14.5,
    nitrogenBlanket: 'ACTIVE',
    lastInspectionDate: '2026-09-15',
    status: 'OPTIMAL',
  },
  {
    id: 'TNK-06',
    tankName: 'Tank T-06 (Virgin Standard Bulk)',
    category: 'Virgin Olive Oil',
    capacityL: 40000,
    initialVolumeL: 22000,
    inflowL: 2980,
    outflowL: 1800,
    currentBalanceL: 23180,
    fillPercentage: 57.95,
    temperatureC: 17.5,
    nitrogenBlanket: 'STANDBY',
    lastInspectionDate: '2026-09-11',
    status: 'OPTIMAL',
  },
  {
    id: 'TNK-07',
    tankName: 'Tank T-07 (Quality Quarantine)',
    category: 'Virgin Olive Oil',
    capacityL: 25000,
    initialVolumeL: 3100,
    inflowL: 2845,
    outflowL: 0,
    currentBalanceL: 5945,
    fillPercentage: 23.78,
    temperatureC: 18.0,
    nitrogenBlanket: 'STANDBY',
    lastInspectionDate: '2026-09-14',
    status: 'DRAINING',
  }
];

const WORK_ORDERS_DATA: WorkOrderRow[] = [
  {
    id: 'WO-8821',
    workOrderCode: 'WO-PKG-8821',
    itemSku: 'SKU-EVOO-17.5L',
    itemDescription: '17.5L Heritage Tin - Cold Pressed EVOO',
    category: 'Extra Virgin Olive Oil (EVOO)',
    line: 'Tin Packaging Line B',
    targetUnits: 800,
    completedUnits: 760,
    scrapUnits: 8,
    scrapRatePercent: 1.04,
    targetDate: '2026-09-15',
    supervisor: 'Rabih Karam',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
  },
  {
    id: 'WO-8822',
    workOrderCode: 'WO-BOT-8822',
    itemSku: 'SKU-EVOO-500ML-GLS',
    itemDescription: '500ml Marasca Dark Glass Bottle EVOO',
    category: 'Extra Virgin Olive Oil (EVOO)',
    line: 'Automated Bottling Line A',
    targetUnits: 3200,
    completedUnits: 3200,
    scrapUnits: 14,
    scrapRatePercent: 0.44,
    targetDate: '2026-09-15',
    supervisor: 'Jad El-Hajj',
    priority: 'HIGH',
    status: 'COMPLETED',
  },
  {
    id: 'WO-8823',
    workOrderCode: 'WO-BOT-8823',
    itemSku: 'SKU-EVOO-1L-PET',
    itemDescription: '1.0L UV-Protected PET Bottle EVOO',
    category: 'Extra Virgin Olive Oil (EVOO)',
    line: 'Automated Bottling Line A',
    targetUnits: 2500,
    completedUnits: 1850,
    scrapUnits: 11,
    scrapRatePercent: 0.59,
    targetDate: '2026-09-15',
    supervisor: 'Jad El-Hajj',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
  },
  {
    id: 'WO-8824',
    workOrderCode: 'WO-JAR-8824',
    itemSku: 'SKU-OLV-GRN-1KG',
    itemDescription: '1KG Pickled Green Baladi Olives in Brine',
    category: 'Preserved & Cured Olives',
    line: 'Curing & Jarring Station C',
    targetUnits: 1200,
    completedUnits: 1200,
    scrapUnits: 6,
    scrapRatePercent: 0.50,
    targetDate: '2026-09-14',
    supervisor: 'Mahmoud Sadek',
    priority: 'NORMAL',
    status: 'COMPLETED',
  },
  {
    id: 'WO-8825',
    workOrderCode: 'WO-PKG-8825',
    itemSku: 'SKU-EVOO-4L-GLN',
    itemDescription: '4.0L Heritage Metal Gallon Tin EVOO',
    category: 'Extra Virgin Olive Oil (EVOO)',
    line: 'Tin Packaging Line B',
    targetUnits: 1500,
    completedUnits: 0,
    scrapUnits: 0,
    scrapRatePercent: 0.00,
    targetDate: '2026-09-16',
    supervisor: 'Rabih Karam',
    priority: 'HIGH',
    status: 'SCHEDULED',
  },
  {
    id: 'WO-8826',
    workOrderCode: 'WO-BULK-8826',
    itemSku: 'SKU-BULK-TANKER-10K',
    itemDescription: '10,000L Bulk Tanker Lot Transfer to Sidon',
    category: 'Raw Bulk Stock',
    line: 'Bulk Pumping Station P1',
    targetUnits: 1,
    completedUnits: 1,
    scrapUnits: 0,
    scrapRatePercent: 0.00,
    targetDate: '2026-09-15',
    supervisor: 'Ahmad Zein',
    priority: 'URGENT',
    status: 'COMPLETED',
  }
];

const DISPATCH_RUNS_DATA: DispatchRunRow[] = [
  {
    id: 'DSP-5510',
    runCode: 'DSP-2026-5510',
    time: '2026-09-15 11:45 AM',
    destination: 'Beirut Central Distribution Depot (Verdun)',
    carrierDriver: 'Fadi Abou Assi (Plate G-183921)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    packagesCount: 240,
    totalVolumeL: 4200,
    invoiceRef: 'INV-103351',
    qaReleaseStamp: 'PASSED (Dr. N. Mansour)',
    dispatcher: 'Walid Sleiman',
    status: 'DISPATCHED',
  },
  {
    id: 'DSP-5511',
    runCode: 'DSP-2026-5511',
    time: '2026-09-15 01:15 PM',
    destination: 'Tripoli & North Corridor Hub',
    carrierDriver: 'Mohammad Al-Husseini (Plate T-492102)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    packagesCount: 180,
    totalVolumeL: 3150,
    invoiceRef: 'INV-103352',
    qaReleaseStamp: 'PASSED (Dr. N. Mansour)',
    dispatcher: 'Walid Sleiman',
    status: 'DISPATCHED',
  },
  {
    id: 'DSP-5512',
    runCode: 'DSP-2026-5512',
    time: '2026-09-15 09:30 AM',
    destination: 'Sidon & South Retail Depots',
    carrierDriver: 'Charbel Rahme (Plate B-310928)',
    category: 'Extra Virgin Olive Oil (EVOO)',
    packagesCount: 310,
    totalVolumeL: 5425,
    invoiceRef: 'INV-103350',
    qaReleaseStamp: 'PASSED (Dr. N. Mansour)',
    dispatcher: 'Hassan Mortada',
    status: 'DELIVERED',
  },
  {
    id: 'DSP-5513',
    runCode: 'DSP-2026-5513',
    time: '2026-09-15 03:00 PM',
    destination: 'Bekaa Valley Supermarket Group (Zahle)',
    carrierDriver: 'Tarek Khoury (Plate Z-102948)',
    category: 'Virgin Olive Oil',
    packagesCount: 150,
    totalVolumeL: 2625,
    invoiceRef: 'INV-103353',
    qaReleaseStamp: 'INSPECTION PENDING',
    dispatcher: 'Walid Sleiman',
    status: 'PREPARING',
  }
];

// ============================================================================
// 3. FILTER DEFINITIONS & OPTIONS
// ============================================================================

const SHIFT_LINE_OPTIONS: FilterOption[] = [
  { label: 'All Lines & Shifts', value: 'all' },
  { label: 'Pressing Line 01 (Choueifat)', value: 'Line 01' },
  { label: 'Pressing Line 02 (South Plant)', value: 'Line 02' },
  { label: 'Automated Bottling Line A', value: 'Bottling Line A' },
  { label: 'Tin Packaging Line B', value: 'Packaging Line B' },
  { label: 'Shift A (06:00 - 14:00)', value: 'Shift A' },
  { label: 'Shift B (14:00 - 22:00)', value: 'Shift B' },
];

const CATEGORY_OPTIONS: FilterOption[] = [
  { label: 'All Product Categories', value: 'all' },
  { label: 'Extra Virgin Olive Oil (EVOO)', value: 'Extra Virgin Olive Oil (EVOO)' },
  { label: 'Virgin Olive Oil', value: 'Virgin Olive Oil' },
  { label: 'Cold Extraction (<27°C)', value: 'Cold Extraction (<27°C)' },
  { label: 'Preserved & Cured Olives', value: 'Preserved & Cured Olives' },
  { label: 'Raw Bulk Stock', value: 'Raw Bulk Stock' },
];

const STATUS_OPTIONS: FilterOption[] = [
  { label: 'All Request Statuses', value: 'all' },
  { label: 'COMPLETED / OPTIMAL / DELIVERED', value: 'COMPLETED' },
  { label: 'IN PROGRESS / ACTIVE', value: 'IN_PROGRESS' },
  { label: 'QUALITY HOLD / CALIBRATION', value: 'QUALITY_HOLD' },
  { label: 'DISPATCHED', value: 'DISPATCHED' },
  { label: 'SCHEDULED / PREPARING', value: 'SCHEDULED' },
];

// ============================================================================
// 4. MAIN EXPORTED OPERATION CENTER REPORTS VIEW
// ============================================================================

export default function AuthenticVanguardInventoryReports() {
  const { t, dir } = useLanguage();
  // Active Sheet Tab & Selected Report Name
  const [activeSheet, setActiveSheet] = useState<OperationalReportSheetId>('REP_OPS_003');
  const [selectedReportName, setSelectedReportName] = useState<string>('Inventory report');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Metadata for active report
  const activeMeta = useMemo(() => getInventoryReportMeta(selectedReportName), [selectedReportName]);

  // Synchronize recent reports in localStorage when selected
  const handleReportSelect = (reportName: string) => {
    setSelectedReportName(reportName);
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vanguard_recent_reports_inventory');
        const prev = stored ? JSON.parse(stored) : [];
        if (Array.isArray(prev)) {
          const updated = [reportName, ...prev.filter((r: string) => r !== reportName)].slice(0, 5);
          localStorage.setItem('vanguard_recent_reports_inventory', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('[handleReportSelect] localStorage sync error:', err);
    }

    // Dynamic Sheet Switcher based on report domain
    const lower = reportName.toLowerCase();
    if (
      lower.includes('extraction') ||
      lower.includes('production') ||
      lower.includes('sheet') ||
      lower.includes('consumption')
    ) {
      handleSheetChange('REP_OPS_001');
    } else if (
      lower.includes('cycle') ||
      lower.includes('pressing') ||
      lower.includes('variation') ||
      lower.includes('cost')
    ) {
      handleSheetChange('REP_OPS_002');
    } else if (
      lower.includes('inventory') ||
      lower.includes('tank') ||
      lower.includes('silo') ||
      lower.includes('valuation') ||
      lower.includes('expiry') ||
      lower.includes('overstock')
    ) {
      handleSheetChange('REP_OPS_003');
    } else if (
      lower.includes('work order') ||
      lower.includes('packaging') ||
      lower.includes('assembly') ||
      lower.includes('adjustment') ||
      lower.includes('requisition') ||
      lower.includes('wastage')
    ) {
      handleSheetChange('REP_OPS_004');
    } else {
      handleSheetChange('REP_OPS_005');
    }
  };

  // Filters State
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [period, setPeriod] = useState<string>(initialDateRange.preset);
  const [fromDate, setFromDate] = useState<string>(initialDateRange.fromDate);
  const [toDate, setToDate] = useState<string>(initialDateRange.toDate);
  const [selectedShiftLine, setSelectedShiftLine] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [opsFilterValues, setOpsFilterValues] = useState<Record<string, any>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter Reset
  const handleResetFilters = () => {
    const defRange = getDefaultInitialDateRange('This Month');
    setSearchQuery('');
    setPeriod(defRange.preset);
    setFromDate(defRange.fromDate);
    setToDate(defRange.toDate);
    setSelectedShiftLine('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setOpsFilterValues({});
    setCurrentPage(1);
  };

  // Change sheet helper
  const handleSheetChange = (sheet: OperationalReportSheetId) => {
    setActiveSheet(sheet);
    setCurrentPage(1);
  };

  // ==========================================================================
  // FILTERED DATASETS
  // ==========================================================================

  // 1. Production Logs Filtered
  const filteredProductionLogs = useMemo(() => {
    return PRODUCTION_LOGS_DATA.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.batchNumber.toLowerCase().includes(q) ||
          item.line.toLowerCase().includes(q) ||
          item.growerSource.toLowerCase().includes(q) ||
          item.operator.toLowerCase().includes(q) ||
          item.destinationTank.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedShiftLine !== 'all') {
        if (!item.line.includes(selectedShiftLine) && !item.shift.includes(selectedShiftLine)) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'COMPLETED' && item.status !== 'COMPLETED') return false;
        if (selectedStatus === 'IN_PROGRESS' && item.status !== 'IN_PROGRESS') return false;
        if (selectedStatus === 'QUALITY_HOLD' && item.status !== 'QUALITY_HOLD') return false;
      }
      return true;
    });
  }, [searchQuery, selectedShiftLine, selectedCategory, selectedStatus]);

  // 2. Pressing Cycles Filtered
  const filteredPressingCycles = useMemo(() => {
    return PRESSING_CYCLES_DATA.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.cycleCode.toLowerCase().includes(q) ||
          item.line.toLowerCase().includes(q) ||
          item.oliveVariety.toLowerCase().includes(q) ||
          item.operator.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedShiftLine !== 'all' && !item.line.includes(selectedShiftLine)) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'COMPLETED' && item.status !== 'COMPLETED') return false;
        if (selectedStatus === 'IN_PROGRESS' && item.status !== 'IN_PROGRESS') return false;
        if (selectedStatus === 'QUALITY_HOLD' && item.status !== 'CALIBRATION') return false;
      }
      return true;
    });
  }, [searchQuery, selectedShiftLine, selectedCategory, selectedStatus]);

  // 3. Tank Throughput Filtered
  const filteredTankThroughput = useMemo(() => {
    return TANK_THROUGHPUT_DATA.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.tankName.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'COMPLETED' && item.status !== 'OPTIMAL') return false;
        if (selectedStatus === 'IN_PROGRESS' && item.status !== 'REFILL_IN_PROGRESS') return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // 4. Work Orders Filtered
  const filteredWorkOrders = useMemo(() => {
    return WORK_ORDERS_DATA.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.workOrderCode.toLowerCase().includes(q) ||
          item.itemSku.toLowerCase().includes(q) ||
          item.itemDescription.toLowerCase().includes(q) ||
          item.supervisor.toLowerCase().includes(q) ||
          item.line.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedShiftLine !== 'all' && !item.line.includes(selectedShiftLine)) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'COMPLETED' && item.status !== 'COMPLETED') return false;
        if (selectedStatus === 'IN_PROGRESS' && item.status !== 'IN_PROGRESS') return false;
        if (selectedStatus === 'SCHEDULED' && item.status !== 'SCHEDULED') return false;
      }
      return true;
    });
  }, [searchQuery, selectedShiftLine, selectedCategory, selectedStatus]);

  // 5. Dispatch Runs Filtered
  const filteredDispatchRuns = useMemo(() => {
    return DISPATCH_RUNS_DATA.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.runCode.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.carrierDriver.toLowerCase().includes(q) ||
          item.invoiceRef.toLowerCase().includes(q) ||
          item.dispatcher.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'COMPLETED' && item.status !== 'DELIVERED') return false;
        if (selectedStatus === 'DISPATCHED' && item.status !== 'DISPATCHED') return false;
        if (selectedStatus === 'SCHEDULED' && item.status !== 'PREPARING') return false;
      }
      return true;
    });
  }, [searchQuery, selectedStatus]);

  // Active dataset count & sliced pagination
  const activeDataCount = useMemo(() => {
    switch (activeSheet) {
      case 'REP_OPS_001':
        return filteredProductionLogs.length;
      case 'REP_OPS_002':
        return filteredPressingCycles.length;
      case 'REP_OPS_003':
        return filteredTankThroughput.length;
      case 'REP_OPS_004':
        return filteredWorkOrders.length;
      case 'REP_OPS_005':
        return filteredDispatchRuns.length;
    }
  }, [
    activeSheet,
    filteredProductionLogs,
    filteredPressingCycles,
    filteredTankThroughput,
    filteredWorkOrders,
    filteredDispatchRuns,
  ]);

  const totalPages = Math.max(1, Math.ceil(activeDataCount / pageSize));

  // Current page records
  const paginatedProductionLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProductionLogs.slice(start, start + pageSize);
  }, [filteredProductionLogs, currentPage, pageSize]);

  const paginatedPressingCycles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPressingCycles.slice(start, start + pageSize);
  }, [filteredPressingCycles, currentPage, pageSize]);

  const paginatedTankThroughput = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTankThroughput.slice(start, start + pageSize);
  }, [filteredTankThroughput, currentPage, pageSize]);

  const paginatedWorkOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkOrders.slice(start, start + pageSize);
  }, [filteredWorkOrders, currentPage, pageSize]);

  const paginatedDispatchRuns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDispatchRuns.slice(start, start + pageSize);
  }, [filteredDispatchRuns, currentPage, pageSize]);

  // ==========================================================================
  // KPI CALCULATIONS (STANDARDIZED OPERATIONAL METRICS)
  // ==========================================================================

  const operationalMetrics: MetricCardItem[] = useMemo(() => {
    // 1. Daily Output (Liters pressed today + packaged)
    const totalDailyExtractedL = PRODUCTION_LOGS_DATA.filter((p) => p.date === '2026-09-15').reduce(
      (sum, p) => sum + p.oilExtractedL,
      0
    );
    const totalDailyUnitsFinished = WORK_ORDERS_DATA.filter(
      (w) => w.targetDate === '2026-09-15'
    ).reduce((sum, w) => sum + w.completedUnits, 0);

    // 2. Active Batches (In Progress)
    const activeBatchesCount =
      PRODUCTION_LOGS_DATA.filter((p) => p.status === 'IN_PROGRESS').length +
      PRESSING_CYCLES_DATA.filter((c) => c.status === 'IN_PROGRESS').length;

    // 3. Operational Efficiency (Average Extraction Yield %)
    const completedLogs = PRODUCTION_LOGS_DATA.filter((p) => p.status === 'COMPLETED');
    const avgYield = completedLogs.length
      ? (
          completedLogs.reduce((acc, curr) => acc + curr.yieldPercent, 0) / completedLogs.length
        ).toFixed(1)
      : '22.2';
    const avgAcidity = completedLogs.length
      ? (
          completedLogs.reduce((acc, curr) => acc + curr.acidityPercent, 0) / completedLogs.length
        ).toFixed(2)
      : '0.33';

    // 4. Pending Work Orders
    const pendingOrdersCount = WORK_ORDERS_DATA.filter(
      (w) => w.status === 'IN_PROGRESS' || w.status === 'SCHEDULED'
    ).length;

    return [
      {
        id: 'daily_output',
        title: t('daily_output', 'Daily Output'),
        value: `${totalDailyExtractedL.toLocaleString()} L`,
        change: {
          value: '+14.2% vs target',
          trend: 'up',
        },
        subtext: `${totalDailyUnitsFinished.toLocaleString()} ${t('packaged_units_completed_today', 'packaged units completed today')}`,
        icon: <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      },
      {
        id: 'active_work_orders',
        title: t('active_work_orders', 'Active Work Orders'),
        value: `${pendingOrdersCount} ${t('active_orders', 'Active Orders')}`,
        change: {
          value: `${WORK_ORDERS_DATA.filter((w) => w.status === 'IN_PROGRESS').length} ${t('in_progress', 'in progress')}, ${WORK_ORDERS_DATA.filter((w) => w.status === 'SCHEDULED').length} ${t('scheduled', 'scheduled')}`,
          trend: 'neutral',
        },
        subtext: t('scheduled_on_lines_ab', 'Scheduled on lines A & B'),
        icon: <ClipboardCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      },
      {
        id: 'batch_status',
        title: t('batch_status', 'Batch Status'),
        value: `${activeBatchesCount} ${t('active', 'Active')} / ${PRODUCTION_LOGS_DATA.filter((b) => b.status === 'COMPLETED').length} ${t('done', 'Done')}`,
        change: {
          value: t('processing_quality_hold', '4 processing, 1 quality hold'),
          trend: 'neutral',
        },
        subtext: t('avg_extraction_cycle_time', 'Avg extraction cycle time: 48 mins'),
        icon: <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      },
      {
        id: 'efficiency_rate',
        title: t('efficiency_rate', 'Efficiency Rate'),
        value: `${avgYield}%`,
        change: {
          value: `${t('acidity', 'Acidity')}: ${avgAcidity}% (${t('evoo_standard', 'EVOO Standard')})`,
          trend: 'up',
        },
        subtext: t('total_olives_milled', 'Total olives milled: 107.2 Tonnes'),
        icon: <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      },
    ];
  }, [t]);

  // ==========================================================================
  // EXPORT & PRINT ACTIONS
  // ==========================================================================

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Operation_Center_Report_${activeSheet}_${new Date().toISOString().slice(0, 10)}.csv`;

    switch (activeSheet) {
      case 'REP_OPS_001':
        headers = [
          'Batch #',
          'Date',
          'Shift',
          'Line',
          'Product Category',
          'Grower Source',
          'Olive Intake (KG)',
          'Oil Extracted (L)',
          'Yield %',
          'Acidity %',
          'Destination Tank',
          'Operator',
          'Status'
        ];
        rows = filteredProductionLogs.map((r) => [
          r.batchNumber,
          r.date,
          r.shift,
          r.line,
          r.category,
          `"${r.growerSource}"`,
          r.oliveIntakeKg,
          r.oilExtractedL,
          r.yieldPercent,
          r.acidityPercent,
          r.destinationTank,
          r.operator,
          r.status
        ]);
        break;

      case 'REP_OPS_002':
        headers = [
          'Cycle Code',
          'Processing Line',
          'Timestamp',
          'Category',
          'Olive Variety',
          'Malaxation Temp (°C)',
          'Malaxation Time (Min)',
          'Decanter RPM',
          'Cycle Duration (Min)',
          'Throughput (KG/Hr)',
          'Operator',
          'Status'
        ];
        rows = filteredPressingCycles.map((r) => [
          r.cycleCode,
          r.line,
          r.date,
          r.category,
          r.oliveVariety,
          r.malaxationTempC,
          r.malaxationMinutes,
          r.decanterRpm,
          r.cycleDurationMin,
          r.throughputKgHr,
          r.operator,
          r.status
        ]);
        break;

      case 'REP_OPS_003':
        headers = [
          'Tank ID',
          'Tank Name',
          'Category',
          'Capacity (L)',
          'Initial Volume (L)',
          'Inflow (L)',
          'Outflow (L)',
          'Current Balance (L)',
          'Fill %',
          'Temp (°C)',
          'Nitrogen Blanket',
          'Last Inspection',
          'Status'
        ];
        rows = filteredTankThroughput.map((r) => [
          r.id,
          `"${r.tankName}"`,
          r.category,
          r.capacityL,
          r.initialVolumeL,
          r.inflowL,
          r.outflowL,
          r.currentBalanceL,
          r.fillPercentage,
          r.temperatureC,
          r.nitrogenBlanket,
          r.lastInspectionDate,
          r.status
        ]);
        break;

      case 'REP_OPS_004':
        headers = [
          'Work Order',
          'SKU Code',
          'Description',
          'Line',
          'Category',
          'Target Units',
          'Completed Units',
          'Scrap Units',
          'Scrap Rate %',
          'Target Date',
          'Supervisor',
          'Priority',
          'Status'
        ];
        rows = filteredWorkOrders.map((r) => [
          r.workOrderCode,
          r.itemSku,
          `"${r.itemDescription}"`,
          r.line,
          r.category,
          r.targetUnits,
          r.completedUnits,
          r.scrapUnits,
          r.scrapRatePercent,
          r.targetDate,
          r.supervisor,
          r.priority,
          r.status
        ]);
        break;

      case 'REP_OPS_005':
        headers = [
          'Run Code',
          'Dispatch Time',
          'Destination Depot',
          'Carrier Driver',
          'Packages Count',
          'Total Volume (L)',
          'Invoice Ref',
          'QA Release Stamp',
          'Dispatcher',
          'Status'
        ];
        rows = filteredDispatchRuns.map((r) => [
          r.runCode,
          r.time,
          `"${r.destination}"`,
          `"${r.carrierDriver}"`,
          r.packagesCount,
          r.totalVolumeL,
          r.invoiceRef,
          r.qaReleaseStamp,
          r.dispatcher,
          r.status
        ]);
        break;
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Text Helper (Zero badges/pills, pure bold semantic text)
  const renderStatusBadge = (status: string) => {
    const label = t(status.toLowerCase(), status.replace(/_/g, ' '));
    switch (status) {
      case 'COMPLETED':
      case 'OPTIMAL':
      case 'DELIVERED':
        return (
          <span className="text-emerald-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      case 'IN_PROGRESS':
      case 'REFILL_IN_PROGRESS':
        return (
          <span className="text-blue-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="text-blue-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      case 'QUALITY_HOLD':
      case 'CALIBRATION':
      case 'HOLD':
        return (
          <span className="text-amber-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      case 'SCHEDULED':
      case 'PREPARING':
      case 'DRAINING':
        return (
          <span className="text-amber-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      default:
        return (
          <span className="text-slate-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
    }
  };

  // Priority Text Helper (Pure bold semantic text)
  const renderPriorityBadge = (priority: string) => {
    const label = t(priority.toLowerCase(), priority);
    switch (priority) {
      case 'URGENT':
        return (
          <span className="text-rose-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-amber-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
      default:
        return (
          <span className="text-slate-700 font-bold tracking-wide uppercase text-xs">
            {label}
          </span>
        );
    }
  };

  return (
    <ReportPageLayout
      moduleTitle={t('operations_center', 'Operations Center')}
      moduleKey="operations"
      storageKeyOverride="vanguard_recent_reports_inventory"
      categories={INVENTORY_CONTROL_OMEGA_TREE}
      selectedReport={selectedReportName}
      onSelectReport={handleReportSelect}
      // 1. STANDARDIZED HEADER
      header={
        <ReportHeader
          title={t(activeMeta.name, activeMeta.name)}
          subtitle={`${t('operations_center_audit_subtitle', 'Operations Center & Inventory module audit trails, stock throughput, and balance ledger for')} ${period.replace('_', ' ')}.`}
          breadcrumbs={[
            { label: t('home', 'Home'), href: '/backoffice' },
            { label: t('operations_center', 'Operations Center'), href: '/operations-center/reports' },
            { label: t(activeMeta.category, activeMeta.category) },
            ...(activeMeta.subGroup ? [{ label: t(activeMeta.subGroup, activeMeta.subGroup) }] : []),
            { label: t(activeMeta.name, activeMeta.name) },
          ]}
          reportCode={activeMeta.code}
          badgeText={t('live_monitoring', 'LIVE MONITORING')}
          badgeVariant="success"
          actions={
            <ExportButtons
              onExportPdf={handleExportPdf}
              onPrint={handlePrint}
              onExportExcel={handleExportCsv}
              onExportCsv={handleExportCsv}
            />
          }
        />
      }
      // 2. STANDARDIZED KPI METRICS
      metrics={<ReportMetricCards metrics={operationalMetrics} />}
      // 3. DYNAMIC FILTER ENGINE
      filters={
        <DynamicReportFilterRenderer
          activeReportKey={selectedReportName}
          module="operations"
          values={{
            period,
            fromDate,
            toDate,
            searchQuery,
            shiftLine: selectedShiftLine,
            itemCategory: selectedCategory,
            status: selectedStatus,
            ...opsFilterValues,
          }}
          onValuesChange={(newVals) => {
            if (newVals.period !== undefined) setPeriod(newVals.period);
            if (newVals.fromDate !== undefined) setFromDate(newVals.fromDate);
            if (newVals.toDate !== undefined) setToDate(newVals.toDate);
            if (newVals.searchQuery !== undefined) setSearchQuery(newVals.searchQuery);
            if (newVals.shiftLine !== undefined) setSelectedShiftLine(newVals.shiftLine);
            if (newVals.itemCategory !== undefined) setSelectedCategory(newVals.itemCategory);
            if (newVals.status !== undefined) setSelectedStatus(newVals.status);
            setOpsFilterValues(newVals);
            setCurrentPage(1);
          }}
          onApplyFilters={(vals) => alert(`Filters applied for: ${selectedReportName}`)}
          onResetFilters={handleResetFilters}
        />
      }
      // 4. STANDARDIZED DATA TABLES WITH TABS & PAGINATION
      table={
        <div className="space-y-4">
          {/* Operational Sheet Selector Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => handleSheetChange('REP_OPS_001')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeSheet === 'REP_OPS_001'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>{t('production_extraction_logs', 'Production & Extraction Logs')}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                  activeSheet === 'REP_OPS_001'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {filteredProductionLogs.length}
              </span>
            </button>

            <button
              onClick={() => handleSheetChange('REP_OPS_002')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeSheet === 'REP_OPS_002'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t('pressing_cycles', 'Pressing Cycles')}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                  activeSheet === 'REP_OPS_002'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {filteredPressingCycles.length}
              </span>
            </button>

            <button
              onClick={() => handleSheetChange('REP_OPS_003')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeSheet === 'REP_OPS_003'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>{t('tank_farm_throughput', 'Tank Farm & Bulk Silo Inventory Throughput')}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                  activeSheet === 'REP_OPS_003'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {filteredTankThroughput.length}
              </span>
            </button>

            <button
              onClick={() => handleSheetChange('REP_OPS_004')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeSheet === 'REP_OPS_004'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('packaging_work_orders', 'Packaging Work Orders')}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                  activeSheet === 'REP_OPS_004'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {filteredWorkOrders.length}
              </span>
            </button>

            <button
              onClick={() => handleSheetChange('REP_OPS_005')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeSheet === 'REP_OPS_005'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{t('dispatch_logistics', 'Dispatch Logistics')}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${
                  activeSheet === 'REP_OPS_005'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {filteredDispatchRuns.length}
              </span>
            </button>
          </div>

          {/* TABLE SHEET 1: PRODUCTION & EXTRACTION LOGS */}
          {activeSheet === 'REP_OPS_001' && (
            <ReportTableWrapper
              title={t('daily_extraction_production_logs', 'Daily Extraction & Pressing Production Logs')}
              subtitle={t('daily_extraction_logs_subtitle', 'Olive intake, cold pressing oil volume, acidity % laboratory results, and storage tank assignment')}
              totalRecordsCount={filteredProductionLogs.length}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalRecords: filteredProductionLogs.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">{t('batch_number', 'Batch Number')}</th>
                      <th className="py-2 px-3">{t('date_shift', 'Date & Shift')}</th>
                      <th className="py-2 px-3">{t('pressing_line', 'Pressing Line')}</th>
                      <th className="py-2 px-3">{t('grower_source', 'Grower / Source')}</th>
                      <th className="py-2 px-3 text-right">{t('intake_kg', 'Intake (KG)')}</th>
                      <th className="py-2 px-3 text-right">{t('extracted_l', 'Extracted (L)')}</th>
                      <th className="py-2 px-3 text-right">{t('yield_percent', 'Yield %')}</th>
                      <th className="py-2 px-3 text-right">{t('acidity_percent', 'Acidity %')}</th>
                      <th className="py-2 px-3">{t('destination_tank', 'Destination Tank')}</th>
                      <th className="py-2 px-3">{t('operator', 'Operator')}</th>
                      <th className="py-2 px-3 text-center">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProductionLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">
                          {log.batchNumber}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-slate-800">
                            {log.date}
                          </div>
                          <div className="font-mono text-xs text-slate-600 font-medium">
                            {log.shift}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <Factory className="w-3.5 h-3.5 text-slate-400" />
                            {log.line}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {log.growerSource}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                          {log.oliveIntakeKg.toLocaleString()} kg
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {log.oilExtractedL.toLocaleString()} L
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              log.yieldPercent >= 22.0
                                ? 'text-emerald-700 font-bold'
                                : 'text-slate-800 font-bold'
                            }
                          >
                            {log.yieldPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              log.acidityPercent <= 0.8
                                ? 'text-amber-700 font-bold'
                                : 'text-rose-700 font-bold'
                            }
                          >
                            {log.acidityPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs font-bold text-slate-800">
                          {log.destinationTank}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {log.operator}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {renderStatusBadge(log.status)}
                        </td>
                      </tr>
                    ))}
                    {paginatedProductionLogs.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-6 px-3 text-center text-slate-600 font-medium">
                          {t('no_production_logs_match', 'No production logs match the selected operational filters.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* TABLE SHEET 2: PRESSING CYCLES */}
          {activeSheet === 'REP_OPS_002' && (
            <ReportTableWrapper
              title={t('pressing_processing_cycles', 'Pressing & Processing Operational Cycles')}
              subtitle={t('pressing_cycles_subtitle', 'Malaxation temperatures, decanter speeds, cycle throughput rates, and technician telemetry')}
              totalRecordsCount={filteredPressingCycles.length}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalRecords: filteredPressingCycles.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">{t('cycle_code', 'Cycle Code')}</th>
                      <th className="py-2 px-3">{t('processing_line', 'Processing Line')}</th>
                      <th className="py-2 px-3">{t('date_start_time', 'Date / Start Time')}</th>
                      <th className="py-2 px-3">{t('olive_variety', 'Olive Variety')}</th>
                      <th className="py-2 px-3 text-right">{t('malaxation_temp', 'Malaxation Temp')}</th>
                      <th className="py-2 px-3 text-right">{t('duration_min', 'Duration (Min)')}</th>
                      <th className="py-2 px-3 text-right">{t('decanter_rpm', 'Decanter RPM')}</th>
                      <th className="py-2 px-3 text-right">{t('throughput_kgh', 'Throughput (KG/H)')}</th>
                      <th className="py-2 px-3">{t('operator', 'Operator')}</th>
                      <th className="py-2 px-3 text-center">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPressingCycles.map((cycle) => (
                      <tr
                        key={cycle.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">
                          {cycle.cycleCode}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {cycle.line}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">
                          {cycle.date}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">{cycle.oliveVariety}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              cycle.malaxationTempC <= 27.0
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }
                          >
                            {cycle.malaxationTempC.toFixed(1)} °C
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-800 font-medium">
                          {cycle.cycleDurationMin} mins
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                          {cycle.decanterRpm.toLocaleString()} RPM
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {cycle.throughputKgHr.toLocaleString()} kg/h
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {cycle.operator}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {renderStatusBadge(cycle.status)}
                        </td>
                      </tr>
                    ))}
                    {paginatedPressingCycles.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-6 px-3 text-center text-slate-600 font-medium">
                          {t('no_pressing_cycles_match', 'No pressing cycles match the selected operational filters.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* TABLE SHEET 3: TANK FARM THROUGHPUT */}
          {activeSheet === 'REP_OPS_003' && (
            <ReportTableWrapper
              title={t('tank_farm_throughput', 'Tank Farm & Bulk Silo Inventory Throughput')}
              subtitle={t('tank_farm_subtitle', 'Stainless steel tank capacities, inflows, outflows, current bulk balance, and nitrogen blanketing status')}
              totalRecordsCount={filteredTankThroughput.length}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalRecords: filteredTankThroughput.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 dark:bg-slate-800/80 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                      <th className="px-4 py-3">{t('tank_id', 'Tank ID')}</th>
                      <th className="px-4 py-3">{t('tank_name_location', 'Tank Name & Location')}</th>
                      <th className="py-2 px-3">{t('oil_classification', 'Oil Classification')}</th>
                      <th className="py-2 px-3 text-right">{t('capacity_l', 'Capacity (L)')}</th>
                      <th className="py-2 px-3 text-right">{t('inflow_l', 'Inflow (L)')}</th>
                      <th className="py-2 px-3 text-right">{t('outflow_l', 'Outflow (L)')}</th>
                      <th className="py-2 px-3 text-right">{t('balance_l', 'Balance (L)')}</th>
                      <th className="py-2 px-3 text-center">{t('fill_gauge', 'Fill Gauge')}</th>
                      <th className="py-2 px-3 text-right">{t('temp_c', 'Temp (°C)')}</th>
                      <th className="py-2 px-3 text-center">{t('nitrogen_gas', 'Nitrogen Gas')}</th>
                      <th className="py-2 px-3 text-center">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTankThroughput.map((tank) => (
                      <tr
                        key={tank.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">
                          {tank.id}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {tank.tankName}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800 text-xs">
                          {tank.category}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-900 font-medium">
                          {tank.capacityL.toLocaleString()} L
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                          +{tank.inflowL.toLocaleString()} L
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-rose-700 font-bold">
                          -{tank.outflowL.toLocaleString()} L
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {tank.currentBalanceL.toLocaleString()} L
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-xs font-bold text-slate-800 tabular-nums">
                          {tank.fillPercentage.toFixed(1)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-800 font-medium">
                          {tank.temperatureC.toFixed(1)} °C
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={
                              tank.nitrogenBlanket === 'ACTIVE'
                                ? 'text-emerald-700 font-bold tracking-wide uppercase text-xs'
                                : 'text-slate-600 font-bold tracking-wide uppercase text-xs'
                            }
                          >
                            {t(tank.nitrogenBlanket.toLowerCase(), tank.nitrogenBlanket)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {renderStatusBadge(tank.status)}
                        </td>
                      </tr>
                    ))}
                    {paginatedTankThroughput.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-6 px-3 text-center text-slate-600 font-medium">
                          {t('no_tanks_match', 'No tanks match the selected operational filters.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* TABLE SHEET 4: WORK ORDERS & PACKAGING ASSEMBLY */}
          {activeSheet === 'REP_OPS_004' && (
            <ReportTableWrapper
              title={t('packaging_work_orders_logs', 'Packaging Work Orders & Product Assembly Logs')}
              subtitle={t('packaging_work_orders_subtitle', 'Manufacturing work orders, scheduled retail packaging lines, completed units, and scrap loss metrics')}
              totalRecordsCount={filteredWorkOrders.length}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalRecords: filteredWorkOrders.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">{t('work_order_num', 'Work Order #')}</th>
                      <th className="py-2 px-3">{t('sku_item_description', 'SKU & Item Description')}</th>
                      <th className="py-2 px-3">{t('assembly_line', 'Assembly Line')}</th>
                      <th className="py-2 px-3 text-right">{t('target_units', 'Target Units')}</th>
                      <th className="py-2 px-3 text-right">{t('finished_units', 'Finished Units')}</th>
                      <th className="py-2 px-3 text-right">{t('scrap_rate_percent', 'Scrap Rate %')}</th>
                      <th className="py-2 px-3">{t('target_date', 'Target Date')}</th>
                      <th className="py-2 px-3">{t('supervisor', 'Supervisor')}</th>
                      <th className="py-2 px-3 text-center">{t('priority', 'Priority')}</th>
                      <th className="py-2 px-3 text-center">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedWorkOrders.map((wo) => (
                      <tr
                        key={wo.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">
                          {wo.workOrderCode}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-slate-800">
                            {wo.itemDescription}
                          </div>
                          <div className="font-mono text-xs text-slate-600 font-medium">
                            {wo.itemSku}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">{wo.line}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-900 font-medium">
                          {wo.targetUnits.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {wo.completedUnits.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          <span
                            className={
                              wo.scrapRatePercent <= 0.8
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }
                          >
                            {wo.scrapRatePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">
                          {wo.targetDate}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">{wo.supervisor}</td>
                        <td className="py-2 px-3 text-center">
                          {renderPriorityBadge(wo.priority)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {renderStatusBadge(wo.status)}
                        </td>
                      </tr>
                    ))}
                    {paginatedWorkOrders.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-6 px-3 text-center text-slate-600 font-medium">
                          {t('no_packaging_orders_match', 'No packaging work orders match the selected operational filters.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}

          {/* TABLE SHEET 5: DISPATCH OPERATIONS */}
          {activeSheet === 'REP_OPS_005' && (
            <ReportTableWrapper
              title={t('dispatch_operations_logistics', 'Dispatch Operations & Logistics Handover')}
              subtitle={t('dispatch_operations_subtitle', 'Outbound finished goods manifests, driver vehicle dispatch, QA stamps, and destination depot verification')}
              totalRecordsCount={filteredDispatchRuns.length}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalRecords: filteredDispatchRuns.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: (size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                      <th className="py-2 px-3">{t('run_code', 'Run Code')}</th>
                      <th className="py-2 px-3">{t('departure_time', 'Departure Time')}</th>
                      <th className="py-2 px-3">{t('destination_depot', 'Destination Depot')}</th>
                      <th className="py-2 px-3">{t('assigned_fleet_carrier', 'Assigned Fleet Carrier')}</th>
                      <th className="py-2 px-3 text-right">{t('packages_tins', 'Packages / Tins')}</th>
                      <th className="py-2 px-3 text-right">{t('net_volume_l', 'Net Volume (L)')}</th>
                      <th className="py-2 px-3">{t('invoice_ref', 'Invoice Ref')}</th>
                      <th className="py-2 px-3">{t('qa_release_stamp', 'QA Release Stamp')}</th>
                      <th className="py-2 px-3">{t('dispatcher', 'Dispatcher')}</th>
                      <th className="py-2 px-3 text-center">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDispatchRuns.map((run) => (
                      <tr
                        key={run.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-600 text-xs">
                          {run.runCode}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">
                          {run.time}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {run.destination}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {run.carrierDriver}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                          {run.packagesCount} pkgs
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {run.totalVolumeL.toLocaleString()} L
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">
                          {run.invoiceRef}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-emerald-700 uppercase text-xs">
                            {run.qaReleaseStamp}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {run.dispatcher}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {renderStatusBadge(run.status)}
                        </td>
                      </tr>
                    ))}
                    {paginatedDispatchRuns.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-6 px-3 text-center text-slate-600 font-medium">
                          {t('no_dispatch_ops_match', 'No dispatch operations match the selected operational filters.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportTableWrapper>
          )}
        </div>
      }
    />
  );
}