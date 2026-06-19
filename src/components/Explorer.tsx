"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Feature, Point } from "geojson";
import type { Stats } from "@/lib/types";
import type { MapPoint } from "./MeteoriteMap";
import FilterBar, { Filters } from "./FilterBar";
import InsightsPanel from "./InsightsPanel";
import { GROUP_COLORS } from "./colors";

// Map is client-only (uses window/WebGL) — load without SSR.
const MeteoriteMap = dynamic(() => import("./MeteoriteMap"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, background: "var(--void)" }} />,
});

interface Props {
  features: Feature<Point, MapPoint>[];
  stats: Stats;
}

type Tab = "explore" | "insights";

export default function Explorer({ features, stats }: Props) {
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [tab, setTab] = useState<Tab>("explore");
  const [filters, setFilters] = useState<Filters>({
    groups: new Set(),
    fall: "all",
    minYear: stats.yearRange.min,
    maxYear: stats.yearRange.max,
    minMass: 0,
    query: "",
  });

  // Client-side filtering of the in-memory features — instant, no network.
  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase().trim();
    return features.filter((f) => {
      const p = f.properties;
      if (filters.groups.size && !filters.groups.has(p.group)) return false;
      if (filters.fall !== "all" && p.fall !== filters.fall) return false;
      if (p.year !== null && (p.year < filters.minYear || p.year > filters.maxYear)) return false;
      if (filters.minMass > 0 && (p.massGrams === null || p.massGrams < filters.minMass)) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [features, filters]);

  const handleSelect = useCallback((p: MapPoint | null) => setSelected(p), []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 380,
          flexShrink: 0,
          background: "var(--panel)",
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header style={{ padding: "22px 24px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Meteor />
            <h1 style={{ fontSize: 19 }}>Meteorite Atlas</h1>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "var(--ink-faint)", lineHeight: 1.5 }}>
            {stats.total.toLocaleString()} recorded falls from NASA&apos;s open
            dataset — and an honest look at where they really come from.
          </p>
        </header>

        <nav style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
          {(["explore", "insights"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "13px 0",
                marginRight: 22,
                background: "none",
                border: "none",
                borderBottom: `2px solid ${tab === t ? "var(--meteor)" : "transparent"}`,
                color: tab === t ? "var(--ink)" : "var(--ink-faint)",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {tab === "explore" ? (
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              yearBounds={stats.yearRange}
              shown={filtered.length}
              total={stats.mappable}
            />
          ) : (
            <InsightsPanel stats={stats} />
          )}
        </div>

        <footer style={{ padding: "12px 24px", borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-faint)" }}>
          Source: NASA Open Data Portal · Meteorite Landings
        </footer>
      </aside>

      {/* Map */}
      <main style={{ position: "relative", flex: 1 }}>
        <MeteoriteMap features={filtered} onSelect={handleSelect} />
        {selected && <DetailCard p={selected} onClose={() => setSelected(null)} />}
      </main>
    </div>
  );
}

function DetailCard({ p, onClose }: { p: MapPoint; onClose: () => void }) {
  const mass =
    p.massGrams === null
      ? "unknown"
      : p.massGrams >= 1000
      ? `${(p.massGrams / 1000).toLocaleString()} kg`
      : `${p.massGrams.toLocaleString()} g`;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 280,
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        padding: 18,
        boxShadow: "0 12px 40px #000a",
      }}
    >
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--ink-faint)", fontSize: 16 }}
      >
        ×
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: GROUP_COLORS[p.group] }} />
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {p.group}
        </span>
      </div>
      <h3 style={{ fontSize: 17, marginBottom: 12 }}>{p.name}</h3>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 7, columnGap: 14, fontSize: 13 }}>
        <Dt>Class</Dt><Dd>{p.recclass}</Dd>
        <Dt>Mass</Dt><Dd>{mass}</Dd>
        <Dt>Year</Dt><Dd>{p.year ?? "unknown"}</Dd>
        <Dt>Type</Dt><Dd>{p.fall === "Fell" ? "Seen falling" : "Found later"}</Dd>
      </dl>
    </div>
  );
}

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt style={{ color: "var(--ink-faint)" }}>{children}</dt>
);
const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd style={{ margin: 0, color: "var(--ink)" }}>{children}</dd>
);

function Meteor() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="14" cy="8" r="4" fill="var(--meteor)" />
      <path d="M11 11 L3 19" stroke="var(--meteor-soft)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M13 13 L7 19" stroke="var(--meteor)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
