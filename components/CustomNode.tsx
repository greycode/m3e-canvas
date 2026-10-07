"use client";

import type { CSSProperties, ReactNode } from "react";
import { ColorRef, CustomNode as Node, countOf, fillIn, holds, varsOf } from "../lib/custom";
import { usePlatform } from "../lib/platform";
import type { Item, Palette } from "../lib/tokens";
import { FONT, Glyph, center, glass, sys } from "./iosStyle";

/* A custom component drawn from its definition's layout tree (lib/custom.ts). Nothing in a
 * definition runs: nodes map to elements, strings are text, pictures are https only. Colors
 * name roles, which follow the target: iOS system colors on iOS, the Material palette elsewhere. */

const SYSTEM: Record<string, [string, string]> = {
  red: ["#FF3B30", "#FF453A"],
  orange: ["#FF9500", "#FF9F0A"],
  yellow: ["#FFCC00", "#FFD60A"],
  green: ["#34C759", "#30D158"],
  blue: ["#007AFF", "#0A84FF"],
  purple: ["#AF52DE", "#BF5AF2"],
};
const WEIGHT = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;
const ALIGN = { start: "flex-start", center: "center", end: "flex-end" } as const;

export function CustomBody({ item, p, w, h, dark }: { item: Item; p: Palette; w: number; h: number; dark: boolean }) {
  const ios = usePlatform() === "ios";
  const s = sys(dark);
  const color = (c?: ColorRef): string | undefined => {
    if (!c) return undefined;
    if (c.startsWith("#")) return c;
    switch (c) {
      case "primary":
        return p.primary;
      case "onPrimary":
        return p.onPrimary;
      case "label":
        return ios ? s.label : p.onSurface;
      case "secondary":
        return ios ? s.secondary : p.onSurfaceVariant;
      case "tertiary":
        return ios ? s.tertiary : p.outline;
      case "fill":
        return ios ? s.fill : p.surfaceContainerHighest;
      case "row":
        return ios ? s.row : p.surfaceContainerLow;
      case "white":
        return "#FFFFFF";
      case "black":
        return "#000000";
      default:
        return SYSTEM[c]?.[dark ? 1 : 0];
    }
  };
  const ink = color("label")!;
  const def = item.custom;

  if (!def?.layout)
    return (
      <div style={{ ...center, position: "relative", width: w, height: h, flexDirection: "column", gap: 4, boxSizing: "border-box", borderRadius: 16, border: `1.5px dashed ${color("tertiary")}`, color: color("secondary"), fontSize: 13 }}>
        <Glyph name="widgets" size={24} color={color("secondary")!} />
        {def?.name ?? "Custom component"}
      </div>
    );

  const draw = (n: Node, vars: Record<string, string>, key: string, root = false): ReactNode => {
    if (!holds(n.if, vars)) return null;
    switch (n.type) {
      case "vstack":
      case "hstack":
      case "zstack": {
        const style: CSSProperties = {
          display: n.type === "zstack" ? "grid" : "flex",
          flexDirection: n.type === "vstack" ? "column" : "row",
          gap: n.type === "zstack" ? undefined : (n.spacing ?? 8),
          alignItems: ALIGN[n.align ?? "center"],
          justifyItems: n.type === "zstack" ? ALIGN[n.align ?? "center"] : undefined,
          padding: n.padding,
          background: color(n.fill),
          borderRadius: n.radius,
          flex: n.grow ? 1 : undefined,
          minWidth: 0,
          minHeight: 0,
          boxSizing: "border-box",
          ...(root ? { width: "100%", height: "100%" } : {}),
          ...(n.glass ? (ios ? glass(dark, false) : { background: p.surfaceContainerHigh, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }) : {}),
        };
        return (
          <div key={key} style={style}>
            {n.children.map((c, i) => (n.type === "zstack" ? <div key={i} style={{ gridArea: "1 / 1", display: "flex" }}>{draw(c, vars, `${key}.${i}`)}</div> : draw(c, vars, `${key}.${i}`)))}
          </div>
        );
      }
      case "text":
        return (
          <span
            key={key}
            style={{
              fontSize: n.size ?? 17,
              fontWeight: WEIGHT[n.weight ?? "regular"],
              lineHeight: 1.25,
              color: color(n.color) ?? ink,
              minWidth: 0,
              ...(n.lines ? { display: "-webkit-box", WebkitLineClamp: n.lines, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}),
            }}
          >
            {fillIn(n.text, vars)}
          </span>
        );
      case "icon":
        return <Glyph key={key} name={fillIn(n.name, vars) || "help"} size={n.size ?? 20} color={color(n.color) ?? ink} />;
      case "shape": {
        const round = n.shape === "circle" || n.shape === "capsule";
        return <div key={key} style={{ flex: "0 0 auto", width: n.w, height: n.h ?? (n.shape === "circle" ? n.w : undefined), borderRadius: round ? 999 : n.radius, background: color(n.fill) ?? p.primary }} />;
      }
      case "image":
        return n.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={key} src={n.src} alt="" style={{ flex: "0 0 auto", width: n.w ?? "100%", height: n.h, objectFit: "cover", borderRadius: n.radius }} />
        ) : (
          <div key={key} style={{ ...center, flex: "0 0 auto", width: n.w ?? "100%", height: n.h ?? 80, borderRadius: n.radius, background: color("fill") }}>
            <Glyph name="image" size={24} color={color("tertiary")!} />
          </div>
        );
      case "spacer":
        return <div key={key} style={n.size ? { flex: "0 0 auto", width: n.size, height: n.size } : { flex: 1 }} />;
      case "progress": {
        const v = Math.min(100, Math.max(0, Number(typeof n.value === "number" ? n.value : fillIn(n.value, vars)) || 0));
        return (
          <div key={key} style={{ alignSelf: "stretch", height: 6, borderRadius: 3, background: color("fill") }}>
            <div style={{ width: `${v}%`, height: 6, borderRadius: 3, background: color(n.color) ?? p.primary }} />
          </div>
        );
      }
      case "repeat":
        return Array.from({ length: countOf(n.count, vars) }, (_, k) => draw(n.child, { ...vars, i: String(k + 1) }, `${key}.${k}`));
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", width: w, height: h, overflow: "hidden", boxSizing: "border-box", fontFamily: ios ? FONT : undefined }}>
      {draw(def.layout, varsOf(item), "r", true)}
    </div>
  );
}
