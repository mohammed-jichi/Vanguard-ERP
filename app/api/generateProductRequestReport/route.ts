import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const reportData = ProductRequestService.generateReportData({
      reportId: body.reportId || 405,
      from: body.from,
      to: body.to,
      dateByDelivery: body.dateByDelivery,
      itemType: body.itemType,
      reportFromBranch: body.reportFromBranch,
      reportBranch: body.reportBranch,
      prstatus: body.prstatus,
      sd_groupId: body.sd_groupId,
      exportType: body.exportType || 'html'
    });

    const html = ProductRequestService.generateJasperHtmlReport(reportData);

    return NextResponse.json({
      success: true,
      data: reportData,
      html
    });
  } catch (error) {
    console.error('generateProductRequestReport error:', error);
    return NextResponse.json({ error: 'Failed to generate product request report' }, { status: 500 });
  }
}
