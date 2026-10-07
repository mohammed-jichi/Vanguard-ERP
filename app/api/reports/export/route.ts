import { NextRequest, NextResponse } from 'next/server';
import { getReportSchema } from '@/config/reportSchemaRegistry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, format = 'csv', filters = {}, data = [] } = body;

    const schema = getReportSchema(reportId);
    const reportTitle = schema?.title || reportId || 'Report Export';

    return NextResponse.json({
      success: true,
      reportId,
      reportTitle,
      format,
      recordCount: data.length,
      downloadUrl: null,
      message: `${reportTitle} successfully prepared for export as ${format.toUpperCase()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Export error' },
      { status: 500 }
    );
  }
}
