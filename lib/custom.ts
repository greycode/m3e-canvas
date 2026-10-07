/**
 * Custom components: parts that no built-in kind covers, defined as data.
 *
 * A custom part is an item of kind "custom" that carries its whole definition in `custom`:
 * an UpperCamelCase name, a description, the props it takes (with defaults), an optional
 * reference implementation and a layout tree the canvas draws. Instances of one component
 * share its name and definition and differ in `props` (and in label, supporting, icon and
 * size). The prompt describes every component once, under "Custom components", with a sketch
 * generated from the layout, and the layout section names the instances, so the code model
 * builds each component once and reuses it.
 *
 * The layout is a small declarative tree, never code. A shared link is untrusted, so nothing
 * in a definition runs: every string ends up as text, pictures must be https, and the size of
 * a tree is capped. This module imports types only, so tokens.ts can import it.
 */
import type { Lang } from "./i18n";
import type { Item, KindSpec, Platform } from "./tokens";

export type ColorRef =
  | "primary"
  | "onPrimary"
  | "label"
  | "secondary"
  | "tertiary"
  | "fill"
  | "row"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "white"
  | "black"
  | `#${string}`;

/** any node may carry a condition, for example "{{i}} <= {{rating}}"; the node is drawn only when it holds */
type Cond = { if?: string };
export type StackNode = Cond & {
  type: "vstack" | "hstack" | "zstack";
  spacing?: number;
  padding?: number;
  align?: "start" | "center" | "end";
  fill?: ColorRef;
  radius?: number;
  glass?: boolean;
  grow?: boolean;
  children: CustomNode[];
};
export type CustomNode =
  | StackNode
  | (Cond & { type: "text"; text: string; size?: number; weight?: "regular" | "medium" | "semibold" | "bold"; color?: ColorRef; lines?: number })
  | (Cond & { type: "icon"; name: string; size?: number; color?: ColorRef })
  | (Cond & { type: "shape"; shape?: "rect" | "circle" | "capsule"; w?: number; h?: number; fill?: ColorRef; radius?: number })
  | (Cond & { type: "image"; w?: number; h?: number; radius?: number; src?: string })
  | (Cond & { type: "spacer"; size?: number })
  | (Cond & { type: "progress"; value: string | number; color?: ColorRef })
  | (Cond & { type: "repeat"; count: string | number; child: CustomNode });

export type CustomDef = {
  /** UpperCamelCase, the type name the code model gives the component */
  name: string;
  description?: string;
  /** the props it takes, each with the default the canvas uses */
  props?: Record<string, string>;
  /** the default box; an instance's size and size2 win */
  w?: number;
  h?: number;
  /** a reference implementation the prompt passes on (SwiftUI on iOS) */
  swiftui?: string;
  layout?: CustomNode;
};

/* ---------- validation: what a file or a link may carry ---------- */

const NAME = /^[A-Z][A-Za-z0-9]{0,47}$/;
const PROP_KEY = /^[a-zA-Z][a-zA-Z0-9]{0,31}$/;
const TEMPLATE = /^\{\{\s*[a-zA-Z][a-zA-Z0-9]*\s*\}\}$/;
const ICON = /^(sf:)?[a-z0-9_.]{1,80}$/;
const NAMED_COLORS = new Set(["primary", "onPrimary", "label", "secondary", "tertiary", "fill", "row", "red", "orange", "yellow", "green", "blue", "purple", "white", "black"]);
const WEIGHTS = new Set(["regular", "medium", "semibold", "bold"]);
const ALIGNS = new Set(["start", "center", "end"]);
const SHAPES = new Set(["rect", "circle", "capsule"]);
export const MAX_DEPTH = 8;
export const MAX_NODES = 200;

