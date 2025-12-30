/**
 * 博客 API 接口
 * 预留接口位置，后续会替换为真实 API 调用
 */

import { BlogPost, Tag, Category, AuthorInfo, BlogConfig } from "../types/blog"

/**
 * 获取博客配置
 * GET /api/blog/config
 */
export async function getBlogConfig(): Promise<BlogConfig> {
  const response = await fetch('/api/blog/config', {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error('获取博客配置失败')
  }
  
  return response.json()
}

/**
 * 获取文章列表
 * GET /api/blog/posts?page=1&limit=10&tag=xxx&category=xxx
 */
export async function getPosts(params?: {
  page?: number
  limit?: number
  tag?: string
  category?: string
}): Promise<{ posts: BlogPost[]; total: number }> {
  const query = new URLSearchParams()
  
  if (params?.page) query.set('page', params.page.toString())
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.tag) query.set('tag', params.tag)
  if (params?.category) query.set('category', params.category)
  
  const response = await fetch(`/api/blog/posts?${query.toString()}`, {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error('获取文章列表失败')
  }
  
  const data = await response.json()
  return {
    posts: data.posts,
    total: data.total,
  }
}

/**
 * 获取单篇文章
 * GET /api/blog/posts/[slug]
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await fetch(`/api/blog/posts/${slug}`, {
    cache: 'no-store',
  })
  
  if (response.status === 404) {
    return null
  }
  
  if (!response.ok) {
    throw new Error('获取文章失败')
  }
  
  return response.json()
}

/**
 * 获取标签列表
 * GET /api/blog/tags
 */
export async function getTags(): Promise<Tag[]> {
  const response = await fetch('/api/blog/tags', {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error('获取标签列表失败')
  }
  
  return response.json()
}

/**
 * 获取分类列表
 * GET /api/blog/categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/blog/categories', {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error('获取分类列表失败')
  }
  
  return response.json()
}

/**
 * 获取热门文章
 * TODO: 替换为真实 API 调用
 * GET /api/blog/posts/popular?limit=5
 */
export async function getPopularPosts(limit: number = 5): Promise<BlogPost[]> {
  // TODO: 替换为真实 API
  // const response = await fetch(`/api/blog/posts/popular?limit=${limit}`)
  // return response.json()
  
  // 临时使用 mock 数据，返回最新的几篇
  const posts = await getPosts({ limit })
  return posts.posts
}

