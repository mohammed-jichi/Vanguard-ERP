'use client';

/**
 * Southern Olive Oil Products S.A.R.L (منتوجات زيت وزيتون الجنوب ش.م.م) وزيتون الجنوب ش.م.م)
 * SuperSonic Dispatch & Fleet Management Component (<SuperSonicFleetManager />)
 * 
 * High-End Omega POS Style Fleet & Delivery Logistics Control Center
 * Features:
 * 1. Role-Based Access Control (RBAC) for Driver Profiles & Access Control
 * 2. Driver Shift Tracking ('Loading' -> 'On Duty' -> 'Returning to Base' -> 'Shift Ended')
 * 3. 3-Way Order Outcomes (Delivered, Rejected [Fee Only], Postponed [$0 Zero-Fee])
 * 4. WhatsApp System Notification Generator & En-Route Live Geolocation Tracking
 * 5. POD Signature Capture & Commission Calculation for Social Media Reps
 * 6. Driver Shift Z-Report & Cross-Module Reconciliation Dispatch to Accounting & Super Admin
 */

import React, { useState, useRef } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  User,
  Phone,
  FileText,
  PenTool,
  RotateCcw,
  Save,
  ShieldCheck,
  Search,
  Filter,
  ArrowLeft,
  Navigation,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  Send,
  MessageSquare,
  Play,
  Square,
  BarChart2,
  Calendar,
  Layers,
  Percent,
  Check
} from 'lucide-react';

export type UserRole = 'Super Admin' | 'Supersonic Management' | 'Driver' | 'POS Cashier' | 'Employee';
export type ShiftStatus = 'Off Duty' | 'Loading' | 'On Duty' | 'Returning to Base' | 'Shift Ended';
export type DeliveryOutcome = 'Pending' | 'In Transit' | 'Delivered' | 'Rejected' | 'Postponed';

export type VehicleOwnership = 'COMPANY_OWNED' | 'COMPANY_LEASED' | 'DRIVER_OWNED' | 'DRIVER_LEASED';

export interface DriverProfile {
  id: string;
  name: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleOwnership: VehicleOwnership;
  phoneNumber: string;
  repName: string;
  repCode: string;
  commissionRate: number; // Percentage (%)
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  cityDistrict: string;
  addressDetails: string;
  phoneNumber: string;
  driverName: string;
  repCode: string;
  amountUsd: number;
  amountLbp: number;
  itemsCount: number;
  outcome: DeliveryOutcome;
  rejectionReason?: string;
  postponedReason?: string;
  podSignature?: string;
  notes?: string;
  dispatchTime: string;
  rejectionFeeCollectedUsd?: number;
}

interface SuperSonicFleetManagerProps {
  currentUserRole?: UserRole;
  onBack?: () => void;
}

