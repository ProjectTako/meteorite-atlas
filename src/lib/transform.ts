import type { MeteoriteGroup } from "./types";

/**
 * Collapse NASA's 466 distinct `recclass` strings into a handful of families.
 *
 * We can't enumerate 466 cases, so we pattern-match on the well-known
 * meteorite taxonomy. Order matters: more specific tests come first.
 * Anything unmatched falls through to "Unknown" rather than being guessed.
 */
export function classifyGroup(recclass: string): MeteoriteGroup {
  const c = recclass.trim();

  // Ordinary chondrites: H, L, LL + petrologic number (H5, L6, LL3.2, ...)
  if (/^(H|L|LL)\d/.test(c) || /^(H\/L|L\/LL)/.test(c)) return "Ordinary chondrite";

  // Carbonaceous chondrites: CI, CM, CO, CV, CK, CR, CH, CB, C2-ung, etc.
  if (/^C[IMOVKRHB]?\d?/.test(c) || /^C\d/.test(c)) return "Carbonaceous chondrite";

  // Enstatite chondrites: EH, EL
  if (/^E[HL]?\d/.test(c) || /^E\d/.test(c)) return "Enstatite chondrite";

  // Irons: "Iron", or structural classes (IAB, IIAB, IVA, octahedrite...)
  if (/iron/i.test(c) || /octahedrite|ataxite|hexahedrite/i.test(c)) return "Iron";

  // Stony-irons: pallasites and mesosiderites
  if (/pallasite|mesosiderite/i.test(c)) return "Stony-iron";

  // Achondrites: eucrite, diogenite, howardite, ureilite, aubrite, lunar, martian...
  if (
    /eucrite|diogenite|howardite|ureilite|aubrite|angrite|acapulcoite|lodranite|winonaite|brachinite/i.test(
      c
    ) ||
    /lunar|martian|shergottite|nakhlite|chassignite/i.test(c) ||
    /achondrite/i.test(c)
  )
    return "Achondrite";

  // Remaining chondrites (Kakangari, Rumuruti "R", ungrouped chondrite)
  if (/^R\d/.test(c) || /chondrite/i.test(c)) return "Other chondrite";

  return "Unknown";
}

/**
 * Derive a coarse locality from coordinates WITHOUT any network geocoder.
 *
 * A full reverse-geocode of 45K points at build time would be slow and add a
 * paid dependency. The bias story we want to tell only needs continent-scale
 * buckets plus the two dominant meteorite "hot regions" (Antarctica and the
 * Sahara / NW Africa), so a bounding-box approach is the right amount of tool.
 *
 * Returns null for unmappable input.
 */
export function deriveRegion(lat: number | null, lng: number | null): string | null {
  if (lat === null || lng === null) return null;

  if (lat < -60) return "Antarctica";

  // Sahara / Northwest Africa — the other great accumulation zone.
  if (lat >= 18 && lat <= 35 && lng >= -17 && lng <= 30) return "Northwest Africa & Sahara";

  if (lat > 35 && lng >= -25 && lng <= 45) return "Europe";
  if (lat <= 35 && lat >= -35 && lng >= -20 && lng <= 52) return "Africa";
  if (lng >= 45 && lng <= 180 && lat >= 5) return "Asia";
  if (lng >= 110 && lat < 5 && lat > -50) return "Oceania";
  if (lng >= -170 && lng <= -50 && lat >= 15) return "North America";
  if (lng >= -82 && lng <= -34 && lat < 15) return "South America";

  return "Other";
}

/** Plausible four-digit years only. The dataset contains e.g. 2101. */
export function cleanYear(raw: string): number | null {
  if (!raw) return null;
  const y = Math.round(Number(raw));
  if (!Number.isFinite(y)) return null;
  // First credible record is ~860 CE; nothing after the present is real.
  if (y < 700 || y > new Date().getFullYear()) return null;
  return y;
}

/** Treat the (0,0) "null island" and out-of-range values as missing. */
export function cleanCoords(
  latRaw: string,
  lngRaw: string
): { lat: number | null; lng: number | null; mappable: boolean } {
  const lat = latRaw ? Number(latRaw) : NaN;
  const lng = lngRaw ? Number(lngRaw) : NaN;

  const valid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(Math.abs(lat) < 1e-6 && Math.abs(lng) < 1e-6); // null island

  if (!valid) return { lat: null, lng: null, mappable: false };
  return { lat, lng, mappable: true };
}
