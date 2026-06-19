import { NextRequest, NextResponse } from "next/server";
import { getRecords } from "@/lib/data";
import type { Meteorite } from "@/lib/types";

/**
 * GET /api/meteorites
 *
 * Query params (all optional):
 *   group   — filter by family (repeatable: ?group=Iron&group=Achondrite)
 *   fall    — "Fell" | "Found"
 *   minYear, maxYear
 *   minMass, maxMass  (grams)
 *   q       — case-insensitive name substring
 *   limit   — page size (default 100, max 1000)
 *   offset  — pagination offset
 *
 * Returns { total, limit, offset, results }.
 */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const groups = sp.getAll("group");
  const fall = sp.get("fall");
  const minYear = numParam(sp.get("minYear"));
  const maxYear = numParam(sp.get("maxYear"));
  const minMass = numParam(sp.get("minMass"));
  const maxMass = numParam(sp.get("maxMass"));
  const q = sp.get("q")?.toLowerCase().trim();
  const limit = Math.min(numParam(sp.get("limit")) ?? 100, 1000);
  const offset = numParam(sp.get("offset")) ?? 0;

  const filtered = getRecords().filter((m: Meteorite) => {
    if (groups.length && !groups.includes(m.group)) return false;
    if (fall && m.fall !== fall) return false;
    if (minYear !== undefined && (m.year === null || m.year < minYear)) return false;
    if (maxYear !== undefined && (m.year === null || m.year > maxYear)) return false;
    if (minMass !== undefined && (m.massGrams === null || m.massGrams < minMass)) return false;
    if (maxMass !== undefined && (m.massGrams === null || m.massGrams > maxMass)) return false;
    if (q && !m.name.toLowerCase().includes(q)) return false;
    return true;
  });

  return NextResponse.json({
    total: filtered.length,
    limit,
    offset,
    results: filtered.slice(offset, offset + limit),
  });
}

function numParam(v: string | null): number | undefined {
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
