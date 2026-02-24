import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { type, message, email } = body || {};

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const subject = `[Next Video] ${type || "Feedback"} from ${email || "anonymous"}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "YouTube Producer <hello@youtubeproducer.app>",
        to: "hi@beckyisj.com",
        reply_to: email && email !== "anonymous" ? email : undefined,
        subject,
        text: `Type: ${type || "feedback"}\nFrom: ${email || "anonymous"}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Resend error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Send feedback error:", e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
