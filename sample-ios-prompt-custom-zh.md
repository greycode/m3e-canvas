请用 SwiftUI 把Demo实现为原生 iOS 应用，遵循 Apple 的 iOS 26 设计（Liquid Glass）和人机界面指南。
目标为竖屏 iPhone（402×874pt，iPhone 17）；草图画在 412×892 的画布上，请保持其布局并适配安全区域，只做浅色模式（.preferredColorScheme(.light)）。
实现目标是 iOS（SwiftUI 原生应用）：部署目标 iOS 26.0，用 Xcode 27 和 iOS 27 SDK 构建。
下面的屏幕结构是传达意图的草图，不是最终规格。不要把它当静态图片照搬，而要做成这类应用通常应具备的功能齐全、真正可用的成品。

## 配色
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
共有 4 个屏幕：“Account”、“Library”、“Insights”、“Premium”。

“Account”屏幕从上到下依次如下（重叠的组件会特别说明）：
- 上部放置标题为“Account”的顶部应用栏。
- 上部放置自定义组件 ProfileHeader（initials "AK"）。
- 中部放置分组标题“Membership”，它下面直到下一个分组标题之前的组件是这一组的行。
- 中部放置键值行“Plan”，值为“Premium”。
- 中部放置密码输入框，占位文字为“Password”。
- 中部放置链接“Privacy Policy”。
- 中部放置分组说明“When this is on, your notes sync across your devices.”，位于上一个分组下方。
- 中部放置“通过 Apple 登录”按钮“Sign in with Apple”。
- 中部放置Apple Pay 按钮“Buy with Apple Pay”。
- 中部放置提示卡片（符号 lightbulb），标题为“Add to Favorites”，内容为“Tap the heart to find it again later.”。
- 中部，从左到右横向排成一行：自定义组件 StatTile（value "8,214"）、自定义组件 StatTile（value "7h 20m"）（放在同一行并垂直居中，不要竖着堆叠或换行，最后的“Sleep”自定义组件向右拉伸占满剩余宽度）。
- 下部放置4个项目的导航栏（“Home”(house.fill)、“Library”(photo.on.rectangle)、“Insights”(chart.bar)、“Account”(person.crop.circle)，“Account”为选中状态）。

“Library”屏幕从上到下依次如下（重叠的组件会特别说明）：
- 上部放置标题为“Library”的顶部应用栏。
- 上部居中放置照片选择按钮“Select Photos”。
- 中部放置每行 3 张的方形照片网格。
- 中部放置16:9 视频播放器。
- 中部放置自定义组件 RatingStars（rating "4"）。
- 中部放置自定义组件 RatingStars（rating "5"）。
- 下部放置标签栏附件（迷你播放器）“Now Playing”，艺人“Artist”。
- 下部放置4个项目的导航栏（“Home”(house.fill)、“Library”(photo.on.rectangle)、“Insights”(chart.bar)、“Account”(person.crop.circle)，“Library”为选中状态）。

“Insights”屏幕从上到下依次如下（重叠的组件会特别说明）：
- 上部放置标题为“Insights”的顶部应用栏。
- 中部放置散点图“Steps vs. Sleep”（Last 30 days），共 2 个系列：“This year”、“Last year”。
- 中部放置堆叠柱状图“Screen Time”（Last 7 days），7 个分类，每根柱 3 个堆叠系列：“Mon”、“Tue”、“Wed”、“Thu”、“Fri”、“Sat”、“Sun”。
- 中部放置热力图“Activity”（Last 5 weeks），共 7 列：“Mon”、“Tue”、“Wed”、“Thu”、“Fri”、“Sat”、“Sun”。

“Premium”屏幕从上到下依次如下（重叠的组件会特别说明）：
- 上部放置标题为“Premium”的顶部应用栏。
- 中部放置订阅页“Premium”（“Unlock every feature”），方案为 “Monthly”、“Yearly”。
- 中部放置自定义组件 GoalCard（value "64"）。

