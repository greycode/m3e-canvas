"use client";

import type { Item, Palette } from "../lib/tokens";
import { Sys, oneLine } from "./iosStyle";

/* Swift Charts, sketched: a card with the title and subtitle over the plot. The heights are
 * illustrative only; the prompt asks the code model for the app's real data. */

/** the illustrative values, one per category in order */
const SHAPE = [0.62, 0.85, 0.48, 0.92, 0.7, 0.55, 0.78, 0.66, 0.9, 0.5, 0.73, 0.6];
/** the slice colors: the accent first, then the iOS system colors */
const series = (p: Palette) => [p.primary, "#34C759", "#FF9500", "#5AC8FA", "#FF2D55", "#AF52DE", "#FFCC00", "#8E8E93"];
const f = (n: number) => n.toFixed(1);

/** bars, a line or an area over the categories, with dashed gridlines and the trailing axis Swift Charts draws on iOS */
function XYPlot({ item, p, s, w, h }: { item: Item; p: Palette; s: Sys; w: number; h: number }) {
  const labels = (item.tabs ?? []).map((t) => t.label);
  const n = Math.max(1, labels.length);
  const axisW = 28;
  const axisH = 18;
  const pw = Math.max(1, w - axisW);
  const ph = Math.max(1, h - axisH);
  const slot = pw / n;
  const x = (i: number) => slot * (i + 0.5);
  const y = (i: number) => ph - SHAPE[i % SHAPE.length] * ph * 0.92;
  const line = labels.map((_, i) => `${i ? "L" : "M"}${f(x(i))} ${f(y(i))}`).join("");
  const gradient = `ios-area-${item.id}`;
  return (
    <svg width={w} height={h} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.primary} stopOpacity={0.35} />
          <stop offset="1" stopColor={p.primary} stopOpacity={0.03} />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={0} x2={pw} y1={f(ph * g)} y2={f(ph * g)} stroke={s.separator} strokeDasharray="2 3" />
          <text x={pw + 6} y={f(ph * g + 4)} fontSize={11} fill={s.secondary}>
            {Math.round((1 - g) * 100)}
          </text>
        </g>
      ))}
      {item.kind === "barChart" &&
        labels.map((_, i) => {
          const bw = slot * 0.55;
          return <rect key={i} x={f(x(i) - bw / 2)} y={f(y(i))} width={f(bw)} height={f(ph - y(i))} rx={4} fill={p.primary} />;
        })}
      {item.kind === "areaChart" && <path d={`${line}L${f(x(n - 1))} ${ph}L${f(x(0))} ${ph}Z`} fill={`url(#${gradient})`} />}
      {(item.kind === "lineChart" || item.kind === "areaChart") && <path d={line} fill="none" stroke={p.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {item.kind === "lineChart" && labels.map((_, i) => <circle key={i} cx={f(x(i))} cy={f(y(i))} r={3.5} fill={p.primary} stroke={s.row} strokeWidth={1.5} />)}
      {labels.map((l, i) => (
        <text key={i} x={f(x(i))} y={ph + 13} fontSize={11} textAnchor="middle" fill={s.secondary}>
          {l}
        </text>
      ))}
    </svg>
  );
}

/** a donut of SectorMarks: inner radius 0.618 of the outer, 1.5° between slices, the legend underneath */
function Donut({ item, p, s, w, h }: { item: Item; p: Palette; s: Sys; w: number; h: number }) {
  const labels = (item.tabs ?? []).map((t) => t.label);
  const colors = series(p);
  const legendH = 28;
  const d = Math.max(20, Math.min(w, h - legendH));
  const cx = w / 2;
  const cy = d / 2;
  const R = d / 2;
  const r = R * 0.618;
  const values = labels.map((_, i) => SHAPE[i % SHAPE.length]);
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const gap = (1.5 * Math.PI) / 180;
  const pt = (a: number, rad: number) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;
  let at = -Math.PI / 2;
  const slices = values.map((v, i) => {
    const a0 = at + gap / 2;
    const a1 = at + (v / total) * 2 * Math.PI - gap / 2;
    at += (v / total) * 2 * Math.PI;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return <path key={i} d={`M${pt(a0, R)}A${f(R)} ${f(R)} 0 ${large} 1 ${pt(a1, R)}L${pt(a1, r)}A${f(r)} ${f(r)} 0 ${large} 0 ${pt(a0, r)}Z`} fill={colors[i % colors.length]} />;
  });
  return (
    <div>
      <svg width={w} height={d} aria-hidden style={{ display: "block" }}>
        {slices}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 12px", marginTop: 8 }}>
        {labels.map((l, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: s.secondary }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: colors[i % colors.length] }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** one Swift Charts part in its box: a grouped card with the title, the subtitle and the plot */
export function IosChart({ item, p, s, w, h }: { item: Item; p: Palette; s: Sys; w: number; h: number }) {
  const pad = 16;
  const sub = !!item.supporting?.trim();
  const head = 22 + (sub ? 18 : 0) + 10;
  const pw = Math.max(1, w - pad * 2);
  const ph = Math.max(1, h - pad * 2 - head);
  return (
    <div style={{ position: "absolute", inset: 0, padding: pad, boxSizing: "border-box", borderRadius: 16, background: s.row }}>
      <div style={{ ...oneLine, fontSize: 17, fontWeight: 600, lineHeight: "22px", color: s.label }}>{item.label}</div>
      {sub && <div style={{ ...oneLine, fontSize: 13, lineHeight: "18px", color: s.secondary }}>{item.supporting}</div>}
      <div style={{ marginTop: 10 }}>{item.kind === "pieChart" ? <Donut item={item} p={p} s={s} w={pw} h={ph} /> : <XYPlot item={item} p={p} s={s} w={pw} h={ph} />}</div>
    </div>
  );
}
