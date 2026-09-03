'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES & DATA STRUCTURES - SUPERSONIC FLEET MANAGEMENT
// TENANT: Southern Olive Oil Products S.A.R.L (00001)
// ============================================================================

type FleetSection = 
  | 'SOUTHERN_OLIVE_ORDERS' 
  | 'SUPERSONIC_3PL_ORDERS' 
  | 'COMBINED_DISPATCH' 
  | 'LIVE_RADAR' 
  | 'SETTLEMENTS' 
  | 'POD_ARCHIVES' 
  | 'VEHICLES_LOG';

type VehicleCategory = 'VAN' | 'CAR' | 'MOTORCYCLE';

interface CorridorRoute {
  id: number;
  name: string;
  schedule: string;
  highwayPath: string;
  activeOrdersCount: number;
}

interface DispatchedOrder {
  id: string;
  orderNo: string;
  sourceType: 'SOUTHERN_OLIVE' | 'EXTERNAL_3PL';
  customerName: string;
  phone: string;
  corridorId: number;
  tripNo: number;
  destinationTown: string;
  addressDetails: string;
  items: string;
  productAmountLbp: number;
  productAmountUsd: number;
  deliveryFeeUsd: number;
  assignedDriver: string;
  vehiclePlate: string;
  status: 'QUEUED' | 'ON_ROUTE' | 'DELIVERED' | 'REJECTED' | 'PENDING' | 'MOVED_TO_POS_PICKUP';
  repName?: string;
}

interface FleetVehicle {
  plate: string;
  category: VehicleCategory;
  model: string;
  driver: string;
  phone: string;
  assignedCorridor: number;
  status: 'ON_DUTY' | 'ON_ROUTE' | 'DELIVERING' | 'RETURNING' | 'OFF_DUTY';
  startKm: number;
  currentKm: number;
  reconciliationClosed: boolean;
  offDutyLocationPin?: string;
  totalTripsToday: number;
  currentSpeedKmH: number;
  gpsCoords: string;
}

interface WhishSettlementSubmission {
  id: string;
  driverName: string;
  vehiclePlate: string;
  amountUsd: number;
  amountLbp: number;
  whishRefNo: string;
  submittedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export default function SuperSonicFleetManagementSuitePage() {
  // Navigation Section Selector (All in English)
  const [activeSection, setActiveSection] = useState<FleetSection>('COMBINED_DISPATCH');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');

  // Manual Driver Contribution State ("المساهمة" Allowance)
  const [driverContributions, setDriverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 20.0,
    'Fadi Abou Assi': 25.0,
    'Hassan Sleiman': 30.0,
    'Ahmad Zein': 10.0,
  });

  // 1. THE 7 STRATEGIC HIGHWAY CORRIDORS (DEPARTING FROM CHOUEIFAT CENTRAL HUB)
  const corridors: CorridorRoute[] = [
    { id: 1, name: 'Corridor 1: Greater Beirut & Connected Coast', schedule: 'Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Khalde ➔ Hadath / Baabda / Dahieh ➔ Beirut City ➔ Metn Coast (Sin El Fil, Dekwaneh, Jdeideh, Jal El Dib)', activeOrdersCount: 14 },
    { id: 2, name: 'Corridor 2: Central & Southern Mount Lebanon', schedule: 'Daily / Near-Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Aramoun / Bchamoun / Qabr Chmoun ➔ Aley / Bhamdoun / Sofar ➔ Upper Chouf (Deir El Qamar, Beiteddine, Baakline, Barouk)', activeOrdersCount: 9 },
    { id: 3, name: 'Corridor 3: Southern Coast & Deep South', schedule: 'Daily', highwayPath: 'Chouf Coast (Damour, Jiyeh) ➔ Saida ➔ Tyre (Sour) ➔ Nabatieh', activeOrdersCount: 12 },
    { id: 4, name: 'Corridor 4: Northern Coast to Batroun', schedule: '3-4 times/week', highwayPath: 'Antelias / Dbayeh ➔ Jounieh / Keserwan ➔ Jbeil (Byblos) ➔ Batroun ➔ Koura', activeOrdersCount: 8 },
    { id: 5, name: 'Corridor 5: Tripoli, Akkar & Dinnieh', schedule: '2-3 times/week', highwayPath: 'Tripoli ➔ Minieh ➔ Zgharta ➔ Dinnieh ➔ Akkar (Halba, Abdeh, Qobayat, Khraybet El Jindi, Menjez)', activeOrdersCount: 6 },
    { id: 6, name: 'Corridor 6: Central, West Bekaa & South-East', schedule: '2-3 times/week', highwayPath: 'Damascus Road (Sofar - Dahr El Baidar) ➔ Chtaura / Zahle ➔ West Bekaa (Joub Jannine) ➔ Rashaya ➔ Hasbaya ➔ Jezzine (via Machghara)', activeOrdersCount: 5 },
    { id: 7, name: 'Corridor 7: North Bekaa - Baalbek Hermel', schedule: '1-2 times/week', highwayPath: 'Rayak ➔ Baalbek ➔ Deir El Ahmar ➔ Labweh ➔ Hermel', activeOrdersCount: 3 },
  ];

