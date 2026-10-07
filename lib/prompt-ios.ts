/**
 * iOS wording for the prompt generator: SwiftUI, deployment target iOS 26.0, built with
 * the iOS 27 SDK.
 *
 * buildPrompt (lib/prompt.ts) reads these tables only when doc.platform === "ios";
 * the Android and web prompts never touch this file.
 *
 * Language coverage: en and zh are complete. ja and ko have their own short phrases
 * (PH_IOS, DELIVERABLE_IOS, ICON_HEAD_IOS) and fall back to en for the long tables
 * (STYLE_NOTES_IOS, GENERAL_IOS, COLOR_MAP_IOS, THEME_IOS) until they are translated.
 */
import type { Lang } from "./i18n";
import type { Item, Kind, Platform, Theme } from "./tokens";
import { isIosKind } from "./iosKinds";
import { customItemText } from "./custom";

/** mirrors the private Viewport type in prompt.ts */
export type ViewportIos = "phone" | "desktop" | "mixed" | "free";

const trimEnd = (s: string) => s.trim().replace(/[。.\s]+$/, "");

/* ---------- fixed phrases that replace the Material ones ---------- */

type PhIos = {
  intro: (title: string, brief: string) => string;
  target: (vp: ViewportIos, pl: Platform, dark: boolean, both: boolean) => string;
  platform: (pl: Platform) => string;
  dynamic: (pl: Platform) => string;
  colorIntro: (label: string, fallback: boolean, th: Theme) => string;
  styleIntro: string;
};

export const PH_IOS: Record<Lang, PhIos> = {
  ja: {
    intro: (title, brief) => `${title}を SwiftUI のネイティブ iOS アプリとして、Apple の iOS 26 デザイン（Liquid Glass）とヒューマンインターフェイスガイドラインに沿って実装してください。${brief ? trimEnd(brief) + "。" : ""}`,
    target: (vp, _pl, dark, both) =>
      `${
        vp === "phone"
          ? "想定は iPhone の縦画面（402×874pt、iPhone 17）です。スケッチは 412×892 のキャンバスに描いたので、配置を保ったままセーフエリアに合わせてください。"
          : vp === "desktop"
            ? "想定は横向きの iPad 画面（基準 1180×820pt）で、"
            : vp === "mixed"
              ? "iPhone の縦画面（402×874pt）と横向きの iPad 画面（1180×820pt）の両方を想定し、同じ名前の画面は 1 つの画面の 2 つの幅として、サイズクラスでアダプティブに実装します。"
              : "レイアウトは自由配置で、"
      }${both ? "ライトモードとダークモードの両方に対応し、システム設定に従って切り替えます。" : dark ? "ダークモード固定です（.preferredColorScheme(.dark)）。" : "ライトモード固定です（.preferredColorScheme(.light)）。"}`,
    platform: () => "実装先は iOS（SwiftUI のネイティブアプリ）です。デプロイメントターゲットは iOS 26.0、Xcode 27 と iOS 27 SDK でビルドします。",
    dynamic: () => "iOS には壁紙から配色を作る仕組みがないため、下の色をアプリ固有の配色として使います。Liquid Glass は背後のコンテンツに合わせて自動で変化します。",
    colorIntro: (label, _fallback, th) =>
      `テーマは ${label} 系です。primary を AccentColor アセット${th.bothModes ? "（Any と Dark の両方）" : ""}に入れ、下の対応表にあるコンテナ系ロールを Assets.xcassets の名前付きカラーとして追加してください。それ以外のロールは対応表の iOS システムカラーを使います。${th.contrast === "high" ? "各カラーアセットには High Contrast の値も設定します。" : ""}`,
    styleIntro: "使っている部品ごとの SwiftUI の指針です。各項目は上の画面構成で使った Material の名前で始まり、iOS で代わりに使うコントロールを示します。システムのコントロールを優先し、色・ラベル・周囲のレイアウトだけを調整してください。",
  },
  en: {
    intro: (title, brief) => `Please implement ${title} as a native iOS app in SwiftUI, following Apple's iOS 26 design (Liquid Glass) and the Human Interface Guidelines.${brief ? ` ${trimEnd(brief)}.` : ""}`,
    target: (vp, _pl, dark, both) =>
      `${
        vp === "phone"
          ? "Target a portrait iPhone screen (402×874pt, iPhone 17); the sketch was drawn on a 412×892 canvas, so keep its arrangement and fit it to the safe areas"
          : vp === "desktop"
            ? "Target a landscape iPad screen (1180×820pt reference)"
            : vp === "mixed"
              ? "Target both a portrait iPhone (402×874pt) and a landscape iPad (1180×820pt); screens that share a name are one screen at two widths, so build them adaptively with size classes"
              : "The layout is free-form"
      }, ${both ? "supporting both light and dark mode and following the system setting" : `${dark ? "dark" : "light"} mode only (.preferredColorScheme(.${dark ? "dark" : "light"}))`}.`,
    platform: () => "Build it for iOS as a native SwiftUI app: deployment target iOS 26.0, built with Xcode 27 and the iOS 27 SDK.",
    dynamic: () => "iOS has no wallpaper-based color scheme: use the colors below as the app's own palette. Liquid Glass already adapts to the content behind it.",
    colorIntro: (label, _fallback, th) =>
      `The theme is ${label}. Put primary into the AccentColor asset${th.bothModes ? " with Any and Dark appearances" : ""} and add the container roles named in the mapping below as named colors in Assets.xcassets; every other role maps to an iOS system color as listed.${th.contrast === "high" ? " Give every color asset a High Contrast variant too." : ""}`,
    styleIntro: "Per-component SwiftUI guidance for the parts in use. Each entry starts with the Material name used in the layout above and names the iOS control to build instead. Prefer the system control and customize only its colors, labels and the layout around it.",
  },
  zh: {
    intro: (title, brief) => `请用 SwiftUI 把${title}实现为原生 iOS 应用，遵循 Apple 的 iOS 26 设计（Liquid Glass）和人机界面指南。${brief ? trimEnd(brief) + "。" : ""}`,
    target: (vp, _pl, dark, both) =>
      `${
        vp === "phone"
          ? "目标为竖屏 iPhone（402×874pt，iPhone 17）；草图画在 412×892 的画布上，请保持其布局并适配安全区域"
          : vp === "desktop"
            ? "目标为横屏 iPad（以 1180×820pt 为基准）"
            : vp === "mixed"
              ? "同时面向竖屏 iPhone（402×874pt）和横屏 iPad（1180×820pt）；同名的屏幕是同一个屏幕的两种宽度，请用尺寸类别（size class）做成自适应"
              : "布局为自由排布"
      }，${both ? "同时支持浅色和深色模式，并跟随系统设置切换" : `只做${dark ? "深色" : "浅色"}模式（.preferredColorScheme(.${dark ? "dark" : "light"})）`}。`,
    platform: () => "实现目标是 iOS（SwiftUI 原生应用）：部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建。",
    dynamic: () => "iOS 没有根据壁纸生成配色的机制，请把下面的颜色作为应用自己的配色。Liquid Glass 会自动适应其后方的内容。",
    colorIntro: (label, _fallback, th) =>
      `主题为 ${label} 系。把 primary 放进 AccentColor 资源${th.bothModes ? "（同时设置 Any 和 Dark 外观）" : ""}，并把下方对照表中的容器类角色添加为 Assets.xcassets 里的命名颜色；其余角色按对照表使用 iOS 系统颜色。${th.contrast === "high" ? "每个颜色资源还要设置 High Contrast 变体。" : ""}`,
    styleIntro: "以下是所用组件的 SwiftUI 实现指引。每一条以上面屏幕结构里使用的 Material 名称开头，并给出 iOS 上应改用的控件。优先使用系统控件，只调整颜色、文字和周围的布局。",
  },
  ko: {
    intro: (title, brief) => `SwiftUI 네이티브 iOS 앱으로 구현해 주세요: ${title}. Apple의 iOS 26 디자인(Liquid Glass)과 휴먼 인터페이스 가이드라인을 따른다.${brief ? ` ${trimEnd(brief)}.` : ""}`,
    target: (vp, _pl, dark, both) =>
      `${
        vp === "phone"
          ? "세로형 iPhone 화면(402×874pt, iPhone 17)을 대상으로 하며 412×892 캔버스에 그린 스케치의 배치를 유지한 채 안전 영역에 맞추고"
          : vp === "desktop"
            ? "가로형 iPad 화면(1180×820pt 기준)을 대상으로 하며"
            : vp === "mixed"
              ? "세로형 iPhone(402×874pt)과 가로형 iPad(1180×820pt)를 모두 지원하며, 이름이 같은 화면은 서로 다른 너비의 동일한 화면이므로 크기 클래스로 적응형으로 구현하고"
              : "레이아웃은 자유 배치이며"
      }, ${both ? "라이트 모드와 다크 모드를 모두 지원하고 시스템 설정을 따른다" : `${dark ? "다크" : "라이트"} 모드만 지원한다(.preferredColorScheme(.${dark ? "dark" : "light"}))`}.`,
    platform: () => "SwiftUI 네이티브 iOS 앱으로 구현한다. 배포 대상은 iOS 26.0이며 Xcode 27과 iOS 27 SDK로 빌드한다.",
    dynamic: () => "iOS에는 배경화면 기반 색상 구성이 없으므로 아래 색상을 앱 고유의 색상으로 사용한다. Liquid Glass는 뒤의 콘텐츠에 맞춰 자동으로 변한다.",
    colorIntro: (label, _fallback, th) =>
      `테마는 ${label} 계열이다. primary는 AccentColor 에셋${th.bothModes ? "(Any와 Dark 모두)" : ""}에 넣고, 아래 대응표의 컨테이너 역할은 Assets.xcassets의 이름 있는 색상으로 추가한다. 나머지 역할은 대응표의 iOS 시스템 색상을 사용한다.${th.contrast === "high" ? " 모든 색상 에셋에 High Contrast 변형도 지정한다." : ""}`,
    styleIntro: "사용 중인 부품별 SwiftUI 지침이다. 각 항목은 위 화면 구성에서 쓴 Material 이름으로 시작하며 iOS에서 대신 만들 컨트롤을 알려 준다. 시스템 컨트롤을 우선 사용하고 색상, 레이블, 주변 레이아웃만 조정한다.",
  },
};

/* ---------- colors: how the M3 roles above land in SwiftUI ---------- */

const COLOR_MAP_EN = [
  "Role mapping for SwiftUI (the layout below also names these roles):",
  "- primary → AccentColor (`Color.accentColor`, `.tint`); onPrimary → the system's text color on prominent controls",
  "- primaryContainer, secondaryContainer, tertiaryContainer and their on- roles → named asset colors (`PrimaryContainer`, `OnPrimaryContainer`, …) for icon tiles, selected states and highlighted cards; secondary → the named color `Secondary`",
  "- surface → `Color(.systemBackground)`, or `Color(.systemGroupedBackground)` on list and form screens; surfaceContainerLow and surfaceContainer → `Color(.secondarySystemGroupedBackground)`; surfaceContainerHigh and surfaceContainerHighest → `Color(.tertiarySystemGroupedBackground)` (fills: `Color(.secondarySystemFill)`)",
  "- onSurface → `.primary`; onSurfaceVariant → `.secondary`; outline → `Color(.opaqueSeparator)`; outlineVariant → `Color(.separator)`",
  "- error and errorContainer → `Color.red` (the system red) plus `role: .destructive` on destructive buttons; inverseSurface, inverseOnSurface and inversePrimary → not used (toasts use Liquid Glass)",
];

const COLOR_MAP_ZH = [
  "SwiftUI 中的角色对照（下面的屏幕结构里也会出现这些角色名）：",
  "- primary → AccentColor（`Color.accentColor`、`.tint`）；onPrimary → 系统在醒目控件上的文字颜色",
  "- primaryContainer、secondaryContainer、tertiaryContainer 及对应的 on 角色 → 资源中的命名颜色（`PrimaryContainer`、`OnPrimaryContainer` 等），用于图标底块、选中状态和突出显示的卡片；secondary → 命名颜色 `Secondary`",
  "- surface → `Color(.systemBackground)`，列表和表单页面用 `Color(.systemGroupedBackground)`；surfaceContainerLow 和 surfaceContainer → `Color(.secondarySystemGroupedBackground)`；surfaceContainerHigh 和 surfaceContainerHighest → `Color(.tertiarySystemGroupedBackground)`（填充色用 `Color(.secondarySystemFill)`）",
  "- onSurface → `.primary`；onSurfaceVariant → `.secondary`；outline → `Color(.opaqueSeparator)`；outlineVariant → `Color(.separator)`",
  "- error 和 errorContainer → `Color.red`（系统红色），破坏性按钮加 `role: .destructive`；inverseSurface、inverseOnSurface 和 inversePrimary → 不使用（提示条改用 Liquid Glass）",
];

