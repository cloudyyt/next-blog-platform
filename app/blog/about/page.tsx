import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"
import { getAboutConfigOrDefault, getPublishedThoughts } from "@/lib/about/data"
import { AboutClient } from "@/components/blog/about-client"
import { SITE_PROFILE } from "@/lib/site-profile"
import type { Thought } from "@/lib/types/about"

/**
 * 关于页（server component）
 *
 * 数据：
 * - 作者头像/名字：取首个 admin User（与 /api/blog/config 同逻辑），缺失用 SITE_PROFILE 默认。
 * - tagline / 关于我文案：AboutConfig 单例（缺失用默认值）。
 * - 碎碎念首屏：getPublishedThoughts(1, 5) + total。
 * 全部交给 AboutClient 渲染。
 */
export const revalidate = 120

export default async function AboutPage() {
  const [authorRow, config, thoughtsPage] = await Promise.all([
    safeQuery(
      prisma.user.findFirst({
        where: { role: "admin" },
        select: { name: true, avatar: true },
      }),
      null,
      3000
    ),
    getAboutConfigOrDefault(),
    getPublishedThoughts(1, 5),
  ])

  const authorName = authorRow?.name ?? SITE_PROFILE.author.name
  const authorAvatar = authorRow?.avatar ?? null
  const social = await getAuthorSocial()

  return (
    <AboutClient
      authorName={authorName}
      authorAvatar={authorAvatar}
      tagline={config.tagline}
      intro={config.intro}
      github={social.github}
      website={social.website}
      initialWhispers={thoughtsPage.thoughts as Thought[]}
      total={thoughtsPage.total}
    />
  )
}

/** 作者社交链接：当前没有独立表，从 SITE_PROFILE 取 github；website 暂无来源 */
async function getAuthorSocial(): Promise<{ github: string | null; website: string | null }> {
  return {
    github: SITE_PROFILE.links.github ?? null,
    website: null,
  }
}
