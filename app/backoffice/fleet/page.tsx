'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES & CORRIDORS - SUPERSONIC FLEET & SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ============================================================================

type FleetTab = 'DISPATCH' | 'RADAR' | 'SETTLEMENTS' | 'POD' | 'VEHICLES';

type VehicleCategory = 'VAN' | 'CAR' | 'MOTORCYCLE';

type OrderSourceType = 'IN_HOUSE_SOUTHERN_OLIVE' | 'EXTERNAL_3PL_VENDOR';

interface CorridorRoute {
  id: number;
  number: number;
  nameAr: string;
  nameEn: string;
  schedule: string;
  highwayPath: string;
  activeOrdersCount: number;
}

interface FleetVehicle {
  plate: string;
  category: VehicleCategory;
  model: string;
  driver: string;
  assignedCorridor: number;
  status: 'ON_DUTY_LOADING' | 'ON_ROUTE' | 'DELIVERING' | 'RETURNING' | 'OFF_DUTY';
  odometerStartKm: number;
  currentKm: number;
  offDutyLocationPin?: string;
  reconciliationClosed: boolean;
}

interface DispatchedOrder {
  id: string;
  orderNo: string;
  sourceType: OrderSourceType;
  customerName: string;
  corridorId: number;
  destinationTown: string;
  addressDetails: string;
  items: string;
  productAmountLbp: number;
  productAmountUsd: number;
  deliveryFeeUsd: number;
  assignedVehiclePlate: string;
  assignedDriver: string;
  status: 'QUEUED' | 'ON_ROUTE' | 'DELIVERED' | 'REJECTED' | 'PENDING' | 'MOVED_TO_POS_PICKUP';
}

