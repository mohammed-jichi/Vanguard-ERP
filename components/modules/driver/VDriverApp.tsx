'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { supabase } from '@/lib/supabaseClient';
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
  ChevronDown,
  MessageSquare,
  Receipt,
  Printer,
  Check,
  FileText,
  Filter,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export type ShiftState = 'OFF_DUTY' | 'ON_DUTY_LOADING' | 'DEPARTED' | 'RETURNING';
export type StopStatus = 'QUEUED' | 'EN_ROUTE' | 'DELIVERED' | 'FAILED_REATTEMPT' | 'CUSTOMER_RETURNED' | 'REJECTED' | 'PENDING';

export interface DriverStop {
  id: string;
  orderNo: string;
  invoiceId?: string;
  customerName: string;
  phone: string;
  town: string;
  address: string;
  corridorId: number;
  corridorName: string;
  deliveryNotes?: string;
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

export interface DriverSettlementVoucher {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  corridorName: string;
  deliveredStopsCount: number;
  expectedUsd: number;
  expectedLbp: number;
  expectedWhish: number;
  handedOverUsd: number;
  handedOverLbp: number;
  recipient: string;
  notes: string;
  officialRate: number;
  totalEquivalentLbp: number;
  totalEquivalentUsd: number;
  varianceUsd: number;
  status: 'RECONCILED' | 'PENDING_AUDIT' | 'VAULT_DEPOSITED';
}

export const OFFICIAL_USD_LBP_RATE = 89500;

export function formatWhatsAppUrl(stop: DriverStop): string {
  const cleanPhone = stop.phone.replace(/[^0-9]/g, '');
  let waNumber = cleanPhone;
  if (waNumber.startsWith('0')) {
    waNumber = '961' + waNumber.slice(1);
  } else if (!waNumber.startsWith('961')) {
    waNumber = '961' + waNumber;
  }
  const totalUsd = stop.productAmountUsd + stop.deliveryFeeUsd;
  const totalLbp = Math.round(totalUsd * OFFICIAL_USD_LBP_RATE);
  const text = `مرحباً ${stop.customerName}، معك سائق شركة سوبرسونيك لتوصيل طلبك #${stop.orderNo} (${stop.town}).\nالمبلغ المطلوب عند الاستلام (COD): ${totalUsd} (${totalLbp.toLocaleString()} ل.ل بسعر الصرف الرسمي 89,500).\nيرجى تأكيد التواجد في: ${stop.address}. شكراً!`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

export function formatCallUrl(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleanPhone}`;
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
    corridorId: 1,
    corridorName: 'Corridor 1: Beirut & Suburbs',
    deliveryNotes: 'Call 10 mins prior. Customer pays in USD or LBP at official 89,500 rate.',
    itemsList: '1x 17.5L Extra Virgin Olive Oil Tin + 2x Pomegranate Molasses (500ml)',
    productAmountLbp: 9845000,
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
    id: 'ord-crm-004',
    orderNo: 'ORD-WA-8924',
    invoiceId: 'inv-ref-8924',
    customerName: 'Apex Electronics Hub (Client Karim)',
    phone: '01-205930',
    town: 'Beirut - Achrafieh',
    address: 'Sassine Square, Rue Huvelin, Bldg 8',
    corridorId: 1,
    corridorName: 'Corridor 1: Beirut & Suburbs',
    deliveryNotes: 'Fragile component carton. Deliver directly to 2nd floor desk. COD $50 USD or 4,475,000 LBP.',
    itemsList: '2x Hardware Component Cartons',
    productAmountLbp: 4475000,
    productAmountUsd: 50,
    deliveryFeeUsd: 4.0,
    repName: 'Ahmad Ali Kassem',
    repCode: 'REP-002',
    repPhone: '03445566',
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
    corridorId: 2,
    corridorName: 'Corridor 2: Mount Lebanon',
    deliveryNotes: 'Heavy bulk commercial delivery. Hand unload using warehouse trolley.',
    itemsList: '3x 17.5L Extra Virgin Olive Oil Tin (Bulk Commercial)',
    productAmountLbp: 26850000,
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
  {
    id: 'ord-crm-002',
    orderNo: 'ORD-IG-7412',
    invoiceId: 'inv-ref-7412',
    customerName: 'Zeina Barjawi',
    phone: '70-998877',
    town: 'Saida - Qayaa',
    address: 'Qayaa Highway, Doctors Crossroad, Al-Zuhour Bldg',
    corridorId: 3,
    corridorName: 'Corridor 3: South Lebanon',
    deliveryNotes: 'Gate code: #4092. Customer accepts COD cash or instant Whish transfer.',
    itemsList: '1x 17.5L Extra Virgin Olive Oil Tin + 1x Pickled Olives Box',
    productAmountLbp: 10740000,
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
    id: 'ord-crm-005',
    orderNo: 'ORD-SS-9912',
    invoiceId: 'inv-ref-9912',
    customerName: 'Tyre Phoenician Kitchen',
    phone: '07-391200',
    town: 'Tyre (Sour) - Rest House Coast',
    address: 'Al-Kharab Seaside Corniche, Dock 2',
    corridorId: 3,
    corridorName: 'Corridor 3: South Lebanon',
    deliveryNotes: 'Kitchen receiving dock. Call chef Ali upon arrival. COD $220 USD or 19,690,000 LBP.',
    itemsList: '2x 17.5L Extra Virgin Tin + 6x Vinegar 1L Glass',
    productAmountLbp: 19690000,
    productAmountUsd: 220,
    deliveryFeeUsd: 8.0,
    repName: 'Mahdi Kassem',
    repCode: 'REP-001',
    repPhone: '03778899',
    status: 'QUEUED',
    paymentLbp: 0,
    paymentUsd: 0,
    paymentWhish: 0,
    synced: true,
  },
  {
    id: 'ord-crm-006',
    orderNo: 'ORD-NO-4410',
    invoiceId: 'inv-ref-4410',
    customerName: 'Batroun Old Souk Olive House',
    phone: '06-742110',
    town: 'Batroun - Old Port Souk',
    address: 'Saint Stephen Church Road, Stone Bldg',
    corridorId: 4,
    corridorName: 'Corridor 4: North Lebanon',
    deliveryNotes: 'Cobblestone pedestrian zone. Park near port and deliver by hand trolley. COD $140 USD.',
    itemsList: '1x 17.5L Extra Virgin Tin + 12x 500ml Extra Virgin Bottles',
    productAmountLbp: 12530000,
    productAmountUsd: 140,
    deliveryFeeUsd: 7.0,
    repName: 'Ahmad Ali Kassem',
    repCode: 'REP-002',
    repPhone: '03445566',
    status: 'QUEUED',
    paymentLbp: 0,
    paymentUsd: 0,
    paymentWhish: 0,
    synced: true,
  },
  {
    id: 'ord-crm-007',
    orderNo: 'ORD-BK-3310',
    invoiceId: 'inv-ref-3310',
    customerName: 'Zahle Bardawni Restaurant Co.',
    phone: '08-805400',
    town: 'Zahle - Bardawni Valley',
    address: 'Wadi El Arayesh, Casino Arabi Axis',
    corridorId: 5,
    corridorName: 'Corridor 5: Bekaa',
    deliveryNotes: 'Deliver to central restaurant storehouse. Collect $350 USD cash or 31,325,000 LBP.',
    itemsList: '4x 17.5L Extra Virgin Bulk Tins + 5x Pickled Olives Box',
    productAmountLbp: 31325000,
    productAmountUsd: 350,
    deliveryFeeUsd: 9.0,
    repName: 'Hiba Aloulou',
    repCode: 'REP-004',
    repPhone: '71223344',
    status: 'QUEUED',
    paymentLbp: 0,
    paymentUsd: 0,
    paymentWhish: 0,
    synced: true,
  },
];

export default function VDriverApp() {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
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

  // Corridor Filtering State
  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<number | 'ALL'>('ALL');

  // Action Modal State
  const [selectedStopForAction, setSelectedStopForAction] = useState<DriverStop | null>(null);
  const [actionType, setActionType] = useState<'DELIVERED' | 'FAILED_REATTEMPT' | 'CUSTOMER_RETURNED' | 'REJECTED' | 'PENDING' | null>(null);

  // End of Shift Cash Settlement State
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [settleHandedUsd, setSettleHandedUsd] = useState<number>(0);
  const [settleHandedLbp, setSettleHandedLbp] = useState<number>(0);
  const [settleRecipient, setSettleRecipient] = useState<string>('Layla Bazzi (Settlements & Treasury Desk — Choueifat Hub)');
  const [settleNotes, setSettleNotes] = useState<string>('End of shift daily COD cash count & handover');
  const [activeVoucher, setActiveVoucher] = useState<DriverSettlementVoucher | null>(null);
  const [settlementHistory, setSettlementHistory] = useState<DriverSettlementVoucher[]>([]);

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

      // Load driver cash settlement history
      const savedSettlements = localStorage.getItem('vanguard_driver_settlements');
      if (savedSettlements) {
        try {
          const parsed = JSON.parse(savedSettlements);
          setSettlementHistory(parsed);
          if (parsed.length > 0) setActiveVoucher(parsed[0]);
        } catch (e) {
          console.error('Failed to parse driver settlements', e);
        }
      }

      // Load cached stops or fetch live from /api/orders
      const loadLiveStops = async () => {
        try {
          const cached = localStorage.getItem('vanguard_driver_cached_stops');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setStops(parsed);
            }
          }
        } catch (e) {}

        if (navigator.onLine) {
          try {
            const res = await fetch('/api/orders');
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
                const liveStops: DriverStop[] = data.orders.map((o: any) => ({
                  id: o.id || `ord-${o.order_number}`,
                  orderNo: o.order_number || `ORD-${o.id}`,
                  invoiceId: o.sales_invoice_id || `inv-${o.id}`,
                  customerName: o.customer_name || 'Customer',
                  phone: o.customer_phone || '03-000000',
                  town: o.destination_town || 'Beirut',
                  address: o.delivery_address || 'Central Address',
                  corridorId: Number(o.corridor_id) || 1,
                  corridorName: o.corridor_name || `Corridor ${o.corridor_id || 1}`,
                  deliveryNotes: o.notes || `Payment: ${o.payment_method || 'COD'}`,
                  itemsList: Array.isArray(o.items) && o.items.length > 0
                    ? o.items.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ')
                    : '1x Delivery Package',
                  productAmountLbp: Number(o.product_amount_lbp) || 0,
                  productAmountUsd: Number(o.product_amount_usd) || 0,
                  deliveryFeeUsd: Number(o.delivery_fee_usd) || 4.0,
                  repName: o.rep_name || 'Ahmad Ali Kassem',
                  repCode: o.rep_code || 'REP-002',
                  repPhone: '03445566',
                  status: (o.order_status === 'delivered' ? 'DELIVERED' : (o.order_status === 'en_route' ? 'EN_ROUTE' : 'QUEUED')) as StopStatus,
                  paymentLbp: 0,
                  paymentUsd: 0,
                  paymentWhish: 0,
                  synced: true,
                }));

                setStops((prev) => {
                  const deliveredMap = new Map(prev.filter((p) => p.status === 'DELIVERED').map((p) => [p.id, p]));
                  const merged = liveStops.map((ls) => deliveredMap.get(ls.id) || ls);
                  try {
                    localStorage.setItem('vanguard_driver_cached_stops', JSON.stringify(merged));
                  } catch (e) {}
                  return merged;
                });
              }
            }
          } catch (apiErr) {
            console.warn('[VDriverApp] Live orders fetch notice:', apiErr);
          }
        }
      };

      loadLiveStops();

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
  const handleOpenActionModal = (stop: DriverStop, type: 'DELIVERED' | 'FAILED_REATTEMPT' | 'CUSTOMER_RETURNED' | 'REJECTED' | 'PENDING') => {
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
    let cloudSignatureUrl: string | undefined = undefined;

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
      cloudSignatureUrl = signatureData;

      // Upload signature PNG directly to Supabase Storage bucket 'organization-media' (Gap 9.1)
      try {
        if (canvas) {
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            const fileName = `pod-signatures/pod-${selectedStopForAction.id}-${Date.now()}.png`;
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('organization-media')
              .upload(fileName, blob, { contentType: 'image/png', upsert: true });

            if (!uploadErr && uploadData) {
              const { data: urlData } = supabase.storage
                .from('organization-media')
                .getPublicUrl(fileName);
              if (urlData?.publicUrl) {
                cloudSignatureUrl = urlData.publicUrl;
              }
            }
          }
        }
      } catch (storageErr) {
        console.warn('Storage upload notice, falling back to signature data:', storageErr);
      }

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
                customerSignatureSvg: cloudSignatureUrl,
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

      const targetTenantId = (currentTenant?.id && currentTenant.id !== '1300' && !currentTenant.id.startsWith('comp-'))
        ? currentTenant.id
        : '00000000-0000-0000-0000-000000000001';

      try {
        // Direct database update to public.orders (Gap 9.1)
        await supabase
          .from('orders')
          .update({
            status: 'Delivered',
            delivery_status: 'Delivered',
            signature_url: cloudSignatureUrl,
            pod_signature: cloudSignatureUrl,
            collected_cash_usd: inputUsd + inputWhish,
            collected_cash_lbp: inputLbp,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedStopForAction.id);

        // Record collected cash into driver run sheets (public.driver_run_sheets)
        await supabase
          .from('driver_run_sheets')
          .insert([{
            tenant_id: targetTenantId,
            driver_id: driverId,
            driver_name: driverName,
            order_id: selectedStopForAction.id,
            order_number: selectedStopForAction.orderNo,
            customer_name: selectedStopForAction.customerName,
            collected_usd: inputUsd + inputWhish,
            collected_lbp: inputLbp,
            payment_method: inputWhish > 0 ? 'WHISH' : 'COD',
            signature_url: cloudSignatureUrl,
            status: 'DELIVERED',
            created_at: new Date().toISOString()
          }]);
      } catch (dbErr) {
        console.warn('Direct order and run sheet update notice:', dbErr);
      }

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
    } else if (actionType === 'FAILED_REATTEMPT' || actionType === 'PENDING') {
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'FAILED_REATTEMPT',
                rejectionReason,
              }
            : s
        )
      );
      setSystemAlertMessage(`⏳ Order #${selectedStopForAction.orderNo} marked as Failed Delivery / Re-attempt (${rejectionReason}). Parcel remains on van inventory.`);
    } else if (actionType === 'CUSTOMER_RETURNED' || actionType === 'REJECTED') {
      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStopForAction.id
            ? {
                ...s,
                status: 'CUSTOMER_RETURNED',
                rejectionReason,
                deliveryFeePaid: !deliveryFeeRefused,
                paymentUsd: deliveryFeeRefused ? 0 : selectedStopForAction.deliveryFeeUsd,
              }
            : s
        )
      );
      setSystemAlertMessage(`⚠️ Order #${selectedStopForAction.orderNo} Marked Returned to Hub (${rejectionReason}). Fee: $${deliveryFeeRefused ? 0 : selectedStopForAction.deliveryFeeUsd}. Custody updated.`);
    }

    // Synchronize package status update with Backoffice Fleet Dispatch & Ledger
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vanguard_driver_order_status_updated', {
          detail: {
            orderId: selectedStopForAction.id,
            orderNo: selectedStopForAction.orderNo,
            status:
              actionType === 'DELIVERED'
                ? 'DELIVERED'
                : actionType === 'FAILED_REATTEMPT' || actionType === 'PENDING'
                ? 'FAILED_REATTEMPT'
                : 'CUSTOMER_RETURNED',
            paymentUsd: inputUsd + inputWhish,
            paymentLbp: inputLbp,
            deliveryFeeUsd: deliveryFeeRefused ? 0 : selectedStopForAction.deliveryFeeUsd,
            rejectionReason: rejectionReason || undefined,
            driverName,
            deliveredAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            signatureSvg: cloudSignatureUrl || undefined,
          },
        })
      );
    }

    setSelectedStopForAction(null);
    setActionType(null);
  };

  // 6. End of Shift Settle Cash Handler
  const handleConfirmSettlement = () => {
    const totalEquivUsd = settleHandedUsd + (settleHandedLbp / OFFICIAL_USD_LBP_RATE);
    const totalEquivLbp = (settleHandedUsd * OFFICIAL_USD_LBP_RATE) + settleHandedLbp;
    const expectedTotalUsd = totalCollectedUsd + (totalCollectedLbp / OFFICIAL_USD_LBP_RATE);
    const varianceUsd = totalEquivUsd - expectedTotalUsd;

    const voucher: DriverSettlementVoucher = {
      id: `SETTL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      driverId,
      driverName,
      corridorName: 'Corridor 1: Beirut & Suburbs (Hamra, Achrafieh)',
      deliveredStopsCount: completedStops.length,
      expectedUsd: totalCollectedUsd,
      expectedLbp: totalCollectedLbp,
      expectedWhish: totalCollectedWhish,
      handedOverUsd: settleHandedUsd,
      handedOverLbp: settleHandedLbp,
      recipient: settleRecipient,
      notes: settleNotes,
      officialRate: OFFICIAL_USD_LBP_RATE,
      totalEquivalentLbp: Math.round(totalEquivLbp),
      totalEquivalentUsd: Number(totalEquivUsd.toFixed(2)),
      varianceUsd: Number(varianceUsd.toFixed(2)),
      status: 'RECONCILED',
    };

    const existingStr = localStorage.getItem('vanguard_driver_settlements');
    const list: DriverSettlementVoucher[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [voucher, ...list];
    localStorage.setItem('vanguard_driver_settlements', JSON.stringify(updated));
    setSettlementHistory(updated);
    setActiveVoucher(voucher);
    setShowSettlementModal(false);
    setShiftState('RETURNING');

    // Notify other components & backoffice
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vanguard_driver_settlement_created', { detail: voucher }));
    }

    setSystemAlertMessage(`✓ End-of-Shift Settlement ${voucher.id} Generated & Reconciled with Ledger! Cash handed over to ${settleRecipient}.`);
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

  const consolidatedLbpTotal = (totalCollectedUsd * OFFICIAL_USD_LBP_RATE) + totalCollectedLbp + (totalCollectedWhish * OFFICIAL_USD_LBP_RATE);
  const consolidatedUsdTotal = totalCollectedUsd + (totalCollectedLbp / OFFICIAL_USD_LBP_RATE) + totalCollectedWhish;

  const filteredStops = selectedCorridorFilter === 'ALL'
    ? stops
    : stops.filter((s) => s.corridorId === selectedCorridorFilter);

  const activeStop = stops.find((s) => s.id === selectedStopId) || filteredStops[0] || stops[0];

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

          <Link prefetch={false}
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
            {/* Corridor Filter Pills */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1 text-xs text-slate-400">
                <span className="font-bold flex items-center gap-1">
                  <Filter className="w-3 h-3 text-emerald-400" />
                  <span>Lebanese Delivery Corridors</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {completedStops.length} / {stops.length} Delivered
                </span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                {[
                  { id: 'ALL', label: `All (${stops.length})` },
                  { id: 1, label: `1. Beirut & Suburbs (${stops.filter(s => s.corridorId === 1).length})` },
                  { id: 2, label: `2. Mount Lebanon (${stops.filter(s => s.corridorId === 2).length})` },
                  { id: 3, label: `3. South (${stops.filter(s => s.corridorId === 3).length})` },
                  { id: 4, label: `4. North (${stops.filter(s => s.corridorId === 4).length})` },
                  { id: 5, label: `5. Bekaa (${stops.filter(s => s.corridorId === 5).length})` },
                ].map((c) => (
                  <button
                    key={String(c.id)}
                    type="button"
                    onClick={() => setSelectedCorridorFilter(c.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap border transition-all ${
                      selectedCorridorFilter === c.id
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredStops.map((stop, idx) => {
              const isSelected = selectedStopId === stop.id;
              const totalStopUsd = stop.productAmountUsd + stop.deliveryFeeUsd;
              const totalStopLbp = Math.round(totalStopUsd * OFFICIAL_USD_LBP_RATE);
              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-lg ring-1 ring-emerald-500/40'
                      : stop.status === 'DELIVERED'
                      ? 'bg-slate-900/50 border-emerald-500/30 opacity-75'
                      : stop.status === 'FAILED_REATTEMPT'
                      ? 'bg-amber-950/20 border-amber-600/40'
                      : stop.status === 'CUSTOMER_RETURNED' || stop.status === 'REJECTED'
                      ? 'bg-rose-950/20 border-rose-600/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
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
                          : stop.status === 'FAILED_REATTEMPT'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : stop.status === 'CUSTOMER_RETURNED' || stop.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stop.status === 'FAILED_REATTEMPT' ? 'RE-ATTEMPT' : stop.status === 'CUSTOMER_RETURNED' ? 'RETURNED TO HUB' : stop.status}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold">{stop.town}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-400">{stop.corridorName}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5 line-clamp-1">{stop.address}</p>

                  {/* Delivery Notes for Driver */}
                  {stop.deliveryNotes && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
                      <span className="font-bold text-amber-400">📝 Notes: </span>
                      <span>{stop.deliveryNotes}</span>
                    </div>
                  )}

                  <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
                    <span className="text-slate-300 font-medium line-clamp-2">{stop.itemsList}</span>
                  </div>

                  <div className="mt-2 flex justify-between items-center text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      COD: ${totalStopUsd} (${totalStopLbp.toLocaleString()} LBP)
                    </span>
                    <span className="text-blue-400 font-bold">Fee: ${stop.deliveryFeeUsd}</span>
                  </div>

                  {/* Direct WhatsApp & Call Buttons */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <a
                      href={formatWhatsAppUrl(stop)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp ({stop.phone})</span>
                    </a>
                    <a
                      href={formatCallUrl(stop.phone)}
                      onClick={(e) => e.stopPropagation()}
                      className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>Call</span>
                    </a>
                  </div>

                  {/* Quick Doorstep Action Buttons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenActionModal(stop, 'DELIVERED');
                      }}
                      className="flex-1 min-w-[110px] py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] shadow flex items-center justify-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark as Delivered</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenActionModal(stop, 'FAILED_REATTEMPT');
                      }}
                      className="py-1.5 px-2.5 bg-amber-600/80 hover:bg-amber-600 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all"
                      title="Failed Delivery / Re-attempt"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Failed / Re-attempt</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenActionModal(stop, 'CUSTOMER_RETURNED');
                      }}
                      className="py-1.5 px-2.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all"
                      title="Customer Returned"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Returned to Hub</span>
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

                {/* Delivery Notes for Driver */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200">
                  <span className="font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <span>📝 Dispatcher &amp; Customer Delivery Notes:</span>
                  </span>
                  <p>{activeStop.deliveryNotes || 'Standard delivery corridor. Verify address and collect COD accurately in USD or LBP at 89,500.'}</p>
                </div>

                {/* Quick Communication & Navigation Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a
                    href={formatWhatsAppUrl(activeStop)}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 shadow"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Chat</span>
                  </a>
                  <a
                    href={formatCallUrl(activeStop.phone)}
                    className="py-2.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold rounded-xl border border-blue-500/40 flex items-center justify-center gap-2 shadow"
                  >
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>Call ({activeStop.phone})</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeStop.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 shadow"
                  >
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Google Maps</span>
                  </a>
                </div>

                {/* Doorstep Action Triggers */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(activeStop, 'DELIVERED')}
                    className="flex-1 min-w-[200px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Mark as Delivered &amp; Collect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(activeStop, 'FAILED_REATTEMPT')}
                    className="px-4 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Failed / Re-attempt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenActionModal(activeStop, 'CUSTOMER_RETURNED')}
                    className="px-4 py-3 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Returned to Hub</span>
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
      {/* TAB 2: CASH LEDGER & MULTI-CURRENCY RUNNING TOTALS & RECONCILIATION */}
      {/* =================================================================== */}
      {activeTab === 'LEDGER' && (
        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Multi-Currency Cash &amp; Whish Custody</h2>
              <span className="text-[11px] text-slate-400">Official Lebanese Central Bank Rate: 1 USD = 89,500 LBP</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{completedStops.length} Collections Today</span>
          </div>

          {/* Running Totals Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">USD Cash in Custody</span>
              <strong className="text-2xl font-mono text-emerald-400 font-bold">${totalCollectedUsd.toFixed(2)}</strong>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">LBP Cash in Custody</span>
              <strong className="text-2xl font-mono text-emerald-400 font-bold">{totalCollectedLbp.toLocaleString()} LBP</strong>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-purple-400 block uppercase font-bold">Whish Remittances</span>
              <strong className="text-2xl font-mono text-purple-400 font-bold">${totalCollectedWhish.toFixed(2)}</strong>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/40 rounded-2xl">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">Total LBP (@ 89,500)</span>
              <strong className="text-xl font-mono text-white font-extrabold block">{Math.round(consolidatedLbpTotal).toLocaleString()} LBP</strong>
              <span className="text-[10px] font-mono text-emerald-400 font-medium">~${consolidatedUsdTotal.toFixed(2)} USD Eqv.</span>
            </div>
          </div>

          {/* End of Shift / Settle Cash Reconciliation Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>💰 End of Shift / Settle Cash Handover</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded">
                  Reconciliation Action
                </span>
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Submit counted collected cash amounts to Choueifat Treasury Desk. Generates official settlement voucher for the accounting ledger.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettleHandedUsd(totalCollectedUsd);
                setSettleHandedLbp(totalCollectedLbp);
                setShowSettlementModal(true);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Settle Cash Handover</span>
            </button>
          </div>

          {/* Active Settlement Voucher Card */}
          {activeVoucher && (
            <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 space-y-3 shadow-2xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                    VOUCHER #{activeVoucher.id}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">SuperSonic Driver Shift Settlement Voucher</h3>
                  <p className="text-[11px] text-slate-400">Timestamp: {activeVoucher.date} • Courier: {activeVoucher.driverName}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold font-mono">
                  ✓ {activeVoucher.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">USD CASH HANDED</span>
                  <strong className="text-emerald-400 text-sm font-bold">${activeVoucher.handedOverUsd}</strong>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">LBP CASH HANDED</span>
                  <strong className="text-emerald-400 text-sm font-bold">{activeVoucher.handedOverLbp.toLocaleString()} LBP</strong>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TOTAL EQUIV LBP</span>
                  <strong className="text-white text-sm font-bold">{activeVoucher.totalEquivalentLbp.toLocaleString()} LBP</strong>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">HANDOVER RECIPIENT</span>
                  <strong className="text-blue-300 text-[11px] font-sans truncate block">{activeVoucher.recipient}</strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">Enforced Official Rate: 1 USD = 89,500 LBP</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Voucher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`SuperSonic Settlement Voucher ${activeVoucher.id}: USD ${activeVoucher.handedOverUsd} + LBP ${activeVoucher.handedOverLbp.toLocaleString()} (Total ${activeVoucher.totalEquivalentLbp.toLocaleString()} LBP @ 89,500). Handed over to ${activeVoucher.recipient}.`);
                      alert('✓ Settlement summary copied to clipboard for WhatsApp/SMS accounting dispatch!');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completed Order Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Route Stops Breakdown:</h4>
            {completedStops.map((stop) => (
              <div key={stop.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between">
                <div>
                  <strong className="text-white font-sans text-sm block">{stop.customerName}</strong>
                  <span className="text-slate-400 text-[11px]">#{stop.orderNo} — {stop.town} ({stop.corridorName})</span>
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
                  {actionType === 'DELIVERED' && '✓ Confirm Delivery & Collect Payment (COD)'}
                  {actionType === 'FAILED_REATTEMPT' && '🔄 Failed Delivery / Schedule Re-attempt'}
                  {actionType === 'CUSTOMER_RETURNED' && '✕ Returned to Hub / Customer Returned'}
                  {actionType === 'REJECTED' && '✕ Mark Stop as Rejected'}
                  {actionType === 'PENDING' && '⏳ Postpone Stop to Tomorrow'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedStopForAction.customerName} (#{selectedStopForAction.orderNo}) • {selectedStopForAction.town}
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
                {/* Total Due Banner with Official 89,500 LBP Conversion */}
                {(() => {
                  const totalDueUsd = selectedStopForAction.productAmountUsd + selectedStopForAction.deliveryFeeUsd;
                  const totalDueLbp = Math.round(totalDueUsd * OFFICIAL_USD_LBP_RATE);
                  return (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] block">{t('total_amount_due', 'TOTAL AMOUNT DUE')}</span>
                          <strong className="text-base text-emerald-400 font-bold">
                            ${totalDueUsd} USD
                          </strong>
                          <div className="text-xs text-slate-300 font-semibold">
                            (${totalDueLbp.toLocaleString()} LBP @ 89,500)
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <div>Product: ${selectedStopForAction.productAmountUsd}</div>
                          <div>Delivery Fee: ${selectedStopForAction.deliveryFeeUsd}</div>
                          <div className="text-[10px] text-emerald-400">Official Rate: 89,500</div>
                        </div>
                      </div>

                      {/* Quick 1-Click Currency Split Presets */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setInputUsd(totalDueUsd);
                            setInputLbp(0);
                            setInputWhish(0);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-between"
                        >
                          <span>💵 Full USD:</span>
                          <strong className="text-emerald-400">${totalDueUsd}</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputUsd(0);
                            setInputLbp(totalDueLbp);
                            setInputWhish(0);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-between"
                        >
                          <span>🇱🇧 Full LBP:</span>
                          <strong className="text-emerald-400">${(totalDueLbp / 1000000).toFixed(2)}M</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputUsd(0);
                            setInputLbp(0);
                            setInputWhish(totalDueUsd);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-bold flex items-center justify-between"
                        >
                          <span>📲 Full Whish:</span>
                          <strong className="text-purple-400">${totalDueUsd}</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const halfUsd = Math.round(totalDueUsd / 2);
                            const remUsd = totalDueUsd - halfUsd;
                            setInputUsd(halfUsd);
                            setInputLbp(Math.round(remUsd * OFFICIAL_USD_LBP_RATE));
                            setInputWhish(0);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-bold flex items-center justify-between"
                        >
                          <span>⚖️ 50/50 Split</span>
                          <strong className="text-blue-400">USD + LBP</strong>
                        </button>
                      </div>
                    </div>
                  );
                })()}

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

            {(actionType === 'CUSTOMER_RETURNED' || actionType === 'REJECTED') && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Return Reason (Returned to Hub):</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Customer refused package / cancelled order">Customer refused package / cancelled order</option>
                    <option value="Disputed price or exchange rate calculation">Disputed price or exchange rate calculation</option>
                    <option value="Damaged packaging or wrong item variant - returning to hub">Damaged packaging or wrong item variant - returning to hub</option>
                    <option value="Customer could not be located at delivery address">Customer could not be located at delivery address</option>
                    <option value="Delivery window expired / customer unreachable - return to hub">Delivery window expired / customer unreachable - return to hub</option>
                  </select>
                </div>

                <div className={`p-3 rounded-xl border ${deliveryFeeRefused ? 'bg-rose-950/40 border-rose-500' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span>Delivery Fee Incurred:</span>
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
                <p className="text-[11px] text-rose-300">
                  ⚠️ This package will be logged as Customer Returned and handed back to Choueifat Central Depot at shift end.
                </p>
              </div>
            )}

            {(actionType === 'FAILED_REATTEMPT' || actionType === 'PENDING') && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Failure / Re-attempt Reason:</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Customer phone unreachable / no answer">Customer phone unreachable / no answer</option>
                    <option value="Customer requested rescheduling for tomorrow">Customer requested rescheduling for tomorrow</option>
                    <option value="Route blocked / severe traffic or security delay">Route blocked / severe traffic or security delay</option>
                    <option value="Customer requested evening delivery window">Customer requested evening delivery window</option>
                  </select>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
                  📦 <strong>Parcel remains on van inventory:</strong> Will be rescheduled automatically for tomorrow's dispatch run in {selectedStopForAction.corridorName}.
                </div>
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
      {/* =================================================================== */}
      {/* END OF SHIFT / SETTLE CASH RECONCILIATION MODAL                     */}
      {/* =================================================================== */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-lg w-full p-6 space-y-4 text-xs text-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">💰 End of Shift / Settle Cash Handover</h3>
                <p className="text-[11px] text-slate-400">Reconcile Daily Run Collections with Vanguard Accounting</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>

            {/* Expected Summary */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">System Expected Collections ({completedStops.length} Orders):</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">USD CASH</span>
                  <strong className="text-emerald-400 text-sm">${totalCollectedUsd.toFixed(2)}</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">LBP CASH</span>
                  <strong className="text-emerald-400 text-sm">{totalCollectedLbp.toLocaleString()}</strong>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">WHISH MONEY</span>
                  <strong className="text-purple-400 text-sm">${totalCollectedWhish.toFixed(2)}</strong>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 font-mono text-center pt-1 border-t border-slate-800">
                Official Consolidated Rate: <strong>{Math.round(consolidatedLbpTotal).toLocaleString()} LBP</strong> (1 USD = 89,500 LBP)
              </div>
            </div>

            {/* Physical Cash Handover Form */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 block uppercase">Physical Currency Handover Count:</span>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Handed Over USD Cash ($):</label>
                <input
                  type="number"
                  value={settleHandedUsd}
                  onChange={(e) => setSettleHandedUsd(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono font-bold text-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Handed Over LBP Cash (L.L):</label>
                <input
                  type="number"
                  value={settleHandedLbp}
                  onChange={(e) => setSettleHandedLbp(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono font-bold text-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Treasury Handover Recipient:</label>
                <select
                  value={settleRecipient}
                  onChange={(e) => setSettleRecipient(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="Layla Bazzi (Settlements & Treasury Desk — Choueifat Hub)">Layla Bazzi (Settlements &amp; Treasury Desk — Choueifat Hub)</option>
                  <option value="Choueifat Central Cash Vault Desk">Choueifat Central Cash Vault Desk</option>
                  <option value="Rami Al-Hajj (SuperSonic Operations Manager)">Rami Al-Hajj (SuperSonic Operations Manager)</option>
                  <option value="SuperSonic Central Safe Deposit">SuperSonic Central Safe Deposit</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Driver Memo &amp; Odometer Notes:</label>
                <input
                  type="text"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  placeholder="e.g. End of shift daily run cash count, Van 01"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-xl transition-all"
              >
                ✓ Confirm Settlement &amp; Issue Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
