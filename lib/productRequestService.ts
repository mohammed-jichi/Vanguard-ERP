import { supabase } from '@/lib/supabaseClient';
import {
  ProductRequestHeader,
  ProductRequestLineItem,
  RejectReasonRecord,
  InventorySearchItem,
  RecurringPRTemplate,
  OMEGA_PR_BRANCHES,
  OMEGA_PR_LOCATIONS,
  INITIAL_REJECT_REASONS,
  MASTER_INVENTORY_ITEMS,
  INITIAL_PRODUCT_REQUESTS,
  INITIAL_PR_TEMPLATES,
  OMEGA_PR_REPORTS_LIST,
  OMEGA_REPORT_GROUPS
} from './productRequestData';

// In-memory state persistent throughout server session
let productRequests: ProductRequestHeader[] = JSON.parse(JSON.stringify(INITIAL_PRODUCT_REQUESTS));
let rejectReasons: RejectReasonRecord[] = JSON.parse(JSON.stringify(INITIAL_REJECT_REASONS));
let templates: RecurringPRTemplate[] = JSON.parse(JSON.stringify(INITIAL_PR_TEMPLATES));
let nextPrNumber = 1007;

export class ProductRequestService {
  // 1. Branches & Locations
  public static getBranches() {
    return OMEGA_PR_BRANCHES;
  }

  public static getLocations(branchId?: number) {
    if (!branchId || branchId === 0) return OMEGA_PR_LOCATIONS;
    return OMEGA_PR_LOCATIONS.filter(l => l.FORBRANCH === Number(branchId) || l.BRANCHID === Number(branchId));
  }