export const COLOR_MAP_IOS: Record<Lang, string[]> = { ja: COLOR_MAP_EN, en: COLOR_MAP_EN, zh: COLOR_MAP_ZH, ko: COLOR_MAP_EN };

/* ---------- shape, type and motion ---------- */

type ThemeNotesIos = {
  shape: Record<Theme["shape"], string>;
  sans: string;
  serif: string;
  emphasized: string;
  plain: string;
  motion: Record<Theme["motion"], string>;
};

const THEME_IOS_EN: ThemeNotesIos = {
  shape: {
    square: "Corners: modest continuous corners — `.rect(cornerRadius: 8, style: .continuous)` on cards and images, `.buttonBorderShape(.roundedRectangle(radius: 8))` on buttons; no capsule shapes apart from system controls.",
    rounded: "Corners: the iOS defaults — capsule buttons (`.buttonBorderShape(.capsule)`), 20pt continuous corners on cards and images, and `ConcentricRectangle()` for shapes nested in a rounded container so the corners stay concentric.",
    full: "Corners: as round as possible — capsule buttons, chips and text fields, 32pt continuous corners on cards and images; sheets keep the system shape.",
  },
  sans: "Typeface: the system font (SF Pro); do not bundle Roboto.",
  serif: "Typeface: the system serif (New York) via `.fontDesign(.serif)` on the root view; do not bundle Roboto Serif.",
  emphasized: "Headlines, button labels and tab labels use `.fontWeight(.semibold)`, large titles `.bold()`.",
  plain: "Text keeps the default weight of each Dynamic Type style.",
  motion: {
    standard: "Motion: `.smooth` animations (`withAnimation(.smooth)`) with no bounce; keep the system's own transitions.",
    expressive: "Motion: springs with a light bounce (`.bouncy`, or `.spring(duration: 0.4, bounce: 0.25)`) on state changes; keep the system's own transitions.",
  },
};

const THEME_IOS: Partial<Record<Lang, ThemeNotesIos>> = {
  en: THEME_IOS_EN,
  zh: {
    shape: {
      square: "圆角：克制的连续圆角——卡片和图片用 `.rect(cornerRadius: 8, style: .continuous)`，按钮用 `.buttonBorderShape(.roundedRectangle(radius: 8))`；除系统控件外不用胶囊形。",
      rounded: "圆角：iOS 默认值——按钮为胶囊形（`.buttonBorderShape(.capsule)`），卡片和图片 20pt 连续圆角，嵌在圆角容器里的形状用 `ConcentricRectangle()` 保持同心圆角。",
      full: "圆角：尽量圆——按钮、标签片和输入框为胶囊形，卡片和图片 32pt 连续圆角；sheet 保持系统形状。",
    },
    sans: "字体：系统字体（SF Pro），不要内置 Roboto。",
    serif: "字体：在根视图上用 `.fontDesign(.serif)` 使用系统衬线字体（New York），不要内置 Roboto Serif。",
    emphasized: "标题、按钮文字和标签文字用 `.fontWeight(.semibold)`，大标题用 `.bold()`。",
    plain: "文字保持各动态字体样式的默认字重。",
    motion: {
      standard: "动效：使用 `.smooth` 动画（`withAnimation(.smooth)`），不回弹；保留系统自带的过渡。",
      expressive: "动效：状态变化使用带轻微回弹的弹簧（`.bouncy` 或 `.spring(duration: 0.4, bounce: 0.25)`）；保留系统自带的过渡。",
    },
  },
};

export function themeLinesIos(th: Theme, lang: Lang): string[] {
  const own = THEME_IOS[lang];
  const n = own ?? THEME_IOS_EN;
  const sp = !own || lang === "en" || lang === "ko" ? " " : "";
  const font = th.font === "robotoSerif" ? n.serif : n.sans;
  return [`- ${n.shape[th.shape]}`, `- ${font}${sp}${th.emphasized ? n.emphasized : n.plain}`, `- ${n.motion[th.motion]}`];
}

/* ---------- per-component SwiftUI notes ---------- */

