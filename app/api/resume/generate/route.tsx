import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { generateResume } from "@/agent/resume-generator";
import { ResumePDF } from "@/agent/resume-pdf";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();

    if (!profile?.full_name) {
      return NextResponse.json(
        { error: "Profile incomplete. Please fill in your name and save your profile before generating." },
        { status: 400 }
      );
    }

    const generated = await generateResume(profile);
    const buffer = await renderToBuffer(<ResumePDF profile={profile} generated={generated} />);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