interface WhishSettlementSubmission {
  id: string;
  driverName: string;
  vehiclePlate: string;
  amountLbp: number;
  amountUsd: number;
  whishReferenceNo: string;
  proofImageUrl: string;
  submittedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export default function SuperSonicFleetManagementPage() {
  const [activeTab, setActiveTab] = useState<FleetTab>('DISPATCH');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');
  const [selectedVehicleTypeFilter, setSelectedVehicleTypeFilter] = useState<string>('ALL');

  // 1. THE 7 STRATEGIC CORRIDORS DEPARTING FROM CHOUEIFAT MAIN HUB
  const corridorsList: CorridorRoute[] = [
    { id: 1, number: 1, nameAr: 'بيروت الكبرى والساحل المتصل', nameEn: 'Greater Beirut & Connected Coast', schedule: 'Daily (يومي)', highwayPath: 'المركز الرئيسي بالشويفات ⬅️ خلدة ⬅️ الحدث / بعبدا / الضاحية ⬅️ العاصمة بيروت ⬅️ ساحل المتن (سن الفيل، الجديدة، جل الديب)', activeOrdersCount: 14 },
    { id: 2, number: 2, nameAr: 'جبل لبنان الأوسط والجنوبي', nameEn: 'Central & Southern Mount Lebanon', schedule: 'Daily / Near-Daily (يومي أو شبه يومي)', highwayPath: 'المركز الرئيسي بالشويفات ⬅️ عرمون / بشامون / قبرشمون ⬅️ عاليه / بحمدون / صوفر ⬅️ الشوف الأعلى (دير القمر، بعقلين، الباروك)', activeOrdersCount: 9 },
    { id: 3, number: 3, nameAr: 'خط الساحل الجنوبي والعمق', nameEn: 'Southern Coast & Deep South', schedule: 'Daily (يومي)', highwayPath: 'ساحل الشوف (الدامور، الجية) ⬅️ صيدا ⬅️ صور ⬅️ النبطية', activeOrdersCount: 12 },
    { id: 4, number: 4, nameAr: 'الساحل الشمالي حتى البترون', nameEn: 'Northern Coast to Batroun', schedule: '3-4 times/week (3-4 مرات أسبوعياً)', highwayPath: 'أنطلياس / الضبية ⬅️ جونية / كسروان ⬅️ جبيل ⬅️ البترون ⬅️ الكورة', activeOrdersCount: 8 },
    { id: 5, number: 5, nameAr: 'طرابلس، عكار والضنية', nameEn: 'Tripoli, Akkar & Dinnieh', schedule: '2-3 times/week (2-3 مرات أسبوعياً)', highwayPath: 'طرابلس ⬅️ المنية ⬅️ زغرتا ⬅️ الضنية ⬅️ عكار (حلبا، العبدة، القبيات، خريبة الجندي، منجز)', activeOrdersCount: 6 },
    { id: 6, number: 6, nameAr: 'البقاع الأوسط والغربي والجنوب الشرقي', nameEn: 'Central, West Bekaa & South-East', schedule: '2-3 times/week (2-3 مرات أسبوعياً)', highwayPath: 'طريق الشام (صوفر - ضهر البيدر) ⬅️ شتورا / زحلة ⬅️ البقاع الغربي (جب جنين) ⬅️ راشيا ⬅️ حاصبيا ⬅️ جزين عبر مشغرة', activeOrdersCount: 5 },
    { id: 7, number: 7, nameAr: 'البقاع الشمالي - بعلبك الهرمل', nameEn: 'North Bekaa - Baalbek Hermel', schedule: '1-2 times/week (1-2 مرات أسبوعياً)', highwayPath: 'رياق ⬅️ بعلبك ⬅️ دير الأحمر ⬅️ اللبوة ⬅️ الهرمل', activeOrdersCount: 3 },
  ];

  // 2. FLEET VEHICLES & LOCKOUT GOVERNANCE
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', assignedCorridor: 1, status: 'ON_ROUTE', odometerStartKm: 142050, currentKm: 142115, reconciliationClosed: true },
    { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', assignedCorridor: 2, status: 'DELIVERING', odometerStartKm: 88400, currentKm: 88462, reconciliationClosed: true },
    { plate: 'S-772910', category: 'CAR', model: 'Renault Duster 4x4 (Car 01)', driver: 'Hassan Sleiman', assignedCorridor: 3, status: 'ON_ROUTE', odometerStartKm: 65120, currentKm: 65205, reconciliationClosed: true },
    { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', assignedCorridor: 1, status: 'ON_ROUTE', odometerStartKm: 12400, currentKm: 12435, reconciliationClosed: true },
    { plate: 'B-310928', category: 'VAN', model: 'Toyota HiAce Medium (Van 03)', driver: 'Elie Matar', assignedCorridor: 6, status: 'OFF_DUTY', odometerStartKm: 110200, currentKm: 110290, offDutyLocationPin: 'Chtaura Square Pin (33.821, 35.852)', reconciliationClosed: false },
  ]);

  // 3. DISPATCH ORDERS (MERGED SOUTHERN OLIVE + EXTERNAL 3PL)
  const [orders, setOrders] = useState<DispatchedOrder[]>([
    {
      id: 'ORD-103349',
      orderNo: 'ORD-103349',
      sourceType: 'IN_HOUSE_SOUTHERN_OLIVE',
      customerName: 'Al-Baraka Supermarket S.A.R.L',
      corridorId: 1,
      destinationTown: 'Beirut - Hamra',
      addressDetails: 'Makdessi St, Building 14',
      items: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026)',
      productAmountLbp: 9000000,
      productAmountUsd: 100,
      deliveryFeeUsd: 4.0,
      assignedVehiclePlate: 'B-492102',
      assignedDriver: 'Tony Khoury',
      status: 'ON_ROUTE',
    },
    {
      id: 'ORD-103350',
      orderNo: 'ORD-103350',
      sourceType: 'IN_HOUSE_SOUTHERN_OLIVE',
      customerName: 'Colonel Mahmoud Abboud',
      corridorId: 2,
      destinationTown: 'Choueifat Showroom',
      addressDetails: 'In-Store Pickup Counter',
      items: '30x 17.5L Extra Virgin Bulk Harvest Tins',
      productAmountLbp: 248400000,
      productAmountUsd: 2760,
      deliveryFeeUsd: 0.0,
      assignedVehiclePlate: '-',
      assignedDriver: '-',
      status: 'MOVED_TO_POS_PICKUP', // Unclickable ghost record!
    },
    {
      id: '3PL-88120',
      orderNo: '3PL-88120',
      sourceType: 'EXTERNAL_3PL_VENDOR',
      customerName: 'La Rose Fashion Boutique',
      corridorId: 1,
      destinationTown: 'Metn - Sin El Fil',
      addressDetails: 'Near Habtoor Grand Hotel',
      items: '3x Apparel Packages (Dry Goods)',
      productAmountLbp: 3150000,
      productAmountUsd: 35,
      deliveryFeeUsd: 3.0,
      assignedVehiclePlate: 'B-492102',
      assignedDriver: 'Tony Khoury',
      status: 'ON_ROUTE',
    },
    {
      id: 'ORD-103352',
      orderNo: 'ORD-103352',
      sourceType: 'IN_HOUSE_SOUTHERN_OLIVE',
      customerName: 'Hussein Daik Retail Mart',
      corridorId: 3,
      destinationTown: 'Saida - Riad El Solh',
      addressDetails: 'Daik Wholesale Center',
      items: 'Assorted Food Preserves + Extra Virgin 1L Cases',
      productAmountLbp: 706968000,
      productAmountUsd: 7855.2,
      deliveryFeeUsd: 6.0,
      assignedVehiclePlate: 'S-772910',
      assignedDriver: 'Hassan Sleiman',
      status: 'ON_ROUTE',
    },
  ]);

