import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/* Random Post */
function getRequestOrigin(request: Request): string {
  const headers = request.headers
  const proto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = forwardedHost || headers.get("host")?.split(",")[0]?.trim()

  if (proto && host) return `${proto}://${host}`
  if (host) return `http://${host}`
  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const origin = getRequestOrigin(request)
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

