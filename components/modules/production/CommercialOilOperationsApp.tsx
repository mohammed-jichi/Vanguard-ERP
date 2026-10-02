'use client';

/**
 * Vanguard ERP - Commercial Oil Operations & Packaging Application
 * Independent operational application for commercial oil lifecycle, blending, packaging,
 * and real dynamic warehouse stock posting.
 * Completely isolated from pressing-mill harvest routes.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Package,
  Layers,
  Scale,
  Plus,
  Trash2,
  Copy,
  Printer,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Warehouse as WarehouseIcon,
  Droplets,
  RotateCcw,
  Sparkles,
  Search,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  ChevronRight,
  Boxes,
  Truck,
  Edit2,
  Eye,
  Check,
  X,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { STANDARD_PACKAGING_SIZES } from '@/lib/commercialOilConstants';

// --- TYPES ---
export interface Supplier {
  SUPPLIERID: number | string;
  SUPPLIERNAME: string;
  PHONE?: string;
  EMAIL?: string;
  ADDRESS?: string;
  ACCOUNTNO?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  type: string;
  branchName: string;
  location: string;
  manager: string;
  contactPhone?: string;
  capacityLiters: number;
  currentStockUnits: number;
  isActive: boolean;
  isDriverVisible: boolean;
}

export interface StorageTank {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  grade: 'EXTRA_VIRGIN' | 'VIRGIN' | 'ORDINARY' | 'KURA_REFINED';
  gradeNameAr: string;
  capacityKg: number;
  currentKg: number;
  acidity: number;
  location: string;
}

export interface ContainerRow {
  id: string;
  containerType: 'GALLON' | 'TIN';
  netKg: number;
  grossKg?: number;
  tareKg?: number;
}

export interface SkuPackagingInput {
  skuId: string;
  sizeMl: number;
  nameAr: string;
  containerType: 'BOTTLE' | 'GALLON' | 'TIN';
  boxCapacity: number; // Dynamic user input!
  boxes: number;
  loosePieces: number;
}

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  supplierName: string;
  supplierPhone: string;
  oilGradeNameAr: string;
  acidity: number;
  targetStorageNameAr: string;
  totalContainers: number;
  totalNetKg: number;
  receivedBy: string;
  createdAt: string;
}

export interface BatchRecord {
  id: string;
  batchNumber: string;
  date: string;
  batchName: string;
  operator: string;
  totalBatchKg: number;
  weightedAvgAcidity: number;
  densityFactor: number;
  estimatedVolumeLiters: number;
  status: 'READY_FOR_PACKAGING' | 'PACKAGED' | 'ARCHIVED';
  createdAt: string;
}

export interface PackagingVoucherRecord {
  id: string;
  voucherNumber: string;
  date: string;
  batchNumber?: string;
  batchName?: string;
  batchOriginalKg: number;
  densityFactor: number;
  targetWarehouseNameAr: string;
  totalPiecesProduced: number;
  totalLitersPackaged: number;
  totalConsumedKg: number;
  packagingLossKg: number;
  packagingLossPercent: number;
  isLossAcceptable: boolean;
  operator: string;
  createdAt: string;
}

export interface WarehouseSkuStockRecord {
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
}

export interface MovementLogRecord {
  id: string;
  timestamp: string;
  type: string;
  refNumber: string;
  description: string;
  sourceLocation: string;
  destinationLocation: string;
  qtyKg: number;
  unitsSummary?: string;
  performedBy: string;
}

export default function CommercialOilOperationsApp() {
  const { t, dir } = useLanguage();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'RECEIVE' | 'BLENDING' | 'PACKAGING' | 'WAREHOUSES' | 'LOGS'>('RECEIVE');

  // Server state loaded from live APIs
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tanks, setTanks] = useState<StorageTank[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [packagingVouchers, setPackagingVouchers] = useState<PackagingVoucherRecord[]>([]);
  const [stocks, setStocks] = useState<WarehouseSkuStockRecord[]>([]);
  const [movements, setMovements] = useState<MovementLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --------------------------------------------------------------------------
  // TAB 1: RECEIVE OIL STATE
  // --------------------------------------------------------------------------
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | string>('');
  const [supplierSearch, setSupplierSearch] = useState<string>('');
  const [oilGrade, setOilGrade] = useState<'EXTRA_VIRGIN' | 'VIRGIN' | 'ORDINARY' | 'KURA_REFINED'>('EXTRA_VIRGIN');
  const [acidityPercent, setAcidityPercent] = useState<number>(0.65);
  const [targetStorageId, setTargetStorageId] = useState<string>('tank-01');
  const [intakeDate, setIntakeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [intakeNotes, setIntakeNotes] = useState<string>('');
  const [receiverName, setReceiverName] = useState<string>('Mohammed Jichi (مستلم المستودع)');

  // Container rows
  const [containerRows, setContainerRows] = useState<ContainerRow[]>([
    { id: '1', containerType: 'GALLON', netKg: 16.2 },
    { id: '2', containerType: 'GALLON', netKg: 16.2 },
    { id: '3', containerType: 'TIN', netKg: 17.0 },
    { id: '4', containerType: 'TIN', netKg: 17.0 }
  ]);

  // Modal: Add New Supplier
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [newSupName, setNewSupName] = useState<string>('');
  const [newSupPhone, setNewSupPhone] = useState<string>('');
  const [newSupEmail, setNewSupEmail] = useState<string>('');

  // Quick Batch Add Modal
  const [showQuickBatchModal, setShowQuickBatchModal] = useState<boolean>(false);
  const [quickBatchCount, setQuickBatchCount] = useState<number>(10);
  const [quickBatchWeight, setQuickBatchWeight] = useState<number>(16.0);
  const [quickBatchType, setQuickBatchType] = useState<'GALLON' | 'TIN'>('GALLON');

  // --------------------------------------------------------------------------
  // TAB 2: BLENDING STATE
  // --------------------------------------------------------------------------
  const [blendName, setBlendName] = useState<string>('خلطة زيت زيتون بكر فاخر مخصص للتعبئة');
  const [blendOperator, setBlendOperator] = useState<string>('فني الخلط والمختبر');
  const [blendNotes, setBlendNotes] = useState<string>('مزج خزان T-01 مع عبوات خام متوازنة للوصول لحموضة < 0.8%');
  const [withdrawals, setWithdrawals] = useState<Record<string, number>>({});

  // --------------------------------------------------------------------------
  // TAB 3: PACKAGING STATE
  // --------------------------------------------------------------------------
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [customBatchKg, setCustomBatchKg] = useState<number>(1000);
  const [densityFactor, setDensityFactor] = useState<number>(0.916); // Default olive oil density kg/L
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('wh-main-fg');
  const [packagingOperator, setPackagingOperator] = useState<string>('مسؤول خط التعبئة والتغليف');
  const [packagingNotes, setPackagingNotes] = useState<string>('تعبئة موسمية - مطابقة للمعايير القياسية');

  // Dynamic Packaging SKUs inputs (8 standard sizes with free user box capacity)
  const [skuInputs, setSkuInputs] = useState<Record<string, { boxCapacity: number; boxes: number; loosePieces: number }>>(
    STANDARD_PACKAGING_SIZES.reduce((acc, s) => {
      acc[s.skuId] = {
        boxCapacity: s.defaultBoxCap, // User can freely change this!
        boxes: 0,
        loosePieces: 0
      };
      return acc;
    }, {} as Record<string, { boxCapacity: number; boxes: number; loosePieces: number }>)
  );

  // --------------------------------------------------------------------------
  // TAB 4: WAREHOUSES MANAGEMENT STATE
  // --------------------------------------------------------------------------
  const [showAddWhModal, setShowAddWhModal] = useState<boolean>(false);
  const [newWhNameAr, setNewWhNameAr] = useState<string>('');
  const [newWhNameEn, setNewWhNameEn] = useState<string>('');
  const [newWhCode, setNewWhCode] = useState<string>('');
  const [newWhType, setNewWhType] = useState<string>('FINISHED_GOODS');
  const [newWhLocation, setNewWhLocation] = useState<string>('');
  const [newWhCapacity, setNewWhCapacity] = useState<number>(50000);
  const [newWhDriverVisible, setNewWhDriverVisible] = useState<boolean>(true);

  // Active print modal
  const [printableDoc, setPrintableDoc] = useState<{ title: string; content: any } | null>(null);

  // --------------------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // --------------------------------------------------------------------------
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      // Fetch warehouses (central hub view: gets ALL warehouses including Supersonic)
      const whRes = await fetch('/api/warehouses');
      const whJson = await whRes.json();
      if (whJson.success && Array.isArray(whJson.data)) {
        setWarehouses(whJson.data);
      }

      // Fetch live suppliers
      const supRes = await fetch('/api/getAllInvSuppliers');
      const supJson = await supRes.json();
      if (supJson.data && Array.isArray(supJson.data)) {
        setSuppliers(supJson.data);
        if (supJson.data.length > 0 && !selectedSupplierId) {
          setSelectedSupplierId(supJson.data[0].SUPPLIERID);
        }
      }

      // Fetch commercial oil state (tanks, batches, vouchers, ledger)
      const opRes = await fetch('/api/operations/commercial-oil');
      const opJson = await opRes.json();
      if (opJson.success && opJson.data) {
        setTanks(opJson.data.tanks || []);
        setReceipts(opJson.data.receipts || []);
        setBatches(opJson.data.batches || []);
        setPackagingVouchers(opJson.data.packagingVouchers || []);
        setStocks(opJson.data.warehouseStocks || []);
        setMovements(opJson.data.movements || []);

        // Pre-fill target tank if empty
        if (opJson.data.tanks && opJson.data.tanks.length > 0 && !targetStorageId) {
          setTargetStorageId(opJson.data.tanks[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load operations data:', err);
      showToast('خطأ في تحميل بيانات العمليات من السيرفر', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const q = supplierSearch.toLowerCase();
    return suppliers.filter(
      s =>
        s.SUPPLIERNAME.toLowerCase().includes(q) ||
        (s.PHONE && s.PHONE.includes(q)) ||
        String(s.SUPPLIERID).includes(q)
    );
  }, [suppliers, supplierSearch]);

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => String(s.SUPPLIERID) === String(selectedSupplierId));
  }, [suppliers, selectedSupplierId]);

  // --------------------------------------------------------------------------
  // TAB 1: RECEIVE CALCULATIONS & ACTIONS
  // --------------------------------------------------------------------------
  const receiveTotals = useMemo(() => {
    let gallons = 0;
    let tins = 0;
    let totalNet = 0;
    for (const r of containerRows) {
      if (r.containerType === 'GALLON') gallons++;
      else tins++;
      totalNet += Number(r.netKg) || 0;
    }
    const totalContainers = containerRows.length;
    const avgWeight = totalContainers > 0 ? totalNet / totalContainers : 0;
    return {
      gallons,
      tins,
      totalContainers,
      totalNet: Math.round(totalNet * 100) / 100,
      avgWeight: Math.round(avgWeight * 100) / 100
    };
  }, [containerRows]);

  const handleAddContainerRow = () => {
    const lastRow = containerRows[containerRows.length - 1];
    const newRow: ContainerRow = {
      id: Date.now().toString(),
      containerType: lastRow ? lastRow.containerType : 'GALLON',
      netKg: lastRow ? lastRow.netKg : 16.2
    };
    setContainerRows([...containerRows, newRow]);
  };

  const handleDuplicateLastRow = () => {
    if (containerRows.length === 0) {
      handleAddContainerRow();
      return;
    }
    const lastRow = containerRows[containerRows.length - 1];
    const dup: ContainerRow = {
      id: Date.now().toString(),
      containerType: lastRow.containerType,
      netKg: lastRow.netKg
    };
    setContainerRows([...containerRows, dup]);
    showToast(`تم تكرار العبوة الأخيرة (${dup.netKg} كغ) بنجاح`, 'info');
  };

  const handleApplyQuickBatch = () => {
    const count = Math.max(1, quickBatchCount);
    const weight = Math.max(0.1, quickBatchWeight);
    const newRows: ContainerRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: `${Date.now()}-${i}`,
        containerType: quickBatchType,
        netKg: weight
      });
    }
    setContainerRows([...containerRows, ...newRows]);
    setShowQuickBatchModal(false);
    showToast(`تمت إضافة ${count} عبوة بوزن ${weight} كغ`, 'success');
  };

  const handleRemoveContainerRow = (id: string) => {
    setContainerRows(containerRows.filter(r => r.id !== id));
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/getAllInvSuppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          supplier: {
            SUPPLIERNAME: newSupName,
            PHONE: newSupPhone || '+961 7 000 000',
            EMAIL: newSupEmail || 'supplier@vanguard-erp.lb'
          }
        })
      });
      const data = await res.json();
      if (data.data) {
        showToast('تمت إضافة المورد الجديد بنجاح', 'success');
        await loadAllData();
        setSelectedSupplierId(data.data.SUPPLIERID);
        setShowAddSupplierModal(false);
        setNewSupName('');
        setNewSupPhone('');
        setNewSupEmail('');
      }
    } catch (err: any) {
      showToast('فشل إضافة المورد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitIntake = async () => {
    if (!selectedSupplier) {
      showToast('يرجى اختيار المورد أولاً', 'error');
      return;
    }
    if (containerRows.length === 0) {
      showToast('يرجى إضافة عبوات الزيت المستلمة', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        supplierId: selectedSupplier.SUPPLIERID,
        supplierName: selectedSupplier.SUPPLIERNAME,
        supplierPhone: selectedSupplier.PHONE || '+961 7 000 000',
        supplierAddress: selectedSupplier.ADDRESS || 'جنوب لبنان',
        supplierAccountNo: selectedSupplier.ACCOUNTNO || String(selectedSupplier.SUPPLIERID),
        oilGrade,
        acidity: acidityPercent,
        targetStorageId,
        containers: containerRows.map(r => ({
          containerType: r.containerType,
          netKg: r.netKg,
          grossKg: r.grossKg,
          tareKg: r.tareKg
        })),
        notes: intakeNotes,
        receivedBy: receiverName
      };

      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECEIVE_INTAKE', payload })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`تم حفظ سند الاستلام بنجاح برقم: ${json.data.receiptNumber}`, 'success');
        setPrintableDoc({
          title: `سند استلام زيت تجاري - ${json.data.receiptNumber}`,
          content: json.data
        });
        await loadAllData();
        // Reset rows to default
        setContainerRows([
          { id: '1', containerType: 'GALLON', netKg: 16.2 }
        ]);
        setIntakeNotes('');
      } else {
        showToast(json.error || 'فشل حفظ سند الاستلام', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 2: BLENDING CALCULATIONS & ACTIONS
  // --------------------------------------------------------------------------
  const blendingCalculations = useMemo(() => {
    let totalKg = 0;
    let weightedAciditySum = 0;
    for (const [tankId, withdrawnKg] of Object.entries(withdrawals)) {
      const kg = Number(withdrawnKg) || 0;
      if (kg <= 0) continue;
      const tank = tanks.find(t => t.id === tankId);
      if (tank) {
        totalKg += kg;
        weightedAciditySum += (kg * tank.acidity);
      }
    }
    const weightedAvgAcidity = totalKg > 0 ? weightedAciditySum / totalKg : 0;
    const volumeLiters = totalKg > 0 ? totalKg / densityFactor : 0;
    return {
      totalKg: Math.round(totalKg * 100) / 100,
      weightedAvgAcidity: Math.round(weightedAvgAcidity * 100) / 100,
      volumeLiters: Math.round(volumeLiters * 100) / 100
    };
  }, [withdrawals, tanks, densityFactor]);

  const handleWithdrawalChange = (tankId: string, val: string) => {
    const num = Math.max(0, Number(val) || 0);
    setWithdrawals({
      ...withdrawals,
      [tankId]: num
    });
  };

  const handleWithdrawMax = (tank: StorageTank) => {
    setWithdrawals({
      ...withdrawals,
      [tank.id]: tank.currentKg
    });
  };

  const handleCreateBlendBatch = async () => {
    const sources = Object.entries(withdrawals)
      .filter(([_, kg]) => Number(kg) > 0)
      .map(([tankId, kg]) => ({ sourceId: tankId, withdrawnKg: Number(kg) }));

    if (sources.length === 0) {
      showToast('يرجى تحديد أوزان السحب من خزان أو مستودع واحد على الأقل', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        batchName: blendName,
        operator: blendOperator,
        sources,
        densityFactor,
        notes: blendNotes
      };

      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_BLEND', payload })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`تم اعتماد وتجهيز الخلطة برقم: ${json.data.batchNumber}`, 'success');
        setPrintableDoc({
          title: `سند خلطة ومزج زيت - ${json.data.batchNumber}`,
          content: json.data
        });
        await loadAllData();
        setWithdrawals({});
        // Switch to packaging tab and select this batch
        setSelectedBatchId(json.data.id);
        setActiveTab('PACKAGING');
      } else {
        showToast(json.error || 'فشل إنشاء خلطة المزج', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 3: PACKAGING CALCULATIONS & ACTIONS
  // --------------------------------------------------------------------------
  const activeBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId);
  }, [batches, selectedBatchId]);

  const activeBatchWeight = useMemo(() => {
    if (activeBatch) return activeBatch.totalBatchKg;
    return customBatchKg;
  }, [activeBatch, customBatchKg]);

  const availableBatchVolume = useMemo(() => {
    if (densityFactor <= 0) return 0;
    return Math.round((activeBatchWeight / densityFactor) * 100) / 100;
  }, [activeBatchWeight, densityFactor]);

  // Dynamic packaging math across the 8 sizes
  const packagingCalculations = useMemo(() => {
    let totalPieces = 0;
    let totalLiters = 0;
    let totalConsumedKg = 0;

    const skuBreakdown = STANDARD_PACKAGING_SIZES.map(std => {
      const cur = skuInputs[std.skuId] || { boxCapacity: std.defaultBoxCap, boxes: 0, loosePieces: 0 };
      const cap = Number(cur.boxCapacity) > 0 ? Number(cur.boxCapacity) : 1;
      const bxs = Math.max(0, Number(cur.boxes) || 0);
      const lse = Math.max(0, Number(cur.loosePieces) || 0);
      const units = (bxs * cap) + lse;
      const liters = units * (std.sizeMl / 1000);
      const kg = liters * densityFactor;

      totalPieces += units;
      totalLiters += liters;
      totalConsumedKg += kg;

      return {
        ...std,
        boxCapacity: cap,
        boxes: bxs,
        loosePieces: lse,
        totalUnits: units,
        totalLiters: Math.round(liters * 100) / 100,
        consumedKg: Math.round(kg * 100) / 100
      };
    });

    totalConsumedKg = Math.round(totalConsumedKg * 100) / 100;
    totalLiters = Math.round(totalLiters * 100) / 100;
    const lossKg = Math.round(Math.max(0, activeBatchWeight - totalConsumedKg) * 100) / 100;
    const lossPercent = activeBatchWeight > 0 ? Math.round((lossKg / activeBatchWeight) * 10000) / 100 : 0;

    return {
      skuBreakdown,
      totalPieces,
      totalLiters,
      totalConsumedKg,
      lossKg,
      lossPercent,
      isAcceptable: lossPercent <= 2.5
    };
  }, [skuInputs, densityFactor, activeBatchWeight]);

  const handleUpdateSkuInput = (skuId: string, field: 'boxCapacity' | 'boxes' | 'loosePieces', value: number) => {
    setSkuInputs(prev => ({
      ...prev,
      [skuId]: {
        ...prev[skuId],
        [field]: value
      }
    }));
  };

  const handlePostPackaging = async () => {
    if (packagingCalculations.totalPieces <= 0) {
      showToast('يرجى إدخال عدد الصناديق أو الحبات المعبأة للتعبئة', 'error');
      return;
    }
    if (!targetWarehouseId) {
      showToast('يرجى تحديد المستودع المستهدف لترحيل البضاعة', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const skus = STANDARD_PACKAGING_SIZES.map(s => {
        const inp = skuInputs[s.skuId] || { boxCapacity: s.defaultBoxCap, boxes: 0, loosePieces: 0 };
        return {
          skuId: s.skuId,
          boxCapacity: inp.boxCapacity,
          boxes: inp.boxes,
          loosePieces: inp.loosePieces
        };
      });

      const payload = {
        batchId: activeBatch?.id,
        batchWeightKg: activeBatchWeight,
        densityFactor,
        targetWarehouseId,
        skus,
        operator: packagingOperator,
        notes: packagingNotes
      };

      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PACKAGE_AND_POST', payload })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`تم ترحيل التعبئة للمستودع بنجاح برقم سند: ${json.data.voucherNumber}`, 'success');
        setPrintableDoc({
          title: `سند ترحيل إنتاج وتعبئة - ${json.data.voucherNumber}`,
          content: json.data
        });
        await loadAllData();
        // Reset SKU inputs
        setSkuInputs(
          STANDARD_PACKAGING_SIZES.reduce((acc, s) => {
            acc[s.skuId] = { boxCapacity: s.defaultBoxCap, boxes: 0, loosePieces: 0 };
            return acc;
          }, {} as Record<string, { boxCapacity: number; boxes: number; loosePieces: number }>)
        );
      } else {
        showToast(json.error || 'فشل ترحيل التعبئة', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 4: WAREHOUSES ACTIONS
  // --------------------------------------------------------------------------
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhNameAr.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newWhCode || undefined,
          name: newWhNameEn || newWhNameAr,
          nameAr: newWhNameAr,
          type: newWhType,
          location: newWhLocation || 'المركز الصناعي الرئيسي',
          capacityLiters: newWhCapacity,
          isDriverVisible: newWhDriverVisible
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast('تمت إضافة المستودع بنجاح', 'success');
        await loadAllData();
        setShowAddWhModal(false);
        setNewWhNameAr('');
        setNewWhNameEn('');
        setNewWhCode('');
      } else {
        showToast(json.error || 'فشل إنشاء المستودع', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ في حفظ المستودع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global KPIs
  const totalRawOilKg = useMemo(() => {
    return tanks.reduce((acc, t) => acc + (t.currentKg || 0), 0);
  }, [tanks]);

  const readyBatchesCount = useMemo(() => {
    return batches.filter(b => b.status === 'READY_FOR_PACKAGING').length;
  }, [batches]);

  const totalPackagedPieces = useMemo(() => {
    return stocks.reduce((acc, s) => acc + (s.totalUnits || 0), 0);
  }, [stocks]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans" dir="rtl">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`fixed top-4 left-4 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
          toastMessage.type === 'error' ? 'bg-red-50 text-red-900 border-red-300' :
          'bg-slate-50 text-slate-900 border-slate-300'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
          <span className="text-sm font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  مركز عمليات الزيت التجاري والتعبئة والتغليف
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  تطبيق تشغيلي مستقل
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                منتوجات زيت وزيتون الجنوب ش.م.م — دورة حياة الزيت من الاستلام حتى المستودعات الفعلية
              </p>
            </div>
          </div>

          {/* Quick Real-Time Statistics */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] text-slate-500 block leading-tight font-medium">رصيد الزيت الخام الكلي</span>
                <span className="text-xs font-black text-slate-800">{totalRawOilKg.toLocaleString()} كغ</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-[10px] text-slate-500 block leading-tight font-medium">خلطات جاهزة للتعبئة</span>
                <span className="text-xs font-black text-slate-800">{readyBatchesCount} خلطة</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-[10px] text-slate-500 block leading-tight font-medium">المخزون المعبأ بالمستودعات</span>
                <span className="text-xs font-black text-slate-800">{totalPackagedPieces.toLocaleString()} عبوة</span>
              </div>
            </div>

            <button
              onClick={loadAllData}
              title="تحديث البيانات"
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* PRIMARY STAGE NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('RECEIVE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'RECEIVE'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Package className="w-4 h-4" />
            1. استلام الزيت التجاري (Unit-by-Unit)
          </button>

          <button
            onClick={() => setActiveTab('BLENDING')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'BLENDING'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            2. الخلط والمزج بالوزن (Weight Blending)
          </button>

          <button
            onClick={() => setActiveTab('PACKAGING')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'PACKAGING'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Boxes className="w-4 h-4" />
            3. التعبئة وسعات الصناديق المرنة (Packaging)
          </button>

          <button
            onClick={() => setActiveTab('WAREHOUSES')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'WAREHOUSES'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <WarehouseIcon className="w-4 h-4" />
            4. المستودعات الحقيقية والرصيد (Warehouses)
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'LOGS'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            5. السجلات والمستندات الرسمية (Audit Logs)
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ================================================================= */}
        {/* STAGE 1: UNIT-BY-UNIT OIL RECEIVING                               */}
        {/* ================================================================= */}
        {activeTab === 'RECEIVE' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    استلام الزيت التجاري — تسجيل الأوزان التفصيلي للعبوات
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ربط حي مع جدول الموردين المعتمدين، تسجيل وزن كل تنكة أو غالون بشكل فردي، واحتساب إجمالي الوزن الصافي فورياً.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSupplierModal(true)}
                    className="px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    + إضافة مورد جديد
                  </button>
                </div>
              </div>

              {/* TICKET DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* 1. Supplier Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    المورد / التاجر (Live API):
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {filteredSuppliers.map(s => (
                      <option key={s.SUPPLIERID} value={s.SUPPLIERID}>
                        {s.SUPPLIERNAME} {s.PHONE ? `(${s.PHONE})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedSupplier && (
                    <p className="text-[11px] text-slate-500">
                      رقم الحساب: <span className="font-bold text-slate-700">{selectedSupplier.ACCOUNTNO || selectedSupplier.SUPPLIERID}</span> | الهاتف: <span className="font-bold text-slate-700">{selectedSupplier.PHONE || 'غير مسجل'}</span>
                    </p>
                  )}
                </div>

                {/* 2. Oil Grade */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-slate-500" />
                    نوع / صنف الزيت:
                  </label>
                  <select
                    value={oilGrade}
                    onChange={(e) => setOilGrade(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="EXTRA_VIRGIN">بكر ممتاز (EVOO) — حموضة &lt; 0.8%</option>
                    <option value="VIRGIN">بكر طبيعي (Virgin) — حموضة 0.8% - 2.0%</option>
                    <option value="ORDINARY">زيت عادي (Ordinary) — حموضة &gt; 2.0%</option>
                    <option value="KURA_REFINED">زيت بلدي كورة مكرر</option>
                  </select>
                </div>

                {/* 3. Acidity % */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                    نسبة الحموضة الفعالة (% Acidity):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="10.0"
                      value={acidityPercent}
                      onChange={(e) => setAcidityPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* 4. Target Storage Destination */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <WarehouseIcon className="w-3.5 h-3.5 text-slate-500" />
                    مكان التخزين والاستيداع:
                  </label>
                  <select
                    value={targetStorageId}
                    onChange={(e) => setTargetStorageId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {tanks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nameAr} (رصيد حالي: {t.currentKg} كغ)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* CONTAINER-BY-CONTAINER WEIGHT ENTRY SECTION */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    جدول تسجيل أوزان العبوات المستلمة (Unit-by-Unit Container Weights)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {containerRows.length} عبوة مسجلة
                  </span>
                </div>

                {/* Quick entry controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddContainerRow}
                    className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    + عبوة جديدة
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicateLastRow}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1 shadow-2xs"
                    title="تكرار سريع لنفس وزن العبوة السابقة لتسريع عملية الوزن"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-700" />
                    ⚡ تكرار سريع لآخر وزن (+1)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuickBatchModal(true)}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-700" />
                    ➕ إضافة دفعة متطابقة (Batch Insert)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من تفريغ كافة بنود الجدول؟')) {
                        setContainerRows([]);
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    مسح الجدول
                  </button>
                </div>
              </div>

              {/* TABLE OF CONTAINERS */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 w-14 text-center">#</th>
                        <th className="p-3">نوع العبوة (Container Type)</th>
                        <th className="p-3">الوزن الصافي بالكغ (Net Weight KG)</th>
                        <th className="p-3 w-28 text-center">إجراءات سريعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {containerRows.map((row, index) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-2.5 text-center font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="p-2.5">
                            <select
                              value={row.containerType}
                              onChange={(e) => {
                                const val = e.target.value as 'GALLON' | 'TIN';
                                const updated = [...containerRows];
                                updated[index].containerType = val;
                                setContainerRows(updated);
                              }}
                              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="GALLON">غالون بلاستيك (Plastic Gallon)</option>
                              <option value="TIN">تنكة حديد (Metal Tin)</option>
                            </select>
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-2 max-w-xs">
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={row.netKg}
                                onChange={(e) => {
                                  const updated = [...containerRows];
                                  updated[index].netKg = Number(e.target.value);
                                  setContainerRows(updated);
                                }}
                                className="w-32 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                              <span className="text-slate-500 font-bold text-xs">كغ</span>
                            </div>
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const dup: ContainerRow = {
                                    id: Date.now().toString(),
                                    containerType: row.containerType,
                                    netKg: row.netKg
                                  };
                                  const updated = [...containerRows];
                                  updated.splice(index + 1, 0, dup);
                                  setContainerRows(updated);
                                }}
                                title="تكرار هذه العبوة"
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveContainerRow(row.id)}
                                title="حذف العبوة"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {containerRows.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                            لا توجد عبوات مسجلة في السند بعد. انقر على "+ عبوة جديدة" أو "إضافة دفعة متطابقة" للبدء.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REAL-TIME TOTALS & SUMMARY CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block">إجمالي الغالونات:</span>
                    <span className="text-sm font-black text-slate-800">{receiveTotals.gallons} غالون</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">إجمالي التنكات:</span>
                    <span className="text-sm font-black text-slate-800">{receiveTotals.tins} تنكة</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">إجمالي العبوات:</span>
                    <span className="text-sm font-black text-indigo-700">{receiveTotals.totalContainers} عبوة</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">إجمالي الوزن الصافي الكلي:</span>
                    <span className="text-base font-black text-emerald-700">{receiveTotals.totalNet.toLocaleString()} كغ</span>
                    <span className="text-[10px] text-slate-400 block">معدل العبوة: {receiveTotals.avgWeight} كغ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting || containerRows.length === 0}
                    onClick={handleSubmitIntake}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    حفظ وترحيل سند الاستلام إلى الخزان
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 2: WEIGHT-BASED MIXING & BLENDING                           */}
        {/* ================================================================= */}
        {activeTab === 'BLENDING' && (
          <div className="space-y-6 animate-fade-in">
            {/* Blending Header Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    الخلط والمزج بالوزن الصافي المباشر (Weight-Based Mixing & Blending)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    سحب الزيت بالكيلوغرام مباشرة من الخزانات ومستودع العبوات الخام، خصم فوري وذري، واحتساب آلي لمتوسط الحموضة التقديري.
                  </p>
                </div>
              </div>

              {/* Batch Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">اسم الخلطة / الدفعة (Batch Name):</label>
                  <input
                    type="text"
                    value={blendName}
                    onChange={(e) => setBlendName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="مثال: خلطة رقم 104 للتعبئة الفاخرة"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">المشغل / فني الخلط (Operator):</label>
                  <input
                    type="text"
                    value={blendOperator}
                    onChange={(e) => setBlendOperator(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">ملاحظات ومواصفات الخلطة:</label>
                  <input
                    type="text"
                    value={blendNotes}
                    onChange={(e) => setBlendNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="ملاحظات الحفاظ على الحموضة والمواصفات"
                  />
                </div>
              </div>
            </div>

            {/* SOURCE SELECTION GRID */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    الخزانات والأرصدة المتاحة للسحب المباشر بالوزن (كغ)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  إجمالي المصادر المتاحة: <span className="font-bold text-slate-800">{tanks.length}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tanks.map(tank => {
                  const currentWithdrawn = withdrawals[tank.id] || 0;
                  const remaining = Math.max(0, tank.currentKg - currentWithdrawn);

                  return (
                    <div
                      key={tank.id}
                      className={`border rounded-xl p-4 transition-all ${
                        currentWithdrawn > 0
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                              {tank.code}
                            </span>
                            <h4 className="font-black text-slate-900 text-sm">{tank.nameAr}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{tank.location}</p>
                        </div>

                        <div className="text-left">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                            الحموضة: {tank.acidity}%
                          </span>
                        </div>
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>الرصيد المتاح: <b className="text-slate-900">{tank.currentKg.toLocaleString()} كغ</b></span>
                          <span>السعة: {tank.capacityKg.toLocaleString()} كغ</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (tank.currentKg / tank.capacityKg) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Input for net weight withdrawal */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1">
                          <label className="font-bold text-slate-700 block mb-1">
                            الوزن المسحوب بالكغ من هذا الخزان:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max={tank.currentKg}
                              value={currentWithdrawn || ''}
                              onChange={(e) => handleWithdrawalChange(tank.id, e.target.value)}
                              placeholder="0.0"
                              className="w-36 bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <span className="font-bold text-slate-500">كغ</span>
                          </div>
                        </div>

                        <div className="text-left flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleWithdrawMax(tank)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded shadow-2xs"
                          >
                            سحب كامل الرصيد (Max)
                          </button>
                          <span className="text-[10px] text-slate-400">
                            المتبقي: {remaining.toLocaleString()} كغ
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE BLENDING ENGINE & MATH CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">إجمالي وزن الخلطة الناتجة:</span>
                    <span className="text-xl font-black text-emerald-700">
                      {blendingCalculations.totalKg.toLocaleString()} كغ
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      يعادل حوالي: {blendingCalculations.volumeLiters.toLocaleString()} ليتر
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">متوسط الحموضة التقديري:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-indigo-700">
                        {blendingCalculations.weightedAvgAcidity}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        blendingCalculations.weightedAvgAcidity <= 0.8
                          ? 'bg-emerald-100 text-emerald-800'
                          : blendingCalculations.weightedAvgAcidity <= 2.0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {blendingCalculations.weightedAvgAcidity <= 0.8
                          ? 'بكر ممتاز (EVOO)'
                          : blendingCalculations.weightedAvgAcidity <= 2.0
                          ? 'بكر طبيعي (Virgin)'
                          : 'زيت عادي'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      محسوب بالمتوسط المرجح للأوزان
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">الوجهة بعد الخلط:</span>
                    <span className="text-sm font-bold text-slate-800 block">
                      خزان التجهيز والتعبئة المباشرة
                    </span>
                    <span className="text-[10px] text-slate-400">
                      خصم ذري فوري من الخزانات الأصلية
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={isSubmitting || blendingCalculations.totalKg <= 0}
                    onClick={handleCreateBlendBatch}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    اعتماد الخلطة والانتقال للتعبئة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 3: PACKAGING & DYNAMIC BOX CAPACITY                         */}
        {/* ================================================================= */}
        {activeTab === 'PACKAGING' && (
          <div className="space-y-6 animate-fade-in">
            {/* Packaging Header & Density Configuration */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-emerald-600" />
                    التعبئة والتغليف مع سعات صناديق مرنة بالكامل (Dynamic Box Packaging)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إدخال حر لسعة الصندوق (حبة/صندوق) دون تثبيت مسبق، احتساب الحبات والصناديق تلقائياً، ومعايرة الفاقد بمعامل الكثافة.
                  </p>
                </div>
              </div>

              {/* BATCH & DENSITY CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* 1. Batch Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">اختر دفعة الخلط أو كمية يدوية:</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">كمية يدوية مباشرة (Custom Batch)</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber}: {b.batchName} ({b.totalBatchKg} كغ - {b.weightedAvgAcidity}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Batch Weight in KG */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">وزن الدفعة المخصصة للتعبئة (كغ):</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      disabled={Boolean(activeBatch)}
                      value={activeBatchWeight}
                      onChange={(e) => setCustomBatchKg(Number(e.target.value))}
                      className="w-full bg-white disabled:bg-slate-100 border border-slate-300 rounded-lg p-2.5 font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">كغ</span>
                  </div>
                </div>

                {/* 3. DENSITY FACTOR (معامل الكثافة - قابل للتعديل يدوياً) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>معامل الكثافة (Density Factor):</span>
                    <span className="text-[10px] text-emerald-700 font-bold">افتراضي: 0.916</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.800"
                      max="1.100"
                      value={densityFactor}
                      onChange={(e) => setDensityFactor(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">كغ/ليتر</span>
                  </div>
                </div>

                {/* 4. Target Warehouse Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">المستودع المستهدف لترحيل الإنتاج:</label>
                  <select
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Volume Conversion Banner */}
              <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>
                    الحساب الفيزيائي: الحجم المتاح بالليتر = (الوزن {activeBatchWeight} كغ ÷ معامل الكثافة {densityFactor}) = 
                    <b className="text-emerald-900 mx-1 text-sm font-black">{availableBatchVolume.toLocaleString()} ليتر</b>
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800">
                  سعر الصافي المتاح: {activeBatchWeight} كغ
                </span>
              </div>
            </div>

            {/* 8 PRESCRIBED PACKAGING SIZES TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    جدول إدخال العبوات المعبأة (المقاسات المعتمدة الـ 8)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  سعة الصندوق حرة وقابلة للتعديل يدوياً لكل صنف
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">الصنف والمقاس المعتمد</th>
                        <th className="p-3 w-32">
                          سعة الصندوق
                          <span className="block text-[10px] text-slate-400 font-normal">(حبة/صندوق - حر)</span>
                        </th>
                        <th className="p-3 w-28">
                          عدد الصناديق
                          <span className="block text-[10px] text-slate-400 font-normal">(Boxes)</span>
                        </th>
                        <th className="p-3 w-28">
                          حبات فردية
                          <span className="block text-[10px] text-slate-400 font-normal">(Loose Pieces)</span>
                        </th>
                        <th className="p-3 w-32">
                          إجمالي الحبات
                          <span className="block text-[10px] text-slate-400 font-normal">(محسوب آلياً)</span>
                        </th>
                        <th className="p-3 w-32">
                          الحجم (ليتر)
                          <span className="block text-[10px] text-slate-400 font-normal">(Total Liters)</span>
                        </th>
                        <th className="p-3 w-32">
                          الوزن المستهلك
                          <span className="block text-[10px] text-slate-400 font-normal">(كغ مستهلك)</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {packagingCalculations.skuBreakdown.map((sku) => (
                        <tr key={sku.skuId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{sku.nameAr}</span>
                            <span className="text-[10px] text-slate-400">
                              سعة العبوة: {sku.sizeMl} مل ({sku.sizeMl / 1000} L)
                            </span>
                          </td>

                          {/* DYNAMIC BOX CAPACITY INPUT (حقل حر للمستخدم) */}
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={sku.boxCapacity}
                              onChange={(e) => handleUpdateSkuInput(sku.skuId, 'boxCapacity', Number(e.target.value))}
                              className="w-24 bg-white border border-slate-300 rounded-md p-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </td>

                          {/* BOXES COUNT */}
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={sku.boxes || ''}
                              onChange={(e) => handleUpdateSkuInput(sku.skuId, 'boxes', Number(e.target.value))}
                              placeholder="0"
                              className="w-24 bg-white border border-slate-300 rounded-md p-1.5 font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </td>

                          {/* LOOSE PIECES */}
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={sku.loosePieces || ''}
                              onChange={(e) => handleUpdateSkuInput(sku.skuId, 'loosePieces', Number(e.target.value))}
                              placeholder="0"
                              className="w-20 bg-white border border-slate-300 rounded-md p-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                          </td>

                          {/* AUTO TOTAL PIECES */}
                          <td className="p-3 font-black text-indigo-700">
                            {sku.totalUnits.toLocaleString()} حبة
                          </td>

                          {/* TOTAL LITERS */}
                          <td className="p-3 font-bold text-slate-800">
                            {sku.totalLiters.toLocaleString()} L
                          </td>

                          {/* CONSUMED KG */}
                          <td className="p-3 font-black text-emerald-700">
                            {sku.consumedKg.toLocaleString()} كغ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PACKAGING RECONCILIATION & LOSS CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block mb-1">إجمالي الحبات المنتجة:</span>
                    <span className="text-xl font-black text-indigo-700">
                      {packagingCalculations.totalPieces.toLocaleString()} حبة
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      إجمالي الحجم: {packagingCalculations.totalLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">الوزن الفعلي المستهلك:</span>
                    <span className="text-xl font-black text-emerald-700">
                      {packagingCalculations.totalConsumedKg.toLocaleString()} كغ
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      من أصل وزن الخلطة: {activeBatchWeight} كغ
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">الفاقد في التعبئة (Loss):</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-800">
                        {packagingCalculations.lossKg} كغ
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                        packagingCalculations.lossPercent <= 1.5
                          ? 'bg-emerald-100 text-emerald-800'
                          : packagingCalculations.lossPercent <= 3.0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {packagingCalculations.lossPercent}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      المعيار القياسي المقبول: &le; 2.5%
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">المستودع المحال إليه:</span>
                    <span className="text-sm font-black text-slate-900 block">
                      {warehouses.find(w => w.id === targetWarehouseId)?.nameAr || 'المستودع الرئيسي'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ترحيل فوري إلى سجل حركات المخزون
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={isSubmitting || packagingCalculations.totalPieces <= 0}
                    onClick={handlePostPackaging}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    حفظ وترحيل الإنتاج إلى المستودع المختار
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 4: REAL DYNAMIC WAREHOUSES & STOCK LEDGER                   */}
        {/* ================================================================= */}
        {activeTab === 'WAREHOUSES' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <WarehouseIcon className="w-5 h-5 text-emerald-600" />
                  إدارة المستودعات الحقيقية وأرصدة المنتجات الجاهزة
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  بيانات حية مستدعاة من السيرفر (GET /api/warehouses)، قابلة للإضافة والتعديل، مع عزل كامل لصلاحيات السائقين.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(true)}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  + إضافة مستودع جديد
                </button>
              </div>
            </div>

            {/* DRIVER RESTRICTION ALERT CARD */}
            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm text-amber-900">
                  قاعدة عزل الصلاحيات وحجب مستودع السوبر سونيك (Security Scope Isolation):
                </span>
                <p className="mt-1 leading-relaxed text-amber-800">
                  مستودع <b>Supersonic Warehouse (مستودع التوزيع الميداني)</b> مقتصر حصراً على لوحة التحكم المركزية (Supersonic Hub) والتطبيق التشغيلي الحالي. 
                  عند استدعاء واجهة السائقين عبر المعامل <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">?scope=driver</code>، يتم حجب المستودع وأرصدته تلقائياً، 
                  حيث لا يتاح للسائق في <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VDriverApp</code> سوى رؤية بوليصة الفان المحملة له فقط (Van Load Sheet).
                </p>
              </div>
            </div>

            {/* WAREHOUSES TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">قائمة المستودعات المعتمدة بالنظام</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">الرمز</th>
                      <th className="p-3">اسم المستودع</th>
                      <th className="p-3">النوع والتصنيف</th>
                      <th className="p-3">الموقع والمسؤول</th>
                      <th className="p-3">السعة القصوى</th>
                      <th className="p-3">رصيد العبوات الإجمالي</th>
                      <th className="p-3">رؤية السائقين</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {warehouses.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-black text-slate-800">{w.code}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{w.nameAr}</span>
                          <span className="text-[10px] text-slate-400">{w.name}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {w.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-slate-800 font-medium block">{w.location}</span>
                          <span className="text-[10px] text-slate-400">{w.manager}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{w.capacityLiters.toLocaleString()} L</td>
                        <td className="p-3 font-black text-emerald-700">{w.currentStockUnits.toLocaleString()} عبوة</td>
                        <td className="p-3">
                          {w.isDriverVisible ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              متاح
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              محجوب عن السائقين
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {w.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FINISHED GOODS STOCK BREAKDOWN TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">
                أرصدة الأصناف الجاهزة الـ 8 حسب المستودع (Warehouse Stock Ledger)
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">المستودع</th>
                      <th className="p-3">الصنف المعبأ</th>
                      <th className="p-3">سعة الصندوق المحددة</th>
                      <th className="p-3">عدد الصناديق</th>
                      <th className="p-3">حبات فردية</th>
                      <th className="p-3">إجمالي الحبات</th>
                      <th className="p-3">إجمالي الحجم (L)</th>
                      <th className="p-3">إجمالي الوزن (كغ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stocks.map((stk, idx) => {
                      const wh = warehouses.find(w => w.id === stk.warehouseId);
                      return (
                        <tr key={`${stk.warehouseId}-${stk.skuId}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{wh?.nameAr || stk.warehouseId}</td>
                          <td className="p-3 font-bold text-slate-800">{stk.nameAr}</td>
                          <td className="p-3">{stk.boxCapacity} حبة/صندوق</td>
                          <td className="p-3 font-black text-slate-800">{stk.boxesCount}</td>
                          <td className="p-3 text-slate-600">{stk.loosePieces}</td>
                          <td className="p-3 font-black text-indigo-700">{stk.totalUnits.toLocaleString()} حبة</td>
                          <td className="p-3 font-bold text-slate-700">{stk.totalLiters.toLocaleString()} L</td>
                          <td className="p-3 font-black text-emerald-700">{stk.totalKg.toLocaleString()} كغ</td>
                        </tr>
                      );
                    })}
                    {stocks.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                          لا توجد حركات تعبئة مرحلة للمستودعات بعد. قم بإنشاء دفعة تعبئة من التبويب السابق وترحيلها.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 5: OPERATIONAL AUDIT LOGS & PRINTABLE VOUCHERS              */}
        {/* ================================================================= */}
        {activeTab === 'LOGS' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                سجل العمليات والتقارير والسندات الرسمية
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع كامل لكافة سندات الاستلام، خلطات المزج، وسندات ترحيل التعبئة مع إمكانية المعاينة والطباعة الرسمية.
              </p>
            </div>

            {/* RECEIPTS LOG */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">سندات استلام الزيت التجاري الأخيرة</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم السند</th>
                      <th className="p-3">التاريخ والوقت</th>
                      <th className="p-3">المورد</th>
                      <th className="p-3">الصنف والحموضة</th>
                      <th className="p-3">الوجهة المستلمة</th>
                      <th className="p-3">العبوات</th>
                      <th className="p-3">إجمالي الوزن الصافي</th>
                      <th className="p-3">المستلم</th>
                      <th className="p-3 text-center">طباعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {receipts.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-black text-slate-800">{r.receiptNumber}</td>
                        <td className="p-3 text-slate-500">{r.date} {r.time}</td>
                        <td className="p-3 font-bold text-slate-900">{r.supplierName}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 block">{r.oilGradeNameAr}</span>
                          <span className="text-[10px] text-amber-700 font-bold">حموضة: {r.acidity}%</span>
                        </td>
                        <td className="p-3 text-slate-700">{r.targetStorageNameAr}</td>
                        <td className="p-3 font-bold text-indigo-700">{r.totalContainers} عبوة</td>
                        <td className="p-3 font-black text-emerald-700">{r.totalNetKg.toLocaleString()} كغ</td>
                        <td className="p-3 text-slate-500">{r.receivedBy}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setPrintableDoc({ title: `سند استلام زيت - ${r.receiptNumber}`, content: r })}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {receipts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                          لا توجد سندات استلام مسجلة بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PACKAGING POSTING LOG */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">سندات ترحيل التعبئة والتغليف للمستودعات</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم السند</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">الدفعة</th>
                      <th className="p-3">المستودع المحال إليه</th>
                      <th className="p-3">الحبات المعبأة</th>
                      <th className="p-3">الحجم (L)</th>
                      <th className="p-3">الوزن المستهلك</th>
                      <th className="p-3">الفاقد (Loss %)</th>
                      <th className="p-3 text-center">طباعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {packagingVouchers.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-black text-slate-800">{v.voucherNumber}</td>
                        <td className="p-3 text-slate-500">{v.date}</td>
                        <td className="p-3 font-bold text-slate-800">{v.batchNumber || v.batchName || 'دفعة يدوية'}</td>
                        <td className="p-3 font-bold text-slate-900">{v.targetWarehouseNameAr}</td>
                        <td className="p-3 font-black text-indigo-700">{v.totalPiecesProduced.toLocaleString()} حبة</td>
                        <td className="p-3 font-bold text-slate-700">{v.totalLitersPackaged.toLocaleString()} L</td>
                        <td className="p-3 font-black text-emerald-700">{v.totalConsumedKg.toLocaleString()} كغ</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                            v.packagingLossPercent <= 2.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {v.packagingLossKg} كغ ({v.packagingLossPercent}%)
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setPrintableDoc({ title: `سند ترحيل تعبئة - ${v.voucherNumber}`, content: v })}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {packagingVouchers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                          لا توجد سندات ترحيل تعبئة مسجلة بعد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL: ADD NEW SUPPLIER (Live API Integration)                    */}
      {/* ================================================================= */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-up text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                إضافة مورد زيت تجاري جديد
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المورد / الشركة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مزارع وادي الحجير التعاونية"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">رقم الهاتف:</label>
                <input
                  type="text"
                  placeholder="+961 70 000 000"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">البريد الإلكتروني:</label>
                <input
                  type="email"
                  placeholder="supplier@vanguard-erp.lb"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs"
                >
                  حفظ المورد في قاعدة البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: QUICK BATCH INSERT FOR CONTAINERS                          */}
      {/* ================================================================= */}
      {showQuickBatchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-up text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                إضافة دفعة عبوات متطابقة الأوزان
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickBatchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نوع العبوات:</label>
                <select
                  value={quickBatchType}
                  onChange={(e) => setQuickBatchType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                >
                  <option value="GALLON">غالون بلاستيك (Plastic Gallon)</option>
                  <option value="TIN">تنكة حديد (Metal Tin)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">عدد العبوات المتطابقة:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quickBatchCount}
                  onChange={(e) => setQuickBatchCount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">الوزن الصافي لكل عبوة (كغ):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quickBatchWeight}
                  onChange={(e) => setQuickBatchWeight(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-emerald-700"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                إجمالي الوزن المضاف: <b className="text-slate-900">{Math.round(quickBatchCount * quickBatchWeight * 100) / 100} كغ</b>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleApplyQuickBatch}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs"
                >
                  إدراج العبوات في الجدول
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickBatchModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: ADD NEW WAREHOUSE                                          */}
      {/* ================================================================= */}
      {showAddWhModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-up text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-emerald-600" />
                إضافة مستودع جديد لقاعدة البيانات
              </h3>
              <button
                type="button"
                onClick={() => setShowAddWhModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم المستودع بالعربية:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مستودع التخزين الإقليمي"
                    value={newWhNameAr}
                    onChange={(e) => setNewWhNameAr(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم المستودع بالإنجليزية:</label>
                  <input
                    type="text"
                    placeholder="Regional Storage Hub"
                    value={newWhNameEn}
                    onChange={(e) => setNewWhNameEn(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رمز المستودع (Code):</label>
                  <input
                    type="text"
                    placeholder="WH-RG-01"
                    value={newWhCode}
                    onChange={(e) => setNewWhCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع المستودع:</label>
                  <select
                    value={newWhType}
                    onChange={(e) => setNewWhType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                  >
                    <option value="FINISHED_GOODS">بضاعة جاهزة (Finished Goods)</option>
                    <option value="DISTRIBUTION_HUB">توزيع ولوجستيات (Distribution Hub)</option>
                    <option value="RETAIL">معرض ونقطة بيع (Retail Showroom)</option>
                    <option value="QUARANTINE">حجر وفحص فني (Quarantine / QC)</option>
                    <option value="RAW_BULK">زيت خام (Raw Bulk Storage)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">الموقع الجغرافي والمنشأة:</label>
                <input
                  type="text"
                  placeholder="المقر الجنوبي — القطاع ج"
                  value={newWhLocation}
                  onChange={(e) => setNewWhLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">السعة التخزينية (ليتر):</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={newWhCapacity}
                    onChange={(e) => setNewWhCapacity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-black text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ظهور المستودع للسائقين:</label>
                  <select
                    value={newWhDriverVisible ? 'true' : 'false'}
                    onChange={(e) => setNewWhDriverVisible(e.target.value === 'true')}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                  >
                    <option value="true">متاح لاستعلامات السائقين</option>
                    <option value="false">محجوب حصرياً (لوحة التحكم فقط)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs"
                >
                  حفظ المستودع في قاعدة البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: OFFICIAL PRINTABLE VOUCHER PREVIEW                         */}
      {/* ================================================================= */}
      {printableDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="font-black text-sm text-slate-900">{printableDoc.title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة السند
                </button>
                <button
                  onClick={() => setPrintableDoc(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Content */}
            <div className="p-8 space-y-6 print:p-0">
              {/* Corporate 3-Zone Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center text-xs">
                <div>
                  <h3 className="text-base font-black text-slate-900">منتوجات زيت وزيتون الجنوب ش.م.م</h3>
                  <p className="text-[11px] text-slate-500">Southern Olive & Oil Products S.A.R.L</p>
                  <p className="text-[10px] text-slate-400">سجل تجاري: 22901 — النبطية ومرجعيون، لبنان</p>
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-emerald-800 px-3 py-1 bg-emerald-50 rounded border border-emerald-200 block">
                    {printableDoc.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    تاريخ الإصدار: {new Date().toLocaleDateString('ar-LB')}
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="font-bold text-slate-900">VANGUARD ERP</span>
                  <p className="text-[10px] text-slate-400">Operations & Packaging Hub</p>
                </div>
              </div>

              {/* Data display */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <pre className="font-mono text-xs overflow-x-auto text-slate-800 whitespace-pre-wrap">
                  {JSON.stringify(printableDoc.content, null, 2)}
                </pre>
              </div>

              {/* Signatures Footer */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-8">توقيع المستلم / الفني</span>
                  <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-8">مسؤول الجودة والمختبر</span>
                  <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-8">اعتماد مدير المستودعات</span>
                  <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
