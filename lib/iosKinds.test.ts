import { afterEach, describe, expect, it } from "vitest";

import { setGlobalLang, type Lang } from "./i18n";
import { IOS_ENTRY_BOUNDS, IOS_KINDS } from "./iosKinds";
import { buildPrompt } from "./prompt";
import { Doc, ENTRY_BOUNDS, IOS_ONLY_KINDS, Item, KIND_ORDER, KIND_SPEC, makeItem, sizeOf } from "./tokens";

const LANGS: Lang[] = ["ja", "en", "zh", "ko"];

function doc(platform: Doc["platform"], items: Item[]): Doc {
  return {
    groups: items.map((it, i) => ({ id: `g${i}`, x: 16, y: 24 + i * 40, axis: "x" as const, items: [it] })),
    frames: [{ id: "f", name: "Home", x: 0, y: 0 }],
    paletteKey: "purple",
    frame: "phone",
    platform,
    title: "T",
    brief: "",
  };
}

describe("iOS-only kinds", () => {
  afterEach(() => setGlobalLang("ja"));

  it("are registered, offered under iOS or Charts, and limited to sensible entry counts", () => {
    for (const k of IOS_KINDS) {
      expect(KIND_ORDER).toContain(k);
      expect(IOS_ONLY_KINDS).toContain(k);
      expect(["ios", "charts"]).toContain(KIND_SPEC[k].category);
      const b = IOS_ENTRY_BOUNDS[k];
      if (b) expect(ENTRY_BOUNDS[k]).toEqual(b);
    }
  });

  it.each(LANGS)("start with labels and entries in %s, within their bounds", (lang) => {
    setGlobalLang(lang);
    for (const k of IOS_KINDS) {
      const it = makeItem(k);
      const b = IOS_ENTRY_BOUNDS[k];
      if (KIND_SPEC[k].hasTabs) {
        expect(it.tabs?.length ?? 0).toBeGreaterThan(0);
        if (b) expect(it.tabs!.length).toBeLessThanOrEqual(b.max);
      }
      const { w, h } = sizeOf(it, {});
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
    }
  });

  it("grow a menu and an action sheet with their entries", () => {
    const menu = makeItem("menu");
    expect(sizeOf(menu, {}).h).toBe(12 + 44 * menu.tabs!.length);
    const sheet = makeItem("actionSheet");
    expect(sizeOf(sheet, {}).h).toBe(136 + 56 * sheet.tabs!.length);
  });

  it.each(LANGS)("are described with their words and given a SwiftUI note in %s", (lang) => {
    setGlobalLang(lang);
    const items = IOS_KINDS.map((k, i) => ({ ...makeItem(k), id: `p${i}` }));
    const p = buildPrompt(doc("ios", items), {}, undefined, lang);
    for (const it of items) if (it.label.trim()) expect(p).toContain(it.label.trim());
    for (const api of ["Stepper", "ContentUnavailableView", "confirmationDialog", "BarMark", "SectorMark", "AreaMark", "LineMark", "Gauge"]) expect(p).toContain(api);
    expect(p).not.toContain("sf:");
  });

  it("passes SF Symbol names through on iOS and maps them to Material elsewhere", () => {
    setGlobalLang("en");
    const empty: Item = { ...makeItem("emptyState"), id: "e", icon: "sf:tray" };
    const row: Item = { ...makeItem("listItem"), id: "r", icon: "sf:heart.fill", icon2: "chevron_right" };
    const ios = buildPrompt(doc("ios", [empty, row]), {}, undefined, "en");
    expect(ios).toContain("tray symbol");
    expect(ios).toContain("heart.fill");
    expect(ios).toContain("chevron_right → chevron.right");
    expect(ios).not.toContain("heart.fill →");
    const android = buildPrompt(doc("android", [empty, row]), {}, undefined, "en");
    expect(android).toContain("inbox");
    expect(android).toContain("favorite");
    expect(android).not.toContain("sf:");
  });
});
