'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
import {
  FlaskConical,
  Plus,
  Search,
  Scale,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Package,
  Boxes,
  Percent,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  Play,
  History,
  RotateCcw,
  Check,
  Building2,
  Warehouse
} from 'lucide-react';

export interface FormulationIngredient {
  id: string;
  itemCode: string;
  name: string;
  nameAr: string;
  category: 'RAW_MATERIAL' | 'CHEMICAL' | 'PACKAGING' | 'ADDITIVE';
  baseQty: number;
  unit: string;
  unitCostUsd: number;
  scrapPercentage: number;
}

export interface CommercialFormulation {
  id: string;
  code: string;
  title: string;
  titleAr: string;
  category: 'Molasses & Syrups' | 'Vinegars' | 'Soaps & Cosmetics' | 'Infused Oils' | 'Industrial Cleaning';
  outputProductCode: string;
  outputProductName: string;
  baseYieldQty: number;
  outputUnit: string;
  laborOverheadUsd: number;
  qualitySpecs: string;
  instructions: string[];
  ingredients: FormulationIngredient[];
}

export interface ProductionRunRecord {
  id: string;
  runNo: string;
  formulationId: string;
  formulationTitle: string;
  scaleMultiplier: number;
  actualYield: number;
  outputUnit: string;
  totalCostUsd: number;
  totalCostLbp: number;
  costPerUnitUsd: number;
  destinationLocation: string;
  executedBy: string;
  productionDate: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  notes?: string;
}

