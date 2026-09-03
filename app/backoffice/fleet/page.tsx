'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES & CORRIDORS - SUPERSONIC FLEET & SOUTHERN OLIVE OIL PRODUCTS S.A.R.L
// ============================================================================

type FleetView = 'DASHBOARD' | 'DISPATCH' | 'RADAR' | 'SETTLEMENTS' | 'POD' | 'VEHICLES';

type VehicleCategory = 'VAN' | 'CAR' | 'MOTORCYCLE';

type OrderSourceType = 'IN_HOUSE_SOUTHERN_OLIVE' | 'EXTERNAL_3PL_VENDOR';

interface DriverTripBatch {
  tripNumber: number;
  corridorName: string;
  totalStops: number;
  deliveredStops: number;
  productValueUsd: number;
  deliveryFeesUsd: number;
  cashUsdCollected: number;
  cashLbpCollected: number;
  whishUsdCollected: number;
  status: 'IN_PROGRESS' | 'RECONCILED';
}

interface FleetVehicle {
  plate: string;
  category: VehicleCategory;
  model: string;
  driver: string;
  assignedCorridor: number;
  status: 'ON_DUTY_LOADING' | 'ON_ROUTE' | 'DELIVERING' | 'RETURNING' | 'OFF_DUTY';
  currentKm: number;
  startKm: number;
  reconciliationClosed: boolean;
  tripsToday: DriverTripBatch[];
}

interface DispatchedOrder {
  id: string;
  orderNo: string;
  sourceType: OrderSourceType;
  customerName: string;
  corridorId: number;
  tripNo: number;
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
  amountUsd: number;
  whishReferenceNo: string;
  submittedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export default function SuperSonicFleetManagementPage() {
  // Master View Navigation (Defaults to Clean Dashboard Overview)
  const [currentView, setCurrentView] = useState<FleetView>('DASHBOARD');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');

  // Driver Allowance (المساهمة)
  const [driverContributions, setDriverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 20.0,
    'Fadi Abou Assi': 25.0,
    'Hassan Sleiman': 30.0,
    'Ahmad Zein': 10.0,
  });

  // Fleet Vehicles
  const [vehicles] = useState<FleetVehicle[]>([
    {
      plate: 'B-492102',
      category: 'VAN',
      model: 'Toyota HiAce High Roof (Van 01)',
      driver: 'Tony Khoury',
      assignedCorridor: 1,
      status: 'ON_ROUTE',
      startKm: 142050,
      currentKm: 142165,
      reconciliationClosed: true,
      tripsToday: [
        { tripNumber: 1, corridorName: 'المسار 1: بيروت الكبرى', totalStops: 6, deliveredStops: 6, productValueUsd: 350.0, deliveryFeesUsd: 24.0, cashUsdCollected: 250.0, cashLbpCollected: 9000000, whishUsdCollected: 100.0, status: 'RECONCILED' },
        { tripNumber: 2, corridorName: 'المسار 2: الشوف وعاليه', totalStops: 4, deliveredStops: 4, productValueUsd: 210.0, deliveryFeesUsd: 16.0, cashUsdCollected: 110.0, cashLbpCollected: 0, whishUsdCollected: 100.0, status: 'RECONCILED' },
      ],
    },
    {
      plate: 'G-183921',
      category: 'VAN',
      model: 'Hyundai H1 Cargo (Van 02)',
      driver: 'Fadi Abou Assi',
      assignedCorridor: 2,
      status: 'DELIVERING',
      startKm: 88400,
      currentKm: 88480,
      reconciliationClosed: true,
      tripsToday: [
        { tripNumber: 1, corridorName: 'المسار 2: جبل لبنان', totalStops: 5, deliveredStops: 5, productValueUsd: 400.0, deliveryFeesUsd: 20.0, cashUsdCollected: 400.0, cashLbpCollected: 0, whishUsdCollected: 0.0, status: 'RECONCILED' },
      ],
    },
    {
      plate: 'M-102941',
      category: 'MOTORCYCLE',
      model: 'Honda Cargo 250 (Moto 01)',
      driver: 'Ahmad Zein',
      assignedCorridor: 1,
      status: 'ON_ROUTE',
      startKm: 12400,
      currentKm: 12460,
      reconciliationClosed: true,
      tripsToday: [
        { tripNumber: 1, corridorName: 'المسار 1: بيروت السريعة', totalStops: 3, deliveredStops: 3, productValueUsd: 90.0, deliveryFeesUsd: 9.0, cashUsdCollected: 90.0, cashLbpCollected: 0, whishUsdCollected: 0.0, status: 'RECONCILED' },
      ],
    },
    {
      plate: 'B-310928',
      category: 'VAN',
      model: 'Toyota HiAce Medium (Van 03)',
      driver: 'Elie Matar',
      assignedCorridor: 6,
      status: 'OFF_DUTY',
      startKm: 110200,
      currentKm: 110290,
      reconciliationClosed: false,
      tripsToday: [],
    },
  ]);

