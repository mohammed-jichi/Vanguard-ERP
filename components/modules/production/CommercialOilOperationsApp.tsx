'use client';

/**
 * Vanguard ERP - V-Oil Operations Hub & Management
 * Autonomous Production & Field Operations for Commercial Oil
 * Features:
 * - RBAC separation: Field Operator (oil_operations_access) vs Management Admin (oil_management_admin)
 * - Zero Mock Data: Live APIs for Tanks, Suppliers, Oil Grades, Warehouses, and Stock Ledger
 * - Unit-by-unit intake receiving supporting Gallon, Tin, and Drum (100 kg default, editable)
 * - Net-weight bulk blending
 * - Packaging with dynamic box capacity and unblocked live warehouse dispatch
 * - Elegant printable vouchers (No raw JSON dump!) with backdrop click dismiss and ESC listener
 * - Mobile-ready layout and live dynamic i18n (AR / EN / FR / ES)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useActiveUser } from '@/lib/useActiveUser';
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
  DollarSign,
  User,
  LogOut,
  SlidersHorizontal,
  Lock,
  Unlock,
  Shield
} from 'lucide-react';
import { STANDARD_PACKAGING_SIZES, OilGradeRecord } from '@/lib/commercialOilConstants';

// --- INTERFACES ---
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
  grade: string;
  gradeNameAr: string;
  capacityKg: number;
  currentKg: number;
  acidity: number;
  location: string;
  updatedAt?: string;
}

export interface ContainerRow {
  id: string;
  containerType: 'GALLON' | 'TIN' | 'DRUM';
  netKg: number;
  grossKg?: number;
  tareKg?: number;
}

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  supplierName: string;
  supplierPhone?: string;
  oilGradeNameAr: string;
  acidity: number;
  targetStorageNameAr: string;
  gallonsCount?: number;
  tinsCount?: number;
  drumsCount?: number;
  totalContainers: number;
  totalNetKg: number;
  avgContainerKg?: number;
  receivedBy: string;
  createdAt: string;
  containers?: ContainerRow[];
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
  sources?: { sourceName: string; withdrawnKg: number; sourceAcidity: number }[];
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
  targetWarehouseCode?: string;
  totalPiecesProduced: number;
  totalLitersPackaged: number;
  totalConsumedKg: number;
  packagingLossKg: number;
  packagingLossPercent: number;
  isLossAcceptable: boolean;
  operator: string;
  createdAt: string;
  skus?: { skuId: string; nameAr: string; sizeMl: number; boxCapacity: number; boxes: number; loosePieces: number; totalPieces: number; totalLiters: number; consumedKg: number }[];
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

// Translations Dictionary
const TRANSLATIONS = {
  ar: {
    appTitleOperator: 'مركز عمليات الزيت (V-Oil Hub)',
    appTitleAdmin: 'مركز عمليات وإدارة الزيت التجاري (V-Oil Operations Hub & Management)',
    independentApp: 'الإنتاج الميداني والتعبئة',
    companyName: 'منتوجات زيت وزيتون الجنوب ش.م.م',
    companySubtitle: 'Southern Olive & Oil Products S.A.R.L — ص.ب 22901 النبطية ومرجعيون، لبنان',
    operatorMode: 'مشغل ميداني (Field Operator)',
    adminMode: 'إدارة وتحكم (Admin / Manager)',
    tabReceive: '1. استلام الزيت التجاري',
    tabBlending: '2. الخلط والمزج بالوزن',
    tabPackaging: '3. التعبئة وسعات الصناديق',
    tabTanks: '4. إدارة الخزانات والتخزين',
    tabWarehouses: '5. المستودعات الحقيقية والرصيد',
    tabLogs: '6. السجلات والتقارير الرسمية',
    totalBulkBalance: 'رصيد الزيت الخام الكلي',
    readyBatches: 'خلطات جاهزة للتعبئة',
    packagedUnits: 'المخزون المعبأ بالمستودعات',
    refresh: 'تحديث البيانات',
    supplier: 'المورد / التاجر:',
    addSupplier: '+ إضافة مورد جديد',
    oilGrade: 'نوع / صنف الزيت:',
    acidity: 'نسبة الحموضة (% Acidity):',
    storageTank: 'مكان التخزين / الخزان المستهدف:',
    receiverStaff: 'الموظف المستلم:',
    notes: 'ملاحظات:',
    containerWeights: 'جدول تسجيل أوزان العبوات المستلمة (Unit-by-Unit Container Weights)',
    registeredContainers: 'عبوة مسجلة',
    newContainer: '+ عبوة جديدة',
    duplicateLast: '⚡ تكرار سريع لآخر وزن (+1)',
    batchAdd: '➕ إضافة دفعة متطابقة (Batch Insert)',
    clearTable: 'مسح الجدول',
    containerType: 'نوع العبوة',
    netWeightKg: 'الوزن الصافي (كغ)',
    actions: 'إجراءات',
    plasticGallon: 'غالون بلاستيك (Plastic Gallon)',
    metalTin: 'تنكة حديد (Metal Tin)',
    drumBarrel: 'برميل (Drum / Barrel) — 100 كغ',
    totalGallons: 'إجمالي الغالونات:',
    totalTins: 'إجمالي التنكات:',
    totalDrums: 'إجمالي البراميل:',
    totalContainers: 'إجمالي العبوات:',
    totalNetKg: 'إجمالي الوزن الصافي الكلي:',
    avgPerContainer: 'معدل العبوة:',
    saveAndPostIntake: 'حفظ وترحيل سند الاستلام إلى الخزان',
    batchName: 'اسم الخلطة / الدفعة:',
    operator: 'المشغل / الفني المسؤول:',
    batchNotes: 'ملاحظات ومواصفات الخلطة:',
    availableSources: 'الخزانات والأرصدة المتاحة للسحب المباشر بالوزن (كغ)',
    withdrawnKgFromTank: 'الوزن المسحوب بالكغ من هذا الخزان:',
    totalWithdrawnWeight: 'إجمالي وزن الخلطة المسحوب:',
    weightedAcidity: 'متوسط الحموضة التقديري:',
    densityFactor: 'معامل الكثافة (Density Factor):',
    densityHint: 'افتراضي: 0.916 كغ/L',
    estimatedVolumeL: 'الحجم التقديري بالليتر:',
    commitBlend: 'اعتماد وترحيل خلطة الزيت للتعبئة',
    chooseBlendOrManual: 'اختر دفعة الخلط أو كمية يدوية:',
    manualCustomBatch: 'كمية يدوية مباشرة (Custom Batch)',
    batchWeightKg: 'وزن الدفعة المخصصة للتعبئة (كغ):',
    targetWarehouse: 'المستودع المستهدف لترحيل الإنتاج:',
    packagingTable: 'جدول إدخال العبوات المعبأة (المقاسات المعتمدة الـ 8)',
    skuSize: 'الصنف والمقاس المعتمد',
    boxCap: 'سعة الصندوق (حبة/صندوق - حر)',
    boxesCount: 'عدد الصناديق',
    loosePieces: 'حبات فردية',
    totalPieces: 'إجمالي الحبات',
    volumeL: 'الحجم (ليتر)',
    consumedKg: 'الوزن المستهلك (كغ)',
    totalProducedPieces: 'إجمالي الحبات المنتجة:',
    actualConsumedKg: 'الوزن الفعلي المستهلك:',
    packagingLoss: 'الفاقد في التعبئة (Loss):',
    reconciledWarehouse: 'المستودع المحال إليه:',
    saveAndPostPackaging: 'حفظ وترحيل الإنتاج إلى المستودع المختار',
    packagingSuccess: 'تم ترحيل التعبئة للمستودع بنجاح برقم سند:',
    tanksManagementTitle: 'إدارة الخزانات والصوامع وأماكن التخزين',
    addNewTank: '+ إضافة خزان جديد',
    tankCode: 'كود الخزان',
    tankNameAr: 'اسم الخزان بالعربية',
    tankNameEn: 'اسم الخزان بالإنجليزية',
    capacityKg: 'السعة القصوى (كغ)',
    currentKg: 'الرصيد الحالي (كغ)',
    location: 'الموقع الفعلي / الصالة',
    edit: 'تعديل',
    delete: 'حذف',
    warehousesTitle: 'إدارة المستودعات وسجل المخزون الحقيقي',
    addNewWarehouse: '+ إضافة مستودع جديد',
    whCode: 'كود المستودع',
    whNameAr: 'اسم المستودع بالعربية',
    whType: 'نوع المستودع',
    whCapacity: 'السعة (ليتر)',
    driverVisibility: 'ظهور الأرصدة للسائقين',
    hiddenFromDrivers: 'محجوب عن السائقين (خزان مركزي)',
    visibleToDrivers: 'متاح للسائقين',
    close: 'إغلاق',
    print: 'طباعة السند',
    signatures: 'التوقيعات الرسمية المعتمدة',
    receiverSignature: 'توقيع المستلم / المشغل',
    qcSignature: 'مسؤول الجودة والمختبر',
    warehouseManagerSignature: 'اعتماد مدير المستودعات',
    voucherReceipt: 'سند استلام زيت تجاري',
    voucherBlend: 'محضر تشغيل خلطة زيت',
    voucherPackaging: 'سند ترحيل إنتاج وتعبئة للمستودع'
  },
  en: {
    appTitleOperator: 'V-Oil Operations Hub',
    appTitleAdmin: 'V-Oil Operations Hub & Management',
    independentApp: 'Field Operations & Packaging',
    companyName: 'Southern Olive & Oil Products S.A.R.L',
    companySubtitle: 'Commercial Reg: 22901 — Nabatieh & Marjeyoun, Lebanon',
    operatorMode: 'Field Operator Mode',
    adminMode: 'Admin / Manager Mode',
    tabReceive: '1. Commercial Oil Intake',
    tabBlending: '2. Weight Blending',
    tabPackaging: '3. Packaging & Box Sizing',
    tabTanks: '4. Tanks & Storage Management',
    tabWarehouses: '5. Warehouses & Stock Ledger',
    tabLogs: '6. Official Audit Logs',
    totalBulkBalance: 'Total Bulk Raw Oil',
    readyBatches: 'Batches Ready for Packaging',
    packagedUnits: 'Packaged Inventory in Warehouses',
    refresh: 'Refresh Data',
    supplier: 'Supplier / Vendor:',
    addSupplier: '+ Add New Supplier',
    oilGrade: 'Oil Grade / Classification:',
    acidity: 'Effective Acidity (%):',
    storageTank: 'Destination Storage Tank:',
    receiverStaff: 'Receiving Employee:',
    notes: 'Operational Notes:',
    containerWeights: 'Unit-by-Unit Container Weighbridge Register',
    registeredContainers: 'containers recorded',
    newContainer: '+ New Container',
    duplicateLast: '⚡ Fast Duplicate Last (+1)',
    batchAdd: '➕ Batch Insert Containers',
    clearTable: 'Clear Register',
    containerType: 'Container Type',
    netWeightKg: 'Net Weight (KG)',
    actions: 'Actions',
    plasticGallon: 'Plastic Gallon',
    metalTin: 'Metal Tin',
    drumBarrel: 'Drum / Barrel (100 kg default)',
    totalGallons: 'Total Gallons:',
    totalTins: 'Total Tins:',
    totalDrums: 'Total Drums:',
    totalContainers: 'Total Containers:',
    totalNetKg: 'Total Net Weight (KG):',
    avgPerContainer: 'Average / Unit:',
    saveAndPostIntake: 'Save & Post Intake Voucher to Tank',
    batchName: 'Blend / Batch Title:',
    operator: 'Master Blender / Operator:',
    batchNotes: 'Blend Specifications & Quality Notes:',
    availableSources: 'Available Tanks for Direct Weight Withdrawal (KG)',
    withdrawnKgFromTank: 'Withdrawn Weight (KG) from this tank:',
    totalWithdrawnWeight: 'Total Batch Weight Withdrawn:',
    weightedAcidity: 'Weighted Estimated Acidity:',
    densityFactor: 'Density Factor (kg/L):',
    densityHint: 'Standard: 0.916 kg/L',
    estimatedVolumeL: 'Estimated Volume (Liters):',
    commitBlend: 'Commit & Post Batch to Packaging Tank',
    chooseBlendOrManual: 'Select Blending Batch or Custom Weight:',
    manualCustomBatch: 'Custom Manual Quantity',
    batchWeightKg: 'Batch Weight for Packaging (KG):',
    targetWarehouse: 'Target Warehouse for Finished Goods:',
    packagingTable: 'Packaging Register (8 Standard Standard Sizes)',
    skuSize: 'Standard SKU & Size',
    boxCap: 'Box Capacity (Pcs/Box - Free)',
    boxesCount: 'Boxes Count',
    loosePieces: 'Loose Pieces',
    totalPieces: 'Total Pieces',
    volumeL: 'Volume (L)',
    consumedKg: 'Consumed Weight (KG)',
    totalProducedPieces: 'Total Pieces Produced:',
    actualConsumedKg: 'Actual Consumed Weight:',
    packagingLoss: 'Packaging Loss:',
    reconciledWarehouse: 'Destination Warehouse:',
    saveAndPostPackaging: 'Post Finished Production to Selected Warehouse',
    packagingSuccess: 'Packaging posted successfully with voucher #',
    tanksManagementTitle: 'Tanks, Silos & Bulk Storage Administration',
    addNewTank: '+ Add Storage Tank',
    tankCode: 'Tank Code',
    tankNameAr: 'Arabic Name',
    tankNameEn: 'English Name',
    capacityKg: 'Max Capacity (KG)',
    currentKg: 'Current Balance (KG)',
    location: 'Physical Location / Bay',
    edit: 'Edit',
    delete: 'Delete',
    warehousesTitle: 'Warehouses & Live Finished Goods Ledger',
    addNewWarehouse: '+ Add New Warehouse',
    whCode: 'Warehouse Code',
    whNameAr: 'Warehouse Name',
    whType: 'Type',
    whCapacity: 'Capacity (L)',
    driverVisibility: 'Driver Visibility',
    hiddenFromDrivers: 'Hidden from Drivers (Central Hub)',
    visibleToDrivers: 'Visible to Drivers',
    close: 'Close',
    print: 'Print Voucher',
    signatures: 'Authorized Signatures',
    receiverSignature: 'Receiver / Operator',
    qcSignature: 'Quality & Lab Supervisor',
    warehouseManagerSignature: 'Warehouse Director',
    voucherReceipt: 'Commercial Oil Intake Voucher',
    voucherBlend: 'Oil Blending Run Report',
    voucherPackaging: 'Finished Packaging & Dispatch Voucher'
  },
  fr: {
    appTitleOperator: 'Centre des Opérations V-Oil',
    appTitleAdmin: 'Centre des Opérations et Gestion V-Oil',
    independentApp: 'Production de Terrain & Conditionnement',
    companyName: 'Southern Olive & Oil Products S.A.R.L',
    companySubtitle: 'Registre Commercial: 22901 — Nabatieh & Marjeyoun, Liban',
    operatorMode: 'Mode Opérateur Terrain',
    adminMode: 'Mode Direction & Gestion',
    tabReceive: '1. Réception Huile Commerciale',
    tabBlending: '2. Assemblage au Poids',
    tabPackaging: '3. Conditionnement & Caisses',
    tabTanks: '4. Gestion des Cuves',
    tabWarehouses: '5. Entrepôts et Stocks',
    tabLogs: '6. Registres Officiels',
    totalBulkBalance: 'Solde Total Huile Vrac',
    readyBatches: 'Lots Prêts à l’Embouteillage',
    packagedUnits: 'Stock Emballé en Entrepôt',
    refresh: 'Actualiser les Données',
    supplier: 'Fournisseur / Négociant:',
    addSupplier: '+ Nouveau Fournisseur',
    oilGrade: 'Catégorie d’Huile:',
    acidity: 'Acidité Réelle (%):',
    storageTank: 'Cuve de Stockage Cible:',
    receiverStaff: 'Agent Réceptionnaire:',
    notes: 'Remarques:',
    containerWeights: 'Registre de Pesée Unitaire des Fûts et Bidons',
    registeredContainers: 'unités enregistrées',
    newContainer: '+ Nouvelle Unité',
    duplicateLast: '⚡ Dupliquer Dernier (+1)',
    batchAdd: '➕ Ajout par Lot',
    clearTable: 'Effacer le Registre',
    containerType: 'Type de Contenant',
    netWeightKg: 'Poids Net (KG)',
    actions: 'Actions',
    plasticGallon: 'Bidon Plastique (16.2 kg)',
    metalTin: 'Bidon Métal (17.0 kg)',
    drumBarrel: 'Fût / Baril (100 kg défaut)',
    totalGallons: 'Total Bidons Plastique:',
    totalTins: 'Total Bidons Métal:',
    totalDrums: 'Total Fûts:',
    totalContainers: 'Total Récipients:',
    totalNetKg: 'Poids Net Global (KG):',
    avgPerContainer: 'Moyenne / Unité:',
    saveAndPostIntake: 'Enregistrer et Transférer vers la Cuve',
    batchName: 'Titre du Lot d’Assemblage:',
    operator: 'Opérateur / Responsable:',
    batchNotes: 'Spécifications Techniques:',
    availableSources: 'Cuves Disponibles pour Soutirage (KG)',
    withdrawnKgFromTank: 'Poids Soutiré de cette cuve (KG):',
    totalWithdrawnWeight: 'Poids Total Assemblé:',
    weightedAcidity: 'Acidité Moyenne Pondérée:',
    densityFactor: 'Facteur de Densité (kg/L):',
    densityHint: 'Standard: 0.916 kg/L',
    estimatedVolumeL: 'Volume Estimé (Litres):',
    commitBlend: 'Valider et Transférer vers le Conditionnement',
    chooseBlendOrManual: 'Sélectionner Lot ou Quantité Libre:',
    manualCustomBatch: 'Quantité Libre Manuelle',
    batchWeightKg: 'Poids du Lot à Conditionner (KG):',
    targetWarehouse: 'Entrepôt Cible pour Produits Finis:',
    packagingTable: 'Tableau des 8 Formats Standards',
    skuSize: 'Format & Contenance',
    boxCap: 'Capacité Caisse (Unités/Caisse)',
    boxesCount: 'Nombre de Caisses',
    loosePieces: 'Unités Individuelles',
    totalPieces: 'Total Pièces',
    volumeL: 'Volume (L)',
    consumedKg: 'Poids Consommé (KG)',
    totalProducedPieces: 'Total Pièces Produites:',
    actualConsumedKg: 'Poids Réel Consommé:',
    packagingLoss: 'Perte de Conditionnement:',
    reconciledWarehouse: 'Entrepôt de Réception:',
    saveAndPostPackaging: 'Transférer la Production à l’Entrepôt Cible',
    packagingSuccess: 'Conditionnement transféré avec succès sous le n° ',
    tanksManagementTitle: 'Gestion des Cuves et Silos',
    addNewTank: '+ Ajouter une Cuve',
    tankCode: 'Code Cuve',
    tankNameAr: 'Nom Arabe',
    tankNameEn: 'Nom Français/Anglais',
    capacityKg: 'Capacité Max (KG)',
    currentKg: 'Solde Actuel (KG)',
    location: 'Emplacement',
    edit: 'Modifier',
    delete: 'Supprimer',
    warehousesTitle: 'Entrepôts et Registre des Stocks Réels',
    addNewWarehouse: '+ Ajouter un Entrepôt',
    whCode: 'Code Entrepôt',
    whNameAr: 'Nom de l’Entrepôt',
    whType: 'Type',
    whCapacity: 'Capacité (L)',
    driverVisibility: 'Visibilité Chauffeurs',
    hiddenFromDrivers: 'Masqué aux Chauffeurs',
    visibleToDrivers: 'Visible aux Chauffeurs',
    close: 'Fermer',
    print: 'Imprimer le Bon',
    signatures: 'Signatures Officielles',
    receiverSignature: 'Réceptionnaire / Opérateur',
    qcSignature: 'Contrôle Qualité & Labo',
    warehouseManagerSignature: 'Directeur des Entrepôts',
    voucherReceipt: 'Bon de Réception Huile Commerciale',
    voucherBlend: 'Rapport de Brassage & Assemblage',
    voucherPackaging: 'Bon d’Entrée en Entrepôt (Conditionnement)'
  },
  es: {
    appTitleOperator: 'Centro de Operaciones V-Oil',
    appTitleAdmin: 'Centro de Operaciones y Gestión V-Oil',
    independentApp: 'Producción de Campo y Envasado',
    companyName: 'Southern Olive & Oil Products S.A.R.L',
    companySubtitle: 'Reg. Comercial: 22901 — Nabatieh & Marjeyoun, Líbano',
    operatorMode: 'Modo Operario de Campo',
    adminMode: 'Modo Administración y Control',
    tabReceive: '1. Recepción de Aceite Comercial',
    tabBlending: '2. Mezcla y Ensamblaje por Peso',
    tabPackaging: '3. Envasado y Cajas Flexibles',
    tabTanks: '4. Gestión de Tanques y Silos',
    tabWarehouses: '5. Almacenes y Stock Real',
    tabLogs: '6. Registros y Auditoría',
    totalBulkBalance: 'Saldo Total Aceite a Granel',
    readyBatches: 'Lotes Listos para Envasar',
    packagedUnits: 'Stock Envasado en Almacenes',
    refresh: 'Actualizar Datos',
    supplier: 'Proveedor / Comercializador:',
    addSupplier: '+ Agregar Proveedor',
    oilGrade: 'Calidad / Grado de Aceite:',
    acidity: 'Acidez Efectiva (%):',
    storageTank: 'Tanque de Destino:',
    receiverStaff: 'Operario Receptor:',
    notes: 'Notas Operativas:',
    containerWeights: 'Registro de Pesaje Unitario en Báscula',
    registeredContainers: 'envases registrados',
    newContainer: '+ Nuevo Envase',
    duplicateLast: '⚡ Duplicar Último (+1)',
    batchAdd: '➕ Insertar Lote Rápido',
    clearTable: 'Vaciar Registro',
    containerType: 'Tipo de Envase',
    netWeightKg: 'Peso Neto (KG)',
    actions: 'Acciones',
    plasticGallon: 'Bidón Plástico (16.2 kg)',
    metalTin: 'Lata Metálica (17.0 kg)',
    drumBarrel: 'Barril / Tambor (100 kg)',
    totalGallons: 'Total Bidones Plástico:',
    totalTins: 'Total Latas:',
    totalDrums: 'Total Barriles:',
    totalContainers: 'Total Envases:',
    totalNetKg: 'Peso Neto Global (KG):',
    avgPerContainer: 'Promedio / Envase:',
    saveAndPostIntake: 'Guardar y Transferir al Tanque',
    batchName: 'Nombre del Lote de Mezcla:',
    operator: 'Operador Maestro de Mezcla:',
    batchNotes: 'Especificaciones del Lote:',
    availableSources: 'Tanques Disponibles para Retiro por Peso (KG)',
    withdrawnKgFromTank: 'Peso Retirado (KG):',
    totalWithdrawnWeight: 'Peso Total Retirado:',
    weightedAcidity: 'Acidez Promedio Ponderada:',
    densityFactor: 'Factor de Densidad (kg/L):',
    densityHint: 'Estándar: 0.916 kg/L',
    estimatedVolumeL: 'Volumen Estimado (Litros):',
    commitBlend: 'Confirmar y Transferir a Envasado',
    chooseBlendOrManual: 'Seleccionar Lote o Peso Manual:',
    manualCustomBatch: 'Cantidad Manual Libre',
    batchWeightKg: 'Peso del Lote a Envasar (KG):',
    targetWarehouse: 'Almacén Destino de Producto Terminado:',
    packagingTable: 'Tabla de Envasado (8 Tamaños Estándar)',
    skuSize: 'Producto y Capacidad',
    boxCap: 'Capacidad Caja (Uds/Caja)',
    boxesCount: 'Cantidad de Cajas',
    loosePieces: 'Piezas Sueltas',
    totalPieces: 'Total Piezas',
    volumeL: 'Volumen (L)',
    consumedKg: 'Peso Consumido (KG)',
    totalProducedPieces: 'Total Piezas Producidas:',
    actualConsumedKg: 'Peso Real Consumido:',
    packagingLoss: 'Pérdida en Envasado:',
    reconciledWarehouse: 'Almacén de Destino:',
    saveAndPostPackaging: 'Transferir Producción al Almacén Seleccionado',
    packagingSuccess: 'Envasado registrado con éxito con el comprobante n° ',
    tanksManagementTitle: 'Administración de Tanques y Silos',
    addNewTank: '+ Agregar Tanque',
    tankCode: 'Código',
    tankNameAr: 'Nombre Árabe',
    tankNameEn: 'Nombre Español/Inglés',
    capacityKg: 'Capacidad Máx (KG)',
    currentKg: 'Saldo Actual (KG)',
    location: 'Ubicación Física',
    edit: 'Editar',
    delete: 'Eliminar',
    warehousesTitle: 'Gestión de Almacenes y Registro Real de Stock',
    addNewWarehouse: '+ Agregar Almacén',
    whCode: 'Código Almacén',
    whNameAr: 'Nombre Almacén',
    whType: 'Tipo',
    whCapacity: 'Capacidad (L)',
    driverVisibility: 'Visibilidad Choferes',
    hiddenFromDrivers: 'Oculto a Choferes',
    visibleToDrivers: 'Visible a Choferes',
    close: 'Cerrar',
    print: 'Imprimir Comprobante',
    signatures: 'Firmas Autorizadas',
    receiverSignature: 'Receptor / Operario',
    qcSignature: 'Control de Calidad y Lab',
    warehouseManagerSignature: 'Director de Almacenes',
    voucherReceipt: 'Comprobante de Recepción de Aceite Comercial',
    voucherBlend: 'Informe de Mezcla y Ensamblaje',
    voucherPackaging: 'Comprobante de Entrada a Almacén'
  }
};

export default function CommercialOilOperationsApp() {
  const { language, setLanguage, isRtl } = useLanguage();
  const activeUser = useActiveUser();

  // Selected language translation dictionary
  const currentLang = (language in TRANSLATIONS ? language : 'ar') as keyof typeof TRANSLATIONS;
  const t = TRANSLATIONS[currentLang];

  // RBAC Mode Determination:
  // Operator Mode: default for OIL_OPERATOR or r_oil_op.
  // Admin Mode: default for Management, SuperAdmin, Manager.
  const isSuperOrAdmin = useMemo(() => {
    const role = (activeUser?.role || '').toLowerCase();
    const email = (activeUser?.email || '').toLowerCase();
    return (
      role.includes('admin') ||
      role.includes('manager') ||
      role.includes('management') ||
      role === 'r_super' ||
      role === 'r_oil_admin' ||
      email.includes('mohammed.jichi')
    );
  }, [activeUser]);

  const [userMode, setUserMode] = useState<'OPERATOR' | 'ADMIN'>(isSuperOrAdmin ? 'ADMIN' : 'OPERATOR');

  // Sync mode if activeUser loads asynchronously
  useEffect(() => {
    if (isSuperOrAdmin) {
      setUserMode('ADMIN');
    } else {
      setUserMode('OPERATOR');
    }
  }, [isSuperOrAdmin]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'RECEIVE' | 'BLENDING' | 'PACKAGING' | 'TANKS' | 'WAREHOUSES' | 'LOGS'>('RECEIVE');

  // Prevent Operator from entering Admin tabs
  useEffect(() => {
    if (userMode === 'OPERATOR' && (activeTab === 'TANKS' || activeTab === 'WAREHOUSES' || activeTab === 'LOGS')) {
      setActiveTab('RECEIVE');
    }
  }, [userMode, activeTab]);

  // Server state loaded from live APIs
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tanks, setTanks] = useState<StorageTank[]>([]);
  const [oilGrades, setOilGrades] = useState<OilGradeRecord[]>([]);
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
  const [selectedOilGradeCode, setSelectedOilGradeCode] = useState<string>('EXTRA_VIRGIN');
  const [acidityPercent, setAcidityPercent] = useState<number>(0.65);
  const [targetStorageId, setTargetStorageId] = useState<string>('');
  const [intakeDate, setIntakeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [intakeNotes, setIntakeNotes] = useState<string>('');
  const receiverName = activeUser?.name || 'Mohammed Jichi (مستلم المستودع)';

  // Container rows: default includes Gallon, Tin, and DRUM (100 kg)
  const [containerRows, setContainerRows] = useState<ContainerRow[]>([
    { id: '1', containerType: 'GALLON', netKg: 16.2 },
    { id: '2', containerType: 'TIN', netKg: 17.0 },
    { id: '3', containerType: 'DRUM', netKg: 100.0 }
  ]);

  // Modals for Tab 1
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [newSupName, setNewSupName] = useState<string>('');
  const [newSupPhone, setNewSupPhone] = useState<string>('');
  const [newSupEmail, setNewSupEmail] = useState<string>('');

  const [showQuickBatchModal, setShowQuickBatchModal] = useState<boolean>(false);
  const [quickBatchCount, setQuickBatchCount] = useState<number>(5);
  const [quickBatchWeight, setQuickBatchWeight] = useState<number>(100.0);
  const [quickBatchType, setQuickBatchType] = useState<'GALLON' | 'TIN' | 'DRUM'>('DRUM');

  // --------------------------------------------------------------------------
  // TAB 2: BLENDING STATE
  // --------------------------------------------------------------------------
  const [blendName, setBlendName] = useState<string>('خلطة زيت زيتون بكر فاخر متوازنة');
  const blendOperator = activeUser?.name || 'فني الخلط والمختبر';
  const [blendNotes, setBlendNotes] = useState<string>('سحب أوزان بالكيلوغرام من الخزانات واعتماد الدفعة');
  const [withdrawals, setWithdrawals] = useState<Record<string, number>>({});

  // --------------------------------------------------------------------------
  // TAB 3: PACKAGING STATE
  // --------------------------------------------------------------------------
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [customBatchKg, setCustomBatchKg] = useState<number>(1000);
  const [densityFactor, setDensityFactor] = useState<number>(0.916);
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('wh-main-fg');
  const packagingOperator = activeUser?.name || 'مسؤول خط التعبئة والتغليف';
  const [packagingNotes, setPackagingNotes] = useState<string>('تعبئة موسمية مطابقة للمواصفات');

  // Dynamic Packaging SKUs inputs (8 standard sizes with free user box capacity)
  const [skuInputs, setSkuInputs] = useState<Record<string, { boxCapacity: number; boxes: number; loosePieces: number }>>(
    STANDARD_PACKAGING_SIZES.reduce((acc, s) => {
      acc[s.skuId] = {
        boxCapacity: s.defaultBoxCap,
        boxes: 0,
        loosePieces: 0
      };
      return acc;
    }, {} as Record<string, { boxCapacity: number; boxes: number; loosePieces: number }>)
  );

  // --------------------------------------------------------------------------
  // TAB 4 & 5: TANKS & WAREHOUSES MANAGEMENT STATE (ADMIN)
  // --------------------------------------------------------------------------
  const [showAddTankModal, setShowAddTankModal] = useState<boolean>(false);
  const [editingTank, setEditingTank] = useState<StorageTank | null>(null);
  const [newTankCode, setNewTankCode] = useState<string>('');
  const [newTankNameAr, setNewTankNameAr] = useState<string>('');
  const [newTankNameEn, setNewTankNameEn] = useState<string>('');
  const [newTankCapacityKg, setNewTankCapacityKg] = useState<number>(25000);
  const [newTankGrade, setNewTankGrade] = useState<string>('EXTRA_VIRGIN');
  const [newTankLocation, setNewTankLocation] = useState<string>('صالة الخزانات المركزية - Hall A');
  const [newTankAcidity, setNewTankAcidity] = useState<number>(0.65);

  const [showAddWhModal, setShowAddWhModal] = useState<boolean>(false);
  const [newWhNameAr, setNewWhNameAr] = useState<string>('');
  const [newWhNameEn, setNewWhNameEn] = useState<string>('');
  const [newWhCode, setNewWhCode] = useState<string>('');
  const [newWhType, setNewWhType] = useState<string>('FINISHED_GOODS');
  const [newWhLocation, setNewWhLocation] = useState<string>('');
  const [newWhCapacity, setNewWhCapacity] = useState<number>(50000);
  const [newWhDriverVisible, setNewWhDriverVisible] = useState<boolean>(true);

  // Active print modal document (Official Vanguard Voucher Card)
  const [printableDoc, setPrintableDoc] = useState<{
    docType: 'RECEIPT' | 'BLEND' | 'PACKAGING';
    title: string;
    refNumber: string;
    date: string;
    content: any;
  } | null>(null);

  // ESC Key listener to close ANY modal immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPrintableDoc(null);
        setShowAddSupplierModal(false);
        setShowQuickBatchModal(false);
        setShowAddTankModal(false);
        setEditingTank(null);
        setShowAddWhModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --------------------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // --------------------------------------------------------------------------
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Fetch live warehouses (all warehouses including Supersonic)
      const whRes = await fetch('/api/warehouses');
      const whJson = await whRes.json();
      if (whJson.success && Array.isArray(whJson.data)) {
        setWarehouses(whJson.data);
        if (whJson.data.length > 0) {
          // If current targetWarehouseId is not in the list, set to the first one
          setTargetWarehouseId(prev => (whJson.data.some((w: Warehouse) => w.id === prev) ? prev : whJson.data[0].id));
        }
      }

      // 2. Fetch live approved suppliers
      const supRes = await fetch('/api/getAllInvSuppliers');
      const supJson = await supRes.json();
      if (supJson.data && Array.isArray(supJson.data)) {
        setSuppliers(supJson.data);
        if (supJson.data.length > 0 && !selectedSupplierId) {
          setSelectedSupplierId(supJson.data[0].SUPPLIERID);
        }
      }

      // 3. Fetch oil grades dynamically
      const gradesRes = await fetch('/api/operations/commercial-oil?filter=grades');
      const gradesJson = await gradesRes.json();
      if (gradesJson.success && Array.isArray(gradesJson.data)) {
        setOilGrades(gradesJson.data);
        if (gradesJson.data.length > 0) {
          setSelectedOilGradeCode(gradesJson.data[0].code);
        }
      }

      // 4. Fetch commercial oil state (tanks, batches, vouchers, ledger, movements)
      const opRes = await fetch('/api/operations/commercial-oil');
      const opJson = await opRes.json();
      if (opJson.success && opJson.data) {
        const tList: StorageTank[] = opJson.data.tanks || [];
        setTanks(tList);
        setReceipts(opJson.data.receipts || []);
        setBatches(opJson.data.batches || []);
        setPackagingVouchers(opJson.data.packagingVouchers || []);
        setStocks(opJson.data.warehouseStocks || []);
        setMovements(opJson.data.movements || []);

        if (tList.length > 0 && !targetStorageId) {
          setTargetStorageId(tList[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load commercial oil operations data:', err);
      showToast('خطأ في تحميل البيانات من الخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSupplierId, targetStorageId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --------------------------------------------------------------------------
  // TAB 1: RECEIVE CALCULATIONS & ACTIONS
  // --------------------------------------------------------------------------
  const receiveTotals = useMemo(() => {
    let gallons = 0;
    let tins = 0;
    let drums = 0;
    let totalNet = 0;

    for (const r of containerRows) {
      const net = Math.max(0, Number(r.netKg) || 0);
      if (r.containerType === 'GALLON') gallons++;
      else if (r.containerType === 'TIN') tins++;
      else if (r.containerType === 'DRUM') drums++;
      totalNet += net;
    }

    const totalContainers = containerRows.length;
    const avgWeight = totalContainers > 0 ? totalNet / totalContainers : 0;

    return {
      gallons,
      tins,
      drums,
      totalContainers,
      totalNet: Math.round(totalNet * 100) / 100,
      avgWeight: Math.round(avgWeight * 100) / 100
    };
  }, [containerRows]);

  const handleAddContainerRow = () => {
    const lastRow = containerRows[containerRows.length - 1];
    const newRow: ContainerRow = {
      id: Date.now().toString(),
      containerType: lastRow ? lastRow.containerType : 'DRUM',
      netKg: lastRow ? lastRow.netKg : 100.0
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
    showToast(`تم تكرار العبوة (${dup.netKg} كغ) بنجاح`, 'info');
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
    showToast(`تمت إضافة ${count} عبوة (${quickBatchType === 'DRUM' ? 'برميل' : quickBatchType === 'TIN' ? 'تنكة' : 'غالون'}) بوزن ${weight} كغ`, 'success');
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
    if (!selectedSupplierId) {
      showToast('يرجى تحديد المورد أولاً', 'error');
      return;
    }
    if (containerRows.length === 0) {
      showToast('يرجى إضافة عبوة واحدة على الأقل بالجدول', 'error');
      return;
    }
    if (!targetStorageId) {
      showToast('يرجى تحديد الخزان المستهدف للتخزين', 'error');
      return;
    }

    const sup = suppliers.find(s => String(s.SUPPLIERID) === String(selectedSupplierId));
    if (!sup) {
      showToast('المورد المحدد غير صالح', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        supplierId: sup.SUPPLIERID,
        supplierName: sup.SUPPLIERNAME,
        supplierPhone: sup.PHONE || '',
        supplierAddress: sup.ADDRESS || '',
        supplierAccountNo: sup.ACCOUNTNO || '',
        oilGrade: selectedOilGradeCode,
        acidity: acidityPercent,
        targetStorageId,
        containers: containerRows.map(c => ({
          containerType: c.containerType,
          netKg: c.netKg
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
        showToast(`تم حفظ وترحيل سند الاستلام بنجاح برقم: ${json.data.receiptNumber}`, 'success');
        setPrintableDoc({
          docType: 'RECEIPT',
          title: `سند استلام زيت تجاري - ${json.data.receiptNumber}`,
          refNumber: json.data.receiptNumber,
          date: json.data.date,
          content: json.data
        });
        await loadAllData();
        setIntakeNotes('');
        // Reset rows to fresh template
        setContainerRows([
          { id: '1', containerType: 'DRUM', netKg: 100.0 }
        ]);
      } else {
        showToast(json.error || 'فشل ترحيل الاستلام', 'error');
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
  const blendCalculations = useMemo(() => {
    let totalKg = 0;
    let weightedAciditySum = 0;
    const sourcesSummary: { tankId: string; tankName: string; withdrawn: number; acidity: number }[] = [];

    for (const [tankId, withdrawn] of Object.entries(withdrawals)) {
      const kg = Math.max(0, Number(withdrawn) || 0);
      if (kg > 0) {
        const tank = tanks.find(t => t.id === tankId);
        if (tank) {
          totalKg += kg;
          weightedAciditySum += (kg * tank.acidity);
          sourcesSummary.push({
            tankId: tank.id,
            tankName: tank.nameAr,
            withdrawn: kg,
            acidity: tank.acidity
          });
        }
      }
    }

    const avgAcidity = totalKg > 0 ? Math.round((weightedAciditySum / totalKg) * 100) / 100 : 0;
    const volumeLiters = Math.round((totalKg / densityFactor) * 100) / 100;

    return {
      totalKg: Math.round(totalKg * 100) / 100,
      avgAcidity,
      volumeLiters,
      sourcesSummary
    };
  }, [withdrawals, tanks, densityFactor]);

  const handleUpdateWithdrawal = (tankId: string, kg: number) => {
    setWithdrawals(prev => ({
      ...prev,
      [tankId]: Math.max(0, kg)
    }));
  };

  const handleCreateBlend = async () => {
    if (blendCalculations.totalKg <= 0) {
      showToast('يرجى تحديد أوزان صالحة مسحوبة من الخزانات', 'error');
      return;
    }

    // Verify balances
    for (const src of blendCalculations.sourcesSummary) {
      const tank = tanks.find(t => t.id === src.tankId);
      if (tank && src.withdrawn > tank.currentKg) {
        showToast(`الرصيد المتاح في ${tank.nameAr} لا يكفي (${tank.currentKg} كغ متاح، والمطلوب ${src.withdrawn} كغ)`, 'error');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        batchName: blendName,
        operator: blendOperator,
        sources: blendCalculations.sourcesSummary.map(s => ({
          sourceId: s.tankId,
          withdrawnKg: s.withdrawn
        })),
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
        showToast(`تم اعتماد خلطة الزيت بنجاح برقم: ${json.data.batchNumber}`, 'success');
        setPrintableDoc({
          docType: 'BLEND',
          title: `محضر تشغيل خلطة زيت - ${json.data.batchNumber}`,
          refNumber: json.data.batchNumber,
          date: json.data.date,
          content: json.data
        });
        await loadAllData();
        setWithdrawals({});
        setActiveTab('PACKAGING'); // Advance seamlessly to Packaging
      } else {
        showToast(json.error || 'فشل اعتماد الخلطة', 'error');
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
    return Math.round((activeBatchWeight / densityFactor) * 100) / 100;
  }, [activeBatchWeight, densityFactor]);

  const packagingCalculations = useMemo(() => {
    let totalPieces = 0;
    let totalLiters = 0;
    let totalConsumedKg = 0;

    const skuBreakdown = STANDARD_PACKAGING_SIZES.map(std => {
      const inp = skuInputs[std.skuId] || { boxCapacity: std.defaultBoxCap, boxes: 0, loosePieces: 0 };
      const boxCap = Number(inp.boxCapacity) > 0 ? Number(inp.boxCapacity) : std.defaultBoxCap;
      const boxes = Math.max(0, Number(inp.boxes) || 0);
      const loose = Math.max(0, Number(inp.loosePieces) || 0);
      const units = (boxes * boxCap) + loose;

      const liters = Math.round((units * (std.sizeMl / 1000)) * 1000) / 1000;
      const consumedKg = Math.round((liters * densityFactor) * 100) / 100;

      totalPieces += units;
      totalLiters += liters;
      totalConsumedKg += consumedKg;

      return {
        ...std,
        boxCapacity: boxCap,
        boxes,
        loosePieces: loose,
        totalUnits: units,
        totalLiters: liters,
        consumedKg
      };
    });

    totalConsumedKg = Math.round(totalConsumedKg * 100) / 100;
    totalLiters = Math.round(totalLiters * 100) / 100;

    const lossKg = Math.round(Math.max(0, activeBatchWeight - totalConsumedKg) * 100) / 100;
    const lossPercent = activeBatchWeight > 0 ? Math.round((lossKg / activeBatchWeight) * 10000) / 100 : 0;

    return {
      totalPieces,
      totalLiters,
      totalConsumedKg,
      lossKg,
      lossPercent,
      skuBreakdown
    };
  }, [skuInputs, activeBatchWeight, densityFactor]);

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
        showToast(`${t.packagingSuccess} ${json.data.voucherNumber}`, 'success');
        setPrintableDoc({
          docType: 'PACKAGING',
          title: `سند ترحيل إنتاج وتعبئة - ${json.data.voucherNumber}`,
          refNumber: json.data.voucherNumber,
          date: json.data.date,
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
  // TAB 4 & 5: TANKS & WAREHOUSES CRUD ACTIONS (ADMIN)
  // --------------------------------------------------------------------------
  const handleSaveTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTankNameAr.trim()) {
      showToast('يرجى إدخال اسم الخزان بالعربية', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(editingTank);
      const action = isEdit ? 'UPDATE_TANK' : 'CREATE_TANK';
      const payload: any = {
        code: newTankCode.trim() || undefined,
        name: newTankNameEn.trim() || newTankNameAr,
        nameAr: newTankNameAr.trim(),
        capacityKg: Number(newTankCapacityKg) || 25000,
        grade: newTankGrade,
        gradeNameAr: oilGrades.find(g => g.code === newTankGrade)?.nameAr || 'بكر ممتاز (EVOO)',
        acidity: Number(newTankAcidity) || 0.65,
        location: newTankLocation || 'Warehouse Tank Farm'
      };

      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: editingTank?.id, payload })
      });
      const json = await res.json();
      if (json.success) {
        showToast(isEdit ? 'تم تحديث بيانات الخزان بنجاح' : 'تم إنشاء الخزان الجديد بنجاح', 'success');
        await loadAllData();
        setShowAddTankModal(false);
        setEditingTank(null);
        setNewTankNameAr('');
        setNewTankNameEn('');
        setNewTankCode('');
      } else {
        showToast(json.error || 'فشل حفظ الخزان', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ في حفظ الخزان', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الخزان؟ لا يمكن التراجع عن هذه الخطوة.')) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_TANK', id })
      });
      const json = await res.json();
      if (json.success) {
        showToast('تم حذف الخزان بنجاح', 'success');
        await loadAllData();
      } else {
        showToast(json.error || 'فشل حذف الخزان', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطأ في حذف الخزان', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhNameAr.trim()) {
      showToast('اسم المستودع مطلوب', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newWhCode.trim() || `WH-CUSTOM-${Date.now().toString().slice(-4)}`,
          name: newWhNameEn.trim() || newWhNameAr,
          nameAr: newWhNameAr.trim(),
          type: newWhType,
          location: newWhLocation || 'Marjeyoun Main Plant',
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

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const q = supplierSearch.toLowerCase();
    return suppliers.filter(s =>
      s.SUPPLIERNAME.toLowerCase().includes(q) ||
      (s.PHONE && s.PHONE.includes(q))
    );
  }, [suppliers, supplierSearch]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
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

      {/* TOP HEADER BAR (Distinct branding for Operator vs Admin) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white ${
              userMode === 'OPERATOR' ? 'bg-emerald-600' : 'bg-indigo-700'
            }`}>
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  {userMode === 'OPERATOR' ? t.appTitleOperator : t.appTitleAdmin}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  userMode === 'OPERATOR'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {userMode === 'OPERATOR' ? t.operatorMode : t.adminMode}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t.companyName} — {t.companySubtitle}
              </p>
            </div>
          </div>

          {/* User Profile, Mode Switcher & Quick Language Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Active User Badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-bold text-slate-900 block leading-tight">{activeUser?.name || 'Mohammed Jichi'}</span>
                <span className="text-[10px] text-slate-500">{activeUser?.role || (userMode === 'OPERATOR' ? 'Field Operator' : 'Manager')}</span>
              </div>
            </div>

            {/* Language Switcher Buttons (AR / EN / FR / ES) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              {(['ar', 'en', 'fr', 'es'] as const).map(lng => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLanguage(lng)}
                  className={`px-2 py-1 rounded transition-colors uppercase ${
                    language === lng ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            {/* RBAC Mode Switcher (Always available to test Operator vs Admin) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUserMode('OPERATOR')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                  userMode === 'OPERATOR'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="تفعيل واجهة المشغل الميداني (حجب السايدبار والأدوات الإدارية)"
              >
                <Lock className="w-3.5 h-3.5" />
                مشغل
              </button>
              <button
                type="button"
                onClick={() => setUserMode('ADMIN')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                  userMode === 'ADMIN'
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="تفعيل واجهة الإدارة والتحكم الكامل"
              >
                <Unlock className="w-3.5 h-3.5" />
                إدارة
              </button>
            </div>

            {/* Refresh Data Button */}
            <button
              onClick={loadAllData}
              title={t.refresh}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Quick Exit / Backoffice navigation */}
            <Link
              href="/backoffice"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              خروج
            </Link>
          </div>
        </div>

        {/* Global Key Metrics KPI Bar */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-500">{t.totalBulkBalance}:</span>
                <span className="font-black text-slate-900">{totalRawOilKg.toLocaleString()} كغ</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-500">{t.readyBatches}:</span>
                <span className="font-black text-slate-900">{readyBatchesCount} خلطة</span>
              </div>
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" />
                <span className="text-slate-500">{t.packagedUnits}:</span>
                <span className="font-black text-slate-900">{totalPackagedPieces.toLocaleString()} عبوة</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {userMode === 'OPERATOR' ? 'وضع المشغل الميداني (حفظ وترحيل)' : 'وضع الإدارة الشاملة (تحكم كامل)'}
            </div>
          </div>
        </div>

        {/* PRIMARY STAGE NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-200 overflow-x-auto">
          {/* Tab 1: Receive (Operator & Admin) */}
          <button
            onClick={() => setActiveTab('RECEIVE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'RECEIVE'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Package className="w-4 h-4" />
            {t.tabReceive}
          </button>

          {/* Tab 2: Blending (Operator & Admin) */}
          <button
            onClick={() => setActiveTab('BLENDING')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'BLENDING'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            {t.tabBlending}
          </button>

          {/* Tab 3: Packaging (Operator & Admin) */}
          <button
            onClick={() => setActiveTab('PACKAGING')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'PACKAGING'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Boxes className="w-4 h-4" />
            {t.tabPackaging}
          </button>

          {/* Admin Only Tabs */}
          {userMode === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('TANKS')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'TANKS'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <WarehouseIcon className="w-4 h-4" />
                {t.tabTanks}
              </button>

              <button
                onClick={() => setActiveTab('WAREHOUSES')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'WAREHOUSES'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {t.tabWarehouses}
              </button>

              <button
                onClick={() => setActiveTab('LOGS')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'LOGS'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                {t.tabLogs}
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ================================================================= */}
        {/* STAGE 1: UNIT-BY-UNIT OIL RECEIVING (GALLON, TIN, DRUM)           */}
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
                    ربط حي مع جدول الموردين المعتمدين، تسجيل وزن كل برميل، تنكة، أو غالون بشكل فردي، واحتساب إجمالي الوزن الصافي فورياً.
                  </p>
                </div>

                {/* Only Admin can add new suppliers */}
                {userMode === 'ADMIN' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSupplierModal(true)}
                      className="px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      {t.addSupplier}
                    </button>
                  </div>
                )}
              </div>

              {/* Form Input Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* 1. Supplier Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {t.supplier}
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
                </div>

                {/* 2. Oil Grade (Dynamic from DB) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-slate-500" />
                    {t.oilGrade}
                  </label>
                  <select
                    value={selectedOilGradeCode}
                    onChange={(e) => setSelectedOilGradeCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {oilGrades.map(g => (
                      <option key={g.id} value={g.code}>
                        {language === 'ar' ? g.nameAr : g.nameEn} (حتى {g.maxAcidity}% حموضة)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Acidity % */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                    {t.acidity}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.05"
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
                    {t.storageTank}
                  </label>
                  <select
                    value={targetStorageId}
                    onChange={(e) => setTargetStorageId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {tanks.map(tank => (
                      <option key={tank.id} value={tank.id}>
                        {tank.nameAr} ({tank.code}) — رصيد: {tank.currentKg} كغ
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">تاريخ الاستلام:</label>
                  <input
                    type="date"
                    value={intakeDate}
                    onChange={(e) => setIntakeDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">اسم الموظف المستلم (تلقائي):</label>
                  <input
                    type="text"
                    disabled
                    value={receiverName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">ملاحظات الاستلام:</label>
                  <input
                    type="text"
                    value={intakeNotes}
                    onChange={(e) => setIntakeNotes(e.target.value)}
                    placeholder="ملاحظات الجودة أو فحص الرائحة والنقاوة"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* CONTAINER-BY-CONTAINER WEIGHT ENTRY SECTION */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    {t.containerWeights}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {containerRows.length} {t.registeredContainers}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddContainerRow}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    {t.newContainer}
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicateLastRow}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1 shadow-2xs"
                    title="تكرار سريع لنفس وزن العبوة السابقة لتسريع عملية الوزن على القبان"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-700" />
                    {t.duplicateLast}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuickBatchModal(true)}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-700" />
                    {t.batchAdd}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من تفريغ كافة بنود جدول الأوزان؟')) {
                        setContainerRows([]);
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    {t.clearTable}
                  </button>
                </div>
              </div>

              {/* TABLE OF CONTAINERS (Plastic Gallon, Metal Tin, Drum) */}
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
                                const val = e.target.value as 'GALLON' | 'TIN' | 'DRUM';
                                const updated = [...containerRows];
                                updated[index].containerType = val;
                                // Auto set default weights if unchanged
                                if (val === 'DRUM' && (updated[index].netKg === 16.2 || updated[index].netKg === 17.0)) {
                                  updated[index].netKg = 100.0;
                                } else if (val === 'GALLON' && updated[index].netKg === 100.0) {
                                  updated[index].netKg = 16.2;
                                } else if (val === 'TIN' && updated[index].netKg === 100.0) {
                                  updated[index].netKg = 17.0;
                                }
                                setContainerRows(updated);
                              }}
                              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="GALLON">غالون بلاستيك (Plastic Gallon - 16.2 kg)</option>
                              <option value="TIN">تنكة حديد (Metal Tin - 17.0 kg)</option>
                              <option value="DRUM">برميل (Drum / Barrel) — 100 كغ افتراضي</option>
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
                                className="w-36 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                          <td colSpan={4} className="p-8 text-center text-slate-400">
                            لا توجد عبوات مسجلة حالياً. اضغط على "+ عبوة جديدة" للبدء بالوزن على القبان.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REAL-TIME TOTALS & SUMMARY CARD (Gallons, Tins, Drums, Total Containers, Total Net KG) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block">{t.totalGallons}</span>
                    <span className="text-sm font-black text-slate-800">{receiveTotals.gallons} غالون</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.totalTins}</span>
                    <span className="text-sm font-black text-slate-800">{receiveTotals.tins} تنكة</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.totalDrums}</span>
                    <span className="text-sm font-black text-amber-700">{receiveTotals.drums} برميل</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.totalContainers}</span>
                    <span className="text-sm font-black text-indigo-700">{receiveTotals.totalContainers} عبوة</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">{t.totalNetKg}</span>
                    <span className="text-base font-black text-emerald-700">{receiveTotals.totalNet.toLocaleString()} كغ</span>
                    <span className="text-[10px] text-slate-400 block">{t.avgPerContainer} {receiveTotals.avgWeight} كغ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting || containerRows.length === 0}
                    onClick={handleSubmitIntake}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {t.saveAndPostIntake}
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
                    سحب الزيت بالكيلوغرام مباشرة من الخزانات، خصم فوري وذري للرصيد، واحتساب آلي لمتوسط الحموضة التقديري للدفعة.
                  </p>
                </div>
              </div>

              {/* Batch Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">{t.batchName}</label>
                  <input
                    type="text"
                    value={blendName}
                    onChange={(e) => setBlendName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="مثال: خلطة رقم 104 للتعبئة الفاخرة"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">{t.operator}</label>
                  <input
                    type="text"
                    disabled
                    value={blendOperator}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">{t.batchNotes}</label>
                  <input
                    type="text"
                    value={blendNotes}
                    onChange={(e) => setBlendNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    {t.availableSources}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  إجمالي الخزانات: <span className="font-bold text-slate-800">{tanks.length}</span>
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
                            style={{ width: `${Math.min(100, (tank.currentKg / (tank.capacityKg || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Input for net weight withdrawal */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1">
                          <label className="font-bold text-slate-700 block mb-1">
                            {t.withdrawnKgFromTank}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={tank.currentKg}
                              step="1"
                              value={currentWithdrawn || ''}
                              onChange={(e) => handleUpdateWithdrawal(tank.id, Number(e.target.value))}
                              placeholder="0"
                              className="w-36 bg-white border border-slate-300 rounded-md px-3 py-1.5 font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                            <span className="text-slate-500 font-bold">كغ</span>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="text-[11px] text-slate-500 block">الرصيد المتبقي بعد السحب:</span>
                          <span className={`text-xs font-black ${remaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {remaining.toLocaleString()} كغ
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REAL-TIME BLEND CALCULATIONS & ACTION CARD */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block mb-1">{t.totalWithdrawnWeight}</span>
                    <span className="text-xl font-black text-emerald-800">
                      {blendCalculations.totalKg.toLocaleString()} كغ
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.weightedAcidity}</span>
                    <span className="text-xl font-black text-amber-800">
                      {blendCalculations.avgAcidity}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">محسوب حسب أوزان المصادر</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.densityFactor}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.001"
                        min="0.800"
                        max="1.100"
                        value={densityFactor}
                        onChange={(e) => setDensityFactor(Number(e.target.value))}
                        className="w-20 bg-white border border-emerald-300 rounded p-1 font-black text-slate-900 text-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">كغ/ليتر</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.estimatedVolumeL}</span>
                    <span className="text-xl font-black text-indigo-800">
                      {blendCalculations.volumeLiters.toLocaleString()} L
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={isSubmitting || blendCalculations.totalKg <= 0}
                    onClick={handleCreateBlend}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {t.commitBlend}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 3: PACKAGING & UNBLOCKED WAREHOUSE DISPATCH                 */}
        {/* ================================================================= */}
        {activeTab === 'PACKAGING' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Batch Selector */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-indigo-600" />
                    تعبئة وتغليف الزيت التجاري — سعات الصناديق الحرة والترحيل للمستودع
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إدخال كميات العبوات لـ 8 مقاسات قياسية، سعات صناديق قابلة للتعديل يدوياً، احتساب آلي لنسبة الفاقد والترحيل الحر للمستودع المحدد.
                  </p>
                </div>
              </div>

              {/* Batch & Warehouse Configuration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* 1. Batch Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">{t.chooseBlendOrManual}</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">{t.manualCustomBatch}</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber}: {b.batchName} ({b.totalBatchKg} كغ - {b.weightedAvgAcidity}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Batch Weight in KG */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">{t.batchWeightKg}</label>
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

                {/* 3. DENSITY FACTOR */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>{t.densityFactor}</span>
                    <span className="text-[10px] text-emerald-700 font-bold">{t.densityHint}</span>
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

                {/* 4. Target Warehouse Selection (UNBLOCKED & INTERACTIVE) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>{t.targetWarehouse}</span>
                    <span className="text-[10px] text-indigo-700 font-bold">تفاعلي وحر</span>
                  </label>
                  <select
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(e.target.value)}
                    className="w-full bg-emerald-50/50 border-2 border-emerald-500/60 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr} ({w.code}) {!w.isDriverVisible ? '— [محجوب عن السائقين]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Volume Conversion Banner */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between text-xs text-emerald-950">
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
                    {t.packagingTable}
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
                        <th className="p-3">{t.skuSize}</th>
                        <th className="p-3 w-32">
                          {t.boxCap}
                        </th>
                        <th className="p-3 w-28">
                          {t.boxesCount}
                        </th>
                        <th className="p-3 w-28">
                          {t.loosePieces}
                        </th>
                        <th className="p-3 w-32">
                          {t.totalPieces}
                        </th>
                        <th className="p-3 w-32">
                          {t.volumeL}
                        </th>
                        <th className="p-3 w-32">
                          {t.consumedKg}
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

              {/* PACKAGING RECONCILIATION & DISPATCH ACTION CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block mb-1">{t.totalProducedPieces}</span>
                    <span className="text-xl font-black text-indigo-700">
                      {packagingCalculations.totalPieces.toLocaleString()} حبة
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      إجمالي الحجم: {packagingCalculations.totalLiters.toLocaleString()} L
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.actualConsumedKg}</span>
                    <span className="text-xl font-black text-emerald-700">
                      {packagingCalculations.totalConsumedKg.toLocaleString()} كغ
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      من أصل وزن الخلطة: {activeBatchWeight} كغ
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.packagingLoss}</span>
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
                    <span className="text-slate-500 block mb-1">{t.reconciledWarehouse}</span>
                    <select
                      value={targetWarehouseId}
                      onChange={(e) => setTargetWarehouseId(e.target.value)}
                      className="bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900 text-xs w-full focus:ring-2 focus:ring-emerald-500"
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.nameAr}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      ترحيل فوري لرصيد المخزون الفعلي
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
                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {t.saveAndPostPackaging}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 4: TANKS & BULK STORAGE MANAGEMENT (ADMIN ONLY)             */}
        {/* ================================================================= */}
        {userMode === 'ADMIN' && activeTab === 'TANKS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <WarehouseIcon className="w-5 h-5 text-indigo-600" />
                  {t.tanksManagementTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  تعريف وتسمية صهاريج وخزانات المعمل، تحديد سعاتها بالكيلوغرام، ومتابعة الأرصدة والحموضة بدقة.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTank(null);
                  setNewTankCode(`TK-${(tanks.length + 1).toString().padStart(2, '0')}`);
                  setNewTankNameAr('');
                  setNewTankNameEn('');
                  setNewTankCapacityKg(25000);
                  setShowAddTankModal(true);
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                {t.addNewTank}
              </button>
            </div>

            {/* Tanks Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tanks.map(tank => (
                <div key={tank.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-black text-xs text-slate-800">
                          {tank.code}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm">{tank.nameAr}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{tank.name}</p>
                      <p className="text-[11px] text-slate-400">{tank.location}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTank(tank);
                          setNewTankCode(tank.code);
                          setNewTankNameAr(tank.nameAr);
                          setNewTankNameEn(tank.name);
                          setNewTankCapacityKg(tank.capacityKg);
                          setNewTankGrade(tank.grade);
                          setNewTankAcidity(tank.acidity);
                          setNewTankLocation(tank.location);
                          setShowAddTankModal(true);
                        }}
                        title="تعديل الخزان"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTank(tank.id)}
                        title="حذف الخزان"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">الرصيد: <b className="text-slate-900">{tank.currentKg.toLocaleString()} كغ</b></span>
                      <span className="text-slate-400">السعة: {tank.capacityKg.toLocaleString()} كغ</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(100, (tank.currentKg / (tank.capacityKg || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {tank.gradeNameAr}
                    </span>
                    <span className="font-black text-amber-800">
                      حموضة: {tank.acidity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 5: REAL DYNAMIC WAREHOUSES & STOCK LEDGER (ADMIN ONLY)      */}
        {/* ================================================================= */}
        {userMode === 'ADMIN' && activeTab === 'WAREHOUSES' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {t.warehousesTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  إدارة المستودعات، والتحكم في حجب مستودع السوبر سونيك عن السائقين، والاطلاع على أرصدة البضاعة الجاهزة.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddWhModal(true)}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                {t.addNewWarehouse}
              </button>
            </div>

            {/* Warehouses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map(wh => (
                <div key={wh.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-black text-xs text-slate-800">
                          {wh.code}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm">{wh.nameAr}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{wh.name}</p>
                      <p className="text-[11px] text-slate-400">{wh.location}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      !wh.isDriverVisible
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {!wh.isDriverVisible ? t.hiddenFromDrivers : t.visibleToDrivers}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">النوع: <b className="text-slate-800">{wh.type}</b></span>
                    <span className="text-slate-500">السعة: <b className="text-slate-800">{wh.capacityLiters.toLocaleString()} L</b></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Warehouses Stock Ledger Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                سجل أرصدة المنتجات المعبأة حسب المستودع (Live Stock Ledger)
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">المستودع</th>
                      <th className="p-3">الصنف والمقاس</th>
                      <th className="p-3">سعة الصندوق</th>
                      <th className="p-3">عدد الصناديق</th>
                      <th className="p-3">حبات فردية</th>
                      <th className="p-3">إجمالي الحبات</th>
                      <th className="p-3">الحجم (ليتر)</th>
                      <th className="p-3">الوزن التقديري (كغ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stocks.map((stk, idx) => {
                      const wh = warehouses.find(w => w.id === stk.warehouseId);
                      return (
                        <tr key={`${stk.warehouseId}-${stk.skuId}-${idx}`} className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold text-slate-900">
                            {wh?.nameAr || stk.warehouseId}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{stk.nameAr}</span>
                            <span className="text-[10px] text-slate-400">{stk.sizeMl} مل</span>
                          </td>
                          <td className="p-3">{stk.boxCapacity} حبة/صندوق</td>
                          <td className="p-3 font-black text-slate-800">{stk.boxesCount}</td>
                          <td className="p-3">{stk.loosePieces}</td>
                          <td className="p-3 font-black text-indigo-700">{stk.totalUnits.toLocaleString()} حبة</td>
                          <td className="p-3 font-bold text-slate-800">{stk.totalLiters.toLocaleString()} L</td>
                          <td className="p-3 font-black text-emerald-700">{stk.totalKg.toLocaleString()} كغ</td>
                        </tr>
                      );
                    })}
                    {stocks.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          لا توجد بضاعة مرحلة حالياً في المستودعات. قم بترحيل دفعة تعبئة لتحديث المخزون.
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
        {/* STAGE 6: OFFICIAL AUDIT LOGS & VOUCHER RECORDS (ADMIN ONLY)       */}
        {/* ================================================================= */}
        {userMode === 'ADMIN' && activeTab === 'LOGS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {t.tabLogs} — مستندات الاستلام والخلط والترحيل
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                سجل تاريخي كامل لكافة الحركات الميدانية المسجلة والمرحلة، مع إمكانية المعاينة والطباعة الرسمية.
              </p>
            </div>

            {/* Receipts History */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">سندات استلام الزيت التجاري</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم السند</th>
                      <th className="p-3">التاريخ والوقت</th>
                      <th className="p-3">المورد</th>
                      <th className="p-3">صنف الزيت</th>
                      <th className="p-3">الخزان المستهدف</th>
                      <th className="p-3">عدد العبوات</th>
                      <th className="p-3">الوزن الصافي</th>
                      <th className="p-3">المستلم</th>
                      <th className="p-3 text-center">معاينة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {receipts.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-slate-900">{r.receiptNumber}</td>
                        <td className="p-3 text-slate-600">{r.date} {r.time}</td>
                        <td className="p-3 font-bold text-slate-800">{r.supplierName}</td>
                        <td className="p-3">{r.oilGradeNameAr} ({r.acidity}%)</td>
                        <td className="p-3">{r.targetStorageNameAr}</td>
                        <td className="p-3 font-bold text-indigo-700">{r.totalContainers} عبوة</td>
                        <td className="p-3 font-black text-emerald-700">{r.totalNetKg} كغ</td>
                        <td className="p-3 text-slate-600">{r.receivedBy}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPrintableDoc({
                              docType: 'RECEIPT',
                              title: `سند استلام زيت تجاري - ${r.receiptNumber}`,
                              refNumber: r.receiptNumber,
                              date: r.date,
                              content: r
                            })}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="معاينة وطباعة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {receipts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-400">
                          لا توجد سندات استلام مسجلة حتى الآن.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Packaging Vouchers History */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">سندات ترحيل التعبئة للمستودعات</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم السند</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">المستودع المحال إليه</th>
                      <th className="p-3">الحبات المنتجة</th>
                      <th className="p-3">الحجم (L)</th>
                      <th className="p-3">الوزن المستهلك (كغ)</th>
                      <th className="p-3">الفاقد (Loss)</th>
                      <th className="p-3">المسؤول</th>
                      <th className="p-3 text-center">معاينة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {packagingVouchers.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                        <td className="p-3 text-slate-600">{v.date}</td>
                        <td className="p-3 font-bold text-slate-800">{v.targetWarehouseNameAr}</td>
                        <td className="p-3 font-black text-indigo-700">{v.totalPiecesProduced.toLocaleString()} حبة</td>
                        <td className="p-3 font-bold text-slate-800">{v.totalLitersPackaged.toLocaleString()} L</td>
                        <td className="p-3 font-black text-emerald-700">{v.totalConsumedKg.toLocaleString()} كغ</td>
                        <td className="p-3 font-bold text-slate-700">{v.packagingLossKg} كغ ({v.packagingLossPercent}%)</td>
                        <td className="p-3 text-slate-600">{v.operator}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPrintableDoc({
                              docType: 'PACKAGING',
                              title: `سند ترحيل إنتاج وتعبئة - ${v.voucherNumber}`,
                              refNumber: v.voucherNumber,
                              date: v.date,
                              content: v
                            })}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="معاينة وطباعة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {packagingVouchers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-400">
                          لا توجد سندات ترحيل تعبئة مسجلة حتى الآن.
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
      {/* MODAL 1: ADD NEW SUPPLIER (WITH BACKDROP DISMISS & ESC LISTENER)   */}
      {/* ================================================================= */}
      {showAddSupplierModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddSupplierModal(false); }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                إضافة مورد / تاجر زيت جديد
              </span>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المورد / الشركة:</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="مثال: مؤسسة الجنوب لتجارة الزيت"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">رقم الهاتف:</label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  placeholder="+961 70 123 456"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  placeholder="vendor@company.lb"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: QUICK BATCH ADD (GALLON, TIN, DRUM)                      */}
      {/* ================================================================= */}
      {showQuickBatchModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowQuickBatchModal(false); }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                إضافة دفعة عبوات متطابقة
              </span>
              <button
                type="button"
                onClick={() => setShowQuickBatchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نوع العبوة:</label>
                <select
                  value={quickBatchType}
                  onChange={(e) => {
                    const val = e.target.value as 'GALLON' | 'TIN' | 'DRUM';
                    setQuickBatchType(val);
                    if (val === 'DRUM') setQuickBatchWeight(100.0);
                    else if (val === 'GALLON') setQuickBatchWeight(16.2);
                    else if (val === 'TIN') setQuickBatchWeight(17.0);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                >
                  <option value="DRUM">برميل (Drum / Barrel) — 100 كغ</option>
                  <option value="GALLON">غالون بلاستيك (Plastic Gallon) — 16.2 كغ</option>
                  <option value="TIN">تنكة حديد (Metal Tin) — 17.0 كغ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">العدد المطلوب إضافته:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quickBatchCount}
                  onChange={(e) => setQuickBatchCount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">الوزن الافتراضي لكل عبوة (كغ):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quickBatchWeight}
                  onChange={(e) => setQuickBatchWeight(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-emerald-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickBatchModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleApplyQuickBatch}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  تأكيد الإضافة للجدول
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: ADD / EDIT TANK (ADMIN ONLY)                             */}
      {/* ================================================================= */}
      {showAddTankModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddTankModal(false); }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-indigo-600" />
                {editingTank ? 'تعديل بيانات الخزان' : 'إضافة خزان جديد للمعمل'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddTankModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTank} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">كود الخزان:</label>
                  <input
                    type="text"
                    value={newTankCode}
                    onChange={(e) => setNewTankCode(e.target.value)}
                    placeholder="TK-01"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">السعة بالكغ:</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newTankCapacityKg}
                    onChange={(e) => setNewTankCapacityKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم الخزان بالعربية:</label>
                <input
                  type="text"
                  required
                  value={newTankNameAr}
                  onChange={(e) => setNewTankNameAr(e.target.value)}
                  placeholder="خزان بكر ممتاز رقم 01"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم الخزان بالإنجليزية:</label>
                <input
                  type="text"
                  value={newTankNameEn}
                  onChange={(e) => setNewTankNameEn(e.target.value)}
                  placeholder="Storage Tank 01"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">صنف الزيت المخصص:</label>
                  <select
                    value={newTankGrade}
                    onChange={(e) => setNewTankGrade(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    {oilGrades.map(g => (
                      <option key={g.id} value={g.code}>
                        {g.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الحموضة المرجعية (%):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="10"
                    value={newTankAcidity}
                    onChange={(e) => setNewTankAcidity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">موقع الخزان:</label>
                <input
                  type="text"
                  value={newTankLocation}
                  onChange={(e) => setNewTankLocation(e.target.value)}
                  placeholder="صالة الخزانات المركزية - Hall A"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTankModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  حفظ الخزان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: ADD WAREHOUSE (ADMIN ONLY)                               */}
      {/* ================================================================= */}
      {showAddWhModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddWhModal(false); }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {t.addNewWarehouse}
              </span>
              <button
                type="button"
                onClick={() => setShowAddWhModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المستودع بالعربية:</label>
                <input
                  type="text"
                  required
                  value={newWhNameAr}
                  onChange={(e) => setNewWhNameAr(e.target.value)}
                  placeholder="مثال: مستودع طرابلس المركزي"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">اسم المستودع بالإنجليزية:</label>
                <input
                  type="text"
                  value={newWhNameEn}
                  onChange={(e) => setNewWhNameEn(e.target.value)}
                  placeholder="Tripoli Distribution Hub"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">النوع:</label>
                  <select
                    value={newWhType}
                    onChange={(e) => setNewWhType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="FINISHED_GOODS">بضاعة جاهزة (Finished Goods)</option>
                    <option value="DISTRIBUTION_HUB">مركز توزيع لوجستي (Hub)</option>
                    <option value="RETAIL">معرض ونقطة بيع (Retail)</option>
                    <option value="QUARANTINE">حجر وفحص مخبري (QC)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">السعة بالليتر:</label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={newWhCapacity}
                    onChange={(e) => setNewWhCapacity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">الموقع الجغرافي:</label>
                <input
                  type="text"
                  value={newWhLocation}
                  onChange={(e) => setNewWhLocation(e.target.value)}
                  placeholder="مدينة المعارض - طرابلس"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">{t.driverVisibility}</span>
                  <span className="text-[10px] text-slate-500">حجب الأرصدة عن تطبيق السائقين (مثل سوبرسونيك)</span>
                </div>
                <input
                  type="checkbox"
                  checked={newWhDriverVisible}
                  onChange={(e) => setNewWhDriverVisible(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  حفظ المستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 5: AUTHENTIC PRINTABLE VOUCHER CARD (ZERO RAW JSON!)        */}
      {/* With Backdrop Click Dismiss & ESC Key Listener                    */}
      {/* ================================================================= */}
      {printableDoc && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPrintableDoc(null); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800 my-8">
            {/* Modal Top Actions Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {printableDoc.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {t.print}
                </button>
                <button
                  onClick={() => setPrintableDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title="إغلاق (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Printable Voucher Document */}
            <div className="p-8 space-y-6 print:p-0">
              {/* Corporate 3-Zone Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center text-xs">
                <div>
                  <h3 className="text-base font-black text-slate-900">{t.companyName}</h3>
                  <p className="text-[11px] text-slate-500">Southern Olive & Oil Products S.A.R.L</p>
                  <p className="text-[10px] text-slate-400">سجل تجاري: 22901 — النبطية ومرجعيون، لبنان</p>
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-emerald-800 px-3 py-1 bg-emerald-50 rounded border border-emerald-200 block">
                    {printableDoc.docType === 'RECEIPT' ? t.voucherReceipt :
                     printableDoc.docType === 'BLEND' ? t.voucherBlend :
                     t.voucherPackaging}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-900 mt-1 block">
                    {printableDoc.refNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    تاريخ الإصدار: {printableDoc.date}
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="font-bold text-slate-900">VANGUARD ERP</span>
                  <p className="text-[10px] text-slate-400">V-Oil Operations Hub</p>
                </div>
              </div>

              {/* Document Details Grid (NO RAW JSON!) */}
              {printableDoc.docType === 'RECEIPT' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">المورد / التاجر:</span>
                      <span className="font-black text-slate-900 text-sm">{printableDoc.content.supplierName}</span>
                      {printableDoc.content.supplierPhone && (
                        <span className="text-[11px] text-slate-500 block">هاتف: {printableDoc.content.supplierPhone}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 block">مكان التخزين / الخزان:</span>
                      <span className="font-black text-slate-900 text-sm">{printableDoc.content.targetStorageNameAr}</span>
                      <span className="text-[11px] text-emerald-700 block font-bold">صنف الزيت: {printableDoc.content.oilGradeNameAr} ({printableDoc.content.acidity}%)</span>
                    </div>
                  </div>

                  {/* Summary of Containers */}
                  <div className="grid grid-cols-4 gap-3 text-center text-xs bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                    <div>
                      <span className="text-slate-500 block">غالونات بلاستيك</span>
                      <span className="text-sm font-black text-slate-900">{printableDoc.content.gallonsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">تنكات حديد</span>
                      <span className="text-sm font-black text-slate-900">{printableDoc.content.tinsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">براميل (Drums)</span>
                      <span className="text-sm font-black text-amber-800">{printableDoc.content.drumsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إجمالي الوزن الصافي</span>
                      <span className="text-base font-black text-emerald-700">{printableDoc.content.totalNetKg} كغ</span>
                    </div>
                  </div>

                  {printableDoc.content.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="font-bold text-slate-700 ml-1">ملاحظات:</span>
                      {printableDoc.content.notes}
                    </div>
                  )}
                </div>
              )}

              {printableDoc.docType === 'BLEND' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-slate-500 block">إجمالي وزن الخلطة:</span>
                      <span className="font-black text-emerald-700 text-base">{printableDoc.content.totalBatchKg} كغ</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">متوسط الحموضة:</span>
                      <span className="font-black text-amber-800 text-base">{printableDoc.content.weightedAvgAcidity}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الحجم التقديري:</span>
                      <span className="font-black text-indigo-700 text-base">{printableDoc.content.estimatedVolumeLiters} L</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <span className="font-bold block">مصادر الخلطة المسحوبة:</span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="p-2">الخزان / المصدر</th>
                            <th className="p-2">الوزن المسحوب</th>
                            <th className="p-2">الحموضة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {printableDoc.content.sources?.map((s: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 font-bold">{s.sourceName}</td>
                              <td className="p-2 font-black text-emerald-700">{s.withdrawnKg} كغ</td>
                              <td className="p-2">{s.sourceAcidity}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {printableDoc.docType === 'PACKAGING' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-slate-500 block">المستودع المحال إليه:</span>
                      <span className="font-black text-slate-900 text-sm">{printableDoc.content.targetWarehouseNameAr}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إجمالي الحبات:</span>
                      <span className="font-black text-indigo-700 text-base">{printableDoc.content.totalPiecesProduced} حبة</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الوزن المستهلك:</span>
                      <span className="font-black text-emerald-700 text-base">{printableDoc.content.totalConsumedKg} كغ</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الفاقد (Loss):</span>
                      <span className="font-black text-slate-800 text-sm">{printableDoc.content.packagingLossKg} كغ ({printableDoc.content.packagingLossPercent}%)</span>
                    </div>
                  </div>

                  {/* SKUs Produced Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">الصنف المعبأ</th>
                          <th className="p-2">سعة الصندوق</th>
                          <th className="p-2">الصناديق</th>
                          <th className="p-2">حبات فردية</th>
                          <th className="p-2">إجمالي الحبات</th>
                          <th className="p-2">الحجم (L)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {printableDoc.content.skus?.filter((s: any) => s.totalPieces > 0).map((s: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold text-slate-900">{s.nameAr}</td>
                            <td className="p-2">{s.boxCapacity} حبة</td>
                            <td className="p-2 font-black">{s.boxes}</td>
                            <td className="p-2">{s.loosePieces}</td>
                            <td className="p-2 font-black text-indigo-700">{s.totalPieces} حبة</td>
                            <td className="p-2 font-bold">{s.totalLiters} L</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Official Signatures Footer */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-8">{t.receiverSignature}</span>
                  <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-8">{t.qcSignature}</span>
                  <div className="border-b border-dashed border-slate-300 w-32 mx-auto" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-8">{t.warehouseManagerSignature}</span>
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
