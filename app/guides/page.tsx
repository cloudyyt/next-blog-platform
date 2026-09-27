import type { Metadata } from "next"
import Link from "next/link"
import {
  Compass,
  Layers,
  Library,
  PenLine,
  Workflow,
  Blocks,
  Link2,
  Hammer,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react"
import { getAllSeriesHomeCardData } from "@/lib/guide/data"
import { getSeriesMeta } from "@/lib/guide/series"
import { READING_LIST } from "@/lib/guide/reading-list"
import { getBookPalette } from "./components/bookshelf/book-cover"
import { ShelfBook, NextBookSlot } from "./components/bookshelf/shelf-book"

/**
 * /guides 书房页（微信读书式书架）
 *
 * 结构：书房 Hero → 「我写的」书架（竖版 CSS 书封立在木层板上，
 * 点书续读）→「我在读」荐书层（配置驱动的一句话短评卡）。
 * 书架视觉（木色/奶油纸/暖金）固定，不随全站主题切换——书房就该有书房的样子。
 */

export const metadata: Metadata = {
  title: "书房 · zijieLeo Docs",
  description: "zijieLeo 的书房：自己写的电子书，和手边在读的纸书。有空来读两章。",
}

export default async function GuidesPage() {
  const books = await getAllSeriesHomeCardData()

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        {/* ─── 书房 Hero ─────────────────────────────── */}
        <section className="mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary mb-4">
            <Library className="h-3 w-3" />
            zijieLeo Docs
          </div>
          <h1 className="font-display mb-2 text-3xl font-bold leading-tight sm:text-4xl">
            书房
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            自己写的书在上面，手边在读的在下面。
            <br className="sm:hidden" />
            有空来读两章——进度都给你记着。
          </p>
        </section>

        {/* ─── 我写的：书架 ───────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center gap-2.5">
            <PenLine className="h-4 w-4 text-primary" />
            <h2 className="font-handwriting text-lg font-bold">自己写的几本</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              {books.length} 本 · 持续连载
            </span>
          </div>

          {/* 三列书位：真书 + 下一本占位；层板段无缝拼成整条木板 */}
          <div className="grid grid-cols-3">
            {books.map((book, i) => {
              const meta = getSeriesMeta(book.series)
              const title =
                book.config?.title ?? meta?.fallbackTitle ?? book.series
              const subtitle =
                book.config?.subtitle ?? meta?.fallbackSubtitle ?? null

              return (
                <ShelfBook
                  key={book.series}
                  series={book.series}
                  title={title}
                  subtitle={subtitle}
                  badge={book.config?.badge ?? "连载中"}
                  iconName={meta?.icon ?? "Library"}
                  palette={getBookPalette(book.series)}
                  readableSlugs={book.readableSlugs}
                  delay={i * 120}
                />
              )
            })}
            <NextBookSlot delay={books.length * 120} />
          </div>
        </section>

        {/* ─── 我在读：荐书层 ─────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-2.5">
            <Library className="h-4 w-4 text-primary" />
            <h2 className="font-handwriting text-lg font-bold">我在读</h2>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              手边的纸书
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {READING_LIST.map((b) => (
              <a
                key={b.title}
                href={b.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex cursor-pointer gap-3.5 rounded-xl border border-border/60 bg-card/70 p-4 shadow-soft backdrop-blur-sm outline-none transition-all duration-200 hover:border-primary/30 hover:shadow-soft-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {/* 书脊色条 */}
                <span
                  aria-hidden
                  className="w-1.5 shrink-0 rounded-full"
                  style={{ background: b.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                      {b.title}
                    </h3>
                    {b.status === "done" ? (
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-px text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        读完
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
                        在读
                      </span>
                    )}
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/80">
                    {b.author}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {b.comment}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground/50">
            点卡片去豆瓣看详情
          </p>
        </section>
      </div>
    </main>
  )
}
