'use client';

import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import ModalShell from './ModalShell';

export type StandaloneAppType = 'v-driver' | 'v-connect' | 'pressing-mill';

interface StandaloneAppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApp?: StandaloneAppType;
}

interface AppSpec {
  id: StandaloneAppType;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  icon: any;
  launchUrl: string;
  manifestUrl: string;
  description: string;
  offlineSupport: boolean;
  targetHardware: string;
  features: string[];
}

export default function StandaloneAppDownloadModal({
  isOpen,
  onClose,
  initialApp = 'v-driver'
}: StandaloneAppDownloadModalProps) {
  const { t } = useLanguage();
  const [selectedApp, setSelectedApp] = useState<StandaloneAppType>(initialApp);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appSpecs: Record<StandaloneAppType, AppSpec> = {
    'v-driver': {
      id: 'v-driver',
      title: 'V-Driver — SuperSonic Fleet Mobile PWA',
      subtitle: 'Mobile Driver & Route Dispatch Application',
      tag: 'FLEET LOGISTICS',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Smartphone,
      launchUrl: '/v-driver',
      manifestUrl: '/manifest-driver.json',
      description: 'Dedicated handheld client for drivers and dispatchers with offline queuing, live corridor status updates, turn-by-turn navigation, and digital signature POD capture.',
      offlineSupport: true,
      targetHardware: 'Android, iOS, Zebra Handhelds, Rugged Terminals',
      features: [
        'Full Offline Storage & IndexedDB Queue',
        'Digital Customer Signature & Proof of Delivery (POD)',
        'Corridor Turn-by-Turn Delivery Manifest',
        'Automatic Reconnection & Sync with Supabase'
      ]
    },
    'v-connect': {
      id: 'v-connect',
      title: 'V-Connect — Field Sales & Social Agent PWA',
      subtitle: 'Standalone Social CRM & Sales Rep Mobile Workstation',
      tag: 'SOCIAL CRM & SALES',
      tagColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: Smartphone,
      launchUrl: '/sales-rep',
      manifestUrl: '/manifest-sales.json',
      description: 'Mobile field representative portal and agent inbox. Allows field agents to create B2B wholesale orders, capture lead inquiries, check real-time stock balances, and monitor commission metrics.',
      offlineSupport: true,
      targetHardware: 'Mobile Phones, Tablets, Desktop Web Browsers',
      features: [
        'Omnichannel Conversation & Lead Ingestion',
        'Instant Sales Quotation & Direct Order Submission',
        'Live Inventory Stock Balance & Allocation Check',
        'Field Agent Performance & Commission Telemetry'
      ]
    },
    'pressing-mill': {
      id: 'pressing-mill',
      title: 'Pressing Mill — Industrial Touch Workstation',
      subtitle: 'Weighbridge & Industrial Kiosk Client',
      tag: 'MANUFACTURING & WEIGHBRIDGE',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Monitor,
      launchUrl: '/pressing-mill/pos',
      manifestUrl: '/manifest-mill.json',
      description: 'Touch-optimized industrial workstation client designed for factory kiosks, weighbridge scale attendants, and oil extraction control rooms with dual-currency cash handling.',
      offlineSupport: true,
      targetHardware: 'Industrial Touch-Screens, POS All-in-One Terminals, Weighbridges',
      features: [
        'Touch-Screen Optimized Scale & Weighbridge Intake',
        'Direct Counter Retail Sales & Oil Canister Billing',
        'Continuous Line Crushing & Tank Matrix Tracking',
        'Dual-Currency USD/LBP Real-Time Cash Drawer Kicks'
      ]
    }
  };

  const current = appSpecs[selectedApp];

  const handleCopyLaunchUrl = () => {
    const fullUrl = `${window.location.origin}${current.launchUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadManifest = () => {
    const link = document.createElement('a');
    link.href = current.manifestUrl;
    link.download = `${current.id}-pwa-manifest.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      icon={<Download className="w-5 h-5 text-emerald-700" />}
      title={t('standalone_app_portals', 'Standalone Application Workstations')}
      badge="PWA Active"
      subtitle={t('standalone_app_sub', 'Download manifests, install PWA clients, or launch dedicated full-screen workstations')}
      contentScrollable={false}
    >

        {/* Tab Switcher for 3 Apps */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-1.5 overflow-x-auto">
          {[
            { id: 'v-driver', label: 'V-Driver Fleet' },
            { id: 'v-connect', label: 'V-Connect Rep' },
            { id: 'pressing-mill', label: 'Pressing Mill Kiosk' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedApp(tab.id as StandaloneAppType)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
                selectedApp === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* App Overview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${current.tagColor}`}>
                  {current.tag}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1.5">{current.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{current.subtitle}</p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <current.icon className="w-6 h-6 text-primary" />
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {current.description}
            </p>

            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{current.targetHardware}</span>
              </span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Zero-Mock Live Supabase Sync
              </span>
            </div>
          </div>

          {/* Key Features List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Core Client Features & Offline Capabilities
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {current.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-800 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyLaunchUrl}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownloadManifest}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Manifest JSON</span>
              </button>

              <a
                href={current.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Launch Workstation App</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
    </ModalShell>
  );
}