const STYLE_NOTES_IOS: {
  en: Record<Kind, string>;
  zh: Record<Kind, string>;
  ja: Partial<Record<Kind, string>>;
  ko: Partial<Record<Kind, string>>;
} = {
  en: {
    box: "Box → a plain container: a `RoundedRectangle(cornerRadius:style: .continuous)` filled with the mapped color and the corner radii given in the layout, used as the background of the parts layered on it (a ZStack, later parts in front). It has no behavior of its own and is never Liquid Glass.",
    bottomSheet: "Bottom sheet → `.sheet(isPresented:)` with `.presentationDetents([.medium, .large])` and `.presentationDragIndicator(.visible)`. The drag handle, the corners and the inset Liquid Glass background of a partial-height sheet come from the system: do not set an opaque `.presentationBackground` on a partial detent.",
    button: "Button → a SwiftUI `Button` with a `Text` or `Label` and `.buttonBorderShape(.capsule)`. Variant: filled → `.buttonStyle(.borderedProminent)` (`.glassProminent` when it floats over scrolling content); tonal → `.bordered`; elevated → `.glass`; outlined → `.bordered`; text → `.borderless`. Height: 32pt → `.controlSize(.small)`, 40pt → `.regular`, 56pt (the default) → `.large`, 96pt or 136pt → `.extraLarge`. A full-width button adds `.frame(maxWidth: .infinity)`. Labels such as Delete or Remove get `role: .destructive`. A toggle button → `Toggle(isOn:) { Label(...) }.toggleStyle(.button)`. A connected button group → one `Picker` with `.pickerStyle(.segmented)` when its buttons are mutually exclusive choices, otherwise an `HStack(spacing: 8)` of capsule buttons.",
    iconButton: "Icon button → `Button { } label: { Image(systemName: …) }` with an `.accessibilityLabel`. In a navigation bar or toolbar it is a plain toolbar `Button` (the system draws the glass). Standalone: filled → `.buttonStyle(.glassProminent)`; tonal → `.glass`; outlined → `.bordered`; standard → `.borderless`; all with `.buttonBorderShape(.circle)` and the same `.controlSize` scale as buttons (hit target at least 44×44pt). A connected run of icon buttons → an `HStack` inside one `GlassEffectContainer`.",
    fab: "FAB → iOS has no floating action button. If the screen has a navigation bar, make it the primary toolbar action: `ToolbarItem(placement: .primaryAction)` with the mapped SF Symbol. Otherwise float a circular `Button` with `.buttonStyle(.glassProminent)`, `.buttonBorderShape(.circle)` and `.controlSize(.large)` in `.overlay(alignment: .bottomTrailing)`, 16pt inside the safe area and above the tab bar. A large FAB uses `.controlSize(.extraLarge)`, a small one `.regular`.",
    extendedFab: "Extended FAB → a capsule `Button` with `Label(text, systemImage:)`, `.buttonStyle(.glassProminent)` and `.controlSize(.large)`, floating at the bottom trailing edge via `.overlay(alignment: .bottomTrailing)` (16pt inside the safe area, above the tab bar). If the screen has a bottom toolbar, put it there as a `ToolbarItem(placement: .bottomBar)` instead.",
    chip: "Chip → SwiftUI has no chip. A selectable chip → `Toggle(isOn:) { Label(...) }.toggleStyle(.button)` with `.buttonBorderShape(.capsule)` and `.controlSize(.small)` (the system draws the selected state with the tint). An action chip → `Button` with `.buttonStyle(.bordered)`, `.buttonBorderShape(.capsule)` and `.controlSize(.small)`. A row of chips → `ScrollView(.horizontal)` around an `HStack(spacing: 8)`, with `.scrollIndicators(.hidden)` and `.contentMargins(.horizontal, 16)`.",
    topAppBar: "Top app bar → do not draw a bar; use the system navigation bar. Wrap the screen in `NavigationStack` and set `.navigationTitle(title)`: a small bar → `.navigationBarTitleDisplayMode(.inline)`; a medium or large bar → `.navigationBarTitleDisplayMode(.large)` (the large title collapses on scroll). The left icon → `ToolbarItem(placement: .topBarLeading)`, the right icon → `ToolbarItem(placement: .topBarTrailing)`; an arrow_back icon is the system back button, so do not add one. Split unrelated trailing groups with `ToolbarSpacer(.fixed)`. Leave the bar background to the system. On iOS 27, keep a share action visible with `ToolbarItem(placement: .topBarPinnedTrailing)` and mark key items `.visibilityPriority(.high)`.",
    bottomNav: "Navigation bar → the system tab bar: `TabView(selection:)` with one `Tab(label, systemImage:, value:)` per destination, each holding its own `NavigationStack`, starting on the selected destination. Add `.tabBarMinimizeBehavior(.onScrollDown)`. A Search destination → `Tab(value:, role: .search)`. On iOS 27, a create or compose destination may use `Tab(role: .prominent)`. Never hide the system tab bar or draw a custom one; a persistent strip above it (for example a mini player) → `.tabViewBottomAccessory { }`.",
    navRail: "Navigation rail → `TabView` with `.tabViewStyle(.sidebarAdaptable)` and the same `Tab` items: a floating Liquid Glass sidebar at iPad widths, a tab bar on iPhone. The rail's expanded, collapsed and modal states, and any NavigationRail or WideNavigationRail name in the layout, map to the sidebar being shown or hidden with the system toggle button; do not build a custom rail.",
    searchBar: "Search bar → `.searchable(text:, prompt: placeholder)` on the screen inside its `NavigationStack`; the system places the Liquid Glass search field (at the bottom on iPhone). If the app has a tab bar, use a `Tab(role: .search)` destination instead. A trailing mic icon is covered by keyboard dictation, so drop it; other trailing icons become toolbar items. Show results with `.searchSuggestions` or a filtered list.",
    card: "Card → a custom view (SwiftUI has no card): a `VStack(alignment: .leading, spacing: 4)` with 16pt padding on a `RoundedRectangle(cornerRadius: 20, style: .continuous)`. Filled → `Color(.secondarySystemGroupedBackground)` on a `Color(.systemGroupedBackground)` screen; elevated → the same fill plus `.shadow(color: .black.opacity(0.08), radius: 8, y: 2)`; outlined → `Color(.systemBackground)` with `.strokeBorder(Color(.separator))`. Headline `.font(.headline)`, body `.font(.subheadline)` with `.foregroundStyle(.secondary)`. Images use `.resizable().scaledToFill()`, clipped to the card shape, placed where the layout says. A tappable card is a `NavigationLink` or `Button` with `.buttonStyle(.plain)`. Never Liquid Glass.",
    listItem: "List item → a row in a `List` with `.listStyle(.insetGrouped)`; a stacked run of list items is one `Section`. Row content: `Label { VStack(alignment: .leading) { Text(headline); Text(supporting).font(.subheadline).foregroundStyle(.secondary) } } icon: { … }`. A leading icon on a colored circle → a Settings-style tile: the white SF Symbol on a 30pt `RoundedRectangle(cornerRadius: 7, style: .continuous)` filled with the mapped color. A trailing switch → the whole row is a `Toggle`. A row that opens something → `NavigationLink` (system chevron). Another trailing icon → `Image(systemName:)` in `.secondary`. Add `.swipeActions` for delete where it makes sense.",
    dialog: "Dialog → `.alert(title, isPresented:) { Button(\"Cancel\", role: .cancel) { }; Button(\"OK\") { } } message: { Text(body) }`. A destructive confirmation → `.confirmationDialog` with a `role: .destructive` button. Alerts cannot show an icon, so drop it. A dialog that holds a form → a `.sheet` with `.presentationDetents([.medium])` instead. On iOS 27 an alert can be bound to an optional item, like `.sheet(item:)`.",
    snackbar: "Snackbar → iOS has no snackbar; build a toast: an `HStack` with the message and an optional action `Button`, 16pt horizontal and 12pt vertical padding, `.glassEffect(.regular, in: .capsule)`, placed with `.overlay(alignment: .bottom)` above the tab bar, shown with `.transition(.move(edge: .bottom).combined(with: .opacity))`, dismissed after 4 seconds, and announced with `AccessibilityNotification.Announcement`.",
    textField: "Text field → `TextField(label, text:)` (`SecureField` for passwords). On a form-like screen put fields in a `Form` section with the label as the prompt; standalone fields use `.textFieldStyle(.roundedBorder)`. Filled and outlined both map to these system styles. A leading icon → `HStack { Image(systemName:); TextField }` or a `Label`. Supporting text → a `Text` below in `.font(.footnote)` and `.foregroundStyle(.secondary)` (in a Form, the section footer). Set `.textContentType`, `.keyboardType` and `.submitLabel` to match the label.",
    select: "Dropdown → `Picker(label, selection:) { ForEach(options) { Text($0).tag($0) } }` with `.pickerStyle(.menu)`; in a `Form` or `List` row it shows the current value with the system chevron and opens a Liquid Glass menu. If nothing is selected initially, add a \"None\" option.",
    switch: "Switch → `Toggle(label, isOn:)` with the default switch style, tinted with the accent color. In a list, the Toggle is the whole row. Do not restyle it.",
    checkbox: "Checkbox → iOS has no checkbox. Build a row `Button` with `Image(systemName: isOn ? \"checkmark.circle.fill\" : \"circle\")`, `.foregroundStyle(isOn ? Color.accentColor : .secondary)`, `.contentTransition(.symbolEffect(.replace))` and `.sensoryFeedback(.selection, trigger: isOn)` (the Reminders pattern), followed by the label in `.body`.",
    slider: "Slider → `Slider(value:, in: 0...100)` with the accent tint and the given initial value; add `minimumValueLabel` / `maximumValueLabel` symbols when the meaning is clear (volume, brightness). Do not draw a custom thick track.",
    text: "Text → `Text` with the Dynamic Type style nearest to the given size: 34pt or more `.largeTitle`, 28 `.title`, 22 `.title2`, 20 `.title3`, 17 bold `.headline`, 17 `.body`, 16 `.callout`, 15 `.subheadline`, 13 `.footnote`, 12 `.caption`, 11 `.caption2`. Bold text adds `.bold()`. Headings use `.primary`, descriptions `.secondary`. Never `.font(.system(size:))`.",
    image: "Image → `Image` (bundled) or `AsyncImage(url:)` for a web address, `.resizable().scaledToFill()` in a frame of the given size, clipped with `.clipShape(.rect(cornerRadius: 20, style: .continuous))`. Placeholder → `Color(.secondarySystemFill)` with the `photo` symbol in `.secondary`.",
    camera: "Camera preview → an `AVCaptureVideoPreviewLayer` inside a `UIViewRepresentable`, clipped to 20pt continuous corners. Add `NSCameraUsageDescription`; while permission is missing, show `ContentUnavailableView` with the `camera` symbol and a button that opens Settings.",
    map: "Map → MapKit for SwiftUI: `Map(position:)` clipped to 20pt continuous corners, with `.mapControls { MapUserLocationButton(); MapCompass() }` (the controls render as Liquid Glass).",
    divider: "Divider → `Divider()`. Inside a `List`, rely on the system row separators and add nothing.",
    loadingIndicator: "Loading indicator → `ProgressView()` (the system spinner), with `.controlSize(.large)` for a full-screen load. Contained → the spinner centered in a 56pt circle with `.glassEffect(.regular, in: .circle)`. Do not imitate Material's shape-morphing indicator.",
    linearProgress: "Linear progress → determinate: `ProgressView(value: v, total: 100)` (linear style, accent tint); indeterminate: `ProgressView()` (the spinner), because iOS has no indeterminate bar. Ignore track thickness and wavy styles.",
    circularProgress: "Circular progress → indeterminate: `ProgressView()`; determinate: `Gauge(value: v, in: 0...100) { EmptyView() }` with `.gaugeStyle(.accessoryCircularCapacity)` and the accent tint. Ignore track thickness and wavy styles.",
    splitButton: "Split button → `Menu { menu items } label: { Label(title, systemImage:) } primaryAction: { main action }`, styled with the `.buttonStyle` its button variant maps to: a tap runs the main action and a long press opens the menu (system behavior).",
    fabMenu: "FAB menu → a `Menu` whose label is the FAB described above (a `.glassProminent` circle); each entry is a `Button` with a `Label`. The menu morphs out of the button on its own; do not animate the items by hand.",
    toolbar: "Floating toolbar → the system bottom toolbar: `.toolbar { ToolbarItemGroup(placement: .bottomBar) { … } }` with one icon `Button` per icon; separate groups with `ToolbarSpacer(.flexible, placement: .bottomBar)`. The vibrant variant → give the main item `.buttonStyle(.borderedProminent)` and `.tint(.accentColor)`. If the screen also has a tab bar, put these actions in the navigation bar instead.",
    tabs: "Tabs (switching content inside one screen) → `Picker(selection:) { … }.pickerStyle(.segmented)` under the navigation title, starting on the selected tab. Scrolling tabs (more than 5) → a horizontal `ScrollView` of capsule `Toggle(...).toggleStyle(.button)` items with exactly one on.",
    radio: "Radio buttons → one single-choice `Picker` with `.pickerStyle(.inline)` inside a `Form` or `List` section; the system marks the selected row with a checkmark. All radio buttons of one group become one Picker.",
    carousel: "Carousel → `ScrollView(.horizontal) { LazyHStack(spacing: 8) { cards }.scrollTargetLayout() }` with `.scrollTargetBehavior(.viewAligned)`, `.contentMargins(.horizontal, 16)` and `.scrollIndicators(.hidden)`; cards have 20pt continuous corners and the title on a bottom gradient. Multi-browse and hero → cards sized with `.containerRelativeFrame(.horizontal) { w, _ in w * 0.8 }`; uncontained → one fixed width; full-screen → `.containerRelativeFrame(.horizontal)` with `.scrollTargetBehavior(.paging)`.",
    datePicker: "Date picker → `DatePicker(label, selection:, displayedComponents: .date)`: modal → `.datePickerStyle(.graphical)` inside a `.sheet`; docked → `.graphical` inline; input only → `.compact`. Do not build a custom calendar grid.",
    timePicker: "Time picker → `DatePicker(label, selection:, displayedComponents: .hourAndMinute)`: dial → `.datePickerStyle(.wheel)`; input → `.compact`. AM/PM follows the user's locale.",
    sectionHeader: "Section header → the header of a `Section` in a `List` or `Form`: `Section { rows } header: { Text(title) }`. The parts below it, up to the next section header, are that section's rows.",
    stepper: "Stepper → SwiftUI `Stepper` with the label and the current value in its title, for example `Stepper(\"Quantity: \\(quantity)\", value: $quantity, in: 1...99)`, as a `Form` or `List` row.",
    wheelPicker: "Wheel picker → `Picker(label, selection:) { ForEach(options) { Text($0).tag($0) } }` with `.pickerStyle(.wheel)`, starting on the selected option; inside a `Form`, give it a section of its own.",
    colorPicker: "Color picker → `ColorPicker(label, selection: $color, supportsOpacity: false)` as a `Form` or `List` row; keep the chosen color in the model so it persists.",
    disclosure: "Disclosure group → `DisclosureGroup(label, isExpanded: $isExpanded) { content }` in a `List` or `Form`; the content is the rows its supporting text names. The system draws the chevron and animates the expansion.",
    textEditor: "Text editor → `TextField(placeholder, text: $text, axis: .vertical)` with `.lineLimit(5, reservesSpace: true)` in a `Form` section (a `TextEditor` with a placeholder overlay for long text). Put a Done button in `.toolbar { ToolbarItemGroup(placement: .keyboard) { … } }`.",
    pageControl: "Page control → the pages are a `TabView` with `.tabViewStyle(.page(indexDisplayMode: .always))` and `.indexViewStyle(.page(backgroundDisplayMode: .interactive))`, one page per entry, starting on the current page. Do not draw the dots yourself.",
    gauge: "Gauge → `Gauge(value: v, in: 0...100) { Text(label) } currentValueLabel: { Text(v, format: .number) }` with `.gaugeStyle(.accessoryCircular)` and `.tint(.accentColor)`; use `.accessoryCircularCapacity` for a fill level such as storage or battery.",
    menu: "Menu → `Menu { Button(item, systemImage: symbol) { } … } label: { Label(title, systemImage: \"ellipsis.circle\") }`, usually as a `ToolbarItem`. The canvas shows it open; the system presents it as a Liquid Glass menu that morphs out of its button. A Delete or Remove item gets `role: .destructive` and goes last, after a `Divider()`.",
    actionSheet: "Action sheet → `.confirmationDialog(title, isPresented: $isPresented, titleVisibility: .visible) { Button(action) { } … } message: { Text(message) }`; a Delete or Remove action gets `role: .destructive`, and the system adds Cancel. Attach it to the button that opens it so iOS 26 can anchor it to its source.",
    emptyState: "Empty state → `ContentUnavailableView(title, systemImage: symbol, description: Text(description))`, shown in place of the list or grid while it has no items; add `actions:` with a button when the description names one. Empty search results use `ContentUnavailableView.search(text:)`.",
    barChart: "Bar chart → Swift Charts (`import Charts`): `Chart(data) { BarMark(x: .value(\"Category\", $0.label), y: .value(\"Value\", $0.value)) }` with `.foregroundStyle(.tint)`, in a card or `Section` under the title and subtitle; the categories are the bar labels. The data comes from the app's model, never sample values; show an empty state while there is none. Keep the system axes and give the marks `.accessibilityLabel` and `.accessibilityValue`.",
    lineChart: "Line chart → Swift Charts: a `LineMark(x:, y:)` with `.interpolationMethod(.catmullRom)` and a `PointMark` per value, `.foregroundStyle(.tint)`; the x axis shows the categories. The data, empty-state and accessibility rules of the bar chart apply.",
    areaChart: "Area chart → Swift Charts: an `AreaMark(x:, y:)` filled with `LinearGradient(colors: [.accentColor.opacity(0.4), .accentColor.opacity(0.05)], startPoint: .top, endPoint: .bottom)` and a `LineMark` on the same values; the x axis shows the categories. The data, empty-state and accessibility rules of the bar chart apply.",
    pieChart: "Donut chart → Swift Charts: `SectorMark(angle: .value(\"Amount\", $0.value), innerRadius: .ratio(0.618), angularInset: 1.5)` with `.cornerRadius(4)` and `.foregroundStyle(by: .value(\"Category\", $0.label))`, plus `.chartLegend(position: .bottom)`; the slices are the categories. The data, empty-state and accessibility rules of the bar chart apply.",
    link: "Link → `Link(title, destination: url)`: accent-colored words that open Safari; as a `Form` row it stays a row. Web pages the app shows itself use the iOS 26 SwiftUI `WebView`.",
    labeledContent: "Labeled value → `LabeledContent(label, value: value)` as a `Form` or `List` row; the system right-aligns the value in the secondary color.",
    secureField: "Secure field → `SecureField(placeholder, text: $password)` with `.textContentType(.password)` (`.newPassword` on sign-up) in a `Form` section.",
    sectionFooter: "Section footer → the footer of the `Section` above it: `Section { rows } footer: { Text(text) }`.",
    tip: "Tip → TipKit: a `struct` conforming to `Tip` with `title`, `message` and `image` (`Image(systemName:)`), shown inline with `TipView(tip)`; call `try? Tips.configure()` once at launch.",
    photosPicker: "Photos picker → PhotosUI `PhotosPicker(selection: $items, matching: .images) { Label(title, systemImage: symbol) }` with `.buttonStyle(.bordered)` and `.buttonBorderShape(.capsule)`; load the picks with `loadTransferable(type:)`. It needs no photo-library permission.",
    signInWithApple: "Sign in with Apple → AuthenticationServices `SignInWithAppleButton(.signIn) { $0.requestedScopes = [.fullName, .email] } onCompletion: { result in … }` with `.signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)` and `.frame(height: 50)`; add the Sign in with Apple capability.",
    applePayButton: "Apple Pay button → PassKit `PayWithApplePayButton(.buy) { … }` with `.frame(height: 50)`; build the `PKPaymentRequest` from the order. Show it only where Apple Pay is offered.",
    videoPlayer: "Video player → AVKit `VideoPlayer(player: player)` with `.aspectRatio(16 / 9, contentMode: .fit)` and 20pt continuous corners; the system draws the playback controls.",
    photoGrid: "Photo grid → `LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3), spacing: 2)` of square cells (`.aspectRatio(1, contentMode: .fill)`, clipped) in a `ScrollView`; a tap opens the photo with `.navigationTransition(.zoom(sourceID:in:))`.",
    tabAccessory: "Tab bar accessory → `.tabViewBottomAccessory { … }` on the `TabView`: a compact row (artwork, title, play and next buttons) that floats as Liquid Glass above the tab bar and moves inline when the bar minimizes; adapt it with `@Environment(\\.tabViewBottomAccessoryPlacement)`.",
    subscriptionStore: "Subscription store → StoreKit `SubscriptionStoreView(groupID: groupID) { marketing content with the title and subtitle }` with `.subscriptionStoreControlStyle(.prominentPicker)` and `.storeButton(.visible, for: .restorePurchases)`. The plans come from App Store Connect; the entries only name them.",
    scatterChart: "Scatter chart → Swift Charts `PointMark(x: .value(…), y: .value(…))` with `.foregroundStyle(by: .value(\"Series\", $0.series))` and `.symbol(by: .value(\"Series\", $0.series))`, one series per entry. The data, empty-state and accessibility rules of the bar chart apply.",
    stackedBarChart: "Stacked bar chart → Swift Charts `BarMark(x:, y:)` with `.foregroundStyle(by: .value(\"Series\", $0.series))`, which stacks by default, and `.chartLegend(position: .bottom)`; the x axis shows the categories. The data, empty-state and accessibility rules of the bar chart apply.",
    heatmapChart: "Heatmap → Swift Charts `RectangleMark(x: .value(\"Day\", $0.day), y: .value(\"Week\", $0.week))` with `.foregroundStyle(by: .value(\"Count\", $0.count))` and `.chartForegroundStyleScale(range: Gradient(colors: [.accentColor.opacity(0.1), .accentColor]))`; the columns are the categories. The data, empty-state and accessibility rules of the bar chart apply.",
    custom: "Custom component → its own reusable SwiftUI view, built once from its entry under \"Custom components\" and placed wherever the layout names it, with the props listed there. Inside it, follow the same rules: system colors, Dynamic Type, SF Symbols, and Liquid Glass only where it floats above content.",
  },
  zh: {
    box: "容器框 → 普通容器：用 `RoundedRectangle(cornerRadius:style: .continuous)` 按对照表的颜色填充，圆角取屏幕结构中给出的值，作为叠放在其上的组件的背景（ZStack，后写的在前面）。它没有自身行为，也不用 Liquid Glass。",
    bottomSheet: "底部面板 → `.sheet(isPresented:)`，加 `.presentationDetents([.medium, .large])` 和 `.presentationDragIndicator(.visible)`。拖动条、圆角以及部分高度时内缩的 Liquid Glass 背景都由系统提供：部分高度时不要设置不透明的 `.presentationBackground`。",
    button: "按钮 → SwiftUI `Button`，内容为 `Text` 或 `Label`，加 `.buttonBorderShape(.capsule)`。样式：填充 → `.buttonStyle(.borderedProminent)`（悬浮在滚动内容上方时用 `.glassProminent`）；色调 → `.bordered`；浮起 → `.glass`；描边 → `.bordered`；文字 → `.borderless`。高度：32pt → `.controlSize(.small)`，40pt → `.regular`，56pt（默认）→ `.large`，96pt 或 136pt → `.extraLarge`。占满宽度的按钮加 `.frame(maxWidth: .infinity)`。「删除」「移除」等按钮加 `role: .destructive`。切换按钮 → `Toggle(isOn:) { Label(...) }.toggleStyle(.button)`。相连的按钮组：按钮互斥时做成一个 `.pickerStyle(.segmented)` 的 `Picker`，否则做成 `HStack(spacing: 8)` 排列的胶囊按钮。",
    iconButton: "图标按钮 → `Button { } label: { Image(systemName: …) }`，并加 `.accessibilityLabel`。放在导航栏或工具栏里时就是普通的工具栏 `Button`（系统负责玻璃效果）。单独使用时：填充 → `.buttonStyle(.glassProminent)`；色调 → `.glass`；描边 → `.bordered`；标准 → `.borderless`；都加 `.buttonBorderShape(.circle)`，尺寸按按钮的 `.controlSize` 对应（点击区域不小于 44×44pt）。相连的图标按钮 → 放进同一个 `GlassEffectContainer` 的 `HStack`。",
    fab: "FAB → iOS 没有悬浮操作按钮。屏幕有导航栏时，把它做成主要工具栏操作：`ToolbarItem(placement: .primaryAction)`，图标用对照后的 SF Symbol。没有导航栏时，用 `.overlay(alignment: .bottomTrailing)` 悬浮一个圆形 `Button`，加 `.buttonStyle(.glassProminent)`、`.buttonBorderShape(.circle)` 和 `.controlSize(.large)`，位于安全区域内 16pt、标签栏上方。大号 FAB 用 `.controlSize(.extraLarge)`，小号用 `.regular`。",
    extendedFab: "扩展 FAB → 胶囊形 `Button`，内容为 `Label(text, systemImage:)`，加 `.buttonStyle(.glassProminent)` 和 `.controlSize(.large)`，用 `.overlay(alignment: .bottomTrailing)` 悬浮在右下角（安全区域内 16pt、标签栏上方）。屏幕有底部工具栏时，改为放进 `ToolbarItem(placement: .bottomBar)`。",
    chip: "标签片 → SwiftUI 没有 chip。可选中的标签片 → `Toggle(isOn:) { Label(...) }.toggleStyle(.button)`，加 `.buttonBorderShape(.capsule)` 和 `.controlSize(.small)`（选中状态由系统用强调色绘制）。操作型标签片 → `Button`，加 `.buttonStyle(.bordered)`、`.buttonBorderShape(.capsule)` 和 `.controlSize(.small)`。一行标签片 → `ScrollView(.horizontal)` 包住 `HStack(spacing: 8)`，加 `.scrollIndicators(.hidden)` 和 `.contentMargins(.horizontal, 16)`。",
    topAppBar: "顶部应用栏 → 不要自己画栏，使用系统导航栏。把屏幕放进 `NavigationStack` 并设置 `.navigationTitle(title)`：小号栏 → `.navigationBarTitleDisplayMode(.inline)`；中号或大号栏 → `.navigationBarTitleDisplayMode(.large)`（大标题随滚动收起）。左侧图标 → `ToolbarItem(placement: .topBarLeading)`，右侧图标 → `ToolbarItem(placement: .topBarTrailing)`；arrow_back 图标就是系统返回按钮，不要另加。不相关的右侧按钮组用 `ToolbarSpacer(.fixed)` 分开。栏的背景交给系统。iOS 27 上用 `ToolbarItem(placement: .topBarPinnedTrailing)` 让分享按钮始终可见，重要按钮加 `.visibilityPriority(.high)`。",
    bottomNav: "导航栏 → 系统标签栏：`TabView(selection:)`，每个目的地一个 `Tab(label, systemImage:, value:)`，各自包含自己的 `NavigationStack`，初始选中项按屏幕结构。加 `.tabBarMinimizeBehavior(.onScrollDown)`。搜索目的地 → `Tab(value:, role: .search)`。iOS 27 上，新建或撰写类目的地可以用 `Tab(role: .prominent)`。不要隐藏系统标签栏，也不要自己画；标签栏上方常驻的条（例如迷你播放器）→ `.tabViewBottomAccessory { }`。",
    navRail: "侧边导航栏 → `TabView` 加 `.tabViewStyle(.sidebarAdaptable)`，使用同样的 `Tab`：iPad 宽度下是悬浮的 Liquid Glass 侧边栏，iPhone 上是标签栏。屏幕结构里的展开、折叠、模态状态，以及 NavigationRail、WideNavigationRail 等名称，都对应侧边栏用系统切换按钮显示或隐藏；不要自己做侧边导航栏。",
    searchBar: "搜索栏 → 在 `NavigationStack` 内的屏幕上加 `.searchable(text:, prompt: placeholder)`；系统负责放置 Liquid Glass 搜索框（iPhone 上在底部）。应用有标签栏时，改用 `Tab(role: .search)` 目的地。末尾的麦克风图标由键盘听写覆盖，删掉；其他末尾图标改为工具栏按钮。结果用 `.searchSuggestions` 或过滤后的列表显示。",
    card: "卡片 → 自定义视图（SwiftUI 没有卡片）：`VStack(alignment: .leading, spacing: 4)`，内边距 16pt，背景为 `RoundedRectangle(cornerRadius: 20, style: .continuous)`。填充 → `Color(.secondarySystemGroupedBackground)`，页面背景用 `Color(.systemGroupedBackground)`；浮起 → 同样的填充加 `.shadow(color: .black.opacity(0.08), radius: 8, y: 2)`；描边 → `Color(.systemBackground)` 加 `.strokeBorder(Color(.separator))`。标题 `.font(.headline)`，正文 `.font(.subheadline)` 加 `.foregroundStyle(.secondary)`。图片用 `.resizable().scaledToFill()`，裁成卡片形状，位置按屏幕结构。可点击的卡片用 `NavigationLink` 或加 `.buttonStyle(.plain)` 的 `Button`。卡片不用 Liquid Glass。",
    listItem: "列表项 → `.listStyle(.insetGrouped)` 的 `List` 中的一行；纵向相连的一组列表项是一个 `Section`。行内容：`Label { VStack(alignment: .leading) { Text(headline); Text(supporting).font(.subheadline).foregroundStyle(.secondary) } } icon: { … }`。带彩色圆底的前置图标 → 「设置」风格的图标块：白色 SF Symbol 放在 30pt、`RoundedRectangle(cornerRadius: 7, style: .continuous)` 的色块上，颜色按对照表。末尾是开关 → 整行就是一个 `Toggle`。点击后打开内容的行 → `NavigationLink`（系统箭头）。其他末尾图标 → `.secondary` 颜色的 `Image(systemName:)`。适合删除的地方加 `.swipeActions`。",
    dialog: "对话框 → `.alert(title, isPresented:) { Button(\"Cancel\", role: .cancel) { }; Button(\"OK\") { } } message: { Text(body) }`。破坏性确认 → `.confirmationDialog`，按钮加 `role: .destructive`。alert 不能显示图标，删掉图标。包含表单的对话框 → 改用加 `.presentationDetents([.medium])` 的 `.sheet`。iOS 27 上 alert 可以像 `.sheet(item:)` 一样绑定可选数据。",
    snackbar: "Snackbar → iOS 没有 snackbar，做成提示条：`HStack` 放消息文字和可选的操作 `Button`，水平内边距 16pt、垂直 12pt，加 `.glassEffect(.regular, in: .capsule)`，用 `.overlay(alignment: .bottom)` 放在标签栏上方，用 `.transition(.move(edge: .bottom).combined(with: .opacity))` 出现，4 秒后消失，并用 `AccessibilityNotification.Announcement` 播报。",
    textField: "文本框 → `TextField(label, text:)`（密码用 `SecureField`）。表单类页面把文本框放进 `Form` 的 section，标签作为占位提示；单独的文本框用 `.textFieldStyle(.roundedBorder)`。填充和描边两种都对应这些系统样式。前置图标 → `HStack { Image(systemName:); TextField }` 或 `Label`。辅助文字 → 下方的 `Text`，加 `.font(.footnote)` 和 `.foregroundStyle(.secondary)`（在 Form 中用 section 的 footer）。按标签设置 `.textContentType`、`.keyboardType` 和 `.submitLabel`。",
    select: "下拉菜单 → `Picker(label, selection:) { ForEach(options) { Text($0).tag($0) } }`，加 `.pickerStyle(.menu)`；在 `Form` 或 `List` 的行里显示当前值和系统箭头，点击后弹出 Liquid Glass 菜单。初始没有选中项时，加一个「无」选项。",
    switch: "开关 → `Toggle(label, isOn:)`，使用默认开关样式，颜色为强调色。在列表里 Toggle 就是整行。不要改变它的样式。",
    checkbox: "复选框 → iOS 没有复选框。做成一行 `Button`：`Image(systemName: isOn ? \"checkmark.circle.fill\" : \"circle\")`，加 `.foregroundStyle(isOn ? Color.accentColor : .secondary)`、`.contentTransition(.symbolEffect(.replace))` 和 `.sensoryFeedback(.selection, trigger: isOn)`（「提醒事项」的做法），后面跟 `.body` 字体的标签。",
    slider: "滑块 → `Slider(value:, in: 0...100)`，强调色，初始值按屏幕结构；含义明确时（音量、亮度）用 `minimumValueLabel` / `maximumValueLabel` 加两端符号。不要自己画粗轨道。",
    text: "文字 → `Text`，按给出的字号取最接近的动态字体样式：34pt 及以上 `.largeTitle`，28 `.title`，22 `.title2`，20 `.title3`，17 粗体 `.headline`，17 `.body`，16 `.callout`，15 `.subheadline`，13 `.footnote`，12 `.caption`，11 `.caption2`。粗体加 `.bold()`。标题用 `.primary`，说明文字用 `.secondary`。不要用 `.font(.system(size:))`。",
    image: "图片 → `Image`（内置资源）或网址图片用 `AsyncImage(url:)`，`.resizable().scaledToFill()` 放进给定尺寸的框，用 `.clipShape(.rect(cornerRadius: 20, style: .continuous))` 裁切。占位 → `Color(.secondarySystemFill)` 加 `.secondary` 颜色的 `photo` 符号。",
    camera: "相机预览 → 在 `UIViewRepresentable` 中使用 `AVCaptureVideoPreviewLayer`，裁成 20pt 连续圆角。添加 `NSCameraUsageDescription`；没有权限时显示带 `camera` 符号的 `ContentUnavailableView`，以及打开「设置」的按钮。",
    map: "地图 → MapKit for SwiftUI：`Map(position:)`，裁成 20pt 连续圆角，加 `.mapControls { MapUserLocationButton(); MapCompass() }`（这些控件显示为 Liquid Glass）。",
    divider: "分隔线 → `Divider()`。在 `List` 里依靠系统的行分隔线，不要另加。",
    loadingIndicator: "加载指示器 → `ProgressView()`（系统转圈），整页加载时加 `.controlSize(.large)`。容器型 → 转圈放在 56pt 的圆里，圆加 `.glassEffect(.regular, in: .circle)`。不要模仿 Material 的变形加载指示器。",
    linearProgress: "线性进度条 → 有确定进度：`ProgressView(value: v, total: 100)`（线性样式，强调色）；不确定进度：`ProgressView()`（转圈），因为 iOS 没有不确定进度条。忽略轨道粗细和波浪样式。",
    circularProgress: "圆形进度 → 不确定进度：`ProgressView()`；有确定进度：`Gauge(value: v, in: 0...100) { EmptyView() }`，加 `.gaugeStyle(.accessoryCircularCapacity)` 和强调色。忽略轨道粗细和波浪样式。",
    splitButton: "分割按钮 → `Menu { 菜单项 } label: { Label(title, systemImage:) } primaryAction: { 主操作 }`，`.buttonStyle` 按其按钮样式对应：点按执行主操作，长按打开菜单（系统行为）。",
    fabMenu: "FAB 菜单 → 一个 `Menu`，其标签就是上面描述的 FAB（`.glassProminent` 圆形按钮）；每一项是带 `Label` 的 `Button`。菜单从按钮中自行展开，不要手动给各项做动画。",
    toolbar: "悬浮工具栏 → 系统底部工具栏：`.toolbar { ToolbarItemGroup(placement: .bottomBar) { … } }`，每个图标一个图标 `Button`；分组之间用 `ToolbarSpacer(.flexible, placement: .bottomBar)` 分开。醒目（vibrant）样式 → 给主要按钮加 `.buttonStyle(.borderedProminent)` 和 `.tint(.accentColor)`。屏幕同时有标签栏时，把这些操作放进导航栏。",
    tabs: "选项卡（在一个屏幕内切换内容）→ 放在导航标题下方的 `Picker(selection:) { … }.pickerStyle(.segmented)`，初始选中项按屏幕结构。可滚动的选项卡（超过 5 个）→ 横向 `ScrollView` 中排列胶囊形的 `Toggle(...).toggleStyle(.button)`，始终只有一个处于打开状态。",
    radio: "单选按钮 → `Form` 或 `List` section 中一个 `.pickerStyle(.inline)` 的单选 `Picker`；系统在选中行显示对勾。同一组单选按钮合成一个 Picker。",
    carousel: "轮播 → `ScrollView(.horizontal) { LazyHStack(spacing: 8) { cards }.scrollTargetLayout() }`，加 `.scrollTargetBehavior(.viewAligned)`、`.contentMargins(.horizontal, 16)` 和 `.scrollIndicators(.hidden)`；卡片为 20pt 连续圆角，标题放在底部渐变上。多项浏览和主图（hero）→ 卡片宽度用 `.containerRelativeFrame(.horizontal) { w, _ in w * 0.8 }`；不受限（uncontained）→ 固定宽度；全屏 → `.containerRelativeFrame(.horizontal)` 加 `.scrollTargetBehavior(.paging)`。",
    datePicker: "日期选择器 → `DatePicker(label, selection:, displayedComponents: .date)`：模态 → 放在 `.sheet` 里的 `.datePickerStyle(.graphical)`；停靠 → 内嵌的 `.graphical`；仅输入框 → `.compact`。不要自己做日历网格。",
    timePicker: "时间选择器 → `DatePicker(label, selection:, displayedComponents: .hourAndMinute)`：表盘 → `.datePickerStyle(.wheel)`；输入 → `.compact`。上午/下午按用户的地区设置显示。",
    sectionHeader: "分组标题 → `List` 或 `Form` 中 `Section` 的标题：`Section { rows } header: { Text(title) }`。它下面直到下一个分组标题之前的组件，都是这个分组的行。",
    stepper: "步进器 → SwiftUI `Stepper`，标题中同时显示标签和当前值，例如 `Stepper(\"数量：\\(quantity)\", value: $quantity, in: 1...99)`，作为 `Form` 或 `List` 的一行。",
    wheelPicker: "滚轮选择器 → `Picker(label, selection:) { ForEach(options) { Text($0).tag($0) } }`，加 `.pickerStyle(.wheel)`，初始停在选中的选项；放在 `Form` 里时单独占一个 section。",
    colorPicker: "颜色选择器 → `ColorPicker(label, selection: $color, supportsOpacity: false)`，作为 `Form` 或 `List` 的一行；把选中的颜色保存在模型里，重启后保留。",
    disclosure: "折叠组 → `List` 或 `Form` 中的 `DisclosureGroup(label, isExpanded: $isExpanded) { content }`；content 是辅助文字所列的那些行。箭头和展开动画由系统负责。",
    textEditor: "多行文本框 → `Form` section 中的 `TextField(placeholder, text: $text, axis: .vertical)`，加 `.lineLimit(5, reservesSpace: true)`（长文本用带占位提示叠层的 `TextEditor`）。在 `.toolbar { ToolbarItemGroup(placement: .keyboard) { … } }` 中放一个「完成」按钮。",
    pageControl: "页面指示器 → 页面用 `TabView` 加 `.tabViewStyle(.page(indexDisplayMode: .always))` 和 `.indexViewStyle(.page(backgroundDisplayMode: .interactive))`，每个条目一页，初始停在当前页。不要自己画圆点。",
    gauge: "仪表 → `Gauge(value: v, in: 0...100) { Text(label) } currentValueLabel: { Text(v, format: .number) }`，加 `.gaugeStyle(.accessoryCircular)` 和 `.tint(.accentColor)`；表示存储空间、电量这类填充程度时用 `.accessoryCircularCapacity`。",
    menu: "下拉菜单 → `Menu { Button(item, systemImage: symbol) { } … } label: { Label(title, systemImage: \"ellipsis.circle\") }`，通常放在 `ToolbarItem` 中。画布上画的是展开状态；系统会把它显示为从按钮中展开的 Liquid Glass 菜单。「删除」「移除」类菜单项加 `role: .destructive`，放在最后，前面加 `Divider()`。",
    actionSheet: "操作表 → `.confirmationDialog(title, isPresented: $isPresented, titleVisibility: .visible) { Button(action) { } … } message: { Text(message) }`；「删除」「移除」类操作加 `role: .destructive`，「取消」由系统添加。把它挂在触发它的按钮上，让 iOS 26 能锚定到来源位置。",
    emptyState: "空状态 → `ContentUnavailableView(title, systemImage: symbol, description: Text(description))`，列表或网格没有内容时显示在原位置；说明里提到操作时，用 `actions:` 加一个按钮。搜索无结果时用 `ContentUnavailableView.search(text:)`。",
    barChart: "柱状图 → Swift Charts（`import Charts`）：`Chart(data) { BarMark(x: .value(\"Category\", $0.label), y: .value(\"Value\", $0.value)) }`，加 `.foregroundStyle(.tint)`，放在标题和副标题下方的卡片或 `Section` 中；分类就是各柱的标签。数据来自应用的模型，不要用示例数值；没有数据时显示空状态。保留系统坐标轴，并给各个 mark 加 `.accessibilityLabel` 和 `.accessibilityValue`。",
    lineChart: "折线图 → Swift Charts：`LineMark(x:, y:)` 加 `.interpolationMethod(.catmullRom)`，每个值再加一个 `PointMark`，`.foregroundStyle(.tint)`；横轴显示各分类。数据、空状态和辅助功能的要求与柱状图相同。",
    areaChart: "面积图 → Swift Charts：`AreaMark(x:, y:)` 用 `LinearGradient(colors: [.accentColor.opacity(0.4), .accentColor.opacity(0.05)], startPoint: .top, endPoint: .bottom)` 填充，同样的数据上再叠一条 `LineMark`；横轴显示各分类。数据、空状态和辅助功能的要求与柱状图相同。",
    pieChart: "环形图 → Swift Charts：`SectorMark(angle: .value(\"Amount\", $0.value), innerRadius: .ratio(0.618), angularInset: 1.5)`，加 `.cornerRadius(4)` 和 `.foregroundStyle(by: .value(\"Category\", $0.label))`，再加 `.chartLegend(position: .bottom)`；各扇区就是各分类。数据、空状态和辅助功能的要求与柱状图相同。",
    link: "链接 → `Link(title, destination: url)`：强调色文字，点按后在 Safari 中打开；放在 `Form` 里时仍是一行。应用内显示的网页用 iOS 26 的 SwiftUI `WebView`。",
    labeledContent: "键值行 → `LabeledContent(label, value: value)`，作为 `Form` 或 `List` 的一行；系统把值右对齐，并用次要颜色显示。",
    secureField: "密码框 → `Form` section 中的 `SecureField(placeholder, text: $password)`，加 `.textContentType(.password)`（注册时用 `.newPassword`）。",
    sectionFooter: "分组说明 → 上方 `Section` 的 footer：`Section { rows } footer: { Text(text) }`。",
    tip: "提示卡片 → TipKit：定义一个遵循 `Tip` 的 `struct`，包含 `title`、`message` 和 `image`（`Image(systemName:)`），用 `TipView(tip)` 内嵌显示；启动时调用一次 `try? Tips.configure()`。",
    photosPicker: "照片选择器 → PhotosUI 的 `PhotosPicker(selection: $items, matching: .images) { Label(title, systemImage: symbol) }`，加 `.buttonStyle(.bordered)` 和 `.buttonBorderShape(.capsule)`；用 `loadTransferable(type:)` 读取所选照片。它不需要照片库权限。",
    signInWithApple: "通过 Apple 登录 → AuthenticationServices 的 `SignInWithAppleButton(.signIn) { $0.requestedScopes = [.fullName, .email] } onCompletion: { result in … }`，加 `.signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)` 和 `.frame(height: 50)`；并添加 Sign in with Apple capability。",
    applePayButton: "Apple Pay 按钮 → PassKit 的 `PayWithApplePayButton(.buy) { … }`，加 `.frame(height: 50)`；根据订单构建 `PKPaymentRequest`。只在支持 Apple Pay 的地方显示。",
    videoPlayer: "视频播放器 → AVKit 的 `VideoPlayer(player: player)`，加 `.aspectRatio(16 / 9, contentMode: .fit)` 和 20pt 连续圆角；播放控件由系统绘制。",
    photoGrid: "照片网格 → `ScrollView` 中的 `LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3), spacing: 2)`，单元格为正方形（`.aspectRatio(1, contentMode: .fill)` 并裁切）；点按后用 `.navigationTransition(.zoom(sourceID:in:))` 打开照片。",
    tabAccessory: "标签栏附件 → `TabView` 上的 `.tabViewBottomAccessory { … }`：紧凑的一行（封面、标题、播放和下一首按钮），以 Liquid Glass 悬浮在标签栏上方，标签栏收起时移到同一行；用 `@Environment(\\.tabViewBottomAccessoryPlacement)` 适配两种位置。",
    subscriptionStore: "订阅页 → StoreKit 的 `SubscriptionStoreView(groupID: groupID) { 含标题和副标题的营销内容 }`，加 `.subscriptionStoreControlStyle(.prominentPicker)` 和 `.storeButton(.visible, for: .restorePurchases)`。方案来自 App Store Connect，条目只用来给方案命名。",
    scatterChart: "散点图 → Swift Charts 的 `PointMark(x: .value(…), y: .value(…))`，加 `.foregroundStyle(by: .value(\"Series\", $0.series))` 和 `.symbol(by: .value(\"Series\", $0.series))`，每个条目一个系列。数据、空状态和辅助功能的要求与柱状图相同。",
    stackedBarChart: "堆叠柱状图 → Swift Charts 的 `BarMark(x:, y:)`，加 `.foregroundStyle(by: .value(\"Series\", $0.series))`（默认堆叠）和 `.chartLegend(position: .bottom)`；横轴显示各分类。数据、空状态和辅助功能的要求与柱状图相同。",
    heatmapChart: "热力图 → Swift Charts 的 `RectangleMark(x: .value(\"Day\", $0.day), y: .value(\"Week\", $0.week))`，加 `.foregroundStyle(by: .value(\"Count\", $0.count))` 和 `.chartForegroundStyleScale(range: Gradient(colors: [.accentColor.opacity(0.1), .accentColor]))`；各列就是各分类。数据、空状态和辅助功能的要求与柱状图相同。",
    custom: "自定义组件 → 各自做成可复用的 SwiftUI 视图，按「自定义组件」中的条目只实现一次，在屏幕结构中出现该名称的地方复用，并传入那里列出的属性值。组件内部同样遵守规则：系统颜色、动态字体、SF Symbols，只在悬浮于内容上方时使用 Liquid Glass。",
  },
  ja: {},
  ko: {},
};

