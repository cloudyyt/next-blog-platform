import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { getGuideOverviewData } from "@/lib/guide/data"
import { TransformationMap } from "./components/transformation-map"
import { ReadingModeCards } from "./components/reading-mode-cards"
import { ContinueReading } from "./components/continue-reading"
import { ChapterTrail } from "./components/chapter-trail"

/**
 * /agent-guide 总览页（重构版：叙事化 + 可交互地图 + 路径化列表）
 *
 * 设计目标：从「产品 spec 三段式」→「一张可走的地图 + 叙事引导」
 *   1. Hero 叙事区 —— 共情钩子（地图而非教程），轻量 meta，强 CTA
 *   2. 继续阅读 —— 有进度时强引导回到上次位置
 *   3. 三种读法 —— 不同目的的读者各取所需
 *   4. 转型地图 —— 可点击、带状态的可视化（吸收 intro 的静态 SVG）
 *   5. 章节列表 —— 路径化（连线 + 已读状态 + 「从这里继续」）
 *
 * 数据源：lib/guide/data.ts（prisma）。series config 缺失字段用默认值 fallback。
 * 阅读状态：client 组件复用 sidebar 的 localStorage key（agent-guide:visited）。
 */

export default async function AgentGuideOverviewPage() {
  const { groups, config } = await getGuideOverviewData()

  // 全局已发布（非 WIP）章节，按 group+order 顺序扁平化
  const allPublished = groups.flatMap((g) =>
    g.items.filter((c) => !c.comingSoon),
  )
  const allPublishedSlugs = allPublished.map((c) => c.slug)
  const slugTitleMap = Object.fromEntries(
    allPublished.map((c) => [c.slug, c.title]),
  )

  // 只展示已发布章节的分组
  const publishedGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((c) => !c.comingSoon) }))
    .filter((g) => g.items.length > 0)

  const totalWip = groups.reduce(
    (sum, g) => sum + g.items.filter((c) => c.comingSoon).length,
    0,
  )
  const firstChapter = publishedGroups[0]?.items[0]
  const totalPublished = allPublished.length

  const title = config?.title ?? "前端工程师转型 Agent 开发指南"
  const subtitle =
    config?.subtitle ??
    "写给被 Agent / LLM 这堆名词劝退的工程师。这不是教程，是一张地图——在你迷路时拿出来看一眼。"
  const cta = firstChapter
    ? config?.cta ?? `从 ${firstChapter.title} 开始`
    : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── Hero：叙事化价值主张 ─────────────────── */}
      <section className="relative mb-10 pt-4 pb-2">
        {/* 装饰：右上角光晕（landing 专属） */}
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

          {/* 副标题：共情钩子（地图隐喻） */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-5">
            {subtitle}
          </p>

          {/* 轻量 meta：单行取代原 4 个冷 ValueCard */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-6">
            <span>
              已发布{" "}
              <span className="font-medium text-foreground/80">
                {totalPublished}
              </span>{" "}
              章 · 持续更新
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span>{config?.valueCard4 ?? "每章 20-30 分钟"}</span>
            <span className="text-muted-foreground/30">·</span>
            <span>{config?.valueCard2 ?? "Python · Qwen · 阿里云"}</span>
          </div>

          {/* 强 CTA */}
          {firstChapter && cta && (
            <Link
              href={`/agent-guide/${firstChapter.slug}`}
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
        allPublishedSlugs={allPublishedSlugs}
        slugTitleMap={slugTitleMap}
      />

      {/* ─── 三种读法 ─────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          选一条适合你的路线
        </h2>
      </section>
      <ReadingModeCards />

      {/* ─── 转型地图（可交互） ───────────────────── */}
      <TransformationMap
        groups={groups}
        allPublishedSlugs={allPublishedSlugs}
      />

      {/* ─── 章节列表（路径化） ───────────────────── */}
      <section id="chapter-list" className="scroll-mt-20">
        <h2 className="text-lg font-bold font-display mb-1">全部章节</h2>
        <p className="text-xs text-muted-foreground/70 mb-6">
          按学习顺序排列，已读章节会标记 ✓
        </p>

        {publishedGroups.map((group) => (
          <div
            key={group.key}
            id={`group-${group.key}`}
            className="mb-10 scroll-mt-20"
          >
            {/* 分组标题（供地图锚点跳转定位） */}
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
              allPublishedSlugs={allPublishedSlugs}
            />
          </div>
        ))}
      </section>

      {/* ─── 后续章节承诺 ─────────────────────────── */}
      {totalWip > 0 && (
        <section className="mt-12 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
            后续{" "}
            <span className="font-medium text-foreground/80">{totalWip}</span>{" "}
            章正在写作中，将持续上线。
          </p>
        </section>
      )}
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
