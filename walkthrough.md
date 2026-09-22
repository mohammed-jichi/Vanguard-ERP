# Vanguard ERP — Final Implementation Order: PWA Field Apps, Dual-Hub Views, Unified Integration & Tenant Routing

## Executive Overview
This implementation delivers the complete **Vanguard ERP Field Applications & Integration Phase**, comprising:
1. **PWA Mobile Applications (`V-Driver` & `Sales Rep Mobile App`)**: Installable Progressive Web Apps with offline queueing, digital signature capture, SLA countdowns, and quick order conversion.
2. **Dual-View Companion Architecture**: Real-time management consoles for Fleet (`SuperSonicFleetManager`) and Social CRM (`SocialMediaManagementHub`) with administrative overrides (Rerouting, Driver Reassignment, Force-Close POD, and Instant Order Takeover).
3. **Consolidated Database Migration**: Enterprise-grade PostgreSQL/Supabase schema (`lib/supabase/schema_field_apps_hardware_unified_integration.sql`) consolidating online order channels, delivery notes, inventory reservations, hardware profiles, and multi-tenant isolation.
4. **Dynamic Tenant Workspace Routing & Access Guard**: Dynamic resolution of user tenant assignments upon sign-in, directing enterprise users straight to `/[tenant_id]/dashboard`, reserving `/admin` exclusively for Super Admins, and routing Modules 3, 4, and 5 (`customers`, `feedback`, `loyalty`) without 404s.

---

## 1. PWA Field Applications

