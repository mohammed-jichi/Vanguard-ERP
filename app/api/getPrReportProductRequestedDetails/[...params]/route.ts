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
    const dateByDelivery = parts[3];
    const itemType = parts[4];
    const reportFromBranch = parts[5];
    const reportBranch = parts[6];
    const prstatus = parts[7];

    const reportData = ProductRequestService.generateReportData({
      reportId: 407,
      from,
      to,
      dateByDelivery,
      itemType,
      reportFromBranch,
      reportBranch,
      prstatus,
      exportType
    });

    if (exportType === 'csv' || exportType === 'xlsx') {
      const csvHeader = 'PR #,Date,Branch,From Branch,Item Code,Description,Unit,Qty Req,Qty App,Qty Rec,Cost,Total,Status,Remark\n';
      const csvRows = (reportData.rows || [])
        .map(
          (r: any) =>
            `"${r.REQUESTNB}","${r.DATE}","${r.BRANCH}","${r.FROMBRANCH}","${r.ITEMCODE}","${r.ITEMDESCRIPTION}","${r.UNIT}",${r.QTYREQ},${r.QTYAPP},${r.QTYREC},${r.COST},${r.TOTAL_COST},"${r.STATUS}","${r.REMARK}"`
        )
        .join('\n');

      return new NextResponse(csvHeader + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="PR_Products_Requested_Details_${from}_${to}.csv"`
        }
      });
    }

    const html = ProductRequestService.generateJasperHtmlReport(reportData);
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('getPrReportProductRequestedDetails error:', error);
    return new NextResponse('Report generation failed', { status: 500 });
  }
}
