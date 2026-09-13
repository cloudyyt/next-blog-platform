"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Compass,
  Blocks,
  Link2,
  Workflow,
  Hammer,
  ChevronRight,
  ArrowDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 工具链路线图（新书 landing 的签名视觉）
 *
 * 5 篇 = 5 个站点：全局观 → Dify（平台层）→ LangChain（框架层）→
 * LangGraph（编排层）→ 工程化。桌面端横向 5 站，移动端纵向。
 * 每站可点击，锚点跳到对应分组章节列表。
 */

type StageStatus = "online" | "writing" | "planned"

const STAGES = [
  {
    key: "overview",
    icon: Compass,
    no: "01",
    name: "全局观",
    layer: "看懂地图",
    desc: "技术栈全景 + LLM API 地基",
    chapters: 2,
    status: "online" as StageStatus,
    accent: "text-sky-500 dark:text-sky-400",
    ring: "hover:border-sky-500/40",
  },
  {
    key: "dify",
    icon: Blocks,
    no: "02",
    name: "Dify",
    layer: "平台层",
    desc: "可视化建立全局流程",
    chapters: 4,
    status: "online" as StageStatus,
    accent: "text-amber-500 dark:text-amber-400",
    ring: "hover:border-amber-500/40",
  },
  {
    key: "langchain",
    icon: Link2,
    no: "03",
    name: "LangChain",
    layer: "框架层",
    desc: "基础件 + MCP 标准",
    chapters: 6,
    status: "writing" as StageStatus,
    accent: "text-emerald-500 dark:text-emerald-400",
    ring: "hover:border-emerald-500/40",
  },
  {
    key: "langgraph",
    icon: Workflow,
    no: "04",
    name: "LangGraph",
    layer: "编排层",
    desc: "图状态与多 Agent",
    chapters: 5,
    status: "planned" as StageStatus,
    accent: "text-violet-500 dark:text-violet-400",
    ring: "hover:border-violet-500/40",
  },
  {
    key: "engineering",
    icon: Hammer,
    no: "05",
    name: "工程化",
    layer: "落地",
    desc: "RAG 深水区 · 观测 · 求职",
    chapters: 3,
    status: "planned" as StageStatus,
    accent: "text-rose-500 dark:text-rose-400",
    ring: "hover:border-rose-500/40",
  },
] as const

const STATUS_BADGE: Record<StageStatus, { label: string; cls: string }> = {
  online: { label: "已上线", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  writing: { label: "写作中", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  planned: { label: "规划中", cls: "bg-muted text-muted-foreground/70" },
}

export function ToolchainMap() {
  return (
    <div>
      {/* 桌面：横向 5 站 */}
      <div className="hidden lg:grid grid-cols-5 gap-3">
        {STAGES.map((s, i) => {
          const Icon = s.icon
          const badge = STATUS_BADGE[s.status]
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="relative"
            >
              <a
                href={`#group-${s.key}`}
                className={cn(
                  "group flex flex-col h-full rounded-xl border border-border/60",
                  "bg-card/70 backdrop-blur-sm p-4 transition-all cursor-pointer",
                  s.ring,
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50", s.accent)}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/40">{s.no}</span>
                </div>
                <div className="text-sm font-bold font-display">{s.name}</div>
                <div className={cn("text-[11px] font-medium mt-0.5", s.accent)}>{s.layer}</div>
                <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed flex-1">
                  {s.desc}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {s.chapters} 章
                  </span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", badge.cls)}>
                    {badge.label}
                  </span>
                </div>
              </a>
              {/* 站间连接箭头 */}
              {i < STAGES.length - 1 && (
                <ChevronRight
                  className="absolute -right-[13px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 z-10 bg-background/80 rounded-full"
                  aria-hidden
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* 移动：纵向路线 */}
      <div className="lg:hidden relative">
        <span
          className="absolute left-[27px] top-4 bottom-4 w-px bg-border/50"
          aria-hidden
        />
        <div className="space-y-3">
          {STAGES.map((s, i) => {
            const Icon = s.icon
            const badge = STATUS_BADGE[s.status]
            return (
              <motion.a
                key={s.key}
                href={`#group-${s.key}`}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.25) }}
                className={cn(
                  "relative flex items-center gap-3.5 rounded-xl border border-border/60",
                  "bg-card/70 backdrop-blur-sm px-4 py-3 transition-all cursor-pointer",
                  s.ring,
                )}
              >
                <span className={cn("relative z-10 flex items-center justify-center w-11 h-11 rounded-full bg-background border border-border/60 shrink-0", s.accent)}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-display">{s.name}</span>
                    <span className={cn("text-[11px] font-medium", s.accent)}>{s.layer}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">
                    {s.desc} · {s.chapters} 章
                  </p>
                </div>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", badge.cls)}>
                  {badge.label}
                </span>
              </motion.a>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/40">
          <ArrowDown className="w-3 h-3" />
          点击站点跳到对应篇的章节
        </div>
      </div>
    </div>
  )
}
