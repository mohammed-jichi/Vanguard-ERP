// lib/commercialOilStorage.ts
/**
 * Vanguard ERP - Commercial Oil Operations & Packaging Storage Engine
 * Handles unit-by-unit oil receiving, weight-based blending, packaging with dynamic box capacity,
 * and posting inventory directly to real dynamic warehouses.
 */

import fs from 'fs';
import path from 'path';
import { WarehouseService } from './warehouseStorage';

export interface StorageTank {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  grade: 'EXTRA_VIRGIN' | 'VIRGIN' | 'ORDINARY' | 'KURA_REFINED';
  gradeNameAr: string;
  capacityKg: number;
  currentKg: number;
  acidity: number; // percentage, e.g. 0.65
  location: string;
  lastCleaned?: string;
  updatedAt: string;
}

export interface ContainerItem {
  id: string;
  unitNumber: number;
  containerType: 'GALLON' | 'TIN';
  containerTypeNameAr: string;
  grossKg?: number;
  tareKg?: number;
  netKg: number;
}

export interface OilReceivingReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  supplierId: number | string;
  supplierName: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierAccountNo?: string;
  oilGrade: 'EXTRA_VIRGIN' | 'VIRGIN' | 'ORDINARY' | 'KURA_REFINED';
  oilGradeNameAr: string;
  acidity: number;
  targetStorageType: 'BULK_TANK' | 'RAW_CONTAINERS_STORAGE';
  targetStorageId: string;
  targetStorageNameAr: string;
  containers: ContainerItem[];
  gallonsCount: number;
  tinsCount: number;
  totalContainers: number;
  totalNetKg: number;
  avgContainerKg: number;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export interface BlendSourceItem {
  sourceId: string;
  sourceName: string;
  sourceType: 'BULK_TANK' | 'RAW_CONTAINERS_STORAGE';
  availableKg: number;
  withdrawnKg: number;
  sourceAcidity: number;
}

export interface BlendingBatch {
  id: string;
  batchNumber: string;
  date: string;
  batchName: string;
  operator: string;
  sources: BlendSourceItem[];
  totalBatchKg: number;
  weightedAvgAcidity: number;
  densityFactor: number;
  estimatedVolumeLiters: number;
  notes?: string;
  status: 'READY_FOR_PACKAGING' | 'PACKAGED' | 'ARCHIVED';
  createdAt: string;
}

export interface PackagingSkuItem {
  skuId: string;
  sizeMl: number;
  nameAr: string;
  containerType: 'BOTTLE' | 'GALLON' | 'TIN';
  boxCapacity: number; // DYNAMIC USER INPUT (e.g. 24, 12, 8, 6, 4, 2, or custom)
  boxes: number;
  loosePieces: number;
  totalPieces: number;
  totalLiters: number;
  consumedKg: number;
}

export interface PackagingPostingVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  batchId?: string;
  batchNumber?: string;
  batchName?: string;
  batchOriginalKg: number;
  densityFactor: number;
  availableLiters: number;
  targetWarehouseId: string;
  targetWarehouseNameAr: string;
  targetWarehouseCode: string;
  skus: PackagingSkuItem[];
  totalPiecesProduced: number;
  totalLitersPackaged: number;
  totalConsumedKg: number;
  packagingLossKg: number;
  packagingLossPercent: number;
  isLossAcceptable: boolean;
  operator: string;
  notes?: string;
  createdAt: string;
}

export interface WarehouseSkuStock {
  warehouseId: string;
  skuId: string;
  sizeMl: number;
  nameAr: string;
  boxCapacity: number;
  boxesCount: number;
  loosePieces: number;
  totalUnits: number;
  totalLiters: number;
  totalKg: number;
  lastUpdated: string;
}

export interface InventoryMovementLog {
  id: string;
  timestamp: string;
  type: 'RECEIVE_RAW' | 'BLENDING_WITHDRAWAL' | 'PACKAGING_POST' | 'WAREHOUSE_TRANSFER';
  refNumber: string;
  description: string;
  sourceLocation: string;
  destinationLocation: string;
  qtyKg: number;
  unitsSummary?: string;
  performedBy: string;
}

interface CommercialOilDbState {
  tanks: StorageTank[];
  receipts: OilReceivingReceipt[];
  batches: BlendingBatch[];
  packagingVouchers: PackagingPostingVoucher[];
  warehouseStocks: WarehouseSkuStock[];
  movements: InventoryMovementLog[];
  nextReceiptSeq: number;
  nextBatchSeq: number;
  nextPkgSeq: number;
  lastUpdated: string;
}