const isRec = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, min: number, max: number) => v === undefined || (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max);
const str = (v: unknown, max: number) => v === undefined || (typeof v === "string" && v.length <= max);
const bool = (v: unknown) => v === undefined || typeof v === "boolean";
const numOrTemplate = (v: unknown) => (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && v.length <= 64);
export const isColorRef = (v: unknown): v is ColorRef => typeof v === "string" && (NAMED_COLORS.has(v) || /^#[0-9a-fA-F]{6}$/.test(v));
const color = (v: unknown) => v === undefined || isColorRef(v);

function validNode(n: unknown, depth: number, budget: { left: number }): boolean {
  if (!isRec(n) || depth > MAX_DEPTH || --budget.left < 0 || !str(n.if, 120)) return false;
  switch (n.type) {
    case "vstack":
    case "hstack":
    case "zstack":
      return (
        num(n.spacing, 0, 64) &&
        num(n.padding, 0, 64) &&
        (n.align === undefined || ALIGNS.has(n.align as string)) &&
        color(n.fill) &&
        num(n.radius, 0, 999) &&
        bool(n.glass) &&
        bool(n.grow) &&
        Array.isArray(n.children) &&
        n.children.length <= 40 &&
        n.children.every((c) => validNode(c, depth + 1, budget))
      );
    case "text":
      return typeof n.text === "string" && n.text.length <= 200 && num(n.size, 8, 64) && (n.weight === undefined || WEIGHTS.has(n.weight as string)) && color(n.color) && num(n.lines, 1, 10);
    case "icon":
      return typeof n.name === "string" && (ICON.test(n.name) || TEMPLATE.test(n.name)) && num(n.size, 8, 96) && color(n.color);
    case "shape":
      return (n.shape === undefined || SHAPES.has(n.shape as string)) && num(n.w, 0, 2000) && num(n.h, 0, 2000) && color(n.fill) && num(n.radius, 0, 999);
    case "image":
      return num(n.w, 0, 2000) && num(n.h, 0, 2000) && num(n.radius, 0, 999) && (n.src === undefined || (typeof n.src === "string" && n.src.length <= 2000 && /^https:\/\//.test(n.src)));
    case "spacer":
      return num(n.size, 0, 400);
    case "progress":
      return numOrTemplate(n.value) && color(n.color);
    case "repeat":
      return numOrTemplate(n.count) && validNode(n.child, depth + 1, budget);
    default:
      return false;
  }
}

export const isProps = (v: unknown): v is Record<string, string> =>
  isRec(v) && Object.keys(v).length <= 24 && Object.entries(v).every(([k, x]) => PROP_KEY.test(k) && typeof x === "string" && x.length <= 200);

/** whether a value is a definition the editor will draw and the prompt will pass on */
export function isCustomDef(v: unknown): v is CustomDef {
  return (
    isRec(v) &&
    typeof v.name === "string" &&
    NAME.test(v.name) &&
    str(v.description, 600) &&
    str(v.swiftui, 6000) &&
    num(v.w, 24, 2000) &&
    num(v.h, 16, 2000) &&
    (v.props === undefined || isProps(v.props)) &&
    (v.layout === undefined || validNode(v.layout, 0, { left: MAX_NODES }))
  );
}

/* ---------- values: props, templates and conditions ---------- */

/** the values an instance's templates see: its words, then the definition's defaults, then its own props */
export function varsOf(it: Item): Record<string, string> {
  return { label: it.label, supporting: it.supporting ?? "", icon: it.icon ?? "", ...(it.custom?.props ?? {}), ...(it.props ?? {}) };
}

/** "{{rating}} stars" with rating 4 is "4 stars"; an unknown name is empty */
export const fillIn = (s: string, vars: Record<string, string>) => s.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g, (_, k: string) => vars[k] ?? "");

/** a condition such as "{{i}} <= {{rating}}": numbers compare as numbers; anything else only by == and != */
export function holds(cond: string | undefined, vars: Record<string, string>): boolean {
  if (!cond) return true;
  const text = fillIn(cond, vars);
  const m = text.match(/^\s*(.*?)\s*(<=|>=|==|!=|<|>)\s*(.*?)\s*$/);
  if (!m) return text.trim() !== "" && text.trim() !== "0" && text.trim() !== "false";
  const [, a, op, b] = m;
  const x = Number(a);
  const y = Number(b);
  const numeric = a !== "" && b !== "" && !Number.isNaN(x) && !Number.isNaN(y);
  switch (op) {
    case "==":
      return numeric ? x === y : a === b;
    case "!=":
      return numeric ? x !== y : a !== b;
    case "<":
      return numeric && x < y;
    case "<=":
      return numeric && x <= y;
    case ">":
      return numeric && x > y;
    default:
      return numeric && x >= y;
  }
}

/** how many times a repeat draws its child: 0 to 50 */
export const countOf = (v: string | number, vars: Record<string, string>) => Math.max(0, Math.min(50, Math.floor(Number(typeof v === "number" ? v : fillIn(v, vars))) || 0));

/* ---------- the kind ---------- */

export const CUSTOM_KIND_SPEC: KindSpec = {
  label: "Custom component",
  noun: "カスタム部品",
  category: "content",
  paletteIcon: "widgets",
  w: 380,
  h: 120,
  radius: 16,
  hasVariant: false,
  hasLabel: true,
  hasSupporting: true,
  hasIcon: true,
  size: { min: 24, max: 1280, step: 4, icon: "width" },
  size2: { min: 16, max: 892, step: 4, icon: "height" },
  defLabel: "",
  defIcon: null,
  defSupporting: "",
};

export const CUSTOM_KIND_TEXT: Record<Lang, { noun: string }> = {
  ja: { noun: "カスタム部品" },
  en: { noun: "custom component" },
  zh: { noun: "自定义组件" },
  ko: { noun: "사용자 정의 컴포넌트" },
};

/** the box of a custom part: its own size, else its definition's, else 380 × 120 */
export const customSizeOf = (it: Item) => ({ w: it.size ?? it.custom?.w ?? 380, h: it.size2 ?? it.custom?.h ?? 120 });

/* ---------- sketches: the layout written out for the code model ---------- */

/** the Dynamic Type style nearest to a point size, as in the iOS text note */
function textStyle(size: number, weight?: string) {
  if (size >= 34) return "largeTitle";
  if (size >= 28) return "title";
  if (size >= 22) return "title2";
  if (size >= 20) return "title3";
  if (size >= 17) return weight === "semibold" || weight === "bold" ? "headline" : "body";
  if (size >= 16) return "callout";
  if (size >= 15) return "subheadline";
  if (size >= 13) return "footnote";
  if (size >= 12) return "caption";
  return "caption2";
}

function swiftColor(c: ColorRef): string {
  if (c.startsWith("#")) {
    const [r, g, b] = [1, 3, 5].map((i) => (parseInt(c.slice(i, i + 2), 16) / 255).toFixed(3));
    return `Color(red: ${r}, green: ${g}, blue: ${b})`;
  }
  const map: Record<string, string> = {
    primary: ".tint",
    onPrimary: ".white",
    label: ".primary",
    secondary: ".secondary",
    tertiary: ".tertiary",
    fill: "Color(.secondarySystemFill)",
    row: "Color(.secondarySystemGroupedBackground)",
  };
  return map[c] ?? `.${c}`;
}

/** a template inside Swift code: {{rating}} becomes the identifier rating */
const swiftExpr = (s: string) => s.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g, "$1");
/** a template inside a Swift string literal: {{name}} becomes \(name) */
const swiftString = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g, "\\($1)")}"`;