## 各组件的样式
以下是所用组件的 SwiftUI 实现指引。每一条以上面屏幕结构里使用的 Material 名称开头，并给出 iOS 上应改用的控件。优先使用系统控件，只调整颜色、文字和周围的布局。
- 顶部应用栏 → 不要自己画栏，使用系统导航栏。把屏幕放进 `NavigationStack` 并设置 `.navigationTitle(title)`：小号栏 → `.navigationBarTitleDisplayMode(.inline)`；中号或大号栏 → `.navigationBarTitleDisplayMode(.large)`（大标题随滚动收起）。左侧图标 → `ToolbarItem(placement: .topBarLeading)`，右侧图标 → `ToolbarItem(placement: .topBarTrailing)`；arrow_back 图标就是系统返回按钮，不要另加。不相关的右侧按钮组用 `ToolbarSpacer(.fixed)` 分开。栏的背景交给系统。iOS 27 上用 `ToolbarItem(placement: .topBarPinnedTrailing)` 让分享按钮始终可见，重要按钮加 `.visibilityPriority(.high)`。
- 自定义组件 → 各自做成可复用的 SwiftUI 视图，按「自定义组件」中的条目只实现一次，在屏幕结构中出现该名称的地方复用，并传入那里列出的属性值。组件内部同样遵守规则：系统颜色、动态字体、SF Symbols，只在悬浮于内容上方时使用 Liquid Glass。
- 分组标题 → `List` 或 `Form` 中 `Section` 的标题：`Section { rows } header: { Text(title) }`。它下面直到下一个分组标题之前的组件，都是这个分组的行。
- 键值行 → `LabeledContent(label, value: value)`，作为 `Form` 或 `List` 的一行；系统把值右对齐，并用次要颜色显示。
- 密码框 → `Form` section 中的 `SecureField(placeholder, text: $password)`，加 `.textContentType(.password)`（注册时用 `.newPassword`）。
- 链接 → `Link(title, destination: url)`：强调色文字，点按后在 Safari 中打开；放在 `Form` 里时仍是一行。应用内显示的网页用 iOS 26 的 SwiftUI `WebView`。
- 分组说明 → 上方 `Section` 的 footer：`Section { rows } footer: { Text(text) }`。
- 通过 Apple 登录 → AuthenticationServices 的 `SignInWithAppleButton(.signIn) { $0.requestedScopes = [.fullName, .email] } onCompletion: { result in … }`，加 `.signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)` 和 `.frame(height: 50)`；并添加 Sign in with Apple capability。
- Apple Pay 按钮 → PassKit 的 `PayWithApplePayButton(.buy) { … }`，加 `.frame(height: 50)`；根据订单构建 `PKPaymentRequest`。只在支持 Apple Pay 的地方显示。
- 提示卡片 → TipKit：定义一个遵循 `Tip` 的 `struct`，包含 `title`、`message` 和 `image`（`Image(systemName:)`），用 `TipView(tip)` 内嵌显示；启动时调用一次 `try? Tips.configure()`。
- 导航栏 → 系统标签栏：`TabView(selection:)`，每个目的地一个 `Tab(label, systemImage:, value:)`，各自包含自己的 `NavigationStack`，初始选中项按屏幕结构。加 `.tabBarMinimizeBehavior(.onScrollDown)`。搜索目的地 → `Tab(value:, role: .search)`。iOS 27 上，新建或撰写类目的地可以用 `Tab(role: .prominent)`。不要隐藏系统标签栏，也不要自己画；标签栏上方常驻的条（例如迷你播放器）→ `.tabViewBottomAccessory { }`。
- 照片选择器 → PhotosUI 的 `PhotosPicker(selection: $items, matching: .images) { Label(title, systemImage: symbol) }`，加 `.buttonStyle(.bordered)` 和 `.buttonBorderShape(.capsule)`；用 `loadTransferable(type:)` 读取所选照片。它不需要照片库权限。
- 照片网格 → `ScrollView` 中的 `LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3), spacing: 2)`，单元格为正方形（`.aspectRatio(1, contentMode: .fill)` 并裁切）；点按后用 `.navigationTransition(.zoom(sourceID:in:))` 打开照片。
- 视频播放器 → AVKit 的 `VideoPlayer(player: player)`，加 `.aspectRatio(16 / 9, contentMode: .fit)` 和 20pt 连续圆角；播放控件由系统绘制。
- 标签栏附件 → `TabView` 上的 `.tabViewBottomAccessory { … }`：紧凑的一行（封面、标题、播放和下一首按钮），以 Liquid Glass 悬浮在标签栏上方，标签栏收起时移到同一行；用 `@Environment(\.tabViewBottomAccessoryPlacement)` 适配两种位置。
- 散点图 → Swift Charts 的 `PointMark(x: .value(…), y: .value(…))`，加 `.foregroundStyle(by: .value("Series", $0.series))` 和 `.symbol(by: .value("Series", $0.series))`，每个条目一个系列。数据、空状态和辅助功能的要求与柱状图相同。
- 堆叠柱状图 → Swift Charts 的 `BarMark(x:, y:)`，加 `.foregroundStyle(by: .value("Series", $0.series))`（默认堆叠）和 `.chartLegend(position: .bottom)`；横轴显示各分类。数据、空状态和辅助功能的要求与柱状图相同。
- 热力图 → Swift Charts 的 `RectangleMark(x: .value("Day", $0.day), y: .value("Week", $0.week))`，加 `.foregroundStyle(by: .value("Count", $0.count))` 和 `.chartForegroundStyleScale(range: Gradient(colors: [.accentColor.opacity(0.1), .accentColor]))`；各列就是各分类。数据、空状态和辅助功能的要求与柱状图相同。
- 订阅页 → StoreKit 的 `SubscriptionStoreView(groupID: groupID) { 含标题和副标题的营销内容 }`，加 `.subscriptionStoreControlStyle(.prominentPicker)` 和 `.storeButton(.visible, for: .restorePurchases)`。方案来自 App Store Connect，条目只用来给方案命名。

