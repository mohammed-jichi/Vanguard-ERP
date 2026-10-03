// lib/warehouseStorage.ts
/**
 * Vanguard ERP - Dynamic Warehouses Management Engine
 * Provides persistent server storage, dynamic CRUD, and role-based scope isolation.
 * Specifically isolates WH-SUPERSONIC from field drivers.
 */

import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from './supabaseClient';

export type WarehouseType = 
  | 'DISTRIBUTION_HUB'
  | 'FINISHED_GOODS'
  | 'RETAIL'
  | 'QUARANTINE'
  | 'RAW_BULK'
  | 'GENERAL';

export interface WarehouseRecord {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  type: WarehouseType;
  branchId: number;
  branchName: string;
  location: string;
  manager: string;
  contactPhone?: string;
  capacityLiters: number;
  currentStockUnits: number;
  isActive: boolean;
  isDriverVisible: boolean; // false for Supersonic Hub to prevent field driver queries
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Initial System Warehouses (Seeded once into persistent data/vanguard_warehouses.json)
const INITIAL_SYSTEM_WAREHOUSES: WarehouseRecord[] = [
  {
    id: 'wh-supersonic',
    code: 'WH-SS-01',
    name: 'Supersonic Warehouse',
    nameAr: 'مستودع التوزيع الميداني (سوبرسونيك)',
    type: 'DISTRIBUTION_HUB',
    branchId: 1,
    branchName: 'Southern Olive and Oil Products - Main',
    location: 'Choueifat & Beirut Central Logistics Hub',
    manager: 'Moeen Kassem (SuperSonic Fleet Mgr)',
    contactPhone: '+961 70 882 100',
    capacityLiters: 150000,
    currentStockUnits: 3420,
    isActive: true,
    isDriverVisible: false, // STRICTLY RESTRICTED: Drivers only see their own van load sheets
    notes: 'Central logistics hub for delivery van dispatches and field distribution fleet.',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'wh-main-fg',
    code: 'WH-FG-01',
    name: 'Main Finished Goods Warehouse',
    nameAr: 'المستودع الرئيسي للبضاعة الجاهزة',
    type: 'FINISHED_GOODS',
    branchId: 1,
    branchName: 'Southern Olive and Oil Products - Main',
    location: 'Marjeyoun Main Industrial Facility - Hall A',
    manager: 'Ahmad Msheik',
    contactPhone: '+961 7 830 450',
    capacityLiters: 350000,
    currentStockUnits: 8950,
    isActive: true,
    isDriverVisible: false,
    notes: 'Primary finished goods warehouse storing packaged tins, bottles, and commercial gallons.',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'wh-showroom',
    code: 'WH-RT-01',
    name: 'Showroom / Retail Warehouse',
    nameAr: 'مستودع المعرض ونقطة البيع المباشر',
    type: 'RETAIL',
    branchId: 1,
    branchName: 'Southern Olive and Oil Products - Main',
    location: 'Tyre Coastal Highway Showroom',
    manager: 'Rana Atallah',
    contactPhone: '+961 7 740 500',
    capacityLiters: 45000,
    currentStockUnits: 1240,
    isActive: true,
    isDriverVisible: false,
    notes: 'Retail front outlet and visitor tasting boutique storage.',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'wh-qc',
    code: 'WH-QC-01',
    name: 'Quarantine / QC Warehouse',
    nameAr: 'مستودع الفحص الفني والحجر المخبري',
    type: 'QUARANTINE',
    branchId: 1,
    branchName: 'Southern Olive and Oil Products - Main',
    location: 'Quality Assurance Lab Annex - Bay Q',
    manager: 'Dr. Ziad Hamdan (QC Lead)',
    contactPhone: '+961 7 830 455',
    capacityLiters: 30000,
    currentStockUnits: 310,
    isActive: true,
    isDriverVisible: false,
    notes: 'Quarantine area for lots pending acidity, peroxide, and spectrophotometric testing.',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'wh-raw-bulk',
    code: 'WH-RW-01',
    name: 'Raw Oil Bulk Storage',
    nameAr: 'مستودع وخزانات الزيت الخام',
    type: 'RAW_BULK',
    branchId: 1,
    branchName: 'Southern Olive and Oil Products - Main',
    location: 'Stainless Steel Tank Farm - Sector B',
    manager: 'Hussein Bazzi',
    contactPhone: '+961 7 830 460',
    capacityLiters: 500000,
    currentStockUnits: 28400, // Representing total KG of raw bulk oil
    isActive: true,
    isDriverVisible: false,
    notes: 'Temperature-controlled stainless steel nitrogen-blanketed storage tanks.',
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z'
  }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const WAREHOUSES_FILE = path.join(DATA_DIR, 'vanguard_warehouses.json');
const TMP_WAREHOUSES_FILE = path.join('/tmp', 'vanguard_warehouses.json');

let inMemoryWarehouses: WarehouseRecord[] | null = null;
let lastMtime = 0;

function resolveWhFilePath(): string {
  try {
    if (fs.existsSync(TMP_WAREHOUSES_FILE)) {
      if (!fs.existsSync(WAREHOUSES_FILE)) return TMP_WAREHOUSES_FILE;
      const tmpStat = fs.statSync(TMP_WAREHOUSES_FILE);
      const mainStat = fs.statSync(WAREHOUSES_FILE);
      if (tmpStat.mtimeMs > mainStat.mtimeMs) {
        return TMP_WAREHOUSES_FILE;
      }
    }
  } catch {}
  return WAREHOUSES_FILE;
}

function ensureDataFile(): WarehouseRecord[] {
  try {
    const activeFile = resolveWhFilePath();

    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {}
    }

    if (!fs.existsSync(activeFile)) {
      try {
        fs.writeFileSync(WAREHOUSES_FILE, JSON.stringify(INITIAL_SYSTEM_WAREHOUSES, null, 2), 'utf-8');
      } catch {
        try {
          fs.writeFileSync(TMP_WAREHOUSES_FILE, JSON.stringify(INITIAL_SYSTEM_WAREHOUSES, null, 2), 'utf-8');
        } catch {}
      }
      inMemoryWarehouses = [...INITIAL_SYSTEM_WAREHOUSES];
      try {
        lastMtime = fs.statSync(resolveWhFilePath()).mtimeMs;
      } catch {
        lastMtime = Date.now();
      }
      return inMemoryWarehouses;
    }

    if (inMemoryWarehouses) {
      try {
        const curMtime = fs.statSync(activeFile).mtimeMs;
        if (curMtime <= lastMtime) {
          return inMemoryWarehouses;
        }
      } catch {
        return inMemoryWarehouses;
      }
    }

    const raw = fs.readFileSync(activeFile, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryWarehouses = parsed;
    } else {
      inMemoryWarehouses = [...INITIAL_SYSTEM_WAREHOUSES];
      try {
        fs.writeFileSync(WAREHOUSES_FILE, JSON.stringify(inMemoryWarehouses, null, 2), 'utf-8');
      } catch {}
    }
    try {
      lastMtime = fs.statSync(activeFile).mtimeMs;
    } catch {
      lastMtime = Date.now();
    }
    return inMemoryWarehouses;
  } catch (error) {
    console.error('Error reading vanguard_warehouses.json:', error);
    return INITIAL_SYSTEM_WAREHOUSES;
  }
}

function saveWarehouses(list: WarehouseRecord[]) {
  inMemoryWarehouses = list;
  let written = false;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(WAREHOUSES_FILE, JSON.stringify(list, null, 2), 'utf-8');
    lastMtime = fs.statSync(WAREHOUSES_FILE).mtimeMs;
    written = true;
  } catch (error) {
    console.warn('Could not write to primary WAREHOUSES_FILE, falling back to /tmp:', error);
  }

