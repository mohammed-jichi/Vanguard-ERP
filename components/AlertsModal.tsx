'use client';

import React from 'react';
import { Bell, Package, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import ModalShell from './ModalShell';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertsModal({ isOpen, onClose }: AlertsModalProps) {
  const alertItems = [
    {
      id: 1,
      title: "Low Inventory Warning",
      desc: "⚠️ Low inventory: Extra Virgin Glass Bottles (750ml) - Current stock: 12 units (Threshold: 50).",
      time: "10 mins ago",
      icon: Package,
      color: "bg-amber-50 text-amber-900 border-amber-200",
      badge: "Inventory"
    },
    {
      id: 2,
      title: "Month-End Pending Closure",
      desc: "⚠️ Pending Month-End Closure for June 2026. Inventory posting locked pending reconciliation.",
      time: "1 hour ago",
      icon: Calendar,
      color: "bg-rose-50 text-rose-900 border-rose-200",
      badge: "Accounting"
    },
    {
      id: 3,
      title: "Unposted Sales Transactions",
      desc: "⚠️ Unposted sales transactions in POS Terminal workstation #1. Require posting before EOD.",
      time: "2 hours ago",
      icon: FileText,
      color: "bg-sky-50 text-sky-900 border-sky-200",
      badge: "Sales POS"
    }
  ];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-lg"
      icon={<Bell className="w-5 h-5 text-rose-600" />}
      title="System Alerts"
      subtitle="Critical operational notifications & pending actions"
      bodyClassName="space-y-3.5"
      footer={
        <div className="w-full flex items-center justify-between">
          <span className="text-slate-500 font-semibold text-xs">
            3 active alerts reviewed
          </span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All as Read & Close</span>
          </button>
        </div>
      }
    >
      {alertItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            className={`p-4 border rounded-xl space-y-1.5 transition-all shadow-2xs ${item.color}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                {item.time}
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-800">
              {item.desc}
            </p>
          </div>
        );
      })}
    </ModalShell>
  );
}
