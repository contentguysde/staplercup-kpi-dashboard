import { NextResponse, type NextRequest } from "next/server";
import { fetchReplyStats } from "@/lib/stats-api";

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;

  if (year !== undefined && (!Number.isFinite(year) || year < 2020 || year > 2100)) {
    return NextResponse.json({ error: "invalid_year" }, { status: 400 });
  }

  try {
    const data = await fetchReplyStats(year);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (err) {
    // Neutraler Fallback — keine Upstream-Details an den Client durchreichen
    console.error("[/api/stats/replies] Upstream-Fehler:", err);
    return NextResponse.json({ error: "unavailable" }, { status: 200 });
  }
}
