import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Feature, Point, FeatureCollection } from "geojson";
import type { Stats } from "@/lib/types";
import type { MapPoint } from "@/components/MeteoriteMap";
import Explorer from "@/components/Explorer";

/**
 * Server component. Reads the build-time artifacts on the server and hands the
 * map features + stats to the client Explorer. The heavy GeoJSON never round-
 * trips through an API call on first paint — it's embedded in the initial HTML
 * payload, so the map can render immediately.
 */
export default function Page() {
  const geojson = JSON.parse(
    readFileSync(join(process.cwd(), "public", "meteorites.geojson"), "utf8")
  ) as FeatureCollection<Point, MapPoint>;
  const stats = JSON.parse(
    readFileSync(join(process.cwd(), "public", "stats.json"), "utf8")
  ) as Stats;

  return <Explorer features={geojson.features as Feature<Point, MapPoint>[]} stats={stats} />;
}