/** the SwiftUI note for one kind; ja and ko fall back to English until they are translated */
export const styleNoteIos = (k: Kind, lang: Lang): string => STYLE_NOTES_IOS[lang][k] ?? STYLE_NOTES_IOS.en[k];

/* ---------- closing guidance ---------- */

const GENERAL_EN = [
  "Work out what kind of app this is from the purpose of the screens, and implement the features such an app is normally expected to have (create, list, detail, edit, delete, search, settings, whichever apply) even where the sketch does not show them.",
  "Treat the data as real. Persist what the user creates on the device with SwiftData (UserDefaults or files for small settings) so it survives restarts. Do not ship dummy or sample data; show `ContentUnavailableView` when there is nothing yet. Validate input; confirm deletions with `.confirmationDialog` (`role: .destructive`) and report failures with `.alert`.",
  "Fill in behavior the sketch leaves out from the purpose of the screen and the labels of the parts. A button or item with no behavior specified should do what its label implies (save, send, open a detail screen, and so on), never nothing.",
  "The layout only needs to keep the intent (order, grouping, relative placement); sizes and spacing may be adjusted to fit the content and the safe areas. If something would break on a device, prefer working over matching the sketch.",
  "Stack: SwiftUI and Swift 6 only, deployment target iOS 26.0, built with Xcode 27 and the iOS 27 SDK. Wrap every iOS 27-only API in `if #available(iOS 27, *)` with an iOS 26 fallback. Use UIKit only where SwiftUI has no equivalent (the camera preview). No third-party UI libraries.",
  "The sketch tool is Material-based, so the layout names parts the Material way (FAB, top app bar, navigation bar, chip, snackbar; filled / tonal / elevated / outlined). Never build Material look-alikes: implement every part with the SwiftUI control given in \"Component styles\".",
  "Use the standard SwiftUI controls (Button, Toggle, Picker, Slider, Stepper, DatePicker, Menu, TextField, List, Form, TabView, NavigationStack, toolbar, sheet, alert, searchable); do not custom-draw a control SwiftUI provides.",
  "Liquid Glass: the navigation layer (tab bar, navigation bar, toolbars and their buttons, search field, menus, sheets, alerts) gets Liquid Glass from the system automatically. Do not put backgrounds, materials or `.toolbarBackground` colors behind it, and never hide the system tab bar or navigation bar to draw your own. Content scrolls edge to edge underneath it.",
  "Apply `.glassEffect(...)` or `.buttonStyle(.glass)` / `.glassProminent` only to custom controls that float above content, and wrap neighbouring glass views in one `GlassEffectContainer`. Never apply glass to content: cards, list rows, images, text blocks and screen backgrounds stay opaque.",
  "Colors come only from the role mapping in \"Colors\" (AccentColor, named asset colors, system colors); no hex literals in views. Support Dark Mode and Increase Contrast through asset variants; system controls already handle Reduce Transparency.",
  "Typography: Dynamic Type text styles only (`.largeTitle`, `.title`, `.title2`, `.title3`, `.headline`, `.body`, `.callout`, `.subheadline`, `.footnote`, `.caption`, `.caption2`); never `.system(size:)`. Layouts must still work at accessibility text sizes.",
  "Spacing: use the system padding (`.padding()` is 16pt) and the margins that List, Form and NavigationStack provide. Parts described as \"in one row\" share a single HStack and never wrap; parts \"layered inside\" a container go in a ZStack (or `.overlay`) over that container, later items in front.",
  "Navigation: one NavigationStack per tab with value-based `navigationDestination(for:)`. Map the transitions in \"Behavior and navigation\": a slide in from the right, left or top → a normal push; a slide in from the bottom → `.sheet` (`.fullScreenCover` for a full-screen flow); expand → `.navigationTransition(.zoom(sourceID:in:))` with `.matchedTransitionSource`; fade → `.navigationTransition(.crossFade)` on iOS 27, a normal push on iOS 26; no animation → disable the animation with a `Transaction`. \"Back\" is the system back button and the interactive edge swipe; never disable them. Web links open with `Link` or `openURL`.",
  "Feedback: system controls provide their own highlight and glass response; a custom tappable view is a `Button` with `.buttonStyle(.plain)` and a `.contentShape`. Add `.sensoryFeedback` for selection changes and completed actions. No ripple effects.",
  "Icons: SF Symbols only (`Image(systemName:)`, `Label(_:systemImage:)`). Icon names in this prompt are SF Symbol names, except the Material Symbols names in the icon mapping line: use the SF Symbol given there, otherwise the closest SF Symbol by meaning. TabView fills the selected tab's symbol automatically.",
  "Accessibility: every icon-only button has an `.accessibilityLabel`; hit targets are at least 44×44pt.",
];

