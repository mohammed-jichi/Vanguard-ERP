'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES & DATA STRUCTURES - SUPERSONIC FLEET MANAGEMENT SUITE
// TENANT: Southern Olive Oil Products S.A.R.L (00001)
// ============================================================================

type FleetSection = 
  | 'COMBINED_DISPATCH' 
  | 'SOUTHERN_OLIVE_ORDERS' 
  | 'SUPERSONIC_3PL_ORDERS' 
  | 'SETTLEMENTS' 
  | 'LIVE_RADAR' 
  | 'POD_ARCHIVES' 
  | 'VEHICLES_LOG'
  | 'EMPLOYEES'
  | 'COMPLAINTS_REVIEWS'
  | 'VENDOR_ACCOUNTING';

type VehicleCategory = 'VAN' | 'CAR' | 'MOTORCYCLE';

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
  deliveredAt?: string;
  signatureSvg?: string;
  photoUrl1?: string;
  photoUrl2?: string;
  rejectionReason?: string;
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
  batteryPercent: number;
  currentSpeedKmH: number;
  currentLocationName: string;
  gpsCoords: string;
  stopsDelivered: number;
  stopsTotal: number;
}

interface SuperSonicEmployee {
  id: string;
  fullName: string;
  type: 'DRIVER' | 'ON_SITE';
  phone: string;
  nationalIdOrPassport: string;
  roleDescription: string;
  compensationModel: 'FIXED_SALARY' | 'COMMISSION_PER_DELIVERY' | 'DAILY_RATE';
  assignedVehicle?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status: 'ACTIVE' | 'ON_LEAVE';
}

