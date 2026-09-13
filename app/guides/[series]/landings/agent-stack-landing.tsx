import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import type { GuideSeriesConfig, OverviewGroup } from "@/lib/types/guide"
import { getSeriesMeta } from "@/lib/guide/series"
import { ChapterTrail } from "@/app/guides/components/chapter-trail"
import { ToolchainMap } from "./toolchain-map"
import { ProjectAnchors } from "./project-anchors"
import { ReadingModes } from "./reading-modes"

/**
 * 《Agent 实战：从 Dify 到 LangGraph》（agent-stack）landing
 *
 * 结构：Hero（工具链 chips 身份标识）→ 工具链路线图（签名视觉）
 *   → 实战锚点（核心差异点）→ 三种读法 → 章节列表（全目录展示）。
 */
const SERIES = "agent-stack"
const BASE = `/guides/${SERIES}`

export function AgentStackLanding({
  groups,
  config,
}: {
  groups: OverviewGroup[]
  config: GuideSeriesConfig | null
}) {
  const meta = getSeriesMeta(SERIES)

  // 全部章节（目录全展示：含 comingSoon 建设中）
  const allChapters = groups.flatMap((g) => g.items)
  const readable = allChapters.filter((c) => !c.comingSoon)
  const readableSlugs = readable.map((c) => c.slug)
  const first = readable[0]

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── Hero ─────────────────────────────── */}
      <section className="relative mb-10 pt-4 pb-2">
        <div
          className="absolute -right-20 -top-10 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none bg-primary"
          aria-hidden
        />

        <div className="relative">
          {/* Pill：定位 */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            TypeScript 主线 · DeepSeek 实操 · {config?.badge ?? "连载中"}
          </div>

          {/* H1：「实战」高亮，副题同行弱化 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight mb-4">
            Agent <span className="text-primary">实战</span>
            <span className="block sm:inline sm:ml-3 text-xl sm:text-2xl lg:text-3xl text-muted-foreground font-normal mt-1 sm:mt-0">
              从 Dify 到 LangGraph
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-4">
            {config?.subtitle ??
              meta?.fallbackSubtitle ??
              "平台起步，代码深入——全程长在真实项目上。"}
          </p>

          {/* 工具链 chips：本书身份标识 */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-5">
            <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Dify
            </span>
            <span className="text-muted-foreground/40">→</span>
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              LangChain
            </span>
            <span className="text-muted-foreground/40">→</span>
            <span className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
              LangGraph
            </span>
          </div>

          {/* meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-6">
            <span>
              规划{" "}
              <span className="font-medium text-foreground/80">
                {allChapters.length}
              </span>{" "}
              章 · 已发布{" "}
              <span className="font-medium text-foreground/80">
                {readable.length}
              </span>{" "}
              章
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span>每章 15-20 分钟</span>
            <span className="text-muted-foreground/30">·</span>
            <span>TS 主线 + Python 对照</span>
          </div>

          {/* CTA */}
          {first && (
            <Link
              href={`${BASE}/${first.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:gap-3 transition-all cursor-pointer shadow-soft"
            >
              从「{first.title}」开始
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ─── 工具链路线图（签名视觉） ─────────── */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          五篇 · 一条路线
        </h2>
        <ToolchainMap />
      </section>

      {/* ─── 实战锚点（核心差异点） ───────────── */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          全书贯穿 3 个真实项目
        </h2>
        <p className="text-xs text-muted-foreground/70 mb-4">
          不是虚构 demo——每个知识点都落在真实代码上
        </p>
        <ProjectAnchors />
      </section>

      {/* ─── 三种读法 ─────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          选一条适合你的读法
        </h2>
        <ReadingModes />
      </section>

      {/* ─── 章节列表（全目录展示，建设中弱化可见） ── */}
      <section id="chapter-list" className="scroll-mt-20">
        <h2 className="text-lg font-bold font-display mb-1">全部章节</h2>
        <p className="text-xs text-muted-foreground/70 mb-6">
          按学习顺序排列，已读章节会标记 ✓
        </p>

        {groups
          .filter((g) => g.items.length > 0)
          .map((group) => (
            <div
              key={group.key}
              id={`group-${group.key}`}
              className="mb-10 scroll-mt-20"
            >
              <div className="flex items-baseline justify-between gap-3 mb-2 pb-2 border-b border-border/40">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-base font-bold font-display">
                    {group.label}
                  </h3>
                  <span className="text-xs text-muted-foreground/70">
                    {group.hint}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground/50 tabular-nums shrink-0">
                  {group.items.length} 章
                </span>
              </div>

              <ChapterTrail
                chapters={group.items}
                groupKey={group.key}
                allPublishedSlugs={readableSlugs}
                basePath={BASE}
                storagePrefix={SERIES}
              />
            </div>
          ))}
      </section>

      {/* ─── 连载承诺 ─────────────────────────── */}
      {readable.length < allChapters.length && (
        <section className="mt-12 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
            其余{" "}
            <span className="font-medium text-foreground/80">
              {allChapters.length - readable.length}
            </span>{" "}
            章按篇连载中：LangChain → LangGraph → 工程化，持续上线。
          </p>
        </section>
      )}
    </div>
  )
}