  // 2. FLEET VEHICLES REGISTRY (VANS, CARS, MOTORCYCLES)
  const [vehicles] = useState<FleetVehicle[]>([
    { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', phone: '03-112233', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 142050, currentKm: 142165, reconciliationClosed: true, totalTripsToday: 3, currentSpeedKmH: 48, gpsCoords: '33.8938° N, 35.4802° E (Hamra)' },
    { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', phone: '03-445566', assignedCorridor: 2, status: 'DELIVERING', startKm: 88400, currentKm: 88480, reconciliationClosed: true, totalTripsToday: 2, currentSpeedKmH: 22, gpsCoords: '33.7821° N, 35.5901° E (Aley)' },
    { plate: 'S-772910', category: 'CAR', model: 'Renault Duster 4x4 (Car 01)', driver: 'Hassan Sleiman', phone: '03-778899', assignedCorridor: 3, status: 'ON_ROUTE', startKm: 65120, currentKm: 65205, reconciliationClosed: true, totalTripsToday: 1, currentSpeedKmH: 64, gpsCoords: '33.5590° N, 35.3725° E (Saida)' },
    { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', phone: '03-990011', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 12400, currentKm: 12460, reconciliationClosed: true, totalTripsToday: 4, currentSpeedKmH: 35, gpsCoords: '33.8869° N, 35.5131° E (Achrafieh)' },
    { plate: 'B-310928', category: 'VAN', model: 'Toyota HiAce Medium (Van 03)', driver: 'Elie Matar', phone: '03-223344', assignedCorridor: 6, status: 'OFF_DUTY', startKm: 110200, currentKm: 110290, reconciliationClosed: false, totalTripsToday: 0, currentSpeedKmH: 0, gpsCoords: '33.8210° N, 35.8520° E (Chtaura)', offDutyLocationPin: 'Chtaura Square Pin (33.821° N, 35.852° E)' },
  ]);

  // 3. COMBINED DISPATCH ORDERS (SOUTHERN OLIVE IN-HOUSE + EXTERNAL 3PL)
  const [orders, setOrders] = useState<DispatchedOrder[]>([
    {
      id: 'ORD-103349',
      orderNo: 'ORD-103349',
      sourceType: 'SOUTHERN_OLIVE',
      customerName: 'Al-Baraka Supermarket S.A.R.L',
      phone: '01-745890',
      corridorId: 1,
      tripNo: 1,
      destinationTown: 'Beirut - Hamra',
      addressDetails: 'Makdessi St, Bldg 14, Ground Floor',
      items: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026) + 2x Pickled Olives Box',
      productAmountLbp: 9000000,
      productAmountUsd: 100.0,
      deliveryFeeUsd: 4.0,
      assignedDriver: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      status: 'DELIVERED',
      repName: 'Ahmad Ali Kassem (REP-002)',
    },
    {
      id: 'ORD-103350',
      orderNo: 'ORD-103350',
      sourceType: 'SOUTHERN_OLIVE',
      customerName: 'Colonel Mahmoud Abboud',
      phone: '03-556677',
      corridorId: 2,
      tripNo: 0,
      destinationTown: 'Choueifat Showroom',
      addressDetails: 'Showroom Pickup Counter',
      items: '30x 17.5L Extra Virgin Bulk Harvest Tins',
      productAmountLbp: 248400000,
      productAmountUsd: 2760.0,
      deliveryFeeUsd: 0.0,
      assignedDriver: '-',
      vehiclePlate: '-',
      status: 'MOVED_TO_POS_PICKUP', // Read-only ghost record!
      repName: 'Hiba Aloulou (REP-004)',
    },
    {
      id: '3PL-88120',
      orderNo: '3PL-88120',
      sourceType: 'EXTERNAL_3PL',
      customerName: 'La Rose Fashion Boutique',
      phone: '01-482910',
      corridorId: 1,
      tripNo: 1,
      destinationTown: 'Metn - Sin El Fil',
      addressDetails: 'Near Habtoor Grand Hotel',
      items: '3x Apparel Dry Goods Packages',
      productAmountLbp: 3150000,
      productAmountUsd: 35.0,
      deliveryFeeUsd: 3.0,
      assignedDriver: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      status: 'DELIVERED',
    },
    {
      id: 'ORD-103352',
      orderNo: 'ORD-103352',
      sourceType: 'SOUTHERN_OLIVE',
      customerName: 'Hussein Daik Retail Mart',
      phone: '07-720190',
      corridorId: 3,
      tripNo: 1,
      destinationTown: 'Saida - Riad El Solh',
      addressDetails: 'Daik Commercial Center',
      items: 'Assorted Food Preserves + Extra Virgin 1L Glass Matrix',
      productAmountLbp: 706968000,
      productAmountUsd: 7855.2,
      deliveryFeeUsd: 6.0,
      assignedDriver: 'Hassan Sleiman',
      vehiclePlate: 'S-772910',
      status: 'ON_ROUTE',
      repName: 'Mahdi (REP-001)',
    },
    {
      id: '3PL-88125',
      orderNo: '3PL-88125',
      sourceType: 'EXTERNAL_3PL',
      customerName: 'Apex Electronics Hub',
      phone: '01-205930',
      corridorId: 1,
      tripNo: 2,
      destinationTown: 'Beirut - Achrafieh',
      addressDetails: 'Sassine Square, Rue Huvelin',
      items: '2x Hardware Component Cartons',
      productAmountLbp: 4500000,
      productAmountUsd: 50.0,
      deliveryFeeUsd: 4.0,
      assignedDriver: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      status: 'ON_ROUTE',
    },
    {
      id: 'ORD-103353',
      orderNo: 'ORD-103353',
      sourceType: 'SOUTHERN_OLIVE',
      customerName: 'Byblos Green Grocers',
      phone: '09-540112',
      corridorId: 4,
      tripNo: 1,
      destinationTown: 'Jbeil - Voie 13',
      addressDetails: 'Near Byblos Port Exit',
      items: '12x Cold Press Extra Virgin Glass Bottles 1L',
      productAmountLbp: 1580000,
      productAmountUsd: 17.55,
      deliveryFeeUsd: 5.0,
      assignedDriver: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      status: 'QUEUED',
      repName: 'Hussein Mahdi (REP-008)',
    },
  ]);

  // 4. WHISH ONLINE SETTLEMENT AUDIT SUBMISSIONS
  const [whishSubmissions, setWhishSubmissions] = useState<WhishSettlementSubmission[]>([
    {
      id: 'WSH-0091',
      driverName: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      amountUsd: 200.0,
      amountLbp: 0,
      whishRefNo: 'WHISH-TX-9988124',
      submittedAt: 'Today 04:15 PM',
      status: 'PENDING_APPROVAL',
    },
  ]);

  // Actions
  const handleApproveWhish = (id: string) => {
    setWhishSubmissions((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED' } : w)));
    alert(`✓ Whish Settlement #${id} Approved and reconciled into SuperSonic treasury.`);
  };

  const handlePushToFinancial = () => {
    alert('🚀 Push Successful!\nClean batch of Southern Olive Oil goods revenue pushed to CFO Inbox (/backoffice/inbox).\nExcludes driver earnings and SuperSonic delivery margins.');
  };

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-12">
      
      {/* BULLETPROOF A4 PRINT ISOLATION CSS */}
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

      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-slate-200 pb-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              SuperSonic Fleet Management & Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SuperSonic Central Logistics Hub (Choueifat Gateway) — Southern Olive Oil Products S.A.R.L
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handlePushToFinancial}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>🚀 Push to Financial Inbox</span>
          </button>
          <span className="px-3 py-1 bg-[#edf2ee] text-[#1e3a2b] font-bold rounded-lg border border-[#1e3a2b]/30">
            00001 - Southern Olive Oil Products S.A.R.L
          </span>
          <Link href="/backoffice/dashboard" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300">
            🔄 Return to Main Hub
          </Link>
        </div>
      </div>

      {/* 2. SUPERSONIC VERTICAL/HORIZONTAL SUB-NAVIGATION (ALL 7 SECTIONS IN ENGLISH) */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-bold print:hidden">
        <button
          type="button"
          onClick={() => setActiveSection('COMBINED_DISPATCH')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'COMBINED_DISPATCH' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📋 7 Corridors & Combined Dispatch
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SOUTHERN_OLIVE_ORDERS')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'SOUTHERN_OLIVE_ORDERS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🫒 Southern Olive Oil Orders
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SUPERSONIC_3PL_ORDERS')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'SUPERSONIC_3PL_ORDERS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🏢 SuperSonic 3PL Orders
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SETTLEMENTS')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          💵 COD, Whish & Driver Settlements
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('LIVE_RADAR')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'LIVE_RADAR' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📡 Live Fleet Radar & GPS
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('POD_ARCHIVES')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'POD_ARCHIVES' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          ✍️ Proof of Delivery (POD) Archive
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('VEHICLES_LOG')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeSection === 'VEHICLES_LOG' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🚐 Vehicles & Odometer Log
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. SECTION: COMBINED REGIONAL DISPATCH (7 CORRIDORS + TRIPS)        */}
      {/* =================================================================== */}
      {activeSection === 'COMBINED_DISPATCH' && (
        <div className="space-y-4 print:hidden">
          
          {/* 7 Corridors Summary Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {corridors.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCorridorFilter(selectedCorridorFilter === c.id ? 'ALL' : c.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCorridorFilter === c.id ? 'bg-[#edf2ee] border-[#1e3a2b] ring-2 ring-[#1e3a2b]/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#1e3a2b] text-white">Corridor {c.id}</span>
                  <span className="text-[10px] font-mono text-slate-500">{c.schedule}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1.5 leading-tight">{c.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{c.highwayPath}</p>
                <div className="mt-2 pt-1 border-t border-slate-200/80 flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-slate-500">Active Packages:</span>
                  <strong className="text-[#1e3a2b]">{c.activeOrdersCount}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Combined Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Assigned Route Runs (Co-Loaded Vehicles)</h3>
                <p className="text-[11px] text-slate-400">All packages leaving Choueifat Hub, grouped by corridor and assigned trips.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Corridor 6 (West Bekaa) and Corridor 7 (Baalbek) programmatically merged for today!')}
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
                    <th className="py-2.5 px-3 normal-case">corridor & trip</th>
                    <th className="py-2.5 px-3 normal-case">packing checklist</th>
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
                          {order.sourceType === 'SOUTHERN_OLIVE' ? (
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
                        <td className="py-2.5 px-3 font-bold text-slate-800 font-mono">
                          Corridor {order.corridorId} {order.tripNo > 0 && <span className="text-purple-700">(Trip {order.tripNo})</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 text-[11px]">{order.items}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {order.productAmountLbp > 0 ? `${order.productAmountLbp.toLocaleString()} LBP` : `$${order.productAmountUsd}`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          ${order.deliveryFeeUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {order.vehiclePlate !== '-' ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-[10.5px]">
                              {order.vehiclePlate} ({order.assignedDriver})
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {order.status === 'MOVED_TO_POS_PICKUP' ? (
                            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px] inline-flex items-center gap-1">
                              <span>🏪</span> Moved to POS Pickup (Read-Only)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
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
      {/* 2. SECTION: SOUTHERN OLIVE OIL IN-HOUSE ORDERS                      */}
      {/* =================================================================== */}
      {activeSection === 'SOUTHERN_OLIVE_ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Southern Olive Oil Products S.A.R.L Dedicated Inflow</h3>
              <p className="text-[11px] text-slate-400">All in-house orders with automated warehouse stock deductions and sales rep commissions.</p>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">destination</th>
                  <th className="py-2.5 px-3 normal-case">items & bundles</th>
                  <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                  <th className="py-2.5 px-3 normal-case">originating rep</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders
                  .filter((o) => o.sourceType === 'SOUTHERN_OLIVE')
                  .map((o) => (
                    <tr key={o.id} className={o.status === 'MOVED_TO_POS_PICKUP' ? 'bg-purple-50/40 text-slate-500' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{o.phone}</td>
                      <td className="py-2.5 px-3 text-slate-700">{o.destinationTown}</td>
                      <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd}`}
                      </td>
                      <td className="py-2.5 px-3 text-purple-800 font-semibold">{o.repName || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'MOVED_TO_POS_PICKUP' ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px]">
                            🏪 Moved to POS Pickup
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {o.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. SECTION: SUPERSONIC 3PL EXTERNAL ORDERS (MANUAL ENTRY)           */}
      {/* =================================================================== */}
      {activeSection === 'SUPERSONIC_3PL_ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic 3PL Commercial Merchant Inflow</h3>
              <p className="text-[11px] text-slate-400">External merchant shipments. Delivery fees and COD payouts remain strictly inside SuperSonic.</p>
            </div>

            <button
              type="button"
              onClick={() => alert('Opening Manual 3PL Order Entry Dialog for SuperSonic Dispatcher...')}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>➕ Add External 3PL Order</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">merchant / sender</th>
                  <th className="py-2.5 px-3 normal-case">recipient & phone</th>
                  <th className="py-2.5 px-3 normal-case">destination town</th>
                  <th className="py-2.5 px-3 normal-case">package description</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod cash to collect</th>
                  <th className="py-2.5 px-3 normal-case text-right">delivery fee</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders
                  .filter((o) => o.sourceType === 'EXTERNAL_3PL')
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{o.phone}</td>
                      <td className="py-2.5 px-3 text-slate-700">{o.destinationTown}</td>
                      <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${o.deliveryFeeUsd}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. SECTION: COD, WHISH & DRIVER SETTLEMENTS (PRINT A4 / PDF / CSV)  */}
      {/* =================================================================== */}
      {activeSection === 'SETTLEMENTS' && (
        <div className="space-y-4">
          
          {/* Whish Approvals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
            <h3 className="text-sm font-bold text-slate-900">Whish Money Online Settlement Audit Queue</h3>
            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2 px-3 normal-case">driver name</th>
                    <th className="py-2 px-3 normal-case">vehicle</th>
                    <th className="py-2 px-3 normal-case text-right">whish amount</th>
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
                      <td className="py-2 px-3 text-slate-800">{w.whishRefNo}</td>
                      <td className="py-2 px-3 text-slate-500 font-sans">{w.submittedAt}</td>
                      <td className="py-2 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-sans">
                        {w.status === 'PENDING_APPROVAL' && (
                          <button
                            type="button"
                            onClick={() => handleApproveWhish(w.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10.5px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Master A4 Print / Export Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Driver Reconciliation Report:</span>
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
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs">
                🖨️ Print A4 Report
              </button>
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                📄 Download as PDF
              </button>
              <button
                type="button"
                onClick={() => alert('Exporting Driver Reconciliation CSV file...')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
              >
                📊 Export as CSV / Excel
              </button>
            </div>
          </div>

          {/* Printable A4 Sheet */}
          <div className="flex justify-center">
            <div id="isolated-a4-print-sheet" className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 select-none space-y-4">
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">SUPERSONIC FLEET & LOGISTICS</h2>
                  <p className="text-[11px] text-slate-600 font-mono">Affiliation: Southern Olive Oil Products S.A.R.L</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold">Daily Driver Trips Master Reconciliation Report</h3>
                  <span className="text-xs font-mono">Date: 03-Sep-2026</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
                <div><strong>Driver Name:</strong> {currentReportVehicle.driver} ({currentReportVehicle.phone})</div>
                <div><strong>Vehicle Model:</strong> {currentReportVehicle.model} ({currentReportVehicle.category})</div>
                <div><strong>Plate Number:</strong> {currentReportVehicle.plate}</div>
                <div><strong>Departure Point:</strong> SuperSonic Central Hub (Choueifat)</div>
                <div><strong>Odometer:</strong> {currentReportVehicle.startKm.toLocaleString()} KM ➔ {currentReportVehicle.currentKm.toLocaleString()} KM</div>
                <div><strong>Total Distance Today:</strong> {currentReportVehicle.currentKm - currentReportVehicle.startKm} KM (Roundtrip)</div>
              </div>

              {/* Trips Breakdown */}
              <table className="w-full table-fixed text-left border border-black border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-bold">
                    <th className="py-1.5 px-1 normal-case w-[10%] border-r border-black">Trip #</th>
                    <th className="py-1.5 px-1 normal-case w-[28%] border-r border-black">Corridor / Zone</th>
                    <th className="py-1.5 px-1 normal-case w-[10%] text-center border-r border-black">Stops</th>
                    <th className="py-1.5 px-1 normal-case w-[16%] text-right border-r border-black">Product ($)</th>
                    <th className="py-1.5 px-1 normal-case w-[12%] text-right border-r border-black">Delivery ($)</th>
                    <th className="py-1.5 px-1 normal-case w-[12%] text-right border-r border-black">Cash USD</th>
                    <th className="py-1.5 px-1 normal-case w-[12%] text-right">Whish USD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono text-[10px]">
                  <tr>
                    <td className="py-1 px-1 font-bold border-r border-black">Trip 1</td>
                    <td className="py-1 px-1 font-sans border-r border-black">Corridor 1: Greater Beirut</td>
                    <td className="py-1 px-1 text-center border-r border-black">6/6</td>
                    <td className="py-1 px-1 text-right border-r border-black">$350.00</td>
                    <td className="py-1 px-1 text-right border-r border-black">$24.00</td>
                    <td className="py-1 px-1 text-right font-bold border-r border-black">$250.00</td>
                    <td className="py-1 px-1 text-right font-bold text-purple-900">$100.00</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1 font-bold border-r border-black">Trip 2</td>
                    <td className="py-1 px-1 font-sans border-r border-black">Corridor 2: Chouf & Aley</td>
                    <td className="py-1 px-1 text-center border-r border-black">4/4</td>
                    <td className="py-1 px-1 text-right border-r border-black">$210.00</td>
                    <td className="py-1 px-1 text-right border-r border-black">$16.00</td>
                    <td className="py-1 px-1 text-right font-bold border-r border-black">$110.00</td>
                    <td className="py-1 px-1 text-right font-bold text-purple-900">$100.00</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold border-t-2 border-black text-[10.5px]">
                    <td colSpan={2} className="py-1.5 px-1 border-r border-black">CONSOLIDATED TOTALS</td>
                    <td className="py-1.5 px-1 text-center border-r border-black">10 Stops</td>
                    <td className="py-1.5 px-1 text-right border-r border-black">$560.00</td>
                    <td className="py-1.5 px-1 text-right border-r border-black">$40.00</td>
                    <td className="py-1.5 px-1 text-right border-r border-black font-bold">$360.00</td>
                    <td className="py-1.5 px-1 text-right font-bold text-purple-900">$200.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Adjustments & Allowance */}
              <div className="border border-black rounded p-3 text-xs font-mono space-y-1.5 bg-slate-50">
                <div className="flex justify-between items-center text-emerald-900 font-bold">
                  <span>Total Delivery Fees Earned by Driver:</span>
                  <span>+$40.00</span>
                </div>
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>Driver Contribution Allowance (المساهمة):</span>
                  <span>+${driverContributions[currentReportVehicle.driver] || 0}.00</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-black text-sm font-bold text-slate-900">
                  <span>Net Cash Handed Over to SuperSonic Vault:</span>
                  <span>$360.00 USD Cash + 9,000,000 LBP</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between items-end text-xs font-mono">
                <div>
                  <div>Driver Signature: _______________________</div>
                  <span className="text-[10px] text-slate-500">I confirm physical and Whish handover of all above batches.</span>
                </div>
                <div className="text-right">
                  <div>SuperSonic Treasury Officer: _______________________</div>
                  <span className="text-[10px] text-slate-500">Reconciliation audit verified and posted to vault.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. SECTION: LIVE FLEET RADAR & TELEMETRY                           */}
      {/* =================================================================== */}
      {activeSection === 'LIVE_RADAR' && (
        <div className="space-y-4 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {vehicles.map((v) => (
              <div key={v.plate} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{v.plate}</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{v.model}</h4>
                    <span className="text-[11px] text-slate-600 block">Driver: <strong>{v.driver}</strong> ({v.phone})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === 'ON_ROUTE' ? 'bg-indigo-100 text-indigo-800' : v.status === 'DELIVERING' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {v.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>Assigned Line:</span> <strong>Corridor {v.assignedCorridor}</strong></div>
                  <div className="flex justify-between"><span>Current Speed:</span> <strong className="text-blue-700">{v.currentSpeedKmH} KM/H</strong></div>
                  <div className="flex justify-between"><span>Live GPS Location:</span> <strong className="text-slate-900">{v.gpsCoords}</strong></div>
                  <div className="flex justify-between text-emerald-700 font-bold"><span>Total Trips Today:</span> <strong>{v.totalTripsToday} Trips Completed</strong></div>
                </div>

                <div className="pt-1 flex justify-between items-center text-xs">
                  <span className="text-[10.5px] font-bold text-slate-500">Next-Day Dispatch Status:</span>
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
      {/* 6. SECTION: PROOF OF DELIVERY (POD) ARCHIVE                        */}
      {/* =================================================================== */}
      {activeSection === 'POD_ARCHIVES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Electronic Signatures & Photo Archive</h3>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex justify-between items-start bg-white p-3 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-sm text-[#1e3a2b]">ORD-103349 — Al-Baraka Supermarket</span>
                <p className="text-xs text-slate-700">Delivered by: <strong>Tony Khoury (Van 01)</strong> | Recipient: Imad (Receiving Manager)</p>
                <p className="text-[10.5px] text-slate-400 font-mono">Timestamp: 03-Sep-2026 01:25 PM | GPS: 33.8938° N, 35.4802° E (Hamra)</p>
              </div>
              <div className="text-right space-y-1 font-mono">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10.5px]">Signed & Verified ✓</span>
                <span className="text-[11px] text-blue-700 block font-bold">2 Photos Attached 📸</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. SECTION: FLEET VEHICLES & ODOMETER LOG                           */}
      {/* =================================================================== */}
      {activeSection === 'VEHICLES_LOG' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Fleet Vehicles & Odometer Log (Vans, Cars, Motorcycles)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned Driver: {v.driver} ({v.phone})</div>
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM (+{v.currentKm - v.startKm} KM today)</div>
                {v.offDutyLocationPin && (
                  <div className="text-rose-700 text-[10.5px] pt-1 border-t border-slate-200">
                    📍 Off-Duty Pin: {v.offDutyLocationPin}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
