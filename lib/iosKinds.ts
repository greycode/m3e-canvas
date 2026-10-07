/**
 * The parts only the iOS target offers: SwiftUI controls Material has no part for, and
 * Swift Charts. tokens.ts adds them to Kind, KIND_SPEC, KIND_ORDER, ENTRY_BOUNDS, makeItem
 * and sizeOf; i18n.ts adds their names. The canvas always draws them in their iOS look
 * (components/IosControls.tsx, components/IosCharts.tsx).
 *
 * This module imports types only, so tokens.ts and i18n.ts can import it without a cycle.
 */
import type { Lang } from "./i18n";
import type { Item, KindSpec, NavTab } from "./tokens";

export const IOS_KINDS = [
  "sectionHeader",
  "stepper",
  "wheelPicker",
  "colorPicker",
  "disclosure",
  "textEditor",
  "pageControl",
  "gauge",
  "menu",
  "actionSheet",
  "emptyState",
  "link",
  "labeledContent",
  "secureField",
  "sectionFooter",
  "tip",
  "photosPicker",
  "signInWithApple",
  "applePayButton",
  "videoPlayer",
  "photoGrid",
  "tabAccessory",
  "subscriptionStore",
  "barChart",
  "lineChart",
  "areaChart",
  "pieChart",
  "scatterChart",
  "stackedBarChart",
  "heatmapChart",
] as const;
export type IosKind = (typeof IOS_KINDS)[number];
export const isIosKind = (k: string): k is IosKind => (IOS_KINDS as readonly string[]).includes(k);
export const IOS_CHART_KINDS: readonly IosKind[] = ["barChart", "lineChart", "areaChart", "pieChart", "scatterChart", "stackedBarChart", "heatmapChart"];

/** content width inside the phone margins (CONTENT_W in tokens.ts) */
const W = 380;
const WIDTH = { min: 200, max: 412, step: 4, icon: "width" };

const spec = (s: Partial<KindSpec> & Pick<KindSpec, "label" | "noun" | "category" | "paletteIcon" | "h">): KindSpec => ({
  w: W,
  radius: 10,
  hasVariant: false,
  hasLabel: true,
  hasSupporting: false,
  hasIcon: false,
  defLabel: "",
  defIcon: null,
  ...s,
});

