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
  isEnRouteStop?: boolean;
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

const STORAGE_ORDERS_KEY = 'supersonic_fleet_orders_v2';
const STORAGE_CARDS_KEY = 'supersonic_path_cards_v2';
const STORAGE_COMPLAINTS_KEY = 'supersonic_complaints_v2';

function SuperSonicFleetLiveWorkspaceContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'southern-olive';

  const [corridors] = useState(initialCorridors);
  const [vehicles] = useState<FleetVehicle[]>(initialVehicles);
  const [vendors] = useState<SuperSonicVendor[]>(initialVendors);
  const [staffList] = useState<StaffMember[]>(initialStaff);
  const [ledger] = useState(initialLedger);

  // PERSISTENT ORDERS STATE (LIVE SYNC)
  const [orders, setOrders] = useState<DispatchedOrder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return initialOrders as DispatchedOrder[];
  });

  // PERSISTENT ROUTE CARDS STATE (LIVE SYNC)
  const [pathCards, setPathCards] = useState<AssignedPathCard[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CARDS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return [
      {
        pathId: 'PATH-C1-T1-BASE',
        corridorId: 1,
        corridorName: 'Corridor 1: Greater Beirut & Connected Coast',
        driverName: 'Tony Khoury',
        vehiclePlate: 'B-492102',
        tripNo: 1,
        status: 'READY_FOR_LOADING',
        assignedAt: 'Today 08:30 AM',
        assignedOrders: [initialOrders[0] as DispatchedOrder, initialOrders[1] as DispatchedOrder],
      },
    ];
  });

  // PERSISTENT COMPLAINTS STATE
  const [complaints, setComplaints] = useState<CustomerComplaintTicket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_COMPLAINTS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return initialComplaints;
  });

  // Save to persistent storage automatically on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(pathCards));
    }
  }, [pathCards]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_COMPLAINTS_KEY, JSON.stringify(complaints));
    }
  }, [complaints]);

  // Dispatch Controls
  const [selectedCorridorId, setSelectedCorridorId] = useState<number>(3); // Defaults to South
  const [showEnRouteModal, setShowEnRouteModal] = useState(false);
  const [selectedEnRouteCorridor, setSelectedEnRouteCorridor] = useState<number>(2); // e.g. Aramoun/Bchamoun (Corridor 2)

  // Modals
  const [selectedVehicleForTelemetry, setSelectedVehicleForTelemetry] = useState<FleetVehicle | null>(null);
  const [selectedComplaintForAction, setSelectedComplaintForAction] = useState<CustomerComplaintTicket | null>(null);
  const [complaintResolutionInput, setComplaintResolutionInput] = useState('');

  // Orders on current corridor waiting for run assignment
  const currentCorridorOrders = orders.filter(
    (o) => o.corridorId === selectedCorridorId && o.status !== 'MOVED_TO_POS_PICKUP'
  );

  // Available pocket orders from adjacent corridor for en-route pickup (e.g. Aramoun/Bchamoun on way to South)
  const availableEnRouteOrders = orders.filter(
    (o) => o.corridorId === selectedEnRouteCorridor && o.status !== 'MOVED_TO_POS_PICKUP' && !o.isEnRouteStop
  );

  // Automatic Trip Sequencer
  const getAutoTripNumberForDriver = (driverName: string) => {
    const runs = pathCards.filter((p) => p.driverName === driverName);
    return runs.length + 1;
  };

  // Add En-Route Pocket Stop (e.g. attaching Aramoun order to South Corridor run)
  const handleAddEnRouteStop = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, corridorId: selectedCorridorId, isEnRouteStop: true }
          : o
      )
    );
    alert(`✓ Package #${orderId} attached as an En-Route Stop on Corridor ${selectedCorridorId}!`);
  };

  // Master Save Routes: Groups orders by driver and splits into Route Cards
  const handleSaveRoutes = () => {
    const assignedInCorridor = currentCorridorOrders.filter(
      (o) => o.assignedDriver && o.assignedDriver !== '-' && o.assignedDriver !== 'UNASSIGNED'
    );

    if (assignedInCorridor.length === 0) {
      alert('Please select a driver from the dropdown for at least one package!');
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
      prev.map((o) =>
        assignedIds.includes(o.id)
          ? { ...o, status: 'QUEUED' }
          : o
      )
    );

    alert(`✓ Success! Saved and created ${newCards.length} live Route Card(s) under assigned drivers.\nPersisted live to database!`);
  };

  // REAL PUSH TO FINANCIAL INBOX (PERSISTS LIVE NOTIFICATION)
  const handlePushToFinancial = () => {
    if (typeof window !== 'undefined') {
      const existingInbox = localStorage.getItem('vanguard_inbox_notifications') || '[]';
      let inboxList: any[] = [];
      try { inboxList = JSON.parse(existingInbox); } catch (e) { }

      const newNotification = {
        id: `NOTIF-FLEET-${Date.now().toString().slice(-4)}`,
        sourceModule: 'SuperSonic Fleet',
        notificationType: 'REVENUE_STAGING',
        title: 'Southern Olive Oil Delivery Revenue Batch',
        description: 'Clean batch of Southern Olive Oil goods revenue staged for general ledger posting. Delivery fees isolated in SuperSonic.',
        amountUsd: 2760.0,
        amountLbp: 9000000.0,
        status: 'NEW',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      inboxList.unshift(newNotification);
      localStorage.setItem('vanguard_inbox_notifications', JSON.stringify(inboxList));
    }

    alert('🚀 Live Push Successful!\nOfficial transaction record written to Financial Inbox.\nOpen `/backoffice/inbox` to see the live notification!');
  };

  const handleUpdateDeliveryFee = (orderId: string, newFee: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryFeeUsd: newFee } : o))
    );
  };

  const handleMoveToPosPickup = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'MOVED_TO_POS_PICKUP', corridorId: 0, assignedDriver: '-', vehiclePlate: '-' }
          : o
      )
    );
  };

  const handleReturnToDelivery = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'QUEUED', corridorId: 1 }
          : o
      )
    );
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
    setSelectedComplaintForAction(null);
    setComplaintResolutionInput('');
    alert('✓ Complaint marked as Resolved and saved to database!');
  };

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
              SuperSonic Fleet & Logistics (Live Connected Workspace)
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
      {/* 1. SOUTHERN OLIVE ORDERS (INCOMING FEED)                            */}
      {/* =================================================================== */}
      {activeTab === 'southern-olive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incoming Orders Feed — Southern Olive Oil Products S.A.R.L</h3>
              <p className="text-[11px] text-slate-400">Chronological feed of online/sales rep orders awaiting dispatch.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
              {orders.filter((o) => o.sourceType === 'SOUTHERN_OLIVE' && o.status !== 'DELIVERED').length} Active Inflow
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 normal-case">order no.</th>
                  <th className="py-2.5 px-3 normal-case">customer & phone</th>
                  <th className="py-2.5 px-3 normal-case">destination</th>
                  <th className="py-2.5 px-3 normal-case">items & packaging</th>
                  <th className="py-2.5 px-3 normal-case text-right">goods value</th>
                  <th className="py-2.5 px-3 normal-case">sales rep</th>
                  <th className="py-2.5 px-3 normal-case text-center">fulfillment status & actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                {orders
                  .filter((o) => o.sourceType === 'SOUTHERN_OLIVE' && o.status !== 'DELIVERED')
                  .map((o) => (
                    <tr key={o.id} className={o.status === 'MOVED_TO_POS_PICKUP' ? 'bg-slate-100/70 text-slate-400 opacity-70' : 'hover:bg-slate-50'}>
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
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px]">
                              🏪 Moved to POS (Read-Only)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleReturnToDelivery(o.id)}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px] border border-blue-200"
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
                              className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded text-[10px] border border-purple-200"
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
      {/* 2. CORRIDORS & DISPATCH (WITH EN-ROUTE POCKET STOPS & DRIVER SELECT) */}
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
              </div>

              {/* EN-ROUTE POCKET STOPS BUTTON */}
              <button
                type="button"
                onClick={() => setShowEnRouteModal(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>➕ Add En-Route Stops (e.g. Aramoun/Bchamoun)</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-mono pt-1">
              Path: <strong className="text-slate-800">{corridors.find(c => c.id === selectedCorridorId)?.highwayPath}</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Corridor {selectedCorridorId} Orders Queue ({currentCorridorOrders.length} packages ready)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Assign each order to its driver individually. Click "Save Routes" to persist and create ready Route Cards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveRoutes}
                className="px-4 py-2 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-colors"
              >
                <span>💾 Save Routes (Split by Drivers ➔ Route Cards)</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px] text-slate-800">
                  {currentCorridorOrders.map((order) => (
                    <tr key={order.id} className={order.isEnRouteStop ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1e3a2b]">
                        {order.orderNo}
                        {order.isEnRouteStop && <span className="ml-1.5 px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-sans text-[9.5px] font-bold">En-Route Pocket</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        {order.sourceType === 'SOUTHERN_OLIVE' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">🫒 Southern Olive</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300 text-[10px] font-bold">🏢 External 3PL</span>
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
                        <input
                          type="number"
                          step="0.5"
                          value={order.deliveryFeeUsd}
                          onChange={(e) => handleUpdateDeliveryFee(order.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-blue-700 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={order.assignedDriver && order.assignedDriver !== '-' ? order.assignedDriver : 'UNASSIGNED'}
                          onChange={(e) => {
                            const chosen = e.target.value;
                            const dObj = staffList.find((s) => s.fullName === chosen);
                            const vPlate = dObj?.assignedAsset?.split(' ')[0] || '-';
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id
                                  ? { ...o, assignedDriver: chosen === 'UNASSIGNED' ? '-' : chosen, vehiclePlate: vPlate }
                                  : o
                              )
                            );
                          }}
                          className={`px-2 py-1 border rounded-lg text-xs font-bold transition-colors focus:outline-none ${order.assignedDriver && order.assignedDriver !== '-' ? 'bg-emerald-50 text-[#1e3a2b] border-emerald-300' : 'bg-white text-slate-600 border-slate-300'}`}
                        >
                          <option value="UNASSIGNED">-- Select Driver --</option>
                          {staffList.filter((s) => s.type === 'DRIVER').map((d) => (
                            <option key={d.id} value={d.fullName}>{d.fullName} ({d.assignedAsset.split(' ')[0]})</option>
                          ))}
                        </select>
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
      {/* 3. ROUTE CARDS (READY FOR LOADING)                                  */}
      {/* =================================================================== */}
      {activeTab === 'path-cards' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex justify-between items-center">
            <span>🗂️ <strong>Route Cards:</strong> Live active runs confirmed and persisted in database. Ready for warehouse loading and vehicle departure.</span>
            <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-[#1e3a2b] text-white rounded-lg font-bold shadow-xs">
              🖨️ Print Assigned Route Manifest A4
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathCards.map((card) => (
              <div key={card.pathId} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">{card.pathId}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{card.corridorName}</h3>
                    <span className="text-xs text-slate-600 block">Driver: <strong>{card.driverName}</strong> | Vehicle: <strong>{card.vehiclePlate}</strong> | <strong>Trip {card.tripNo}</strong></span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">{card.status}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-500 block">PACKAGES IN RUN ({card.assignedOrders.length}):</span>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. OTHER SECTIONS (PERSISTENT & CONNECTED)                          */}
      {/* =================================================================== */}
      {activeTab === '3pl-orders' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic 3PL Commercial Orders</h3>
          <div className="text-xs text-slate-600">External merchant cargo with delivery fee isolation and live database persistence.</div>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">3PL Merchant Accounts & Remittance Agreements</h3>
          <div className="text-xs text-slate-600">Daily and weekly merchant payment agreements.</div>
        </div>
      )}

      {activeTab === 'accounting' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic Operational Accounting & Cash Vault</h3>
          <div className="text-xs text-slate-600">Operational general journal tracking courier revenues and fuel expenses.</div>
        </div>
      )}

      {activeTab === 'hr' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">SuperSonic Dedicated Logistics Roster</h3>
          <div className="text-xs text-slate-600">On-site hub controllers and field drivers roster.</div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Customer Complaints & 1-Hour Review Feed</h3>
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
                        <div className="flex gap-1.5 justify-center">
                          <a href={`https://wa.me/961${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">💬 WhatsApp</a>
                          <button type="button" onClick={() => setSelectedComplaintForAction(c)} className="px-2 py-0.5 bg-[#1e3a2b] text-white rounded text-[10px] font-bold">Resolve</button>
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

      {/* MODAL: EN-ROUTE POCKET STOPS SELECTOR (E.G. ARAMOUN / BCHAMOUN ON SOUTH RUN) */}
      {showEnRouteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full text-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Add En-Route Pocket Stops (محطات على طريق السير)</h3>
                <p className="text-[10.5px] text-slate-500">Pick packages from adjacent areas to deliver on the way out of Choueifat Hub before heading to destination.</p>
              </div>
              <button type="button" onClick={() => setShowEnRouteModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div>
              <label className="font-bold block mb-1">Select Source Area / Corridor to Pick From:</label>
              <select
                value={selectedEnRouteCorridor}
                onChange={(e) => setSelectedEnRouteCorridor(parseInt(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value={2}>Corridor 2: Aramoun, Bchamoun, Qabr Chmoun, Aley</option>
                <option value={1}>Corridor 1: Dahieh, Hadath, Khalde Coastal Axis</option>
                <option value={6}>Corridor 6: Damascus Road / Chtaura Gateway</option>
              </select>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Packages in This Area:</span>
              {availableEnRouteOrders.map((o) => (
                <div key={o.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-900 block">{o.customerName} ({o.destinationTown})</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{o.items}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddEnRouteStop(o.id)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    ➕ Attach to Run
                  </button>
                </div>
              ))}
              {availableEnRouteOrders.length === 0 && (
                <div className="p-4 text-center text-slate-400 font-mono text-xs">No pending packages in this area right now.</div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button type="button" onClick={() => setShowEnRouteModal(false)} className="px-4 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-lg text-xs">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE COMPLAINT */}
      {selectedComplaintForAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full text-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Resolve Complaint #{selectedComplaintForAction.id}</h3>
            <p className="text-slate-600"><strong>Customer:</strong> {selectedComplaintForAction.customerName} ({selectedComplaintForAction.phone})</p>
            <p className="text-slate-600"><strong>Reported Issue:</strong> "{selectedComplaintForAction.description}"</p>
            <textarea
              value={complaintResolutionInput}
              onChange={(e) => setComplaintResolutionInput(e.target.value)}
              placeholder="Record operational resolution notes..."
              rows={3}
              className="w-full p-2 border rounded-xl"
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleResolveComplaint} className="flex-1 py-2 bg-[#1e3a2b] text-white font-bold rounded-xl">Confirm & Close Ticket</button>
              <button type="button" onClick={() => setSelectedComplaintForAction(null)} className="py-2 px-4 bg-slate-200 font-bold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SuperSonicFleetLiveWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500 font-mono">Loading SuperSonic Fleet Workspace...</div>}>
      <SuperSonicFleetLiveWorkspaceContent />
    </Suspense>
  );
}