const GENERAL_ZH = [
  "先根据屏幕目的判断这是什么类型的应用，并实现该类应用通常应有的功能（新建、列表、详情、编辑、删除、搜索、设置等，视情况而定），即使草图中没有画出。",
  "把数据当作真实数据处理：用户创建的数据用 SwiftData 持久化到设备上（少量设置可用 UserDefaults 或文件），重启后仍保留。不要放入虚拟或示例数据，没有数据时显示 `ContentUnavailableView`。校验输入；删除前用 `.confirmationDialog`（`role: .destructive`）确认，失败用 `.alert` 提示。",
  "草图没有写明的行为，根据屏幕目的和组件标签补全。未指定行为的按钮或项目要实现与其标签相符的操作（保存、发送、打开详情页等），不要什么都不做。",
  "布局只需保持意图（顺序、分组、相对位置），尺寸和间距可根据内容和安全区域调整。若在真机上会出问题，宁可能用也不要死守草图。",
  "技术栈：只用 SwiftUI 和 Swift 6，部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建。所有仅 iOS 27 可用的 API 都放进 `if #available(iOS 27, *)`，并提供 iOS 26 的退路。只有 SwiftUI 没有对应能力时才用 UIKit（相机预览）。不使用第三方 UI 库。",
  "草图工具基于 Material，所以屏幕结构里的组件用 Material 的叫法（FAB、顶部应用栏、导航栏、标签片、Snackbar；填充／色调／浮起／描边）。不要做 Material 风格的仿制品，每个组件都按「各组件的样式」中给出的 SwiftUI 控件实现。",
  "使用 SwiftUI 标准控件（Button、Toggle、Picker、Slider、Stepper、DatePicker、Menu、TextField、List、Form、TabView、NavigationStack、toolbar、sheet、alert、searchable），SwiftUI 已提供的控件不要自行绘制。",
  "Liquid Glass：导航层（标签栏、导航栏、工具栏及其按钮、搜索框、菜单、sheet、alert）由系统自动应用 Liquid Glass。不要在它后面加背景、材质或 `.toolbarBackground` 颜色，也不要隐藏系统标签栏或导航栏去自己画。内容从它下方全屏滚动通过。",
  "`.glassEffect(...)`、`.buttonStyle(.glass)` 和 `.glassProminent` 只用于悬浮在内容上方的自定义控件，相邻的玻璃视图放进同一个 `GlassEffectContainer`。内容不能用玻璃：卡片、列表行、图片、文字块和屏幕背景保持不透明。",
  "颜色只来自「配色」中的角色对照（AccentColor、命名资源颜色、系统颜色），视图里不写十六进制颜色。通过资源变体支持深色模式和「增强对比度」；系统控件会自动处理「降低透明度」。",
  "字体只用动态字体样式（`.largeTitle`、`.title`、`.title2`、`.title3`、`.headline`、`.body`、`.callout`、`.subheadline`、`.footnote`、`.caption`、`.caption2`），不要用 `.system(size:)`。辅助功能大字号下布局也要可用。",
  "间距使用系统内边距（`.padding()` 为 16pt）以及 List、Form、NavigationStack 自带的边距。写明“横向排成一行”的组件放进同一个 HStack，不换行；写明“内部叠放”的组件放进以该容器为底的 ZStack（或 `.overlay`），后写的在前面。",
  "导航：每个标签一个 NavigationStack，使用基于值的 `navigationDestination(for:)`。「行为与屏幕跳转」中的过渡按下面对应：从右、左或上滑入 → 普通 push；从下滑入 → `.sheet`（全屏流程用 `.fullScreenCover`）；放大 → `.navigationTransition(.zoom(sourceID:in:))` 配合 `.matchedTransitionSource`；淡入淡出 → iOS 27 用 `.navigationTransition(.crossFade)`，iOS 26 用普通 push；无动画 → 用 `Transaction` 关闭动画。“返回”就是系统返回按钮和边缘轻扫手势，不要禁用。网页链接用 `Link` 或 `openURL` 打开。",
  "反馈：系统控件自带高亮和玻璃反馈；自定义的可点击视图用加了 `.buttonStyle(.plain)` 和 `.contentShape` 的 `Button`。选择变化和操作完成时加 `.sensoryFeedback`。不要做涟漪效果。",
  "图标只用 SF Symbols（`Image(systemName:)`、`Label(_:systemImage:)`）。本提示词中的图标名是 SF Symbol 名称，图标对照这一行列出的除外，那些是 Material Symbols 名称：对照里有的用对照结果，没有的选含义最接近的 SF Symbol。TabView 会自动把选中标签的符号变成填充样式。",
  "辅助功能：每个只有图标的按钮都要有 `.accessibilityLabel`；点击区域不小于 44×44pt。",
];

