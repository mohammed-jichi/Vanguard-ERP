import { NextRequest, NextResponse } from "next/server";
import { MaterialRequestService } from "@/lib/materialRequestService";
import { RecurringTransactionType } from "@/types/material-requests";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") as RecurringTransactionType) || undefined;
    const templates = await MaterialRequestService.getRecurringTemplates(type);
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch recurring templates" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateName, transactionType, sourceBranchId, destinationBranchId, notes, createdBy, items } = body;

    if (!templateName || !transactionType || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "templateName, transactionType, and items array are required." },
        { status: 400 }
      );
    }

    const template = await MaterialRequestService.storeRecurringTemplate({
      templateName,
      transactionType,
      sourceBranchId,
      destinationBranchId,
      notes,
      createdBy,
      items,
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to store recurring template" },
      { status: 400 }
    );
  }
}