function swiftLines(n: CustomNode, pad: string): string[] {
  const out: string[] = [];
  const inner = n.if ? `${pad}  ` : pad;
  const body: string[] = [];
  switch (n.type) {
    case "vstack":
    case "hstack":
    case "zstack": {
      const V = { vstack: "VStack", hstack: "HStack", zstack: "ZStack" }[n.type];
      const al = n.align && n.align !== "center" ? { vstack: { start: ".leading", end: ".trailing" }, hstack: { start: ".top", end: ".bottom" }, zstack: { start: ".topLeading", end: ".bottomTrailing" } }[n.type][n.align] : null;
      const args = [al && `alignment: ${al}`, n.type !== "zstack" && n.spacing !== undefined && `spacing: ${n.spacing}`].filter(Boolean).join(", ");
      body.push(`${inner}${V}${args ? `(${args})` : ""} {`);
      for (const c of n.children) body.push(...swiftLines(c, `${inner}  `));
      body.push(`${inner}}`);
      if (n.grow) body.push(`${inner}.frame(maxWidth: .infinity${n.type === "vstack" && n.align === "start" ? ", alignment: .leading" : n.type === "vstack" && n.align === "end" ? ", alignment: .trailing" : ""})`);
      if (n.padding !== undefined) body.push(`${inner}.padding(${n.padding})`);
      const shape = n.radius ? `.rect(cornerRadius: ${n.radius})` : null;
      if (n.glass) body.push(`${inner}.glassEffect(.regular${shape ? `, in: ${shape}` : ""})`);
      else if (n.fill) body.push(`${inner}.background(${swiftColor(n.fill)}${shape ? `, in: ${shape}` : ""})`);
      break;
    }
    case "text":
      body.push(`${inner}Text(${TEMPLATE.test(n.text) ? swiftExpr(n.text) : swiftString(n.text)})`);
      body.push(`${inner}  .font(.${textStyle(n.size ?? 17, n.weight)})`);
      if (n.weight && n.weight !== "regular" && textStyle(n.size ?? 17, n.weight) !== "headline") body.push(`${inner}  .fontWeight(.${n.weight})`);
      if (n.color) body.push(`${inner}  .foregroundStyle(${swiftColor(n.color)})`);
      if (n.lines) body.push(`${inner}  .lineLimit(${n.lines})`);
      break;
    case "icon": {
      const name = TEMPLATE.test(n.name) ? swiftExpr(n.name) : n.name.startsWith("sf:") ? `"${n.name.slice(3)}"` : `"${n.name}" /* a Material Symbols name: use the closest SF Symbol */`;
      body.push(`${inner}Image(systemName: ${name})`);
      if (n.size) body.push(`${inner}  .font(.system(size: ${n.size}))`);
      if (n.color) body.push(`${inner}  .foregroundStyle(${swiftColor(n.color)})`);
      break;
    }
    case "shape": {
      const S = n.shape === "circle" ? "Circle()" : n.shape === "capsule" ? "Capsule()" : `RoundedRectangle(cornerRadius: ${n.radius ?? 0})`;
      body.push(`${inner}${S}`);
      body.push(`${inner}  .fill(${n.fill ? swiftColor(n.fill) : ".tint"})`);
      if (n.w !== undefined || n.h !== undefined) body.push(`${inner}  .frame(${[n.w !== undefined && `width: ${n.w}`, n.h !== undefined && `height: ${n.h}`].filter(Boolean).join(", ")})`);
      break;
    }
    case "image":
      body.push(n.src ? `${inner}AsyncImage(url: URL(string: "${n.src}")) { $0.resizable().scaledToFill() } placeholder: { Color(.secondarySystemFill) }` : `${inner}Image(systemName: "photo") /* the app's own picture */`);
      if (n.w !== undefined || n.h !== undefined) body.push(`${inner}  .frame(${[n.w !== undefined && `width: ${n.w}`, n.h !== undefined && `height: ${n.h}`].filter(Boolean).join(", ")})`);
      if (n.radius) body.push(`${inner}  .clipShape(.rect(cornerRadius: ${n.radius}))`);
      break;
    case "spacer":
      body.push(n.size ? `${inner}Spacer().frame(width: ${n.size}, height: ${n.size})` : `${inner}Spacer()`);
      break;
    case "progress":
      body.push(`${inner}ProgressView(value: ${typeof n.value === "number" ? n.value : `Double(${swiftExpr(n.value)}) ?? 0`}, total: 100)`);
      if (n.color) body.push(`${inner}  .tint(${swiftColor(n.color)})`);
      break;
    case "repeat":
      body.push(`${inner}ForEach(1...${typeof n.count === "number" ? n.count : `max(1, Int(${swiftExpr(n.count)}) ?? 1)`}, id: \\.self) { i in`);
      body.push(...swiftLines(n.child, `${inner}  `));
      body.push(`${inner}}`);
      break;
  }
  if (n.if) return [...out, `${pad}if ${swiftExpr(n.if)} {`, ...body, `${pad}}`];
  return body;
}

