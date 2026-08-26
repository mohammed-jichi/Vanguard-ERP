'use client';

import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Package, Calendar, FileText } from 'lucide-react';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertsModal({ isOpen, onClose }: AlertsModalProps) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl font-sans dir-ltr text-left overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <Bell className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">System Alerts</h3>
              <p className="text-slate-500 font-semibold text-xs mt-0.5">Critical operational notifications & pending actions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Mark as Read & Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ALERTS LIST BODY */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
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
        </div>

        {/* FOOTER CLOSE & MARK AS READ BUTTON */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <span className="text-slate-500 font-semibold text-xs">
            3 active alerts reviewed
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read & Close</span>
          </button>
        </div>

      </div>
    </div>
  );
}
