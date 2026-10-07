请用 SwiftUI 把Notes实现为原生 iOS 应用，遵循 Apple 的 iOS 26 设计（Liquid Glass）和人机界面指南。A simple notes app。
目标为竖屏 iPhone（402×874pt，iPhone 17）；草图画在 412×892 的画布上，请保持其布局并适配安全区域，只做浅色模式（.preferredColorScheme(.light)）。
实现目标是 iOS（SwiftUI 原生应用）：部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建。
下面的屏幕结构是传达意图的草图，不是最终规格。不要把它当静态图片照搬，而要做成这类应用通常应具备的功能齐全、真正可用的成品。

## 配色
iOS 没有根据壁纸生成配色的机制，请把下面的颜色作为应用自己的配色。Liquid Glass 会自动适应其后方的内容。
主题为 Purple 系。把 primary 放进 AccentColor 资源，并把下方对照表中的容器类角色添加为 Assets.xcassets 里的命名颜色；其余角色按对照表使用 iOS 系统颜色。
- primary #6750A4 / onPrimary #FFFFFF / primaryContainer #EADDFF / onPrimaryContainer #21005D
- secondary #635A75 / secondaryContainer #E8DEF8 / onSecondaryContainer #1D192B / tertiaryContainer #FFD8E4 / onTertiaryContainer #31111D
- surface #FEF7FF / surfaceContainerLow #F7F2FA / surfaceContainer #F3EDF7 / surfaceContainerHigh #ECE6F0 / surfaceContainerHighest #E6E0E9
- onSurface #1D1B20 / onSurfaceVariant #49454F / outline #79747E / outlineVariant #CAC4D0
- inverseSurface #322F35 / inverseOnSurface #F5EFF7 / inversePrimary #D0BCFF
- error #B3261E / onError #FFFFFF / errorContainer #F9DEDC / onErrorContainer #410E0B
SwiftUI 中的角色对照（下面的屏幕结构里也会出现这些角色名）：
- primary → AccentColor（`Color.accentColor`、`.tint`）；onPrimary → 系统在醒目控件上的文字颜色
- primaryContainer、secondaryContainer、tertiaryContainer 及对应的 on 角色 → 资源中的命名颜色（`PrimaryContainer`、`OnPrimaryContainer` 等），用于图标底块、选中状态和突出显示的卡片；secondary → 命名颜色 `Secondary`
- surface → `Color(.systemBackground)`，列表和表单页面用 `Color(.systemGroupedBackground)`；surfaceContainerLow 和 surfaceContainer → `Color(.secondarySystemGroupedBackground)`；surfaceContainerHigh 和 surfaceContainerHighest → `Color(.tertiarySystemGroupedBackground)`（填充色用 `Color(.secondarySystemFill)`）
- onSurface → `.primary`；onSurfaceVariant → `.secondary`；outline → `Color(.opaqueSeparator)`；outlineVariant → `Color(.separator)`
- error 和 errorContainer → `Color.red`（系统红色），破坏性按钮加 `role: .destructive`；inverseSurface、inverseOnSurface 和 inversePrimary → 不使用（提示条改用 Liquid Glass）

## 形状、字体与动效
- 圆角：iOS 默认值——按钮为胶囊形（`.buttonBorderShape(.capsule)`），卡片和图片 20pt 连续圆角，嵌在圆角容器里的形状用 `ConcentricRectangle()` 保持同心圆角。
- 字体：系统字体（SF Pro），不要内置 Roboto。文字保持各动态字体样式的默认字重。
- 动效：使用 `.smooth` 动画（`withAnimation(.smooth)`），不回弹；保留系统自带的过渡。

## 屏幕结构
共有 2 个屏幕：“Home”、“Edit”。

“Home”屏幕从上到下依次如下（重叠的组件会特别说明）：
- 上部放置标题为“Notes”的顶部应用栏，左侧是 menu，右侧是 search 图标按钮。
- 上部靠左放置“Work”标签片（选中状态）。
- 中部放置“Groceries”（辅助文本“3 items”），左侧显示 shopping_cart 图标，右侧显示 chevron_right 图标。
- 下部靠右放置add 图标的色调 FAB。
- 下部放置4个项目的导航栏（“首页”(home)、“搜索”(search)、“收藏”(favorite)、“设置”(settings)，第一项为选中状态）。

“Edit”屏幕目前为空。