function outlineLines(n: CustomNode, pad: string): string[] {
  const cond = n.if ? ` when ${n.if.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g, "$1")}` : "";
  const opts = (xs: (string | false | undefined)[]) => {
    const o = xs.filter(Boolean).join(", ");
    return o ? ` (${o})` : "";
  };
  switch (n.type) {
    case "vstack":
    case "hstack":
    case "zstack": {
      const head = `${pad}${{ vstack: "column", hstack: "row", zstack: "layers" }[n.type]}${opts([n.spacing !== undefined && `spacing ${n.spacing}`, n.padding !== undefined && `padding ${n.padding}`, n.align && `align ${n.align}`, n.fill && `fill ${n.fill}`, n.radius !== undefined && `corner ${n.radius}`, n.glass && "translucent", n.grow && "fills the width"])}${cond}`;
      return [head, ...n.children.flatMap((c) => outlineLines(c, `${pad}  `))];
    }
    case "text":
      return [`${pad}text "${n.text}"${opts([n.size !== undefined && `size ${n.size}`, n.weight, n.color, n.lines !== undefined && `${n.lines} lines`])}${cond}`];
    case "icon":
      return [`${pad}icon ${n.name}${opts([n.size !== undefined && `size ${n.size}`, n.color])}${cond}`];
    case "shape":
      return [`${pad}${n.shape ?? "rect"}${opts([n.w !== undefined && `${n.w} wide`, n.h !== undefined && `${n.h} tall`, n.fill, n.radius !== undefined && `corner ${n.radius}`])}${cond}`];
    case "image":
      return [`${pad}image${opts([n.w !== undefined && `${n.w} wide`, n.h !== undefined && `${n.h} tall`, n.radius !== undefined && `corner ${n.radius}`, n.src])}${cond}`];
    case "spacer":
      return [`${pad}space${n.size ? ` ${n.size}` : " (flexible)"}${cond}`];
    case "progress":
      return [`${pad}progress bar at ${n.value}%${opts([n.color])}${cond}`];
    case "repeat":
      return [`${pad}repeat ${n.count} times as i${cond}`, ...outlineLines(n.child, `${pad}  `)];
  }
}

