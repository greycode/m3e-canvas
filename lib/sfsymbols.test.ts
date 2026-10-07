import { describe, expect, it } from "vitest";

import { SF_SYMBOLS, glyphOf, looksLikeSfName, searchSf, sfToMaterial, sfToNames } from "./sfsymbols";

describe("SF Symbols catalog", () => {
  it("holds well-formed, unique names, each with a Material stand-in", () => {
    const names = SF_SYMBOLS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
    for (const s of SF_SYMBOLS) {
      expect(s.name).toMatch(/^[a-z0-9]+(\.[a-z0-9]+)*$/);
      expect(s.material).toMatch(/^[a-z0-9_]+$/);
    }
    expect(SF_SYMBOLS.length).toBeGreaterThanOrEqual(200);
  });

  it("draws SF names through their stand-in and leaves Material names alone", () => {
    expect(glyphOf("sf:heart.fill")).toEqual({ glyph: "favorite", fill: true });
    expect(glyphOf("sf:magnifyingglass")).toEqual({ glyph: "search", fill: false });
    expect(glyphOf("sf:not.in.catalog")).toEqual({ glyph: "category", fill: false });
    expect(glyphOf("home")).toEqual({ glyph: "home", fill: false });
  });

  it("writes SF names out on iOS and Material names elsewhere", () => {
    expect(sfToNames("a sf:magnifyingglass icon, then sf:house.")).toBe("a magnifyingglass icon, then house.");
    expect(sfToMaterial("a sf:magnifyingglass icon, then sf:house.")).toBe("a search icon, then home.");
    expect(sfToMaterial("no symbols here")).toBe("no symbols here");
  });

  it("finds symbols by name or meaning and accepts typed names", () => {
    expect(searchSf("heart").map((s) => s.name)).toContain("heart.fill");
    expect(searchSf("delete").map((s) => s.name)).toContain("trash");
    expect(looksLikeSfName("figure.walk.circle")).toBe(true);
    expect(looksLikeSfName("not a name")).toBe(false);
  });
});
