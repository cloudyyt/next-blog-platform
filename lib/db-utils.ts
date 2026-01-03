/**
 * 数据库工具函数
 * 用于处理超时和错误
 */

import { PrismaClient } from '@prisma/client'

/**
 * 带超时的数据库查询
 * @param query 数据库查询 Promise
 * @param timeoutMs 超时时间（毫秒），默认 3 秒
 * @returns 查询结果
 */
export async function withTimeout<T>(
  query: Promise<T>,
  timeoutMs: number = 3000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('数据库查询超时')), timeoutMs)
  })

  try {
    return await Promise.race([query, timeoutPromise])
  } catch (error: any) {
    // 如果是超时错误，抛出特殊错误
    if (error.message === '数据库查询超时') {
      throw new Error('数据库连接超时，请检查数据库配置')
    }
    throw error
  }
}

/**
 * 安全执行数据库查询，失败时返回默认值
 * @param query 数据库查询 Promise
 * @param defaultValue 默认值
 * @param timeoutMs 超时时间（毫秒），默认 3 秒
 * @returns 查询结果或默认值
 */
export async function safeQuery<T>(
  query: Promise<T>,
  defaultValue: T,
  timeoutMs: number = 3000
): Promise<T> {
  try {
    return await withTimeout(query, timeoutMs)
  } catch (error: any) {
    console.error('Database query failed:', error)
    return defaultValue
  }
}

