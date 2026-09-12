import { NextRequest, NextResponse } from 'next/server';
import { ProductRequestService } from '@/lib/productRequestService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const rawPath = (resolvedParams.params || []).join('/');
    const parts = decodeURIComponent(rawPath).split('&');

    const exportType = parts[0] || 'html';
    const from = parts[1];
    const to = parts[2];
    const reportFromBranch = parts[3];
    const reportBranch = parts[4];
    const prstatus = parts[5];
    const dateByDelivery = parts[6];
    const itemType = parts[7];

    const reportData = ProductRequestService.generateReportData({
      reportId: 409,
      from,
      to,
      reportFromBranch,
      reportBranch,
      prstatus,
      dateByDelivery,
      itemType,
      exportType
    });

    if (exportType === 'csv' || exportType === 'xlsx') {
      const csvHeader = 'PR #,Branch,Item Code,Description,Unit,Qty Req,Qty App,Diff,Status,Item Remark,PR Remark,Reject Reason\n';
      const csvRows = (reportData.rows || [])
        .map(
          (r: any) =>
            `"${r.REQUESTNB}","${r.BRANCH}","${r.ITEMCODE}","${r.ITEMDESCRIPTION}","${r.UNIT}",${r.QTYREQ},${r.QTYAPP},${r.DIFF},"${r.STATUS}","${r.ITEM_REMARK}","${r.PR_REMARK}","${r.REJECT_REASON}"`
        )
        .join('\n');

      return new NextResponse(csvHeader + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="PR_Items_Requested_With_Remark_${from}_${to}.csv"`
        }
      });
    }

    const html = ProductRequestService.generateJasperHtmlReport(reportData);
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('getPrReportItemsRequestedWithRemarkReport error:', error);
    return new NextResponse('Report generation failed', { status: 500 });
  }
}
