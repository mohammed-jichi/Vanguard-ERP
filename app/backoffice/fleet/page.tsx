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
  const [vendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(initialComplaints);
  const [ledger] = useState(initialLedger);

  // Corridor Selection in Dispatch
  const [selectedCorridorId, setSelectedCorridorId] = useState<number>(3); // Default Corridor 3: South
  const [assignDriver, setAssignDriver] = useState<string>('Hassan Sleiman');
  const [assignVehicle, setAssignVehicle] = useState<string>('S-772910 (Car 01)');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Waypoint En-Route Modal (Adding Aramoun/Bchamoun/Dahieh to South or Mountain Runs)
  const [showEnRouteModal, setShowEnRouteModal] = useState<boolean>(false);

  // Route Cards (Active Ready-to-Load Manifests)
  const [pathCards, setPathCards] = useState<AssignedPathCard[]>([
    {
      pathId: 'ROUTE-C1-TONY-T1',
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

  // Reports selection state (strictly declared at top level for React rules of hooks)
  const [selectedReportKey, setSelectedReportKey] = useState<'COD_WHISH' | 'FULFILLMENT_AUDIT' | 'TRIPS_MASTER'>('COD_WHISH');

  // Modals
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedOrderForReroute, setSelectedOrderForReroute] = useState<DispatchedOrder | null>(null);
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CustomerComplaintTicket | null>(null);
  const [complaintResolutionInput, setComplaintResolutionInput] = useState('');
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Current corridor orders
  const currentCorridorOrders = orders.filter(
    (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
  );

  // Orders available from other corridors to attach as en-route waypoints
  const otherCorridorWaypoints = orders.filter(
    (o) => o.corridorId !== selectedCorridorId && o.status === 'QUEUED' && o.assignedDriver === '-'
  );

  // Pre-select all corridor packages by default
  useEffect(() => {
    setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
  }, [selectedCorridorId]);

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

  // Attach En-Route Waypoint Stop (e.g. Aramoun/Bchamoun before heading South)
  const handleAttachWaypointOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, corridorId: selectedCorridorId } // Transfers package into the active corridor run
          : o
      )
    );
    setSelectedOrderIds((prev) => [...prev, orderId]);
    alert(`✓ En-Route stop attached to Corridor ${selectedCorridorId} manifest!`);
  };

  // Bidirectional Fulfillment Switching Handlers with Audit Logging
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
                actorName: 'SuperSonic Operations Desk',
                timestamp: 'Today 09:15 AM',
                actionType: 'MOVED_TO_POS',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} moved to Showroom POS Pickup! Locked as read-only for fleet.`);
  };

  const handleReturnToDelivery = (orderId: string, repCode = 'REP-002', repName = 'Ahmad Ali Kassem') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'QUEUED',
              corridorId: 1,
              fulfillmentSwitchedBy: {
                actorType: 'REPRESENTATIVE',
                actorCode: repCode,
                actorName: repName,
                timestamp: 'Just Now',
                actionType: 'RETURNED_TO_DELIVERY',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} returned to Fleet Delivery queue!`);
  };

  // Save & Load to Driver (Builds Route Card)
  const handleSaveAndAssignToDelivery = () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one package to load!');
      return;
    }

    const currentCorridor = corridors.find((c) => c.id === selectedCorridorId);
    const assignedOrdersList = orders.filter((o) => selectedOrderIds.includes(o.id));

    const newPathCard: AssignedPathCard = {
      pathId: `ROUTE-C${selectedCorridorId}-${assignDriver.split(' ')[0]}-T${autoCalculatedTripNo}-${Date.now().toString().slice(-4)}`,
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
    alert(`✓ Success! ${assignedOrdersList.length} packages loaded to ${assignDriver} on Trip ${autoCalculatedTripNo} (Including attached waypoints).\nMoved to Route Cards ready for departure!`);
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
              {activeTab === 'southern-olive' && 'Southern Olive Oil In-House Orders (Incoming Feed)'}
              {activeTab === '3pl-orders' && 'SuperSonic 3PL Commercial Orders'}
              {activeTab === 'dispatch' && 'Corridors & Regional Dispatch (With Waypoint Co-Loading)'}
              {activeTab === 'path-cards' && 'Route Cards (Confirmed Runs Ready for Departure)'}
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
      {/* 1. DISPATCH: CORRIDORS + EN-ROUTE WAYPOINTS (ARAMOUN/BCHAMOUN/SOUTH)*/}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          
          {/* Corridor Dropdown Selector & Driver Assignment Toolbar */}
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

              {/* EN-ROUTE WAYPOINT CO-LOADING TRIGGER */}
              <button
                type="button"
                onClick={() => setShowEnRouteModal(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Add nearby packages (like Aramoun, Bchamoun, Dahieh) to this departure run"
              >
                <span>➕ Add En-Route Stops (Aramoun, Bchamoun, Dahieh...)</span>
              </button>
            </div>

            {/* Assignment Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Assign to Driver:</label>
                  <select
                    value={assignDriver}
                    onChange={(e) => setAssignDriver(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    {staffList.filter((s) => s.type === 'DRIVER').map((d) => (
                      <option key={d.id} value={d.fullName}>{d.fullName} ({d.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Registered Vehicle:</label>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-mono font-bold text-xs">
                    🚐 {staffList.find((s) => s.fullName === assignDriver)?.assignedAsset || 'Toyota HiAce B-492102'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Trip Sequence:</label>
                  <span className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-lg font-mono font-bold text-xs flex items-center gap-1">
                    <span>⚡</span>
                    <span>Auto: Trip {autoCalculatedTripNo}</span>
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-600 pl-2">
                  Loaded: <strong className="text-[#1e3a2b]">{selectedOrderIds.length} stops</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAndAssignToDelivery}
                className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-colors"
              >
                <span>📦 Save & Load to Driver (Move to Route Cards)</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Corridor {selectedCorridorId} Packages Waiting for Vehicle Loading
                </h3>
                <p className="text-[11px] text-slate-400">All stops pre-selected. Edit delivery fees manually if desired.</p>
              </div>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs border border-slate-300"
              >
                {selectedOrderIds.length === currentCorridorOrders.length ? 'Deselect All' : 'Select All Packages'}
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                    <th className="py-2.5 px-3 normal-case w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length > 0 && selectedOrderIds.length === currentCorridorOrders.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-[#1e3a2b]"
                      />
                    </th>
                    <th className="py-2.5 px-3 normal-case">order no.</th>
                    <th className="py-2.5 px-3 normal-case">source entity</th>
                    <th className="py-2.5 px-3 normal-case">customer & destination</th>
                    <th className="py-2.5 px-3 normal-case">packing checklist</th>
                    <th className="py-2.5 px-3 normal-case text-right">product val</th>
                    <th className="py-2.5 px-3 normal-case text-center w-32">delivery fee ($) [manual]</th>
                    <th className="py-2.5 px-3 normal-case text-center">actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                  {currentCorridorOrders.map((order) => {
                    const isChecked = selectedOrderIds.includes(order.id);
                    return (
                      <tr key={order.id} className={isChecked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 rounded text-[#1e3a2b]"
                          />
                        </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. SOUTHERN OLIVE ORDERS (INCOMING INBOX WITH CLEAN ROW ATTRIBUTION)*/}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incoming Orders Feed — Southern Olive Oil Products S.A.R.L</h3>
              <p className="text-[11px] text-slate-400">
                New online orders awaiting delivery. Management can switch orders between Fleet Delivery and Showroom POS Pickup.
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
                  <th className="py-2.5 px-3 normal-case">order number</th>
                  <th className="py-2.5 px-3 normal-case">sales rep</th>
                  <th className="py-2.5 px-3 normal-case">customer details</th>
                  <th className="py-2.5 px-3 normal-case">destination details</th>
                  <th className="py-2.5 px-3 normal-case">item details</th>
                  <th className="py-2.5 px-3 normal-case text-right">COD cash</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
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
                      <td className="py-2.5 px-3 text-purple-800 font-semibold">{o.repName}</td>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900 block">{o.customerName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono block">{o.phone}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-800 block">{o.destinationTown}</strong>
                        <span className="text-[10px] text-slate-500 font-mono block">{o.addressDetails}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd.toFixed(2)}`}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'MOVED_TO_POS_PICKUP' ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px]">
                            Moved to POS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'MOVED_TO_POS_PICKUP' ? (
                          <button
                            type="button"
                            onClick={() => handleReturnToDelivery(o.id)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] border border-blue-200"
                          >
                            🚚 Return to Delivery
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMoveToPosPickup(o.id)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded text-[10px] border border-purple-200"
                          >
                            🏪 Move to POS Pickup
                          </button>
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
      {/* 3. ROUTE CARDS (CONFIRMED RUNS READY FOR LOADING & A4 PRINT)        */}
      {/* =================================================================== */}
      {activeTab === 'path-cards' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex justify-between items-center">
            <span>🗂️ <strong>Route Cards:</strong> Confirmed departure manifests with attached waypoints. Ready for warehouse loading.</span>
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
      {/* 4. SUPERSONIC 3PL ORDERS                                            */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between items-center">
            <span>💡 <strong>3PL Commercial Orders:</strong> External merchant packages. Delivery fees are flexible and editable per package.</span>
            <button type="button" onClick={() => setShowAdd3PLModal(true)} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white rounded-lg font-bold shadow-xs">
              ➕ Add 3PL Package
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl bg-white p-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">waybill #</th>
                  <th className="py-2.5 px-3 normal-case">merchant</th>
                  <th className="py-2.5 px-3 normal-case">recipient & phone</th>
                  <th className="py-2.5 px-3 normal-case">destination town</th>
                  <th className="py-2.5 px-3 normal-case">cargo description</th>
                  <th className="py-2.5 px-3 normal-case text-right">cod cash</th>
                  <th className="py-2.5 px-3 normal-case text-center">delivery fee (read-only)</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders.filter(o => o.sourceType === 'EXTERNAL_3PL').map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-3">
                      <strong className="text-slate-800 block">{o.customerName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{o.phone}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <strong className="text-slate-800 block">{o.destinationTown}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{o.addressDetails}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">{o.items}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd.toFixed(2)}</td>
                    {/* STRICTLY READ-ONLY DELIVERY FEE */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold text-blue-700 text-xs">
                        ${o.deliveryFeeUsd.toFixed(2)}
                      </span>
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
      {/* 7. HR & STAFF REGISTRY                                              */}
      {/* =================================================================== */}
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

      {/* =================================================================== */}
      {/* 8. CUSTOMER COMPLAINTS                                              */}
      {/* =================================================================== */}
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
                    <td className="py-2.5 px-3 text-center">
                      {c.status !== 'RESOLVED' ? (
                        <div className="flex gap-1.5 justify-center">
                          <a href={`https://wa.me/961${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">💬 WhatsApp</a>
                          <button onClick={() => setSelectedComplaintForAction(c)} className="px-2 py-1 bg-[#1e3a2b] text-white rounded text-[10px] font-bold">Resolve</button>
                        </div>
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
      {/* 9. SUPERSONIC MASTER REPORTS HUB                                    */}
      {/* =================================================================== */}
      {(activeTab === 'reports' || activeTab === 'settlements') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-2xs print:hidden">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block p-2 border-b border-slate-100">Reports Catalog</span>
            <button
              type="button"
              onClick={() => setSelectedReportKey('COD_WHISH')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COD_WHISH' ? 'bg-[#1e3a2b] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <span>💵 COD, Whish & Settlements</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-mono font-bold">Audit</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedReportKey('FULFILLMENT_AUDIT')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FULFILLMENT_AUDIT' ? 'bg-[#1e3a2b] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <span>🔄 Fulfillment Audit (By Who)</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">Logs</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedReportKey('TRIPS_MASTER')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'TRIPS_MASTER' ? 'bg-[#1e3a2b] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <span>📄 Driver Daily Trips Master</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">A4</span>
            </button>
          </div>

          <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {selectedReportKey === 'COD_WHISH' && 'COD, Whish & Settlements Audit Report'}
                {selectedReportKey === 'FULFILLMENT_AUDIT' && 'Fulfillment Transition & Audit Trail Report (By Who)'}
                {selectedReportKey === 'TRIPS_MASTER' && 'Driver Daily Trips Master Reconciliation Report'}
              </h3>
              <div className="flex gap-2 print:hidden">
                <button type="button" onClick={() => window.print()} className="px-3 py-1 bg-[#1e3a2b] text-white font-bold rounded-lg text-xs">🖨️ Print A4</button>
              </div>
            </div>

            {selectedReportKey === 'FULFILLMENT_AUDIT' && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b font-bold text-[11px]">
                      <th className="py-2.5 px-3 normal-case">order no.</th>
                      <th className="py-2.5 px-3 normal-case">customer</th>
                      <th className="py-2.5 px-3 normal-case text-center">transition action</th>
                      <th className="py-2.5 px-3 normal-case text-center">switched by (role)</th>
                      <th className="py-2.5 px-3 normal-case text-center">actor code</th>
                      <th className="py-2.5 px-3 normal-case font-mono">timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {orders.filter(o => o.status === 'MOVED_TO_POS_PICKUP' || o.fulfillmentSwitchedBy).map((o) => (
                      <tr key={o.id}>
                        <td className="py-2 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                        <td className="py-2 px-3">{o.customerName}</td>
                        <td className="py-2 px-3 text-center">
                          {o.status === 'MOVED_TO_POS_PICKUP' ? (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">Moved to POS</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">Returned to Delivery</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          {o.fulfillmentSwitchedBy?.actorType || 'MANAGEMENT'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-purple-800">
                          {o.fulfillmentSwitchedBy?.actorCode || 'MGR-01'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">
                          {o.fulfillmentSwitchedBy?.timestamp || 'Today 09:15 AM'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReportKey === 'COD_WHISH' && (
              <div className="text-xs text-slate-600 font-mono p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>• Vault Cash Deposit: $250.00 USD (Dep: VAULT-DEP-4920) — Audited ✓</div>
                <div>• Whish Remote Transfer: $200.00 USD (Ref: WHISH-TX-9988124) — Approved ✓</div>
                <div className="mt-2 text-emerald-800 font-bold">Net Audited Balance: $450.00 USD</div>
              </div>
            )}

            {selectedReportKey === 'TRIPS_MASTER' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-xs">Select Driver:</label>
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
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div><strong>Driver:</strong> {currentReportVehicle.driver} ({currentReportVehicle.phone})</div>
                  <div><strong>Vehicle:</strong> {currentReportVehicle.model} ({currentReportVehicle.plate})</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. RADAR, POD, VEHICLES                                            */}
      {/* =================================================================== */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {vehicles.map((v) => (
              <div
                key={v.plate}
                onClick={() => setSelectedVehicleForTelemetry(v)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-600 p-4 shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{v.plate}</span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{v.model}</h4>
                    <span className="text-[11px] text-slate-600 block">Driver: <strong>{v.driver}</strong></span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{v.status}</span>
                </div>
                <div className="pt-1 text-center text-xs text-blue-600 font-bold">📱 Mirror Driver Phone Screen ➔</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <span className="px-2 py-1 bg-slate-100 rounded border font-serif italic text-blue-900 font-bold">✍️ {o.signatureSvg || 'Customer Sig'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                <div className="text-blue-700 font-bold">Current Odometer: {v.currentKm.toLocaleString()} KM</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EN-ROUTE WAYPOINT CO-LOADING (ARAMOUN, BCHAMOUN, DAHIEH)     */}
      {/* =================================================================== */}
      {showEnRouteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-xl w-full p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Attach En-Route Waypoint Stops to Corridor {selectedCorridorId} Run</h3>
                <p className="text-[11px] text-slate-500">
                  Select packages from nearby zones (Aramoun, Bchamoun, Dahieh) that the driver can deliver on his way departing Choueifat.
                </p>
              </div>
              <button type="button" onClick={() => setShowEnRouteModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {otherCorridorWaypoints.map((wp) => (
                <div key={wp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="block text-slate-900">{wp.customerName} ({wp.orderNo})</strong>
                    <span className="text-[11px] text-blue-700 font-bold">{wp.destinationTown}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{wp.addressDetails} — {wp.items}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleAttachWaypointOrder(wp.id);
                      setShowEnRouteModal(false);
                    }}
                    className="px-3 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs"
                  >
                    ➕ Attach to Run
                  </button>
                </div>
              ))}

              {otherCorridorWaypoints.length === 0 && (
                <div className="text-center py-6 text-slate-400 font-mono text-xs">
                  No other unassigned packages currently available for waypoint attachment.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button type="button" onClick={() => setShowEnRouteModal(false)} className="px-4 py-1.5 bg-slate-200 font-bold rounded-lg text-xs">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* OTHER MODALS */}
      {selectedOrderForReroute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Re-route Order #{selectedOrderForReroute.orderNo}</h3>
            <div className="space-y-1.5">
              {corridors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleExecuteReroute(c.id)}
                  className="w-full text-left px-3 py-2 rounded-lg border hover:bg-slate-100 font-semibold text-slate-800"
                >
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
            <p className="text-slate-600"><strong>Customer:</strong> {selectedComplaintForAction.customerName} ({selectedComplaintForAction.phone})</p>
            <textarea
              value={complaintResolutionInput}
              onChange={(e) => setComplaintResolutionInput(e.target.value)}
              placeholder="Resolution notes..."
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
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setSelectedVehicleForTelemetry(null)} className="px-4 py-1.5 bg-slate-200 text-slate-800 font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic 3PL Vendor</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Beirut Gourmet" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('Vendor saved!'); setShowAddVendorModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save</button>
              <button type="button" onClick={() => setShowAddVendorModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic Staff Member</h3>
            <div><label className="font-bold block mb-1">Full Name:</label><input type="text" placeholder="e.g. Jad Mansour" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('Staff profile created!'); setShowAddStaffModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save</button>
              <button type="button" onClick={() => setShowAddStaffModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED 3PL MODAL: WAYBILL # FIRST + LEBANESE DESTINATION SELECTOR */}
      {showAdd3PLModal && (
        <Add3PLPackageModal
          vendors={vendors}
          onClose={() => setShowAdd3PLModal(false)}
          onSave={(newOrder) => setOrders((prev) => [newOrder, ...prev])}
        />
      )}

    </div>
  );
}

function Add3PLPackageModal({
  vendors,
  onClose,
  onSave,
}: {
  vendors: SuperSonicVendor[];
  onClose: () => void;
  onSave: (order: DispatchedOrder) => void;
}) {
  const [waybillInput, setWaybillInput] = useState(`WB-3PL-${Math.floor(10000 + Math.random() * 90000)}`);
  const [merchantInput, setMerchantInput] = useState('La Rose Fashion Boutique');
  const [custNameInput, setCustNameInput] = useState('');
  const [custPhoneInput, setCustPhoneInput] = useState('');
  const [governorateInput, setGovernorateInput] = useState('Mount Lebanon');
  const [districtInput, setDistrictInput] = useState('Aley');
  const [townInput, setTownInput] = useState('Aramoun');
  const [addressDetailsInput, setAddressDetailsInput] = useState('');
  const [cargoInput, setCargoInput] = useState('');
  const [codInput, setCodInput] = useState<number>(35.0);
  const [feeInput, setFeeInput] = useState<number>(3.0);

  const handleSave3PLPackage = () => {
    if (!custNameInput || !custPhoneInput) {
      alert('Please enter Customer Details (Full Name and Phone Number)!');
      return;
    }

    // Auto-resolve corridor from Lebanese destination district
    let resolvedCorridor = 1;
    if (districtInput === 'Aley' || districtInput === 'Chouf' || townInput.includes('Aramoun') || townInput.includes('Bchamoun')) resolvedCorridor = 2;
    else if (districtInput === 'Saida' || districtInput === 'Tyre' || districtInput === 'Nabatieh') resolvedCorridor = 3;
    else if (districtInput === 'Keserwan' || districtInput === 'Jbeil' || districtInput === 'Batroun') resolvedCorridor = 4;
    else if (districtInput === 'Tripoli' || districtInput === 'Akkar') resolvedCorridor = 5;
    else if (districtInput === 'Zahle' || districtInput === 'West Bekaa') resolvedCorridor = 6;
    else if (districtInput === 'Baalbek' || districtInput === 'Hermel') resolvedCorridor = 7;

    const newOrder: DispatchedOrder = {
      id: `3PL-${Date.now().toString().slice(-5)}`,
      orderNo: waybillInput,
      sourceType: 'EXTERNAL_3PL',
      customerName: custNameInput,
      phone: custPhoneInput,
      corridorId: resolvedCorridor,
      tripNo: 0,
      destinationTown: `${townInput} (${districtInput})`,
      addressDetails: addressDetailsInput || 'Standard Delivery Address',
      items: cargoInput || 'Commercial Parcel',
      productAmountLbp: 0,
      productAmountUsd: codInput,
      deliveryFeeUsd: feeInput,
      assignedDriver: '-',
      vehiclePlate: '-',
      status: 'QUEUED',
    };

    onSave(newOrder);
    alert(`✓ Package ${waybillInput} added successfully!\nRouted automatically to Corridor ${resolvedCorridor} (${townInput}).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full p-5 space-y-3.5 text-xs text-slate-800">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 bg-slate-50 -mx-5 -mt-5 p-4 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Commercial Package</h3>
            <span className="text-[10.5px] text-slate-500 font-mono">SuperSonic Central Logistics Hub Entry</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
        </div>

        {/* 1. WAYBILL NUMBER FIRST */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">1. Waybill Number (#):</label>
            <input
              type="text"
              value={waybillInput}
              onChange={(e) => setWaybillInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-blue-50/60 border border-blue-300 rounded-xl font-mono font-bold text-blue-900"
            />
          </div>
          {/* 2. MERCHANT NAME */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">2. Merchant Name:</label>
            <select
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.vendorName}>{v.vendorName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. CUSTOMER DETAILS (MANUAL) */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold text-slate-800 text-[11px] block">3. Recipient Customer Details (Manual Input):</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Recipient Full Name (e.g. Ziad Nassar)"
              value={custNameInput}
              onChange={(e) => setCustNameInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
            <input
              type="text"
              placeholder="Phone Number (e.g. 03-554433)"
              value={custPhoneInput}
              onChange={(e) => setCustPhoneInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        {/* 4. DESTINATION DETAILS (CASCADING LEBANESE REGIONS) */}
        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
          <span className="font-bold text-emerald-900 text-[11px] block">4. Destination Details (Lebanese Administrative Selector):</span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Governorate:</label>
              <select
                value={governorateInput}
                onChange={(e) => setGovernorateInput(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="Mount Lebanon">Mount Lebanon</option>
                <option value="Beirut">Beirut</option>
                <option value="South Lebanon">South Lebanon</option>
                <option value="North Lebanon">North Lebanon</option>
                <option value="Bekaa">Bekaa</option>
                <option value="Nabatieh">Nabatieh</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">District (Caza):</label>
              <select
                value={districtInput}
                onChange={(e) => setDistrictInput(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              >
                <option value="Aley">Aley</option>
                <option value="Chouf">Chouf</option>
                <option value="Baabda">Baabda</option>
                <option value="Beirut">Beirut Center</option>
                <option value="Saida">Saida</option>
                <option value="Tyre">Tyre (Sour)</option>
                <option value="Tripoli">Tripoli</option>
                <option value="Zahle">Zahle</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Town / Village:</label>
              <select
                value={townInput}
                onChange={(e) => setTownInput(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-900"
              >
                <option value="Aramoun">Aramoun</option>
                <option value="Bchamoun">Bchamoun</option>
                <option value="Qabr Chmoun">Qabr Chmoun</option>
                <option value="Choueifat Gateway">Choueifat Gateway</option>
                <option value="Khalde">Khalde</option>
                <option value="Saida Center">Saida Center</option>
                <option value="Tyre Port">Tyre Port</option>
                <option value="Hamra">Beirut - Hamra</option>
              </select>
            </div>
          </div>
          <input
            type="text"
            placeholder="Detailed Address (Street, Building, Floor, Landmark notes...)"
            value={addressDetailsInput}
            onChange={(e) => setAddressDetailsInput(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* 5. ITEM CARGO DESCRIPTION */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">5. Item Cargo Description:</label>
          <input
            type="text"
            placeholder="e.g. 2x Apparel Packages, 1x Shoes Box"
            value={cargoInput}
            onChange={(e) => setCargoInput(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
        </div>

        {/* 6 & 7. COD CASH AND DELIVERY FEE */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">6. COD Cash to Collect ($):</label>
            <input
              type="number"
              value={codInput}
              onChange={(e) => setCodInput(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800 text-sm"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">7. Delivery Fee ($):</label>
            <input
              type="number"
              value={feeInput}
              onChange={(e) => setFeeInput(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-700 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSave3PLPackage}
            className="flex-1 py-2.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md"
          >
            ✓ Save & Route Package by Lebanese Region
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperSonicFleetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500 font-mono">Loading SuperSonic Fleet Workspace...</div>}>
      <SuperSonicFleetPageContent />
    </Suspense>
  );
}
