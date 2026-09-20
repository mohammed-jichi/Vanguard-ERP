'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SocialCrmReportsHub from '@/app/backoffice/social-crm/reports/page';
import { FleetSocialIntegrationService } from '@/lib/fleetSocialIntegrationService';
import {
  OnlinePlatformOrder,
  OnlineOrderStatus,
  PaymentCollectionMethod,
  VanguardInventoryStock,
  DeliveryNote,
} from '@/types/fleet-social-integration';

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

export type { OnlinePlatformOrder };

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
  initialTab?: 'inbox' | 'orders' | 'calendar' | 'cpl' | 'agents' | 'distributors' | 'reports';
  onBack?: () => void;
}

export default function SocialMediaManagementHub({
  initialTab = 'distributors',
  onBack,
}: SocialMediaManagementHubProps = {}) {
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get('tab') as any;

  // STRICT NUMERICAL TAB ORDER (1 to 7)
  const [activeTab, setActiveTab] = useState<
    'inbox' | 'orders' | 'calendar' | 'cpl' | 'agents' | 'distributors' | 'reports'
  >(urlTab || initialTab || 'distributors');

  const [selectedReportKey, setSelectedReportKey] = useState<
    'SOCIAL_ORDERS' | 'CAMPAIGN_CPL' | 'AGENT_PERFORMANCE'
  >('SOCIAL_ORDERS');

  const [selectedSocialReport, setSelectedSocialReport] = useState<string>(
    'Omnichannel Social Orders & Conversion Reconciliation'
  );
  const [socialPeriod, setSocialPeriod] = useState<string>('This Month');
  const [socialBranch, setSocialBranch] = useState<string>('Main Branch');
  const [socialPlatformFilter, setSocialPlatformFilter] = useState<string>('ALL');
  const [socialRepFilter, setSocialRepFilter] = useState<string>('ALL');

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [urlTab, initialTab]);

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

  // 1-Click Order & Management Override State
  const [orderOffer, setOrderOffer] = useState('17.5L Olive Oil Tin + 2 Pomegranate Molasses');
  const [orderPayment, setOrderPayment] = useState<'COD' | 'WHISH'>('COD');
  const [overrideItemId, setOverrideItemId] = useState('inv-item-01');
  const [overrideQty, setOverrideQty] = useState(1);
  const [overrideCorridorId, setOverrideCorridorId] = useState(1);
  const [overrideTown, setOverrideTown] = useState('بيروت - الحمرا (Hamra)');
  const [overrideAddress, setOverrideAddress] = useState('شارع السادات، بناية النور');
  const [overridePaymentMethod, setOverridePaymentMethod] = useState<'COD' | 'WHISH'>('COD');

  const handleManagementOverrideOrder = () => {
    if (!selectedChat) return;
    const inv = inventoryStocks.find((i) => i.id === overrideItemId) || inventoryStocks[0];
    const unitPrice = (inv as any).unit_price_usd || (overrideItemId === 'inv-item-01' ? 100 : 10);
    const totalProductUsd = unitPrice * overrideQty;
    const totalProductLbp = totalProductUsd * 90000;
    const deliveryFeeUsd = 4.0;

    const preset = corridorPresets.find((c) => c.id === overrideCorridorId) || corridorPresets[0];

    const newOrder = FleetSocialIntegrationService.createPlatformOrder({
      channel: selectedChat.platform === 'WHATSAPP' ? 'whatsapp' : 'social_media',
      external_chat_id: selectedChat.id,
      customer_name: selectedChat.senderName,
      customer_phone: selectedChat.senderPhone,
      destination_town: overrideTown,
      delivery_address: overrideAddress,
      corridor_id: overrideCorridorId,
      payment_method: overridePaymentMethod,
      product_amount_usd: totalProductUsd,
      product_amount_lbp: totalProductLbp,
      delivery_fee_usd: deliveryFeeUsd,
      rep_name: selectedChat.assignedRep,
      rep_code: selectedChat.repCode,
      sla_minutes_left: 60,
      order_status: 'approved',
      assigned_driver_name: preset.driver,
      assigned_vehicle_plate: preset.plate,
      items: [
        {
          id: `item-${Date.now()}`,
          order_id: '',
          item_id: inv.id,
          item_name: inv.item_name,
          quantity: overrideQty,
          unit_price_usd: unitPrice,
          total_price_usd: totalProductUsd,
        },
      ],
    });

    // Reserve stock immediately
    inv.qty_reserved += overrideQty;
    inv.available_stock = Math.max(0, inv.vanguard_stock - inv.qty_reserved);

    refreshOrdersAndInventory();
    setShowOrderModal(false);
    alert(
      `✓ Management Override Executed!\n- Chat with "${selectedChat.senderName}" converted into Approved Order #${newOrder.order_number}.\n- Queued to Corridor ${overrideCorridorId} (${preset.name}) with Driver ${preset.driver}.\n- Stock reserved (${overrideQty} units held in inventory).`
    );
  };

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

  // ==========================================================================
  // SUPERSONIC FLEET & SOCIAL CRM INTEGRATION STATE
  // ==========================================================================
  const [platformOrders, setPlatformOrders] = useState<OnlinePlatformOrder[]>(() =>
    FleetSocialIntegrationService.getPlatformOrders()
  );

  const [inventoryStocks, setInventoryStocks] = useState<VanguardInventoryStock[]>(() =>
    FleetSocialIntegrationService.getInventoryWithReservations()
  );

  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | OnlineOrderStatus>('ALL');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<OnlinePlatformOrder | null>(null);
  const [selectedOrderForPOD, setSelectedOrderForPOD] = useState<OnlinePlatformOrder | null>(null);
  const [selectedNoteView, setSelectedNoteView] = useState<DeliveryNote | null>(null);

  const [dispatchCorridorId, setDispatchCorridorId] = useState<number>(1);
  const [dispatchDriverName, setDispatchDriverName] = useState<string>('Tony Khoury');
  const [dispatchVehiclePlate, setDispatchVehiclePlate] = useState<string>('B-492102');

  const [podRecipientName, setPodRecipientName] = useState<string>('');
  const [podPaymentMethod, setPodPaymentMethod] = useState<PaymentCollectionMethod>('COD');
  const [podCollectedUsd, setPodCollectedUsd] = useState<number>(0);
  const [podCollectedLbp, setPodCollectedLbp] = useState<number>(0);
  const [podNotes, setPodNotes] = useState<string>('');

  const refreshOrdersAndInventory = () => {
    setPlatformOrders([...FleetSocialIntegrationService.getPlatformOrders()]);
    setInventoryStocks([...FleetSocialIntegrationService.getInventoryWithReservations()]);
  };

  const handleApproveOrder = (orderId: string) => {
    const res = FleetSocialIntegrationService.approveOrder(orderId);
    if (res.success) {
      alert(res.message);
      refreshOrdersAndInventory();
    } else {
      alert(res.message);
    }
  };

  const handleMoveToPos = (orderId: string) => {
    const res = FleetSocialIntegrationService.routeToPosPickup(orderId, {
      actorCode: 'REP-002',
      actorName: 'Ahmad Ali Kassem',
    });
    if (res.success) {
      alert(res.message);
      refreshOrdersAndInventory();
    }
  };

  const handleEscalateOrder = (orderId: string) => {
    const res = FleetSocialIntegrationService.escalateToManagement(
      orderId,
      'Client requested specialized bulk pricing & custom delivery schedule'
    );
    if (res.success) {
      alert(res.message);
      refreshOrdersAndInventory();
    }
  };

  const handleRejectOrder = (orderId: string) => {
    const res = FleetSocialIntegrationService.rejectOrder(orderId, 'Client canceled after phone verification');
    if (res.success) {
      alert(res.message);
      refreshOrdersAndInventory();
    }
  };

  const handleConfirmDispatch = () => {
    if (!selectedOrderForDispatch) return;
    const res = FleetSocialIntegrationService.dispatchToFleet(selectedOrderForDispatch.id, {
      corridorId: dispatchCorridorId,
      driverName: dispatchDriverName,
      vehiclePlate: dispatchVehiclePlate,
      status: 'queued',
    });
    if (res.success) {
      alert(res.message);
      setSelectedOrderForDispatch(null);
      refreshOrdersAndInventory();
    }
  };

  const handleOpenPODModal = (order: OnlinePlatformOrder) => {
    setSelectedOrderForPOD(order);
    setPodRecipientName(order.customer_name);
    setPodPaymentMethod(order.payment_method);
    setPodCollectedUsd(order.product_amount_usd + order.delivery_fee_usd);
    setPodCollectedLbp(order.product_amount_lbp);
    setPodNotes(`Delivered via SuperSonic Corridor ${order.corridor_id}`);
  };

  const handleConfirmPOD = () => {
    if (!selectedOrderForPOD) return;
    const svgSignature = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 40"><path d="M10 20 Q 30 5 50 20 T 90 20" stroke="black" fill="none"/></svg>`;
    const res = FleetSocialIntegrationService.confirmDelivery(selectedOrderForPOD.id, {
      recipientName: podRecipientName,
      paymentMethod: podPaymentMethod,
      collectedUsd: podCollectedUsd,
      collectedLbp: podCollectedLbp,
      signatureSvg: svgSignature,
      notes: podNotes,
    });
    if (res.success) {
      alert(res.message);
      setSelectedOrderForPOD(null);
      refreshOrdersAndInventory();
    }
  };

  const corridorPresets = [
    { id: 1, name: 'Corridor 1: Greater Beirut & Coast', driver: 'Tony Khoury', plate: 'B-492102' },
    { id: 2, name: 'Corridor 2: Mount Lebanon & Chouf', driver: 'Fadi Abou Assi', plate: 'G-183921' },
    { id: 3, name: 'Corridor 3: Southern Coast & Deep South', driver: 'Hassan Sleiman', plate: 'S-772910' },
    { id: 4, name: 'Corridor 4: Northern Coast to Batroun', driver: 'Charbel Rahme', plate: 'B-554433' },
    { id: 5, name: 'Corridor 5: Tripoli & Akkar', driver: 'Khaled Merhi', plate: 'T-882211' },
    { id: 6, name: 'Corridor 6: Bekaa & South-East', driver: 'Elie Matar', plate: 'B-310928' },
    { id: 7, name: 'Corridor 7: North Bekaa (Baalbek)', driver: 'Ali Chamas', plate: 'K-991100' },
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
    {
      id: 'REP-02',
      name: 'Hiba Aloulou',
      code: 'ADM-REP-02',
      activeChats: 19,
      totalOrders: 78,
      conversionRatePct: 27.1,
      avgResponseMins: 2.8,
      earnedCommissionUsd: 390.0,
      pages: [
        { platform: 'WhatsApp', pageName: 'Line 02 (Beirut Central)', followers: '45.2K', ordersCount: 46 },
        { platform: 'Facebook', pageName: 'Southern Olive Oil LB Official', followers: '34.8K', ordersCount: 32 },
      ],
    },
    {
      id: 'REP-03',
      name: 'Hussein Mahdi',
      code: 'ADM-REP-03',
      activeChats: 11,
      totalOrders: 45,
      conversionRatePct: 21.8,
      avgResponseMins: 4.1,
      earnedCommissionUsd: 225.0,
      pages: [
        { platform: 'Instagram', pageName: '@hussein_oliveoillb', followers: '15.6K', ordersCount: 28 },
        { platform: 'Facebook', pageName: 'South Lebanon Regional Page', followers: '18.3K', ordersCount: 17 },
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
    <div className="w-full min-h-screen bg-background p-4 md:p-6 font-sans text-foreground text-left select-none">
      
      {/* 1. Master Header with STRICT NUMERICAL TAB ORDER (1 to 6) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-border gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Return to Dashboard"
              className="p-2 bg-card hover:bg-muted border border-border rounded-xl text-foreground hover:text-primary transition-colors shadow-2xs cursor-pointer"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <h1 className="text-[20px] font-bold text-foreground tracking-tight">
                9. Social CRM &amp; Support Management Hub
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Southern Olive Oil Products S.A.R.L - Unified conversations, platform orders, publishing calendar, campaigns & CPL
            </p>
          </div>
        </div>

        {/* STRICT 1 TO 7 SEQUENTIAL TABS */}
        <div className="flex flex-wrap items-center bg-muted p-1 rounded-xl gap-1">
          {[
            { id: 'inbox', label: '1. Unified Inbox' },
            { id: 'orders', label: '2. Platform Orders' },
            { id: 'calendar', label: '3. Publishing & WhatsApp Calendar' },
            { id: 'cpl', label: '4. Campaigns & CPL Analytics' },
            { id: 'agents', label: '5. Support Agents' },
            { id: 'distributors', label: '6. Distributors' },
            { id: 'reports', label: '7. Reports Hub' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
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
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10.5px] font-bold">
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Region:</span>
              <select
                value={distRegionFilter}
                onChange={(e) => setDistRegionFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-primary focus:outline-none cursor-pointer"
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
                    <td className="py-2.5 px-3 font-bold text-primary">{store.name}</td>
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
              <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">Management View</span>
            </div>
            <div className="overflow-y-auto space-y-1.5 flex-1 custom-scrollbar">
              {conversations.map((c) => (
                <div key={c.id} onClick={() => setSelectedChat(c)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedChat?.id === c.id ? 'bg-primary/5 border-primary' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{c.senderName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 line-clamp-1">{c.lastMessage}</p>
                  <div className="flex items-center justify-between pt-1 mt-1 text-[10px] text-slate-500 border-t border-slate-200/50">
                    <span className="font-bold text-primary">{c.platform}</span>
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(true)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>⚡ Override &amp; Convert to Order</span>
                    </button>
                    {!selectedChat.isEscalatedToManagement && (
                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                        (Rep active: {selectedChat.assignedRep})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30 rounded-xl my-3 custom-scrollbar">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-xs shadow-2xs">
                    <div className="font-bold text-primary mb-1">{selectedChat.senderName}</div>
                    <p>{selectedChat.lastMessage}</p>
                    <div className="text-[9px] text-slate-400 font-mono mt-1">{selectedChat.time}</div>
                  </div>
                  <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none max-w-[80%] ml-auto text-xs shadow-2xs">
                    <div className="font-bold text-amber-300 mb-1">{selectedChat.assignedRep} (Sales Rep)</div>
                    <p>Hello! The 17.5L Extra Virgin Olive Oil cold-pressed tin is $110, with delivery available to Beirut.</p>
                    <div className="text-[9px] text-slate-200 font-mono mt-1 text-right">12:47 PM ✓✓</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input type="text" disabled={!selectedChat.isEscalatedToManagement} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder={selectedChat.isEscalatedToManagement ? 'Type management reply...' : 'Management Read-Only (Rep is handling chat)...'} className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:border-primary focus:outline-none disabled:bg-slate-100" />
                  <button type="button" disabled={!selectedChat.isEscalatedToManagement} onClick={() => { setReplyMessage(''); alert('Sent.'); }} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer">Send</button>
                </div>
              </>
            ) : <div className="flex items-center justify-center h-full text-xs text-slate-400">Select a chat</div>}
          </div>
        </div>
      )}

      {/* 2. PLATFORM ORDERS (SUPERSONIC FLEET & SOCIAL CRM INTEGRATION) */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {/* A. Inventory Reservation & Double-Selling Shield Monitor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 md:p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm">🛡️</span>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Vanguard Inventory Reservation Engine (Double-Selling Shield)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automatic stock reservation via <code className="font-mono text-blue-700 font-bold">process_vanguard_invoice_stock()</code> trigger logic. Physical stock is protected until POD confirmation or cancellation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={refreshOrdersAndInventory}
                className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors self-start md:self-auto cursor-pointer"
              >
                🔄 Refresh Inventory &amp; Orders
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {inventoryStocks.map((stock) => (
                <div key={stock.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{stock.packaging_type}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stock.available_stock > stock.min_threshold
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {stock.available_stock > stock.min_threshold ? 'In Stock' : 'Low Stock'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-1" title={stock.item_name}>
                      {stock.item_name}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Physical Stock:</span>
                      <strong className="text-slate-900">{stock.vanguard_stock} units</strong>
                    </div>
                    <div className="flex justify-between text-amber-700 font-semibold">
                      <span>Reserved (Held):</span>
                      <strong>{stock.qty_reserved} units</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold border-t border-dashed border-slate-300 pt-1">
                      <span>Safe to Sell:</span>
                      <span>{stock.available_stock} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Orders Table & Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Unified Platform Orders (Social CRM ➔ SuperSonic Fleet)</h2>
                <p className="text-xs text-slate-500">
                  Tracking orders across WhatsApp, Social Media, Website &amp; Direct SuperSonic dispatches.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { key: 'ALL', label: 'All Orders' },
                  { key: 'pending_rep_approval', label: '⏳ Pending Rep' },
                  { key: 'approved', label: '✓ Approved' },
                  { key: 'queued', label: '📋 Queued' },
                  { key: 'on_route', label: '🚚 On Route' },
                  { key: 'delivered', label: '✅ Delivered' },
                  { key: 'moved_to_pos_pickup', label: '🏪 POS Pickup' },
                  { key: 'escalated_to_management', label: '⚠️ Escalated' },
                  { key: 'rejected', label: '✕ Rejected' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setOrderStatusFilter(f.key as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                      orderStatusFilter === f.key
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 normal-case">order # &amp; channel</th>
                    <th className="py-2.5 px-3 normal-case">customer &amp; phone</th>
                    <th className="py-2.5 px-3 normal-case">destination &amp; corridor</th>
                    <th className="py-2.5 px-3 normal-case">items / reserved</th>
                    <th className="py-2.5 px-3 normal-case text-center">payment</th>
                    <th className="py-2.5 px-3 normal-case text-right">amount ($)</th>
                    <th className="py-2.5 px-3 normal-case">rep &amp; sla</th>
                    <th className="py-2.5 px-3 normal-case text-center">status</th>
                    <th className="py-2.5 px-3 normal-case text-center">lifecycle action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-[11.5px]">
                  {platformOrders
                    .filter((ord) => orderStatusFilter === 'ALL' || ord.order_status === orderStatusFilter)
                    .map((ord) => {
                      const channelBadge = {
                        whatsapp: { label: '💬 WhatsApp', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                        social_media: { label: '📱 Social Media', color: 'bg-blue-50 text-blue-800 border-blue-200' },
                        supersonic: { label: '⚡ SuperSonic', color: 'bg-amber-50 text-amber-800 border-amber-200' },
                        website: { label: '🌐 Web Store', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                      }[ord.channel] || { label: ord.channel, color: 'bg-slate-100 text-slate-700 border-slate-200' };

                      const statusBadge = {
                        pending_rep_approval: { label: '⏳ Pending Rep', color: 'bg-amber-100 text-amber-900 border-amber-200' },
                        approved: { label: '✓ Approved & Reserved', color: 'bg-blue-100 text-blue-900 border-blue-200' },
                        queued: { label: '📋 Queued to Fleet', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
                        on_route: { label: '🚚 On Route', color: 'bg-cyan-100 text-cyan-900 border-cyan-200' },
                        delivered: { label: '✅ Delivered & POD', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
                        moved_to_pos_pickup: { label: '🏪 Showroom Pickup', color: 'bg-purple-100 text-purple-900 border-purple-200' },
                        escalated_to_management: { label: '⚠️ Escalated', color: 'bg-rose-100 text-rose-900 border-rose-200' },
                        rejected: { label: '✕ Rejected', color: 'bg-slate-200 text-slate-700 border-slate-300' },
                      }[ord.order_status] || { label: ord.order_status, color: 'bg-slate-100 text-slate-800 border-slate-200' };

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-primary block">{ord.order_number}</span>
                            <span className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[10px] font-bold border ${channelBadge.color}`}>
                              {channelBadge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <strong className="text-slate-900 block">{ord.customer_name}</strong>
                            <span className="font-mono text-slate-500 block text-[10.5px]">{ord.customer_phone}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <strong className="text-slate-800 block text-xs">{ord.destination_town}</strong>
                            <span className="text-[10px] text-slate-500 font-mono block max-w-[180px] truncate" title={ord.delivery_address}>
                              {ord.delivery_address}
                            </span>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[9.5px] font-mono font-bold text-slate-600">
                              Corridor {ord.corridor_id}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {ord.items && ord.items.length > 0 ? (
                              <div className="space-y-0.5">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-700">
                                    <strong className="text-slate-900">{it.quantity}x</strong> {it.item_name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Standard Offer</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {ord.payment_method === 'COD' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                COD (Cash)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px]">
                                Whish Money
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <span className="font-bold text-slate-900 block">${ord.product_amount_usd.toFixed(2)}</span>
                            {ord.delivery_fee_usd > 0 && (
                              <span className="text-[10px] text-blue-700 block">+${ord.delivery_fee_usd.toFixed(2)} fee</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-slate-800 font-semibold block">{ord.rep_name || 'Direct'}</span>
                            {ord.order_status === 'pending_rep_approval' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 font-mono">
                                ⏳ {ord.sla_minutes_left}m SLA left
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">SLA Verified</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                            {ord.assigned_driver_name && (
                              <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5">
                                🚗 {ord.assigned_driver_name}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex flex-wrap items-center justify-center gap-1">
                              {/* If Pending Rep: Approve & Reserve, Escalate, Reject */}
                              {ord.order_status === 'pending_rep_approval' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveOrder(ord.id)}
                                    title="Approve Order & Reserve Physical Inventory"
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10.5px] shadow-2xs transition-colors cursor-pointer"
                                  >
                                    ✓ Approve &amp; Reserve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEscalateOrder(ord.id)}
                                    title="Escalate to Management"
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded text-[10.5px] transition-colors cursor-pointer"
                                  >
                                    ⚠️ Escalate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectOrder(ord.id)}
                                    title="Reject Order"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded text-[10.5px] transition-colors cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}

                              {/* If Approved: Dispatch to Fleet or Move to POS */}
                              {ord.order_status === 'approved' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrderForDispatch(ord);
                                      setDispatchCorridorId(ord.corridor_id || 1);
                                      const matched = corridorPresets.find((c) => c.id === (ord.corridor_id || 1));
                                      if (matched) {
                                        setDispatchDriverName(matched.driver);
                                        setDispatchVehiclePlate(matched.plate);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-[10.5px] shadow-2xs transition-colors cursor-pointer"
                                  >
                                    🚚 Dispatch to Fleet
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveToPos(ord.id)}
                                    className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded text-[10.5px] transition-colors cursor-pointer"
                                  >
                                    🏪 Move to POS
                                  </button>
                                </>
                              )}

                              {/* If Queued or On Route: Confirm Delivery & POD */}
                              {(ord.order_status === 'queued' || ord.order_status === 'on_route') && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPODModal(ord)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10.5px] shadow-2xs transition-colors cursor-pointer"
                                >
                                  ✍️ Sign POD &amp; Collect
                                </button>
                              )}

                              {/* If Delivered: View Delivery Note */}
                              {ord.order_status === 'delivered' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const notes = FleetSocialIntegrationService.getDeliveryNotes();
                                    const matchedNote = notes.find((n) => n.recipient_name === ord.customer_name || n.invoice_id.includes(ord.order_number)) || notes[0];
                                    setSelectedNoteView(matchedNote);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded text-[10.5px] transition-colors cursor-pointer"
                                >
                                  📄 View POD Note
                                </button>
                              )}

                              {/* If Moved to POS */}
                              {ord.order_status === 'moved_to_pos_pickup' && (
                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px]">
                                  Ready at Cashier
                                </span>
                              )}

                              {/* If Escalated */}
                              {ord.order_status === 'escalated_to_management' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveOrder(ord.id)}
                                  className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10.5px] shadow-2xs cursor-pointer"
                                >
                                  Override &amp; Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
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
              <button type="button" onClick={() => { setScheduleType('SOCIAL_POST'); setShowScheduleModal(true); }} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-2xs cursor-pointer">+ Schedule Social Post</button>
              <button type="button" onClick={() => { setScheduleType('WHATSAPP_BROADCAST'); setShowScheduleModal(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer">+ Schedule WhatsApp Broadcast</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calendarItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10.5px] font-bold text-primary">{item.id}</span>
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
            <p className="text-xs text-slate-600 font-medium mt-0.5">Click any campaign row to view per-page contribution share (%)</p>
          </div>
          <div className="space-y-3">
            {campaignsData.map((camp) => {
              const isExpanded = expandedCampaignIds.includes(camp.id);
              return (
                <div key={camp.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div onClick={() => toggleCampaignAccordion(camp.id)} className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{camp.name}</span>
                      <span className="px-2 py-0.5 bg-white text-primary rounded text-[10.5px] font-bold border border-slate-200">{camp.channelPlatform}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span>Spend: ${camp.spendUsd.toFixed(2)}</span>
                      <span className="text-emerald-600 font-bold">CPL: ${camp.cplUsd.toFixed(2)}</span>
                      <span className="text-primary font-bold">Revenue: ${camp.totalRevenueUsd.toFixed(2)}</span>
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
                              <td className="py-2 px-3 font-bold">{page.repName} <span className="font-mono text-primary block text-[11px]">{page.pageHandle}</span></td>
                              <td className="py-2 px-3 text-center font-mono">{page.leadsGenerated}</td>
                              <td className="py-2 px-3 text-center font-mono">{page.conversions}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-primary">${page.revenueUsd.toFixed(2)}</td>
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
                    <td className="py-2.5 px-3 font-mono text-primary font-bold">{ag.code}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{ag.activeChats}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{ag.totalOrders}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">{ag.conversionRatePct}%</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{ag.avgResponseMins} mins</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-primary">${ag.earnedCommissionUsd.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button type="button" onClick={() => setSelectedAgentDrilldown(ag)} className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded text-[11px] cursor-pointer">View Pages ({ag.pages.length})</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* 7. SOCIAL CRM MASTER REPORTS HUB (STANDARDIZED REPORT SYSTEM)       */}
      {/* =================================================================== */}
      {activeTab === 'reports' && (
        <div className="w-full">
          <SocialCrmReportsHub />
        </div>
      )}

      {showOrderModal && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-left">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>⚡ Management Override: Convert Chat to Fleet Order</span>
                </h3>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Direct Backoffice Takeover • Auto Stock Shield Active
                </span>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                <span className="text-foreground font-bold block">
                  Customer: {selectedChat.senderName} ({selectedChat.senderPhone})
                </span>
                <p className="text-slate-600 text-[11px]">
                  Original Rep: <strong className="text-slate-800">{selectedChat.assignedRep} ({selectedChat.repCode})</strong> • Platform: <strong className="text-primary">{selectedChat.platform}</strong>
                </p>
                <p className="text-slate-500 text-[10.5px] italic mt-0.5 font-mono">
                  &quot;{selectedChat.lastMessage}&quot;
                </p>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Product for Delivery:</label>
                <select
                  value={overrideItemId}
                  onChange={(e) => setOverrideItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:border-primary focus:outline-none"
                >
                  {inventoryStocks.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.item_name} — ${(inv as any).unit_price_usd || 100} (Available: {inv.available_stock} units)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Calculations */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity:</label>
                  <input
                    type="number"
                    min={1}
                    value={overrideQty}
                    onChange={(e) => setOverrideQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={overridePaymentMethod}
                    onChange={(e) => setOverridePaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-primary"
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="WHISH">Whish Money Transfer (WHISH)</option>
                  </select>
                </div>
              </div>

              {/* Destination & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Town:</label>
                  <input
                    type="text"
                    value={overrideTown}
                    onChange={(e) => setOverrideTown(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Address:</label>
                  <input
                    type="text"
                    value={overrideAddress}
                    onChange={(e) => setOverrideAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Corridor Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Highway Fleet Corridor:</label>
                <select
                  value={overrideCorridorId}
                  onChange={(e) => setOverrideCorridorId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-800 bg-emerald-50/50"
                >
                  {corridorPresets.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Driver: {c.driver} ({c.plate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Payable</span>
                  <strong className="text-emerald-700 text-sm">
                    ${((inventoryStocks.find((i) => i.id === overrideItemId) as any)?.unit_price_usd || 100) * overrideQty + 4.0} USD
                  </strong>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Fee: $4.00 USD</span>
                  <div className="text-slate-800 font-bold">
                    {(((inventoryStocks.find((i) => i.id === overrideItemId) as any)?.unit_price_usd || 100) * overrideQty * 90000).toLocaleString()} LBP
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleManagementOverrideOrder}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>⚡ Force Approve &amp; Queue to SuperSonic Fleet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none overflow-y-auto">
          <div className="bg-card text-foreground w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden text-left my-6">
            <div className={`px-5 py-3.5 flex items-center justify-between ${
              scheduleType === 'WHATSAPP_BROADCAST' ? 'bg-emerald-700 text-white' : 'bg-muted text-foreground border-b border-border'
            }`}>
              <h3 className="text-xs font-bold">
                {scheduleType === 'WHATSAPP_BROADCAST' ? 'Schedule Direct WhatsApp Broadcast' : 'Schedule Social Post (Browse Image/Video)'}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-muted-foreground hover:text-foreground font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateOutboundSchedule} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div><label className="block font-bold text-foreground mb-1">Title *</label><input type="text" required value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Title..." className="w-full px-3 py-2 border border-border bg-background rounded-lg font-bold" /></div>
              
              <div className="bg-muted/40 border-2 border-dashed border-border p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">Media Attachment (Browse Local Files):</label>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => { setMediaType('IMAGE'); setUploadedFileName(null); setUploadedFilePreview(null); }} className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${mediaType === 'IMAGE' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>🖼️ Image</button>
                    <button type="button" onClick={() => { setMediaType('VIDEO'); setUploadedFileName(null); setUploadedFilePreview(null); }} className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${mediaType === 'VIDEO' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>🎥 Video</button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} accept={mediaType === 'IMAGE' ? 'image/*' : 'video/*'} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUploadedFileName(f.name); setUploadedFilePreview(URL.createObjectURL(f)); } }} className="hidden" />
                {!uploadedFileName ? (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-background border border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary">
                    <div className="font-bold text-primary">Click to browse {mediaType === 'IMAGE' ? 'an Image' : 'a Video'} from computer</div>
                  </div>
                ) : (
                  <div className="bg-card p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{uploadedFileName} ✓</span>
                    <button type="button" onClick={() => { setUploadedFileName(null); setUploadedFilePreview(null); }} className="text-destructive font-bold cursor-pointer">✕ Remove</button>
                  </div>
                )}
              </div>

              <div><label className="block font-bold text-foreground mb-1">Message Body</label><textarea rows={3} value={copyText} onChange={(e) => setCopyText(e.target.value)} placeholder="Type copy text..." className="w-full px-3 py-2 border border-border bg-background rounded-lg text-xs" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border"><button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 border border-border rounded-xl font-bold cursor-pointer text-foreground hover:bg-muted">Cancel</button><button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl cursor-pointer">Schedule</button></div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CANNED REPLY MODAL */}
      {showNewCannedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-card text-foreground w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden text-left">
            <div className="bg-muted text-foreground px-4 py-3 flex items-center justify-between border-b border-border">
              <h3 className="text-xs font-bold">Add New Canned Quick Reply</h3>
              <button onClick={() => setShowNewCannedModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div><label className="block font-bold text-foreground mb-0.5">Shortcut Tag</label><input type="text" value={newShortcut} onChange={(e) => setNewShortcut(e.target.value)} placeholder="/shortcut" className="w-full px-2.5 py-1.5 border border-border bg-background rounded font-mono font-bold text-primary" /></div>
              <div><label className="block font-bold text-foreground mb-0.5">Message Text</label><textarea rows={3} value={newCannedText} onChange={(e) => setNewCannedText(e.target.value)} placeholder="Type reply..." className="w-full px-2.5 py-1.5 border border-border bg-background rounded" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border"><button onClick={() => setShowNewCannedModal(false)} className="px-3 py-1.5 border border-border rounded font-bold cursor-pointer hover:bg-muted">Cancel</button><button onClick={handleAddNewCannedReply} className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl cursor-pointer">Save</button></div>
            </div>
          </div>
        </div>
      )}

      {/* AGENT DRILLDOWN MODAL */}
      {selectedAgentDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-card text-foreground w-full max-w-lg rounded-2xl border border-border shadow-xl overflow-hidden text-left">
            <div className="bg-muted text-foreground px-4 py-3 flex items-center justify-between border-b border-border">
              <h3 className="text-xs font-bold">Social Pages Breakdown: {selectedAgentDrilldown.name} ({selectedAgentDrilldown.code})</h3>
              <button onClick={() => setSelectedAgentDrilldown(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                    <th className="py-2 px-2.5 normal-case">platform</th>
                    <th className="py-2 px-2.5 normal-case">page / handle</th>
                    <th className="py-2 px-2.5 normal-case text-center">audience</th>
                    <th className="py-2 px-2.5 normal-case text-center">orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {selectedAgentDrilldown.pages.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2.5 font-bold text-primary">{p.platform}</td>
                      <td className="py-2 px-2.5 font-mono">{p.pageName}</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-foreground">{p.followers}</td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-600">{p.ordersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedAgentDrilldown(null)} className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH TO SUPERSONIC FLEET MODAL */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-card text-foreground w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden text-left">
            <div className="bg-primary text-primary-foreground px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">🚚 Dispatch Order to SuperSonic Fleet</h3>
                <span className="text-[11px] opacity-90 font-mono">Order #{selectedOrderForDispatch.order_number}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDispatch(null)}
                className="text-primary-foreground hover:opacity-80 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <strong className="text-foreground">{selectedOrderForDispatch.customer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination:</span>
                  <strong className="text-foreground">{selectedOrderForDispatch.destination_town}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="text-foreground truncate max-w-[200px]" title={selectedOrderForDispatch.delivery_address}>
                    {selectedOrderForDispatch.delivery_address}
                  </span>
                </div>
                <div className="flex justify-between text-primary font-bold border-t border-border pt-1">
                  <span>To Collect:</span>
                  <span>
                    ${selectedOrderForDispatch.product_amount_usd + selectedOrderForDispatch.delivery_fee_usd} (
                    {selectedOrderForDispatch.payment_method})
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Select Highway Corridor (1 to 7):</label>
                <select
                  value={dispatchCorridorId}
                  onChange={(e) => {
                    const cId = parseInt(e.target.value, 10);
                    setDispatchCorridorId(cId);
                    const preset = corridorPresets.find((c) => c.id === cId);
                    if (preset) {
                      setDispatchDriverName(preset.driver);
                      setDispatchVehiclePlate(preset.plate);
                    }
                  }}
                  className="w-full px-3 py-2 border border-border bg-background rounded-xl font-medium focus:border-primary focus:outline-none"
                >
                  {corridorPresets.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Assigned Driver:</label>
                  <input
                    type="text"
                    value={dispatchDriverName}
                    onChange={(e) => setDispatchDriverName(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Vehicle Plate:</label>
                  <input
                    type="text"
                    value={dispatchVehiclePlate}
                    onChange={(e) => setDispatchVehiclePlate(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDispatch(null)}
                  className="px-4 py-2 border border-border text-foreground hover:bg-muted font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Dispatch ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROOF OF DELIVERY (POD) CONFIRMATION MODAL */}
      {selectedOrderForPOD && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-left">
            <div className="bg-emerald-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">✍️ Proof of Delivery (POD) &amp; Stock Deduction</h3>
                <span className="text-[11px] text-emerald-100 font-mono">
                  Order #{selectedOrderForPOD.order_number} (Corridor {selectedOrderForPOD.corridor_id})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForPOD(null)}
                className="text-white hover:text-emerald-200 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-emerald-900 font-bold block">
                  🛡️ Trigger Execution: <code className="font-mono">process_vanguard_invoice_stock()</code>
                </span>
                <p className="text-emerald-700 text-[11px]">
                  Confirming this POD will officially relieve the reserved stock (<code className="font-mono">qty_reserved</code>), deduct physical inventory (<code className="font-mono">vanguard_stock</code>), insert an audit record in <code className="font-mono">stock_ledger</code>, and generate an immutable <code className="font-mono">delivery_notes</code> entry.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name:</label>
                  <input
                    type="text"
                    value={podRecipientName}
                    onChange={(e) => setPodRecipientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Collection Method:</label>
                  <select
                    value={podPaymentMethod}
                    onChange={(e) => setPodPaymentMethod(e.target.value as PaymentCollectionMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="COD">COD (Cash on Delivery)</option>
                    <option value="WHISH">WHISH (Whish Money on Delivery)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collected USD ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={podCollectedUsd}
                    onChange={(e) => setPodCollectedUsd(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collected LBP (Optional):</label>
                  <input
                    type="number"
                    step="10000"
                    value={podCollectedLbp}
                    onChange={(e) => setPodCollectedLbp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Driver Signature (SVG Proof):</label>
                <div className="h-16 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-center p-2">
                  <span className="font-serif italic font-bold text-slate-700 text-lg">
                    ✍️ {podRecipientName || 'Customer Signature'} (Verified on Mobile)
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Notes:</label>
                <input
                  type="text"
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="e.g., Delivered to reception, cash counted..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPOD(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPOD}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  ✓ Confirm Delivery &amp; Deduct Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY NOTE (POD VOUCHER) PREVIEW MODAL */}
      {selectedNoteView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-left">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">📄 Official Delivery Note (POD Voucher)</h3>
                <span className="text-[11px] text-slate-300 font-mono">
                  DN #{selectedNoteView.delivery_note_number || '1001'} | Ref: {selectedNoteView.invoice_id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoteView(null)}
                className="text-white hover:text-slate-300 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Delivered At:</span>
                  <strong className="text-slate-900">{new Date(selectedNoteView.delivered_at).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Recipient Name:</span>
                  <strong className="text-slate-900">{selectedNoteView.recipient_name}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Delivered By Courier:</span>
                  <strong className="text-slate-900">{selectedNoteView.delivered_by}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Payment Collection:</span>
                  <span className="font-bold text-purple-700">{selectedNoteView.payment_method}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-500">Collected USD:</span>
                  <strong className="text-emerald-700">${selectedNoteView.collected_amount_usd.toFixed(2)}</strong>
                </div>
                {selectedNoteView.collected_amount_lbp > 0 && (
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500">Collected LBP:</span>
                    <strong className="text-slate-800">{selectedNoteView.collected_amount_lbp.toLocaleString()} LBP</strong>
                  </div>
                )}
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Proof of Delivery Signature:</span>
                  <div className="p-2.5 bg-slate-50 border rounded-lg flex items-center justify-center font-serif italic text-blue-900 font-bold text-base">
                    ✍️ Verified SVG Signature Stamp
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedNoteView(null)}
                  className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Close Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