## 自定义组件
以下组件由设计者定义，不是系统内置组件。每个组件只实现一次，做成可复用的 SwiftUI 视图（`struct 名称: View`），接收所列属性；屏幕结构中出现该名称的地方都复用它，并使用那里给出的属性值。
- ProfileHeader: The signed-in person: avatar initials, name and email; tapping opens the profile. 属性：initials ("AK")。
  画布草图：
  ```swift
  HStack(spacing: 14) {
    ZStack {
      Circle()
        .fill(.tint)
        .frame(width: 56)
      Text(initials)
        .font(.title3)
        .fontWeight(.semibold)
        .foregroundStyle(.white)
    }
    VStack(alignment: .leading, spacing: 2) {
      Text(label)
        .font(.title3)
        .fontWeight(.semibold)
      Text(supporting)
        .font(.subheadline)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    Image(systemName: "chevron.right")
      .font(.system(size: 16))
      .foregroundStyle(.tertiary)
  }
  .padding(16)
  .background(Color(.secondarySystemGroupedBackground), in: .rect(cornerRadius: 16))
  ```
- StatTile: One health metric with its symbol, value and name. 属性：value ("0")。
  画布草图：
  ```swift
  VStack(alignment: .leading, spacing: 4) {
    Image(systemName: icon)
      .font(.system(size: 22))
      .foregroundStyle(.tint)
    Text(value)
      .font(.title)
      .fontWeight(.bold)
    Text(label)
      .font(.footnote)
      .foregroundStyle(.secondary)
  }
  .padding(14)
  .background(Color(.secondarySystemGroupedBackground), in: .rect(cornerRadius: 16))
  ```
- RatingStars: A read-only 0–5 star rating with its label. 属性：rating ("3")。
  画布草图：
  ```swift
  HStack(spacing: 4) {
    Text(label)
      .font(.body)
      .fontWeight(.medium)
    Spacer()
    ForEach(1...5, id: \.self) { i in
      ZStack {
        if i <= rating {
          Image(systemName: "star.fill")
            .font(.system(size: 20))
            .foregroundStyle(.orange)
        }
        if i > rating {
          Image(systemName: "star")
            .font(.system(size: 20))
            .foregroundStyle(.tertiary)
        }
      }
    }
  }
  ```
- GoalCard: Progress toward today's goal. 属性：value ("64")。
  画布草图：
  ```swift
  VStack(alignment: .leading, spacing: 10) {
    HStack {
      Text(label)
        .font(.headline)
      Spacer()
      Text("\(value)%")
        .font(.subheadline)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity)
    ProgressView(value: Double(value) ?? 0, total: 100)
      .tint(.green)
  }
  .padding(16)
  .background(Color(.secondarySystemGroupedBackground), in: .rect(cornerRadius: 16))
  ```

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
- 图标只用 SF Symbols（`Image(systemName:)`、`Label(_:systemImage:)`）。本提示词中的图标名是 SF Symbol 名称，图标对照这一行列出的除外，那些是 Material Symbols 名称：对照里有的用对照结果，没有的选含义最接近的 SF Symbol。TabView 会自动把选中标签的符号变成填充样式。
- 辅助功能：每个只有图标的按钮都要有 `.accessibilityLabel`；点击区域不小于 44×44pt。
- 不需要在模拟器或真机上验证。实现完成后，确认 Xcode 工程能用 `xcodebuild -scheme <应用名> -destination 'generic/platform=iOS Simulator' build` 无错误地构建，并把工程作为交付物。