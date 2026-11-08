import { prisma } from "@/lib/prisma"
import type { InspirationTopicSummary } from "@/lib/types/inspiration"

export const INSPIRATION_ITEM_TYPES = ["text", "image", "audio"] as const
export const INSPIRATION_ITEM_STATUSES = ["inbox", "topic", "draft", "incubated", "archived"] as const
export const INSPIRATION_TOPIC_STATUSES = ["growing", "draft", "published", "archived"] as const

export type InspirationTopicRow = Awaited<ReturnType<typeof prisma.inspirationTopic.findFirst>> & {
  items: unknown[]
  draftLinks: unknown[]
}

export function normalizeTags(input: unknown): string[] {
  const raw = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[,，\s]+/)
      : []

  return Array.from(
    new Set(
      raw
        .map((tag) => String(tag ?? "").trim().replace(/^#/, ""))
        .filter(Boolean)
        .map((tag) => tag.slice(0, 24)),
    ),
  ).slice(0, 8)
}

export async function getInspirationTopicSummaries(): Promise<InspirationTopicSummary[]> {
  const topics = await prisma.inspirationTopic.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { items: true } },
      draftLinks: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          entry: {
            select: { id: true, title: true, published: true },
          },
        },
      },
    },
  })

  return topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    status: topic.status as InspirationTopicSummary["status"],
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    itemCount: topic._count.items,
    draftEntry: topic.draftLinks[0]?.entry ?? null,
  }))
}

export function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value)
}
