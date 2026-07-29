/**
 * 认证相关类型定义
 */

export interface User {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  role: string
  createdAt: string
}

export interface LoginCredentials {
  name: string
  password: string
}

export interface RegisterData {
  name: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

