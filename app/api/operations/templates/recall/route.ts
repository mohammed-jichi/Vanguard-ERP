import { NextRequest, NextResponse } from "next/server";
import { MaterialRequestService } from "@/lib/materialRequestService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template id is required." }, { status: 400 });
    }

    const template = await MaterialRequestService.recallRecurringTemplate(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to recall recurring template" },
      { status: 400 }
    );
  }
}
