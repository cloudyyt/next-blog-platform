/**
 * 数据库工具函数：超时与安全查询（适配 Vercel Serverless 冷启动）
 */

/**
 * 带超时的数据库查询，可选超时后返回默认值
 * @param promise 查询 Promise
 * @param timeoutMs 超时时间（毫秒），默认 8000
 * @param fallback 超时时返回的默认值（不传则 reject）
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000,
  fallback?: T
): Promise<T> {
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (fallback !== undefined) {
        console.warn(`Database query timeout after ${timeoutMs}ms, using fallback`)
        resolve(fallback)
      } else {
        reject(new Error(`Database query timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

/**
 * 安全执行数据库查询，失败或超时返回默认值
 */
export async function safeQuery<T>(
  query: Promise<T>,
  defaultValue: T,
  timeoutMs: number = 5000
): Promise<T> {
  try {
    return await withTimeout(query, timeoutMs, defaultValue)
  } catch (error: unknown) {
    console.error('Database query failed:', error)
    return defaultValue
  }
}