  // 2. Master Product Request Queries
  public static getAllProductRequests(filters?: {
    from?: string;
    to?: string;
    frombranchid?: number;
    requestedfrombranchid?: number;
    status?: string | number;
    search?: string;
  }): ProductRequestHeader[] {
    let list = [...productRequests];

    if (filters) {
      if (filters.from) {
        list = list.filter(r => r.CURRENTDATE >= filters.from!);
      }
      if (filters.to) {
        list = list.filter(r => r.CURRENTDATE <= filters.to!);
      }
      if (filters.frombranchid && Number(filters.frombranchid) !== 0) {
        list = list.filter(r => r.BRANCHID === Number(filters.frombranchid));
      }
      if (filters.requestedfrombranchid && Number(filters.requestedfrombranchid) !== 0) {
        list = list.filter(r => r.FROMBRANCHID === Number(filters.requestedfrombranchid));
      }
      if (filters.status !== undefined && filters.status !== '' && filters.status !== 'All') {
        const s = String(filters.status);
        if (s === '0') list = list.filter(r => r.STATUS === 'Pending');
        else if (s === '-1') list = list.filter(r => r.STATUS === 'Approved');
        else if (s === '-2') list = list.filter(r => r.STATUS === 'Rejected');
        else if (s === '-3') list = list.filter(r => r.STATUS === 'Confirmed');
        else list = list.filter(r => r.STATUS.toLowerCase() === s.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(r =>
          r.REQUESTNB.toLowerCase().includes(q) ||
          r.TOBRANCH.toLowerCase().includes(q) ||
          r.REQUESTEDBY.toLowerCase().includes(q) ||
          r.REMARK.toLowerCase().includes(q) ||
          r.items.some(i => i.ITEMDESCRIPTION.toLowerCase().includes(q) || i.ITEMCODE.toLowerCase().includes(q))
        );
      }
    }

    // Sort descending by ID / Date
    return list.sort((a, b) => b.ID - a.ID);
  }

  // 3. Single PR Details
  public static getPrDetails(idOrNb: number | string): ProductRequestHeader | null {
    const pr = productRequests.find(r => r.ID === Number(idOrNb) || r.REQUESTNB === String(idOrNb));
    return pr ? JSON.parse(JSON.stringify(pr)) : null;
  }

  // 4. Create New Product Request
  public static createProductRequest(payload: {
    BRANCHID: number;
    LOCATIONID: number;
    FROMBRANCHID: number;
    DELIVERYDATE: string;
    REMARK?: string;
    items: Array<{
      ITEMID: number;
      ITEMCODE: string;
      ITEMDESCRIPTION: string;
      UNIT: string;
      QTYREQ: number;
      COST: number;
      LOCID?: number;
      REMARK?: string;
    }>;
  }): ProductRequestHeader {
    const branch = OMEGA_PR_BRANCHES.find(b => b.BRANCHID === Number(payload.BRANCHID)) || OMEGA_PR_BRANCHES[0];
    const fromBranch = OMEGA_PR_BRANCHES.find(b => b.BRANCHID === Number(payload.FROMBRANCHID)) || OMEGA_PR_BRANCHES[1];
    const location = OMEGA_PR_LOCATIONS.find(l => l.LOCATIONID === Number(payload.LOCATIONID)) || OMEGA_PR_LOCATIONS[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const prId = nextPrNumber++;
    const reqNb = `PR-${prId}`;

    const items: ProductRequestLineItem[] = payload.items.map((it, idx) => {
      const catItem = MASTER_INVENTORY_ITEMS.find(m => m.ITEMID === it.ITEMID);
      const itemLoc = OMEGA_PR_LOCATIONS.find(l => l.LOCATIONID === (it.LOCID || location.LOCATIONID)) || location;
      return {
        ID: idx + 1,
        ITEMID: it.ITEMID,
        ITEMCODE: it.ITEMCODE,
        ITEMDESCRIPTION: it.ITEMDESCRIPTION,
        UNIT: it.UNIT || 'PCS',
        QTYREQ: Number(it.QTYREQ) || 1,
        QTYAPP: Number(it.QTYREQ) || 1,
        QTYREC: 0,
        QTYOH: catItem ? catItem.QTYOH : 100,
        COST: Number(it.COST) || (catItem ? catItem.COST : 0),
        LOCID: itemLoc.LOCATIONID,
        LOCATIONDESCRIPTION: itemLoc.LOCATIONDESCRIPTION,
        FROMBRANCHIDDETAILS: fromBranch.BRANCHID,
        SUPPLIER: catItem ? catItem.SUPPLIER : 'Standard Supplier',
        REMARK: it.REMARK || '',
        checked: true
      };
    });

    const totalQty = items.reduce((sum, i) => sum + i.QTYREQ, 0);

    const newPr: ProductRequestHeader = {
      ID: prId,
      REQUESTNB: reqNb,
      BRANCHID: branch.BRANCHID,
      TOBRANCH: branch.BARANCHNAME,
      FROMBRANCHID: fromBranch.BRANCHID,
      FROMBRANCHNAME: fromBranch.BARANCHNAME,
      FROMBRAND: branch.BRAND_ID,
      LOCATIONID: location.LOCATIONID,
      LOCATIONDESCRIPTION: location.LOCATIONDESCRIPTION,
      USERID: 501,
      firstname: 'Mohammed',
      lastname: 'Jichi',
      REQUESTEDBY: 'Mohammed Jichi',
      CURRENTDATE: todayStr,
      DELIVERYDATE: payload.DELIVERYDATE || `${todayStr} 12:00`,
      REMARK: payload.REMARK || '',
      STATUS: 'Pending',
      CONVERTED: 0,
      ITEMS_COUNT: items.length,
      TOTAL_QTY: totalQty,
      items
    };

    productRequests.unshift(newPr);
    return newPr;
  }

  // 5. Update Existing Product Request
  public static updateProductRequest(
    id: number,
    payload: {
      BRANCHID?: number;
      LOCATIONID?: number;
      FROMBRANCHID?: number;
      DELIVERYDATE?: string;
      REMARK?: string;
      items?: Array<{
        ITEMID: number;
        ITEMCODE: string;
        ITEMDESCRIPTION: string;
        UNIT: string;
        QTYREQ: number;
        QTYAPP?: number;
        COST: number;
        LOCID?: number;
        REMARK?: string;
      }>;
    }
  ): ProductRequestHeader | null {
    const idx = productRequests.findIndex(r => r.ID === Number(id));
    if (idx === -1) return null;

    const pr = productRequests[idx];

    if (payload.BRANCHID) {
      const b = OMEGA_PR_BRANCHES.find(br => br.BRANCHID === Number(payload.BRANCHID));
      if (b) {
        pr.BRANCHID = b.BRANCHID;
        pr.TOBRANCH = b.BARANCHNAME;
      }
    }
    if (payload.FROMBRANCHID) {
      const fb = OMEGA_PR_BRANCHES.find(br => br.BRANCHID === Number(payload.FROMBRANCHID));
      if (fb) {
        pr.FROMBRANCHID = fb.BRANCHID;
        pr.FROMBRANCHNAME = fb.BARANCHNAME;
      }
    }
    if (payload.LOCATIONID) {
      const l = OMEGA_PR_LOCATIONS.find(loc => loc.LOCATIONID === Number(payload.LOCATIONID));
      if (l) {
        pr.LOCATIONID = l.LOCATIONID;
        pr.LOCATIONDESCRIPTION = l.LOCATIONDESCRIPTION;
      }
    }
    if (payload.DELIVERYDATE) pr.DELIVERYDATE = payload.DELIVERYDATE;
    if (payload.REMARK !== undefined) pr.REMARK = payload.REMARK;

    if (payload.items) {
      pr.items = payload.items.map((it, i) => {
        const catItem = MASTER_INVENTORY_ITEMS.find(m => m.ITEMID === it.ITEMID);
        return {
          ID: i + 1,
          ITEMID: it.ITEMID,
          ITEMCODE: it.ITEMCODE,
          ITEMDESCRIPTION: it.ITEMDESCRIPTION,
          UNIT: it.UNIT,
          QTYREQ: Number(it.QTYREQ) || 1,
          QTYAPP: it.QTYAPP !== undefined ? Number(it.QTYAPP) : (Number(it.QTYREQ) || 1),
          QTYREC: 0,
          QTYOH: catItem ? catItem.QTYOH : 100,
          COST: Number(it.COST) || 0,
          LOCID: it.LOCID || pr.LOCATIONID,
          LOCATIONDESCRIPTION: pr.LOCATIONDESCRIPTION,
          FROMBRANCHIDDETAILS: pr.FROMBRANCHID,
          SUPPLIER: catItem ? catItem.SUPPLIER : '',
          REMARK: it.REMARK || '',
          checked: true
        };
      });
      pr.ITEMS_COUNT = pr.items.length;
      pr.TOTAL_QTY = pr.items.reduce((s, it) => s + it.QTYREQ, 0);
    }

    return pr;
  }

  // 6. Delete Product Request
  public static deleteProductRequest(id: number): boolean {
    const initialLen = productRequests.length;
    productRequests = productRequests.filter(r => r.ID !== Number(id));
    return productRequests.length < initialLen;
  }

  // 7. Approve Product Request (Single)
  public static approveProductRequest(
    id: number,
    itemsAdjustment?: Array<{ ITEMID: number; QTYAPP: number; LOCID?: number }>,
    convertToTransaction: boolean = false
  ): ProductRequestHeader | null {
    const pr = productRequests.find(r => r.ID === Number(id));
    if (!pr) return null;

    if (itemsAdjustment && itemsAdjustment.length > 0) {
      itemsAdjustment.forEach(adj => {
        const line = pr.items.find(it => it.ITEMID === adj.ITEMID);
        if (line) {
          line.QTYAPP = Number(adj.QTYAPP);
          if (adj.LOCID) line.LOCID = Number(adj.LOCID);
        }
      });
    }

    pr.STATUS = convertToTransaction ? 'Confirmed' : 'Approved';
    pr.CONVERTED = convertToTransaction ? -1 : 0;
    pr.APPROVEDBY = 'Operations Manager';
    pr.APPROVEDDATE = new Date().toISOString().replace('T', ' ').substring(0, 16);
    pr.REJECTREASON = undefined;

    return pr;
  }

  // 8. Multi-Action: Approve Checked
  public static approveMultiProductRequest(
    ids: number[],
    onlyApprove: boolean = true,
    convertToTransaction: boolean = false
  ): { count: number; updated: ProductRequestHeader[] } {
    const updated: ProductRequestHeader[] = [];
    ids.forEach(id => {
      const res = this.approveProductRequest(id, undefined, convertToTransaction);
      if (res) updated.push(res);
    });
    return { count: updated.length, updated };
  }

  // 9. Multi-Action: Unapprove
  public static unapproveMultiProductRequest(ids: number[]): { count: number; updated: ProductRequestHeader[] } {
    const updated: ProductRequestHeader[] = [];
    ids.forEach(id => {
      const pr = productRequests.find(r => r.ID === Number(id));
      if (pr) {
        pr.STATUS = 'Pending';
        pr.CONVERTED = 0;
        pr.APPROVEDBY = undefined;
        pr.APPROVEDDATE = undefined;
        updated.push(pr);
      }
    });
    return { count: updated.length, updated };
  }

  // 10. Reject Product Request
  public static rejectProductRequest(id: number, reason: string): ProductRequestHeader | null {
    const pr = productRequests.find(r => r.ID === Number(id));
    if (!pr) return null;

    pr.STATUS = 'Rejected';
    pr.CONVERTED = 0;
    pr.REJECTREASON = reason;
    pr.items.forEach(it => {
      it.QTYAPP = 0;
    });

    return pr;
  }

  // 11. Reject Reasons Management
  public static getRejectReasons(): RejectReasonRecord[] {
    return rejectReasons;
  }

  public static addRejectReason(description: string): RejectReasonRecord {
    const nextId = Math.max(0, ...rejectReasons.map(r => r.ID)) + 1;
    const newR: RejectReasonRecord = {
      ID: nextId,
      DESCRIPTION: description,
      BRAND_ID: 9606
    };
    rejectReasons.push(newR);
    return newR;
  }

  public static editRejectReason(id: number, description: string): RejectReasonRecord | null {
    const reason = rejectReasons.find(r => r.ID === Number(id));
    if (!reason) return null;
    reason.DESCRIPTION = description;
    return reason;
  }

  public static deleteRejectReason(id: number): boolean {
    const len = rejectReasons.length;
    rejectReasons = rejectReasons.filter(r => r.ID !== Number(id));
    return rejectReasons.length < len;
  }

  // 12. Substitute Items across Product Requests
  public static substituteItem(oldItemId: number, newItemId: number, targetPrIds?: number[]): { count: number } {
    const newItem = MASTER_INVENTORY_ITEMS.find(i => i.ITEMID === Number(newItemId));
    if (!newItem) return { count: 0 };

    let count = 0;
    const targets = targetPrIds && targetPrIds.length > 0
      ? productRequests.filter(pr => targetPrIds.includes(pr.ID))
      : productRequests.filter(pr => pr.STATUS === 'Pending');

    targets.forEach(pr => {
      pr.items.forEach(it => {
        if (it.ITEMID === Number(oldItemId)) {
          it.ITEMID = newItem.ITEMID;
          it.ITEMCODE = newItem.ITEMCODE;
          it.ITEMDESCRIPTION = newItem.ITEMDESCRIPTION;
          it.UNIT = newItem.UNIT;
          it.COST = newItem.COST;
          it.QTYOH = newItem.QTYOH;
          it.REMARK = (it.REMARK ? it.REMARK + '; ' : '') + `Substituted from item #${oldItemId}`;
          count++;
        }
      });
    });

    return { count };
  }

  // 13. Inventory Item Catalog & Search
  public static searchInventory(query?: string, categoryId?: number): InventorySearchItem[] {
    let items = [...MASTER_INVENTORY_ITEMS];
    if (categoryId && Number(categoryId) !== 0 && Number(categoryId) !== -1) {
      items = items.filter(i => i.CATEGORYID === Number(categoryId));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      items = items.filter(i =>
        i.ITEMDESCRIPTION.toLowerCase().includes(q) ||
        i.ITEMCODE.toLowerCase().includes(q) ||
        i.BARCODE.toLowerCase().includes(q) ||
        i.CATEGORY.toLowerCase().includes(q)
      );
    }
    return items;
  }

  public static getRecommendedItems(): InventorySearchItem[] {
    return MASTER_INVENTORY_ITEMS.filter(i => i.IS_RECOMMENDED);
  }

  public static getBelowMinimumItems(): InventorySearchItem[] {
    return MASTER_INVENTORY_ITEMS.filter(i => i.IS_BELOW_MIN);
  }

  // 14. Recurring PR Templates
  public static getTemplates(branchId?: number): RecurringPRTemplate[] {
    if (!branchId || branchId === 0) return templates;
    return templates.filter(t => t.BRANCHID === Number(branchId));
  }

  public static saveTemplate(template: {
    TEMPLATENAME: string;
    BRANCHID: number;
    LOCATIONID: number;
    REMARK?: string;
    items: any[];
  }): RecurringPRTemplate {
    const nextId = Math.max(0, ...templates.map(t => t.TEMPLATEID)) + 1;
    const newT: RecurringPRTemplate = {
      TEMPLATEID: nextId,
      TEMPLATENAME: template.TEMPLATENAME,
      BRANCHID: template.BRANCHID,
      LOCATIONID: template.LOCATIONID,
      REMARK: template.REMARK || '',
      items: template.items
    };
    templates.push(newT);
    return newT;
  }

  public static deleteTemplate(templateId: number): boolean {
    const len = templates.length;
    templates = templates.filter(t => t.TEMPLATEID !== Number(templateId));
    return templates.length < len;
  }

  // 15. Central Kitchen Productions by Date
  public static getProductions(date?: string) {
    const d = date || new Date().toISOString().split('T')[0];
    const matchedItems: { [itemCode: string]: { code: string; desc: string; unit: string; totalQty: number; requestsCount: number; branches: string[] } } = {};

    productRequests
      .filter(pr => pr.STATUS === 'Approved' || pr.STATUS === 'Pending')
      .forEach(pr => {
        pr.items.forEach(it => {
          if (!matchedItems[it.ITEMCODE]) {
            matchedItems[it.ITEMCODE] = {
              code: it.ITEMCODE,
              desc: it.ITEMDESCRIPTION,
              unit: it.UNIT,
              totalQty: 0,
              requestsCount: 0,
              branches: []
            };
          }
          matchedItems[it.ITEMCODE].totalQty += it.QTYREQ;
          matchedItems[it.ITEMCODE].requestsCount++;
          if (!matchedItems[it.ITEMCODE].branches.includes(pr.TOBRANCH)) {
            matchedItems[it.ITEMCODE].branches.push(pr.TOBRANCH);
          }
        });
      });

    return {
      date: d,
      productionItems: Object.values(matchedItems)
    };
  }

  // 16. PR Status by Branch & Item Type
  public static getPrStatusByBranchReport() {
    const branchStats: { [bName: string]: { branchName: string; totalPr: number; pending: number; approved: number; rejected: number; confirmed: number; totalQty: number } } = {};

    productRequests.forEach(pr => {
      if (!branchStats[pr.TOBRANCH]) {
        branchStats[pr.TOBRANCH] = {
          branchName: pr.TOBRANCH,
          totalPr: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          confirmed: 0,
          totalQty: 0
        };
      }
      const s = branchStats[pr.TOBRANCH];
      s.totalPr++;
      s.totalQty += pr.TOTAL_QTY;
      if (pr.STATUS === 'Pending') s.pending++;
      else if (pr.STATUS === 'Approved') s.approved++;
      else if (pr.STATUS === 'Rejected') s.rejected++;
      else if (pr.STATUS === 'Confirmed') s.confirmed++;
    });

    return Object.values(branchStats);
  }

  // 17. Tablet Preparation Manager
  public static getItemTypes() {
    return [
      { ID: 0, NAME: 'All Item Types' },
      { ID: 1, NAME: 'Fresh Produce' },
      { ID: 2, NAME: 'Herbs & Spices' },
      { ID: 3, NAME: 'Oils & Fats' },
      { ID: 4, NAME: 'Dairy Products' },
      { ID: 5, NAME: 'Bakery & Flour' },
      { ID: 6, NAME: 'Poultry & Meat' },
      { ID: 7, NAME: 'Packaging Materials' },
      { ID: 8, NAME: 'Beverages' },
      { ID: 9, NAME: 'Condiments & Pickles' },
      { ID: 10, NAME: 'Hygiene & Cleaning' }
    ];
  }

  public static getRequestsByBranchByItemType(filters?: {
    date?: string;
    frombranchid?: number;
    itemtypeid?: number;
  }) {
    let list = productRequests.filter(r => r.STATUS === 'Pending' || r.STATUS === 'Approved');

    if (filters) {
      if (filters.date) {
        list = list.filter(r => r.CURRENTDATE === filters.date || (r.DELIVERYDATE && r.DELIVERYDATE.startsWith(filters.date!)));
      }
      if (filters.frombranchid && Number(filters.frombranchid) !== 0) {
        list = list.filter(r => r.FROMBRANCHID === Number(filters.frombranchid) || r.BRANCHID === Number(filters.frombranchid));
      }
    }

    return list.map(pr => {
      let filteredItems = [...pr.items];
      if (filters && filters.itemtypeid && Number(filters.itemtypeid) !== 0) {
        const catItemIds = MASTER_INVENTORY_ITEMS.filter(m => m.CATEGORYID === Number(filters.itemtypeid)).map(m => m.ITEMID);
        filteredItems = filteredItems.filter(i => catItemIds.includes(i.ITEMID));
      }
      return {
        ...pr,
        items: filteredItems
      };
    }).filter(pr => pr.items.length > 0);
  }

  public static savePrByItemType(
    requestId: number,
    itemUpdates?: Array<{ ITEMID: number; QTYAPP?: number; REMARK?: string; isPrepared?: boolean }>
  ) {
    const pr = productRequests.find(r => r.ID === Number(requestId));
    if (!pr) return null;

    if (itemUpdates && Array.isArray(itemUpdates)) {
      itemUpdates.forEach(up => {
        const item = pr.items.find(i => i.ITEMID === Number(up.ITEMID));
        if (item) {
          if (up.QTYAPP !== undefined) item.QTYAPP = Number(up.QTYAPP);
          if (up.REMARK !== undefined) item.REMARK = up.REMARK;
        }
      });
    }

    return pr;
  }

  // 18. Receiving of Goods
  public static getAllApprovedProductRequests(filters?: {
    from?: string;
    to?: string;
    branchid?: number;
    frombranchid?: number;
    search?: string;
  }): ProductRequestHeader[] {
    let list = productRequests.filter(r => r.STATUS === 'Approved' || r.STATUS === 'Confirmed');

    if (filters) {
      if (filters.from) list = list.filter(r => r.CURRENTDATE >= filters.from!);
      if (filters.to) list = list.filter(r => r.CURRENTDATE <= filters.to!);
      if (filters.branchid && Number(filters.branchid) !== 0) {
        list = list.filter(r => r.BRANCHID === Number(filters.branchid));
      }
      if (filters.frombranchid && Number(filters.frombranchid) !== 0) {
        list = list.filter(r => r.FROMBRANCHID === Number(filters.frombranchid));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(r =>
          r.REQUESTNB.toLowerCase().includes(q) ||
          r.TOBRANCH.toLowerCase().includes(q) ||
          r.REQUESTEDBY.toLowerCase().includes(q) ||
          r.REMARK.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => b.ID - a.ID);
  }

  public static saveGoodsReceiving(
    requestId: number,
    receivedItems?: Array<{ ITEMID: number; QTYREC: number; REMARK?: string }>,
    remark?: string
  ): ProductRequestHeader | null {
    const pr = productRequests.find(r => r.ID === Number(requestId));
    if (!pr) return null;

    if (receivedItems && Array.isArray(receivedItems)) {
      receivedItems.forEach(up => {
        const item = pr.items.find(i => i.ITEMID === Number(up.ITEMID));
        if (item) {
          item.QTYREC = Number(up.QTYREC) || 0;
          if (up.REMARK !== undefined) item.REMARK = up.REMARK;
        }
      });
    }

    if (remark !== undefined) pr.REMARK = remark;
    return pr;
  }

  public static async confirmGoodsReceiving(
    requestId: number,
    receivedItems?: Array<{ ITEMID: number; QTYREC: number; REMARK?: string }>,
    remark?: string,
    tenantId?: string
  ): Promise<ProductRequestHeader | null> {
    const pr = this.saveGoodsReceiving(requestId, receivedItems, remark);
    if (!pr) return null;

    pr.STATUS = 'Confirmed';
    pr.CONVERTED = -1;
    pr.items.forEach(it => {
      if (!it.QTYREC && it.QTYAPP) {
        it.QTYREC = it.QTYAPP;
      }
    });

    const targetTenantId = (tenantId && tenantId !== '1300' && !tenantId.startsWith('comp-'))
      ? tenantId
      : '00000000-0000-0000-0000-000000000001';

    // 1. Live stock increment & batch lot / movement logging in Supabase
    for (const item of pr.items) {
      const recQty = Number(item.QTYREC) || Number(item.QTYAPP) || 0;
      if (recQty <= 0) continue;

      try {
        const { data: stockRow } = await supabase
          .from('inventory_stock')
          .select('on_hand_qty')
          .eq('tenant_id', targetTenantId)
          .eq('location_id', pr.LOCATIONID || 1)
          .eq('item_code', item.ITEMCODE)
          .maybeSingle();

        const currentQty = Number(stockRow?.on_hand_qty) || 0;
        const newQty = currentQty + recQty;

        await supabase
          .from('inventory_stock')
          .upsert({
            tenant_id: targetTenantId,
            branch_id: pr.BRANCHID || 1,
            location_id: pr.LOCATIONID || 1,
            item_code: item.ITEMCODE,
            item_name: item.ITEMDESCRIPTION,
            on_hand_qty: newQty,
            unit: item.UNIT,
            average_unit_cost: item.COST,
            updated_at: new Date().toISOString()
          }, { onConflict: 'tenant_id,location_id,item_code' });

        const lotNumber = 'LOT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + item.ITEMID;
        await supabase
          .from('inventory_movements')
          .insert([{
            id: crypto.randomUUID(),
            tenant_id: targetTenantId,
            branch_id: pr.BRANCHID || 1,
            location_id: pr.LOCATIONID || 1,
            item_code: item.ITEMCODE,
            movement_type: 'PURCHASE_RECEIPT',
            reference_id: pr.REQUESTNB,
            quantity: recQty,
            unit_cost: item.COST,
            total_cost: recQty * item.COST,
            notes: 'GRN Received Lot #' + lotNumber + ': ' + (item.REMARK || pr.REMARK || 'Goods accepted')
          }]);
      } catch (stockErr) {
        console.warn('Inventory stock update notice during GRN confirm:', stockErr);
      }
    }

    // 2. Update status in purchase orders & product requests in Supabase
    try {
      await supabase
        .from('purchase_orders')
        .update({
          status: 'Received',
          updated_at: new Date().toISOString()
        })
        .or('po_number.eq.' + pr.REQUESTNB + ',pr_number.eq.' + pr.REQUESTNB);
    } catch (poErr) {
      console.warn('PO status update notice:', poErr);
    }

    // 3. Multi-Tenant feature_flags sync
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || {};
      const existingPrs = Array.isArray(existingFlags.product_requests) ? existingFlags.product_requests : [];
      const updatedPrs = existingPrs.map((r: any) => (r.ID === pr.ID ? pr : r));
      if (!updatedPrs.some((r: any) => r.ID === pr.ID)) {
        updatedPrs.unshift(pr);
      }

      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            product_requests: updatedPrs
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetTenantId);
    } catch (tenantErr) {
      console.warn('Tenant sync notice during GRN confirm:', tenantErr);
    }

    return pr;
  }

  public static unconfirmGoodsReceiving(requestId: number): ProductRequestHeader | null {
    const pr = productRequests.find(r => r.ID === Number(requestId));
    if (!pr) return null;

    pr.STATUS = 'Approved';
    pr.CONVERTED = 0;
    return pr;
  }

  // 19. Paginated Reject Reasons (Omega Match)
  public static getRejectReasonsPaginated(
    page: number = 1,
    searchValue: string = '',
    sorting: { value: string; type: string } = { value: 'DESCRIPTION', type: 'asc' }
  ) {
    let list = [...rejectReasons];
    if (searchValue && searchValue.trim() !== '') {
      const q = searchValue.trim().toLowerCase();
      list = list.filter(
        r => r.DESCRIPTION.toLowerCase().includes(q) || String(r.ID).includes(q)
      );
    }

    const sortKey = (sorting.value || 'DESCRIPTION').toUpperCase();
    const sortType = (sorting.type || 'asc').toLowerCase();
    list.sort((a, b) => {
      let valA: any = sortKey === 'ID' ? a.ID : a.DESCRIPTION.toLowerCase();
      let valB: any = sortKey === 'ID' ? b.ID : b.DESCRIPTION.toLowerCase();
      if (valA < valB) return sortType === 'asc' ? -1 : 1;
      if (valA > valB) return sortType === 'asc' ? 1 : -1;
      return 0;
    });

    const perPage = 15;
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(Math.max(1, page), lastPage);
    const startIdx = (currentPage - 1) * perPage;
    const pageData = list.slice(startIdx, startIdx + perPage);

    return {
      current_page: currentPage,
      data: pageData,
      first_page_url: `/api/getAllRejectReasonsList?page=1`,
      from: total > 0 ? startIdx + 1 : 0,
      last_page: lastPage,
      last_page_url: `/api/getAllRejectReasonsList?page=${lastPage}`,
      links: [
        { url: currentPage > 1 ? `/api/getAllRejectReasonsList?page=${currentPage - 1}` : null, label: '&laquo; Previous', active: false },
        ...Array.from({ length: lastPage }, (_, i) => ({
          url: `/api/getAllRejectReasonsList?page=${i + 1}`,
          label: String(i + 1),
          active: i + 1 === currentPage
        })),
        { url: currentPage < lastPage ? `/api/getAllRejectReasonsList?page=${currentPage + 1}` : null, label: 'Next &raquo;', active: false }
      ],
      next_page_url: currentPage < lastPage ? `/api/getAllRejectReasonsList?page=${currentPage + 1}` : null,
      path: '/api/getAllRejectReasonsList',
      per_page: perPage,
      prev_page_url: currentPage > 1 ? `/api/getAllRejectReasonsList?page=${currentPage - 1}` : null,
      to: Math.min(startIdx + perPage, total),
      total
    };
  }

  // 20. Reports Metadata
  public static getReportList() {
    return { reports: OMEGA_PR_REPORTS_LIST };
  }

  public static getReportIdGroups() {
    return OMEGA_REPORT_GROUPS;
  }

  // 21. Report Generator Engine
  public static generateReportData(params: {
    reportId: number | string;
    from?: string;
    to?: string;
    dateByDelivery?: boolean | string;
    itemType?: number | string;
    reportFromBranch?: number | string;
    reportBranch?: number | string;
    prstatus?: string | number;
    sd_groupId?: number | string;
    exportType?: string;
  }) {
    const reportId = Number(params.reportId);
    const fromDate = params.from || '2026-01-01';
    const toDate = params.to || '2026-12-31';
    const isDeliveryDate = params.dateByDelivery === true || String(params.dateByDelivery) === 'true';
    const itemTypeId = Number(params.itemType) || 0;
    const reqBranchId = Number(params.reportBranch) || 0;
    const fromBranchId = Number(params.reportFromBranch) || 0;
    const statusVal = params.prstatus !== undefined ? String(params.prstatus) : '-1';

    let matchingPrs = productRequests.filter(pr => {
      const dateToCheck = isDeliveryDate ? (pr.DELIVERYDATE ? pr.DELIVERYDATE.split(' ')[0] : pr.CURRENTDATE) : pr.CURRENTDATE;
      if (dateToCheck < fromDate || dateToCheck > toDate) return false;

      if (statusVal === '0' && pr.STATUS !== 'Pending') return false;
      if (statusVal === '-1' && pr.STATUS !== 'Approved' && pr.STATUS !== 'Confirmed') return false;
      if (statusVal === '-3' && pr.STATUS !== 'Confirmed') return false;
      if (statusVal === '2' && pr.STATUS !== 'Rejected') return false;

      if (reqBranchId > 0 && pr.BRANCHID !== reqBranchId) return false;
      if (fromBranchId > 0 && pr.FROMBRANCHID !== fromBranchId) return false;

      return true;
    });

    if (reportId === 405) {
      const itemMap: { [code: string]: any } = {};

      matchingPrs.forEach(pr => {
        pr.items.forEach(it => {
          if (itemTypeId > 0) {
            const master = MASTER_INVENTORY_ITEMS.find(m => m.ITEMID === it.ITEMID);
            if (master && master.CATEGORYID !== itemTypeId) return;
          }
          if (!itemMap[it.ITEMCODE]) {
            itemMap[it.ITEMCODE] = {
              ITEMID: it.ITEMID,
              ITEMCODE: it.ITEMCODE,
              ITEMDESCRIPTION: it.ITEMDESCRIPTION,
              UNIT: it.UNIT,
              COST: it.COST,
              QTYREQ: 0,
              QTYAPP: 0,
              QTYREC: 0,
              TOTAL_COST: 0,
              REQUESTS_COUNT: 0,
              BRANCHES: new Set<string>()
            };
          }
          itemMap[it.ITEMCODE].QTYREQ += it.QTYREQ;
          itemMap[it.ITEMCODE].QTYAPP += (it.QTYAPP ?? it.QTYREQ);
          itemMap[it.ITEMCODE].QTYREC += (it.QTYREC ?? 0);
          itemMap[it.ITEMCODE].TOTAL_COST += ((it.QTYAPP ?? it.QTYREQ) * it.COST);
          itemMap[it.ITEMCODE].REQUESTS_COUNT += 1;
          itemMap[it.ITEMCODE].BRANCHES.add(pr.TOBRANCH);
        });
      });

      const rows = Object.values(itemMap).map((r: any) => ({
        ...r,
        BRANCHES: Array.from(r.BRANCHES).join(', ')
      })).sort((a, b) => b.QTYREQ - a.QTYREQ);

      const summary = {
        totalItemsCount: rows.length,
        totalQtyReq: rows.reduce((acc, r) => acc + r.QTYREQ, 0),
        totalQtyApp: rows.reduce((acc, r) => acc + r.QTYAPP, 0),
        totalQtyRec: rows.reduce((acc, r) => acc + r.QTYREC, 0),
        totalAmount: rows.reduce((acc, r) => acc + r.TOTAL_COST, 0)
      };

      return { reportId, reportName: 'Qty requested by item', rows, summary, params };
    }

    if (reportId === 406) {
      const catMap: { [cat: string]: any[] } = {};

      matchingPrs.forEach(pr => {
        pr.items.forEach(it => {
          const master = MASTER_INVENTORY_ITEMS.find(m => m.ITEMID === it.ITEMID);
          const category = master?.CATEGORY || 'General Production';
          if (itemTypeId > 0 && master?.CATEGORYID !== itemTypeId) return;

          if (!catMap[category]) catMap[category] = [];
          let existing = catMap[category].find(x => x.ITEMCODE === it.ITEMCODE);
          if (!existing) {
            existing = {
              ITEMID: it.ITEMID,
              ITEMCODE: it.ITEMCODE,
              ITEMDESCRIPTION: it.ITEMDESCRIPTION,
              UNIT: it.UNIT,
              CATEGORY: category,
              TOTAL_REQUIRED: 0,
              BRANCH_BREAKDOWN: {} as { [branch: string]: number },
              TARGET_DATE: pr.DELIVERYDATE
            };
            catMap[category].push(existing);
          }
          existing.TOTAL_REQUIRED += (it.QTYAPP ?? it.QTYREQ);
          existing.BRANCH_BREAKDOWN[pr.TOBRANCH] = (existing.BRANCH_BREAKDOWN[pr.TOBRANCH] || 0) + (it.QTYAPP ?? it.QTYREQ);
        });
      });

      const groups = Object.keys(catMap).map(category => ({
        category,
        items: catMap[category].map(item => ({
          ...item,
          branchSummary: Object.entries(item.BRANCH_BREAKDOWN).map(([b, q]) => `${b}: ${q}`).join(' | ')
        }))
      }));

      const summary = {
        totalCategories: groups.length,
        totalProductionItems: groups.reduce((acc, g) => acc + g.items.length, 0),
        totalUnitsNeeded: groups.reduce((acc, g) => acc + g.items.reduce((s, it) => s + it.TOTAL_REQUIRED, 0), 0)
      };

      return { reportId, reportName: 'Production Report', groups, summary, params };
    }

    if (reportId === 407) {
      const rows: any[] = [];

      matchingPrs.forEach(pr => {
        pr.items.forEach(it => {
          if (itemTypeId > 0) {
            const master = MASTER_INVENTORY_ITEMS.find(m => m.ITEMID === it.ITEMID);
            if (master && master.CATEGORYID !== itemTypeId) return;
          }
          rows.push({
            PR_ID: pr.ID,
            REQUESTNB: pr.REQUESTNB,
            DATE: pr.CURRENTDATE,
            DELIVERYDATE: pr.DELIVERYDATE,
            REQUESTEDBY: pr.REQUESTEDBY,
            BRANCH: pr.TOBRANCH,
            FROMBRANCH: pr.FROMBRANCHNAME,
            STATUS: pr.STATUS,
            ITEMCODE: it.ITEMCODE,
            ITEMDESCRIPTION: it.ITEMDESCRIPTION,
            UNIT: it.UNIT,
            QTYREQ: it.QTYREQ,
            QTYAPP: it.QTYAPP ?? it.QTYREQ,
            QTYREC: it.QTYREC ?? 0,
            COST: it.COST,
            TOTAL_COST: ((it.QTYAPP ?? it.QTYREQ) * it.COST),
            REMARK: it.REMARK || pr.REMARK || '-'
          });
        });
      });

      rows.sort((a, b) => b.PR_ID - a.PR_ID);

      const summary = {
        totalRecords: rows.length,
        totalQtyReq: rows.reduce((acc, r) => acc + r.QTYREQ, 0),
        totalQtyApp: rows.reduce((acc, r) => acc + r.QTYAPP, 0),
        totalQtyRec: rows.reduce((acc, r) => acc + r.QTYREC, 0),
        totalValue: rows.reduce((acc, r) => acc + r.TOTAL_COST, 0)
      };

      return { reportId, reportName: 'Products Requested Details', rows, summary, params };
    }

    if (reportId === 408) {
      const divisionMap: { [div: string]: { [group: string]: any[] } } = {};

      matchingPrs.forEach(pr => {
        pr.items.forEach(it => {
          const master = MASTER_INVENTORY_ITEMS.find(m => m.ITEMID === it.ITEMID);
          const division = 'Food & Beverages Operations';
          const group = master?.CATEGORY || 'General Kitchen Items';
          if (itemTypeId > 0 && master?.CATEGORYID !== itemTypeId) return;

          if (!divisionMap[division]) divisionMap[division] = {};
          if (!divisionMap[division][group]) divisionMap[division][group] = [];

          let existing = divisionMap[division][group].find(x => x.ITEMCODE === it.ITEMCODE);
          if (!existing) {
            existing = {
              ITEMCODE: it.ITEMCODE,
              ITEMDESCRIPTION: it.ITEMDESCRIPTION,
              UNIT: it.UNIT,
              COST: it.COST,
              QTYREQ: 0,
              QTYAPP: 0,
              TOTAL_COST: 0
            };
            divisionMap[division][group].push(existing);
          }
          existing.QTYREQ += it.QTYREQ;
          existing.QTYAPP += (it.QTYAPP ?? it.QTYREQ);
          existing.TOTAL_COST += ((it.QTYAPP ?? it.QTYREQ) * it.COST);
        });
      });

      const divisions = Object.keys(divisionMap).map(divName => ({
        divisionName: divName,
        groups: Object.keys(divisionMap[divName]).map(grpName => ({
          groupName: grpName,
          items: divisionMap[divName][grpName],
          groupTotalQty: divisionMap[divName][grpName].reduce((s, i) => s + i.QTYAPP, 0),
          groupTotalValue: divisionMap[divName][grpName].reduce((s, i) => s + i.TOTAL_COST, 0)
        }))
      }));

      const summary = {
        totalDivisions: divisions.length,
        totalItemsCount: divisions.reduce((acc, d) => acc + d.groups.reduce((gacc, g) => gacc + g.items.length, 0), 0),
        grandTotalValue: divisions.reduce((acc, d) => acc + d.groups.reduce((gacc, g) => gacc + g.groupTotalValue, 0), 0)
      };

      return { reportId, reportName: 'Items Requested by Group by Division', divisions, summary, params };
    }

    if (reportId === 409) {
      const rows: any[] = [];

      matchingPrs.forEach(pr => {
        pr.items.forEach(it => {
          const hasRemark = (it.REMARK && it.REMARK.trim() !== '') || (pr.REMARK && pr.REMARK.trim() !== '') || (pr.REJECTREASON && pr.REJECTREASON.trim() !== '');
          const hasDiscrepancy = (it.QTYAPP !== undefined && it.QTYAPP !== it.QTYREQ) || (it.QTYREC !== undefined && it.QTYREC > 0 && it.QTYREC !== it.QTYAPP);
          if (hasRemark || hasDiscrepancy) {
            rows.push({
              PR_ID: pr.ID,
              REQUESTNB: pr.REQUESTNB,
              BRANCH: pr.TOBRANCH,
              ITEMCODE: it.ITEMCODE,
              ITEMDESCRIPTION: it.ITEMDESCRIPTION,
              UNIT: it.UNIT,
              QTYREQ: it.QTYREQ,
              QTYAPP: it.QTYAPP ?? it.QTYREQ,
              DIFF: it.QTYREQ - (it.QTYAPP ?? it.QTYREQ),
              STATUS: pr.STATUS,
              ITEM_REMARK: it.REMARK || '-',
              PR_REMARK: pr.REMARK || '-',
              REJECT_REASON: pr.REJECTREASON || '-'
            });
          }
        });
      });

      const summary = {
        totalFlaggedItems: rows.length,
        totalDiscrepancyQty: rows.reduce((acc, r) => acc + Math.max(0, r.DIFF), 0)
      };

      return { reportId, reportName: 'Items Requested With Remark', rows, summary, params };
    }

    return { reportId, reportName: 'Unknown Report', rows: [], summary: {}, params };
  }

  // 22. Authentic Jasper HTML Report Renderer
  public static generateJasperHtmlReport(data: any): string {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    let tableContent = '';

    if (data.reportId === 405) {
      tableContent = `
        <table class="jrTable" style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px;">
          <thead>
            <tr style="background-color: #2e353d; color: #ffffff;">
              <th style="padding: 8px 6px; text-align: left; border: 1px solid #ddd;">#</th>
              <th style="padding: 8px 6px; text-align: left; border: 1px solid #ddd;">Item Code</th>
              <th style="padding: 8px 6px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 8px 6px; text-align: center; border: 1px solid #ddd;">Unit</th>
              <th style="padding: 8px 6px; text-align: right; border: 1px solid #ddd;">Qty Req</th>
              <th style="padding: 8px 6px; text-align: right; border: 1px solid #ddd;">Qty App</th>
              <th style="padding: 8px 6px; text-align: right; border: 1px solid #ddd;">Qty Rec</th>
              <th style="padding: 8px 6px; text-align: right; border: 1px solid #ddd;">Unit Cost ($)</th>
              <th style="padding: 8px 6px; text-align: right; border: 1px solid #ddd;">Total ($)</th>
              <th style="padding: 8px 6px; text-align: left; border: 1px solid #ddd;">Requested By Branches</th>
            </tr>
          </thead>
          <tbody>
            ${(data.rows || []).map((r: any, idx: number) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                <td style="padding: 6px; border: 1px solid #ddd; color: #666;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">${r.ITEMCODE}</td>
                <td style="padding: 6px; border: 1px solid #ddd;">${r.ITEMDESCRIPTION}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${r.UNIT}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${r.QTYREQ}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: right; color: #1ab394; font-weight: bold;">${r.QTYAPP}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${r.QTYREC}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">${r.COST.toFixed(2)}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${r.TOTAL_COST.toFixed(2)}</td>
                <td style="padding: 6px; border: 1px solid #ddd; color: #555;">${r.BRANCHES}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f1f3f6; font-weight: bold; font-size: 12px;">
              <td colspan="4" style="padding: 8px 6px; border: 1px solid #ddd; text-align: right;">Total:</td>
              <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: right;">${data.summary?.totalQtyReq || 0}</td>
              <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: right; color: #1ab394;">${data.summary?.totalQtyApp || 0}</td>
              <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: right;">${data.summary?.totalQtyRec || 0}</td>
              <td style="padding: 8px 6px; border: 1px solid #ddd;"></td>
              <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: right; color: #1c84c6;">$${(data.summary?.totalAmount || 0).toFixed(2)}</td>
              <td style="padding: 8px 6px; border: 1px solid #ddd;"></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (data.reportId === 406) {
      tableContent = `
        ${(data.groups || []).map((grp: any) => `
          <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 6px; color: #2e353d; border-bottom: 2px solid #1ab394; padding-bottom: 4px;">${grp.category}</h4>
            <table class="jrTable" style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 6px; text-align: left; border: 1px solid #ddd;">Item Code</th>
                  <th style="padding: 6px; text-align: left; border: 1px solid #ddd;">Description</th>
                  <th style="padding: 6px; text-align: center; border: 1px solid #ddd;">Unit</th>
                  <th style="padding: 6px; text-align: right; border: 1px solid #ddd;">Total Needed</th>
                  <th style="padding: 6px; text-align: left; border: 1px solid #ddd;">Branch Breakdown</th>
                  <th style="padding: 6px; text-align: center; border: 1px solid #ddd;">Target Date</th>
                </tr>
              </thead>
              <tbody>
                ${(grp.items || []).map((it: any) => `
                  <tr>
                    <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">${it.ITEMCODE}</td>
                    <td style="padding: 6px; border: 1px solid #ddd;">${it.ITEMDESCRIPTION}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${it.UNIT}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #1ab394;">${it.TOTAL_REQUIRED}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; color: #555;">${it.branchSummary}</td>
                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${it.TARGET_DATE}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      `;
    } else if (data.reportId === 407) {
      tableContent = `
        <table class="jrTable" style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 15px;">
          <thead>
            <tr style="background-color: #2e353d; color: #ffffff;">
              <th style="padding: 6px; border: 1px solid #ddd;">PR #</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Branch</th>
              <th style="padding: 6px; border: 1px solid #ddd;">From</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Item Code</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Description</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Unit</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: right;">Req</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: right;">App</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: right;">Cost</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: right;">Total</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Status</th>
              <th style="padding: 6px; border: 1px solid #ddd;">Remark</th>
            </tr>
          </thead>
          <tbody>
            ${(data.rows || []).map((r: any, idx: number) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">${r.REQUESTNB}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${r.DATE}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${r.BRANCH}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${r.FROMBRANCH}</td>
                <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">${r.ITEMCODE}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${r.ITEMDESCRIPTION}</td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center;">${r.UNIT}</td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${r.QTYREQ}</td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #1ab394;">${r.QTYAPP}</td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">$${r.COST.toFixed(2)}</td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: right; font-weight: bold;">$${r.TOTAL_COST.toFixed(2)}</td>
                <td style="padding: 5px; border: 1px solid #ddd; text-align: center;">${r.STATUS}</td>
                <td style="padding: 5px; border: 1px solid #ddd; color: #666;">${r.REMARK}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      tableContent = `<pre style="padding: 15px; background: #f8f9fa;">${JSON.stringify(data, null, 2)}</pre>`;
    }

    return `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${data.reportName || 'Product Request Report'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
          .jrPage { background: #ffffff; width: 920px; margin: 0 auto; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); box-sizing: border-box; border: 1px solid #e2e8f0; }
          @media print {
            body { background: none; padding: 0; }
            .jrPage { box-shadow: none; width: 100%; padding: 10px; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="jrPage">
          {/* Corporate Topper */}
          <div style="text-align: center; margin-bottom: 6px;">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.05em;">
              Zeit w zaytoun ljanoub
            </div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #475569; margin-top: 2px;">
              Southern Olive Oil Products S.A.R.L
            </div>
          </div>

          {/* Centered Bold Report Title */}
          <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; color: #0f172a; margin: 8px 0 10px 0;">
            ${data.reportName || 'Product Request Report'}
          </div>

          {/* Execution Subheader */}
          <div style="display: flex; justify-content: space-between; align-items: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #1e293b; margin-bottom: 4px;">
            <span>${dateStr}</span>
            <span style="font-weight: 700; text-align: center; flex: 1;">Period: ${data.params?.from || '01-Jan-2026'} to ${data.params?.to || '31-Dec-2026'}</span>
            <span>Page 1 of 1</span>
          </div>

          {/* Solid Dividing Rule */}
          <div style="border-bottom: 2px solid #0f172a; margin-bottom: 6px;"></div>

          {/* Branch Subtitle */}
          <div style="display: flex; justify-content: space-between; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10.5px; font-weight: 600; color: #334155; margin-bottom: 12px;">
            <span>Branch: Zeit w zaytoun ljanoub - Central Plant</span>
            <span style="font-family: ui-monospace, monospace; color: #64748b;">System Source: Vanguard ERP Live Ledger</span>
          </div>

          {/* Filter Status Strip */}
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 14px; display: flex; justify-content: space-between; color: #475569;">
            <div><strong>Status Filter:</strong> ${data.params?.prstatus === '0' ? 'Pending Approval' : data.params?.prstatus === '2' ? 'Rejected' : 'Approved / Confirmed'}</div>
            <div><strong>Division / Group:</strong> ${data.params?.sd_groupId ? 'Assigned Group' : 'All Production Lines'}</div>
          </div>

          {/* Report Table Content */}
          ${tableContent}

          {/* Corporate Footer */}
          <div style="margin-top: 48px; padding-top: 8px;">
            <div style="border-bottom: 2px solid #0f172a; margin-bottom: 6px;"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #334155;">
              <span style="font-family: ui-monospace, monospace; font-weight: 700; color: #0f172a; letter-spacing: 0.05em;">REP_OP_003</span>
              <span style="color: #475569; font-weight: 500; text-align: center; flex: 1;">Copyright © 2026 Vanguard ERP. All Rights Reserved.</span>
              <div>
                <a href="https://www.vanguarderp.com" target="_blank" rel="noopener noreferrer" style="color: #1d4ed8; font-family: ui-monospace, monospace; text-decoration: none;">
                  &quot;www.vanguarderp.com&quot;
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
