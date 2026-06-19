import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Meteorite, Stats } from "./types";

// Module-scoped cache: the build-time artifacts are immutable for the life of
// the server process, so we read + parse them once on first access.
let _records: Meteorite[] | null = null;
let _stats: Stats | null = null;

export function getRecords(): Meteorite[] {
  if (!_records) {
    const p = join(process.cwd(), "public", "meteorites.json");
    _records = JSON.parse(readFileSync(p, "utf8")) as Meteorite[];
  }
  return _records;
}

export function getStats(): Stats {
  if (!_stats) {
    const p = join(process.cwd(), "public", "stats.json");
    _stats = JSON.parse(readFileSync(p, "utf8")) as Stats;
  }
  return _stats;
}
