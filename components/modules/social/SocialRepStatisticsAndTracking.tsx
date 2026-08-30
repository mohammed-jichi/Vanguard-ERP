'use client';

import React, { useState } from 'react';

interface TrackingOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  offerDetails: string;
  amountUsd: number;
  scheduledEta: string; // From SuperSonic
  status: 'IN_TRANSIT' | 'DELIVERED' | 'PENDING' | 'CANCELLED';
  driverName?: string;
  driverPhone?: string;
  statusReason?: string; // سبب التأجيل أو سبب الإلغاء
  repCommission: number;
  driverLocation?: { lat: number; lng: number; lastUpdate: string };
}

const SAMPLE_TRACKING_ORDERS: TrackingOrder[] = [
  {
    id: 'ORD-SO-9921',
    customerName: 'فادي خليل',
    customerPhone: '03889900',
    customerAddress: 'بيروت - الحمرا - شارع السادات',
    offerDetails: 'عرض تنكة زيت زيتون بلدي 17.5 لتر + 2 دبس رمان',
    amountUsd: 125.0,
    scheduledEta: 'اليوم الساعة 3:30 عصراً',
    status: 'IN_TRANSIT',
    driverName: 'سمير قاسم (سائق أسطول الشويفات)',
    driverPhone: '70112233',
    repCommission: 6.25,
    driverLocation: { lat: 33.8886, lng: 35.4955, lastUpdate: 'منذ دقيقتين' },
  },
  {
    id: 'ORD-SO-9922',
    customerName: 'جورج حداد',
    customerPhone: '71445566',
    customerAddress: 'جونية - حارة صخر',
    offerDetails: 'عرض المونة: 3 قناني دبس رمان + كبيس مشكل',
    amountUsd: 45.0,
    scheduledEta: 'اليوم الساعة 5:00 مساءً',
    status: 'DELIVERED',
    driverName: 'علي رضا',
    driverPhone: '03556677',
    repCommission: 2.25,
  },
  {
    id: 'ORD-SO-9924',
    customerName: 'كريم صعب',
    customerPhone: '70223344',
    customerAddress: 'الشويفات - قرب البلدية',
    offerDetails: 'غالون زيت زيتون خضير 5 لتر + صابون بلدي',
    amountUsd: 65.0,
    scheduledEta: 'مؤجل ليوم الغد',
    status: 'PENDING',
    statusReason: 'طلب الزبون تأجيل الاستلام إلى الغد لعدم تواجده في المنزل',
    repCommission: 3.25,
  },
  {
    id: 'ORD-SO-9923',
    customerName: 'رنا المصري',
    customerPhone: '76998877',
    customerAddress: 'صيدا - الشارع التجاري',
    offerDetails: '2 تنكة زيت زيتون فرجن ممتاز',
    amountUsd: 220.0,
    scheduledEta: 'ملغاة',
    status: 'CANCELLED',
    statusReason: 'الزبون ألغى الطلب - اشترى من فرع آخر',
    repCommission: 0.0,
  },
];

