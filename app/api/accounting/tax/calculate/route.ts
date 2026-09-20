import { NextRequest, NextResponse } from "next/server";
import {
  calculateVanguardTax,
  AdvancedAccountingService,
} from "@/lib/advancedAccountingService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baseAmount, taxRate, applyRounding, taxCode } = body;

    if (baseAmount === undefined || baseAmount === null) {
      return NextResponse.json({ error: "baseAmount is required." }, { status: 400 });
    }

    if (taxRate !== undefined && taxRate !== null) {
      const calculatedTax = calculateVanguardTax(
        Number(baseAmount),
        Number(taxRate),
        Boolean(applyRounding)
      );
      return NextResponse.json({
        baseAmount: Number(baseAmount),
        taxRate: Number(taxRate),
        calculatedTax,
        roundingApplied: Boolean(applyRounding),
      });
    }

    const result = await AdvancedAccountingService.computeTaxForAmount(
      Number(baseAmount),
      taxCode || "VAT_11",
      applyRounding !== undefined ? Boolean(applyRounding) : undefined
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to calculate tax" },
      { status: 400 }
    );
  }
}