export const GENERAL_IOS: Record<Lang, string[]> = { ja: GENERAL_EN, en: GENERAL_EN, zh: GENERAL_ZH, ko: GENERAL_EN };

/** replaces the Android / web "deliverable" option line */
export const DELIVERABLE_IOS: Record<Lang, string> = {
  ja: "シミュレータや実機での動作検証は不要。実装が終わったら、Xcode プロジェクトが `xcodebuild -scheme <アプリ名> -destination 'generic/platform=iOS Simulator' build` でエラーなくビルドできることを確認し、プロジェクトを成果物として提供する。",
  en: "Do not verify in the Simulator or on a device. When the implementation is done, make sure the Xcode project builds without errors with `xcodebuild -scheme <AppName> -destination 'generic/platform=iOS Simulator' build`, and provide the project as the deliverable.",
  zh: "不需要在模拟器或真机上验证。实现完成后，确认 Xcode 工程能用 `xcodebuild -scheme <应用名> -destination 'generic/platform=iOS Simulator' build` 无错误地构建，并把工程作为交付物。",
  ko: "시뮬레이터나 실제 기기 동작 검증은 필요 없다. 구현 후 Xcode 프로젝트가 `xcodebuild -scheme <앱 이름> -destination 'generic/platform=iOS Simulator' build`로 오류 없이 빌드되는지 확인하고 프로젝트를 결과물로 제공한다.",
};

