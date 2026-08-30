'use client';

import React, { useState } from 'react';

// ============================================================================
// SAMPLE DATASETS FOR THE 6 PILLARS
// ============================================================================

interface ChatConversation {
  id: string;
  senderName: string;
  senderPhone: string;
  platform: 'WHATSAPP' | 'INSTAGRAM' | 'MESSENGER';
  lastMessage: string;
  time: string;
  unreadCount: number;
  assignedRep: string;
}

interface PlatformOrder {
  id: string;
  customerName: string;
  phone: string;
  platform: string;
  offerDetails: string;
  amountUsd: number;
  repName: string;
  repCode: string;
  slaMinutesLeft: number;
  status: 'PENDING_REP_APPROVAL' | 'APPROVED' | 'ESCALATED_TO_MANAGEMENT' | 'DELIVERED';
}

interface SocialPost {
  id: string;
  title: string;
  platforms: string[];
  scheduledTime: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'DRAFT';
}

interface AdCampaignCPL {
  id: string;
  name: string;
  platform: string;
  spendUsd: number;
  leads: number;
  cplUsd: number;
  conversions: number;
  revenueUsd: number;
}

interface SupportAgentMetric {
  id: string;
  name: string;
  code: string;
  activeChats: number;
  totalOrders: number;
  conversionRatePct: number;
  avgResponseMins: number;
  earnedCommissionUsd: number;
}

interface DistributorPartner {
  id: string;
  name: string;
  region: string;
  contactPerson: string;
  phone: string;
  creditLimitUsd: number;
  assignedRep: string;
}

