"use client";

import type { ReactNode } from "react";
import type { Item, Palette } from "../lib/tokens";
import { Sys, oneLine } from "./iosStyle";

/* Swift Charts, sketched: a card with the title and subtitle over the plot. The values are
 * illustrative only; the prompt asks the code model for the app's real data. */

/** the illustrative values, one per category in order */
const SHAPE = [0.62, 0.85, 0.48, 0.92, 0.7, 0.55, 0.78, 0.66, 0.9, 0.5, 0.73, 0.6];
/** the series colors: the accent first, then the iOS system colors */
const series = (p: Palette) => [p.primary, "#34C759", "#FF9500", "#5AC8FA", "#FF2D55", "#AF52DE", "#FFCC00", "#8E8E93"];
const f = (n: number) => n.toFixed(1);
/** a fixed pseudo-random sequence, so a sketch looks the same on every render */
const noise = (seed: number) => {
  let x = (seed * 9301 + 49297) % 233280;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
};

type Plot = { item: Item; p: Palette; s: Sys; w: number; h: number };
const labelsOf = (item: Item) => (item.tabs ?? []).map((t) => t.label);

/** the dashed gridlines and the trailing axis Swift Charts draws on iOS */
function Grid({ pw, ph, s }: { pw: number; ph: number; s: Sys }) {
  return (
    <>
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={0} x2={pw} y1={f(ph * g)} y2={f(ph * g)} stroke={s.separator} strokeDasharray="2 3" />
          <text x={pw + 6} y={f(ph * g + 4)} fontSize={11} fill={s.secondary}>
            {Math.round((1 - g) * 100)}
          </text>
        </g>
      ))}
    </>
  );
}

/** the category labels under the plot */
const XLabels = ({ labels, x, y, s }: { labels: string[]; x: (i: number) => number; y: number; s: Sys }) => (
  <>
    {labels.map((l, i) => (
      <text key={i} x={f(x(i))} y={y} fontSize={11} textAnchor="middle" fill={s.secondary}>
        {l}
      </text>
    ))}
  </>
);

const Legend = ({ labels, colors, s }: { labels: string[]; colors: string[]; s: Sys }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 12px", marginTop: 8 }}>
    {labels.map((l, i) => (
      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: s.secondary }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: colors[i % colors.length] }} />
        {l}
      </span>
    ))}
  </div>
);

