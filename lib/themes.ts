/**
 * 视觉主题配置
 * 与 next-themes 的 light/dark 模式独立，可组合使用
 */

export type VisualTheme = "cyber-neon" | "tranquil-ink"

export interface ThemeConfig {
  id: VisualTheme
  name: string
  description: string
  // 是否在移动端简化效果
  mobileOptimized: boolean
  // 是否需要性能检测
  requiresPerformanceCheck: boolean
}

export const visualThemes: Record<VisualTheme, ThemeConfig> = {
  "cyber-neon": {
    id: "cyber-neon",
    name: "赛博霓虹",
    description: "未来科技感，霓虹网格和数字粒子",
    mobileOptimized: true,
    requiresPerformanceCheck: true,
  },
  "tranquil-ink": {
    id: "tranquil-ink",
    name: "清风竹韵",
    description: "竹青黛墨，溪山薄雾，清爽宜人",
    mobileOptimized: true,
    requiresPerformanceCheck: false,
  },
}

export const defaultVisualTheme: VisualTheme = "cyber-neon"

/**
 * 检测设备性能等级
 * 返回 'high' | 'medium' | 'low'
 */
export function detectDevicePerformance(): "high" | "medium" | "low" {
  if (typeof window === "undefined") return "medium"

  // 检测硬件并发数（CPU核心数）
  const hardwareConcurrency = navigator.hardwareConcurrency || 2

  // 检测设备内存（如果支持）
  const deviceMemory = (navigator as any).deviceMemory || 4

  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  // 综合判断
  if (isMobile) {
    if (hardwareConcurrency >= 6 && deviceMemory >= 4) {
      return "high"
    } else if (hardwareConcurrency >= 4 && deviceMemory >= 2) {
      return "medium"
    }
    return "low"
  }

  // 桌面设备通常性能较好
  if (hardwareConcurrency >= 8) return "high"
  if (hardwareConcurrency >= 4) return "medium"
  return "low"
}

/**
 * 检测用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * 判断是否应该使用简化效果
 */
export function shouldUseSimplifiedEffects(
  theme: VisualTheme,
  performance: "high" | "medium" | "low"
): boolean {
  const config = visualThemes[theme]

  // 如果用户偏好减少动画，使用简化效果
  if (prefersReducedMotion()) return true

  // 如果主题不需要性能检测，直接返回
  if (!config.requiresPerformanceCheck) return false

  // 低性能设备使用简化效果
  if (performance === "low") return true

  // 中等性能设备在移动端使用简化效果
  if (performance === "medium" && typeof window !== "undefined") {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    return isMobile
  }

  return false
}
