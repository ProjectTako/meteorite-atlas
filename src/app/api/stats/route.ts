import { NextResponse } from "next/server";
import { getStats } from "@/lib/data";

/** GET /api/stats — precomputed aggregates for the insights panel. */
export function GET() {
  return NextResponse.json(getStats());
}
