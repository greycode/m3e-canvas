import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { CustomDef, countOf, customSizeOf, fillIn, holds, isCustomDef } from "../lib/custom";
import { setGlobalLang } from "../lib/i18n";
import { isProject } from "../lib/project";
import { buildPrompt } from "../lib/prompt";
import { Doc, Item, PALETTES, makeItem } from "../lib/tokens";
import { CustomBody } from "./CustomNode";

const STARS: CustomDef = {
  name: "RatingStars",
  description: "A read-only 0–5 star rating.",
  props: { rating: "3" },
  w: 380,
  h: 44,
  layout: {
    type: "hstack",
    spacing: 4,
    children: [
      {
        type: "repeat",
        count: 5,
        child: {
          type: "zstack",
          children: [
            { type: "icon", name: "sf:star.fill", color: "orange", if: "{{i}} <= {{rating}}" },
            { type: "icon", name: "sf:star", color: "tertiary", if: "{{i}} > {{rating}}" },
          ],
        },
      },
      { type: "text", text: "{{rating}} of 5", size: 15, color: "secondary" },
    ],
  },
  swiftui: "struct RatingStars: View {\n  let rating: Int\n  var body: some View { Text(\"\\(rating)\") }\n}",
};

const instance = (id: string, rating?: string, def: CustomDef = STARS): Item => ({ ...makeItem("custom"), id, custom: def, ...(rating ? { props: { rating } } : {}) });

function doc(platform: Doc["platform"], items: Item[]): Doc {
  return {
    groups: items.map((it, i) => ({ id: `g${i}`, x: 16, y: 24 + i * 60, axis: "x" as const, items: [it] })),
    frames: [{ id: "f", name: "Home", x: 0, y: 0 }],
    paletteKey: "purple",
    frame: "phone",
    platform,
    title: "T",
    brief: "",
  };
}

describe("custom components", () => {
  afterEach(() => setGlobalLang("ja"));

  it("accept a well-formed definition and refuse unsafe or oversized ones", () => {
    expect(isCustomDef(STARS)).toBe(true);
    expect(isCustomDef({ ...STARS, name: "ratingStars" })).toBe(false);
    expect(isCustomDef({ ...STARS, layout: { type: "script", text: "alert(1)" } })).toBe(false);
    expect(isCustomDef({ ...STARS, layout: { type: "image", src: "http://example.com/a.png" } })).toBe(false);
    expect(isCustomDef({ ...STARS, layout: { type: "image", src: "javascript:alert(1)" } })).toBe(false);
    expect(isCustomDef({ ...STARS, layout: { type: "text", text: "x", color: "url(evil)" } })).toBe(false);
    const deep = Array.from({ length: 12 }).reduce<object>((child) => ({ type: "vstack", children: [child] }), { type: "spacer" });
    expect(isCustomDef({ ...STARS, layout: deep })).toBe(false);
    const wide = { type: "vstack", children: Array.from({ length: 5 }, () => ({ type: "hstack", children: Array.from({ length: 40 }, () => ({ type: "spacer" })) })) };
    expect(isCustomDef({ ...STARS, layout: wide })).toBe(false);
  });

  it("fill templates, test conditions and bound repeats", () => {
    expect(fillIn("{{rating}} of 5", { rating: "4" })).toBe("4 of 5");
    expect(holds("{{i}} <= {{rating}}", { i: "3", rating: "4" })).toBe(true);
    expect(holds("{{i}} > {{rating}}", { i: "3", rating: "4" })).toBe(false);
    expect(holds("{{state}} == done", { state: "done" })).toBe(true);
    expect(countOf("{{n}}", { n: "999" })).toBe(50);
    expect(customSizeOf(instance("a"))).toEqual({ w: 380, h: 44 });
  });

  it("draw the stars the instance's rating asks for", () => {
    setGlobalLang("en");
    const html = renderToStaticMarkup(<CustomBody item={instance("a", "4")} p={PALETTES[0]} w={380} h={44} dark={false} />);
    expect(html.match(/data-fill="1"/g)).toHaveLength(4);
    expect(html).toContain("4 of 5");
    const empty = renderToStaticMarkup(<CustomBody item={makeItem("custom")} p={PALETTES[0]} w={380} h={120} dark={false} />);
    expect(empty).toContain("width:380px");
  });

  it("are described once and reused by every instance in the prompt", () => {
    setGlobalLang("en");
    const items = [instance("a", "4"), instance("b", "5")];
    const ios = buildPrompt(doc("ios", items), {}, undefined, "en");
    expect(ios.match(/## Custom components/g)).toHaveLength(1);
    expect(ios.match(/- RatingStars:/g)).toHaveLength(1);
    expect(ios).toContain('the custom component RatingStars (rating "4")');
    expect(ios).toContain('the custom component RatingStars (rating "5")');
    expect(ios).toContain("ForEach(1...5, id: \\.self) { i in");
    expect(ios).toContain("if i <= rating {");
    expect(ios).toContain('Image(systemName: "star.fill")');
    expect(ios).toContain("struct RatingStars: View");
    const android = buildPrompt(doc("android", items), {}, undefined, "en");
    expect(android).toContain("## Custom components");
    expect(android).toContain("repeat 5 times as i");
    expect(android).not.toContain("struct RatingStars");
    expect(android).not.toContain("sf:");
    const zh = buildPrompt(doc("ios", items), {}, undefined, "zh");
    expect(zh).toContain("## 自定义组件");
  });

  it("travel in project files and links, and a broken definition is refused", () => {
    expect(isProject(doc("ios", [instance("a", "4")]))).toBe(true);
    expect(isProject(doc("ios", [{ ...instance("a"), custom: { ...STARS, layout: { type: "iframe" } } } as unknown as Item]))).toBe(false);
    expect(isProject(doc("ios", [{ ...instance("a"), props: { "bad key": "1" } }]))).toBe(false);
  });
});
