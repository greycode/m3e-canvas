"use client";

import { t, useLang } from "../lib/i18n";
import type { Item, Palette } from "../lib/tokens";
import { DESTRUCTIVE, Glyph, Sys, center, glass, oneLine, rowStyle, tint } from "./iosStyle";

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

/** a Link: accent-colored words in a grouped row */
function Link({ item, p, s }: Props) {
  return (
    <div style={rowStyle(s)}>
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: p.primary }}>{item.label}</span>
    </div>
  );
}

/** LabeledContent: the label, and the value right-aligned in the secondary color */
function LabeledContent({ item, s }: Props) {
  return (
    <div style={rowStyle(s)}>
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: s.label }}>{item.label}</span>
      <span style={{ ...oneLine, maxWidth: "50%", fontSize: 17, color: s.secondary }}>{item.supporting}</span>
    </div>
  );
}

/** a SecureField: the placeholder in a grouped row */
function SecureField({ item, s }: Props) {
  return (
    <div style={rowStyle(s)}>
      <span style={{ ...oneLine, flex: 1, fontSize: 17, color: s.tertiary }}>{item.label}</span>
    </div>
  );
}

/** a section footer: footnote type under the section above */
function SectionFooter({ item, s }: Props) {
  return (
    <div style={{ position: "absolute", left: 16, right: 16, top: 4, fontSize: 13, lineHeight: 1.35, color: s.secondary, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.label}</div>
  );
}

/** a TipView: the symbol, the title and the message on a grouped card, the close button at the corner */
function Tip({ item, p, s }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", gap: 12, padding: "14px 36px 14px 14px", boxSizing: "border-box", borderRadius: 16, background: s.row }}>
      {item.icon && <Glyph name={item.icon} size={28} color={p.primary} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ ...oneLine, fontSize: 15, fontWeight: 600, color: s.label }}>{item.label}</span>
        <span style={{ fontSize: 15, lineHeight: 1.3, color: s.secondary, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.supporting}</span>
      </div>
      <span style={{ position: "absolute", top: 10, right: 10 }}>
        <Glyph name="close" size={16} color={s.tertiary} />
      </span>
    </div>
  );
}

/** a PhotosPicker in the bordered button style */
function PhotosPicker({ item, p }: Props) {
  return (
    <div style={{ ...center, position: "absolute", inset: 0, gap: 8, borderRadius: 999, background: tint(p.primary, 14) }}>
      {item.icon && <Glyph name={item.icon} size={20} color={p.primary} />}
      <span style={{ ...oneLine, fontSize: 17, fontWeight: 500, color: p.primary }}>{item.label}</span>
    </div>
  );
}

/** Sign in with Apple and Apple Pay: the system's black (white when dark) button; the canvas draws no Apple logo */
function SystemButton({ item, s, dark }: Props) {
  return (
    <div style={{ ...center, ...oneLine, position: "absolute", inset: 0, borderRadius: 12, background: s.label, color: dark ? "#000000" : "#FFFFFF", fontSize: 19, fontWeight: 600 }}>{item.label}</div>
  );
}

/** a VideoPlayer: 16:9 black, a glass play button and the scrubber */
function VideoPlayer({ dark }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20, background: "#000000" }}>
      <div style={{ ...center, position: "absolute", left: "50%", top: "50%", width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: 999, ...glass(true, false) }}>
        <Glyph name="play_arrow" size={30} color="#FFFFFF" fill />
      </div>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)" }}>
        <div style={{ width: "30%", height: 4, borderRadius: 2, background: dark ? "#FFFFFF" : "#F2F2F7" }} />
      </div>
    </div>
  );
}

