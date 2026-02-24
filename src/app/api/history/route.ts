import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken, getHistory } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  let userId: string | undefined;
  if (token) {
    const user = await getUserFromToken(token);
    if (user) userId = user.id;
  }

  const { data, error } = await getHistory(userId, sessionId || undefined);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ generations: data || [] });
}
