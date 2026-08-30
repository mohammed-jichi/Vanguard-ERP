'use client';

import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// DATA MODELS
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
  repCode: string;
  isEscalatedToManagement: boolean;
}

interface PlatformOrder {
  id: string;
  customerName: string;
  phone: string;
  platform: string;
  offerDetails: string;
  amountUsd: number;
  paymentMethod: 'COD' | 'WHISH';
  repName: string;
  repCode: string;
  slaMinutesLeft: number;
  status: 'PENDING_REP_APPROVAL' | 'APPROVED' | 'ESCALATED_TO_MANAGEMENT' | 'DELIVERED';
}

interface RepStaggeredSchedule {
  repId: string;
  repName: string;
  repCode: string;
  handle: string;
  instagram: boolean;
  facebook: boolean;
  tiktok: boolean;
  customScheduledTime: string;
}

interface OutboundScheduleItem {
  id: string;
  type: 'SOCIAL_POST' | 'WHATSAPP_BROADCAST';
  title: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'TEXT_ONLY';
  mediaUrl?: string;
  fileName?: string;
  scheduledTime: string;
  targetChannelsSummary: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'QUEUED';
}

interface PageAttributionShare {
  repName: string;
  repCode: string;
  pageHandle: string;
  leadsGenerated: number;
  conversions: number;
  revenueUsd: number;
  contributionPct: number;
}

interface AdCampaignCPL {
  id: string;
  name: string;
  channelPlatform: 'WhatsApp' | 'Instagram' | 'Facebook' | 'TikTok';
  targetAudiencePool: string;
  spendUsd: number;
  totalLeads: number;
  cplUsd: number;
  totalConversions: number;
  totalRevenueUsd: number;
  status: string;
  pagesBreakdown: PageAttributionShare[];
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
  pages: { platform: string; pageName: string; followers: string; ordersCount: number }[];
}

// Read-Only Distributor Store for Social Reps Lookup
interface ReadOnlyDistributorStore {
  id: string;
  name: string;
  region: string;
  city: string;
  landmarkAddress: string;
  phone: string;
  assignedAreaRep: string;
}

interface SocialMediaManagementHubProps {
  initialTab?: 'inbox' | 'orders' | 'calendar' | 'cpl' | 'agents' | 'distributors';
  onBack?: () => void;
}

