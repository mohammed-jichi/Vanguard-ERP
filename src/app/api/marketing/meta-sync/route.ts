import { NextResponse } from 'next/server';

/**
 * ============================================================================
 * VANGUARD ERP - META MARKETING API LIVE SYNC ROUTE
 * Organization: Southern Olive Oil Products S.A.R.L
 * ============================================================================
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adAccountId, accessToken } = body;

    const targetAdAccount = adAccountId || process.env.META_AD_ACCOUNT_ID;
    const targetToken = accessToken || process.env.META_SYSTEM_USER_TOKEN;

    if (!targetToken || !targetAdAccount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Meta credentials (Ad Account ID or System User Access Token).',
        },
        { status: 400 }
      );
    }

    // Clean account ID prefix
    const cleanAccountId = targetAdAccount.startsWith('act_')
      ? targetAdAccount
      : `act_${targetAdAccount}`;

    console.log(`[Vanguard ERP] Fetching live insights for: ${cleanAccountId}`);

    // Call Meta Graph API v19.0 Insights Endpoint
    const metaUrl = `https://graph.facebook.com/v19.0/${cleanAccountId}/insights?fields=campaign_name,spend,impressions,clicks,actions&date_preset=this_month&access_token=${targetToken}`;

    const response = await fetch(metaUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.error) {
      console.error('[Meta Marketing API Error]:', data.error);
      return NextResponse.json(
        {
          success: false,
          error: data.error.message,
          metaErrorCode: data.error.code,
        },
        { status: 502 }
      );
    }

    // Process and normalize campaign data
    const normalizedCampaigns = (data.data || []).map((item: any, idx: number) => {
      const spend = parseFloat(item.spend || '0');
      // Extract leads from actions array
      const leadAction = (item.actions || []).find(
        (a: any) => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped'
      );
      const leads = leadAction ? parseInt(leadAction.value || '0', 10) : 0;
      const cpl = leads > 0 ? spend / leads : 0.0;

      return {
        id: `META-SYNC-0${idx + 1}`,
        name: item.campaign_name || 'Active Campaign',
        platform: 'Meta Ads (Instagram & FB)',
        spendUsd: spend,
        totalLeads: leads,
        overallCplUsd: parseFloat(cpl.toFixed(2)),
        status: 'SYNCED_LIVE',
      };
    });

    return NextResponse.json({
      success: true,
      company: 'Southern Olive Oil Products S.A.R.L',
      syncedAt: new Date().toISOString(),
      campaignsCount: normalizedCampaigns.length,
      data: normalizedCampaigns,
    });
  } catch (error: any) {
    console.error('[Marketing API Sync Internal Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
