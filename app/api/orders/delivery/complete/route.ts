import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      invoiceId,
      driverId,
      driverName,
      paymentMethod,
      collectedUsd,
      collectedLbp,
      signatureSvg,
      signatureUrl,
      items
    } = body;

    const targetTenantId = body.tenantId || '00000000-0000-0000-0000-000000000001';
    const effectiveSig = signatureUrl || signatureSvg || 'data:image/svg+xml;utf8,<svg></svg>';

    // 1. Update public.orders status to Delivered
    if (orderId) {
      await supabase
        .from('orders')
        .update({
          status: 'Delivered',
          delivery_status: 'Delivered',
          signature_url: effectiveSig,
          pod_signature: effectiveSig,
          collected_cash_usd: Number(collectedUsd) || 0,
          collected_cash_lbp: Number(collectedLbp) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
    }

    // 2. Insert into public.driver_run_sheets
    await supabase
      .from('driver_run_sheets')
      .insert([{
        tenant_id: targetTenantId,
        driver_id: driverId || 'DRV-101',
        driver_name: driverName || 'Field Delivery Driver',
        order_id: orderId || `ord-${Date.now()}`,
        order_number: invoiceId || `INV-${Date.now()}`,
        collected_usd: Number(collectedUsd) || 0,
        collected_lbp: Number(collectedLbp) || 0,
        payment_method: paymentMethod || 'COD',
        signature_url: effectiveSig,
        status: 'DELIVERED',
        created_at: new Date().toISOString()
      }]);

    // 3. Dual-persist to feature_flags
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', targetTenantId)
        .maybeSingle();

      const flags = tenantData?.feature_flags || {};
      const runSheets = Array.isArray(flags.driver_run_sheets) ? flags.driver_run_sheets : [];
      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...flags,
            driver_run_sheets: [{
              id: `drs-${Date.now()}`,
              driverId,
              driverName,
              orderId,
              invoiceId,
              collectedUsd,
              collectedLbp,
              signatureUrl: effectiveSig,
              status: 'DELIVERED',
              timestamp: new Date().toISOString()
            }, ...runSheets].slice(0, 100)
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', targetTenantId);
    } catch (ffErr) {
      console.warn('Dual-persist run sheets notice:', ffErr);
    }

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} marked as DELIVERED, POD signature registered, and driver run sheet credited.`,
      signatureUrl: effectiveSig
    });
  } catch (err: any) {
    console.error('Complete delivery error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
