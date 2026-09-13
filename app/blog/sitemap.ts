import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { GUIDE_SERIES } from "@/lib/guide/series"
import { getGuideRoutableSlugs } from "@/lib/guide/data"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    })

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    // 电子书：书架 + 各系列 landing + 全部可路由章节
    const guideEntries: MetadataRoute.Sitemap = []
    for (const meta of GUIDE_SERIES) {
      guideEntries.push({
        url: `${SITE_URL}/guides/${meta.key}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
      for (const slug of await getGuideRoutableSlugs(meta.key)) {
        guideEntries.push({
          url: `${SITE_URL}/guides/${meta.key}/${slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })
      }
    }

    return [
      {
        url: `${SITE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${SITE_URL}/blog/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/guides`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      ...postEntries,
      ...guideEntries,
    ]
  } catch (error) {
    console.error("Sitemap generation error:", error)
    return [
      {
        url: `${SITE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ]
  }
}
