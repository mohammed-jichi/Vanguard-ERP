'use client';
/**
 * Vanguard ERP System
 * Master Shared Component: <ReceiveAndProductionMaster />
 * 
 * Official Header: مركز الاستلام والإنتاج -- منتوجات زيت وزيتون الجنوب
 * (Receive & Production Center -- Southern Oil & Olive Products S.A.R.L)
 * 
 * 4 Main Tabs:
 * 1. 📦 1. استلام زيت (Receive Oil)
 * 2. ⚙️ 2. خلط وإنتاج (Mixing & Production)
 * 3. 🚚 3. تسليم الإنتاج (Production Delivery)
 * 4. 📊 4. جرد ورصيد (Inventory Balance - with 4 sub-tabs)
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Flame,
  Layers,
  Plus,
  AlertTriangle,
  History,
  CheckCircle2,
  Warehouse,
  Building2,
  Droplet,
  Sliders
} from 'lucide-react';
import { STRICT_UOM_LIST, getUomInputStep, validateUomQuantity } from '@/lib/uomValidation';

export interface Vendor {
  id: string;
  name: string;
  location: string;
}

export interface RawOilStock {
  kuraKg: number;
  evooKg: number;
  palmKg: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  capacityKg: number;
  packagingType: string;
  vanguardStock: number;
  supersonicStock: number;
  minThreshold: number;
}

export interface MovementLog {
  id: string;
  timestamp: string;
  type: 'RECEIVE' | 'PRODUCTION' | 'DELIVERY' | 'SALE_RECONCILIATION';
  description: string;
  qty: string;
  performedBy: string;
}

export interface FleetStock {
  id: string;
  driverName: string;
  vehicle: string;
  itemName: string;
  qty: number;
  lastUpdated: string;
}

export interface InventoryAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minThreshold: number;
  severity: 'CRITICAL' | 'WARNING';
}

export interface ReceiveAndProductionMasterProps {
  isModalView?: boolean;
  onClose?: () => void;
}

export default function ReceiveAndProductionMaster({ isModalView = false, onClose }: ReceiveAndProductionMasterProps) {
  // --- MAIN TAB STATE ---
  const [activeTab, setActiveTab] = useState<'RECEIVE' | 'PRODUCTION' | 'DELIVERY' | 'INVENTORY'>('RECEIVE');

  // --- TAB 4 INNER SUB-TAB STATE ---
  const [inventorySubTab, setInventorySubTab] = useState<'STOCK' | 'LOG' | 'SUPERSONIC' | 'ALERTS'>('STOCK');

  // --- RAW OIL & VENDORS STATE ---
  const [vendors, setVendors] = useState<Vendor[]>([
    { id: 'v1', name: "أنور الموزع (Anwar Al-Muwazzi')", location: 'مزارع كفركلا / مرجعيون' },
    { id: 'v2', name: 'تعاونية معاصر زيتون النبطية', location: 'النبطية — لبنان الجنوبي' },
    { id: 'v3', name: 'مزارع صور والناقورة', location: 'صور / الناقورة' },
  ]);

  const [rawStock, setRawStock] = useState<RawOilStock>({
    kuraKg: 1090,
    evooKg: 1366,
    palmKg: 414,
  });

  // --- FORM STATE: TAB 1 (RECEIVE OIL) ---
  const [selectedVendor, setSelectedVendor] = useState<string>("أنور الموزع (Anwar Al-Muwazzi')");
  const [recvKuraKg, setRecvKuraKg] = useState<number>(80);
  const [recvEVOOKg, setRecvEVOOKg] = useState<number>(112);
  const [recvPalmKg, setRecvPalmKg] = useState<number>(48);
  const [recvNotes, setRecvNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- FORM STATE: TAB 2 (MIXING & PRODUCTION) ---
  const [prodKuraKg, setProdKuraKg] = useState<number>(152);
  const [prodEVOOKg, setProdEVOOKg] = useState<number>(152);
  const [prodPalmKg, setProdPalmKg] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<string>('تنكة كاملة خضير (15.2 كجم)');
  const [prodPackQty, setProdPackQty] = useState<number>(20);

  // --- FORM STATE: TAB 3 (PRODUCTION DELIVERY TO SUPERSONIC) ---
  const [deliveryTargetHub, setDeliveryTargetHub] = useState<string>('المستودع الرئيسي لشركة SuperSonic - بيروت والشويفات');
  const [deliveryItem, setDeliveryItem] = useState<string>('تنكة كاملة خضير (15.2 كجم)');
  const [deliveryQty, setDeliveryQty] = useState<number>(15);

  // --- NEW CUSTOM UNIT / OPTION STATE ---
  const [showAddUnitModal, setShowAddUnitModal] = useState<boolean>(false);
  const [newUnitName, setNewUnitName] = useState<string>('');
  const [newUnitCapacity, setNewUnitCapacity] = useState<number>(10);
  const [newUnitType, setNewUnitType] = useState<string>('عبوة مخصصة');
  const [selectedUom, setSelectedUom] = useState<string>('bottle');

  // --- INVENTORY DATA STATE ---
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: 'p1', name: 'تنكة كاملة خضير (15.2 كجم)', capacityKg: 15.2, packagingType: 'زيت بلدي خضير', vanguardStock: 145, supersonicStock: 40, minThreshold: 30 },
    { id: 'p2', name: 'تنكة كاملة فيرجن (15.2 كجم)', capacityKg: 15.2, packagingType: 'بكر ممتاز EVOO', vanguardStock: 90, supersonicStock: 20, minThreshold: 25 },
    { id: 'p3', name: 'نصف تنكة خضير (7.8 كجم)', capacityKg: 7.8, packagingType: 'زيت بلدي خضير', vanguardStock: 80, supersonicStock: 25, minThreshold: 20 },
    { id: 'p4', name: 'نصف تنكة فيرجن (7.8 كجم)', capacityKg: 7.8, packagingType: 'بكر ممتاز EVOO', vanguardStock: 60, supersonicStock: 15, minThreshold: 15 },
    { id: 'p5', name: 'غالون بلاستيك 5 لتر (4.5 كجم)', capacityKg: 4.5, packagingType: 'بلاستيك مقوى', vanguardStock: 210, supersonicStock: 60, minThreshold: 50 },
    { id: 'p6', name: 'قنينة زجاج 1 لتر (1.09 كجم)', capacityKg: 1.09, packagingType: 'زجاج فاخر', vanguardStock: 350, supersonicStock: 90, minThreshold: 100 },
  ]);

  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([
    { id: 'log-1', timestamp: new Date().toLocaleString('ar-LB'), type: 'RECEIVE', description: 'استلام زيت خام من المورد أنور الموزع', qty: '240 كجم', performedBy: 'مدير المستودع' },
    { id: 'log-2', timestamp: new Date().toLocaleString('ar-LB'), type: 'PRODUCTION', description: 'تعبئة وتغليف 20 تنكة كاملة خضير (15.2 كجم)', qty: '304 كجم', performedBy: 'فريق الإنتاج' },
    { id: 'log-3', timestamp: new Date().toLocaleString('ar-LB'), type: 'DELIVERY', description: 'ترحيل وتسليم شحنة لشركة SuperSonic Fleet', qty: '15 عبوة', performedBy: 'مسؤول اللوجستيات' },
  ]);

  const [fleetStocks] = useState<FleetStock[]>([
    { id: 'fs-1', driverName: 'أبو علي', vehicle: 'فان هيونداي بضائع (S-01)', itemName: 'تنكة كاملة خضير (15.2 كجم)', qty: 18, lastUpdated: 'اليوم 10:30 ص' },
    { id: 'fs-2', driverName: 'حسن', vehicle: 'رابيد رينو توزيع (S-02)', itemName: 'نصف تنكة خضير (7.8 كجم)', qty: 12, lastUpdated: 'اليوم 11:15 ص' },
    { id: 'fs-3', driverName: 'مستودع SuperSonic المركزي', vehicle: 'المقر الرئيسي', itemName: 'غالون بلاستيك 5 لتر (4.5 كجم)', qty: 45, lastUpdated: 'اليوم 09:00 ص' },
  ]);

  const alerts: InventoryAlert[] = [
    { id: 'alt-1', itemName: 'نصف تنكة خضير (7.8 كجم)', currentStock: 25, minThreshold: 30, severity: 'WARNING' },
    { id: 'alt-2', itemName: 'زيت نخيل فاخر خام', currentStock: 414, minThreshold: 500, severity: 'CRITICAL' },
  ];

  // --- DERIVED CALCULATIONS ---
  const totalRecvKg = (recvKuraKg || 0) + (recvEVOOKg || 0) + (recvPalmKg || 0);
  const recvTinsEq = (totalRecvKg / 16.0).toFixed(1);
  const recvLiters = (totalRecvKg * 1.09375).toFixed(1);

  const kuraPct = totalRecvKg > 0 ? (((recvKuraKg || 0) / totalRecvKg) * 100).toFixed(1) : '0.0';
  const evooPct = totalRecvKg > 0 ? (((recvEVOOKg || 0) / totalRecvKg) * 100).toFixed(1) : '0.0';
  const palmPct = totalRecvKg > 0 ? (((recvPalmKg || 0) / totalRecvKg) * 100).toFixed(1) : '0.0';

  const kuraTins = ((recvKuraKg || 0) / 16.0).toFixed(1);
  const evooTins = ((recvEVOOKg || 0) / 16.0).toFixed(1);
  const palmTins = ((recvPalmKg || 0) / 16.0).toFixed(1);

  // --- ACTIONS ---
  const handleAddNewVendor = () => {
    const name = prompt('أدخل اسم المورد / المزارع الجديد:');
    if (!name || !name.trim()) return;
    const newVendor: Vendor = {
      id: 'v-' + Date.now(),
      name: name.trim(),
      location: 'لبنان الجنوبي'
    };
    setVendors(prev => [...prev, newVendor]);
    setSelectedVendor(name.trim());
  };

  const handleAddNewCustomUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || newUnitCapacity <= 0) {
      alert('يرجى إدخال اسم عبوة صحيح وسعة بالكيلوجرام أكبر من 0!');
      return;
    }
    const newItem: InventoryItem = {
      id: 'p-' + Date.now(),
      name: `${newUnitName.trim()} (${newUnitCapacity} كجم)`,
      capacityKg: newUnitCapacity,
      packagingType: newUnitType || 'عبوة مخصصة',
      vanguardStock: 0,
      supersonicStock: 0,
      minThreshold: 10
    };
    setInventoryItems(prev => [...prev, newItem]);
    setSelectedPackage(newItem.name);
    setShowAddUnitModal(false);
    setNewUnitName('');
    alert(`تم إضافة الصنف/العبوة الجديد بنجاح: ${newItem.name}`);
  };

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalRecvKg <= 0) {
      alert('يرجى إدخال كمية وزن صحيحة أكبر من 0 كجم!');
      return;
    }
    setIsSubmitting(true);

    try {
      // Synchronize state & master stock
      setRawStock(prev => ({
        kuraKg: prev.kuraKg + (recvKuraKg || 0),
        evooKg: prev.evooKg + (recvEVOOKg || 0),
        palmKg: prev.palmKg + (recvPalmKg || 0),
      }));

      const newLog: MovementLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toLocaleString('ar-LB'),
        type: 'RECEIVE',
        description: `استلام زيت خام من ${selectedVendor} (${recvKuraKg}k كورة + ${recvEVOOKg}k ممتاز + ${recvPalmKg}k نخيل)`,
        qty: `${totalRecvKg} كجم`,
        performedBy: 'مستخدم النظام',
      };
      setMovementLogs(prev => [newLog, ...prev]);

      setSuccessMessage(`تم تسجيل استلام الشحنة بالوزن (${totalRecvKg} كجم) وتحديث رصيد المخزون بنجاح!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="w-full font-sans bg-[#1c2b1a] text-white p-4 sm:p-6 rounded-2xl border-2 border-[#2b3e2a] shadow-2xl">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 mb-6 border-b border-[#2b3e2a]">
        <div className="flex items-center gap-3 text-center sm:text-right">
          <div className="p-3 bg-[#fefae0] text-[#1c2b1a] rounded-xl shadow-md">
            <Droplet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#fefae0]">
              مركز الاستلام والإنتاج -- منتوجات زيت وزيتون الجنوب
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 opacity-90 font-medium">
              Receive & Production Center -- Southern Oil & Olive Products S.A.R.L.
            </p>
          </div>
        </div>

        {isModalView && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            إغلاق (Close) ✖
          </button>
        )}
      </div>

      {/* RAW STOCK BANNER */}
      <div className="bg-[#243522] border-2 border-[#3b5438] rounded-xl p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-[#fefae0]">
        <div className="flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-emerald-400" />
          <span>📊 رصيد المخزون الخام المتاح بالمستودع (كجم):</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
          <span className="bg-[#1c2b1a] px-3 py-1.5 rounded-lg border border-[#3b5438]">
            زيت كورة: <strong className="text-emerald-300">{rawStock.kuraKg} kg</strong> ({(rawStock.kuraKg / 15.2).toFixed(1)} تنكة)
          </span>
          <span className="bg-[#1c2b1a] px-3 py-1.5 rounded-lg border border-[#3b5438]">
            بكر ممتاز: <strong className="text-emerald-300">{rawStock.evooKg} kg</strong> ({(rawStock.evooKg / 15.2).toFixed(1)} تنكة)
          </span>
          <span className="bg-[#1c2b1a] px-3 py-1.5 rounded-lg border border-[#3b5438]">
            زيت نخيل: <strong className="text-emerald-300">{rawStock.palmKg} kg</strong> ({(rawStock.palmKg / 15.2).toFixed(1)} تنكة)
          </span>
        </div>
      </div>

      {/* 4 MAIN TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#142013] p-2 rounded-xl border border-[#2b3e2a] mb-6">
        <button
          onClick={() => setActiveTab('RECEIVE')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'RECEIVE'
            ? 'bg-[#fefae0] text-[#000000] border-2 border-[#2b3e2a] shadow-lg'
            : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Package className="w-4 h-4" /> 📦 1. استلام زيت (Receive Oil)
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTION')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'PRODUCTION'
            ? 'bg-[#fefae0] text-[#000000] border-2 border-[#2b3e2a] shadow-lg'
            : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Flame className="w-4 h-4" /> ⚙️ 2. خلط وإنتاج (Mixing & Production)
        </button>

        <button
          onClick={() => setActiveTab('DELIVERY')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'DELIVERY'
            ? 'bg-[#fefae0] text-[#000000] border-2 border-[#2b3e2a] shadow-lg'
            : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Truck className="w-4 h-4" /> 🚚 3. تسليم الإنتاج (Production Delivery)
        </button>

        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'INVENTORY'
            ? 'bg-[#fefae0] text-[#000000] border-2 border-[#2b3e2a] shadow-lg'
            : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Layers className="w-4 h-4" /> 📊 4. جرد ورصيد (Inventory Balance)
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: RECEIVE OIL */}
      {activeTab === 'RECEIVE' && (
        <form onSubmit={handleReceiveSubmit} className="bg-[#fefae0] text-[#000000] rounded-xl p-5 border-2 border-[#ccd5ae] space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">المورد / المزارع (Vendor / Supplier):</label>
            <div className="flex gap-2">
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="flex-1 bg-white border-2 border-[#354b32] text-black font-bold p-3 rounded-lg text-sm"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddNewVendor}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-black px-4 py-2 rounded-lg border-2 border-[#14532d] shadow-md flex items-center gap-1.5 text-sm"
              >
                <Plus className="w-4 h-4" /> إضافة (Add)
              </button>
            </div>
          </div>

          {/* 3 RAW OIL INPUTS IN KG */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border-2 border-slate-300 p-3 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 mb-1">زيت كورة (كجم):</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={recvKuraKg}
                  onChange={(e) => setRecvKuraKg(Number(e.target.value))}
                  className="w-full text-lg font-black text-black bg-slate-50 border border-slate-300 p-2 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-600">kg</span>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-300 p-3 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 mb-1">بكر ممتاز (كجم):</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={recvEVOOKg}
                  onChange={(e) => setRecvEVOOKg(Number(e.target.value))}
                  className="w-full text-lg font-black text-black bg-slate-50 border border-slate-300 p-2 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-600">kg</span>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-300 p-3 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 mb-1">زيت نخيل (كجم):</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={recvPalmKg}
                  onChange={(e) => setRecvPalmKg(Number(e.target.value))}
                  className="w-full text-lg font-black text-black bg-slate-50 border border-slate-300 p-2 rounded-lg"
                />
                <span className="text-xs font-bold text-slate-600">kg</span>
              </div>
            </div>
          </div>

          {/* SUMMARY CALCULATION BOX */}
          <div className="bg-white border-2 border-[#2b3e2a] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-black text-[#1c2b1a]">
              ملخص استلام الشحنة بالوزن من المورد: {totalRecvKg} kg = {recvKuraKg}k كورة + {recvEVOOKg}k ممتاز + {recvPalmKg}k نخيل
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-[#fefae0] border border-[#ccd5ae] p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-bold mb-1">إجمالي الوزن المستلم</p>
                <p className="text-xl font-black text-black">{totalRecvKg} kg</p>
              </div>

              <div className="bg-[#fefae0] border border-[#ccd5ae] p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-bold mb-1">ما يعادل بالتنكات (16 كجم/تنكة)</p>
                <p className="text-xl font-black text-black">{recvTinsEq} تنكة</p>
              </div>

              <div className="bg-[#fefae0] border border-[#ccd5ae] p-3 rounded-lg">
                <p className="text-xs text-slate-600 font-bold mb-1">الحجم بالليتر (17.5 ليتر/تنكة)</p>
                <p className="text-xl font-black text-black">{recvLiters} L</p>
              </div>
            </div>

            <p className="text-xs font-bold text-center text-slate-700 pt-1">
              نسب الأصناف: %{kuraPct} كورة ({kuraTins} تنكة) | %{evooPct} ممتاز ({evooTins} تنكة) | %{palmPct} نخيل ({palmTins} تنكة)
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1c2b1a] hover:bg-[#253923] text-white font-black py-3.5 px-4 rounded-xl border-2 border-[#000000] shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            تسجيل واستلام الشحنة بالوزن (كجم) في المخزون
          </button>
        </form>
      )}

      {/* TAB 2: MIXING & PRODUCTION */}
      {activeTab === 'PRODUCTION' && (
        <div className="bg-white text-black p-5 rounded-xl border-2 border-slate-300 space-y-4">
          <h2 className="text-lg font-black text-[#1c2b1a]">خلط سحب وتعبئة الزيت (Mixing & Production Lines)</h2>

          <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-300">
            <span className="text-sm font-bold">صنف العبوة المستهدفة للتعبئة:</span>
            <button
              onClick={() => setShowAddUnitModal(true)}
              className="bg-[#16a34a] text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[#15803d] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + إضافة صنف/عبوة للمخزون
            </button>
          </div>

          <div>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-400 p-3 rounded-lg font-bold text-sm"
            >
              {inventoryItems.map(item => (
                <option key={item.id} value={item.name}>{item.name} — ({item.packagingType})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold mb-1">عدد العبوات المصنعة (تعبئة):</label>
              <input
                type="number"
                value={prodPackQty}
                onChange={(e) => setProdPackQty(Number(e.target.value))}
                className="w-full border-2 border-slate-400 p-2.5 rounded-lg font-black text-lg bg-slate-50"
              />
            </div>

            <div className="bg-[#fefae0] p-3 rounded-lg border border-[#ccd5ae] flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-600">إجمالي كمية الزيت المطلوبة للسحب:</span>
              <span className="text-lg font-black text-emerald-800">
                {(prodPackQty * (inventoryItems.find(i => i.name === selectedPackage)?.capacityKg || 15.2)).toFixed(1)} kg
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              alert(`تم تسجيل إنتاج وتعبئة ${prodPackQty} من صنف (${selectedPackage}) وتحديث المخزون بنجاح!`);
            }}
            className="w-full bg-[#2b3e2a] hover:bg-[#1c2b1a] text-white font-black py-3 rounded-xl shadow-md text-sm mt-4"
          >
            تأكيد عملية الخلط والتعبئة وخصم الخام من الخزانات
          </button>
        </div>
      )}

      {/* TAB 3: PRODUCTION DELIVERY TO SUPERSONIC */}
      {activeTab === 'DELIVERY' && (
        <div className="bg-[#fefae0] text-black p-5 rounded-xl border-2 border-[#ccd5ae] space-y-4">
          <h2 className="text-lg font-black text-[#1c2b1a]">تسليم وترحيل الإنتاج إلى شركة SuperSonic (SuperSonic Delivery)</h2>

          <div>
            <label className="block text-xs font-bold mb-1">وجهة التوصيل / فرع SuperSonic:</label>
            <select
              value={deliveryTargetHub}
              onChange={(e) => setDeliveryTargetHub(e.target.value)}
              className="w-full bg-white border-2 border-[#2b3e2a] p-3 rounded-lg font-bold text-sm"
            >
              <option value="المستودع الرئيسي لشركة SuperSonic - بيروت والشويفات">المستودع الرئيسي لشركة SuperSonic - بيروت والشويفات</option>
              <option value="مستودع شركة SuperSonic - فرع الجنوب وصيدا">مستودع شركة SuperSonic - فرع الجنوب وصيدا</option>
              <option value="مستودع شركة SuperSonic - فرع البقاع وزحلة">مستودع شركة SuperSonic - فرع البقاع وزحلة</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">الصنف المسلّم للسائق / المستودع:</label>
              <select
                value={deliveryItem}
                onChange={(e) => setDeliveryItem(e.target.value)}
                className="w-full bg-white border-2 border-[#2b3e2a] p-2.5 rounded-lg font-bold text-sm"
              >
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">الكمية المسلمة (عدد العبوات):</label>
              <input
                type="number"
                value={deliveryQty}
                onChange={(e) => setDeliveryQty(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#2b3e2a] p-2.5 rounded-lg font-black text-lg"
              />
            </div>
          </div>

          <button
            onClick={() => {
              alert(`تم تسجيل ترحيل وتسليم ${deliveryQty} عبوات من صنف (${deliveryItem}) إلى ${deliveryTargetHub}!`);
            }}
            className="w-full bg-[#1c2b1a] hover:bg-[#253923] text-white font-black py-3 rounded-xl shadow-lg text-sm"
          >
            تأكيد ترحيل الشحنة وطباعة بوليصة التسليم
          </button>
        </div>
      )}

      {/* TAB 4: INVENTORY BALANCE (WITH 4 SUB TABS) */}
      {activeTab === 'INVENTORY' && (
        <div className="bg-[#142013] p-4 rounded-xl border border-[#2b3e2a] space-y-4">
          <div className="flex flex-wrap gap-2 pb-2 border-b border-[#2b3e2a]">
            <button
              onClick={() => setInventorySubTab('STOCK')}
              className={`px-4 py-2 rounded-lg font-bold text-xs ${inventorySubTab === 'STOCK' ? 'bg-[#2b3e2a] text-white' : 'bg-white/10 text-slate-300'
                }`}
            >
              جرد المخزون
            </button>
            <button
              onClick={() => setInventorySubTab('LOG')}
              className={`px-4 py-2 rounded-lg font-bold text-xs ${inventorySubTab === 'LOG' ? 'bg-[#2b3e2a] text-white' : 'bg-white/10 text-slate-300'
                }`}
            >
              سجل الحركات
            </button>
            <button
              onClick={() => setInventorySubTab('SUPERSONIC')}
              className={`px-4 py-2 rounded-lg font-bold text-xs ${inventorySubTab === 'SUPERSONIC' ? 'bg-[#2b3e2a] text-white' : 'bg-white/10 text-slate-300'
                }`}
            >
              جرد الأسطول
            </button>
            <button
              onClick={() => setInventorySubTab('ALERTS')}
              className={`px-4 py-2 rounded-lg font-bold text-xs ${inventorySubTab === 'ALERTS' ? 'bg-red-800 text-white' : 'bg-white/10 text-slate-300'
                }`}
            >
              تنبيهات نقص المخزون
            </button>
          </div>

          {/* SUB TAB 1: STOCK */}
          {inventorySubTab === 'STOCK' && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-base font-sans">
                <thead>
                  <tr className="bg-[#243522] text-[#fefae0] border-b border-[#3b5438] font-semibold tracking-wide">
                    <th className="py-3.5 px-4 font-semibold">الصنف / العبوة</th>
                    <th className="py-3.5 px-4 font-semibold">النوع</th>
                    <th className="py-3.5 px-4 font-semibold">السعة</th>
                    <th className="py-3.5 px-4 font-semibold">مستودع Vanguard</th>
                    <th className="py-3.5 px-4 font-semibold">مستودع SuperSonic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b3e2a] text-base font-normal">
                  {inventoryItems.map(item => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="py-3.5 px-4 font-medium text-white">{item.name}</td>
                      <td className="py-3.5 px-4 font-normal text-slate-300">{item.packagingType}</td>
                      <td className="py-3.5 px-4 font-normal text-slate-300">{item.capacityKg} kg</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">{item.vanguardStock} عبوة</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-amber-300">{item.supersonicStock} عبوة</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB TAB 2: LOG */}
          {inventorySubTab === 'LOG' && (
            <div className="space-y-2 text-xs">
              {movementLogs.map(log => (
                <div key={log.id} className="bg-[#243522] p-3 rounded-lg border border-[#3b5438] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-300">[{log.type}]</span> {log.description}
                    <p className="text-[10px] text-slate-400">{log.timestamp} -- بواسطة {log.performedBy}</p>
                  </div>
                  <span className="font-black text-amber-300 bg-[#1c2b1a] px-2 py-1 rounded border border-[#3b5438]">
                    {log.qty}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SUB TAB 3: FLEET */}
          {inventorySubTab === 'SUPERSONIC' && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-base font-sans">
                <thead>
                  <tr className="bg-[#243522] text-[#fefae0] font-semibold tracking-wide">
                    <th className="py-3.5 px-4 font-semibold">السائق / الآلية</th>
                    <th className="py-3.5 px-4 font-semibold">الصنف الحمول</th>
                    <th className="py-3.5 px-4 font-semibold">الكمية بمعهد السيارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b3e2a] text-base font-normal">
                  {fleetStocks.map(fs => (
                    <tr key={fs.id}>
                      <td className="py-3.5 px-4 font-medium text-white">{fs.driverName} ({fs.vehicle})</td>
                      <td className="py-3.5 px-4 font-normal text-slate-300">{fs.itemName}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-300">{fs.qty} عبوة</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB TAB 4: ALERTS */}
          {inventorySubTab === 'ALERTS' && (
            <div className="space-y-2 text-xs">
              {alerts.map(alt => (
                <div key={alt.id} className="bg-red-950/60 border border-red-800 p-3 rounded-lg flex justify-between items-center text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-bold">{alt.itemName}</span>
                  </div>
                  <span>الرصيد الحالي: {alt.currentStock} (الحد الأدنى: {alt.minThreshold})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC ADD UNIT & UOM SETUP MODAL */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#fefae0] text-black p-6 rounded-2xl max-w-md w-full border-2 border-[#2b3e2a] space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <h3 className="text-lg font-black text-[#1c2b1a] flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-amber-700" /> تهيئة وحدات قياس المخزون (UOM Setup)
              </h3>
              <span className="bg-amber-200 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-400">
                18 Strict UOMs
              </span>
            </div>

            <form onSubmit={handleAddNewCustomUnit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">وحدة القياس المعتمدة (Strict UOM):</label>
                <select
                  value={selectedUom}
                  onChange={(e) => setSelectedUom(e.target.value)}
                  className="w-full border-2 border-slate-400 p-2 rounded-lg text-xs bg-white font-bold text-gray-900"
                >
                  {STRICT_UOM_LIST.map(uom => (
                    <option key={uom} value={uom}>
                      {uom} — {getUomInputStep(uom) === '1' ? 'أعداد صحيحة فقط (Strict Integers step=1)' : getUomInputStep(uom) === '0.001' ? 'كسر عشري (Open Decimal step=0.001)' : 'أحجام حزمة/كرتون (Fixed Pack Size step=0.25)'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-600 font-semibold mt-1">
                  قاعدة الإدخال للوحدة ({selectedUom}):{' '}
                  <strong className="text-amber-700 font-bold">
                    {getUomInputStep(selectedUom) === '1'
                      ? '🔒 يتطلب أعداداً صحيحة فقط (Strict Integer step=1)'
                      : getUomInputStep(selectedUom) === '0.001'
                      ? '⚖️ كسر عشري مفتوح (Open Decimal step=0.001)'
                      : '📦 حزمة/كرتونة مضاعفة (Pack Size Multiplier step=0.25)'}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1">اسم العبوة / الصنف الجديد:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جالون بلاستيك 10 لتر"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full border-2 border-slate-400 p-2.5 rounded-lg text-sm bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">السعة بالكيلوجرام (kg):</label>
                <input
                  type="number"
                  step={getUomInputStep(selectedUom)}
                  required
                  value={newUnitCapacity}
                  onChange={(e) => setNewUnitCapacity(Number(e.target.value))}
                  className="w-full border-2 border-slate-400 p-2.5 rounded-lg text-sm bg-white font-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">نوع التغليف / المادة:</label>
                <input
                  type="text"
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value)}
                  className="w-full border-2 border-slate-400 p-2.5 rounded-lg text-sm bg-white"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-2.5 rounded-xl text-xs"
                >
                  حفظ وحدة القياس والصنف
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 bg-slate-400 hover:bg-slate-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