export default function SocialMediaManagementHub({
  initialTab = 'distributors',
  onBack,
}: SocialMediaManagementHubProps = {}) {
  // STRICT NUMERICAL TAB ORDER (1 to 6)
  const [activeTab, setActiveTab] = useState<
    'inbox' | 'orders' | 'calendar' | 'cpl' | 'agents' | 'distributors'
  >(initialTab || 'distributors');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Modals State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNewCannedModal, setShowNewCannedModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAgentDrilldown, setSelectedAgentDrilldown] = useState<SupportAgentMetric | null>(null);

  // Consolidated Master Customer Pool
  const [unifiedCustomerCount] = useState<number>(104850);

  // Read-Only Distributors Search & Regional Filter State
  const [distSearchQuery, setDistSearchQuery] = useState('');
  const [distRegionFilter, setDistRegionFilter] = useState('ALL');

  // Collapsible Accordion State for CPL Campaigns
  const [expandedCampaignIds, setExpandedCampaignIds] = useState<string[]>([]);

  const toggleCampaignAccordion = (campaignId: string) => {
    setExpandedCampaignIds((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Outbound Schedule State (Inside Tab 3: Calendar)
  const [scheduleType, setScheduleType] = useState<'SOCIAL_POST' | 'WHATSAPP_BROADCAST'>('SOCIAL_POST');
  const [itemTitle, setItemTitle] = useState('');
  const [masterDateTime, setMasterDateTime] = useState('2026-08-31T18:00');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'TEXT_ONLY'>('IMAGE');
  const [copyText, setCopyText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp Anti-Ban State
  const [waBatchSize, setWaBatchSize] = useState<number>(100);

  // Per-Rep Staggered Schedule Matrix
  const [repSchedules, setRepSchedules] = useState<RepStaggeredSchedule[]>([
    { repId: 'REP-01', repName: 'Ahmad Ali Kassem', repCode: 'ADM-REP-01', handle: '@ahmad_southern_olive', instagram: true, facebook: false, tiktok: true, customScheduledTime: '2026-08-31T18:00' },
    { repId: 'REP-02', repName: 'Hiba Aloulou', repCode: 'ADM-REP-02', handle: '@hiba_southern_preserves', instagram: false, facebook: true, tiktok: true, customScheduledTime: '2026-08-31T19:30' },
    { repId: 'REP-03', repName: 'Hussein Mahdi', repCode: 'ADM-REP-03', handle: '@hussein_oliveoillb', instagram: true, facebook: true, tiktok: true, customScheduledTime: '2026-08-31T21:00' },
  ]);

  // ==========================================================================
  // READ-ONLY DISTRIBUTORS DIRECTORY DATA (ALL LEBANON REGIONS)
  // ==========================================================================
  const [distributorStores] = useState<ReadOnlyDistributorStore[]>([
    {
      id: 'STORE-01',
      name: 'Al-Baraka Supermarket',
      region: 'Mount Lebanon',
      city: 'Choueifat',
      landmarkAddress: 'Main Highway near Choueifat Municipality',
      phone: '03112233',
      assignedAreaRep: 'Ahmad Ali Kassem',
    },
    {
      id: 'STORE-02',
      name: 'Al-Nour Food Establishment',
      region: 'Beirut',
      city: 'Hamra',
      landmarkAddress: 'Makdessi Street, Facing Plaza Hotel',
      phone: '01778899',
      assignedAreaRep: 'Hiba Aloulou',
    },
    {
      id: 'STORE-03',
      name: 'Al-Kheir Olive & Oil Center',
      region: 'South Lebanon',
      city: 'Saida',
      landmarkAddress: 'Riad El Solh Boulevard, Near Zaatari Mosque',
      phone: '07722334',
      assignedAreaRep: 'Hussein Mahdi',
    },
    {
      id: 'STORE-04',
      name: 'Byblos Green Grocers',
      region: 'Mount Lebanon',
      city: 'Jbeil / Byblos',
      landmarkAddress: 'Voie 13 Main Road',
      phone: '09540112',
      assignedAreaRep: 'Ahmad Ali Kassem',
    },
    {
      id: 'STORE-05',
      name: 'Bekaa Traditional Trading',
      region: 'Bekaa',
      city: 'Zahle',
      landmarkAddress: 'Zahle Boulevard, Near Berdawni Entrance',
      phone: '08812345',
      assignedAreaRep: 'Hussein Mahdi',
    },
    {
      id: 'STORE-06',
      name: 'Al-Mina Food & Oil Center',
      region: 'North Lebanon',
      city: 'Tripoli',
      landmarkAddress: 'Mina Port Road, Near Clock Tower',
      phone: '06432100',
      assignedAreaRep: 'Hiba Aloulou',
    },
    {
      id: 'STORE-07',
      name: 'Jezzine Traditional Store',
      region: 'South Lebanon',
      city: 'Jezzine',
      landmarkAddress: 'Main Souk Street',
      phone: '07780112',
      assignedAreaRep: 'Hussein Mahdi',
    },
  ]);

  // Copy Store Address Helper for Support Reps
  const handleCopyStoreAddress = (store: ReadOnlyDistributorStore) => {
    const textToCopy = `📍 You can find Southern Olive Oil Products S.A.R.L products at:\n🏪 ${store.name}\n📍 Location: ${store.city} - ${store.landmarkAddress} (${store.region})\n📞 Phone: ${store.phone}`;
    navigator.clipboard.writeText(textToCopy);
    alert(`Store location for "${store.name}" copied to clipboard! You can now paste it directly in the customer chat.`);
  };

  // CPL Campaigns Data
  const [campaignsData] = useState<AdCampaignCPL[]>([
    {
      id: 'CAMP-WA-01',
      name: 'Direct WhatsApp Promo: Harvest Season 2026 Special',
      channelPlatform: 'WhatsApp',
      targetAudiencePool: '104,850 Unified Contacts (Injected & Online)',
      spendUsd: 85.0,
      totalLeads: 194,
      cplUsd: 0.44,
      totalConversions: 56,
      totalRevenueUsd: 6240.0,
      status: 'Active Broadcast',
      pagesBreakdown: [
        { repName: 'Ahmad Ali Kassem', repCode: 'ADM-REP-01', pageHandle: 'WhatsApp Line 01 (Choueifat)', leadsGenerated: 110, conversions: 34, revenueUsd: 3820.0, contributionPct: 61.2 },
        { repName: 'Hiba Aloulou', repCode: 'ADM-REP-02', pageHandle: 'WhatsApp Line 02 (Beirut)', leadsGenerated: 84, conversions: 22, revenueUsd: 2420.0, contributionPct: 38.8 },
      ],
    },
    {
      id: 'CAMP-IG-01',
      name: 'Olive Oil Harvest Season 2026 Promo',
      channelPlatform: 'Instagram',
      targetAudiencePool: 'Instagram Feed & Reels Ad Traffic',
      spendUsd: 250.0,
      totalLeads: 185,
      cplUsd: 1.35,
      totalConversions: 42,
      totalRevenueUsd: 4850.0,
      status: 'Active Campaign',
      pagesBreakdown: [
        { repName: 'Ahmad Ali Kassem', repCode: 'ADM-REP-01', pageHandle: '@ahmad_southern_olive (Instagram)', leadsGenerated: 102, conversions: 25, revenueUsd: 2950.0, contributionPct: 60.8 },
        { repName: 'Hussein Mahdi', repCode: 'ADM-REP-03', pageHandle: '@hussein_oliveoillb (Instagram)', leadsGenerated: 83, conversions: 17, revenueUsd: 1900.0, contributionPct: 39.2 },
      ],
    },
  ]);

  // Outbound Items
  const [calendarItems, setCalendarItems] = useState<OutboundScheduleItem[]>([
    {
      id: 'PUB-01',
      type: 'SOCIAL_POST',
      title: 'Olive Harvest & Pressing Season 2026 Promo Video 🌿',
      mediaType: 'VIDEO',
      mediaUrl: 'https://southern-olive.com/videos/harvest-2026.mp4',
      fileName: 'harvest-2026.mp4',
      scheduledTime: 'Today (Ahmad: 6:00 PM | Hiba: 7:30 PM | Hussein: 9:00 PM)',
      targetChannelsSummary: 'Social Reps: Ahmad (IG, TT), Hiba (FB, TT), Hussein (All)',
      status: 'SCHEDULED',
    },
  ]);

  // Canned Replies State
  const [cannedReplies, setCannedReplies] = useState([
    { shortcut: '/prices', text: '17.5L Olive Oil Tin: $110 | Pomegranate Molasses: $6' },
    { shortcut: '/locations', text: 'Branches: Choueifat Main Highway | Beirut Branch' },
    { shortcut: '/delivery', text: 'Fast delivery across Lebanon with Cash or Whish Money on delivery.' },
  ]);
  const [newShortcut, setNewShortcut] = useState('');
  const [newCannedText, setNewCannedText] = useState('');

  // 1-Click Order State
  const [orderOffer, setOrderOffer] = useState('17.5L Olive Oil Tin + 2 Pomegranate Molasses');
  const [orderPayment, setOrderPayment] = useState<'COD' | 'WHISH'>('COD');

  // Unified Inbox State
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>({
    id: 'CHAT-01',
    senderName: 'Tarek El-Masri',
    senderPhone: '+96170889900',
    platform: 'WHATSAPP',
    lastMessage: 'Hello, where can I buy your olive oil in Saida or Beirut?',
    time: '5 mins ago',
    unreadCount: 1,
    assignedRep: 'Ahmad Ali Kassem',
    repCode: 'ADM-REP-01',
    isEscalatedToManagement: false,
  });
  const [replyMessage, setReplyMessage] = useState('');

  const conversations: ChatConversation[] = [
    {
      id: 'CHAT-01',
      senderName: 'Tarek El-Masri',
      senderPhone: '+96170889900',
      platform: 'WHATSAPP',
      lastMessage: 'Hello, where can I buy your olive oil in Saida or Beirut?',
      time: '12:45 PM',
      unreadCount: 1,
      assignedRep: 'Ahmad Ali Kassem',
      repCode: 'ADM-REP-01',
      isEscalatedToManagement: false,
    },
  ];

  const platformOrders: PlatformOrder[] = [
    {
      id: 'ORD-SO-9921',
      customerName: 'Fadi Khalil',
      phone: '03889900',
      platform: 'Landing Page (TikTok Ad)',
      offerDetails: '17.5L Olive Oil Tin + 2 Pomegranate Molasses',
      amountUsd: 125.0,
      paymentMethod: 'COD',
      repName: 'Ahmad Ali Kassem',
      repCode: 'ADM-REP-01',
      slaMinutesLeft: 35,
      status: 'PENDING_REP_APPROVAL',
    },
  ];

  const supportAgents: SupportAgentMetric[] = [
    {
      id: 'REP-01',
      name: 'Ahmad Ali Kassem',
      code: 'ADM-REP-01',
      activeChats: 14,
      totalOrders: 62,
      conversionRatePct: 24.5,
      avgResponseMins: 3.2,
      earnedCommissionUsd: 310.0,
      pages: [
        { platform: 'Instagram', pageName: '@ahmad_southern_olive', followers: '12.4K', ordersCount: 38 },
        { platform: 'TikTok', pageName: '@ahmad_oliveoillb', followers: '28.1K', ordersCount: 24 },
      ],
    },
  ];

  const handleAddNewCannedReply = () => {
    if (!newShortcut.trim() || !newCannedText.trim()) return;
    setCannedReplies((prev) => [...prev, { shortcut: newShortcut, text: newCannedText }]);
    setNewShortcut('');
    setNewCannedText('');
    setShowNewCannedModal(false);
  };

  const handleCreateOutboundSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) {
      alert('Please enter a title.');
      return;
    }

    const newItem: OutboundScheduleItem = {
      id: scheduleType === 'SOCIAL_POST' ? `PUB-0${calendarItems.length + 1}` : `PUB-WA-0${calendarItems.length + 1}`,
      type: scheduleType,
      title: itemTitle,
      mediaType,
      mediaUrl: uploadedFilePreview || undefined,
      fileName: uploadedFileName || undefined,
      scheduledTime: scheduleType === 'SOCIAL_POST'
        ? repSchedules.map((r) => `${r.repName.split(' ')[0]}: ${r.customScheduledTime.split('T') || r.customScheduledTime}`).join(' | ')
        : `${masterDateTime} (Paced Batch: ${waBatchSize} msgs/wave)`,
      targetChannelsSummary: scheduleType === 'SOCIAL_POST'
        ? repSchedules.map((r) => `${r.repName.split(' ')[0]} (${[r.instagram ? 'IG' : '', r.facebook ? 'FB' : '', r.tiktok ? 'TT' : ''].filter(Boolean).join(',')})`).join(' | ')
        : `Direct WhatsApp Broadcast (${unifiedCustomerCount.toLocaleString()} Unified Contacts)`,
      status: scheduleType === 'SOCIAL_POST' ? 'SCHEDULED' : 'QUEUED',
    };

    setCalendarItems((prev) => [newItem, ...prev]);
    alert(`Successfully scheduled "${itemTitle}"!`);
    setShowScheduleModal(false);
    setItemTitle('');
    setCopyText('');
  };

  // Filtered Read-Only Store List
  const filteredStores = distributorStores.filter((s) => {
    const matchesRegion = distRegionFilter === 'ALL' || s.region === distRegionFilter;
    const matchesSearch =
      distSearchQuery === '' ||
      s.name.toLowerCase().includes(distSearchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(distSearchQuery.toLowerCase()) ||
      s.landmarkAddress.toLowerCase().includes(distSearchQuery.toLowerCase()) ||
      s.phone.includes(distSearchQuery);
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans text-slate-800 text-left select-none">
      
      {/* 1. Master Header with STRICT NUMERICAL TAB ORDER (1 to 6) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Return to Dashboard"
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1a629b]"></span>
              <h1 className="text-[20px] font-bold text-[#1e293b] tracking-tight">
                Social Media Management Hub
              </h1>
            </div>
            <p className="text-xs text-[#527a9e] mt-0.5 font-medium">
              Southern Olive Oil Products S.A.R.L - Unified conversations, platform orders, publishing calendar, campaigns & CPL
            </p>
          </div>
        </div>

        {/* STRICT 1 TO 6 SEQUENTIAL TABS */}
        <div className="flex flex-wrap items-center bg-slate-200/80 p-1 rounded-xl gap-1">
          {[
            { id: 'inbox', label: '1. Unified Inbox' },
            { id: 'orders', label: '2. Platform Orders' },
            { id: 'calendar', label: '3. Publishing & WhatsApp Calendar' },
            { id: 'cpl', label: '4. Campaigns & CPL Analytics' },
            { id: 'agents', label: '5. Support Agents' },
            { id: 'distributors', label: '6. Distributors' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
      {/* 6. DISTRIBUTORS (READ-ONLY STORE DIRECTORY & INSTANT CHAT-COPY)     */}
      {/* =================================================================== */}
      {activeTab === 'distributors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">
                  Approved Store Partners & Distributors Directory (Read-Only Quick Lookup)
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#1a629b] border border-blue-200 rounded-full text-[10.5px] font-bold">
                  Support Representative Directory
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick lookup for support representatives to instantly find store locations across Lebanon and copy address to customers in chat
              </p>
            </div>
          </div>

          {/* Instant Search Bar & Regional Filter */}
          <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={distSearchQuery}
                onChange={(e) => setDistSearchQuery(e.target.value)}
                placeholder="🔍 Search store name, city, landmark, or phone number..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:border-[#1a629b] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Region:</span>
              <select
                value={distRegionFilter}
                onChange={(e) => setDistRegionFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#1a629b] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Lebanon Regions</option>
                <option value="Mount Lebanon">Mount Lebanon (Choueifat / Jbeil)</option>
                <option value="Beirut">Beirut (Hamra / Ashrafieh)</option>
                <option value="South Lebanon">South Lebanon (Saida / Jezzine)</option>
                <option value="Bekaa">Bekaa (Zahle)</option>
                <option value="North Lebanon">North Lebanon (Tripoli)</option>
              </select>
            </div>
          </div>

          {/* Read-Only Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">store / supermarket name</th>
                  <th className="py-2.5 px-3 normal-case">region</th>
                  <th className="py-2.5 px-3 normal-case">city & detailed address</th>
                  <th className="py-2.5 px-3 normal-case">phone</th>
                  <th className="py-2.5 px-3 normal-case">assigned area rep</th>
                  <th className="py-2.5 px-3 normal-case text-center w-40">action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1a629b]">{store.name}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{store.region}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">{store.city}</span> - {store.landmarkAddress}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{store.phone}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-semibold">{store.assignedAreaRep}</td>
                    
                    {/* Instant 1-Click Copy Address Button for Reps */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleCopyStoreAddress(store)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-bold text-[10.5px] transition-colors whitespace-nowrap flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <span>📋 Copy Address for Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. UNIFIED INBOX */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[650px]">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 flex flex-col h-full">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
              <h3 className="text-xs font-bold text-slate-700">Active Rep Chats ({conversations.length})</h3>
              <span className="text-[10px] text-[#1a629b] font-bold bg-blue-50 px-2 py-0.5 rounded-full">Management View</span>
            </div>
            <div className="overflow-y-auto space-y-1.5 flex-1 custom-scrollbar">
              {conversations.map((c) => (
                <div key={c.id} onClick={() => setSelectedChat(c)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedChat?.id === c.id ? 'bg-blue-50/70 border-[#1a629b]' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{c.senderName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 line-clamp-1">{c.lastMessage}</p>
                  <div className="flex items-center justify-between pt-1 mt-1 text-[10px] text-slate-500 border-t border-slate-200/50">
                    <span className="font-bold text-[#1a629b]">{c.platform}</span>
                    {c.isEscalatedToManagement ? <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">Pushed to Management</span> : <span>Rep: {c.assignedRep} (Read-Only)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col h-full">
            {selectedChat ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>{selectedChat.senderName}</span>
                      {selectedChat.isEscalatedToManagement ? (
                        <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          ⚠️ Pushed to Management (1-Hr SLA Expired)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          🔒 Rep Active ({selectedChat.assignedRep}) - Management Read-Only
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{selectedChat.senderPhone} | {selectedChat.platform}</div>
                  </div>

                  {selectedChat.isEscalatedToManagement ? (
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      + Create 1-Click ERP Order
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-400 border border-slate-300 rounded-xl text-xs font-bold cursor-not-allowed select-none"
                    >
                      🔒 Locked to Rep (Read-Only)
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8fafc] rounded-xl my-3 custom-scrollbar">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-xs shadow-2xs">
                    <div className="font-bold text-[#1a629b] mb-1">{selectedChat.senderName}</div>
                    <p>{selectedChat.lastMessage}</p>
                    <div className="text-[9px] text-slate-400 font-mono mt-1">{selectedChat.time}</div>
                  </div>
                  <div className="bg-[#1a629b] text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] ml-auto text-xs shadow-2xs">
                    <div className="font-bold text-amber-300 mb-1">{selectedChat.assignedRep} (Sales Rep)</div>
                    <p>Hello! The 17.5L Extra Virgin Olive Oil cold-pressed tin is $110, with delivery available to Beirut.</p>
                    <div className="text-[9px] text-slate-200 font-mono mt-1 text-right">12:47 PM ✓✓</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input type="text" disabled={!selectedChat.isEscalatedToManagement} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder={selectedChat.isEscalatedToManagement ? 'Type management reply...' : 'Management Read-Only (Rep is handling chat)...'} className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-[#1a629b] focus:outline-none disabled:bg-slate-100" />
                  <button type="button" disabled={!selectedChat.isEscalatedToManagement} onClick={() => { setReplyMessage(''); alert('Sent.'); }} className="px-5 py-2 bg-[#1a629b] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer">Send</button>
                </div>
              </>
            ) : <div className="flex items-center justify-center h-full text-xs text-slate-400">Select a chat</div>}
          </div>
        </div>
      )}

      {/* 2. PLATFORM ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Platform & Landing Page Orders</h2>
            <span className="text-xs text-[#1a629b] font-bold">Southern Olive Oil Products S.A.R.L</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">order id</th>
                  <th className="py-2.5 px-3 normal-case">customer & phone</th>
                  <th className="py-2.5 px-3 normal-case">platform</th>
                  <th className="py-2.5 px-3 normal-case">offer</th>
                  <th className="py-2.5 px-3 normal-case text-center">payment method</th>
                  <th className="py-2.5 px-3 normal-case text-center">amount ($)</th>
                  <th className="py-2.5 px-3 normal-case">rep</th>
                  <th className="py-2.5 px-3 normal-case text-center">1-hour sla</th>
                  <th className="py-2.5 px-3 normal-case text-center">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {platformOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#1a629b]">{ord.id}</td>
                    <td className="py-2.5 px-3 font-bold">{ord.customerName} <span className="font-mono text-slate-500 block text-[10px]">{ord.phone}</span></td>
                    <td className="py-2.5 px-3 text-slate-600">{ord.platform}</td>
                    <td className="py-2.5 px-3">{ord.offerDetails}</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {ord.paymentMethod === 'COD' ? <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px]">Cash on Delivery (COD)</span> : <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px]">Whish on Delivery</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">${ord.amountUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3">{ord.repName}</td>
                    <td className="py-2.5 px-3 text-center">{ord.status === 'PENDING_REP_APPROVAL' ? <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10.5px]">⏳ {ord.slaMinutesLeft}m</span> : <span className="text-slate-400 font-mono text-[10px]">Completed</span>}</td>
                    <td className="py-2.5 px-3 text-center">{ord.status === 'APPROVED' ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Approved ✓</span> : <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">Pending Rep</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PUBLISHING CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Omnichannel Publishing Calendar & Outbound Hub</h2>
              <p className="text-xs text-slate-500">Schedule social media posts per rep and deploy direct WhatsApp broadcasts</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setScheduleType('SOCIAL_POST'); setShowScheduleModal(true); }} className="px-4 py-2 bg-[#1a629b] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer">+ Schedule Social Post</button>
              <button type="button" onClick={() => { setScheduleType('WHATSAPP_BROADCAST'); setShowScheduleModal(true); }} className="px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer">+ Schedule WhatsApp Broadcast</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calendarItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10.5px] font-bold text-[#1a629b]">{item.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'WHATSAPP_BROADCAST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{item.type === 'WHATSAPP_BROADCAST' ? '💬 WhatsApp' : '📱 Social'}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                </div>
                <div className="text-[11px] text-slate-500 font-mono border-t pt-2">{item.scheduledTime}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CAMPAIGNS & CPL */}
      {activeTab === 'cpl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Ad Campaigns & CPL Analytics (Click Header to Toggle)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any campaign row to view per-page contribution share (%)</p>
          </div>
          <div className="space-y-3">
            {campaignsData.map((camp) => {
              const isExpanded = expandedCampaignIds.includes(camp.id);
              return (
                <div key={camp.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div onClick={() => toggleCampaignAccordion(camp.id)} className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{camp.name}</span>
                      <span className="px-2 py-0.5 bg-white text-[#1a629b] rounded text-[10.5px] font-bold border border-slate-200">{camp.channelPlatform}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span>Spend: ${camp.spendUsd.toFixed(2)}</span>
                      <span className="text-emerald-600 font-bold">CPL: ${camp.cplUsd.toFixed(2)}</span>
                      <span className="text-[#1a629b] font-bold">Revenue: ${camp.totalRevenueUsd.toFixed(2)}</span>
                      <span className="text-slate-400 font-bold">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                            <th className="py-2 px-3 normal-case w-1/3">sales rep & page handle</th>
                            <th className="py-2 px-3 normal-case text-center">leads</th>
                            <th className="py-2 px-3 normal-case text-center">orders</th>
                            <th className="py-2 px-3 normal-case text-center">revenue ($)</th>
                            <th className="py-2 px-3 normal-case text-center w-52">contribution (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                          {camp.pagesBreakdown.map((page, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-bold">{page.repName} <span className="font-mono text-[#1a629b] block text-[11px]">{page.pageHandle}</span></td>
                              <td className="py-2 px-3 text-center font-mono">{page.leadsGenerated}</td>
                              <td className="py-2 px-3 text-center font-mono">{page.conversions}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-[#1a629b]">${page.revenueUsd.toFixed(2)}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">{page.contributionPct.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SUPPORT AGENTS */}
      {activeTab === 'agents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Support Agents Performance</h2>
            <span className="text-xs text-slate-500 font-mono">Southern Olive Oil Products S.A.R.L</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 normal-case">rep name</th>
                  <th className="py-2.5 px-3 normal-case">admin code</th>
                  <th className="py-2.5 px-3 normal-case text-center">active chats</th>
                  <th className="py-2.5 px-3 normal-case text-center">total orders</th>
                  <th className="py-2.5 px-3 normal-case text-center">conversion rate</th>
                  <th className="py-2.5 px-3 normal-case text-center">avg response time</th>
                  <th className="py-2.5 px-3 normal-case text-center">earned commission ($)</th>
                  <th className="py-2.5 px-3 normal-case text-center">social pages breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                {supportAgents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold">{ag.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#1a629b] font-bold">{ag.code}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{ag.activeChats}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{ag.totalOrders}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">{ag.conversionRatePct}%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{ag.avgResponseMins} mins</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#1a629b]">${ag.earnedCommissionUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button type="button" onClick={() => setSelectedAgentDrilldown(ag)} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1a629b] font-bold rounded text-[11px] cursor-pointer">View Pages ({ag.pages.length})</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1-CLICK ORDER MODAL */}
      {showOrderModal && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
            <div className="bg-[#1e232d] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold">1-Click ERP Order Creation (Management Takeover)</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div><label className="block font-bold text-slate-700 mb-0.5">Customer Name</label><input type="text" readOnly value={selectedChat.senderName} className="w-full px-2.5 py-1.5 bg-slate-100 border rounded font-bold" /></div>
              <div><label className="block font-bold text-slate-700 mb-0.5">Phone</label><input type="text" readOnly value={selectedChat.senderPhone} className="w-full px-2.5 py-1.5 bg-slate-100 border rounded font-mono" /></div>
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Offer / Items</label>
                <select value={orderOffer} onChange={(e) => setOrderOffer(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium">
                  <option value="17.5L Olive Oil Tin + 2 Pomegranate Molasses">17.5L Olive Oil Tin + 2 Pomegranate Molasses ($125)</option>
                  <option value="2 Tins Extra Virgin Olive Oil">2 Tins Extra Virgin Olive Oil ($220)</option>
                  <option value="Traditional Food Preserves Pack">Traditional Food Preserves Pack ($45)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <label className={`p-2 border rounded-lg flex items-center justify-between cursor-pointer ${orderPayment === 'COD' ? 'border-[#1a629b] bg-blue-50/50' : 'border-slate-200'}`}><span className="font-bold text-xs">Cash on Delivery</span><input type="radio" checked={orderPayment === 'COD'} onChange={() => setOrderPayment('COD')} className="accent-[#1a629b]" /></label>
                  <label className={`p-2 border rounded-lg flex items-center justify-between cursor-pointer ${orderPayment === 'WHISH' ? 'border-[#1a629b] bg-blue-50/50' : 'border-slate-200'}`}><span className="font-bold text-xs">Whish on Delivery</span><input type="radio" checked={orderPayment === 'WHISH'} onChange={() => setOrderPayment('WHISH')} className="accent-[#1a629b]" /></label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t"><button onClick={() => setShowOrderModal(false)} className="px-3 py-1.5 border rounded font-bold cursor-pointer">Cancel</button><button onClick={() => { alert('Order created'); setShowOrderModal(false); }} className="px-4 py-1.5 bg-[#1a629b] text-white font-bold rounded cursor-pointer">Save Order</button></div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left my-6">
            <div className={`px-5 py-3.5 text-white flex items-center justify-between ${
              scheduleType === 'WHATSAPP_BROADCAST' ? 'bg-[#075e54]' : 'bg-[#1e232d]'
            }`}>
              <h3 className="text-xs font-bold">
                {scheduleType === 'WHATSAPP_BROADCAST' ? 'Schedule Direct WhatsApp Broadcast' : 'Schedule Social Post (Browse Image/Video)'}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-300 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateOutboundSchedule} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div><label className="block font-bold text-slate-700 mb-1">Title *</label><input type="text" required value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Title..." className="w-full px-3 py-2 border rounded-lg font-bold" /></div>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Media Attachment (Browse Local Files):</label>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => { setMediaType('IMAGE'); setUploadedFileName(null); setUploadedFilePreview(null); }} className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${mediaType === 'IMAGE' ? 'bg-[#1a629b] text-white' : 'bg-slate-200'}`}>🖼️ Image</button>
                    <button type="button" onClick={() => { setMediaType('VIDEO'); setUploadedFileName(null); setUploadedFilePreview(null); }} className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${mediaType === 'VIDEO' ? 'bg-[#1a629b] text-white' : 'bg-slate-200'}`}>🎥 Video</button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} accept={mediaType === 'IMAGE' ? 'image/*' : 'video/*'} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUploadedFileName(f.name); setUploadedFilePreview(URL.createObjectURL(f)); } }} className="hidden" />
                {!uploadedFileName ? (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-white border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1a629b]">
                    <div className="font-bold text-[#1a629b]">Click to browse {mediaType === 'IMAGE' ? 'an Image' : 'a Video'} from computer</div>
                  </div>
                ) : (
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{uploadedFileName} ✓</span>
                    <button type="button" onClick={() => { setUploadedFileName(null); setUploadedFilePreview(null); }} className="text-red-500 font-bold cursor-pointer">✕ Remove</button>
                  </div>
                )}
              </div>

              <div><label className="block font-bold text-slate-700 mb-1">Message Body</label><textarea rows={3} value={copyText} onChange={(e) => setCopyText(e.target.value)} placeholder="Type copy text..." className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t"><button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 border rounded font-bold cursor-pointer">Cancel</button><button type="submit" className="px-5 py-2 bg-[#1a629b] text-white font-bold rounded cursor-pointer">Schedule</button></div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CANNED REPLY MODAL */}
      {showNewCannedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
            <div className="bg-[#1e232d] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold">Add New Canned Quick Reply</h3>
              <button onClick={() => setShowNewCannedModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div><label className="block font-bold text-slate-700 mb-0.5">Shortcut Tag</label><input type="text" value={newShortcut} onChange={(e) => setNewShortcut(e.target.value)} placeholder="/shortcut" className="w-full px-2.5 py-1.5 border rounded font-mono font-bold text-[#1a629b]" /></div>
              <div><label className="block font-bold text-slate-700 mb-0.5">Message Text</label><textarea rows={3} value={newCannedText} onChange={(e) => setNewCannedText(e.target.value)} placeholder="Type reply..." className="w-full px-2.5 py-1.5 border rounded" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t"><button onClick={() => setShowNewCannedModal(false)} className="px-3 py-1.5 border rounded font-bold cursor-pointer">Cancel</button><button onClick={handleAddNewCannedReply} className="px-4 py-1.5 bg-[#1a629b] text-white font-bold rounded cursor-pointer">Save</button></div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT DRILLDOWN MODAL */}
      {selectedAgentDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
            <div className="bg-[#1e232d] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold">Social Pages Breakdown: {selectedAgentDrilldown.name} ({selectedAgentDrilldown.code})</h3>
              <button onClick={() => setSelectedAgentDrilldown(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                    <th className="py-2 px-2.5 normal-case">platform</th>
                    <th className="py-2 px-2.5 normal-case">page / handle</th>
                    <th className="py-2 px-2.5 normal-case text-center">audience</th>
                    <th className="py-2 px-2.5 normal-case text-center">orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedAgentDrilldown.pages.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2.5 font-bold text-[#1a629b]">{p.platform}</td>
                      <td className="py-2 px-2.5 font-mono">{p.pageName}</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-700">{p.followers}</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600">{p.ordersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedAgentDrilldown(null)} className="px-4 py-1.5 bg-slate-800 text-white rounded font-bold cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
