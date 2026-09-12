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
  Settings,
  Palette,
  CreditCard,
  DollarSign,
  Truck,
  Layers,
  ArrowUpDown,
  FileText,
  Bookmark,
  ShieldCheck,
  Coins,
  Percent,
  Tag,
  Maximize2
} from 'lucide-react';
import {
  INITIAL_LOST_GOODS_REASONS,
  INITIAL_SIZES_GROUPS,
  INITIAL_SIZES,
  INITIAL_COLORS,
  INITIAL_DISCOUNTS,
  INITIAL_PAYMENT_TYPES,
  INITIAL_CURRENCIES,
  INITIAL_BRANDS,
  INITIAL_SOURCES,
  INITIAL_DELIVERY_PROVIDERS,
  LostGoodsReasonRecord,
  SizeGroupRecord,
  SizeRecord,
  ColorRecord,
  DiscountRecord,
  PaymentTypeRecord,
  CurrencySetupRecord,
  InventoryBrandRecord,
  InventorySourceRecord,
  DeliveryProviderRecord
} from './operationsData';
import OperationsPrimarySetupViews, { PrimarySetupSection } from './OperationsPrimarySetupViews';

interface OperationsSetupViewsProps {
  section:
    | 'quick_setup'
    | 'products_services'
    | 'groups'
    | 'divisions'
    | 'categories'
    | 'units'
    | 'locations'
    | 'suppliers'
    | 'departments'
    | 'lost_goods_reason'
    | 'sizes_groups'
    | 'sizes'
    | 'colors'
    | 'discounts'
    | 'payment_types'
    | 'currency_setup'
    | 'inventory_brands'
    | 'inventory_sources'
    | 'delivery_providers';
}

