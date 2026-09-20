import { NextRequest, NextResponse } from 'next/server';
import { ServerAccountingStorage } from '@/lib/serverAccountingStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await ServerAccountingStorage.getInboxItems({
      category,
      status,
      search
    });

    return NextResponse.json({
      success: true,
      count: result.items.length,
      unreadCount: result.unreadCount,
      pendingApprovalsCount: result.pendingApprovalsCount,
      data: result.items,
      items: result.items
    });
  } catch (error: any) {
    console.error('[API /api/inbox GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inbox messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || body.itemId;
    const { action, notes, user } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { success: false, error: 'Action must be either "APPROVE" or "REJECT"' },
        { status: 400 }
      );
    }

    const result = await ServerAccountingStorage.executeInboxAction({
      id,
      action,
      notes,
      user
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/inbox POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute inbox action' },
      { status: 500 }
    );
  }
}
