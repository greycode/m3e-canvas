# m3e-canvas 支持 iOS 26–27（SwiftUI）定制方案

2026年10月7日 · @Someone![img]()

## 摘要

结论：在已有的「目标平台」开关上新增 `"ios"`，把 iOS 文本全部放进新文件 `lib/prompt-ios.ts`，`buildPrompt` 只在 `platform === "ios"` 时换用这套文本。阶段 1 已在源码 `039ec31` 上实现：`npm run typecheck` 通过，24 个测试文件全部通过，Android 和 Web 的提示词与改动前逐字一致（快照测试验证）。

| 阶段                      | 内容                                                         | 状态                                                         |
| :------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 1 提示词层（必做）        | 新增 iOS 平台；36 种部件的 SwiftUI 映射；Liquid Glass 规则；配色、字体、动效、单位、图标映射。改 11 个文件，新增 502 行，删除 19 行 | 已完成，已验证（typecheck + vitest）。补丁可直接 `git apply` |
| 1b 日语和韩语翻译（可选） | ja、ko 的长文本目前回退到英文，翻译成本语言                  | 未开始                                                       |
| 2 画布外观层（可选）      | 画布和预览用 iOS 外观绘制 8 种部件，尺寸和布局算法不变       | 未开始，规格见第 5 节                                        |

交付物共 3 个文件，和本文档一起交给 Sonnet：

- `01-baseline-test.patch`：Android/Web 快照测试，必须在改源码之前应用。
- `02-ios-prompt.patch`：阶段 1 的全部改动。
- `sample-ios-prompt-zh.md`：用一个笔记应用草图生成的中文 iOS 提示词样例，供你检查效果。

未确认的部分：提示词中的 SwiftUI API 名称来自 Apple 文档、WWDC25 和 WWDC26 资料，没有在 Xcode 中编译过。第 7 节给出用 Xcode 27 做端到端验收的方法。

## 项目调研结论

m3e-canvas 已有「目标平台」开关（Android / Web），这是接入 iOS 的入口。提示词全部由 `lib/prompt.ts` 的 `buildPrompt` 生成，画布渲染由 `components/M3Node.tsx` 完成，两者互不依赖，所以可以只改提示词层。

说明：deepwiki 生成的页面有部分内容与源码不符（例如 `M3Node` 的 props 列表、`prompt.ts` 的行号）。下表的行号以 GitHub 源码提交 `039ec31`（2026-10-03）为准。

| 文件                         | 作用                                                         | 与 iOS 定制的关系                 |
| :--------------------------- | :----------------------------------------------------------- | :-------------------------------- |
| `lib/tokens.ts`              | 部件种类 `Kind`（36 种）、`Item`、`Theme`、`Doc`；`Platform` 类型在第 2333–2338 行 | 给 `Platform` 加 `"ios"`          |
| `lib/prompt.ts`              | `buildPrompt`（第 1745 行）；`STYLE_NOTES`、`STYLE_NOTES_WEB`、`GENERAL`、`THEME_NOTES`、`PH`、`PROMPT_OPTION_TEXT` 等文本表 | 插入 iOS 分支（阶段 1 的主体）    |
| `components/PromptPanel.tsx` | 平台分段控件，第 438–449 行                                  | 加第 3 个选项「iOS」              |
| `lib/i18n.ts`                | 界面文案 `targetAndroid` / `targetWeb`：第 322–323 行（日英中），第 542–543 行（韩） | 加 `targetIos`                    |
| `lib/project.ts`             | 用 `isPlatform` 校验导入的项目文件                           | 改 `isPlatform` 后自动生效        |
| `public/agent.md`            | 给编码代理的分享链接格式说明，第 46 行写了 platform 取值     | 补充 `"ios"`                      |
| `app/Editor.tsx`             | 保存 `platform` 状态（第 503、757、889、4730 行），第 3790 行提供 `ThemeContext` | 阶段 2 才改                       |
| `components/M3Node.tsx`      | 画布部件渲染：`Body`（第 878 行）、`M3Node`（第 1791 行）、`M3Static` | 阶段 2 才改                       |
| `lib/prompt.test.ts` 等      | 平台相关测试，`PLATFORM_LINE` 的类型是 `Record<Lang, Record<Platform, string>>` | 必须补 iOS 条目，否则类型检查失败 |

生成的提示词按固定顺序输出：开头 4 行（介绍、目标设备、目标平台、草图说明）→ `## Colors` → `## Shape, type and motion` → `## Layout` → `## Behavior and navigation` → `## Component styles` → `## General guidance`（末尾追加用户勾选的选项）。iOS 版保持这个顺序，现有的段落顺序测试不用改。

现有代码里有 5 类 Android 痕迹，方案逐类处理：