export const INITIAL_FORMULATIONS: CommercialFormulation[] = [
  {
    id: 'FORM-001',
    code: 'FORM-POM-500',
    title: 'Commercial Pomegranate Molasses 500ml',
    titleAr: 'دبس رمان تجاري مركز نقي 500 مل',
    category: 'Molasses & Syrups',
    outputProductCode: 'POM-MOL-500',
    outputProductName: 'Southern Olive Pomegranate Molasses 500ml',
    baseYieldQty: 100,
    outputUnit: 'Bottles',
    laborOverheadUsd: 15.0,
    qualitySpecs: 'Brix: 68-70°, Acidity: 3.2-3.6%, Deep ruby-black viscous syrup',
    instructions: [
      'Blend raw pomegranate concentrate with deionized hot water at 65°C.',
      'Gradually introduce refined sugar syrup while stirring at 450 RPM.',
      'Incorporate food-grade citric acid and monitor pH until stabilized at 3.4.',
      'Filter through 50-micron stainless sieve and transfer to sterile filling hopper.',
      'Hot fill into pre-sterilized 500ml dark glass bottles and cap immediately.'
    ],
    ingredients: [
      { id: 'ING-101', itemCode: 'RAW-POM-CONC', name: 'Raw Pomegranate Concentrate 70°', nameAr: 'مركز رمان خام 70 بركس', category: 'RAW_MATERIAL', baseQty: 35.0, unit: 'KG', unitCostUsd: 3.20, scrapPercentage: 1.5 },
      { id: 'ING-102', itemCode: 'RAW-WATER-RO', name: 'Deionized RO Water', nameAr: 'مياه مقطرة معقمة', category: 'RAW_MATERIAL', baseQty: 22.0, unit: 'L', unitCostUsd: 0.05, scrapPercentage: 0.5 },
      { id: 'ING-103', itemCode: 'RAW-SUG-SYR', name: 'Refined Sugar Syrup 65°', nameAr: 'قطر سكر مكرر 65 بركس', category: 'ADDITIVE', baseQty: 12.0, unit: 'KG', unitCostUsd: 0.90, scrapPercentage: 1.0 },
      { id: 'ING-104', itemCode: 'CHM-CIT-ACD', name: 'Citric Acid Monohydrate', nameAr: 'حامض الليمون غذائي', category: 'CHEMICAL', baseQty: 0.6, unit: 'KG', unitCostUsd: 2.50, scrapPercentage: 0.0 },
      { id: 'ING-105', itemCode: 'PKG-BOT-500', name: '500ml Dark Amber Glass Bottle', nameAr: 'زجاجة عسلي داكن 500 مل', category: 'PACKAGING', baseQty: 100, unit: 'Units', unitCostUsd: 0.45, scrapPercentage: 2.0 },
      { id: 'ING-106', itemCode: 'PKG-CAP-315', name: 'Tamper Evident Aluminum Cap', nameAr: 'سدادة ألمنيوم مانعة للتسرب', category: 'PACKAGING', baseQty: 100, unit: 'Units', unitCostUsd: 0.06, scrapPercentage: 1.0 },
      { id: 'ING-107', itemCode: 'PKG-LBL-POM', name: 'Southern Olive Vinyl Foil Label', nameAr: 'لاصق رسمي زيتون الجنوب', category: 'PACKAGING', baseQty: 100, unit: 'Units', unitCostUsd: 0.08, scrapPercentage: 2.0 },
    ]
  },
  {
    id: 'FORM-002',
    code: 'FORM-VIN-1000',
    title: 'Natural Distilled White Vinegar 5% Dilution 1L',
    titleAr: 'خل أبيض طبيعي مقطر ممدد 5% عبوة 1 ليتر',
    category: 'Vinegars',
    outputProductCode: 'VIN-WHT-1000',
    outputProductName: 'Southern Olive Distilled White Vinegar 1L',
    baseYieldQty: 200,
    outputUnit: 'Bottles',
    laborOverheadUsd: 12.0,
    qualitySpecs: 'Total Acetic Acidity: 5.05 ± 0.1%, Clear crystal liquid, pH: 2.4',
    instructions: [
      'Fill stainless compounding vessel with 190 Liters of chilled RO water.',
      'Slowly meter in Acetic Acid Glacial under high ventilation hood.',
      'Agitate continuously for 20 minutes to achieve uniform 5% dilution.',
      'Perform titration acid assay before piping to automated rotary bottling line.',
      'Pack into 1L PET food-grade bottles, apply screw caps, and label.'
    ],
    ingredients: [
      { id: 'ING-201', itemCode: 'CHM-ACT-GLC', name: 'Acetic Acid Glacial 99.8% Food', nameAr: 'حمض الخليك الجليدي 99.8%', category: 'CHEMICAL', baseQty: 10.2, unit: 'KG', unitCostUsd: 1.40, scrapPercentage: 0.5 },
      { id: 'ING-202', itemCode: 'RAW-WATER-RO', name: 'Deionized RO Water', nameAr: 'مياه مقطرة معقمة', category: 'RAW_MATERIAL', baseQty: 195.0, unit: 'L', unitCostUsd: 0.04, scrapPercentage: 0.5 },
      { id: 'ING-203', itemCode: 'PKG-PET-1000', name: '1L Clear Ribbed PET Bottle', nameAr: 'عبوة بلاستيك غذائي 1 ليتر', category: 'PACKAGING', baseQty: 200, unit: 'Units', unitCostUsd: 0.22, scrapPercentage: 1.0 },
      { id: 'ING-204', itemCode: 'PKG-CAP-PET', name: 'HDPE 28mm Ring Screw Cap', nameAr: 'غطاء أمان 28 ملم', category: 'PACKAGING', baseQty: 200, unit: 'Units', unitCostUsd: 0.05, scrapPercentage: 1.0 },
      { id: 'ING-205', itemCode: 'PKG-LBL-VIN', name: 'Waterproof Polypropylene Label', nameAr: 'لاصق بلاستيكي مقاوم للماء', category: 'PACKAGING', baseQty: 200, unit: 'Units', unitCostUsd: 0.07, scrapPercentage: 1.5 },
    ]
  },
  {
    id: 'FORM-003',
    code: 'FORM-SOP-150',
    title: 'Traditional Olive Oil Castile Soap Bar 150g',
    titleAr: 'صابون زيت زيتون بلدي نابلسي طبيعي 150غ',
    category: 'Soaps & Cosmetics',
    outputProductCode: 'SOP-OLV-150',
    outputProductName: 'Artisanal Extra Virgin Olive Oil Soap 150g',
    baseYieldQty: 250,
    outputUnit: 'Bars',
    laborOverheadUsd: 18.0,
    qualitySpecs: 'Free alkali: <0.05%, Saponification value: 190-195, Moisture: <14%',
    instructions: [
      'Heat filtered virgin olive oil in copper-lined kettle to 45°C.',
      'Dissolve caustic soda flakes in spring water, cool lye solution to 40°C.',
      'Slowly stream lye into olive oil with mechanical immersion blender until trace is reached.',
      'Fold in pure laurel berry extract for fragrance and skin-conditioning.',
      'Pour into pine wooden slab molds, insulate for 48 hours saponification, then wire cut into 150g bars.'
    ],
    ingredients: [
      { id: 'ING-301', itemCode: 'RAW-OLV-SEC', name: 'Second-Press Virgin Olive Oil', nameAr: 'زيت زيتون معصرة نقي للصابون', category: 'RAW_MATERIAL', baseQty: 28.0, unit: 'KG', unitCostUsd: 2.80, scrapPercentage: 1.0 },
      { id: 'ING-302', itemCode: 'CHM-NAOH-99', name: 'Sodium Hydroxide Flakes 99%', nameAr: 'هيدروكسيد الصوديوم (قطرونة)', category: 'CHEMICAL', baseQty: 3.9, unit: 'KG', unitCostUsd: 1.80, scrapPercentage: 0.5 },
      { id: 'ING-303', itemCode: 'RAW-WATER-SP', name: 'Natural Spring Soft Water', nameAr: 'مياه ينابيع عذبة', category: 'RAW_MATERIAL', baseQty: 9.5, unit: 'L', unitCostUsd: 0.05, scrapPercentage: 0.5 },
      { id: 'ING-304', itemCode: 'RAW-EXT-LAU', name: 'Laurel Berry Essential Extract', nameAr: 'زيت غار جبلي مركز', category: 'ADDITIVE', baseQty: 0.5, unit: 'KG', unitCostUsd: 18.00, scrapPercentage: 0.0 },
      { id: 'ING-305', itemCode: 'PKG-WRP-ECO', name: 'Recycled Kraft Waxed Wrap', nameAr: 'غلاف كرافت طبيعي صديق للبيئة', category: 'PACKAGING', baseQty: 250, unit: 'Units', unitCostUsd: 0.08, scrapPercentage: 2.0 },
    ]
  },
  {
    id: 'FORM-004',
    code: 'FORM-INF-250',
    title: 'Gourmet Garlic & Wild Rosemary Infused EVOO 250ml',
    titleAr: 'زيت زيتون بكر ممتاز منكه بالثوم وإكليل الجبل 250 مل',
    category: 'Infused Oils',
    outputProductCode: 'OIL-GAR-250',
    outputProductName: 'Chef Reserve Garlic & Rosemary Infused Oil 250ml',
    baseYieldQty: 120,
    outputUnit: 'Bottles',
    laborOverheadUsd: 16.0,
    qualitySpecs: 'Acidity: <0.5%, Peroxide: <8 meq/kg, Aromatic herbaceous profile',
    instructions: [
      'Inspect dehydrated garlic slices and organic dried rosemary for microbial purity.',
      'Steep botanicals in nitrogen-sparged EVOO tank at controlled 32°C for 72 hours.',
      'Centrifuge through fine stainless mesh to clarify solids while preserving essential aromatic volatiles.',
      'Fill into UV-treated square Marasca 250ml glass bottles with non-drip pourer inserts.',
      'Seal with shrink capsule and apply gold foil embossed label.'
    ],
    ingredients: [
      { id: 'ING-401', itemCode: 'RAW-EVOO-05', name: 'Premium Cold Press EVOO <0.5%', nameAr: 'زيت زيتون بكر ممتاز عصرة أولى', category: 'RAW_MATERIAL', baseQty: 28.0, unit: 'L', unitCostUsd: 5.50, scrapPercentage: 1.0 },
      { id: 'ING-402', itemCode: 'RAW-GAR-DRY', name: 'Dehydrated White Garlic Chips', nameAr: 'رقائق ثوم بلدي مجفف', category: 'RAW_MATERIAL', baseQty: 1.2, unit: 'KG', unitCostUsd: 6.50, scrapPercentage: 1.5 },
      { id: 'ING-403', itemCode: 'RAW-ROS-DRY', name: 'Wild Lebanese Rosemary Needles', nameAr: 'إكليل جبل بري مجفف نخب أول', category: 'RAW_MATERIAL', baseQty: 0.8, unit: 'KG', unitCostUsd: 8.00, scrapPercentage: 1.0 },
      { id: 'ING-404', itemCode: 'PKG-MAR-250', name: '250ml Marasca Square UV Glass', nameAr: 'زجاجة ماراسكا مربعة 250 مل', category: 'PACKAGING', baseQty: 120, unit: 'Units', unitCostUsd: 0.52, scrapPercentage: 1.5 },
      { id: 'ING-405', itemCode: 'PKG-POUR-CAP', name: 'Anti-Drip Pourer & Shrink Wrap', nameAr: 'سدادة صب مانعة للتنقيط وغلاف حراري', category: 'PACKAGING', baseQty: 120, unit: 'Units', unitCostUsd: 0.12, scrapPercentage: 1.0 },
      { id: 'ING-406', itemCode: 'PKG-LBL-GLD', name: 'Gold Foil Embossed Luxe Label', nameAr: 'لاصق ذهبي مذهب فاخر', category: 'PACKAGING', baseQty: 120, unit: 'Units', unitCostUsd: 0.15, scrapPercentage: 1.5 },
    ]
  },
  {
    id: 'FORM-005',
    code: 'FORM-CIP-20L',
    title: 'Food-Grade Stainless Tank CIP Alkaline Cleaner 20L',
    titleAr: 'سائل معقم ومنظف قلوي لخزانات الستانلس ستيل 20 ليتر',
    category: 'Industrial Cleaning',
    outputProductCode: 'CIP-ALK-20L',
    outputProductName: 'EcoClean Heavy Duty Tank CIP Degreaser 20L',
    baseYieldQty: 20,
    outputUnit: 'Canisters',
    laborOverheadUsd: 25.0,
    qualitySpecs: 'Specific gravity: 1.18 g/cm³, Non-foaming, Easily rinsable, pH 12.8',
    instructions: [
      'Fill HDPE mixing tank with 300 Liters of soft RO water.',
      'Slowly add technical grade Phosphoric / Alkali compounding complex with continuous agitation.',
      'Blend in low-foam biodegradable surfactant until completely homogenized.',
      'Drum into heavy-duty 20-liter UN-certified stackable jerricans.',
      'Torque vented tamper-evident caps and apply safety Hazmat labeling.'
    ],
    ingredients: [
      { id: 'ING-501', itemCode: 'CHM-PHO-75', name: 'Phosphoric / Alkaline Base Complex', nameAr: 'مركب قلوي مركز لمعالجة الستانلس', category: 'CHEMICAL', baseQty: 85.0, unit: 'KG', unitCostUsd: 1.90, scrapPercentage: 0.5 },
      { id: 'ING-502', itemCode: 'CHM-SURF-NF', name: 'Non-Ionic Low-Foam Surfactant', nameAr: 'خافض توتر سطحي قليل الرغوة', category: 'CHEMICAL', baseQty: 12.0, unit: 'KG', unitCostUsd: 3.40, scrapPercentage: 0.5 },
      { id: 'ING-503', itemCode: 'RAW-WATER-RO', name: 'Deionized RO Water', nameAr: 'مياه مقطرة معقمة', category: 'RAW_MATERIAL', baseQty: 310.0, unit: 'L', unitCostUsd: 0.03, scrapPercentage: 0.5 },
      { id: 'ING-504', itemCode: 'PKG-CAN-20L', name: '20L UN-Certified HDPE Jerrican', nameAr: 'غالون 20 ليتر صناعي عالي الكثافة', category: 'PACKAGING', baseQty: 20, unit: 'Units', unitCostUsd: 3.80, scrapPercentage: 0.0 },
      { id: 'ING-505', itemCode: 'PKG-CAP-VENT', name: 'Vented Safety Seal Cap & Label', nameAr: 'غطاء أمان بمهواة ولاصق تحذيري', category: 'PACKAGING', baseQty: 20, unit: 'Units', unitCostUsd: 0.40, scrapPercentage: 0.0 },
    ]
  }
];

