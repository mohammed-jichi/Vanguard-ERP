'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  X,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Barcode as BarcodeIcon,
  RefreshCw,
  Scale,
  Calendar,
  Save,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  OMEGA_INVENTORY_CATEGORIES,
  addInventoryItem,
  AuthenticInventoryItem
} from '@/lib/omegaInventoryCatalog';
import { OMEGA_ITEM_BRANDS, OMEGA_SOURCES } from '@/lib/omegaProductsData';

interface NewInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: AuthenticInventoryItem, andSelectDirectly?: boolean) => void;
  initialCategory?: number;
}

export default function NewInventoryItemModal({
  isOpen,
  onClose,
  onItemCreated,
  initialCategory = 2
}: NewInventoryItemModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'units' | 'pricing' | 'controls'>('general');

  // General tab state
  const [code, setCode] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number>(initialCategory || 2);
  const [division, setDivision] = useState<string>('مقطرات ومدبسات مفرق');
  const [group, setGroup] = useState<string>('صناديق زعتر');
  const [supplier, setSupplier] = useState<string>('المورد الرئيسي (Main Store)');
  const [brand, setBrand] = useState<string>('زيت و زيتون الجنوب');
  const [source, setSource] = useState<string>('Local');
  const [itemType, setItemType] = useState<string>('Inventory Item');

  // Units & conversions state
  const [inventoryUnit, setInventoryUnit] = useState<string>('KG');
  const [buyingUnit, setBuyingUnit] = useState<string>('KG');
  const [usageUnit, setUsageUnit] = useState<string>('KG');
  const [qtyInBuyingFormat, setQtyInBuyingFormat] = useState<number>(1);
  const [qtyInInvFormat, setQtyInInvFormat] = useState<number>(1);

  // Cost & Pricing state
  const [unitCostUsd, setUnitCostUsd] = useState<number>(2.50);
  const [avgCostUsd, setAvgCostUsd] = useState<number>(2.50);
  const [markupPercent, setMarkupPercent] = useState<number>(25);
  const [sp1Usd, setSp1Usd] = useState<number>(3.15); // Retail
  const [sp2Usd, setSp2Usd] = useState<number>(2.90); // Wholesale
  const [sp3Usd, setSp3Usd] = useState<number>(2.75); // Distributor
  const [sp4Usd, setSp4Usd] = useState<number>(2.60); // Export

  // Controls & stock settings state
  const [isDailyAdjust, setIsDailyAdjust] = useState<boolean>(true);
  const [isWeeklyAdjust, setIsWeeklyAdjust] = useState<boolean>(true);
  const [isSalesItem, setIsSalesItem] = useState<boolean>(true);
  const [trackExpiry, setTrackExpiry] = useState<boolean>(false);
  const [trackSerial, setTrackSerial] = useState<boolean>(false);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(365);
  const [initialQoh, setInitialQoh] = useState<number>(0);

  // Errors & feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate barcode
  const handleGenerateBarcode = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setBarcode(`528${randomSuffix}0`);
  };

  // Auto-generate code
  const handleGenerateCode = () => {
    const prefix = categoryId === 5 ? 'RAW' : categoryId === 3 ? 'WS' : 'RET';
    const rand = Math.floor(100 + Math.random() * 900);
    const unitPart = inventoryUnit.toUpperCase();
    setCode(`${prefix}-${unitPart}-${rand}`);
  };

  // Auto-calculate selling prices from markup
  const handleMarkupChange = (markup: number) => {
    setMarkupPercent(markup);
    if (unitCostUsd > 0) {
      const calculated = parseFloat((unitCostUsd * (1 + markup / 100)).toFixed(2));
      setSp1Usd(calculated);
      setSp2Usd(parseFloat((calculated * 0.92).toFixed(2)));
      setSp3Usd(parseFloat((calculated * 0.88).toFixed(2)));
      setSp4Usd(parseFloat((calculated * 0.84).toFixed(2)));
    }
  };

  const handleCostChange = (cost: number) => {
    setUnitCostUsd(cost);
    setAvgCostUsd(cost);
    if (cost > 0 && markupPercent > 0) {
      const calculated = parseFloat((cost * (1 + markupPercent / 100)).toFixed(2));
      setSp1Usd(calculated);
      setSp2Usd(parseFloat((calculated * 0.92).toFixed(2)));
      setSp3Usd(parseFloat((calculated * 0.88).toFixed(2)));
      setSp4Usd(parseFloat((calculated * 0.84).toFixed(2)));
    }
  };

  const validateAndSave = (andSelectDirectly: boolean = false) => {
    setErrorMsg(null);
    const trimmedCode = code.trim();
    const desc = descriptionAr.trim() || descriptionEn.trim();

    if (!trimmedCode) {
      setErrorMsg('Product code is required. Enter a code or click Generate.');
      setActiveTab('general');
      return;
    }

    if (!desc) {
      setErrorMsg('Product description is required (Arabic or English).');
      setActiveTab('general');
      return;
    }

    const catObj = OMEGA_INVENTORY_CATEGORIES.find((c) => c.id === categoryId);
    const generatedBarcode = barcode.trim() || `528${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newItem = addInventoryItem({
      code: trimmedCode.toUpperCase(),
      description: descriptionAr.trim() || descriptionEn.trim(),
      barcode: generatedBarcode,
      qtyOH: Number(initialQoh) || 0,
      unit: inventoryUnit,
      unitCostUsd: Number(unitCostUsd) || 0,
      avgCostUsd: Number(avgCostUsd) || 0,
      categoryId: categoryId,
      categoryName: catObj ? catObj.name : 'مفرق',
      divisionName: division,
      groupName: group,
      sellingPrice1: Number(sp1Usd) || 0,
      sellingPrice2: Number(sp2Usd) || 0,
      sellingPrice3: Number(sp3Usd) || 0,
      sellingPrice4: Number(sp4Usd) || 0,
      buyingFormat: buyingUnit,
      inventoryFormat: inventoryUnit,
      usageFormat: usageUnit,
      qtyInBuyingFormat: Number(qtyInBuyingFormat) || 1,
      qtyInInventoryFormat: Number(qtyInInvFormat) || 1,
      isDailyAdjust,
      isWeeklyAdjust,
      isSalesItem,
      trackExpiry,
      trackSerial
    });

    setSuccessToast(`Item "${newItem.code}" created successfully!`);
    setTimeout(() => {
      onItemCreated(newItem, andSelectDirectly);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden text-slate-800 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            1. HEADER
            ========================================================================= */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#2c3e50] to-[#34495e] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/15 rounded-md">
              <Package className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
                <span>New Inventory Item</span>
                <span className="text-xs font-normal text-slate-300">| صنف مخزني جديد</span>
              </h2>
              <p className="text-[11px] text-slate-300">Omega ERP Setup • Products & Services Registry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* =========================================================================
            2. NAVIGATION TABS
            ========================================================================= */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-[#2c3e50] text-[#2c3e50] bg-white font-bold rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>1. General & Classification</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'units'
                ? 'border-[#2c3e50] text-[#2c3e50] bg-white font-bold rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>2. Units & Formats</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-[#2c3e50] text-[#2c3e50] bg-white font-bold rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Cost & Prices</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'controls'
                ? 'border-[#2c3e50] text-[#2c3e50] bg-white font-bold rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>4. Stock & Settings</span>
          </button>
        </div>

        {/* =========================================================================
            3. TAB CONTENT
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-xs">
          {/* TAB 1: GENERAL & CLASSIFICATION */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Item Code */}
                <div className="md:col-span-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Product Code <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Generate Code
                    </button>
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. ART1KGR, VOO17.5L..."
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>

                {/* Barcode */}
                <div className="md:col-span-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Barcode</label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <BarcodeIcon className="w-3 h-3" /> Auto Barcode
                    </button>
                  </div>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 5280010920088"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Description Arabic */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description (Arabic / Primary) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="مثال: زعتر أحمر حلبي اكسترا، زيت زيتون بكر ممتاز..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description (English / Secondary)
                </label>
                <input
                  type="text"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="e.g. Extra Red Aleppo Thyme 1kg..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Category, Division, Group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {OMEGA_INVENTORY_CATEGORIES.filter((c) => c.id > 0).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division</label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g. مقطرات ومدبسات..."
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Group</label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="e.g. صناديق زعتر..."
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Supplier, Item Brand, Source & Item Type */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Supplier / Vendor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {OMEGA_ITEM_BRANDS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {OMEGA_SOURCES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Inventory Item">Standard Inventory Item</option>
                    <option value="Raw Material">Raw Material (مادة أولية)</option>
                    <option value="Finished Good">Finished Good (منتج نهائي مصنع)</option>
                    <option value="Packaging Material">Packaging & Bottles (تعبئة وتغليف)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNITS & PACKAGING FORMATS */}
          {activeTab === 'units' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px] leading-relaxed">
                Define packaging ratios and unit conversions. For example, if buying format is a Box containing 12 Jars, set Buying Format to <strong>BOX</strong> with <strong>12</strong> units in buying format.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Base / Inventory Unit <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={inventoryUnit}
                    onChange={(e) => setInventoryUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="BOX">BOX (Carton / Crate)</option>
                    <option value="GAL">GAL (Gallon / 16L-17.5L)</option>
                    <option value="JAR">JAR (Glass Jar)</option>
                    <option value="Bottle">Bottle (Glass/Plastic Bottle)</option>
                    <option value="TIN">TIN (Metal Container)</option>
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="Bar">Bar (Soap Bar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Buying Format
                  </label>
                  <select
                    value={buyingUnit}
                    onChange={(e) => setBuyingUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="BOX">BOX (Carton)</option>
                    <option value="GAL">GAL (Gallon)</option>
                    <option value="JAR">JAR (Glass Jar)</option>
                    <option value="Bottle">Bottle</option>
                    <option value="TIN">TIN</option>
                    <option value="PCS">PCS</option>
                    <option value="Bar">Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Usage / Recipe Format
                  </label>
                  <select
                    value={usageUnit}
                    onChange={(e) => setUsageUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="BOX">BOX</option>
                    <option value="GAL">GAL</option>
                    <option value="JAR">JAR</option>
                    <option value="Bottle">Bottle</option>
                    <option value="TIN">TIN</option>
                    <option value="PCS">PCS</option>
                    <option value="Bar">Bar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Units in Buying Format (Pack Size)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={qtyInBuyingFormat}
                    onChange={(e) => setQtyInBuyingFormat(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[11px] text-slate-500">e.g. 1 Box = 12 Jars (enter 12)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Units in Inventory Format
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={qtyInInvFormat}
                    onChange={(e) => setQtyInInvFormat(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[11px] text-slate-500">Stock conversion factor (default: 1)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COST & PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unit Cost ($ USD) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitCostUsd}
                    onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Average Cost ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={avgCostUsd}
                    onChange={(e) => setAvgCostUsd(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Markup (% Profit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={markupPercent}
                    onChange={(e) => handleMarkupChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selling Prices Matrix (USD)</span>
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SP1 (Retail Price)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sp1Usd}
                      onChange={(e) => setSp1Usd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-emerald-300 rounded text-xs font-bold text-emerald-800 bg-emerald-50/30 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SP2 (Wholesale)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sp2Usd}
                      onChange={(e) => setSp2Usd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SP3 (Distributor)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sp3Usd}
                      onChange={(e) => setSp3Usd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">SP4 (Export)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sp4Usd}
                      onChange={(e) => setSp4Usd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLS & SETTINGS */}
          {activeTab === 'controls' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Initial Stock */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Stock on Hand (QOH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialQoh}
                    onChange={(e) => setInitialQoh(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[11px] text-slate-500">Opening balance at main facility</span>
                </div>

                {/* Shelf Life */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Shelf Life (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={shelfLifeDays}
                    onChange={(e) => setShelfLifeDays(parseInt(e.target.value) || 365)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[11px] text-slate-500">Standard expiration window</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-700 mb-2">Inventory System Controls</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDailyAdjust}
                      onChange={(e) => setIsDailyAdjust(e.target.checked)}
                      className="w-4 h-4 text-[#2c3e50] rounded focus:ring-1 focus:ring-slate-400"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Include in Daily Adjustment</span>
                      <p className="text-[10px] text-slate-500">Tracked in daily cycle counts (INCLDAILYADJ)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWeeklyAdjust}
                      onChange={(e) => setIsWeeklyAdjust(e.target.checked)}
                      className="w-4 h-4 text-[#2c3e50] rounded focus:ring-1 focus:ring-slate-400"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Include in Weekly Adjustment</span>
                      <p className="text-[10px] text-slate-500">Tracked in weekly cycle counts (INCLWEEKLADJ)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSalesItem}
                      onChange={(e) => setIsSalesItem(e.target.checked)}
                      className="w-4 h-4 text-[#2c3e50] rounded focus:ring-1 focus:ring-slate-400"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Available as Sales Item</span>
                      <p className="text-[10px] text-slate-500">Visible for POS & sales invoicing</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackExpiry}
                      onChange={(e) => setTrackExpiry(e.target.checked)}
                      className="w-4 h-4 text-[#2c3e50] rounded focus:ring-1 focus:ring-slate-400"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Track Expiry Dates</span>
                      <p className="text-[10px] text-slate-500">Prompt for batch expiration dates</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            4. FOOTER ACTIONS
            ========================================================================= */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => validateAndSave(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Item</span>
            </button>

            <button
              type="button"
              onClick={() => validateAndSave(true)}
              className="px-4 py-2 bg-[#2c3e50] hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Save & Select</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