### A. V-Driver Mobile App (`/v-driver` & `/supersonic/driver`)
- **PWA Manifest & Service Worker**: Configured via [manifest-driver.json](file:///c:/Projects/Vanguard_ERP/public/manifest-driver.json) and [sw-field-apps.js](file:///c:/Projects/Vanguard_ERP/public/sw-field-apps.js).
- **Adaptive Layout**: Dynamically renders across:
  - **Mobile View**: Single-column thumb-friendly cards with swipeable status and immediate call/map shortcuts.
  - **Tablet Console**: Split-pane view with active route list on the left and selected delivery note on the right.
  - **Desktop Panoramic**: Full widescreen operations control board.
- **Glass Digital Signature**: Interactive HTML5 canvas allows recipients to sign directly on screen, captured and submitted as SVG vector data.
- **Multi-Currency Cash Settlement**: Dual-currency COD/Whish accounting (USD and LBP conversion at live market rates).
- **Offline Delivery Queue**: Offline actions are automatically queued in `localStorage.vanguard_driver_offline_queue` and synchronized immediately upon network recovery.

### B. Sales Rep Mobile App (`/sales-rep`)
- **PWA Manifest**: Configured via [manifest-sales.json](file:///c:/Projects/Vanguard_ERP/public/manifest-sales.json).
- **Conversation Stream & SLA Countdown**: Live conversation queue with real-time countdown timer. Orders with $\le 15$ minutes flash amber, and expired SLAs trigger urgent red pulses.
- **1-Click Quick Order Drawer**: Instant drawer for selecting items, reserving inventory (`vanguard_inventory.qty_reserved`), calculating corridor delivery fees, and converting chat inquiries into queued fleet orders with 1 tap.
- **Offline Draft Queue**: Draft orders are saved locally in `localStorage.vanguard_sales_offline_queue` when disconnected and flushed automatically when reconnected.

---

## 2. Dual-View Architecture & Administrative Overrides

```mermaid
graph TD
    subgraph Sales Rep & Management
        SR[Sales Rep PWA: /sales-rep] -->|Submits Order| API_ORDERS[/api/orders]
        MGT_CRM[Social CRM Hub: /backoffice/social-crm] -->|Override & Convert Modal| API_ORDERS
    end

    subgraph Supersonic Fleet
        API_ORDERS -->|Auto-Queued| FLEET_HUB[SuperSonic Hub: Live Companion View]
        FLEET_HUB -->|Corridor Reroute / Driver Reassign / Force-Close POD| API_ORDERS
        API_ORDERS -->|Dispatches Trip| V_DRIVER[V-Driver PWA: /v-driver]
        V_DRIVER -->|POD + Signature + Cash Collected| API_POD[/api/orders/delivery/complete]
    end
```

### A. SuperSonic Hub Companion View (`components/SuperSonicFleetManager.tsx`)
- **Live Companion View (`companion-live`)**: Displays live synchronized trips, active corridors, real-time driver coordinates, and delivered package statuses.
- **Administrative Overrides**:
  - **Corridor Rerouting**: Adjust corridor assignment in real-time when traffic or route priorities shift.
  - **Driver & Vehicle Reassignment**: Reassign orders instantly between active drivers.
  - **Force-Close POD**: Authorize force-closing deliveries with management notes if customer signature cannot be captured on device.

### B. Social CRM Management View (`components/modules/social/SocialMediaManagementHub.tsx`)
- **Override & Convert to Order Modal**: Management can take over conversations locked to offline or delayed reps, adjust item quantities, reserve stock, and push orders directly into the SuperSonic dispatch queue.

---

## 3. Dynamic Tenant Workspace Routing & Access Authorization

### A. Unified Login Form with Company ID
Implemented in [app/login/page.tsx](file:///c:/Projects/Vanguard_ERP/app/login/page.tsx) and [lib/authTenantResolver.ts](file:///c:/Projects/Vanguard_ERP/lib/authTenantResolver.ts):
- **Company ID / Tenant Code Field**: Prominently placed alongside Email Address and Password on `/login`, styled with Vanguard's dark/gold luxury theme. Supports query param auto-prefill (`?companyId=...`).
- **Platform Owner / Super Admin (`ADMIN`)**: Entering `ADMIN` verifies super admin privileges and redirects directly to `/admin` (System Owner Management Console).
- **Tenant Company (`SO-OLIVE`, slug, UUID, or company name)**: Looks up tenant in Supabase (with `withTimeout` safeguard and local seed fallback), resolves tenant identity, sets `isSuperAdmin = false`, and directs user directly to `/[tenant_id]/dashboard` (bypassing `/admin` completely).
- **Session Persistence**: Stores `vanguard_tenant_id`, `vanguard_user_role`, and `vanguard_company_code` across cookies and `localStorage`.

### B. User-to-Tenant Dynamic Resolution
Implemented in [lib/authTenantResolver.ts](file:///c:/Projects/Vanguard_ERP/lib/authTenantResolver.ts):
- Queries Supabase `profiles` and `tenants` tables upon user sign-in to retrieve the user's assigned `tenant_id`, company branding, and role.
- Checks `SUPER_ADMIN_EMAILS` and role flags to distinguish System Owners from regular tenant personnel.
- Automatically stores tenant identity in cookies (`vanguard_tenant_id`, `vanguard_user_role`, `vanguard_company_code`) and client `localStorage`.

### C. Routing Enforcements
1. **Post-Login Redirection** ([app/login/page.tsx](file:///c:/Projects/Vanguard_ERP/app/login/page.tsx) & [app/api/auth/callback/route.ts](file:///c:/Projects/Vanguard_ERP/app/api/auth/callback/route.ts)):
   - **Regular Users**: Routed straight to their tenant workspace dashboard: `/[tenant_id]/dashboard`.
   - **Super Admins**: Routed to `/admin` (System Owner Management Console).
2. **Access Protection Guard** ([middleware.ts](file:///c:/Projects/Vanguard_ERP/middleware.ts)):
   - Unauthenticated visitors attempting to access root `/` or protected routes are sent to `/login`.
   - Non-super-admin users attempting to access `/admin` are strictly blocked and redirected to `/[tenant_id]/dashboard`.
3. **Zero 404 Tenant Workspace Routes**:
   - `/[tenant_id]` $\rightarrow$ Redirects to `/backoffice/dashboard?tenantId=...`
   - `/[tenant_id]/dashboard` $\rightarrow$ Redirects to `/backoffice/dashboard?tenantId=...`
   - `/[tenant_id]/customers` $\rightarrow$ Module 3 (Customer Management & AR)
   - `/[tenant_id]/feedback` $\rightarrow$ Module 4 (Feedback, CSAT & Surveys)
   - `/[tenant_id]/loyalty` $\rightarrow$ Module 5 (Loyalty & VIP Passports)
   - Configured via App Router route handlers and [next.config.js](file:///c:/Projects/Vanguard_ERP/next.config.js) rewrites.

---

## 4. Consolidated Database Migration

File: [lib/supabase/schema_field_apps_hardware_unified_integration.sql](file:///c:/Projects/Vanguard_ERP/lib/supabase/schema_field_apps_hardware_unified_integration.sql)

Key schema provisions:
- **Enum Types**: `online_order_channel`, `online_order_status`, `payment_collection_method`, `hardware_device_category`, `hardware_interface_type`.
- **Inventory & Invoicing Additions**: `qty_reserved`, `plu_code`, `is_scale_item`, `delivery_date`, `delivery_corridor_id`, `proof_signature_svg`.
- **Delivery Notes & Items**: `delivery_notes` and `delivery_note_items` capturing delivery personnel, recipient names, multi-currency receipts, and SVG signature blobs.
- **Platform Orders**: `online_platform_orders` and `online_platform_order_items` supporting full lifecycle from chat stream to SuperSonic corridor dispatch.
- **Hardware Profiles**: `system_hardware_profiles` defining brand-agnostic ESC/POS, label, scale, and display configurations.
- **Multi-Tenant Scoping**: All tables feature foreign key `tenant_id REFERENCES tenants(id)` with dedicated performance indexes.

---

## 5. Verification Results

| Component / Test | Target Route / Module | Status |
|---|---|---|
| **V-Driver PWA Shell** | `/v-driver`, `/supersonic/driver` | ✅ Verified (Install prompt, Responsive layout, Signature canvas) |
| **Sales Rep PWA Shell** | `/sales-rep` | ✅ Verified (SLA timer alerts, Quick Order drawer, Offline sync) |
| **Fleet Companion View** | `components/SuperSonicFleetManager.tsx` | ✅ Verified (Live corridor view, Reroute & Force-Close POD) |
| **CRM Management View** | `components/modules/social/SocialMediaManagementHub.tsx` | ✅ Verified (Override & Convert modal with stock reservation) |
| **Orders API Engine** | `/api/orders` (GET / POST / PATCH) | ✅ Verified (29 / 29 test assertions passed) |
| **Unified Login & Company ID** | `/login`, `lib/authTenantResolver.ts` | ✅ Verified (22 / 22 test assertions passed, Company ID routing) |
| **Tenant Routing & Roles** | `lib/authTenantResolver.ts`, `middleware.ts` | ✅ Verified (Super admins to `/admin`, regular users to `/[tenant_id]/dashboard`) |
| **Modules 3, 4, 5 Dynamic Routes** | `/[tenant_id]/customers`, `feedback`, `loyalty` | ✅ Verified (Zero 404 errors, query context preserved) |
| **Consolidated SQL Schema** | `schema_field_apps_hardware_unified_integration.sql` | ✅ Verified (Multi-tenant columns, indexes, constraints) |
| **Accounting Setup Subtree Refactor** | `components/Sidebar.tsx`, `src/config/navigation.ts` | ✅ Verified (100% Omega ERP parity, vertical guide lines, light tokens) |

---

## 6. Strict Sidebar Refactor — Accounting Setup Subtree Parity

### Hierarchy & Ordering Parity with Omega ERP
1. **Parent Root**:
   - **Label**: `"Setup"` (with collapsible accordion toggle and smooth chevron rotation).
   - **Icon**: `Settings`

2. **Direct Children & Order**:
   1. **Accounts** (direct route): `/backoffice/accounting?section=accounts` (Icon: `BookOpen`)
   2. **Account Auxiliaries** (Collapsible Nested Sub-menu, Icon: `FolderTree`):
      - **Accounts Classes**: `/backoffice/accounting?section=aux_classes` (Icon: `Layers`)
      - **Account Header 1**: `/backoffice/accounting?section=aux_header1` (Icon: `ListFilter`)
      - **Account Header 2**: `/backoffice/accounting?section=aux_header2` (Icon: `ListFilter`)
      - **Account Header 3**: `/backoffice/accounting?section=aux_header3` (Icon: `ListFilter`)
      - **Account Group**: `/backoffice/accounting?section=aux_group` (Icon: `Boxes`)
   3. **Jv Description** (direct route): `/backoffice/accounting?section=aux_jv_desc` (Icon: `FileText`)
   4. **Jv Types** (direct route): `/backoffice/accounting?section=aux_jv_types` (Icon: `Bookmark`)
   5. **Currency** (direct route): `/backoffice/accounting?section=aux_currency` (Icon: `Coins`)
   6. **Currency Rates** (direct route): `/backoffice/accounting?section=aux_currency_rates` (Icon: `TrendingUp`)
   7. **Departments** (Collapsible Nested Sub-menu, Icon: `Building2`):
      - **Department Groups**: `/backoffice/accounting?section=dept_groups` (Icon: `FolderTree`)
      - **Department**: `/backoffice/accounting?section=department` (Icon: `Building`)
      - **Cash Flow Report Setup**: `/backoffice/accounting?section=cash_flow_setup` (Icon: `SlidersHorizontal`)
      - **Sub Department**: `/backoffice/accounting?section=sub_dept` (Icon: `Split`)

### UI & Design System Adherence
- **Vanguard Light Tokens**: Consistently applies `text-foreground`, `text-muted-foreground`, `hover:bg-accent`, and `border-border`.
- **Vertical Guide Lines**: Clean vertical connecting lines (`border-l-2 border-border/80` and `border-border/60`) for all nested tree levels.
- **Independent Collapsible Sub-menus**: Independent accordion states (`acc_setup`, `acc_aux`, `acc_dept`) with smooth 200ms chevron rotation transitions (`transition-transform duration-200`).
- **Semantic Lucide Icons**: Exact semantic icons for every direct item and nested auxiliary/department sub-item.

---

## 7. Removal of Top Horizontal Tab Bar & Dedicated Route Enforcement

### 1. Complete Removal of Horizontal Tab Bars
- **Actions Console Pill Tabs**: Completely deleted the top navigation bar containing:
  - `"1. Journal Vouchers (JV)"`
  - `"2. Purchases & Expenses"`
  - `"3. Payment Vouchers (PV)"`
  - `"4. Receipt Vouchers (RV)"`
  - `"5. AR Aging & CRM"`
  - `"6. AP Aging & Suppliers"`
  - `"7. Bank Reconciliation"`
  - `"8. VAT Closing & COA"`
  from [app/accounting/actions/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/actions/page.tsx).
- **Accounting Layout Sub-navigation Tabs**: Removed redundant top navigation links from [app/accounting/layout.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/layout.tsx) to ensure zero redundant navigation elements exist in page layouts.

### 2. Dedicated Next.js Route Architecture
Each accounting workstation now lives on its own dedicated independent route:

| Route Path | File Location | Target Module | Status |
|---|---|---|---|
| `/accounting/journal-voucher` | [app/accounting/journal-voucher/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/journal-voucher/page.tsx) | Module 1: Journal Vouchers (JV) | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/purchase` | [app/accounting/purchase/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/purchase/page.tsx) | Module 2: Accounting Purchases & Expenses | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/payment` | [app/accounting/payment/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/payment/page.tsx) | Module 3: Accounting Payment Vouchers (PV) | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/receipt` | [app/accounting/receipt/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/receipt/page.tsx) | Module 4: Accounting Receipt Vouchers (RV) | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/receivables` | [app/accounting/receivables/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/receivables/page.tsx) | Module 5: Accounts Receivables (AR Aging & CRM) | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/payables` | [app/accounting/payables/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/payables/page.tsx) | Module 6: Accounts Payables (AP Aging & Suppliers) | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/bank-reconciliation` | [app/accounting/bank-reconciliation/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/bank-reconciliation/page.tsx) | Module 7: Bank Reconciliation Workstation | ✅ HTTP 200 (Tab bar absent) |
| `/accounting/vat-closing` | [app/accounting/vat-closing/page.tsx](file:///c:/Projects/Vanguard_ERP/app/accounting/vat-closing/page.tsx) | Module 8: VAT Period Closing & Declarations | ✅ HTTP 200 (Tab bar absent) |

### 3. Sidebar-First Navigation (Omega ERP Parity)
- Navigation is handled strictly through the sidebar menu (`Actions` and `Setup` sections) in [components/Sidebar.tsx](file:///c:/Projects/Vanguard_ERP/components/Sidebar.tsx) and [src/config/navigation.ts](file:///c:/Projects/Vanguard_ERP/src/config/navigation.ts).
- No tabs, pill buttons, or duplicate links are rendered above the workstation content.

---

## 8. Audit Trail, Notifications & Approval Inbox Integration

- **Server Storage Engine** ([`lib/serverAccountingStorage.ts`](file:///c:/Projects/Vanguard_ERP/lib/serverAccountingStorage.ts)):
  - `PersistedInboxMessage`: Extended database schema to store operational inbox messages linked to real vouchers and expense records.
  - `PersistedSystemActivity`: Real-time audit trail recording every voucher posting, inbox approval/rejection, and expense lifecycle event.
  - `DynamicSystemAlert`: Dynamically computes active alerts based on system state:
    - `APPROVAL_REQUIRED`: Flags vouchers awaiting dual sign-off or exceeding authorization limits (`PV-2026-9042`).
    - `UNCLOSED_CASE`: Detects unsettled expense variances (`EV-2026-8979`).
    - `SECURITY_ALERT`: Captures POS void events.
    - `POSTING_SUCCESS`: Surfaces recent general ledger postings.
  - `executeInboxAction`: Atomically updates inbox item status, marks linked vouchers as posted (`is_posted: true`), computes double-entry balance mutations, inserts GL ledger entries, and records immutable audit entries.
- **Dedicated API Endpoints**:
  - `GET /api/inbox` & `POST /api/inbox` ([`app/api/inbox/route.ts`](file:///c:/Projects/Vanguard_ERP/app/api/inbox/route.ts)): Full CRUD and approval execution engine.
  - `GET /api/notifications` ([`app/api/notifications/route.ts`](file:///c:/Projects/Vanguard_ERP/app/api/notifications/route.ts)): Real-time alerts and live operations activities feed.
- **Approval Inbox UI** ([`app/backoffice/inbox/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/inbox/page.tsx)):
  - Completely replaced hardcoded mock arrays with live database fetch via `/api/inbox`.
  - Wired `Approve` and `Reject` buttons to execute database mutations and GL postings with live toast feedback.
  - Folder counts (All, Approvals, Void & Control, Reports, Memos) calculate dynamically from live data.
- **Header & Drawer Integration** ([`app/backoffice/layout.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/layout.tsx)):
  - Top Header Messages badge dynamically displays `pendingApprovalsCount` from the database.
  - Alerts button shows active notification indicator.
  - Sliding Quick Drawer `ALERTS` tab renders real-time dynamic system alerts with direct action links.
  - Sliding Quick Drawer `ACTIVITIES` tab streams the live Operations Feed with action badges, user attribution, and relative timestamps.

---

## Verification Results (Audit Trail & Inbox)

### 1. Automated Test Suite ([`scratch/test_modular_vouchers.ts`](file:///c:/Projects/Vanguard_ERP/scratch/test_modular_vouchers.ts))
Executed via `npx tsx scratch/test_modular_vouchers.ts`:
- **Double-Entry Balance Calculations**: Passed for all asset, liability, and expense scenarios.
- **Modular Balance Validator**: Passed for balanced and unbalanced line validations.
- **Database PV & RV Retrieval**: Retrieved seeded PV and RV records with correct prefixes.
- **Payment Voucher Mutation**: Created PV with real DB ID, generated 2 GL entries, reduced supplier liability by $1,850.50, reduced bank balance by $1,850.50.
- **Receipt Voucher Mutation**: Created RV with real DB ID, generated 2 GL entries, reduced customer receivable by $3,400.00, increased cash balance by $3,400.00.
- **Contra Voucher Mutation**: Created CV with real DB ID, moved $1,000.00 from bank to cash vault.
- **Validation Rejection**: Unbalanced voucher posting was strictly rejected with error message.
- **Result**: `31 PASSED, 0 FAILED`.

### 2. Approval Inbox & Storage Workflow Test ([`scratch/test_inbox_notifications.ts`](file:///c:/Projects/Vanguard_ERP/scratch/test_inbox_notifications.ts))
Executed via `npx tsx scratch/test_inbox_notifications.ts`:
- **Inbox Items Query**: Retrieved 5 seeded operational messages.
- **Dynamic Alerts**: Generated 8 alerts across `CRITICAL` (approvals), `WARNING` (unclosed cases, voids), and `INFO` (GL postings).
- **Audit Logging**: Recorded operational activities with user attribution.
- **Approval Execution**: Approved `MSG-2026-101`, automatically posted linked voucher `PV-2026-9042` ($18,500.00) to General Ledger, created 2 GL entries, and updated account balances.
- **Result**: `ALL PASSED`.

### 3. End-to-End HTTP Integration Test ([`scratch/test_e2e_approval_flow.ts`](file:///c:/Projects/Vanguard_ERP/scratch/test_e2e_approval_flow.ts))
Executed against running dev server on `http://localhost:3000`:
- `GET /api/inbox`: HTTP 200 (live inbox items retrieved).
- `POST /api/inbox (APPROVE)`: HTTP 200 (executed approval for unclosed expense `EV-2026-8979`).
- `GET /api/notifications`: HTTP 200 (pending count decremented, live activity `INBOX_APPROVAL_GRANTED` immediately surfaced at top of feed).
- `GET /api/accounting/vouchers`: Verified 17 vouchers active in database.
- **Result**: `ALL PASSED`.

### 4. Production Build Validation
- Executed `npm run build`:
  - Turbopack compilation: Succeeded in 21.3s.
  - TypeScript compiler: Passed in 2.6s with 0 errors across all 223 routes.
  - Static page generation: 223/223 pages generated with exit code 0.

---

## 5. Navigation & Landing Route Refactor

### A. Dedicated Sales Dashboard Route (`/dashboard/sales` & `/backoffice/dashboard/sales`)
- **Preservation & Route Separation**:
  - Moved `AuthenticVanguardSalesDashboard` to its dedicated route: [`app/backoffice/dashboard/sales/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/dashboard/sales/page.tsx).
  - Created forwarder route [`app/dashboard/sales/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/dashboard/sales/page.tsx) that forwards requests directly into `/backoffice/dashboard/sales` while maintaining all query parameters.
  - Created route alias [`app/backoffice/sales/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/sales/page.tsx).
  - Updated Sidebar Module 1 (Sales Control) "Dashboard" navigation item from `/backoffice/dashboard` to `/dashboard/sales`.

### B. Primary Enterprise Post-Signin Landing Page / Main Hub (`/backoffice`)
- **Component Architecture**: Built comprehensive [`components/EnterpriseOverviewHub.tsx`](file:///c:/Projects/Vanguard_ERP/components/EnterpriseOverviewHub.tsx):
  - **Executive Tenant Header**: Displays dynamic organization name, Company ID (#1300), subscription tier (PRO Enterprise), active logistics gateways, and real-time clock.
  - **Real-Time KPI Highlights**: Today's gross activity ($12,480.00 / 1,116,960,000 LBP), live pending dual-signoff count with badge, SuperSonic fleet status (12/14 active vehicles), and olive oil tank storage capacity (42,500 L).
  - **Fast Action Launchpad**: Instant shortcuts for New Journal Voucher, Sales/POS, Fleet Radar, Dual-Signoff Approvals, Customers Directory, and Reports Hub.
  - **9 Active Enterprise Modules Grid**: Interactive cards for all 9 modules (Sales Control, Operations, CRM, Feedback, Loyalty, Accounting, HR, Fleet, Social CRM) with feature descriptions, sub-screen quick-links, and active license status.
  - **Live Audit & Operations Feed**: Integrated directly with `/api/notifications` to display real-time system activities and approvals.
- **Entry Routes**:
  - [`app/backoffice/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/page.tsx) serves as the primary Enterprise Overview Portal at `/backoffice`.
  - [`app/backoffice/dashboard/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/dashboard/page.tsx) renders `EnterpriseOverviewHub`, preventing any legacy link or bookmark from misrouting users to the sales dashboard.
  - [`app/dashboard/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/dashboard/page.tsx) cleanly redirects authenticated visitors to `/backoffice`.
  - [`app/[tenant_id]/dashboard/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/[tenant_id]/dashboard/page.tsx) and [`app/[tenant_id]/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/[tenant_id]/page.tsx) forward directly into `/backoffice` with the active tenant context.
  - [`app/workspace/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/workspace/page.tsx), [`app/workspace/[workspaceId]/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/workspace/[workspaceId]/page.tsx), and [`app/erp/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/erp/page.tsx) forward directly to `/backoffice`.

### C. Universal Brand Logo, Breadcrumb Roots & Home Icon Updates
All logo links, header and sidebar Home icons, and breadcrumb roots across all modules were updated to point to the primary landing route (`/backoffice`):
- **Master Header Logo**: [`app/backoffice/layout.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/layout.tsx) updated line 242 `<Link href="/backoffice" ...>`.
- **Top Header Home Icon**: [`app/backoffice/layout.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/layout.tsx) updated line 296 `<Link href="/backoffice" ... title="Enterprise Main Hub">`.
- **Sidebar Home Icon**: [`components/Sidebar.tsx`](file:///c:/Projects/Vanguard_ERP/components/Sidebar.tsx) updated line 243 `<Link href="/backoffice" ... title="Enterprise Main Hub">`.
- **Breadcrumb Roots**:
  - Accounting Reports: [`app/backoffice/accounting/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/accounting/page.tsx)
  - Fleet Reports: [`app/backoffice/fleet/reports/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/fleet/reports/page.tsx) & [`app/backoffice/fleet/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/fleet/page.tsx) ("Return to Main Hub")
  - Loyalty Reports: [`app/backoffice/loyalty/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/loyalty/page.tsx)
  - Social CRM Reports: [`app/backoffice/social-crm/reports/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/social-crm/reports/page.tsx)
  - Sales Control Reports: [`app/backoffice/reportview/[[...slug]]/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/reportview/[[...slug]]/page.tsx)
  - Operations Reports: [`app/backoffice/operations/InventoryReportsView.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/operations/InventoryReportsView.tsx)
  - Master Report Layout Fallback: [`components/reports/ReportPageLayout.tsx`](file:///c:/Projects/Vanguard_ERP/components/reports/ReportPageLayout.tsx)
  - Sub-screen breadcrumbs: Discounts, Zone Setup, Workstations & Printers, Void Reasons, VAT Exemptions, Screens, Price Modes, Online Orders, Message on Invoice, Currency Setup.
  - POS, VTrack, and License return links: [`app/pos/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/pos/page.tsx), [`components/pos/PosCommandModal.tsx`](file:///c:/Projects/Vanguard_ERP/components/pos/PosCommandModal.tsx), [`app/vtrack/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/vtrack/page.tsx), [`app/backoffice/license/page.tsx`](file:///c:/Projects/Vanguard_ERP/app/backoffice/license/page.tsx).

---

## Verification Results (Navigation & Routing Refactor)

### 1. Automated HTTP Integration Tests ([`scratch/test_navigation_routing.ts`](file:///c:/Projects/Vanguard_ERP/scratch/test_navigation_routing.ts))
Executed via `npx tsx scratch/test_navigation_routing.ts`:
- **Test 1**: `GET /dashboard` $\rightarrow$ 307 redirect directly to `/backoffice` (PASS).
- **Test 2**: `GET /dashboard/sales` $\rightarrow$ 307 redirect directly to `/backoffice/dashboard/sales` (PASS).
- **Test 3**: `GET /[tenantId]/dashboard` $\rightarrow$ Routes directly to Enterprise Overview Hub with active tenant context (PASS).
- **Test 4**: `GET /workspace` $\rightarrow$ 307 redirect to `/backoffice?tenantId=...` (PASS).
- **Test 5**: `GET /backoffice` $\rightarrow$ HTTP 200 OK, renders `Enterprise Overview Hub | Vanguard ERP` (PASS).
- **Test 6**: `GET /backoffice/dashboard` $\rightarrow$ HTTP 200 OK, renders `Enterprise Overview Hub | Vanguard ERP` (PASS).
- **Test 7**: `GET /backoffice/dashboard/sales` $\rightarrow$ HTTP 200 OK, renders `AuthenticVanguardSalesDashboard` (PASS).
- **Result**: `12 PASSED, 0 FAILED`.

### 2. Full Production Build Validation
- Executed `npx tsc --noEmit`: Exited with code 0 (0 TypeScript errors).
- Executed `npm run build`:
  - Turbopack compilation: Succeeded in 29.9s.
  - TypeScript compiler: Finished in 2.2s with 0 errors.
  - Static page generation: 227/227 pages cleanly generated with exit code 0.

---

## 15. Fiscal Profile: Country Dropdown & Financial Template Mapping

### A. Searchable Country Jurisdiction Dropdown
- **Country Selector**: Replaced the plain-text "Country" input in Tab "2. Corporate & Fiscal" of the Tenant Modal with a modern **Searchable Country Dropdown** (select menu).
- **Default Value**: Set strictly to **"Lebanon"** (`🇱🇧 Lebanon`, code `LB`).
- **Catalog**: Integrated complete country registry ([`lib/countryFiscalProfiles.ts`](file:///c:/Projects/Vanguard_ERP/lib/countryFiscalProfiles.ts)) spanning Lebanon, UAE, Saudi Arabia, Qatar, Kuwait, Jordan, Egypt, Iraq, USA, UK, France, Germany, Canada, Cyprus, Turkey, and Global International.
- **Fast Search & Selection**: Includes auto-focus live search input filtering by country name, ISO code, and template keywords with visual flag indicators, code pills, and keyboard navigation.

### B. Fiscal & Chart of Accounts Auto-Binding
- **Automatic Template Binding**:
  - **Lebanon (`🇱🇧 Lebanon`)**:
    - **Chart of Accounts**: Plan Comptable Général Libanais (`PCGL` / `lebanese_pca`), 5-digit structure across classes 1–7 (`53000 Cash`, `51210 Bank`, `40110 Suppliers`).
    - **Fiscal Tax Rule**: VAT 11% (`TVA Libanaise`).
    - **Regulatory Identifiers**: Tax ID Number (`MOF / الرقم المالي - وزارة المالية`), Commercial Registration (`CR / السجل التجاري`).
    - **Regulatory Framework**: Lebanese Code of Commerce & Decree 4256/81.
  - **International / Other (`🌐 International`, `🇦🇪 UAE`, `🇸🇦 Saudi Arabia`, etc.)**:
    - **Chart of Accounts**: Standard IFRS Dual-Currency Chart of Accounts (`international_ifrs`), 4-digit structure (`1000s Assets`, `2000s Liabilities`, `3000s Equity`, `4000s Revenue`, `5000s-6000s Expenses`).
    - **Fiscal Tax Rule**: Regional/national VAT (e.g., UAE 5%, Saudi 15%, UK 20%, Global standard 15%).
    - **Regulatory Identifiers**: Tax Identification Number (`TRN / TIN / Tax ID`), Company Registration Number (`CRN / Legal Entity ID`).
- **Interactive Fiscal Binding Panel**:
  - Live specifications card displaying the bound Financial Seed Template with `PCGL` vs `IFRS` badges, national tax rate, and law-compliant identifier mapping.
  - Template override dropdown allowing Super Admins to manually switch between PCGL, IFRS, or Custom Blank if required.
- **Persistence & Workspace Activation**:
  - Persisted in Supabase `tenants.feature_flags.corporate_profile` (`country`, `financial_seed_template`, `vat_percentage`, `tax_id_label`, `cr_label`) and `TenantCompany` context.
  - When entering a workspace (`handleEnterWorkspace`), the tenant's bound CoA template is dynamically activated via `applyCoaPreset` and synced to `localStorage.vanguard_accounting_coa_preset_id`.
  - Added Country Dropdown and auto-binding indicator to the "Provision New Client Form" (Add New Tenant modal).
  - Enriched expandable table sub-row with an instant Jurisdiction and CoA template status strip.

### C. Validation & Verification
- `npx tsc --noEmit`: Exited with code 0 (0 errors).
- `npm run build`: Compiled all 246 static and dynamic routes successfully with Turbopack (code 0).


