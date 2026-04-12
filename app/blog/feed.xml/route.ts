import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.example.com"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true } },
        categories: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const items = posts
      .map(
        (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || post.content.slice(0, 200).replace(/[#*\n]/g, " ")}]]></description>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      ${post.author.name ? `<author>${post.author.name}</author>` : ""}
      ${post.categories.map((c) => `<category>${c.name}</category>`).join("\n      ")}
    </item>`
      )
      .join("\n")

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>大胖天的树洞</title>
    <link>${SITE_URL}/blog</link>
    <description>个人博客 - 技术分享与生活记录</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("RSS feed generation error:", error)
    return new NextResponse("RSS feed generation failed", { status: 500 })
  }
}