// 8 Mandatory Standard Packaging Sizes
export const STANDARD_PACKAGING_SIZES = [
  { skuId: 'sku-250ml', sizeMl: 250, nameAr: 'ألفية حجم 250 مل', defaultBoxCap: 24, containerType: 'BOTTLE' as const },
  { skuId: 'sku-500ml', sizeMl: 500, nameAr: 'ألفية حجم 500 مل', defaultBoxCap: 12, containerType: 'BOTTLE' as const },
  { skuId: 'sku-750ml', sizeMl: 750, nameAr: 'ألفية حجم 750 مل', defaultBoxCap: 12, containerType: 'BOTTLE' as const },
  { skuId: 'sku-1000ml', sizeMl: 1000, nameAr: 'ألفية حجم 1000 مل (1 ليتر)', defaultBoxCap: 12, containerType: 'BOTTLE' as const },
  { skuId: 'sku-1500ml', sizeMl: 1500, nameAr: 'ألفية حجم 1500 مل (1.5 ليتر)', defaultBoxCap: 6, containerType: 'BOTTLE' as const },
  { skuId: 'sku-2850ml', sizeMl: 2850, nameAr: 'ألفية حجم 2850 مل', defaultBoxCap: 4, containerType: 'BOTTLE' as const },
  { skuId: 'sku-8500ml', sizeMl: 8500, nameAr: 'غالون حجم 8500 مل (8.5 ليتر)', defaultBoxCap: 2, containerType: 'GALLON' as const },
  { skuId: 'sku-17500ml', sizeMl: 17500, nameAr: 'غالون حجم 17500 مل (17.5 ليتر)', defaultBoxCap: 1, containerType: 'GALLON' as const }
];

const INITIAL_TANKS: StorageTank[] = [
  {
    id: 'tank-01',
    code: 'T-01',
    name: 'Bulk Tank 01 - Extra Virgin (EVOO)',
    nameAr: 'خزان تجميع T-01: زيت زيتون بكر ممتاز (EVOO)',
    grade: 'EXTRA_VIRGIN',
    gradeNameAr: 'بكر ممتاز (EVOO)',
    capacityKg: 30000,
    currentKg: 14250,
    acidity: 0.55,
    location: 'Tank Farm Bay A',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tank-02',
    code: 'T-02',
    name: 'Bulk Tank 02 - Virgin Oil',
    nameAr: 'خزان تجميع T-02: زيت زيتون بكر طبيعي',
    grade: 'VIRGIN',
    gradeNameAr: 'بكر طبيعي',
    capacityKg: 25000,
    currentKg: 9800,
    acidity: 1.15,
    location: 'Tank Farm Bay A',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tank-03',
    code: 'T-03',
    name: 'Bulk Tank 03 - Ordinary Olive Oil',
    nameAr: 'خزان تجميع T-03: زيت زيتون عادي',
    grade: 'ORDINARY',
    gradeNameAr: 'زيت عادي',
    capacityKg: 20000,
    currentKg: 6400,
    acidity: 2.20,
    location: 'Tank Farm Bay B',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'raw-containers-bay',
    code: 'BAY-RAW',
    name: 'Raw Containers Storage Bay',
    nameAr: 'مستودع العبوات الخام (غالونات وتنكات دون تفريغ)',
    grade: 'VIRGIN',
    gradeNameAr: 'عبوات خام متنوعة',
    capacityKg: 50000,
    currentKg: 18200,
    acidity: 0.85,
    location: 'Raw Inbound Warehouse Hall 1',
    updatedAt: new Date().toISOString()
  }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const OIL_DB_FILE = path.join(DATA_DIR, 'vanguard_commercial_oil_db.json');

let inMemoryOilDb: CommercialOilDbState | null = null;
let lastMtime = 0;

function ensureOilDbFile(): CommercialOilDbState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(OIL_DB_FILE)) {
      const initialState: CommercialOilDbState = {
        tanks: INITIAL_TANKS,
        receipts: [],
        batches: [],
        packagingVouchers: [],
        warehouseStocks: [],
        movements: [],
        nextReceiptSeq: 1001,
        nextBatchSeq: 201,
        nextPkgSeq: 501,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(OIL_DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
      inMemoryOilDb = initialState;
      try {
        lastMtime = fs.statSync(OIL_DB_FILE).mtimeMs;
      } catch {
        lastMtime = Date.now();
      }
      return inMemoryOilDb;
    }

    if (inMemoryOilDb) {
      try {
        const curMtime = fs.statSync(OIL_DB_FILE).mtimeMs;
        if (curMtime <= lastMtime) {
          return inMemoryOilDb;
        }
      } catch {
        return inMemoryOilDb;
      }
    }

    const raw = fs.readFileSync(OIL_DB_FILE, 'utf-8');
    const parsed: CommercialOilDbState = JSON.parse(raw);
    if (!parsed.tanks || parsed.tanks.length === 0) {
      parsed.tanks = INITIAL_TANKS;
    }
    if (!parsed.receipts) parsed.receipts = [];
    if (!parsed.batches) parsed.batches = [];
    if (!parsed.packagingVouchers) parsed.packagingVouchers = [];
    if (!parsed.warehouseStocks) parsed.warehouseStocks = [];
    if (!parsed.movements) parsed.movements = [];
    if (!parsed.nextReceiptSeq) parsed.nextReceiptSeq = 1001;
    if (!parsed.nextBatchSeq) parsed.nextBatchSeq = 201;
    if (!parsed.nextPkgSeq) parsed.nextPkgSeq = 501;

    inMemoryOilDb = parsed;
    try {
      lastMtime = fs.statSync(OIL_DB_FILE).mtimeMs;
    } catch {
      lastMtime = Date.now();
    }
    return inMemoryOilDb;
  } catch (error) {
    console.error('Error reading vanguard_commercial_oil_db.json:', error);
    return {
      tanks: INITIAL_TANKS,
      receipts: [],
      batches: [],
      packagingVouchers: [],
      warehouseStocks: [],
      movements: [],
      nextReceiptSeq: 1001,
      nextBatchSeq: 201,
      nextPkgSeq: 501,
      lastUpdated: new Date().toISOString()
    };
  }
}

