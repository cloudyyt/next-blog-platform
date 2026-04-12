/**
 * 博客文章详情页 - 服务端组件版本
 * 在服务端从 Prisma 直接获取数据，支持 SEO 元数据
 */
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { PostContent } from "@/components/blog/post-content"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { RelatedPosts } from "@/components/blog/related-posts"
import { CommentSection } from "@/components/blog/comment-section"
import { PostDetailClient } from "./post-detail-client"
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostDetailPageProps {
  params: Promise<{ slug: string }>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.example.com"

async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true },
      },
      categories: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

  if (!post) return null

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    published: post.published,
    authorId: post.authorId,
    author: {
      id: post.author.id,
      name: post.author.name,
      email: "",
    },
    categories: post.categories,
    tags: post.tags,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

async function getRelatedPosts(postId: string, categorySlug?: string) {
  try {
    const where: any = {
      published: true,
      id: { not: postId },
    }

    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true } },
        categories: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      published: p.published,
      authorId: p.authorId,
      author: { id: p.author.id, name: p.author.name, email: "" },
      categories: p.categories,
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch related posts:", error)
    return []
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function estimateReadingTime(content: string) {
  return Math.ceil(content.length / 200) || 1
}

// ---------------------------------------------------------------------------
// generateMetadata – SEO
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "文章未找到",
      description: "请求的文章不存在。",
    }
  }

  const title = post.title
  const description =
    post.excerpt || post.content.slice(0, 160).replace(/[#*\n]/g, " ")
  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "大胖天的树洞",
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name || "匿名"],
      tags: post.tags.map((t) => t.name),
      ...(post.coverImage
        ? { images: [{ url: post.coverImage, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
    alternates: {
      canonical: url,
    },
  }
}

// ---------------------------------------------------------------------------
// Page component – server-side
// ---------------------------------------------------------------------------

export const revalidate = 120

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.published) {
    notFound()
  }

  const [relatedPosts] = await Promise.all([
    getRelatedPosts(post.id, post.categories[0]?.slug),
  ])

  const readingTime = estimateReadingTime(post.content)

  return (
    <>
      {/* Client-side interactive shell (reading progress, share, back-to-top) */}
      <PostDetailClient title={post.title} />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ---- Main content ---- */}
          <article className="lg:col-span-8 space-y-6">
            {/* Header */}
            <header className="space-y-6">
              {/* Categories */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.slug}`}
                      className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author.name || "匿名"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.createdAt}>
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>约 {readingTime} 分钟</span>
                </div>
              </div>

              {/* Cover image */}
              {post.coverImage && (
                <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
            </header>

            {/* Post body */}
            <div className="prose prose-lg max-w-none">
              <PostContent content={post.content} />
            </div>

            {/* Footer / Tags */}
            <footer className="space-y-6 pt-8 border-t">
              {post.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/blog?tag=${tag.slug}`}
                        className="text-sm px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </footer>

            {/* Comments */}
            <div id="comments" className="mt-8 pt-8 border-t scroll-mt-20">
              <CommentSection postId={post.id} />
            </div>
          </article>

          {/* ---- Sidebar ---- */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-4 space-y-6">
              <TableOfContents content={post.content} />
              {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
