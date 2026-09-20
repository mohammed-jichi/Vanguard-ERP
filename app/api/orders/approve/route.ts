import { NextRequest, NextResponse } from "next/server";
import { approveAndQueueOrderToFleet } from "@/lib/orderApprovalWorkflow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, repCode, corridorId } = body;

    if (!orderId || !repCode || corridorId === undefined) {
      return NextResponse.json(
        { error: "orderId, repCode, and corridorId are required." },
        { status: 400 }
      );
    }

    const result = await approveAndQueueOrderToFleet({
      orderId,
      repCode,
      corridorId: Number(corridorId),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve and queue order" },
      { status: 400 }
    );
  }
}