export default function SuperSonicFleetManagementSuitePage() {
  const [activeSection, setActiveSection] = useState<FleetSection>('COMBINED_DISPATCH');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');

  // Interactive Telemetry Modal for Clickable Radar Cards
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);

  // Zoomable POD Proof Modal
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);

  // Add Employee Modal
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpType, setNewEmpType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');

  // Add External 3PL Order Modal
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Driver Allowance ("المساهمة")
  const [driverContributions, setDriverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 20.0,
    'Fadi Abou Assi': 25.0,
    'Hassan Sleiman': 30.0,
    'Ahmad Zein': 10.0,
  });

  // Fleet Vehicles with Active Telemetry
  const [vehicles] = useState<FleetVehicle[]>([
    {
      plate: 'B-492102',
      category: 'VAN',
      model: 'Toyota HiAce High Roof (Van 01)',
      driver: 'Tony Khoury',
      phone: '03-112233',
      assignedCorridor: 1,
      status: 'ON_ROUTE',
      startKm: 142050,
      currentKm: 142165,
      reconciliationClosed: true,
      batteryPercent: 88,
      currentSpeedKmH: 48,
      currentLocationName: 'Beirut - Hamra Main Axis',
      gpsCoords: '33.8938° N, 35.4802° E',
      stopsDelivered: 6,
      stopsTotal: 8,
    },
    {
      plate: 'G-183921',
      category: 'VAN',
      model: 'Hyundai H1 Cargo (Van 02)',
      driver: 'Fadi Abou Assi',
      phone: '03-445566',
      assignedCorridor: 2,
      status: 'DELIVERING',
      startKm: 88400,
      currentKm: 88480,
      reconciliationClosed: true,
      batteryPercent: 64,
      currentSpeedKmH: 20,
      currentLocationName: 'Aley - Roundabout Center',
      gpsCoords: '33.7821° N, 35.5901° E',
      stopsDelivered: 4,
      stopsTotal: 6,
    },
    {
      plate: 'S-772910',
      category: 'CAR',
      model: 'Renault Duster 4x4 (Car 01)',
      driver: 'Hassan Sleiman',
      phone: '03-778899',
      assignedCorridor: 3,
      status: 'ON_ROUTE',
      startKm: 65120,
      currentKm: 65205,
      reconciliationClosed: true,
      batteryPercent: 92,
      currentSpeedKmH: 62,
      currentLocationName: 'Saida - Riad El Solh Highway',
      gpsCoords: '33.5590° N, 35.3725° E',
      stopsDelivered: 5,
      stopsTotal: 7,
    },
    {
      plate: 'M-102941',
      category: 'MOTORCYCLE',
      model: 'Honda Cargo 250 (Moto 01)',
      driver: 'Ahmad Zein',
      phone: '03-990011',
      assignedCorridor: 1,
      status: 'ON_ROUTE',
      startKm: 12400,
      currentKm: 12460,
      reconciliationClosed: true,
      batteryPercent: 78,
      currentSpeedKmH: 35,
      currentLocationName: 'Dahieh - Hadi Nasrallah Highway',
      gpsCoords: '33.8540° N, 35.5090° E',
      stopsDelivered: 3,
      stopsTotal: 4,
    },
  ]);

  // Dispatched Orders with Authentic Digital Signatures & Photo Metadata
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
      deliveredAt: '03-Sep-2026 01:25 PM',
      signatureSvg: 'Imad_Al_Baraka_Signature',
      photoUrl1: '🫒 17.5L Olive Oil Tin Verified',
      photoUrl2: '📄 Signed Delivery Receipt #103349',
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
      deliveredAt: '03-Sep-2026 02:10 PM',
      signatureSvg: 'Mireille_LaRose_Signature',
      photoUrl1: '📦 3x Apparel Boxes at Boutique Doorstep',
      photoUrl2: '📄 3PL Waybill #88120 Verified',
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
      status: 'MOVED_TO_POS_PICKUP',
      repName: 'Hiba Aloulou (REP-004)',
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
  ]);

  // Employees Registry (Drivers + On-Site Staff)
  const [employees, setEmployees] = useState<SuperSonicEmployee[]>([
    { id: 'EMP-01', fullName: 'Tony Khoury', type: 'DRIVER', phone: '03-112233', nationalIdOrPassport: 'ID-8821094', roleDescription: 'Lead Van Courier (Corridor 1 & 4)', compensationModel: 'COMMISSION_PER_DELIVERY', assignedVehicle: 'Toyota HiAce B-492102', licenseNumber: 'DL-9921', licenseExpiry: '2028-11-15', status: 'ACTIVE' },
    { id: 'EMP-02', fullName: 'Fadi Abou Assi', type: 'DRIVER', phone: '03-445566', nationalIdOrPassport: 'ID-5519201', roleDescription: 'Mount Lebanon Senior Driver (Corridor 2)', compensationModel: 'DAILY_RATE', assignedVehicle: 'Hyundai H1 G-183921', licenseNumber: 'DL-7412', licenseExpiry: '2027-06-30', status: 'ACTIVE' },
    { id: 'EMP-03', fullName: 'Rami Al-Hajj', type: 'ON_SITE', phone: '03-889911', nationalIdOrPassport: 'ID-3310928', roleDescription: 'SuperSonic Operations Manager', compensationModel: 'FIXED_SALARY', status: 'ACTIVE' },
    { id: 'EMP-04', fullName: 'Samer Kassir', type: 'ON_SITE', phone: '03-662244', nationalIdOrPassport: 'ID-1928374', roleDescription: 'Fleet Controller & Dispatcher', compensationModel: 'FIXED_SALARY', status: 'ACTIVE' },
    { id: 'EMP-05', fullName: 'Ziad Mansour', type: 'ON_SITE', phone: '03-774411', nationalIdOrPassport: 'ID-6677889', roleDescription: 'Central Hub Loading Sorter', compensationModel: 'DAILY_RATE', status: 'ACTIVE' },
  ]);

  // Handlers
  const handlePushToFinancial = () => {
    alert('🚀 Push Successful!\nSouthern Olive Oil net goods revenue pushed to CFO Inbox (/backoffice/inbox).\nSuperSonic delivery fees and driver earnings remain securely isolated.');
  };

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-12">
      
      {/* BULLETPROOF A4 PRINT CSS */}
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

      {/* 2. SUB-NAVIGATION TABS (ALL SECTIONS 100% IN ENGLISH) */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 text-xs font-bold print:hidden">
        <button
          type="button"
          onClick={() => setActiveSection('COMBINED_DISPATCH')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'COMBINED_DISPATCH' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📋 7 Corridors & Dispatch
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SOUTHERN_OLIVE_ORDERS')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'SOUTHERN_OLIVE_ORDERS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🫒 Southern Olive Oil Orders
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SUPERSONIC_3PL_ORDERS')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'SUPERSONIC_3PL_ORDERS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🏢 SuperSonic 3PL Orders
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SETTLEMENTS')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          💵 COD, Whish & Reports
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('LIVE_RADAR')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'LIVE_RADAR' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📡 Live Fleet Radar & GPS
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('POD_ARCHIVES')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'POD_ARCHIVES' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          ✍️ Proof of Delivery (POD)
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('EMPLOYEES')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'EMPLOYEES' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          👥 Employees & Drivers
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('COMPLAINTS_REVIEWS')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'COMPLAINTS_REVIEWS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🎧 Complaints & 1-Hour Reviews
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('VEHICLES_LOG')}
          className={`px-3 py-1.5 rounded-xl transition-all ${activeSection === 'VEHICLES_LOG' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🚐 Vehicles & Odometer
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. COMBINED REGIONAL DISPATCH (PRINTABLE A4 ROUTE MANIFEST)         */}
      {/* =================================================================== */}
      {activeSection === 'COMBINED_DISPATCH' && (
        <div className="space-y-4 print:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Assigned Route Runs (Co-Loaded Vehicles)</h3>
                <p className="text-[11px] text-slate-400">All packages leaving Choueifat Hub, grouped by corridor and assigned trips.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <span>🖨️ Print Assigned Route Manifest A4</span>
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
                  {orders.map((order) => (
                    <tr key={order.id} className={order.status === 'MOVED_TO_POS_PICKUP' ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-60' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{order.orderNo}</td>
                      <td className="py-2.5 px-3">
                        {order.sourceType === 'SOUTHERN_OLIVE' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">🫒 Southern Olive In-House</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300 text-[10px] font-bold">🏢 External 3PL Merchant</span>
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
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${order.deliveryFeeUsd}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {order.vehiclePlate !== '-' ? `${order.vehiclePlate} (${order.assignedDriver})` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {order.status === 'MOVED_TO_POS_PICKUP' ? (
                          <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px]">
                            🏪 Moved to POS Pickup (Read-Only)
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
      {/* 2. SECTION: SOUTHERN OLIVE ORDERS                                   */}
      {/* =================================================================== */}
      {activeSection === 'SOUTHERN_OLIVE_ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Southern Olive Oil In-House Orders</h3>
          <p className="text-[11px] text-slate-400">Direct integration with sales reps and automatic warehouse inventory deductions.</p>
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">destination</th>
                  <th className="py-2.5 px-3 normal-case">items checklist</th>
                  <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                  <th className="py-2.5 px-3 normal-case">originating rep</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.sourceType === 'SOUTHERN_OLIVE').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{o.destinationTown}</td>
                    <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                    <td className="py-2.5 px-3 text-purple-800 font-semibold">{o.repName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. SECTION: SUPERSONIC 3PL EXTERNAL ORDERS                          */}
      {/* =================================================================== */}
      {activeSection === 'SUPERSONIC_3PL_ORDERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic 3PL Commercial Merchant Inflow</h3>
              <p className="text-[11px] text-slate-400">External merchant shipments with automated COD tracking and delivery fee isolation.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdd3PLModal(true)}
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
                {orders.filter(o => o.sourceType === 'EXTERNAL_3PL').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{o.phone}</td>
                    <td className="py-2.5 px-3 text-slate-700">{o.destinationTown}</td>
                    <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${o.deliveryFeeUsd}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. SECTION: INTERACTIVE LIVE FLEET RADAR (CLICKABLE CARDS + MODAL)  */}
      {/* =================================================================== */}
      {activeSection === 'LIVE_RADAR' && (
        <div className="space-y-4 print:hidden">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <span>💡 <strong>Interactive Telemetry:</strong> Click on any driver card below to view their live GPS route, speed, battery, and complete delivery progress report.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {vehicles.map((v) => (
              <div
                key={v.plate}
                onClick={() => setSelectedVehicleForTelemetry(v)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-600 p-4 shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{v.plate}</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1 group-hover:text-blue-700 transition-colors">{v.model}</h4>
                    <span className="text-[11px] text-slate-600 block">Driver: <strong>{v.driver}</strong></span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === 'ON_ROUTE' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {v.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1.5 font-mono">
                  <div className="flex justify-between"><span>Speed:</span> <strong className="text-blue-700">{v.currentSpeedKmH} KM/H</strong></div>
                  <div className="flex justify-between"><span>Battery:</span> <strong className="text-emerald-700">{v.batteryPercent}% 🔋</strong></div>
                  <div className="flex justify-between"><span>Current Location:</span> <strong className="text-slate-900 truncate max-w-[120px]">{v.currentLocationName}</strong></div>
                  <div className="flex justify-between text-emerald-800 font-bold"><span>Stops:</span> <span>{v.stopsDelivered} / {v.stopsTotal} Completed</span></div>
                </div>

                <div className="pt-1 text-center text-xs text-blue-600 font-bold group-hover:underline">
                  Click to View Live Route Progress ➔
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. SECTION: PROOF OF DELIVERY (POD) ARCHIVE (WITH SIGNATURE & PHOTOS)*/}
      {/* =================================================================== */}
      {activeSection === 'POD_ARCHIVES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Electronic Signatures & Photo Archive</h3>
          <p className="text-[11px] text-slate-400">Inspect verified electronic customer signatures, delivery timestamps, and camera photo thumbnails.</p>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer / recipient</th>
                  <th className="py-2.5 px-3 normal-case">delivery timestamp</th>
                  <th className="py-2.5 px-3 normal-case">driver</th>
                  <th className="py-2.5 px-3 normal-case text-center">digital signature</th>
                  <th className="py-2.5 px-3 normal-case text-center">photo proofs (2 photos)</th>
                  <th className="py-2.5 px-3 normal-case text-right">amount collected</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.status === 'DELIVERED').map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                    <td className="py-2.5 px-3">
                      <strong className="text-slate-900 block">{o.customerName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{o.destinationTown}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{o.deliveredAt}</td>
                    <td className="py-2.5 px-3 text-slate-800">{o.assignedDriver}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-block px-2 py-1 bg-slate-100 rounded border border-slate-300 font-serif italic text-blue-900 font-bold text-xs">
                        ✍️ {o.signatureSvg || 'Verified Signed'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                          📸 Photo 1: Tin
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold">
                          📸 Photo 2: Slip
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd}`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPodOrder(o)}
                        className="px-2.5 py-1 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded text-[10.5px] font-bold"
                      >
                        Inspect POD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. SECTION: EMPLOYEES & DRIVERS (WITH ADD NEW EMPLOYEE DIALOG)     */}
      {/* =================================================================== */}
      {activeSection === 'EMPLOYEES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic Staff Registry (Drivers & On-Site Personnel)</h3>
              <p className="text-[11px] text-slate-400">Strictly isolated from olive press factory personnel. Dedicated logistics staff roster.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>➕ Add New Employee</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">emp id</th>
                  <th className="py-2.5 px-3 normal-case">full name</th>
                  <th className="py-2.5 px-3 normal-case">role / staff type</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">national id / passport</th>
                  <th className="py-2.5 px-3 normal-case">compensation model</th>
                  <th className="py-2.5 px-3 normal-case">assigned vehicle / license</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{e.id}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1e3a2b]">{e.fullName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.type === 'DRIVER' ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'}`}>
                        {e.roleDescription}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{e.phone}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{e.nationalIdOrPassport}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{e.compensationModel}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {e.assignedVehicle || 'On-Site Staff (No Vehicle)'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. SECTION: COMPLAINTS & 1-HOUR REVIEWS (WITH BRAND ISOLATION)      */}
      {/* =================================================================== */}
      {activeSection === 'COMPLAINTS_REVIEWS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Customer Complaints & 1-Hour Post-Delivery Review Feed</h3>
          <p className="text-[11px] text-slate-400">
            Automated WhatsApp review links dispatched 1 hour post-delivery. Dual feedback sync for Southern Olive Oil vs isolated feed for external 3PL shipments.
          </p>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex justify-between items-start text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1e3a2b]">ORD-103349 (Al-Baraka Supermarket)</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Dual Brand Review (Southern Olive 🤝 SuperSonic)</span>
                </div>
                <div className="text-slate-700">Product Rating: ⭐⭐⭐⭐⭐ (5/5) | Courier Rating: ⭐⭐⭐⭐⭐ (5/5)</div>
                <p className="text-slate-600 italic">"Extra virgin olive oil harvest quality is superb. Driver arrived right on time."</p>
              </div>
              <span className="text-[10.5px] font-mono text-slate-500">Synced to Southern Olive Dashboard</span>
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex justify-between items-start text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900">3PL-88120 (La Rose Fashion)</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">SuperSonic Standalone Review (3PL Isolated)</span>
                </div>
                <div className="text-slate-700">Courier Rating: ⭐⭐⭐⭐☆ (4/5)</div>
                <p className="text-slate-600 italic">"Package received in great condition. Driver was polite."</p>
              </div>
              <span className="text-[10.5px] font-mono text-blue-700 font-bold">0% Noise to Southern Olive Books</span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. SECTION: SETTLEMENTS & MASTER A4 RECONCILIATION REPORT           */}
      {/* =================================================================== */}
      {activeSection === 'SETTLEMENTS' && (
        <div className="space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Select Driver For Master Reconciliation Report:</span>
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
                <div><strong>Driver Name:</strong> {currentReportVehicle.driver} ({currentReportVehicle.phone})</div>
                <div><strong>Vehicle Model:</strong> {currentReportVehicle.model} ({currentReportVehicle.category})</div>
                <div><strong>Plate Number:</strong> {currentReportVehicle.plate}</div>
                <div><strong>Departure Point:</strong> SuperSonic Central Hub (Choueifat)</div>
                <div><strong>Odometer:</strong> {currentReportVehicle.startKm.toLocaleString()} KM ➔ {currentReportVehicle.currentKm.toLocaleString()} KM</div>
                <div><strong>Total Distance:</strong> {currentReportVehicle.currentKm - currentReportVehicle.startKm} KM (Roundtrip)</div>
              </div>

              <table className="w-full table-fixed text-left border border-black border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-bold">
                    <th className="py-1.5 px-1 normal-case w-[10%] border-r border-black">Trip #</th>
                    <th className="py-1.5 px-1 normal-case w-[28%] border-r border-black">Corridor / Line</th>
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
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. SECTION: VEHICLES & ODOMETER LOG                                 */}
      {/* =================================================================== */}
      {activeSection === 'VEHICLES_LOG' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Fleet Vehicles & Odometer Log (Vans, Cars, Motorcycles)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned Driver: {v.driver} ({v.phone})</div>
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM (+{v.currentKm - v.startKm} KM today)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: LIVE RADAR TELEMETRY & ROUTE PROGRESS POPUP                */}
      {/* =================================================================== */}
      {selectedVehicleForTelemetry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col text-xs text-slate-800">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">📡</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedVehicleForTelemetry.driver} ({selectedVehicleForTelemetry.model})</h3>
                  <span className="text-[10.5px] text-slate-500 font-mono">Plate: {selectedVehicleForTelemetry.plate} — Corridor {selectedVehicleForTelemetry.assignedCorridor}</span>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-700 block font-bold">SPEED</span>
                  <strong className="text-sm text-blue-900">{selectedVehicleForTelemetry.currentSpeedKmH} KM/H</strong>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block font-bold">PHONE BATTERY</span>
                  <strong className="text-sm text-emerald-900">{selectedVehicleForTelemetry.batteryPercent}% 🔋</strong>
                </div>
                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-[10px] text-purple-700 block font-bold">STOPS PROGRESS</span>
                  <strong className="text-sm text-purple-900">{selectedVehicleForTelemetry.stopsDelivered}/{selectedVehicleForTelemetry.stopsTotal} Done</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">CURRENT LOCATION</span>
                  <strong className="text-slate-900 text-xs">{selectedVehicleForTelemetry.currentLocationName}</strong>
                  <span className="text-[10px] text-slate-400 block font-mono">{selectedVehicleForTelemetry.gpsCoords}</span>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${selectedVehicleForTelemetry.phone}`} className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs">📞 Call</a>
                  <a href={`https://wa.me/961${selectedVehicleForTelemetry.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs">💬 WhatsApp</a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Live Route Stops & Execution Progress</h4>
                <div className="space-y-1.5">
                  {orders.filter(o => o.assignedDriver === selectedVehicleForTelemetry.driver).map((o, idx) => (
                    <div key={o.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Stop #{idx + 1}: {o.customerName}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{o.destinationTown} — {o.items}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">Close Telemetry</button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: POD PROOFS & SIGNATURE INSPECT MODAL                       */}
      {/* =================================================================== */}
      {selectedPodOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-xs text-slate-800">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Verified Proof of Delivery — #{selectedPodOrder.orderNo}</h3>
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono space-y-1">
                <div><strong>Customer:</strong> {selectedPodOrder.customerName}</div>
                <div><strong>Delivered At:</strong> {selectedPodOrder.deliveredAt}</div>
                <div><strong>Delivered by Driver:</strong> {selectedPodOrder.assignedDriver}</div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Customer Digital Signature on Screen:</span>
                <div className="h-20 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center font-serif italic text-blue-900 text-lg font-bold">
                  ✍️ {selectedPodOrder.signatureSvg}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Camera Photo Proofs Attached:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-24 bg-slate-100 rounded-xl border border-slate-300 flex flex-col items-center justify-center text-center p-2 text-slate-600">
                    <span className="text-xl mb-1">📸</span>
                    <span className="text-[10px] font-bold">{selectedPodOrder.photoUrl1}</span>
                  </div>
                  <div className="h-24 bg-slate-100 rounded-xl border border-slate-300 flex flex-col items-center justify-center text-center p-2 text-slate-600">
                    <span className="text-xl mb-1">📸</span>
                    <span className="text-[10px] font-bold">{selectedPodOrder.photoUrl2}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: ADD NEW EMPLOYEE (DRIVER VS ON-SITE PERSONNEL)             */}
      {/* =================================================================== */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-xs text-slate-800">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add New SuperSonic Staff Member</h3>
              <button type="button" onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff Classification:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEmpType('DRIVER')}
                    className={`flex-1 py-2 rounded-xl border font-bold text-xs ${newEmpType === 'DRIVER' ? 'bg-[#1e3a2b] text-white border-[#1e3a2b]' : 'bg-slate-100 text-slate-700 border-slate-300'}`}
                  >
                    🚐 Field Courier / Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEmpType('ON_SITE')}
                    className={`flex-1 py-2 rounded-xl border font-bold text-xs ${newEmpType === 'ON_SITE' ? 'bg-[#1e3a2b] text-white border-[#1e3a2b]' : 'bg-slate-100 text-slate-700 border-slate-300'}`}
                  >
                    🏢 On-Site Staff / Manager
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name:</label>
                <input type="text" placeholder="e.g. Tony Khoury" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number:</label>
                <input type="text" placeholder="e.g. 03-112233" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">National ID / Passport No:</label>
                <input type="text" placeholder="e.g. ID-8891024" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>

              {newEmpType === 'DRIVER' && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vehicle Category Assigned:</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                      <option value="VAN">Van (Toyota HiAce / Hyundai H1)</option>
                      <option value="CAR">Car (Renault Duster 4x4)</option>
                      <option value="MOTORCYCLE">Motorcycle (Honda Cargo 250)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Driving License No & Expiry:</label>
                    <input type="text" placeholder="e.g. DL-9921 (Expires 2028-11-15)" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
                  </div>
                </>
              )}

              {newEmpType === 'ON_SITE' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">On-Site Role Title:</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                    <option value="SUPERSONIC_MANAGER">SuperSonic Operations Manager</option>
                    <option value="DISPATCHER">Fleet Controller & Dispatcher</option>
                    <option value="ACCOUNTANT">Fleet Accountant & Settlements</option>
                    <option value="SORTER">Warehouse Loading Sorter</option>
                    <option value="CUSTOMER_CARE">Customer Care & Quality Agent</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Compensation Agreement:</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                  <option value="COMMISSION_PER_DELIVERY">Commission per Delivery Run</option>
                  <option value="FIXED_SALARY">Fixed Monthly Salary</option>
                  <option value="DAILY_RATE">Daily Shift Rate</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('✓ New employee added to SuperSonic staff roster successfully!');
                  setShowAddEmployeeModal(false);
                }}
                className="w-full py-2.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md mt-2"
              >
                Save & Create Employee Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: ADD EXTERNAL 3PL ORDER DIALOG                              */}
      {/* =================================================================== */}
      {showAdd3PLModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-xs text-slate-800">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add External 3PL Merchant Shipment</h3>
              <button type="button" onClick={() => setShowAdd3PLModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Merchant / Store Name:</label>
                <input type="text" placeholder="e.g. Apex Electronics Boutique" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recipient Customer Name & Phone:</label>
                <input type="text" placeholder="e.g. Ziad Nassar (03-554433)" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Town (Lebanon):</label>
                <input type="text" placeholder="e.g. Saida - Riad El Solh" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">COD Cash to Collect ($):</label>
                  <input type="number" placeholder="50.0" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Fee ($):</label>
                  <input type="number" placeholder="4.0" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert('✓ External 3PL order saved into SuperSonic and automatically merged with today runs!');
                  setShowAdd3PLModal(false);
                }}
                className="w-full py-2.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md mt-2"
              >
                Save & Auto-Route by Zone
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