/** the layout written out: a SwiftUI skeleton for iOS, an outline elsewhere */
export const sketchOf = (layout: CustomNode, platform: Platform) => (platform === "ios" ? swiftLines(layout, "") : outlineLines(layout, ""));

/* ---------- prompt text ---------- */

type Words = {
  heading: string;
  intro: (pl: Platform) => string;
  props: (list: string) => string;
  sketch: string;
  reference: string;
  instance: (name: string, values: string) => string;
  undefined: string;
  note: (pl: Platform) => string;
};

const view = (pl: Platform, ios: string, web: string, android: string) => (pl === "ios" ? ios : pl === "web" ? web : android);

const WORDS: Record<Lang, Words> = {
  en: {
    heading: "## Custom components",
    intro: (pl) => `These parts are defined by the designer rather than built in. Build each one once as its own reusable ${view(pl, "SwiftUI view (`struct Name: View`)", "component", "composable function")} that takes the listed props, and use it wherever the layout names it, with the values given there.`,
    props: (list) => `Props: ${list}.`,
    sketch: "Canvas sketch:",
    reference: "Reference implementation from the designer (keep its intent and follow the rules above):",
    instance: (name, values) => `the custom component ${name}${values ? ` (${values})` : ""}`,
    undefined: "a custom component that has no definition yet",
    note: (pl) => `Custom component → its own reusable ${view(pl, "SwiftUI view", "component", "composable")}, built once from its entry under "Custom components" and placed wherever the layout names it, with the props listed there. Inside it, follow the same rules as the built-in parts.`,
  },
  zh: {
    heading: "## 自定义组件",
    intro: (pl) => `以下组件由设计者定义，不是系统内置组件。每个组件只实现一次，做成可复用的${view(pl, " SwiftUI 视图（`struct 名称: View`）", "组件", "可组合函数（composable）")}，接收所列属性；屏幕结构中出现该名称的地方都复用它，并使用那里给出的属性值。`,
    props: (list) => `属性：${list}。`,
    sketch: "画布草图：",
    reference: "设计者提供的参考实现（保留其意图，并遵守上面的规则）：",
    instance: (name, values) => `自定义组件 ${name}${values ? `（${values}）` : ""}`,
    undefined: "尚未定义的自定义组件",
    note: (pl) => `自定义组件 → 各自做成可复用的${view(pl, " SwiftUI 视图", "组件", "可组合函数")}，按「自定义组件」中的条目只实现一次，在屏幕结构中出现该名称的地方复用，并传入那里列出的属性值。组件内部同样遵守内置组件的规则。`,
  },
  ja: {
    heading: "## カスタム部品",
    intro: (pl) => `以下は組み込みではなく、デザイナーが定義した部品です。それぞれ一度だけ、一覧の props を受け取る再利用可能な${view(pl, " SwiftUI ビュー（`struct 名前: View`）", "コンポーネント", "コンポーザブル関数")}として実装し、画面構成でその名前が出てくる箇所すべてで、そこで指定された値を渡して使ってください。`,
    props: (list) => `props：${list}。`,
    sketch: "キャンバス上のスケッチ：",
    reference: "デザイナーの参考実装（意図を保ち、上のルールに従う）：",
    instance: (name, values) => `カスタム部品 ${name}${values ? `（${values}）` : ""}`,
    undefined: "まだ定義のないカスタム部品",
    note: (pl) => `カスタム部品 → それぞれ再利用可能な${view(pl, " SwiftUI ビュー", "コンポーネント", "コンポーザブル")}として「カスタム部品」の項目から一度だけ実装し、画面構成で名前が出てくる箇所で、そこに書かれた props を渡して使う。内部も組み込み部品と同じルールに従う。`,
  },
  ko: {
    heading: "## 사용자 정의 컴포넌트",
    intro: (pl) => `아래 부품은 기본 제공이 아니라 디자이너가 정의한 것이다. 각각 한 번만, 나열된 props를 받는 재사용 가능한 ${view(pl, "SwiftUI 뷰(`struct 이름: View`)", "컴포넌트", "컴포저블 함수")}로 구현하고, 화면 구성에서 그 이름이 나오는 곳마다 거기 적힌 값으로 재사용한다.`,
    props: (list) => `props: ${list}.`,
    sketch: "캔버스 스케치:",
    reference: "디자이너의 참고 구현(의도를 유지하고 위 규칙을 따른다):",
    instance: (name, values) => `사용자 정의 컴포넌트 ${name}${values ? ` (${values})` : ""}`,
    undefined: "아직 정의가 없는 사용자 정의 컴포넌트",
    note: (pl) => `사용자 정의 컴포넌트 → 각각 재사용 가능한 ${view(pl, "SwiftUI 뷰", "컴포넌트", "컴포저블")}로, "사용자 정의 컴포넌트" 항목에 따라 한 번만 구현하고 화면 구성에서 이름이 나오는 곳마다 거기 적힌 props로 사용한다. 내부도 기본 부품과 같은 규칙을 따른다.`,
  },
};

