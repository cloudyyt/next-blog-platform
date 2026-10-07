import { prisma } from "@/lib/prisma"
import type { TreeholeAdminConfig, TreeholeAdminSection } from "@/components/admin/treehole/types"

export async function getTreeholeAdminData() {
  const [config, sections] = await Promise.all([
    prisma.treeholeBookConfig.findUnique({ where: { id: "singleton" } }),
    prisma.treeholeSection.findMany({
      include: { entries: { orderBy: [{ order: "asc" }, { date: "desc" }] } },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ])

  const bookConfig: TreeholeAdminConfig = {
    title: config?.title ?? "因为这就是你的人生",
    author: config?.author ?? "zijieLeo",
    subtitle: config?.subtitle ?? "风与云",
    description:
      config?.description ??
      "把那些没处放的记录，装进一本会呼吸的书。四季是情绪的章节，不是日历的章节。",
    coverStyle: config?.coverStyle ?? "wind-cloud",
    defaultView: config?.defaultView ?? "cover",
  }

  const mappedSections: TreeholeAdminSection[] = sections.map((section) => ({
    id: section.id,
    slug: section.slug,
    element: section.element,
    title: section.title,
    tone: section.tone,
    plannedTitles: section.plannedTitles ?? "",
    published: section.published,
    order: section.order,
    entries: section.entries.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      sectionId: entry.sectionId,
      kind: entry.kind === "note" ? "note" : "article",
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      weather: entry.weather,
      date: entry.date.toISOString(),
      published: entry.published,
      order: entry.order,
    })),
  }))

  return { config: bookConfig, sections: mappedSections }
}

export async function getTreeholeAdminEntry(id: string) {
  const entry = await prisma.treeholeEntry.findUnique({ where: { id } })
  if (!entry) return null
  return {
    id: entry.id,
    slug: entry.slug,
    sectionId: entry.sectionId,
    kind: entry.kind === "note" ? ("note" as const) : ("article" as const),
    title: entry.title,
    excerpt: entry.excerpt,
    content: entry.content,
    weather: entry.weather,
    date: entry.date.toISOString(),
    published: entry.published,
    order: entry.order,
  }
}
