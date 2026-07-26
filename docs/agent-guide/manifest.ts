/**
 * Agent 开发指南 · 章节元信息
 *
 * 这里是章节顺序、标题、描述的唯一真相。
 * 新增章节只需：1) 加一条记录  2) 在同目录创建对应 md 文件
 *
 * 分组逻辑：用 `group` 字段把章节归到 5 个学习阶段，
 * 这样 sidebar 显示"大类 → 章节"两层，不会出现分组标题与章节标题重复。
 */

export type Difficulty = "入门" | "进阶" | "实战"

export type ChapterGroup = "intro" | "foundation" | "core" | "system" | "appendix"

export interface GroupMeta {
  /** 用于 sidebar 分组标题与总览页大标题 */
  label: string
  /** 一句话说明该阶段定位 */
  hint: string
}

/** 五大学习阶段的元信息（顺序就是显示顺序） */
export const GROUPS: Record<ChapterGroup, GroupMeta> = {
  intro: { label: "起步", hint: "搭建认知地基，知道接下来要学什么" },
  foundation: { label: "基础", hint: "动手前的工具与思维准备" },
  core: { label: "核心能力", hint: "Agent 开发的三大支柱：工具调用 / Prompt / RAG" },
  system: { label: "系统化", hint: "从单次调用到自主系统，再到工程上线" },
  appendix: { label: "参考", hint: "速查与延伸阅读" },
}

/** sidebar / 总览页使用的"分组顺序" */
export const GROUP_ORDER: ChapterGroup[] = [
  "intro",
  "foundation",
  "core",
  "system",
  "appendix",
]

export interface ChapterMeta {
  /** URL slug，对应 docs/agent-guide/${slug}.md 文件名 */
  slug: string
  /** 章节标题（不含 Phase 前缀重复信息，由 sidebar 自动展示） */
  title: string
  /** 所属学习阶段，用于 sidebar 分组 */
  group: ChapterGroup
  /** 难度徽章 */
  difficulty: Difficulty
  /** 一句话描述，用于 sidebar tooltip 与总览页 */
  description: string
  /** 预计阅读时长（分钟） */
  readingTime?: number
  /** 标记为"即将上线"，sidebar 灰显不可点 */
  comingSoon?: boolean
}

export const chapters: ChapterMeta[] = [
  // ─── 起步 ────────────────────────────────────────────
  {
    slug: "intro",
    title: "这份指南怎么读",
    group: "intro",
    difficulty: "入门",
    description: "阅读路线建议、适用人群、配套资源",
    readingTime: 5,
  },
  {
    slug: "phase-0-terminology",
    title: "Phase 0 · 术语地基",
    group: "intro",
    difficulty: "入门",
    description: "11 个核心术语的严格定义 + 前端类比",
    readingTime: 25,
  },

  // ─── 基础 ────────────────────────────────────────────
  {
    slug: "phase-1-mindset",
    title: "Phase 1 · 心智模型迁移",
    group: "foundation",
    difficulty: "入门",
    description: "为什么 LLM 是概率函数、为什么 Prompt 不是咒语",
    readingTime: 20,
  },
  {
    slug: "phase-2-python",
    title: "Phase 2 · Python 速通",
    group: "foundation",
    difficulty: "入门",
    description: "前端工程师版：TS → Python 速查 + uv 生态",
    readingTime: 30,
  },
  {
    slug: "phase-3-first-agent",
    title: "Phase 3 · 接入 Qwen 跑通第一个调用",
    group: "foundation",
    difficulty: "入门",
    description: "阿里云百炼 API Key、OpenAI 兼容协议、流式响应",
    comingSoon: true,
  },

  // ─── 核心能力 ────────────────────────────────────────
  {
    slug: "phase-4-tool-use",
    title: "Phase 4 · 工具调用四层栈",
    group: "core",
    difficulty: "进阶",
    description: "Function Calling / Skill / MCP / A2A 决策树",
    comingSoon: true,
  },
  {
    slug: "phase-5-prompt-engineering",
    title: "Phase 5 · Prompt 工程",
    group: "core",
    difficulty: "进阶",
    description: "接口设计思维、三种范式、Promptfoo 评测",
    comingSoon: true,
  },
  {
    slug: "phase-6-rag",
    title: "Phase 6 · RAG 与企业知识库",
    group: "core",
    difficulty: "进阶",
    description: "切块/Rerank/混合检索、阿里云向量数据库选型",
    comingSoon: true,
  },

  // ─── 系统化 ──────────────────────────────────────────
  {
    slug: "phase-7-frameworks",
    title: "Phase 7 · Agent 框架与编排",
    group: "system",
    difficulty: "实战",
    description: "LangChain、ReAct、Memory、多 Agent 协作",
    comingSoon: true,
  },
  {
    slug: "phase-8-engineering",
    title: "Phase 8 · 工程化上线",
    group: "system",
    difficulty: "实战",
    description: "阿里云 ECS 部署、Promptfoo、Langfuse、合规备案",
    comingSoon: true,
  },

  // ─── 参考 ────────────────────────────────────────────
  {
    slug: "appendix-glossary",
    title: "完整术语表",
    group: "appendix",
    difficulty: "入门",
    description: "按字母排序的可搜索术语速查",
    comingSoon: true,
  },
]

/** 根据 slug 获取章节，找不到返回 undefined */
export function getChapter(slug: string): ChapterMeta | undefined {
  return chapters.find((c) => c.slug === slug)
}

/** 获取所有非 comingSoon 的章节 slug（用于 generateStaticParams） */
export function getPublishedSlugs(): string[] {
  return chapters.filter((c) => !c.comingSoon).map((c) => c.slug)
}

/**
 * 按 group 分组（替代原来的 phase 分组）。
 * 用于 sidebar 与总览页，避免分组标题与章节标题重复。
 */
export function getChaptersGrouped(): Array<{
  group: ChapterGroup
  label: string
  hint: string
  items: ChapterMeta[]
}> {
  return GROUP_ORDER.map((g) => ({
    group: g,
    label: GROUPS[g].label,
    hint: GROUPS[g].hint,
    items: chapters.filter((c) => c.group === g),
  })).filter((g) => g.items.length > 0)
}
