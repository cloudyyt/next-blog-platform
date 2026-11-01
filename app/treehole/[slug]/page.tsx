import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { PostContent } from "@/components/blog/post-content"
import { getTreeholeArticle, getTreeholeBookHome } from "@/lib/treehole/data"
import { TreeholeReaderShell, type ReaderTocGroup } from "../components/treehole-reader-shell"

export const revalidate = 120

const elementLabels: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
  wind: "风",
  cloud: "云",
  rain: "雨",
  snow: "雪",
  light: "光",
  sea: "海",
}

function SectionTitle({ title }: { title: string }) {
  const parts = title.split("•").map((item) => item.trim()).filter(Boolean)
  if (parts.length < 2) return <>{title}</>
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex items-center">
          {index > 0 && (
            <i aria-hidden className="mx-1 inline-block h-[.3em] w-[.3em] rounded-full bg-current opacity-55" />
          )}
          {part}
        </span>
      ))}
    </>
  )
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getTreeholeArticle(slug)
  if (!data) return { title: "未找到" }
  return {
    title: `${data.article.title ?? "树洞"} · ${data.book.title}`,
    description: data.article.excerpt ?? undefined,
  }
}

export default async function TreeholeArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [data, home] = await Promise.all([getTreeholeArticle(slug), getTreeholeBookHome()])
  if (!data) notFound()

  const groups: ReaderTocGroup[] = home.sections.map((section) => ({
    slug: section.slug,
    title: section.title,
    elementLabel: elementLabels[section.element] ?? section.element,
    items: section.entries
      .filter((entry) => entry.kind === "article")
      .map((entry) => ({
        slug: entry.slug,
        title: entry.title ?? "未命名",
        meta: `${new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(entry.date))} · ${entry.readingTime}`,
      })),
  }))

  const date = new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(
    new Date(data.article.date),
  )

  return (
    <TreeholeReaderShell
      bookTitle={data.book.title}
      sectionTitle={data.section.title}
      articleTitle={data.article.title ?? data.book.title}
      currentSlug={data.article.slug}
      groups={groups}
    >
      <article className="mx-auto w-full max-w-5xl px-0 pb-14 pt-8 sm:px-6">
        <div className="mx-auto mb-6 max-w-3xl overflow-hidden rounded-xl border border-border/70 shadow-[0_24px_48px_-42px_rgba(72,46,17,.75)]">
          {data.section.imageUrl ? (
            <div className="relative h-44 sm:h-56">
              <Image
                src={data.section.imageUrl}
                alt={data.section.imageAlt ?? data.section.title}
                fill
                unoptimized
                className="object-cover"
                sizes="768px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2b2118]/70 via-[#2b2118]/12 to-transparent" />
            </div>
          ) : (
            <div className="relative h-36 bg-[linear-gradient(135deg,rgba(150,97,58,.18),#f8f2e3_55%,rgba(150,97,58,.10))] sm:h-44">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(91,67,35,.12)_1px,transparent_1px)] opacity-45" style={{ backgroundSize: "18px 18px" }} />
            </div>
          )}
          <div className="bg-card/90 px-5 py-4">
            <p className="font-handwriting text-sm text-foreground/75">
              <SectionTitle title={data.section.title} />
            </p>
            <p className="mt-2 font-handwriting text-[13px] leading-7 text-muted-foreground">
              {data.section.parallelSentence}
            </p>
          </div>
        </div>

        <div className="relative mx-auto min-h-[620px] max-w-3xl border border-border/70 bg-card px-5 pb-10 pt-11 sm:px-12 sm:pb-12 sm:pt-14">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_45%_at_50%_0%,rgba(255,255,255,.78),transparent)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-[clamp(18px,4vw,40px)] w-px bg-primary/10"
          />
          <div className="relative">
            <p className="mb-4 flex items-center justify-center gap-3 text-[10px] font-semibold tracking-[.24em] text-primary">
              <span className="h-px w-6 bg-primary/50" />
              <SectionTitle title={data.section.title} />
              <span className="h-px w-6 bg-primary/50" />
            </p>
            <h1 className="mx-auto max-w-2xl text-center font-handwriting text-3xl leading-snug sm:text-4xl">
              {data.article.title}
            </h1>
            <div className="mb-10 mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <time dateTime={data.article.date}>{date}</time>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>正式文章</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{data.article.readingTime}</span>
            </div>

            <div className="prose prose-lg max-w-none min-w-0 font-handwriting [&_blockquote]:border-primary/50 [&_blockquote]:text-muted-foreground [&_h2]:font-handwriting [&_h3]:font-handwriting [&_strong]:font-handwriting">
              <PostContent content={data.article.content} />
            </div>

            {data.notes.length > 0 && (
              <div className="mt-12 space-y-4">
                {data.notes.map((note) => (
                  <aside
                    key={note.id}
                    className="rounded-lg border border-dashed border-primary/40 bg-background/75 px-5 py-4"
                  >
                    <header className="mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[.12em] text-muted-foreground">
                      <b className="text-primary">短记 · 插页</b>
                      <span>
                        {new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(
                          new Date(note.date),
                        )}
                        {note.weather ? ` · ${note.weather}` : ""}
                      </span>
                    </header>
                    <p className="text-sm leading-7">{note.content}</p>
                  </aside>
                ))}
              </div>
            )}

            <nav className="mt-12 flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {data.previous ? (
                <Link
                  href={`/treehole/${data.previous.slug}`}
                  className="group min-w-0 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <span className="block text-[10px] tracking-[.14em]">PREV</span>
                  <span className="mt-1 block truncate font-handwriting text-lg">
                    {data.previous.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {data.next && (
                <Link
                  href={`/treehole/${data.next.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/25 bg-card/70 px-5 py-2.5 text-sm font-medium text-primary transition hover:-translate-y-0.5"
                >
                  下一篇
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              )}
            </nav>
          </div>
        </div>
      </article>
    </TreeholeReaderShell>
  )
}