  // Dispatched Orders
  const [orders] = useState<DispatchedOrder[]>([
    {
      id: 'ORD-103349',
      orderNo: 'ORD-103349',
      sourceType: 'IN_HOUSE_SOUTHERN_OLIVE',
      customerName: 'Al-Baraka Supermarket S.A.R.L',
      corridorId: 1,
      tripNo: 1,
      destinationTown: 'Beirut - Hamra',
      addressDetails: 'Makdessi St, Bldg 14',
      items: '1x 17.5L Extra Virgin Tin + 2x Pickled Olives',
      productAmountLbp: 9000000,
      productAmountUsd: 100,
      deliveryFeeUsd: 4.0,
      assignedVehiclePlate: 'B-492102',
      assignedDriver: 'Tony Khoury',
      status: 'DELIVERED',
    },
    {
      id: '3PL-88120',
      orderNo: '3PL-88120',
      sourceType: 'EXTERNAL_3PL_VENDOR',
      customerName: 'La Rose Fashion Boutique',
      corridorId: 1,
      tripNo: 1,
      destinationTown: 'Metn - Sin El Fil',
      addressDetails: 'Near Habtoor Hotel',
      items: '3x Apparel Dry Goods Packages',
      productAmountLbp: 3150000,
      productAmountUsd: 35,
      deliveryFeeUsd: 3.0,
      assignedVehiclePlate: 'B-492102',
      assignedDriver: 'Tony Khoury',
      status: 'DELIVERED',
    },
    {
      id: 'ORD-103350',
      orderNo: 'ORD-103350',
      sourceType: 'IN_HOUSE_SOUTHERN_OLIVE',
      customerName: 'Colonel Mahmoud Abboud',
      corridorId: 2,
      tripNo: 0,
      destinationTown: 'Choueifat Showroom',
      addressDetails: 'Showroom Pickup Counter',
      items: '30x 17.5L Extra Virgin Bulk Tins',
      productAmountLbp: 248400000,
      productAmountUsd: 2760,
      deliveryFeeUsd: 0.0,
      assignedVehiclePlate: '-',
      assignedDriver: '-',
      status: 'MOVED_TO_POS_PICKUP',
    },
  ]);

  // Whish Submissions
  const [whishSubmissions, setWhishSubmissions] = useState<WhishSettlementSubmission[]>([
    {
      id: 'WSH-0091',
      driverName: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      amountUsd: 200,
      whishReferenceNo: 'WHISH-TX-9988124',
      submittedAt: 'Today 04:15 PM',
      status: 'PENDING_APPROVAL',
    },
  ]);

