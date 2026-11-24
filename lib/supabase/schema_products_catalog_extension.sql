-- Vanguard ERP: Product catalog persistence extension.
-- Run once in the Supabase SQL editor. Safe to re-run.

alter table public.products add column if not exists record jsonb;
create unique index if not exists products_tenant_sku_uidx on public.products (tenant_id, sku);

-- Stock ledger used by Item Maintenance reconciliation.
create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  sku text not null,
  movement_type text not null,          -- e.g. receipt, purchase, sale, issue, adjustment_in, adjustment_out
  quantity numeric not null default 0,
  reference_number text,
  notes text,
  is_reversed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists stock_transactions_tenant_sku_idx on public.stock_transactions (tenant_id, sku);
