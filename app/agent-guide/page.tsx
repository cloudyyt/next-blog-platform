import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Compass,
  BookOpen,
  Sparkles,
  Layers,
  Code,
  Wrench,
  Rocket,
  GraduationCap,
} from "lucide-react"
import { getGuideOverviewData } from "@/lib/guide/data"
import { cn } from "@/lib/utils"

/**
 * /agent-guide 总览页（landing 视觉语言）
 *
 * 数据源：lib/guide/data.ts（prisma）。series config 缺失字段用默认值 fallback。
 *
 * 设计层次：
 * 1. Hero 价值主张区（回答：写给谁 / 读完成什么 / 多长时间 / 现在进度）
 * 2. 学习路径可视化（5 阶段横向轨道）
 * 3. 章节列表（默认隐藏 WIP，只展示已发布；底部一句话承诺后续）
 */

const DIFFICULTY_STYLES: Record<string, string> = {
  入门: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  进阶: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  实战: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

/** lucide 图标名 → 组件（admin 配置的 icon 字符串解析用） */
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

export default async function AgentGuideOverviewPage() {
  const { groups, config } = await getGuideOverviewData()

  // 只展示已发布章节（默认隐藏 WIP）
  const publishedGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((c) => !c.comingSoon),
    }))
    .filter((g) => g.items.length > 0)

  // WIP 数量（用于底部承诺）
  const totalWip = groups.reduce(
    (sum, g) => sum + g.items.filter((c) => c.comingSoon).length,
    0
  )

  // 找第一个可读章节作为 CTA 目标
  const firstChapter = publishedGroups[0]?.items[0]

  // 全局已发布数
  const totalPublished = groups.reduce(
    (sum, g) => sum + g.items.filter((c) => !c.comingSoon).length,
    0
  )

  const title = config?.title ?? "前端工程师转型 Agent 开发指南"
  const subtitle =
    config?.subtitle ??
    "一份用前端工程师熟悉的概念作脚手架的实战地图。从术语地基开始，一步步走到能独立交付 Agent 应用。"
  const cta = firstChapter
    ? config?.cta ?? `从 ${firstChapter.title} 开始`
    : null

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── Hero：价值主张 ──────────────────────────── */}
      <section className="relative mb-12 pt-4 pb-8">
        {/* 装饰：右上角光晕（landing 专属，reading 页不会有） */}
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

          {/* 副标题：回答"读完成什么" */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6">
            {subtitle}
          </p>

          {/* 价值卡片：4 个关键事实 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <ValueCard
              label="目标读者"
              value={config?.valueCard1 ?? "前端 / TS 工程师"}
              icon={<BookOpen className="w-3.5 h-3.5" />}
            />
            <ValueCard
              label="技术栈"
              value={config?.valueCard2 ?? "Python · Qwen · 阿里云"}
              icon={<Layers className="w-3.5 h-3.5" />}
            />
            <ValueCard
              label="已发布"
              value={`${totalPublished} 章 · 持续更新`}
              icon={<Compass className="w-3.5 h-3.5" />}
            />
            <ValueCard
              label="阅读时长"
              value={config?.valueCard4 ?? "每章 20-30 分钟"}
              icon={<Clock className="w-3.5 h-3.5" />}
            />
          </div>

          {/* CTA：明确的下一步 */}
          {firstChapter && cta && (
            <Link
              href={`/agent-guide/${firstChapter.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ─── 学习路径可视化 ────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          学习路径
        </h2>
        <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
          {groups.map((g, i) => {
            const Icon = ICON_MAP[g.icon] ?? BookOpen
            const published = g.items.filter((c) => !c.comingSoon).length
            const isReachable = published > 0
            return (
              <div key={g.key} className="flex items-stretch flex-1 min-w-0">
                <div
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-3 min-w-[120px]",
                    isReachable
                      ? "border-border/60 bg-card/60"
                      : "border-dashed border-border/40 bg-transparent opacity-60"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5",
                        isReachable
                          ? "text-primary"
                          : "text-muted-foreground/50"
                      )}
                    />
                    <span className="text-xs font-medium truncate">
                      {g.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 line-clamp-1">
                    {g.hint}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 tabular-nums">
                    {published} / {g.items.length} 已发布
                  </p>
                </div>
                {i < groups.length - 1 && (
                  <div className="flex items-center px-0.5 text-muted-foreground/30 shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── 章节列表（默认隐藏 WIP） ────────────── */}
      {publishedGroups.map((group) => (
        <section key={group.key} className="mb-8">
          <div className="flex items-baseline justify-between gap-3 mb-3 pb-2 border-b border-border/40">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg sm:text-xl font-bold font-display">
                {group.label}
              </h2>
              <span className="text-xs text-muted-foreground/70">
                {group.hint}
              </span>
            </div>
          </div>

          <ul className="divide-y divide-border/30">
            {group.items.map((chapter) => {
              const Inner = (
                <div className="group flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 w-9 text-center",
                      DIFFICULTY_STYLES[chapter.difficulty] ??
                        DIFFICULTY_STYLES["入门"]
                    )}
                  >
                    {chapter.difficulty}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {chapter.title}
                    </div>
                    <div className="text-xs text-muted-foreground/70 truncate">
                      {chapter.description}
                    </div>
                  </div>

                  <div className="shrink-0 text-[11px] text-muted-foreground/60 tabular-nums">
                    {chapter.readingTime ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {chapter.readingTime} 分钟
                      </span>
                    ) : null}
                  </div>
                </div>
              )

              return (
                <li key={chapter.slug} className="px-1">
                  <Link
                    href={`/agent-guide/${chapter.slug}`}
                    className="block rounded-md cursor-pointer hover:bg-accent/30 transition-colors -mx-1 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {Inner}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {/* ─── 后续章节承诺（替代暴露 WIP） ────────── */}
      {totalWip > 0 && (
        <section className="mt-12 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
            后续 <span className="font-medium text-foreground/80">{totalWip}</span> 章正在写作中，将持续上线。
          </p>
        </section>
      )}
    </div>
  )
}

/** 价值卡片：Hero 区的 4 个事实 */
function ValueCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xs sm:text-sm font-medium text-foreground/90 leading-snug">
        {value}
      </div>
    </div>
  )
}
