import { cache } from "react"
import { prisma } from "@/lib/prisma"
import {
  defaultTreeholeArticles,
  defaultTreeholeBook,
  defaultTreeholeNotes,
  defaultTreeholeSections,
} from "./defaults"

export interface TreeholeBookView {
  title: string
  author: string
  subtitle: string
  description: string
  coverStyle: string
  defaultView: string
}

export interface TreeholeEntryView {
  id: string
  slug: string
  kind: "article" | "note"
  title: string | null
  excerpt: string | null
  content: string
  weather: string | null
  date: string
  order: number
  readingTime: string
}

export interface TreeholeSectionView {
  id: string
  slug: string
  element: string
  title: string
  tone: string
  plannedTitles: string[]
  published: boolean
  order: number
  entries: TreeholeEntryView[]
}

export interface TreeholeBookHome {
  book: TreeholeBookView
  sections: TreeholeSectionView[]
  firstArticle?: { slug: string; title: string | null }
}

export interface TreeholeArticlePageData {
  book: TreeholeBookView
  article: TreeholeEntryView
  section: TreeholeSectionView
  notes: TreeholeEntryView[]
  previous: { slug: string; title: string | null } | null
  next: { slug: string; title: string | null } | null
}

type SectionRow = {
  id: string
  slug: string
  element: string
  title: string
  tone: string
  plannedTitles: string | null
  published: boolean
  order: number
  entries: Array<{
    id: string
    slug: string
    kind: string
    title: string | null
    excerpt: string | null
    content: string
    weather: string | null
    date: Date
    order: number
  }>
}

function readingTime(content: string) {
  const chars = content.replace(/\s+/g, "").length
  return `约 ${Math.max(1, Math.ceil(chars / 420))} 分钟`
}

function toEntryView(row: SectionRow["entries"][number]): TreeholeEntryView {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind === "note" ? "note" : "article",
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    weather: row.weather,
    date: row.date.toISOString(),
    order: row.order,
    readingTime: readingTime(row.content),
  }
}

function toSectionView(row: SectionRow): TreeholeSectionView {
  return {
    id: row.id,
    slug: row.slug,
    element: row.element,
    title: row.title,
    tone: row.tone,
    plannedTitles: (row.plannedTitles ?? "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
    published: row.published,
    order: row.order,
    entries: row.entries.map(toEntryView),
  }
}

function fallbackHome(): TreeholeBookHome {
  const sections: TreeholeSectionView[] = defaultTreeholeSections.map((section, sectionIndex) => {
    const articles = defaultTreeholeArticles.filter((item) => item.sectionSlug === section.slug)
    const notes = defaultTreeholeNotes.filter((item) => item.sectionSlug === section.slug)
    return {
      id: `fallback-section-${section.slug}`,
      slug: section.slug,
      element: section.element,
      title: section.title,
      tone: section.tone,
      plannedTitles: section.plannedTitles,
      published: true,
      order: (sectionIndex + 1) * 10,
      entries: [
        ...articles.map((item, index) => ({
          id: `fallback-article-${item.slug}`,
          slug: item.slug,
          kind: "article" as const,
          title: item.title,
          excerpt: item.description,
          content: item.content,
          weather: null,
          date: new Date(item.date).toISOString(),
          order: (index + 1) * 10,
          readingTime: item.readingTime,
        })),
        ...notes.map((item, index) => ({
          id: `fallback-note-${item.slug}`,
          slug: item.slug,
          kind: "note" as const,
          title: null,
          excerpt: null,
          content: item.content,
          weather: item.weather,
          date: new Date(item.date).toISOString(),
          order: (index + 1) * 10 + 5,
          readingTime: readingTime(item.content),
        })),
      ],
    }
  })

  const firstArticle = sections
    .flatMap((section) => section.entries)
    .find((entry) => entry.kind === "article")

  return {
    book: {
      title: defaultTreeholeBook.title,
      author: defaultTreeholeBook.author,
      subtitle: defaultTreeholeBook.subtitle,
      description: defaultTreeholeBook.description,
      coverStyle: "wind-cloud",
      defaultView: "cover",
    },
    sections,
    firstArticle: firstArticle && { slug: firstArticle.slug, title: firstArticle.title },
  }
}

export const getTreeholeBookHome = cache(async (): Promise<TreeholeBookHome> => {
  let rows: {
    config: {
      title: string
      author: string
      subtitle: string | null
      description: string
      coverStyle: string
      defaultView: string
    } | null
    sections: SectionRow[]
  } | null = null

  try {
    const [config, sections] = await Promise.all([
      prisma.treeholeBookConfig.findUnique({ where: { id: "singleton" } }),
      prisma.treeholeSection.findMany({
        where: { published: true },
        include: {
          entries: {
            where: { published: true },
            orderBy: [{ order: "asc" }, { date: "desc" }],
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    ])
    rows = { config, sections }
  } catch (error) {
    console.error("Fetch treehole book failed:", error)
  }

  if (!rows || !rows.config || rows.sections.length === 0) return fallbackHome()

  const firstArticle = rows.sections
    .flatMap((section) => section.entries)
    .find((entry) => entry.kind === "article")

  return {
    book: {
      title: rows.config.title,
      author: rows.config.author,
      subtitle: rows.config.subtitle ?? "",
      description: rows.config.description,
      coverStyle: rows.config.coverStyle,
      defaultView: rows.config.defaultView,
    },
    sections: rows.sections.map(toSectionView),
    firstArticle: firstArticle && { slug: firstArticle.slug, title: firstArticle.title },
  }
})

export const getTreeholeArticle = cache(async (slug: string): Promise<TreeholeArticlePageData | null> => {
  const home = await getTreeholeBookHome()
  const sections = home.sections
  const sectionIndex = sections.findIndex((section) =>
    section.entries.some((entry) => entry.slug === slug && entry.kind === "article"),
  )
  if (sectionIndex === -1) return null

  const section = sections[sectionIndex]
  const article = section.entries.find((entry) => entry.slug === slug && entry.kind === "article")
  if (!article) return null

  const flatArticles = sections.flatMap((item) =>
    item.entries
      .filter((entry) => entry.kind === "article")
      .map((entry) => ({ section: item, entry })),
  )
  const currentIndex = flatArticles.findIndex((item) => item.entry.slug === slug)
  const previous = currentIndex > 0 ? flatArticles[currentIndex - 1].entry : null
  const next =
    currentIndex >= 0 && currentIndex < flatArticles.length - 1
      ? flatArticles[currentIndex + 1].entry
      : null

  return {
    book: home.book,
    article,
    section,
    notes: section.entries.filter((entry) => entry.kind === "note"),
    previous: previous && { slug: previous.slug, title: previous.title },
    next: next && { slug: next.slug, title: next.title },
  }
})
