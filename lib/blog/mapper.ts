/**
 * Prisma Post 行 → 前端 BlogPost DTO 的统一映射。
 *
 * 此前同一套映射（author 补空 email、日期 toISOString 等）在
 * blog 列表页 / 详情页 / blog API / search API 各写了一遍，
 * 字段调整时容易漏改，统一收口到这里。
 */
import type { BlogPost } from "@/lib/types/blog"

/** mapper 要求的最小行形状（findMany/findUnique 带 author/categories/tags 即满足） */
export interface PostRow {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  encrypted: boolean
  viewCount: number
  authorId: string
  author: {
    id: string
    name: string | null
  }
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  createdAt: Date
  updatedAt: Date
}

export function toBlogPost(post: PostRow): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    published: post.published,
    encrypted: post.encrypted,
    viewCount: post.viewCount,
    authorId: post.authorId,
    author: {
      id: post.author.id,
      name: post.author.name,
      email: "", // BlogPost 类型历史字段，展示层未使用，保留兼容
    },
    categories: post.categories,
    tags: post.tags,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

export function toBlogPosts(posts: PostRow[]): BlogPost[] {
  return posts.map(toBlogPost)
}
