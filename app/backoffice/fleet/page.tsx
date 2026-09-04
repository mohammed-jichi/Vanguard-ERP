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

function SuperSonicFleetContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'southern-olive';

  // ==========================================================================
  // ALL HOOKS STRICTLY DECLARED AT TOP LEVEL (COMPLIANT WITH REACT RULES)
  // ==========================================================================
  const [corridors] = useState(initialCorridors);
  const [vehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [orders, setOrders] = useState<DispatchedOrder[]>(initialOrders as DispatchedOrder[]);
  const [vendors, setVendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(initialComplaints);
  const [ledger] = useState(initialLedger);

  // Dispatch Controls
  const [selectedCorridorId, setSelectedCorridorId] = useState<number>(1);
  const [assignDriver, setAssignDriver] = useState<string>('Tony Khoury');
  const [assignVehicle, setAssignVehicle] = useState<string>('B-492102 (Van 01)');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Route Cards
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
      assignedOrders: [initialOrders[0] as DispatchedOrder, initialOrders[1] as DispatchedOrder],
    },
  ]);

  // Reports Hub Selection State (Strictly Top-Level Hook)
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

  // Modals & Drawers State
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

  // En-Route Waypoint Modal State (e.g. Taking Aramoun/Bchamoun/Dahieh on Southbound Runs)
  const [showEnRouteModal, setShowEnRouteModal] = useState(false);

  // Order Sub-Tabs State for Southern Olive & 3PL
  const [soFilterTab, setSoFilterTab] = useState<'ACTIVE' | 'DELIVERED' | 'REJECTED' | 'POSTPONED'>('ACTIVE');
  const [tplFilterTab, setTplFilterTab] = useState<'ACTIVE' | 'DELIVERED' | 'REJECTED' | 'POSTPONED'>('ACTIVE');

  // Postponed Reschedule Modal State
  const [postponeModalOrder, setPostponeModalOrder] = useState<DispatchedOrder | null>(null);
  const [rescheduledDateInput, setRescheduledDateInput] = useState<string>('2026-09-05');

  // Auto-return postponed orders to Active Feed when target date matches today or earlier
  useEffect(() => {
    const todayStr = '2026-09-04';
    setOrders((prev) =>
      prev.map((o) => {
        if (o.status === 'PENDING' && o.deliveredAt?.startsWith('Postponed to ')) {
          const targetDate = o.deliveredAt.replace('Postponed to ', '').trim();
          if (targetDate <= todayStr) {
            return {
              ...o,
              status: 'QUEUED',
              deliveredAt: undefined,
            };
          }
        }
        return o;
      })
    );
  }, []);

  const handleConfirmPostpone = () => {
    if (!postponeModalOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === postponeModalOrder.id
          ? {
              ...o,
              status: 'PENDING',
              deliveredAt: `Postponed to ${rescheduledDateInput}`,
            }
          : o
      )
    );
    alert(`✓ Order #${postponeModalOrder.orderNo} postponed to ${rescheduledDateInput}.\nIt will move to the Postponed tab and auto-reappear in Active Feed on that date.`);
    setPostponeModalOrder(null);
  };

  // Pre-select current corridor orders by default
  const currentCorridorOrders = orders.filter(
    (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
  );

  useEffect(() => {
    setSelectedOrderIds(currentCorridorOrders.map((o) => o.id));
  }, [selectedCorridorId]);

  // Automatic Trip Sequencing per driver
  const getAutoTripNumberForDriver = (driverName: string) => {
    const driverExistingRuns = pathCards.filter((p) => p.driverName === driverName);
    return driverExistingRuns.length + 1;
  };
  const autoCalculatedTripNo = getAutoTripNumberForDriver(assignDriver);

  // Handlers
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

  const handleUpdateDeliveryFee = (orderId: string, newFee: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryFeeUsd: newFee } : o))
    );
  };

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
                actorType,
                actorCode,
                actorName,
                timestamp: 'Just Now',
                actionType: 'MOVED_TO_POS',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} moved to Showroom POS Pickup!`);
  };

  const handleReturnToDelivery = (
    orderId: string,
    actorType: 'MANAGEMENT' | 'REPRESENTATIVE' = 'REPRESENTATIVE',
    actorCode = 'REP-002',
    actorName = 'Ahmad Ali Kassem'
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'QUEUED',
              corridorId: 1,
              fulfillmentSwitchedBy: {
                actorType,
                actorCode,
                actorName,
                timestamp: 'Just Now',
                actionType: 'RETURNED_TO_DELIVERY',
              },
            }
          : o
      )
    );
    alert(`✓ Order #${orderId} returned to Fleet Delivery queue!`);
  };

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

  const handleExecuteReroute = (targetCorridorId: number) => {
    if (!selectedOrderForReroute) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrderForReroute.id ? { ...o, corridorId: targetCorridorId } : o))
    );
    alert(`✓ Order #${selectedOrderForReroute.orderNo} transferred to Corridor ${targetCorridorId}!`);
    setSelectedOrderForReroute(null);
  };

  // En-Route Attachment Handler: Attach Aramoun / Bchamoun / Dahieh orders to this corridor run
  const handleAttachEnRouteOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, corridorId: selectedCorridorId }
          : o
      )
    );
    setSelectedOrderIds((prev) => [...prev, orderId]);
    alert(`✓ Order #${orderId} attached as an En-Route Waypoint stop for Corridor ${selectedCorridorId}!`);
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
              {activeTab === 'dispatch' && 'Corridors & Regional Dispatch (Unassigned Queue)'}
              {activeTab === 'path-cards' && 'Route Cards (Assigned Runs Ready for Loading)'}
              {activeTab === 'vendors' && 'SuperSonic 3PL Merchant Accounts'}
              {activeTab === 'accounting' && 'SuperSonic Financial Ledger & Treasury'}
              {activeTab === 'hr' && 'SuperSonic Staff & Driver Roster'}
              {activeTab === 'complaints' && 'Customer Complaints & Service Quality'}
              {(activeTab === 'reports' || activeTab === 'settlements') && 'SuperSonic Master Reports Hub'}
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
      {/* 1. SOUTHERN OLIVE ORDERS (RE-ORDERED COLUMNS & 4 FILTER TABS)       */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          
          {/* Header & Sub-Tabs */}
          <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Southern Olive Oil Products S.A.R.L Dedicated Inflow</h3>
              <p className="text-[11px] text-slate-400">Manage in-house production orders. Switch tabs to review active, delivered, rejected, or postponed orders.</p>
            </div>

            {/* 4 Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSoFilterTab('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${soFilterTab === 'ACTIVE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                📥 Active Incoming Feed ({orders.filter(o => o.sourceType === 'SOUTHERN_OLIVE' && (o.status === 'QUEUED' || o.status === 'ON_ROUTE' || o.status === 'MOVED_TO_POS_PICKUP')).length})
              </button>
              <button
                type="button"
                onClick={() => setSoFilterTab('DELIVERED')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${soFilterTab === 'DELIVERED' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ✅ Delivered ({orders.filter(o => o.sourceType === 'SOUTHERN_OLIVE' && o.status === 'DELIVERED').length})
              </button>
              <button
                type="button"
                onClick={() => setSoFilterTab('REJECTED')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${soFilterTab === 'REJECTED' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-100'}`}
              >
                ❌ Rejected ({orders.filter(o => o.sourceType === 'SOUTHERN_OLIVE' && o.status === 'REJECTED').length})
              </button>
              <button
                type="button"
                onClick={() => setSoFilterTab('POSTPONED')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${soFilterTab === 'POSTPONED' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ⏳ Postponed ({orders.filter(o => o.sourceType === 'SOUTHERN_OLIVE' && o.status === 'PENDING').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order date</th>
                  <th className="py-2.5 px-3 normal-case">order number</th>
                  <th className="py-2.5 px-3 normal-case">sales rep</th>
                  <th className="py-2.5 px-3 normal-case">customer details</th>
                  <th className="py-2.5 px-3 normal-case">destination details</th>
                  <th className="py-2.5 px-3 normal-case">packaging details</th>
                  <th className="py-2.5 px-3 normal-case text-right">value</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders
                  .filter((o) => {
                    if (o.sourceType !== 'SOUTHERN_OLIVE') return false;
                    if (soFilterTab === 'ACTIVE') return o.status === 'QUEUED' || o.status === 'ON_ROUTE' || o.status === 'MOVED_TO_POS_PICKUP';
                    if (soFilterTab === 'DELIVERED') return o.status === 'DELIVERED';
                    if (soFilterTab === 'REJECTED') return o.status === 'REJECTED';
                    if (soFilterTab === 'POSTPONED') return o.status === 'PENDING';
                    return true;
                  })
                  .map((o) => (
                    <tr
                      key={o.id}
                      className={o.status === 'REJECTED' ? 'bg-rose-50/70' : o.status === 'MOVED_TO_POS_PICKUP' ? 'bg-slate-100/70 text-slate-400 opacity-70' : 'hover:bg-slate-50'}
                    >
                      {/* 1. Order Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">2026-09-04</td>

                      {/* 2. Order Number */}
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">{o.orderNo}</td>

                      {/* 3. Sales Rep (Directly beside Order Number) */}
                      <td className="py-2.5 px-3 text-purple-800 font-semibold">{o.repName || '-'}</td>

                      {/* 4. Customer Details */}
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900 block">{o.customerName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{o.phone}</span>
                      </td>

                      {/* 5. Destination Details */}
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 block font-bold">{o.destinationTown}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.addressDetails}</span>
                      </td>

                      {/* 6. Packaging Details */}
                      <td className="py-2.5 px-3 text-slate-800">{o.items}</td>

                      {/* 7. Value */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {o.productAmountLbp > 0 ? `${o.productAmountLbp.toLocaleString()} LBP` : `$${o.productAmountUsd.toFixed(2)}`}
                      </td>

                      {/* 8. Status (Highlight Red if Rejected) */}
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'DELIVERED' && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">delivered</span>}
                        {o.status === 'REJECTED' && <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs animate-pulse">rejected</span>}
                        {o.status === 'PENDING' && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">postponed</span>}
                        {o.status === 'MOVED_TO_POS_PICKUP' && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">moved to POS pickup</span>}
                        {(o.status === 'QUEUED' || o.status === 'ON_ROUTE') && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">active for delivery</span>}
                      </td>

                      {/* 9. Action */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {o.status === 'MOVED_TO_POS_PICKUP' ? (
                            <button
                              type="button"
                              onClick={() => handleReturnToDelivery(o.id)}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] border border-blue-200"
                            >
                              🚚 Return to Delivery
                            </button>
                          ) : o.status === 'QUEUED' || o.status === 'ON_ROUTE' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleMoveToPosPickup(o.id)}
                                className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded text-[10px] border border-purple-200"
                              >
                                🏪 Move to POS
                              </button>
                              <button
                                type="button"
                                onClick={() => setPostponeModalOrder(o)}
                                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded text-[10px] border border-amber-200"
                              >
                                ⏳ Postpone
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-mono">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. CORRIDORS & DISPATCH: EN-ROUTE ATTACHMENT + AUTO TRIP #          */}
      {/* =================================================================== */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          
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

                {/* EN-ROUTE WAYPOINTS ATTACHMENT BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowEnRouteModal(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs border border-blue-300 flex items-center gap-1 transition-colors"
                  title="Attach orders from Aramoun, Bchamoun, or Dahieh en-route"
                >
                  <span>➕ Attach En-Route Stops (Aramoun / Dahieh)</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Highway Path: <strong className="text-slate-800">{corridors.find(c => c.id === selectedCorridorId)?.highwayPath}</strong>
              </div>
            </div>

            {/* Assignment Bar with AUTOMATIC TRIP SEQUENCING */}
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
                      <option key={d.id} value={d.fullName}>{d.fullName} ({d.assignedAsset})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Vehicle:</label>
                  <select
                    value={assignVehicle}
                    onChange={(e) => setAssignVehicle(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="B-492102 (Van 01)">Toyota HiAce B-492102 (Van 01)</option>
                    <option value="G-183921 (Van 02)">Hyundai H1 G-183921 (Van 02)</option>
                    <option value="S-772910 (Car 01)">Renault Duster S-772910 (Car 01)</option>
                    <option value="M-102941 (Moto 01)">Honda Cargo M-102941 (Moto 01)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Trip Sequence:</label>
                  <span className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-lg font-mono font-bold text-xs flex items-center gap-1">
                    <span>⚡</span>
                    <span>Auto: Trip {autoCalculatedTripNo}</span>
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-600 pl-2">
                  Selected for Run: <strong className="text-[#1e3a2b]">{selectedOrderIds.length} orders</strong>
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

          {/* Incoming Packages Table with PRE-SELECT & MANUAL DELIVERY FEE INPUT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Incoming Packages Waiting for Route Assignment — Corridor {selectedCorridorId}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Packages are pre-selected by default. Edit delivery fees manually if required, then click "Save & Load to Driver".
                </p>
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
                        
                        {/* MANUAL DELIVERY FEE INPUT */}
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

                  {currentCorridorOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                        No unassigned packages currently queued for Corridor {selectedCorridorId}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. ROUTE CARDS (PATH CARDS — READY FOR LOADING)                     */}
      {/* =================================================================== */}
      {activeTab === 'path-cards' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex justify-between items-center">
            <span>🗂️ <strong>Route Cards:</strong> Confirmed and loaded routes. Ready for warehouse loading and driver departure.</span>
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
      {/* 2. SUPERSONIC 3PL ORDERS (MATCHING 4 TABS & STRUCTURE)              */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          
          {/* Header & Sub-Tabs */}
          <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SuperSonic 3PL Commercial Orders</h3>
              <p className="text-[11px] text-slate-400">External merchant shipments. Delivery fees and COD payouts remain isolated inside SuperSonic.</p>
            </div>

            <div className="flex items-center gap-2">
              {/* 4 Status Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTplFilterTab('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${tplFilterTab === 'ACTIVE' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  📥 Active Feed ({orders.filter(o => o.sourceType === 'EXTERNAL_3PL' && (o.status === 'QUEUED' || o.status === 'ON_ROUTE')).length})
                </button>
                <button
                  type="button"
                  onClick={() => setTplFilterTab('DELIVERED')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${tplFilterTab === 'DELIVERED' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  ✅ Delivered ({orders.filter(o => o.sourceType === 'EXTERNAL_3PL' && o.status === 'DELIVERED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setTplFilterTab('REJECTED')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${tplFilterTab === 'REJECTED' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-100'}`}
                >
                  ❌ Rejected ({orders.filter(o => o.sourceType === 'EXTERNAL_3PL' && o.status === 'REJECTED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setTplFilterTab('POSTPONED')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${tplFilterTab === 'POSTPONED' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  ⏳ Postponed ({orders.filter(o => o.sourceType === 'EXTERNAL_3PL' && o.status === 'PENDING').length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdd3PLModal(true)}
                className="px-3.5 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-xs"
              >
                ➕ Add 3PL Package
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order date</th>
                  <th className="py-2.5 px-3 normal-case">order numbers</th>
                  <th className="py-2.5 px-3 normal-case">vendor details</th>
                  <th className="py-2.5 px-3 normal-case">customer details</th>
                  <th className="py-2.5 px-3 normal-case">destination details</th>
                  <th className="py-2.5 px-3 normal-case">packaging details</th>
                  <th className="py-2.5 px-3 normal-case text-right">value</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                  <th className="py-2.5 px-3 normal-case text-center">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders
                  .filter((o) => {
                    if (o.sourceType !== 'EXTERNAL_3PL') return false;
                    if (tplFilterTab === 'ACTIVE') return o.status === 'QUEUED' || o.status === 'ON_ROUTE';
                    if (tplFilterTab === 'DELIVERED') return o.status === 'DELIVERED';
                    if (tplFilterTab === 'REJECTED') return o.status === 'REJECTED';
                    if (tplFilterTab === 'POSTPONED') return o.status === 'PENDING';
                    return true;
                  })
                  .map((o) => (
                    <tr key={o.id} className={o.status === 'REJECTED' ? 'bg-rose-50/70' : 'hover:bg-slate-50'}>
                      {/* 1. Order Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">2026-09-04</td>

                      {/* 2. Order Numbers */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{o.orderNo}</td>

                      {/* 3. Vendor Details */}
                      <td className="py-2.5 px-3 font-bold text-slate-900">{o.customerName}</td>

                      {/* 4. Customer Details */}
                      <td className="py-2.5 px-3 font-mono text-slate-600">{o.phone}</td>

                      {/* 5. Destination Details */}
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 block font-bold">{o.destinationTown}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.addressDetails}</span>
                      </td>

                      {/* 6. Packaging Details */}
                      <td className="py-2.5 px-3 text-slate-800">{o.items}</td>

                      {/* 7. Value */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${o.productAmountUsd.toFixed(2)}
                        <span className="text-blue-700 block text-[10px]">Fee: ${o.deliveryFeeUsd}</span>
                      </td>

                      {/* 8. Status (Highlight Red if Rejected) */}
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'DELIVERED' && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">delivered</span>}
                        {o.status === 'REJECTED' && <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs animate-pulse">rejected</span>}
                        {o.status === 'PENDING' && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">postponed</span>}
                        {(o.status === 'QUEUED' || o.status === 'ON_ROUTE') && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">active for delivery</span>}
                      </td>

                      {/* 9. Action */}
                      <td className="py-2.5 px-3 text-center">
                        {o.status === 'QUEUED' || o.status === 'ON_ROUTE' ? (
                          <button
                            type="button"
                            onClick={() => setPostponeModalOrder(o)}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded text-[10px] border border-amber-200"
                          >
                            ⏳ Postpone
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono">-</span>
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
      {/* 9. REPORTS CATALOG (ACCESSIBLE VIA ?tab=reports)                    */}
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

              <button
                type="button"
                onClick={() => setSelectedReportKey('MERCHANT_REMITTANCE')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'MERCHANT_REMITTANCE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>🤝 Merchant COD Remittance</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-mono font-bold">3PL</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportKey('DELIVERY_REVENUE')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'DELIVERY_REVENUE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>📈 3PL Delivery Revenue</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Finance</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportKey('COMPLAINTS_QUALITY')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'COMPLAINTS_QUALITY' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>🎧 Complaints & Reviews</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 font-mono font-bold">Service</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportKey('FLEET_MILEAGE')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${selectedReportKey === 'FLEET_MILEAGE' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>🚐 Fleet Mileage & Fuel</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono font-bold">Assets</span>
              </button>

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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-[11px] text-slate-800">
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-900">WSH-0091</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">Tony Khoury</td>
                          <td className="py-2.5 px-3 text-slate-600">Toyota HiAce (B-492102)</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-800">$200.00</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">Whish Money</span></td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">WHISH-TX-9988124</td>
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
                      <p className="text-[11px] text-slate-500 font-mono">Tracks orders converted between Fleet Delivery and Showroom POS Pickup with user attribution.</p>
                    </div>
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
                          <tr key={o.id}>
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

              {selectedReportKey === 'DRIVER_RECONCILIATION' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Driver Daily Trips Master Reconciliation Report</h3>
                      <p className="text-[11px] text-slate-500 font-mono">Consolidated settlement of sequential trips, cash, Whish, and driver allowances.</p>
                    </div>
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
      {/* MODAL: ATTACH EN-ROUTE STOPS (E.G. ARAMOUN / BCHAMOUN / DAHIEH)     */}
      {/* =================================================================== */}
      {showEnRouteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Attach En-Route Waypoint Stops to Corridor {selectedCorridorId}</h3>
                <span className="text-[10.5px] text-slate-500 font-mono">Example: Southbound driver taking Aramoun/Bchamoun/Dahieh before coastal highway</span>
              </div>
              <button type="button" onClick={() => setShowEnRouteModal(false)} className="font-bold text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Waypoint Packages from Other Corridors:</span>
              {orders
                .filter((o) => o.corridorId !== selectedCorridorId && o.status === 'QUEUED')
                .map((o) => (
                  <div key={o.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="block text-slate-900">{o.customerName} ({o.destinationTown})</strong>
                      <span className="text-[10px] text-slate-500 font-mono">Origin: Corridor {o.corridorId} | Items: {o.items}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttachEnRouteOrder(o.id)}
                      className="px-2.5 py-1 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-[10px] transition-colors"
                    >
                      ➕ Attach to this Run
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
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
            <p className="text-slate-600">Select destination corridor:</p>
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

      {showAdd3PLModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add External 3PL Shipment</h3>
            <div><label className="font-bold block mb-1">Merchant Name:</label><input type="text" placeholder="e.g. Apex Electronics" className="w-full p-2 border rounded-xl" /></div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { alert('3PL Package Saved!'); setShowAdd3PLModal(false); }} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Save</button>
              <button type="button" onClick={() => setShowAdd3PLModal(false)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POSTPONE ORDER TO SPECIFIC DATE */}
      {postponeModalOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-xs space-y-3.5 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900">Postpone Order #{postponeModalOrder.orderNo}</h3>
            <p className="text-slate-600">
              Customer: <strong>{postponeModalOrder.customerName}</strong> ({postponeModalOrder.phone})
            </p>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Reschedule for Target Date:</label>
              <input
                type="date"
                value={rescheduledDateInput}
                onChange={(e) => setRescheduledDateInput(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Order will move to "Postponed" tab and automatically return to Active Feed on this date.
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmPostpone}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
              >
                Confirm Postpone
              </button>
              <button
                type="button"
                onClick={() => setPostponeModalOrder(null)}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SuperSonicFleetPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500 font-mono">Loading SuperSonic Fleet Workspace...</div>}>
      <SuperSonicFleetContent />
    </Suspense>
  );
}
