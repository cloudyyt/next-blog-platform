/**
 * 电子书（多系列）相关类型定义
 *
 * 多系列架构（见 docs_memo/0901）：
 * - series = 书 key（agent-guide / agent-stack / ...），注册表见 lib/guide/series.ts
 * - GroupKey 放开为 string：每本书自定义篇结构
 * - 所有前端展示的字段都对应一个 admin 配置入口（原则 2.3）
 */

// ─── 章节级（每章一份） ────────────────────────────

/** 篇 key（放开为 string，每本书自定义：如 intro|foundation 或 dify|langchain） */
export type GroupKey = string

/** 难度（3 个固定值） */
export type Difficulty = "入门" | "进阶" | "实战"

/** 单个章节（完整，章节页用） */
export interface GuideChapter {
  id: string
  series: string
  title: string
  slug: string
  content: string                  // markdown 正文
  description: string | null       // sidebar tooltip / 总览页副标题
  group: GroupKey
  difficulty: Difficulty
  order: number                    // 分组内排序权重
  readingTime: number | null       // 不填则由正文估算
  comingSoon: boolean
  published: boolean
  ogImage: string | null           // 章节独立 OG，默认 fallback 系列封面
  authorId: string
  author: { id: string; name: string | null }
  createdAt: string
  updatedAt: string
}

/** 创建/编辑时使用的 payload（不含 id/timestamps） */
export interface GuideChapterInput {
  title: string
  slug: string
  content: string
  description: string | null
  group: GroupKey
  difficulty: Difficulty
  order: number
  readingTime: number | null
  comingSoon: boolean
  published: boolean
  ogImage: string | null
}

// ─── 系列级（每本书一份，GuideSeriesConfig 多行） ────

/** 单个篇（分组）的元信息 */
export interface GuideGroupMeta {
  key: GroupKey
  label: string                    // 显示名（"起步"/"Dify 篇"...）
  hint: string                     // 一句话说明
  icon: string                     // lucide 图标名（"Compass" / "Layers" / ...）
  order: number                    // 显示顺序
}

/** 系列配置 */
export interface GuideSeriesConfig {
  title: string                    // "Agent 认知地图" / "Agent 实战：从 Dify 到 LangGraph"
  subtitle: string | null          // Hero / PostCard 副标题
  coverImage: string | null        // 系列封面 URL（首页 PostCard 用）
  badge: string                    // 默认 "连载中"
  cta: string | null               // 默认 "从 {firstChapter} 开始"
  valueCard1: string | null        // 价值卡片 1（目标读者）
  valueCard2: string | null        // 价值卡片 2（技术栈）
  // 价值卡片 3（已发布数）由系统自动计算，不存
  valueCard4: string | null        // 价值卡片 4（阅读时长）
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  groups: GuideGroupMeta[]         // 各书自定义篇结构
}

// ─── 默认值常量（UI fallback / mock 用） ───────────

export const DIFFICULTY_LABELS: Difficulty[] = ["入门", "进阶", "实战"]

/** 旧书（agent-guide）的 5 阶段兜底（config 缺失时用） */
export const DEFAULT_GROUP_KEY_ORDER: GroupKey[] = [
  "intro",
  "foundation",
  "core",
  "system",
  "appendix",
]

export const GROUP_ICON_OPTIONS: string[] = [
  "Compass",
  "Layers",
  "Sparkles",
  "BookOpen",
  "Code",
  "Wrench",
  "Rocket",
  "GraduationCap",
]

/** 新建章节时的默认 meta */
export const DEFAULT_CHAPTER_META: Omit<GuideChapterInput, "title" | "slug" | "content"> = {
  description: "",
  group: "intro",
  difficulty: "入门",
  order: 10,
  readingTime: null,
  comingSoon: false,
  published: false,
  ogImage: null,
}

// ─── 前端视图类型（DB → 前端的数据传输形状，server/client 共用） ──────

/** 章节摘要（上下章导航用） */
export interface GuideChapterSummary {
  slug: string
  title: string
}

/** sidebar 用的 slim 章节（不含正文/description，最小化传给 client） */
export interface SidebarChapter {
  slug: string
  title: string
  group: GroupKey
  difficulty: Difficulty
  readingTime: number | null
  comingSoon: boolean
}

/** 总览页用的章节（含 description） */
export interface OverviewChapter extends SidebarChapter {
  description: string | null
}

/** 分组（sidebar / 总览页通用，items 类型由泛型决定） */
export interface GuideGroupView<T> {
  key: GroupKey
  label: string
  hint: string
  icon: string
  order: number
  items: T[]
}

export type SidebarGroup = GuideGroupView<SidebarChapter>
export type OverviewGroup = GuideGroupView<OverviewChapter>

/** 首页/书架 GuideSeriesCard 用的数据（由 server 查 DB 后透传给 client 组件） */
export interface GuideHomeCardData {
  series: string                   // 系列 key（路由/进度前缀用）
  config: {
    title: string
    subtitle: string | null
    coverImage: string | null
    badge: string
    cta: string | null
  } | null
  publishedCount: number
  totalCount: number
  rangeLabel: string
}
