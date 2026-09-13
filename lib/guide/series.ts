/**
 * 电子书系列注册表（server/client 共用，纯常量）
 *
 * 加一本新书 = 在这里注册一行 + seed config/chapters。
 * 控制书架展示顺序、图标、兜底文案（config 缺失时的 fallback）。
 */

export interface GuideSeriesMeta {
  /** 系列 key = GuideSeriesConfig.id = 路由段 = localStorage 前缀 */
  key: string
  /** 书架/卡片图标（lucide 组件名，展示层映射） */
  icon: string
  /** config 缺失时的兜底书名 */
  fallbackTitle: string
  fallbackSubtitle: string
  /** 各书默认篇结构（config.groups 缺失/脏数据时兜底） */
  fallbackGroups: Array<{
    key: string
    label: string
    hint: string
    icon: string
    order: number
  }>
}

export const GUIDE_SERIES: GuideSeriesMeta[] = [
  {
    key: "agent-guide",
    icon: "Compass",
    fallbackTitle: "Agent 认知地图",
    fallbackSubtitle:
      "转岗 Agent 前的认知速览：一张地图、一叠术语卡、一点原理直觉、一份岗位图景。",
    fallbackGroups: [
      { key: "map", label: "全景地图", hint: "3 分钟知道 Agent 世界长什么样", icon: "Map", order: 1 },
      { key: "terms", label: "术语速查", hint: "卡片式，一词一卡", icon: "Layers", order: 2 },
      { key: "principles", label: "原理直觉", hint: "图解，不讲数学", icon: "Lightbulb", order: 3 },
      { key: "industry", label: "岗位与生态", hint: "国内真实图景", icon: "Briefcase", order: 4 },
      { key: "action", label: "行动路线", hint: "转岗怎么做", icon: "Rocket", order: 5 },
    ],
  },
  {
    key: "agent-stack",
    icon: "Layers",
    fallbackTitle: "Agent 实战：从 Dify 到 LangGraph",
    fallbackSubtitle:
      "平台起步，代码深入——Dify · LangChain · LangGraph，全程长在真实项目上。",
    fallbackGroups: [
      { key: "overview", label: "全局观", hint: "看懂地图 + 打好地基", icon: "Compass", order: 1 },
      { key: "dify", label: "Dify 篇", hint: "平台层 · 可视化建立全局流程", icon: "Blocks", order: 2 },
      { key: "langchain", label: "LangChain 篇", hint: "框架层 · 基础件 + MCP 标准", icon: "Link2", order: 3 },
      { key: "langgraph", label: "LangGraph 篇", hint: "编排层 · 图状态与多 Agent", icon: "Workflow", order: 4 },
      { key: "engineering", label: "工程化篇", hint: "落地 · RAG 深水区 / 观测 / 求职", icon: "Hammer", order: 5 },
    ],
  },
]

/** 校验系列 key 是否已注册 */
export function isRegisteredSeries(key: string): boolean {
  return GUIDE_SERIES.some((s) => s.key === key)
}

/** 取系列注册信息（未注册返回 null） */
export function getSeriesMeta(key: string): GuideSeriesMeta | null {
  return GUIDE_SERIES.find((s) => s.key === key) ?? null
}
