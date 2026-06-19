"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import type { Stats } from "@/lib/types";
import { GROUP_COLORS } from "./colors";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function InsightsPanel({ stats }: { stats: Stats }) {
  const antarcticaPct = (stats.antarcticaFindShare * 100).toFixed(0);

  const decadeData = stats.byDecade
    .filter((d) => d.decade >= 1700)
    .map((d) => ({ decade: d.decade, finds: d.found, falls: d.fell }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* The thesis: this dataset is a record of human attention, not of where rocks land. */}
      <section>
        <Eyebrow>The catch in the data</Eyebrow>
        <p style={{ margin: "8px 0 0", color: "var(--ink-dim)", lineHeight: 1.55 }}>
          A map of these {fmt(stats.total)} meteorites looks like a map of where
          meteorites land. It isn&apos;t. It&apos;s a map of where humans went
          looking — and they mostly went to the ice.
        </p>
        <BigStat value={`${antarcticaPct}%`} label="of all recovered finds come from Antarctica alone" />
        <p style={{ margin: "4px 0 0", color: "var(--ink-faint)", fontSize: 13, lineHeight: 1.5 }}>
          Dark rock stands out on white ice, and glacier flow sweeps fallen
          meteorites into concentrated stranding zones. Antarctica isn&apos;t a
          target — it&apos;s a collection lens.
        </p>
      </section>

      <Divider />

      {/* Observed falls vs later finds — the cleanest illustration of the bias. */}
      <section>
        <Eyebrow>Seen falling vs. found later</Eyebrow>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <Stat n={fmt(stats.fell)} l="Fell" sub="witnessed, then recovered" accent="var(--ice)" />
          <Stat n={fmt(stats.found)} l="Found" sub="discovered, fall unseen" accent="var(--meteor)" />
        </div>
        <p style={{ margin: "10px 0 0", color: "var(--ink-faint)", fontSize: 13, lineHeight: 1.5 }}>
          Only {((stats.fell / stats.total) * 100).toFixed(1)}% were actually
          seen falling. Everything else was found — which is why collection
          conditions, not impact patterns, shape the map.
        </p>
      </section>

      <Divider />

      {/* Discovery over time. */}
      <section>
        <Eyebrow>The recovery boom</Eyebrow>
        <p style={{ margin: "6px 0 12px", color: "var(--ink-faint)", fontSize: 13 }}>
          Finds per decade. The surge from the 1970s is the start of organized
          Antarctic search programs — not more meteorites arriving.
        </p>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={decadeData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--meteor)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--meteor)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="decade" tick={{ fill: "#5c6a82", fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#5c6a82", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="finds" stroke="var(--meteor)" strokeWidth={1.5} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <Divider />

      {/* Composition by family. */}
      <section>
        <Eyebrow>What they&apos;re made of</Eyebrow>
        <p style={{ margin: "6px 0 12px", color: "var(--ink-faint)", fontSize: 13 }}>
          {((stats.byGroup[0].count / stats.total) * 100).toFixed(0)}% are
          ordinary chondrites — the common stony meteorites. The rare planetary
          and iron types are the ones worth hunting.
        </p>
        <ResponsiveContainer width="100%" height={Math.max(150, stats.byGroup.length * 26)}>
          <BarChart
            layout="vertical"
            data={stats.byGroup}
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="group"
              width={130}
              tick={{ fill: "#9aa6bd", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<Tip />} cursor={{ fill: "#ffffff08" }} />
            <Bar dataKey="count" radius={[0, 3, 3, 0]}>
              {stats.byGroup.map((g) => (
                <Cell key={g.group} fill={GROUP_COLORS[g.group]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      <Divider />

      {/* Data honesty footer. */}
      <section>
        <Eyebrow>Data honesty</Eyebrow>
        <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          <Fact>{fmt(stats.unmappable)} records ({((stats.unmappable / stats.total) * 100).toFixed(0)}%) have no usable coordinates — counted in stats, hidden on the map.</Fact>
          <Fact>{fmt(stats.total - stats.massKnown)} records are missing a mass.</Fact>
          <Fact>One impossible year (2101) and the (0,0) &quot;null island&quot; were filtered during ingestion.</Fact>
        </ul>
      </section>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--meteor)" }}
    >
      {children}
    </span>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ margin: "16px 0 0" }}>
      <div style={{ fontFamily: "'Spline Sans'", fontSize: 52, fontWeight: 700, lineHeight: 1, color: "var(--meteor)" }}>
        {value}
      </div>
      <div style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Stat({ n, l, sub, accent }: { n: string; l: string; sub: string; accent: string }) {
  return (
    <div style={{ flex: 1, background: "var(--panel-2)", borderRadius: "var(--radius)", padding: "12px 14px", borderLeft: `2px solid ${accent}` }}>
      <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: accent }}>{n}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{l}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 1 }}>{sub}</div>
    </div>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ fontSize: 12.5, color: "var(--ink-faint)", lineHeight: 1.45, paddingLeft: 14, position: "relative" }}>
      <span style={{ position: "absolute", left: 0, color: "var(--meteor)" }}>›</span>
      {children}
    </li>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line)" }} />;
}

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
      <div style={{ color: "var(--ink-dim)" }}>{payload[0].payload.group ?? label}</div>
      <div className="mono" style={{ color: "var(--ink)" }}>{fmt(payload[0].value)}</div>
    </div>
  );
}
