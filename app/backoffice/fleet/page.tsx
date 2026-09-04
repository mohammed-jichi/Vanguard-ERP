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
  isCrossRouteAttached?: boolean;
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

function SuperSonicFleetMasterSuiteContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'southern-olive';

  // Master State
  const [corridors] = useState(initialCorridors);
  const [vehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [orders, setOrders] = useState<DispatchedOrder[]>([
    ...(initialOrders as DispatchedOrder[]),
    {
      id: 'ORD-103355',
      orderNo: 'ORD-103355',
      sourceType: 'SOUTHERN_OLIVE',
      customerName: 'Samir Daou Preserves',
      phone: '05-430112',
      corridorId: 2, // Naturally in Corridor 2 (Mount Lebanon / Bchamoun)
      tripNo: 0,
      destinationTown: 'Bchamoun - Schools Street',
      addressDetails: 'Near Modern School Complex, Ground Floor',
      items: '2x 17.5L Extra Virgin Bulk Tins + 4x Makdous Jars',
      productAmountLbp: 18000000,
      productAmountUsd: 200.0,
      deliveryFeeUsd: 3.5,
      assignedDriver: '-',
      vehiclePlate: '-',
      status: 'QUEUED',
      repName: 'Ahmad Ali Kassem (REP-002)',
    },
    {
      id: '3PL-88130',
      orderNo: '3PL-88130',
      sourceType: 'EXTERNAL_3PL',
      customerName: 'Aramoun Textile Depot',
      phone: '05-801299',
      corridorId: 2, // Naturally in Corridor 2 (Aramoun)
      tripNo: 0,
      destinationTown: 'Aramoun - Main Boulevard',
      addressDetails: 'Facing Municipality Garden',
      items: '1x Commercial Linen Package (Dry Goods)',
      productAmountLbp: 4500000,
      productAmountUsd: 50.0,
      deliveryFeeUsd: 3.0,
      assignedDriver: '-',
      vehiclePlate: '-',
      status: 'QUEUED',
    },
  ]);

  const [vendors, setVendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(initialComplaints);
  const [ledger] = useState(initialLedger);

  // 1. DISPATCH CONTROLS & AUTO-TRIP
  const [selectedCorridorId, setSelectedCorridorId] = useState<number>(3); // Defaults to South (Corridor 3)
  const [assignDriver, setAssignDriver] = useState<string>('Hassan Sleiman');
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
      assignedOrders: [
        initialOrders[0] as DispatchedOrder, 
        initialOrders[1] as DispatchedOrder
      ],
    },
  ]);

  // Top-level hooks for reports tab to strictly adhere to React rules of hooks
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

  // Modals
  const [showAttachNearbyModal, setShowAttachNearbyModal] = useState(false);
  const [selectedOrderForReroute, setSelectedOrderForReroute] = useState<DispatchedOrder | null>(null);
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CustomerComplaintTicket | null>(null);
  const [complaintResolutionInput, setComplaintResolutionInput] = useState('');
  const [selectedPodOrder, setSelectedPodOrder] = useState<DispatchedOrder | null>(null);
  const [selectedDriverForReport, setSelectedDriverForReport] = useState<string>('Tony Khoury');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'DRIVER' | 'ON_SITE'>('DRIVER');
  const [showAdd3PLModal, setShowAdd3PLModal] = useState(false);

  // Current Corridor Orders waiting for assignment
  const currentCorridorOrders = orders.filter(
    (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP' && o.status !== 'DELIVERED'
  );

  // Pre-select all corridor packages by default
  useEffect(() => {
    setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
  }, [selectedCorridorId, orders.length]);

  // Automatic Trip Sequencing per driver
  const getAutoTripNumberForDriver = (driverName: string) => {
    const driverExistingRuns = pathCards.filter((p) => p.driverName === driverName);
    return driverExistingRuns.length + 1;
  };
  const autoCalculatedTripNo = getAutoTripNumberForDriver(assignDriver);

  // Get selected driver vehicle automatically from registration
  const getDriverRegisteredVehicle = (driverName: string) => {
    const driverObj = staffList.find((s) => s.fullName === driverName);
    return driverObj?.assignedAsset || 'B-492102 (Van 01)';
  };

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

  // Cross-Route Attach Action (e.g. Attaching Aramoun / Bchamoun to South line)
  const handleAttachOrderToCurrentRun = (orderToAttach: DispatchedOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderToAttach.id
          ? {
              ...o,
              corridorId: selectedCorridorId,
              isCrossRouteAttached: true,
            }
          : o
      )
    );
    setSelectedOrderIds((prev) => [...prev, orderToAttach.id]);
    alert(`✓ Attached: ${orderToAttach.customerName} (${orderToAttach.destinationTown}) added as an On-The-Way stop to Corridor ${selectedCorridorId}!`);
  };

  // Save & Confirm Run to Driver (Moves to Route Cards)
  const handleSaveAndAssignToDelivery = () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one package to load onto this run!');
      return;
    }

    const currentCorridor = corridors.find((c) => c.id === selectedCorridorId);
    const assignedOrdersList = orders.filter((o) => selectedOrderIds.includes(o.id));
    const vehicleAssigned = getDriverRegisteredVehicle(assignDriver).split(' ')[0];

    const newPathCard: AssignedPathCard = {
      pathId: `ROUTE-C${selectedCorridorId}-${assignDriver.split(' ')[0]}-T${autoCalculatedTripNo}-${Date.now().toString().slice(-4)}`,
      corridorId: selectedCorridorId,
      corridorName: currentCorridor?.name || `Corridor ${selectedCorridorId}`,
      driverName: assignDriver,
      vehiclePlate: vehicleAssigned,
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
              vehiclePlate: vehicleAssigned,
              tripNo: autoCalculatedTripNo,
              status: 'QUEUED',
            }
          : o
      )
    );

    setSelectedOrderIds([]);
    alert(`✓ Run Confirmed & Dispatched!\n${assignedOrdersList.length} packages (including cross-route stops) loaded to ${assignDriver} on Trip ${autoCalculatedTripNo}.\nMoved to Route Cards ready for A4 manifest printing!`);
  };

  // Bidirectional Fulfillment Switching
  const handleMoveToPosPickup = (
    orderId: string,
    actorType: 'MANAGEMENT' | 'REPRESENTATIVE' = 'MANAGEMENT',
    actorCode = 'MGR-01',
    actorName = 'SuperSonic Operations Desk'
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
                actorType: actorType,
                actorCode: actorCode,
                actorName: actorName,
                timestamp: 'Just Now',
                actionType: 'MOVED_TO_POS',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} moved to Showroom POS Pickup!\nLocked as Read-Only for Fleet and activated at Showroom.`);
  };

  const handleReturnToDelivery = (
    orderId: string,
    actorType: 'REPRESENTATIVE' | 'MANAGEMENT' = 'REPRESENTATIVE',
    repCode = 'REP-002',
    repName = 'Ahmad Ali Kassem'
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'QUEUED',
              corridorId: 1,
              fulfillmentSwitchedBy: {
                actorType: actorType,
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

  // Corridor Re-routing
  const handleExecuteReroute = (targetCorridorId: number) => {
    if (!selectedOrderForReroute) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderForReroute.id ? { ...o, corridorId: targetCorridorId } : o))
    );
    alert(`✓ Order #${selectedOrderForReroute.orderNo} transferred to Corridor ${targetCorridorId}!`);
    setSelectedOrderForReroute(null);
  };

  // Complaint Resolution
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

  // Candidate cross-route orders (Aramoun, Bchamoun, Dahieh, Khalde) that can be co-loaded
  const potentialCrossRouteOrders = orders.filter(
    (o) => o.corridorId !== selectedCorridorId && o.status === 'QUEUED' && !o.isCrossRouteAttached
  );

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
              {activeTab === '3pl-orders' && 'SuperSonic 3PL Commercial Orders (By Path)'}
              {activeTab === 'dispatch' && 'Corridors & Regional Dispatch (Co-Loading Hub)'}
              {activeTab === 'path-cards' && 'Route Cards (Confirmed Runs Ready for Loading)'}
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
      {/* 1. SOUTHERN OLIVE ORDERS (CLEAN INCOMING FEED — NO SUB-BADGES)      */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incoming Orders Feed — Southern Olive Oil Products S.A.R.L</h3>
              <p className="text-[11px] text-slate-400">
                New incoming orders waiting for fulfillment. Management can transition orders between Fleet Delivery and Showroom POS Pickup.
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
                  <th className="py-2.5 px-3 normal-case">packing items</th>
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
                      
                      {/* SAFE & VALID FULFILLMENT STATUS CELL */}
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'MOVED_TO_POS_PICKUP' ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] inline-flex items-center gap-1">
                              <span>🏪</span> Moved to POS (Read-Only)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const repMatch = o.repName ? o.repName.match(/\(([^)]+)\)/) : null;
                                const repCode = repMatch && repMatch[1] ? repMatch[1] : 'REP-002';
                                handleReturnToDelivery(o.id, 'REPRESENTATIVE', repCode, o.repName || 'Sales Rep');
                              }}
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
      {/* 1. DISPATCH: STREAMLINED CORRIDOR RUN BUILDER & EN-ROUTE CO-LOADING */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (() => {
        // En-Route Cross-Corridor Co-Loading State
        const [showEnRouteModal, setShowEnRouteModal] = useState(false);
        const [enRouteSourceCorridorId, setEnRouteSourceCorridorId] = useState<number>(2); // Default to Corridor 2 (Aramoun/Bchamoun)
        const [selectedEnRouteOrderIds, setSelectedEnRouteOrderIds] = useState<string[]>([]);

        // Active driver's vehicle and auto trip
        const selectedDriverObj = staffList.find((s) => s.fullName === assignDriver);
        const autoVehicle = selectedDriverObj?.assignedAsset || 'Toyota HiAce (B-492102)';

        // Current primary corridor orders + any en-route orders appended
        const primaryOrders = orders.filter(
          (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
        );

        // Candidate orders from other corridors available to be picked up en-route
        const candidateEnRouteOrders = orders.filter(
          (o) => o.corridorId === enRouteSourceCorridorId && o.corridorId !== selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
        );

        // Append En-Route Orders to Current Corridor Run
        const handleAppendEnRouteOrders = () => {
          if (selectedEnRouteOrderIds.length === 0) {
            alert('Please select at least one en-route package to append!');
            return;
          }

          // Transfer selected en-route packages into the primary corridor run
          setOrders((prev) =>
            prev.map((o) =>
              selectedEnRouteOrderIds.includes(o.id)
                ? {
                    ...o,
                    corridorId: selectedCorridorId, // Temporarily co-loaded into this corridor run
                    assignedDriver: assignDriver,
                    vehiclePlate: autoVehicle.split(' ')[0],
                  }
                : o
            )
          );

          alert(`✓ Appended ${selectedEnRouteOrderIds.length} en-route stops (Aramoun / adjacent areas) to ${assignDriver}'s run!`);
          setSelectedEnRouteOrderIds([]);
          setShowEnRouteModal(false);
        };

        // Master Dispatch Action: Dispatches all queued orders directly to Driver's Phone
        const handleDispatchRunToDriver = () => {
          if (primaryOrders.length === 0) {
            alert('No packages in this corridor run to dispatch!');
            return;
          }

          const currentCorridor = corridors.find((c) => c.id === selectedCorridorId);
          const autoTripNo = getAutoTripNumberForDriver(assignDriver);

          const newPathCard: AssignedPathCard = {
            pathId: `ROUTE-C${selectedCorridorId}-${assignDriver.split(' ')[0]}-T${autoTripNo}-${Date.now().toString().slice(-4)}`,
            corridorId: selectedCorridorId,
            corridorName: currentCorridor?.name || `Corridor ${selectedCorridorId}`,
            driverName: assignDriver,
            vehiclePlate: autoVehicle.split(' ')[0],
            tripNo: autoTripNo,
            status: 'READY_FOR_LOADING',
            assignedAt: 'Just Now',
            assignedOrders: primaryOrders,
          };

          // Save to Route Cards
          setPathCards((prev) => [newPathCard, ...prev]);

          // Update order statuses to QUEUED/Assigned
          const dispatchedIds = primaryOrders.map((o) => o.id);
          setOrders((prev) =>
            prev.map((o) =>
              dispatchedIds.includes(o.id)
                ? {
                    ...o,
                    assignedDriver: assignDriver,
                    vehiclePlate: autoVehicle.split(' ')[0],
                    tripNo: autoTripNo,
                    status: 'QUEUED',
                  }
                : o
            )
          );

          alert(`🚀 Dispatched Run Successfully!\n- ${primaryOrders.length} packages loaded to ${assignDriver} (${autoVehicle}).\n- Sequence: Trip ${autoTripNo}.\n- Transferred to Route Cards and ready on Driver's mobile phone!`);
        };

        return (
          <div className="space-y-4">
            
            {/* Top Clean Toolbar: Corridor Selector + Driver + Vehicle + Action Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Primary Corridor:</label>
                  <select
                    value={selectedCorridorId}
                    onChange={(e) => setSelectedCorridorId(parseInt(e.target.value))}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-none min-w-[320px]"
                  >
                    {corridors.map((c) => (
                      <option key={c.id} value={c.id}>
                        Corridor {c.id}: {c.name.split(': ')[1] || c.name} ({c.schedule})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver & Automatic Vehicle Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700">Driver:</label>
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

                  <span className="px-2.5 py-1.5 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-mono font-bold text-xs">
                    🚐 {autoVehicle}
                  </span>

                  <span className="px-2.5 py-1.5 bg-purple-100 text-purple-900 border border-purple-300 rounded-lg font-mono font-bold text-xs">
                    ⚡ Auto: Trip {autoCalculatedTripNo}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add En-Route Stops + Dispatch Run */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  {/* EN-ROUTE STOPS CO-LOADING TRIGGER */}
                  <button
                    type="button"
                    onClick={() => setShowEnRouteModal(true)}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs border border-blue-300 shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>➕ Add En-Route Stops (Aramoun, Bchamoun, Dahieh...)</span>
                  </button>

                  <span className="text-xs font-mono text-slate-500 pl-2">
                    Total Packages for this Run: <strong className="text-[#1e3a2b]">{primaryOrders.length} packages</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-300"
                  >
                    🖨️ Print Manifest A4
                  </button>

                  {/* MASTER ONE-CLICK DISPATCH RUN BUTTON */}
                  <button
                    type="button"
                    onClick={handleDispatchRunToDriver}
                    className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <span>🚀 Dispatch Run to Driver's Phone (Move to Route Cards)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Clean Corridor Packages Table (No Per-Row Clutter) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Run Package Manifest — Corridor {selectedCorridorId} ({assignDriver})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Review stops and adjust delivery fees if needed. En-route packages from adjacent towns appear highlighted.
                  </p>
                </div>
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
                      <th className="py-2.5 px-3 normal-case text-center w-32">delivery fee ($) [manual]</th>
                      <th className="py-2.5 px-3 normal-case text-center">route stop type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                    {primaryOrders.map((order, idx) => (
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

                        {/* Editable Delivery Fee */}
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
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            Stop #{idx + 1}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {primaryOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                          No packages currently queued for Corridor {selectedCorridorId}. Click "Add En-Route Stops" to bundle packages.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =============================================================== */}
            {/* MODAL: ADD EN-ROUTE STOPS (ARAMOUN, BCHAMOUN, DAHIEH CO-LOADING) */}
            {/* =============================================================== */}
            {showEnRouteModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-5 max-w-xl w-full text-xs space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Add En-Route Stops to {assignDriver}'s Run</h3>
                      <p className="text-[11px] text-slate-500">Pick packages from adjacent towns (e.g. Aramoun/Bchamoun on the way South or Dahieh on the way to Mount Lebanon).</p>
                    </div>
                    <button type="button" onClick={() => setShowEnRouteModal(false)} className="text-slate-400 font-bold text-sm">✕</button>
                  </div>

                  {/* Select Adjacent Corridor to pull packages from */}
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700">Pull En-Route Stops from:</label>
                    <select
                      value={enRouteSourceCorridorId}
                      onChange={(e) => setEnRouteSourceCorridorId(parseInt(e.target.value))}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {corridors.filter(c => c.id !== selectedCorridorId).map((c) => (
                        <option key={c.id} value={c.id}>
                          Corridor {c.id}: {c.name.split(': ')[1] || c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Candidate En-Route Orders List */}
                  <div className="border border-slate-200 rounded-xl max-h-56 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                    {candidateEnRouteOrders.map((o) => {
                      const isSelected = selectedEnRouteOrderIds.includes(o.id);
                      return (
                        <div
                          key={o.id}
                          onClick={() => {
                            setSelectedEnRouteOrderIds((prev) =>
                              prev.includes(o.id) ? prev.filter(i => i !== o.id) : [...prev, o.id]
                            );
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer flex justify-between items-center transition-colors ${isSelected ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                        >
                          <div>
                            <span className="font-mono text-[10.5px] text-[#1e3a2b] mr-2">#{o.orderNo}</span>
                            <strong>{o.customerName}</strong> — <span className="text-slate-600 font-mono">{o.destinationTown}</span>
                            <span className="text-[10px] text-slate-500 block">{o.items}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">${o.productAmountUsd} (+${o.deliveryFeeUsd} fee)</span>
                        </div>
                      );
                    })}

                    {candidateEnRouteOrders.length === 0 && (
                      <div className="py-6 text-center text-slate-400 font-mono text-xs">
                        No pending packages available in Corridor {enRouteSourceCorridorId} right now.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs font-mono text-slate-600">Selected: <strong>{selectedEnRouteOrderIds.length} stops</strong></span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAppendEnRouteOrders}
                        className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-xs"
                      >
                        🔗 Append to {assignDriver}'s Run
                      </button>
                      <button type="button" onClick={() => setShowEnRouteModal(false)} className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* 3. ROUTE CARDS (CONFIRMED RUNS READY FOR LOADING & A4 MANIFEST)     */}
      {/* =================================================================== */}
      {activeTab === 'path-cards' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex justify-between items-center">
            <span>🗂️ <strong>Route Cards:</strong> Confirmed dispatch runs ready for warehouse loading and vehicle departure from Choueifat Hub.</span>
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
                  <span className="text-[10.5px] font-bold text-slate-500 block">ASSIGNED STOPS IN THIS RUN ({card.assignedOrders.length}):</span>
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
                    onClick={() => alert(`Printing warehouse loading manifest for ${card.pathId}...`)}
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
      {/* 4. SUPERSONIC 3PL ORDERS (BY PATH)                                  */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between items-center">
            <span>💡 <strong>3PL Commercial Orders:</strong> External merchant shipments. Delivery fees can be edited manually per package.</span>
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
      {/* 7. SUPERSONIC MASTER REPORTS HUB (8 DEDICATED AUDIT REPORTS)        */}
      {/* =================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* Reports Sub-Sidebar */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-2xs print:hidden">
              <div className="p-2.5 border-b border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Reports Picker</span>
              </div>
              <button type="button" onClick={() => setSelectedReportKey('COD_WHISH_SETTLEMENTS')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COD_WHISH_SETTLEMENTS' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>💵 COD, Whish & Settlements</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-mono font-bold">Audit</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('FULFILLMENT_AUDIT')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FULFILLMENT_AUDIT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>🔄 Fulfillment Audit (By Who)</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">Logs</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('DRIVER_RECONCILIATION')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'DRIVER_RECONCILIATION' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>📄 Driver Daily Trips Master</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono font-bold">A4</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('MERCHANT_REMITTANCE')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'MERCHANT_REMITTANCE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>🤝 Merchant COD Remittance</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-mono font-bold">3PL</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('DELIVERY_REVENUE')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'DELIVERY_REVENUE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>📈 3PL Delivery Revenue</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Finance</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('COMPLAINTS_QUALITY')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COMPLAINTS_QUALITY' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>🎧 Complaints & Reviews</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 font-mono font-bold">Service</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('FLEET_MILEAGE')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FLEET_MILEAGE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>🚐 Fleet Mileage & Fuel</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Assets</span>
              </button>
              <button type="button" onClick={() => setSelectedReportKey('POD_AUDIT')} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'POD_AUDIT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}>
                <span>✍️ Proof of Delivery Log</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Signed</span>
              </button>
            </div>

            {/* Active Report Viewport */}
            <div className="lg:col-span-9 space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Active Report:</span>
                  <span className="font-mono font-bold text-[#1e3a2b] px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">{selectedReportKey}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl shadow-xs">🖨️ Print A4</button>
                  <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">📄 PDF</button>
                  <button type="button" onClick={() => alert(`Exporting ${selectedReportKey} to CSV...`)} className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs">📊 CSV</button>
                </div>
              </div>

              {/* Report Content */}
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
                          <th className="py-2.5 px-3 normal-case text-right">amount ($)</th>
                          <th className="py-2.5 px-3 normal-case">payment method</th>
                          <th className="py-2.5 px-3 normal-case">reference no.</th>
                          <th className="py-2.5 px-3 normal-case text-center">status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-900">WSH-0091</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">Tony Khoury</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-800">$200.00</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">Whish Money</span></td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">WHISH-TX-9988124</td>
                          <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Pending Approval</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">CSH-0042</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">Tony Khoury</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">$250.00</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">Physical Cash</span></td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">VAULT-DEP-4920</td>
                          <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Audited & Cleared ✓</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                          <th className="py-2.5 px-3 normal-case">customer</th>
                          <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                          <th className="py-2.5 px-3 normal-case text-center">transition</th>
                          <th className="py-2.5 px-3 normal-case text-center">switched by (role)</th>
                          <th className="py-2.5 px-3 normal-case text-center">code</th>
                          <th className="py-2.5 px-3 normal-case font-mono">timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                        {orders.filter(o => o.status === 'MOVED_TO_POS_PICKUP' || o.fulfillmentSwitchedBy).map((o) => (
                          <tr key={o.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>
                            <td className="py-2.5 px-3">{o.customerName}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${o.productAmountUsd.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">Moved to POS</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                {o.fulfillmentSwitchedBy?.actorType || 'MANAGEMENT'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-800">
                              {o.fulfillmentSwitchedBy?.actorCode || 'MGR-01'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{o.fulfillmentSwitchedBy?.timestamp || 'Today 09:15 AM'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. HR & COMPLAINTS & OTHER SECTIONS                                 */}
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

      {/* =================================================================== */}
      {/* 9. RADAR, POD, VEHICLES                                             */}
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
                <div className="text-[10px] text-emerald-800 font-bold pt-1">Company Fleet Asset #SUPER-{v.plate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ATTACH ON-THE-WAY STOPS (ARAMOUN, BCHAMOUN, DAHIEH...)     */}
      {/* =================================================================== */}
      {showAttachNearbyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full text-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Attach Nearby On-The-Way Stops to Corridor {selectedCorridorId}</h3>
                <span className="text-[10.5px] text-slate-500 font-mono">Select candidate packages near exit routes (e.g. Aramoun, Bchamoun, Dahieh):</span>
              </div>
              <button type="button" onClick={() => setShowAttachNearbyModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {potentialCrossRouteOrders.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-900 block">{p.customerName} — #{p.orderNo}</strong>
                    <span className="text-[10px] text-slate-600 font-mono">{p.destinationTown} ({p.items})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttachOrderToCurrentRun(p)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
                  >
                    ➕ Attach to Run
                  </button>
                </div>
              ))}

              {potentialCrossRouteOrders.length === 0 && (
                <div className="p-6 text-center text-slate-400 font-mono text-xs">
                  No candidate cross-route packages waiting in other corridors.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button type="button" onClick={() => setShowAttachNearbyModal(false)} className="px-4 py-1.5 bg-slate-200 font-bold rounded-lg text-xs">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MOVE CORRIDOR */}
      {selectedOrderForReroute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Re-route Order #{selectedOrderForReroute.orderNo}</h3>
            <p className="text-slate-600">Select target destination corridor:</p>
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

      {/* MODAL 3: RESOLVE COMPLAINT */}
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
              <button type="button" onClick={handleResolveComplaint} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Confirm Resolution</button>
              <button type="button" onClick={() => setSelectedComplaintForAction(null)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TELEMETRY PHONE MIRRORING */}
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

      {/* MODAL 5: ADD VENDOR */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic 3PL Vendor</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Beirut Gourmet" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Contact & Phone:</label><input type="text" placeholder="03-741258" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Vendor saved!'); setShowAddVendorModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save Vendor</button>
              <button type="button" onClick={() => setShowAddVendorModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ADD STAFF */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New SuperSonic Staff Member</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setNewStaffType('DRIVER')} className={`flex-1 py-2 rounded-xl border font-bold ${newStaffType === 'DRIVER' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>Driver</button>
              <button type="button" onClick={() => setNewStaffType('ON_SITE')} className={`flex-1 py-2 rounded-xl border font-bold ${newStaffType === 'ON_SITE' ? 'bg-[#1e3a2b] text-white' : 'bg-slate-100'}`}>On-Site Personnel</button>
            </div>
            <div><label className="font-bold block mb-1">Full Name:</label><input type="text" placeholder="e.g. Jad Mansour" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Phone Number:</label><input type="text" placeholder="03-334455" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ Staff profile created!'); setShowAddStaffModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Create Profile</button>
              <button type="button" onClick={() => setShowAddStaffModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: ADD 3PL */}
      {showAdd3PLModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Shipment</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Apex Electronics" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Recipient & Phone:</label><input type="text" placeholder="Ziad (03-554433)" className="w-full p-2 border rounded-xl" /></div>
            <div><label className="font-bold block mb-1">Destination Town:</label><input type="text" placeholder="Saida - Riad El Solh" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('✓ 3PL Package Saved!'); setShowAdd3PLModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save Package</button>
              <button type="button" onClick={() => setShowAdd3PLModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
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
