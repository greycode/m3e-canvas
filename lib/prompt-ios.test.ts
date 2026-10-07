import { afterEach, describe, expect, it } from "vitest";

import { Lang, setGlobalLang } from "./i18n";
import { buildPrompt } from "./prompt";
import { ICON_MAP_IOS, iconLineIos, styleNoteIos, toPointsIos } from "./prompt-ios";
import { Doc, Item, KIND_ORDER, makeItem } from "./tokens";

const LANGS: Lang[] = ["ja", "en", "zh", "ko"];
const STYLE_HEAD: Record<Lang, string> = { ja: "## 各部品のスタイル", en: "## Component styles", zh: "## 各组件的样式", ko: "## 부품별 스타일" };
const GENERAL_HEAD: Record<Lang, string> = { ja: "## 全体の指針", en: "## General guidance", zh: "## 整体原则", ko: "## 전체 지침" };
/* words that only belong to the Android or web prompt */
const NOT_IOS = ["Jetpack Compose", "Material Web", "Room", "DataStore", "APK", "Material Symbols Rounded", "MotionScheme", "dynamicLightColorScheme", "Material 3 Expressive design", "press-scale"];

/* one part of every kind, each in its own group, stacked down one phone screen */
function everyKind(): Doc {
  const items: Item[] = KIND_ORDER.map((kind, i) => ({ ...makeItem(kind), id: `p${i}` }));
  return {
    groups: items.map((it, i) => ({ id: `g${i}`, x: 16, y: 24 + i * 24, axis: "x" as const, items: [it] })),
    frames: [{ id: "f-home", name: "Home", x: 0, y: 0 }],
    paletteKey: "purple",
    frame: "phone",
    platform: "ios",
    title: "Notes",
    brief: "",
  };
}

function build(lang: Lang) {
  setGlobalLang(lang);
  return buildPrompt(everyKind(), {}, undefined, lang);
}

describe("iOS prompt", () => {
  afterEach(() => setGlobalLang("ja"));

  it("has a SwiftUI note for every kind in every language", () => {
    for (const lang of LANGS) for (const k of KIND_ORDER) expect(styleNoteIos(k, lang).length).toBeGreaterThan(40);
  });

  it.each(LANGS)("writes one style note per kind in use in %s", (lang) => {
    const ls = build(lang).split("\n");
    const bullets = ls.slice(ls.indexOf(STYLE_HEAD[lang]), ls.indexOf(GENERAL_HEAD[lang])).filter((l) => l.startsWith("- "));
    expect(bullets).toHaveLength(new Set(KIND_ORDER).size);
  });

  it.each(LANGS)("carries no Android or web wording and no dp / sp in %s", (lang) => {
    const p = build(lang);
    for (const w of NOT_IOS) expect(p).not.toContain(w);
    expect(p).not.toMatch(/\d ?[ds]p\b/);
    expect(p).toContain("SwiftUI");
    expect(p).toContain("xcodebuild");
  });

  it("asks for iOS 26, Liquid Glass and the system tab bar", () => {
    const p = build("en");
    for (const w of ["iOS 26.0", "Liquid Glass", "TabView", "GlassEffectContainer", "NavigationStack"]) expect(p).toContain(w);
  });

  it("maps only the icons in use", () => {
    const items: Item[] = [{ ...makeItem("button"), icon: "search" }, { ...makeItem("iconButton"), icon: "zz_unknown" }];
    const line = iconLineIos(items, "en");
    expect(line).toContain("search → magnifyingglass");
    expect(line).toContain("for zz_unknown, pick the closest SF Symbol");
    expect(line).not.toContain("home → house");
    expect(iconLineIos([], "en")).toBe("");
    for (const v of Object.values(ICON_MAP_IOS)) expect(v).toMatch(/^[a-z0-9.]+$/);
  });

  it("turns dp and sp into pt and leaves words alone", () => {
    expect(toPointsIos("56dp, 16 sp, 3dp gaps, HStack(spacing: 8)")).toBe("56pt, 16pt, 3pt gaps, HStack(spacing: 8)");
  });
});