/** a LazyVGrid of square photos, three across with 2pt gaps */
function PhotoGrid({ p, s, w, h }: Props) {
  const cell = (w - 4) / 3;
  const rows = Math.max(1, Math.floor((h + 2) / (cell + 2)));
  const hues = [p.primary, "#34C759", "#FF9500", "#5AC8FA", "#FF2D55", "#AF52DE"];
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: cell, gap: 2, overflow: "hidden" }}>
      {Array.from({ length: rows * 3 }, (_, i) => (
        <div key={i} style={{ ...center, background: tint(hues[(i * 5) % hues.length], 22) }}>
          <Glyph name="image" size={22} color={s.tertiary} />
        </div>
      ))}
    </div>
  );
}

/** the tab bar's bottom accessory: a glass capsule with artwork, title and the play and next buttons */
function TabAccessory({ item, p, s, dark }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 10, padding: "0 16px 0 10px", borderRadius: 999, ...glass(dark, true) }}>
      <div style={{ ...center, flex: "0 0 auto", width: 36, height: 36, borderRadius: 8, background: tint(p.primary, 25) }}>{item.icon && <Glyph name={item.icon} size={20} color={p.primary} />}</div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ ...oneLine, fontSize: 15, fontWeight: 600, color: s.label }}>{item.label}</span>
        {item.supporting?.trim() && <span style={{ ...oneLine, fontSize: 13, color: s.secondary }}>{item.supporting}</span>}
      </div>
      <Glyph name="play_arrow" size={26} color={s.label} fill />
      <Glyph name="fast_forward" size={24} color={s.label} fill />
    </div>
  );
}

const SUBSCRIBE: Record<string, [string, string]> = {
  ja: ["登録する", "購入を復元"],
  en: ["Subscribe", "Restore Purchases"],
  zh: ["订阅", "恢复购买"],
  ko: ["구독하기", "구입 내역 복원"],
};

/** a SubscriptionStoreView: the marketing title, the plans as a picker, the subscribe button and restore */
function SubscriptionStore({ item, p, s }: Props) {
  const lang = useLang();
  const [subscribe, restore] = SUBSCRIBE[lang] ?? SUBSCRIBE.en;
  const plans = item.tabs ?? [];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8, padding: 20, boxSizing: "border-box", borderRadius: 22, background: s.row }}>
      <span style={{ ...oneLine, textAlign: "center", fontSize: 28, fontWeight: 700, color: s.label }}>{item.label}</span>
      <span style={{ ...oneLine, textAlign: "center", fontSize: 15, color: s.secondary, marginBottom: 8 }}>{item.supporting}</span>
      {plans.map((plan, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", height: 52, padding: "0 16px", boxSizing: "border-box", borderRadius: 14, border: `2px solid ${i === 0 ? p.primary : s.separator}`, background: i === 0 ? tint(p.primary, 8) : undefined }}>
          <span style={{ ...oneLine, flex: 1, fontSize: 17, fontWeight: 600, color: s.label }}>{plan.label}</span>
          <Glyph name={i === 0 ? "check_circle" : "radio_button_unchecked"} size={22} color={i === 0 ? p.primary : s.tertiary} fill={i === 0} />
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ ...center, height: 50, borderRadius: 999, background: p.primary, color: p.onPrimary, fontSize: 17, fontWeight: 600 }}>{subscribe}</div>
      <span style={{ textAlign: "center", fontSize: 13, color: p.primary }}>{restore}</span>
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
    case "link":
      return <Link {...props} />;
    case "labeledContent":
      return <LabeledContent {...props} />;
    case "secureField":
      return <SecureField {...props} />;
    case "sectionFooter":
      return <SectionFooter {...props} />;
    case "tip":
      return <Tip {...props} />;
    case "photosPicker":
      return <PhotosPicker {...props} />;
    case "signInWithApple":
    case "applePayButton":
      return <SystemButton {...props} />;
    case "videoPlayer":
      return <VideoPlayer {...props} />;
    case "photoGrid":
      return <PhotoGrid {...props} />;
    case "tabAccessory":
      return <TabAccessory {...props} />;
    case "subscriptionStore":
      return <SubscriptionStore {...props} />;
    default:
      return null;
  }
}