export default function SocialMediaManagementHub() {
  const [activeTab, setActiveTab] = useState<
    'inbox' | 'orders' | 'calendar' | 'cpl' | 'agents' | 'distributors'
  >('inbox');

  // Unified Inbox State
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>({
    id: 'CHAT-01',
    senderName: 'طارق المصري',
    senderPhone: '+96170889900',
    platform: 'WHATSAPP',
    lastMessage: 'مرحباً، كم سعر تنكة زيت الزيتون البلدي 17.5 لتر مع التوصيل لبيروت؟',
    time: 'منذ 5 دقائق',
    unreadCount: 1,
    assignedRep: 'أحمد علي قاسم',
  });
  const [replyMessage, setReplyMessage] = useState('');

  // 1. Unified Inbox Sample Chats
  const conversations: ChatConversation[] = [
    {
      id: 'CHAT-01',
      senderName: 'طارق المصري',
      senderPhone: '+96170889900',
      platform: 'WHATSAPP',
      lastMessage: 'مرحباً، كم سعر تنكة زيت الزيتون البلدي 17.5 لتر؟',
      time: '12:45 PM',
      unreadCount: 1,
      assignedRep: 'أحمد علي قاسم',
    },
    {
      id: 'CHAT-02',
      senderName: 'سناء خليل',
      senderPhone: '@sana_khaleel',
      platform: 'INSTAGRAM',
      lastMessage: 'هل متوفر دبس رمان طبيعي بدون سكر مضاف؟',
      time: '11:30 AM',
      unreadCount: 0,
      assignedRep: 'هبة العلو',
    },
    {
      id: 'CHAT-03',
      senderName: 'محلات الخير - صيدا',
      senderPhone: '+96103112233',
      platform: 'WHATSAPP',
      lastMessage: 'بدنا طلبية جملة: 10 تنكات زيت + كرتونة صابون بلدي',
      time: 'أمس',
      unreadCount: 0,
      assignedRep: 'حسين مهدي',
    },
  ];

  // 2. Platform Orders Sample
  const platformOrders: PlatformOrder[] = [
    {
      id: 'ORD-SO-9921',
      customerName: 'فادي خليل',
      phone: '03889900',
      platform: 'Landing Page (TikTok Ad)',
      offerDetails: 'تنكة زيت 17.5 لتر + 2 دبس رمان',
      amountUsd: 125.0,
      repName: 'أحمد علي قاسم',
      repCode: 'ADM-REP-01',
      slaMinutesLeft: 35,
      status: 'PENDING_REP_APPROVAL',
    },
    {
      id: 'ORD-SO-9925',
      customerName: 'رامي عساف',
      phone: '76112233',
      platform: 'Instagram Direct',
      offerDetails: 'عرض المونة: 3 قناني دبس رمان',
      amountUsd: 45.0,
      repName: 'هبة العلو',
      repCode: 'ADM-REP-02',
      slaMinutesLeft: 0,
      status: 'ESCALATED_TO_MANAGEMENT',
    },
    {
      id: 'ORD-SO-9922',
      customerName: 'جورج حداد',
      phone: '71445566',
      platform: 'WhatsApp Direct',
      offerDetails: '2 تنكة زيت زيتون بلدي',
      amountUsd: 220.0,
      repName: 'أحمد علي قاسم',
      repCode: 'ADM-REP-01',
      slaMinutesLeft: 0,
      status: 'APPROVED',
    },
  ];

  // 3. Publishing Calendar Sample
  const publishingPosts: SocialPost[] = [
    {
      id: 'POST-01',
      title: 'فيديو قطاف الزيتون وبدء تشغيل معصرة الجنوب 🌿',
      platforms: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'],
      scheduledTime: 'اليوم - 6:00 مساءً',
      status: 'SCHEDULED',
    },
    {
      id: 'POST-02',
      title: 'عرض دبس الرمان الطبيعي المركز 100% بدون سكر',
      platforms: ['FACEBOOK', 'INSTAGRAM'],
      scheduledTime: 'غداً - 12:00 ظهراً',
      status: 'SCHEDULED',
    },
    {
      id: 'POST-03',
      title: 'إعلان افتتاح فرع بيروت الجديد وتوفر خدمة التوصيل',
      platforms: ['INSTAGRAM'],
      scheduledTime: '2026-08-28',
      status: 'PUBLISHED',
    },
  ];

  // 4. Ad Campaigns Sample
  const adCampaigns: AdCampaignCPL[] = [
    {
      id: 'CAMP-01',
      name: 'حملة موسم عصر الزيتون 2026',
      platform: 'Meta Ads (Instagram & FB)',
      spendUsd: 250.0,
      leads: 185,
      cplUsd: 1.35,
      conversions: 42,
      revenueUsd: 4850.0,
    },
    {
      id: 'CAMP-02',
      name: 'عرض دبس الرمان والمونة البلدية',
      platform: 'TikTok Ads',
      spendUsd: 150.0,
      leads: 120,
      cplUsd: 1.25,
      conversions: 28,
      revenueUsd: 1420.0,
    },
  ];

  // 5. Support Agents Sample
  const supportAgents: SupportAgentMetric[] = [
    {
      id: 'REP-01',
      name: 'أحمد علي قاسم',
      code: 'ADM-REP-01',
      activeChats: 14,
      totalOrders: 62,
      conversionRatePct: 24.5,
      avgResponseMins: 3.2,
      earnedCommissionUsd: 310.0,
    },
    {
      id: 'REP-02',
      name: 'هبة العلو',
      code: 'ADM-REP-02',
      activeChats: 9,
      totalOrders: 48,
      conversionRatePct: 21.0,
      avgResponseMins: 4.5,
      earnedCommissionUsd: 240.0,
    },
    {
      id: 'REP-03',
      name: 'حسين مهدي',
      code: 'ADM-REP-03',
      activeChats: 18,
      totalOrders: 75,
      conversionRatePct: 28.0,
      avgResponseMins: 2.8,
      earnedCommissionUsd: 420.0,
    },
  ];

  // 6. Distributors Sample
  const distributors: DistributorPartner[] = [
    {
      id: 'DIST-01',
      name: 'سوبرماركت البركة - الشويفات',
      region: 'الشويفات وجبل لبنان',
      contactPerson: 'الحاج سامي قاسم',
      phone: '03112233',
      creditLimitUsd: 5000.0,
      assignedRep: 'أحمد علي قاسم',
    },
    {
      id: 'DIST-02',
      name: 'مؤسسة النور للمونة - بيروت الحمرا',
      region: 'بيروت',
      contactPerson: 'فؤاد النور',
      phone: '01778899',
      creditLimitUsd: 3500.0,
      assignedRep: 'هبة العلو',
    },
    {
      id: 'DIST-03',
      name: 'محلات الخير لزيت الزيتون - صيدا',
      region: 'صيدا والجنوب',
      contactPerson: 'كريم سعد',
      phone: '07722334',
      creditLimitUsd: 7000.0,
      assignedRep: 'حسين مهدي',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans text-slate-800 text-right select-none">
      
      {/* 1. Master Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1a629b]"></span>
            <h1 className="text-[20px] font-bold text-[#1e293b] tracking-tight">
              بوابة إدارة السوشيال ميديا المركزية (Social Media Management Hub)
            </h1>
          </div>
          <p className="text-xs text-[#527a9e] mt-0.5 font-medium">
            Southern Olive Oil Products S.A.R.L - إدارة المحادثات، طلبات المنصات، تقويم النشر، والحملات
          </p>
        </div>

        {/* 6 Pillars Tabs Switcher */}
        <div className="flex flex-wrap items-center bg-slate-200/80 p-1 rounded-xl gap-1">
          {[
            { id: 'inbox', label: '1. البريد الموحد (Inbox)' },
            { id: 'orders', label: '2. طلبات المنصات (Orders)' },
            { id: 'calendar', label: '3. تقويم النشر (Calendar)' },
            { id: 'cpl', label: '4. الحملات وتكلفة الليد (CPL)' },
            { id: 'agents', label: '5. أداء المندوبين (Agents)' },
            { id: 'distributors', label: '6. دليل الموزعين (Distributors)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#1a629b] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. UNIFIED SOCIAL INBOX                                             */}
      {/* =================================================================== */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[650px]">
          
          {/* Conversation List (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 flex flex-col h-full">
            <h3 className="text-xs font-bold text-slate-700 pb-2 border-b border-slate-100 mb-2 flex justify-between items-center">
              <span>المحادثات الواردة ({conversations.length})</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">متصل لحظياً</span>
            </h3>

            <div className="overflow-y-auto space-y-1.5 flex-1 custom-scrollbar">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChat(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedChat?.id === c.id
                      ? 'bg-blue-50/70 border-[#1a629b]'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{c.senderName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 line-clamp-1">{c.lastMessage}</p>
                  <div className="flex items-center justify-between pt-1 mt-1 text-[10px] text-slate-500 border-t border-slate-200/50">
                    <span className="font-bold text-[#1a629b]">{c.platform}</span>
                    <span>المسؤول: {c.assignedRep}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chat & Action Panel (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col h-full">
            {selectedChat ? (
              <>
                {/* Chat Top Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{selectedChat.senderName}</div>
                    <div className="text-xs text-slate-500 font-mono">{selectedChat.senderPhone} | منصة: {selectedChat.platform}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`فتح نافذة إنشاء طلبية جديدة للزبون ${selectedChat.senderName}`)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                  >
                    + إنشاء طلبية ERP بنقرة واحدة
                  </button>
                </div>

                {/* Message Flow */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8fafc] rounded-xl my-3 custom-scrollbar">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tr-none max-w-[80%] text-xs shadow-2xs">
                    <div className="font-bold text-[#1a629b] mb-1">{selectedChat.senderName}</div>
                    <p>{selectedChat.lastMessage}</p>
                    <div className="text-[9px] text-slate-400 font-mono mt-1 text-left">{selectedChat.time}</div>
                  </div>

                  <div className="bg-[#1a629b] text-white p-3 rounded-2xl rounded-tl-none max-w-[80%] mr-auto text-xs shadow-2xs">
                    <div className="font-bold text-amber-300 mb-1">{selectedChat.assignedRep} (المبيعات)</div>
                    <p>أهلاً بك يا طارق! سعر تنكة زيت الزيتون البلدي 17.5 لتر عصرة أولى 110$ والتوصيل مؤمن لبيروت عبر أسطولنا.</p>
                    <div className="text-[9px] text-slate-200 font-mono mt-1 text-left">12:47 PM ✓✓</div>
                  </div>
                </div>

                {/* Quick Canned Replies */}
                <div className="flex items-center gap-1.5 pb-2 text-[11px] font-bold text-[#1a629b]">
                  <span className="text-slate-500">ردود سريعة:</span>
                  <button onClick={() => setReplyMessage('سعر تنكة الزيت 110$ ودبس الرمان 6$')} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded">/الأسعار</button>
                  <button onClick={() => setReplyMessage('فروعنا: الشويفات الشارع الرئيسي - فرع بيروت')} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded">/الفروع</button>
                  <button onClick={() => setReplyMessage('التوصيل خلال 24 ساعة مع خيار كاش أو ويش موني')} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded">/التوصيل</button>
                </div>

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="اكتب ردك للزبون هنا..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-[#1a629b] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setReplyMessage(''); alert('تم إرسال الرد بنجاح'); }}
                    className="px-5 py-2 bg-[#1a629b] hover:bg-[#124b77] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                  >
                    إرسال
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                اختر محادثة من القائمة للبدء
              </div>
            )}
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* 2. PLATFORM ORDERS                                                  */}
      {/* =================================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              سجل ومتابعة طلبات السوشيال وصفحات الهبوط
            </h2>
            <span className="text-xs text-[#1a629b] font-bold">Southern Olive Oil Products S.A.R.L</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">رقم الطلب</th>
                  <th className="py-2.5 px-3 normal-case">اسم الزبون والهاتف</th>
                  <th className="py-2.5 px-3 normal-case">المنصة / المصدر</th>
                  <th className="py-2.5 px-3 normal-case">تفاصيل الطلب</th>
                  <th className="py-2.5 px-3 normal-case text-center">المبلغ ($)</th>
                  <th className="py-2.5 px-3 normal-case">المندوب المسؤول</th>
                  <th className="py-2.5 px-3 normal-case text-center">مهلة الـ 1 ساعة</th>
                  <th className="py-2.5 px-3 normal-case text-center">حالة الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {platformOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1a629b]">{ord.id}</td>
                    <td className="py-2.5 px-3 font-bold">{ord.customerName} <span className="font-mono text-slate-500 block text-[10px]">{ord.phone}</span></td>
                    <td className="py-2.5 px-3 text-slate-600">{ord.platform}</td>
                    <td className="py-2.5 px-3">{ord.offerDetails}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">${ord.amountUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3">{ord.repName} <span className="font-mono text-slate-400 text-[10px]">({ord.repCode})</span></td>
                    <td className="py-2.5 px-3 text-center">
                      {ord.status === 'PENDING_REP_APPROVAL' ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10.5px] animate-pulse">
                          ⏳ متبقي {ord.slaMinutesLeft} دقيقة
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">مكتملة</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {ord.status === 'APPROVED' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">معتمد ✓</span>}
                      {ord.status === 'PENDING_REP_APPROVAL' && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">بانتظار المندوب</span>}
                      {ord.status === 'ESCALATED_TO_MANAGEMENT' && <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px]">تحول للإدارة</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. PUBLISHING CALENDAR                                              */}
      {/* =================================================================== */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              تقويم وجدول نشر محتوى السوشيال ميديا (Publishing Calendar)
            </h2>
            <button
              type="button"
              onClick={() => alert('فتح نموذج جدولة منشور جديد')}
              className="px-4 py-1.5 bg-[#1a629b] text-white text-xs font-bold rounded-lg shadow-2xs"
            >
              + جدولة منشور جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publishingPosts.map((post) => (
              <div key={post.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#1a629b]">{post.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    post.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {post.status === 'SCHEDULED' ? 'مجدول' : 'تم النشر'}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 leading-normal">{post.title}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {post.platforms.map((p) => (
                    <span key={p} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9.5px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 font-mono border-t border-slate-200 pt-2">
                  موعد النشر: {post.scheduledTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. AD CAMPAIGNS & CPL                                               */}
      {/* =================================================================== */}
      {activeTab === 'cpl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              تحليلات الحملات الإعلانية وتكلفة الليد (Ad Campaigns & CPL Tracker)
            </h2>
            <span className="text-xs text-emerald-600 font-bold">حساب العائد على الاستثمار الإعلاني (ROAS)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">اسم الحملة الإعلانية</th>
                  <th className="py-2.5 px-3 normal-case">المنصة</th>
                  <th className="py-2.5 px-3 normal-case text-center">المصروف ($)</th>
                  <th className="py-2.5 px-3 normal-case text-center">عدد الليدز (Leads)</th>
                  <th className="py-2.5 px-3 normal-case text-center">تكلفة الليد CPL ($)</th>
                  <th className="py-2.5 px-3 normal-case text-center">المبيعات المحققة</th>
                  <th className="py-2.5 px-3 normal-case text-center">الإيراد ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {adCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1a629b]">{camp.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{camp.platform}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">${camp.spendUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{camp.leads}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">${camp.cplUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{camp.conversions} طلب</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1a629b]">${camp.revenueUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. SUPPORT AGENTS PERFORMANCE LEADERBOARD                           */}
      {/* =================================================================== */}
      {activeTab === 'agents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              لوحة تقييم ومراقبة أداء المندوبين وممثلي السوشيال ميديا
            </h2>
            <span className="text-xs text-slate-500 font-mono">Southern Olive Oil Products S.A.R.L</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">اسم المندوب</th>
                  <th className="py-2.5 px-3 normal-case">كود الإدارة</th>
                  <th className="py-2.5 px-3 normal-case text-center">المحادثات المفتوحة</th>
                  <th className="py-2.5 px-3 normal-case text-center">إجمالي الطلبات</th>
                  <th className="py-2.5 px-3 normal-case text-center">نسبة التحويل</th>
                  <th className="py-2.5 px-3 normal-case text-center">متوسط سرعة الرد</th>
                  <th className="py-2.5 px-3 normal-case text-center">العمولات المحققة ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {supportAgents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold">{ag.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#1a629b] font-bold">{ag.code}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{ag.activeChats}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{ag.totalOrders}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">{ag.conversionRatePct}%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{ag.avgResponseMins} دقيقة</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1a629b]">${ag.earnedCommissionUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. DISTRIBUTORS DIRECTORY                                           */}
      {/* =================================================================== */}
      {activeTab === 'distributors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              دليل الموزعين والمحلات الشريكة في المناطق اللبنانية
            </h2>
            <button
              type="button"
              onClick={() => alert('إضافة موزع جديد إلى الدليل')}
              className="px-4 py-1.5 bg-[#1a629b] text-white text-xs font-bold rounded-lg shadow-2xs"
            >
              + إضافة موزع جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">اسم المؤسسة / الموزع</th>
                  <th className="py-2.5 px-3 normal-case">المنطقة الجغرافية</th>
                  <th className="py-2.5 px-3 normal-case">الشخص المسؤول</th>
                  <th className="py-2.5 px-3 normal-case">رقم الهاتف</th>
                  <th className="py-2.5 px-3 normal-case text-center">الحد الائتماني ($)</th>
                  <th className="py-2.5 px-3 normal-case">المندوب المنسق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {distributors.map((dist) => (
                  <tr key={dist.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1a629b]">{dist.name}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{dist.region}</td>
                    <td className="py-2.5 px-3">{dist.contactPerson}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{dist.phone}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">${dist.creditLimitUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{dist.assignedRep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