1. 三元表达式陷阱。`GENERAL`、`PH.target`、`PH.platform`、`PH.dynamic`、`PROMPT_OPTION_TEXT.deliverable` 都写成 `pl === "web" ? Web 文本 : Android 文本`。新增 `"ios"` 后，iOS 会落进 Android 分支。处理：不改这些函数，iOS 时换用 iOS 专用表。
2. 固定短语写死 Material。`PH.intro` 写「in the Material 3 Expressive design language」，`colorIntro`、`styleIntro` 也写 M3。处理：iOS 时用 `PH_IOS` 覆盖这几个短语。
3. 部件描述用 Material 名词。屏幕结构段由 `itemJa/itemEn/itemZh/itemKo` 生成，会出现 FAB、top app bar、tonal、`WideNavigationRail` 等词。处理：不改这 4 个函数，在 iOS 样式说明里逐个写明「这个名字在 iOS 上用什么实现」，并在整体原则里声明「这些是草图工具的 Material 名称」。
4. 单位。部件描述用 dp 和 sp。处理：iOS 输出时把整段提示词里的「数字+dp/sp」替换成「数字+pt」。
5. 图标。部件只存 Material Symbols 名称（例如 `search`）。处理：iOS 输出时附一行「Material 名 → SF Symbol 名」对照，只列出当前设计用到的图标。

## iOS 26–27 风格与 SwiftUI 映射

iOS 版提示词按三条规则约束生成代码：导航层交给系统自动加 Liquid Glass；自定义玻璃只用于悬浮在内容上方的控件；内容层（卡片、列表行、图片、背景）保持不透明。版本策略是部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建，iOS 27 才有的 API 一律放在 `if #available(iOS 27, *)` 中。

提示词用到的 iOS 27 新 API 只有下面几项，均有 Apple 资料或示例代码可查：

