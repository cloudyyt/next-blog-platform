import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Cloud,
  CloudRain,
  Waves,
  Snowflake,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react"
import { BookCover } from "./book-cover"
import { ContinueReadingButton } from "./continue-reading-button"
import type { TreeholeBookHome, TreeholeSectionView } from "@/lib/treehole/data"

const elementMeta: Record<string, { label: string; color: string; Icon: typeof Wind }> = {
  spring: { label: "春", color: "#71906d", Icon: Sparkles },
  summer: { label: "夏", color: "#bf6a36", Icon: Sun },
  autumn: { label: "秋", color: "#a98b45", Icon: Wind },
  winter: { label: "冬", color: "#8c8c83", Icon: Snowflake },
  cloud: { label: "云", color: "#6c788e", Icon: Cloud },
  wind: { label: "风", color: "#b98539", Icon: Wind },
  rain: { label: "雨", color: "#6d7f92", Icon: CloudRain },
  snow: { label: "雪", color: "#9a9a92", Icon: Snowflake },
  light: { label: "光", color: "#c4823a", Icon: Sun },
  sea: { label: "海", color: "#5e7585", Icon: Waves },
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date(date))
}

function SectionTitle({ title }: { title: string }) {
  const parts = title.split("•").map((item) => item.trim()).filter(Boolean)
  if (parts.length < 2) return <>{title}</>

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-1">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex items-center">
          {index > 0 && (
            <i
              aria-hidden
              className="mx-1 inline-block h-[.34em] w-[.34em] rounded-full bg-current opacity-55"
            />
          )}
          <span>{part}</span>
        </span>
      ))}
    </span>
  )
}

