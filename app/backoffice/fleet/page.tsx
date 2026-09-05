'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FleetVehicle,
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

interface FulfillmentAudit {
  actorType: 'MANAGEMENT' | 'REPRESENTATIVE';
  actorCode: string;
  actorName: string;
  timestamp: string;
  actionType: 'MOVED_TO_POS' | 'RETURNED_TO_DELIVERY';
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
  fulfillmentSwitchedBy?: FulfillmentAudit;
}

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

function SuperSonicFleetPageContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dispatch';

  // Master State
  const [corridors] = useState(initialCorridors);
  const [vehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [orders, setOrders] = useState<DispatchedOrder[]>(initialOrders as DispatchedOrder[]);
  const [vendors, setVendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(initialComplaints);
  const [ledger] = useState(initialLedger);

  // Top-Level State (Strictly compliant with React Rules of Hooks)
  const [selectedCorridorId, setSelectedCorridorId] = useState<number>(1);
  const [assignDriver, setAssignDriver] = useState<string>('Hassan Sleiman');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedReportKey, setSelectedReportKey] = useState<string>('COD_WHISH_SETTLEMENTS');
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');

  // En-Route Adjacent Corridor Filter & Modal State
  const [includeAdjacentAramoun, setIncludeAdjacentAramoun] = useState<boolean>(false);
  const [showAttachEnRouteModal, setShowAttachEnRouteModal] = useState(false);
  const [enRouteSourceCorridorId, setEnRouteSourceCorridorId] = useState<number>(2); // Default to Aramoun/Bchamoun (Corridor 2)
  const [enRouteSelectedOrderIds, setEnRouteSelectedOrderIds] = useState<string[]>([]);

  // Modals
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedOrderForReroute, setSelectedOrderForReroute] = useState<DispatchedOrder | null>(null);
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CustomerComplaintTicket | null>(null);
  const [complaintResolutionInput, setComplaintResolutionInput] = useState('');
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Path Cards
  const [pathCards, setPathCards] = useState<AssignedPathCard[]>([
    {
      pathId: 'ROUTE-C1-TONY-T1-0940',
      corridorId: 1,
      corridorName: 'Corridor 1: Greater Beirut & Connected Coast',
      driverName: 'Tony Khoury',
      vehiclePlate: 'B-492102',
      tripNo: 1,
      status: 'READY_FOR_LOADING',
      assignedAt: 'Today 08:30 AM',
      assignedOrders: [initialOrders[0] as DispatchedOrder, initialOrders[1] as DispatchedOrder],
    },
  ]);

  // Current corridor orders + optional en-route adjacent corridor packages (e.g. Aramoun/Bchamoun for South run)
  const currentCorridorOrders = orders.filter((o) => {
    if (o.status === 'MOVED_TO_POS_PICKUP') return false;
    if (o.corridorId === selectedCorridorId) return true;
    if (selectedCorridorId === 3 && includeAdjacentAramoun && (o.destinationTown.includes('Aramoun') || o.destinationTown.includes('Bchamoun') || o.corridorId === 2)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
  }, [selectedCorridorId, includeAdjacentAramoun]);

  const getAutoTripNumberForDriver = (driverName: string) => {
    const driverExistingRuns = pathCards.filter((p) => p.driverName === driverName);
    return driverExistingRuns.length + 1;
  };

  const autoCalculatedTripNo = getAutoTripNumberForDriver(assignDriver);

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === currentCorridorOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleUpdateDeliveryFee = (orderId: string, newFee: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryFeeUsd: newFee } : o))
    );
  };

  // Bidirectional Fulfillment Handlers
  const handleMoveToPosPickup = (orderId: string) => {
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
                actorType: 'MANAGEMENT',
                actorCode: 'MGR-01',
                actorName: 'SuperSonic Dispatch Ops',
                timestamp: 'Just Now',
                actionType: 'MOVED_TO_POS',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} moved to Showroom POS Pickup!`);
  };

  const handleReturnToDelivery = (orderId: string, repName = 'REP-002') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'QUEUED',
              corridorId: 1,
              fulfillmentSwitchedBy: {
                actorType: 'REPRESENTATIVE',
                actorCode: repName,
                actorName: repName,
                timestamp: 'Just Now',
                actionType: 'RETURNED_TO_DELIVERY',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} returned to Fleet Delivery!`);
  };

  // Save Routes Action: Groups assigned orders by driver into Route Cards
  const handleSaveRoutes = () => {
    const assignedInCorridor = currentCorridorOrders.filter(
      (o) => o.assignedDriver && o.assignedDriver !== '-' && o.assignedDriver !== 'UNASSIGNED'
    );

    if (assignedInCorridor.length === 0) {
      alert('Please assign at least one order to a driver using the dropdown before saving routes!');
      return;
    }

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

    setPathCards((prev) => [...newCards, ...prev]);

    const assignedIds = assignedInCorridor.map((o) => o.id);
    setOrders((prev) =>
      prev.map((o) => (assignedIds.includes(o.id) ? { ...o, status: 'QUEUED' } : o))
    );

    alert(`✓ Routes Saved! Created ${newCards.length} Route Card(s) by driver, ready for loading!`);
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

  const currentReportVehicle = vehicles.find((v) => v.driver === selectedDriverForReport) || vehicles[0];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-80px)] select-none text-left font-sans space-y-4 max-w-[1440px] mx-auto px-3 pb-12">
      
      {/* A4 PRINT CSS */}
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
              {activeTab === 'southern-olive' && 'Southern Olive Oil In-House Orders'}
              {activeTab === '3pl-orders' && 'SuperSonic 3PL Commercial Orders'}
              {activeTab === 'dispatch' && 'Corridors & Regional Dispatch (Assign Drivers & En-Route)'}
              {activeTab === 'path-cards' && 'Route Cards (Ready for Loading & Departure)'}
              {activeTab === 'vendors' && 'SuperSonic 3PL Merchant Accounts'}
              {activeTab === 'accounting' && 'SuperSonic Financial Ledger & Treasury'}
              {activeTab === 'hr' && 'SuperSonic Staff & Driver Roster'}
              {activeTab === 'complaints' && 'Customer Complaints & Service Quality'}
              {activeTab === 'reports' && 'SuperSonic Master Reports Hub'}
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
      {/* 1. DISPATCH: EN-ROUTE CROSS-CORRIDOR BUNDLING & ONE-CLICK DISPATCH  */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (() => {
        // En-Route Stops State (Additional orders attached from other corridors)
        const [enRouteOrderIds, setEnRouteOrderIds] = useState<string[]>([]);
        const [showEnRoutePicker, setShowEnRoutePicker] = useState(false);

        // Combined orders list for this run: Primary Corridor Orders + Attached En-Route Stops
        const primaryOrders = orders.filter(
          (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
        );
        const attachedEnRouteOrders = orders.filter((o) => enRouteOrderIds.includes(o.id));
        const combinedRunOrders = [...attachedEnRouteOrders, ...primaryOrders];

        // Available orders from other corridors suitable for en-route pickup
        const availableOtherCorridorOrders = orders.filter(
          (o) => o.corridorId !== selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP' && !enRouteOrderIds.includes(o.id)
        );

        // One-Click Dispatch Run Action
        const handleDispatchRun = () => {
          if (combinedRunOrders.length === 0) {
            alert('No packages in this run to dispatch!');
            return;
          }

          const currentCorridor = corridors.find((c) => c.id === selectedCorridorId);
          const driverObj = staffList.find((s) => s.fullName === assignDriver);
          const vehiclePlate = (driverObj?.assignedAsset || 'B-492102').split(' ')[0];
          const autoTripNo = getAutoTripNumberForDriver(assignDriver);

          const newPathCard: AssignedPathCard = {
            pathId: `RUN-C${selectedCorridorId}-${assignDriver.split(' ')[0]}-T${autoTripNo}-${Date.now().toString().slice(-4)}`,
            corridorId: selectedCorridorId,
            corridorName: currentCorridor?.name || `Corridor ${selectedCorridorId}`,
            driverName: assignDriver,
            vehiclePlate: vehiclePlate,
            tripNo: autoTripNo,
            status: 'READY_FOR_LOADING',
            assignedAt: 'Just Now',
            assignedOrders: combinedRunOrders,
          };

          // Save to Route Cards
          setPathCards((prev) => [newPathCard, ...prev]);

          // Update order statuses
          const dispatchedIds = combinedRunOrders.map((o) => o.id);
          setOrders((prev) =>
            prev.map((o) =>
              dispatchedIds.includes(o.id)
                ? {
                    ...o,
                    assignedDriver: assignDriver,
                    vehiclePlate: vehiclePlate,
                    tripNo: autoTripNo,
                    status: 'QUEUED',
                  }
                : o
            )
          );

          setEnRouteOrderIds([]);
          alert(`✓ Run Dispatched Successfully!\nLoaded ${combinedRunOrders.length} packages (${attachedEnRouteOrders.length} en-route stops) to ${assignDriver} on Trip ${autoTripNo}.\nMoved to Route Cards ready for loading!`);
        };

        const toggleEnRouteOrder = (id: string) => {
          setEnRouteOrderIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          );
        };

        const selectedDriverObj = staffList.find((s) => s.fullName === assignDriver);
        const autoResolvedVehicle = selectedDriverObj?.assignedAsset || 'Toyota HiAce (B-492102)';

        return (
          <div className="space-y-4">
            
            {/* Top Corridor & Driver Dispatch Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Corridor Selector */}
                <div className="flex items-center gap-2.5">
                  <label className="text-xs font-bold text-slate-700">Target Corridor:</label>
                  <select
                    value={selectedCorridorId}
                    onChange={(e) => {
                      setSelectedCorridorId(parseInt(e.target.value));
                      setEnRouteOrderIds([]); // reset attached stops when corridor changes
                    }}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-none min-w-[300px]"
                  >
                    {corridors.map((c) => (
                      <option key={c.id} value={c.id}>
                        Corridor {c.id}: {c.name.split(': ')[1] || c.name} ({c.schedule})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Selector with Auto-Resolved Vehicle */}
                <div className="flex items-center gap-2.5">
                  <label className="text-xs font-bold text-slate-700">Assigned Courier:</label>
                  <select
                    value={assignDriver}
                    onChange={(e) => setAssignDriver(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {staffList.filter((s) => s.type === 'DRIVER').map((d) => (
                      <option key={d.id} value={d.fullName}>
                        {d.fullName} ({d.phone})
                      </option>
                    ))}
                  </select>

                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-mono font-bold text-xs">
                    🚐 {autoResolvedVehicle}
                  </span>

                  <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-xl font-mono font-bold text-xs">
                    ⚡ Auto: Trip {autoCalculatedTripNo}
                  </span>
                </div>

              </div>

              {/* Highway Path Info & En-Route Toolbar */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-500 font-mono">
                  Highway Route: <strong className="text-slate-800">{corridors.find(c => c.id === selectedCorridorId)?.highwayPath}</strong>
                </div>

                {/* EN-ROUTE BUNDLING BUTTON */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnRoutePicker(true)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold border border-blue-200 transition-colors flex items-center gap-1"
                  >
                    <span>📍 Add En-Route Stops (Aramoun, Bchamoun, Dahieh...)</span>
                    {enRouteOrderIds.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">
                        +{enRouteOrderIds.length} added
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchRun}
                    className="px-4 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <span>🚀 Confirm & Dispatch Run ({combinedRunOrders.length} pkgs)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Run Manifest Orders Table (With En-Route Badges & Editable Delivery Fees) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Departure Manifest Queue — Corridor {selectedCorridorId} ({combinedRunOrders.length} Packages Ready)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Stops listed in physical delivery order. En-route waypoints are prioritized first before the highway exit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
                >
                  🖨️ Preview A4 Manifest
                </button>
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                      <th className="py-2.5 px-3 normal-case">sequence</th>
                      <th className="py-2.5 px-3 normal-case">order no.</th>
                      <th className="py-2.5 px-3 normal-case">source entity</th>
                      <th className="py-2.5 px-3 normal-case">customer & destination</th>
                      <th className="py-2.5 px-3 normal-case">packing checklist</th>
                      <th className="py-2.5 px-3 normal-case text-right">product val</th>
                      <th className="py-2.5 px-3 normal-case text-center w-32">delivery fee ($) [manual]</th>
                      <th className="py-2.5 px-3 normal-case text-center">route status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                    {combinedRunOrders.map((order, idx) => {
                      const isEnRoute = enRouteOrderIds.includes(order.id);
                      return (
                        <tr key={order.id} className={isEnRoute ? 'bg-blue-50/40' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                            Stop #{idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{order.orderNo}</td>
                          <td className="py-2.5 px-3">
                            {order.sourceType === 'SOUTHERN_OLIVE' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">🫒 Southern Olive</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300 text-[10px] font-bold">🏢 3PL Merchant</span>
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

                          {/* Route Type Badge */}
                          <td className="py-2.5 px-3 text-center">
                            {isEnRoute ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold">
                                <span>📍 En-Route Stop</span>
                                <button
                                  type="button"
                                  onClick={() => toggleEnRouteOrder(order.id)}
                                  className="text-rose-600 hover:text-rose-800 ml-1 font-extrabold"
                                  title="Remove from this run"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                                Corridor {order.corridorId} Primary
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {combinedRunOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                          No packages currently loaded for Corridor {selectedCorridorId}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EN-ROUTE STOPS SELECTION MODAL */}
            {showEnRoutePicker && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-5 max-w-lg w-full text-xs space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Add En-Route Waypoint Stops</h3>
                      <p className="text-[11px] text-slate-500 font-mono">Select nearby village packages to attach onto this driver's departure route.</p>
                    </div>
                    <button type="button" onClick={() => setShowEnRoutePicker(false)} className="text-slate-400 font-bold text-sm">✕</button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {availableOtherCorridorOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => toggleEnRouteOrder(o.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${enRouteOrderIds.includes(o.id) ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                      >
                        <div>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 mr-2">Corridor {o.corridorId}</span>
                          <strong className="text-slate-900">{o.customerName}</strong>
                          <span className="text-slate-600 block text-[11px] mt-0.5">{o.destinationTown} — {o.addressDetails}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-800 block">$${o.productAmountUsd}</span>
                          <span className={`text-[10px] font-bold ${enRouteOrderIds.includes(o.id) ? 'text-blue-700' : 'text-slate-400'}`}>
                            {enRouteOrderIds.includes(o.id) ? '✓ Attached' : '+ Click to Add'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {availableOtherCorridorOrders.length === 0 && (
                      <div className="py-6 text-center text-slate-400 font-mono text-xs">
                        No additional packages found from other corridors.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setShowEnRoutePicker(false)}
                      className="px-4 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl text-xs"
                    >
                      Done Attaching Stops ({enRouteOrderIds.length} Added)
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* 2. SOUTHERN OLIVE ORDERS (INCOMING FEED — CLEAN TABLE)               */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incoming Orders Feed — Southern Olive Oil Products S.A.R.L</h3>
              <p className="text-[11px] text-slate-400">
                New online/CRM orders awaiting delivery dispatch. Management can switch fulfillment between Delivery and POS Pickup.
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
                      
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'MOVED_TO_POS_PICKUP' ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] inline-flex items-center gap-1">
                              <span>🏪</span> Moved to POS (Read-Only)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReturnToDelivery(o.id, o.repName || 'REP-002')}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] border border-blue-200 transition-colors"
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
                              onClick={() => handleMoveToPosPickup(o.id)}
                              className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded text-[10px] border border-purple-200 transition-colors"
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
      {/* 3. ROUTE CARDS (CONFIRMED & READY FOR LOADING)                      */}
      {/* =================================================================== */}
      {activeTab === 'path-cards' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex justify-between items-center">
            <span>🗂️ <strong>Route Cards:</strong> Confirmed routes. Ready for loading and departure.</span>
            <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white rounded-lg font-bold shadow-xs">
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
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold border border-slate-300"
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
      {/* 4. REPORTS HUB (CLEAN SUB-MENU & FULFILLMENT AUDIT)                 */}
      {/* =================================================================== */}
      {(activeTab === 'reports' || activeTab === 'settlements') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* LEFT REPORT PICKER MENU */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-2xs print:hidden">
              <div className="p-2.5 border-b border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">SuperSonic Reports Catalog</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReportKey('COD_WHISH_SETTLEMENTS')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COD_WHISH_SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>💵 COD, Whish & Settlements</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-mono font-bold">Audit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportKey('FULFILLMENT_AUDIT')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FULFILLMENT_AUDIT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>🔄 Fulfillment Audit (By Who)</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">Logs</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportKey('DRIVER_RECONCILIATION')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'DRIVER_RECONCILIATION' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>📄 Driver Daily Trips Master</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">A4</span>
              </button>
            </div>

            {/* RIGHT MAIN REPORT VIEWPORT */}
            <div className="lg:col-span-9 space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
                <span className="font-bold text-slate-700">Active Report: <strong className="text-[#1e3a2b]">{selectedReportKey}</strong></span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-xl shadow-xs">
                    🖨️ Print A4 Report
                  </button>
                  <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow-xs">
                    📄 Download as PDF
                  </button>
                </div>
              </div>

              {/* FULFILLMENT AUDIT REPORT (BY WHO) */}
              {selectedReportKey === 'FULFILLMENT_AUDIT' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Fulfillment Transition & Audit Trail Report</h3>
                      <p className="text-[11px] text-slate-500 font-mono">Detailed audit of who converted orders between Fleet Delivery and Showroom POS.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b font-bold text-[11px]">
                          <th className="py-2.5 px-3 normal-case">order no.</th>
                          <th className="py-2.5 px-3 normal-case">customer</th>
                          <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                          <th className="py-2.5 px-3 normal-case text-center">transition action</th>
                          <th className="py-2.5 px-3 normal-case text-center">switched by (role)</th>
                          <th className="py-2.5 px-3 normal-case text-center">user code</th>
                          <th className="py-2.5 px-3 normal-case">operator name</th>
                          <th className="py-2.5 px-3 normal-case font-mono">timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {orders.filter(o => o.status === 'MOVED_TO_POS_PICKUP' || o.fulfillmentSwitchedBy).map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                            <td className="py-2.5 px-3">{o.customerName}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">${o.productAmountUsd.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">
                                {o.status === 'MOVED_TO_POS_PICKUP' ? 'Moved to POS' : 'Returned to Delivery'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
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

              {/* COD WHISH REPORT */}
              {selectedReportKey === 'COD_WHISH_SETTLEMENTS' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900">COD, Whish & Settlements Audit Report</h3>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs font-mono">
                    <div>• WSH-0091: Tony Khoury — $200.00 USD (Whish Transfer Ref: WHISH-TX-9988124) — Pending Approval</div>
                    <div>• CSH-0042: Tony Khoury — $250.00 USD (Physical Cash to Vault) — Audited & Cleared ✓</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. REMAINING TABS (3PL, VENDORS, ACCOUNTING, HR, COMPLAINTS, RADAR)   */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">SuperSonic 3PL Commercial Shipments</h3>
            <button onClick={() => setShowAdd3PLModal(true)} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-xl text-xs">
              ➕ Add 3PL Package
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">waybill #</th>
                  <th className="py-2.5 px-3 normal-case">merchant</th>
                  <th className="py-2.5 px-3 normal-case">destination</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod cash</th>
                  <th className="py-2.5 px-3 normal-case text-center">delivery fee</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.filter(o => o.sourceType === 'EXTERNAL_3PL').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold">{o.customerName}</td>
                    <td className="py-2.5 px-3">{o.destinationTown}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">${o.productAmountUsd}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">${o.deliveryFeeUsd}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">3PL Merchant Accounts & Remittance Agreements</h3>
            <button onClick={() => setShowAddVendorModal(true)} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-xl text-xs">
              ➕ Add Vendor
            </button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">vendor id</th>
                  <th className="py-2.5 px-3 normal-case">merchant name</th>
                  <th className="py-2.5 px-3 normal-case">settlement terms</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod in vault</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map(v => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{v.id}</td>
                    <td className="py-2.5 px-3 font-bold">{v.vendorName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-800">{v.settlementTerms}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">${v.currentCodBalanceUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{v.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">SuperSonic Delivery Revenue</span>
              <span className="text-xl font-extrabold text-blue-800">$1,840.00 USD</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">Total COD in Vault</span>
              <span className="text-xl font-extrabold text-emerald-700">$12,450.00 USD</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">Whish Wallet Balance</span>
              <span className="text-xl font-extrabold text-purple-800">$3,210.00 USD</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 block">Fleet Expenses</span>
              <span className="text-xl font-extrabold text-rose-700">-$410.00 USD</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">SuperSonic Dedicated Personnel Roster</h3>
            <button onClick={() => setShowAddStaffModal(true)} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-xl text-xs">
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
                  <th className="py-2.5 px-3 normal-case">ownership</th>
                  <th className="py-2.5 px-3 normal-case text-right">salary/rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map(s => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 font-mono font-bold">{s.id}</td>
                    <td className="py-2 px-3 font-bold text-[#1e3a2b]">{s.fullName}</td>
                    <td className="py-2 px-3">{s.role}</td>
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
          <h3 className="text-sm font-bold text-slate-900">Customer Complaints & Service Quality</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">ticket id</th>
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">courier</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{c.id}</td>
                    <td className="py-2.5 px-3 font-mono">{c.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold">{c.customerName}</td>
                    <td className="py-2.5 px-3">{c.driverName}</td>
                    <td className="py-2.5 px-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{c.status}</span></td>
                    <td className="py-2.5 px-3 text-center">
                      {c.status !== 'RESOLVED' ? (
                        <button onClick={() => setSelectedComplaintForAction(c)} className="px-2 py-1 bg-[#1e3a2b] text-white rounded text-[10px] font-bold">Resolve</button>
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

      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            💡 <strong>Live Telemetry:</strong> Click on any courier below to mirror their active phone session.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {vehicles.map(v => (
              <div key={v.plate} onClick={() => setSelectedVehicleForTelemetry(v)} className="bg-white rounded-2xl border p-4 shadow-2xs hover:border-blue-600 cursor-pointer space-y-2">
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{v.plate}</span>
                <h4 className="font-bold text-xs">{v.model}</h4>
                <span className="text-xs block text-slate-600">Driver: <strong>{v.driver}</strong></span>
                <div className="text-[11px] font-mono text-blue-700">{v.currentSpeedKmH} KM/H • {v.batteryPercent}% 🔋</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pod' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Proof of Delivery (POD) Archives</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer</th>
                  <th className="py-2.5 px-3 normal-case">driver</th>
                  <th className="py-2.5 px-3 normal-case text-center">signature</th>
                  <th className="py-2.5 px-3 normal-case text-right">amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.filter(o => o.status === 'DELIVERED').map(o => (
                  <tr key={o.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold">{o.customerName}</td>
                    <td className="py-2.5 px-3">{o.assignedDriver}</td>
                    <td className="py-2.5 px-3 text-center"><span className="px-2 py-1 bg-slate-100 rounded border font-serif italic text-blue-900 font-bold">✍️ {o.signatureSvg}</span></td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">${o.productAmountUsd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic Company-Owned Fleet Asset Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicles.filter(v => v.ownership === 'COMPANY_OWNED').map(v => (
              <div key={v.plate} className="border rounded-xl p-3 bg-slate-50 text-xs font-mono space-y-1">
                <div className="flex justify-between font-bold"><span>{v.model}</span><span className="text-[#1e3a2b]">{v.category}</span></div>
                <div className="text-slate-500">Plate: {v.plate} | Assigned: {v.driver}</div>
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL MODALS (SAFELY DEFINED) */}
      {selectedOrderForReroute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Re-route Order #{selectedOrderForReroute.orderNo}</h3>
            <div className="space-y-1.5">
              {corridors.map(c => (
                <button key={c.id} type="button" onClick={() => handleExecuteReroute(c.id)} className="w-full text-left px-3 py-2 rounded-lg border hover:bg-slate-100 font-semibold text-slate-800">
                  Corridor {c.id}: {c.name.split(': ')[1] || c.name}
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
            <textarea value={complaintResolutionInput} onChange={(e) => setComplaintResolutionInput(e.target.value)} placeholder="Resolution notes..." rows={3} className="w-full p-2 border rounded-xl" />
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

      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic 3PL Vendor</h3>
            <input type="text" placeholder="Merchant Name" className="w-full p-2 border rounded-xl" />
            <input type="text" placeholder="Contact & Phone" className="w-full p-2 border rounded-xl" />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Vendor saved!'); setShowAddVendorModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save</button>
              <button type="button" onClick={() => setShowAddVendorModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New Staff Member</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setNewStaffType('DRIVER')} className={`flex-1 py-2 rounded-xl border font-bold ${newStaffType === 'DRIVER' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>Driver</button>
              <button type="button" onClick={() => setNewStaffType('ON_SITE')} className={`flex-1 py-2 rounded-xl border font-bold ${newStaffType === 'ON_SITE' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>On-Site</button>
            </div>
            <input type="text" placeholder="Full Name" className="w-full p-2 border rounded-xl" />
            <input type="text" placeholder="Phone" className="w-full p-2 border rounded-xl" />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Staff created!'); setShowAddStaffModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save</button>
              <button type="button" onClick={() => setShowAddStaffModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAdd3PLModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Shipment</h3>
            <input type="text" placeholder="Merchant Name" className="w-full p-2 border rounded-xl" />
            <input type="text" placeholder="Recipient & Phone" className="w-full p-2 border rounded-xl" />
            <input type="text" placeholder="Destination Town" className="w-full p-2 border rounded-xl" />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ 3PL Package Saved!'); setShowAdd3PLModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save</button>
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
    <Suspense fallback={<div className="p-4 text-xs font-mono text-slate-600">Loading SuperSonic Fleet...</div>}>
      <SuperSonicFleetPageContent />
    </Suspense>
  );
}
