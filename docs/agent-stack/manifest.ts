/**
 * Agent 实战（agent-stack）· 章节元信息
 *
 * 这里是章节顺序、标题、描述的唯一真相（docs_memo/0901 决策三）。
 * 新增/更新章节：1) 改这里的记录  2) 在同目录创建/更新对应 md 文件
 * 3) pnpm db:seed:guide → 部署。
 *
 * comingSoon=true 表示正文未写（目录先全放出来，写完翻成 false）。
 */

export type Difficulty = "入门" | "进阶" | "实战"

export type ChapterGroup =
  | "overview"
  | "dify"
  | "langchain"
  | "langgraph"
  | "engineering"

export interface GroupMeta {
  label: string
  hint: string
}

/** 五篇（顺序就是显示顺序） */
export const GROUPS: Record<ChapterGroup, GroupMeta> = {
  overview: { label: "全局观", hint: "看懂地图 + 打好地基" },
  dify: { label: "Dify 篇", hint: "平台层 · 可视化建立全局流程" },
  langchain: { label: "LangChain 篇", hint: "框架层 · 基础件 + MCP 标准" },
  langgraph: { label: "LangGraph 篇", hint: "编排层 · 图状态与多 Agent" },
  engineering: { label: "工程化篇", hint: "落地 · RAG 深水区 / 观测 / 求职" },
}

export const GROUP_ORDER: ChapterGroup[] = [
  "overview",
  "dify",
  "langchain",
  "langgraph",
  "engineering",
]

export interface ChapterMeta {
  /** URL slug，对应 docs/agent-stack/${slug}.md 文件名 */
  slug: string
  title: string
  group: ChapterGroup
  difficulty: Difficulty
  description: string
  readingTime?: number
  /** 正文未写时为 true（目录展示但标注建设中），写完置 false */
  comingSoon?: boolean
}

