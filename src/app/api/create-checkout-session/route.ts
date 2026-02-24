import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey, { maxNetworkRetries: 0 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: process.env.STRIPE_PRICE_ID!.trim(), quantity: 1 },
      ],
      customer_email: user.email,
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      payment_method_collection: "if_required",
      success_url: "https://nextvideo.youtubeproducer.app?upgrade=success",
      cancel_url: "https://nextvideo.youtubeproducer.app",
    });
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const e = err as { message?: string; type?: string; code?: string };
    console.error("Stripe error:", e.type, e.code, e.message);
    return NextResponse.json(
      { error: e.message, type: e.type, code: e.code },
      { status: 500 }
    );
  }
}
