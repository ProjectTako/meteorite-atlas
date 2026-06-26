# Meteorite Atlas

An interactive explorer for NASA's Meteorite Landings dataset (45,716 records) —
with an honest take on the collection bias hiding inside it.

> **The headline:** only 2.4% of these meteorites were seen falling. Of the rest,
> **49.5% were found in Antarctica** — not because more land there, but because a
> dark rock on white ice is impossible to miss. This app explores the falls *and*
> explains why the map looks the way it does.

## Quick start

```bash
npm install
npm run ingest     # build the cleaned data artifacts from the raw CSV
npm run dev        # http://localhost:3000
```

Or one shot (ingest runs automatically inside build):

```bash
npm install && npm run build && npm start
```

## Scripts

| Command | What it does |
|---|---|
| `npm run ingest` | Parse + clean + enrich the raw CSV → `public/*.json` / `*.geojson` |
| `npm run dev` | Local dev server |
| `npm run build` | Ingest, then a full type-checked production build |
| `npm test` | Unit tests for the cleaning/classification transforms |

## Deliverables

- **Product documentation** → [`docs/01-product.md`](docs/01-product.md)
- **Technical design** → [`docs/02-technical-design.md`](docs/02-technical-design.md)
- **Code** → this repo (runs locally; deploys to Vercel as-is)

## Project structure

```
data/raw/            raw NASA CSV (committed for reproducibility)
scripts/ingest.ts    build-time pipeline
scripts/*.test.ts    transform unit tests
src/lib/             types, pure transforms, server data loader
src/app/             Next.js pages + API routes
src/components/      map, filters, insights, explorer shell
public/              generated data artifacts (created by ingest)
docs/                the three deliverables
```

## API

- `GET /api/stats` — precomputed aggregates.
- `GET /api/meteorites?group=Iron&fall=Found&minYear=1950&maxYear=2000&minMass=100000&q=africa&limit=100&offset=0`
  — filterable, paginated query over the cleaned records.

## Deploy (bonus)

Push to GitHub and import into Vercel — no configuration or environment
variables needed (the map uses token-free MapLibre). The build step regenerates
the data artifacts automatically.

## Data source

NASA Open Data Portal — *Meteorite Landings*. Cleaning decisions are documented
in `src/lib/transform.ts` and surfaced in-app under Insights → Data Honesty.
