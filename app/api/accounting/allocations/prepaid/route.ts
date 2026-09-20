import { NextRequest, NextResponse } from "next/server";
import { AdvancedAccountingService } from "@/lib/advancedAccountingService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const allocations = await AdvancedAccountingService.getPrepaidAllocations(status);
    return NextResponse.json({ success: true, allocations });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch prepaid allocations" },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "amortize") {
      const { allocationId, departmentId } = body;
      if (!allocationId) {
        return NextResponse.json({ error: "allocationId is required for amortization" }, { status: 400 });
      }
      const result = await AdvancedAccountingService.processMonthlyPrepaidAmortization(
        allocationId,
        departmentId
      );
      return NextResponse.json(result);
    }

    const {
      originVoucherId,
      prepaidAssetAccountId,
      expenseTargetAccountId,
      totalAmount,
      totalMonths,
      startDate,
    } = body;

    if (
      !originVoucherId ||
      !prepaidAssetAccountId ||
      !expenseTargetAccountId ||
      totalAmount === undefined ||
      totalMonths === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "originVoucherId, prepaidAssetAccountId, expenseTargetAccountId, totalAmount, and totalMonths are required.",
        },
        { status: 400 }
      );
    }

    const allocation = await AdvancedAccountingService.createPrepaidExpenseAllocation({
      originVoucherId,
      prepaidAssetAccountId,
      expenseTargetAccountId,
      totalAmount: Number(totalAmount),
      totalMonths: Number(totalMonths),
      startDate,
    });

    return NextResponse.json({ success: true, allocation });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process prepaid allocation request" },
      { status: 400 }
    );
  }
}