## 行为与屏幕跳转
- FAB：点击后以从底部滑入的方式跳转到“Edit”屏幕。

## 各组件的样式
以下是所用组件的 SwiftUI 实现指引。每一条以上面屏幕结构里使用的 Material 名称开头，并给出 iOS 上应改用的控件。优先使用系统控件，只调整颜色、文字和周围的布局。
- 顶部应用栏 → 不要自己画栏，使用系统导航栏。把屏幕放进 `NavigationStack` 并设置 `.navigationTitle(title)`：小号栏 → `.navigationBarTitleDisplayMode(.inline)`；中号或大号栏 → `.navigationBarTitleDisplayMode(.large)`（大标题随滚动收起）。左侧图标 → `ToolbarItem(placement: .topBarLeading)`，右侧图标 → `ToolbarItem(placement: .topBarTrailing)`；arrow_back 图标就是系统返回按钮，不要另加。不相关的右侧按钮组用 `ToolbarSpacer(.fixed)` 分开。栏的背景交给系统。iOS 27 上用 `ToolbarItem(placement: .topBarPinnedTrailing)` 让分享按钮始终可见，重要按钮加 `.visibilityPriority(.high)`。
- 标签片 → SwiftUI 没有 chip。可选中的标签片 → `Toggle(isOn:) { Label(...) }.toggleStyle(.button)`，加 `.buttonBorderShape(.capsule)` 和 `.controlSize(.small)`（选中状态由系统用强调色绘制）。操作型标签片 → `Button`，加 `.buttonStyle(.bordered)`、`.buttonBorderShape(.capsule)` 和 `.controlSize(.small)`。一行标签片 → `ScrollView(.horizontal)` 包住 `HStack(spacing: 8)`，加 `.scrollIndicators(.hidden)` 和 `.contentMargins(.horizontal, 16)`。
- 列表项 → `.listStyle(.insetGrouped)` 的 `List` 中的一行；纵向相连的一组列表项是一个 `Section`。行内容：`Label { VStack(alignment: .leading) { Text(headline); Text(supporting).font(.subheadline).foregroundStyle(.secondary) } } icon: { … }`。带彩色圆底的前置图标 → 「设置」风格的图标块：白色 SF Symbol 放在 30pt、`RoundedRectangle(cornerRadius: 7, style: .continuous)` 的色块上，颜色按对照表。末尾是开关 → 整行就是一个 `Toggle`。点击后打开内容的行 → `NavigationLink`（系统箭头）。其他末尾图标 → `.secondary` 颜色的 `Image(systemName:)`。适合删除的地方加 `.swipeActions`。
- FAB → iOS 没有悬浮操作按钮。屏幕有导航栏时，把它做成主要工具栏操作：`ToolbarItem(placement: .primaryAction)`，图标用对照后的 SF Symbol。没有导航栏时，用 `.overlay(alignment: .bottomTrailing)` 悬浮一个圆形 `Button`，加 `.buttonStyle(.glassProminent)`、`.buttonBorderShape(.circle)` 和 `.controlSize(.large)`，位于安全区域内 16pt、标签栏上方。大号 FAB 用 `.controlSize(.extraLarge)`，小号用 `.regular`。
- 导航栏 → 系统标签栏：`TabView(selection:)`，每个目的地一个 `Tab(label, systemImage:, value:)`，各自包含自己的 `NavigationStack`，初始选中项按屏幕结构。加 `.tabBarMinimizeBehavior(.onScrollDown)`。搜索目的地 → `Tab(value:, role: .search)`。iOS 27 上，新建或撰写类目的地可以用 `Tab(role: .prominent)`。不要隐藏系统标签栏，也不要自己画；标签栏上方常驻的条（例如迷你播放器）→ `.tabViewBottomAccessory { }`。