/** the style note for the custom kind on Android and the web (iOS has its own in prompt-ios.ts) */
export const customStyleNote = (lang: Lang, platform: Platform) => WORDS[lang].note(platform);

/** how the layout names one instance: the component and the prop values it passes */
export function customItemText(it: Item, lang: Lang): string {
  const def = it.custom;
  if (!def) return WORDS[lang].undefined;
  const vars = varsOf(it);
  const values = Object.keys(def.props ?? {})
    .map((k) => `${k} "${vars[k] ?? ""}"`)
    .join(", ");
  return WORDS[lang].instance(def.name, values);
}

/** the "Custom components" section: each definition once, in the order the layout first meets it */
export function customSection(items: Item[], lang: Lang, platform: Platform): string[] {
  const defs = new Map<string, CustomDef>();
  for (const it of items) if (it.kind === "custom" && it.custom && !defs.has(it.custom.name)) defs.set(it.custom.name, it.custom);
  if (defs.size === 0) return [];
  const w = WORDS[lang];
  const lines = ["", w.heading, w.intro(platform)];
  for (const def of defs.values()) {
    const props = Object.entries(def.props ?? {})
      .map(([k, v]) => `${k} ("${v}")`)
      .join(", ");
    lines.push(`- ${def.name}: ${def.description?.trim() || def.name}${props ? ` ${w.props(props)}` : ""}`);
    if (def.layout) {
      lines.push(`  ${w.sketch}`);
      lines.push(platform === "ios" ? "  ```swift" : "  ```text");
      for (const l of sketchOf(def.layout, platform)) lines.push(`  ${l}`);
      lines.push("  ```");
    }
    if (def.swiftui?.trim() && platform === "ios") {
      lines.push(`  ${w.reference}`);
      lines.push("  ```swift");
      for (const l of def.swiftui.trim().split("\n")) lines.push(`  ${l}`);
      lines.push("  ```");
    }
  }
  return lines;
}
