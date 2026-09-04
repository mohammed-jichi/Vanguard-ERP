'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

interface AssignedPathCard {
  pathId: string;
  corridorId: number;
  corridorName: string;
  driverName: string;
  vehiclePlate: string;
  tripNo: number;
  assignedOrders: DispatchedOrder[];
  status: 'READY_FOR_LOADING' | 'LOADED_DEPARTED';
  assignedAt: string;
}

function SuperSonicFleetContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dispatch';

  // Master State
  const [corridors] = useState(initialCorridors);
  const [vehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [orders, setOrders] = useState<DispatchedOrder[]>(initialOrders);
  const [vendors, setVendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(initialComplaints);
  const [ledger] = useState(initialLedger);

  // 1. CORRIDOR DROPDOWN IN DISPATCH
  const [selectedCorridorId, setSelectedCorridorId] = useState<number>(1);
  const [assignDriver, setAssignDriver] = useState<string>('Tony Khoury');
  const [assignVehicle, setAssignVehicle] = useState<string>('B-492102 (Van 01)');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // 2. ROUTE CARDS (PATH CARDS)
  const [pathCards, setPathCards] = useState<AssignedPathCard[]>([
    {
      pathId: 'PATH-C1-T1',
      corridorId: 1,
      corridorName: 'Corridor 1: Greater Beirut & Connected Coast',
      driverName: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      tripNo: 1,
      status: 'READY_FOR_LOADING',
      assignedAt: 'Today 08:30 AM',
      assignedOrders: [initialOrders[0], initialOrders[2]],
    },
  ]);

  // Modals & Popups
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedOrderForReroute, setSelectedOrderForReroute] = useState<DispatchedOrder | null>(null);
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CustomerComplaintTicket | null>(null);
  const [complaintResolutionInput, setComplaintResolutionInput] = useState('');
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');
  const [selectedReportKey, setSelectedReportKey] = useState<
    | 'COD_WHISH_SETTLEMENTS'
    | 'FULFILLMENT_AUDIT'
    | 'DRIVER_RECONCILIATION'
    | 'MERCHANT_REMITTANCE'
    | 'DELIVERY_REVENUE'
    | 'COMPLAINTS_QUALITY'
    | 'FLEET_MILEAGE'
    | 'POD_AUDIT'
  >('COD_WHISH_SETTLEMENTS');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Current corridor orders waiting for assignment in Dispatch
  const currentCorridorOrders = orders.filter(
    (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
  );

  // Pre-select all corridor packages by default
  useEffect(() => {
    setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
  }, [selectedCorridorId, orders]);

  // Automatic Trip Sequencing per driver
  const getAutoTripNumberForDriver = (driverName: string) => {
    const driverExistingRuns = pathCards.filter((p) => p.driverName === driverName);
    return driverExistingRuns.length + 1;
  };
  const autoCalculatedTripNo = getAutoTripNumberForDriver(assignDriver);

  // Toggle order checkbox
  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === currentCorridorOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
    }
  };

  // Manual delivery fee edit in table
  const handleUpdateDeliveryFee = (orderId: string, newFee: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryFeeUsd: newFee } : o))
    );
  };

  // Action: Save & Load to Driver
  const handleSaveAndAssignToDelivery = () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one package to load!');
      return;
    }

    const currentCorridor = corridors.find((c) => c.id === selectedCorridorId);
    const assignedOrdersList = orders.filter((o) => selectedOrderIds.includes(o.id));

    const newPathCard: AssignedPathCard = {
      pathId: `PATH-C${selectedCorridorId}-T${autoCalculatedTripNo}-${Date.now().toString().slice(-4)}`,
      corridorId: selectedCorridorId,
      corridorName: currentCorridor?.name || `Corridor ${selectedCorridorId}`,
      driverName: assignDriver,
      vehiclePlate: assignVehicle.split(' ')[0],
      tripNo: autoCalculatedTripNo,
      status: 'READY_FOR_LOADING',
      assignedAt: 'Just Now',
      assignedOrders: assignedOrdersList,
    };

    setPathCards((prev) => [newPathCard, ...prev]);

    setOrders((prev) =>
      prev.map((o) =>
        selectedOrderIds.includes(o.id)
          ? {
              ...o,
              assignedDriver: assignDriver,
              vehiclePlate: assignVehicle.split(' ')[0],
              tripNo: autoCalculatedTripNo,
              status: 'QUEUED',
            }
          : o
      )
    );

    setSelectedOrderIds([]);
    alert(`✓ Success! ${assignedOrdersList.length} packages loaded to ${assignDriver} on Trip ${autoCalculatedTripNo}.\nMoved to Route Cards ready for departure!`);
  };

  // Bidirectional Fulfillment Switching Handlers
  const handleMoveToPosPickup = (
    orderId: string,
    actorType: 'MANAGEMENT' | 'REPRESENTATIVE' = 'MANAGEMENT',
    actorCode = 'MGR-01',
    actorName = 'Operations Desk'
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'MOVED_TO_POS_PICKUP',
              corridorId: 0,
              assignedDriver: '-',
              vehiclePlate: '-',
              fulfillmentSwitchedBy: {
                actorType,
                actorCode,
                actorName,
                timestamp: 'Just Now',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} moved to Showroom POS Pickup by Management (${actorCode})!\nIt is now locked as read-only for Fleet and active at the Choueifat Showroom Counter.`);
  };

  const handleReturnToDelivery = (
    orderId: string,
    actorType: 'MANAGEMENT' | 'REPRESENTATIVE' = 'REPRESENTATIVE',
    actorCode = 'REP-002',
    actorName = 'Sales Rep'
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'QUEUED',
              corridorId: 1, // Reverts to active delivery queue in Corridor 1 by default
              fulfillmentSwitchedBy: {
                actorType,
                actorCode,
                actorName,
                timestamp: 'Just Now',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} returned to Fleet Delivery queue by ${actorName} (${actorCode})!\nRe-activated in SuperSonic Corridors for van dispatch.`);
  };

  // Corridor Re-routing
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
              {activeTab === 'southern-olive' && 'Southern Olive Oil In-House Orders (Incoming Feed)'}
              {activeTab === '3pl-orders' && 'SuperSonic 3PL Commercial Orders'}
              {activeTab === 'dispatch' && 'Corridors & Regional Dispatch (Unassigned Queue)'}
              {activeTab === 'path-cards' && 'Route Cards (Assigned Runs Ready for Loading)'}
              {activeTab === 'vendors' && 'SuperSonic 3PL Merchant Accounts'}
              {activeTab === 'accounting' && 'SuperSonic Financial Ledger & Treasury'}
              {activeTab === 'hr' && 'SuperSonic Staff & Driver Roster'}
              {activeTab === 'complaints' && 'Customer Complaints & Service Quality'}
              {activeTab === 'settlements' && 'Driver Trips Master Reconciliation'}
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
          <span className="px-3 py-1 bg-[#edf2ee] text-[#1e3a2b] font-bold rounded-lg border border-[#1e3a2b]/30">
            00001 - Southern Olive Oil Products S.A.R.L
          </span>
          <Link href="/backoffice/dashboard" className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300">
            🔄 Return to Main Hub
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. SOUTHERN OLIVE ORDERS (INCOMING INBOX WITH BIDIRECTIONAL ACTIONS)*/}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incoming Orders Feed — Southern Olive Oil Products S.A.R.L</h3>
              <p className="text-[11px] text-slate-400">
                New online/CRM orders waiting for dispatch. Management can transition orders between Fleet Delivery and Showroom POS Pickup.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
              {orders.filter((o) => o.sourceType === 'SOUTHERN_OLIVE' && o.status !== 'DELIVERED').length} Active Inflow
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer & phone</th>
                  <th className="py-2.5 px-3 normal-case">destination town & address</th>
                  <th className="py-2.5 px-3 normal-case">packing items & packaging</th>
                  <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                  <th className="py-2.5 px-3 normal-case">sales rep</th>
                  <th className="py-2.5 px-3 normal-case text-center">fulfillment status & actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders
                  .filter((o) => o.sourceType === 'SOUTHERN_OLIVE' && o.status !== 'DELIVERED')
                  .map((o) => (
                    <tr
                      key={o.id}
                      className={o.status === 'MOVED_TO_POS_PICKUP' ? 'bg-slate-100/70 text-slate-400 opacity-70' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900 block">{o.customerName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{o.phone}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 block font-bold">{o.destinationTown}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.addressDetails}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd.toFixed(2)}`}
                      </td>
                      <td className="py-2.5 px-3 text-purple-800 font-semibold">{o.repName}</td>
                      
                      {/* CLEAN FULFILLMENT STATUS & ACTIONS (NO REDUNDANT SUB-BADGES) */}
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'MOVED_TO_POS_PICKUP' ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] inline-flex items-center gap-1">
                              <span>🏪</span> Moved to POS (Read-Only)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReturnToDelivery(o.id, 'REPRESENTATIVE', o.repName?.match(/\(([^)]+)\)/)?.[1] || 'REP-002', o.repName || 'Sales Rep')}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] border border-blue-200 transition-colors"
                              title="Revert back to Fleet Delivery"
                            >
                              🚚 Return to Delivery
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Active for Delivery
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMoveToPosPickup(o.id, 'MANAGEMENT', 'MGR-01', 'Operations Desk')}
                              className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded text-[10px] border border-purple-200 transition-colors"
                              title="Customer prefers in-store pickup at Showroom"
                            >
                              🏪 Move to POS Pickup
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
      )}

      {/* =================================================================== */}
      {/* 1. CORRIDORS & DISPATCH: INLINE DRIVER ASSIGNMENT & SAVE ROUTES     */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (() => {
        // Master Save Routes Action: Groups orders by driver and splits into Route Cards
        const handleSaveRoutes = () => {
          const assignedInCorridor = currentCorridorOrders.filter(
            (o) => o.assignedDriver && o.assignedDriver !== '-' && o.assignedDriver !== 'UNASSIGNED'
          );

          if (assignedInCorridor.length === 0) {
            alert('Please assign at least one package to a driver using the dropdown before saving routes!');
            return;
          }

          // Group orders by assigned driver
          const driverGroups: Record<string, DispatchedOrder[]> = {};
          assignedInCorridor.forEach((o) => {
            if (!driverGroups[o.assignedDriver]) driverGroups[o.assignedDriver] = [];
            driverGroups[o.assignedDriver].push(o);
          });

          const currentCorridor = corridors.find((c) => c.id === selectedCorridorId);
          const newCards: AssignedPathCard[] = [];

          Object.entries(driverGroups).forEach(([driverName, groupOrders]) => {
            const driverObj = staffList.find((s) => s.fullName === driverName);
            const vehiclePlate = (driverObj?.assignedAsset || 'B-492102').split(' ')[0];
            const autoTripNo = getAutoTripNumberForDriver(driverName);

            newCards.push({
              pathId: `ROUTE-C${selectedCorridorId}-${driverName.split(' ')[0]}-T${autoTripNo}-${Date.now().toString().slice(-4)}`,
              corridorId: selectedCorridorId,
              corridorName: currentCorridor?.name || `Corridor ${selectedCorridorId}`,
              driverName: driverName,
              vehiclePlate: vehiclePlate,
              tripNo: autoTripNo,
              status: 'READY_FOR_LOADING',
              assignedAt: 'Just Now',
              assignedOrders: groupOrders,
            });
          });

          // Add to Route Cards
          setPathCards((prev) => [...newCards, ...prev]);

          // Update order statuses
          const assignedIds = assignedInCorridor.map((o) => o.id);
          setOrders((prev) =>
            prev.map((o) =>
              assignedIds.includes(o.id)
                ? { ...o, status: 'QUEUED' }
                : o
            )
          );

          alert(`✓ Routes Saved! Automatically split into ${newCards.length} separate Route Card(s) by driver and moved to Route Cards!`);
        };

        return (
          <div className="space-y-4">
            
            {/* Top Corridor Selector Toolbar (Clean & Simple) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Select Highway Corridor:</label>
                  <select
                    value={selectedCorridorId}
                    onChange={(e) => setSelectedCorridorId(parseInt(e.target.value))}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-none min-w-[340px]"
                  >
                    {corridors.map((c) => (
                      <option key={c.id} value={c.id}>
                        Corridor {c.id}: {c.name.split(': ')[1] || c.name} ({c.schedule})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Highway Path: <strong className="text-slate-800">{corridors.find(c => c.id === selectedCorridorId)?.highwayPath}</strong>
                </div>
              </div>
            </div>

            {/* Corridor Packages Table with Inline Driver Dropdown & Save Routes Button */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Corridor {selectedCorridorId} Orders Queue — Assign Drivers & Build Routes
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Assign each order to its driver individually. Click "Save Routes" to split and save separate Route Cards for each driver.
                  </p>
                </div>

                {/* Master Save Routes Button */}
                <button
                  type="button"
                  onClick={handleSaveRoutes}
                  className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <span>💾 Save Routes (Split by Drivers ➔ Route Cards)</span>
                </button>
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                      <th className="py-2.5 px-3 normal-case">order no.</th>
                      <th className="py-2.5 px-3 normal-case">source entity</th>
                      <th className="py-2.5 px-3 normal-case">customer & destination</th>
                      <th className="py-2.5 px-3 normal-case">packing checklist</th>
                      <th className="py-2.5 px-3 normal-case text-right">product val</th>
                      <th className="py-2.5 px-3 normal-case text-center w-28">delivery fee ($)</th>
                      <th className="py-2.5 px-3 normal-case text-center w-48">assign to driver</th>
                      <th className="py-2.5 px-3 normal-case text-center">actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                    {currentCorridorOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
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
                        <td className="py-2.5 px-3 text-slate-700 text-[11px]">{order.items}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {order.productAmountLbp > 0 ? `${order.productAmountLbp.toLocaleString()} LBP` : `$${order.productAmountUsd}`}
                        </td>
                        
                        {/* Manual Delivery Fee Input */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center justify-center gap-1">
                            <span className="text-slate-400 font-mono text-xs">$</span>
                            <input
                              type="number"
                              step="0.5"
                              value={order.deliveryFeeUsd}
                              onChange={(e) => handleUpdateDeliveryFee(order.id, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-blue-700 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </td>

                        {/* INLINE PER-ORDER DRIVER ASSIGNMENT DROPDOWN */}
                        <td className="py-2.5 px-3 text-center">
                          <select
                            value={order.assignedDriver && order.assignedDriver !== '-' ? order.assignedDriver : 'UNASSIGNED'}
                            onChange={(e) => {
                              const chosenDriver = e.target.value;
                              const driverObj = staffList.find((s) => s.fullName === chosenDriver);
                              const vehicle = driverObj?.assignedAsset?.split(' ')[0] || '-';
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id
                                    ? { ...o, assignedDriver: chosenDriver === 'UNASSIGNED' ? '-' : chosenDriver, vehiclePlate: vehicle }
                                    : o
                                )
                              );
                            }}
                            className={`px-2 py-1 border rounded-lg text-xs font-bold transition-colors focus:outline-none ${order.assignedDriver && order.assignedDriver !== '-' ? 'bg-emerald-50 text-[#1e3a2b] border-emerald-300' : 'bg-white text-slate-600 border-slate-300'}`}
                          >
                            <option value="UNASSIGNED">-- Select Driver --</option>
                            {staffList.filter((s) => s.type === 'DRIVER').map((d) => (
                              <option key={d.id} value={d.fullName}>
                                {d.fullName} ({d.assignedAsset.split(' ')[0]})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForReroute(order)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10.5px] font-bold border border-slate-300"
                          >
                            🔄 Move Corridor
                          </button>
                        </td>
                      </tr>
                    ))}

                    {currentCorridorOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                          No packages currently queued for Corridor {selectedCorridorId}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* 3. ROUTE CARDS (PATH CARDS — READY FOR LOADING)                     */}
      {/* =================================================================== */}
      {activeTab === 'path-cards' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex justify-between items-center">
            <span>🗂️ <strong>Route Cards:</strong> Confirmed and loaded routes. Ready for warehouse loading and vehicle departure.</span>
            <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white rounded-lg font-bold shadow-xs cursor-pointer">
              🖨️ Print Assigned Route Manifest A4
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathCards.map((card) => (
              <div key={card.pathId} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                      {card.pathId}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{card.corridorName}</h3>
                    <span className="text-xs text-slate-600 block">Driver: <strong>{card.driverName}</strong> | Vehicle: <strong>{card.vehiclePlate}</strong> | <strong>Trip {card.tripNo}</strong></span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                    {card.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-500 block">LOADED PACKAGES IN THIS RUN ({card.assignedOrders.length}):</span>
                  {card.assignedOrders.map((o, idx) => (
                    <div key={o.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <strong>Stop #{idx + 1}: {o.customerName}</strong>
                        <span className="text-[10px] text-slate-500 block font-mono">{o.destinationTown} — {o.items}</span>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-800">
                        {o.productAmountLbp > 0 ? `${(o.productAmountLbp / 1000000).toFixed(1)}M LBP` : `$${o.productAmountUsd}`}
                        <span className="text-blue-700 block text-[10px]">+${o.deliveryFeeUsd} fee</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">Assigned: {card.assignedAt}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Printing packing sheet for ${card.pathId}...`)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold border border-slate-300 cursor-pointer"
                  >
                    🖨️ Print Packing Sheet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. SUPERSONIC 3PL ORDERS                                            */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between items-center">
            <span>💡 <strong>3PL Commercial Orders:</strong> External merchant packages. Delivery fees are flexible and editable per package.</span>
            <button type="button" onClick={() => setShowAdd3PLModal(true)} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white rounded-lg font-bold shadow-xs cursor-pointer">
              ➕ Add 3PL Package
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl bg-white p-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">waybill #</th>
                  <th className="py-2.5 px-3 normal-case">merchant</th>
                  <th className="py-2.5 px-3 normal-case">recipient & town</th>
                  <th className="py-2.5 px-3 normal-case">cargo description</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod cash</th>
                  <th className="py-2.5 px-3 normal-case text-center">delivery fee ($)</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.sourceType === 'EXTERNAL_3PL').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-3">{o.destinationTown}</td>
                    <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-blue-700">${o.deliveryFeeUsd}</span>
                    </td>
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
      {/* 5. VENDORS MASTER                                                   */}
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
              className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
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
      {/* 6. SUPERSONIC FINANCIAL LEDGER                                      */}
      {/* =================================================================== */}
      {activeTab === 'accounting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SuperSonic Delivery Revenue</span>
              <span className="text-xl font-extrabold text-blue-800">$1,840.00 USD</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total COD in Vault</span>
              <span className="text-xl font-extrabold text-emerald-700">$12,450.00 USD</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Whish Wallet Balance</span>
              <span className="text-xl font-extrabold text-purple-800">$3,210.00 USD</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Fuel & Expenses</span>
              <span className="text-xl font-extrabold text-rose-700">-$410.00 USD</span>
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
      {/* 7. HR & COMPLAINTS & OTHER SECTIONS                                 */}
      {/* =================================================================== */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">SuperSonic Dedicated Personnel Roster</h3>
            <button onClick={() => setShowAddStaffModal(true)} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-xl text-xs cursor-pointer">
              ➕ Add Staff
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">staff id</th>
                  <th className="py-2.5 px-3 normal-case">full name</th>
                  <th className="py-2.5 px-3 normal-case">role</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">ownership</th>
                  <th className="py-2.5 px-3 normal-case text-right">salary/rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 font-mono font-bold">{s.id}</td>
                    <td className="py-2 px-3 font-bold text-[#1e3a2b]">{s.fullName}</td>
                    <td className="py-2 px-3">{s.role}</td>
                    <td className="py-2 px-3 font-mono">{s.phone}</td>
                    <td className="py-2 px-3">{s.ownershipStatus}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{s.salaryOrRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Customer Complaints & 1-Hour Automated Review Feed</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">ticket id</th>
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">courier</th>
                  <th className="py-2.5 px-3 normal-case">category</th>
                  <th className="py-2.5 px-3 normal-case">comment</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 px-3 font-mono font-bold text-rose-700">{c.id}</td>
                    <td className="py-2 px-3 font-mono">{c.orderNo}</td>
                    <td className="py-2 px-3 font-bold">{c.customerName} ({c.phone})</td>
                    <td className="py-2 px-3">{c.driverName}</td>
                    <td className="py-2 px-3">{c.category}</td>
                    <td className="py-2 px-3 italic">"{c.description}"</td>
                    <td className="py-2 px-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{c.status}</span></td>
                    <td className="py-2 px-3 text-center">
                      {c.status !== 'RESOLVED' ? (
                        <button onClick={() => setSelectedComplaintForAction(c)} className="px-2 py-1 bg-[#1e3a2b] text-white rounded text-[10px] font-bold cursor-pointer">Resolve</button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Closed ✓</span>
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
      {/* 8. SUPERSONIC MASTER REPORTS HUB (NOW ACCESSIBLE AS "REPORTS")      */}
      {/* =================================================================== */}
      {(activeTab === 'reports' || activeTab === 'settlements') && (() => {
        return (
          <div className="space-y-4">
            
            {/* Split View: Left Reports Sub-Sidebar + Right Active Report Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* LEFT REPORT PICKER MENU */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-2xs print:hidden">
                <div className="p-2.5 border-b border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">SuperSonic Reports Catalog</span>
                </div>

                {/* 1. COD, Whish & Settlements Report */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('COD_WHISH_SETTLEMENTS')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COD_WHISH_SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>💵 COD, Whish & Settlements</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-mono font-bold">Audit</span>
                </button>

                {/* 2. Fulfillment Audit (By Who) */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('FULFILLMENT_AUDIT')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FULFILLMENT_AUDIT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>🔄 Fulfillment Audit (By Who)</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">Logs</span>
                </button>

                {/* 3. Driver Daily Trips Master */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('DRIVER_RECONCILIATION')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'DRIVER_RECONCILIATION' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>📄 Driver Daily Trips Master</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">A4</span>
                </button>

                {/* 4. Merchant COD Remittance */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('MERCHANT_REMITTANCE')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'MERCHANT_REMITTANCE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>🤝 Merchant COD Remittance</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-mono font-bold">3PL</span>
                </button>

                {/* 5. 3PL Delivery Fee Revenue */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('DELIVERY_REVENUE')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'DELIVERY_REVENUE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>📈 3PL Delivery Revenue</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Finance</span>
                </button>

                {/* 6. Complaints & Review Quality */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('COMPLAINTS_QUALITY')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COMPLAINTS_QUALITY' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>🎧 Complaints & Reviews</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 font-mono font-bold">Service</span>
                </button>

                {/* 7. Fleet Mileage & Fuel Audit */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('FLEET_MILEAGE')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FLEET_MILEAGE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>🚐 Fleet Mileage & Fuel</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Assets</span>
                </button>

                {/* 8. Proof of Delivery Legal Log */}
                <button
                  type="button"
                  onClick={() => setSelectedReportKey('POD_AUDIT')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'POD_AUDIT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span>✍️ Proof of Delivery Log</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Signed</span>
                </button>
              </div>

              {/* RIGHT MAIN REPORT VIEWPORT */}
              <div className="lg:col-span-9 space-y-3">
                
                {/* Export Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Active Report:</span>
                    <span className="font-mono font-bold text-[#1e3a2b] px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {selectedReportKey}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs">
                      🖨️ Print A4 Report
                    </button>
                    <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                      📄 Download as PDF
                    </button>
                    <button type="button" onClick={() => alert(`Exporting ${selectedReportKey} to CSV...`)} className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs">
                      📊 Export as CSV
                    </button>
                  </div>
                </div>

                {/* 1. COD, WHISH & SETTLEMENTS DEDICATED REPORT */}
                {selectedReportKey === 'COD_WHISH_SETTLEMENTS' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">COD, Whish & Settlements Audit Report</h3>
                        <p className="text-[11px] text-slate-500 font-mono">Detailed audit of remote Whish transfers, cash vault handovers, and approval verifications.</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Tenant: 00001 - Southern Olive Oil Products S.A.R.L</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                            <th className="py-2.5 px-3 normal-case">transaction id</th>
                            <th className="py-2.5 px-3 normal-case">driver name</th>
                            <th className="py-2.5 px-3 normal-case">vehicle</th>
                            <th className="py-2.5 px-3 normal-case text-right">amount ($)</th>
                            <th className="py-2.5 px-3 normal-case">payment method</th>
                            <th className="py-2.5 px-3 normal-case">reference no.</th>
                            <th className="py-2.5 px-3 normal-case text-center">status</th>
                            <th className="py-2.5 px-3 normal-case text-center">action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                          <tr className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-900">WSH-0091</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">Tony Khoury</td>
                            <td className="py-2.5 px-3 text-slate-600">Toyota HiAce (B-492102)</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-800">$200.00</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">Whish Money</span></td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">WHISH-TX-9988124</td>
                            <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Pending Approval</span></td>
                            <td className="py-2.5 px-3 text-center">
                              <button type="button" onClick={() => alert('Approved into vault!')} className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold">Approve</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">CSH-0042</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">Tony Khoury</td>
                            <td className="py-2.5 px-3 text-slate-600">Toyota HiAce (B-492102)</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">$250.00</td>
                            <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">Physical Cash (Vault)</span></td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">VAULT-DEP-4920</td>
                            <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Audited & Cleared ✓</span></td>
                            <td className="py-2.5 px-3 text-center"><span className="text-slate-400 text-[10px]">Closed</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. FULFILLMENT AUDIT TRAIL (WHO SWITCHED IT) */}
                {selectedReportKey === 'FULFILLMENT_AUDIT' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">Fulfillment Transition & Audit Trail Report</h3>
                        <p className="text-[11px] text-slate-500 font-mono">Tracks all orders converted between Fleet Delivery and Showroom POS Pickup with user attribution.</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Tenant: 00001 - Southern Olive Oil Products S.A.R.L</span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                            <th className="py-2.5 px-3 normal-case">order no.</th>
                            <th className="py-2.5 px-3 normal-case">customer & phone</th>
                            <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                            <th className="py-2.5 px-3 normal-case text-center">transition action</th>
                            <th className="py-2.5 px-3 normal-case text-center">switched by (role)</th>
                            <th className="py-2.5 px-3 normal-case text-center">user / rep code</th>
                            <th className="py-2.5 px-3 normal-case">operator name</th>
                            <th className="py-2.5 px-3 normal-case font-mono">timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                          {orders.filter(o => o.status === 'MOVED_TO_POS_PICKUP' || o.fulfillmentSwitchedBy).map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                              <td className="py-2.5 px-3">{o.customerName} ({o.phone})</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-center">
                                {o.status === 'MOVED_TO_POS_PICKUP' ? (
                                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">Moved to POS</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">Returned to Delivery</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.fulfillmentSwitchedBy?.actorType === 'MANAGEMENT' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                                  {o.fulfillmentSwitchedBy?.actorType || 'MANAGEMENT'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-800">
                                {o.fulfillmentSwitchedBy?.actorCode || 'MGR-01'}
                              </td>
                              <td className="py-2.5 px-3">{o.fulfillmentSwitchedBy?.actorName || 'SuperSonic Dispatch Ops'}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">{o.fulfillmentSwitchedBy?.timestamp || 'Today 09:15 AM'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. DRIVER DAILY TRIPS MASTER */}
                {selectedReportKey === 'DRIVER_RECONCILIATION' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">Driver Daily Trips Master Reconciliation Report</h3>
                        <p className="text-[11px] text-slate-500 font-mono">Consolidated settlement of sequential trips, cash, Whish, and driver allowances.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Driver:</span>
                        <select
                          value={selectedDriverForReport}
                          onChange={(e) => setSelectedDriverForReport(e.target.value)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                        >
                          {vehicles.map((v) => (
                            <option key={v.driver} value={v.driver}>{v.driver} ({v.model})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div><strong>Driver:</strong> {currentReportVehicle.driver} ({currentReportVehicle.phone})</div>
                      <div><strong>Vehicle Model:</strong> {currentReportVehicle.model} ({currentReportVehicle.plate})</div>
                      <div><strong>Departure Hub:</strong> SuperSonic Central Hub (Choueifat)</div>
                      <div><strong>Odometer:</strong> {currentReportVehicle.startKm.toLocaleString()} KM ➔ {currentReportVehicle.currentKm.toLocaleString()} KM</div>
                    </div>

                    <table className="w-full text-left border border-slate-300 border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-slate-300 text-[10.5px]">
                          <th className="py-2 px-2 normal-case border-r">trip #</th>
                          <th className="py-2 px-2 normal-case border-r">corridor / line</th>
                          <th className="py-2 px-2 normal-case text-center border-r">stops</th>
                          <th className="py-2 px-2 normal-case text-right border-r">product val ($)</th>
                          <th className="py-2 px-2 normal-case text-right border-r">delivery ($)</th>
                          <th className="py-2 px-2 normal-case text-right border-r">cash usd</th>
                          <th className="py-2 px-2 normal-case text-right">whish usd</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        <tr>
                          <td className="py-2 px-2 font-bold border-r">Trip 1</td>
                          <td className="py-2 px-2 font-sans border-r">Corridor 1: Greater Beirut</td>
                          <td className="py-2 px-2 text-center border-r">6/6</td>
                          <td className="py-2 px-2 text-right border-r">$350.00</td>
                          <td className="py-2 px-2 text-right border-r">$24.00</td>
                          <td className="py-2 px-2 text-right font-bold border-r">$250.00</td>
                          <td className="py-2 px-2 text-right font-bold text-purple-900">$100.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. OTHER REPORTS */}
                {selectedReportKey === 'MERCHANT_REMITTANCE' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <h3 className="font-bold text-base text-slate-900">3PL Merchant COD Remittance & Payout Ledger</h3>
                    <p className="text-xs text-slate-500">COD cash collected minus delivery margins, ready for merchant disbursement.</p>
                  </div>
                )}

                {selectedReportKey === 'DELIVERY_REVENUE' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <h3 className="font-bold text-base text-slate-900">SuperSonic 3PL Delivery Fee Operating Revenue</h3>
                    <p className="text-xs text-slate-500">Pure courier margins isolated from Southern Olive Oil Products S.A.R.L product revenue.</p>
                  </div>
                )}

                {selectedReportKey === 'COMPLAINTS_QUALITY' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <h3 className="font-bold text-base text-slate-900">Customer Complaints & Review Quality Audit</h3>
                    <p className="text-xs text-slate-500">Audit of WhatsApp automated review ratings and courier incident resolutions.</p>
                  </div>
                )}

                {selectedReportKey === 'FLEET_MILEAGE' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <h3 className="font-bold text-base text-slate-900">Company Fleet Mileage, Odometer & Fuel Audit</h3>
                    <p className="text-xs text-slate-500">Daily start/end mileage tracking for company-owned vans and motorcycles.</p>
                  </div>
                )}

                {selectedReportKey === 'POD_AUDIT' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <h3 className="font-bold text-base text-slate-900">Proof of Delivery (POD) Legal Archive</h3>
                    <p className="text-xs text-slate-500">Legally verified electronic customer signatures and goods receipt photos.</p>
                  </div>
                )}

              </div>

            </div>

          </div>
        );
      })()}

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
                  <div className="flex justify-between text-emerald-800 font-bold"><span>Progress:</span> <span>{v.stopsDelivered}/{v.stopsTotal} Done</span></div>
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
      {/* 10. PROOF OF DELIVERY (POD) ARCHIVE                                 */}
      {/* =================================================================== */}
      {activeTab === 'pod' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Electronic Signatures & Photo Archive</h3>
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">delivered at</th>
                  <th className="py-2.5 px-3 normal-case">driver</th>
                  <th className="py-2.5 px-3 normal-case text-center">digital signature</th>
                  <th className="py-2.5 px-3 normal-case text-right">amount</th>
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
                      <span className="px-2 py-1 bg-slate-100 rounded border font-serif italic text-blue-900 font-bold">✍️ {o.signatureSvg}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. COMPANY FLEET & ODOMETER LOG                                    */}
      {/* =================================================================== */}
      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic Company-Owned Fleet Asset & Odometer Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.filter((v) => v.ownership === 'COMPANY_OWNED').map((v) => (
              <div key={v.plate} className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">{v.model}</span>
                  <span className="text-[#1e3a2b]">{v.category}</span>
                </div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned Driver: {v.driver}</div>
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM (+{v.currentKm - v.startKm} KM today)</div>
                <div className="text-[10px] text-emerald-800 font-bold pt-1">Company Fleet Asset #SUPER-{v.plate}</div>
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
                  className="w-full text-left px-3 py-2 rounded-lg border hover:bg-slate-100 font-semibold text-slate-800 cursor-pointer"
                >
                  Corridor {c.id}: {c.name.split(': ')[1] || c.name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedOrderForReroute(null)} className="w-full py-1.5 bg-slate-200 font-bold rounded-lg mt-2 cursor-pointer">Cancel</button>
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
              placeholder="Resolution notes..."
              rows={3}
              className="w-full p-2 border rounded-xl"
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleResolveComplaint} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl cursor-pointer">Confirm Resolution</button>
              <button type="button" onClick={() => setSelectedComplaintForAction(null)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedVehicleForTelemetry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 rounded-3xl border border-slate-700 max-w-sm w-full p-4 space-y-3 text-xs text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">{selectedVehicleForTelemetry.driver} ({selectedVehicleForTelemetry.model})</h3>
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="font-bold text-slate-400 cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 bg-slate-900 rounded"><span>SPEED:</span> <strong className="text-blue-400">{selectedVehicleForTelemetry.currentSpeedKmH} KM/H</strong></div>
              <div className="p-2 bg-slate-900 rounded"><span>BATTERY:</span> <strong className="text-emerald-400">{selectedVehicleForTelemetry.batteryPercent}% 🔋</strong></div>
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
              <button type="button" onClick={() => setSelectedPodOrder(null)} className="px-4 py-1.5 bg-slate-200 font-bold rounded-lg cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic 3PL Vendor</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Beirut Gourmet" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Contact & Phone:</label><input type="text" placeholder="03-741258" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Vendor saved!'); setShowAddVendorModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl cursor-pointer">Save Vendor</button>
              <button type="button" onClick={() => setShowAddVendorModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic Staff Member</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setNewStaffType('DRIVER')} className={`flex-1 py-2 rounded-xl border font-bold cursor-pointer ${newStaffType === 'DRIVER' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>Driver</button>
              <button type="button" onClick={() => setNewStaffType('ON_SITE')} className={`flex-1 py-2 rounded-xl border font-bold cursor-pointer ${newStaffType === 'ON_SITE' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>On-Site Personnel</button>
            </div>
            <div><label className="font-bold block mb-1">Full Name:</label><input type="text" placeholder="e.g. Jad Mansour" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Phone Number:</label><input type="text" placeholder="03-334455" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Staff profile created!'); setShowAddStaffModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl cursor-pointer">Create Profile</button>
              <button type="button" onClick={() => setShowAddStaffModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAdd3PLModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Shipment</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Apex Electronics" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Recipient & Phone:</label><input type="text" placeholder="Ziad (03-554433)" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Destination Town:</label><input type="text" placeholder="Saida - Riad El Solh" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ 3PL Package Saved!'); setShowAdd3PLModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl cursor-pointer">Save Package</button>
              <button type="button" onClick={() => setShowAdd3PLModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl cursor-pointer">Cancel</button>
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
