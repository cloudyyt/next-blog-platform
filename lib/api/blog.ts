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
  
  // 添加超时处理，增加到 8 秒以适应 Vercel 冷启动
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
  
  try {
    const response = await fetch(`/api/blog/posts?${query.toString()}`, {
      cache: 'no-store',
      signal: controller.signal,
      // 添加 headers 确保请求正确
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      // 请求失败时返回空数据
      console.warn(`Failed to fetch posts: ${response.status} ${response.statusText}`)
      return {
        posts: [],
        total: 0,
      }
    }
    
    const data = await response.json()
    return {
      posts: data.posts || [],
      total: data.total || 0,
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    // 任何错误（超时、网络错误等）都返回空数据，确保页面能正常显示
    if (error.name !== 'AbortError') {
      console.error('Failed to fetch posts:', error)
    }
    return {
      posts: [],
      total: 0,
    }
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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
  
  try {
    const response = await fetch('/api/blog/tags', {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn(`Failed to fetch tags: ${response.status} ${response.statusText}`)
      return [] // 请求失败返回空数组
    }
    
    return response.json() || []
  } catch (error: any) {
    clearTimeout(timeoutId)
    // 任何错误都返回空数组，确保页面能正常显示
    if (error.name !== 'AbortError') {
      console.error('Failed to fetch tags:', error)
    }
    return []
  }
}

/**
 * 获取分类列表
 * GET /api/blog/categories
 */
export async function getCategories(): Promise<Category[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时
  
  try {
    const response = await fetch('/api/blog/categories', {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      return [] // 请求失败返回空数组
    }
    
    return response.json() || []
  } catch (error: any) {
    clearTimeout(timeoutId)
    // 任何错误都返回空数组，确保页面能正常显示
    if (error.name !== 'AbortError') {
      console.error('Failed to fetch categories:', error)
    }
    return []
  }
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