export default function FormulationsPage() {
  const { t, dir } = useLanguage();
  const { currentTenant } = useTenant();

  const [formulations, setFormulations] = useState<CommercialFormulation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_master_formulations');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_FORMULATIONS;
  });

  const [selectedFormulationId, setSelectedFormulationId] = useState<string>(INITIAL_FORMULATIONS[0].id);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Production Run Modal
  const [isBatchRunModalOpen, setIsBatchRunModalOpen] = useState(false);
  const [destinationLocation, setDestinationLocation] = useState('Manufacture Warehouse (مستودع التصنيع)');
  const [inspectorName, setInspectorName] = useState('Mohammed Jichi (General Operations Manager)');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionNotes, setProductionNotes] = useState('');
  const [isExecutingRun, setIsExecutingRun] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Execution History
  const [productionHistory, setProductionHistory] = useState<ProductionRunRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_production_runs');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'RUN-101',
        runNo: 'BATCH-2026-038',
        formulationId: 'FORM-001',
        formulationTitle: 'Commercial Pomegranate Molasses 500ml',
        scaleMultiplier: 5,
        actualYield: 500,
        outputUnit: 'Bottles',
        totalCostUsd: 1147.50,
        totalCostLbp: 102701250,
        costPerUnitUsd: 2.29,
        destinationLocation: 'Main Store (المخزن الرئيسي)',
        executedBy: 'Mohammed Jichi',
        productionDate: '2026-09-28',
        status: 'COMPLETED',
        notes: 'Passed laboratory Brix test at 69.2°.'
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedFormulation = useMemo(() => {
    return formulations.find((f) => f.id === selectedFormulationId) || formulations[0];
  }, [formulations, selectedFormulationId]);

  // Scaled calculations
  const scaledYield = useMemo(() => {
    return selectedFormulation ? selectedFormulation.baseYieldQty * scaleMultiplier : 0;
  }, [selectedFormulation, scaleMultiplier]);

  const scaledIngredients = useMemo(() => {
    if (!selectedFormulation) return [];
    return selectedFormulation.ingredients.map((ing) => {
      const requiredQty = ing.baseQty * scaleMultiplier;
      const scrapQty = requiredQty * (ing.scrapPercentage / 100);
      const totalConsumedQty = requiredQty + scrapQty;
      const totalLineCostUsd = totalConsumedQty * ing.unitCostUsd;
      const totalLineCostLbp = totalLineCostUsd * 89500;

      return {
        ...ing,
        requiredQty,
        scrapQty,
        totalConsumedQty,
        totalLineCostUsd,
        totalLineCostLbp
      };
    });
  }, [selectedFormulation, scaleMultiplier]);

  const rawMaterialsTotalCostUsd = useMemo(() => {
    return scaledIngredients.reduce((acc, curr) => acc + curr.totalLineCostUsd, 0);
  }, [scaledIngredients]);

  const totalBatchCostUsd = useMemo(() => {
    const labor = (selectedFormulation?.laborOverheadUsd || 0) * scaleMultiplier;
    return rawMaterialsTotalCostUsd + labor;
  }, [rawMaterialsTotalCostUsd, selectedFormulation, scaleMultiplier]);

  const totalBatchCostLbp = totalBatchCostUsd * 89500;
  const costPerUnitUsd = scaledYield > 0 ? totalBatchCostUsd / scaledYield : 0;
  const costPerUnitLbp = costPerUnitUsd * 89500;

  // Filtered recipes
  const filteredFormulations = useMemo(() => {
    return formulations.filter((f) => {
      const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.titleAr.includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.outputProductName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [formulations, selectedCategory, searchQuery]);

  const handleExecuteProductionRun = async () => {
    if (!selectedFormulation) return;
    setIsExecutingRun(true);

    try {
      const nextRunNo = `BATCH-2026-${(productionHistory.length + 40).toString().padStart(3, '0')}`;
      const newRecord: ProductionRunRecord = {
        id: `RUN-${Date.now()}`,
        runNo: nextRunNo,
        formulationId: selectedFormulation.id,
        formulationTitle: selectedFormulation.title,
        scaleMultiplier,
        actualYield: scaledYield,
        outputUnit: selectedFormulation.outputUnit,
        totalCostUsd: totalBatchCostUsd,
        totalCostLbp: totalBatchCostLbp,
        costPerUnitUsd,
        destinationLocation,
        executedBy: inspectorName,
        productionDate,
        status: 'COMPLETED',
        notes: productionNotes.trim() || `Automated compounding batch for ${scaledYield} ${selectedFormulation.outputUnit}.`
      };

      const updatedHistory = [newRecord, ...productionHistory];
      setProductionHistory(updatedHistory);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vanguard_production_runs', JSON.stringify(updatedHistory));
      }

      // Mirror directly to Supabase inventory movements if online
      try {
        await supabase.from('inventory_movements').insert([
          {
            reference_number: nextRunNo,
            movement_type: 'MANUFACTURING_ASSEMBLY_OUTPUT',
            item_code: selectedFormulation.outputProductCode,
            quantity: scaledYield,
            unit: selectedFormulation.outputUnit,
            cost_usd: costPerUnitUsd,
            destination: destinationLocation,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.warn('Supabase inventory movement sync note:', err);
      }

      setIsBatchRunModalOpen(false);
      showToast(
        `Production Batch ${nextRunNo} executed successfully! Generated ${scaledYield} ${selectedFormulation.outputUnit} to ${destinationLocation}.`
      );
    } finally {
      setIsExecutingRun(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left max-w-7xl mx-auto font-sans" dir={dir}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{t('commercial_formulations', 'Commercial Recipe Formulations & BOM')}</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono font-bold">
                  MOD_11
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {t('formulations_desc', 'Industrial compounding, bill-of-materials batch scaling, unit costing & finished goods production')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-primary" />
              <span>{t('recipes_catalog', 'Recipe Catalog')}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('batch_runs_history', 'Production Runs')}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded-full font-mono font-bold">
                {productionHistory.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Recipes Master Directory (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('search_formulations', 'Search recipes, codes, products...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-primary focus:bg-white transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'Molasses & Syrups', label: 'Molasses' },
                  { id: 'Vinegars', label: 'Vinegars' },
                  { id: 'Soaps & Cosmetics', label: 'Soaps' },
                  { id: 'Infused Oils', label: 'Infused' },
                  { id: 'Industrial Cleaning', label: 'Cleaners' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      selectedCategory === c.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipes Cards List */}
            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {filteredFormulations.map((f) => {
                const isSelected = f.id === selectedFormulation.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFormulationId(f.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {f.code}
                        </span>
                        <h3 className="text-xs font-black text-slate-900 mt-1 leading-snug">
                          {f.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium font-arabic mt-0.5">
                          {f.titleAr}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {f.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2.5">
                      <span>
                        Base: <strong className="text-slate-800 font-mono">{f.baseYieldQty} {f.outputUnit}</strong>
                      </span>
                      <span>
                        Ingredients: <strong className="text-slate-800">{f.ingredients.length}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Formulation Details & Batch Scaling (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedFormulation ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                {/* Header Section */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                          {selectedFormulation.code}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          {selectedFormulation.category}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white mt-1.5">
                        {selectedFormulation.title}
                      </h2>
                      <p className="text-xs text-slate-300 font-arabic mt-0.5">
                        {selectedFormulation.titleAr}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsBatchRunModalOpen(true)}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer shrink-0"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{t('execute_batch_run', 'Execute Batch Run')}</span>
                    </button>
                  </div>

                  {/* Batch Scale Multiplier Bar */}
                  <div className="mt-6 pt-5 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        {t('batch_scale', 'Batch Multiplier:')}
                      </span>
                      {[1, 2, 5, 10, 25].map((multiplier) => (
                        <button
                          key={multiplier}
                          onClick={() => setScaleMultiplier(multiplier)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            scaleMultiplier === multiplier
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {multiplier}x
                        </button>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {t('total_scaled_yield', 'Calculated Output Yield')}
                      </span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        {scaledYield.toLocaleString()} {selectedFormulation.outputUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('raw_materials_cost', 'Materials Cost')}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                      ${rawMaterialsTotalCostUsd.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {(rawMaterialsTotalCostUsd * 89500).toLocaleString()} LBP
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('labor_overhead', 'Labor & Overhead')}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                      ${(selectedFormulation.laborOverheadUsd * scaleMultiplier).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {((selectedFormulation.laborOverheadUsd * scaleMultiplier) * 89500).toLocaleString()} LBP
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('total_batch_cost', 'Total Batch Cost')}
                    </span>
                    <span className="text-sm sm:text-base font-black text-primary font-mono">
                      ${totalBatchCostUsd.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {totalBatchCostLbp.toLocaleString()} LBP
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('unit_cost', 'Cost / Unit')}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-700 font-mono">
                      ${costPerUnitUsd.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {costPerUnitLbp.toLocaleString()} LBP
                    </span>
                  </div>
                </div>

                {/* Bill of Materials (BOM) Table */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-primary" />
                      <span>{t('bill_of_materials', 'Bill of Materials (BOM) Ingredient Consumption')}</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      Scale Multiplier: <strong>{scaleMultiplier}x</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Item Code</th>
                          <th className="py-2.5 px-3">Ingredient Description</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Base Required</th>
                          <th className="py-2.5 px-3 text-right">Scrap %</th>
                          <th className="py-2.5 px-3 text-right">Gross Total Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Cost</th>
                          <th className="py-2.5 px-3 text-right">Line Total (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                        {scaledIngredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2 px-3 font-mono font-bold text-primary">
                              {ing.itemCode}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-slate-900 block">{ing.name}</span>
                              <span className="text-[11px] text-slate-500 font-arabic block">{ing.nameAr}</span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                {ing.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              {ing.requiredQty.toFixed(2)} {ing.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">
                              {ing.scrapPercentage > 0 ? `+${ing.scrapPercentage}%` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                              {ing.totalConsumedQty.toFixed(2)} {ing.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">
                              ${ing.unitCostUsd.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                              ${ing.totalLineCostUsd.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* SOP & Quality Specs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>{t('quality_specifications', 'Quality Specifications & Standards')}</span>
                      </span>
                      <p className="text-xs text-slate-600 font-mono leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        {selectedFormulation.qualitySpecs}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{t('production_sop_steps', 'Production & Bottling SOP')}</span>
                      </span>
                      <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside bg-white p-3 rounded-xl border border-slate-200">
                        {selectedFormulation.instructions.map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Production Runs History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {t('manufacturing_batch_ledger', 'Manufacturing Batch Execution Ledger')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('batch_ledger_desc', 'Historical record of compounded batches, ingredient consumptions, and warehouse receipts')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('new_batch_run', 'New Production Run')}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Run #</th>
                  <th className="py-3 px-4">Recipe Title</th>
                  <th className="py-3 px-4">Scale</th>
                  <th className="py-3 px-4 text-right">Actual Output</th>
                  <th className="py-3 px-4 text-right">Total Cost (USD)</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4">Destination Store</th>
                  <th className="py-3 px-4">Inspector</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {productionHistory.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{run.runNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{run.formulationTitle}</td>
                    <td className="py-3 px-4 font-mono">{run.scaleMultiplier}x</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {run.actualYield.toLocaleString()} {run.outputUnit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${run.totalCostUsd.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ${run.costPerUnitUsd.toFixed(3)}
                    </td>
                    <td className="py-3 px-4">{run.destinationLocation}</td>
                    <td className="py-3 px-4">{run.executedBy}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{run.productionDate}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Production Run Execution Modal */}
      {isBatchRunModalOpen && selectedFormulation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-left">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Play className="w-4 h-4 fill-emerald-800" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {t('confirm_production_run', 'Execute Production Batch Run')}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedFormulation.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchRunModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 block">Planned Finished Output</span>
                  <span className="text-lg font-black text-emerald-950 font-mono">
                    {scaledYield.toLocaleString()} {selectedFormulation.outputUnit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-800 block">Total Compounding Cost</span>
                  <span className="text-lg font-black text-emerald-950 font-mono">
                    ${totalBatchCostUsd.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Destination Inventory Location*</label>
                <select
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-primary cursor-pointer"
                >
                  <option value="Manufacture Warehouse (مستودع التصنيع)">Manufacture Warehouse (مستودع التصنيع)</option>
                  <option value="Main Store (المخزن الرئيسي)">Main Store (المخزن الرئيسي)</option>
                  <option value="Choueifat Showroom (صالة العرض الشويفات)">Choueifat Showroom (صالة العرض الشويفات)</option>
                  <option value="Delivery Dispatch Staging (منطقة شحن الطلبيات)">Delivery Dispatch Staging (منطقة شحن الطلبيات)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Execution Date*</label>
                  <input
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Quality Inspector*</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Batch Notes & Laboratory Findings</label>
                <textarea
                  rows={2}
                  value={productionNotes}
                  onChange={(e) => setProductionNotes(e.target.value)}
                  placeholder="Specify batch tank number, ambient temp, visual clarity..."
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Confirming this batch will automatically log raw material consumption entries and credit the finished goods inventory account in the general ledger.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBatchRunModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExecutingRun}
                onClick={handleExecuteProductionRun}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExecutingRun ? (
                  <span>Processing Run...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Execute Run</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
