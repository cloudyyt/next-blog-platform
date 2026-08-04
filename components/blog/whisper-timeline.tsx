"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ChevronDown,
  Loader2,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSun,
  CloudFog,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Thought, WeatherKey } from "@/lib/types/about"

/**
 * 碎碎念时间线（文学手记风）
 *
 * 设计意图：
 * - 「树洞」里一些说不出口的话、不成篇的情绪，三天两头记一句。
 * - 单独开博文太重，这里用极简手记风承载：纯文字、衬线、居中、大留白。
 *
 * 数据流：
 * - 首屏数据由 server component 通过 props 传入（initialWhispers + total）。
 * - 加载更多 → fetch GET /api/blog/thoughts（仅 published，分页）。
 *
 * 动画：framer-motion whileInView 纯淡入，自动尊重 prefers-reduced-motion
 * （与 app/agent-guide/components/chapter-trail.tsx 同模式）。
 */

const WEATHER_ICONS: Record<WeatherKey, LucideIcon> = {
  sunny: Sun,
  "clear-night": Moon,
  cloudy: Cloud,
  "partly-cloudy": CloudSun,
  overcast: Cloud,
  rain: CloudRain,
  drizzle: CloudDrizzle,
  thunder: CloudLightning,
  snow: CloudSnow,
  fog: CloudFog,
  wind: Wind,
}

interface WhisperTimelineProps {
  initialWhispers: Thought[]
  total: number
  pageSize?: number
}

export function WhisperTimeline({
  initialWhispers,
  total,
  pageSize = 5,
}: WhisperTimelineProps) {
  const [visible, setVisible] = useState<Thought[]>(initialWhispers)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasMore = visible.length < total

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)

    const nextPage = page + 1
    try {
      const res = await fetch(
        `/api/blog/thoughts?page=${nextPage}&limit=${pageSize}`,
        { cache: "no-store" }
      )
      if (!res.ok) throw new Error("加载失败")
      const data = await res.json()
      if (data.thoughts?.length) {
        setVisible((prev) => [...prev, ...data.thoughts])
        setPage(nextPage)
      }
    } catch {
      setError("加载失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/*
        不再使用嵌套滚动：手记本就该从上往下顺读，
        让碎碎念随页面自然流动，整页只有一条滚动条（与首页一致）。
        加载更多用于按需追加较早的条目，避免首屏过长。
      */}
      <ul className="w-full space-y-0">
        {visible.map((w, i) => (
          <motion.li
            key={w.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center py-7"
          >
            {/* 日期 + 天气图标 */}
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <span className="font-display text-sm tracking-widest text-primary/70">
                {formatDateCN(w.createdAt)}
              </span>
              {w.weather && <WeatherIcon weather={w.weather} />}
            </div>
            {/* 诗化短句正文：用楷体栈，赋予中文手记的书法气质 */}
            <p className="font-kai text-lg sm:text-xl leading-loose text-foreground/90 whitespace-pre-wrap">
              {w.content}
            </p>

            {/* 条目分隔：渐变细线 + 中心菱形。
                用 --border（各主题专为可见分隔设计的 token）做线、--primary 做点缀，
                赛博霓虹/清风竹韵（明/暗）都能稳定可见，又保持手记的轻盈。 */}
            {i < visible.length - 1 && (
              <div
                className="mt-8 flex items-center justify-center gap-3"
                aria-hidden
              >
                <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-border/80" />
                <span className="w-1.5 h-1.5 rotate-45 rounded-[2px] bg-primary/50" />
                <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-border/80" />
              </div>
            )}
          </motion.li>
        ))}
      </ul>

      {/* 加载更多 / 已全部 */}
      {hasMore ? (
        <button
          onClick={loadMore}
          disabled={loading}
          className={cn(
            "group mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full",
            "border border-border/60 bg-transparent",
            "text-sm text-muted-foreground",
            "hover:text-foreground hover:border-primary/40 hover:bg-accent/40",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "cursor-pointer",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>加载中</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
              <span>往下翻</span>
              <span className="tabular-nums">({visible.length}/{total})</span>
            </>
          )}
        </button>
      ) : (
        /* 结尾：沿用条目分隔的菱形语言，收束全篇 */
        <div className="mt-6 flex items-center justify-center gap-3" aria-hidden>
          <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-border/80" />
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground/60 select-none">
            完
          </span>
          <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-border/80" />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  )
}

/**
 * 天气图标。
 * 跟随 primary 主题色（赛博霓虹=青、清风竹韵=竹绿），比 emoji 清晰且跨平台一致。
 * 浅色圆形底 + 细线条，手记风的轻盈质感。
 */
function WeatherIcon({ weather }: { weather: WeatherKey }) {
  const Icon = WEATHER_ICONS[weather] ?? Sun
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "w-6 h-6 rounded-full",
        "bg-primary/10 ring-1 ring-primary/15",
      )}
    >
      <Icon
        className="w-4 h-4 text-primary/70"
        strokeWidth={1.25}
        aria-hidden
      />
    </span>
  )
}

/** 把 ISO 日期格式化为中文「2026年8月3日」——始终带年份，时间久了也能分清 */
function formatDateCN(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
