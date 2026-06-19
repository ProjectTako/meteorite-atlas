"use client";

import { GROUP_COLORS, GROUP_ORDER } from "./colors";
import type { MeteoriteGroup, FallType } from "@/lib/types";

export interface Filters {
  groups: Set<MeteoriteGroup>;
  fall: FallType | "all";
  minYear: number;
  maxYear: number;
  minMass: number;
  query: string;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  yearBounds: { min: number; max: number };
  shown: number;
  total: number;
}

const MASS_STEPS = [0, 100, 1000, 10000, 100000];
const massLabel = (g: number) =>
  g === 0 ? "any" : g >= 1000 ? `${g / 1000} kg+` : `${g} g+`;

export default function FilterBar({ filters, setFilters, yearBounds, shown, total }: Props) {
  const toggleGroup = (g: MeteoriteGroup) => {
    const next = new Set(filters.groups);
    next.has(g) ? next.delete(g) : next.add(g);
    setFilters({ ...filters, groups: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        value={filters.query}
        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        placeholder="Search by name…"
        style={inputStyle}
      />

      <Field label="Type">
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "Fell", "Found"] as const).map((f) => (
            <Chip key={f} active={filters.fall === f} onClick={() => setFilters({ ...filters, fall: f })}>
              {f === "all" ? "All" : f}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Composition">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {GROUP_ORDER.map((g) => {
            const active = filters.groups.size === 0 || filters.groups.has(g);
            return (
              <button
                key={g}
                onClick={() => toggleGroup(g)}
                title={g}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 9px",
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: active ? "var(--panel-2)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-faint)",
                  fontSize: 12,
                  opacity: active ? 1 : 0.5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: GROUP_COLORS[g] }} />
                {g.replace(" chondrite", "")}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={`Year — ${filters.minYear} to ${filters.maxYear}`}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="range"
            min={yearBounds.min}
            max={yearBounds.max}
            value={filters.minYear}
            onChange={(e) => setFilters({ ...filters, minYear: Math.min(+e.target.value, filters.maxYear) })}
            style={{ flex: 1, accentColor: "var(--meteor)" }}
          />
          <input
            type="range"
            min={yearBounds.min}
            max={yearBounds.max}
            value={filters.maxYear}
            onChange={(e) => setFilters({ ...filters, maxYear: Math.max(+e.target.value, filters.minYear) })}
            style={{ flex: 1, accentColor: "var(--meteor)" }}
          />
        </div>
      </Field>

      <Field label={`Minimum mass — ${massLabel(filters.minMass)}`}>
        <input
          type="range"
          min={0}
          max={MASS_STEPS.length - 1}
          value={MASS_STEPS.indexOf(filters.minMass)}
          onChange={(e) => setFilters({ ...filters, minMass: MASS_STEPS[+e.target.value] })}
          style={{ width: "100%", accentColor: "var(--meteor)" }}
        />
      </Field>

      <div className="mono" style={{ fontSize: 12, color: "var(--ink-dim)", paddingTop: 4, borderTop: "1px solid var(--line)" }}>
        Showing <span style={{ color: "var(--meteor)" }}>{shown.toLocaleString()}</span> of{" "}
        {total.toLocaleString()} mapped
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 7 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "6px 0",
        borderRadius: 7,
        border: "1px solid var(--line)",
        background: active ? "var(--meteor)" : "transparent",
        color: active ? "#0a0e16" : "var(--ink-dim)",
        fontSize: 12,
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "var(--radius)",
  border: "1px solid var(--line)",
  background: "var(--panel-2)",
  color: "var(--ink)",
  fontSize: 13,
  outline: "none",
};