export default function SuperSonicFleetManager({
  currentUserRole = 'Supersonic Management',
  onBack
}: SuperSonicFleetManagerProps) {

  // 1. DRIVER PROFILE & SHIFT TELEMETRY STATE
  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    id: 'DRV-101',
    name: 'أبو علي منصور',
    vehicleType: 'فان غزال - تبريد',
    vehicleNumber: 'M-4890',
    vehicleOwnership: 'COMPANY_OWNED',
    phoneNumber: '+961 70 889 400',
    repName: 'سامي الخوري',
    repCode: 'REP-04',
    commissionRate: 5 // 5% Commission
  });

  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('Off Duty');
  const [shiftStartTime, setShiftStartTime] = useState<string | null>(null);
  const [shiftEndTime, setShiftEndTime] = useState<string | null>(null);
  const [activeDriverTab, setActiveDriverTab] = useState<'dispatch' | 'driver-pwa' | 'profile-manage' | 'reconciliation'>(
    currentUserRole === 'Driver' ? 'driver-pwa' : 'dispatch'
  );

  // Telemetry metrics
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(42.5);
  const [lapTimeMinutes, setLapTimeMinutes] = useState<number>(14);

  // 2. MOCK DELIVERY ORDERS QUEUE
  const [orders, setOrders] = useState<DeliveryOrder[]>([
    {
      id: 'DEL-8801',
      orderNumber: 'SO-INV-2026-041',
      customerName: 'تعاونية الشوف التجارية',
      cityDistrict: 'الشوف - بقعاتا',
      addressDetails: 'الشارع العام - مقابل البنك اللبناني',
      phoneNumber: '+961 05 500 120',
      driverName: 'أبو علي منصور',
      repCode: 'REP-04',
      amountUsd: 1450.00,
      amountLbp: 129775000,
      itemsCount: 12,
      outcome: 'In Transit',
      notes: 'تسليم 10 تنكات زيت بكر ممتاز + 2 كرتونة زيتون',
      dispatchTime: '08:30 AM'
    },
    {
      id: 'DEL-8802',
      orderNumber: 'SO-INV-2026-042',
      customerName: 'مؤسسة الجنوب للمواد الغذائية',
      cityDistrict: 'صيدا - الحسبة',
      addressDetails: 'مجمع الثمار - العنبر 4',
      phoneNumber: '+961 07 720 340',
      driverName: 'أبو علي منصور',
      repCode: 'REP-04',
      amountUsd: 2890.00,
      amountLbp: 258655000,
      itemsCount: 25,
      outcome: 'Pending',
      notes: 'دفعة نقدية عند التسليم بالدولار الأمريكي',
      dispatchTime: '09:15 AM'
    },
    {
      id: 'DEL-8803',
      orderNumber: 'SO-INV-2026-039',
      customerName: 'سوبرماركت الرائد',
      cityDistrict: 'بيروت - المزرعة',
      addressDetails: 'شارع كورنيش المزرعة - بناية السلام',
      phoneNumber: '+961 01 300 450',
      driverName: 'أبو علي منصور',
      repCode: 'REP-02',
      amountUsd: 870.00,
      amountLbp: 77865000,
      itemsCount: 8,
      outcome: 'Delivered',
      notes: 'تم التسليم واستلام التوقيع الرقمي بنجاح',
      dispatchTime: '07:45 AM'
    }
  ]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>('DEL-8801');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQueueIndex, setActiveQueueIndex] = useState<number>(0);

  // Form Inputs for Outcomes
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('رفض العميل الاستلام بسبب تأخر الموعد');
  const [postponedReasonInput, setPostponedReasonInput] = useState<string>('طلب العميل تأجيل الموعد ليوم غد');

  // Canvas Signature Capture State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [podSaved, setPodSaved] = useState<boolean>(false);

  // Social Media Rep Commission Tracking State
  const [repCommissionBalanceUsd, setRepCommissionBalanceUsd] = useState<number>(145.50);
  const [newRepCommissionRate, setNewRepCommissionRate] = useState<number>(5);

  // Notifications Log
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);
  const [showReconcileModal, setShowReconcileModal] = useState<boolean>(false);
  const [whatsappPreviewMessage, setWhatsappPreviewMessage] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // RBAC PERMISSION CHECK
  const canManageDriverProfiles = currentUserRole === 'Super Admin' || currentUserRole === 'Supersonic Management';

  // ----------------------------------------------------
  // HELPER FUNCTIONS & DISPATCHERS
  // ----------------------------------------------------
  const logDriverAttendance = (driverId: string, actionType: 'PUNCH_IN' | 'PUNCH_OUT', timestamp: string) => {
    console.log(`[HR Attendance Log] Driver: ${driverId} | Action: ${actionType} | Time: ${timestamp}`);
    setSystemAlerts(prev => [
      `[سجل الحضور] تم سجل ${actionType === 'PUNCH_IN' ? 'بدء الدوام' : 'نهاية الدوام'} للسائق ${driverId} في ${timestamp}`,
      ...prev
    ]);
  };

  const calculateRepCommission = (orderTotal: number, repCode: string) => {
    const earned = (orderTotal * driverProfile.commissionRate) / 100;
    setRepCommissionBalanceUsd(prev => parseFloat((prev + earned).toFixed(2)));
    console.log(`[Commission Calculated] Order Total: $${orderTotal} | Rep: ${repCode} | Earned: $${earned}`);
    return earned;
  };

  const notifyOrderDelivered = (orderId: string, repCode: string, orderTotal: number) => {
    const commission = calculateRepCommission(orderTotal, repCode);
    setSystemAlerts(prev => [
      `[إشعار تسليم] تم تسليم الطلبية ${orderId} بنجاح! تم إضافة عمولة بقيمة $${commission.toFixed(2)} للمندوب ${repCode}`,
      ...prev
    ]);
  };

  const handleOrderException = (orderId: string, outcome: 'Rejected' | 'Postponed', reason: string, driverId: string) => {
    const msg = outcome === 'Rejected'
      ? `🚨 [تنبيه استثناء] السائق ${driverId} سجّل طرد مرفوض للطلبية #${orderId}. البضائع متبقية بالمركبة. استيفاء رسم التوصيل فقط ($5.00). السبب: ${reason}`
      : `⚠️ [تنبيه استثناء] السائق ${driverId} سجّل تأجيل للطلبية #${orderId}. البضائع متبقية بالمركبة. احتساب رسوم $0.00. السبب: ${reason}`;

    setSystemAlerts(prev => [msg, ...prev]);
    console.warn(msg);
  };

  // SHIFT MANAGEMENT HANDLERS
  const handleStartDay = () => {
    const now = new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' });
    setShiftStatus('Loading');
    setShiftStartTime(now);
    logDriverAttendance(driverProfile.id, 'PUNCH_IN', now);
  };

  const handleDispatchEnRoute = () => {
    setShiftStatus('On Duty');
    // Generate WhatsApp Dispatch template
    const orderNumbers = orders.map(o => o.orderNumber).join(', ');
    const dispatchMessage = `مرحباً، تم انطلاق شاحنة التوصيل الخاصة بـ SuperSonic Delivery
-----------------------------------
🚛 اسم السائق: ${driverProfile.name} (${driverProfile.vehicleType} #${driverProfile.vehicleNumber})
📋 تفاصيل الطلب: شحنة منتوجات زيت وزيتون الجنوب SARL (طلبيات رقم #${orderNumbers})
👨‍💼 المندوب: ${driverProfile.repName} - ${driverProfile.repCode}

📍 كونوا على استعداد لتلقي الاتصال من السائق في أي وقت خلال اليوم.`;

    setWhatsappPreviewMessage(dispatchMessage);
  };

  const handleEnRouteToNextClient = (order: DeliveryOrder) => {
    const trackingLink = `https://southernolive.com/track?order=${order.id}`;
    const eta = 15;
    const enRouteMsg = `مرحباً ${order.customerName}، سائق شاحنة التوصيل الخاصة بـ منتوجات زيت وزيتون الجنوب في طريقه إليكم الآن!
⏳ الوقت المتوقع للوصول: ${eta} دقيقة.
📍 لتتبع موقع السائق مباشرة على الخريطة، الرجاء الضغط على الرابط التالي:
${trackingLink}`;

    setWhatsappPreviewMessage(enRouteMsg);
  };

  const handleEndDay = () => {
    const now = new Date().toLocaleTimeString('ar-LB', { hour: '2-digit', minute: '2-digit' });
    setShiftStatus('Shift Ended');
    setShiftEndTime(now);
    logDriverAttendance(driverProfile.id, 'PUNCH_OUT', now);
  };

  // CANVAS DRAWING HANDLERS
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
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPodSaved(false);
  };

  // SUBMIT OUTCOME ACTION (Delivered / Rejected / Postponed)
  const submitOrderOutcome = (outcome: DeliveryOutcome) => {
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : '';

    setOrders(prev => prev.map((ord, idx) => {
      if (ord.id === selectedOrder.id) {
        return {
          ...ord,
          outcome,
          podSignature: (outcome === 'Delivered' || outcome === 'Rejected') ? dataUrl : undefined,
          rejectionReason: outcome === 'Rejected' ? rejectionReasonInput : undefined,
          postponedReason: outcome === 'Postponed' ? postponedReasonInput : undefined,
          rejectionFeeCollectedUsd: outcome === 'Rejected' ? 5.00 : 0
        };
      }
      return ord;
    }));

    if (outcome === 'Delivered') {
      notifyOrderDelivered(selectedOrder.id, selectedOrder.repCode, selectedOrder.amountUsd);
    } else if (outcome === 'Rejected') {
      handleOrderException(selectedOrder.id, 'Rejected', rejectionReasonInput, driverProfile.id);
    } else if (outcome === 'Postponed') {
      handleOrderException(selectedOrder.id, 'Postponed', postponedReasonInput, driverProfile.id);
    }

    setPodSaved(true);

    // CHECK END OF ROUTE QUEUE & AUTO-ADVANCE TO NEXT CLIENT
    if (activeQueueIndex < orders.length - 1) {
      const nextIdx = activeQueueIndex + 1;
      setActiveQueueIndex(nextIdx);
      setSelectedOrderId(orders[nextIdx].id);
      clearCanvas();
      handleEnRouteToNextClient(orders[nextIdx]);
    } else {
      setShiftStatus('Returning to Base');
      setSystemAlerts(prev => ['🏁 تم إنجاز جميع الطلبيات بالكامل! السائق متوجه نحو الشركة حالياً.', ...prev]);
    }
  };

  const advanceToNextOrder = () => {
    if (activeQueueIndex < orders.length - 1) {
      const nextIdx = activeQueueIndex + 1;
      setActiveQueueIndex(nextIdx);
      setSelectedOrderId(orders[nextIdx].id);
      clearCanvas();
      handleEnRouteToNextClient(orders[nextIdx]);
    }
  };

  // Z-REPORT RECONCILIATION CALCULATIONS
  const totalDeliveredCount = orders.filter(o => o.outcome === 'Delivered').length;
  const totalRejectedCount = orders.filter(o => o.outcome === 'Rejected').length;
  const totalPostponedCount = orders.filter(o => o.outcome === 'Postponed').length;

  const totalDeliveredCashUsd = orders
    .filter(o => o.outcome === 'Delivered')
    .reduce((sum, o) => sum + o.amountUsd, 0);

  const totalRejectionFeesUsd = totalRejectedCount * 5.00; // $5 Fee
  const totalHandoverCashUsd = totalDeliveredCashUsd + totalRejectionFeesUsd; // Postponed = $0

  const submitDriverReconciliation = () => {
    console.log(`[Reconciliation Dispatched] Driver: ${driverProfile.name} | Total Cash: $${totalHandoverCashUsd}`);
    const alertMsg = `✅ تمت المطابقة وإغلاق حساب السائق ${driverProfile.name} لليوم. النقد المستلم المعتمد: $${totalHandoverCashUsd.toFixed(2)} USD.`;
    setSystemAlerts(prev => [alertMsg, ...prev]);
    setShowReconcileModal(false);
    setShiftStatus('Shift Ended');
  };

  return (
    <div className="w-full bg-[#0a1209] text-white min-h-screen font-['Cairo',sans-serif] p-4 md:p-6 space-y-6 dir-rtl">

      {/* 1. TOP SYSTEM HEADER */}
      <div className="bg-[#142013] border-2 border-emerald-500/30 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 rounded-xl border border-emerald-500/30 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
              SuperSonic Dispatch & Fleet - منتوجات زيت وزيتون الجنوب
            </h1>
            <p className="text-xs text-emerald-400/90 font-medium">
              نظام التوجيه واللوجستيات الرقمية والإثبات الإلكتروني للتسليم (Digital POD Engine)
            </p>
          </div>
        </div>

        {/* SHIFT STATUS BADGE & SHIFT CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {shiftStatus === 'Off Duty' && (
            <button
              onClick={handleStartDay}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" /> بدء اليوم (Start Day)
            </button>
          )}

          {shiftStatus === 'Loading' && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 animate-pulse">
                <Clock className="w-4 h-4 text-amber-400" /> قيد التحميل (Loading)
              </span>
              <button
                onClick={handleDispatchEnRoute}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4 text-slate-950" /> 2. في الخدمة والإنطلاق (Departure & WhatsApp Broadcast)
              </button>
            </div>
          )}

          {shiftStatus === 'On Duty' && (
            <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> في الخدمة (On Duty)
            </span>
          )}

          {shiftStatus === 'Returning to Base' && (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-black flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-purple-400 animate-spin" /> متجه نحو الشركة (Returning to Base)
              </span>
              <button
                onClick={handleEndDay}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl border border-rose-400 flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Square className="w-4 h-4 fill-current" /> نهاية اليوم (End Day)
              </button>
            </div>
          )}

          {shiftStatus === 'Shift Ended' && (
            <span className="px-3.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-black">
              انتهى الدوام (Shift Ended)
            </span>
          )}
        </div>
      </div>

      {/* SYSTEM BROADCAST ALERTS BAR */}
      {systemAlerts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 space-y-1.5">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> تنبيهات النظام والإشعارات المباشرة:
          </span>
          <div className="space-y-1 max-h-20 overflow-y-auto text-xs text-amber-200/90 font-mono">
            {systemAlerts.slice(0, 3).map((alt, idx) => (
              <div key={idx} className="bg-[#0a1209]/60 px-2.5 py-1 rounded border border-amber-900/40">
                {alt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHATSAPP MESSAGE PREVIEW MODAL / BANNER */}
      {whatsappPreviewMessage && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500/60 rounded-xl p-4 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> قالب إشعار الواتساب التلقائي (System WhatsApp Template):
            </span>
            <button
              onClick={() => setWhatsappPreviewMessage(null)}
              className="text-xs bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 px-2.5 py-1 rounded border border-emerald-700"
            >
              إغلاق
            </button>
          </div>
          <pre className="bg-[#0a1209] p-3 rounded-lg text-xs font-mono text-emerald-200 whitespace-pre-wrap dir-rtl border border-emerald-900">
            {whatsappPreviewMessage}
          </pre>
        </div>
      )}

      {/* TAB NAVIGATION: FLEET DISPATCH vs DRIVER PWA vs DRIVER PROFILE RBAC */}
      {currentUserRole !== 'Driver' && (
        <div className="flex items-center gap-2 border-b border-emerald-900/60 pb-3">
          <button
            onClick={() => setActiveDriverTab('dispatch')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeDriverTab === 'dispatch'
              ? 'bg-emerald-500 text-black shadow-lg'
              : 'bg-[#142013] text-slate-300 hover:text-white border border-emerald-900'
              }`}
          >
            <Truck className="w-4 h-4" /> لوحة إدارة التوزيع (Fleet Dispatch)
          </button>

          <button
            onClick={() => setActiveDriverTab('profile-manage')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeDriverTab === 'profile-manage'
              ? 'bg-emerald-500 text-black shadow-lg'
              : 'bg-[#142013] text-slate-300 hover:text-white border border-emerald-900'
              }`}
          >
            <User className="w-4 h-4" /> إدارة ملف السائق والعمولة (RBAC)
          </button>

          <button
            onClick={() => setActiveDriverTab('reconciliation')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeDriverTab === 'reconciliation'
              ? 'bg-emerald-500 text-black shadow-lg'
              : 'bg-[#142013] text-slate-300 hover:text-white border border-emerald-900'
              }`}
          >
            <BarChart2 className="w-4 h-4" /> المطابقة وإغلاق الصندوق (Z-Report)
          </button>
        </div>
      )}

      {/* TAB 1: FLEET DISPATCH & OUTCOMES */}
      {activeDriverTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ORDERS QUEUE SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 bg-[#142013] border-2 border-emerald-500/30 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، العميل، السائق..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a1209] border border-emerald-500/40 rounded-xl py-2 pr-9 pl-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {['ALL', 'Pending', 'In Transit', 'Delivered', 'Rejected', 'Postponed'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${filterStatus === st ? 'bg-emerald-500 text-black font-black' : 'bg-[#0a1209] text-slate-400 border border-emerald-950'
                      }`}
                  >
                    {st === 'ALL' ? 'الكل' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {orders
                .filter(o => (filterStatus === 'ALL' || o.outcome === filterStatus))
                .map((ord, idx) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setActiveQueueIndex(idx);
                    }}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${ord.id === selectedOrderId
                      ? 'bg-emerald-950/70 border-emerald-400 shadow-lg'
                      : 'bg-[#0a1209] border-emerald-900/50 hover:border-emerald-500/40'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-black text-amber-400">{ord.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${ord.outcome === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        ord.outcome === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          ord.outcome === 'Postponed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                        {ord.outcome}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{ord.customerName}</h4>
                    <span className="text-[10px] text-slate-400 block mt-1">{ord.cityDistrict}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* MAIN ORDER DETAIL & 3-WAY OUTCOME DISPATCHER (8 COLS) */}
          <div className="lg:col-span-8 bg-[#142013] border-2 border-emerald-500/30 rounded-2xl p-5 space-y-5 shadow-xl">

            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  {selectedOrder.customerName}
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    {selectedOrder.orderNumber}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedOrder.addressDetails} ({selectedOrder.cityDistrict})
                </p>
              </div>

              <button
                onClick={() => handleEnRouteToNextClient(selectedOrder)}
                className="px-3.5 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" /> إرسال إشعار الانطلاق بالواتساب
              </button>
            </div>

            {/* 3-WAY OUTCOME ACTION SELECTION */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-amber-300">اختر نتيجة التوصيل للطلب الحالي:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => submitOrderOutcome('Delivered')}
                  className={`p-3 rounded-xl border-2 text-right transition-all ${selectedOrder.outcome === 'Delivered'
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-black'
                    : 'bg-[#0a1209] border-emerald-900 text-slate-300 hover:border-emerald-500/40'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">1. تم التسليم (Delivered)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">يحتاج توقيع رقمي. احتساب الفاتورة + التوصيل.</span>
                </button>

                <button
                  onClick={() => submitOrderOutcome('Rejected')}
                  className={`p-3 rounded-xl border-2 text-right transition-all ${selectedOrder.outcome === 'Rejected'
                    ? 'bg-rose-950 border-rose-400 text-rose-300 font-black'
                    : 'bg-[#0a1209] border-rose-950 text-slate-300 hover:border-rose-500/40'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">2. مرتجع (Rejected)</span>
                    <XCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">يحتاج توقيع العميل + السبب. احتساب رسم توصيل $5.</span>
                </button>

                <button
                  onClick={() => submitOrderOutcome('Postponed')}
                  className={`p-3 rounded-xl border-2 text-right transition-all ${selectedOrder.outcome === 'Postponed'
                    ? 'bg-amber-950 border-amber-400 text-amber-300 font-black'
                    : 'bg-[#0a1209] border-amber-950 text-slate-300 hover:border-amber-500/40'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">3. تأجيل (Postponed)</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">يحتاج سبب التاجيل. احتساب $0.00 (Zero-fee).</span>
                </button>
              </div>
            </div>

            {/* CONDITIONAL REASON INPUTS */}
            {selectedOrder.outcome === 'Rejected' && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 space-y-2">
                <label className="text-xs font-black text-rose-300 block">سبب الرفض الإلزامي:</label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full bg-[#0a1209] border border-rose-500/40 rounded-lg p-2 text-xs text-white"
                />
              </div>
            )}

            {selectedOrder.outcome === 'Postponed' && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 space-y-2">
                <label className="text-xs font-black text-amber-300 block">سبب التأجيل الإلزامي:</label>
                <input
                  type="text"
                  value={postponedReasonInput}
                  onChange={(e) => setPostponedReasonInput(e.target.value)}
                  className="w-full bg-[#0a1209] border border-amber-500/40 rounded-lg p-2 text-xs text-white"
                />
              </div>
            )}

            {/* DIGITAL POD CANVAS FOR DELIVERED / REJECTED */}
            {(selectedOrder.outcome === 'Delivered' || selectedOrder.outcome === 'Rejected') && (
              <div className="bg-[#0a1209] border-2 border-emerald-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-black text-white">توقيع إثبات التسليم الرقمي (POD Canvas)</h3>
                  </div>
                  {podSaved && (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> تم الاعتماد والتسجيل
                    </span>
                  )}
                </div>

                <div className="relative bg-[#142013] border-2 border-dashed border-emerald-500/40 rounded-lg overflow-hidden flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={520}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair bg-transparent touch-none"
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] text-slate-500 pointer-events-none">
                    وقّع باللمس أو الماوس داخل الإطار
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    onClick={clearCanvas}
                    className="px-3.5 py-1.5 bg-slate-900 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> مسح
                  </button>
                  <button
                    onClick={() => submitOrderOutcome(selectedOrder.outcome)}
                    className="px-4 py-1.5 bg-emerald-500 text-black text-xs font-black rounded-lg border border-emerald-300 flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> تأكيد واعتماد POD
                  </button>
                </div>
              </div>
            )}

            {/* NEXT ORDER CONTINUOUS QUEUE LOOP BUTTON */}
            {activeQueueIndex < orders.length - 1 ? (
              <button
                onClick={advanceToNextOrder}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all"
              >
                <Send className="w-4 h-4" /> الانطلاق للزبون التالي (Next Order) ←
              </button>
            ) : (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-center text-xs font-black text-emerald-300">
                🎉 تم إنجاز جميع طلبات المسار بالكامل! يرجى التوجه نحو الشركة والعودة للسيارة.
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: DRIVER PROFILE & RBAC ACCESS CONTROL */}
      {activeDriverTab === 'profile-manage' && (
        <div>
          {!canManageDriverProfiles ? (
            /* ACCESS DENIED UI STATE FOR UNAUTHORIZED ROLES */
            <div className="bg-rose-950/60 border-2 border-rose-500/60 rounded-2xl p-10 text-center space-y-4 shadow-2xl max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500/60 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white">Access Denied -- صلاحية غير مخوّلة</h2>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                عذراً! لا تملك الصلاحية الكافية لعرض أو تعديل ملفات السائقين والعمولات.
                الوصول محصور حصرياً بـ <strong>Super Admin</strong> و <strong>Supersonic Management</strong>.
              </p>
              <span className="inline-block bg-rose-900/60 border border-rose-700 text-rose-300 text-xs px-3 py-1 rounded-full font-mono font-bold">
                Role: {currentUserRole}
              </span>
            </div>
          ) : (
            /* AUTHORIZED DRIVER PROFILE MANAGEMENT */
            <div className="bg-[#142013] border-2 border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h2 className="text-lg font-black text-white">إدارة ملف السائق والنسب العمولية (Driver Profile RBAC)</h2>
                    <p className="text-xs text-slate-400">منتوجات زيت وزيتون الجنوب ش.م.م -- Tenant 001</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1 rounded-full font-black">
                  Authorized: {currentUserRole}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a1209] border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <label className="text-xs text-slate-400 font-bold block">اسم السائق الكامل:</label>
                  <input
                    type="text"
                    value={driverProfile.name}
                    onChange={(e) => setDriverProfile({ ...driverProfile, name: e.target.value })}
                    className="w-full bg-[#142013] border border-emerald-500/40 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="bg-[#0a1209] border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <label className="text-xs text-slate-400 font-bold block">نوع مركبة التوصيل:</label>
                  <input
                    type="text"
                    value={driverProfile.vehicleType}
                    onChange={(e) => setDriverProfile({ ...driverProfile, vehicleType: e.target.value })}
                    className="w-full bg-[#142013] border border-emerald-500/40 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="bg-[#0a1209] border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <label className="text-xs text-slate-400 font-bold block">رقم اللوحة / المركبة:</label>
                  <input
                    type="text"
                    value={driverProfile.vehicleNumber}
                    onChange={(e) => setDriverProfile({ ...driverProfile, vehicleNumber: e.target.value })}
                    className="w-full bg-[#142013] border border-emerald-500/40 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="bg-[#0a1209] border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <label className="text-xs text-slate-400 font-bold block">نوع ملكية المركبة (Vehicle Ownership):</label>
                  <select
                    value={driverProfile.vehicleOwnership}
                    onChange={(e) => setDriverProfile({ ...driverProfile, vehicleOwnership: e.target.value as VehicleOwnership })}
                    className="w-full bg-[#142013] border border-emerald-500/40 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="COMPANY_OWNED">مركبة ملك الشركة (COMPANY_OWNED)</option>
                    <option value="COMPANY_LEASED">مركبة مستأجرة للشركة (COMPANY_LEASED)</option>
                    <option value="DRIVER_OWNED">مركبة ملك السائق (DRIVER_OWNED)</option>
                    <option value="DRIVER_LEASED">مركبة مستأجرة للسائق (DRIVER_LEASED)</option>
                  </select>
                </div>

                <div className="bg-[#0a1209] border border-emerald-500/30 rounded-xl p-4 space-y-2">
                  <label className="text-xs text-slate-400 font-bold block">نسبة عمولة المندوب (Social Media Rep Commission %):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={driverProfile.commissionRate}
                      onChange={(e) => setDriverProfile({ ...driverProfile, commissionRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#142013] border border-emerald-500/40 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <Percent className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* REP COMMISSION SUMMARY CARD */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block font-bold">المندوب المرتبط: {driverProfile.repName} ({driverProfile.repCode})</span>
                  <span className="text-xs text-emerald-400 font-bold">إجمالي العمولات المستحقة التراكمية:</span>
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">
                  ${repCommissionBalanceUsd.toFixed(2)} USD
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Z-REPORT RECONCILIATION & CROSS-MODULE DISPATCH */}
      {activeDriverTab === 'reconciliation' && (
        <div className="bg-[#142013] border-2 border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-4">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-lg font-black text-white">تقرير Z-Report ومطابقة الصندوق (Shift Reconciliation)</h2>
                <p className="text-xs text-slate-400">ملخص يومية السائق: {driverProfile.name}</p>
              </div>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-black">
              Shift Status: {shiftStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-[#0a1209] border border-emerald-500/30 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">الطلبات المسلّمة (Delivered)</span>
              <span className="text-2xl font-black text-emerald-400">{totalDeliveredCount}</span>
              <span className="text-xs text-slate-300 block font-mono">${totalDeliveredCashUsd.toFixed(2)} USD</span>
            </div>

            <div className="bg-[#0a1209] border border-rose-500/30 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">الطلبات المرتجعة (Rejected Fees)</span>
              <span className="text-2xl font-black text-rose-400">{totalRejectedCount}</span>
              <span className="text-xs text-rose-300 block font-mono">رسوم توصيل: ${totalRejectionFeesUsd.toFixed(2)} USD</span>
            </div>

            <div className="bg-[#0a1209] border border-amber-500/30 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">الطلبات المؤجلة (Postponed Zero-Fee)</span>
              <span className="text-2xl font-black text-amber-400">{totalPostponedCount}</span>
              <span className="text-xs text-amber-300 block font-mono">$0.00 USD</span>
            </div>
          </div>

          {/* ITEMIZED ORDERS BREAKDOWN TABLE FOR DRIVER Z-REPORT */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> بيان الطلبيات والتسليم وكلفة الدليفري المستحقة للسائق:
            </h3>
            <div className="overflow-x-auto rounded-xl border border-emerald-900/60 bg-[#0a1209]">
              <table className="w-full text-center text-base text-slate-200 border-collapse font-sans">
                <thead className="bg-emerald-950/80 text-amber-400 font-semibold border-b border-emerald-900/60 tracking-wide">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">#</th>
                    <th className="py-3.5 px-4 text-right font-semibold">اسم الزبون</th>
                    <th className="py-3.5 px-4 font-semibold">حالة الطلب</th>
                    <th className="py-3.5 px-4 font-semibold">قيمة الفاتورة ($)</th>
                    <th className="py-3.5 px-4 font-semibold">كلفة الدليفري للسائق ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/40 font-normal text-base">
                  {orders.map((ord, idx) => (
                    <tr key={ord.id} className="hover:bg-emerald-950/30">
                      <td className="py-3.5 px-4 text-amber-400 font-medium">{idx + 1}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-white">{ord.customerName}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ord.outcome === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          ord.outcome === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                          {ord.outcome === 'Delivered' ? 'تم التسليم' : ord.outcome === 'Rejected' ? 'مرتجع' : 'مؤجل'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">${ord.amountUsd.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-amber-300">${(ord.rejectionFeeCollectedUsd || 3.00).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL HANDOVER CASH CALCULATION BOX */}
          <div className="bg-[#0a1209] border-2 border-emerald-500/50 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-200 block font-bold">إجمالي النقد الواجب تسليمه للصندوق (Total Cash to Handover):</span>
              <span className="text-[10px] text-slate-300 block mt-0.5">المعادلة: (مبيعات المسلّم + رسوم التوصيل المرتجع) وتجاهل المؤجل ($0)</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/40">
              ${totalHandoverCashUsd.toFixed(2)} USD
            </div>
          </div>

          {/* RECONCILE & CLOSE ACCOUNT DISPATCH BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={submitDriverReconciliation}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl border border-emerald-300 flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <Check className="w-4 h-4" /> تأكيد المطابقة وإغلاق الحساب (Confirm Reconciliation & Dispatch Alerts)
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