function SectionVisual({
  section,
  color,
  compact = false,
}: {
  section: TreeholeSectionView
  color: string
  compact?: boolean
}) {
  const meta = elementMeta[section.element] ?? elementMeta.wind
  const Icon = meta.Icon

  if (section.imageUrl) {
    return (
      <div className={`relative overflow-hidden ${compact ? "h-32" : "h-44 sm:h-52"}`}>
        <Image
          src={section.imageUrl}
          alt={section.imageAlt ?? section.title}
          fill
          unoptimized
          className="object-cover"
          sizes={compact ? "400px" : "900px"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b2118]/68 via-[#2b2118]/12 to-transparent" />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${compact ? "h-32" : "h-44 sm:h-52"}`}
      style={{
        background: `linear-gradient(135deg, ${color}38 0%, #f7f0df 48%, ${color}22 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: "radial-gradient(rgba(91,67,35,.13) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        aria-hidden
        className="absolute -right-8 top-0 h-full w-40 opacity-22"
        style={{
          background: `linear-gradient(100deg, transparent, ${color}, transparent)`,
          transform: "rotate(12deg)",
        }}
      />
      <div className="absolute bottom-4 left-5 flex items-center gap-2 text-foreground/68">
        <Icon className="h-4 w-4" />
        <span className="font-handwriting text-sm">{section.imageAlt}</span>
      </div>
    </div>
  )
}

export function TreeholeBookHome({ data }: { data: TreeholeBookHome }) {
  const { book, sections, firstArticle } = data
  const articles = sections.flatMap((section) => section.entries.filter((entry) => entry.kind === "article"))
  const notes = sections.flatMap((section) => section.entries.filter((entry) => entry.kind === "note"))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      {book.defaultView !== "toc" && (
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-14">
          <div className="mx-auto w-full max-w-[300px]">
            <BookCover
              title={book.title}
              author={book.author}
              elements={sections.map((section) => section.element)}
              coverStyle={book.coverStyle}
              images={sections
                .filter((section) => section.imageUrl)
                .map((section) => ({
                  url: section.imageUrl as string,
                  alt: section.imageAlt ?? section.title,
                }))}
            />
          </div>

          <div className="text-center lg:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/70 px-3 py-1 text-[11px] font-medium tracking-[.2em] text-primary">
              <BookOpen className="h-3 w-3" />
              TREEHOLE BOOK · {book.subtitle}
            </p>
            <h1 className="font-handwriting text-3xl leading-tight sm:text-5xl">{book.title}</h1>
            <p className="mt-5 text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
              {book.description}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {firstArticle && (
                <ContinueReadingButton
                  defaultSlug={firstArticle.slug}
                  defaultTitle={firstArticle.title ?? book.title}
                />
              )}
              <Link
                href="#mood-index"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/25 bg-card/60 px-5 text-sm font-medium text-primary transition hover:-translate-y-0.5 hover:bg-card"
              >
                按心情开始
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="mt-9 grid grid-cols-3 gap-3 text-left">
              <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
                <dt className="text-[11px] text-muted-foreground">章节</dt>
                <dd className="mt-1 font-handwriting text-xl">{sections.length}</dd>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
                <dt className="text-[11px] text-muted-foreground">正式文章</dt>
                <dd className="mt-1 font-handwriting text-xl">{articles.length}</dd>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/60 px-4 py-3">
                <dt className="text-[11px] text-muted-foreground">短记插页</dt>
                <dd className="mt-1 font-handwriting text-xl">{notes.length}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section id="mood-index" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <h2 className="font-handwriting text-2xl sm:text-3xl">按此刻的心情开始</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-sm">
              先认出自己，再进入章节。天气只是入口，读的是此刻的状态。
            </p>
          </div>
          <Link href="#book-toc" className="text-xs text-primary transition hover:underline">
            查看完整目录 →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const meta = elementMeta[section.element] ?? elementMeta.wind
            const firstEntry = section.entries.find((entry) => entry.kind === "article")
            return (
              <Link
                key={`mood-${section.id}`}
                href={firstEntry ? `/treehole/${firstEntry.slug}` : `#section-${section.slug}`}
                className="group overflow-hidden rounded-xl border border-border/70 bg-card/75 shadow-[0_20px_40px_-36px_rgba(72,46,17,.68)] transition hover:-translate-y-0.5 hover:bg-card"
              >
                <SectionVisual section={section} color={meta.color} compact />
                <div className="px-5 py-4">
                  <h3 className="font-handwriting text-lg leading-8 transition group-hover:text-primary">
                    <SectionTitle title={section.title} />
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{section.leadSentence}</p>
                  <p className="mt-3 font-handwriting text-[13px] leading-7 text-foreground/72">
                    {section.parallelSentence}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    从这里开始 <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section id="book-toc" className="mt-16 scroll-mt-20 sm:mt-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <h2 className="font-handwriting text-2xl sm:text-3xl">目录</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-sm">
              正式文章是书的主体；短记作为插页穿插在章节之间。
            </p>
          </div>
          <span className="rounded-full border border-primary/25 bg-card/60 px-3 py-1 text-[11px] text-primary">
            {book.author} 著
          </span>
        </div>

        <div className="space-y-5">
          {sections.map((section, sectionIndex) => {
            const meta = elementMeta[section.element] ?? elementMeta.wind
            const sectionArticles = section.entries.filter((entry) => entry.kind === "article")
            const sectionNotes = section.entries.filter((entry) => entry.kind === "note")

            return (
              <section
                key={section.id}
                id={`section-${section.slug}`}
                className="scroll-mt-20 overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-[0_22px_42px_-34px_rgba(72,46,17,.55)]"
              >
                <SectionVisual section={section} color={meta.color} />
                <header className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-background/50 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="flex flex-wrap items-baseline gap-x-3 font-handwriting text-xl">
                      <SectionTitle title={section.title} />
                      <small className="font-sans text-[10px] font-semibold tracking-[.16em] text-muted-foreground">
                        PART {sectionIndex + 1} · {meta.label}
                      </small>
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.leadSentence}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground">
                    {sectionArticles.length} 篇
                    {sectionNotes.length > 0 ? ` · ${sectionNotes.length} 则短记` : ""}
                  </span>
                </header>

                <div className="grid sm:grid-cols-2">
                  {sectionArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/treehole/${article.slug}`}
                      className="group grid content-start gap-2 border-b border-r border-border/50 px-5 py-5 transition hover:bg-background/80 sm:[&:nth-last-child(2)]:border-b-0 sm:[&:nth-last-child(1)]:border-r-0"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <time dateTime={article.date}>{formatDate(article.date)}</time>
                        <span>{article.readingTime}</span>
                      </div>
                      <h4 className="font-handwriting text-lg transition group-hover:text-primary">
                        {article.title}
                      </h4>
                      <p className="line-clamp-3 text-xs leading-6 text-muted-foreground">{article.excerpt}</p>
                      <span className="text-[11px] font-semibold text-primary">开始阅读 →</span>
                    </Link>
                  ))}

                  {sectionArticles.length === 0 && section.plannedTitles.length > 0 && (
                    <div className="px-5 py-5 sm:col-span-2">
                      <p className="mb-3 text-[11px] text-muted-foreground">待写篇目</p>
                      <div className="flex flex-wrap gap-2">
                        {section.plannedTitles.map((title) => (
                          <span
                            key={title}
                            className="rounded-full border border-dashed border-primary/25 px-3 py-1 text-[11px] text-muted-foreground"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {sectionNotes.map((note) => (
                  <aside
                    key={note.id}
                    className="mx-5 mb-5 rounded-lg border border-dashed border-primary/35 bg-background/75 px-4 py-3"
                  >
                    <header className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[.12em] text-muted-foreground">
                      <b className="text-primary">短记 · 插页</b>
                      <span>
                        {formatDate(note.date)}
                        {note.weather ? ` · ${note.weather}` : ""}
                      </span>
                    </header>
                    <p className="text-sm leading-7 text-foreground/85">{note.content}</p>
                  </aside>
                ))}
              </section>
            )
          })}
        </div>
      </section>
    </div>
  )
}