## 整体原则
- 先根据屏幕目的判断这是什么类型的应用，并实现该类应用通常应有的功能（新建、列表、详情、编辑、删除、搜索、设置等，视情况而定），即使草图中没有画出。
- 把数据当作真实数据处理：用户创建的数据用 SwiftData 持久化到设备上（少量设置可用 UserDefaults 或文件），重启后仍保留。不要放入虚拟或示例数据，没有数据时显示 `ContentUnavailableView`。校验输入；删除前用 `.confirmationDialog`（`role: .destructive`）确认，失败用 `.alert` 提示。
- 草图没有写明的行为，根据屏幕目的和组件标签补全。未指定行为的按钮或项目要实现与其标签相符的操作（保存、发送、打开详情页等），不要什么都不做。
- 布局只需保持意图（顺序、分组、相对位置），尺寸和间距可根据内容和安全区域调整。若在真机上会出问题，宁可能用也不要死守草图。
- 技术栈：只用 SwiftUI 和 Swift 6，部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建。所有仅 iOS 27 可用的 API 都放进 `if #available(iOS 27, *)`，并提供 iOS 26 的退路。只有 SwiftUI 没有对应能力时才用 UIKit（相机预览）。不使用第三方 UI 库。
- 草图工具基于 Material，所以屏幕结构里的组件用 Material 的叫法（FAB、顶部应用栏、导航栏、标签片、Snackbar；填充／色调／浮起／描边）。不要做 Material 风格的仿制品，每个组件都按「各组件的样式」中给出的 SwiftUI 控件实现。
- 使用 SwiftUI 标准控件（Button、Toggle、Picker、Slider、Stepper、DatePicker、Menu、TextField、List、Form、TabView、NavigationStack、toolbar、sheet、alert、searchable），SwiftUI 已提供的控件不要自行绘制。
- Liquid Glass：导航层（标签栏、导航栏、工具栏及其按钮、搜索框、菜单、sheet、alert）由系统自动应用 Liquid Glass。不要在它后面加背景、材质或 `.toolbarBackground` 颜色，也不要隐藏系统标签栏或导航栏去自己画。内容从它下方全屏滚动通过。
- `.glassEffect(...)`、`.buttonStyle(.glass)` 和 `.glassProminent` 只用于悬浮在内容上方的自定义控件，相邻的玻璃视图放进同一个 `GlassEffectContainer`。内容不能用玻璃：卡片、列表行、图片、文字块和屏幕背景保持不透明。
- 颜色只来自「配色」中的角色对照（AccentColor、命名资源颜色、系统颜色），视图里不写十六进制颜色。通过资源变体支持深色模式和「增强对比度」；系统控件会自动处理「降低透明度」。
- 字体只用动态字体样式（`.largeTitle`、`.title`、`.title2`、`.title3`、`.headline`、`.body`、`.callout`、`.subheadline`、`.footnote`、`.caption`、`.caption2`），不要用 `.system(size:)`。辅助功能大字号下布局也要可用。
- 间距使用系统内边距（`.padding()` 为 16pt）以及 List、Form、NavigationStack 自带的边距。写明“横向排成一行”的组件放进同一个 HStack，不换行；写明“内部叠放”的组件放进以该容器为底的 ZStack（或 `.overlay`），后写的在前面。
- 导航：每个标签一个 NavigationStack，使用基于值的 `navigationDestination(for:)`。「行为与屏幕跳转」中的过渡按下面对应：从右、左或上滑入 → 普通 push；从下滑入 → `.sheet`（全屏流程用 `.fullScreenCover`）；放大 → `.navigationTransition(.zoom(sourceID:in:))` 配合 `.matchedTransitionSource`；淡入淡出 → iOS 27 用 `.navigationTransition(.crossFade)`，iOS 26 用普通 push；无动画 → 用 `Transaction` 关闭动画。“返回”就是系统返回按钮和边缘轻扫手势，不要禁用。网页链接用 `Link` 或 `openURL` 打开。
- 反馈：系统控件自带高亮和玻璃反馈；自定义的可点击视图用加了 `.buttonStyle(.plain)` 和 `.contentShape` 的 `Button`。选择变化和操作完成时加 `.sensoryFeedback`。不要做涟漪效果。
- 图标只用 SF Symbols（`Image(systemName:)`、`Label(_:systemImage:)`）。本提示词中的图标名是 Material Symbols 名称：图标对照里有的用对照结果，没有的选含义最接近的 SF Symbol。TabView 会自动把选中标签的符号变成填充样式。
- 辅助功能：每个只有图标的按钮都要有 `.accessibilityLabel`；点击区域不小于 44×44pt。
- 图标对照（Material Symbols → SF Symbols）：menu → line.3.horizontal、search → magnifyingglass、shopping_cart → cart、chevron_right → chevron.right、add → plus、home → house、favorite → heart、settings → gearshape。
- 不需要在模拟器或真机上验证。实现完成后，确认 Xcode 工程能用 `xcodebuild -scheme <应用名> -destination 'generic/platform=iOS Simulator' build` 无错误地构建，并把工程作为交付物。