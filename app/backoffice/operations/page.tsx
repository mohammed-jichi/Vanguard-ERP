'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, X } from 'lucide-react';

import AuthenticVanguardOperationsDashboard from './dashboard/page';
import AuthenticVanguardInventoryReports from './InventoryReportsView';
import AuthenticOmegaSalesWorkstation from './SalesView';
import QuotationWorkstation from '@/components/QuotationWorkstation';
import DeliveryOfGoodsView from '@/components/DeliveryOfGoodsView';
import PurchasesView from '@/components/PurchasesView';
import TransfersView from '@/components/TransfersView';
import PurchaseOrderView from '@/components/PurchaseOrderView';
import ReorderGuideView from '@/components/ReorderGuideView';
import LostGoodsView from '@/components/LostGoodsView';
import ItemAssemblyView from '@/components/ItemAssemblyView';
import AdjustmentsView from '@/components/AdjustmentsView';
import ProductRequestView from '@/components/ProductRequestView';
import ManageProductRequestsView from '@/components/ManageProductRequestsView';
import ProductReqPreparationView from '@/components/ProductReqPreparationView';
import ReceivingOfGoodsView from '@/components/ReceivingOfGoodsView';
import OperationsActionsViews from './OperationsActionsViews';
import OperationsProductRequestViews from './OperationsProductRequestViews';
import OperationsEventsViews from './OperationsEventsViews';
import OperationsSetupViews from './OperationsSetupViews';
import StandardUnderDevelopmentPlaceholder from '@/components/StandardUnderDevelopmentPlaceholder';
import PressingMillPage from '@/components/PressingMillConsole';

const HANDLED_OPS_SECTIONS = new Set([
  'dashboard', 'reports', 'sales', 'quotations', 'delivery_goods', 'purchases',
  'purchase_orders', 'reorder_guide', 'lost_goods', 'item_assembly', 'transfers',
  'adjustments', 'product_request', 'manage_product_requests', 'product_req_prep',
  'receiving_goods', 'product_req_reports', 'request_reject_reasons', 'pressing', 'olive_pressing', 'events',
  'event_venues', 'event_resources', 'event_types', 'quick_setup', 'products_services',
  'groups', 'divisions', 'categories', 'units', 'locations', 'suppliers',
  'departments', 'lost_goods_reason', 'sizes_groups', 'sizes', 'colors',
  'discounts', 'payment_types', 'currency_setup', 'inventory_brands',
  'inventory_sources', 'delivery_providers'
]);

export type OpsSectionKey =
  // 1. Dashboard Section
  | 'dashboard'
  // 2. Report Section
  | 'reports'
  // 3. Action Sections
  | 'sales'
  | 'quotations'
  | 'delivery_goods'
  | 'purchases'
  | 'purchase_orders'
  | 'reorder_guide'
  | 'transfers'
  | 'lost_goods'
  | 'item_assembly'
  | 'adjustments'
  | 'pressing'
  | 'olive_pressing'
  // 4. Product Request Sections
  | 'product_request'
  | 'manage_product_requests'
  | 'product_req_prep'
  | 'receiving_goods'
  | 'product_req_reports'
  | 'request_reject_reasons'
  // 5. Events Sections
  | 'events'
  | 'event_venues'
  | 'event_resources'
  | 'event_types'
  // 6. Setup Primary Sections
  | 'quick_setup'
  | 'products_services'
  | 'groups'
  | 'divisions'
  | 'categories'
  | 'units'
  | 'locations'
  | 'suppliers'
  | 'departments'
  // 7. Setup More Sections
  | 'lost_goods_reason'
  | 'sizes_groups'
  | 'sizes'
  | 'colors'
  | 'discounts'
  | 'payment_types'
  | 'currency_setup'
  | 'inventory_brands'
  | 'inventory_sources'
  | 'delivery_providers';

