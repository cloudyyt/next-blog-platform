/**
 * 博客相关类型定义
 * 基于 Prisma schema，用于前端展示
 */

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  authorId: string
  author: {
    id: string
    name: string | null
    email: string
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
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  postCount?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  postCount?: number
}

export interface AuthorInfo {
  id: string
  name: string | null
  email: string
  avatar?: string | null
  bio?: string | null
  socialLinks?: {
    github?: string
    twitter?: string
    website?: string
  }
  postCount?: number
}

export interface BlogConfig {
  siteName: string
  siteDescription: string
  author: AuthorInfo
}

