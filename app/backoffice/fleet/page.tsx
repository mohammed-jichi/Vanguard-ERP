'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ============================================================================
// CLEAN SUPERSONIC FLEET WORKSPACE (DRIVEN BY LEFT SIDEBAR - NO HORIZONTAL BUTTONS)
// TENANT: Southern Olive Oil Products S.A.R.L (00001)
// ============================================================================

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
  deliveredAt?: string;
  signatureSvg?: string;
  photoUrl1?: string;
  photoUrl2?: string;
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

function SuperSonicFleetContent() {
  const searchParams = useSearchParams();
  // Active Section is driven purely from the Left Sidebar query param: ?tab=...
  const activeTab = searchParams.get('tab') || 'dispatch';

  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);

  // Corridors List
  const corridors: CorridorRoute[] = [
    { id: 1, name: 'Corridor 1: Greater Beirut & Connected Coast', schedule: 'Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Khalde ➔ Hadath / Baabda / Dahieh ➔ Beirut City ➔ Metn Coast', activeOrdersCount: 14 },
    { id: 2, name: 'Corridor 2: Central & Southern Mount Lebanon', schedule: 'Daily / Near-Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Aramoun / Bchamoun ➔ Aley / Bhamdoun / Sofar ➔ Upper Chouf', activeOrdersCount: 9 },
    { id: 3, name: 'Corridor 3: Southern Coast & Deep South', schedule: 'Daily', highwayPath: 'Chouf Coast (Damour, Jiyeh) ➔ Saida ➔ Tyre (Sour) ➔ Nabatieh', activeOrdersCount: 12 },
    { id: 4, name: 'Corridor 4: Northern Coast to Batroun', schedule: '3-4 times/week', highwayPath: 'Antelias / Dbayeh ➔ Jounieh / Keserwan ➔ Jbeil ➔ Batroun ➔ Koura', activeOrdersCount: 8 },
    { id: 5, name: 'Corridor 5: Tripoli, Akkar & Dinnieh', schedule: '2-3 times/week', highwayPath: 'Tripoli ➔ Minieh ➔ Zgharta ➔ Dinnieh ➔ Akkar (Halba, Qobayat, Khraybet El Jindi, Menjez)', activeOrdersCount: 6 },
    { id: 6, name: 'Corridor 6: Central, West Bekaa & South-East', schedule: '2-3 times/week', highwayPath: 'Damascus Road (Sofar - Dahr El Baidar) ➔ Chtaura / Zahle ➔ West Bekaa ➔ Rashaya ➔ Hasbaya ➔ Jezzine', activeOrdersCount: 5 },
    { id: 7, name: 'Corridor 7: North Bekaa - Baalbek Hermel', schedule: '1-2 times/week', highwayPath: 'Rayak ➔ Baalbek ➔ Deir El Ahmar ➔ Labweh ➔ Hermel', activeOrdersCount: 3 },
  ];

  // Vehicles
  const [vehicles] = useState<FleetVehicle[]>([
    { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', phone: '03-112233', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 142050, currentKm: 142165, reconciliationClosed: true, batteryPercent: 88, currentSpeedKmH: 48, currentLocationName: 'Beirut - Hamra Main Axis', gpsCoords: '33.8938° N, 35.4802° E', stopsDelivered: 6, stopsTotal: 8 },
    { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', phone: '03-445566', assignedCorridor: 2, status: 'DELIVERING', startKm: 88400, currentKm: 88480, reconciliationClosed: true, batteryPercent: 64, currentSpeedKmH: 20, currentLocationName: 'Aley - Roundabout Center', gpsCoords: '33.7821° N, 35.5901° E', stopsDelivered: 4, stopsTotal: 6 },
    { plate: 'S-772910', category: 'CAR', model: 'Renault Duster 4x4 (Car 01)', driver: 'Hassan Sleiman', phone: '03-778899', assignedCorridor: 3, status: 'ON_ROUTE', startKm: 65120, currentKm: 65205, reconciliationClosed: true, batteryPercent: 92, currentSpeedKmH: 62, currentLocationName: 'Saida - Riad El Solh Highway', gpsCoords: '33.5590° N, 35.3725° E', stopsDelivered: 5, stopsTotal: 7 },
    { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', phone: '03-990011', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 12400, currentKm: 12460, reconciliationClosed: true, batteryPercent: 78, currentSpeedKmH: 35, currentLocationName: 'Dahieh - Hadi Nasrallah', gpsCoords: '33.8540° N, 35.5090° E', stopsDelivered: 3, stopsTotal: 4 },
  ]);

  // Orders
  const [orders] = useState<DispatchedOrder[]>([
    { id: 'ORD-103349', orderNo: 'ORD-103349', sourceType: 'SOUTHERN_OLIVE', customerName: 'Al-Baraka Supermarket S.A.R.L', phone: '01-745890', corridorId: 1, tripNo: 1, destinationTown: 'Beirut - Hamra', addressDetails: 'Makdessi St, Bldg 14', items: '1x 17.5L Extra Virgin Tin + 2x Pickled Olives Box', productAmountLbp: 9000000, productAmountUsd: 100.0, deliveryFeeUsd: 4.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', repName: 'Ahmad Ali Kassem (REP-002)', deliveredAt: '03-Sep-2026 01:25 PM', signatureSvg: 'Imad_Al_Baraka' },
    { id: 'ORD-103350', orderNo: 'ORD-103350', sourceType: 'SOUTHERN_OLIVE', customerName: 'Colonel Mahmoud Abboud', phone: '03-556677', corridorId: 2, tripNo: 0, destinationTown: 'Choueifat Showroom', addressDetails: 'Showroom Pickup Counter', items: '30x 17.5L Extra Virgin Bulk Tins', productAmountLbp: 248400000, productAmountUsd: 2760.0, deliveryFeeUsd: 0.0, assignedDriver: '-', vehiclePlate: '-', status: 'MOVED_TO_POS_PICKUP', repName: 'Hiba Aloulou (REP-004)' },
    { id: '3PL-88120', orderNo: '3PL-88120', sourceType: 'EXTERNAL_3PL', customerName: 'La Rose Fashion Boutique', phone: '01-482910', corridorId: 1, tripNo: 1, destinationTown: 'Metn - Sin El Fil', addressDetails: 'Near Habtoor Hotel', items: '3x Apparel Packages', productAmountLbp: 3150000, productAmountUsd: 35.0, deliveryFeeUsd: 3.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', deliveredAt: '03-Sep-2026 02:10 PM', signatureSvg: 'Mireille_LaRose' },
    { id: 'ORD-103352', orderNo: 'ORD-103352', sourceType: 'SOUTHERN_OLIVE', customerName: 'Hussein Daik Retail Mart', phone: '07-720190', corridorId: 3, tripNo: 1, destinationTown: 'Saida - Riad El Solh', addressDetails: 'Daik Wholesale Center', items: 'Assorted Preserves + Extra Virgin 1L Cases', productAmountLbp: 706968000, productAmountUsd: 7855.2, deliveryFeeUsd: 6.0, assignedDriver: 'Hassan Sleiman', vehiclePlate: 'S-772910', status: 'ON_ROUTE', repName: 'Mahdi (REP-001)' },
  ]);

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

      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-slate-200 pb-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              {activeTab === 'dispatch' && '7 Corridors & Regional Dispatch'}
              {activeTab === 'southern-olive' && 'Southern Olive Oil Dedicated Inflow'}
              {activeTab === '3pl' && 'SuperSonic 3PL Commercial Orders'}
              {activeTab === 'settlements' && 'Driver Trips Master Reconciliation (A4 / PDF / CSV)'}
              {activeTab === 'radar' && 'Live Fleet Radar & GPS Telemetry'}
              {activeTab === 'pod' && 'Proof of Delivery (POD) Archives'}
              {activeTab === 'employees' && 'SuperSonic Staff & Driver Registry'}
              {activeTab === 'complaints' && 'Customer Complaints & 1-Hour Review Feed'}
              {activeTab === 'vehicles' && 'Fleet Vehicles & Odometer Log'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SuperSonic Central Logistics Hub (Choueifat Gateway) — Controlled from the Left Sidebar Navigation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-[#edf2ee] text-[#1e3a2b] font-bold rounded-lg border border-[#1e3a2b]/30">
            00001 - Southern Olive Oil Products S.A.R.L
          </span>
          <Link href="/backoffice/dashboard" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300">
            🔄 Return to Main Hub
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. DISPATCH WORKSPACE                                               */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {corridors.map((c) => (
              <div key={c.id} className="p-3 rounded-xl border bg-white border-slate-200">
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

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Assigned Route Runs (Co-Loaded Vehicles)</h3>
                <p className="text-[11px] text-slate-400">All packages leaving Choueifat Hub, grouped by corridor and assigned trips.</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white rounded-lg text-xs font-bold shadow-xs"
              >
                🖨️ Print Assigned Route Manifest A4
              </button>
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
      {/* 2. SOUTHERN OLIVE ORDERS WORKSPACE                                  */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Southern Olive Oil Products S.A.R.L Dedicated Inflow</h3>
          <p className="text-[11px] text-slate-400">In-house orders with automated warehouse stock deductions and sales rep commissions.</p>
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
      {/* 3. SUPERSONIC 3PL EXTERNAL ORDERS WORKSPACE                         */}
      {/* =================================================================== */}
      {activeTab === '3pl' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic 3PL Commercial Merchant Inflow</h3>
              <p className="text-[11px] text-slate-400">External merchant shipments with automated COD tracking and delivery fee isolation.</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Opening 3PL Order Entry...')}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs"
            >
              ➕ Add External 3PL Order
            </button>
          </div>
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">merchant / sender</th>
                  <th className="py-2.5 px-3 normal-case">destination town</th>
                  <th className="py-2.5 px-3 normal-case">package description</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod cash</th>
                  <th className="py-2.5 px-3 normal-case text-right">delivery fee</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.sourceType === 'EXTERNAL_3PL').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
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
      {/* 4. SETTLEMENTS & REPORTS WORKSPACE                                  */}
      {/* =================================================================== */}
      {activeTab === 'settlements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Driver Reconciliation:</span>
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
            </div>
          </div>

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
              </div>

              <table className="w-full table-fixed text-left border border-black border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-bold">
                    <th className="py-1.5 px-1 normal-case w-[12%] border-r border-black">Trip #</th>
                    <th className="py-1.5 px-1 normal-case w-[28%] border-r border-black">Corridor / Line</th>
                    <th className="py-1.5 px-1 normal-case w-[10%] text-center border-r border-black">Stops</th>
                    <th className="py-1.5 px-1 normal-case w-[16%] text-right border-r border-black">Product ($)</th>
                    <th className="py-1.5 px-1 normal-case w-[16%] text-right border-r border-black">Cash USD</th>
                    <th className="py-1.5 px-1 normal-case w-[18%] text-right">Whish USD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-mono text-[10px]">
                  <tr>
                    <td className="py-1 px-1 font-bold border-r border-black">Trip 1</td>
                    <td className="py-1 px-1 font-sans border-r border-black">Corridor 1: Greater Beirut</td>
                    <td className="py-1 px-1 text-center border-r border-black">6/6</td>
                    <td className="py-1 px-1 text-right border-r border-black">$350.00</td>
                    <td className="py-1 px-1 text-right font-bold border-r border-black">$250.00</td>
                    <td className="py-1 px-1 text-right font-bold text-purple-900">$100.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="border border-black rounded p-3 text-xs font-mono space-y-1 bg-slate-50">
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>Driver Contribution Allowance (المساهمة):</span>
                  <span>+$20.00</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-black text-sm font-bold text-slate-900">
                  <span>Net Cash Handed Over to SuperSonic Vault:</span>
                  <span>$250.00 USD Cash + 9,000,000 LBP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. INTERACTIVE LIVE RADAR (CLICKABLE CARDS)                         */}
      {/* =================================================================== */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            💡 <strong>Interactive Telemetry:</strong> Click any driver card below to view their live GPS route, speed, battery, and complete delivery progress report.
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

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between"><span>Speed:</span> <strong className="text-blue-700">{v.currentSpeedKmH} KM/H</strong></div>
                  <div className="flex justify-between"><span>Battery:</span> <strong className="text-emerald-700">{v.batteryPercent}% 🔋</strong></div>
                  <div className="flex justify-between text-emerald-800 font-bold"><span>Stops:</span> <span>{v.stopsDelivered}/{v.stopsTotal} Done</span></div>
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
      {/* 6. PROOF OF DELIVERY (POD) ARCHIVES (WITH VISUAL SIGNATURE & PHOTOS)*/}
      {/* =================================================================== */}
      {activeTab === 'pod' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Electronic Signatures & Photo Archive</h3>
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer / recipient</th>
                  <th className="py-2.5 px-3 normal-case">timestamp</th>
                  <th className="py-2.5 px-3 normal-case">driver</th>
                  <th className="py-2.5 px-3 normal-case text-center">digital signature</th>
                  <th className="py-2.5 px-3 normal-case text-center">photo proofs</th>
                  <th className="py-2.5 px-3 normal-case text-right">amount collected</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.status === 'DELIVERED').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{o.deliveredAt}</td>
                    <td className="py-2.5 px-3 text-slate-800">{o.assignedDriver}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-block px-2.5 py-1 bg-slate-100 rounded border border-slate-300 font-serif italic text-blue-900 font-bold text-xs">
                        ✍️ {o.signatureSvg}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">📸 Photo 1: Tin</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold">📄 Photo 2: Slip</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
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
      {/* 7. EMPLOYEES & VEHICLES LOG                                         */}
      {/* =================================================================== */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic Staff Registry (Drivers & On-Site Personnel)</h3>
          <p className="text-[11px] text-slate-400">Strictly isolated from olive press factory personnel. Dedicated logistics roster.</p>
          <div className="border border-slate-200 rounded-xl p-4 text-xs font-mono">
            <div>• Tony Khoury — Lead Courier (Van 01 B-492102) — Commission Model</div>
            <div>• Fadi Abou Assi — Senior Driver (Van 02 G-183921) — Daily Rate</div>
            <div>• Rami Al-Hajj — SuperSonic Operations Manager — Fixed Salary</div>
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Fleet Vehicles & Odometer Log (Vans, Cars, Motorcycles)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned Driver: {v.driver}</div>
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM (+{v.currentKm - v.startKm} KM today)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: RADAR TELEMETRY POPUP */}
      {selectedVehicleForTelemetry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">{selectedVehicleForTelemetry.driver} ({selectedVehicleForTelemetry.model})</h3>
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 bg-blue-50 rounded border border-blue-200"><span>SPEED:</span> <strong>{selectedVehicleForTelemetry.currentSpeedKmH} KM/H</strong></div>
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200"><span>BATTERY:</span> <strong>{selectedVehicleForTelemetry.batteryPercent}% 🔋</strong></div>
              <div className="p-2 bg-purple-50 rounded border border-purple-200"><span>STOPS:</span> <strong>{selectedVehicleForTelemetry.stopsDelivered}/{selectedVehicleForTelemetry.stopsTotal} Done</strong></div>
            </div>
            <div className="p-3 bg-slate-50 rounded border font-mono">
              <div><strong>Current Location:</strong> {selectedVehicleForTelemetry.currentLocationName} ({selectedVehicleForTelemetry.gpsCoords})</div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POD PROOF POPUP */}
      {selectedPodOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Verified Proof of Delivery — #{selectedPodOrder.orderNo}</h3>
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>
            <div className="p-3 bg-slate-50 rounded border font-mono space-y-1">
              <div><strong>Customer:</strong> {selectedPodOrder.customerName}</div>
              <div><strong>Delivered At:</strong> {selectedPodOrder.deliveredAt}</div>
              <div><strong>Driver:</strong> {selectedPodOrder.assignedDriver}</div>
            </div>
            <div>
              <span className="font-bold block mb-1">Customer Digital Signature:</span>
              <div className="h-16 bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center font-serif italic text-blue-900 text-lg font-bold">
                ✍️ {selectedPodOrder.signatureSvg}
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SuperSonicFleetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500 font-mono">Loading SuperSonic Fleet Workspace...</div>}>
      <SuperSonicFleetContent />
    </Suspense>
  );
}