function saveOilDb(state: CommercialOilDbState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(OIL_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    inMemoryOilDb = state;
    try {
      lastMtime = fs.statSync(OIL_DB_FILE).mtimeMs;
    } catch {
      lastMtime = Date.now();
    }
  } catch (error) {
    console.error('Error persisting vanguard_commercial_oil_db.json:', error);
  }
}

export class CommercialOilService {
  public static getState() {
    return ensureOilDbFile();
  }

  public static getTanks(): StorageTank[] {
    const db = ensureOilDbFile();
    return db.tanks;
  }

  /**
   * STAGE 1: Unit-by-Unit Oil Receiving
   * Receives containers, calculates totals, and increments storage tank or raw container bay balance.
   */
  public static receiveOilIntake(payload: {
    supplierId: number | string;
    supplierName: string;
    supplierPhone: string;
    supplierAddress: string;
    supplierAccountNo?: string;
    oilGrade: 'EXTRA_VIRGIN' | 'VIRGIN' | 'ORDINARY' | 'KURA_REFINED';
    acidity: number;
    targetStorageId: string;
    containers: { containerType: 'GALLON' | 'TIN'; netKg: number; grossKg?: number; tareKg?: number }[];
    notes?: string;
    receivedBy: string;
  }): OilReceivingReceipt {
    const db = ensureOilDbFile();

    if (!payload.containers || payload.containers.length === 0) {
      throw new Error('No containers recorded for this intake receipt.');
    }

    const targetTank = db.tanks.find(t => t.id === payload.targetStorageId);
    if (!targetTank) {
      throw new Error(`Target storage destination ${payload.targetStorageId} not found.`);
    }

    let gallons = 0;
    let tins = 0;
    let totalNetKg = 0;

    const containersList: ContainerItem[] = payload.containers.map((c, idx) => {
      const net = Math.max(0, Number(c.netKg) || 0);
      if (c.containerType === 'GALLON') gallons++;
      else tins++;
      totalNetKg += net;

      return {
        id: `c-${Date.now()}-${idx + 1}`,
        unitNumber: idx + 1,
        containerType: c.containerType,
        containerTypeNameAr: c.containerType === 'GALLON' ? 'غالون بلاستيك' : 'تنكة حديد',
        grossKg: c.grossKg,
        tareKg: c.tareKg,
        netKg: net
      };
    });

    totalNetKg = Math.round(totalNetKg * 100) / 100;
    const avgKg = containersList.length > 0 ? Math.round((totalNetKg / containersList.length) * 100) / 100 : 0;

    const receiptNum = `REC-OIL-${new Date().getFullYear()}-${db.nextReceiptSeq.toString().padStart(4, '0')}`;
    db.nextReceiptSeq++;

    const gradeNamesAr: Record<string, string> = {
      EXTRA_VIRGIN: 'بكر ممتاز (EVOO)',
      VIRGIN: 'بكر طبيعي',
      ORDINARY: 'زيت عادي',
      KURA_REFINED: 'زيت بلدي كورة مكرر'
    };

    const newReceipt: OilReceivingReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-LB', { hour12: false }),
      supplierId: payload.supplierId,
      supplierName: payload.supplierName,
      supplierPhone: payload.supplierPhone,
      supplierAddress: payload.supplierAddress,
      supplierAccountNo: payload.supplierAccountNo,
      oilGrade: payload.oilGrade,
      oilGradeNameAr: gradeNamesAr[payload.oilGrade] || 'زيت زيتون',
      acidity: Number(payload.acidity) || 0.8,
      targetStorageType: targetTank.id === 'raw-containers-bay' ? 'RAW_CONTAINERS_STORAGE' : 'BULK_TANK',
      targetStorageId: targetTank.id,
      targetStorageNameAr: targetTank.nameAr,
      containers: containersList,
      gallonsCount: gallons,
      tinsCount: tins,
      totalContainers: containersList.length,
      totalNetKg,
      avgContainerKg: avgKg,
      notes: payload.notes || '',
      receivedBy: payload.receivedBy || 'Staff Operator',
      createdAt: new Date().toISOString()
    };

