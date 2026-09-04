'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FleetVehicle,
  DispatchedOrder,
  SuperSonicVendor,
  StaffMember,
  CustomerComplaintTicket,
  initialCorridors,
  initialVehicles,
  initialOrders,
  initialVendors,
  initialStaff,
  initialComplaints,
  initialLedger,
} from './fleet-data';

function SuperSonicFleetContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dispatch';

  // State
  const [corridors] = useState(initialCorridors);
  const [vehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [orders, setOrders] = useState<DispatchedOrder[]>(initialOrders);
  const [vendors, setVendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(initialComplaints);
  const [ledger] = useState(initialLedger);

  // Filters & Selected Drivers
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');

  // Modals State
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedOrderForReroute, setSelectedOrderForReroute] = useState<DispatchedOrder | null>(null);
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CustomerComplaintTicket | null>(null);
  const [complaintResolutionInput, setComplaintResolutionInput] = useState('');
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);

  // Manual Creation Modals
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');
  const [newStaffOwnership, setNewStaffOwnership] = useState<'COMPANY_FLEET' | 'OWN_VEHICLE'>('COMPANY_FLEET');
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Driver Allowance Contributions ("المساهمة")
  const [driverContributions] = useState<Record<string, number>>({
    'Tony Khoury': 20.0,
    'Fadi Abou Assi': 25.0,
    'Hassan Sleiman': 30.0,
    'Ahmad Zein': 10.0,
  });

  // Actions
  const handleUpdateDeliveryFee = (orderId: string, newFee: number) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, deliveryFeeUsd: newFee } : o)));
  };

  const handleExecuteReroute = (targetCorridorId: number) => {
    if (!selectedOrderForReroute) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderForReroute.id ? { ...o, corridorId: targetCorridorId } : o))
    );
    alert(`✓ Order #${selectedOrderForReroute.orderNo} transferred to Corridor ${targetCorridorId}!`);
    setSelectedOrderForReroute(null);
  };

  const handleResolveComplaint = () => {
    if (!selectedComplaintForAction) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selectedComplaintForAction.id
          ? { ...c, status: 'RESOLVED', resolutionNotes: complaintResolutionInput }
          : c
      )
    );
    alert(`✓ Ticket #${selectedComplaintForAction.id} marked as RESOLVED!`);
    setSelectedComplaintForAction(null);
    setComplaintResolutionInput('');
  };

  const handlePushToFinancial = () => {
    alert('🚀 Push Successful!\nNet Southern Olive goods revenue pushed to CFO Inbox (/backoffice/inbox).\nSuperSonic delivery fees and driver earnings remain securely isolated.');
  };

  const handleExportCSV = (driverName: string) => {
    const d = vehicles.find((v) => v.driver === driverName);
    if (!d) return;
    let csv = `\uFEFFCompany,SuperSonic Delivery Fleet & Logistics\nAffiliation,Southern Olive Oil Products S.A.R.L\nDriver,${d.driver}\nDate,03-Sep-2026\nOdometer,${d.startKm} to ${d.currentKm} KM\nAllowance (المساهمة),+$${driverContributions[d.driver] || 0}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SuperSonic_Settlement_${driverName.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-12">
      
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

      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-b border-slate-200 pb-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              {activeTab === 'dispatch' && '7 Corridors & Regional Dispatch'}
              {activeTab === 'southern-olive' && 'Southern Olive Oil In-House Orders (By Path)'}
              {activeTab === '3pl-orders' && 'SuperSonic 3PL Commercial Orders (By Path)'}
              {activeTab === 'vendors' && 'SuperSonic 3PL Merchant Accounts'}
              {activeTab === 'accounting' && 'SuperSonic Independent Accounting & Ledger'}
              {activeTab === 'hr' && 'SuperSonic Staff & Driver Roster'}
              {activeTab === 'complaints' && 'Customer Complaints & Service Quality'}
              {activeTab === 'settlements' && 'Driver Trips Master Reconciliation (A4 / PDF / CSV)'}
              {activeTab === 'radar' && 'Live Fleet Radar & Driver Phone Mirroring'}
              {activeTab === 'pod' && 'Proof of Delivery (POD) Archives'}
              {activeTab === 'vehicles' && 'Company Fleet & Odometer Asset Log'}
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

      {/* =================================================================== */}
      {/* 1. DISPATCH WORKSPACE (CORRIDORS + DRILL-DOWN + RE-ROUTING)         */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {corridors.map((c) => {
              const count = orders.filter((o) => o.corridorId === c.id).length;
              const isSelected = selectedCorridorFilter === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCorridorFilter(isSelected ? 'ALL' : c.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#edf2ee] border-[#1e3a2b] ring-2 ring-[#1e3a2b]/30 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#1e3a2b] text-white">Corridor {c.id}</span>
                    <span className="text-[10px] font-mono text-slate-500">{c.schedule}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1.5 leading-tight">{c.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{c.highwayPath}</p>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between items-center text-[10.5px] font-mono">
                    <span className="text-slate-500">Active Packages:</span>
                    <strong className="text-[#1e3a2b]">{count} pkgs</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedCorridorFilter === 'ALL' ? "All 7 Corridors Today's Assigned Runs" : `Corridor ${selectedCorridorFilter} Assigned Runs`}
                </h3>
                <p className="text-[11px] text-slate-400">Click "Move Corridor" on any order to reassign lines dynamically.</p>
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
                    <th className="py-2.5 px-3 normal-case text-center">actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                  {orders
                    .filter((o) => selectedCorridorFilter === 'ALL' || o.corridorId === selectedCorridorFilter)
                    .map((order) => (
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
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          ${order.deliveryFeeUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {order.vehiclePlate !== '-' ? `${order.vehiclePlate} (${order.assignedDriver})` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {order.status === 'MOVED_TO_POS_PICKUP' ? (
                            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px]">
                              🏪 Moved to POS Pickup
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForReroute(order)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#1e3a2b] hover:text-white text-slate-700 rounded text-[10.5px] font-bold border border-slate-300 transition-colors"
                            >
                              🔄 Move Corridor
                            </button>
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
      {/* 2. SOUTHERN OLIVE ORDERS (ORGANIZED BY CORRIDOR PATH)               */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="space-y-4">
          {corridors.map((c) => {
            const corridorOrders = orders.filter((o) => o.sourceType === 'SOUTHERN_OLIVE' && o.corridorId === c.id);
            if (corridorOrders.length === 0) return null;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#1e3a2b]">{c.name} (By Path)</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{c.highwayPath}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">{corridorOrders.length} In-House Orders</span>
                </div>

                <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                        <th className="py-2 px-3 normal-case">order no.</th>
                        <th className="py-2 px-3 normal-case">customer</th>
                        <th className="py-2 px-3 normal-case">destination</th>
                        <th className="py-2 px-3 normal-case">items & packaging</th>
                        <th className="py-2 px-3 normal-case text-right">goods value</th>
                        <th className="py-2 px-3 normal-case">originating rep</th>
                        <th className="py-2 px-3 normal-case text-center">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                      {corridorOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{o.customerName}</td>
                          <td className="py-2 px-3 text-slate-600">{o.destinationTown}</td>
                          <td className="py-2 px-3 text-slate-800">{o.items}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd}`}
                          </td>
                          <td className="py-2 px-3 text-purple-800 font-semibold">{o.repName}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. SUPERSONIC 3PL ORDERS (BY PATH + EDITABLE FEES)                  */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between items-center">
            <span>💡 <strong>3PL Path Management:</strong> All merchant packages grouped by route. Delivery fees can be edited manually per package.</span>
            <button
              type="button"
              onClick={() => setShowAdd3PLModal(true)}
              className="px-3 py-1.5 bg-[#1e3a2b] text-white rounded-lg font-bold shadow-xs"
            >
              ➕ Add 3PL Package
            </button>
          </div>

          {corridors.map((c) => {
            const corridor3pl = orders.filter((o) => o.sourceType === 'EXTERNAL_3PL' && o.corridorId === c.id);
            if (corridor3pl.length === 0) return null;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">{c.name} — 3PL Cargo (By Path)</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{c.highwayPath}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">{corridor3pl.length} Merchant Shipments</span>
                </div>

                <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                        <th className="py-2 px-3 normal-case">waybill #</th>
                        <th className="py-2 px-3 normal-case">merchant</th>
                        <th className="py-2 px-3 normal-case">recipient & town</th>
                        <th className="py-2 px-3 normal-case">package cargo</th>
                        <th className="py-2 px-3 normal-case text-right">cod amount ($)</th>
                        <th className="py-2 px-3 normal-case text-center">delivery fee ($) [editable]</th>
                        <th className="py-2 px-3 normal-case text-center">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                      {corridor3pl.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{o.customerName}</td>
                          <td className="py-2 px-3">{o.destinationTown}</td>
                          <td className="py-2 px-3 text-slate-800">{o.items}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              value={o.deliveryFeeUsd}
                              onChange={(e) => handleUpdateDeliveryFee(o.id, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-center font-mono font-bold text-blue-700 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. VENDORS & MERCHANTS MANAGEMENT                                   */}
      {/* =================================================================== */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">3PL Merchant Accounts & Remittance Agreements</h3>
              <p className="text-[11px] text-slate-400">Contracts, settlement frequencies, and pending COD balances.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVendorModal(true)}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-xs"
            >
              ➕ Add New Vendor
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
                  <th className="py-2.5 px-3 normal-case text-right">cod in vault ($)</th>
                  <th className="py-2.5 px-3 normal-case text-right">unpaid delivery fees ($)</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{v.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{v.vendorName}</td>
                    <td className="py-2.5 px-3">{v.contactPerson} ({v.phone})</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.businessType}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-800">{v.settlementTerms}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">${v.currentCodBalanceUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">${v.unpaidDeliveryFeesUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. SUPERSONIC FINANCIAL LEDGER & REVENUE JOURNAL                    */}
      {/* =================================================================== */}
      {activeTab === 'accounting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SuperSonic Delivery Revenue</span>
              <span className="text-xl font-extrabold text-blue-800">$1,840.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Clean delivery margins</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total COD in Vault</span>
              <span className="text-xl font-extrabold text-emerald-700">$12,450.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Awaiting merchant payout</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Whish Wallet Balance</span>
              <span className="text-xl font-extrabold text-purple-800">$3,210.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Verified mobile receipts</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Fuel & Expenses</span>
              <span className="text-xl font-extrabold text-rose-700">-$410.00 USD</span>
              <span className="text-[10px] text-slate-500 block">Diesel & maintenance</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">SuperSonic Operational Accounting General Journal</h3>
            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2.5 px-3 normal-case">transaction id</th>
                    <th className="py-2.5 px-3 normal-case">timestamp</th>
                    <th className="py-2.5 px-3 normal-case">description & details</th>
                    <th className="py-2.5 px-3 normal-case">entry type</th>
                    <th className="py-2.5 px-3 normal-case">account / ledger</th>
                    <th className="py-2.5 px-3 normal-case text-right">amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{tx.id}</td>
                      <td className="py-2 px-3 text-slate-600">{tx.date}</td>
                      <td className="py-2 px-3 font-sans text-slate-800 font-medium">{tx.description}</td>
                      <td className="py-2 px-3"><span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-800">{tx.type}</span></td>
                      <td className="py-2 px-3 font-sans text-slate-600">{tx.account}</td>
                      <td className={`py-2 px-3 text-right font-bold ${tx.amountUsd >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {tx.amountUsd >= 0 ? `+$${tx.amountUsd.toFixed(2)}` : `-$${Math.abs(tx.amountUsd).toFixed(2)}`}
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
      {/* 6. HR & STAFF REGISTRY                                              */}
      {/* =================================================================== */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic Dedicated Logistics Personnel Roster</h3>
              <p className="text-[11px] text-slate-400">Strictly isolated from olive press factory personnel. Couriers and on-site hub dispatch staff.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-xs"
            >
              ➕ Add New Staff / Driver
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">staff id</th>
                  <th className="py-2.5 px-3 normal-case">full name</th>
                  <th className="py-2.5 px-3 normal-case">role & title</th>
                  <th className="py-2.5 px-3 normal-case">type</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">assigned asset</th>
                  <th className="py-2.5 px-3 normal-case">vehicle ownership</th>
                  <th className="py-2.5 px-3 normal-case text-right">rate / salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.id}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1e3a2b]">{s.fullName}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.role}</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">{s.type}</span></td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{s.phone}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{s.assignedAsset}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.ownershipStatus === 'COMPANY_FLEET' ? 'bg-emerald-100 text-emerald-800' : s.ownershipStatus === 'OWN_VEHICLE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {s.ownershipStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{s.salaryOrRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. CUSTOMER COMPLAINTS & RESOLUTION                                 */}
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
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {c.status !== 'RESOLVED' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <a href={`https://wa.me/961${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">
                            💬 WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedComplaintForAction(c)}
                            className="px-2 py-1 bg-[#1e3a2b] text-white rounded text-[10px] font-bold"
                          >
                            Resolve
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">Closed ✓</span>
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
            <div className="flex gap-2">
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs">
                🖨️ Print A4 Report
              </button>
              <button type="button" onClick={() => handleExportCSV(selectedDriverForReport)} className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs">
                📊 Export as CSV / Excel
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
      {/* 9. LIVE RADAR (DRIVER PHONE MIRRORING)                              */}
      {/* =================================================================== */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            💡 <strong>Interactive Telemetry:</strong> Click any driver card below to open the real-time simulation of their mobile phone screen.
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
                  📱 Mirror Driver Phone Screen ➔
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. PROOF OF DELIVERY (POD) ARCHIVES                                */}
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
                {orders.filter((o) => o.status === 'DELIVERED').map((o) => (
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
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">📸 Photo 1</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold">📄 Photo 2</span>
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
      {/* 11. VEHICLES: PURGED COMPANY FLEET LOG                              */}
      {/* =================================================================== */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic Company-Owned Fleet Asset & Odometer Log</h3>
          <p className="text-[11px] text-slate-400">Strictly company-owned vehicles. Freelance driver-owned vehicles are excluded from corporate asset maintenance.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.filter((v) => v.ownership === 'COMPANY_OWNED').map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned Driver: {v.driver}</div>
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM (+{v.currentKm - v.startKm} KM today)</div>
                <div className="text-[10px] text-emerald-800 font-bold pt-1">Company Asset #SUPER-{v.plate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedOrderForReroute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Re-route Order #{selectedOrderForReroute.orderNo}</h3>
            <p className="text-slate-600">Select target corridor to transfer this package:</p>
            <div className="space-y-1.5">
              {corridors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleExecuteReroute(c.id)}
                  className="w-full text-left px-3 py-2 rounded-lg border hover:bg-slate-100 font-semibold text-slate-800"
                >
                  Corridor {c.id}: {c.name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedOrderForReroute(null)} className="w-full py-1.5 bg-slate-200 font-bold rounded-lg mt-2">Cancel</button>
          </div>
        </div>
      )}

      {selectedComplaintForAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Resolve Complaint #{selectedComplaintForAction.id}</h3>
            <p className="text-slate-600"><strong>Customer:</strong> {selectedComplaintForAction.customerName}</p>
            <textarea
              value={complaintResolutionInput}
              onChange={(e) => setComplaintResolutionInput(e.target.value)}
              placeholder="Resolution action taken..."
              rows={3}
              className="w-full p-2 border rounded-xl"
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleResolveComplaint} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Confirm Resolution</button>
              <button type="button" onClick={() => setSelectedComplaintForAction(null)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedVehicleForTelemetry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 rounded-3xl border border-slate-700 max-w-sm w-full p-4 space-y-3 text-xs text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm">{selectedVehicleForTelemetry.driver} ({selectedVehicleForTelemetry.model})</h3>
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="font-bold">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 bg-slate-900 rounded"><span>SPEED:</span> <strong>{selectedVehicleForTelemetry.currentSpeedKmH} KM/H</strong></div>
              <div className="p-2 bg-slate-900 rounded"><span>BATTERY:</span> <strong>{selectedVehicleForTelemetry.batteryPercent}% 🔋</strong></div>
              <div className="p-2 bg-slate-900 rounded"><span>STOPS:</span> <strong>{selectedVehicleForTelemetry.stopsDelivered}/{selectedVehicleForTelemetry.stopsTotal}</strong></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <a href={`tel:${selectedVehicleForTelemetry.phone}`} className="flex-1 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-center text-xs">📞 Call</a>
              <a href={`https://wa.me/961${selectedVehicleForTelemetry.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-emerald-500 text-white font-bold rounded-lg text-center text-xs">💬 WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      {selectedPodOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Proof of Delivery — #{selectedPodOrder.orderNo}</h3>
            <div className="p-3 bg-slate-50 rounded border font-mono">
              <div>Customer: <strong>{selectedPodOrder.customerName}</strong></div>
              <div>Delivered At: {selectedPodOrder.deliveredAt}</div>
              <div>Driver: {selectedPodOrder.assignedDriver}</div>
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

      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic 3PL Vendor</h3>
            <div><label className="font-bold block mb-1">Merchant / Store Name:</label><input type="text" placeholder="e.g. Beirut Gourmet Boutique" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Contact Person & Phone:</label><input type="text" placeholder="e.g. Walid Haddad (03-741258)" className="w-full p-2 border rounded-xl" /></div>
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
            {newStaffType === 'DRIVER' && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setNewStaffOwnership('COMPANY_FLEET')} className={`flex-1 py-1.5 rounded-lg border font-bold text-[11px] ${newStaffOwnership === 'COMPANY_FLEET' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>Company Fleet</button>
                <button type="button" onClick={() => setNewStaffOwnership('OWN_VEHICLE')} className={`flex-1 py-1.5 rounded-lg border font-bold text-[11px] ${newStaffOwnership === 'OWN_VEHICLE' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>Own Vehicle</button>
              </div>
            )}
            <div><label className="font-bold block mb-1">Full Name:</label><input type="text" placeholder="e.g. Jad Mansour" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Phone Number:</label><input type="text" placeholder="e.g. 03-334455" className="w-full p-2 border rounded-xl" /></div>
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
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Shipment</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Apex Electronics" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Recipient & Phone:</label><input type="text" placeholder="e.g. Ziad (03-554433)" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Destination Town:</label><input type="text" placeholder="e.g. Saida - Riad El Solh" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ 3PL Shipment Added!'); setShowAdd3PLModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save Package</button>
              <button type="button" onClick={() => setShowAdd3PLModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
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
