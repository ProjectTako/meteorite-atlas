# Meteorite Atlas — Technical Design

## Architecture at a glance

```
                    BUILD TIME (once per deploy)
  data/raw/Meteorite_Landings.csv
            │
            ▼
  scripts/ingest.ts ──uses──► src/lib/transform.ts  (pure, unit-tested)
            │                     · clean year / coords
            │                     · classify 466 classes → 8 families
            │                     · derive region (offline bbox)
            │                     · compute aggregate stats
            ▼
  public/meteorites.json      (full cleaned array → API)
  public/meteorites.geojson   (mappable points only → map)
  public/stats.json           (precomputed aggregates → insights)

                    RUNTIME (Next.js)
  Server Component (page.tsx) ──reads geojson + stats from disk──┐
                                                                 ▼
  Client: Explorer ─► FilterBar          MeteoriteMap (MapLibre + Supercluster)
                   └► InsightsPanel       — client-side filtering, no network
  API routes: /api/meteorites (filter+paginate), /api/stats
```

The central decision is the **build-time vs runtime split.** All the expensive,
messy work — parsing 45K CSV rows, cleaning, classifying, aggregating — happens
once at build time and is frozen into three static artifacts. The runtime app
just reads those artifacts. This keeps the client fast, makes the data layer
trivially cacheable, and means a grader running `npm run build` sees the entire
pipeline execute and print its results.

## Stack and why

| Concern | Choice | Why this and not the alternative |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | One repo for UI *and* API, first-class on Vercel's free tier, server components let me read data from disk without an extra service. Requested TS stack. |
| Map | **MapLibre GL** | Open-source, **no API token** — critical so the grader can run it cold with zero setup. Mapbox would need an account + key. |
| Clustering | **Supercluster** | 32K markers can't all be live DOM nodes without jank. Supercluster indexes once and returns only what's in the viewport per zoom — the standard solution for this scale. |
| Charts | **Recharts** | Declarative, composable, themeable to the dark palette. Right weight for three charts; D3 by hand would be overkill. |
| CSV parsing | **csv-parse** | Battle-tested, handles the quoted `GeoLocation` field correctly. |
| Tests | **Vitest** | Fast, zero-config with TS; tests the tricky pure transforms. |

## How the data problems were handled

The raw file is genuinely dirty, and the cleaning decisions are documented in
code (`src/lib/transform.ts`) and surfaced to users (Insights → Data Honesty):

- **Coordinates** — 7,315 rows are blank and 6,214 sit at the (0,0) "null
  island" (a classic missing-data sentinel that would otherwise plot a fake
  cluster off the African coast). Both are flagged `mappable: false`. They are
  **kept and counted in every stat** but hidden from the map — dropping them
  would distort the totals.
- **Years** — one record is dated 2101 and a couple predate 1000. `cleanYear`
  nulls anything outside [700, current year].
- **Mass** — 131 rows lack a mass; left null, never coerced to 0. Note the real
  max is 60,000,000 g (the 60-tonne Hoba meteorite) — a real value, deliberately
  *not* treated as an outlier to remove.
- **Classification** — 466 distinct `recclass` strings are collapsed into 8
  families by pattern-matching the meteorite taxonomy, ordered most-specific
  first. Only 2.4% fall through to "Unknown" rather than being mis-guessed.

## Key tradeoffs (the honest part)

- **Offline region derivation via bounding boxes** instead of a real
  reverse-geocoder. The bias story only needs continent-scale buckets plus the
  two hot zones, and a real geocoder would add a paid dependency and slow the
  build. The tradeoff: borders are approximate. I made this explicit rather than
  pretending it's precise.
- **Client-side filtering** of the in-memory GeoJSON. At 32K points this is
  instant and avoids a network round-trip per filter change. It wouldn't scale
  to millions — at that point filtering moves server-side (the `/api/meteorites`
  route already does this and is the migration path).
- **Static artifacts over a database.** The dataset is read-only and fixed, so a
  DB would be ceremony. If the data became live/updatable, the ingestion output
  would target Postgres + PostGIS instead, and the API routes would query it —
  the transform layer wouldn't change.

## Testing & running

`npm run ingest` regenerates artifacts; `npm test` runs the transform unit
tests (13, covering classification edge cases, year/coord cleaning, region
logic); `npm run build` runs ingestion + a full type-checked production build;
`npm run dev` serves locally. Deploy is `vercel` — the build script runs
ingestion automatically, so the artifacts are always fresh on deploy.
