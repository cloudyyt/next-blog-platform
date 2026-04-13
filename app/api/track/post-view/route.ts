import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sha256 } from "@/lib/hash"

export const runtime = "nodejs"

type Body = {
  slug?: string
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body
    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    if (!slug) return new NextResponse(null, { status: 204 })

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!post) return new NextResponse(null, { status: 204 })

    const ip = getClientIp(request)
    const ua = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || undefined

    const salt = process.env.IP_HASH_SALT || "dev-salt-change-me"
    const ipHash = sha256(`${ip}:${salt}`)
    const uaHash = ua ? sha256(ua) : undefined

    const path = `/blog/${slug}`

    await prisma.$transaction([
      prisma.postViewEvent.create({
        data: {
          postId: post.id,
          ipHash,
          uaHash,
          referer,
          path,
        },
      }),
      prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Track post view error:", error)
    return new NextResponse(null, { status: 204 })
  }
}

