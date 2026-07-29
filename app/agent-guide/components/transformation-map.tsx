"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Compass,
  BookOpen,
  Sparkles,
  Layers,
  Code,
  Wrench,
  Rocket,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { GroupKey, OverviewGroup } from "@/lib/types/guide"
import { useGuideProgress } from "./use-guide-progress"

/**
 * 交互式转型地图
 *
 * 取代原 page.tsx 里「可看不可点」的 5 阶段横向轨道，并吸收 intro.md 里那张
 * 颜色硬编码、不可点击、不随主题变的静态 SVG，做成：
 * - 主题自适应（全用主题 CSS 变量，无硬编码 hex）
 * - 可点击（每阶段 → 滚动到下方对应分组锚点 #group-{key}）
 * - 带状态（已完成 / 进行中 / 未开始，读 visited 状态）
 * - 动效（节点 stagger 入场 + 端点连线，尊重 prefers-reduced-motion）
 *
 * 结构：起点[TypeScript] ──▶ [5 个阶段节点] ──▶ 终点[能跑的 Agent]
 */

const ICON_MAP: Record<string, typeof Compass> = {
  Compass,
  BookOpen,
  Sparkles,
  Layers,
  Code,
  Wrench,
  Rocket,
  GraduationCap,
}

export function TransformationMap({
  groups,
  allPublishedSlugs,
}: {
  groups: OverviewGroup[]
  allPublishedSlugs: string[]
}) {
  const { visited, mounted } = useGuideProgress(allPublishedSlugs)

  // 每阶段状态：done（全已读）/ active（部分已读）/ todo（未开始）/ locked（无已发布）
  const stageStates = groups.map((g) => {
    const readable = g.items.filter((c) => !c.comingSoon)
    if (readable.length === 0)
      return { state: "locked" as const, published: 0, total: g.items.length, readCount: 0 }
    const readCount = readable.filter((c) =>
      mounted ? visited.has(c.slug) : false,
    ).length
    const published = readable.length
    const total = g.items.length
    const state =
      readCount === 0 ? "todo" : readCount === published ? "done" : "active"
    return { state, published, total, readCount } as const
  })

  return (
    <section className="mb-14">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          转型地图
        </h2>
        <span className="text-[11px] text-muted-foreground/60">
          点任一阶段跳到对应章节
        </span>
      </div>

      {/* 地图主体：横向轨道 */}
      <div className="relative overflow-x-auto pb-2">
        <div className="flex items-stretch gap-2 min-w-max">
          {/* 起点 */}
          <MapEndpoint
            label="你的起点"
            lines={["TypeScript", "React / HTTP"]}
            tone="start"
          />

          <Connector />

          {/* 5 个阶段节点 */}
          {groups.map((g, i) => {
            const Icon = ICON_MAP[g.icon] ?? BookOpen
            const meta = stageStates[i]
            return (
              <motion.div
                key={g.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                className="flex items-stretch"
              >
                <StageNode
                  groupKey={g.key}
                  label={g.label}
                  hint={g.hint}
                  icon={<Icon className="w-4 h-4" />}
                  state={meta.state}
                  published={meta.published}
                  total={meta.total}
                  readCount={meta.readCount}
                />
                {i < groups.length - 1 && <Connector />}
              </motion.div>
            )
          })}

          <Connector />

          {/* 终点 */}
          <MapEndpoint
            label="你的终点"
            lines={["独立设计", "能跑的 Agent"]}
            tone="end"
          />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/50 text-center mt-3 leading-relaxed">
        关键不是学更多 API，而是换一套思维模型 · 覆盖 5 大阶段 ·{" "}
        {allPublishedSlugs.length} 个 Phase
      </p>
    </section>
  )
}

/** 起点 / 终点节点（静态） */
function MapEndpoint({
  label,
  lines,
  tone,
}: {
  label: string
  lines: string[]
  tone: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border px-3 py-3 min-w-[110px] text-center",
        tone === "start"
          ? "border-border/60 bg-muted/30"
          : "border-primary/40 bg-primary/5",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider mb-1",
          tone === "start"
            ? "text-muted-foreground/70"
            : "text-primary",
        )}
      >
        {label}
      </span>
      {lines.map((l) => (
        <span
          key={l}
          className={cn(
            "text-xs",
            tone === "end" ? "text-primary font-semibold" : "text-foreground/80",
          )}
        >
          {l}
        </span>
      ))}
    </div>
  )
}

/** 阶段节点（可点击 + 状态色） */
function StageNode({
  groupKey,
  label,
  hint,
  icon,
  state,
  published,
  total,
  readCount,
}: {
  groupKey: GroupKey
  label: string
  hint: string
  icon: React.ReactNode
  state: "done" | "active" | "todo" | "locked"
  published: number
  total: number
  readCount: number
}) {
  const isInteractive = published > 0
  const inner = (
    <div
      className={cn(
        "group h-full w-[130px] rounded-lg border px-3 py-3 transition-all",
        state === "done" &&
          "border-primary/40 bg-primary/5",
        state === "active" &&
          "border-primary/60 bg-primary/10 ring-1 ring-primary/20",
        state === "todo" &&
          "border-border/60 bg-card/60",
        state === "locked" &&
          "border-dashed border-border/40 bg-transparent opacity-50",
        isInteractive && "hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className={cn(
            state === "locked"
              ? "text-muted-foreground/50"
              : state === "done"
                ? "text-primary"
                : "text-primary",
          )}
        >
          {icon}
        </span>
        <span className="text-xs font-bold truncate">{label}</span>
      </div>
      <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mb-1.5">
        {hint}
      </p>
      {/* 进度条 */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${published > 0 ? (readCount / published) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground/60 tabular-nums shrink-0">
          {published}/{total}
        </span>
      </div>
    </div>
  )

  if (!isInteractive) return <div className="h-full">{inner}</div>

  return (
    <Link href={`#group-${groupKey}`} className="block h-full cursor-pointer">
      {inner}
    </Link>
  )
}

/** 节点间的连接箭头 */
function Connector() {
  return (
    <div className="flex items-center px-0.5 shrink-0">
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="origin-left flex items-center text-muted-foreground/30"
      >
        <span className="w-3 h-px bg-current" />
        <ArrowRight className="w-3 h-3" />
      </motion.div>
    </div>
  )
}
