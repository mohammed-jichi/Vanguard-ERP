import { NextRequest, NextResponse } from "next/server";
import { completeDriverDelivery } from "@/lib/driverDeliveryWorkflow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      invoiceId,
      driverId,
      driverName,
      paymentMethod,
      collectedUsd,
      collectedLbp,
      signatureSvg,
      items,
    } = body;

    if (!orderId || !invoiceId || !driverId || !driverName || !paymentMethod || !items) {
      return NextResponse.json(
        {
          error:
            "orderId, invoiceId, driverId, driverName, paymentMethod, and items are required.",
        },
        { status: 400 }
      );
    }

    const result = await completeDriverDelivery({
      orderId,
      invoiceId,
      driverId,
      driverName,
      paymentMethod,
      collectedUsd: Number(collectedUsd || 0),
      collectedLbp: Number(collectedLbp || 0),
      signatureSvg: signatureSvg || "",
      items: Array.isArray(items) ? items : [],
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete driver delivery" },
      { status: 400 }
    );
  }
}
