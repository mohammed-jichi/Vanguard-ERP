// lib/commercialOilStorage.ts
/**
 * Vanguard ERP - Commercial Oil Operations & Packaging Storage Engine
 * Handles unit-by-unit oil receiving, weight-based blending, packaging with dynamic box capacity,
 * tank management, oil grades administration, and posting inventory directly to real dynamic warehouses.
 */

import fs from 'fs';
import path from 'path';
import { WarehouseService } from './warehouseStorage';
import { STANDARD_PACKAGING_SIZES } from './commercialOilConstants';
export { STANDARD_PACKAGING_SIZES };

export interface StorageTank {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  nameFr?: string;
  nameEs?: string;
  nameFa?: string;
  grade: string; // e.g. 'EXTRA_VIRGIN' | 'VIRGIN' | 'ORDINARY' | 'KURA_REFINED' or custom
  gradeNameAr: string;
  capacityKg: number;
  currentKg: number;
  acidity: number; // percentage, e.g. 0.65
  location: string;
  lastCleaned?: string;
  updatedAt: string;
}

export interface OilGradeRecord {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  nameFr?: string;
  nameEs?: string;
  nameFa?: string;
  maxAcidity: number;
  description?: string;
}

export interface ContainerItem {
  id: string;
  unitNumber: number;
  containerType: 'GALLON' | 'TIN' | 'DRUM';
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
  oilGrade: string;
  oilGradeNameAr: string;
  acidity: number;
  targetStorageType: 'BULK_TANK' | 'RAW_CONTAINERS_STORAGE';
  targetStorageId: string;
  targetStorageNameAr: string;
  containers: ContainerItem[];
  gallonsCount: number;
  tinsCount: number;
  drumsCount: number;
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
  oilGrades: OilGradeRecord[];
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

export const INITIAL_OIL_GRADES: OilGradeRecord[] = [
  { id: 'grade-evoo', code: 'EXTRA_VIRGIN', nameAr: 'بكر ممتاز', nameEn: 'Extra Virgin (EVOO)', nameFr: 'Vierge extra', nameEs: 'Virgen extra', nameFa: 'فرابکر', maxAcidity: 0.8, description: 'حموضة أقل من 0.8%' },
  { id: 'grade-virgin', code: 'VIRGIN', nameAr: 'بكر طبيعي', nameEn: 'Virgin Olive Oil', nameFr: 'Huile vierge', nameEs: 'Aceite virgen', nameFa: 'بکر طبیعی', maxAcidity: 2.0, description: 'حموضة بين 0.8% و 2.0%' },
  { id: 'grade-ordinary', code: 'ORDINARY', nameAr: 'زيت عادي', nameEn: 'Ordinary / Regular Olive Oil', nameFr: 'Huile ordinaire', nameEs: 'Aceite ordinario', nameFa: 'روغن معمولی', maxAcidity: 3.3, description: 'حموضة تفوق 2.0%' },
  { id: 'grade-kura', code: 'KURA_REFINED', nameAr: 'زيت بلدي مكرر', nameEn: 'Refined Olive Oil', nameFr: 'Huile raffinée', nameEs: 'Aceite refinado', nameFa: 'تصفیه شده محلی', maxAcidity: 1.0, description: 'زيت بلدي مكرر' },
];

const INITIAL_TANKS: StorageTank[] = [
  {
    id: 'tank-01',
    code: 'T-01',
    name: 'Bulk Storage Tank 01 - Extra Virgin',
    nameAr: 'خزان تجميع T-01: زيت زيتون بكر ممتاز',
    grade: 'EXTRA_VIRGIN',
    gradeNameAr: 'بكر ممتاز',
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
const TMP_OIL_DB_FILE = path.join('/tmp', 'vanguard_commercial_oil_db.json');

let inMemoryOilDb: CommercialOilDbState | null = null;
let lastMtime = 0;

function resolveDbFilePath(): string {
  try {
    if (fs.existsSync(TMP_OIL_DB_FILE)) {
      if (!fs.existsSync(OIL_DB_FILE)) return TMP_OIL_DB_FILE;
      const tmpStat = fs.statSync(TMP_OIL_DB_FILE);
      const mainStat = fs.statSync(OIL_DB_FILE);
      if (tmpStat.mtimeMs > mainStat.mtimeMs) {
        return TMP_OIL_DB_FILE;
      }
    }
  } catch {}
  return OIL_DB_FILE;
}

function ensureOilDbFile(): CommercialOilDbState {
  try {
    const activeFile = resolveDbFilePath();

    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {}
    }

    if (!fs.existsSync(activeFile)) {
      const initialState: CommercialOilDbState = {
        tanks: INITIAL_TANKS,
        oilGrades: INITIAL_OIL_GRADES,
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
      try {
        fs.writeFileSync(OIL_DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
      } catch {
        try {
          fs.writeFileSync(TMP_OIL_DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
        } catch {}
      }
      inMemoryOilDb = initialState;
      try {
        lastMtime = fs.statSync(resolveDbFilePath()).mtimeMs;
      } catch {
        lastMtime = Date.now();
      }
      return inMemoryOilDb;
    }

    if (inMemoryOilDb) {
      try {
        const curMtime = fs.statSync(activeFile).mtimeMs;
        if (curMtime <= lastMtime) {
          return inMemoryOilDb;
        }
      } catch {
        return inMemoryOilDb;
      }
    }

    const raw = fs.readFileSync(activeFile, 'utf-8');
    const parsed: CommercialOilDbState = JSON.parse(raw);
    if (!parsed.tanks || parsed.tanks.length === 0) {
      parsed.tanks = INITIAL_TANKS;
    }
    if (!parsed.oilGrades || parsed.oilGrades.length === 0) {
      parsed.oilGrades = INITIAL_OIL_GRADES;
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
      lastMtime = fs.statSync(activeFile).mtimeMs;
    } catch {
      lastMtime = Date.now();
    }
    return inMemoryOilDb;
  } catch (error) {
    console.error('Error reading vanguard_commercial_oil_db.json:', error);
    return {
      tanks: INITIAL_TANKS,
      oilGrades: INITIAL_OIL_GRADES,
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
  state.lastUpdated = new Date().toISOString();
  inMemoryOilDb = state;
  let written = false;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OIL_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    lastMtime = fs.statSync(OIL_DB_FILE).mtimeMs;
    written = true;
  } catch (error) {
    console.warn('Could not write to primary OIL_DB_FILE, falling back to /tmp:', error);
  }

  // Also write to /tmp in serverless environments or if primary write failed
  try {
    fs.writeFileSync(TMP_OIL_DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    if (!written) {
      lastMtime = fs.statSync(TMP_OIL_DB_FILE).mtimeMs;
    }
  } catch (tmpErr) {
    if (!written) {
      console.error('Error persisting vanguard_commercial_oil_db.json to /tmp:', tmpErr);
    }
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

  public static getOilGrades(): OilGradeRecord[] {
    const db = ensureOilDbFile();
    return db.oilGrades || INITIAL_OIL_GRADES;
  }

  public static createTank(payload: Partial<StorageTank>): StorageTank {
    const db = ensureOilDbFile();
    const id = payload.id || `tank-${Date.now()}`;
    const code = (payload.code || `TK-${(db.tanks.length + 1).toString().padStart(2, '0')}`).toUpperCase();
    const nameAr = payload.nameAr || payload.name || `خزان ${code}`;
    const name = payload.name || `Storage Tank ${code}`;

    const newTank: StorageTank = {
      id,
      code,
      name,
      nameAr,
      grade: payload.grade || 'EXTRA_VIRGIN',
      gradeNameAr: payload.gradeNameAr || 'بكر ممتاز (EVOO)',
      capacityKg: Number(payload.capacityKg) || 25000,
      currentKg: Math.max(0, Number(payload.currentKg) || 0),
      acidity: Number(payload.acidity) || 0.65,
      location: payload.location || 'Warehouse Tank Farm',
      updatedAt: new Date().toISOString()
    };

    db.tanks.push(newTank);
    saveOilDb(db);
    return newTank;
  }

  public static updateTank(id: string, updates: Partial<StorageTank>): StorageTank | null {
    const db = ensureOilDbFile();
    const idx = db.tanks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    db.tanks[idx] = {
      ...db.tanks[idx],
      ...updates,
      id: db.tanks[idx].id, // preserve immutable ID
      updatedAt: new Date().toISOString()
    };

    saveOilDb(db);
    return db.tanks[idx];
  }

  public static deleteTank(id: string): boolean {
    const db = ensureOilDbFile();
    const initialLen = db.tanks.length;
    db.tanks = db.tanks.filter(t => t.id !== id);
    if (db.tanks.length < initialLen) {
      saveOilDb(db);
      return true;
    }
    return false;
  }

  public static createOilGrade(payload: Partial<OilGradeRecord>): OilGradeRecord {
    const db = ensureOilDbFile();
    const id = payload.id || `grade-${Date.now()}`;
    const newGrade: OilGradeRecord = {
      id,
      code: (payload.code || `GRADE_${Date.now()}`).toUpperCase(),
      nameAr: payload.nameAr || 'صنف زيت جديد',
      nameEn: payload.nameEn || 'New Oil Grade',
      maxAcidity: Number(payload.maxAcidity) || 1.5,
      description: payload.description || ''
    };
    db.oilGrades.push(newGrade);
    saveOilDb(db);
    return newGrade;
  }

  public static updateOilGrade(id: string, updates: Partial<OilGradeRecord>): OilGradeRecord | null {
    const db = ensureOilDbFile();
    const idx = db.oilGrades.findIndex(g => g.id === id);
    if (idx === -1) return null;

    db.oilGrades[idx] = {
      ...db.oilGrades[idx],
      ...updates,
      id: db.oilGrades[idx].id
    };
    saveOilDb(db);
    return db.oilGrades[idx];
  }

  public static deleteOilGrade(id: string): boolean {
    const db = ensureOilDbFile();
    const initialLen = db.oilGrades.length;
    db.oilGrades = db.oilGrades.filter(g => g.id !== id);
    if (db.oilGrades.length < initialLen) {
      saveOilDb(db);
      return true;
    }
    return false;
  }

  /**
   * STAGE 1: Unit-by-Unit Oil Receiving
   * Receives containers (Gallons, Tins, Drums), calculates totals, and increments storage tank balance.
   */
  public static receiveOilIntake(payload: {
    supplierId: number | string;
    supplierName: string;
    supplierPhone: string;
    supplierAddress: string;
    supplierAccountNo?: string;
    oilGrade: string;
    acidity: number;
    targetStorageId: string;
    containers: { containerType: 'GALLON' | 'TIN' | 'DRUM'; netKg: number; grossKg?: number; tareKg?: number }[];
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
    let drums = 0;
    let totalNetKg = 0;

    const typeNames: Record<string, string> = {
      GALLON: 'غالون بلاستيك',
      TIN: 'تنكة حديد',
      DRUM: 'برميل (Drum)'
    };

    const containersList: ContainerItem[] = payload.containers.map((c, idx) => {
      const net = Math.max(0, Number(c.netKg) || 0);
      if (c.containerType === 'GALLON') gallons++;
      else if (c.containerType === 'TIN') tins++;
      else if (c.containerType === 'DRUM') drums++;
      totalNetKg += net;

      return {
        id: `c-${Date.now()}-${idx + 1}`,
        unitNumber: idx + 1,
        containerType: c.containerType,
        containerTypeNameAr: typeNames[c.containerType] || 'عبوة',
        grossKg: c.grossKg,
        tareKg: c.tareKg,
        netKg: net
      };
    });

    totalNetKg = Math.round(totalNetKg * 100) / 100;
    const avgKg = containersList.length > 0 ? Math.round((totalNetKg / containersList.length) * 100) / 100 : 0;

    const receiptNum = `REC-OIL-${new Date().getFullYear()}-${db.nextReceiptSeq.toString().padStart(4, '0')}`;
    db.nextReceiptSeq++;

    const matchedGrade = db.oilGrades?.find(g => g.code === payload.oilGrade || g.id === payload.oilGrade);
    const gradeName = matchedGrade ? matchedGrade.nameAr : (payload.oilGrade || 'زيت زيتون');

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
      oilGradeNameAr: gradeName,
      acidity: Number(payload.acidity) || 0.8,
      targetStorageType: targetTank.id === 'raw-containers-bay' ? 'RAW_CONTAINERS_STORAGE' : 'BULK_TANK',
      targetStorageId: targetTank.id,
      targetStorageNameAr: targetTank.nameAr,
      containers: containersList,
      gallonsCount: gallons,
      tinsCount: tins,
      drumsCount: drums,
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
      unitsSummary: `${gallons} غالون، ${tins} تنكة، ${drums} برميل`,
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