  // 4. WHISH ONLINE SETTLEMENTS
  const [whishSubmissions, setWhishSubmissions] = useState<WhishSettlementSubmission[]>([
    {
      id: 'WSH-0091',
      driverName: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      amountLbp: 45000000,
      amountUsd: 500,
      whishReferenceNo: 'WHISH-TX-9988124',
      proofImageUrl: 'assets/images/whish_receipt.png',
      submittedAt: 'Today 04:15 PM',
      status: 'PENDING_APPROVAL',
    },
  ]);

  // 5. DRIVER CONTRIBUTION MANUAL INPUT STATE
  const [driverContributions, setDriverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 15.0, // $15 Fuel/Allowance contribution
    'Fadi Abou Assi': 20.0,
    'Hassan Sleiman': 25.0,
    'Elie Matar': 0.0,
  });

  // Actions
  const handleApproveWhish = (id: string) => {
    setWhishSubmissions((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED' } : w))
    );
    alert(`✓ Whish Settlement #${id} Approved! Funds verified into SuperSonic treasury.`);
  };

  const handleRejectWhish = (id: string) => {
    setWhishSubmissions((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'REJECTED' } : w))
    );
    alert(`⚠️ Whish Settlement #${id} Rejected! Notification sent to driver to resolve discrepancy.`);
  };

  const handleManualRouteMerge = (sourceCorridor: number, targetCorridor: number) => {
    alert(`Corridor ${sourceCorridor} merged successfully into Corridor ${targetCorridor} for today's run!`);
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-10">
      
      {/* 1. TOP COMMAND BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              2. SuperSonic Fleet Management & Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            المركز الرئيسي لشركة سوبر سونيك (Choueifat Gateway) — 7 Strategic Corridors, Multi-Currency COD & Whish Settlements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-[#edf2ee] text-[#1e3a2b] font-bold rounded-lg border border-[#1e3a2b]/30">
            00001 - Southern Olive Oil Products S.A.R.L
          </span>
          <Link
            href="/backoffice/dashboard"
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 transition-colors"
          >
            🔄 Return to Hub
          </Link>
        </div>
      </div>

      {/* 2. TOP 5 LIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">🚐</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Active Fleet</span>
            <span className="text-base font-extrabold text-slate-900">4 Active (3 Vans, 1 Moto)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-lg">🗺️</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">7 Corridors Runs</span>
            <span className="text-base font-extrabold text-slate-900">7 Routes / Choueifat</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">✓</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Today's Deliveries</span>
            <span className="text-base font-extrabold text-slate-900">{orders.length} Active Runs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">📲</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Whish Reconciliation</span>
            <span className="text-base font-extrabold text-purple-900">1 Pending Review</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">🔒</div>
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Lockout Status</span>
            <span className="text-base font-extrabold text-rose-700">1 Driver Locked</span>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('DISPATCH')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'DISPATCH' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📋 7 Corridors & Regional Dispatch
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('RADAR')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'RADAR' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🗺️ Live Fleet Radar & GPS Map
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SETTLEMENTS')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          💰 COD, Whish & Driver Cash Settlements
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('POD')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'POD' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          ✍️ Proof of Delivery (POD) Archives
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('VEHICLES')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'VEHICLES' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🚐 Fleet Vehicles & Odometer Log
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: 7 CORRIDORS & REGIONAL DISPATCH (CROSS-COMPANY CO-LOADING)   */}
      {/* =================================================================== */}
      {activeTab === 'DISPATCH' && (
        <div className="space-y-4">
          
          {/* Corridor Cards Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {corridorsList.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCorridorFilter(selectedCorridorFilter === c.number ? 'ALL' : c.number)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCorridorFilter === c.number ? 'bg-[#edf2ee] border-[#1e3a2b] ring-2 ring-[#1e3a2b]/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#1e3a2b] text-white">المسار {c.number}</span>
                  <span className="text-[10px] font-mono text-slate-500">{c.schedule}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1.5 leading-tight">{c.nameAr}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{c.highwayPath}</p>
                <div className="mt-2 pt-1 border-t border-slate-200/80 flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-slate-500">Orders:</span>
                  <strong className="text-[#1e3a2b]">{c.activeOrdersCount} packages</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Dispatched Runs (Southern Olive + 3PL Orders)</h3>
                <p className="text-[11px] text-slate-400">All orders originating from Choueifat Main Hub, merged by highway corridors.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleManualRouteMerge(6, 7)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300"
                >
                  🔄 Merge Corridors (6 & 7)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2.5 px-3 normal-case">order no.</th>
                    <th className="py-2.5 px-3 normal-case">source entity</th>
                    <th className="py-2.5 px-3 normal-case">customer & destination</th>
                    <th className="py-2.5 px-3 normal-case">highway corridor</th>
                    <th className="py-2.5 px-3 normal-case">order items</th>
                    <th className="py-2.5 px-3 normal-case text-right">product val</th>
                    <th className="py-2.5 px-3 normal-case text-right">delivery fee</th>
                    <th className="py-2.5 px-3 normal-case text-center">assigned vehicle</th>
                    <th className="py-2.5 px-3 normal-case text-center">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                  {orders
                    .filter((o) => selectedCorridorFilter === 'ALL' || o.corridorId === selectedCorridorFilter)
                    .map((order) => (
                      <tr
                        key={order.id}
                        className={`transition-colors ${order.status === 'MOVED_TO_POS_PICKUP' ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{order.orderNo}</td>
                        <td className="py-2.5 px-3">
                          {order.sourceType === 'IN_HOUSE_SOUTHERN_OLIVE' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                              🫒 Southern Olive In-House
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300 text-[10px] font-bold">
                              🏢 External 3PL Merchant
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-900 block">{order.customerName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block">{order.destinationTown} — {order.addressDetails}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          المسار {order.corridorId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 text-[11px]">{order.items}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {order.productAmountLbp > 0 ? `${order.productAmountLbp.toLocaleString('en-US')} LBP` : `$${order.productAmountUsd.toFixed(2)}`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          ${order.deliveryFeeUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {order.assignedVehiclePlate !== '-' ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-[10.5px]">
                              {order.assignedVehiclePlate} ({order.assignedDriver})
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {order.status === 'MOVED_TO_POS_PICKUP' ? (
                            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px] flex items-center justify-center gap-1">
                              <span>🏪</span> Moved to POS Pickup (Read-Only)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                              {order.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: LIVE FLEET RADAR & TELEMETRY (ODOMETER & OFF-DUTY PIN)       */}
      {/* =================================================================== */}
      {activeTab === 'RADAR' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {vehicles.map((v) => (
              <div key={v.plate} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{v.plate}</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{v.model}</h4>
                    <span className="text-[11px] text-slate-600 block">Driver: <strong>{v.driver}</strong></span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === 'ON_ROUTE' ? 'bg-indigo-100 text-indigo-800' : v.status === 'DELIVERING' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {v.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>Assigned Corridor:</span> <strong>المسار {v.assignedCorridor}</strong></div>
                  <div className="flex justify-between"><span>Odometer Start:</span> <strong>{v.odometerStartKm.toLocaleString()} KM</strong></div>
                  <div className="flex justify-between"><span>Current Mileage:</span> <strong>{v.currentKm.toLocaleString()} KM</strong></div>
                  <div className="flex justify-between text-blue-700 font-bold"><span>Today's Distance:</span> <strong>{(v.currentKm - v.odometerStartKm)} KM</strong></div>
                  {v.offDutyLocationPin && (
                    <div className="pt-1 border-t border-slate-200 text-rose-700 text-[10px]">
                      📍 <strong>Off-Duty Geo-Pin:</strong> {v.offDutyLocationPin}
                    </div>
                  )}
                </div>

                <div className="pt-1 flex justify-between items-center text-xs">
                  <span className="text-[10.5px] font-bold text-slate-500">Next-Day Line Status:</span>
                  {v.reconciliationClosed ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Reconciled & Ready ✓</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] animate-pulse">
                      🔒 Locked (Reconciliation Open)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: COD, WHISH & DRIVER SETTLEMENTS (MANUAL CONTRIBUTION BINDING)*/}
      {/* =================================================================== */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="space-y-4">
          
          {/* Whish Submissions Audit Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Online Whish Money Settlement Approvals</h3>
            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2 px-3 normal-case">driver name</th>
                    <th className="py-2 px-3 normal-case">vehicle</th>
                    <th className="py-2 px-3 normal-case text-right">whish usd</th>
                    <th className="py-2 px-3 normal-case text-right">whish lbp</th>
                    <th className="py-2 px-3 normal-case">reference no.</th>
                    <th className="py-2 px-3 normal-case">timestamp</th>
                    <th className="py-2 px-3 normal-case text-center">status</th>
                    <th className="py-2 px-3 normal-case text-center">action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {whishSubmissions.map((w) => (
                    <tr key={w.id}>
                      <td className="py-2 px-3 font-bold font-sans text-slate-900">{w.driverName}</td>
                      <td className="py-2 px-3 text-slate-600">{w.vehiclePlate}</td>
                      <td className="py-2 px-3 text-right font-bold text-purple-700">${w.amountUsd.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold text-purple-700">{w.amountLbp.toLocaleString()} LBP</td>
                      <td className="py-2 px-3 text-slate-800">{w.whishReferenceNo}</td>
                      <td className="py-2 px-3 text-slate-500 font-sans">{w.submittedAt}</td>
                      <td className="py-2 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : w.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-sans">
                        {w.status === 'PENDING_APPROVAL' && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveWhish(w.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10.5px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectWhish(w.id)}
                              className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded text-[10.5px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Reconciliation & Contribution Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Driver End-of-Day Reconciliation & «مساهمة» Allowance</h3>
            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2.5 px-3 normal-case">driver name</th>
                    <th className="py-2.5 px-3 normal-case">vehicle category</th>
                    <th className="py-2.5 px-3 normal-case text-right">cash collected (usd)</th>
                    <th className="py-2.5 px-3 normal-case text-right">whish collected (usd)</th>
                    <th className="py-2.5 px-3 normal-case text-center">مساهمة الشوفير (allowance $)</th>
                    <th className="py-2.5 px-3 normal-case text-center">lockout status</th>
                    <th className="py-2.5 px-3 normal-case text-center">settlement action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                  {vehicles.map((v) => (
                    <tr key={v.driver}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{v.driver}</td>
                      <td className="py-2.5 px-3 font-mono">{v.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">$2,450.00</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">$500.00</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-slate-400">$</span>
                          <input
                            type="number"
                            value={driverContributions[v.driver] || 0}
                            onChange={(e) =>
                              setDriverContributions({
                                ...driverContributions,
                                [v.driver]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center font-mono font-bold text-xs"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {v.reconciliationClosed ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Cleared ✓</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">Locked Until Settled 🔒</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Reconciliation for ${v.driver} finalized with contribution of $${driverContributions[v.driver]}!`)}
                          className="px-3 py-1 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded text-[10.5px] font-bold"
                        >
                          Finalize Settlement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: POD ARCHIVES & TAB 5: VEHICLES LOG                           */}
      {/* =================================================================== */}
      {activeTab === 'POD' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Electronic Signatures & Photos</h3>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="font-bold text-[#1e3a2b] text-sm block">ORD-103349 - Al-Baraka Supermarket</span>
              <span className="text-slate-500 block">Signed by: Store Receiving Manager (Imad)</span>
              <span className="text-slate-400 block text-[10px]">GPS Delivered: 33.8938° N, 35.4802° E (Hamra)</span>
            </div>
            <div className="text-right space-y-1">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10.5px]">2 Photos Attached 📸</span>
              <div className="text-slate-600 font-bold text-[11px]">Paid: 9,000,000 LBP (COD)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'VEHICLES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Fleet Vehicles, Maintenance & Fuel Vault</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned Driver: {v.driver}</div>
                <div className="text-blue-700 font-bold">Total Odometer: {v.currentKm.toLocaleString()} KM</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
