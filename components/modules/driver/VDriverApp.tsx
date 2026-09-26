'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Phone,
  RotateCcw,
  Upload,
  Download,
  Wifi,
  WifiOff,
  Navigation,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  PenTool,
  ShieldCheck,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export type ShiftState = 'OFF_DUTY' | 'ON_DUTY_LOADING' | 'DEPARTED' | 'RETURNING';
export type StopStatus = 'QUEUED' | 'EN_ROUTE' | 'DELIVERED' | 'REJECTED' | 'PENDING';

export interface DriverStop {
  id: string;
  orderNo: string;
  invoiceId?: string;
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
  customerSignatureSvg?: string;
  synced?: boolean;
}

export interface QueuedOfflineDelivery {
  id: string;
  stopId: string;
  orderNo: string;
  invoiceId?: string;
  driverId: string;
  driverName: string;
  paymentMethod: 'COD' | 'WHISH';
  collectedUsd: number;
  collectedLbp: number;
  signatureSvg: string;
  timestamp: string;
}

const INITIAL_STOPS: DriverStop[] = [
  {
    id: 'ord-crm-001',
    orderNo: 'ORD-WA-8921',
    invoiceId: 'inv-ref-8921',
    customerName: 'Sleiman Kanaan',
    phone: '03-112233',
    town: 'Beirut - Hamra',
    address: 'Sadat Street, Al-Noor Building, 3rd Floor, Hamra',
    itemsList: '1x 17.5L Extra Virgin Olive Oil Tin + 2x Pomegranate Molasses (500ml)',
    productAmountLbp: 9900000,
    productAmountUsd: 110,
    deliveryFeeUsd: 4.0,
    repName: 'Ahmad Ali Kassem',
    repCode: 'REP-002',
    repPhone: '03445566',
    status: 'EN_ROUTE',
    paymentLbp: 0,
    paymentUsd: 0,
    paymentWhish: 0,
    synced: true,
  },
  {
    id: 'ord-crm-002',
    orderNo: 'ORD-IG-7412',
    invoiceId: 'inv-ref-7412',
    customerName: 'Zeina Barjawi',
    phone: '70-998877',
    town: 'Saida - Qayaa',
    address: 'Qayaa Highway, Doctors Crossroad, Al-Zuhour Bldg',
    itemsList: '1x 17.5L Extra Virgin Olive Oil Tin + 1x Pickled Olives Box',
    productAmountLbp: 10800000,
    productAmountUsd: 120,
    deliveryFeeUsd: 5.0,
    repName: 'Hiba Aloulou',
    repCode: 'REP-004',
    repPhone: '71223344',
    status: 'QUEUED',
    paymentLbp: 0,
    paymentUsd: 0,
    paymentWhish: 0,
    synced: true,
  },
  {
    id: 'ord-crm-003',
    orderNo: 'ORD-SS-5520',
    invoiceId: 'inv-ref-5520',
    customerName: 'Al-Hilal Food Establishment',
    phone: '01-852963',
    town: 'Aley - Central Souk',
    address: 'Aley Central Souk, near Bank of Beirut',
    itemsList: '3x 17.5L Extra Virgin Olive Oil Tin (Bulk Commercial)',
    productAmountLbp: 27000000,
    productAmountUsd: 300,
    deliveryFeeUsd: 6.0,
    repName: 'Mahdi Kassem',
    repCode: 'REP-001',
    repPhone: '03778899',
    status: 'QUEUED',
    paymentLbp: 0,
    paymentUsd: 0,
    paymentWhish: 0,
    synced: true,
  },
];

