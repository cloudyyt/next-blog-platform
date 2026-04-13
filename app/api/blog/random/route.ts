import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  try {
    const total = await prisma.post.count({ where: { published: true } })
    if (total <= 0) {
      return NextResponse.redirect(new URL("/blog", origin), 307)
    }

    const skip = Math.floor(Math.random() * total)
    const post = await prisma.post.findFirst({
      where: { published: true },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      skip,
    })

    const slug = post?.slug
    if (!slug) {
      return NextResponse.redirect(new URL("/blog", origin), 307)
    }

    return NextResponse.redirect(new URL(`/blog/${slug}`, origin), 307)
  } catch (error) {
    console.error("Random post redirect error:", error)
    return NextResponse.redirect(new URL("/blog", origin), 307)
  }
}

