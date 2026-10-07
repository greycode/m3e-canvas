"use client";

import { t, useLang } from "../lib/i18n";
import type { Item, Palette } from "../lib/tokens";
import { DESTRUCTIVE, Glyph, Sys, center, glass, oneLine, rowStyle } from "./iosStyle";

/* The SwiftUI controls only the iOS target offers, drawn the way iOS 26 draws them.
 * Each fills exactly the w×h that sizeOf gives its kind. */

type Props = { item: Item; p: Palette; s: Sys; w: number; h: number; dark: boolean };

/** a grouped section's header: footnote type in the secondary color, sitting on the section below */
function SectionHeader({ item, s }: Props) {
  return <div style={{ ...oneLine, position: "absolute", left: 16, right: 16, bottom: 6, fontSize: 13, color: s.secondary, textTransform: "uppercase", letterSpacing: 0.2 }}>{item.label}</div>;
}

/** a row with the label and value, and the − / + capsule */
function Stepper({ item, s }: Props) {
  return (
    <div style={rowStyle(s)}>
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: s.label }}>
        {item.label}
        {item.label.trim() ? ": " : ""}
        {item.value ?? 1}
      </span>
      <div style={{ display: "flex", alignItems: "center", flex: "0 0 auto", height: 32, borderRadius: 999, background: s.fill }}>
        <div style={{ ...center, width: 46, height: 32 }}>
          <Glyph name="remove" size={20} color={s.label} />
        </div>
        <div style={{ width: 1, height: 18, background: s.separator }} />
        <div style={{ ...center, width: 46, height: 32 }}>
          <Glyph name="add" size={20} color={s.label} />
        </div>
      </div>
    </div>
  );
}

/** a wheel: the selected option in the band at the middle, two neighbours either side fading out */
function WheelPicker({ item, s, h }: Props) {
  const options = item.tabs ?? [];
  const sel = Math.min(options.length - 1, Math.max(0, item.selected ?? 0));
  const rowH = 34;
  const mid = h / 2;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 12, background: s.row }}>
      <div style={{ position: "absolute", left: 8, right: 8, top: mid - rowH / 2, height: rowH, borderRadius: 8, background: s.fill }} />
      {options.map((o, i) => {
        const d = Math.abs(i - sel);
        if (d > 2) return null;
        return (
          <div
            key={i}
            style={{
              ...center,
              ...oneLine,
              position: "absolute",
              left: 16,
              right: 16,
              top: mid - rowH / 2 + (i - sel) * rowH,
              height: rowH,
              fontSize: d === 0 ? 21 : 19,
              color: d === 0 ? s.label : s.secondary,
              opacity: d === 0 ? 1 : d === 1 ? 0.75 : 0.4,
              transform: `scaleY(${d === 0 ? 1 : d === 1 ? 0.92 : 0.8})`,
            }}
          >
            {o.label}
          </div>
        );
      })}
    </div>
  );
}

/** a row with the color well: the chosen color inside a ring of the spectrum */
function ColorPicker({ item, p, s }: Props) {
  return (
    <div style={rowStyle(s)}>
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: s.label }}>{item.label}</span>
      <div style={{ ...center, flex: "0 0 auto", width: 28, height: 28, borderRadius: 999, background: "conic-gradient(#FF3B30, #FFCC00, #34C759, #5AC8FA, #007AFF, #AF52DE, #FF2D55, #FF3B30)" }}>
        <div style={{ width: 20, height: 20, borderRadius: 999, background: p.primary, boxShadow: `0 0 0 2px ${s.row}` }} />
      </div>
    </div>
  );
}

/** a row with the accent chevron, turned down while the group is open */
function Disclosure({ item, p, s }: Props) {
  return (
    <div style={rowStyle(s)}>
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: s.label }}>{item.label}</span>
      <span style={{ display: "inline-flex", transform: item.checked ? "rotate(90deg)" : undefined }}>
        <Glyph name="chevron_right" size={20} color={p.primary} />
      </span>
    </div>
  );
}

/** a multi-line field: the placeholder at the top left of a grouped row */
function TextEditor({ item, s }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "11px 16px", boxSizing: "border-box", borderRadius: 10, background: s.row }}>
      <span style={{ fontSize: 17, color: s.tertiary }}>{item.label}</span>
    </div>
  );
}