export const IOS_KIND_SPEC: Record<IosKind, KindSpec> = {
  sectionHeader: spec({ label: "Section header", noun: "セクション見出し", category: "ios", paletteIcon: "title", h: 32, radius: 0, size: WIDTH, defSize: W }),
  stepper: spec({ label: "Stepper", noun: "ステッパー", category: "ios", paletteIcon: "exposure_plus_1", h: 44, hasValue: true, size: WIDTH, defSize: W }),
  wheelPicker: spec({ label: "Wheel picker", noun: "ホイールピッカー", category: "ios", paletteIcon: "view_day", h: 180, radius: 12, hasTabs: true, size: WIDTH, defSize: W }),
  colorPicker: spec({ label: "Color picker", noun: "カラーピッカー", category: "ios", paletteIcon: "palette", h: 44, size: WIDTH, defSize: W }),
  disclosure: spec({ label: "Disclosure group", noun: "折りたたみ項目", category: "ios", paletteIcon: "expand_circle_down", h: 44, hasSupporting: true, hasChecked: true, defSupporting: "", size: WIDTH, defSize: W }),
  textEditor: spec({ label: "Text editor", noun: "テキストエディタ", category: "ios", paletteIcon: "notes", h: 140, size: WIDTH, defSize: W }),
  pageControl: spec({ label: "Page control", noun: "ページコントロール", category: "ios", paletteIcon: "more_horiz", w: 160, h: 28, radius: 14, hasLabel: false, hasTabs: true }),
  gauge: spec({ label: "Gauge", noun: "ゲージ", category: "ios", paletteIcon: "speed", w: 88, h: 96, radius: 0, hasValue: true }),
  menu: spec({ label: "Menu", noun: "メニュー", category: "ios", paletteIcon: "menu_open", w: 250, h: 144, radius: 22, hasTabs: true }),
  actionSheet: spec({ label: "Action sheet", noun: "アクションシート", category: "ios", paletteIcon: "list_alt", h: 248, radius: 22, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  emptyState: spec({ label: "Empty state", noun: "空の状態", category: "ios", paletteIcon: "inbox", h: 220, radius: 0, hasSupporting: true, hasIcon: true, defSupporting: "", defIcon: "sf:tray", size: WIDTH, defSize: W }),
  link: spec({ label: "Link", noun: "リンク", category: "ios", paletteIcon: "link", h: 44, size: WIDTH, defSize: W }),
  labeledContent: spec({ label: "Labeled value", noun: "項目と値", category: "ios", paletteIcon: "short_text", h: 44, hasSupporting: true, defSupporting: "", size: WIDTH, defSize: W }),
  secureField: spec({ label: "Secure field", noun: "パスワード入力欄", category: "ios", paletteIcon: "password", h: 44, size: WIDTH, defSize: W }),
  sectionFooter: spec({ label: "Section footer", noun: "セクション補足", category: "ios", paletteIcon: "subject", h: 40, radius: 0, size: WIDTH, defSize: W }),
  tip: spec({ label: "Tip", noun: "ヒント", category: "ios", paletteIcon: "tips_and_updates", h: 96, radius: 16, hasSupporting: true, hasIcon: true, defSupporting: "", defIcon: "sf:lightbulb", size: WIDTH, defSize: W }),
  photosPicker: spec({ label: "Photos picker", noun: "写真ピッカー", category: "ios", paletteIcon: "add_photo_alternate", w: 220, h: 44, radius: 22, hasIcon: true, defIcon: "sf:photo.on.rectangle" }),
  signInWithApple: spec({ label: "Sign in with Apple", noun: "Appleでサインイン", category: "ios", paletteIcon: "login", h: 50, radius: 12, size: WIDTH, defSize: W }),
  applePayButton: spec({ label: "Apple Pay button", noun: "Apple Pay ボタン", category: "ios", paletteIcon: "contactless", h: 50, radius: 12, size: WIDTH, defSize: W }),
  videoPlayer: spec({ label: "Video player", noun: "動画プレーヤー", category: "ios", paletteIcon: "smart_display", h: 214, radius: 20, hasLabel: false, size: WIDTH, defSize: W }),
  photoGrid: spec({ label: "Photo grid", noun: "写真グリッド", category: "ios", paletteIcon: "grid_on", h: 254, radius: 0, hasLabel: false, size: WIDTH, defSize: W, size2: { min: 84, max: 892, step: 4, icon: "height" } }),
  tabAccessory: spec({ label: "Tab bar accessory", noun: "タブバーのアクセサリ", category: "ios", paletteIcon: "queue_music", h: 56, radius: 28, hasSupporting: true, hasIcon: true, defSupporting: "", defIcon: "sf:music.note", size: WIDTH, defSize: W }),
  subscriptionStore: spec({ label: "Subscription store", noun: "サブスクリプション画面", category: "ios", paletteIcon: "workspace_premium", h: 320, radius: 22, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  scatterChart: spec({ label: "Scatter chart", noun: "散布図", category: "charts", paletteIcon: "scatter_plot", h: 240, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  stackedBarChart: spec({ label: "Stacked bar chart", noun: "積み上げ棒グラフ", category: "charts", paletteIcon: "stacked_bar_chart", h: 240, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  heatmapChart: spec({ label: "Heatmap", noun: "ヒートマップ", category: "charts", paletteIcon: "grid_view", h: 220, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  barChart: spec({ label: "Bar chart", noun: "棒グラフ", category: "charts", paletteIcon: "bar_chart", h: 240, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  lineChart: spec({ label: "Line chart", noun: "折れ線グラフ", category: "charts", paletteIcon: "show_chart", h: 240, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  areaChart: spec({ label: "Area chart", noun: "面グラフ", category: "charts", paletteIcon: "area_chart", h: 240, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
  pieChart: spec({ label: "Donut chart", noun: "ドーナツグラフ", category: "charts", paletteIcon: "donut_large", h: 260, radius: 16, hasSupporting: true, hasTabs: true, defSupporting: "", size: WIDTH, defSize: W }),
};

/** how many entries each one may carry */
export const IOS_ENTRY_BOUNDS: Partial<Record<IosKind, { min: number; max: number }>> = {
  wheelPicker: { min: 2, max: 12 },
  pageControl: { min: 2, max: 10 },
  menu: { min: 1, max: 8 },
  actionSheet: { min: 1, max: 5 },
  barChart: { min: 2, max: 12 },
  lineChart: { min: 2, max: 12 },
  areaChart: { min: 2, max: 12 },
  pieChart: { min: 2, max: 8 },
  subscriptionStore: { min: 1, max: 4 },
  scatterChart: { min: 1, max: 4 },
  stackedBarChart: { min: 2, max: 12 },
  heatmapChart: { min: 3, max: 12 },
};

type KindText = { noun: string; label?: string; supporting?: string };

export const IOS_KIND_TEXT: Record<Lang, Record<IosKind, KindText>> = {
  ja: {
    sectionHeader: { noun: "セクション見出し", label: "一般" },
    stepper: { noun: "ステッパー", label: "数量" },
    wheelPicker: { noun: "ホイールピッカー", label: "時間（分）" },
    colorPicker: { noun: "カラーピッカー", label: "テーマカラー" },
    disclosure: { noun: "折りたたみ項目", label: "詳細設定", supporting: "通知、プライバシー" },
    textEditor: { noun: "テキストエディタ", label: "メモ" },
    pageControl: { noun: "ページコントロール" },
    gauge: { noun: "ゲージ", label: "バッテリー" },
    menu: { noun: "メニュー", label: "並べ替え" },
    actionSheet: { noun: "アクションシート", label: "このメモを削除しますか？", supporting: "この操作は取り消せません。" },
    emptyState: { noun: "空の状態", label: "メモがありません", supporting: "右上の＋から新しいメモを作成できます。" },
    link: { noun: "リンク", label: "プライバシーポリシー" },
    labeledContent: { noun: "項目と値", label: "バージョン", supporting: "2.4.1" },
    secureField: { noun: "パスワード入力欄", label: "パスワード" },
    sectionFooter: { noun: "セクション補足", label: "オンにすると、ほかのデバイスとメモが同期されます。" },
    tip: { noun: "ヒント", label: "お気に入りに追加", supporting: "ハートをタップすると、あとで見つけやすくなります。" },
    photosPicker: { noun: "写真ピッカー", label: "写真を選択" },
    signInWithApple: { noun: "Appleでサインインボタン", label: "Appleでサインイン" },
    applePayButton: { noun: "Apple Pay ボタン", label: "Apple Payで購入" },
    videoPlayer: { noun: "動画プレーヤー" },
    photoGrid: { noun: "写真グリッド" },
    tabAccessory: { noun: "タブバーのアクセサリ", label: "再生中の曲", supporting: "アーティスト" },
    subscriptionStore: { noun: "サブスクリプション画面", label: "プレミアム", supporting: "すべての機能を使えます" },
    scatterChart: { noun: "散布図", label: "歩数と睡眠", supporting: "過去 30 日" },
    stackedBarChart: { noun: "積み上げ棒グラフ", label: "スクリーンタイム", supporting: "過去 7 日" },
    heatmapChart: { noun: "ヒートマップ", label: "アクティビティ", supporting: "過去 5 週" },
    barChart: { noun: "棒グラフ", label: "歩数", supporting: "過去 7 日" },
    lineChart: { noun: "折れ線グラフ", label: "体重", supporting: "過去 7 日" },
    areaChart: { noun: "面グラフ", label: "睡眠", supporting: "過去 7 日" },
    pieChart: { noun: "ドーナツグラフ", label: "今月の支出" },
  },
  en: {
    sectionHeader: { noun: "section header", label: "General" },
    stepper: { noun: "stepper", label: "Quantity" },
    wheelPicker: { noun: "wheel picker", label: "Minutes" },
    colorPicker: { noun: "color picker", label: "Accent color" },
    disclosure: { noun: "disclosure group", label: "Advanced", supporting: "Notifications, Privacy" },
    textEditor: { noun: "text editor", label: "Notes" },
    pageControl: { noun: "page control" },
    gauge: { noun: "gauge", label: "Battery" },
    menu: { noun: "menu", label: "Sort" },
    actionSheet: { noun: "action sheet", label: "Delete this note?", supporting: "This can't be undone." },
    emptyState: { noun: "empty state", label: "No Notes", supporting: "Tap + to create your first note." },
    link: { noun: "link", label: "Privacy Policy" },
    labeledContent: { noun: "labeled value", label: "Version", supporting: "2.4.1" },
    secureField: { noun: "secure field", label: "Password" },
    sectionFooter: { noun: "section footer", label: "When this is on, your notes sync across your devices." },
    tip: { noun: "tip", label: "Add to Favorites", supporting: "Tap the heart to find it again later." },
    photosPicker: { noun: "photos picker", label: "Select Photos" },
    signInWithApple: { noun: "Sign in with Apple button", label: "Sign in with Apple" },
    applePayButton: { noun: "Apple Pay button", label: "Buy with Apple Pay" },
    videoPlayer: { noun: "video player" },
    photoGrid: { noun: "photo grid" },
    tabAccessory: { noun: "tab bar accessory", label: "Now Playing", supporting: "Artist" },
    subscriptionStore: { noun: "subscription store", label: "Premium", supporting: "Unlock every feature" },
    scatterChart: { noun: "scatter chart", label: "Steps vs. Sleep", supporting: "Last 30 days" },
    stackedBarChart: { noun: "stacked bar chart", label: "Screen Time", supporting: "Last 7 days" },
    heatmapChart: { noun: "heatmap", label: "Activity", supporting: "Last 5 weeks" },
    barChart: { noun: "bar chart", label: "Steps", supporting: "Last 7 days" },
    lineChart: { noun: "line chart", label: "Weight", supporting: "Last 7 days" },
    areaChart: { noun: "area chart", label: "Sleep", supporting: "Last 7 days" },
    pieChart: { noun: "donut chart", label: "Spending this month" },
  },
  zh: {
    sectionHeader: { noun: "分组标题", label: "通用" },
    stepper: { noun: "步进器", label: "数量" },
    wheelPicker: { noun: "滚轮选择器", label: "时长（分钟）" },
    colorPicker: { noun: "颜色选择器", label: "主题色" },
    disclosure: { noun: "折叠组", label: "高级设置", supporting: "通知、隐私" },
    textEditor: { noun: "多行文本框", label: "备注" },
    pageControl: { noun: "页面指示器" },
    gauge: { noun: "仪表", label: "电量" },
    menu: { noun: "下拉菜单", label: "排序" },
    actionSheet: { noun: "操作表", label: "删除这条备注？", supporting: "此操作无法撤销。" },
    emptyState: { noun: "空状态", label: "还没有备注", supporting: "点按右上角的 + 新建备注。" },
    link: { noun: "链接", label: "隐私政策" },
    labeledContent: { noun: "键值行", label: "版本", supporting: "2.4.1" },
    secureField: { noun: "密码框", label: "密码" },
    sectionFooter: { noun: "分组说明", label: "打开后，备注会在你的设备间同步。" },
    tip: { noun: "提示卡片", label: "添加到收藏", supporting: "点按爱心，之后更容易找到。" },
    photosPicker: { noun: "照片选择器", label: "选择照片" },
    signInWithApple: { noun: "通过 Apple 登录按钮", label: "通过 Apple 登录" },
    applePayButton: { noun: "Apple Pay 按钮", label: "使用 Apple Pay 购买" },
    videoPlayer: { noun: "视频播放器" },
    photoGrid: { noun: "照片网格" },
    tabAccessory: { noun: "标签栏附件", label: "正在播放", supporting: "艺人" },
    subscriptionStore: { noun: "订阅页", label: "高级会员", supporting: "解锁全部功能" },
    scatterChart: { noun: "散点图", label: "步数与睡眠", supporting: "最近 30 天" },
    stackedBarChart: { noun: "堆叠柱状图", label: "屏幕使用时间", supporting: "最近 7 天" },
    heatmapChart: { noun: "热力图", label: "活动", supporting: "最近 5 周" },
    barChart: { noun: "柱状图", label: "步数", supporting: "最近 7 天" },
    lineChart: { noun: "折线图", label: "体重", supporting: "最近 7 天" },
    areaChart: { noun: "面积图", label: "睡眠", supporting: "最近 7 天" },
    pieChart: { noun: "环形图", label: "本月支出" },
  },
  ko: {
    sectionHeader: { noun: "섹션 제목", label: "일반" },
    stepper: { noun: "스테퍼", label: "수량" },
    wheelPicker: { noun: "휠 피커", label: "시간(분)" },
    colorPicker: { noun: "색상 선택기", label: "강조 색상" },
    disclosure: { noun: "펼침 그룹", label: "고급 설정", supporting: "알림, 개인정보" },
    textEditor: { noun: "텍스트 편집기", label: "메모" },
    pageControl: { noun: "페이지 컨트롤" },
    gauge: { noun: "게이지", label: "배터리" },
    menu: { noun: "메뉴", label: "정렬" },
    actionSheet: { noun: "액션 시트", label: "이 메모를 삭제할까요?", supporting: "이 작업은 되돌릴 수 없습니다." },
    emptyState: { noun: "빈 상태", label: "메모 없음", supporting: "오른쪽 위 +를 눌러 새 메모를 만드세요." },
    link: { noun: "링크", label: "개인정보 처리방침" },
    labeledContent: { noun: "레이블과 값", label: "버전", supporting: "2.4.1" },
    secureField: { noun: "비밀번호 입력란", label: "비밀번호" },
    sectionFooter: { noun: "섹션 설명", label: "켜면 메모가 기기 간에 동기화됩니다." },
    tip: { noun: "팁", label: "즐겨찾기에 추가", supporting: "하트를 탭하면 나중에 쉽게 찾을 수 있습니다." },
    photosPicker: { noun: "사진 선택기", label: "사진 선택" },
    signInWithApple: { noun: "Apple로 로그인 버튼", label: "Apple로 로그인" },
    applePayButton: { noun: "Apple Pay 버튼", label: "Apple Pay로 구입" },
    videoPlayer: { noun: "비디오 플레이어" },
    photoGrid: { noun: "사진 그리드" },
    tabAccessory: { noun: "탭 바 액세서리", label: "재생 중", supporting: "아티스트" },
    subscriptionStore: { noun: "구독 화면", label: "프리미엄", supporting: "모든 기능 사용" },
    scatterChart: { noun: "산점도", label: "걸음 수와 수면", supporting: "최근 30일" },
    stackedBarChart: { noun: "누적 막대 차트", label: "스크린 타임", supporting: "최근 7일" },
    heatmapChart: { noun: "히트맵", label: "활동", supporting: "최근 5주" },
    barChart: { noun: "막대 차트", label: "걸음 수", supporting: "최근 7일" },
    lineChart: { noun: "꺾은선 차트", label: "체중", supporting: "최근 7일" },
    areaChart: { noun: "영역 차트", label: "수면", supporting: "최근 7일" },
    pieChart: { noun: "도넛 차트", label: "이번 달 지출" },
  },
};

const WEEK: Record<Lang, string[]> = {
  ja: ["月", "火", "水", "木", "金", "土", "日"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  zh: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  ko: ["월", "화", "수", "목", "금", "토", "일"],
};
const SLICES: Record<Lang, string[]> = {
  ja: ["食費", "交通", "住居", "その他"],
  en: ["Food", "Transport", "Home", "Other"],
  zh: ["餐饮", "交通", "住房", "其他"],
  ko: ["식비", "교통", "주거", "기타"],
};
const MENU_ITEMS: Record<Lang, string[]> = {
  ja: ["日付", "名前", "サイズ"],
  en: ["Date", "Name", "Size"],
  zh: ["日期", "名称", "大小"],
  ko: ["날짜", "이름", "크기"],
};
const MENU_ICONS = ["sf:calendar", "sf:textformat", "sf:arrow.up.arrow.down"];
const PLANS: Record<Lang, string[]> = {
  ja: ["月額プラン", "年額プラン"],
  en: ["Monthly", "Yearly"],
  zh: ["按月订阅", "按年订阅"],
  ko: ["월간 플랜", "연간 플랜"],
};
const SERIES: Record<Lang, string[]> = {
  ja: ["今年", "昨年"],
  en: ["This year", "Last year"],
  zh: ["今年", "去年"],
  ko: ["올해", "작년"],
};
const ACTIONS: Record<Lang, string[]> = {
  ja: ["削除", "アーカイブ"],
  en: ["Delete", "Archive"],
  zh: ["删除", "归档"],
  ko: ["삭제", "보관"],
};

const plain = (labels: string[]): NavTab[] => labels.map((label) => ({ icon: "", label }));

/** the entries a new part of an iOS kind starts with; null for every other kind */
export function iosDefaultTabs(kind: string, lang: Lang): NavTab[] | null {
  switch (kind) {
    case "wheelPicker":
      return plain(["5", "10", "15", "30", "60"]);
    case "pageControl":
      return plain(["1", "2", "3", "4"]);
    case "menu":
      return MENU_ITEMS[lang].map((label, i) => ({ icon: MENU_ICONS[i] ?? "", label }));
    case "actionSheet":
      return plain(ACTIONS[lang]);
    case "barChart":
    case "lineChart":
    case "areaChart":
      return plain(WEEK[lang]);
    case "pieChart":
      return plain(SLICES[lang]);
    case "subscriptionStore":
      return plain(PLANS[lang]);
    case "scatterChart":
      return plain(SERIES[lang]);
    case "stackedBarChart":
    case "heatmapChart":
      return plain(WEEK[lang]);
    default:
      return null;
  }
}

/** fills in what makeItem cannot know about an iOS kind */
export function applyIosDefaults(it: Item, lang: Lang): void {
  if (!isIosKind(it.kind)) return;
  const tabs = iosDefaultTabs(it.kind, lang);
  if (tabs) it.tabs = tabs;
  if (it.kind === "gauge") it.value = 72;
  if (it.kind === "stepper") it.value = 1;
  if (it.kind === "wheelPicker") it.selected = 2;
  if (it.kind === "pageControl") it.selected = 0;
}

/** the box of an iOS kind; null for every other kind. `n` is the width sizeOf worked out. */
export function iosSizeOf(it: Item, n: number, h: number): { w: number; h: number } | null {
  if (!isIosKind(it.kind)) return null;
  const s = IOS_KIND_SPEC[it.kind];
  const entries = it.tabs?.length ?? 0;
  switch (it.kind) {
    case "menu":
      return { w: s.w, h: 12 + entries * 44 };
    case "actionSheet":
      /* the title and message, one row per action, the gap and Cancel */
      return { w: n, h: 136 + entries * 56 };
    case "subscriptionStore":
      /* the title and subtitle, one row per plan, the button and the restore link */
      return { w: n, h: 200 + entries * 60 };
    case "videoPlayer":
      return { w: n, h: Math.round((n * 9) / 16) };
    case "photoGrid":
      return { w: n, h: it.size2 ?? h };
    case "gauge":
    case "pageControl":
    case "photosPicker":
      return { w: s.w, h };
    default:
      return { w: n, h };
  }
}