- 工具栏：`ToolbarItem(placement: .topBarPinnedTrailing)`、`.visibilityPriority(.high)`（[WWDC26 SwiftUI 指南](https://developer.apple.com/wwdc26/guides/swiftui/)）。
- 标签栏：`Tab(role: .prominent)`（[Swift with Majid](https://swiftwithmajid.com/2026/06/08/what-is-new-in-swiftui-after-wwdc26/)）。
- 转场：`.navigationTransition(.crossFade)`，用于草图中的「淡入」转场（[Michael Tsai 汇总](https://mjtsai.com/blog/2026/06/19/swiftui-in-appleos-27/)）。
- 弹窗：alert 绑定可选数据（WWDC26 SwiftUI 指南）。

iOS 26 的 Liquid Glass API（`.glassEffect`、`GlassEffectContainer`、`.buttonStyle(.glass)` / `.glassProminent`、`.tabBarMinimizeBehavior`、`.tabViewBottomAccessory`、`ToolbarSpacer`）来自 WWDC25 的 [Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323/)。

### 部件映射

左列是画布上的部件种类（`Kind`），中列是提示词要求的 SwiftUI 实现。完整措辞见第 6 节的 `STYLE_NOTES_IOS`。

| 部件（Kind）       | SwiftUI 实现                                                 | 用到的新版本 API                          |
| :----------------- | :----------------------------------------------------------- | :---------------------------------------- |
| `button`           | `Button`，filled → `.borderedProminent`（悬浮时 `.glassProminent`），tonal/outlined → `.bordered`，elevated → `.glass`，text → `.borderless`；胶囊形 | iOS 26                                    |
| `iconButton`       | `Button(Image(systemName:))`，`.glassProminent` / `.glass`，圆形；工具栏内用普通按钮 | iOS 26                                    |
| `fab`              | 有导航栏：`ToolbarItem(placement: .primaryAction)`；没有导航栏：`.glassProminent` 圆形悬浮按钮 | iOS 26                                    |
| `extendedFab`      | `.glassProminent` 胶囊按钮，悬浮在右下角                     | iOS 26                                    |
| `splitButton`      | `Menu(primaryAction:)`：点按执行主操作，长按打开菜单         | 无                                        |
| `fabMenu`          | `Menu`，标签是 FAB                                           | iOS 26                                    |
| `chip`             | `Toggle` + `.toggleStyle(.button)`，胶囊形，`.controlSize(.small)` | 无                                        |
| `topAppBar`        | `NavigationStack` + `.navigationTitle` + `ToolbarItem`；`ToolbarSpacer` 分组 | iOS 26；iOS 27 加 `.topBarPinnedTrailing` |
| `bottomNav`        | `TabView` + `Tab`；`.tabBarMinimizeBehavior(.onScrollDown)`；搜索用 `Tab(role: .search)` | iOS 26；iOS 27 加 `Tab(role: .prominent)` |
| `navRail`          | `TabView` + `.tabViewStyle(.sidebarAdaptable)`               | 无                                        |
| `toolbar`          | `ToolbarItemGroup(placement: .bottomBar)` + `ToolbarSpacer`  | iOS 26                                    |
| `tabs`             | `Picker` + `.pickerStyle(.segmented)`                        | 无                                        |
| `searchBar`        | `.searchable`；有标签栏时用 `Tab(role: .search)`             | iOS 26                                    |
| `card`             | 自定义 `VStack`，20pt 连续圆角，禁止玻璃                     | 无                                        |
| `listItem`         | `List(.insetGrouped)` 中的行；相连的列表项为一个 `Section`   | 无                                        |
| `dialog`           | `.alert`；破坏性确认用 `.confirmationDialog`                 | iOS 27 可绑定可选数据                     |
| `bottomSheet`      | `.sheet` + `.presentationDetents`；部分高度时禁止设不透明背景 | iOS 26                                    |
| `snackbar`         | 自定义提示条 + `.glassEffect(.regular, in: .capsule)`        | iOS 26                                    |
| `textField`        | `TextField` / `SecureField`，放进 `Form` 或用 `.roundedBorder` | 无                                        |
| `select`           | `Picker` + `.pickerStyle(.menu)`                             | 无                                        |
| `switch`           | `Toggle`                                                     | 无                                        |
| `checkbox`         | `Button` + `checkmark.circle.fill` / `circle`（「提醒事项」样式） | 无                                        |
| `radio`            | `Picker` + `.pickerStyle(.inline)`                           | 无                                        |
| `slider`           | `Slider`                                                     | 无                                        |
| `datePicker`       | `DatePicker`，`.graphical` / `.compact`                      | 无                                        |
| `timePicker`       | `DatePicker(displayedComponents: .hourAndMinute)`，`.wheel` / `.compact` | 无                                        |
| `carousel`         | `ScrollView(.horizontal)` + `.scrollTargetBehavior(.viewAligned)` | 无                                        |
| `text`             | `Text` + 按字号对应的动态字体样式                            | 无                                        |
| `image`            | `Image` / `AsyncImage`，20pt 连续圆角                        | 无                                        |
| `camera`           | `AVCaptureVideoPreviewLayer`（`UIViewRepresentable`）        | 无                                        |
| `map`              | `Map` + `.mapControls`                                       | 无                                        |
| `divider`          | `Divider`；`List` 内用系统分隔线                             | 无                                        |
| `box`              | `RoundedRectangle(style: .continuous)` 作背景                | 无                                        |
| `loadingIndicator` | `ProgressView()`                                             | 无                                        |
| `linearProgress`   | `ProgressView(value:)`；不确定进度改用转圈                   | 无                                        |
| `circularProgress` | `ProgressView()` / `Gauge` + `.accessoryCircularCapacity`    | 无                                        |

### 其他设计轴的映射

| 设计轴   | 画布中的 Material 设置                                | iOS 提示词的写法                                             |
| :------- | :---------------------------------------------------- | :----------------------------------------------------------- |
| 颜色     | M3 配色角色（primary、surface…）                      | primary → AccentColor；容器色 → 资源命名颜色；surface、onSurface、outline → 系统语义色 |
| 形状     | square / rounded / full                               | 8pt 连续圆角 / 胶囊按钮 + 20pt 卡片 + `ConcentricRectangle()` / 全胶囊 + 32pt 卡片 |
| 字体     | Roboto、Roboto Flex、Roboto Serif、System；emphasized | SF Pro（Roboto Serif → `.fontDesign(.serif)`）；emphasized → `.fontWeight(.semibold)`；只用动态字体样式 |
| 动效     | standard / expressive                                 | `.smooth` / `.bouncy` 弹簧                                   |
| 转场     | 四向滑入、淡入、放大、无                              | push / `.sheet` / `.navigationTransition(.zoom)` / iOS 27 `.crossFade` |
| 单位     | dp、sp                                                | 整段替换为 pt                                                |
| 图标     | Material Symbols 名称                                 | 附一行「Material → SF Symbol」对照，内置 154 个常用图标，其余让模型选含义最接近的 SF Symbol |
| 动态配色 | 壁纸取色                                              | 说明 iOS 没有壁纸取色，下方颜色即应用配色                    |

## 改造架构

改造只在 `buildPrompt` 内部加分支：`platform === "ios"` 时换用新文件 `lib/prompt-ios.ts` 的文本，屏幕结构、配色值、跳转说明这些与平台无关的部分两条路径共用。

高亮的是本次新增的文件。Android 和 Web 路径上的文本没有变化，快照测试保证这一点。

方案没有改 `itemJa` 等 4 个部件描述函数，也没有把平台抽象成插件系统。前者会改变 Android 和 Web 的输出；后者改动面大，需要较多设计判断，不适合交给规划能力较弱的执行模型。

## 分步执行清单

阶段 1 用补丁完成，Sonnet 只需执行命令和核对输出。补丁失败时，按「手工应用」逐处替换文本。阶段 1b 和阶段 2 是可选的后续工作。

前置条件：

- 本地有仓库 `lnkiai/m3e-canvas`，Node.js 满足 `package.json` 的 `engines`（`^22.12.0 || ^24.0.0 || >=26.0.0`）。
- 有 3 个文件：`01-baseline-test.patch`、`02-ios-prompt.patch`、本文档。

### 阶段 1：提示词层

1. 在仓库根目录新建分支：`git checkout -b feat/ios-target`。
2. 安装依赖：`npm ci`。
3. 运行 `npm run typecheck` 和 `npm test`。预期结果：两条命令的退出码都是 0。如果失败，停止执行，报告完整输出。

注意：第 4 至 6 步必须在修改任何源码之前完成。快照记录的是改动前的 Android 和 Web 输出。

1. 应用基线测试：`git apply 01-baseline-test.patch`。
2. 生成快照：`npx vitest run lib/prompt-baseline.test.ts -u`。预期结果：输出含「8 written」，并生成 `lib/__snapshots__/prompt-baseline.test.ts.snap`。
3. 提交：`git add -A && git commit -m "test: freeze android/web prompts"`。
4. 检查 iOS 补丁：`git apply --check 02-ios-prompt.patch`。如果检查失败，跳到「手工应用」，完成后从第 9 步继续。
5. 应用 iOS 补丁：`git apply 02-ios-prompt.patch`。
6. 运行 `npm run typecheck`。预期结果：退出码 0。
7. 运行 `npm test`。预期结果：所有测试文件通过（在 `039ec31` 上是 24 个），`prompt-baseline` 的 8 个快照没有变化。

警告：如果 `prompt-baseline` 测试失败，禁止用 `-u` 更新快照。快照失败说明 Android 或 Web 的输出被改动了。撤销引起差异的修改，再运行第 10 步。

1. 运行 `npm run dev`，在浏览器中打开提示词面板。预期结果：顶部分段控件有 3 项（Android、Web、iOS）。选择「iOS」后，提示词第 3 行是 iOS 平台行，中文界面显示「实现目标是 iOS（SwiftUI 原生应用）：……」。
2. 提交：`git add -A && git commit -m "feat: iOS (SwiftUI) target for the prompt"`。

### 手工应用（只在第 7 步失败时使用）

按 M1 至 M8 的顺序修改。每处都用「查找」文本定位。查找文本必须在文件中只出现 1 次；出现 0 次或多于 1 次时，停止并报告。

M1. 新建 `lib/prompt-ios.ts`，内容为第 6 节的代码，原样复制。

M2. 新建 `lib/prompt-ios.test.ts`，内容为第 7 节的代码，原样复制。

M3. `lib/tokens.ts`，2 处：

- 查找 `export type Platform = "android" | "web";`，替换为 `export type Platform = "android" | "web" | "ios";`。
- 查找 `v === "android" || v === "web";`，替换为 `v === "android" || v === "web" || v === "ios";`。

M4. `lib/prompt.ts`，7 处。

注意：`const ph = PH[lang];` 在文件中出现 2 次（`promptMarks` 和 `buildPrompt`）。只改 `buildPrompt` 中的一处，所以 M4-2 的查找文本包含上一行。

M4-1. 查找 `import { constrainModalRails } from "./rail";`，在它后面插入一行：

```
import { COLOR_MAP_IOS, DELIVERABLE_IOS, GENERAL_IOS, PH_IOS, iconLineIos, styleNoteIos, themeLinesIos, toPointsIos } from "./prompt-ios";
```

M4-2. 查找：

```
  const q = quote(lang);
  const ph = PH[lang];
```

替换为：

```
  const q = quote(lang);
  const ph = platform === "ios" ? { ...PH[lang], ...PH_IOS[lang] } : PH[lang];
```

M4-3. 查找 `.map((k) => (k === "navRail" && wideRail ?`，替换为 `.map((k) => (platform === "ios" ? styleNoteIos(k, lang) : k === "navRail" && wideRail ?`。这一行的其余部分不变。

M4-4. 查找：

```
    lines.push(...paletteLines(pal));
  }

  lines.push("");
  lines.push(ph.hTheme);
  lines.push(...themeLines(th, lang));
```

替换为：

```
    lines.push(...paletteLines(pal));
  }
  if (platform === "ios") lines.push(...COLOR_MAP_IOS[lang]);

  lines.push("");
  lines.push(ph.hTheme);
  lines.push(...(platform === "ios" ? themeLinesIos(th, lang) : themeLines(th, lang)));
```

M4-5. 查找：

```
  for (const s of GENERAL[lang]) lines.push(`- ${typeof s === "function" ? s(platform) : s}`);
```

替换为：

```
  const general = platform === "ios" ? GENERAL_IOS[lang] : GENERAL[lang];
  for (const s of general) lines.push(`- ${typeof s === "function" ? s(platform) : s}`);
  if (platform === "ios") {
    const icons = iconLineIos(groups.flatMap((g) => g.items), lang);
    if (icons) lines.push(`- ${icons}`);
  }
```

M4-6. 查找 `    const line = PROMPT_OPTION_TEXT[lang][key].line;`，替换为：

```
    const line = platform === "ios" && key === "deliverable" ? DELIVERABLE_IOS[lang] : PROMPT_OPTION_TEXT[lang][key].line;
```

M4-7. 查找 `buildPrompt` 的结尾：

```
  return lines.join("\n");
}

/** the prompt to hand out
```

替换为：

```
  const out = lines.join("\n");
  return platform === "ios" ? toPointsIos(out) : out;
}

/** the prompt to hand out
```

M5. `components/PromptPanel.tsx`：查找 `{ key: "web", icon: "language", label: "Web", title: t("targetWeb", lang) },`，在它后面插入一行，缩进与上一行相同：

```
        { key: "ios", icon: "phone_iphone", label: "iOS", title: t("targetIos", lang) },
```

M6. `lib/i18n.ts`，2 处：

- 在以 `  targetWeb: { ja:` 开头的行后面插入：`  targetIos: { ja: "SwiftUI のネイティブ iOS アプリとして作る", en: "Build as a native iOS app in SwiftUI", zh: "作为 SwiftUI 原生 iOS 应用构建" },`
- 查找韩语表中的 `targetWeb: "브라우저에서 실행되는 웹 앱으로 만들기",`，在它后面加 ` targetIos: "SwiftUI 네이티브 iOS 앱으로 만들기",`。

M7. `public/agent.md`：查找 `// "android" (default) or "web"`，替换为 `// "android" (default), "web" or "ios"`。

M8. 现有测试，共 6 处。原来有 3 个测试把 `"ios"` 当作非法值，改用另一个非法值 `"macos"`。

- `lib/prompt.test.ts` 的 `PLATFORM_LINE`：4 种语言各加一个 `ios` 键，值见下方代码块。
- `lib/prompt.test.ts`：在 `expect(web[2]).toBe(PLATFORM_LINE[lang].web);` 后面加一行 `expect(lines(build(lang, "ios"))[2]).toBe(PLATFORM_LINE[lang].ios);`。
- `lib/project.test.ts`：`it.each([undefined, "android", "web"])` 改为 `it.each([undefined, "android", "web", "ios"])`；`it.each([null, "ios", "", 0, {}, true])` 改为 `it.each([null, "macos", "", 0, {}, true])`。
- `lib/share.test.ts`：`{ ...doc(), platform: "ios" }` 改为 `{ ...doc(), platform: "macos" }`。
- `lib/tokens.extended.test.ts`：测试名 `isPlatform narrows to 'android' | 'web'` 改为 `isPlatform narrows to 'android' | 'web' | 'ios'`；`expect(isPlatform("ios")).toBe(false);` 改为 `expect(isPlatform("ios")).toBe(true);` 和 `expect(isPlatform("macos")).toBe(false);` 两行。

`PLATFORM_LINE` 的 `ios` 值（必须与 `PH_IOS[lang].platform()` 的返回值逐字相同）：

```
ja: "実装先は iOS（SwiftUI のネイティブアプリ）です。デプロイメントターゲットは iOS 26.0、Xcode 27 と iOS 27 SDK でビルドします。"
en: "Build it for iOS as a native SwiftUI app: deployment target iOS 26.0, built with Xcode 27 and the iOS 27 SDK."
zh: "实现目标是 iOS（SwiftUI 原生应用）：部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建。"
ko: "SwiftUI 네이티브 iOS 앱으로 구현한다. 배포 대상은 iOS 26.0이며 Xcode 27과 iOS 27 SDK로 빌드한다."
```

### 阶段 1b：日语和韩语翻译（可选）

前置条件：阶段 1 已提交，测试全部通过。

1. 只修改 `lib/prompt-ios.ts`。
2. 在 `STYLE_NOTES_IOS.ja` 和 `STYLE_NOTES_IOS.ko` 中各写 36 个键。键与 `en` 相同，值翻译 `en` 的对应文本。
3. 新建常量 `GENERAL_JA`、`GENERAL_KO`（翻译 `GENERAL_EN` 的 16 行）和 `COLOR_MAP_JA`、`COLOR_MAP_KO`（翻译 `COLOR_MAP_EN` 的 6 行）。
4. 把 `GENERAL_IOS` 和 `COLOR_MAP_IOS` 中 `ja`、`ko` 的值改成第 3 步的新常量。
5. 在 `THEME_IOS` 中加 `ja` 和 `ko` 两项，结构与 `zh` 相同。
6. 运行 `npm run typecheck` 和 `npm test`。预期结果：全部通过。

翻译规则：反引号中的代码、API 名和 SF Symbol 名原样保留。「SwiftUI」「Liquid Glass」「SF Symbols」不翻译。每条开头的部件名使用 `lib/i18n.ts` 中 `KIND_TEXT` 对应语言的名称。

### 阶段 2：画布 iOS 外观（可选）

状态：未实现，未验证。建议在阶段 1 合并后单独开分支。

前置条件：阶段 1 已提交，测试全部通过。

注意：只换外观，不改尺寸。iOS 外观的部件必须占用与 Material 版完全相同的宽高，否则吸附、布局和提示词里的尺寸都会变化。宽度由内容决定的部件（`isMeasured(item)` 为 `true`）一律保留 Material 外观。

1. 新建 `lib/platform.ts`：

```
"use client";

import { createContext, useContext } from "react";
import { DEFAULT_PLATFORM, Platform } from "./tokens";

/** the prompt target, read by parts that draw an iOS skin on the canvas */
export const PlatformContext = createContext<Platform>(DEFAULT_PLATFORM);
export const usePlatform = () => useContext(PlatformContext);
```

1. `app/Editor.tsx`：从 `@/lib/platform` 导入 `PlatformContext`。在 `<ThemeContext.Provider value={theme}>` 的下一行插入 `<PlatformContext.Provider value={platform ?? defaultPlatformOf(frames, frame)}>`，在对应的 `</ThemeContext.Provider>` 的上一行插入 `</PlatformContext.Provider>`。
2. 新建 `components/IosNode.tsx`，导出常量 `IOS_SKIN_KINDS: Kind[] = ["bottomNav", "topAppBar", "listItem", "searchBar", "tabs", "slider", "toolbar"]` 和组件 `IosBody({ item, p, w, h, dark })`。`IosBody` 的根元素宽 `w`、高 `h`，按下表绘制。图标继续用 `components/M3Node.tsx` 导出的 `Icon`（Material Symbols），因为 SF Symbols 的许可不允许用在网页上。
3. `components/M3Node.tsx` 的 `M3Node`：在 `const reducedMotion = useReducedMotion();` 后面加 `const platform = usePlatform();` 和 `const dark = useTheme().dark;`。在 `return (` 前面加一个条件返回：当 `platform === "ios" && IOS_SKIN_KINDS.includes(item.kind) && !measured` 时，返回一个 `div`。这个 `div` 必须带 `data-node={item.id}`、`data-kind={item.kind}`、`onPointerDown={onPointerDown}`，样式复制原 `motion.div` 的 `width`、`height`、`position`、`zIndex`、`cursor`、`userSelect`、`touchAction`、`boxSizing`、`outline`、`outlineOffset`、`flex`，子元素为 `<IosBody item={drawn} p={palette} w={size.w} h={size.h} dark={dark} />`。

警告：条件返回必须放在所有 hook 调用之后。放在 hook 之前会让 hook 数量随平台切换而变化，React 会报错。

1. `M3Static`：在函数开头调用 `usePlatform()` 和 `useTheme()`，在 `return (` 前面加同样的条件返回，`div` 的样式额外合并传入的 `style`。
2. 运行 `npm run typecheck` 和 `npm test`。预期结果：全部通过。
3. 运行 `npm run dev`，手动检查 4 项：选择 iOS 后 7 种部件显示 iOS 外观；切回 Android 后恢复 Material 外观；拖动、吸附和选中框正常；保存 PNG 正常。

`IosBody` 共用的样式值（`dark` 为 `true` 时取第二个值）：

| 名称           | 值                                                           |
| :------------- | :----------------------------------------------------------- |
| 玻璃 GLASS     | `background: rgba(255,255,255,0.72)` / `rgba(44,44,46,0.72)`；`backdropFilter` 和 `WebkitBackdropFilter: blur(20px) saturate(180%)`；`border: 1px solid rgba(255,255,255,0.6)` / `rgba(255,255,255,0.12)`；`boxShadow: 0 8px 24px rgba(0,0,0,0.12)` |
| label          | `#000000` / `#FFFFFF`                                        |
| secondaryLabel | `rgba(60,60,67,0.6)` / `rgba(235,235,245,0.6)`               |
| fill           | `rgba(118,118,128,0.12)` / `rgba(118,118,128,0.24)`          |
| groupedRow     | `#FFFFFF` / `#1C1C1E`                                        |
| 字体           | `-apple-system, system-ui, sans-serif`                       |

| Kind        | 绘制规格                                                     |
| :---------- | :----------------------------------------------------------- |
| `bottomNav` | 根元素透明。距底边 8px、左右各 16px 处画胶囊：高 62px，圆角 999px，GLASS。`item.tabs` 等分宽度，每项为 24px 图标加 10px、字重 500 的标签，竖排居中。选中项（`item.selected ?? 0`）的图标和文字用 `p.primary`，背后画上下各内缩 4px 的胶囊，背景为 `p.primary` 加 12% 不透明度；其他项用 label |
| `topAppBar` | 根元素透明。顶部一行高 44px：`item.icon`、`item.icon2` 各画在 44×44 的圆形 GLASS 按钮中，分别距左右边 16px。`h` 不大于 64 时，标题 `item.label` 为 17px、字重 600，在这一行水平居中；`h` 大于 64 时，标题为 34px、字重 700，左对齐（距左 16px），放在这一行下方 |
| `listItem`  | 背景 groupedRow，左右内边距 16px。有 `item.icon` 时，左侧画 30×30、圆角 7px、背景 `p.primary` 的图标块，内放 18px 白色图标。标题 17px label；`item.supporting` 为 15px secondaryLabel，在标题下方。尾部：`item.switch` 为 `true` 时画 51×31 的开关（轨道开为 `p.primary`、关为 fill，27px 白色圆形滑块，阴影 `0 3px 8px rgba(0,0,0,0.15)`，位置由 `item.checked` 决定）；否则有 `item.icon2` 时画 20px secondaryLabel 图标 |
| `searchBar` | 根元素透明。垂直居中画高 44px、占满宽度的 GLASS 胶囊。左侧 14px 处画 20px 的 `search` 图标（secondaryLabel），后接 17px secondaryLabel 的占位文字 `item.label`。`item.icon2` 存在且不是 `mic` 时，画在右侧 14px 处 |
| `tabs`      | 根元素透明。垂直居中画高 36px 的胶囊轨道，背景 fill，内边距 2px。`item.tabs` 等分宽度；选中段（`item.selected ?? 0`）画白色胶囊（`dark` 时 `#636366`），阴影 `0 2px 6px rgba(0,0,0,0.12)`。标签 13px、字重 600、label 颜色 |
| `slider`    | 根元素透明。垂直居中画高 6px、圆角 3px 的轨道，背景 fill；左侧 `item.value ?? 40` 百分比的宽度画 `p.primary`。在该位置画 38×24 的白色胶囊滑块，阴影 `0 2px 6px rgba(0,0,0,0.2)` |
| `toolbar`   | 根元素透明。垂直居中画高 50px、占满宽度的 GLASS 胶囊。`item.tabs` 的图标（22px，label 颜色）等距排列。`item.variant` 为 `"filled"` 时，第一个图标放进 36×36、背景 `p.primary` 的圆中，图标改为白色 |

## iOS 提示词全文：lib/prompt-ios.ts

`lib/prompt-ios.ts` 存放 iOS 提示词的全部文本，共 399 行。以后要调整 iOS 的写法，只改这个文件，`lib/prompt.ts` 不用再动。本节代码与 `02-ios-prompt.patch` 中的同名文件相同；两者不一致时，以补丁为准。

| 导出              | 用在提示词的哪里                                       | 想改什么就改这里                                            |
| :---------------- | :----------------------------------------------------- | :---------------------------------------------------------- |
| `PH_IOS`          | 开头的介绍、目标设备、平台行；配色说明；样式段的引导句 | 部署目标版本、iPhone 尺寸                                   |
| `COLOR_MAP_IOS`   | 「配色」段末尾的角色对照                               | M3 角色对应哪个 iOS 颜色                                    |
| `themeLinesIos`   | 「形状、字体与动效」段的 3 行                          | 圆角、字体、动画曲线                                        |
| `STYLE_NOTES_IOS` | 「各组件的样式」段，36 种部件各 1 条                   | 某个部件用哪个 SwiftUI 控件。同时改 `en` 和 `zh` 的同一个键 |
| `GENERAL_IOS`     | 「整体原则」段的 16 条                                 | Liquid Glass 规则、技术栈、导航映射                         |
| `ICON_MAP_IOS`    | 「整体原则」末尾的图标对照                             | 增删 Material → SF Symbol 的对应                            |
| `DELIVERABLE_IOS` | 勾选「仅交付成果」时的最后一行                         | 交付方式                                                    |
| `toPointsIos`     | 整段提示词                                             | dp、sp 换成 pt 的规则                                       |

文档单次写入有大小上限，所以代码分成 4 段。手工应用时，把第 1 至 4 段按顺序首尾相接，写入同一个文件 `lib/prompt-ios.ts`，段与段之间不加任何内容。

第 1 段（文件头、固定短语、配色、形状字体动效）：

```
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
```

## 验收与测试

阶段 1 有两层自动保护：快照测试保证 Android 和 Web 的提示词不变，`lib/prompt-ios.test.ts` 保证 iOS 提示词完整、不含 Android 用语。生成代码的实际效果需要用 Xcode 27 编译一次才能确认。

Sonnet 的工作满足以下全部条件时，阶段 1 算完成：

- `npm run typecheck` 退出码为 0。
- `npm test` 全部通过，`prompt-baseline` 的 8 个快照没有更新过。
- 提示词面板的分段控件有「iOS」第 3 项，选择后第 3 行是 iOS 平台行。
- 分支上有 2 个提交：基线测试、iOS 功能。

### 自动测试

| 测试文件                                                     | 检查内容                                                     | 失败说明什么                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------- |
| `lib/prompt-baseline.test.ts`                                | Android、Web 各 4 种语言共 8 份提示词，与改动前逐字一致      | iOS 改动影响了其他平台               |
| `lib/prompt-ios.test.ts`                                     | 每种部件在 4 种语言下都有 iOS 说明；样式段条数等于所用部件种类数；不含 Jetpack Compose、Room、APK 等 10 个 Android/Web 词；不含「数字+dp/sp」；含 SwiftUI 和 xcodebuild；图标对照只列出用到的图标 | iOS 文本缺项，或混入了 Android 内容  |
| `lib/prompt.test.ts`                                         | 第 3 行平台行，新增 iOS 断言                                 | `PH_IOS.platform` 与测试中的值不一致 |
| `lib/project.test.ts`、`lib/share.test.ts`、`lib/tokens.extended.test.ts` | `"ios"` 是合法平台，`"macos"` 不合法                         | `isPlatform` 没有改对                |

`lib/prompt-ios.test.ts` 全文（手工应用 M2 时使用）：

```
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
```

### 端到端验收（建议由你执行，Sonnet 不必做）

1. 在 m3e-canvas 中画一个 2 屏草图，包含导航栏、顶部应用栏、列表项、FAB、开关和底部面板。目标平台选「iOS」，复制提示词。
2. 把提示词交给代码生成模型，生成 Xcode 工程。
3. 用 Xcode 27 运行 `xcodebuild -scheme <应用名> -destination 'generic/platform=iOS Simulator' build`。预期结果：构建成功。
4. 按下表检查生成的代码。某一项不满足时，修改 `lib/prompt-ios.ts` 中对应的条目。

| 检查项     | 通过标准                                                     | 对应条目                                       |
| :--------- | :----------------------------------------------------------- | :--------------------------------------------- |
| 标签栏     | 使用 `TabView` + `Tab`；没有自绘标签栏，没有隐藏系统标签栏   | `STYLE_NOTES_IOS.bottomNav`、`GENERAL` 第 8 条 |
| 导航栏     | 使用 `NavigationStack` + `.navigationTitle` + `.toolbar`；没有 `.toolbarBackground` | `STYLE_NOTES_IOS.topAppBar`                    |
| 玻璃范围   | `.glassEffect` 和 `.glass` 只出现在悬浮控件上，卡片和列表行没有 | `GENERAL` 第 9 条                              |
| iOS 27 API | 全部在 `if #available(iOS 27, *)` 中                         | `GENERAL` 第 5 条                              |
| 图标       | 只用 `Image(systemName:)`，没有引入 Material Symbols 字体    | `GENERAL` 第 15 条、`ICON_MAP_IOS`             |
| 字体       | 没有 `.system(size:)`                                        | `GENERAL` 第 11 条                             |
| 颜色       | 视图中没有十六进制颜色，已设置 AccentColor                   | `COLOR_MAP_IOS`                                |
| FAB        | 变成 `.primaryAction` 工具栏按钮或 `.glassProminent` 悬浮按钮 | `STYLE_NOTES_IOS.fab`                          |

`sample-ios-prompt-zh.md` 是用笔记应用草图生成的中文样例，可以先用它做一次第 2 至 4 步。

## 交接说明（给 Sonnet）

Sonnet 只需按第 5 节执行命令和替换文本，不需要做设计判断。执行时遵守下面的规则。

必须：

1. 按第 5 节的顺序执行。一步完成并核对预期结果后，再做下一步。
2. 每次修改源码后，运行 `npm run typecheck` 和 `npm test`。
3. 文本和代码原样复制，包括标点、空格和反引号。
4. 每完成一个阶段，按以下格式汇报：步骤编号、状态（已完成、已验证、失败、跳过）、执行的命令、命令输出的最后 10 行。

禁止：

1. 禁止修改 `lib/prompt.ts` 中现有的文本表和函数：`STYLE_NOTES`、`STYLE_NOTES_WEB`、`GENERAL`、`THEME_NOTES`、`PH`、`PROMPT_OPTION_TEXT`、`itemJa`、`itemEn`、`itemZh`、`itemKo`。
2. 禁止在第 5 步以外用 `-u` 更新快照。
3. 禁止为了让测试通过而删除、跳过或放宽测试断言。
4. 禁止修改提示词中的 SwiftUI API 名称，禁止新增 API。iOS 写法的调整由用户决定。
5. 禁止升级或新增 npm 依赖。

出现以下任一情况时，停止执行，报告完整输出，不要自行处理：

- 第 3 步的基线检查失败。
- 「手工应用」中的查找文本出现 0 次或多于 1 次。
- 第 10 步的 `prompt-baseline` 快照测试失败。
- typecheck 报错，且出错的文件不在本次修改范围内。

以后的维护（给你参考）：

- 调整某个部件的 iOS 写法：改 `STYLE_NOTES_IOS.en` 和 `STYLE_NOTES_IOS.zh` 中同一个键，然后运行 `npm test`。
- 增加图标对照：在 `ICON_MAP_IOS` 中加一项 `Material 名: "SF Symbol 名"`。值只能包含小写字母、数字和点，测试会检查。
- iOS 28 发布后：改 `PH_IOS` 中 4 种语言的部署目标和 SDK 版本、`GENERAL_EN` 和 `GENERAL_ZH` 的第 5 条，以及 `lib/prompt.test.ts` 中 `PLATFORM_LINE` 的 4 个 `ios` 值。

第 2 段（部件样式说明：英文）：

```
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
  },
```

第 3 段（部件样式说明：中文）：

```
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
  },
  ja: {},
  ko: {},
};

/** the SwiftUI note for one kind; ja and ko fall back to English until they are translated */
export const styleNoteIos = (k: Kind, lang: Lang): string => STYLE_NOTES_IOS[lang][k] ?? STYLE_NOTES_IOS.en[k];
```

第 4 段（整体原则、交付物、图标对照、单位换算）：

```
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
  "Icons: SF Symbols only (`Image(systemName:)`, `Label(_:systemImage:)`). Icon names in this prompt are Material Symbols names: use the SF Symbol from the icon mapping line, otherwise the closest SF Symbol by meaning. TabView fills the selected tab's symbol automatically.",
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
  "图标只用 SF Symbols（`Image(systemName:)`、`Label(_:systemImage:)`）。本提示词中的图标名是 Material Symbols 名称：图标对照里有的用对照结果，没有的选含义最接近的 SF Symbol。TabView 会自动把选中标签的符号变成填充样式。",
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
    if (v && !seen.includes(v)) seen.push(v);
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
```