/** bars, a line or an area over the categories */
function XYPlot({ item, p, s, w, h }: Plot) {
  const labels = labelsOf(item);
  const n = Math.max(1, labels.length);
  const pw = Math.max(1, w - 28);
  const ph = Math.max(1, h - 18);
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
      <Grid pw={pw} ph={ph} s={s} />
      {item.kind === "barChart" &&
        labels.map((_, i) => {
          const bw = slot * 0.55;
          return <rect key={i} x={f(x(i) - bw / 2)} y={f(y(i))} width={f(bw)} height={f(ph - y(i))} rx={4} fill={p.primary} />;
        })}
      {item.kind === "stackedBarChart" &&
        labels.map((_, i) => {
          const bw = slot * 0.55;
          const total = SHAPE[i % SHAPE.length] * ph * 0.92;
          const parts = [0.5, 0.3, 0.2].map((share, k) => share + (k === 0 ? 0.08 : -0.04) * Math.sin(i + k));
          let top = ph;
          return parts.map((share, k) => {
            const hh = total * share;
            top -= hh;
            return <rect key={`${i}.${k}`} x={f(x(i) - bw / 2)} y={f(top)} width={f(bw)} height={f(Math.max(0, hh - 1))} rx={k === parts.length - 1 ? 4 : 1} fill={series(p)[k]} />;
          });
        })}
      {item.kind === "areaChart" && <path d={`${line}L${f(x(n - 1))} ${ph}L${f(x(0))} ${ph}Z`} fill={`url(#${gradient})`} />}
      {(item.kind === "lineChart" || item.kind === "areaChart") && <path d={line} fill="none" stroke={p.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {item.kind === "lineChart" && labels.map((_, i) => <circle key={i} cx={f(x(i))} cy={f(y(i))} r={3.5} fill={p.primary} stroke={s.row} strokeWidth={1.5} />)}
      <XLabels labels={labels} x={x} y={ph + 13} s={s} />
    </svg>
  );
}

/** points, one color and shape per series, with the legend underneath */
function Scatter({ item, p, s, w, h }: Plot) {
  const labels = labelsOf(item);
  const colors = series(p);
  const pw = Math.max(1, w - 28);
  const ph = Math.max(1, h - 28);
  return (
    <div>
      <svg width={w} height={ph} aria-hidden style={{ display: "block", overflow: "visible" }}>
        <Grid pw={pw} ph={ph} s={s} />
        {labels.flatMap((_, k) => {
          const r = noise(k + 3);
          return Array.from({ length: 14 }, (_, j) => {
            const px = ((j + r()) / 14) * pw;
            const py = ph - (0.15 + 0.6 * (j / 14) + 0.25 * r() - 0.12 * k) * ph;
            const cy = Math.min(ph - 4, Math.max(4, py));
            return k % 2 ? <rect key={`${k}.${j}`} x={f(px - 3.5)} y={f(cy - 3.5)} width={7} height={7} fill={colors[k % colors.length]} /> : <circle key={`${k}.${j}`} cx={f(px)} cy={f(cy)} r={4} fill={colors[k % colors.length]} />;
          });
        })}
      </svg>
      <Legend labels={labels} colors={colors} s={s} />
    </div>
  );
}

/** a grid of RectangleMarks, five weeks deep, darker where there is more */
function Heatmap({ item, p, s, w, h }: Plot) {
  const labels = labelsOf(item);
  const cols = Math.max(1, labels.length);
  const rows = 5;
  const gap = 3;
  const ph = Math.max(1, h - 18);
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = (ph - gap * (rows - 1)) / rows;
  const r = noise(cols + 11);
  const cells: ReactNode[] = [];
  for (let row = 0; row < rows; row++)
    for (let c = 0; c < cols; c++) {
      const v = 0.12 + 0.88 * r();
      cells.push(<rect key={`${row}.${c}`} x={f(c * (cw + gap))} y={f(row * (ch + gap))} width={f(cw)} height={f(ch)} rx={4} fill={p.primary} fillOpacity={f(v)} />);
    }
  return (
    <svg width={w} height={h} aria-hidden style={{ display: "block" }}>
      {cells}
      <XLabels labels={labels} x={(i) => i * (cw + gap) + cw / 2} y={ph + 13} s={s} />
    </svg>
  );
}

/** a donut of SectorMarks: inner radius 0.618 of the outer, 1.5° between slices, the legend underneath */
function Donut({ item, p, s, w, h }: Plot) {
  const labels = labelsOf(item);
  const colors = series(p);
  const d = Math.max(20, Math.min(w, h - 28));
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
      <Legend labels={labels} colors={colors} s={s} />
    </div>
  );
}

/** one Swift Charts part in its box: a grouped card with the title, the subtitle and the plot */
export function IosChart({ item, p, s, w, h }: Plot) {
  const pad = 16;
  const sub = !!item.supporting?.trim();
  const head = 22 + (sub ? 18 : 0) + 10;
  const plot: Plot = { item, p, s, w: Math.max(1, w - pad * 2), h: Math.max(1, h - pad * 2 - head) };
  const body =
    item.kind === "pieChart" ? <Donut {...plot} /> : item.kind === "scatterChart" ? <Scatter {...plot} /> : item.kind === "heatmapChart" ? <Heatmap {...plot} /> : <XYPlot {...plot} />;
  return (
    <div style={{ position: "absolute", inset: 0, padding: pad, boxSizing: "border-box", borderRadius: 16, background: s.row }}>
      <div style={{ ...oneLine, fontSize: 17, fontWeight: 600, lineHeight: "22px", color: s.label }}>{item.label}</div>
      {sub && <div style={{ ...oneLine, fontSize: 13, lineHeight: "18px", color: s.secondary }}>{item.supporting}</div>}
      <div style={{ marginTop: 10 }}>{body}</div>
    </div>
  );
}
