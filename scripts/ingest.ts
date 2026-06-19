/**
 * Build-time ingestion pipeline.
 *
 * Reads the raw NASA CSV once, applies the pure transforms in src/lib/transform,
 * and emits three artifacts the app consumes at runtime:
 *
 *   public/meteorites.json   — full cleaned array (used by the API route)
 *   public/meteorites.geojson — mappable points only (fed straight to the map)
 *   public/stats.json        — pre-computed aggregates for the insights panel
 *
 * Running aggregation here (not in the browser) keeps the client fast and means
 * the "expensive" work happens once per deploy, not once per visitor.
 */
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Meteorite, Stats, MeteoriteGroup, FallType } from "../src/lib/types";
import {
  classifyGroup,
  deriveRegion,
  cleanYear,
  cleanCoords,
} from "../src/lib/transform";

const RAW = join(process.cwd(), "data/raw/Meteorite_Landings.csv");
const OUT = join(process.cwd(), "public");

interface RawRow {
  name: string;
  id: string;
  nametype: string;
  recclass: string;
  "mass (g)": string;
  fall: string;
  year: string;
  reclat: string;
  reclong: string;
  GeoLocation: string;
}

function ingest(): { records: Meteorite[]; stats: Stats } {
  const csv = readFileSync(RAW, "utf8");
  const rows: RawRow[] = parse(csv, { columns: true, skip_empty_lines: true });

  const records: Meteorite[] = rows.map((r) => {
    const { lat, lng, mappable } = cleanCoords(r.reclat, r.reclong);
    const massGrams = r["mass (g)"] ? Number(r["mass (g)"]) : null;
    return {
      id: Number(r.id),
      name: r.name,
      nametype: r.nametype,
      recclass: r.recclass,
      group: classifyGroup(r.recclass),
      massGrams: massGrams !== null && Number.isFinite(massGrams) ? massGrams : null,
      fall: (r.fall === "Fell" ? "Fell" : "Found") as FallType,
      year: cleanYear(r.year),
      lat,
      lng,
      mappable,
      region: deriveRegion(lat, lng),
    };
  });

  return { records, stats: computeStats(records) };
}

function computeStats(records: Meteorite[]): Stats {
  const mappable = records.filter((m) => m.mappable);
  const years = records.map((m) => m.year).filter((y): y is number => y !== null);

  // Discovery rate over time, split by fall type, bucketed per decade.
  const decadeMap = new Map<number, { fell: number; found: number }>();
  for (const m of records) {
    if (m.year === null) continue;
    const d = Math.floor(m.year / 10) * 10;
    const e = decadeMap.get(d) ?? { fell: 0, found: 0 };
    if (m.fall === "Fell") e.fell++;
    else e.found++;
    decadeMap.set(d, e);
  }

  const groupMap = new Map<MeteoriteGroup, number>();
  for (const m of records) groupMap.set(m.group, (groupMap.get(m.group) ?? 0) + 1);

  const regionMap = new Map<string, number>();
  for (const m of records)
    if (m.region) regionMap.set(m.region, (regionMap.get(m.region) ?? 0) + 1);

  // Log-scale mass buckets — mass spans 0g to 60,000,000g (the Hoba meteorite).
  const buckets = [
    { label: "<10 g", test: (g: number) => g < 10 },
    { label: "10 g – 100 g", test: (g: number) => g >= 10 && g < 100 },
    { label: "100 g – 1 kg", test: (g: number) => g >= 100 && g < 1_000 },
    { label: "1 kg – 10 kg", test: (g: number) => g >= 1_000 && g < 10_000 },
    { label: "10 kg – 100 kg", test: (g: number) => g >= 10_000 && g < 100_000 },
    { label: ">100 kg", test: (g: number) => g >= 100_000 },
  ];
  const massBuckets = buckets.map((b) => ({
    label: b.label,
    count: records.filter((m) => m.massGrams !== null && b.test(m.massGrams)).length,
  }));

  const found = records.filter((m) => m.fall === "Found").length;
  const antarcticaFinds = records.filter(
    (m) => m.fall === "Found" && m.region === "Antarctica"
  ).length;

  return {
    total: records.length,
    mappable: mappable.length,
    unmappable: records.length - mappable.length,
    fell: records.filter((m) => m.fall === "Fell").length,
    found,
    massKnown: records.filter((m) => m.massGrams !== null).length,
    yearRange: { min: Math.min(...years), max: Math.max(...years) },
    byDecade: [...decadeMap.entries()]
      .map(([decade, v]) => ({ decade, ...v }))
      .sort((a, b) => a.decade - b.decade),
    byGroup: [...groupMap.entries()]
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count),
    byRegion: [...regionMap.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count),
    massBuckets,
    antarcticaFindShare: found ? antarcticaFinds / found : 0,
  };
}

function main() {
  console.time("ingest");
  const { records, stats } = ingest();
  mkdirSync(OUT, { recursive: true });

  writeFileSync(join(OUT, "meteorites.json"), JSON.stringify(records));

  const geojson = {
    type: "FeatureCollection" as const,
    features: records
      .filter((m) => m.mappable)
      .map((m) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
        properties: {
          id: m.id,
          name: m.name,
          group: m.group,
          fall: m.fall,
          year: m.year,
          massGrams: m.massGrams,
          recclass: m.recclass,
        },
      })),
  };
  writeFileSync(join(OUT, "meteorites.geojson"), JSON.stringify(geojson));
  writeFileSync(join(OUT, "stats.json"), JSON.stringify(stats, null, 2));

  console.timeEnd("ingest");
  console.log(
    `Wrote ${records.length} records (${stats.mappable} mappable, ${stats.unmappable} unmappable).`
  );
  console.log(
    `Antarctica accounts for ${(stats.antarcticaFindShare * 100).toFixed(1)}% of all finds.`
  );
}

main();
