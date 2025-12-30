/**
 * 评论相关类型定义
 */

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author: {
    id: string
    name: string
  }
  parentId: string | null
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface CreateCommentData {
  content: string
  postId: string
  parentId?: string | null
}

