import { PrismaClient } from "@prisma/client"
import {
  defaultTreeholeArticles,
  defaultTreeholeBook,
  defaultTreeholeNotes,
  defaultTreeholeSections,
} from "../lib/treehole/defaults"

const prisma = new PrismaClient()

async function main() {
  await prisma.treeholeBookConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      title: defaultTreeholeBook.title,
      author: defaultTreeholeBook.author,
      subtitle: defaultTreeholeBook.subtitle,
      description: defaultTreeholeBook.description,
      coverStyle: "wind-cloud",
      defaultView: "cover",
    },
  })

  for (const [index, section] of defaultTreeholeSections.entries()) {
    await prisma.treeholeSection.upsert({
      where: { slug: section.slug },
      update: {
        element: section.element,
        title: section.title,
        tone: section.tone,
        plannedTitles: section.plannedTitles.join("\n"),
        published: true,
        order: (index + 1) * 10,
      },
      create: {
        slug: section.slug,
        element: section.element,
        title: section.title,
        tone: section.tone,
        plannedTitles: section.plannedTitles.join("\n"),
        published: true,
        order: (index + 1) * 10,
      },
    })
  }

  const entries = [
    ...defaultTreeholeArticles.map((article) => ({
      ...article,
      kind: "article",
      weather: null as string | null,
    })),
    ...defaultTreeholeNotes.map((note) => ({
      ...note,
      kind: "note",
      excerpt: null as string | null,
    })),
  ]

  for (const [index, entry] of entries.entries()) {
    const section = await prisma.treeholeSection.findUnique({
      where: { slug: entry.sectionSlug },
      select: { id: true },
    })
    if (!section) throw new Error(`Section not found: ${entry.sectionSlug}`)

    await prisma.treeholeEntry.upsert({
      where: { slug: entry.slug },
      update: {
        sectionId: section.id,
        kind: entry.kind,
        title: "title" in entry ? entry.title : null,
        excerpt: "description" in entry ? entry.description : null,
        content: entry.content,
        weather: entry.weather,
        date: new Date(entry.date),
        published: true,
        order: (index + 1) * 10,
      },
      create: {
        slug: entry.slug,
        sectionId: section.id,
        kind: entry.kind,
        title: "title" in entry ? entry.title : null,
        excerpt: "description" in entry ? entry.description : null,
        content: entry.content,
        weather: entry.weather,
        date: new Date(entry.date),
        published: true,
        order: (index + 1) * 10,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