/* ---------- icons: Material Symbols names → SF Symbols ---------- */

export const ICON_MAP_IOS: Record<string, string> = {
  home: "house", search: "magnifyingglass", settings: "gearshape", person: "person", account_circle: "person.crop.circle",
  favorite: "heart", favorite_border: "heart", star: "star", add: "plus", add_circle: "plus.circle", remove: "minus",
  edit: "pencil", edit_note: "square.and.pencil", delete: "trash", share: "square.and.arrow.up", close: "xmark",
  check: "checkmark", check_circle: "checkmark.circle", cancel: "xmark.circle", menu: "line.3.horizontal",
  more_vert: "ellipsis", more_horiz: "ellipsis", arrow_back: "chevron.backward", arrow_forward: "chevron.forward",
  arrow_upward: "arrow.up", arrow_downward: "arrow.down", chevron_right: "chevron.right", chevron_left: "chevron.left",
  expand_more: "chevron.down", expand_less: "chevron.up", keyboard_arrow_down: "chevron.down", keyboard_arrow_up: "chevron.up",
  notifications: "bell", mail: "envelope", email: "envelope", call: "phone", phone: "phone", chat: "bubble.left",
  chat_bubble: "bubble.left", forum: "bubble.left.and.bubble.right", send: "paperplane", photo_camera: "camera",
  image: "photo", photo: "photo", photo_library: "photo.on.rectangle", add_photo_alternate: "photo.badge.plus",
  mic: "mic", videocam: "video", calendar_month: "calendar", calendar_today: "calendar", event: "calendar",
  schedule: "clock", alarm: "alarm", history: "clock.arrow.circlepath", location_on: "mappin.and.ellipse", place: "mappin",
  map: "map", explore: "safari", navigation: "location.north", bookmark: "bookmark", bookmark_border: "bookmark",
  info: "info.circle", help: "questionmark.circle", warning: "exclamationmark.triangle", error: "exclamationmark.circle",
  lock: "lock", lock_open: "lock.open", visibility: "eye", visibility_off: "eye.slash", download: "arrow.down.circle",
  upload: "arrow.up.circle", refresh: "arrow.clockwise", autorenew: "arrow.triangle.2.circlepath", sync: "arrow.triangle.2.circlepath",
  filter_list: "line.3.horizontal.decrease", tune: "slider.horizontal.3", sort: "arrow.up.arrow.down",
  shopping_cart: "cart", shopping_bag: "bag", shopping_basket: "basket", store: "storefront", local_shipping: "truck.box",
  attach_file: "paperclip", link: "link", content_copy: "doc.on.doc", save: "square.and.arrow.down", folder: "folder",
  description: "doc.text", notes: "note.text", article: "doc.richtext", play_arrow: "play.fill", pause: "pause.fill",
  stop: "stop.fill", skip_next: "forward.fill", skip_previous: "backward.fill", volume_up: "speaker.wave.2",
  music_note: "music.note", dark_mode: "moon", light_mode: "sun.max", language: "globe", public: "globe",
  translate: "translate", logout: "rectangle.portrait.and.arrow.right", thumb_up: "hand.thumbsup", thumb_down: "hand.thumbsdown",
  undo: "arrow.uturn.backward", redo: "arrow.uturn.forward", bolt: "bolt", auto_awesome: "sparkles", palette: "paintpalette",
  grid_view: "square.grid.2x2", list: "list.bullet", view_list: "list.bullet", dashboard: "rectangle.3.group",
  cloud: "cloud", cloud_off: "icloud.slash", wifi: "wifi", person_add: "person.badge.plus", group: "person.2", people: "person.2",
  credit_card: "creditcard", payments: "creditcard", restaurant: "fork.knife", local_cafe: "cup.and.saucer",
  directions_car: "car", flight: "airplane", fitness_center: "dumbbell", pets: "pawprint", qr_code: "qrcode",
  format_bold: "bold", format_italic: "italic", format_underlined: "underline", keyboard: "keyboard", smartphone: "iphone",
  desktop_windows: "desktopcomputer", open_in_new: "arrow.up.right.square", open_in_full: "arrow.up.left.and.arrow.down.right",
  fullscreen: "arrow.up.left.and.arrow.down.right", trending_up: "chart.line.uptrend.xyaxis", bar_chart: "chart.bar",
  pie_chart: "chart.pie", inbox: "tray", archive: "archivebox", flag: "flag", label: "tag", sell: "tag",
  mood: "face.smiling", sentiment_satisfied: "face.smiling", package_2: "shippingbox", inventory_2: "shippingbox",
  celebration: "party.popper", school: "graduationcap", work: "briefcase", home_work: "building.2",
};

const ICON_HEAD_IOS: Record<Lang, { head: string; sep: string; major: string; end: string; rest: (names: string) => string }> = {
  ja: { head: "アイコンの対応（Material Symbols → SF Symbols）：", sep: "、", major: "。", end: "。", rest: (n) => `表にない ${n} は意味の最も近い SF Symbol を選ぶ` },
  en: { head: "Icon mapping (Material Symbols → SF Symbols): ", sep: ", ", major: "; ", end: ".", rest: (n) => `for ${n}, pick the closest SF Symbol by meaning` },
  zh: { head: "图标对照（Material Symbols → SF Symbols）：", sep: "、", major: "；", end: "。", rest: (n) => `${n} 不在表中，请选择含义最接近的 SF Symbol` },
  ko: { head: "아이콘 대응(Material Symbols → SF Symbols): ", sep: ", ", major: ". ", end: ".", rest: (n) => `표에 없는 ${n}은(는) 의미가 가장 가까운 SF Symbol을 고른다` },
};

/** the icons the design uses, in first-seen order */
function iconsOf(items: Item[]): string[] {
  const seen: string[] = [];
  const add = (name?: string | null) => {
    const v = name?.trim();
    /* SF Symbol names ("sf:…") need no mapping */
    if (v && !v.startsWith("sf:") && !seen.includes(v)) seen.push(v);
  };
  for (const it of items) {
    add(it.icon);
    add(it.icon2);
    for (const t of it.tabs ?? []) add(t.icon);
    add(it.toggle?.icon);
  }
  return seen;
}

/** one guidance line mapping the icons in use to SF Symbols; empty when the design has no icons */
export function iconLineIos(items: Item[], lang: Lang): string {
  const names = iconsOf(items);
  if (names.length === 0) return "";
  const h = ICON_HEAD_IOS[lang];
  const pairs = names.filter((n) => ICON_MAP_IOS[n]).map((n) => `${n} → ${ICON_MAP_IOS[n]}`);
  const unknown = names.filter((n) => !ICON_MAP_IOS[n]);
  const parts = [pairs.join(h.sep), unknown.length ? h.rest(unknown.join(h.sep)) : ""].filter(Boolean);
  return `${h.head}${parts.join(h.major)}${h.end}`;
}

/* ---------- units ---------- */

/** iOS measures in points: every "56dp" or "16 sp" in the finished prompt becomes "56pt" / "16pt" */
export const toPointsIos = (text: string): string => text.replace(/(\d) ?[ds]p\b/g, "$1pt");

/* ---------- the iOS-only parts in the layout ---------- */

type Said = { q: (s: string) => string; label: string; sup: string; list: string; items: string; n: number; page: number; chosen: string; value: number; open: boolean; icon: string };

