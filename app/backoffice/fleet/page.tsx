'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ============================================================================
// COMPLETE 11-SECTION SUPERSONIC FLEET & 3PL ENTERPRISE ENGINE
// TENANT: Southern Olive Oil Products S.A.R.L (00001)
// ============================================================================

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
}

function SuperSonicFleetMasterSuiteContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dispatch';

  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);

  // Modals
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');

  // 1. Vendors Master State
  const [vendors, setVendors] = useState<SuperSonicVendor[]>([
    { id: 'VND-01', vendorName: 'La Rose Fashion Boutique', contactPerson: 'Mireille K.', phone: '01-482910', businessType: 'Apparel & Fashion', settlementTerms: 'WEEKLY_SETTLEMENT', currentCodBalanceUsd: 850.0, unpaidDeliveryFeesUsd: 75.0, status: 'ACTIVE' },
    { id: 'VND-02', vendorName: 'Apex Electronics Hub', contactPerson: 'Karim Daher', phone: '01-205930', businessType: 'Electronics & Mobile', settlementTerms: 'DAILY_CASH', currentCodBalanceUsd: 1420.0, unpaidDeliveryFeesUsd: 110.0, status: 'ACTIVE' },
    { id: 'VND-03', vendorName: 'Beirut Gourmet Roastery', contactPerson: 'Walid Haddad', phone: '01-741258', businessType: 'Coffee & Nuts', settlementTerms: 'AFTER_DELIVERY_PAYOUT', currentCodBalanceUsd: 320.0, unpaidDeliveryFeesUsd: 28.0, status: 'ACTIVE' },
  ]);

  // 2. SuperSonic Dedicated Staff State
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: 'SS-EMP-01', fullName: 'Tony Khoury', role: 'Lead Van Courier (Corridor 1)', type: 'DRIVER', phone: '03-112233', assignedAsset: 'Toyota HiAce (B-492102)', compensationModel: 'Commission per Run', salaryOrRate: '$4.00 / Delivered Order' },
    { id: 'SS-EMP-02', fullName: 'Fadi Abou Assi', role: 'Senior Van Driver (Corridor 2)', type: 'DRIVER', phone: '03-445566', assignedAsset: 'Hyundai H1 (G-183921)', compensationModel: 'Daily Shift Rate', salaryOrRate: '$35.00 / Day' },
    { id: 'SS-EMP-03', fullName: 'Ahmad Zein', role: 'Motorcycle Courier (Beirut Fast)', type: 'DRIVER', phone: '03-990011', assignedAsset: 'Honda Cargo 250 (M-102941)', compensationModel: 'Commission', salaryOrRate: '$2.50 / Stop' },
    { id: 'SS-EMP-04', fullName: 'Rami Al-Hajj', role: 'SuperSonic Operations Manager', type: 'ON_SITE', phone: '03-889911', assignedAsset: 'Central Hub Dispatch Office', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,800.00 / Month' },
    { id: 'SS-EMP-05', fullName: 'Samer Kassir', role: 'Fleet Controller & Dispatcher', type: 'ON_SITE', phone: '03-662244', assignedAsset: 'Dispatch Desk 01', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,100.00 / Month' },
    { id: 'SS-EMP-06', fullName: 'Layla Bazzi', role: 'SuperSonic Fleet Accountant', type: 'ON_SITE', phone: '03-551122', assignedAsset: 'Settlements & Treasury Desk', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,200.00 / Month' },
  ]);

  // 3. Complaints State
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>([
    { id: 'CMP-104', orderNo: 'ORD-103349', customerName: 'Al-Baraka Supermarket', phone: '01-745890', driverName: 'Tony Khoury', category: 'LATE_DELIVERY', description: 'Driver was delayed by 45 minutes due to Khalde traffic.', status: 'RESOLVED', reportedAt: 'Today 02:40 PM' },
    { id: 'CMP-105', orderNo: '3PL-88125', customerName: 'Apex Electronics Client', phone: '03-221144', driverName: 'Tony Khoury', category: 'PAYMENT_ISSUE', description: 'Customer disputed LBP exchange rate on Whish.', status: 'INVESTIGATING', reportedAt: 'Today 04:15 PM' },
  ]);

  // Vehicles
  const [vehicles] = useState<FleetVehicle[]>([
    { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', phone: '03-112233', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 142050, currentKm: 142165, reconciliationClosed: true, batteryPercent: 88, currentSpeedKmH: 48, currentLocationName: 'Beirut - Hamra Main Axis', gpsCoords: '33.8938° N, 35.4802° E', stopsDelivered: 6, stopsTotal: 8 },
    { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', phone: '03-445566', assignedCorridor: 2, status: 'DELIVERING', startKm: 88400, currentKm: 88480, reconciliationClosed: true, batteryPercent: 64, currentSpeedKmH: 20, currentLocationName: 'Aley - Roundabout Center', gpsCoords: '33.7821° N, 35.5901° E', stopsDelivered: 4, stopsTotal: 6 },
    { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', phone: '03-990011', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 12400, currentKm: 12460, reconciliationClosed: true, batteryPercent: 78, currentSpeedKmH: 35, currentLocationName: 'Dahieh - Hadi Nasrallah', gpsCoords: '33.8540° N, 35.5090° E', stopsDelivered: 3, stopsTotal: 4 },
  ]);

  // Orders
  const [orders] = useState<DispatchedOrder[]>([
    { id: 'ORD-103349', orderNo: 'ORD-103349', sourceType: 'SOUTHERN_OLIVE', customerName: 'Al-Baraka Supermarket S.A.R.L', phone: '01-745890', corridorId: 1, tripNo: 1, destinationTown: 'Beirut - Hamra', addressDetails: 'Makdessi St, Bldg 14', items: '1x 17.5L Extra Virgin Tin + 2x Pickled Olives', productAmountLbp: 9000000, productAmountUsd: 100.0, deliveryFeeUsd: 4.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', repName: 'Ahmad Ali Kassem (REP-002)', deliveredAt: '03-Sep-2026 01:25 PM', signatureSvg: 'Imad_Al_Baraka' },
    { id: 'ORD-103350', orderNo: 'ORD-103350', sourceType: 'SOUTHERN_OLIVE', customerName: 'Colonel Mahmoud Abboud', phone: '03-556677', corridorId: 2, tripNo: 0, destinationTown: 'Choueifat Showroom', addressDetails: 'Showroom Pickup Counter', items: '30x 17.5L Extra Virgin Bulk Tins', productAmountLbp: 248400000, productAmountUsd: 2760.0, deliveryFeeUsd: 0.0, assignedDriver: '-', vehiclePlate: '-', status: 'MOVED_TO_POS_PICKUP', repName: 'Hiba Aloulou (REP-004)' },
    { id: '3PL-88120', orderNo: '3PL-88120', sourceType: 'EXTERNAL_3PL', customerName: 'La Rose Fashion Boutique', phone: '01-482910', corridorId: 1, tripNo: 1, destinationTown: 'Metn - Sin El Fil', addressDetails: 'Near Habtoor Hotel', items: '3x Apparel Packages', productAmountLbp: 3150000, productAmountUsd: 35.0, deliveryFeeUsd: 3.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', deliveredAt: '03-Sep-2026 02:10 PM', signatureSvg: 'Mireille_LaRose' },
  ]);

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-12">
      
      {/* TOP BAR */}
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
              {activeTab === 'settlements' && 'COD, Whish & Settlements'}
              {activeTab === 'radar' && 'Live Fleet Radar & GPS Telemetry'}
              {activeTab === 'pod' && 'Proof of Delivery (POD) Archives'}
              {activeTab === 'vehicles' && 'Vehicles & Odometer Log'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SuperSonic Central Logistics Hub (Choueifat Gateway) — Independent 3PL Division & In-House Fulfillment.
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
      {/* 1. VENDOR & MERCHANT ACCOUNTS (ADD VENDOR & PAYMENT TERMS)          */}
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
      {/* 2. SUPERSONIC INDEPENDENT ACCOUNTING & FINANCE                     */}
      {/* =================================================================== */}
      {activeTab === 'accounting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">SuperSonic Delivery Revenue</span>
              <span className="text-xl font-extrabold text-blue-800">$1,840.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Clean delivery margins</span>
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
      {/* 3. SUPERSONIC HR & DEDICATED LOGISTICS PERSONNEL REGISTRY          */}
      {/* =================================================================== */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic Personnel Roster (Drivers, Dispatchers & Management)</h3>
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
      {/* 4. CUSTOMER COMPLAINTS & 1-HOUR REVIEWS                            */}
      {/* =================================================================== */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Complaints & Automated Service Feedback</h3>
              <p className="text-[11px] text-slate-400">Tickets generated from 1-hour automated WhatsApp post-delivery review links.</p>
            </div>
          </div>

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
      {/* 5. OTHER TABS (DISPATCH, SOUTHERN OLIVE, 3PL, RADAR, POD, VEHICLES) */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">7 Corridors Master Dispatch Manifest</h3>
            <button type="button" onClick={() => window.print()} className="px-3 py-1.5 bg-[#1e3a2b] text-white rounded-lg text-xs font-bold">
              🖨️ Print Assigned Route Manifest A4
            </button>
          </div>
          <div className="text-xs text-slate-600">All 7 corridors leaving Choueifat Hub ready for daily co-loading.</div>
        </div>
      )}

      {activeTab === 'southern-olive' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Southern Olive Oil Products S.A.R.L Dedicated Inflow</h3>
          <div className="text-xs text-slate-600">Live feed connected to sales rep accounts with instant stock reservation.</div>
        </div>
      )}

      {activeTab === '3pl-orders' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">SuperSonic 3PL Commercial Orders</h3>
          <div className="text-xs text-slate-600">Manual merchant shipments with delivery fee isolation.</div>
        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">COD, Whish & Driver Daily Reconciliation</h3>
          <div className="text-xs text-slate-600">Printable A4 report and Whish approval engine.</div>
        </div>
      )}

      {activeTab === 'radar' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Interactive Fleet Radar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {vehicles.map((v) => (
              <div
                key={v.plate}
                onClick={() => setSelectedVehicleForTelemetry(v)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer text-xs"
              >
                <div className="flex justify-between font-bold"><span>{v.model}</span><span className="text-blue-700">{v.currentSpeedKmH} KM/H</span></div>
                <div className="text-slate-600 mt-1">Driver: <strong>{v.driver}</strong></div>
                <div className="text-emerald-700 font-bold mt-1">Click to view route progress ➔</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pod' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Proof of Delivery (POD) Archive</h3>
          <div className="text-xs text-slate-600">Verified digital signatures and camera photo attachments.</div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Vehicles & Odometer Log</h3>
          <div className="text-xs text-slate-600">Fleet maintenance intervals and daily roundtrip distance.</div>
        </div>
      )}

      {/* MODAL 1: ADD VENDOR */}
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

      {/* MODAL 2: ADD STAFF */}
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

      {/* MODAL 3: TELEMETRY & ROUTE PROGRESS */}
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
