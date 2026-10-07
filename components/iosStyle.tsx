"use client";

import type { CSSProperties } from "react";
import type { Palette } from "../lib/tokens";
import { glyphOf } from "../lib/sfsymbols";

/* What every iOS drawing on the canvas shares: the system font, the system colors, an
 * approximation of Liquid Glass, and icons that accept SF Symbol names. */

export const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

/** the iOS system colors the skin needs, for the light or the dark canvas */
export function sys(dark: boolean) {
  return {
    label: dark ? "#FFFFFF" : "#000000",
    secondary: dark ? "rgba(235,235,245,0.6)" : "rgba(60,60,67,0.6)",
    tertiary: dark ? "rgba(235,235,245,0.3)" : "rgba(60,60,67,0.3)",
    fill: dark ? "rgba(118,118,128,0.24)" : "rgba(118,118,128,0.12)",
    track: dark ? "rgba(120,120,128,0.32)" : "rgba(120,120,128,0.2)",
    separator: dark ? "rgba(84,84,88,0.6)" : "rgba(60,60,67,0.29)",
    row: dark ? "#1C1C1E" : "#FFFFFF",
    knob: dark ? "#636366" : "#FFFFFF",
    red: dark ? "#FF453A" : "#FF3B30",
  };
}
export type Sys = ReturnType<typeof sys>;

/** Liquid Glass, approximated: a translucent fill that blurs what is behind it, a light rim and a soft shadow */
export function glass(dark: boolean, lifted: boolean): CSSProperties {
  return {
    background: dark ? "rgba(44,44,46,0.72)" : "rgba(255,255,255,0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)"}`,
    boxShadow: lifted ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  };
}

export const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
export const oneLine: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
export const center: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center" };

/** an icon: a Material Symbols name, or an SF Symbol ("sf:…") drawn through its Material stand-in */
export function Glyph({ name, size, color, fill }: { name: string; size: number; color: string; fill?: boolean }) {
  const g = glyphOf(name);
  return (
    <span className="msr" aria-hidden data-fill={fill || g.fill ? "1" : "0"} style={{ fontSize: size, color, lineHeight: 1 }}>
      {g.glyph}
    </span>
  );
}

/** the iOS switch: 51×31, the accent color when on */
export function Switch({ on, p, s }: { on: boolean; p: Palette; s: Sys }) {
  return (
    <div style={{ position: "relative", flex: "0 0 auto", width: 51, height: 31, borderRadius: 999, background: on ? p.primary : s.track }}>
      <div
        style={{
          position: "absolute",
          top: 2,
          left: on ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: 999,
          background: "#FFFFFF",
          boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)",
        }}
      />
    </div>
  );
}

/** a grouped-list row: the system row color, 16pt side insets */
export const rowStyle = (s: Sys): CSSProperties => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "0 16px",
  boxSizing: "border-box",
  background: s.row,
  borderRadius: 10,
});

/** words that make a menu item or a sheet action destructive (drawn red, `role: .destructive` in the prompt) */
export const DESTRUCTIVE = /delete|remove|erase|削除|删除|移除|삭제/i;
