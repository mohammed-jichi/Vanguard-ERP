'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================================================
// DRIVER APP DATA STRUCTURES - SUPERSONIC FLEET & SOUTHERN OLIVE OIL PRODUCTS
// ============================================================================

type ShiftState = 'OFF_DUTY' | 'ON_DUTY_LOADING' | 'DEPARTED' | 'RETURNING';

type StopStatus = 'QUEUED' | 'EN_ROUTE' | 'DELIVERED' | 'REJECTED' | 'PENDING';

interface DriverStop {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  town: string;
  address: string;
  itemsList: string;
  productAmountLbp: number;
  productAmountUsd: number;
  deliveryFeeUsd: number;
  repName: string;
  repCode: string;
  repPhone: string;
  status: StopStatus;
  rejectionReason?: string;
  deliveryFeePaid?: boolean;
  paymentLbp: number;
  paymentUsd: number;
  paymentWhish: number;
  whishProofUrl?: string;
  customerSignature?: string;
}

export default function SuperSonicDriverAppPage() {
  // Driver Shift State
  const [shiftState, setShiftState] = useState<ShiftState>('ON_DUTY_LOADING');
  const [activeDriverTab, setActiveDriverTab] = useState<'ROUTE' | 'LEDGER' | 'RECONCILE'>('ROUTE');
  
  // Odometer & Telemetry State
  const [startOdometerKm] = useState(142050);
  const [currentOdometerKm, setCurrentOdometerKm] = useState(142115);
  const [offDutyLocationPin, setOffDutyLocationPin] = useState<string | null>(null);

  // Today's Assigned Route Stops
  const [stops, setStops] = useState<DriverStop[]>([
    {
      id: '1',
      orderNo: 'ORD-103349',
      customerName: 'Al-Baraka Supermarket S.A.R.L',
      phone: '01745890',
      town: 'Beirut - Hamra',
      address: 'Makdessi St, Bldg 14, Ground Floor',
      itemsList: '1x 17.5L Extra Virgin Olive Oil Tin (Harvest 2026) + 2x Pickled Olives Box',
      productAmountLbp: 9000000,
      productAmountUsd: 100,
      deliveryFeeUsd: 4.0,
      repName: 'Ahmad Ali Kassem',
      repCode: 'REP-002',
      repPhone: '03445566',
      status: 'EN_ROUTE',
      paymentLbp: 0,
      paymentUsd: 0,
      paymentWhish: 0,
    },
    {
      id: '2',
      orderNo: '3PL-88120',
      customerName: 'La Rose Fashion Boutique',
      phone: '01482910',
      town: 'Metn - Sin El Fil',
      address: 'Near Habtoor Grand Hotel',
      itemsList: '3x Apparel Packages (Dry Goods)',
      productAmountLbp: 3150000,
      productAmountUsd: 35,
      deliveryFeeUsd: 3.0,
      repName: 'External Merchant',
      repCode: '3PL-VEND',
      repPhone: '03889900',
      status: 'QUEUED',
      paymentLbp: 0,
      paymentUsd: 0,
      paymentWhish: 0,
    },
    {
      id: '3',
      orderNo: 'ORD-103351',
      customerName: 'Al-Nour Food Establishment',
      phone: '01205930',
      town: 'Beirut - Achrafieh',
      address: 'Sassine Square, Rue Huvelin',
      itemsList: '6x Pomegranate Molasses (500ml), 4x Pickled Olives Glass 1Kg',
      productAmountLbp: 460000,
      productAmountUsd: 5.1,
      deliveryFeeUsd: 3.0,
      repName: 'Hiba Aloulou',
      repCode: 'REP-004',
      repPhone: '03778899',
      status: 'QUEUED',
      paymentLbp: 0,
      paymentUsd: 0,
      paymentWhish: 0,
    },
  ]);

  // Active Action Modal
  const [selectedStopForAction, setSelectedStopForAction] = useState<DriverStop | null>(null);
  const [actionType, setActionType] = useState<'DELIVERED' | 'REJECTED' | 'PENDING' | null>(null);

  // Action Form State
  const [inputLbp, setInputLbp] = useState<number>(0);
  const [inputUsd, setInputUsd] = useState<number>(0);
  const [inputWhish, setInputWhish] = useState<number>(0);
  const [whishUploaded, setWhishUploaded] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [optionalPhotosCount, setOptionalPhotosCount] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('الزبون غير متواجد بالمنزل');
  const [deliveryFeeRefused, setDeliveryFeeRefused] = useState(false);

  // Online Whish Reconciliation Submission State
  const [reconcileWhishAmountUsd, setReconcileWhishAmountUsd] = useState(100);
  const [reconcileWhishRef, setReconcileWhishRef] = useState('');
  const [reconcileWhishProofUploaded, setReconcileWhishProofUploaded] = useState(false);
  const [whishSettlementPosted, setWhishSettlementPosted] = useState(false);

  // Calculations for Driver's Daily Ledger
  const completedStops = stops.filter((s) => s.status === 'DELIVERED');
  const totalCollectedLbp = completedStops.reduce((acc, s) => acc + s.paymentLbp, 0);
  const totalCollectedUsd = completedStops.reduce((acc, s) => acc + s.paymentUsd, 0);
  const totalCollectedWhish = completedStops.reduce((acc, s) => acc + s.paymentWhish, 0);
  const totalDeliveryFeesEarnedUsd = completedStops.reduce((acc, s) => acc + s.deliveryFeeUsd, 0);

  // Handlers
  const handleOpenActionModal = (stop: DriverStop, type: 'DELIVERED' | 'REJECTED' | 'PENDING') => {
    setSelectedStopForAction(stop);
    setActionType(type);
    setInputLbp(0);
    setInputUsd(type === 'DELIVERED' ? stop.productAmountUsd + stop.deliveryFeeUsd : 0);
    setInputWhish(0);
    setWhishUploaded(false);
    setHasSignature(false);
    setOptionalPhotosCount(0);
    setDeliveryFeeRefused(false);
  };

  const handleConfirmAction = () => {
    if (!selectedStopForAction || !actionType) return;

    if (actionType === 'DELIVERED') {
      if (!hasSignature) {
        alert('⚠️ Digital signature is required before completing delivery!');
        return;
      }
      if (inputWhish > 0 && !whishUploaded) {
        alert('⚠️ Whish transfer proof screenshot is mandatory when paying with Whish!');
        return;
      }
      // Instant Live Stock Deduction (Delivered = Post بأرضها)
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'DELIVERED',
                paymentLbp: inputLbp,
                paymentUsd: inputUsd,
                paymentWhish: inputWhish,
                whishProofUrl: inputWhish > 0 ? 'whish_proof_attached.jpg' : undefined,
                customerSignature: 'signed_by_finger_on_glass',
              }
            : s
        )
      );
      alert(`✓ Order #${selectedStopForAction.orderNo} Delivered & Posted!\n- Stock deducted on-the-spot from Southern Olive warehouse.\n- Sales Rep commission credited to ${selectedStopForAction.repName}.`);
    } else if (actionType === 'REJECTED') {
      if (!hasSignature) {
        alert('⚠️ Customer signature acknowledging rejection is required!');
        return;
      }
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'REJECTED',
                rejectionReason: rejectionReason,
                deliveryFeePaid: !deliveryFeeRefused,
                paymentUsd: deliveryFeeRefused ? 0 : selectedStopForAction.deliveryFeeUsd,
              }
            : s
        )
      );
      alert(`⚠️ Order #${selectedStopForAction.orderNo} Rejected.\n- Alert dispatched to SuperSonic Management for replacement stop.\n- Alert sent to Rep ${selectedStopForAction.repName} to follow up.`);
    } else if (actionType === 'PENDING') {
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'PENDING',
                rejectionReason: rejectionReason,
              }
            : s
        )
      );
      alert(`⏳ Order #${selectedStopForAction.orderNo} Postponed.\n- Recycled into system for next day's run.\n- Alert dispatched to SuperSonic Management.`);
    }

    setSelectedStopForAction(null);
    setActionType(null);
  };

  const handleTriggerOffDuty = () => {
    const pin = 'Choueifat Gateway Coordinates (33.8044° N, 35.5211° E)';
    setOffDutyLocationPin(pin);
    setShiftState('OFF_DUTY');
    alert(`🔴 Shift Ended!\n- Final Odometer: ${currentOdometerKm} KM.\n- Off-Duty Location Pin dropped at: ${pin}.\n- Note: Tomorrow's route will be locked until yesterday's reconciliation is approved.`);
  };

  const handleSubmitWhishReconciliation = () => {
    if (!reconcileWhishProofUploaded || !reconcileWhishRef) {
      alert('⚠️ Please enter Whish Reference Number and attach transfer screenshot!');
      return;
    }
    setWhishSettlementPosted(true);
    alert(`✓ Online Whish Reconciliation of $${reconcileWhishAmountUsd} Posted!\nWaiting for SuperSonic Management approval.`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 font-sans select-none flex justify-center pb-12">
      <div className="w-full max-w-md bg-slate-950 flex flex-col min-h-screen border-x border-slate-800 shadow-2xl">
        
        {/* 1. TOP MOBILE HEADER */}
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚐</span>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">SuperSonic Driver App</h1>
              <span className="text-[10px] text-emerald-400 font-mono block">Tony Khoury (Van 01)</span>
            </div>
          </div>
          <Link href="/backoffice/fleet" className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold border border-slate-700">
            Exit
          </Link>
        </div>

        {/* 2. SHIFT STATE CONTROLLER RIBBON */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Shift Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[11px]">
              {shiftState === 'ON_DUTY_LOADING' && '🟢 On Duty / Loading'}
              {shiftState === 'DEPARTED' && '🚀 Departed from المركز الرئيسي'}
              {shiftState === 'RETURNING' && '🏢 Returning to Base'}
              {shiftState === 'OFF_DUTY' && '🔴 Off Duty'}
            </span>
          </div>

          {shiftState === 'ON_DUTY_LOADING' && (
            <button
              type="button"
              onClick={() => {
                setShiftState('DEPARTED');
                alert('🚀 Departed from المركز الرئيسي لشركة سوبر سونيك!\nGlobal WhatsApp Broadcast dispatched to all route customers with arrival time estimates.');
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span>🚀 Depart from المركز الرئيسي (Start Route)</span>
            </button>
          )}

          {shiftState === 'DEPARTED' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShiftState('RETURNING')}
                className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
              >
                🏢 Return to Base
              </button>
              <button
                type="button"
                onClick={handleTriggerOffDuty}
                className="py-1.5 px-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs"
              >
                🔴 Off Duty (Drop Pin)
              </button>
            </div>
          )}

          <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span>Odometer: <strong>{currentOdometerKm} KM</strong></span>
            <span>Today's Run: <strong className="text-emerald-400">+{currentOdometerKm - startOdometerKm} KM</strong></span>
          </div>
        </div>

        {/* 3. BOTTOM TAB NAVIGATION */}
        <div className="flex border-b border-slate-800 bg-slate-900 text-xs font-bold text-slate-400">
          <button
            type="button"
            onClick={() => setActiveDriverTab('ROUTE')}
            className={`flex-1 py-2.5 text-center transition-colors ${activeDriverTab === 'ROUTE' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-950' : 'hover:text-slate-200'}`}
          >
            📋 Route Stops ({stops.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveDriverTab('LEDGER')}
            className={`flex-1 py-2.5 text-center transition-colors ${activeDriverTab === 'LEDGER' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-950' : 'hover:text-slate-200'}`}
          >
            💵 Cash Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveDriverTab('RECONCILE')}
            className={`flex-1 py-2.5 text-center transition-colors ${activeDriverTab === 'RECONCILE' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-950' : 'hover:text-slate-200'}`}
          >
            📲 Whish Settlement
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: ROUTE STOPS LIST & DOORSTEP ACTION                           */}
        {/* =================================================================== */}
        {activeDriverTab === 'ROUTE' && (
          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            <div className="text-[11px] text-slate-400 flex justify-between items-center px-1">
              <span>المسار الأول: بيروت الكبرى والساحل المتصل</span>
              <span className="font-mono text-emerald-400">{completedStops.length} / {stops.length} Delivered</span>
            </div>

            {stops.map((stop, idx) => (
              <div
                key={stop.id}
                className={`p-3.5 rounded-2xl border transition-all ${stop.status === 'EN_ROUTE' ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/30' : stop.status === 'DELIVERED' ? 'bg-slate-900/60 border-emerald-500/40 opacity-70' : stop.status === 'REJECTED' ? 'bg-rose-950/20 border-rose-600/40' : 'bg-slate-900 border-slate-800'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Stop #{idx + 1}</span>
                    <h3 className="font-bold text-white text-xs mt-1">{stop.customerName}</h3>
                    <p className="text-[11px] text-slate-400">{stop.town}</p>
                    <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">{stop.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stop.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' : stop.status === 'EN_ROUTE' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : stop.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                    {stop.status}
                  </span>
                </div>

                {/* Packaging & Items Checklist */}
                <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
                  <span className="text-[10px] text-slate-500 font-bold block">PACKING & ADD-ONS LIST:</span>
                  <span className="text-slate-300 font-medium">{stop.itemsList}</span>
                </div>

                {/* Financial Breakdown */}
                <div className="mt-2 flex justify-between items-center text-xs font-mono p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[9.5px] block">PRODUCT AMOUNT</span>
                    <strong className="text-white">${stop.productAmountUsd.toFixed(2)} ({stop.productAmountLbp.toLocaleString()} LBP)</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-400 text-[9.5px] block font-bold">DELIVERY FEE</span>
                    <strong className="text-blue-400">${stop.deliveryFeeUsd.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Navigation Button */}
                <div className="mt-2.5 flex gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(stop.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <span>🗺️ Open in Google Maps</span>
                  </a>
                  <a
                    href={`tel:${stop.phone}`}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                  >
                    <span>📞 Call</span>
                  </a>
                </div>

                {/* Doorstep Action Buttons */}
                {stop.status === 'EN_ROUTE' && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(stop, 'DELIVERED')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
                    >
                      ✓ Delivered (Post)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(stop, 'REJECTED')}
                      className="py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs"
                    >
                      ✕ Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(stop, 'PENDING')}
                      className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
                    >
                      ⏳ Pending
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: MY DAILY COLLECTIONS LEDGER (MULTI-CURRENCY RUNNING TOTALS)  */}
        {/* =================================================================== */}
        {activeDriverTab === 'LEDGER' && (
          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-300">Daily Cash & Whish Collections Ledger</h2>
            
            <div className="space-y-2">
              {completedStops.map((stop) => (
                <div key={stop.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-sans">{stop.customerName}</strong>
                    <span className="text-[10px] text-slate-500">#{stop.orderNo}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] border-t border-slate-800/80">
                    <div><span className="text-slate-500 block text-[9.5px]">USD</span><strong className="text-emerald-400">${stop.paymentUsd}</strong></div>
                    <div><span className="text-slate-500 block text-[9.5px]">LBP</span><strong className="text-emerald-400">{stop.paymentLbp.toLocaleString()}</strong></div>
                    <div><span className="text-purple-400 block text-[9.5px]">WHISH</span><strong className="text-purple-400">${stop.paymentWhish}</strong></div>
                  </div>
                </div>
              ))}

              {completedStops.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No completed deliveries collected yet today.
                </div>
              )}
            </div>

            {/* Sticky Running Totals at Bottom */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 font-mono text-xs">
              <div className="text-[11px] font-bold text-slate-400 font-sans border-b border-slate-800 pb-1">
                TOTAL COLLECTED IN HAND:
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total USD Cash:</span>
                <strong className="text-emerald-400 font-bold">${totalCollectedUsd.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total LBP Cash:</span>
                <strong className="text-emerald-400 font-bold">{totalCollectedLbp.toLocaleString()} LBP</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Whish Money:</span>
                <strong className="text-purple-400 font-bold">${totalCollectedWhish.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-blue-400 font-bold">
                <span>My Delivery Fees Earned:</span>
                <span>${totalDeliveryFeesEarnedUsd.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: ONLINE WHISH RECONCILIATION SUBMISSION                      */}
        {/* =================================================================== */}
        {activeDriverTab === 'RECONCILE' && (
          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-300">Online Reconciliation via Whish Money</h2>
            <p className="text-[11px] text-slate-400">
              Transfer daily funds to SuperSonic company Whish account to settle your custody remotely.
            </p>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Transfer Amount (USD):</label>
                <input
                  type="number"
                  value={reconcileWhishAmountUsd}
                  onChange={(e) => setReconcileWhishAmountUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono font-bold text-white text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Whish Transfer Reference No:</label>
                <input
                  type="text"
                  value={reconcileWhishRef}
                  onChange={(e) => setReconcileWhishRef(e.target.value)}
                  placeholder="e.g. WHISH-TX-9988124"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Upload Whish Receipt Screenshot:</label>
                <button
                  type="button"
                  onClick={() => setReconcileWhishProofUploaded(true)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-colors ${reconcileWhishProofUploaded ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'}`}
                >
                  {reconcileWhishProofUploaded ? '✓ Screenshot Attached' : '📸 Take Photo of Whish Slip'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitWhishReconciliation}
                className="w-full py-2.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
              >
                🚀 Post Online Reconciliation to SuperSonic
              </button>
            </div>

            {whishSettlementPosted && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-mono">
                ⏳ Reconciliation submitted. SuperSonic Management is verifying the transfer.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. MODAL FOR DOORSTEP ACTION (DELIVERED / REJECTED / PENDING)        */}
        {/* =================================================================== */}
        {selectedStopForAction && actionType && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-sm w-full p-4 space-y-3.5 text-xs text-slate-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-sm">
                  {actionType === 'DELIVERED' && '✓ Confirm Delivery (Delivered = Post)'}
                  {actionType === 'REJECTED' && '✕ Mark as Rejected'}
                  {actionType === 'PENDING' && '⏳ Mark as Pending (Postponed)'}
                </h3>
                <button type="button" onClick={() => setSelectedStopForAction(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              {actionType === 'DELIVERED' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">PRODUCT PRICE:</span>
                      <strong className="text-white">${selectedStopForAction.productAmountUsd}</strong>
                    </div>
                    <div>
                      <span className="text-blue-400 block font-bold">DELIVERY FEE:</span>
                      <strong className="text-blue-400">${selectedStopForAction.deliveryFeeUsd}</strong>
                    </div>
                  </div>

                  {/* Multi-Payment Fields */}
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between items-center">
                      <span>USD Paid:</span>
                      <input
                        type="number"
                        value={inputUsd}
                        onChange={(e) => setInputUsd(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-bold text-emerald-400"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>LBP Paid:</span>
                      <input
                        type="number"
                        value={inputLbp}
                        onChange={(e) => setInputLbp(parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-bold text-emerald-400"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Whish Paid:</span>
                      <input
                        type="number"
                        value={inputWhish}
                        onChange={(e) => setInputWhish(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-bold text-purple-400"
                      />
                    </div>
                  </div>

                  {inputWhish > 0 && (
                    <button
                      type="button"
                      onClick={() => setWhishUploaded(!whishUploaded)}
                      className={`w-full py-1.5 rounded-lg border text-[11px] font-bold ${whishUploaded ? 'bg-purple-600 text-white' : 'bg-rose-900/40 text-rose-300 border-rose-600'}`}
                    >
                      {whishUploaded ? '✓ Whish Proof Attached' : '📸 Upload Whish Transfer Proof (Mandatory)'}
                    </button>
                  )}

                  {/* Digital Signature on Screen */}
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-slate-400 block font-bold">Customer Signature on Screen:</span>
                    <div
                      onClick={() => setHasSignature(true)}
                      className="h-14 bg-slate-950 border border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer"
                    >
                      {hasSignature ? (
                        <span className="font-mono text-xs text-emerald-400 font-bold">✓ Signed by Customer</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Tap to Sign with Finger</span>
                      )}
                    </div>
                  </div>

                  {/* Optional Photos (2 Max) */}
                  <button
                    type="button"
                    onClick={() => setOptionalPhotosCount(optionalPhotosCount === 2 ? 0 : optionalPhotosCount + 1)}
                    className="w-full py-1 bg-slate-800 text-slate-300 rounded-lg text-[10.5px] border border-slate-700"
                  >
                    📸 Attach Photos of Goods ({optionalPhotosCount}/2 attached)
                  </button>
                </div>
              )}

              {actionType === 'REJECTED' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Reason for Rejection:</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="الزبون غير متواجد بالمنزل">الزبون غير متواجد بالمنزل</option>
                      <option value="الزبون غيّر رأيه ولم يعد يريد البضاعة">الزبون غيّر رأيه ولم يعد يريد البضاعة</option>
                      <option value="الزبون اعترض على السعر">الزبون اعترض على السعر</option>
                      <option value="تأخر الطلبية">تأخر الطلبية</option>
                    </select>
                  </div>

                  {/* Delivery Fee Field Remains Open (Red Alert if refused) */}
                  <div className={`p-2.5 rounded-xl border ${deliveryFeeRefused ? 'bg-rose-950/40 border-rose-500' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex justify-between items-center text-xs">
                      <span>Mandatory Delivery Fee:</span>
                      <strong className="text-blue-400 font-mono">${selectedStopForAction.deliveryFeeUsd}</strong>
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-[11px] text-rose-400 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deliveryFeeRefused}
                        onChange={(e) => setDeliveryFeeRefused(e.target.checked)}
                      />
                      <span>Customer Refused to Pay Delivery Fee (Red Alert)</span>
                    </label>
                  </div>

                  {/* Customer Signature for Rejection */}
                  <div
                    onClick={() => setHasSignature(true)}
                    className="h-12 bg-slate-950 border border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer"
                  >
                    {hasSignature ? (
                      <span className="font-mono text-xs text-emerald-400 font-bold">✓ Rejection Signed by Customer</span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Customer Signature Acknowledging Rejection</span>
                    )}
                  </div>
                </div>
              )}

              {actionType === 'PENDING' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Reason for Postponement:</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="الزبون طلب تأجيل التسليم لبكرة">الزبون طلب تأجيل التسليم لبكرة</option>
                      <option value="هاتف الزبون مقفل / لا يجيب">هاتف الزبون مقفل / لا يجيب</option>
                      <option value="عالق بزحمة سير / تعذر الوصول">عالق بزحمة سير / تعذر الوصول</option>
                    </select>
                  </div>
                  <p className="text-[10.5px] text-amber-400">
                    This order will be returned to base and rescheduled automatically for tomorrow's route.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmAction}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
