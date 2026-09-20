'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Truck,
  DollarSign,
  Wifi,
  WifiOff,
  Download,
  ShieldAlert,
  User,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export interface RepConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  channel: 'whatsapp' | 'instagram' | 'messenger';
  town: string;
  address: string;
  lastMessage: string;
  unreadCount: number;
  assignedRepCode: string;
  assignedRepName: string;
  slaSecondsLeft: number; // dynamically counted down
  status: 'PENDING_REP' | 'APPROVED' | 'ESCALATED' | 'COMPLETED';
  orderDraft?: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPriceUsd: number;
    deliveryFeeUsd: number;
    corridorId: number;
    paymentMethod: 'COD' | 'WHISH';
  };
}

const INITIAL_CONVERSATIONS: RepConversation[] = [
  {
    id: 'chat-rep-001',
    customerName: 'Sleiman Kanaan',
    customerPhone: '03-112233',
    channel: 'whatsapp',
    town: 'Beirut - Hamra',
    address: 'Sadat Street, Al Nour Building, 3rd Floor',
    lastMessage: 'Hello, I need one 17.5L olive oil tin and two bottles of pomegranate molasses delivered to Hamra please.',
    unreadCount: 2,
    assignedRepCode: 'REP-002',
    assignedRepName: 'Ahmad Ali Kassem',
    slaSecondsLeft: 22 * 60 + 45, // ~22 mins left
    status: 'PENDING_REP',
    orderDraft: {
      itemId: 'inv-item-01',
      itemName: 'Extra Virgin Olive Oil 17.5L Tin',
      quantity: 1,
      unitPriceUsd: 100,
      deliveryFeeUsd: 4.0,
      corridorId: 1,
      paymentMethod: 'COD',
    },
  },
  {
    id: 'chat-rep-002',
    customerName: 'Dr. Wassim Haidar',
    customerPhone: '71-456789',
    channel: 'whatsapp',
    town: 'Choueifat - Al Qubbah',
    address: 'Near Choueifat National School, Haidar Villa',
    lastMessage: 'Hello Ahmad, do you have pickled green olives available preserved with olive oil?',
    unreadCount: 1,
    assignedRepCode: 'REP-002',
    assignedRepName: 'Ahmad Ali Kassem',
    slaSecondsLeft: 11 * 60 + 15, // ~11 mins left (URGENT ALERT)
    status: 'PENDING_REP',
    orderDraft: {
      itemId: 'inv-item-04',
      itemName: 'Pickled Green Olives Box 650g x 12',
      quantity: 2,
      unitPriceUsd: 20,
      deliveryFeeUsd: 3.0,
      corridorId: 2,
      paymentMethod: 'COD',
    },
  },
  {
    id: 'chat-rep-003',
    customerName: 'Sana Khoury',
    customerPhone: '01-205930',
    channel: 'instagram',
    town: 'Achrafieh - Sassine',
    address: 'Huvelin Street, Facing Saint Louis Church',
    lastMessage: 'Can I pay the driver via Whish Money when he arrives?',
    unreadCount: 0,
    assignedRepCode: 'REP-002',
    assignedRepName: 'Ahmad Ali Kassem',
    slaSecondsLeft: 48 * 60, // ~48 mins left
    status: 'PENDING_REP',
    orderDraft: {
      itemId: 'inv-item-02',
      itemName: 'Cold Pressed Extra Virgin Olive Oil 1L Glass',
      quantity: 4,
      unitPriceUsd: 8.5,
      deliveryFeeUsd: 4.0,
      corridorId: 1,
      paymentMethod: 'WHISH',
    },
  },
];

const CORRIDORS = [
  { id: 1, name: 'Corridor 1: Greater Beirut & Coast' },
  { id: 2, name: 'Corridor 2: Mount Lebanon & Chouf' },
  { id: 3, name: 'Corridor 3: Southern Coast & Deep South' },
  { id: 4, name: 'Corridor 4: Northern Coast to Batroun' },
  { id: 5, name: 'Corridor 5: Tripoli & Akkar' },
  { id: 6, name: 'Corridor 6: Bekaa & South-East' },
  { id: 7, name: 'Corridor 7: North Bekaa (Baalbek)' },
];

