/**
 * 基于内存的简易 Rate Limiter
 * 使用滑动窗口算法，按 IP 限制请求频率
 * 适用于单实例部署（个人博客足够）
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// 每 5 分钟清理一次过期记录，防止内存泄漏
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}, 5 * 60_000)

export interface RateLimitOptions {
  /** 时间窗口（毫秒），默认 60_000 (1分钟) */
  windowMs?: number
  /** 窗口内最大请求数，默认 5 */
  maxRequests?: number
}

/**
 * 检查请求是否超过频率限制
 * @returns { limited: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {}
): { limited: boolean; remaining: number; resetAt: number } {
  const { windowMs = 60_000, maxRequests = 5 } = options

  const ip = getClientIp(request)
  const key = ip
  const now = Date.now()

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // 清除窗口外的旧记录
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

  const remaining = Math.max(0, maxRequests - entry.timestamps.length)
  const oldestInWindow =
    entry.timestamps.length > 0 ? entry.timestamps[0] : now
  const resetAt = oldestInWindow + windowMs

  if (entry.timestamps.length >= maxRequests) {
    return { limited: true, remaining: 0, resetAt }
  }

  // 记录本次请求
  entry.timestamps.push(now)

  return { limited: false, remaining: remaining - 1, resetAt }
}

/**
 * 创建 429 响应
 */
export function rateLimitResponse(resetAt: number): Response {
  return new Response(
    JSON.stringify({ message: "请求过于频繁，请稍后再试" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  )
}

function getClientIp(request: Request): string {
  // 优先从代理头中获取真实 IP
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  return "unknown"
}