export default function OperationsSetupViews({ section }: OperationsSetupViewsProps) {
  // Delegate primary setup sections (Quick Setup, Products & Services, Groups, Divisions, Categories, Units, Locations, Suppliers, Departments)
  if (
    section === 'quick_setup' ||
    section === 'products_services' ||
    section === 'groups' ||
    section === 'divisions' ||
    section === 'categories' ||
    section === 'units' ||
    section === 'locations' ||
    section === 'suppliers' ||
    section === 'departments'
  ) {
    return <OperationsPrimarySetupViews section={section as PrimarySetupSection} />;
  }

  // Datasets for 'More' setup sections
  const [lostGoodsReasons, setLostGoodsReasons] = useState<LostGoodsReasonRecord[]>(INITIAL_LOST_GOODS_REASONS);
  const [sizeGroups, setSizeGroups] = useState<SizeGroupRecord[]>(INITIAL_SIZES_GROUPS);
  const [sizes, setSizes] = useState<SizeRecord[]>(INITIAL_SIZES);
  const [colors, setColors] = useState<ColorRecord[]>(INITIAL_COLORS);
  const [discounts, setDiscounts] = useState<DiscountRecord[]>(INITIAL_DISCOUNTS);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeRecord[]>(INITIAL_PAYMENT_TYPES);
  const [currencies, setCurrencies] = useState<CurrencySetupRecord[]>(INITIAL_CURRENCIES);
  const [brands, setBrands] = useState<InventoryBrandRecord[]>(INITIAL_BRANDS);
  const [sources, setSources] = useState<InventorySourceRecord[]>(INITIAL_SOURCES);
  const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProviderRecord[]>(INITIAL_DELIVERY_PROVIDERS);

  // Common UI states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [newReasonForm, setNewReasonForm] = useState({
    reasonId: `LGR-${Math.floor(100 + Math.random() * 900)}`,
    wastageReason: 'Filtration Paper Clog Wash Loss',
    category: 'PRESSING_RESIDUE' as const,
    active: true
  });

  const [newSizeGroupForm, setNewSizeGroupForm] = useState({
    groupId: `SZG-${Math.floor(100 + Math.random() * 900)}`,
    groupName: 'Industrial Silo Drums',
    category: 'Bulk Storage'
  });

  const [newSizeForm, setNewSizeForm] = useState({
    sizeId: `SZ-${Math.floor(100 + Math.random() * 900)}`,
    name: '250ml Dorica Slim Dark Glass',
    groupName: 'Glass Bottles Formats',
    code: '250D'
  });

  const [newColorForm, setNewColorForm] = useState({
    colorId: `COL-${Math.floor(100 + Math.random() * 900)}`,
    colorDescription: 'Antique Olive Leaf Tint',
    hexCode: '#4b5320'
  });

  const [newDiscountForm, setNewDiscountForm] = useState({
    discountId: `DSC-${Math.floor(100 + Math.random() * 900)}`,
    description: 'Boutique Weekend Loyalty Rebate',
    discountPct: 8,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    branch: 'Choueifat POS Store Front & Showroom',
    active: true
  });

  const [newPaymentTypeForm, setNewPaymentTypeForm] = useState({
    paymentTypeId: `PMT-${Math.floor(100 + Math.random() * 900)}`,
    name: 'OMT Smart Pay QR',
    type: 'WHISH_MONEY' as const,
    accountNumber: '1060-OMT-DIGITAL',
    sorting: 6,
    currency: 'USD' as const,
    changeStatus: 'EXACT_ONLY' as const
  });

  const [newCurrencyForm, setNewCurrencyForm] = useState({
    currency: 'EUR',
    symbol: '€',
    rateVsUsd: 1.08,
    decimals: 2,
    isMain: false
  });

  const [newBrandForm, setNewBrandForm] = useState({
    brandId: `BRD-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Cedars Agro Heritage Reserve',
    manufacturer: 'Southern Olive Oil Products S.A.R.L',
    country: 'Lebanon'
  });

  const [newProviderForm, setNewProviderForm] = useState({
    providerId: `DP-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Lebanon Express Logistics S.A.L',
    providerType: '3PL_EXPRESS' as const,
    contactPerson: 'Elie Boulos',
    phone: '+961 1 200 450',
    active: true
  });

  const [newSourceForm, setNewSourceForm] = useState({
    sourceId: `SRC-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Local',
    description: 'Domestic local production and suppliers',
    type: 'LOCAL' as 'LOCAL' | 'MARKETPLACE'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reorder payment types (Move Up / Move Down)
  const handleMovePaymentType = (index: number, direction: 'up' | 'down') => {
    const updated = [...paymentTypes];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    // update sorting indices
    const normalized = updated.map((p, i) => ({ ...p, sorting: i + 1 }));
    setPaymentTypes(normalized);
    showToast(`Payment Type order updated!`);
  };

  const handleExport = () => {
    let data: any = [];
    if (section === 'lost_goods_reason') data = lostGoodsReasons;
    if (section === 'sizes_groups') data = sizeGroups;
    if (section === 'sizes') data = sizes;
    if (section === 'colors') data = colors;
    if (section === 'discounts') data = discounts;
    if (section === 'payment_types') data = paymentTypes;
    if (section === 'currency_setup') data = currencies;
    if (section === 'inventory_brands') data = brands;
    if (section === 'inventory_sources') data = sources;
    if (section === 'delivery_providers') data = deliveryProviders;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanguard_setup_${section}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast(`Exported ${section} configurations!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Title Toolbar */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
            {section === 'lost_goods_reason' && <AlertTriangle className="w-6 h-6" />}
            {section === 'sizes_groups' && <Layers className="w-6 h-6" />}
            {section === 'sizes' && <Maximize2 className="w-6 h-6" />}
            {section === 'colors' && <Palette className="w-6 h-6" />}
            {section === 'discounts' && <Percent className="w-6 h-6" />}
            {section === 'payment_types' && <CreditCard className="w-6 h-6" />}
            {section === 'currency_setup' && <Coins className="w-6 h-6" />}
            {section === 'inventory_brands' && <Bookmark className="w-6 h-6" />}
            {section === 'inventory_sources' && <Layers className="w-6 h-6" />}
            {section === 'delivery_providers' && <Truck className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 capitalize">
              {section === 'lost_goods_reason' && 'Lost Goods & Wastage Reasons'}
              {section === 'sizes_groups' && 'Sizes Groups Management'}
              {section === 'sizes' && 'Sizes & Formats Catalog'}
              {section === 'colors' && 'Inventory Colors Palette'}
              {section === 'discounts' && 'Commercial Discounts Setup'}
              {section === 'payment_types' && 'Payment Types & Cash Registers'}
              {section === 'currency_setup' && 'Multi-Currency & FX Exchange Setup'}
              {section === 'inventory_brands' && 'Inventory Brands Registry'}
              {section === 'inventory_sources' && 'All Sources & Channels Registry'}
              {section === 'delivery_providers' && 'Delivery Providers & Aggregators'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Omega ERP System Setup & Operations Matrix • Southern Olive Oil Products S.A.R.L
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {section === 'lost_goods_reason' && (
            <button
              onClick={() => setActiveModal('new_reason')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Reason</span>
            </button>
          )}

          {section === 'sizes_groups' && (
            <button
              onClick={() => setActiveModal('new_size_group')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Size Group</span>
            </button>
          )}

          {section === 'sizes' && (
            <button
              onClick={() => setActiveModal('new_size')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Size</span>
            </button>
          )}

          {section === 'colors' && (
            <button
              onClick={() => setActiveModal('new_color')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Color</span>
            </button>
          )}

          {section === 'discounts' && (
            <button
              onClick={() => setActiveModal('new_discount')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Discount</span>
            </button>
          )}

          {section === 'payment_types' && (
            <>
              <button
                onClick={() => setActiveModal('new_payment_type')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Payment Type</span>
              </button>
              <button
                onClick={() => setActiveModal('sorting_modal')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-sm font-semibold transition"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Sorting Order</span>
              </button>
              <button
                onClick={() => setActiveModal('ledger_preview')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-sm font-semibold transition"
              >
                <FileText className="w-4 h-4" />
                <span>Payment Bills / Ledger</span>
              </button>
            </>
          )}

          {section === 'currency_setup' && (
            <button
              onClick={() => setActiveModal('new_currency')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Currency</span>
            </button>
          )}

          {section === 'inventory_brands' && (
            <button
              onClick={() => setActiveModal('new_brand')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Brand</span>
            </button>
          )}

          {section === 'inventory_sources' && (
            <button
              onClick={() => setActiveModal('new_source')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Source</span>
            </button>
          )}

          {section === 'delivery_providers' && (
            <button
              onClick={() => setActiveModal('new_provider')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Provider</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300 pl-3">
            <button
              onClick={handleExport}
              title="Export JSON"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              title="Print Table"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search within setup table records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#195a96] transition"
          />
        </div>
        {section === 'sizes' && (
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800"
          >
            <option value="All">All Size Groups</option>
            {sizeGroups.map((g) => (
              <option key={g.id} value={g.groupName}>
                {g.groupName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: LOST GOODS REASON
          ========================================================================= */}
      {section === 'lost_goods_reason' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Reason ID</th>
                  <th className="px-4 py-3.5">Wastage / Loss Reason</th>
                  <th className="px-4 py-3.5">Category Classification</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {lostGoodsReasons.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{r.reasonId}</td>
                    <td className="px-4 py-3 font-sans text-slate-800 font-semibold">
                      {r.wastageReason}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-500 text-xs">{r.category}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Edited parameters for ${r.reasonId}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SIZES GROUPS
          ========================================================================= */}
      {section === 'sizes_groups' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Group ID</th>
                  <th className="px-4 py-3.5">Group Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Active Formats Count</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {sizeGroups.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{g.groupId}</td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-100">{g.groupName}</td>
                    <td className="px-4 py-3 font-sans text-slate-500 text-xs">{g.category}</td>
                    <td className="px-4 py-3 text-center text-amber-400 font-bold">
                      {sizes.filter((s) => s.groupName === g.groupName).length} Formats
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Edited group ${g.groupName}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SIZES
          ========================================================================= */}
      {section === 'sizes' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Size ID</th>
                  <th className="px-4 py-3.5">Size Name / Description</th>
                  <th className="px-4 py-3.5">Belongs to Group</th>
                  <th className="px-4 py-3.5 text-center">Format Code</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {sizes
                  .filter((s) => filterGroup === 'All' || s.groupName === filterGroup)
                  .map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-cyan-400">{s.sizeId}</td>
                      <td className="px-4 py-3 font-sans font-bold text-slate-100">{s.name}</td>
                      <td className="px-4 py-3 font-sans text-slate-700 text-xs">{s.groupName}</td>
                      <td className="px-4 py-3 text-center text-amber-400 font-bold">{s.code}</td>
                      <td className="px-4 py-3 text-right font-sans">
                        <button
                          onClick={() => showToast(`Edited size ${s.name}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: COLORS
          ========================================================================= */}
      {section === 'colors' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Color ID</th>
                  <th className="px-4 py-3.5">Color Description</th>
                  <th className="px-4 py-3.5">Hex Code</th>
                  <th className="px-4 py-3.5 text-center">Swatch Visual</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {colors.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{c.colorId}</td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-100">
                      {c.colorDescription}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{c.hexCode}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full border border-slate-600 shadow-md"
                          style={{ backgroundColor: c.hexCode }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Edited color ${c.colorDescription}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: DISCOUNTS
          ========================================================================= */}
      {section === 'discounts' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Discount ID</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5 text-center">Discount %</th>
                  <th className="px-4 py-3.5">Valid Dates</th>
                  <th className="px-4 py-3.5">Branch</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {discounts.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{d.discountId}</td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-100">
                      {d.description}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-400">
                      {d.discountPct}%
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-500 text-xs">
                      {d.startDate} ~ {d.endDate}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700 text-xs">{d.branch}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Edited discount ${d.discountId}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: PAYMENT TYPES (DRAG & DROP / SORTING / BILLS PREVIEW)
          ========================================================================= */}
      {section === 'payment_types' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-center">Sorting</th>
                  <th className="px-4 py-3.5">Payment Type ID</th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Account Number</th>
                  <th className="px-4 py-3.5 text-center">Currency</th>
                  <th className="px-4 py-3.5 text-center">Change Status</th>
                  <th className="px-4 py-3.5 text-right">Actions / Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {paymentTypes.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-center text-amber-400 font-bold">#{p.sorting}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{p.paymentTypeId}</td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-100">{p.name}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{p.accountNumber}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{p.currency}</td>
                    <td className="px-4 py-3 text-center font-sans text-xs">
                      {p.changeStatus === 'ALLOWED' ? (
                        <span className="text-emerald-400 font-semibold">Change Allowed</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Exact Only</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMovePaymentType(idx, 'up')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-30 text-slate-700 text-xs cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === paymentTypes.length - 1}
                          onClick={() => handleMovePaymentType(idx, 'down')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-30 text-slate-700 text-xs cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 7: CURRENCY SETUP
          ========================================================================= */}
      {section === 'currency_setup' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Currency Code</th>
                  <th className="px-4 py-3.5 text-center">Symbol</th>
                  <th className="px-4 py-3.5 text-right">Exchange Rate vs USD</th>
                  <th className="px-4 py-3.5 text-center">Decimals</th>
                  <th className="px-4 py-3.5 text-center">Main Currency</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {currencies.map((curr) => (
                  <tr key={curr.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-cyan-400 text-sm">{curr.currency}</td>
                    <td className="px-4 py-3 text-center text-lg font-bold text-slate-100 font-sans">
                      {curr.symbol}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400 text-sm">
                      {curr.rateVsUsd.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">{curr.decimals}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      {curr.isMain ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Base Functional
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/50 text-slate-500">
                          Secondary
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Synchronized rates for ${curr.currency}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Sync Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 8: INVENTORY BRANDS
          ========================================================================= */}
      {section === 'inventory_brands' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Brand ID</th>
                  <th className="px-4 py-3.5">Brand Name</th>
                  <th className="px-4 py-3.5">Manufacturer</th>
                  <th className="px-4 py-3.5">Origin Country</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {brands.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{b.brandId}</td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-100">{b.name}</td>
                    <td className="px-4 py-3 font-sans text-slate-700 text-xs">{b.manufacturer}</td>
                    <td className="px-4 py-3 font-sans text-slate-500 text-xs">{b.country}</td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Edited brand ${b.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 8B: INVENTORY SOURCES (ALL SOURCES / LOCAL / VANGUARD MARKET PLACE)
          ========================================================================= */}
      {section === 'inventory_sources' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Source ID</th>
                  <th className="px-4 py-3.5">Source Name</th>
                  <th className="px-4 py-3.5">Channel / Integration Classification</th>
                  <th className="px-4 py-3.5">Description / Scope</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {sources.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-600">{s.sourceId}</td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        s.type === 'LOCAL'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}>
                        {s.type === 'LOCAL' ? 'Domestic Supply Origin' : 'Vanguard B2B Exchange Platform'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 text-xs">{s.description}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Channel
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Configured source profile for ${s.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 9: DELIVERY PROVIDERS
          ========================================================================= */}
      {section === 'delivery_providers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Provider ID</th>
                  <th className="px-4 py-3.5">Provider Name</th>
                  <th className="px-4 py-3.5">Service Classification</th>
                  <th className="px-4 py-3.5">Contact Person</th>
                  <th className="px-4 py-3.5">Phone Number</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {deliveryProviders.map((dp, idx) => (
                  <tr key={dp.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-cyan-400">{dp.providerId}</td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-100">{dp.name}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {dp.providerType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700 text-xs">{dp.contactPerson}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{dp.phone}</td>
                    <td className="px-4 py-3 text-center font-sans">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Active Carrier
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => showToast(`Edited carrier profile for ${dp.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: NEW WASTAGE REASON
          ========================================================================= */}
      {activeModal === 'new_reason' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <span>Add Wastage Reason</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setLostGoodsReasons([
                  ...lostGoodsReasons,
                  {
                    id: `LGR-${Date.now().toString().slice(-4)}`,
                    reasonId: newReasonForm.reasonId,
                    wastageReason: newReasonForm.wastageReason,
                    category: newReasonForm.category,
                    active: true
                  }
                ]);
                setActiveModal(null);
                showToast(`Wastage Reason "${newReasonForm.wastageReason}" added!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason Description
                </label>
                <input
                  type="text"
                  required
                  value={newReasonForm.wastageReason}
                  onChange={(e) =>
                    setNewReasonForm({ ...newReasonForm, wastageReason: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newReasonForm.category}
                  onChange={(e) =>
                    setNewReasonForm({ ...newReasonForm, category: e.target.value as any })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                >
                  <option value="PRESSING_RESIDUE">Pressing Residue</option>
                  <option value="BOTTLE_BREAKAGE">Bottle Breakage</option>
                  <option value="SEAL_LEAK">Seal Leakage</option>
                  <option value="EXPIRED_SAMPLE">Expired Laboratory Sample</option>
                  <option value="GROVE_ROT">Grove Rot / Spoiled Fruit</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  Save Reason
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: NEW SIZES GROUP
          ========================================================================= */}
      {activeModal === 'new_size_group' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Layers className="w-5 h-5" />
                <span>Add Sizes Group</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSizeGroups([
                  ...sizeGroups,
                  {
                    id: `SZG-${Date.now().toString().slice(-4)}`,
                    groupId: newSizeGroupForm.groupId,
                    groupName: newSizeGroupForm.groupName,
                    category: newSizeGroupForm.category
                  }
                ]);
                setActiveModal(null);
                showToast(`Sizes Group "${newSizeGroupForm.groupName}" added!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={newSizeGroupForm.groupName}
                  onChange={(e) =>
                    setNewSizeGroupForm({ ...newSizeGroupForm, groupName: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Classification
                </label>
                <input
                  type="text"
                  required
                  value={newSizeGroupForm.category}
                  onChange={(e) =>
                    setNewSizeGroupForm({ ...newSizeGroupForm, category: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NEW SIZE
          ========================================================================= */}
      {activeModal === 'new_size' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Maximize2 className="w-5 h-5" />
                <span>Add Format / Size</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSizes([
                  ...sizes,
                  {
                    id: `SZ-${Date.now().toString().slice(-4)}`,
                    sizeId: newSizeForm.sizeId,
                    name: newSizeForm.name,
                    groupName: newSizeForm.groupName,
                    code: newSizeForm.code
                  }
                ]);
                setActiveModal(null);
                showToast(`Size "${newSizeForm.name}" added!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format / Size Name
                </label>
                <input
                  type="text"
                  required
                  value={newSizeForm.name}
                  onChange={(e) => setNewSizeForm({ ...newSizeForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Belongs to Group
                </label>
                <select
                  value={newSizeForm.groupName}
                  onChange={(e) => setNewSizeForm({ ...newSizeForm, groupName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                >
                  {sizeGroups.map((g) => (
                    <option key={g.id} value={g.groupName}>
                      {g.groupName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format Short Code
                </label>
                <input
                  type="text"
                  required
                  value={newSizeForm.code}
                  onChange={(e) => setNewSizeForm({ ...newSizeForm, code: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96] font-mono uppercase"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  Save Size
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NEW COLOR
          ========================================================================= */}
      {activeModal === 'new_color' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Palette className="w-5 h-5" />
                <span>Add Inventory Color</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setColors([
                  ...colors,
                  {
                    id: `COL-${Date.now().toString().slice(-4)}`,
                    colorId: newColorForm.colorId,
                    colorDescription: newColorForm.colorDescription,
                    hexCode: newColorForm.hexCode
                  }
                ]);
                setActiveModal(null);
                showToast(`Color "${newColorForm.colorDescription}" added!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color Description
                </label>
                <input
                  type="text"
                  required
                  value={newColorForm.colorDescription}
                  onChange={(e) =>
                    setNewColorForm({ ...newColorForm, colorDescription: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color Picker & Hex Code
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorForm.hexCode}
                    onChange={(e) =>
                      setNewColorForm({ ...newColorForm, hexCode: e.target.value })
                    }
                    className="w-12 h-10 rounded-xl bg-white border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={newColorForm.hexCode}
                    onChange={(e) =>
                      setNewColorForm({ ...newColorForm, hexCode: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96] font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  Save Color
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: NEW PAYMENT TYPE
          ========================================================================= */}
      {activeModal === 'new_payment_type' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <CreditCard className="w-5 h-5" />
                <span>Add Payment Type</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPaymentTypes([
                  ...paymentTypes,
                  {
                    id: `PMT-${Date.now().toString().slice(-4)}`,
                    paymentTypeId: newPaymentTypeForm.paymentTypeId,
                    name: newPaymentTypeForm.name,
                    type: newPaymentTypeForm.type,
                    accountNumber: newPaymentTypeForm.accountNumber,
                    sorting: paymentTypes.length + 1,
                    currency: newPaymentTypeForm.currency,
                    changeStatus: newPaymentTypeForm.changeStatus
                  }
                ]);
                setActiveModal(null);
                showToast(`Payment Type "${newPaymentTypeForm.name}" created!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Name
                </label>
                <input
                  type="text"
                  required
                  value={newPaymentTypeForm.name}
                  onChange={(e) =>
                    setNewPaymentTypeForm({ ...newPaymentTypeForm, name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newPaymentTypeForm.type}
                    onChange={(e) =>
                      setNewPaymentTypeForm({
                        ...newPaymentTypeForm,
                        type: e.target.value as any
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="WHISH_MONEY">Whish Money</option>
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="CHECK">Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={newPaymentTypeForm.currency}
                    onChange={(e) =>
                      setNewPaymentTypeForm({
                        ...newPaymentTypeForm,
                        currency: e.target.value as any
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="LBP">LBP (L.L.)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GL Account Number
                </label>
                <input
                  type="text"
                  required
                  value={newPaymentTypeForm.accountNumber}
                  onChange={(e) =>
                    setNewPaymentTypeForm({
                      ...newPaymentTypeForm,
                      accountNumber: e.target.value
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Policy
                </label>
                <select
                  value={newPaymentTypeForm.changeStatus}
                  onChange={(e) =>
                    setNewPaymentTypeForm({
                      ...newPaymentTypeForm,
                      changeStatus: e.target.value as any
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                >
                  <option value="ALLOWED">Change Allowed (Cash drawers)</option>
                  <option value="EXACT_ONLY">Exact Payment Only (Cards/Wallets)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  Save Payment Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: PAYMENT BILLS / LEDGER PREVIEW (AUTHENTIC OMEGA FEATURE)
          ========================================================================= */}
      {activeModal === 'ledger_preview' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <FileText className="w-5 h-5" />
                <span>Payment Bills General Ledger Preview (Omega ERP Authentic View)</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#3e3e3e] text-xs uppercase font-bold text-white border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Date Of JV</th>
                      <th className="px-3 py-2">Account Name</th>
                      <th className="px-3 py-2">Reference</th>
                      <th className="px-3 py-2 text-right">Debit ($)</th>
                      <th className="px-3 py-2 text-right">Credit ($)</th>
                      <th className="px-3 py-2 text-right">Amount (LBP)</th>
                      <th className="px-3 py-2">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="px-3 py-2">2026-09-06</td>
                      <td className="px-3 py-2 font-semibold text-slate-100">1010-CASH-USD</td>
                      <td className="px-3 py-2 text-amber-400">INV-2026-901</td>
                      <td className="px-3 py-2 text-right text-emerald-400">$3,240.00</td>
                      <td className="px-3 py-2 text-right text-slate-500">$0.00</td>
                      <td className="px-3 py-2 text-right">289,980,000</td>
                      <td className="px-3 py-2">Retail POS</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">2026-09-06</td>
                      <td className="px-3 py-2 font-semibold text-slate-100">1050-WHISH-FIN</td>
                      <td className="px-3 py-2 text-amber-400">INV-2026-903</td>
                      <td className="px-3 py-2 text-right text-emerald-400">$980.00</td>
                      <td className="px-3 py-2 text-right text-slate-500">$0.00</td>
                      <td className="px-3 py-2 text-right">87,710,000</td>
                      <td className="px-3 py-2">Retail POS</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setActiveModal(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ledger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: NEW SOURCE
          ========================================================================= */}
      {activeModal === 'new_source' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full text-slate-800 shadow-2xl max-w-md rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-600 font-bold">
                <Layers className="w-5 h-5" />
                <span>Add Inventory Source</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSources([
                  ...sources,
                  {
                    id: `SRC-${Date.now().toString().slice(-4)}`,
                    sourceId: newSourceForm.sourceId,
                    name: newSourceForm.name,
                    description: newSourceForm.description,
                    type: newSourceForm.type
                  }
                ]);
                setActiveModal(null);
                showToast(`Source "${newSourceForm.name}" added successfully!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  value={newSourceForm.name}
                  onChange={(e) => setNewSourceForm({ ...newSourceForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                  placeholder="e.g. Local or Vanguard Market place"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classification / Channel Type
                </label>
                <select
                  value={newSourceForm.type}
                  onChange={(e) =>
                    setNewSourceForm({ ...newSourceForm, type: e.target.value as 'LOCAL' | 'MARKETPLACE' })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                >
                  <option value="LOCAL">Direct Domestic Supply (Local)</option>
                  <option value="MARKETPLACE">Vanguard B2B Marketplace & Exchange</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Channel Scope
                </label>
                <textarea
                  rows={3}
                  value={newSourceForm.description}
                  onChange={(e) => setNewSourceForm({ ...newSourceForm, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#195a96]"
                  placeholder="Operational details for this source..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
                >
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
