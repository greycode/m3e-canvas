"use client";

import { useState } from "react";
import { t, useLang } from "@/lib/i18n";
import { Palette } from "@/lib/tokens";
import { SF_PREFIX, glyphOf, isSf, looksLikeSfName, searchSf, sfName } from "@/lib/sfsymbols";

/** The SF Symbols grid the icon picker shows on the iOS target. It stores "sf:<name>"; each tile
 *  shows the Material stand-in the canvas draws, and the symbol's real name on hover and in the
 *  search line. A name typed that is not in the catalog can be used as it is. */
export function SfSymbolGrid({ value, onChange, palette }: { value: string | null; onChange: (icon: string | null) => void; palette: Palette }) {
  const lang = useLang();
  const [q, setQ] = useState("");
  const typed = q.trim().toLowerCase();
  const found = searchSf(typed);
  const custom = typed && looksLikeSfName(typed) && !found.some((s) => s.name === typed) ? typed : null;
  const tile = (name: string) => {
    const icon = SF_PREFIX + name;
    const on = value === icon;
    const g = glyphOf(icon);
    return (
      <button
        key={name}
        title={name}
        aria-label={name}
        aria-pressed={on}
        onClick={() => onChange(icon)}
        style={{ aspectRatio: "1", minWidth: 0, display: "grid", placeItems: "center", borderRadius: 12, border: "none", cursor: "pointer", background: on ? palette.primary : "transparent", color: on ? palette.onPrimary : palette.onSurfaceVariant }}
      >
        <span className="msr" data-fill={g.fill ? "1" : "0"} style={{ fontSize: 22 }}>
          {g.glyph}
        </span>
      </button>
    );
  };
  return (
    <div className="no-scrollbar" style={{ height: 292, overflowY: "auto", overflowX: "hidden", borderRadius: 16, background: palette.surfaceContainerLow }}>
      <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px", background: palette.surfaceContainerLow }}>
        <input
          aria-label={t("searchIcons", lang)}
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SF Symbols"
          style={{ flex: 1, minWidth: 0, height: 40, border: "none", outline: "none", background: "transparent", color: palette.onSurface, fontSize: 14, fontFamily: "inherit" }}
        />
        {isSf(value) && <span style={{ fontSize: 12, color: palette.onSurfaceVariant, whiteSpace: "nowrap" }}>{sfName(value)}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))", gap: 4, padding: 6, alignContent: "start" }}>
        {!typed && (
          <button
            title={t("noIcon", lang)}
            aria-label={t("noIcon", lang)}
            aria-pressed={value === null}
            onClick={() => onChange(null)}
            style={{ aspectRatio: "1", minWidth: 0, display: "grid", placeItems: "center", borderRadius: 12, cursor: "pointer", border: `1.5px dashed ${value === null ? "transparent" : palette.outline}`, background: value === null ? palette.primary : "transparent", color: value === null ? palette.onPrimary : palette.onSurfaceVariant }}
          >
            <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden>
              <circle cx={11} cy={11} r={8} fill="none" stroke="currentColor" strokeWidth={1.6} />
              <line x1={5.3} y1={5.3} x2={16.7} y2={16.7} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            </svg>
          </button>
        )}
        {custom && tile(custom)}
        {found.map((s) => tile(s.name))}
      </div>
    </div>
  );
}
