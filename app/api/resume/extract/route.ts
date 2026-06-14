import { NextRequest, NextResponse } from "next/server";
import { extractProfileFromPDF } from "@/agent/extractor";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extracted = await extractProfileFromPDF(buffer);
    return NextResponse.json({ data: extracted });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Extraction failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