    // Atomic update of destination storage balance and weighted acidity
    const oldWeight = targetTank.currentKg;
    const newTotalWeight = oldWeight + totalNetKg;
    if (newTotalWeight > 0) {
      targetTank.acidity = Math.round(((oldWeight * targetTank.acidity) + (totalNetKg * newReceipt.acidity)) / newTotalWeight * 100) / 100;
    }
    targetTank.currentKg = Math.round(newTotalWeight * 100) / 100;
    targetTank.updatedAt = new Date().toISOString();

    // Register movement log
    db.movements.unshift({
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'RECEIVE_RAW',
      refNumber: receiptNum,
      description: `استلام ${containersList.length} عبوة بوزن ${totalNetKg} كغ من المورد ${payload.supplierName}`,
      sourceLocation: `المورد: ${payload.supplierName}`,
      destinationLocation: targetTank.nameAr,
      qtyKg: totalNetKg,
      unitsSummary: `${gallons} غالون، ${tins} تنكة`,
      performedBy: payload.receivedBy || 'مستلم المستودع'
    });

    db.receipts.unshift(newReceipt);
    saveOilDb(db);
    return newReceipt;
  }

  /**
   * STAGE 2: Weight-Based Mixing & Blending
   * Directly withdraws net weight in KG from tanks/raw storage, deducts atomically,
   * and calculates weighted average acidity.
   */
  public static createBlendingBatch(payload: {
    batchName?: string;
    operator: string;
    sources: { sourceId: string; withdrawnKg: number }[];
    densityFactor?: number;
    notes?: string;
  }): BlendingBatch {
    const db = ensureOilDbFile();

    if (!payload.sources || payload.sources.length === 0) {
      throw new Error('At least one source lot or tank must be selected for blending.');
    }

    let totalBatchKg = 0;
    let weightedAciditySum = 0;
    const blendSources: BlendSourceItem[] = [];

    // Validate balances first
    for (const src of payload.sources) {
      const tank = db.tanks.find(t => t.id === src.sourceId);
      if (!tank) {
        throw new Error(`Source storage ${src.sourceId} does not exist.`);
      }
      const withdrawn = Math.max(0, Number(src.withdrawnKg) || 0);
      if (withdrawn <= 0) continue;

      if (withdrawn > tank.currentKg) {
        throw new Error(`Insufficient balance in ${tank.nameAr}. Available: ${tank.currentKg} kg, requested: ${withdrawn} kg.`);
      }

      blendSources.push({
        sourceId: tank.id,
        sourceName: tank.nameAr,
        sourceType: tank.id === 'raw-containers-bay' ? 'RAW_CONTAINERS_STORAGE' : 'BULK_TANK',
        availableKg: tank.currentKg,
        withdrawnKg: withdrawn,
        sourceAcidity: tank.acidity
      });

      totalBatchKg += withdrawn;
      weightedAciditySum += (withdrawn * tank.acidity);
    }

    if (totalBatchKg <= 0) {
      throw new Error('Total withdrawn weight must be greater than 0 kg.');
    }

    // Atomic deductions
    for (const bs of blendSources) {
      const tank = db.tanks.find(t => t.id === bs.sourceId)!;
      tank.currentKg = Math.round((tank.currentKg - bs.withdrawnKg) * 100) / 100;
      tank.updatedAt = new Date().toISOString();
    }

    const weightedAvgAcidity = Math.round((weightedAciditySum / totalBatchKg) * 100) / 100;
    const density = Number(payload.densityFactor) || 0.916;
    const volumeLiters = Math.round((totalBatchKg / density) * 100) / 100;

    const batchNum = `BLEND-${new Date().getFullYear()}-${db.nextBatchSeq.toString().padStart(3, '0')}`;
    db.nextBatchSeq++;

    const newBatch: BlendingBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: batchNum,
      date: new Date().toISOString().split('T')[0],
      batchName: payload.batchName || `خلطة زيت متوازنة #${batchNum}`,
      operator: payload.operator || 'Master Blender',
      sources: blendSources,
      totalBatchKg: Math.round(totalBatchKg * 100) / 100,
      weightedAvgAcidity,
      densityFactor: density,
      estimatedVolumeLiters: volumeLiters,
      notes: payload.notes || '',
      status: 'READY_FOR_PACKAGING',
      createdAt: new Date().toISOString()
    };

    db.movements.unshift({
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'BLENDING_WITHDRAWAL',
      refNumber: batchNum,
      description: `سحب وتجهيز خلطة زيت بوزن ${totalBatchKg} كغ وحموضة ${weightedAvgAcidity}%`,
      sourceLocation: blendSources.map(s => `${s.sourceName} (${s.withdrawnKg}kg)`).join(', '),
      destinationLocation: 'خزان المزج والتعبئة',
      qtyKg: totalBatchKg,
      performedBy: payload.operator || 'فني الخلط'
    });

    db.batches.unshift(newBatch);
    saveOilDb(db);
    return newBatch;
  }

  /**
   * STAGE 3 & 4: Packaging with Dynamic Box Capacity & Warehouse Stock Posting
   * Packages 8 sizes with free manual box capacities, loose pieces, calculates packaging loss %,
   * and posts to the designated live warehouse stock ledger.
   */
  public static packageAndPostBatch(payload: {
    batchId?: string;
    batchWeightKg: number;
    densityFactor: number; // default 0.916
    targetWarehouseId: string;
    skus: {
      skuId: string;
      boxCapacity: number; // dynamic user input
      boxes: number;
      loosePieces: number;
    }[];
    operator: string;
    notes?: string;
  }): PackagingPostingVoucher {
    const db = ensureOilDbFile();

    const targetWh = WarehouseService.getWarehouseById(payload.targetWarehouseId);
    if (!targetWh) {
      throw new Error(`Target warehouse ${payload.targetWarehouseId} does not exist.`);
    }

    const batchWeight = Math.max(0, Number(payload.batchWeightKg) || 0);
    if (batchWeight <= 0) {
      throw new Error('Batch weight must be greater than 0 kg.');
    }

    const density = Number(payload.densityFactor) || 0.916;
    const availableLiters = Math.round((batchWeight / density) * 100) / 100;

    let totalPiecesProduced = 0;
    let totalLitersPackaged = 0;
    let totalConsumedKg = 0;

    const packagedSkus: PackagingSkuItem[] = STANDARD_PACKAGING_SIZES.map(std => {
      const input = payload.skus.find(s => s.skuId === std.skuId);
      const boxCap = input && Number(input.boxCapacity) > 0 ? Number(input.boxCapacity) : std.defaultBoxCap;
      const boxes = input ? Math.max(0, Number(input.boxes) || 0) : 0;
      const loose = input ? Math.max(0, Number(input.loosePieces) || 0) : 0;
      const totalUnits = (boxes * boxCap) + loose;

      const liters = Math.round((totalUnits * (std.sizeMl / 1000)) * 1000) / 1000;
      const consumedKg = Math.round((liters * density) * 100) / 100;

      totalPiecesProduced += totalUnits;
      totalLitersPackaged += liters;
      totalConsumedKg += consumedKg;

      return {
        skuId: std.skuId,
        sizeMl: std.sizeMl,
        nameAr: std.nameAr,
        containerType: std.containerType,
        boxCapacity: boxCap,
        boxes,
        loosePieces: loose,
        totalPieces: totalUnits,
        totalLiters: liters,
        consumedKg
      };
    });

    totalConsumedKg = Math.round(totalConsumedKg * 100) / 100;
    totalLitersPackaged = Math.round(totalLitersPackaged * 100) / 100;

    const packagingLossKg = Math.round(Math.max(0, batchWeight - totalConsumedKg) * 100) / 100;
    const packagingLossPercent = batchWeight > 0 ? Math.round((packagingLossKg / batchWeight) * 10000) / 100 : 0;
    const isLossAcceptable = packagingLossPercent <= 2.5;

    const voucherNum = `PKG-${new Date().getFullYear()}-${db.nextPkgSeq.toString().padStart(4, '0')}`;
    db.nextPkgSeq++;

    let linkedBatch: BlendingBatch | undefined;
    if (payload.batchId) {
      linkedBatch = db.batches.find(b => b.id === payload.batchId);
      if (linkedBatch) {
        linkedBatch.status = 'PACKAGED';
      }
    }

    const voucher: PackagingPostingVoucher = {
      id: `pkg-${Date.now()}`,
      voucherNumber: voucherNum,
      date: new Date().toISOString().split('T')[0],
      batchId: payload.batchId,
      batchNumber: linkedBatch?.batchNumber,
      batchName: linkedBatch?.batchName,
      batchOriginalKg: batchWeight,
      densityFactor: density,
      availableLiters,
      targetWarehouseId: targetWh.id,
      targetWarehouseNameAr: targetWh.nameAr,
      targetWarehouseCode: targetWh.code,
      skus: packagedSkus,
      totalPiecesProduced,
      totalLitersPackaged,
      totalConsumedKg,
      packagingLossKg,
      packagingLossPercent,
      isLossAcceptable,
      operator: payload.operator || 'Production Manager',
      notes: payload.notes || '',
      createdAt: new Date().toISOString()
    };

    // Update real warehouse stock ledger
    for (const item of packagedSkus) {
      if (item.totalPieces <= 0) continue;

      let stock = db.warehouseStocks.find(ws => ws.warehouseId === targetWh.id && ws.skuId === item.skuId);
      if (!stock) {
        stock = {
          warehouseId: targetWh.id,
          skuId: item.skuId,
          sizeMl: item.sizeMl,
          nameAr: item.nameAr,
          boxCapacity: item.boxCapacity,
          boxesCount: item.boxes,
          loosePieces: item.loosePieces,
          totalUnits: item.totalPieces,
          totalLiters: item.totalLiters,
          totalKg: item.consumedKg,
          lastUpdated: new Date().toISOString()
        };
        db.warehouseStocks.push(stock);
      } else {
        stock.boxCapacity = item.boxCapacity;
        stock.boxesCount += item.boxes;
        stock.loosePieces += item.loosePieces;
        stock.totalUnits += item.totalPieces;
        stock.totalLiters = Math.round((stock.totalLiters + item.totalLiters) * 100) / 100;
        stock.totalKg = Math.round((stock.totalKg + item.consumedKg) * 100) / 100;
        stock.lastUpdated = new Date().toISOString();
      }
    }

    // Update warehouse overall unit counter
    WarehouseService.updateWarehouse(targetWh.id, {
      currentStockUnits: targetWh.currentStockUnits + totalPiecesProduced
    });

    // Register movement log
    db.movements.unshift({
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'PACKAGING_POST',
      refNumber: voucherNum,
      description: `ترحيل تعبئة ${totalPiecesProduced} عبوة (${totalConsumedKg} كغ) إلى ${targetWh.nameAr}`,
      sourceLocation: 'خط التعبئة والتغليف',
      destinationLocation: targetWh.nameAr,
      qtyKg: totalConsumedKg,
      unitsSummary: `${totalPiecesProduced} عبوة (فاقد: ${packagingLossKg} كغ / ${packagingLossPercent}%)`,
      performedBy: payload.operator || 'مسؤول التعبئة'
    });

    db.packagingVouchers.unshift(voucher);
    saveOilDb(db);
    return voucher;
  }
}
