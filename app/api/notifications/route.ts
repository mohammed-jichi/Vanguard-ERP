import { NextRequest, NextResponse } from 'next/server';
import { ServerAccountingStorage } from '@/lib/serverAccountingStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const includeResolved = searchParams.get('includeResolved') === 'true';
    const search = searchParams.get('search') || undefined;

    const alertsResult = await ServerAccountingStorage.getSystemAlerts({
      includeResolved,
      search
    });
    const activities = await ServerAccountingStorage.getSystemActivities(limit);

    return NextResponse.json({
      success: true,
      pendingApprovalsCount: alertsResult.pendingApprovalsCount,
      unreadInboxCount: alertsResult.unreadInboxCount,
      activeAlertsCount: alertsResult.activeAlertsCount,
      alerts: alertsResult.alerts,
      activities
    });
  } catch (error: any) {
    console.error('[API /api/notifications GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, user } = body;

    if (action === 'DISMISS_ALERT' && alertId) {
      await ServerAccountingStorage.dismissAlert(alertId, user);
      return NextResponse.json({ success: true, message: `Alert ${alertId} dismissed` });
    }

    if (action === 'MARK_ALL_READ') {
      const count = await ServerAccountingStorage.markAllAlertsAsRead(user);
      return NextResponse.json({ success: true, message: `${count} alerts/messages marked as read`, count });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API /api/notifications POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process notification action' },
      { status: 500 }
    );
  }
}

