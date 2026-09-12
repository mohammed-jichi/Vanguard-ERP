import {
  AdjustmentHeaderRecord,
  AdjustmentItemRecord,
  BranchRecord,
  LocationRecord,
  OMEGA_BRANCHES,
  OMEGA_LOCATIONS,
  OMEGA_CATEGORIES,
  OMEGA_DIVISIONS,
  OMEGA_GROUPS,
  SEED_ADJUSTMENT_ITEMS,
  INITIAL_SAVED_ADJUSTMENTS
} from './adjustmentsData';

// In-memory state persistent throughout server lifespan
let savedAdjustments: AdjustmentHeaderRecord[] = [...INITIAL_SAVED_ADJUSTMENTS];
let nextAdjustmentId = 42;
let branches: BranchRecord[] = [...OMEGA_BRANCHES];
let locations: LocationRecord[] = [...OMEGA_LOCATIONS];

export class AdjustmentsService {
  public static getBranches(): BranchRecord[] {
    return branches;
  }

  public static getLocations(branchId?: number): LocationRecord[] {
    if (!branchId) return locations;
    return locations.filter(l => l.BRANCHID === Number(branchId));
  }

  public static addLocation(branchId: number, name: string): LocationRecord {
    const newId = Math.max(0, ...locations.map(l => l.LOCATIONID)) + 1;
    const newLoc: LocationRecord = {
      LOCATIONID: newId,
      BRANCHID: branchId,
      LOCATIONDESCRIPTION: name
    };
    locations.push(newLoc);
    return newLoc;
  }

  public static getCategories() {
    return OMEGA_CATEGORIES;
  }

  public static getDivisions() {
    return OMEGA_DIVISIONS;
  }

  public static getGroups() {
    return OMEGA_GROUPS;
  }

  public static getAdjustmentItems(
    branchId: number,
    locationId: number,
    filters?: {
      search?: string;
      include?: number;
      searchBy?: number;
      comboValue?: number;
      checkNegQty?: boolean | number;
      hide0Qty?: boolean | number;
    }
  ): AdjustmentItemRecord[] {
    // Generate/clone items for this branch & location
    let items = SEED_ADJUSTMENT_ITEMS.map(item => {
      // Deterministic slight variance per location for realistic simulation
      let qoh = item.QTYOH;
      if (locationId === 2) {
        qoh = Math.round(qoh * 0.4); // Showroom holds fewer
      } else if (locationId === 3) {
        qoh = Math.round(qoh * 0.2); // Delivery staging
      }
      return {
        ...item,
        QTYOH: qoh,
        NEWQTY: qoh,
        VARIANCE: 0
      };
    });

    if (!filters) return items;

    // Include filter (0 = All, 1 = Daily adjustment, 2 = Weekly adjustment)
    if (filters.include === 1) {
      items = items.filter(i => i.INCLDAILYADJ === -1);
    } else if (filters.include === 2) {
      items = items.filter(i => i.INCLWEEKLADJ === -1);
    }

    // Search by text (code, description, barcode)
    if (filters.search && filters.search.trim()) {
      const s = filters.search.toLowerCase().trim();
      items = items.filter(
        i =>
          i.PRODUCTCODE.toLowerCase().includes(s) ||
          i.PRODUCTDESCRIPTION.toLowerCase().includes(s) ||
          (i.BARCODE && i.BARCODE.toLowerCase().includes(s))
      );
    }

    // Category / Division / Group filter
    if (filters.searchBy && filters.comboValue) {
      if (filters.searchBy === 1) {
        items = items.filter(i => i.CATEGORYID === Number(filters.comboValue));
      } else if (filters.searchBy === 2) {
        items = items.filter(i => i.DIVISIONID === Number(filters.comboValue));
      } else if (filters.searchBy === 3) {
        items = items.filter(i => i.GROUPID === Number(filters.comboValue));
      }
    }

    // Show neg. Qty only
    if (filters.checkNegQty) {
      items = items.filter(i => i.QTYOH < 0);
    }

    // Hide items with 0 Qty
    if (filters.hide0Qty) {
      items = items.filter(i => i.QTYOH !== 0);
    }

    return items;
  }

