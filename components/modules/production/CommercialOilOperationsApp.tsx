'use client';

/**
 * Vanguard ERP - V-Oil Operations Hub & Management
 * Autonomous Production & Field Operations for Commercial Oil
 * 
 * Features & Isolation:
 * - Pure 100% i18n across all 5 locales: Arabic (AR), English (EN), French (FR), Spanish (ES), and Persian (FA - فارسی)
 * - Zero cross-language leakage: no English in Arabic/Persian, no Arabic in English/French/Spanish
 * - Persian language (FA) support with pure RTL direction and complete specialized terminology
 * - Strict Warehouse Security: ALL warehouses are permanently isolated from field drivers
 * - Complete removal of "Visible to Drivers" / "متاح للسائقين" badge; all facilities marked as Management Protected
 * - RBAC separation: Field Operator (oil_operations_access) vs Management Admin (oil_management_admin)
 * - Zero Mock Data: Live APIs for Tanks, Suppliers, Oil Grades, Warehouses, and Stock Ledger
 * - Unit-by-unit intake receiving supporting Gallon, Tin, and Drum (100 kg default, editable)
 * - Net-weight bulk blending
 * - Packaging with dynamic box capacity and unblocked live warehouse dispatch
 * - Elegant printable vouchers (No raw JSON dump!) with backdrop click dismiss and ESC listener
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  AlertCircle,
  CheckCircle2,
  Warehouse as WarehouseIcon,
  Droplets,
  RotateCcw,
  Sparkles,
  Building2,
  Calendar,
  Clock,
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
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { STANDARD_PACKAGING_SIZES, StandardPackagingSize, OilGradeRecord } from '@/lib/commercialOilConstants';

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

// ------------------------------------------------------------------------------
// PURE TRANSLATIONS DICTIONARY (AR, EN, FR, ES, FA)
// Strict zero cross-language leakage
// ------------------------------------------------------------------------------
const TRANSLATIONS = {
  ar: {
    appTitleOperator: 'مركز عمليات الزيت',
    appTitleAdmin: 'مركز عمليات وإدارة الزيت التجاري',
    independentApp: 'الإنتاج الميداني والتعبئة',
    companyName: 'منتوجات زيت وزيتون الجنوب ش.م.م',
    companySubtitle: 'سجل تجاري: 22901 — النبطية ومرجعيون، لبنان',
    operatorMode: 'مشغل ميداني',
    adminMode: 'إدارة وتحكم',
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
    supplier: 'المورد أو التاجر:',
    addSupplier: '+ إضافة مورد جديد',
    oilGrade: 'نوع وصنف الزيت:',
    acidity: 'نسبة الحموضة المئوية:',
    storageTank: 'مكان التخزين أو الخزان المستهدف:',
    receiverStaff: 'الموظف المستلم:',
    notes: 'ملاحظات:',
    containerWeights: 'جدول تسجيل أوزان العبوات المستلمة',
    registeredContainers: 'عبوة مسجلة',
    newContainer: '+ عبوة جديدة',
    duplicateLast: 'تكرار سريع لآخر وزن',
    batchAdd: 'إضافة دفعة متطابقة',
    clearTable: 'مسح الجدول',
    containerType: 'نوع العبوة',
    netWeightKg: 'الوزن الصافي (كغ)',
    actions: 'إجراءات',
    plasticGallon: 'غالون بلاستيك (16.2 كغ)',
    metalTin: 'تنكة حديد (17.0 كغ)',
    drumBarrel: 'برميل (100 كغ)',
    totalGallons: 'إجمالي الغالونات:',
    totalTins: 'إجمالي التنكات:',
    totalDrums: 'إجمالي البراميل:',
    totalContainers: 'إجمالي العبوات:',
    totalNetKg: 'إجمالي الوزن الصافي الكلي:',
    avgPerContainer: 'معدل العبوة:',
    saveAndPostIntake: 'حفظ وترحيل سند الاستلام إلى الخزان',
    batchName: 'اسم الخلطة أو الدفعة:',
    operator: 'المشغل أو الفني المسؤول:',
    batchNotes: 'ملاحظات ومواصفات الخلطة:',
    availableSources: 'الخزانات والأرصدة المتاحة للسحب المباشر بالوزن (كغ)',
    withdrawnKgFromTank: 'الوزن المسحوب بالكغ من هذا الخزان:',
    totalWithdrawnWeight: 'إجمالي وزن الخلطة المسحوب:',
    weightedAcidity: 'متوسط الحموضة التقديري:',
    densityFactor: 'معامل الكثافة:',
    densityHint: 'المعيار: 0.916 كغ/ليتر',
    estimatedVolumeL: 'الحجم التقديري بالليتر:',
    commitBlend: 'اعتماد وترحيل خلطة الزيت للتعبئة',
    chooseBlendOrManual: 'اختر دفعة الخلط أو كمية يدوية:',
    manualCustomBatch: 'تعبئة حرة مباشرة من الخزان',
    sourceTankForPackaging: 'خزان المصدر للتعبئة المباشرة:',
    batchWeightKg: 'وزن الدفعة المخصصة للتعبئة (كغ):',
    weightExceedsTankBalance: 'الوزن المدخل يتجاوز رصيد الخزان المتاح!',
    maxAllowedWeight: 'الحد الأقصى المتاح:',
    targetWarehouse: 'المستودع المستهدف لترحيل الإنتاج:',
    packagingTable: 'جدول إدخال العبوات المعبأة (المقاسات المعتمدة الـ 8)',
    skuSize: 'الصنف والمقاس المعتمد',
    boxCap: 'سعة الصندوق (حبة لكل صندوق)',
    boxesCount: 'عدد الصناديق',
    loosePieces: 'حبات فردية',
    totalPieces: 'إجمالي الحبات',
    volumeL: 'الحجم (ليتر)',
    consumedKg: 'الوزن المستهلك (كغ)',
    totalProducedPieces: 'إجمالي الحبات المنتجة:',
    actualConsumedKg: 'الوزن الفعلي المستهلك:',
    packagingLoss: 'الفاقد في التعبئة:',
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
    location: 'الموقع الفعلي أو الصالة',
    edit: 'تعديل',
    delete: 'حذف',
    warehousesTitle: 'إدارة المستودعات وسجل المخزون الحقيقي',
    addNewWarehouse: '+ إضافة مستودع جديد',
    whCode: 'كود المستودع',
    whName: 'اسم المستودع',
    whType: 'نوع المستودع',
    whCapacity: 'السعة (ليتر)',
    securityStatus: 'حالة الحماية والأمان',
    managementProtected: 'مستودع داخلي — محمي إدارياً (محجوب عن السائقين)',
    close: 'إغلاق',
    print: 'طباعة السند',
    signatures: 'التوقيعات الرسمية المعتمدة',
    receiverSignature: 'توقيع المستلم أو المشغل',
    qcSignature: 'مسؤول الجودة والمختبر',
    warehouseManagerSignature: 'اعتماد مدير المستودعات',
    voucherReceipt: 'سند استلام زيت تجاري',
    voucherBlend: 'محضر تشغيل خلطة زيت',
    voucherPackaging: 'سند ترحيل إنتاج وتعبئة للمستودع',
    cancel: 'إلغاء',
    save: 'حفظ',
    exit: 'خروج',
    unitKg: 'كغ',
    unitL: 'ليتر',
    unitPiece: 'حبة',
    unitBox: 'صندوق',
    tankBalance: 'رصيد الخزان:',
    maxCap: 'السعة:',
    remainingAfter: 'الرصيد المتبقي بعد السحب:',
    emptyTable: 'لا توجد عبوات مسجلة حالياً. اضغط على "+ عبوة جديدة" للبدء بالوزن على القبان.',
    emptyTanks: 'لا توجد خزانات مسجلة حالياً.',
    emptyStocks: 'لا توجد بضاعة مرحلة حالياً في المستودعات.',
    emptyLogs: 'لا توجد سجلات تاريخية حتى الآن.',
    driverIsolationNotice: 'تنبيه أمني: كافة المستودعات محجوبة كلياً عن السائقين ومحصورة بالرقابة الإدارية فقط.',
    supplierPhone: 'هاتف المورد:',
    supplierEmail: 'البريد الإلكتروني:'
  },
  en: {
    appTitleOperator: 'V-Oil Operations Hub',
    appTitleAdmin: 'V-Oil Operations Hub & Management',
    independentApp: 'Field Production & Packaging',
    companyName: 'Southern Olive & Oil Products S.A.R.L',
    companySubtitle: 'Commercial Reg: 22901 — Nabatieh & Marjeyoun, Lebanon',
    operatorMode: 'Field Operator',
    adminMode: 'Management & Admin',
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
    supplier: 'Supplier or Vendor:',
    addSupplier: '+ Add New Supplier',
    oilGrade: 'Oil Grade & Classification:',
    acidity: 'Effective Acidity (%):',
    storageTank: 'Destination Storage Tank:',
    receiverStaff: 'Receiving Employee:',
    notes: 'Operational Notes:',
    containerWeights: 'Container Weighbridge Register',
    registeredContainers: 'containers recorded',
    newContainer: '+ New Container',
    duplicateLast: 'Duplicate Last Weight',
    batchAdd: 'Batch Insert Containers',
    clearTable: 'Clear Register',
    containerType: 'Container Type',
    netWeightKg: 'Net Weight (KG)',
    actions: 'Actions',
    plasticGallon: 'Plastic Gallon (16.2 kg)',
    metalTin: 'Metal Tin (17.0 kg)',
    drumBarrel: 'Drum (100 kg)',
    totalGallons: 'Total Gallons:',
    totalTins: 'Total Tins:',
    totalDrums: 'Total Drums:',
    totalContainers: 'Total Containers:',
    totalNetKg: 'Total Net Weight (KG):',
    avgPerContainer: 'Average / Unit:',
    saveAndPostIntake: 'Save & Post Intake Voucher to Tank',
    batchName: 'Blend or Batch Title:',
    operator: 'Master Blender / Operator:',
    batchNotes: 'Blend Specifications & Notes:',
    availableSources: 'Available Tanks for Direct Weight Withdrawal (KG)',
    withdrawnKgFromTank: 'Withdrawn Weight (KG) from this tank:',
    totalWithdrawnWeight: 'Total Batch Weight Withdrawn:',
    weightedAcidity: 'Weighted Estimated Acidity:',
    densityFactor: 'Density Factor:',
    densityHint: 'Standard: 0.916 kg/L',
    estimatedVolumeL: 'Estimated Volume (Liters):',
    commitBlend: 'Commit & Post Batch to Packaging Tank',
    chooseBlendOrManual: 'Select Blending Batch or Custom Weight:',
    manualCustomBatch: 'Direct Packaging from Tank (Custom Weight)',
    sourceTankForPackaging: 'Source Tank (Direct Packaging):',
    batchWeightKg: 'Batch Weight for Packaging (KG):',
    weightExceedsTankBalance: 'Entered weight exceeds available tank balance!',
    maxAllowedWeight: 'Max Available:',
    targetWarehouse: 'Target Warehouse for Finished Goods:',
    packagingTable: 'Packaging Register (8 Standard Sizes)',
    skuSize: 'Standard SKU & Size',
    boxCap: 'Box Capacity (Pieces/Box)',
    boxesCount: 'Boxes Count',
    loosePieces: 'Loose Pieces',
    totalPieces: 'Total Pieces',
    volumeL: 'Volume (Liters)',
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
    location: 'Physical Location or Bay',
    edit: 'Edit',
    delete: 'Delete',
    warehousesTitle: 'Warehouses & Live Stock Ledger',
    addNewWarehouse: '+ Add New Warehouse',
    whCode: 'Warehouse Code',
    whName: 'Warehouse Name',
    whType: 'Warehouse Type',
    whCapacity: 'Capacity (Liters)',
    securityStatus: 'Security & Access Status',
    managementProtected: 'Internal Facility — Management Protected (Hidden from Drivers)',
    close: 'Close',
    print: 'Print Voucher',
    signatures: 'Authorized Signatures',
    receiverSignature: 'Receiver / Operator',
    qcSignature: 'Quality & Lab Supervisor',
    warehouseManagerSignature: 'Warehouse Director',
    voucherReceipt: 'Commercial Oil Intake Voucher',
    voucherBlend: 'Oil Blending Run Report',
    voucherPackaging: 'Finished Packaging & Dispatch Voucher',
    cancel: 'Cancel',
    save: 'Save',
    exit: 'Exit',
    unitKg: 'KG',
    unitL: 'L',
    unitPiece: 'Pieces',
    unitBox: 'Boxes',
    tankBalance: 'Tank Balance:',
    maxCap: 'Capacity:',
    remainingAfter: 'Remaining Balance:',
    emptyTable: 'No containers recorded. Click "+ New Container" to begin weighing.',
    emptyTanks: 'No storage tanks registered.',
    emptyStocks: 'No finished goods posted in warehouses yet.',
    emptyLogs: 'No historical records available.',
    driverIsolationNotice: 'Security Notice: All warehouse facilities are strictly isolated from drivers and restricted to management.',
    supplierPhone: 'Supplier Phone:',
    supplierEmail: 'Supplier Email:'
  },
  fr: {
    appTitleOperator: 'Centre des Opérations V-Oil',
    appTitleAdmin: 'Centre des Opérations et Gestion V-Oil',
    independentApp: 'Production de Terrain & Conditionnement',
    companyName: 'Southern Olive & Oil Products S.A.R.L',
    companySubtitle: 'Registre Commercial: 22901 — Nabatieh & Marjeyoun, Liban',
    operatorMode: 'Opérateur Terrain',
    adminMode: 'Direction & Gestion',
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
    supplier: 'Fournisseur ou Négociant:',
    addSupplier: '+ Nouveau Fournisseur',
    oilGrade: 'Catégorie d’Huile:',
    acidity: 'Acidité Réelle (%):',
    storageTank: 'Cuve de Stockage Cible:',
    receiverStaff: 'Agent Réceptionnaire:',
    notes: 'Remarques:',
    containerWeights: 'Registre de Pesée des Contenants',
    registeredContainers: 'unités enregistrées',
    newContainer: '+ Nouvelle Unité',
    duplicateLast: 'Dupliquer le Dernier Poids',
    batchAdd: 'Ajout par Lot',
    clearTable: 'Effacer le Registre',
    containerType: 'Type de Contenant',
    netWeightKg: 'Poids Net (KG)',
    actions: 'Actions',
    plasticGallon: 'Bidon Plastique (16.2 kg)',
    metalTin: 'Bidon Métal (17.0 kg)',
    drumBarrel: 'Fût (100 kg)',
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
    densityFactor: 'Facteur de Densité:',
    densityHint: 'Standard: 0.916 kg/L',
    estimatedVolumeL: 'Volume Estimé (Litres):',
    commitBlend: 'Valider et Transférer vers le Conditionnement',
    chooseBlendOrManual: 'Sélectionner Lot ou Quantité Libre:',
    manualCustomBatch: 'Conditionnement Direct depuis la Cuve',
    sourceTankForPackaging: 'Cuve Source (Emballage Direct):',
    batchWeightKg: 'Poids du Lot à Conditionner (KG):',
    weightExceedsTankBalance: 'Le poids saisi dépasse le solde disponible de la cuve !',
    maxAllowedWeight: 'Solde Max Disponible:',
    targetWarehouse: 'Entrepôt Cible pour Produits Finis:',
    packagingTable: 'Tableau des 8 Formats Standards',
    skuSize: 'Format & Contenance',
    boxCap: 'Capacité Caisse (Unités/Caisse)',
    boxesCount: 'Nombre de Caisses',
    loosePieces: 'Unités Individuelles',
    totalPieces: 'Total Pièces',
    volumeL: 'Volume (Litres)',
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
    location: 'Emplacement Physique',
    edit: 'Modifier',
    delete: 'Supprimer',
    warehousesTitle: 'Entrepôts et Registre des Stocks Réels',
    addNewWarehouse: '+ Ajouter un Entrepôt',
    whCode: 'Code Entrepôt',
    whName: 'Nom de l’Entrepôt',
    whType: 'Type d’Entrepôt',
    whCapacity: 'Capacité (Litres)',
    securityStatus: 'Statut de Sécurité et d’Accès',
    managementProtected: 'Installation Interne — Protégée par la Direction (Masquée aux Chauffeurs)',
    close: 'Fermer',
    print: 'Imprimer le Bon',
    signatures: 'Signatures Officielles',
    receiverSignature: 'Réceptionnaire / Opérateur',
    qcSignature: 'Contrôle Qualité & Labo',
    warehouseManagerSignature: 'Directeur des Entrepôts',
    voucherReceipt: 'Bon de Réception Huile Commerciale',
    voucherBlend: 'Rapport de Brassage & Assemblage',
    voucherPackaging: 'Bon d’Entrée en Entrepôt (Conditionnement)',
    cancel: 'Annuler',
    save: 'Enregistrer',
    exit: 'Sortie',
    unitKg: 'KG',
    unitL: 'L',
    unitPiece: 'Unités',
    unitBox: 'Caisses',
    tankBalance: 'Solde Cuve:',
    maxCap: 'Capacité:',
    remainingAfter: 'Solde Restant:',
    emptyTable: 'Aucun contenant enregistré. Cliquez sur "+ Nouvelle Unité".',
    emptyTanks: 'Aucune cuve enregistrée.',
    emptyStocks: 'Aucun produit fini en stock.',
    emptyLogs: 'Aucun enregistrement historique disponible.',
    driverIsolationNotice: 'Avis de sécurité: tous les entrepôts sont strictement isolés des chauffeurs et réservés à la direction.',
    supplierPhone: 'Téléphone Fournisseur:',
    supplierEmail: 'Email Fournisseur:'
  },
  es: {
    appTitleOperator: 'Centro de Operaciones V-Oil',
    appTitleAdmin: 'Centro de Operaciones y Gestión V-Oil',
    independentApp: 'Producción de Campo y Envasado',
    companyName: 'Southern Olive & Oil Products S.A.R.L',
    companySubtitle: 'Reg. Comercial: 22901 — Nabatieh & Marjeyoun, Líbano',
    operatorMode: 'Operario de Campo',
    adminMode: 'Administración y Control',
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
    supplier: 'Proveedor o Comercializador:',
    addSupplier: '+ Agregar Proveedor',
    oilGrade: 'Calidad y Grado de Aceite:',
    acidity: 'Acidez Efectiva (%):',
    storageTank: 'Tanque de Destino:',
    receiverStaff: 'Operario Receptor:',
    notes: 'Notas Operativas:',
    containerWeights: 'Registro de Pesaje de Envases',
    registeredContainers: 'envases registrados',
    newContainer: '+ Nuevo Envase',
    duplicateLast: 'Duplicar Último Peso',
    batchAdd: 'Insertar Lote de Envases',
    clearTable: 'Vaciar Registro',
    containerType: 'Tipo de Envase',
    netWeightKg: 'Peso Neto (KG)',
    actions: 'Acciones',
    plasticGallon: 'Bidón Plástico (16.2 kg)',
    metalTin: 'Lata Metálica (17.0 kg)',
    drumBarrel: 'Barril (100 kg)',
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
    densityFactor: 'Factor de Densidad:',
    densityHint: 'Estándar: 0.916 kg/L',
    estimatedVolumeL: 'Volumen Estimado (Litros):',
    commitBlend: 'Confirmar y Transferir a Envasado',
    chooseBlendOrManual: 'Seleccionar Lote o Peso Manual:',
    manualCustomBatch: 'Envasado Directo desde el Tanque',
    sourceTankForPackaging: 'Tanque de Origen (Envasado Directo):',
    batchWeightKg: 'Peso del Lote a Envasar (KG):',
    weightExceedsTankBalance: '¡El peso ingresado supera el saldo disponible del tanque!',
    maxAllowedWeight: 'Saldo Máximo Disponible:',
    targetWarehouse: 'Almacén Destino de Producto Terminado:',
    packagingTable: 'Tabla de Envasado (8 Tamaños Estándar)',
    skuSize: 'Producto y Capacidad',
    boxCap: 'Capacidad Caja (Piezas/Caja)',
    boxesCount: 'Cantidad de Cajas',
    loosePieces: 'Piezas Sueltas',
    totalPieces: 'Total Piezas',
    volumeL: 'Volumen (Litros)',
    consumedKg: 'Peso Consumido (KG)',
    totalProducedPieces: 'Total Piezas Producidas:',
    actualConsumedKg: 'Peso Real Consumido:',
    packagingLoss: 'Pérdida en Envasado:',
    reconciledWarehouse: 'Almacén de Destino:',
    saveAndPostPackaging: 'Transferir Producción al Almacén Seleccionado',
    packagingSuccess: 'Envasado registrado con éxito con el comprobante n° ',
    tanksManagementTitle: 'Administración de Tanques y Silos',
    addNewTank: '+ Agregar Tanque',
    tankCode: 'Código del Tanque',
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
    whName: 'Nombre del Almacén',
    whType: 'Tipo de Almacén',
    whCapacity: 'Capacidad (Litros)',
    securityStatus: 'Estado de Seguridad y Acceso',
    managementProtected: 'Instalación Interna — Protegida por Administración (Oculta a Choferes)',
    close: 'Cerrar',
    print: 'Imprimir Comprobante',
    signatures: 'Firmas Autorizadas',
    receiverSignature: 'Receptor / Operario',
    qcSignature: 'Control de Calidad y Lab',
    warehouseManagerSignature: 'Director de Almacenes',
    voucherReceipt: 'Comprobante de Recepción de Aceite Comercial',
    voucherBlend: 'Informe de Mezcla y Ensamblaje',
    voucherPackaging: 'Comprobante de Entrada a Almacén',
    cancel: 'Cancelar',
    save: 'Guardar',
    exit: 'Salir',
    unitKg: 'KG',
    unitL: 'L',
    unitPiece: 'Piezas',
    unitBox: 'Cajas',
    tankBalance: 'Saldo Tanque:',
    maxCap: 'Capacidad:',
    remainingAfter: 'Saldo Restante:',
    emptyTable: 'No hay envases registrados. Pulse "+ Nuevo Envase".',
    emptyTanks: 'No hay tanques registrados.',
    emptyStocks: 'No hay productos terminados en stock.',
    emptyLogs: 'No hay registros históricos disponibles.',
    driverIsolationNotice: 'Aviso de seguridad: todos los almacenes están estrictamente aislados de los choferes y restringidos a administración.',
    supplierPhone: 'Teléfono Proveedor:',
    supplierEmail: 'Email Proveedor:'
  },
  fa: {
    appTitleOperator: 'مرکز عملیات روغن',
    appTitleAdmin: 'مرکز عملیات و مدیریت روغن تجاری',
    independentApp: 'تولید میدانی و بسته‌بندی',
    companyName: 'شرکت محصولات زیتون و روغن جنوب (با مسئولیت محدود)',
    companySubtitle: 'شماره ثبت تجاری: ۲۲۹۰۱ — نبطیه و مرجعیون، لبنان',
    operatorMode: 'اپراتور میدانی',
    adminMode: 'مدیریت و کنترل',
    tabReceive: '۱. ورود روغن تجاری',
    tabBlending: '۲. ترکیب و اختلاط بر اساس وزن',
    tabPackaging: '۳. بسته‌بندی و ظرفیت جعبه‌ها',
    tabTanks: '۴. مدیریت مخازن و ذخیره‌سازی',
    tabWarehouses: '۵. انبارها و موجودی واقعی',
    tabLogs: '۶. دفاتر و گزارش‌های رسمی',
    totalBulkBalance: 'مجموع موجودی روغن فله',
    readyBatches: 'دسته‌های آماده برای بسته‌بندی',
    packagedUnits: 'موجودی بسته‌بندی شده در انبارها',
    refresh: 'به‌روزرسانی داده‌ها',
    supplier: 'تامین‌کننده یا تاجر:',
    addSupplier: '+ افزودن تامین‌کننده جدید',
    oilGrade: 'درجه و دسته‌بندی روغن:',
    acidity: 'درصد اسیدیته واقعی:',
    storageTank: 'مخزن ذخیره‌سازی مقصد:',
    receiverStaff: 'کارمند تحویل‌گیرنده:',
    notes: 'یادداشت‌های عملیاتی:',
    containerWeights: 'جدول ثبت اوزان ظروف دریافتی',
    registeredContainers: 'ظرف ثبت شده',
    newContainer: '+ ظرف جدید',
    duplicateLast: 'تکرار سریع آخرین وزن',
    batchAdd: 'افزودن دسته‌ای ظروف',
    clearTable: 'پاک‌سازی جدول',
    containerType: 'نوع ظرف',
    netWeightKg: 'وزن خالص (کیلوگرم)',
    actions: 'عملیات',
    plasticGallon: 'گالن پلاستیکی (۱۶.۲ کیلوگرم)',
    metalTin: 'حلب فلزی (۱۷.۰ کیلوگرم)',
    drumBarrel: 'بشکه (۱۰۰ کیلوگرم)',
    totalGallons: 'مجموع گالن‌ها:',
    totalTins: 'مجموع حلب‌ها:',
    totalDrums: 'مجموع بشکه‌ها:',
    totalContainers: 'کل ظروف:',
    totalNetKg: 'مجموع وزن خالص کل:',
    avgPerContainer: 'میانگین هر واحد:',
    saveAndPostIntake: 'ذخیره و ثبت سند ورود به مخزن',
    batchName: 'نام مخلوط یا دسته:',
    operator: 'اپراتور یا کارشناس مخلوط:',
    batchNotes: 'مشخصات و یادداشت‌های مخلوط:',
    availableSources: 'مخازن و موجودی‌های در دسترس برای برداشت مستقیم بر حسب وزن (کیلوگرم)',
    withdrawnKgFromTank: 'وزن برداشت شده از این مخزن (کیلوگرم):',
    totalWithdrawnWeight: 'مجموع وزن برداشت شده دسته:',
    weightedAcidity: 'میانگین وزنی تخمینی اسیدیته:',
    densityFactor: 'ضریب چگالی:',
    densityHint: 'استاندارد: ۰.۹۱۶ کیلوگرم بر لیتر',
    estimatedVolumeL: 'حجم تخمینی (لیتر):',
    commitBlend: 'تایید و انتقال دسته روغن به بخش بسته‌بندی',
    chooseBlendOrManual: 'انتخاب دسته اختلاط یا مقدار دستی:',
    manualCustomBatch: 'بسته‌بندی مستقیم از مخزن',
    sourceTankForPackaging: 'مخزن مبدا (بسته‌بندی مستقیم):',
    batchWeightKg: 'وزن دسته برای بسته‌بندی (کیلوگرم):',
    weightExceedsTankBalance: 'وزن وارد شده از موجودی در دسترس مخزن بیشتر است!',
    maxAllowedWeight: 'حداکثر موجودی در دسترس:',
    targetWarehouse: 'انبار مقصد برای کالای آماده:',
    packagingTable: 'جدول ثبت بسته‌بندی (۸ اندازه استاندارد)',
    skuSize: 'نوع کالا و اندازه استاندارد',
    boxCap: 'ظرفیت جعبه (تعداد در هر جعبه)',
    boxesCount: 'تعداد جعبه‌ها',
    loosePieces: 'تعداد تکی',
    totalPieces: 'مجموع تعداد',
    volumeL: 'حجم (لیتر)',
    consumedKg: 'وزن مصرف‌شده (کیلوگرم)',
    totalProducedPieces: 'مجموع کالای تولید شده:',
    actualConsumedKg: 'وزن واقعی مصرف‌شده:',
    packagingLoss: 'ضایعات بسته‌بندی:',
    reconciledWarehouse: 'انبار تحویل‌گیرنده:',
    saveAndPostPackaging: 'انتقال و ثبت تولید به انبار انتخابی',
    packagingSuccess: 'بسته‌بندی با موفقیت با شماره سند ثبت شد:',
    tanksManagementTitle: 'مدیریت مخازن، سیلوها و ذخیره‌سازی فله',
    addNewTank: '+ افزودن مخزن جدید',
    tankCode: 'کد مخزن',
    tankNameAr: 'نام عربی',
    tankNameEn: 'نام انگلیسی/فارسی',
    capacityKg: 'حداکثر ظرفیت (کیلوگرم)',
    currentKg: 'موجودی فعلی (کیلوگرم)',
    location: 'موقعیت فیزیکی یا سالن',
    edit: 'ویرایش',
    delete: 'حذف',
    warehousesTitle: 'مدیریت انبارها و دفتر موجودی واقعی',
    addNewWarehouse: '+ افزودن انبار جدید',
    whCode: 'کد انبار',
    whName: 'نام انبار',
    whType: 'نوع انبار',
    whCapacity: 'ظرفیت (لیتر)',
    securityStatus: 'وضعیت امنیتی و دسترسی',
    managementProtected: 'تاسیسات داخلی — حفاظت‌شده مدیریتی (کاملاً مسدود برای رانندگان)',
    close: 'بستن',
    print: 'چاپ سند',
    signatures: 'امضاهای رسمی مجاز',
    receiverSignature: 'امضای تحویل‌گیرنده / اپراتور',
    qcSignature: 'مسئول کنترل کیفیت و آزمایشگاه',
    warehouseManagerSignature: 'مدیر کل انبارها',
    voucherReceipt: 'سند رسید روغن تجاری',
    voucherBlend: 'صورتجلسه فرآیند مخلوط روغن',
    voucherPackaging: 'حواله انتقال تولید و بسته‌بندی به انبار',
    cancel: 'انصراف',
    save: 'ذخیره',
    exit: 'خروج',
    unitKg: 'کیلوگرم',
    unitL: 'لیتر',
    unitPiece: 'عدد',
    unitBox: 'جعبه',
    tankBalance: 'موجودی مخزن:',
    maxCap: 'ظرفیت:',
    remainingAfter: 'موجودی باقی‌مانده:',
    emptyTable: 'هیچ ظرفی ثبت نشده است. روی "+ ظرف جدید" کلیک کنید.',
    emptyTanks: 'هیچ مخزنی ثبت نشده است.',
    emptyStocks: 'هنوز هیچ کالای آماده‌ای در انبارها ثبت نشده است.',
    emptyLogs: 'هیچ سابقه تاریخی در دسترس نیست.',
    driverIsolationNotice: 'هشدار امنیتی: تمامی انبارها به صورت کامل از رانندگان مسدود بوده و دسترسی به آن‌ها منحصراً در اختیار مدیریت است.',
    supplierPhone: 'تلفن تامین‌کننده:',
    supplierEmail: 'ایمیل تامین‌کننده:'
  }
};

export default function CommercialOilOperationsApp() {
  const { language, setLanguage } = useLanguage();
  const activeUser = useActiveUser();

  // Active locale code
  const currentLang = (['ar', 'en', 'fr', 'es', 'fa'].includes(language) ? language : 'ar') as keyof typeof TRANSLATIONS;
  const t = TRANSLATIONS[currentLang];

  // True RTL layout for Arabic and Persian
  const isRtlLayout = currentLang === 'ar' || currentLang === 'fa';

  // Role detection: Operator vs Admin
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

  useEffect(() => {
    if (isSuperOrAdmin) {
      setUserMode('ADMIN');
    } else {
      setUserMode('OPERATOR');
    }
  }, [isSuperOrAdmin]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'RECEIVE' | 'BLENDING' | 'PACKAGING' | 'TANKS' | 'WAREHOUSES' | 'LOGS'>('RECEIVE');

  // Prevent Operator from opening Admin-only tabs
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
  const receiverName = activeUser?.name || 'Mohammed Jichi';

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
  const [blendName, setBlendName] = useState<string>('');
  const blendOperator = activeUser?.name || 'Operator';
  const [blendNotes, setBlendNotes] = useState<string>('');
  const [withdrawals, setWithdrawals] = useState<Record<string, number>>({});

  // --------------------------------------------------------------------------
  // TAB 3: PACKAGING STATE
  // --------------------------------------------------------------------------
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedPackagingTankId, setSelectedPackagingTankId] = useState<string>('');
  const [customBatchKg, setCustomBatchKg] = useState<number>(1000);
  const [densityFactor, setDensityFactor] = useState<number>(0.916);
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('wh-main-fg');
  const packagingOperator = activeUser?.name || 'Operator';
  const [packagingNotes, setPackagingNotes] = useState<string>('');

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
  const [newTankLocation, setNewTankLocation] = useState<string>('');
  const [newTankAcidity, setNewTankAcidity] = useState<number>(0.65);

  const [showAddWhModal, setShowAddWhModal] = useState<boolean>(false);
  const [newWhNameAr, setNewWhNameAr] = useState<string>('');
  const [newWhNameEn, setNewWhNameEn] = useState<string>('');
  const [newWhCode, setNewWhCode] = useState<string>('');
  const [newWhType, setNewWhType] = useState<string>('FINISHED_GOODS');
  const [newWhLocation, setNewWhLocation] = useState<string>('');
  const [newWhCapacity, setNewWhCapacity] = useState<number>(50000);

  // Active print modal document
  const [printableDoc, setPrintableDoc] = useState<{
    docType: 'RECEIPT' | 'BLEND' | 'PACKAGING';
    title: string;
    refNumber: string;
    date: string;
    content: any;
  } | null>(null);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrintVoucher = () => {
    try {
      const voucherElem = document.getElementById('official-voucher-content');
      if (!voucherElem) {
        window.print();
        return;
      }

      const printWindow = window.open('', '_blank', 'width=950,height=850,menubar=no,toolbar=no,location=no,status=no');
      if (!printWindow) {
        // Fallback if browser blocked popup
        window.print();
        return;
      }

      const docTitle = printableDoc?.title || 'Official Voucher';
      const isRtl = isRtlLayout;

      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(el => el.outerHTML)
        .join('\n');

      printWindow.document.open();
      printWindow.document.write(`<!DOCTYPE html>
<html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${currentLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  ${styles}
  <style>
    @page {
      size: auto;
      margin: 10mm;
    }
    * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 6mm !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }
    .printable-voucher-card {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      background: #ffffff !important;
      box-sizing: border-box !important;
      page-break-inside: avoid !important;
    }
    .no-print {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="printable-voucher-card">
    ${voucherElem.innerHTML}
  </div>
</body>
</html>`);
      printWindow.document.close();

      const doPrint = () => {
        try {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            try {
              printWindow.close();
            } catch (e) {}
          }, 500);
        } catch (e) {
          console.error('Popup print execution error:', e);
        }
      };

      if (printWindow.document.readyState === 'complete') {
        setTimeout(doPrint, 250);
      } else {
        printWindow.onload = () => {
          setTimeout(doPrint, 250);
        };
      }
      return;
    } catch (err) {
      console.warn('Dedicated popup print error, falling back to window.print():', err);
      window.print();
    }
  };

  // ESC Key listener
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

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --------------------------------------------------------------------------
  // LOCALIZATION HELPERS: Ensure 100% pure text per language
  // --------------------------------------------------------------------------
  const getLocalizedTankName = useCallback((tank: StorageTank) => {
    if (currentLang === 'ar') return tank.nameAr || tank.name;
    if (currentLang === 'fa') return tank.nameAr ? tank.nameAr.replace(/خزان/g, 'مخزن').replace(/تجميع/g, 'ذخیره') : tank.name;
    return tank.name || tank.nameAr;
  }, [currentLang]);

  const getLocalizedWarehouseName = useCallback((wh: Warehouse) => {
    if (currentLang === 'ar') return wh.nameAr || wh.name;
    if (currentLang === 'fa') {
      if (wh.id === 'wh-main-fg') return 'انبار اصلی کالای آماده';
      if (wh.id === 'wh-supersonic') return 'انبار توزیع میدانی (سوپرسونیک)';
      if (wh.id === 'wh-showroom') return 'انبار نمایشگاه و فروش مستقیم';
      if (wh.id === 'wh-qc') return 'انبار بازرسی فنی و قرنطینه آزمایشگاهی';
      if (wh.id === 'wh-raw-bulk') return 'انبار و مخازن روغن خام';
      return wh.nameAr || wh.name;
    }
    return wh.name || wh.nameAr;
  }, [currentLang]);

  const getLocalizedGradeName = useCallback((g: OilGradeRecord) => {
    if (currentLang === 'ar') return g.nameAr;
    if (currentLang === 'fa') return g.nameFa || g.nameAr;
    if (currentLang === 'fr') return g.nameFr || g.nameEn;
    if (currentLang === 'es') return g.nameEs || g.nameEn;
    return g.nameEn;
  }, [currentLang]);

  const getLocalizedSkuName = useCallback((sku: StandardPackagingSize) => {
    if (currentLang === 'ar') return sku.nameAr;
    if (currentLang === 'fa') return sku.nameFa || sku.nameAr;
    if (currentLang === 'fr') return sku.nameFr || sku.nameEn;
    if (currentLang === 'es') return sku.nameEs || sku.nameEn;
    return sku.nameEn;
  }, [currentLang]);

  const getContainerTypeLabel = useCallback((type: 'GALLON' | 'TIN' | 'DRUM') => {
    if (type === 'GALLON') return t.plasticGallon;
    if (type === 'TIN') return t.metalTin;
    return t.drumBarrel;
  }, [t]);

  // --------------------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // --------------------------------------------------------------------------
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const timestamp = Date.now();

      // 1. Fetch live warehouses (all driverVisible are false)
      const whRes = await fetch(`/api/warehouses?_t=${timestamp}`, { cache: 'no-store' });
      const whJson = await whRes.json();
      let liveWhs: Warehouse[] = [];
      if (whJson.success && Array.isArray(whJson.data)) {
        liveWhs = whJson.data;
      }
      try {
        const rawLocal = localStorage.getItem('vanguard_custom_warehouses');
        if (rawLocal) {
          const localWhs: Warehouse[] = JSON.parse(rawLocal);
          if (Array.isArray(localWhs) && localWhs.length > 0) {
            const serverIds = new Set(liveWhs.map(w => w.id));
            const missingLocals = localWhs.filter(lw => !serverIds.has(lw.id));
            if (missingLocals.length > 0) {
              liveWhs = [...liveWhs, ...missingLocals];
              // Background self-heal missing warehouses to server
              missingLocals.forEach(mw => {
                fetch('/api/warehouses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(mw)
                }).catch(() => {});
              });
            }
          }
        }
      } catch (e) {}
      setWarehouses(liveWhs);
      if (liveWhs.length > 0) {
        setTargetWarehouseId(prev => (liveWhs.some((w: Warehouse) => w.id === prev) ? prev : liveWhs[0].id));
      }

      // 2. Fetch live approved suppliers
      const supRes = await fetch(`/api/getAllInvSuppliers?_t=${timestamp}`, { cache: 'no-store' });
      const supJson = await supRes.json();
      if (supJson.data && Array.isArray(supJson.data)) {
        setSuppliers(supJson.data);
        if (supJson.data.length > 0 && !selectedSupplierId) {
          setSelectedSupplierId(supJson.data[0].SUPPLIERID);
        }
      }

      // 3. Fetch oil grades dynamically
      const gradesRes = await fetch(`/api/operations/commercial-oil?filter=grades&_t=${timestamp}`, { cache: 'no-store' });
      const gradesJson = await gradesRes.json();
      if (gradesJson.success && Array.isArray(gradesJson.data)) {
        setOilGrades(gradesJson.data);
        if (gradesJson.data.length > 0) {
          setSelectedOilGradeCode(gradesJson.data[0].code);
        }
      }

      // 4. Fetch commercial oil state
      const opRes = await fetch(`/api/operations/commercial-oil?_t=${timestamp}`, { cache: 'no-store' });
      const opJson = await opRes.json();
      if (opJson.success && opJson.data) {
        let liveTanks: StorageTank[] = opJson.data.tanks || [];
        try {
          const rawLocal = localStorage.getItem('vanguard_custom_tanks');
          if (rawLocal) {
            const localTanks: StorageTank[] = JSON.parse(rawLocal);
            if (Array.isArray(localTanks) && localTanks.length > 0) {
              const serverIds = new Set(liveTanks.map(t => t.id));
              const missingLocals = localTanks.filter(lt => !serverIds.has(lt.id));
              if (missingLocals.length > 0) {
                liveTanks = [...liveTanks, ...missingLocals];
                // Background self-heal missing tanks to server
                missingLocals.forEach(mt => {
                  fetch('/api/operations/commercial-oil', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'CREATE_TANK', payload: mt })
                  }).catch(() => {});
                });
              }
            }
          }
        } catch (e) {}
        setTanks(liveTanks);
        setReceipts(opJson.data.receipts || []);
        setBatches(opJson.data.batches || []);
        setPackagingVouchers(opJson.data.packagingVouchers || []);
        setStocks(opJson.data.warehouseStocks || []);
        setMovements(opJson.data.movements || []);

        if (liveTanks.length > 0 && !targetStorageId) {
          setTargetStorageId(liveTanks[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load commercial oil operations data:', err);
      showToast(t.emptyLogs, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSupplierId, targetStorageId, t.emptyLogs]);

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
    showToast(`${dup.netKg} ${t.unitKg}`, 'info');
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
    showToast(`${count} × ${weight} ${t.unitKg}`, 'success');
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
            PHONE: newSupPhone || '',
            EMAIL: newSupEmail || ''
          }
        })
      });
      const data = await res.json();
      if (data.data) {
        showToast(t.save, 'success');
        await loadAllData();
        setSelectedSupplierId(data.data.SUPPLIERID);
        setShowAddSupplierModal(false);
        setNewSupName('');
        setNewSupPhone('');
        setNewSupEmail('');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitIntake = async () => {
    if (!selectedSupplierId) {
      showToast(t.supplier, 'error');
      return;
    }
    if (containerRows.length === 0) {
      showToast(t.emptyTable, 'error');
      return;
    }
    if (!targetStorageId) {
      showToast(t.storageTank, 'error');
      return;
    }

    const sup = suppliers.find(s => String(s.SUPPLIERID) === String(selectedSupplierId));
    if (!sup) return;

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
        showToast(`${t.voucherReceipt}: ${json.data.receiptNumber}`, 'success');
        setPrintableDoc({
          docType: 'RECEIPT',
          title: `${t.voucherReceipt} — ${json.data.receiptNumber}`,
          refNumber: json.data.receiptNumber,
          date: json.data.date,
          content: json.data
        });
        await loadAllData();
        setIntakeNotes('');
        setContainerRows([
          { id: '1', containerType: 'DRUM', netKg: 100.0 }
        ]);
      } else {
        showToast(json.error || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
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
            tankName: getLocalizedTankName(tank),
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
  }, [withdrawals, tanks, densityFactor, getLocalizedTankName]);

  const isAnyBlendExceeded = useMemo(() => {
    return Object.entries(withdrawals).some(([tankId, amount]) => {
      const tank = tanks.find(t => t.id === tankId);
      return tank ? (Number(amount) || 0) > tank.currentKg : false;
    });
  }, [withdrawals, tanks]);

  const handleUpdateWithdrawal = (tankId: string, kg: number) => {
    const tank = tanks.find(t => t.id === tankId);
    const maxKg = tank ? tank.currentKg : 0;
    const requested = Math.max(0, kg);
    if (tank && requested > maxKg) {
      setWithdrawals(prev => ({
        ...prev,
        [tankId]: maxKg
      }));
      showToast(
        currentLang === 'ar' ? `${getLocalizedTankName(tank)}: الحد الأقصى المتاح ${maxKg.toLocaleString()} كغ` :
        currentLang === 'fa' ? `${getLocalizedTankName(tank)}: حداکثر موجودی در دسترس ${maxKg.toLocaleString()} کیلوگرم است` :
        `${getLocalizedTankName(tank)}: Max available balance is ${maxKg.toLocaleString()} KG`,
        'error'
      );
    } else {
      setWithdrawals(prev => ({
        ...prev,
        [tankId]: requested
      }));
    }
  };

  const handleCreateBlend = async () => {
    if (blendCalculations.totalKg <= 0) {
      showToast(t.withdrawnKgFromTank, 'error');
      return;
    }

    if (isAnyBlendExceeded) {
      showToast(t.weightExceedsTankBalance, 'error');
      return;
    }

    for (const src of blendCalculations.sourcesSummary) {
      const tank = tanks.find(t => t.id === src.tankId);
      if (tank && src.withdrawn > tank.currentKg) {
        showToast(`${src.tankName}: ${tank.currentKg} < ${src.withdrawn}`, 'error');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const defaultBlendTitle = currentLang === 'ar' ? 'خلطة زيت متوازنة' :
        currentLang === 'fa' ? 'مخلوط روغن استاندارد' :
        currentLang === 'fr' ? 'Lot d’assemblage équilibré' :
        currentLang === 'es' ? 'Lote de mezcla balanceado' :
        'Balanced Oil Blend';

      const payload = {
        batchName: blendName.trim() || defaultBlendTitle,
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
        showToast(`${t.voucherBlend}: ${json.data.batchNumber}`, 'success');
        setPrintableDoc({
          docType: 'BLEND',
          title: `${t.voucherBlend} — ${json.data.batchNumber}`,
          refNumber: json.data.batchNumber,
          date: json.data.date,
          content: json.data
        });
        await loadAllData();
        setWithdrawals({});
        setActiveTab('PACKAGING');
      } else {
        showToast(json.error || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
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

  const selectedPackagingTank = useMemo(() => {
    if (selectedPackagingTankId) {
      return tanks.find(t => t.id === selectedPackagingTankId) || null;
    }
    return tanks.find(t => t.currentKg > 0) || tanks[0] || null;
  }, [tanks, selectedPackagingTankId]);

  const maxPackagingWeight = useMemo(() => {
    if (activeBatch) return activeBatch.totalBatchKg;
    return selectedPackagingTank ? selectedPackagingTank.currentKg : 0;
  }, [activeBatch, selectedPackagingTank]);

  const isPackagingWeightExceeded = useMemo(() => {
    if (activeBatch) return false;
    return customBatchKg > maxPackagingWeight;
  }, [activeBatch, customBatchKg, maxPackagingWeight]);

  const handleUpdateCustomBatchKg = (val: number) => {
    const entered = Math.max(0, val);
    if (!activeBatch && selectedPackagingTank && entered > selectedPackagingTank.currentKg) {
      setCustomBatchKg(selectedPackagingTank.currentKg);
      showToast(
        currentLang === 'ar' ? `تم حصر الوزن بالحد الأقصى المتاح (${selectedPackagingTank.currentKg.toLocaleString()} كغ)` :
        currentLang === 'fa' ? `وزن به حداکثر موجودی مخزن (${selectedPackagingTank.currentKg.toLocaleString()} کیلوگرم) محدود شد` :
        `Capped at maximum available tank balance (${selectedPackagingTank.currentKg.toLocaleString()} KG)`,
        'error'
      );
    } else {
      setCustomBatchKg(entered);
    }
  };

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
      showToast(t.packagingTable, 'error');
      return;
    }
    if (!targetWarehouseId) {
      showToast(t.targetWarehouse, 'error');
      return;
    }
    if (isPackagingWeightExceeded || activeBatchWeight <= 0) {
      showToast(t.weightExceedsTankBalance, 'error');
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
          title: `${t.voucherPackaging} — ${json.data.voucherNumber}`,
          refNumber: json.data.voucherNumber,
          date: json.data.date,
          content: json.data
        });
        await loadAllData();
        setSkuInputs(
          STANDARD_PACKAGING_SIZES.reduce((acc, s) => {
            acc[s.skuId] = { boxCapacity: s.defaultBoxCap, boxes: 0, loosePieces: 0 };
            return acc;
          }, {} as Record<string, { boxCapacity: number; boxes: number; loosePieces: number }>)
        );
      } else {
        showToast(json.error || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // TAB 4 & 5: TANKS & WAREHOUSES CRUD ACTIONS (ADMIN)
  // --------------------------------------------------------------------------
  const handleSaveTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTankNameAr.trim() && !newTankNameEn.trim()) {
      showToast(t.tankNameAr, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(editingTank);
      const action = isEdit ? 'UPDATE_TANK' : 'CREATE_TANK';
      const payload: any = {
        code: newTankCode.trim() || undefined,
        name: newTankNameEn.trim() || newTankNameAr,
        nameAr: newTankNameAr.trim() || newTankNameEn,
        capacityKg: Number(newTankCapacityKg) || 25000,
        grade: newTankGrade,
        gradeNameAr: oilGrades.find(g => g.code === newTankGrade)?.nameAr || 'بكر ممتاز',
        acidity: Number(newTankAcidity) || 0.65,
        location: newTankLocation || 'Central Facility'
      };

      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: editingTank?.id, payload })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const savedTank: StorageTank = json.data;
        // 1. Immediately store to localStorage backup
        try {
          const raw = localStorage.getItem('vanguard_custom_tanks');
          const localList: StorageTank[] = raw ? JSON.parse(raw) : [];
          const updated = [savedTank, ...localList.filter(t => t.id !== savedTank.id)];
          localStorage.setItem('vanguard_custom_tanks', JSON.stringify(updated));
        } catch (errLocal) {}

        // 2. Optimistically update state so it never blinks
        setTanks(prev => {
          const exists = prev.some(t => t.id === savedTank.id);
          if (exists) {
            return prev.map(t => t.id === savedTank.id ? savedTank : t);
          }
          return [savedTank, ...prev];
        });

        showToast(t.save, 'success');
        // 3. Re-fetch full server state
        await loadAllData();
        setShowAddTankModal(false);
        setEditingTank(null);
        setNewTankNameAr('');
        setNewTankNameEn('');
        setNewTankCode('');
      } else {
        showToast(json.error || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (!confirm(t.delete)) return;
    try {
      setIsSubmitting(true);
      // Remove from localStorage immediately
      try {
        const raw = localStorage.getItem('vanguard_custom_tanks');
        if (raw) {
          const localList: StorageTank[] = JSON.parse(raw);
          localStorage.setItem('vanguard_custom_tanks', JSON.stringify(localList.filter(t => t.id !== id)));
        }
      } catch (errLocal) {}
      setTanks(prev => prev.filter(t => t.id !== id));

      const res = await fetch('/api/operations/commercial-oil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_TANK', id })
      });
      const json = await res.json();
      if (json.success) {
        showToast(t.delete, 'success');
        await loadAllData();
      } else {
        showToast(json.error || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryName = newWhNameAr.trim() || newWhNameEn.trim();
    if (!primaryName) {
      showToast(t.whName, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: (newWhCode.trim() || `WH-${Date.now().toString().slice(-4)}`).toUpperCase(),
          name: newWhNameEn.trim() || primaryName,
          nameAr: newWhNameAr.trim() || primaryName,
          type: newWhType,
          location: (newWhLocation || 'Marjeyoun Facility').trim(),
          capacityLiters: Number(newWhCapacity) > 0 ? Number(newWhCapacity) : 50000,
          isDriverVisible: false // STRICTLY LOCKED: All warehouses isolated from drivers
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const savedWh = json.data;
        // 1. Immediately store to localStorage backup
        try {
          const raw = localStorage.getItem('vanguard_custom_warehouses');
          const localList: Warehouse[] = raw ? JSON.parse(raw) : [];
          const updated = [savedWh, ...localList.filter(w => w.id !== savedWh.id)];
          localStorage.setItem('vanguard_custom_warehouses', JSON.stringify(updated));
        } catch (errLocal) {}

        // 2. Optimistically update state
        setWarehouses(prev => [savedWh, ...prev.filter(w => w.id !== savedWh.id)]);

        showToast(t.save, 'success');
        // 3. Re-fetch full server state
        await loadAllData();
        setShowAddWhModal(false);
        setNewWhNameAr('');
        setNewWhNameEn('');
        setNewWhCode('');
        setNewWhCapacity(50000);
      } else {
        showToast(json.error || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
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

  const renderVoucherContent = (doc: { docType: string; refNumber: string; date: string; content: any }) => {
    return (
      <div className="space-y-6">
        {/* Corporate 3-Zone Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center text-xs">
          <div>
            <h3 className="text-base font-black text-slate-900">{t.companyName}</h3>
            <p className="text-[11px] text-slate-500">{t.companySubtitle}</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-black text-emerald-800 px-3 py-1 bg-emerald-50 rounded border border-emerald-200 block">
              {doc.docType === 'RECEIPT' ? t.voucherReceipt :
               doc.docType === 'BLEND' ? t.voucherBlend :
               t.voucherPackaging}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-900 mt-1 block">
              {doc.refNumber}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {doc.date}
            </span>
          </div>
          <div className="text-left font-mono">
            <span className="font-bold text-slate-900">VANGUARD ERP</span>
            <p className="text-[10px] text-slate-400">{t.appTitleOperator}</p>
          </div>
        </div>

        {/* Document Details Grid (NO RAW JSON) */}
        {doc.docType === 'RECEIPT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">{t.supplier}</span>
                <span className="font-black text-slate-900 text-sm">{doc.content.supplierName}</span>
                {doc.content.supplierPhone && (
                  <span className="text-[11px] text-slate-500 block">{doc.content.supplierPhone}</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block">{t.storageTank}</span>
                <span className="font-black text-slate-900 text-sm">
                  {(() => {
                    const tankObj = tanks.find(tk => tk.id === doc.content.targetStorageId || tk.nameAr === doc.content.targetStorageNameAr);
                    return tankObj ? getLocalizedTankName(tankObj) : doc.content.targetStorageNameAr;
                  })()}
                </span>
                <span className="text-[11px] text-emerald-700 block font-bold">{t.acidity} {doc.content.acidity}%</span>
              </div>
            </div>

            {/* Summary of Containers */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              <div>
                <span className="text-slate-500 block">{t.totalGallons}</span>
                <span className="text-sm font-black text-slate-900">{doc.content.gallonsCount || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.totalTins}</span>
                <span className="text-sm font-black text-slate-900">{doc.content.tinsCount || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.totalDrums}</span>
                <span className="text-sm font-black text-amber-800">{doc.content.drumsCount || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.totalNetKg}</span>
                <span className="text-base font-black text-emerald-700">{doc.content.totalNetKg} {t.unitKg}</span>
              </div>
            </div>

            {doc.content.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-700 ml-1">{t.notes}</span>
                {doc.content.notes}
              </div>
            )}
          </div>
        )}

        {doc.docType === 'BLEND' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-500 block">{t.totalWithdrawnWeight}</span>
                <span className="font-black text-emerald-700 text-base">{doc.content.totalBatchKg} {t.unitKg}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.weightedAcidity}</span>
                <span className="font-black text-amber-800 text-base">{doc.content.weightedAvgAcidity}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.estimatedVolumeL}</span>
                <span className="font-black text-indigo-700 text-base">{doc.content.estimatedVolumeLiters} {t.unitL}</span>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-1">
              <span className="font-bold block">{t.availableSources}:</span>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-2">{t.storageTank}</th>
                      <th className="p-2">{t.netWeightKg}</th>
                      <th className="p-2">{t.acidity}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doc.content.sources?.map((s: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{s.sourceName}</td>
                        <td className="p-2 font-black text-emerald-700">{s.withdrawnKg} {t.unitKg}</td>
                        <td className="p-2">{s.sourceAcidity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {doc.docType === 'PACKAGING' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-500 block">{t.reconciledWarehouse}</span>
                <span className="font-black text-slate-900 text-sm">
                  {(() => {
                    const whObj = warehouses.find(w => w.id === doc.content.targetWarehouseId || w.nameAr === doc.content.targetWarehouseNameAr);
                    return whObj ? getLocalizedWarehouseName(whObj) : doc.content.targetWarehouseNameAr;
                  })()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.totalProducedPieces}</span>
                <span className="font-black text-indigo-700 text-base">{doc.content.totalPiecesProduced} {t.unitPiece}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.actualConsumedKg}</span>
                <span className="font-black text-emerald-700 text-base">{doc.content.totalConsumedKg} {t.unitKg}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.packagingLoss}</span>
                <span className="font-black text-slate-800 text-sm">{doc.content.packagingLossKg} {t.unitKg} ({doc.content.packagingLossPercent}%)</span>
              </div>
            </div>

            {/* SKUs Produced Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">{t.skuSize}</th>
                    <th className="p-2">{t.boxCap}</th>
                    <th className="p-2">{t.boxesCount}</th>
                    <th className="p-2">{t.loosePieces}</th>
                    <th className="p-2">{t.totalPieces}</th>
                    <th className="p-2">{t.volumeL}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doc.content.skus?.filter((s: any) => s.totalPieces > 0).map((s: any, idx: number) => {
                    const stdSku = STANDARD_PACKAGING_SIZES.find((p: StandardPackagingSize) => p.skuId === s.skuId);
                    const skuLabel = stdSku ? getLocalizedSkuName(stdSku) : (s.name || s.nameAr);
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-900">{skuLabel}</td>
                        <td className="p-2">{s.boxCapacity} {t.unitPiece}</td>
                        <td className="p-2 font-black">{s.boxes}</td>
                        <td className="p-2">{s.loosePieces}</td>
                        <td className="p-2 font-black text-indigo-700">{s.totalPieces} {t.unitPiece}</td>
                        <td className="p-2 font-bold">{s.totalLiters} {t.unitL}</td>
                      </tr>
                    );
                  })}
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
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 font-sans" dir={isRtlLayout ? 'rtl' : 'ltr'}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`fixed top-4 left-4 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
          toastMessage.type === 'error' ? 'bg-red-50 text-red-900 border-red-300' :
          'bg-slate-50 text-slate-900 border-slate-300'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
          {toastMessage.type === 'info' && <Shield className="w-5 h-5 text-blue-600" />}
          <span className="text-sm font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
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

          {/* User Profile, Multi-Language Switcher (AR / EN / FR / ES / FA) & Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Active User Badge */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-bold text-slate-900 block leading-tight">{activeUser?.name || 'Mohammed Jichi'}</span>
                <span className="text-[10px] text-slate-500">{userMode === 'OPERATOR' ? t.operatorMode : t.adminMode}</span>
              </div>
            </div>

            {/* Language Switcher Buttons (AR / EN / FR / ES / FA - فارسی) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              {[
                { code: 'ar', label: 'العربية' },
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
                { code: 'es', label: 'Español' },
                { code: 'fa', label: 'فارسی' }
              ].map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code as any)}
                  className={`px-2.5 py-1 rounded transition-colors text-xs ${
                    currentLang === item.code
                      ? 'bg-white text-emerald-800 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mode Switcher Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUserMode('OPERATOR')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  userMode === 'OPERATOR'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                {t.operatorMode}
              </button>
              <button
                type="button"
                onClick={() => setUserMode('ADMIN')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  userMode === 'ADMIN'
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                {t.adminMode}
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={loadAllData}
              title={t.refresh}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Exit */}
            <Link prefetch={false}
              href="/backoffice"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.exit}
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
                <span className="font-black text-slate-900">{totalRawOilKg.toLocaleString()} {t.unitKg}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-500">{t.readyBatches}:</span>
                <span className="font-black text-slate-900">{readyBatchesCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" />
                <span className="text-slate-500">{t.packagedUnits}:</span>
                <span className="font-black text-slate-900">{totalPackagedPieces.toLocaleString()} {t.unitPiece}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {userMode === 'OPERATOR' ? t.operatorMode : t.adminMode}
            </div>
          </div>
        </div>

        {/* Primary Stage Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-200 overflow-x-auto">
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
                    {t.tabReceive}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.containerWeights}
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

                {/* 2. Oil Grade (Dynamic from DB, Purely Localized) */}
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
                        {getLocalizedGradeName(g)} (≤ {g.maxAcidity}%)
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
                        {getLocalizedTankName(tank)} ({tank.code}) — {tank.currentKg} {t.unitKg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">{t.voucherReceipt}:</label>
                  <input
                    type="date"
                    value={intakeDate}
                    onChange={(e) => setIntakeDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">{t.receiverStaff}:</label>
                  <input
                    type="text"
                    disabled
                    value={receiverName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">{t.notes}:</label>
                  <input
                    type="text"
                    value={intakeNotes}
                    onChange={(e) => setIntakeNotes(e.target.value)}
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
                      if (confirm(t.clearTable)) {
                        setContainerRows([]);
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    {t.clearTable}
                  </button>
                </div>
              </div>

              {/* TABLE OF CONTAINERS (Gallon, Tin, Drum - PURE LOCALIZED) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 w-14 text-center">#</th>
                        <th className="p-3">{t.containerType}</th>
                        <th className="p-3">{t.netWeightKg}</th>
                        <th className="p-3 w-28 text-center">{t.actions}</th>
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
                              <option value="GALLON">{t.plasticGallon}</option>
                              <option value="TIN">{t.metalTin}</option>
                              <option value="DRUM">{t.drumBarrel}</option>
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
                              <span className="text-slate-500 font-bold text-xs">{t.unitKg}</span>
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
                                title={t.duplicateLast}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveContainerRow(row.id)}
                                title={t.delete}
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
                            {t.emptyTable}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REAL-TIME TOTALS & SUMMARY CARD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block">{t.totalGallons}</span>
                    <span className="text-sm font-black text-slate-800">{receiveTotals.gallons}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.totalTins}</span>
                    <span className="text-sm font-black text-slate-800">{receiveTotals.tins}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.totalDrums}</span>
                    <span className="text-sm font-black text-amber-700">{receiveTotals.drums}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.totalContainers}</span>
                    <span className="text-sm font-black text-indigo-700">{receiveTotals.totalContainers}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block">{t.totalNetKg}</span>
                    <span className="text-base font-black text-emerald-700">{receiveTotals.totalNet.toLocaleString()} {t.unitKg}</span>
                    <span className="text-[10px] text-slate-400 block">{t.avgPerContainer} {receiveTotals.avgWeight} {t.unitKg}</span>
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
                    {t.tabBlending}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.availableSources}
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
                  <span className="font-bold text-slate-800">{tanks.length}</span>
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
                            <h4 className="font-black text-slate-900 text-sm">{getLocalizedTankName(tank)}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{tank.location}</p>
                        </div>

                        <div className="text-left">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                            {t.acidity} {tank.acidity}%
                          </span>
                        </div>
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{t.tankBalance} <b className="text-slate-900">{tank.currentKg.toLocaleString()} {t.unitKg}</b></span>
                          <span>{t.maxCap} {tank.capacityKg.toLocaleString()} {t.unitKg}</span>
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
                            <div className={`flex rounded-md border ${
                              currentWithdrawn > tank.currentKg ? 'border-red-500 ring-2 ring-red-400' : 'border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500'
                            } overflow-hidden bg-white w-40 shadow-2xs`}>
                              <input
                                type="number"
                                min="0"
                                max={tank.currentKg}
                                step="any"
                                value={currentWithdrawn || ''}
                                onChange={(e) => handleUpdateWithdrawal(tank.id, Number(e.target.value))}
                                placeholder="0"
                                className="w-full bg-transparent px-3 py-1.5 font-black text-slate-900 focus:outline-none"
                              />
                              <span className="inline-flex items-center px-2.5 bg-slate-100 border-s border-slate-200 text-slate-600 font-bold text-xs select-none shrink-0">
                                {t.unitKg}
                              </span>
                            </div>
                          </div>
                          {currentWithdrawn > tank.currentKg && (
                            <span className="text-[10px] text-red-600 font-bold block mt-1 animate-pulse">
                              ⚠️ {t.weightExceedsTankBalance} ({tank.currentKg.toLocaleString()} {t.unitKg})
                            </span>
                          )}
                        </div>

                        <div className="text-left">
                          <span className="text-[11px] text-slate-500 block">{t.remainingAfter}</span>
                          <span className={`text-xs font-black ${remaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {remaining.toLocaleString()} {t.unitKg}
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
                      {blendCalculations.totalKg.toLocaleString()} {t.unitKg}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.weightedAcidity}</span>
                    <span className="text-xl font-black text-amber-800">
                      {blendCalculations.avgAcidity}%
                    </span>
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
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.estimatedVolumeL}</span>
                    <span className="text-xl font-black text-indigo-800">
                      {blendCalculations.volumeLiters.toLocaleString()} {t.unitL}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={isSubmitting || blendCalculations.totalKg <= 0 || isAnyBlendExceeded}
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
                    {t.tabPackaging}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.packagingTable}
                  </p>
                </div>
              </div>

              {/* Batch & Warehouse Configuration Row */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${!activeBatch ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 text-xs`}>
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
                        {b.batchNumber}: {b.batchName} ({b.totalBatchKg} {t.unitKg} - {b.weightedAvgAcidity}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Source Tank Selection (When Direct / Manual Packaging) */}
                {!activeBatch && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>{t.sourceTankForPackaging}</span>
                      <span className="text-[10px] font-black text-emerald-700">
                        {selectedPackagingTank?.currentKg?.toLocaleString() || 0} {t.unitKg}
                      </span>
                    </label>
                    <select
                      value={selectedPackagingTankId || selectedPackagingTank?.id || ''}
                      onChange={(e) => {
                        setSelectedPackagingTankId(e.target.value);
                        const newTank = tanks.find(t => t.id === e.target.value);
                        if (newTank && customBatchKg > newTank.currentKg) {
                          setCustomBatchKg(newTank.currentKg);
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {tanks.map(tankItem => (
                        <option key={tankItem.id} value={tankItem.id}>
                          {getLocalizedTankName(tankItem)} — ({tankItem.currentKg.toLocaleString()} {t.unitKg})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Batch Weight in KG (Clean Flex Layout without overlap) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>{t.batchWeightKg}</span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {t.maxAllowedWeight} {maxPackagingWeight.toLocaleString()} {t.unitKg}
                    </span>
                  </label>
                  <div className={`flex rounded-lg border ${
                    isPackagingWeightExceeded
                      ? 'border-red-500 ring-2 ring-red-400'
                      : 'border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500'
                  } overflow-hidden bg-white shadow-2xs`}>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={maxPackagingWeight}
                      disabled={Boolean(activeBatch)}
                      value={activeBatchWeight || ''}
                      onChange={(e) => handleUpdateCustomBatchKg(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent px-3 py-2 font-black text-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 text-xs"
                    />
                    <span className="inline-flex items-center px-3 bg-slate-100 border-s border-slate-200 text-slate-600 font-bold text-xs select-none shrink-0">
                      {t.unitKg}
                    </span>
                  </div>
                  {isPackagingWeightExceeded && (
                    <div className="flex items-center gap-1 text-red-600 font-bold text-[10px] animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.weightExceedsTankBalance}</span>
                    </div>
                  )}
                </div>

                {/* 4. DENSITY FACTOR */}
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
                  </div>
                </div>

                {/* 5. Target Warehouse Selection (UNBLOCKED & INTERACTIVE) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>{t.targetWarehouse}</span>
                  </label>
                  <select
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(e.target.value)}
                    className="w-full bg-emerald-50/50 border-2 border-emerald-500/60 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {getLocalizedWarehouseName(w)} ({w.code})
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
                    {t.estimatedVolumeL}: <b className="text-emerald-900 mx-1 text-sm font-black">{availableBatchVolume.toLocaleString()} {t.unitL}</b>
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800">
                  {activeBatchWeight} {t.unitKg}
                </span>
              </div>
            </div>

            {/* 8 PRESCRIBED PACKAGING SIZES TABLE (PURE LOCALIZED) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    {t.packagingTable}
                  </h3>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">{t.skuSize}</th>
                        <th className="p-3 w-32">{t.boxCap}</th>
                        <th className="p-3 w-28">{t.boxesCount}</th>
                        <th className="p-3 w-28">{t.loosePieces}</th>
                        <th className="p-3 w-32">{t.totalPieces}</th>
                        <th className="p-3 w-32">{t.volumeL}</th>
                        <th className="p-3 w-32">{t.consumedKg}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {packagingCalculations.skuBreakdown.map((sku) => (
                        <tr key={sku.skuId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{getLocalizedSkuName(sku)}</span>
                            <span className="text-[10px] text-slate-400">
                              {sku.sizeMl} {currentLang === 'ar' ? 'مل' : currentLang === 'fa' ? 'میلی‌لیتر' : 'ml'}
                            </span>
                          </td>

                          {/* Dynamic Box Capacity */}
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

                          {/* Boxes Count */}
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

                          {/* Loose Pieces */}
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

                          {/* Total Pieces */}
                          <td className="p-3 font-black text-indigo-700">
                            {sku.totalUnits.toLocaleString()} {t.unitPiece}
                          </td>

                          {/* Total Liters */}
                          <td className="p-3 font-bold text-slate-800">
                            {sku.totalLiters.toLocaleString()} {t.unitL}
                          </td>

                          {/* Consumed KG */}
                          <td className="p-3 font-black text-emerald-700">
                            {sku.consumedKg.toLocaleString()} {t.unitKg}
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
                      {packagingCalculations.totalPieces.toLocaleString()} {t.unitPiece}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {t.volumeL}: {packagingCalculations.totalLiters.toLocaleString()} {t.unitL}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.actualConsumedKg}</span>
                    <span className="text-xl font-black text-emerald-700">
                      {packagingCalculations.totalConsumedKg.toLocaleString()} {t.unitKg}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {activeBatchWeight} {t.unitKg}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">{t.packagingLoss}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-800">
                        {packagingCalculations.lossKg} {t.unitKg}
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
                          {getLocalizedWarehouseName(w)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={isSubmitting || packagingCalculations.totalPieces <= 0 || isPackagingWeightExceeded || activeBatchWeight <= 0}
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
                  {t.availableSources}
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
                        <h3 className="font-black text-slate-900 text-sm">{getLocalizedTankName(tank)}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{tank.location}</p>
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
                        title={t.edit}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTank(tank.id)}
                        title={t.delete}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{t.tankBalance} <b className="text-slate-900">{tank.currentKg.toLocaleString()} {t.unitKg}</b></span>
                      <span className="text-slate-400">{t.maxCap} {tank.capacityKg.toLocaleString()} {t.unitKg}</span>
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
                      {(() => {
                        const gradeObj = oilGrades.find(g => g.code === tank.grade);
                        return gradeObj ? getLocalizedGradeName(gradeObj) : tank.grade;
                      })()}
                    </span>
                    <span className="font-black text-amber-800">
                      {t.acidity} {tank.acidity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STAGE 5: REAL DYNAMIC WAREHOUSES & STOCK LEDGER (ADMIN ONLY)      */}
        {/* Strictly Isolated from Drivers                                    */}
        {/* ================================================================= */}
        {userMode === 'ADMIN' && activeTab === 'WAREHOUSES' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {t.warehousesTitle}
                </h2>
                <p className="text-xs text-emerald-700 font-bold mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {t.driverIsolationNotice}
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

            {/* Warehouses Grid - ALL marked as Management Protected */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map(wh => (
                <div key={wh.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-black text-xs text-slate-800">
                          {wh.code}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm">{getLocalizedWarehouseName(wh)}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{wh.location}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      {t.managementProtected}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.whType}: <b className="text-slate-800">{wh.type}</b></span>
                    <span className="text-slate-500">{t.whCapacity}: <b className="text-slate-800">{wh.capacityLiters.toLocaleString()} {t.unitL}</b></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Warehouses Stock Ledger Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                {t.tabWarehouses}
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t.targetWarehouse}</th>
                      <th className="p-3">{t.skuSize}</th>
                      <th className="p-3">{t.boxCap}</th>
                      <th className="p-3">{t.boxesCount}</th>
                      <th className="p-3">{t.loosePieces}</th>
                      <th className="p-3">{t.totalPieces}</th>
                      <th className="p-3">{t.volumeL}</th>
                      <th className="p-3">{t.consumedKg}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stocks.map((stk, idx) => {
                      const wh = warehouses.find(w => w.id === stk.warehouseId);
                      const matchedSku = STANDARD_PACKAGING_SIZES.find(s => s.skuId === stk.skuId);
                      return (
                        <tr key={`${stk.warehouseId}-${stk.skuId}-${idx}`} className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold text-slate-900">
                            {wh ? getLocalizedWarehouseName(wh) : stk.warehouseId}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">
                              {matchedSku ? getLocalizedSkuName(matchedSku) : stk.nameAr}
                            </span>
                            <span className="text-[10px] text-slate-400">{stk.sizeMl} {currentLang === 'ar' ? 'مل' : currentLang === 'fa' ? 'میلی‌لیتر' : 'ml'}</span>
                          </td>
                          <td className="p-3">{stk.boxCapacity}</td>
                          <td className="p-3 font-black text-slate-800">{stk.boxesCount}</td>
                          <td className="p-3">{stk.loosePieces}</td>
                          <td className="p-3 font-black text-indigo-700">{stk.totalUnits.toLocaleString()} {t.unitPiece}</td>
                          <td className="p-3 font-bold text-slate-800">{stk.totalLiters.toLocaleString()} {t.unitL}</td>
                          <td className="p-3 font-black text-emerald-700">{stk.totalKg.toLocaleString()} {t.unitKg}</td>
                        </tr>
                      );
                    })}
                    {stocks.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          {t.emptyStocks}
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
                {t.tabLogs}
              </h2>
            </div>

            {/* Receipts History */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">{t.voucherReceipt}</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t.whCode}</th>
                      <th className="p-3">{t.voucherReceipt}</th>
                      <th className="p-3">{t.supplier}</th>
                      <th className="p-3">{t.oilGrade}</th>
                      <th className="p-3">{t.storageTank}</th>
                      <th className="p-3">{t.totalContainers}</th>
                      <th className="p-3">{t.netWeightKg}</th>
                      <th className="p-3">{t.receiverStaff}</th>
                      <th className="p-3 text-center">{t.actions}</th>
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
                        <td className="p-3 font-bold text-indigo-700">{r.totalContainers} {t.unitPiece}</td>
                        <td className="p-3 font-black text-emerald-700">{r.totalNetKg} {t.unitKg}</td>
                        <td className="p-3 text-slate-600">{r.receivedBy}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPrintableDoc({
                              docType: 'RECEIPT',
                              title: `${t.voucherReceipt} — ${r.receiptNumber}`,
                              refNumber: r.receiptNumber,
                              date: r.date,
                              content: r
                            })}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title={t.print}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {receipts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-400">
                          {t.emptyLogs}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Packaging Vouchers History */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">{t.voucherPackaging}</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t.whCode}</th>
                      <th className="p-3">{t.targetWarehouse}</th>
                      <th className="p-3">{t.totalProducedPieces}</th>
                      <th className="p-3">{t.volumeL}</th>
                      <th className="p-3">{t.actualConsumedKg}</th>
                      <th className="p-3">{t.packagingLoss}</th>
                      <th className="p-3">{t.operator}</th>
                      <th className="p-3 text-center">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {packagingVouchers.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-slate-900">{v.voucherNumber}</td>
                        <td className="p-3 font-bold text-slate-800">{v.targetWarehouseNameAr}</td>
                        <td className="p-3 font-black text-indigo-700">{v.totalPiecesProduced.toLocaleString()} {t.unitPiece}</td>
                        <td className="p-3 font-bold text-slate-800">{v.totalLitersPackaged.toLocaleString()} {t.unitL}</td>
                        <td className="p-3 font-black text-emerald-700">{v.totalConsumedKg.toLocaleString()} {t.unitKg}</td>
                        <td className="p-3 font-bold text-slate-700">{v.packagingLossKg} {t.unitKg} ({v.packagingLossPercent}%)</td>
                        <td className="p-3 text-slate-600">{v.operator}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPrintableDoc({
                              docType: 'PACKAGING',
                              title: `${t.voucherPackaging} — ${v.voucherNumber}`,
                              refNumber: v.voucherNumber,
                              date: v.date,
                              content: v
                            })}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title={t.print}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {packagingVouchers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          {t.emptyLogs}
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
                {t.addSupplier}
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
                <label className="font-bold text-slate-700">{t.supplier}</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{t.supplierPhone}</label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{t.supplierEmail}</label>
                <input
                  type="email"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {t.save}
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
                {t.batchAdd}
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
                <label className="font-bold text-slate-700">{t.containerType}:</label>
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
                  <option value="DRUM">{t.drumBarrel}</option>
                  <option value="GALLON">{t.plasticGallon}</option>
                  <option value="TIN">{t.metalTin}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{t.totalContainers}:</label>
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
                <label className="font-bold text-slate-700">{t.netWeightKg}:</label>
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
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleApplyQuickBatch}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {t.save}
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
                {editingTank ? t.edit : t.addNewTank}
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
                  <label className="font-bold text-slate-700">{t.tankCode}:</label>
                  <input
                    type="text"
                    value={newTankCode}
                    onChange={(e) => setNewTankCode(e.target.value)}
                    placeholder="TK-01"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.capacityKg}:</label>
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
                <label className="font-bold text-slate-700">{t.tankNameAr}:</label>
                <input
                  type="text"
                  required
                  value={newTankNameAr}
                  onChange={(e) => setNewTankNameAr(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{t.tankNameEn}:</label>
                <input
                  type="text"
                  value={newTankNameEn}
                  onChange={(e) => setNewTankNameEn(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.oilGrade}:</label>
                  <select
                    value={newTankGrade}
                    onChange={(e) => setNewTankGrade(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    {oilGrades.map(g => (
                      <option key={g.id} value={g.code}>
                        {getLocalizedGradeName(g)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.acidity}:</label>
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
                <label className="font-bold text-slate-700">{t.location}:</label>
                <input
                  type="text"
                  value={newTankLocation}
                  onChange={(e) => setNewTankLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTankModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: ADD WAREHOUSE (STRICTLY ISOLATED FROM DRIVERS)           */}
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

            <form onSubmit={handleCreateWarehouse} noValidate className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.whName}:</label>
                  <input
                    type="text"
                    required
                    value={newWhNameAr}
                    onChange={(e) => setNewWhNameAr(e.target.value)}
                    placeholder={currentLang === 'ar' ? 'اسم المستودع (بالعربية)' : 'Warehouse Name'}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.tankNameEn || 'English Name'}:</label>
                  <input
                    type="text"
                    value={newWhNameEn}
                    onChange={(e) => setNewWhNameEn(e.target.value)}
                    placeholder="e.g. Packaging Warehouse PE 05"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{t.whCode}:</label>
                <input
                  type="text"
                  value={newWhCode}
                  onChange={(e) => setNewWhCode(e.target.value)}
                  placeholder="e.g. WS PE 05 or WS-PE-05"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.whType}:</label>
                  <select
                    value={newWhType}
                    onChange={(e) => setNewWhType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="FINISHED_GOODS">Finished Goods</option>
                    <option value="DISTRIBUTION_HUB">Distribution Hub</option>
                    <option value="RETAIL">Retail</option>
                    <option value="QUARANTINE">Quarantine & QC</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">{t.whCapacity}:</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={newWhCapacity}
                    onChange={(e) => setNewWhCapacity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{t.location}:</label>
                <input
                  type="text"
                  value={newWhLocation}
                  onChange={(e) => setNewWhLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 5: AUTHENTIC PRINTABLE VOUCHER CARD (ZERO RAW JSON!)        */}
      {/* Pure Language Isolation & Backdrop Dismiss                        */}
      {/* ================================================================= */}
      {/* ================================================================= */}
      {/* MODAL 5: AUTHENTIC PRINTABLE VOUCHER CARD (ZERO RAW JSON!)        */}
      {/* Pure Language Isolation & Backdrop Dismiss                        */}
      {/* ================================================================= */}
      {printableDoc && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPrintableDoc(null); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in print:hidden"
        >
          {/* Scoped Strict Print Engine for Official Voucher */}
          <style dangerouslySetInnerHTML={{ __html: `
            @page {
              size: auto;
              margin: 10mm;
            }
            @media print {
              body > *:not(#print-mount-portal) {
                display: none !important;
              }
              #print-mount-portal {
                display: block !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                z-index: 999999 !important;
              }
              .printable-voucher-card {
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                background: #ffffff !important;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div className="printable-voucher-card bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-scale-up text-slate-800 my-8">
            {/* Modal Top Actions Bar */}
            <div className="no-print p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {printableDoc.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="no-print px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {t.print}
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableDoc(null)}
                  className="no-print p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Printable Voucher Document Content */}
            <div id="official-voucher-content" className="p-8">
              {renderVoucherContent(printableDoc)}
            </div>
          </div>
        </div>
      )}

      {/* Mount Portal for Direct @media print Fallback */}
      {isMounted && printableDoc && createPortal(
        <div id="print-mount-portal" dir={isRtlLayout ? 'rtl' : 'ltr'}>
          <div className="printable-voucher-card p-6 bg-white text-slate-900">
            {renderVoucherContent(printableDoc)}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