function OperationsCenterComponent() {
  const searchParams = useSearchParams();

  const activeSectionParam = searchParams.get('section') as OpsSectionKey | null;
  const activeSection: OpsSectionKey = activeSectionParam || 'dashboard';

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isFullBleedSection = [
    'dashboard',
    'reports',
    'sales',
    'quotations',
    'delivery_goods',
    'purchases',
    'purchase_orders',
    'reorder_guide',
    'lost_goods',
    'item_assembly',
    'transfers',
    'adjustments',
    'product_request',
    'manage_product_requests',
    'product_req_prep',
    'receiving_goods',
    'product_req_reports',
    'request_reject_reasons',
    'pressing',
    'olive_pressing'
  ].includes(activeSection);

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-800 font-sans">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className={isFullBleedSection ? 'flex-1 p-0 m-0' : 'flex-1 p-6 space-y-6'}>
        {/* =========================================================================
            VIEW 1: DASHBOARD
            ========================================================================= */}
        {activeSection === 'dashboard' && <AuthenticVanguardOperationsDashboard />}

        {/* =========================================================================
            VIEW 2: INVENTORY REPORTS
            ========================================================================= */}
        {activeSection === 'reports' && <AuthenticVanguardInventoryReports />}

        {/* =========================================================================
            VIEW 3: SALES
            ========================================================================= */}
        {activeSection === 'sales' && <AuthenticOmegaSalesWorkstation />}

        {/* =========================================================================
            VIEW 4: QUOTATIONS
            ========================================================================= */}
        {activeSection === 'quotations' && <QuotationWorkstation />}

        {/* =========================================================================
            VIEW 5: DELIVERY OF GOODS
            ========================================================================= */}
        {activeSection === 'delivery_goods' && <DeliveryOfGoodsView />}

        {/* =========================================================================
            VIEW 6: PURCHASES
            ========================================================================= */}
        {activeSection === 'purchases' && <PurchasesView />}

        {/* =========================================================================
            VIEW 7: TRANSFERS
            ========================================================================= */}
        {activeSection === 'transfers' && <TransfersView />}

        {/* =========================================================================
            VIEW 8: PURCHASE ORDERS (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'purchase_orders' && <PurchaseOrderView />}

        {/* =========================================================================
            VIEW 9: REORDER GUIDE (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'reorder_guide' && <ReorderGuideView />}

        {/* =========================================================================
            VIEW 10: LOST GOODS (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'lost_goods' && <LostGoodsView />}

        {/* =========================================================================
            VIEW 11: ITEM ASSEMBLY (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'item_assembly' && <ItemAssemblyView />}

        {/* =========================================================================
            VIEW 12: ADJUSTMENTS (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'adjustments' && <AdjustmentsView />}

        {/* =========================================================================
            VIEW 13: PRODUCT REQUEST (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'product_request' && <ProductRequestView />}

        {/* =========================================================================
            VIEW 14: MANAGE PRODUCT REQUESTS (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'manage_product_requests' && <ManageProductRequestsView />}

        {/* =========================================================================
            VIEW 15: PRODUCT REQ. PREPARATION (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'product_req_prep' && <ProductReqPreparationView />}

        {/* =========================================================================
            VIEW 16: RECEIVING OF GOODS (100% AUTHENTIC OMEGA CLONE)
            ========================================================================= */}
        {activeSection === 'receiving_goods' && <ReceivingOfGoodsView />}

        {/* =========================================================================
            VIEW 17: PRESSING MILL CONSOLE (WEIGHBRIDGE, BATCHES, TANKS, SETTLEMENTS)
            ========================================================================= */}
        {(activeSection === 'pressing' || activeSection === 'olive_pressing') && (
          <PressingMillPage />
        )}

        {/* =========================================================================
            OTHER PRODUCT REQUEST SECTIONS (REPORTS, REJECT REASONS)
            ========================================================================= */}
        {(activeSection === 'product_req_reports' ||
          activeSection === 'request_reject_reasons') && (
          <OperationsProductRequestViews section={activeSection as any} />
        )}

        {/* =========================================================================
            EVENTS SECTIONS (EVENTS, VENUES, RESOURCES, TYPES)
            ========================================================================= */}
        {(activeSection === 'events' ||
          activeSection === 'event_venues' ||
          activeSection === 'event_resources' ||
          activeSection === 'event_types') && (
          <OperationsEventsViews section={activeSection as any} />
        )}

        {/* =========================================================================
            SETUP SECTIONS (PRIMARY SETUP + MORE SETUP)
            ========================================================================= */}
        {(activeSection === 'quick_setup' ||
          activeSection === 'products_services' ||
          activeSection === 'groups' ||
          activeSection === 'divisions' ||
          activeSection === 'categories' ||
          activeSection === 'units' ||
          activeSection === 'locations' ||
          activeSection === 'suppliers' ||
          activeSection === 'departments' ||
          activeSection === 'lost_goods_reason' ||
          activeSection === 'sizes_groups' ||
          activeSection === 'sizes' ||
          activeSection === 'colors' ||
          activeSection === 'discounts' ||
          activeSection === 'payment_types' ||
          activeSection === 'currency_setup' ||
          activeSection === 'inventory_brands' ||
          activeSection === 'inventory_sources' ||
          activeSection === 'delivery_providers') && (
          <OperationsSetupViews section={activeSection as any} />
        )}

        {/* =========================================================================
            FALLBACK: UNFINISHED OR INVALID OPERATIONS SECTION
            ========================================================================= */}
        {!HANDLED_OPS_SECTIONS.has(activeSection) && (
          <StandardUnderDevelopmentPlaceholder
            moduleTitle={`Operations: ${activeSection}`}
            moduleCategory="OPERATIONS & PRODUCTION"
            description={`The operational view or workstation "${activeSection}" is currently undergoing active engineering. Core transaction logs remain preserved.`}
            backUrl="/backoffice"
            backLabel="Back to Enterprise Hub"
          />
        )}
      </main>
    </div>
  );
}

export default function AuthenticVanguardOperationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading Vanguard Operations Center...
        </div>
      }
    >
      <OperationsCenterComponent />
    </Suspense>
  );
}
