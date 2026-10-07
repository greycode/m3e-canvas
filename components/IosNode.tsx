"use client";

import type { CSSProperties } from "react";
import { Item, Kind, NAV_BAR_H, Palette, Radii, STATUS_BAR_H, isMeasured, isScrollableTabs } from "../lib/tokens";

/* When the prompt targets iOS, the canvas draws these parts the way iOS 26 draws them.
 * Each one fills exactly the box its Material part has (sizeOf is untouched), so snapping,
 * runs, tidy and the prompt see no difference. Parts whose width comes from their content
 * (buttons, chips, switches…) keep the Material drawing, since their width is measured
 * from that drawing. Icons stay Material Symbols: SF Symbols may not ship on the web. */

/** kinds the canvas can draw in an iOS 26 skin */
export const IOS_SKIN_KINDS: Kind[] = ["bottomNav", "topAppBar", "listItem", "searchBar", "tabs", "slider", "toolbar"];

/** the part has an iOS skin and its size does not depend on how it is drawn */
export const takesIosSkin = (item: Item) => IOS_SKIN_KINDS.includes(item.kind) && !isMeasured(item);

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

/** the iOS system colors the skin needs, for the light or the dark canvas */
function sys(dark: boolean) {
  return {
    label: dark ? "#FFFFFF" : "#000000",
    secondary: dark ? "rgba(235,235,245,0.6)" : "rgba(60,60,67,0.6)",
    fill: dark ? "rgba(118,118,128,0.24)" : "rgba(118,118,128,0.12)",
    track: dark ? "rgba(120,120,128,0.32)" : "rgba(120,120,128,0.2)",
    row: dark ? "#1C1C1E" : "#FFFFFF",
    knob: dark ? "#636366" : "#FFFFFF",
  };
}
type Sys = ReturnType<typeof sys>;

