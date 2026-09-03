'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES & DATA STRUCTURES - SUPERSONIC FLEET & SOUTHERN OLIVE OIL PRODUCTS
// ============================================================================

type FleetTab = 'DISPATCH' | 'RADAR' | 'TRIPS_SETTLEMENTS' | 'POD' | 'VEHICLES';

type VehicleCategory = 'VAN' | 'CAR' | 'MOTORCYCLE';

type OrderSourceType = 'IN_HOUSE_SOUTHERN_OLIVE' | 'EXTERNAL_3PL_VENDOR';

interface DriverTripBatch {
  tripNumber: number;
  corridorName: string;
  totalStops: number;
  deliveredStops: number;
  productValueUsd: number;
  productValueLbp: number;
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
  amountLbp: number;
  amountUsd: number;
  whishReferenceNo: string;
  submittedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export default function SuperSonicFleetManagementPage() {
  const [activeTab, setActiveTab] = useState<FleetTab>('DISPATCH');
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');

  // Manual Driver Contribution State (بند المساهمة)
  const [driverContributions, setDriverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 20.0,
    'Fadi Abou Assi': 25.0,
    'Hassan Sleiman': 30.0,
    'Ahmad Zein': 10.0,
  });

  // Fleet Vehicles with Trip Sequences
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
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
        { tripNumber: 1, corridorName: 'المسار 1: بيروت الكبرى', totalStops: 6, deliveredStops: 6, productValueUsd: 350.0, productValueLbp: 9000000, deliveryFeesUsd: 24.0, cashUsdCollected: 250.0, cashLbpCollected: 9000000, whishUsdCollected: 100.0, status: 'RECONCILED' },
        { tripNumber: 2, corridorName: 'المسار 2: الشوف وعاليه', totalStops: 4, deliveredStops: 4, productValueUsd: 210.0, productValueLbp: 0, deliveryFeesUsd: 16.0, cashUsdCollected: 110.0, cashLbpCollected: 0, whishUsdCollected: 100.0, status: 'RECONCILED' },
        { tripNumber: 3, corridorName: 'المسار 1: ساحل المتن', totalStops: 3, deliveredStops: 2, productValueUsd: 180.0, productValueLbp: 0, deliveryFeesUsd: 12.0, cashUsdCollected: 180.0, cashLbpCollected: 0, whishUsdCollected: 0.0, status: 'IN_PROGRESS' },
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
        { tripNumber: 1, corridorName: 'المسار 2: جبل لبنان', totalStops: 5, deliveredStops: 5, productValueUsd: 400.0, productValueLbp: 0, deliveryFeesUsd: 20.0, cashUsdCollected: 400.0, cashLbpCollected: 0, whishUsdCollected: 0.0, status: 'RECONCILED' },
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
        { tripNumber: 1, corridorName: 'المسار 1: بيروت السريعة', totalStops: 3, deliveredStops: 3, productValueUsd: 90.0, productValueLbp: 0, deliveryFeesUsd: 9.0, cashUsdCollected: 90.0, cashLbpCollected: 0, whishUsdCollected: 0.0, status: 'RECONCILED' },
        { tripNumber: 2, corridorName: 'المسار 1: خلدة والضاحية', totalStops: 4, deliveredStops: 3, productValueUsd: 120.0, productValueLbp: 0, deliveryFeesUsd: 12.0, cashUsdCollected: 120.0, cashLbpCollected: 0, whishUsdCollected: 0.0, status: 'IN_PROGRESS' },
      ],
    },
  ]);

  // Dispatched Orders with Trip Identifiers
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
      addressDetails: 'Near Habtoor Grand Hotel',
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

  // Whish Submissions Audit
  const [whishSubmissions, setWhishSubmissions] = useState<WhishSettlementSubmission[]>([
    {
      id: 'WSH-0091',
      driverName: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      amountLbp: 0,
      amountUsd: 200,
      whishReferenceNo: 'WHISH-TX-9988124',
      submittedAt: 'Today 04:15 PM',
      status: 'PENDING_APPROVAL',
    },
  ]);

  // Handlers
  const handleApproveWhish = (id: string) => {
    setWhishSubmissions((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'APPROVED' } : w)));
    alert(`✓ Whish Settlement #${id} Approved and verified into SuperSonic treasury.`);
  };

  const handlePushToFinancial = () => {
    alert('🚀 Push Successful!\nDelivery sales batch pushed directly to Southern Olive Oil Products CFO Inbox (/backoffice/inbox).\nPending CFO review to post into official general ledgers.');
  };

  // CSV Export for Driver Daily Master Reconciliation
  const handleExportCSV = (driverName: string) => {
    const d = vehicles.find((v) => v.driver === driverName);
    if (!d) return;

    let csv = `\uFEFFCompany,SuperSonic Delivery Fleet & Logistics\nAffiliation,Southern Olive Oil Products S.A.R.L\nDriver,${d.driver}\nVehicle,${d.model} (${d.plate})\nDate,03-Sep-2026\nOdometer,${d.startKm} KM to ${d.currentKm} KM (Total: ${d.currentKm - d.startKm} KM)\n\n`;
    csv += `Trip Number,Corridor / Zone,Total Stops,Delivered,Product Value USD,Delivery Fee USD,Cash USD,Cash LBP,Whish USD,Status\n`;

    d.tripsToday.forEach((t) => {
      csv += `Trip ${t.tripNumber},"${t.corridorName}",${t.totalStops},${t.deliveredStops},${t.productValueUsd},${t.deliveryFeesUsd},${t.cashUsdCollected},${t.cashLbpCollected},${t.whishUsdCollected},${t.status}\n`;
    });

    const totalProduct = d.tripsToday.reduce((a, b) => a + b.productValueUsd, 0);
    const totalCashUsd = d.tripsToday.reduce((a, b) => a + b.cashUsdCollected, 0);
    const totalCashLbp = d.tripsToday.reduce((a, b) => a + b.cashLbpCollected, 0);
    const totalWhish = d.tripsToday.reduce((a, b) => a + b.whishUsdCollected, 0);

    csv += `TOTALS,,${d.tripsToday.reduce((a, b) => a + b.totalStops, 0)},${d.tripsToday.reduce((a, b) => a + b.deliveredStops, 0)},${totalProduct},${d.tripsToday.reduce((a, b) => a + b.deliveryFeesUsd, 0)},${totalCashUsd},${totalCashLbp},${totalWhish},\n`;
    csv += `\nDriver Contribution Allowance (المساهمة),+$${driverContributions[d.driver] || 0}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SuperSonic_Reconciliation_${driverName.replace(/\s+/g, '_')}_2026-09-03.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-10">
      
      {/* BULLETPROOF INLINE A4 PRINT CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          header, aside, nav, button, input, select, .print-hidden, [class*="print:hidden"] {
            display: none !important;
            visibility: hidden !important;
          }
          #isolated-a4-print-sheet, #isolated-a4-print-sheet * {
            visibility: visible !important;
          }
          #isolated-a4-print-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            display: block !important;
            z-index: 999999 !important;
          }
        }
      `}} />

      {/* 1. TOP COMMAND BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-slate-200 pb-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              2. SuperSonic Fleet Management & Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            المركز الرئيسي لشركة سوبر سونيك (Choueifat Hub) — Multi-Trip Lifecycle (Trip 1, 2, 3...), Inter-Company Pushes, & Whish Reconciliation.
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
            🔄 Return to Hub
          </Link>
        </div>
      </div>

      {/* 2. TABS CONTROLLER */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-bold print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('DISPATCH')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'DISPATCH' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📋 7 Corridors & Today's Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TRIPS_SETTLEMENTS')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'TRIPS_SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          📄 Driver Trips Master Reconciliation (A4 / PDF / CSV)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('RADAR')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'RADAR' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          🗺️ Live Fleet Radar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('POD')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'POD' ? 'bg-[#1e3a2b] text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
        >
          ✍️ Proof of Delivery (POD)
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: DISPATCH & CORRIDORS (SOUTHERN OLIVE + EXTERNAL 3PL MERGING) */}
      {/* =================================================================== */}
      {activeTab === 'DISPATCH' && (
        <div className="space-y-4 print:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Merged Runs (Southern Olive + 3PL Orders)</h3>
                <p className="text-[11px] text-slate-400">Orders grouped by the 7 Strategic Corridors with Trip Sequencing (Trip 1, 2, 3...).</p>
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
                        المسار {order.corridorId} {order.tripNo > 0 && <span className="text-purple-700">(Trip {order.tripNo})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 text-[11px]">{order.items}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {order.productAmountLbp > 0 ? `${order.productAmountLbp.toLocaleString()} LBP` : `$${order.productAmountUsd}`}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${order.deliveryFeeUsd}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {order.assignedVehiclePlate !== '-' ? `${order.assignedVehiclePlate} (${order.assignedDriver})` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {order.status === 'MOVED_TO_POS_PICKUP' ? (
                          <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px]">
                            🏪 Moved to POS Pickup (Read-Only)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
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
      {/* TAB 2: DRIVER TRIPS MASTER RECONCILIATION (A4 PRINT / PDF / CSV)    */}
      {/* =================================================================== */}
      {activeTab === 'TRIPS_SETTLEMENTS' && (
        <div className="space-y-4">
          
          {/* Top Export Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Select Driver For Master Report:</span>
              <select
                value={selectedDriverForReport}
                onChange={(e) => setSelectedDriverForReport(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.driver} value={v.driver}>
                    {v.driver} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs flex items-center gap-1"
              >
                <span>🖨️ Print A4 Report</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1"
              >
                <span>📄 Download as PDF</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCSV(selectedDriverForReport)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1"
              >
                <span>📊 Export as CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Printable A4 Master Reconciliation Sheet */}
          <div className="flex justify-center">
            <div
              id="isolated-a4-print-sheet"
              className="w-[794px] min-h-[1123px] page-break-after-always relative bg-white p-8 text-black font-sans border border-slate-300 shadow-md print:border-none print:shadow-none print:m-0 print:p-6 select-none space-y-4"
            >
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

              {/* Driver Metadata Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
                <div><strong>Driver Name:</strong> {currentReportVehicle.driver}</div>
                <div><strong>Vehicle / Category:</strong> {currentReportVehicle.model} ({currentReportVehicle.category})</div>
                <div><strong>Plate Number:</strong> {currentReportVehicle.plate}</div>
                <div><strong>Departure Point:</strong> المركز الرئيسي بالشويفات</div>
                <div><strong>Odometer:</strong> Start: {currentReportVehicle.startKm.toLocaleString()} KM ➔ End: {currentReportVehicle.currentKm.toLocaleString()} KM</div>
                <div><strong>Total Distance Today:</strong> {currentReportVehicle.currentKm - currentReportVehicle.startKm} KM (Roundtrip)</div>
              </div>

              {/* Trips Breakdown Table */}
              <div>
                <h4 className="font-bold text-xs mb-1.5">Sequential Trips Completed Today (Trip 1, Trip 2, Trip 3...)</h4>
                <table className="w-full table-fixed text-left border border-black border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black font-bold leading-tight">
                      <th className="py-1.5 px-1 normal-case w-[10%] border-r border-black">Trip #</th>
                      <th className="py-1.5 px-1 normal-case w-[26%] border-r border-black">Corridor / Line</th>
                      <th className="py-1.5 px-1 normal-case w-[10%] text-center border-r border-black">Stops</th>
                      <th className="py-1.5 px-1 normal-case w-[16%] text-right border-r border-black">Product (USD)</th>
                      <th className="py-1.5 px-1 normal-case w-[14%] text-right border-r border-black">Delivery Fee</th>
                      <th className="py-1.5 px-1 normal-case w-[12%] text-right border-r border-black">Cash USD</th>
                      <th className="py-1.5 px-1 normal-case w-[12%] text-right">Whish USD</th>
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
                    <tr className="bg-slate-100 font-bold border-t-2 border-black text-[10.5px]">
                      <td colSpan={2} className="py-1.5 px-1 border-r border-black">CONSOLIDATED TOTALS</td>
                      <td className="py-1.5 px-1 text-center border-r border-black">
                        {currentReportVehicle.tripsToday.reduce((a, b) => a + b.deliveredStops, 0)} Stops
                      </td>
                      <td className="py-1.5 px-1 text-right border-r border-black">
                        ${currentReportVehicle.tripsToday.reduce((a, b) => a + b.productValueUsd, 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1 text-right border-r border-black">
                        ${currentReportVehicle.tripsToday.reduce((a, b) => a + b.deliveryFeesUsd, 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1 text-right border-r border-black font-bold">
                        ${currentReportVehicle.tripsToday.reduce((a, b) => a + b.cashUsdCollected, 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1 text-right font-bold text-purple-900">
                        ${currentReportVehicle.tripsToday.reduce((a, b) => a + b.whishUsdCollected, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Reconciliation Adjustments & Allowance */}
              <div className="border border-black rounded p-3 text-xs font-mono space-y-1.5 bg-slate-50">
                <div className="flex justify-between items-center text-emerald-900 font-bold">
                  <span>Total Delivery Fees Earned by Driver:</span>
                  <span>+${currentReportVehicle.tripsToday.reduce((a, b) => a + b.deliveryFeesUsd, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>بند المساهمة المعتمد للشوفير (Driver Allowance Contribution):</span>
                  <span>+${driverContributions[currentReportVehicle.driver] || 0}.00</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-black text-sm font-bold text-slate-900">
                  <span>Net Cash Handed Over to SuperSonic Vault:</span>
                  <span>
                    ${currentReportVehicle.tripsToday.reduce((a, b) => a + b.cashUsdCollected, 0).toFixed(2)} Cash USD
                    {currentReportVehicle.tripsToday.some((t) => t.cashLbpCollected > 0) && ' + 9,000,000 LBP'}
                  </span>
                </div>
              </div>

              {/* Signatures Block */}
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

              <div className="absolute bottom-6 left-8 right-8 border-t border-black pt-2 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>SuperSonic Fleet Master Engine</span>
                <span>Southern Olive Oil Products S.A.R.L</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: RADAR & TAB 4: POD ARCHIVES                                  */}
      {/* =================================================================== */}
      {activeTab === 'RADAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Live Satellite Radar Tracking</h3>
          <p className="text-xs text-slate-500">Telemetry streaming from Choueifat Hub to active vehicles across all 7 corridors.</p>
        </div>
      )}

      {activeTab === 'POD' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 print:hidden">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Digital Signatures & Photo Vault</h3>
          <p className="text-xs text-slate-500">Audited customer signatures and goods receipt verification logs.</p>
        </div>
      )}

    </div>
  );
}