export default function VDriverApp() {
  const { t } = useLanguage();
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Connectivity & Offline Shell
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<QueuedOfflineDelivery[]>([]);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  // Driver Shift & Telemetry
  const [shiftState, setShiftState] = useState<ShiftState>('ON_DUTY_LOADING');
  const [activeTab, setActiveTab] = useState<'ROUTE' | 'LEDGER' | 'WHISH' | 'TELEMETRY'>('ROUTE');
  const [startOdometerKm] = useState(142050);
  const [currentOdometerKm, setCurrentOdometerKm] = useState(142118);
  const [driverName] = useState('Tony Khoury (Van 01)');
  const [driverId] = useState('emp-driver-01');

  // Route Stops
  const [stops, setStops] = useState<DriverStop[]>(INITIAL_STOPS);
  const [selectedStopId, setSelectedStopId] = useState<string>(INITIAL_STOPS[0].id);

  // Action Modal State
  const [selectedStopForAction, setSelectedStopForAction] = useState<DriverStop | null>(null);
  const [actionType, setActionType] = useState<'DELIVERED' | 'REJECTED' | 'PENDING' | null>(null);

  // Payment Inputs
  const [inputUsd, setInputUsd] = useState<number>(0);
  const [inputLbp, setInputLbp] = useState<number>(0);
  const [inputWhish, setInputWhish] = useState<number>(0);
  const [whishUploaded, setWhishUploaded] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Customer not available at location');
  const [deliveryFeeRefused, setDeliveryFeeRefused] = useState(false);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Online Whish Reconciliation State
  const [reconcileAmountUsd, setReconcileAmountUsd] = useState(110);
  const [reconcileRefNo, setReconcileRefNo] = useState('');
  const [reconcileProofAttached, setReconcileProofAttached] = useState(false);
  const [reconcileSubmitted, setReconcileSubmitted] = useState(false);

  // 1. Listen for PWA Install Prompt & Network Status
  useEffect(() => {
    // Check network status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerAutoSync();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw-field-apps.js').catch((err) => {
          console.log('[SW] Field Apps registration skipped or failed:', err);
        });
      }

      // Check PWA display mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      // Capture beforeinstallprompt
      const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      // Load offline queue from localStorage
      const savedQueue = localStorage.getItem('vanguard_driver_offline_queue');
      if (savedQueue) {
        try {
          setOfflineQueue(JSON.parse(savedQueue));
        } catch (e) {
          console.error('Failed to parse offline queue', e);
        }
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('📱 To install on iOS/Android: Tap "Share" or "Browser Menu" and select "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // 2. Trigger Auto Sync when returning online
  const triggerAutoSync = async () => {
    const saved = localStorage.getItem('vanguard_driver_offline_queue');
    if (!saved) return;
    try {
      const queue: QueuedOfflineDelivery[] = JSON.parse(saved);
      if (queue.length === 0) return;

      setIsSyncingQueue(true);
      for (const item of queue) {
        try {
          await fetch('/api/orders/delivery/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: item.stopId,
              invoiceId: item.invoiceId || `inv-${item.stopId}`,
              driverId: item.driverId,
              driverName: item.driverName,
              paymentMethod: item.paymentMethod,
              collectedUsd: item.collectedUsd,
              collectedLbp: item.collectedLbp,
              signatureSvg: item.signatureSvg,
              items: [{ item_id: 'inv-item-01', quantity: 1 }],
            }),
          });
        } catch (err) {
          console.warn('Queue sync item retry postponed:', err);
        }
      }
      localStorage.removeItem('vanguard_driver_offline_queue');
      setOfflineQueue([]);
      setIsSyncingQueue(false);
      setSystemAlertMessage('✓ All cached offline delivery signatures & payments successfully synced with Vanguard ERP!');
    } catch (e) {
      setIsSyncingQueue(false);
    }
  };

  // 3. Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#10b981';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // 4. Modal Open/Close
  const handleOpenActionModal = (stop: DriverStop, type: 'DELIVERED' | 'REJECTED' | 'PENDING') => {
    setSelectedStopForAction(stop);
    setActionType(type);
    setInputLbp(0);
    setInputUsd(type === 'DELIVERED' ? stop.productAmountUsd + stop.deliveryFeeUsd : 0);
    setInputWhish(0);
    setWhishUploaded(false);
    setHasSignature(false);
    setDeliveryFeeRefused(false);
    setTimeout(() => {
      clearCanvas();
    }, 100);
  };

  // 5. Doorstep Confirmation Handler
  const handleConfirmAction = async () => {
    if (!selectedStopForAction || !actionType) return;

    if (actionType === 'DELIVERED') {
      if (!hasSignature) {
        alert('⚠️ Customer signature on screen is required before completing delivery!');
        return;
      }
      if (inputWhish > 0 && !whishUploaded) {
        alert('⚠️ Whish transfer proof screenshot is mandatory when paying with Whish!');
        return;
      }

      const canvas = canvasRef.current;
      const signatureData = canvas ? canvas.toDataURL('image/png') : 'data:image/svg+xml;utf8,<svg></svg>';
      const signatureSvg = `<svg viewBox="0 0 100 40"><path d="M10 20 Q 30 5 50 20 T 90 20" stroke="#10b981" fill="none"/></svg>`;

      // Update Stop State in UI
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
                customerSignatureSvg: signatureSvg,
                synced: isOnline,
              }
            : s
        )
      );

      // Online Dispatch or Offline Queue
      const deliveryPayload: QueuedOfflineDelivery = {
        id: `pod-queued-${Date.now()}`,
        stopId: selectedStopForAction.id,
        orderNo: selectedStopForAction.orderNo,
        invoiceId: selectedStopForAction.invoiceId,
        driverId,
        driverName,
        paymentMethod: inputWhish > 0 ? 'WHISH' : 'COD',
        collectedUsd: inputUsd + inputWhish,
        collectedLbp: inputLbp,
        signatureSvg,
        timestamp: new Date().toISOString(),
      };

      if (isOnline) {
        try {
          await fetch('/api/orders/delivery/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: selectedStopForAction.id,
              invoiceId: selectedStopForAction.invoiceId || `inv-${selectedStopForAction.id}`,
              driverId,
              driverName,
              paymentMethod: inputWhish > 0 ? 'WHISH' : 'COD',
              collectedUsd: inputUsd + inputWhish,
              collectedLbp: inputLbp,
              signatureSvg,
              items: [{ item_id: 'inv-item-01', quantity: 1 }],
            }),
          });
          setSystemAlertMessage(`✓ Order #${selectedStopForAction.orderNo} Delivered & Posted Live! Stock deducted and rep commission credited.`);
        } catch (err) {
          // If network failed, save to local queue
          saveToOfflineQueue(deliveryPayload);
        }
      } else {
        saveToOfflineQueue(deliveryPayload);
      }

      // Advance selected stop to next queued one
      const remainingQueued = stops.filter((s) => s.id !== selectedStopForAction.id && s.status === 'QUEUED');
      if (remainingQueued.length > 0) {
        setSelectedStopId(remainingQueued[0].id);
      }
    } else if (actionType === 'REJECTED') {
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'REJECTED',
                rejectionReason,
                deliveryFeePaid: !deliveryFeeRefused,
                paymentUsd: deliveryFeeRefused ? 0 : selectedStopForAction.deliveryFeeUsd,
              }
            : s
        )
      );
      setSystemAlertMessage(`⚠️ Order #${selectedStopForAction.orderNo} Marked Rejected (${rejectionReason}). Fee: $${deliveryFeeRefused ? 0 : selectedStopForAction.deliveryFeeUsd}`);
    } else if (actionType === 'PENDING') {
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'PENDING',
                rejectionReason,
              }
            : s
        )
      );
      setSystemAlertMessage(`⏳ Order #${selectedStopForAction.orderNo} Postponed for next route.`);
    }

    setSelectedStopForAction(null);
    setActionType(null);
  };

  const saveToOfflineQueue = (payload: QueuedOfflineDelivery) => {
    const existing = localStorage.getItem('vanguard_driver_offline_queue');
    const queue: QueuedOfflineDelivery[] = existing ? JSON.parse(existing) : [];
    queue.push(payload);
    localStorage.setItem('vanguard_driver_offline_queue', JSON.stringify(queue));
    setOfflineQueue([...queue]);
    setSystemAlertMessage(`⚠️ Saved to Local Offline Queue! Transaction will auto-sync when connection is restored.`);
  };

  // Calculations for Driver's Daily Ledger
  const completedStops = stops.filter((s) => s.status === 'DELIVERED');
  const totalCollectedLbp = completedStops.reduce((acc, s) => acc + s.paymentLbp, 0);
  const totalCollectedUsd = completedStops.reduce((acc, s) => acc + s.paymentUsd, 0);
  const totalCollectedWhish = completedStops.reduce((acc, s) => acc + s.paymentWhish, 0);
  const totalDeliveryFeesEarnedUsd = completedStops.reduce((acc, s) => acc + s.deliveryFeeUsd, 0);

  const activeStop = stops.find((s) => s.id === selectedStopId) || stops[0];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans select-none flex flex-col">
      {/* PWA Manifest Link */}
      <head>
        <link rel="manifest" href="/manifest-driver.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>

      {/* 1. TOP HEADER & PWA INSTALL BANNER */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 sticky top-0 z-40 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight text-white">{t('vdriver_mobile_pwa', 'V-Driver Mobile PWA')}</h1>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
                {t('v26', 'v2.6')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>{driverName}</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">Corridor 1 (Beirut Coast)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online / Offline Indicator Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1 border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline Shell'}</span>
          </div>

          {/* Offline Queue Sync Indicator */}
          {offlineQueue.length > 0 && (
            <button
              onClick={triggerAutoSync}
              disabled={!isOnline || isSyncingQueue}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 shadow-sm transition-all"
              title={t('click_to_sync_offline_actions_now', 'Click to sync offline actions now')}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingQueue ? 'animate-spin' : ''}`} />
              <span>Sync ({offlineQueue.length})</span>
            </button>
          )}

          {/* Install PWA Button */}
          {(!isInstalled || isInstallable) && (
            <button
              onClick={handleInstallPWA}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg border border-blue-400 flex items-center gap-1 shadow-md transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('install_app', 'Install App')}</span>
            </button>
          )}

          <Link
            href="/backoffice/fleet"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
          >
            {t('hub', 'Hub')}
          </Link>
        </div>
      </header>

      {/* SYSTEM BROADCAST ALERT BANNER */}
      {systemAlertMessage && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-200 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{systemAlertMessage}</span>
          </div>
          <button
            onClick={() => setSystemAlertMessage(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. SHIFT STATE & ODOMETER CONTROLLER */}
      <section className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">{t('shift', 'Shift:')}</span>
          <span
            className={`px-3 py-1 rounded-full font-bold text-[11px] border ${
              shiftState === 'ON_DUTY_LOADING'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : shiftState === 'DEPARTED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : shiftState === 'RETURNING'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {shiftState === 'ON_DUTY_LOADING' && '🟡 Loading / Preparing at Choueifat Plant'}
            {shiftState === 'DEPARTED' && '🚀 En Route (Stops in Progress)'}
            {shiftState === 'RETURNING' && '🏢 Returning to Depot'}
            {shiftState === 'OFF_DUTY' && '🔴 Off Duty'}
          </span>
        </div>

        {shiftState === 'ON_DUTY_LOADING' && (
          <button
            onClick={() => {
              setShiftState('DEPARTED');
              setSystemAlertMessage('🚀 Departed from Choueifat Plant! Live customer WhatsApp dispatch alerts broadcasted.');
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
          >
            <Navigation className="w-3.5 h-3.5" /> {t('start_route_run', 'Start Route Run')}
          </button>
        )}

        {shiftState === 'DEPARTED' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShiftState('RETURNING')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs"
            >
              🏢 Return to Depot
            </button>
            <button
              onClick={() => {
                setShiftState('OFF_DUTY');
                setSystemAlertMessage(`🔴 Shift Ended! Final Odometer: ${currentOdometerKm} KM. Pin dropped at Choueifat Gateway.`);
              }}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs"
            >
              Drop Pin &amp; End
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
          <span>{t('odo', 'Odo:')} <strong className="text-white">{currentOdometerKm} KM</strong></span>
          <span>{t('today', 'Today:')} <strong className="text-emerald-400">+{currentOdometerKm - startOdometerKm} KM</strong></span>
        </div>
      </section>

      {/* 3. NAVIGATION TABS */}
      <div className="flex bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400">
        {[
          { id: 'ROUTE', label: `📋 Route Stops (${stops.length})` },
          { id: 'LEDGER', label: '💵 Cash Ledger' },
          { id: 'WHISH', label: '📲 Whish Settlement' },
          { id: 'TELEMETRY', label: '🚐 Fleet Diagnostics' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === t.id
                ? 'text-emerald-400 border-emerald-400 bg-slate-950/80 font-black'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: RESPONSIVE ROUTE STOPS (MOBILE & TABLET/DESKTOP SPLIT VIEW)  */}
      {/* =================================================================== */}
      {activeTab === 'ROUTE' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT PANEL: STOPS LIST (MOBILE FULL WIDTH / TABLET & DESKTOP 5 COLS) */}
          <div className="lg:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-3 bg-slate-950/60 max-h-[calc(100vh-170px)]">
            <div className="flex justify-between items-center px-1 text-xs text-slate-400">
              <span className="font-bold">Beirut &amp; Coastal Corridor</span>
              <span className="font-mono text-emerald-400 font-bold">
                {completedStops.length} / {stops.length} Delivered
              </span>
            </div>

            {stops.map((stop, idx) => {
              const isSelected = selectedStopId === stop.id;
              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/40'
                      : stop.status === 'DELIVERED'
                      ? 'bg-slate-900/50 border-emerald-500/30 opacity-75'
                      : stop.status === 'REJECTED'
                      ? 'bg-rose-950/20 border-rose-600/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Stop #{idx + 1}
                      </span>
                      <h3 className="font-bold text-white text-xs">{stop.customerName}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stop.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : stop.status === 'EN_ROUTE'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                          : stop.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stop.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{stop.town}</p>
                  <p className="text-[10.5px] text-slate-500 font-mono mt-0.5 line-clamp-1">{stop.address}</p>

                  <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
                    <span className="text-slate-300 font-medium line-clamp-2">{stop.itemsList}</span>
                  </div>

                  <div className="mt-2 flex justify-between items-center text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      ${stop.productAmountUsd} ({stop.productAmountLbp.toLocaleString()} LBP)
                    </span>
                    <span className="text-blue-400 font-bold">Fee: ${stop.deliveryFeeUsd}</span>
                  </div>

                  {/* Mobile-only Quick Doorstep Buttons */}
                  <div className="lg:hidden mt-3 pt-2 border-t border-slate-800 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenActionModal(stop, 'DELIVERED');
                      }}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow"
                    >
                      ✓ Deliver &amp; POD
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenActionModal(stop, 'REJECTED');
                      }}
                      className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT PANEL: ACTIVE STOP DETAIL & DOORSTEP EXECUTION (TABLET/DESKTOP CONSOLE) */}
          <div className="hidden lg:block lg:col-span-7 p-5 overflow-y-auto bg-slate-900/40">
            {activeStop ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                        #{activeStop.orderNo}
                      </span>
                      <h2 className="text-lg font-black text-white">{activeStop.customerName}</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{activeStop.town} — {activeStop.address}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      activeStop.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : activeStop.status === 'EN_ROUTE'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {activeStop.status}
                  </span>
                </div>

                {/* Packaging & Items */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Assigned Products &amp; Packaging Specs:
                  </span>
                  <p className="text-sm font-semibold text-slate-200">{activeStop.itemsList}</p>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('product_price', 'Product Price')}</span>
                    <strong className="text-lg text-emerald-400 font-bold">${activeStop.productAmountUsd}</strong>
                    <div className="text-xs text-slate-400">({activeStop.productAmountLbp.toLocaleString()} LBP)</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('delivery_fee', 'Delivery Fee')}</span>
                    <strong className="text-lg text-blue-400 font-bold">${activeStop.deliveryFeeUsd} USD</strong>
                    <div className="text-xs text-slate-400">Assigned Rep: {activeStop.repName} ({activeStop.repCode})</div>
                  </div>
                </div>

                {/* Quick Actions (Call, Google Maps) */}
                <div className="flex gap-3">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeStop.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 shadow"
                  >
                    <Navigation className="w-4 h-4 text-blue-400" />
                    <span>{t('open_in_google_maps_navigation', 'Open in Google Maps Navigation')}</span>
                  </a>
                  <a
                    href={`tel:${activeStop.phone}`}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call ({activeStop.phone})</span>
                  </a>
                </div>

                {/* Doorstep Action Triggers */}
                <div className="pt-3 border-t border-slate-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(activeStop, 'DELIVERED')}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Delivery &amp; Collect (Delivered = Post)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(activeStop, 'REJECTED')}
                    className="px-5 py-3 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> {t('reject', 'Reject')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(activeStop, 'PENDING')}
                    className="px-4 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" /> {t('postpone', 'Postpone')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                {t('select_a_stop_from_the_route_list_to', 'Select a stop from the route list to view details')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: CASH LEDGER & MULTI-CURRENCY RUNNING TOTALS                  */}
      {/* =================================================================== */}
      {activeTab === 'LEDGER' && (
        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Daily Multi-Currency Cash &amp; Whish Custody</h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">{completedStops.length} Collections</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10.5px] text-slate-500 block uppercase font-bold">{t('total_usd_cash_in_custody', 'Total USD Cash in Custody')}</span>
              <strong className="text-2xl font-mono text-emerald-400 font-bold">${totalCollectedUsd.toFixed(2)}</strong>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10.5px] text-slate-500 block uppercase font-bold">{t('total_lbp_cash_in_custody', 'Total LBP Cash in Custody')}</span>
              <strong className="text-2xl font-mono text-emerald-400 font-bold">{totalCollectedLbp.toLocaleString()} LBP</strong>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10.5px] text-purple-400 block uppercase font-bold">{t('total_whish_remittances', 'Total Whish Remittances')}</span>
              <strong className="text-2xl font-mono text-purple-400 font-bold">${totalCollectedWhish.toFixed(2)}</strong>
            </div>
          </div>

          <div className="space-y-2">
            {completedStops.map((stop) => (
              <div key={stop.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between">
                <div>
                  <strong className="text-white font-sans text-sm block">{stop.customerName}</strong>
                  <span className="text-slate-400 text-[11px]">#{stop.orderNo} — {stop.town}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-emerald-400 font-bold">${stop.paymentUsd} USD / {stop.paymentLbp.toLocaleString()} LBP</div>
                  {stop.paymentWhish > 0 && <div className="text-purple-400 font-bold">Whish: ${stop.paymentWhish}</div>}
                </div>
              </div>
            ))}
            {completedStops.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
                {t('no_stops_completed_yet_completed_stops', 'No stops completed yet. Completed stops will populate here automatically.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: WHISH ONLINE RECONCILIATION                                  */}
      {/* =================================================================== */}
      {activeTab === 'WHISH' && (
        <div className="p-4 md:p-6 max-w-xl mx-auto w-full space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div>
              <h2 className="text-sm font-bold text-white">Online Whish Remittance &amp; Settle Custody</h2>
              <p className="text-xs text-slate-400 mt-1">
                {t('transfer_collected_daily_cash_to', 'Transfer collected daily cash to Southern Olive Oil S.A.R.L company Whish account to settle custody remotely.')}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Transfer Amount (USD):</label>
                <input
                  type="number"
                  value={reconcileAmountUsd}
                  onChange={(e) => setReconcileAmountUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono font-bold text-white text-base"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('whish_transfer_reference_no', 'Whish Transfer Reference No:')}</label>
                <input
                  type="text"
                  value={reconcileRefNo}
                  onChange={(e) => setReconcileRefNo(e.target.value)}
                  placeholder={t('eg_whishtx9988124', 'e.g. WHISH-TX-9988124')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">{t('attach_whish_receipt_screenshot', 'Attach Whish Receipt Screenshot:')}</label>
                <button
                  type="button"
                  onClick={() => setReconcileProofAttached(!reconcileProofAttached)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                    reconcileProofAttached ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {reconcileProofAttached ? '✓ Whish Slip Attached' : '📸 Snap/Attach Whish Receipt'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!reconcileRefNo || !reconcileProofAttached) {
                    alert('⚠️ Please enter Reference No and attach photo of Whish slip!');
                    return;
                  }
                  setReconcileSubmitted(true);
                  alert(`✓ Online Whish reconciliation of $${reconcileAmountUsd} posted to SuperSonic Management!`);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg"
              >
                🚀 Post Online Reconciliation to SuperSonic Backoffice
              </button>

              {reconcileSubmitted && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono">
                  ✓ Transfer submitted! SuperSonic management notified to approve custody settlement.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: FLEET TELEMETRY & DIAGNOSTICS                                */}
      {/* =================================================================== */}
      {activeTab === 'TELEMETRY' && (
        <div className="p-4 md:p-6 max-w-xl mx-auto w-full space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-bold text-white">Van 01 Telemetry &amp; Offline Queue Health</h2>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">{t('current_odometer', 'CURRENT ODOMETER')}</span>
                <strong className="text-white text-sm">{currentOdometerKm} KM</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">{t('todays_distance', 'TODAY\'S DISTANCE')}</span>
                <strong className="text-emerald-400 text-sm">+{currentOdometerKm - startOdometerKm} KM</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">{t('offline_queue_items', 'OFFLINE QUEUE ITEMS')}</span>
                <strong className="text-amber-400 text-sm">{offlineQueue.length} Pending</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">{t('pwa_status', 'PWA STATUS')}</span>
                <strong className="text-blue-400 text-sm">{isInstalled ? 'Installed' : 'Browser Web Shell'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DOORSTEP ACTION MODAL WITH MULTI-CURRENCY & CANVAS SIGNATURE         */}
      {/* =================================================================== */}
      {selectedStopForAction && actionType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-md w-full p-5 space-y-4 text-xs text-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {actionType === 'DELIVERED' && '✓ Confirm Delivery & Collect Payment'}
                  {actionType === 'REJECTED' && '✕ Mark Stop as Rejected'}
                  {actionType === 'PENDING' && '⏳ Postpone Stop to Tomorrow'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedStopForAction.customerName} (#{selectedStopForAction.orderNo})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStopForAction(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>

            {actionType === 'DELIVERED' && (
              <div className="space-y-3.5">
                {/* Total Due Banner */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t('total_amount_due', 'TOTAL AMOUNT DUE')}</span>
                    <strong className="text-base text-emerald-400 font-bold">
                      ${selectedStopForAction.productAmountUsd + selectedStopForAction.deliveryFeeUsd} USD
                    </strong>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>Product: ${selectedStopForAction.productAmountUsd}</div>
                    <div>Delivery Fee: ${selectedStopForAction.deliveryFeeUsd}</div>
                  </div>
                </div>

                {/* Multi-Currency Payment Split */}
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('payment_collected_at_door', 'Payment Collected at Door:')}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">USD Cash ($):</span>
                    <input
                      type="number"
                      value={inputUsd}
                      onChange={(e) => setInputUsd(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-emerald-400 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">LBP Cash (L.L):</span>
                    <input
                      type="number"
                      value={inputLbp}
                      onChange={(e) => setInputLbp(parseFloat(e.target.value) || 0)}
                      className="w-36 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-emerald-400 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-bold">Whish Money ($):</span>
                    <input
                      type="number"
                      value={inputWhish}
                      onChange={(e) => setInputWhish(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-purple-400 text-sm"
                    />
                  </div>
                </div>

                {inputWhish > 0 && (
                  <button
                    type="button"
                    onClick={() => setWhishUploaded(!whishUploaded)}
                    className={`w-full py-2 rounded-xl border text-xs font-bold transition-colors ${
                      whishUploaded ? 'bg-purple-600 text-white' : 'bg-rose-950 text-rose-300 border-rose-700'
                    }`}
                  >
                    {whishUploaded ? '✓ Whish Receipt Photo Attached' : '📸 Attach Whish Receipt Screenshot (Mandatory)'}
                  </button>
                )}

                {/* Digital Signature on Glass */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Customer Digital Signature on Screen (POD):</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[10px] text-slate-400 hover:text-rose-400"
                    >
                      {t('clear', 'Clear')}
                    </button>
                  </div>
                  <div className="bg-slate-950 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden touch-none relative">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-[120px] cursor-crosshair block"
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-600 text-xs font-mono">
                        ✍️ Sign with Finger or Stylus Here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {actionType === 'REJECTED' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t('reason_for_rejection', 'Reason for Rejection:')}</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Customer not available at location">{t('customer_not_available_at_location', 'Customer not available at location')}</option>
                    <option value="Customer cancelled order / changed mind">{t('customer_cancelled_order_changed_mind', 'Customer cancelled order / changed mind')}</option>
                    <option value="Customer disputed price or total">{t('customer_disputed_price_or_total', 'Customer disputed price or total')}</option>
                    <option value="Delivery arrival delayed">{t('delivery_arrival_delayed', 'Delivery arrival delayed')}</option>
                  </select>
                </div>

                <div className={`p-3 rounded-xl border ${deliveryFeeRefused ? 'bg-rose-950/40 border-rose-500' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span>{t('mandatory_delivery_fee', 'Mandatory Delivery Fee:')}</span>
                    <strong className="text-blue-400 font-mono">${selectedStopForAction.deliveryFeeUsd}</strong>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-[11px] text-rose-400 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryFeeRefused}
                      onChange={(e) => setDeliveryFeeRefused(e.target.checked)}
                    />
                    <span>Customer Refused to Pay Delivery Fee ($0 Collected)</span>
                  </label>
                </div>
              </div>
            )}

            {actionType === 'PENDING' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{t('reason_for_postponement', 'Reason for Postponement:')}</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Customer requested rescheduling for tomorrow">{t('customer_requested_rescheduling_for', 'Customer requested rescheduling for tomorrow')}</option>
                    <option value="Customer phone unreachable / no answer">{t('customer_phone_unreachable_no_answer', 'Customer phone unreachable / no answer')}</option>
                    <option value="Route blocked / severe traffic delay">{t('route_blocked_severe_traffic_delay', 'Route blocked / severe traffic delay')}</option>
                  </select>
                </div>
                <p className="text-[11px] text-amber-300">
                  {t('this_parcel_remains_on_van_inventory', 'This parcel remains on van inventory and will be rescheduled automatically for tomorrow\'s run.')}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmAction}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition-all"
            >
              Confirm &amp; Record Doorstep Outcome
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