export default function SocialRepStatisticsAndTracking() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'statistics' | 'live_tracking'>('statistics');

  // Role: Rep Personal View vs Management Overview
  const [isManagementView, setIsManagementView] = useState(false);
  const [selectedRepCode, setSelectedRepCode] = useState('ALL');

  // Time Period Filter
  const [periodFilter, setPeriodFilter] = useState('this_month');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-30');

  // Map Modal State for Live Location
  const [selectedLiveOrder, setSelectedLiveOrder] = useState<TrackingOrder | null>(null);

  // Statistics Calculation
  const totalOrdersCount = SAMPLE_TRACKING_ORDERS.length;
  const deliveredCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'DELIVERED').length;
  const inTransitCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'IN_TRANSIT').length;
  const pendingCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'PENDING').length;
  const cancelledCount = SAMPLE_TRACKING_ORDERS.filter((o) => o.status === 'CANCELLED').length;
  
  const earnedCommission = SAMPLE_TRACKING_ORDERS
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.repCommission, 0);
  
  const pendingCommission = SAMPLE_TRACKING_ORDERS
    .filter((o) => o.status === 'IN_TRANSIT' || o.status === 'PENDING')
    .reduce((sum, o) => sum + o.repCommission, 0);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans text-slate-800 text-right select-none">
      
      {/* 1. Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1a629b]"></span>
            <h1 className="text-[20px] font-bold text-[#1e293b] tracking-tight">
              إحصائيات المبيعات ومراقبة وتتبع الطلبيات (SuperSonic Live Tracking)
            </h1>
          </div>
          <p className="text-xs text-[#527a9e] mt-0.5 font-medium">
            Southern Olive Oil Products S.A.R.L - تتبع الطلبيات المسلّمة، قيد التوصيل، المؤجلة، والملغاة
          </p>
        </div>

        {/* Tab & Role Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManagementView(!isManagementView)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isManagementView
                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {isManagementView ? '🏢 وضع الإدارة (عرض كافة المندوبين)' : '👤 وضع المندوب (حسابي فقط)'}
          </button>

          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('statistics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'statistics'
                  ? 'bg-white text-[#1a629b] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 لوحة الإحصائيات (Statistics)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('live_tracking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'live_tracking'
                  ? 'bg-white text-[#1a629b] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📍 مراقبة وتتبع الطلبيات (Live Tracking)
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TOP FILTER BAR (PERIODS & REP SELECTOR)                         */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 mb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Period Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-500 ml-1">الفترة الزمنية:</span>
            {[
              { id: 'today', label: 'اليوم (Today)' },
              { id: 'yesterday', label: 'أمس (Yesterday)' },
              { id: 'this_month', label: 'هذا الشهر (This Month)' },
              { id: 'last_month', label: 'الشهر الماضي (Last Month)' },
              { id: 'last_year', label: 'العام الماضي (Last Year)' },
              { id: 'custom', label: 'مخصص (From Date to Date)' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setPeriodFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  periodFilter === btn.id
                    ? 'bg-[#1a629b] text-white border-[#1a629b] shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Management Mode: Rep Selector */}
          {isManagementView && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">اختيار المندوب / الكود:</label>
              <select
                value={selectedRepCode}
                onChange={(e) => setSelectedRepCode(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#1a629b] focus:outline-none focus:border-[#1a629b]"
              >
                <option value="ALL">جميع المندوبين (كافة الفروع)</option>
                <option value="REP-SO-8492">أحمد علي قاسم (كود: ADM-REP-01)</option>
                <option value="REP-SO-8493">هبة العلو (كود: ADM-REP-02)</option>
                <option value="REP-SO-8494">حسين مهدي (كود: ADM-REP-03)</option>
              </select>
            </div>
          )}

        </div>

        {periodFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">من تاريخ (From):</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded-md font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">إلى تاريخ (To):</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: STATISTICS DASHBOARD (ALL 4 STATUSES + COMMISSIONS)         */}
      {/* =================================================================== */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            
            {/* Total Orders */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-500">إجمالي الطلبات</div>
              <div className="text-xl font-bold font-mono text-[#1e293b]">{totalOrdersCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">الواردة من السوشيال</div>
            </div>

            {/* Delivered */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs text-center space-y-1 bg-emerald-50/30">
              <div className="text-[11px] font-bold text-emerald-800">المسلّمة (Delivered)</div>
              <div className="text-xl font-bold font-mono text-emerald-600">{deliveredCount}</div>
              <div className="text-[10px] text-emerald-700 font-bold">تم تحصيلها بالكامل</div>
            </div>

            {/* In Transit */}
            <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs text-center space-y-1 bg-blue-50/30">
              <div className="text-[11px] font-bold text-[#1a629b]">قيد التوصيل (In Transit)</div>
              <div className="text-xl font-bold font-mono text-[#1a629b]">{inTransitCount}</div>
              <div className="text-[10px] text-blue-700 font-medium">مع السائق بالطريق</div>
            </div>

            {/* Pending / Postponed */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-300 shadow-2xs text-center space-y-1 bg-amber-50/30">
              <div className="text-[11px] font-bold text-amber-800">المؤجلة (Pending)</div>
              <div className="text-xl font-bold font-mono text-amber-600">{pendingCount}</div>
              <div className="text-[10px] text-amber-700 font-medium">معلقة مع بيان السبب</div>
            </div>

            {/* Cancelled */}
            <div className="bg-white p-3.5 rounded-2xl border border-red-200 shadow-2xs text-center space-y-1 bg-red-50/30">
              <div className="text-[11px] font-bold text-red-800">الملغاة (Cancelled)</div>
              <div className="text-xl font-bold font-mono text-red-600">{cancelledCount}</div>
              <div className="text-[10px] text-red-700 font-medium">مع بيان سبب الإلغاء</div>
            </div>

            {/* Commissions */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-300 shadow-2xs text-center space-y-1 bg-emerald-50/50 col-span-2 md:col-span-1">
              <div className="text-[11px] font-bold text-emerald-900">العمولات المحصلة</div>
              <div className="text-xl font-bold font-mono text-emerald-700">${earnedCommission.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500">+ ${pendingCommission.toFixed(2)} معلقة</div>
            </div>

          </div>

          {/* Detailed Performance Table (Vanguard Style) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1a629b] border-b border-slate-100 pb-2">
              سجل تفصيل طلبيات المندوب وحالات التسليم
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 normal-case">رقم الطلب</th>
                    <th className="py-2.5 px-3 normal-case">اسم الزبون</th>
                    <th className="py-2.5 px-3 normal-case">تفاصيل العرض</th>
                    <th className="py-2.5 px-3 normal-case text-center">القيمة ($)</th>
                    <th className="py-2.5 px-3 normal-case text-center">العمولة ($)</th>
                    <th className="py-2.5 px-3 normal-case text-center">حالة الطلب</th>
                    <th className="py-2.5 px-3 normal-case">السبب / الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                  {SAMPLE_TRACKING_ORDERS.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1a629b]">{ord.id}</td>
                      <td className="py-2.5 px-3 font-bold">{ord.customerName} ({ord.customerPhone})</td>
                      <td className="py-2.5 px-3 text-slate-600">{ord.offerDetails}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">${ord.amountUsd.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">
                        ${ord.repCommission.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {ord.status === 'DELIVERED' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">مسلّمة ✓</span>
                        )}
                        {ord.status === 'IN_TRANSIT' && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10.5px] font-bold">مع السائق 🚗</span>
                        )}
                        {ord.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10.5px] font-bold">مؤجلة ⏳</span>
                        )}
                        {ord.status === 'CANCELLED' && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10.5px] font-bold">ملغاة ✕</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {ord.statusReason || 'تم التسليم بنجاح'}
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
      {/* TAB 2: LIVE ORDERS TRACKING & SUPERSONIC INTEGRATION                */}
      {/* =================================================================== */}
      {activeTab === 'live_tracking' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              مراقبة وتتبع الطلبيات الميدانية غير المسلّمة (SuperSonic Live Tracking)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Southern Olive Oil Products S.A.R.L</span>
          </div>

          <div className="space-y-3">
            {SAMPLE_TRACKING_ORDERS.filter((o) => o.status !== 'DELIVERED').map((order) => (
              <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#1a629b]">{order.id}</span>
                    <span className="font-bold text-xs">{order.customerName}</span>
                    <span className="text-slate-500 text-xs">({order.customerAddress})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-900' :
                      order.status === 'PENDING' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-900'
                    }`}>
                      ⏱ موعد الوصول المجدول: {order.scheduledEta}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <div>
                    <span>السائق المسؤول: </span>
                    <span className="font-bold text-slate-800">{order.driverName || 'بانتظار خروج السائق'}</span>
                    {order.driverPhone && <span className="font-mono text-slate-500 mr-1">({order.driverPhone})</span>}
                  </div>

                  {order.status === 'IN_TRANSIT' && order.driverLocation && (
                    <button
                      type="button"
                      onClick={() => setSelectedLiveOrder(order)}
                      className="px-3 py-1.5 bg-[#1a629b] hover:bg-[#124b77] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📍 عرض الموقع اللحظي المباشر للسائق (Live Location)</span>
                    </button>
                  )}

                  {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                    <div className="text-amber-800 font-bold">
                      سبب الحالة: {order.statusReason}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* 3. LIVE GPS LOCATION MAP MODAL POPUP                               */}
      {/* =================================================================== */}
      {selectedLiveOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-right">
            
            <div className="bg-[#1e232d] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h4 className="text-xs font-bold">
                  تتبع مباشر لسيارة التوصيل: {selectedLiveOrder.id}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLiveOrder(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[#1a629b] space-y-1">
                <div className="font-bold">السائق: {selectedLiveOrder.driverName}</div>
                <div>الزبون: {selectedLiveOrder.customerName} - {selectedLiveOrder.customerAddress}</div>
                <div className="text-[11px] text-slate-500 font-mono">آخر إشارة GPS: {selectedLiveOrder.driverLocation?.lastUpdate}</div>
              </div>

              <div className="w-full h-48 bg-slate-100 rounded-xl border border-slate-300 flex flex-col items-center justify-center text-slate-500 space-y-2 font-mono">
                <div className="text-2xl">🚗 📍</div>
                <div className="text-xs font-bold text-slate-700">خريطة المسار الحي (Live GPS Coordinates)</div>
                <div className="text-[11px] text-slate-500">
                  Lat: {selectedLiveOrder.driverLocation?.lat}, Lng: {selectedLiveOrder.driverLocation?.lng}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLiveOrder(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs"
                >
                  إغلاق نافذة التتبع
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
