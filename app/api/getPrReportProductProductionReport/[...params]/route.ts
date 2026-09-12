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
    const reportBranch = parts[3];
    const prstatus = parts[4];
    const dateByDelivery = parts[5];
    const itemType = parts[6];

    const reportData = ProductRequestService.generateReportData({
      reportId: 406,
      from,
      to,
      reportBranch,
      prstatus,
      dateByDelivery,
      itemType,
      exportType
    });

    if (exportType === 'csv' || exportType === 'xlsx') {
      const csvHeader = 'Category,Item Code,Description,Unit,Total Needed,Branch Breakdown,Target Date\n';
      const rows: string[] = [];
      (reportData.groups || []).forEach((grp: any) => {
        (grp.items || []).forEach((it: any) => {
          rows.push(
            `"${grp.category}","${it.ITEMCODE}","${it.ITEMDESCRIPTION}","${it.UNIT}",${it.TOTAL_REQUIRED},"${it.branchSummary}","${it.TARGET_DATE}"`
          );
        });
      });

      return new NextResponse(csvHeader + rows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="PR_Production_Report_${from}_${to}.csv"`
        }
      });
    }

    const html = ProductRequestService.generateJasperHtmlReport(reportData);
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('getPrReportProductProductionReport error:', error);
    return new NextResponse('Report generation failed', { status: 500 });
  }
}