  // Also write to /tmp in serverless environments or if primary write failed
  try {
    fs.writeFileSync(TMP_WAREHOUSES_FILE, JSON.stringify(list, null, 2), 'utf-8');
    if (!written) {
      lastMtime = fs.statSync(TMP_WAREHOUSES_FILE).mtimeMs;
    }
  } catch (tmpErr) {
    if (!written) {
      console.error('Error persisting vanguard_warehouses.json to /tmp:', tmpErr);
    }
  }
}

export class WarehouseService {
  /**
   * Retrieves all warehouses with optional scope filtering.
   * If scope === 'driver', WH-SUPERSONIC and non-driver-visible warehouses are strictly excluded.
   */
  public static getAllWarehouses(options?: { scope?: string; activeOnly?: boolean }): WarehouseRecord[] {
    const list = ensureDataFile();
    let filtered = [...list];

    if (options?.activeOnly) {
      filtered = filtered.filter(w => w.isActive);
    }

    // Role-based scope isolation: drivers must NEVER see Supersonic Central Hub stock
    if (options?.scope === 'driver') {
      filtered = filtered.filter(w => w.isDriverVisible && w.id !== 'wh-supersonic' && w.type !== 'DISTRIBUTION_HUB');
    }

    return filtered;
  }

  public static getWarehouseById(id: string): WarehouseRecord | null {
    const list = ensureDataFile();
    return list.find(w => w.id === id || w.code.toLowerCase() === id.toLowerCase()) || null;
  }

  public static createWarehouse(data: Partial<WarehouseRecord>): WarehouseRecord {
    const list = ensureDataFile();
    const id = data.id || `wh-${Date.now().toString(36)}`;
    const code = (data.code || `WH-${(list.length + 1).toString().padStart(2, '0')}`).trim().toUpperCase();

    const newRecord: WarehouseRecord = {
      id,
      code,
      name: data.name || data.nameAr || 'New Warehouse',
      nameAr: data.nameAr || data.name || 'مستودع جديد',
      type: data.type || 'FINISHED_GOODS',
      branchId: data.branchId || 1,
      branchName: data.branchName || 'Southern Olive and Oil Products - Main',
      location: (data.location || 'Warehouse Facility').trim(),
      manager: data.manager || 'Operations Staff',
      contactPhone: data.contactPhone || '+961 7 000 000',
      capacityLiters: Number(data.capacityLiters) > 0 ? Number(data.capacityLiters) : 50000,
      currentStockUnits: Number(data.currentStockUnits) || 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isDriverVisible: false, // Strictly isolated from drivers - internal management facility only
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newRecord);
    saveWarehouses(list);
    return newRecord;
  }

  public static updateWarehouse(id: string, updates: Partial<WarehouseRecord>): WarehouseRecord | null {
    const list = ensureDataFile();
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) return null;

    const existing = list[idx];
    const updated: WarehouseRecord = {
      ...existing,
      ...updates,
      id: existing.id, // preserve immutable ID
      updatedAt: new Date().toISOString()
    };

    list[idx] = updated;
    saveWarehouses(list);
    return updated;
  }

  public static deleteWarehouse(id: string): boolean {
    const list = ensureDataFile();
    // Protect core system warehouses from deletion
    if (['wh-supersonic', 'wh-main-fg'].includes(id)) {
      // Soft-deactivate instead
      const w = list.find(item => item.id === id);
      if (w) {
        w.isActive = false;
        w.updatedAt = new Date().toISOString();
        saveWarehouses(list);
        return true;
      }
      return false;
    }

    const initialLen = list.length;
    const remaining = list.filter(w => w.id !== id);
    if (remaining.length < initialLen) {
      saveWarehouses(remaining);
      return true;
    }
    return false;
  }
}
