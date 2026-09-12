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
    const sd_groupId = parts[8];

    const reportData = ProductRequestService.generateReportData({
      reportId: 405,
      from,
      to,
      dateByDelivery,
      itemType,
      reportFromBranch,
      reportBranch,
      prstatus,
      sd_groupId,
      exportType
    });

    if (exportType === 'csv' || exportType === 'xlsx') {
      const csvHeader = 'Item Code,Description,Unit,Qty Req,Qty App,Qty Rec,Unit Cost,Total Cost,Branches\n';
      const csvRows = (reportData.rows || [])
        .map(
          (r: any) =>
            `"${r.ITEMCODE}","${r.ITEMDESCRIPTION}","${r.UNIT}",${r.QTYREQ},${r.QTYAPP},${r.QTYREC},${r.COST},${r.TOTAL_COST},"${r.BRANCHES}"`
        )
        .join('\n');

      return new NextResponse(csvHeader + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="PR_Qty_Requested_by_Item_${from}_${to}.csv"`
        }
      });
    }

    const html = ProductRequestService.generateJasperHtmlReport(reportData);
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('getPrReportQtyRequestedByItem error:', error);
    return new NextResponse('Report generation failed', { status: 500 });
  }
}