const IOS_ITEM_TEXT: Record<Lang, Record<string, (c: Said) => string>> = {
  en: {
    sectionHeader: (c) => `a section header ${c.q(c.label)}; the parts below it, up to the next section header, are its rows`,
    stepper: (c) => `a stepper ${c.q(c.label)} (value ${c.value})`,
    wheelPicker: (c) => `a wheel picker${c.label ? ` ${c.q(c.label)}` : ""} with the options ${c.list}; ${c.chosen} is selected`,
    colorPicker: (c) => `a color picker row ${c.q(c.label)}`,
    disclosure: (c) => `a disclosure group ${c.q(c.label)}, ${c.open ? "expanded" : "collapsed"}${c.sup ? `, revealing ${c.q(c.sup)}` : ""}`,
    textEditor: (c) => `a multi-line text editor with the placeholder ${c.q(c.label)}`,
    pageControl: (c) => `a page control for ${c.n} pages (${c.list}); page ${c.page} is current`,
    gauge: (c) => `a circular gauge ${c.q(c.label)} at ${c.value}%`,
    menu: (c) => `a pull-down menu ${c.q(c.label)}, drawn open, with the items ${c.items}`,
    actionSheet: (c) => `an action sheet titled ${c.q(c.label)}${c.sup ? ` with the message ${c.q(c.sup)}` : ""} and the actions ${c.list}, plus Cancel`,
    emptyState: (c) => `an empty state${c.icon ? ` with the ${c.icon} symbol` : ""}, the title ${c.q(c.label)}${c.sup ? ` and the description ${c.q(c.sup)}` : ""}`,
    link: (c) => `a link ${c.q(c.label)}`,
    labeledContent: (c) => `a labeled value row ${c.q(c.label)} showing ${c.q(c.sup)}`,
    secureField: (c) => `a secure (password) field with the placeholder ${c.q(c.label)}`,
    sectionFooter: (c) => `a section footer ${c.q(c.label)} under the section above it`,
    tip: (c) => `a tip${c.icon ? ` with the ${c.icon} symbol` : ""} titled ${c.q(c.label)}${c.sup ? ` saying ${c.q(c.sup)}` : ""}`,
    photosPicker: (c) => `a photos picker button ${c.q(c.label)}`,
    signInWithApple: (c) => `a Sign in with Apple button ${c.q(c.label)}`,
    applePayButton: (c) => `an Apple Pay button ${c.q(c.label)}`,
    videoPlayer: () => "a 16:9 video player",
    photoGrid: () => "a grid of square photos, three across",
    tabAccessory: (c) => `a tab bar accessory (mini player) ${c.q(c.label)}${c.sup ? ` by ${c.q(c.sup)}` : ""}`,
    subscriptionStore: (c) => `a subscription store ${c.q(c.label)}${c.sup ? ` (${c.q(c.sup)})` : ""} offering ${c.list}`,
    scatterChart: (c) => `a scatter chart ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} with ${c.n} series: ${c.list}`,
    stackedBarChart: (c) => `a stacked bar chart ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} with three stacked series over ${c.n} categories: ${c.list}`,
    heatmapChart: (c) => `a heatmap ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} with ${c.n} columns: ${c.list}`,
    barChart: (c) => `a bar chart ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} with ${c.n} bars: ${c.list}`,
    lineChart: (c) => `a line chart ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} with ${c.n} points along the x axis: ${c.list}`,
    areaChart: (c) => `an area chart ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} with ${c.n} points along the x axis: ${c.list}`,
    pieChart: (c) => `a donut chart ${c.q(c.label)} with ${c.n} slices: ${c.list}`,
  },
  zh: {
    sectionHeader: (c) => `分组标题${c.q(c.label)}，它下面直到下一个分组标题之前的组件是这一组的行`,
    stepper: (c) => `步进器${c.q(c.label)}（当前值 ${c.value}）`,
    wheelPicker: (c) => `滚轮选择器${c.label ? c.q(c.label) : ""}，选项为 ${c.list}，选中 ${c.chosen}`,
    colorPicker: (c) => `颜色选择行${c.q(c.label)}`,
    disclosure: (c) => `折叠组${c.q(c.label)}（${c.open ? "展开" : "收起"}）${c.sup ? `，展开后显示${c.q(c.sup)}` : ""}`,
    textEditor: (c) => `多行文本框，占位文字为${c.q(c.label)}`,
    pageControl: (c) => `页面指示器，共 ${c.n} 页（${c.list}），当前为第 ${c.page} 页`,
    gauge: (c) => `圆形仪表${c.q(c.label)}，数值 ${c.value}%`,
    menu: (c) => `下拉菜单${c.q(c.label)}（展开状态），菜单项为 ${c.items}`,
    actionSheet: (c) => `操作表，标题为${c.q(c.label)}${c.sup ? `，说明为${c.q(c.sup)}` : ""}，操作为 ${c.list}，另有“取消”`,
    emptyState: (c) => `空状态${c.icon ? `（符号 ${c.icon}）` : ""}，标题为${c.q(c.label)}${c.sup ? `，说明为${c.q(c.sup)}` : ""}`,
    link: (c) => `链接${c.q(c.label)}`,
    labeledContent: (c) => `键值行${c.q(c.label)}，值为${c.q(c.sup)}`,
    secureField: (c) => `密码输入框，占位文字为${c.q(c.label)}`,
    sectionFooter: (c) => `分组说明${c.q(c.label)}，位于上一个分组下方`,
    tip: (c) => `提示卡片${c.icon ? `（符号 ${c.icon}）` : ""}，标题为${c.q(c.label)}${c.sup ? `，内容为${c.q(c.sup)}` : ""}`,
    photosPicker: (c) => `照片选择按钮${c.q(c.label)}`,
    signInWithApple: (c) => `“通过 Apple 登录”按钮${c.q(c.label)}`,
    applePayButton: (c) => `Apple Pay 按钮${c.q(c.label)}`,
    videoPlayer: () => "16:9 视频播放器",
    photoGrid: () => "每行 3 张的方形照片网格",
    tabAccessory: (c) => `标签栏附件（迷你播放器）${c.q(c.label)}${c.sup ? `，艺人${c.q(c.sup)}` : ""}`,
    subscriptionStore: (c) => `订阅页${c.q(c.label)}${c.sup ? `（${c.q(c.sup)}）` : ""}，方案为 ${c.list}`,
    scatterChart: (c) => `散点图${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}，共 ${c.n} 个系列：${c.list}`,
    stackedBarChart: (c) => `堆叠柱状图${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}，${c.n} 个分类，每根柱 3 个堆叠系列：${c.list}`,
    heatmapChart: (c) => `热力图${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}，共 ${c.n} 列：${c.list}`,
    barChart: (c) => `柱状图${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}，共 ${c.n} 根柱：${c.list}`,
    lineChart: (c) => `折线图${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}，横轴共 ${c.n} 个点：${c.list}`,
    areaChart: (c) => `面积图${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}，横轴共 ${c.n} 个点：${c.list}`,
    pieChart: (c) => `环形图${c.q(c.label)}，共 ${c.n} 个扇区：${c.list}`,
  },
  ja: {
    sectionHeader: (c) => `セクション見出し${c.q(c.label)}（次の見出しまでの部品がこのセクションの行）`,
    stepper: (c) => `ステッパー${c.q(c.label)}（値 ${c.value}）`,
    wheelPicker: (c) => `ホイールピッカー${c.label ? c.q(c.label) : ""}（選択肢 ${c.list}、${c.chosen}を選択）`,
    colorPicker: (c) => `カラーピッカーの行${c.q(c.label)}`,
    disclosure: (c) => `折りたたみ項目${c.q(c.label)}（${c.open ? "展開" : "折りたたみ"}状態${c.sup ? `、開くと${c.q(c.sup)}を表示` : ""}）`,
    textEditor: (c) => `プレースホルダー${c.q(c.label)}の複数行テキストエディタ`,
    pageControl: (c) => `${c.n} ページのページコントロール（${c.list}、現在 ${c.page} ページ目）`,
    gauge: (c) => `円形ゲージ${c.q(c.label)}（${c.value}%）`,
    menu: (c) => `プルダウンメニュー${c.q(c.label)}（開いた状態、項目 ${c.items}）`,
    actionSheet: (c) => `アクションシート（タイトル${c.q(c.label)}${c.sup ? `、メッセージ${c.q(c.sup)}` : ""}、アクション ${c.list}、キャンセル付き）`,
    emptyState: (c) => `空の状態の表示${c.icon ? `（シンボル ${c.icon}）` : ""}（タイトル${c.q(c.label)}${c.sup ? `、説明${c.q(c.sup)}` : ""}）`,
    link: (c) => `リンク${c.q(c.label)}`,
    labeledContent: (c) => `項目と値の行${c.q(c.label)}（値 ${c.q(c.sup)}）`,
    secureField: (c) => `プレースホルダー${c.q(c.label)}のパスワード入力欄`,
    sectionFooter: (c) => `セクション補足${c.q(c.label)}（上のセクションの下）`,
    tip: (c) => `ヒント${c.icon ? `（シンボル ${c.icon}）` : ""}（タイトル${c.q(c.label)}${c.sup ? `、本文${c.q(c.sup)}` : ""}）`,
    photosPicker: (c) => `写真ピッカーのボタン${c.q(c.label)}`,
    signInWithApple: (c) => `Sign in with Apple ボタン${c.q(c.label)}`,
    applePayButton: (c) => `Apple Pay ボタン${c.q(c.label)}`,
    videoPlayer: () => "16:9 の動画プレーヤー",
    photoGrid: () => "3 列の正方形の写真グリッド",
    tabAccessory: (c) => `タブバーのアクセサリ（ミニプレーヤー）${c.q(c.label)}${c.sup ? `（${c.q(c.sup)}）` : ""}`,
    subscriptionStore: (c) => `サブスクリプション画面${c.q(c.label)}${c.sup ? `（${c.q(c.sup)}）` : ""}（プラン ${c.list}）`,
    scatterChart: (c) => `散布図${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}（${c.n} 系列：${c.list}）`,
    stackedBarChart: (c) => `積み上げ棒グラフ${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}（${c.n} 区分、各 3 系列：${c.list}）`,
    heatmapChart: (c) => `ヒートマップ${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}（${c.n} 列：${c.list}）`,
    barChart: (c) => `棒グラフ${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}（${c.n} 本：${c.list}）`,
    lineChart: (c) => `折れ線グラフ${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}（横軸 ${c.n} 点：${c.list}）`,
    areaChart: (c) => `面グラフ${c.q(c.label)}${c.sup ? `（${c.sup}）` : ""}（横軸 ${c.n} 点：${c.list}）`,
    pieChart: (c) => `ドーナツグラフ${c.q(c.label)}（${c.n} 区分：${c.list}）`,
  },
  ko: {
    sectionHeader: (c) => `섹션 제목 ${c.q(c.label)} (다음 섹션 제목 전까지의 부품이 이 섹션의 행)`,
    stepper: (c) => `스테퍼 ${c.q(c.label)} (값 ${c.value})`,
    wheelPicker: (c) => `휠 피커${c.label ? ` ${c.q(c.label)}` : ""} (옵션 ${c.list}, ${c.chosen} 선택됨)`,
    colorPicker: (c) => `색상 선택 행 ${c.q(c.label)}`,
    disclosure: (c) => `펼침 그룹 ${c.q(c.label)} (${c.open ? "펼친" : "접힌"} 상태${c.sup ? `, 펼치면 ${c.q(c.sup)} 표시` : ""})`,
    textEditor: (c) => `자리표시자가 ${c.q(c.label)}인 여러 줄 텍스트 편집기`,
    pageControl: (c) => `${c.n}페이지 페이지 컨트롤 (${c.list}, 현재 ${c.page}페이지)`,
    gauge: (c) => `원형 게이지 ${c.q(c.label)} (${c.value}%)`,
    menu: (c) => `풀다운 메뉴 ${c.q(c.label)} (열린 상태, 항목 ${c.items})`,
    actionSheet: (c) => `액션 시트 (제목 ${c.q(c.label)}${c.sup ? `, 메시지 ${c.q(c.sup)}` : ""}, 동작 ${c.list}, 취소 포함)`,
    emptyState: (c) => `빈 상태 화면${c.icon ? ` (심볼 ${c.icon})` : ""} (제목 ${c.q(c.label)}${c.sup ? `, 설명 ${c.q(c.sup)}` : ""})`,
    link: (c) => `링크 ${c.q(c.label)}`,
    labeledContent: (c) => `레이블과 값 행 ${c.q(c.label)} (값 ${c.q(c.sup)})`,
    secureField: (c) => `자리표시자가 ${c.q(c.label)}인 비밀번호 입력란`,
    sectionFooter: (c) => `섹션 설명 ${c.q(c.label)} (위 섹션 아래)`,
    tip: (c) => `팁${c.icon ? ` (심볼 ${c.icon})` : ""} (제목 ${c.q(c.label)}${c.sup ? `, 내용 ${c.q(c.sup)}` : ""})`,
    photosPicker: (c) => `사진 선택 버튼 ${c.q(c.label)}`,
    signInWithApple: (c) => `Apple로 로그인 버튼 ${c.q(c.label)}`,
    applePayButton: (c) => `Apple Pay 버튼 ${c.q(c.label)}`,
    videoPlayer: () => "16:9 비디오 플레이어",
    photoGrid: () => "한 줄에 3장인 정사각형 사진 그리드",
    tabAccessory: (c) => `탭 바 액세서리(미니 플레이어) ${c.q(c.label)}${c.sup ? ` (${c.q(c.sup)})` : ""}`,
    subscriptionStore: (c) => `구독 화면 ${c.q(c.label)}${c.sup ? ` (${c.q(c.sup)})` : ""} (플랜 ${c.list})`,
    scatterChart: (c) => `산점도 ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} (${c.n}개 계열: ${c.list})`,
    stackedBarChart: (c) => `누적 막대 차트 ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} (${c.n}개 분류, 각 3개 계열: ${c.list})`,
    heatmapChart: (c) => `히트맵 ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} (${c.n}개 열: ${c.list})`,
    barChart: (c) => `막대 차트 ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} (${c.n}개 막대: ${c.list})`,
    lineChart: (c) => `꺾은선 차트 ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} (가로축 ${c.n}개 지점: ${c.list})`,
    areaChart: (c) => `영역 차트 ${c.q(c.label)}${c.sup ? ` (${c.sup})` : ""} (가로축 ${c.n}개 지점: ${c.list})`,
    pieChart: (c) => `도넛 차트 ${c.q(c.label)} (${c.n}개 조각: ${c.list})`,
  },
};

const QUOTE: Record<Lang, (s: string) => string> = { ja: (s) => `「${s.trim()}」`, zh: (s) => `“${s.trim()}”`, en: (s) => `"${s.trim()}"`, ko: (s) => `"${s.trim()}"` };

/** the layout's words for an iOS-only part, in any target's prompt; null for every other kind */
export function iosItemText(it: Item, lang: Lang): string | null {
  if (it.kind === "custom") return customItemText(it, lang);
  if (!isIosKind(it.kind)) return null;
  const q = QUOTE[lang];
  const sep = lang === "ja" || lang === "zh" ? "、" : ", ";
  const tabs = it.tabs ?? [];
  const sel = Math.min(Math.max(0, it.selected ?? 0), Math.max(0, tabs.length - 1));
  const c: Said = {
    q,
    label: it.label.trim(),
    sup: it.supporting?.trim() ?? "",
    list: tabs.map((t) => q(t.label || "?")).join(sep),
    items: tabs.map((t) => `${q(t.label || "?")}${t.icon ? ` (${t.icon})` : ""}`).join(sep),
    n: tabs.length,
    page: sel + 1,
    chosen: tabs[sel] ? q(tabs[sel].label) : "?",
    value: it.value ?? (it.kind === "stepper" ? 1 : 72),
    open: !!it.checked,
    icon: it.icon ?? "",
  };
  return IOS_ITEM_TEXT[lang][it.kind](c);
}
