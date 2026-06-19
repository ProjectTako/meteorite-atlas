// Shared domain model used by both the build-time pipeline and the runtime app.

/** Fall classification straight from NASA: was it seen falling, or found later? */
export type FallType = "Fell" | "Found";

/**
 * A cleaned, validated meteorite record.
 *
 * Design note: we keep `mappable` explicit rather than dropping unmappable
 * rows entirely. ~30% of the dataset has no usable coordinates, and silently
 * discarding them would distort every count and chart. Instead we flag them
 * so the map can skip them while the stats still count them.
 */
export interface Meteorite {
  id: number;
  name: string;
  /** Whether the record is a valid named meteorite ("Valid") or relict ("Relict"). */
  nametype: string;
  /** NASA classification, e.g. "L6", "H5", "Iron, IAB-MG". */
  recclass: string;
  /** Broad family derived from recclass for filtering/coloring. */
  group: MeteoriteGroup;
  /** Mass in grams. Null when NASA had no value. */
  massGrams: number | null;
  fall: FallType;
  /** Four-digit year. Null when missing or implausible after cleaning. */
  year: number | null;
  lat: number | null;
  lng: number | null;
  /** True only when lat/lng are present, in range, and not the (0,0) null island. */
  mappable: boolean;
  /** Offline-derived locality, e.g. "Antarctica" / "Northwest Africa". Null if unmappable. */
  region: string | null;
}

/** Coarse families we collapse 466 raw classes into, for color + filtering. */
export type MeteoriteGroup =
  | "Ordinary chondrite"
  | "Carbonaceous chondrite"
  | "Enstatite chondrite"
  | "Other chondrite"
  | "Achondrite"
  | "Iron"
  | "Stony-iron"
  | "Unknown";

/** Aggregate stats computed once at build time and served to the insights panel. */
export interface Stats {
  total: number;
  mappable: number;
  unmappable: number;
  fell: number;
  found: number;
  massKnown: number;
  yearRange: { min: number; max: number };
  byDecade: { decade: number; fell: number; found: number }[];
  byGroup: { group: MeteoriteGroup; count: number }[];
  byRegion: { region: string; count: number }[];
  massBuckets: { label: string; count: number }[];
  /** The headline bias figure: share of all FINDS that come from Antarctica. */
  antarcticaFindShare: number;
}
