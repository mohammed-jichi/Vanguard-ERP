"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Scale,
  Layers,
  Landmark,
  DollarSign,
  Truck,
  ShoppingCart,
  BookOpen,
  Settings,
  ExternalLink,
  Calendar
} from "lucide-react";
import PressingDashboardView from "./modules/pressing/PressingDashboardView";
import SeasonManagementView from "./modules/pressing/SeasonManagementView";
import WeighbridgeIntakeView from "./modules/pressing/WeighbridgeIntakeView";
import PressingBatchesView from "./modules/pressing/PressingBatchesView";
import TanksMatrixView from "./modules/pressing/TanksMatrixView";
import SettlementsEngineView from "./modules/pressing/SettlementsEngineView";
import OilDispatchView from "./modules/pressing/OilDispatchView";
import PressingCounterPOSView from "./modules/pressing/PressingCounterPOSView";
import DirectoryLedgersView from "./modules/pressing/DirectoryLedgersView";
import MillSettingsView from "./modules/pressing/MillSettingsView";
import { useLanguage } from "@/lib/LanguageContext";

export type PressingTabId =
  | "dashboard"
  | "seasons"
  | "intake"
  | "batches"
  | "tanks"
  | "settlements"
  | "dispatch"
  | "pos"
  | "directory"
  | "setup";

export default function PressingMillPage() {
  const [activeTab, setActiveTab] = useState<PressingTabId>("intake");
  const { t } = useLanguage();

  const tabs = [
    { id: "dashboard", key: "pm_dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "seasons", key: "pm_seasons", label: "Season Management", icon: Calendar },
    { id: "intake", key: "pm_intake", label: "Weighbridge & Intake", icon: Scale },
    { id: "batches", key: "pm_batches", label: "Pressing Lines & Batches", icon: Layers },
    { id: "tanks", key: "pm_tanks", label: "Tanks Matrix (1-50)", icon: Landmark },
    { id: "settlements", key: "pm_settlements", label: "Settlements & Milling Fees", icon: DollarSign },
    { id: "dispatch", key: "pm_dispatch", label: "Oil Handover & Dispatch", icon: Truck },
    { id: "pos", key: "pm_pos", label: "Direct Counter Sales & POS", icon: ShoppingCart },
    { id: "directory", key: "pm_directory", label: "Directory & Ledgers", icon: BookOpen },
    { id: "setup", key: "pm_setup", label: "Mill Settings & Line Config", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800 font-sans">
      {/* Top Banner with link to dedicated standalone module */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {t('pressing_mill', 'Pressing Mill')}
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">
            {t('pressing_mill_desc', 'Industrial Weighbridge, Cold Extraction Lines & Stainless Tank Farm')}
          </span>
        </div>
        <Link
          href="/pressing-mill/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition shadow-xs"
        >
          <span>{t('open_full_suite', 'Open Full Standalone Suite')}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Top Tab Capsules */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-5 overflow-x-auto text-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PressingTabId)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{t(tab.key, tab.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Render selected view */}
      {activeTab === "dashboard" && <PressingDashboardView />}
      {activeTab === "seasons" && <SeasonManagementView />}
      {activeTab === "intake" && <WeighbridgeIntakeView />}
      {activeTab === "batches" && <PressingBatchesView />}
      {activeTab === "tanks" && <TanksMatrixView />}
      {activeTab === "settlements" && <SettlementsEngineView />}
      {activeTab === "dispatch" && <OilDispatchView />}
      {activeTab === "pos" && <PressingCounterPOSView />}
      {activeTab === "directory" && <DirectoryLedgersView />}
      {activeTab === "setup" && <MillSettingsView />}
    </div>
  );
}
