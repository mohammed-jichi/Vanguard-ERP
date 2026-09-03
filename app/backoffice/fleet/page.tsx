'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ============================================================================
// COMPLETE 11-SECTION SUPERSONIC FLEET & 3PL ENTERPRISE ENGINE
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
  photo1?: string;
  photo2?: string;
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
  offDutyPin?: string;
}

interface SuperSonicVendor {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  businessType: string;
  settlementTerms: 'DAILY_CASH' | 'WEEKLY_SETTLEMENT' | 'AFTER_DELIVERY_PAYOUT';
  currentCodBalanceUsd: number;
  unpaidDeliveryFeesUsd: number;
  status: 'ACTIVE' | 'ON_HOLD';
}

interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  type: 'DRIVER' | 'ON_SITE';
  phone: string;
  assignedAsset: string;
  compensationModel: string;
  salaryOrRate: string;
  licenseDetails?: string;
}

interface CustomerComplaintTicket {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  driverName: string;
  category: 'LATE_DELIVERY' | 'DAMAGED_PACKAGE' | 'RUDE_COURIER' | 'PAYMENT_ISSUE';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  reportedAt: string;
  sourceType: 'SOUTHERN_OLIVE' | 'EXTERNAL_3PL';
}

function SuperSonicFleetMasterSuiteContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dispatch';

  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);

  // Modals
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Manual Driver Contribution ("المساهمة")
  const [driverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 20.0,
    'Fadi Abou Assi': 25.0,
    'Hassan Sleiman': 30.0,
    'Ahmad Zein': 10.0,
  });

  // 1. CORRIDORS
  const corridors: CorridorRoute[] = [
    { id: 1, name: 'Corridor 1: Greater Beirut & Connected Coast', schedule: 'Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Khalde ➔ Hadath / Baabda / Dahieh ➔ Beirut City ➔ Metn Coast (Sin El Fil, Dekwaneh, Jdeideh, Jal El Dib)', activeOrdersCount: 14 },
    { id: 2, name: 'Corridor 2: Central & Southern Mount Lebanon', schedule: 'Daily / Near-Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Aramoun / Bchamoun / Qabr Chmoun ➔ Aley / Bhamdoun / Sofar ➔ Upper Chouf (Deir El Qamar, Beiteddine, Baakline, Barouk)', activeOrdersCount: 9 },
    { id: 3, name: 'Corridor 3: Southern Coast & Deep South', schedule: 'Daily', highwayPath: 'Chouf Coast (Damour, Jiyeh) ➔ Saida ➔ Tyre (Sour) ➔ Nabatieh', activeOrdersCount: 12 },
    { id: 4, name: 'Corridor 4: Northern Coast to Batroun', schedule: '3-4 times/week', highwayPath: 'Antelias / Dbayeh ➔ Jounieh / Keserwan ➔ Jbeil (Byblos) ➔ Batroun ➔ Koura', activeOrdersCount: 8 },
    { id: 5, name: 'Corridor 5: Tripoli, Akkar & Dinnieh', schedule: '2-3 times/week', highwayPath: 'Tripoli ➔ Minieh ➔ Zgharta ➔ Dinnieh ➔ Akkar (Halba, Abdeh, Qobayat, Khraybet El Jindi, Menjez)', activeOrdersCount: 6 },
    { id: 6, name: 'Corridor 6: Central, West Bekaa & South-East', schedule: '2-3 times/week', highwayPath: 'Damascus Road (Sofar - Dahr El Baidar) ➔ Chtaura / Zahle ➔ West Bekaa (Joub Jannine) ➔ Rashaya ➔ Hasbaya ➔ Jezzine (via Machghara)', activeOrdersCount: 5 },
    { id: 7, name: 'Corridor 7: North Bekaa - Baalbek Hermel', schedule: '1-2 times/week', highwayPath: 'Rayak ➔ Baalbek ➔ Deir El Ahmar ➔ Labweh ➔ Hermel', activeOrdersCount: 3 },
  ];

  // 2. FLEET VEHICLES
  const [vehicles] = useState<FleetVehicle[]>([
    { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', phone: '03-112233', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 142050, currentKm: 142165, reconciliationClosed: true, batteryPercent: 88, currentSpeedKmH: 48, currentLocationName: 'Beirut - Hamra Main Axis', gpsCoords: '33.8938° N, 35.4802° E', stopsDelivered: 6, stopsTotal: 8 },
    { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', phone: '03-445566', assignedCorridor: 2, status: 'DELIVERING', startKm: 88400, currentKm: 88480, reconciliationClosed: true, batteryPercent: 64, currentSpeedKmH: 20, currentLocationName: 'Aley - Roundabout Center', gpsCoords: '33.7821° N, 35.5901° E', stopsDelivered: 4, stopsTotal: 6 },
    { plate: 'S-772910', category: 'CAR', model: 'Renault Duster 4x4 (Car 01)', driver: 'Hassan Sleiman', phone: '03-778899', assignedCorridor: 3, status: 'ON_ROUTE', startKm: 65120, currentKm: 65205, reconciliationClosed: true, batteryPercent: 92, currentSpeedKmH: 62, currentLocationName: 'Saida - Riad El Solh Highway', gpsCoords: '33.5590° N, 35.3725° E', stopsDelivered: 5, stopsTotal: 7 },
    { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', phone: '03-990011', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 12400, currentKm: 12460, reconciliationClosed: true, batteryPercent: 78, currentSpeedKmH: 35, currentLocationName: 'Dahieh - Hadi Nasrallah', gpsCoords: '33.8540° N, 35.5090° E', stopsDelivered: 3, stopsTotal: 4 },
    { plate: 'B-310928', category: 'VAN', model: 'Toyota HiAce Medium (Van 03)', driver: 'Elie Matar', phone: '03-223344', assignedCorridor: 6, status: 'OFF_DUTY', startKm: 110200, currentKm: 110290, reconciliationClosed: false, batteryPercent: 95, currentSpeedKmH: 0, currentLocationName: 'Chtaura - Square Pin', gpsCoords: '33.8210° N, 35.8520° E', stopsDelivered: 0, stopsTotal: 0, offDutyPin: 'Chtaura Square Pin (33.821° N, 35.852° E)' },
  ]);

  // 3. COMPLETE ORDERS DATASET
  const [orders] = useState<DispatchedOrder[]>([
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
      signatureSvg: 'Imad_Al_Baraka',
      photo1: '17.5L Olive Oil Tin Verified',
      photo2: 'Signed Delivery Receipt #103349',
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
      id: '3PL-88120',
      orderNo: '3PL-88120',
      sourceType: 'EXTERNAL_3PL',
      customerName: 'La Rose Fashion Boutique',
      phone: '01-482910',
      corridorId: 1,
      tripNo: 1,
      destinationTown: 'Metn - Sin El Fil',
      addressDetails: 'Near Habtoor Hotel',
      items: '3x Apparel Dry Goods Packages',
      productAmountLbp: 3150000,
      productAmountUsd: 35.0,
      deliveryFeeUsd: 3.0,
      assignedDriver: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      status: 'DELIVERED',
      deliveredAt: '03-Sep-2026 02:10 PM',
      signatureSvg: 'Mireille_LaRose',
      photo1: 'Apparel Carton at Boutique Door',
      photo2: 'Waybill #88120 Stamped',
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
      addressDetails: 'Daik Wholesale Center',
      items: 'Assorted Preserves + Extra Virgin 1L Glass Cases',
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
  ]);

  // 4. VENDORS
  const [vendors] = useState<SuperSonicVendor[]>([
    { id: 'VND-01', vendorName: 'La Rose Fashion Boutique', contactPerson: 'Mireille K.', phone: '01-482910', businessType: 'Apparel & Fashion', settlementTerms: 'WEEKLY_SETTLEMENT', currentCodBalanceUsd: 850.0, unpaidDeliveryFeesUsd: 75.0, status: 'ACTIVE' },
    { id: 'VND-02', vendorName: 'Apex Electronics Hub', contactPerson: 'Karim Daher', phone: '01-205930', businessType: 'Electronics & Hardware', settlementTerms: 'DAILY_CASH', currentCodBalanceUsd: 1420.0, unpaidDeliveryFeesUsd: 110.0, status: 'ACTIVE' },
    { id: 'VND-03', vendorName: 'Beirut Gourmet Roastery', contactPerson: 'Walid Haddad', phone: '01-741258', businessType: 'Coffee & Nuts', settlementTerms: 'AFTER_DELIVERY_PAYOUT', currentCodBalanceUsd: 320.0, unpaidDeliveryFeesUsd: 28.0, status: 'ACTIVE' },
  ]);

  // 5. STAFF
  const [staffList] = useState<StaffMember[]>([
    { id: 'SS-EMP-01', fullName: 'Tony Khoury', role: 'Lead Van Courier (Corridor 1)', type: 'DRIVER', phone: '03-112233', assignedAsset: 'Toyota HiAce (B-492102)', compensationModel: 'Commission per Run', salaryOrRate: '$4.00 / Stop', licenseDetails: 'DL-9921 (Exp: 2028-11-15)' },
    { id: 'SS-EMP-02', fullName: 'Fadi Abou Assi', role: 'Senior Van Driver (Corridor 2)', type: 'DRIVER', phone: '03-445566', assignedAsset: 'Hyundai H1 (G-183921)', compensationModel: 'Daily Shift Rate', salaryOrRate: '$35.00 / Day', licenseDetails: 'DL-7412 (Exp: 2027-06-30)' },
    { id: 'SS-EMP-03', fullName: 'Ahmad Zein', role: 'Motorcycle Courier (Fast Runs)', type: 'DRIVER', phone: '03-990011', assignedAsset: 'Honda Cargo 250 (M-102941)', compensationModel: 'Commission', salaryOrRate: '$2.50 / Stop', licenseDetails: 'DL-3310 (Exp: 2029-01-20)' },
    { id: 'SS-EMP-04', fullName: 'Rami Al-Hajj', role: 'SuperSonic Operations Manager', type: 'ON_SITE', phone: '03-889911', assignedAsset: 'Central Hub Dispatch Office', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,800.00 / Month' },
    { id: 'SS-EMP-05', fullName: 'Samer Kassir', role: 'Fleet Controller & Dispatcher', type: 'ON_SITE', phone: '03-662244', assignedAsset: 'Dispatch Desk 01', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,100.00 / Month' },
    { id: 'SS-EMP-06', fullName: 'Layla Bazzi', role: 'SuperSonic Fleet Accountant', type: 'ON_SITE', phone: '03-551122', assignedAsset: 'Settlements & Treasury Desk', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,200.00 / Month' },
  ]);

  // 6. COMPLAINTS & REVIEWS
  const [complaints] = useState<CustomerComplaintTicket[]>([
    { id: 'CMP-104', orderNo: 'ORD-103349', customerName: 'Al-Baraka Supermarket', phone: '01-745890', driverName: 'Tony Khoury', category: 'LATE_DELIVERY', description: 'Driver was delayed by 45 minutes due to Khalde highway congestion.', status: 'RESOLVED', reportedAt: 'Today 02:40 PM', sourceType: 'SOUTHERN_OLIVE' },
    { id: 'CMP-105', orderNo: '3PL-88125', customerName: 'Apex Electronics Client', phone: '03-221144', driverName: 'Tony Khoury', category: 'PAYMENT_ISSUE', description: 'Customer disputed LBP exchange rate on Whish transfer.', status: 'INVESTIGATING', reportedAt: 'Today 04:15 PM', sourceType: 'EXTERNAL_3PL' },
  ]);

  // 7. WHISH AUDIT
  const [whishSubmissions, setWhishSubmissions] = useState([
    { id: 'WSH-0091', driverName: 'Tony Khoury', vehiclePlate: 'B-492102', amountUsd: 200.0, whishRefNo: 'WHISH-TX-9988124', submittedAt: 'Today 04:15 PM', status: 'PENDING_APPROVAL' },
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
              {activeTab === '3pl-orders' && 'SuperSonic 3PL Commercial Orders'}
              {activeTab === 'vendors' && 'SuperSonic Vendor & Merchant Accounts'}
              {activeTab === 'accounting' && 'SuperSonic Independent Accounting & Finance'}
              {activeTab === 'hr' && 'SuperSonic HR & Staff Registry'}
              {activeTab === 'complaints' && 'Customer Complaints & Service Quality'}
              {activeTab === 'settlements' && 'COD, Whish & Driver Daily Reconciliation (A4 / PDF / CSV)'}
              {activeTab === 'radar' && 'Live Fleet Radar & GPS Telemetry'}
              {activeTab === 'pod' && 'Proof of Delivery (POD) Archives'}
              {activeTab === 'vehicles' && 'Fleet Vehicles & Odometer Log'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SuperSonic Central Logistics Hub (Choueifat Gateway) — Southern Olive Oil Products S.A.R.L
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => alert('🚀 Push Successful! Net product sales staged for Southern Olive Oil CFO Inbox.')}
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

      {/* =================================================================== */}
      {/* 1. DISPATCH: 7 CORRIDORS & COMBINED RUNS                            */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {corridors.map((c) => (
              <div key={c.id} className="p-3 rounded-xl border bg-white border-slate-200 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#1e3a2b] text-white">Corridor {c.id}</span>
                  <span className="text-[10px] font-mono text-slate-500">{c.schedule}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1.5 leading-tight">{c.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{c.highwayPath}</p>
                <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between items-center text-[10.5px] font-mono">
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
                <p className="text-[11px] text-slate-400">Merged packages leaving Choueifat Hub by highway corridor and trips.</p>
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
      {/* 2. SOUTHERN OLIVE ORDERS (IN-HOUSE DEDICATED)                       */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Southern Olive Oil Products S.A.R.L Dedicated Inflow</h3>
          <p className="text-[11px] text-slate-400">Orders integrated with sales rep accounts and live warehouse stock reservation.</p>
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">destination</th>
                  <th className="py-2.5 px-3 normal-case">items checklist</th>
                  <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                  <th className="py-2.5 px-3 normal-case">originating rep</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.sourceType === 'SOUTHERN_OLIVE').map(o => (
                  <tr key={o.id} className={o.status === 'MOVED_TO_POS_PICKUP' ? 'bg-purple-50/40 text-slate-500' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{o.phone}</td>
                    <td className="py-2.5 px-3 text-slate-700">{o.destinationTown}</td>
                    <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd}`}
                    </td>
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
      {/* 3. SUPERSONIC 3PL ORDERS (MANUAL ENTRY & EXTERNAL MERCHANTS)        */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
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
                  <th className="py-2.5 px-3 normal-case text-right">cod cash ($)</th>
                  <th className="py-2.5 px-3 normal-case text-right">delivery fee</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.sourceType === 'EXTERNAL_3PL').map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
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
      {/* 4. VENDORS & MERCHANTS MANAGEMENT                                   */}
      {/* =================================================================== */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered 3PL Merchants & Settlement Terms</h3>
              <p className="text-[11px] text-slate-400">Manage external businesses shipping through SuperSonic. Configure daily/weekly remittance agreements.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVendorModal(true)}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>➕ Add New Vendor / Merchant</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">vendor id</th>
                  <th className="py-2.5 px-3 normal-case">merchant name</th>
                  <th className="py-2.5 px-3 normal-case">contact & phone</th>
                  <th className="py-2.5 px-3 normal-case">category</th>
                  <th className="py-2.5 px-3 normal-case">settlement agreement</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod in hand ($)</th>
                  <th className="py-2.5 px-3 normal-case text-right">unpaid delivery ($)</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{v.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{v.vendorName}</td>
                    <td className="py-2.5 px-3">{v.contactPerson} ({v.phone})</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.businessType}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-800">{v.settlementTerms}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">${v.currentCodBalanceUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${v.unpaidDeliveryFeesUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. SUPERSONIC ACCOUNTING & FINANCE                                  */}
      {/* =================================================================== */}
      {activeTab === 'accounting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">SuperSonic Delivery Revenue</span>
              <span className="text-xl font-extrabold text-blue-800">$1,840.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Delivery fees profit</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Total COD in Vault</span>
              <span className="text-xl font-extrabold text-emerald-700">$12,450.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Awaiting merchant payout</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Whish Wallet Balance</span>
              <span className="text-xl font-extrabold text-purple-800">$3,210.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Verified mobile receipts</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Fuel & Expenses</span>
              <span className="text-xl font-extrabold text-rose-700">-$410.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Diesel & maintenance</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Corporate Accounting Isolation Note</h3>
            <p className="text-slate-600 leading-relaxed">
              SuperSonic Delivery operates as an independent logistics profit center. All fuel costs, vehicle depreciation, and 3PL merchant settlements are contained inside this ledger. Only verified net product revenue from Southern Olive Oil Products S.A.R.L is staged for push to the parent ERP.
            </p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. SUPERSONIC HR & STAFF REGISTRY                                   */}
      {/* =================================================================== */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic Personnel Roster (Drivers & On-Site Personnel)</h3>
              <p className="text-[11px] text-slate-400">Strictly isolated from olive press factory personnel. On-site staff, fleet controllers, and field couriers.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>➕ Add New Staff / Driver</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">staff id</th>
                  <th className="py-2.5 px-3 normal-case">full name</th>
                  <th className="py-2.5 px-3 normal-case">role & title</th>
                  <th className="py-2.5 px-3 normal-case">classification</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">assigned asset</th>
                  <th className="py-2.5 px-3 normal-case">compensation</th>
                  <th className="py-2.5 px-3 normal-case text-right">rate / salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.id}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1e3a2b]">{s.fullName}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.role}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.type === 'DRIVER' ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{s.phone}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{s.assignedAsset}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.compensationModel}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{s.salaryOrRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. CUSTOMER COMPLAINTS & REVIEWS                                    */}
      {/* =================================================================== */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Customer Complaints & 1-Hour Automated Review Feed</h3>
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">ticket id</th>
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer & phone</th>
                  <th className="py-2.5 px-3 normal-case">courier</th>
                  <th className="py-2.5 px-3 normal-case">issue category</th>
                  <th className="py-2.5 px-3 normal-case">customer comment</th>
                  <th className="py-2.5 px-3 normal-case">timestamp</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{c.id}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.customerName} ({c.phone})</td>
                    <td className="py-2.5 px-3 text-slate-800">{c.driverName}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-bold text-[10px]">{c.category}</span></td>
                    <td className="py-2.5 px-3 text-slate-600 italic">"{c.description}"</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{c.reportedAt}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {c.status}
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
      {/* 8. SETTLEMENTS & MASTER A4 RECONCILIATION REPORT                    */}
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
            <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs">
              🖨️ Print A4 Report
            </button>
          </div>

          {/* Pending Whish Submissions Audit Table */}
          {whishSubmissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-base">📱</span>
                  <h3 className="font-bold text-slate-900 text-xs">Pending Whish Money Verification & Approvals</h3>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-[10px] rounded-full">
                  1 Pending Approval
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-purple-50/50 border-b border-slate-200 text-slate-700 font-bold text-[10.5px]">
                      <th className="py-2 px-3 normal-case">submission id</th>
                      <th className="py-2 px-3 normal-case">driver / courier</th>
                      <th className="py-2 px-3 normal-case">vehicle</th>
                      <th className="py-2 px-3 normal-case text-right">whish amount</th>
                      <th className="py-2 px-3 normal-case">whish reference no</th>
                      <th className="py-2 px-3 normal-case">timestamp</th>
                      <th className="py-2 px-3 normal-case text-center">action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-medium text-slate-800">
                    {whishSubmissions.map((w) => (
                      <tr key={w.id} className="hover:bg-purple-50/30">
                        <td className="py-2 px-3 font-mono font-bold text-purple-900">{w.id}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{w.driverName}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{w.vehiclePlate}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-purple-900">${w.amountUsd.toFixed(2)}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 font-semibold">{w.whishRefNo}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{w.submittedAt}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`✓ Whish Transfer #${w.whishRefNo} approved and credited to vault!`);
                              setWhishSubmissions(whishSubmissions.filter((x) => x.id !== w.id));
                            }}
                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[10px] font-bold"
                          >
                            Approve & Clear to Vault
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                  <tr>
                    <td className="py-1 px-1 font-bold border-r border-black">Trip 2</td>
                    <td className="py-1 px-1 font-sans border-r border-black">Corridor 2: Chouf & Aley</td>
                    <td className="py-1 px-1 text-center border-r border-black">4/4</td>
                    <td className="py-1 px-1 text-right border-r border-black">$210.00</td>
                    <td className="py-1 px-1 text-right font-bold border-r border-black">$110.00</td>
                    <td className="py-1 px-1 text-right font-bold text-purple-900">$100.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="border border-black rounded p-3 text-xs font-mono space-y-1 bg-slate-50">
                <div className="flex justify-between items-center text-blue-900 font-bold">
                  <span>Driver Contribution Allowance (المساهمة):</span>
                  <span>+${driverContributions[currentReportVehicle.driver] || 0}.00</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-black text-sm font-bold text-slate-900">
                  <span>Net Cash Handed Over to SuperSonic Vault:</span>
                  <span>$360.00 USD Cash + 9,000,000 LBP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. INTERACTIVE RADAR (CLICKABLE CARDS + ROUTE PROGRESS)             */}
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
      {/* 10. PROOF OF DELIVERY (POD) ARCHIVES (WITH SIGNATURE & PHOTOS)     */}
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
      {/* 11. VEHICLES & ODOMETER LOG                                         */}
      {/* =================================================================== */}
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
                {v.offDutyPin && (
                  <div className="text-rose-700 text-[10.5px] pt-1 border-t border-slate-200">
                    📍 Off-Duty Pin: {v.offDutyPin}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic 3PL Vendor</h3>
            <div><label className="font-bold block mb-1">Merchant / Store Name:</label><input type="text" placeholder="e.g. Beirut Gourmet Boutique" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Contact Person & Phone:</label><input type="text" placeholder="e.g. Walid Haddad (03-741258)" className="w-full p-2 border rounded-xl" /></div>
            <div>
              <label className="font-bold block mb-1">Settlement Agreement:</label>
              <select className="w-full p-2 border rounded-xl">
                <option value="DAILY_CASH">Daily Cash Remittance</option>
                <option value="WEEKLY_SETTLEMENT">Weekly Settlement (Every Monday)</option>
                <option value="AFTER_DELIVERY_PAYOUT">Payout After Successful Delivery</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ New vendor onboarded!'); setShowAddVendorModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save Vendor</button>
              <button type="button" onClick={() => setShowAddVendorModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic Staff Member</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setNewStaffType('DRIVER')} className={`flex-1 py-2 rounded-xl border font-bold ${newStaffType === 'DRIVER' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>Driver</button>
              <button type="button" onClick={() => setNewStaffType('ON_SITE')} className={`flex-1 py-2 rounded-xl border font-bold ${newStaffType === 'ON_SITE' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>On-Site Personnel</button>
            </div>
            <div><label className="font-bold block mb-1">Full Name:</label><input type="text" placeholder="e.g. Jad Mansour" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Phone Number:</label><input type="text" placeholder="e.g. 03-334455" className="w-full p-2 border rounded-xl" /></div>
            {newStaffType === 'ON_SITE' && (
              <div>
                <label className="font-bold block mb-1">Role Title:</label>
                <select className="w-full p-2 border rounded-xl">
                  <option value="MANAGER">SuperSonic Operations Manager</option>
                  <option value="ACCOUNTANT">Fleet Accountant</option>
                  <option value="DISPATCHER">Fleet Controller / Dispatcher</option>
                  <option value="SORTER">Warehouse Loading Sorter</option>
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Staff member added!'); setShowAddStaffModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Create Profile</button>
              <button type="button" onClick={() => setShowAddStaffModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAdd3PLModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Commercial Order</h3>
            <div><label className="font-bold block mb-1">Merchant / Sender Name:</label><input type="text" placeholder="e.g. Apex Electronics Hub" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Customer / Recipient & Phone:</label><input type="text" placeholder="e.g. Karim Daher (03-221144)" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Destination & Address:</label><input type="text" placeholder="e.g. Beirut - Achrafieh, Sassine" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">COD Amount ($ USD):</label><input type="number" placeholder="50.00" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Delivery Fee ($ USD):</label><input type="number" placeholder="4.00" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ 3PL Order Created & Dispatched!'); setShowAdd3PLModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Dispatch 3PL Order</button>
              <button type="button" onClick={() => setShowAdd3PLModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedVehicleForTelemetry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">{selectedVehicleForTelemetry.driver} ({selectedVehicleForTelemetry.model})</h3>
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="font-bold">✕</button>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border font-mono space-y-1">
              <div>Speed: <strong>{selectedVehicleForTelemetry.currentSpeedKmH} KM/H</strong> | Battery: <strong>{selectedVehicleForTelemetry.batteryPercent}% 🔋</strong></div>
              <div>Location: <strong>{selectedVehicleForTelemetry.currentLocationName}</strong></div>
              <div>Completed Stops: <strong>{selectedVehicleForTelemetry.stopsDelivered} / {selectedVehicleForTelemetry.stopsTotal}</strong></div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="px-4 py-1.5 bg-slate-200 font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedPodOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Verified Proof of Delivery — #{selectedPodOrder.orderNo}</h3>
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="font-bold">✕</button>
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
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="px-4 py-1.5 bg-slate-200 font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SuperSonicFleetMasterSuitePage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500 font-mono">Loading SuperSonic Fleet Suite...</div>}>
      <SuperSonicFleetMasterSuiteContent />
    </Suspense>
  );
}
