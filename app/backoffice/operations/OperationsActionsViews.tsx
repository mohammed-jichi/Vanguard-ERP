'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Send,
  FileText,
  Boxes,
  Truck,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  RefreshCw,
  ShoppingCart,
  DollarSign,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  INITIAL_PURCHASE_ORDERS,
  INITIAL_REORDER_GUIDE,
  INITIAL_TRANSFERS,
  INITIAL_LOST_GOODS,
  INITIAL_ASSEMBLIES,
  INITIAL_ADJUSTMENTS,
  PurchaseOrderRecord,
  ReorderGuideRecord,
  TransferRecord,
  LostGoodsRecord,
  AssemblyRecord,
  AdjustmentRecord
} from './operationsData';
import TransfersView from '@/components/TransfersView';
import PurchaseOrderView from '@/components/PurchaseOrderView';
import ReorderGuideView from '@/components/ReorderGuideView';
import LostGoodsView from '@/components/LostGoodsView';
import ItemAssemblyView from '@/components/ItemAssemblyView';
import AdjustmentsView from '@/components/AdjustmentsView';

interface OperationsActionsViewsProps {
  section: 'purchase_orders' | 'reorder_guide' | 'transfers' | 'lost_goods' | 'item_assembly' | 'adjustments' | string;
}