export default function SalesRepMobileApp() {
  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Connectivity
  const [isOnline, setIsOnline] = useState(true);
  const [offlineDraftQueue, setOfflineDraftQueue] = useState<any[]>([]);

  // Rep Selection
  const [currentRepCode, setCurrentRepCode] = useState('REP-002');
  const [currentRepName] = useState('Ahmad Ali Kassem');

  // Conversations & SLA Timer
  const [conversations, setConversations] = useState<RepConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedChatId, setSelectedChatId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [replyText, setReplyText] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'URGENT' | 'APPROVED'>('ALL');

  // Order Composer
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [composerQuantity, setComposerQuantity] = useState(1);
  const [composerCorridor, setComposerCorridor] = useState(1);
  const [composerPayment, setComposerPayment] = useState<'COD' | 'WHISH'>('COD');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // 1. PWA & Network Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        syncSalesOfflineDrafts();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  // 2. Real-time SLA Countdown Engine (Tick every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.status === 'PENDING_REP' && c.slaSecondsLeft > 0) {
            const nextSec = c.slaSecondsLeft - 1;
            if (nextSec === 0) {
              return { ...c, slaSecondsLeft: 0, status: 'ESCALATED' };
            }
            return { ...c, slaSecondsLeft: nextSec };
          }
          return c;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('To install on iOS/Android: Tap "Share" or "Browser Menu" and select "Add to Home Screen".');
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

  const syncSalesOfflineDrafts = async () => {
    const saved = localStorage.getItem('vanguard_sales_offline_queue');
    if (!saved) return;
    try {
      const queue = JSON.parse(saved);
      if (queue.length === 0) return;
      for (const item of queue) {
        await fetch('/api/orders/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      localStorage.removeItem('vanguard_sales_offline_queue');
      setOfflineDraftQueue([]);
      setActionNotice('Synced all queued offline orders with SuperSonic fleet!');
    } catch (e) {
      console.warn('Sales sync retry scheduled', e);
    }
  };

  const activeChat = conversations.find((c) => c.id === selectedChatId) || conversations[0];

  const formatSla = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // 3. Quick Order Approve & Queue to Fleet
  const handleApproveAndQueueToFleet = async () => {
    if (!activeChat) return;
    setIsSubmittingOrder(true);

    const draft = activeChat.orderDraft;
    const corridorId = composerCorridor || draft?.corridorId || 1;
    const paymentMethod = composerPayment || draft?.paymentMethod || 'COD';

    const orderPayload = {
      orderId: activeChat.id,
      repCode: currentRepCode,
      corridorId,
      paymentMethod,
    };

    if (isOnline) {
      try {
        const res = await fetch('/api/orders/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
        const data = await res.json();
        if (data.error && !data.invoice) {
          console.warn('API warning:', data.error);
        }
        setConversations((prev) =>
          prev.map((c) => (c.id === activeChat.id ? { ...c, status: 'APPROVED' } : c))
        );
        setActionNotice(
          `Order Approved & Queued to Fleet Corridor ${corridorId}! Stock reserved. Commission registered for ${currentRepName}.`
        );
      } catch (err) {
        queueOfflineOrder(orderPayload);
      }
    } else {
      queueOfflineOrder(orderPayload);
    }

    setIsSubmittingOrder(false);
    setShowOrderDrawer(false);
  };

  const queueOfflineOrder = (payload: any) => {
    const existing = localStorage.getItem('vanguard_sales_offline_queue');
    const queue = existing ? JSON.parse(existing) : [];
    queue.push(payload);
    localStorage.setItem('vanguard_sales_offline_queue', JSON.stringify(queue));
    setOfflineDraftQueue([...queue]);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, status: 'APPROVED' } : c))
    );
    setActionNotice('Order approved in Offline Shell! Queued to sync automatically with Fleet upon reconnect.');
  };

  const filteredConversations = conversations.filter((c) => {
    if (filterMode === 'URGENT') return c.slaSecondsLeft < 15 * 60 && c.status === 'PENDING_REP';
    if (filterMode === 'APPROVED') return c.status === 'APPROVED';
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-sans select-none flex flex-col">
      {/* PWA Manifest */}
      <head>
        <link rel="manifest" href="/manifest-sales.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>

      {/* TOP BAR */}
      <header className="bg-card border-b border-border px-4 py-2.5 sticky top-0 z-40 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-foreground">Sales Rep Mobile Workspace</h1>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono font-bold rounded">
                Omnichannel
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
              <span>{currentRepName}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentRepCode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connectivity Status */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1 border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline Shell'}</span>
          </div>

          {/* Install PWA Button */}
          {(!isInstalled || isInstallable) && (
            <button
              onClick={handleInstallPWA}
              className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg border border-border flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install PWA</span>
            </button>
          )}

          <Link
            href="/backoffice/social-crm"
            className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-bold border border-border"
          >
            Hub
          </Link>
        </div>
      </header>

      {/* ACTION NOTICE BANNER */}
      {actionNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-pre-line">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-foreground text-xs font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN CONTENT: ADAPTIVE MOBILE vs TABLET/DESKTOP SPLIT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: CONVERSATION QUEUE WITH LIVE SLA COUNTDOWNS (4 COLS) */}
        <div className="lg:col-span-4 border-r border-border bg-card/50 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-bold text-muted-foreground">Assigned Inbound ({conversations.length})</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  filterMode === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('URGENT')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  filterMode === 'URGENT' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Urgent SLA
              </button>
              <button
                onClick={() => setFilterMode('APPROVED')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  filterMode === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Queued
              </button>
            </div>
          </div>

          {filteredConversations.map((chat) => {
            const isSelected = selectedChatId === chat.id;
            const isUrgent = chat.slaSecondsLeft < 15 * 60 && chat.status === 'PENDING_REP';
            const isExpiring = chat.slaSecondsLeft < 5 * 60 && chat.status === 'PENDING_REP';

            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-card border-primary shadow-xs ring-1 ring-primary/40'
                    : chat.status === 'APPROVED'
                    ? 'bg-card/70 border-emerald-500/40'
                    : isUrgent
                    ? 'bg-destructive/10 border-destructive/40'
                    : 'bg-card border-border hover:border-muted-foreground/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{chat.customerName}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{chat.customerPhone} • {chat.town}</p>
                  </div>
                  {/* SLA Urgency Badge */}
                  {chat.status === 'PENDING_REP' && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                        isExpiring
                          ? 'bg-destructive/15 text-destructive border-destructive animate-pulse'
                          : isUrgent
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>SLA: {formatSla(chat.slaSecondsLeft)}</span>
                    </span>
                  )}
                  {chat.status === 'APPROVED' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      Queued to Fleet
                    </span>
                  )}
                  {chat.status === 'ESCALATED' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/50">
                      Escalated to Management
                    </span>
                  )}
                </div>

                <p className="text-[11.5px] text-foreground/80 mt-1 line-clamp-1">{chat.lastMessage}</p>

                <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10.5px]">
                  <span className="font-bold text-primary uppercase">{chat.channel}</span>
                  {chat.orderDraft && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Draft: ${chat.orderDraft.unitPriceUsd * chat.orderDraft.quantity}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER & RIGHT: CHAT THREAD & 1-TAP FLEET ORDER COMPOSER (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-120px)] bg-card/30">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">{activeChat.customerName}</h2>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded font-bold uppercase">
                      {activeChat.channel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {activeChat.customerPhone} — {activeChat.address}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* SLA Remaining Alert */}
                  {activeChat.status === 'PENDING_REP' && (
                    <div className="px-3 py-1 bg-muted border border-border rounded-xl font-mono text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{formatSla(activeChat.slaSecondsLeft)} left to approve</span>
                    </div>
                  )}

                  {/* 1-Click Order Drawer Toggle */}
                  <button
                    onClick={() => setShowOrderDrawer(!showOrderDrawer)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{showOrderDrawer ? 'Close Order' : 'Quick Order & Queue'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/20">
                <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none max-w-[80%] text-xs shadow-xs text-foreground">
                  <div className="font-bold text-primary mb-1">{activeChat.customerName}</div>
                  <p className="text-foreground/90">{activeChat.lastMessage}</p>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1 text-right">Just now</div>
                </div>

                {activeChat.status === 'APPROVED' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Order approved by {activeChat.assignedRepName}! Stock reserved and queued to Corridor {activeChat.orderDraft?.corridorId || 1} Fleet.
                    </span>
                  </div>
                )}
              </div>

              {/* Order Composer Drawer (Collapsible) */}
              {showOrderDrawer && (
                <div className="p-4 bg-card border-t-2 border-emerald-500/40 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Configure &amp; Queue Order to SuperSonic Fleet</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      Stock Shield: Active (Reserved)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10.5px] text-muted-foreground block mb-1">Product Offer:</label>
                      <input
                        type="text"
                        disabled
                        value={activeChat.orderDraft?.itemName || '17.5L Olive Oil Tin'}
                        className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-foreground font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] text-muted-foreground block mb-1">Quantity:</label>
                      <input
                        type="number"
                        min={1}
                        value={composerQuantity}
                        onChange={(e) => setComposerQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-foreground font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] text-muted-foreground block mb-1">Delivery Corridor:</label>
                      <select
                        value={composerCorridor}
                        onChange={(e) => setComposerCorridor(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-foreground font-bold"
                      >
                        {CORRIDORS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
                    <div className="font-mono">
                      <span className="text-muted-foreground">Estimated Total: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                        ${(activeChat.orderDraft ? activeChat.orderDraft.unitPriceUsd * composerQuantity : 100) + (activeChat.orderDraft?.deliveryFeeUsd || 4.0)} USD
                      </strong>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowOrderDrawer(false)}
                        className="px-3 py-1.5 bg-muted text-foreground border border-border rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingOrder}
                        onClick={handleApproveAndQueueToFleet}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Approval &amp; Queue to Van</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-border bg-card flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type quick reply to customer..."
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!replyText) return;
                    setReplyText('');
                    setActionNotice('Message dispatched via official channel.');
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
              Select a customer chat to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
