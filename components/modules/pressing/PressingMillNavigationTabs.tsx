'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Scale,
  Layers,
  Landmark,
  DollarSign,
  Truck,
  ShoppingCart,
  BookOpen,
  Settings
} from 'lucide-react';

export const PRESSING_MILL_TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/pressing-mill/dashboard', icon: LayoutDashboard },
  { id: 'intake', label: 'Weighbridge & Intake', path: '/pressing-mill/intake', icon: Scale },
  { id: 'batches', label: 'Pressing Lines & Batches', path: '/pressing-mill/batches', icon: Layers },
  { id: 'tanks', label: 'Tanks Matrix (1-50)', path: '/pressing-mill/tanks', icon: Landmark },
  { id: 'settlements', label: 'Settlements & Milling Fees', path: '/pressing-mill/settlements', icon: DollarSign },
  { id: 'dispatch', label: 'Oil Handover & Dispatch', path: '/pressing-mill/dispatch', icon: Truck },
  { id: 'pos', label: 'Direct Counter Sales & POS', path: '/pressing-mill/pos', icon: ShoppingCart },
  { id: 'directory', label: 'Directory & Ledgers', path: '/pressing-mill/directory', icon: BookOpen },
  { id: 'setup', label: 'Mill Settings', path: '/pressing-mill/setup', icon: Settings },
];

export default function PressingMillNavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-5 overflow-x-auto text-xs font-sans">
      {PRESSING_MILL_TABS.map((tab) => {
        const isActive = pathname === tab.path || (pathname === '/pressing-mill' && tab.id === 'dashboard');
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
