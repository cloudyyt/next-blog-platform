import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toBlogPosts } from "@/lib/blog/mapper"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [], total: 0 })
  }

  const keyword = q.toLowerCase()

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { excerpt: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
          { tags: { some: { name: { contains: keyword, mode: "insensitive" } } } },
          { categories: { some: { name: { contains: keyword, mode: "insensitive" } } } },
        ],
      },
      include: {
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    })

    const formatted = toBlogPosts(posts)

    return NextResponse.json({ posts: formatted, total: formatted.length })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ posts: [], total: 0 }, { status: 500 })
  }
}
