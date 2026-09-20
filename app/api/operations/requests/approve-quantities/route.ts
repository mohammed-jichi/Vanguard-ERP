import { NextRequest, NextResponse } from "next/server";
import { MaterialRequestService } from "@/lib/materialRequestService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recordType, recordId, items } = body;

    if (!recordType || !recordId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "recordType, recordId, and items array are required." },
        { status: 400 }
      );
    }

    if (recordType === "PURCHASE_ORDER") {
      const updated = await MaterialRequestService.approvePurchaseOrderQuantities(
        recordId,
        items
      );
      return NextResponse.json({ success: true, updated });
    } else if (recordType === "TRANSFER") {
      const updated = await MaterialRequestService.approveInternalTransferQuantities(
        recordId,
        items
      );
      return NextResponse.json({ success: true, updated });
    } else {
      return NextResponse.json(
        { error: "recordType must be either PURCHASE_ORDER or TRANSFER" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve quantities" },
      { status: 400 }
    );
  }
}
