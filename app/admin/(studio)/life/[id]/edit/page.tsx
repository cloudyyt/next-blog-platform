import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LifeWritingStudio } from "@/components/admin/life-writing-studio"

/**
 * 树洞手记编辑 —— 服务端直接取数据，进入书房即见内容
 */
export const dynamic = "force-dynamic"

export default async function EditLifePostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [post, categories] = await Promise.all([
    prisma.lifePost.findUnique({
      where: { id },
      select: {
        categoryId: true,
        title: true,
        description: true,
        content: true,
        images: true,
        date: true,
        published: true,
      },
    }),
    prisma.lifeCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, key: true, name: true },
    }),
  ])

  if (!post) notFound()

  const images = Array.isArray(post.images)
    ? (post.images as unknown[]).filter((u): u is string => typeof u === "string")
    : []

  return (
    <LifeWritingStudio
      mode="edit"
      postId={id}
      categories={categories}
      initialData={{
        categoryId: post.categoryId,
        title: post.title,
        description: post.description,
        content: post.content,
        images,
        date: post.date.toISOString(),
        published: post.published,
      }}
    />
  )
}