export default function OperationsActionsViews({ section }: OperationsActionsViewsProps) {
  // If section is purchase_orders, render the authentic full PurchaseOrderView
  if (section === 'purchase_orders') {
    return <PurchaseOrderView />;
  }

  // If section is transfers, render the authentic full TransfersView workstation
  if (section === 'transfers') {
    return <TransfersView />;
  }

  // If section is reorder_guide, render the authentic full ReorderGuideView workstation
  if (section === 'reorder_guide') {
    return <ReorderGuideView />;
  }

  // If section is lost_goods, render the authentic full LostGoodsView workstation
  if (section === 'lost_goods') {
    return <LostGoodsView />;
  }

  // If section is item_assembly, render the authentic full ItemAssemblyView workstation
  if (section === 'item_assembly') {
    return <ItemAssemblyView />;
  }

  // If section is adjustments, render the authentic full AdjustmentsView workstation
  if (section === 'adjustments') {
    return <AdjustmentsView />;
  }

  // State for Action Sections
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>(INITIAL_PURCHASE_ORDERS);
  const [reorderGuide, setReorderGuide] = useState<(ReorderGuideRecord & { selected?: boolean })[]>(
    INITIAL_REORDER_GUIDE.map(r => ({ ...r, selected: false }))
  );
  const [lostGoods, setLostGoods] = useState<LostGoodsRecord[]>(INITIAL_LOST_GOODS);
  const [assemblies, setAssemblies] = useState<AssemblyRecord[]>(INITIAL_ASSEMBLIES);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>(INITIAL_ADJUSTMENTS);

  // Common UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'LBP'>('USD');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [newEntryModalOpen, setNewEntryModalOpen] = useState(false);
  const [multipleProductionMode, setMultipleProductionMode] = useState(false);
  const [lostGoodsMode, setLostGoodsMode] = useState<'INVENTORY' | 'SALES'>('INVENTORY');

  // Currency Formatter
  const currSymbol = activeCurrency === 'USD' ? '$' : 'LBP';
  const exchangeRate = 89500;

  const formatMoney = (usdVal: number) => {
    if (activeCurrency === 'LBP') {
      return (Math.round(usdVal * exchangeRate)).toLocaleString() + ' LBP';
    }
    return '$' + usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // --------------------------------------------------------------------------
  // ADJUSTMENTS SPECIFIC HANDLERS
  // --------------------------------------------------------------------------
  const resetAllQtyZero = () => {
    setAdjustments(adjustments.map(adj => {
      const newVariance = 0 - adj.qoh;
      const unitCost = adj.qoh > 0 ? Math.abs(adj.varianceValueUsd / (adj.variance || 1)) : 10;
      return {
        ...adj,
        newQty: 0,
        variance: newVariance,
        varianceValueUsd: newVariance * unitCost
      };
    }));
    showToast('Reset all counted quantities to 0.');
  };

  const resetVarianceZero = () => {
    setAdjustments(adjustments.map(adj => ({
      ...adj,
      newQty: adj.qoh,
      variance: 0,
      varianceValueUsd: 0
    })));
    showToast('Reset all variances to 0 (Matched with QOH).');
  };

  const handleAdjustCountedQty = (id: string, val: number) => {
    setAdjustments(adjustments.map(adj => {
      if (adj.id === id) {
        const variance = val - adj.qoh;
        const unitCost = adj.qoh > 0 ? Math.abs(adj.varianceValueUsd / (adj.variance || 1)) : 10;
        return {
          ...adj,
          newQty: val,
          variance: variance,
          varianceValueUsd: variance * unitCost
        };
      }
      return adj;
    }));
  };

  // --------------------------------------------------------------------------
  // REORDER GUIDE SPECIFIC HANDLERS
  // --------------------------------------------------------------------------
  const handleToggleSelectAllReorder = (checked: boolean) => {
    setReorderGuide(reorderGuide.map(r => ({ ...r, selected: checked })));
  };

  const handleToggleSelectReorder = (id: string, checked: boolean) => {
    setReorderGuide(reorderGuide.map(r => r.id === id ? { ...r, selected: checked } : r));
  };

  const handleUpdateReorderQty = (id: string, qty: number) => {
    setReorderGuide(reorderGuide.map(r => r.id === id ? { ...r, qtyToOrder: qty } : r));
  };

  const handleCreatePoForSelected = () => {
    const selectedItems = reorderGuide.filter(r => r.selected && r.qtyToOrder > 0);
    if (selectedItems.length === 0) {
      showToast('Please select at least one item with order quantity > 0.');
      return;
    }

    const newPOs: PurchaseOrderRecord[] = selectedItems.map((item, idx) => ({
      id: 'PO-NEW-' + Date.now() + '-' + idx,
      poNo: 'PO-2026-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      supplier: item.supplier,
      contactName: 'Procurement Rep',
      deliveryDue: '2026-09-25',
      branch: 'Beirut Central Distribution Depot',
      code: item.code,
      description: item.description,
      qtyOrdered: item.qtyToOrder,
      qtyReceived: 0,
      unit: item.unit,
      unitPriceUsd: item.costUnitUsd,
      totalUsd: item.qtyToOrder * item.costUnitUsd,
      approvalStatus: 'PENDING_APPROVAL',
      receivingStatus: 'AWAITING'
    }));

    setPurchaseOrders([...newPOs, ...purchaseOrders]);
    setReorderGuide(reorderGuide.map(r => ({ ...r, selected: false })));
    showToast('Created ' + newPOs.length + ' Purchase Order(s) from Reorder Guide!');
  };

  // --------------------------------------------------------------------------
  // PURCHASE ORDERS SPECIFIC HANDLERS
  // --------------------------------------------------------------------------
  const handleConvertPoToInvoice = (po: PurchaseOrderRecord) => {
    setPurchaseOrders(purchaseOrders.map(p => p.id === po.id ? { ...p, receivingStatus: 'COMPLETED' } : p));
    showToast('PO ' + po.poNo + ' marked for Billing / Invoicing!');
  };

  // --------------------------------------------------------------------------
  // FILTERING LOGIC
  // --------------------------------------------------------------------------
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchQuery =
        po.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || po.approvalStatus === filterStatus;
      const matchBranch = filterBranch === 'ALL' || po.branch === filterBranch;
      return matchQuery && matchStatus && matchBranch;
    });
  }, [purchaseOrders, searchQuery, filterStatus, filterBranch]);

  const filteredReorderGuide = useMemo(() => {
    return reorderGuide.filter(rg => {
      const matchQuery =
        rg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rg.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [reorderGuide, searchQuery]);

  const filteredLostGoods = useMemo(() => {
    return lostGoods.filter(lg => {
      const matchQuery =
        lg.entryNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lg.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [lostGoods, searchQuery]);

  const filteredAssemblies = useMemo(() => {
    return assemblies.filter(as => {
      const matchQuery =
        as.assemblyNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        as.finishedDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        as.batchNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [assemblies, searchQuery]);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      const matchQuery =
        adj.adjNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.branch.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [adjustments, searchQuery]);

  // Total Reorder Guide Calculation
  const totalReorderEstimatedUsd = reorderGuide.reduce((sum, r) => sum + ((r.qtyToOrder || 0) * r.costUnitUsd), 0);
  const selectedReorderCount = reorderGuide.filter(r => r.selected).length;

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP CONTROLS & MODULE BAR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {(section as string) === 'reorder_guide' && '📊'}
              {(section as string) === 'lost_goods' && '🗑️'}
              {section === 'item_assembly' && '⚙️'}
              {section === 'adjustments' && '⚖️'}
            </span>
            <h1 className="text-base font-bold text-slate-900">
              {(section as string) === 'reorder_guide' && 'Reorder Guide'}
              {(section as string) === 'lost_goods' && 'Lost Goods & Wastage Tracking'}
              {section === 'item_assembly' && 'Item Assembly & Production'}
              {section === 'adjustments' && 'Inventory Adjustments & Stock Variance'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operations / Actions / {section.replace('_', ' ').toUpperCase()} • Real-Time Stock Control
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Module-Specific Action Controls */}
          {section === 'adjustments' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={resetAllQtyZero}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition"
                title="Reset all Counted QTY to 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Count to 0</span>
              </button>
              <button
                onClick={resetVarianceZero}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg shadow-2xs transition"
                title="Match Counted QTY to QOH"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Reset Variance to 0</span>
              </button>
            </div>
          )}

          {section === 'item_assembly' && (
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={multipleProductionMode}
                onChange={(e) => setMultipleProductionMode(e.target.checked)}
                className="rounded text-primary"
              />
              <span>Multiple Production</span>
            </label>
          )}

          {section === 'lost_goods' && (
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
              <button
                onClick={() => setLostGoodsMode('INVENTORY')}
                className={'px-2.5 py-1.5 transition ' + (lostGoodsMode === 'INVENTORY' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
              >
                Inventory Items
              </button>
              <button
                onClick={() => setLostGoodsMode('SALES')}
                className={'px-2.5 py-1.5 transition ' + (lostGoodsMode === 'SALES' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
              >
                Sales Items
              </button>
            </div>
          )}

          {/* Quick Registry Preview Modal Button */}
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Registry</span>
          </button>

          {/* Currency Switcher */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
            <button
              onClick={() => setActiveCurrency('USD')}
              className={'px-2.5 py-1.5 transition ' + (activeCurrency === 'USD' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
            >
              USD ($)
            </button>
            <button
              onClick={() => setActiveCurrency('LBP')}
              className={'px-2.5 py-1.5 transition ' + (activeCurrency === 'LBP' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
            >
              LBP
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={'Search ' + section.replace('_', ' ') + '...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Filters applied.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 transition"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: REORDER GUIDE TABLE                                        */}
      {/* ===================================================================== */}
      {(section as string) === 'reorder_guide' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => handleToggleSelectAllReorder(e.target.checked)}
                      className="rounded text-primary"
                    />
                  </th>
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">QOH</th>
                  <th className="py-2.5 px-3 text-right">Min</th>
                  <th className="py-2.5 px-3 text-right">Max</th>
                  <th className="py-2.5 px-3 text-right font-black">QTY to Order</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right font-black">Unit Cost ({currSymbol})</th>
                  <th className="py-2.5 px-3 text-right font-black">Subtotal ({currSymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReorderGuide.map((rg) => (
                  <tr key={rg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={!!rg.selected}
                        onChange={(e) => handleToggleSelectReorder(rg.id, e.target.checked)}
                        className="rounded text-primary"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{rg.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rg.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">{rg.qtyOnHand}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{rg.minLevel}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{rg.maxLevel}</td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        value={rg.qtyToOrder}
                        onChange={(e) => handleUpdateReorderQty(rg.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{rg.unit}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{rg.supplier}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatMoney(rg.costUnitUsd)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {formatMoney(rg.qtyToOrder * rg.costUnitUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 font-semibold text-slate-700">
              <span>Selected Items: <strong className="text-slate-900">{selectedReorderCount}</strong></span>
              <span>Total Estimated Reorder: <strong className="text-emerald-700 font-mono text-sm">{formatMoney(totalReorderEstimatedUsd)}</strong></span>
            </div>

            <div>
              <button
                onClick={handleCreatePoForSelected}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition"
              >
                Create PO for Selected Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: LOST GOODS TABLE                                           */}
      {/* ===================================================================== */}
      {section === 'lost_goods' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Entry #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Lost Qty</th>
                  <th className="py-2.5 px-3 text-right font-black">Unit Cost ({currSymbol})</th>
                  <th className="py-2.5 px-3 text-right font-black">Total Cost ({currSymbol})</th>
                  <th className="py-2.5 px-3">Wastage Reason</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLostGoods.map((lg) => (
                  <tr key={lg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-red-700">{lg.entryNo}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{lg.date}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{lg.location}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{lg.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{lg.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-700">{lg.qty} {lg.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatMoney(lg.unitCostUsd)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-red-700">
                      {formatMoney(lg.totalCostUsd)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 text-[10px] font-bold border border-red-200">
                        {lg.reason}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{lg.recordedBy}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => showToast('Printing Wastage Cert for ' + lg.entryNo)}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded"
                        title="Print Wastage Note"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: ITEM ASSEMBLY (PRODUCTION) TABLE                           */}
      {/* ===================================================================== */}
      {section === 'item_assembly' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Assembly #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Finished Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Batch #</th>
                  <th className="py-2.5 px-3 text-right">Produced Qty</th>
                  <th className="py-2.5 px-3">Raw Materials (BOM)</th>
                  <th className="py-2.5 px-3 text-right font-black">Raw Cost ({currSymbol})</th>
                  <th className="py-2.5 px-3 text-right font-black">Overhead ({currSymbol})</th>
                  <th className="py-2.5 px-3 text-right font-black">Total Cost ({currSymbol})</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAssemblies.map((as) => (
                  <tr key={as.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{as.assemblyNo}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{as.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{as.finishedCode}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{as.finishedDescription}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{as.batchNo}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{as.qtyProduced} {as.unit}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {as.rawMaterials.map(rm => rm.itemCode + ' (' + rm.qty + rm.unit + ')').join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatMoney(as.totalRawCostUsd)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatMoney(as.overheadCostUsd)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {formatMoney(as.totalProductionCostUsd)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {as.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 5: ADJUSTMENTS & STOCK VARIANCE TABLE                         */}
      {/* ===================================================================== */}
      {section === 'adjustments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Adj. #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-700">QOH</th>
                  <th className="py-2.5 px-3 text-right font-black text-primary">Counted QTY</th>
                  <th className="py-2.5 px-3 text-right font-black">Variance</th>
                  <th className="py-2.5 px-3 text-right font-black">Variance Value ({currSymbol})</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Auditor</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{adj.adjNo}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{adj.date}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{adj.branch}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{adj.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{adj.itemDescription}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{adj.qoh}</td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        value={adj.newQty}
                        onChange={(e) => handleAdjustCountedQty(adj.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-right bg-white border border-slate-300 rounded font-mono font-bold text-primary focus:outline-none focus:border-primary"
                      />
                    </td>
                    <td className={'py-2.5 px-3 text-right font-mono font-black ' + (
                      adj.variance < 0 ? 'text-red-700' : adj.variance > 0 ? 'text-emerald-700' : 'text-slate-600'
                    )}>
                      {adj.variance > 0 ? '+' + adj.variance : adj.variance} {adj.units}
                    </td>
                    <td className={'py-2.5 px-3 text-right font-mono font-black ' + (
                      adj.varianceValueUsd < 0 ? 'text-red-700' : adj.varianceValueUsd > 0 ? 'text-emerald-700' : 'text-slate-900'
                    )}>
                      {formatMoney(adj.varianceValueUsd)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{adj.reason}</td>
                    <td className="py-2.5 px-3 text-slate-600">{adj.auditor}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => showToast('Posted Adjustment ' + adj.adjNo)}
                        className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold shadow-2xs transition"
                      >
                        Commit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* COMMON PREVIEW REGISTRY MODAL                                         */}
      {/* ===================================================================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-xs">
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Action Section Registry Search: {section.toUpperCase()}</h3>
                <p className="text-slate-300 text-[11px]">Historical records, auditing, and document lookup</p>
              </div>
              <button onClick={() => setPreviewModalOpen(false)} className="p-1 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search registry records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2">Record ID</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Reference / Subject</th>
                    <th className="p-2 text-right">Total ({currSymbol})</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {(section as string) === 'reorder_guide' && filteredReorderGuide.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-blue-700">{r.code}</td>
                      <td className="p-2 text-slate-500 font-mono">Lead: {r.leadTimeDays}d</td>
                      <td className="p-2">{r.description} • {r.supplier}</td>
                      <td className="p-2 text-right font-mono font-bold">{formatMoney(r.qtyToOrder * r.costUnitUsd)}</td>
                      <td className="p-2 text-center font-bold text-emerald-800">Order: {r.qtyToOrder}</td>
                    </tr>
                  ))}
                  {section === 'lost_goods' && filteredLostGoods.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-red-700">{l.entryNo}</td>
                      <td className="p-2 text-slate-500 font-mono">{l.date}</td>
                      <td className="p-2">{l.description} • {l.reason}</td>
                      <td className="p-2 text-right font-mono font-bold text-red-700">{formatMoney(l.totalCostUsd)}</td>
                      <td className="p-2 text-center font-bold text-red-800">{l.reason}</td>
                    </tr>
                  ))}
                  {section === 'item_assembly' && filteredAssemblies.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-emerald-800">{a.assemblyNo}</td>
                      <td className="p-2 text-slate-500 font-mono">{a.date}</td>
                      <td className="p-2">{a.finishedDescription} (Batch: {a.batchNo})</td>
                      <td className="p-2 text-right font-mono font-bold">{formatMoney(a.totalProductionCostUsd)}</td>
                      <td className="p-2 text-center font-bold text-emerald-800">{a.status}</td>
                    </tr>
                  ))}
                  {section === 'adjustments' && filteredAdjustments.map(adj => (
                    <tr key={adj.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-amber-700">{adj.adjNo}</td>
                      <td className="p-2 text-slate-500 font-mono">{adj.date}</td>
                      <td className="p-2">{adj.itemDescription} • {adj.branch}</td>
                      <td className="p-2 text-right font-mono font-bold">{formatMoney(adj.varianceValueUsd)}</td>
                      <td className="p-2 text-center font-bold text-amber-800">{adj.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
