import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { PostContent } from "@/components/blog/post-content"
import { getLifePost } from "@/lib/life/data"
import { stripLeadingH1 } from "@/lib/utils/content"

/**
 * 树洞长文详情：/treehole/[id]
 * 与电子书章节页同一阅读体验（毛玻璃纸面 + prose）。
 */
export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getLifePost(id)
  if (!post) return { title: "未找到" }
  return {
    title: post.title ?? "树洞",
    description: post.description ?? undefined,
  }
}

export default async function TreeholePostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getLifePost(id)
  if (!post || !post.title) notFound() // 短记无详情页

  return (
    <article className="max-w-4xl mx-auto">
      <div className="rounded-xl border border-border/60 bg-background shadow-soft px-6 py-8 sm:px-10 sm:py-12">
        {/* 面包屑 */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4"
        >
          <Link
            href="/treehole"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            树洞
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-muted-foreground/80">{post.categoryName}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-2xl sm:text-3xl font-bold font-kai leading-tight mb-3">
          {post.title}
        </h1>

        {/* 日期 */}
        <p className="text-xs text-muted-foreground mb-6 pb-5 border-b border-border/60">
          {new Date(post.date).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* 正文 */}
        <div className="prose prose-lg max-w-none min-w-0 font-kai [&_h2]:font-kai [&_h3]:font-kai [&_strong]:font-kai">
          <PostContent content={stripLeadingH1(post.content)} />
        </div>

        {/* 返回 */}
        <div className="mt-12 pt-6 border-t border-border/60 text-center">
          <Link
            href="/treehole"
            className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            ← 回树洞
          </Link>
        </div>
      </div>
    </article>
  )
}
