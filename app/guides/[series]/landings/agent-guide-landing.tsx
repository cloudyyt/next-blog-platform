import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import type { GuideSeriesConfig, OverviewGroup } from "@/lib/types/guide"
import { getSeriesMeta } from "@/lib/guide/series"
import { ChapterTrail } from "@/app/guides/components/chapter-trail"
import { ContinueReading } from "./continue-reading"

/**
 * 《Agent 认知地图》（agent-guide）landing
 *
 * 结构：Hero → 继续阅读 → 五组卡片地图 → 章节列表（全目录展示，轻量图表化风格）。
 * 章节 slug 硬编码的组件（reading-mode-cards）仅服务本书。
 */
const SERIES = "agent-guide"
const BASE = `/guides/${SERIES}`

export function AgentGuideLanding({
  groups,
  config,
}: {
  groups: OverviewGroup[]
  config: GuideSeriesConfig | null
}) {
  const meta = getSeriesMeta(SERIES)

  // 全部章节（目录全展示：含 comingSoon 建设中）
  const allChapters = groups.flatMap((g) => g.items)
  // 可读章节（排除建设中）——进度与「从这里继续」用
  const readable = allChapters.filter((c) => !c.comingSoon)
  const readableSlugs = readable.map((c) => c.slug)
  const slugTitleMap = Object.fromEntries(readable.map((c) => [c.slug, c.title]))

  const firstChapter = readable[0]
  const title = config?.title ?? meta?.fallbackTitle ?? "Agent 认知地图"
  const subtitle =
    config?.subtitle ??
    meta?.fallbackSubtitle ??
    "术语、原理与国内岗位图景——转岗之前，先把概念和行业看清楚。"
  const cta = firstChapter
    ? config?.cta ?? `从 ${firstChapter.title} 开始`
    : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── Hero：叙事化价值主张 ─────────────────── */}
      <section className="relative mb-10 pt-4 pb-2">
        <div
          className="absolute -right-20 -top-10 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none bg-primary"
          aria-hidden
        />

        <div className="relative">
          {/* Pill：定位 */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            前端工程师专属 · {config?.badge ?? "连载中"}
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight mb-4">
            {renderTitle(title)}
          </h1>

          {/* 副标题 */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-5">
            {subtitle}
          </p>

          {/* 轻量 meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-6">
            <span>
              已发布{" "}
              <span className="font-medium text-foreground/80">
                {readable.length}
              </span>{" "}
              章 · 持续更新
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span>{config?.valueCard4 ?? "每章 ≤ 8 分钟"}</span>
            <span className="text-muted-foreground/30">·</span>
            <span>{config?.valueCard2 ?? "术语卡 · 原理图 · 岗位地图"}</span>
          </div>

          {/* 强 CTA */}
          {firstChapter && cta && (
            <Link
              href={`${BASE}/${firstChapter.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:gap-3 transition-all cursor-pointer shadow-soft"
            >
              {cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ─── 继续阅读（有进度时才显示） ───────────── */}
      <ContinueReading
        allPublishedSlugs={readableSlugs}
        slugTitleMap={slugTitleMap}
        basePath={BASE}
        storagePrefix={SERIES}
      />

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
    </div>
  )
}

/** H1：若标题含 "Agent" 则高亮其后段，保留品牌视觉 */
function renderTitle(title: string) {
  const idx = title.indexOf("Agent")
  if (idx === -1) return title
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-primary">{title.slice(idx)}</span>
    </>
  )
}