  public static getAdjustmentsList(params?: {
    branchId?: number;
    status?: number; // 1 = posted, 2 = unposted, 3 = all
    fromDate?: string;
    toDate?: string;
    allDates?: boolean | number;
    search?: string;
  }): { current_page: number; last_page: number; total: number; data: AdjustmentHeaderRecord[] } {
    let list = [...savedAdjustments];

    if (params?.branchId) {
      list = list.filter(a => a.BRANCHID === Number(params.branchId));
    }

    if (params?.status === 1) {
      list = list.filter(a => a.POSTED === -1);
    } else if (params?.status === 2) {
      list = list.filter(a => a.POSTED === 0);
    }

    if (!params?.allDates && params?.fromDate && params?.toDate) {
      const f = new Date(params.fromDate).getTime();
      const t = new Date(params.toDate).getTime();
      list = list.filter(a => {
        const d = new Date(a.ADATE).getTime();
        return d >= f && d <= t;
      });
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        a =>
          a.ADJUSTID.toString().includes(q) ||
          a.LOCATIONDESCRIPTION.toLowerCase().includes(q) ||
          a.BARANCHNAME.toLowerCase().includes(q) ||
          `${a.firstname} ${a.lastname}`.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    list.sort((a, b) => b.ADJUSTID - a.ADJUSTID);

    return {
      current_page: 1,
      last_page: Math.ceil(list.length / 15) || 1,
      total: list.length,
      data: list
    };
  }

  public static getAdjustmentById(adjustId: number): AdjustmentHeaderRecord | null {
    const found = savedAdjustments.find(a => a.ADJUSTID === Number(adjustId));
    return found ? { ...found } : null;
  }

  public static saveAdjustment(payload: {
    adjustid?: number;
    branchid: number;
    locationid: number;
    adjustmentDate: string;
    qtyoh: AdjustmentItemRecord[];
    firstname?: string;
    lastname?: string;
  }): AdjustmentHeaderRecord {
    const branch = branches.find(b => b.BRANCHID === Number(payload.branchid)) || branches[0];
    const loc = locations.find(l => l.LOCATIONID === Number(payload.locationid)) || locations[0];

    const cleanItems = (payload.qtyoh || []).map(i => ({
      ...i,
      NEWQTY: Number(i.NEWQTY) || 0,
      QTYOH: Number(i.QTYOH) || 0,
      VARIANCE: (Number(i.NEWQTY) || 0) - (Number(i.QTYOH) || 0),
      REMARK: i.REMARK || ''
    }));

    if (payload.adjustid) {
      // Edit existing draft
      const idx = savedAdjustments.findIndex(a => a.ADJUSTID === Number(payload.adjustid));
      if (idx !== -1) {
        savedAdjustments[idx] = {
          ...savedAdjustments[idx],
          ADATE: payload.adjustmentDate,
          BRANCHID: payload.branchid,
          BARANCHNAME: branch.BARANCHNAME,
          LOCID: payload.locationid,
          LOCATIONDESCRIPTION: loc.LOCATIONDESCRIPTION,
          items: cleanItems,
          POSTED: 0,
          STATUS: 'False'
        };
        return savedAdjustments[idx];
      }
    }

    const newId = nextAdjustmentId++;
    const newRecord: AdjustmentHeaderRecord = {
      ADJUSTID: newId,
      ID: 2000 + newId,
      ADATE: payload.adjustmentDate || new Date().toISOString().split('T')[0],
      BRANCHID: payload.branchid,
      BARANCHNAME: branch.BARANCHNAME,
      LOCID: payload.locationid,
      LOCATIONDESCRIPTION: loc.LOCATIONDESCRIPTION,
      POSTED: 0, // Draft
      STATUS: 'False',
      VOUCHER_ID: null,
      firstname: payload.firstname || 'Mohammed',
      lastname: payload.lastname || 'Jichi',
      has_acctransfer: false,
      items: cleanItems
    };

    savedAdjustments.unshift(newRecord);
    return newRecord;
  }

  public static postAdjustment(payload: {
    adjustid?: number;
    branchid: number;
    locationid: number;
    adjustmentDate: string;
    qtyoh: AdjustmentItemRecord[];
    firstname?: string;
    lastname?: string;
  }): AdjustmentHeaderRecord {
    const saved = this.saveAdjustment(payload);
    saved.POSTED = -1; // Posted in Omega (-1)
    saved.STATUS = 'True';
    saved.has_acctransfer = true;
    saved.VOUCHER_ID = `JV-${new Date().getFullYear()}-${String(saved.ADJUSTID).padStart(3, '0')}`;

    // Update the record in storage
    const idx = savedAdjustments.findIndex(a => a.ADJUSTID === saved.ADJUSTID);
    if (idx !== -1) {
      savedAdjustments[idx] = saved;
    }
    return saved;
  }

  public static deleteAdjustment(adjustId: number): boolean {
    const prevLen = savedAdjustments.length;
    savedAdjustments = savedAdjustments.filter(a => a.ADJUSTID !== Number(adjustId));
    return savedAdjustments.length < prevLen;
  }

  public static deleteAllUnposted(branchId?: number): number {
    let deletedCount = 0;
    savedAdjustments = savedAdjustments.filter(a => {
      if (a.POSTED === 0 && (!branchId || a.BRANCHID === Number(branchId))) {
        deletedCount++;
        return false;
      }
      return true;
    });
    return deletedCount;
  }

  public static transferToAccounting(adjustId: number): { status: number; voucher_id: string } {
    const adj = savedAdjustments.find(a => a.ADJUSTID === Number(adjustId));
    if (adj) {
      adj.VOUCHER_ID = `JV-ACC-${String(adj.ADJUSTID).padStart(4, '0')}`;
      adj.has_acctransfer = false;
      return { status: 1, voucher_id: adj.VOUCHER_ID };
    }
    return { status: 0, voucher_id: '' };
  }

  public static parseCsv(csvText: string, branchId: number, locationId: number): AdjustmentItemRecord[] {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const existingItems = this.getAdjustmentItems(branchId, locationId);
    const itemMap = new Map<string, AdjustmentItemRecord>();
    existingItems.forEach(i => {
      itemMap.set(i.PRODUCTCODE.toLowerCase(), i);
      if (i.BARCODE) itemMap.set(i.BARCODE.toLowerCase(), i);
    });

    const parsedResults: AdjustmentItemRecord[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && (line.toLowerCase().includes('code') || line.toLowerCase().includes('item'))) {
        continue; // skip header
      }
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 1) continue;

      const codeOrBarcode = parts[0].toLowerCase();
      const newQty = parts.length > 1 ? parseFloat(parts[1]) || 0 : 0;
      const remark = parts.length > 2 ? parts[2] : 'Imported via CSV';

      const match = itemMap.get(codeOrBarcode);
      if (match) {
        parsedResults.push({
          ...match,
          NEWQTY: newQty,
          VARIANCE: newQty - match.QTYOH,
          REMARK: remark
        });
      }
    }

    return parsedResults;
  }
}