/** one dot per page, the current one solid */
function PageControl({ item, s }: Props) {
  const n = item.tabs?.length ?? 0;
  const sel = item.selected ?? 0;
  return (
    <div style={{ ...center, position: "absolute", inset: 0, gap: 9 }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 999, background: i === sel ? s.label : s.tertiary }} />
      ))}
    </div>
  );
}

/** the accessory-circular gauge: a 270° ring with the value inside and the label under it */
function Gauge({ item, p, s, w }: Props) {
  const v = Math.min(100, Math.max(0, item.value ?? 72));
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const track = c * 0.75;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 4, boxSizing: "border-box" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(135deg)" }} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.track} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${track} ${c}`} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.primary} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(track * v) / 100} ${c}`} />
        </svg>
        <div style={{ ...center, position: "absolute", inset: 0, fontSize: 17, fontWeight: 600, color: s.label }}>{v}</div>
      </div>
      <span style={{ ...oneLine, maxWidth: w, fontSize: 12, color: s.secondary }}>{item.label}</span>
    </div>
  );
}

/** a pull-down menu, drawn open: a glass panel of rows with their symbols at the trailing edge */
function Menu({ item, s, dark }: Props) {
  const items = item.tabs ?? [];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", padding: "6px 0", borderRadius: 22, ...glass(dark, true) }}>
      {items.map((e, i) => {
        const c = DESTRUCTIVE.test(e.label) ? s.red : s.label;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, height: 44, padding: "0 18px", boxSizing: "border-box", borderTop: i > 0 ? `0.5px solid ${s.separator}` : undefined }}>
            <span style={{ ...oneLine, flex: 1, fontSize: 17, color: c }}>{e.label}</span>
            {e.icon && <Glyph name={e.icon} size={20} color={c} />}
          </div>
        );
      })}
    </div>
  );
}

/** a confirmation dialog: the title and message over the actions, then Cancel on its own */
function ActionSheet({ item, p, s, dark }: Props) {
  const lang = useLang();
  const actions = item.tabs ?? [];
  const card = { overflow: "hidden", borderRadius: 22, ...glass(dark, true) } as const;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={card}>
        <div style={{ ...center, flexDirection: "column", gap: 4, height: 72, padding: "0 16px", boxSizing: "border-box", textAlign: "center" }}>
          <span style={{ ...oneLine, maxWidth: "100%", fontSize: 13, fontWeight: 600, color: s.secondary }}>{item.label}</span>
          {item.supporting?.trim() && <span style={{ ...oneLine, maxWidth: "100%", fontSize: 13, color: s.secondary }}>{item.supporting}</span>}
        </div>
        {actions.map((a, i) => (
          <div key={i} style={{ ...center, ...oneLine, height: 56, boxSizing: "border-box", borderTop: `0.5px solid ${s.separator}`, fontSize: 20, color: DESTRUCTIVE.test(a.label) ? s.red : p.primary }}>
            {a.label}
          </div>
        ))}
      </div>
      <div style={{ ...card, ...center, flex: "0 0 auto", height: 56, fontSize: 20, fontWeight: 600, color: p.primary }}>{t("cancel", lang)}</div>
    </div>
  );
}

/** ContentUnavailableView: the large symbol, the title and the description, centred */
function EmptyState({ item, s }: Props) {
  return (
    <div style={{ ...center, position: "absolute", inset: 0, flexDirection: "column", gap: 8, padding: "0 24px", textAlign: "center" }}>
      {item.icon && <Glyph name={item.icon} size={56} color={s.secondary} />}
      <span style={{ marginTop: 4, fontSize: 22, fontWeight: 700, color: s.label }}>{item.label}</span>
      {item.supporting?.trim() && <span style={{ fontSize: 15, lineHeight: 1.35, color: s.secondary }}>{item.supporting}</span>}
    </div>
  );
}

/** one iOS-only control in its box */
export function IosControl(props: Props) {
  switch (props.item.kind) {
    case "sectionHeader":
      return <SectionHeader {...props} />;
    case "stepper":
      return <Stepper {...props} />;
    case "wheelPicker":
      return <WheelPicker {...props} />;
    case "colorPicker":
      return <ColorPicker {...props} />;
    case "disclosure":
      return <Disclosure {...props} />;
    case "textEditor":
      return <TextEditor {...props} />;
    case "pageControl":
      return <PageControl {...props} />;
    case "gauge":
      return <Gauge {...props} />;
    case "menu":
      return <Menu {...props} />;
    case "actionSheet":
      return <ActionSheet {...props} />;
    case "emptyState":
      return <EmptyState {...props} />;
    default:
      return null;
  }
}