  const handleApproveWhish = (id: string) => {
    setWhishSubmissions((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED' } : w)));
    alert(`✓ Whish Settlement #${id} Approved into SuperSonic treasury.`);
  };

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-10">
      
      {/* BULLETPROOF PRINT CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 0mm !important; }
          body { background: #fff !important; margin: 0 !important; visibility: hidden !important; }
          body * { visibility: hidden !important; }
          header, aside, nav, button, input, select, .print-hidden { display: none !important; }
          #isolated-a4-print-sheet, #isolated-a4-print-sheet * { visibility: visible !important; }
          #isolated-a4-print-sheet {
            position: fixed !important; left: 0 !important; top: 0 !important; width: 100vw !important;
            min-height: 100vh !important; margin: 0 !important; padding: 12mm 15mm !important;
            background: #fff !important; display: block !important; z-index: 999999 !important;
          }
        }
      `}} />

      {/* 1. TOP HEADER WITH BREADCRUMB & RETURN TO DASHBOARD */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-slate-200 pb-3 print:hidden">
        <div className="flex items-center gap-3">
          {currentView !== 'DASHBOARD' && (
            <button
              type="button"
              onClick={() => setCurrentView('DASHBOARD')}
              className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>◀ Back to Fleet Dashboard</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                {currentView === 'DASHBOARD' && 'SuperSonic Fleet Management & Dispatch'}
                {currentView === 'DISPATCH' && '7 Corridors & Regional Dispatch'}
                {currentView === 'RADAR' && 'Live Fleet Radar & Telemetry'}
                {currentView === 'SETTLEMENTS' && 'Driver Trips Master Reconciliation (A4 / PDF / CSV)'}
                {currentView === 'POD' && 'Proof of Delivery (POD) Archives'}
                {currentView === 'VEHICLES' && 'Fleet Vehicles & Odometer Log'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              المركز الرئيسي لشركة سوبر سونيك (Choueifat Gateway) — Southern Olive Oil Products S.A.R.L
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-[#edf2ee] text-[#1e3a2b] font-bold rounded-lg border border-[#1e3a2b]/30">
            00001 - Southern Olive Oil Products S.A.R.L
          </span>
          <Link href="/backoffice/dashboard" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300">
            🔄 Return to Main ERP Hub
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. MASTER DASHBOARD OVERVIEW (CLEAN CLICKABLE TILES - NO CLUTTER)   */}
      {/* =================================================================== */}
      {currentView === 'DASHBOARD' && (
        <div className="space-y-6 pt-2">
          
          <div>
            <h2 className="text-sm font-bold text-slate-900">SuperSonic Fleet Operations Overview</h2>
            <p className="text-xs text-slate-500">Click on any operational card below to access its dedicated management workspace.</p>
          </div>

          {/* Interactive Clickable Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Tile 1: 7 Corridors & Dispatch */}
            <div
              onClick={() => setCurrentView('DISPATCH')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#1e3a2b] shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1e3a2b] flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                  🗺️
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  7 Corridors Active
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1e3a2b] transition-colors">
                  7 Corridors & Regional Dispatch
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage trips departing from Choueifat across Beirut, Mount Lebanon, South, North, and Bekaa.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Today's Orders: <strong>{orders.length} Runs</strong></span>
                <span className="text-[#1e3a2b] font-bold group-hover:underline">Open Dispatch ➔</span>
              </div>
            </div>

            {/* Tile 2: Trips Master Reconciliation & Whish */}
            <div
              onClick={() => setCurrentView('SETTLEMENTS')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-600 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                  💵
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  Whish + COD
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Driver Trips Master Reconciliation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Review multi-trip settlements (Trip 1, 2, 3...), driver allowances (المساهمة), and print A4/PDF/CSV reports.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Pending Whish: <strong className="text-purple-700">{whishSubmissions.length}</strong></span>
                <span className="text-blue-700 font-bold group-hover:underline">Open Settlements ➔</span>
              </div>
            </div>

            {/* Tile 3: Live Radar & GPS Telemetry */}
            <div
              onClick={() => setCurrentView('RADAR')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-600 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                  📡
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Live Telemetry
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Live Fleet Radar & GPS Map
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time GPS coordinates, vehicle speed, and off-duty pin locations for drivers in the field.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Active Drivers: <strong>{vehicles.filter(v => v.status !== 'OFF_DUTY').length}</strong></span>
                <span className="text-indigo-700 font-bold group-hover:underline">Open Radar ➔</span>
              </div>
            </div>

            {/* Tile 4: POD Digital Signatures & Photos */}
            <div
              onClick={() => setCurrentView('POD')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                  ✍️
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified POD
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Proof of Delivery (POD) Archives
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Examine on-screen customer signatures, camera photo attachments of delivered goods, and rejection reasons.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Delivery Success: <strong>100% Verified</strong></span>
                <span className="text-emerald-700 font-bold group-hover:underline">View Archives ➔</span>
              </div>
            </div>

            {/* Tile 5: Fleet Vehicles & Odometer Log */}
            <div
              onClick={() => setCurrentView('VEHICLES')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-600 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                  🚐
                </div>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Vans / Cars / Moto
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Fleet Vehicles & Odometer Log
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track start-of-day and end-of-day kilometers, maintenance intervals, and next-day route lockout enforcement.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Lockout: <strong className="text-rose-700">1 Pending</strong></span>
                <span className="text-amber-700 font-bold group-hover:underline">Manage Fleet ➔</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* 3. DEDICATED VIEW A: 7 CORRIDORS & REGIONAL DISPATCH                */}
      {/* =================================================================== */}
      {currentView === 'DISPATCH' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Today's Merged Runs (Southern Olive + 3PL Orders)</h3>
            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2.5 px-3 normal-case">order no.</th>
                    <th className="py-2.5 px-3 normal-case">source entity</th>
                    <th className="py-2.5 px-3 normal-case">customer & destination</th>
                    <th className="py-2.5 px-3 normal-case">corridor & trip</th>
                    <th className="py-2.5 px-3 normal-case">order items</th>
                    <th className="py-2.5 px-3 normal-case text-right">product val</th>
                    <th className="py-2.5 px-3 normal-case text-right">delivery fee</th>
                    <th className="py-2.5 px-3 normal-case text-center">assigned vehicle</th>
                    <th className="py-2.5 px-3 normal-case text-center">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                  {orders.map((order) => (
                    <tr key={order.id} className={order.status === 'MOVED_TO_POS_PICKUP' ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{order.orderNo}</td>
                      <td className="py-2.5 px-3">
                        {order.sourceType === 'IN_HOUSE_SOUTHERN_OLIVE' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">🫒 Southern Olive In-House</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300 text-[10px] font-bold">🏢 External 3PL Merchant</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900 block">{order.customerName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono block">{order.destinationTown}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 font-mono">المسار {order.corridorId} {order.tripNo > 0 && <span className="text-purple-700">(Trip {order.tripNo})</span>}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-[11px]">{order.items}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{order.productAmountLbp > 0 ? `${order.productAmountLbp.toLocaleString()} LBP` : `$${order.productAmountUsd}`}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${order.deliveryFeeUsd}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{order.assignedVehiclePlate !== '-' ? `${order.assignedVehiclePlate} (${order.assignedDriver})` : '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        {order.status === 'MOVED_TO_POS_PICKUP' ? (
                          <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px]">🏪 Moved to POS Pickup (Read-Only)</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{order.status}</span>
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
      {/* 4. DEDICATED VIEW B: DRIVER TRIPS MASTER RECONCILIATION             */}
      {/* =================================================================== */}
      {currentView === 'SETTLEMENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Driver Report:</span>
              <select
                value={selectedDriverForReport}
                onChange={(e) => setSelectedDriverForReport(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
              >
                {vehicles.map((v) => (
                  <option key={v.driver} value={v.driver}>{v.driver} ({v.model})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs">🖨️ Print A4 Report</button>
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">📄 Download as PDF</button>
            </div>
          </div>

          <div className="flex justify-center">
            <div id="isolated-a4-print-sheet" className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 select-none space-y-4">
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">SUPERSONIC FLEET & LOGISTICS</h2>
                  <p className="text-[11px] text-slate-600 font-mono">In Affiliation with: Southern Olive Oil Products S.A.R.L</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold">Daily Driver Trips Master Reconciliation Report</h3>
                  <span className="text-xs font-mono">Date: 03-Sep-2026</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
                <div><strong>Driver Name:</strong> {currentReportVehicle.driver}</div>
                <div><strong>Vehicle / Category:</strong> {currentReportVehicle.model} ({currentReportVehicle.category})</div>
                <div><strong>Plate Number:</strong> {currentReportVehicle.plate}</div>
                <div><strong>Departure Point:</strong> المركز الرئيسي بالشويفات</div>
                <div><strong>Odometer:</strong> {currentReportVehicle.startKm.toLocaleString()} KM ➔ {currentReportVehicle.currentKm.toLocaleString()} KM (Total: {currentReportVehicle.currentKm - currentReportVehicle.startKm} KM)</div>
              </div>

              <table className="w-full table-fixed text-left border border-black border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-bold">
                    <th className="py-1.5 px-1 normal-case w-[10%] border-r border-black">Trip #</th>
                    <th className="py-1.5 px-1 normal-case w-[28%] border-r border-black">Corridor / Line</th>
                    <th className="py-1.5 px-1 normal-case w-[10%] text-center border-r border-black">Stops</th>
                    <th className="py-1.5 px-1 normal-case w-[16%] text-right border-r border-black">Product ($)</th>
                    <th className="py-1.5 px-1 normal-case w-[12%] text-right border-r border-black">Delivery ($)</th>
                    <th className="py-1.5 px-1 normal-case w-[12%] text-right border-r border-black">Cash ($)</th>
                    <th className="py-1.5 px-1 normal-case w-[12%] text-right">Whish ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono text-[10px]">
                  {currentReportVehicle.tripsToday.map((t) => (
                    <tr key={t.tripNumber}>
                      <td className="py-1 px-1 font-bold border-r border-black">Trip {t.tripNumber}</td>
                      <td className="py-1 px-1 font-sans border-r border-black">{t.corridorName}</td>
                      <td className="py-1 px-1 text-center border-r border-black">{t.deliveredStops}/{t.totalStops}</td>
                      <td className="py-1 px-1 text-right border-r border-black">${t.productValueUsd.toFixed(2)}</td>
                      <td className="py-1 px-1 text-right border-r border-black">${t.deliveryFeesUsd.toFixed(2)}</td>
                      <td className="py-1 px-1 text-right font-bold border-r border-black">${t.cashUsdCollected.toFixed(2)}</td>
                      <td className="py-1 px-1 text-right font-bold text-purple-900">${t.whishUsdCollected.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border border-black rounded p-3 text-xs font-mono space-y-1.5 bg-slate-50">
                <div className="flex justify-between items-center text-emerald-900 font-bold">
                  <span>Total Delivery Fees Earned by Driver:</span>
                  <span>+${currentReportVehicle.tripsToday.reduce((a, b) => a + b.deliveryFeesUsd, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>بند المساهمة المعتمد للشوفير (Driver Allowance Contribution):</span>
                  <span>+${driverContributions[currentReportVehicle.driver] || 0}.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. DEDICATED VIEW C: RADAR & POD & VEHICLES                         */}
      {/* =================================================================== */}
      {currentView === 'RADAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
          <span className="text-3xl">📡</span>
          <h3 className="text-base font-bold text-slate-900">Live Satellite Fleet Radar & Telemetry</h3>
          <p className="text-xs text-slate-500">Live coordinates streaming from active vans to the central SuperSonic hub in Choueifat.</p>
        </div>
      )}

      {currentView === 'POD' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
          <span className="text-3xl">✍️</span>
          <h3 className="text-base font-bold text-slate-900">Proof of Delivery (POD) Digital Archive</h3>
          <p className="text-xs text-slate-500">Searchable electronic signatures, photo verifications, and delivery time stamps.</p>
        </div>
      )}

      {currentView === 'VEHICLES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Fleet Vehicles & Odometer Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Driver: {v.driver}</div>
                <div className="text-blue-700 font-bold">Total Mileage: {v.currentKm.toLocaleString()} KM</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
