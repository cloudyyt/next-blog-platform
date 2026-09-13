/**
 * 《Agent 认知地图》· 章节元信息
 *
 * 这里是章节顺序、标题、描述的唯一真相。
 * 新增章节只需：1) 加一条记录  2) 在同目录创建对应 md 文件
 *
 * 本书 v2（2026-09 完全重做）：定位 = 转岗前的认知速览。
 * 风格铁律：每章 ≤ 8 分钟，图表/表格/卡片为主体，拒绝大段文字解说。
 * 旧版长文（术语地基/心智迁移/Python 速通等）已归档 _archive/。
 */

export type Difficulty = "入门" | "进阶" | "实战"

export type ChapterGroup = "map" | "terms" | "principles" | "industry" | "action"

export interface GroupMeta {
  label: string
  hint: string
}

export const GROUPS: Record<ChapterGroup, GroupMeta> = {
  map: { label: "全景地图", hint: "3 分钟知道 Agent 世界长什么样" },
  terms: { label: "术语速查", hint: "卡片式，一词一卡" },
  principles: { label: "原理直觉", hint: "图解，不讲数学" },
  industry: { label: "岗位与生态", hint: "国内真实图景" },
  action: { label: "行动路线", hint: "转岗怎么做" },
}

export const GROUP_ORDER: ChapterGroup[] = [
  "map",
  "terms",
  "principles",
  "industry",
  "action",
]

export interface ChapterMeta {
  slug: string
  title: string
  group: ChapterGroup
  difficulty: Difficulty
  description: string
  readingTime?: number
  comingSoon?: boolean
}

export const chapters: ChapterMeta[] = [
  // ─── 全景地图 ────────────────────────────────────────
  {
    slug: "world-map",
    title: "一张图看懂 Agent 世界",
    group: "map",
    difficulty: "入门",
    description: "平台 / 框架 / 编排 / 模型四层地图，所有名词各归其位",
    readingTime: 5,
  },

  // ─── 术语速查 ────────────────────────────────────────
  {
    slug: "terms-core",
    title: "核心术语卡：模型与对话",
    group: "terms",
    difficulty: "入门",
    description: "LLM / Token / 上下文 / Prompt / 温度 / 推理模型——一词一卡：定义、前端类比、误区",
    readingTime: 6,
  },
  {
    slug: "terms-agent",
    title: "核心术语卡：Agent 与 RAG",
    group: "terms",
    difficulty: "入门",
    description: "Function Calling / Agent / ReAct / Embedding / 向量数据库 / RAG / 微调 / MCP",
    readingTime: 6,
  },

  // ─── 原理直觉 ────────────────────────────────────────
  {
    slug: "llm-in-3min",
    title: "LLM 原理 3 分钟",
    group: "principles",
    difficulty: "入门",
    description: "token → 概率 → 续写，一张流程图 + 温度旋钮，幻觉为什么必然",
    readingTime: 4,
  },
  {
    slug: "context-bill",
    title: "上下文与账单",
    group: "principles",
    difficulty: "入门",
    description: "窗口是工作记忆不是硬盘；token 怎么算钱；为什么 RAG 的目标是「少塞准塞」",
    readingTime: 5,
  },

  // ─── 岗位与生态 ──────────────────────────────────────
  {
    slug: "job-map",
    title: "国内岗位地图",
    group: "industry",
    difficulty: "入门",
    description: "三条岗位线对比、日常工作时间分布、JD 真相表、面试考什么",
    readingTime: 7,
  },
  {
    slug: "eco-map",
    title: "生态一页纸",
    group: "industry",
    difficulty: "入门",
    description: "模型厂商 / 框架 / 平台 / 协议的坐标系，选型不再纠结",
    readingTime: 5,
  },

  // ─── 行动路线 ────────────────────────────────────────
  {
    slug: "roadmap-90d",
    title: "前端转岗 90 天路线",
    group: "action",
    difficulty: "入门",
    description: "能力对照表 + 三阶段计划 + 简历项目怎么讲——直接照着执行",
    readingTime: 6,
  },
]