export const chapters: ChapterMeta[] = [
  // ── 全局观 ──
  {
    slug: "stack-map",
    title: "一张图看懂 Agent 技术栈",
    group: "overview",
    difficulty: "入门",
    description:
      "从裸调 API 到多 Agent 系统：平台 / 框架 / 编排三层定位，LangChain · LlamaIndex · Dify · Coze · CrewAI 全景选型，Agent 岗 JD 到底在考什么。",
    readingTime: 15,
    comingSoon: true,
  },
  {
    slug: "llm-basics",
    title: "前置地基：LLM API 与 Prompt 基础",
    group: "overview",
    difficulty: "入门",
    description:
      "实战锚点 · cooking-app：chat completions、流式、原生 Function Calling 的 JSON 形态；system/user 角色、结构化输出、few-shot——Dify 帮你藏起来的那层。",
    readingTime: 20,
    comingSoon: true,
  },
  // ── Dify 篇 ──
  {
    slug: "dify-quickstart",
    title: "20 分钟跑通第一个应用",
    group: "dify",
    difficulty: "入门",
    description:
      "DeepSeek 接入、聊天助手、Prompt 编排——上班摸鱼零安装直接试（云服务版）。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "dify-rag",
    title: "知识库与 RAG：喂进你的商品 FAQ",
    group: "dify",
    difficulty: "入门",
    description:
      "实战锚点 · hakka-ecommerce：把客家电商的商品资料做成知识库，理解分段、索引与召回。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "dify-workflow",
    title: "工作流编排：节点、条件与变量",
    group: "dify",
    difficulty: "进阶",
    description: "从单次对话到多步骤流程：节点连线、条件分支、变量传递、迭代节点。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "dify-cooking-app",
    title: "实战：用 Dify 复刻烹饪助手",
    group: "dify",
    difficulty: "实战",
    description:
      "实战锚点 · cooking-app：用 Dify 重做一遍烹饪问答，并回答关键问题——什么时候必须离开平台写代码。",
    readingTime: 25,
    comingSoon: true,
  },
  // ── LangChain 篇 ──
  {
    slug: "lc-foundation",
    title: "LangChain.js 第一步：模型 IO 与流式",
    group: "langchain",
    difficulty: "入门",
    description:
      "实战锚点 · cooking-app：对照裸 OpenAI SDK 代码，理解 ChatModel、流式输出与结构化输出。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "lc-tools",
    title: "工具调用：从原生 FC 到框架 Tools",
    group: "langchain",
    difficulty: "进阶",
    description:
      "原生 Function Calling 的 JSON 细节 → LangChain 工具封装 → 错误处理与重试——Agent 的「手」。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "lc-mcp",
    title: "MCP 协议：工具接入的事实标准",
    group: "langchain",
    difficulty: "进阶",
    description:
      "2026 年 Agent 连接外部系统的事实标准（月下载近亿）：亲手写一个 MCP Server 并接入 Agent——面试新高频。",
    readingTime: 25,
    comingSoon: true,
  },
  {
    slug: "lc-memory",
    title: "记忆与多轮对话",
    group: "langchain",
    difficulty: "进阶",
    description: "从无状态到短期 / 长期记忆，多轮对话的状态管理。",
    readingTime: 15,
    comingSoon: true,
  },
  {
    slug: "lc-rag",
    title: "RAG 代码化：拆开 Dify 的黑盒",
    group: "langchain",
    difficulty: "进阶",
    description:
      "Embedding、向量库、检索链——用代码重做 Dify 知识库，理解平台替你做了什么。",
    readingTime: 25,
    comingSoon: true,
  },
  {
    slug: "lc-refactor",
    title: "实战：重构 cooking-app 的 AI 服务",
    group: "langchain",
    difficulty: "实战",
    description:
      "实战锚点 · cooking-app：把 ai.service.ts 从裸 SDK 重构成 LangChain.js（工具 + 记忆 + 结构化输出全套）。",
    readingTime: 30,
    comingSoon: true,
  },
  // ── LangGraph 篇 ──
  {
    slug: "lg-why-graph",
    title: "为什么需要 LangGraph",
    group: "langgraph",
    difficulty: "进阶",
    description: "LangChain AgentExecutor 的局限，StateGraph 心智模型。",
    readingTime: 15,
    comingSoon: true,
  },
  {
    slug: "lg-state-graph",
    title: "StateGraph 核心：状态、节点与路由",
    group: "langgraph",
    difficulty: "进阶",
    description: "节点 / 边 / 条件路由 / 状态设计——图编排的基本功。",
    readingTime: 25,
    comingSoon: true,
  },
  {
    slug: "lg-loops",
    title: "循环与 ReAct：用图重写 Agent 循环",
    group: "langgraph",
    difficulty: "实战",
    description: "循环、终止条件、ReAct 模式的图实现。",
    readingTime: 25,
    comingSoon: true,
  },
  {
    slug: "lg-hitl",
    title: "Human-in-the-loop 与检查点",
    group: "langgraph",
    difficulty: "实战",
    description: "中断 / 恢复 / 时间旅行——关键节点交还人类决策。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "lg-multi-agent",
    title: "多 Agent 协作：宠物日记工作流",
    group: "langgraph",
    difficulty: "实战",
    description:
      "实战锚点 · lovelyPet：supervisor 模式实战，给萌宠日记生成做多 Agent 编排。",
    readingTime: 30,
    comingSoon: true,
  },
  // ── 工程化篇 ──
  {
    slug: "eng-ts-vs-python",
    title: "TS 还是 Python：一次真实的技术决策",
    group: "engineering",
    difficulty: "实战",
    description:
      "实战锚点 · lovelyPet：Python Agent 服务废弃、AI 并入全栈 TS 的完整决策复盘——两条路线的真实权衡。",
    readingTime: 20,
    comingSoon: true,
  },
  {
    slug: "eng-rag-deep",
    title: "RAG 深水区：从能用到好用",
    group: "engineering",
    difficulty: "实战",
    description:
      "chunking 策略、混合检索、rerank、评测体系——JD 里最重的 RAG 落地经验，面试深水区。",
    readingTime: 30,
    comingSoon: true,
  },
  {
    slug: "eng-production",
    title: "部署、可观测与面试准备",
    group: "engineering",
    difficulty: "实战",
    description:
      "LangSmith / Langfuse tracing、成本控制、错误降级；微调与 RAG / Prompt 的边界；简历与面试怎么讲 Agent 项目。",
    readingTime: 20,
    comingSoon: true,
  },
]
