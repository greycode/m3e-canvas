import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KIND_ORDER, MEASURED, PALETTES, Item, makeItem, sizeOf } from "../lib/tokens";
import { IOS_SKIN_KINDS, IosBody, takesIosSkin } from "./IosNode";

const draw = (item: Item, dark = false) => {
  const { w, h } = sizeOf(item, {});
  return renderToStaticMarkup(<IosBody item={item} p={PALETTES[0]} w={w} h={h} dark={dark} />);
};

describe("iOS canvas skin", () => {
  it("covers only kinds whose size does not come from how they are drawn", () => {
    for (const k of IOS_SKIN_KINDS) {
      expect(MEASURED).not.toContain(k);
      expect(takesIosSkin(makeItem(k))).toBe(true);
    }
  });

  it("leaves every other kind to the Material renderer", () => {
    for (const k of KIND_ORDER.filter((k) => !IOS_SKIN_KINDS.includes(k))) expect(takesIosSkin(makeItem(k))).toBe(false);
  });

  it.each(IOS_SKIN_KINDS)("draws %s in the Material part's own box, light and dark", (k) => {
    const item = makeItem(k);
    const { w, h } = sizeOf(item, {});
    for (const dark of [false, true]) {
      const html = draw(item, dark);
      expect(html).toContain(`width:${w}px`);
      expect(html).toContain(`height:${h}px`);
    }
  });

  it("shows the words the author typed", () => {
    const row: Item = { ...makeItem("listItem"), label: "Groceries", supporting: "3 items", switch: true, checked: true };
    expect(draw(row)).toContain("Groceries");
    expect(draw(row)).toContain("3 items");
    const bar: Item = { ...makeItem("topAppBar"), label: "Notes" };
    expect(draw(bar)).toContain("Notes");
    const nav: Item = { ...makeItem("bottomNav"), tabs: [{ icon: "home", label: "Home" }, { icon: "star", label: "Saved" }] };
    expect(draw(nav)).toContain("Saved");
  });
});
