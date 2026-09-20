import { NextRequest, NextResponse } from 'next/server';
import { ServerAccountingStorage } from '@/lib/serverAccountingStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const jvType = searchParams.get('type') || searchParams.get('jvType') || undefined;

    const vouchers = await ServerAccountingStorage.getVouchers({
      search,
      status,
      dateFrom,
      dateTo,
      jvType
    });

    return NextResponse.json({
      success: true,
      count: vouchers.length,
      data: vouchers,
      vouchers: vouchers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Modular Action: Payment Voucher (PV)
    if (body.action === 'SAVE_PAYMENT') {
      const payload = body.payload || body;
      const result = await ServerAccountingStorage.savePaymentVoucher(payload);
      const isPosted = Boolean(payload.postImmediately);
      return NextResponse.json({
        success: true,
        message: isPosted
          ? `Payment Voucher ${result.voucher.jv_number} posted and GL ledger updated.`
          : `Payment Voucher ${result.voucher.jv_number} saved as draft to database.`,
        id: result.voucher.id,
        jv_number: result.voucher.jv_number,
        is_posted: result.voucher.is_posted,
        posted_at: result.voucher.posted_at,
        timestamp: new Date().toISOString(),
        data: result.voucher,
        updatedAccounts: result.updatedAccounts,
        glEntriesCount: result.glEntriesCreated
      });
    }

    // 2. Modular Action: Receipt Voucher (RV)
    if (body.action === 'SAVE_RECEIPT') {
      const payload = body.payload || body;
      const result = await ServerAccountingStorage.saveReceiptVoucher(payload);
      const isPosted = Boolean(payload.postImmediately);
      return NextResponse.json({
        success: true,
        message: isPosted
          ? `Receipt Voucher ${result.voucher.jv_number} posted and GL ledger updated.`
          : `Receipt Voucher ${result.voucher.jv_number} saved as draft to database.`,
        id: result.voucher.id,
        jv_number: result.voucher.jv_number,
        is_posted: result.voucher.is_posted,
        posted_at: result.voucher.posted_at,
        timestamp: new Date().toISOString(),
        data: result.voucher,
        updatedAccounts: result.updatedAccounts,
        glEntriesCount: result.glEntriesCreated
      });
    }

    // 3. Modular Action: Contra Voucher (CV)
    if (body.action === 'SAVE_CONTRA') {
      const payload = body.payload || body;
      const result = await ServerAccountingStorage.saveContraVoucher(payload);
      const isPosted = Boolean(payload.postImmediately);
      return NextResponse.json({
        success: true,
        message: isPosted
          ? `Contra Voucher ${result.voucher.jv_number} posted and GL ledger updated.`
          : `Contra Voucher ${result.voucher.jv_number} saved as draft to database.`,
        id: result.voucher.id,
        jv_number: result.voucher.jv_number,
        is_posted: result.voucher.is_posted,
        posted_at: result.voucher.posted_at,
        timestamp: new Date().toISOString(),
        data: result.voucher,
        updatedAccounts: result.updatedAccounts,
        glEntriesCount: result.glEntriesCreated
      });
    }

    // 4. Default Generic Voucher Mutation
    const voucherData = body.voucher || body;
    const lines = body.lines || voucherData.lines || [];
    const postImmediately = Boolean(body.postImmediately ?? voucherData.is_posted);
    const user = body.user || voucherData.created_by || 'Super Admin (Finance Controller)';

    if (!voucherData.description) {
      return NextResponse.json(
        { success: false, error: 'Voucher description / label is required' },
        { status: 400 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Voucher lines are required' },
        { status: 400 }
      );
    }

    // Execute atomic transaction
    const result = await ServerAccountingStorage.saveVoucherTransaction({
      voucher: voucherData,
      lines,
      postImmediately,
      user
    });

    return NextResponse.json({
      success: true,
      message: postImmediately
        ? `Voucher ${result.voucher.jv_number} successfully posted and GL entries created.`
        : `Voucher ${result.voucher.jv_number} saved as draft.`,
      id: result.voucher.id,
      jv_number: result.voucher.jv_number,
      is_posted: result.voucher.is_posted,
      posted_at: result.voucher.posted_at,
      timestamp: new Date().toISOString(),
      data: result.voucher,
      voucher: result.voucher,
      updatedAccounts: result.updatedAccounts,
      glEntriesCount: result.glEntriesCreated,
      glEntries: (result.voucher as any).gl_entries || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to persist voucher' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Voucher id is required' },
        { status: 400 }
      );
    }

    const deleted = await ServerAccountingStorage.deleteVoucher(id);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Voucher successfully removed' : 'Voucher not found'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete voucher' },
      { status: 500 }
    );
  }
}