/** Liquid Glass, approximated: a translucent fill that blurs what is behind it, a light rim and a soft shadow */
function glass(dark: boolean, lifted: boolean): CSSProperties {
  return {
    background: dark ? "rgba(44,44,46,0.72)" : "rgba(255,255,255,0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)"}`,
    boxShadow: lifted ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.12)",
    boxSizing: "border-box",
  };
}

const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
const oneLine: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const center: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center" };

/** a Material Symbols glyph, the same face the Material parts use */
function Glyph({ name, size, color, fill }: { name: string; size: number; color: string; fill?: boolean }) {
  return (
    <span className="msr" aria-hidden data-fill={fill ? "1" : "0"} style={{ fontSize: size, color, lineHeight: 1 }}>
      {name}
    </span>
  );
}

/** the iOS switch: 51×31, the accent color when on */
function Switch({ on, p, s }: { on: boolean; p: Palette; s: Sys }) {
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

/** the floating tab bar: a glass capsule above the home indicator, the selected tab tinted */
function TabBar({ item, p, s, dark }: { item: Item; p: Palette; s: Sys; dark: boolean }) {
  const tabs = item.tabs ?? [];
  const sel = item.selected ?? 0;
  return (
    <div style={{ position: "absolute", left: 16, right: 16, bottom: NAV_BAR_H - 8, height: 62, borderRadius: 999, padding: 4, display: "flex", ...glass(dark, true) }}>
      {tabs.map((t, i) => {
        const on = i === sel;
        const c = on ? p.primary : s.label;
        return (
          <div key={i} style={{ ...center, flex: 1, minWidth: 0, flexDirection: "column", gap: 2, borderRadius: 999, background: on ? tint(p.primary, 14) : undefined }}>
            <Glyph name={t.icon || "circle"} size={24} color={c} fill={on} />
            <span style={{ ...oneLine, maxWidth: "100%", fontSize: 10, fontWeight: 500, color: c }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** the navigation bar: glass circle buttons in a 44pt row under the status bar; a small bar centres its
 *  title in that row, a medium or large one sets a large title underneath it */
function NavBar({ item, s, h, dark }: { item: Item; s: Sys; h: number; dark: boolean }) {
  const large = h - STATUS_BAR_H > 64;
  const rowTop = large ? STATUS_BAR_H + 4 : STATUS_BAR_H + (h - STATUS_BAR_H - 44) / 2;
  const button = (name: string, side: "left" | "right") => (
    <div style={{ ...center, position: "absolute", [side]: 16, top: rowTop, width: 44, height: 44, borderRadius: 999, ...glass(dark, false) }}>
      <Glyph name={name} size={22} color={s.label} />
    </div>
  );
  return (
    <>
      {item.icon && button(item.icon, "left")}
      {item.icon2 && button(item.icon2, "right")}
      {large ? (
        <div style={{ ...oneLine, position: "absolute", left: 16, right: 16, bottom: 12, fontSize: 34, fontWeight: 700, color: s.label }}>{item.label}</div>
      ) : (
        <div style={{ ...center, ...oneLine, position: "absolute", left: 76, right: 76, top: rowTop, height: 44, fontSize: 17, fontWeight: 600, color: s.label }}>{item.label}</div>
      )}
    </>
  );
}

/** an inset-grouped row; the run's corners come from the Material geometry, so neighbours still fuse */
function Row({ item, p, s, radii }: { item: Item; p: Palette; s: Sys; radii?: Radii }) {
  const bare = item.iconFill === "none";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        boxSizing: "border-box",
        background: s.row,
        borderRadius: radii ? `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px` : 10,
      }}
    >
      {item.icon &&
        (bare ? (
          <Glyph name={item.icon} size={24} color={p.primary} />
        ) : (
          <div style={{ ...center, flex: "0 0 auto", width: 30, height: 30, borderRadius: 7, background: p.primary }}>
            <Glyph name={item.icon} size={18} color={p.onPrimary} />
          </div>
        ))}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ ...oneLine, fontSize: 17, color: s.label }}>{item.label}</span>
        {item.supporting?.trim() && <span style={{ ...oneLine, fontSize: 15, color: s.secondary }}>{item.supporting}</span>}
      </div>
      {item.switch ? <Switch on={!!item.checked} p={p} s={s} /> : item.icon2 ? <Glyph name={item.icon2} size={20} color={s.secondary} /> : null}
    </div>
  );
}

/** the search field: a 44pt glass capsule with the magnifying glass, the placeholder and the trailing icon */
function SearchField({ item, s, h, dark }: { item: Item; s: Sys; h: number; dark: boolean }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (h - 44) / 2, height: 44, borderRadius: 999, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", ...glass(dark, false) }}>
      <Glyph name="search" size={20} color={s.secondary} />
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: s.secondary }}>{item.label}</span>
      {item.icon2 && <Glyph name={item.icon2} size={20} color={s.secondary} />}
    </div>
  );
}

/** a segmented control, or a scrolling row of capsules when the tabs scroll */
function Segments({ item, p, s, h }: { item: Item; p: Palette; s: Sys; h: number }) {
  const tabs = item.tabs ?? [];
  const sel = item.selected ?? 0;
  if (isScrollableTabs(item))
    return (
      <div style={{ position: "absolute", left: 16, right: 0, top: (h - 32) / 2, height: 32, display: "flex", gap: 8, overflow: "hidden" }}>
        {tabs.map((t, i) => (
          <div key={i} style={{ ...center, flex: "0 0 auto", padding: "0 14px", borderRadius: 999, fontSize: 15, fontWeight: 500, background: i === sel ? p.primary : s.fill, color: i === sel ? p.onPrimary : s.label }}>
            {t.label}
          </div>
        ))}
      </div>
    );
  return (
    <div style={{ position: "absolute", left: 16, right: 16, top: (h - 36) / 2, height: 36, borderRadius: 999, padding: 2, display: "flex", boxSizing: "border-box", background: s.fill }}>
      {tabs.map((t, i) => (
        <div
          key={i}
          style={{
            ...center,
            ...oneLine,
            flex: 1,
            minWidth: 0,
            borderRadius: 999,
            fontSize: 13,
            fontWeight: i === sel ? 600 : 500,
            color: s.label,
            background: i === sel ? s.knob : undefined,
            boxShadow: i === sel ? "0 2px 6px rgba(0,0,0,0.12)" : undefined,
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}

/** the slider: a thin track, the accent up to the value and a white capsule thumb */
function Slider({ item, p, s, w, h }: { item: Item; p: Palette; s: Sys; w: number; h: number }) {
  const v = Math.min(100, Math.max(0, item.value ?? 40));
  const at = (w * v) / 100;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: h / 2 - 3, height: 6, borderRadius: 3, background: s.track }} />
      <div style={{ position: "absolute", left: 0, width: at, top: h / 2 - 3, height: 6, borderRadius: 3, background: p.primary }} />
      <div
        style={{
          position: "absolute",
          left: Math.min(w - 38, Math.max(0, at - 19)),
          top: h / 2 - 12,
          width: 38,
          height: 24,
          borderRadius: 999,
          background: "#FFFFFF",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.04)",
        }}
      />
    </>
  );
}

/** the bottom toolbar: one glass capsule of icon buttons; the vibrant one tints its first action */
function Toolbar({ item, p, s, h, dark }: { item: Item; p: Palette; s: Sys; h: number; dark: boolean }) {
  const icons = (item.tabs ?? []).map((t) => t.icon || "circle");
  const vibrant = item.variant === "filled";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (h - 50) / 2, height: 50, borderRadius: 999, padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "space-around", ...glass(dark, true) }}>
      {icons.map((name, i) =>
        vibrant && i === 0 ? (
          <div key={i} style={{ ...center, width: 36, height: 36, borderRadius: 999, background: p.primary }}>
            <Glyph name={name} size={20} color={p.onPrimary} />
          </div>
        ) : (
          <div key={i} style={{ ...center, width: 36, height: 36 }}>
            <Glyph name={name} size={22} color={s.label} />
          </div>
        ),
      )}
    </div>
  );
}

/** one part in its iOS skin, filling exactly w×h */
export function IosBody({ item, p, w, h, dark, radii }: { item: Item; p: Palette; w: number; h: number; dark: boolean; radii?: Radii }) {
  const s = sys(dark);
  const body = (() => {
    switch (item.kind) {
      case "bottomNav":
        return <TabBar item={item} p={p} s={s} dark={dark} />;
      case "topAppBar":
        return <NavBar item={item} s={s} h={h} dark={dark} />;
      case "listItem":
        return <Row item={item} p={p} s={s} radii={radii} />;
      case "searchBar":
        return <SearchField item={item} s={s} h={h} dark={dark} />;
      case "tabs":
        return <Segments item={item} p={p} s={s} h={h} />;
      case "slider":
        return <Slider item={item} p={p} s={s} w={w} h={h} />;
      case "toolbar":
        return <Toolbar item={item} p={p} s={s} h={h} dark={dark} />;
      default:
        return null;
    }
  })();
  return <div style={{ position: "relative", width: w, height: h, fontFamily: FONT, boxSizing: "border-box" }}>{body}</div>;
}
