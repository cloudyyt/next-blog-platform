"use client"

import { useEffect, useState } from "react"

/**
 * 书卡上的真实阅读进度（localStorage，按系列 key 隔离）
 *
 * server 传入 series key + 可读章数，client 读 `${series}:visited` 统计。
 * SSR 首帧显示占位（0%），mount 后回填——避免水合不一致。
 */
export function BookProgress({
  series,
  readableTotal,
}: {
  series: string
  readableTotal: number
}) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${series}:visited`)
      if (raw) {
        const visited = new Set(JSON.parse(raw) as string[])
        setCount(visited.size)
      } else {
        setCount(0)
      }
    } catch {
      setCount(0)
    }
  }, [series])

  const c = count ?? 0
  const pct = readableTotal > 0 ? Math.round((c / readableTotal) * 100) : 0

  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] text-muted-foreground">阅读进度</span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {count === null ? "—" : `${Math.min(c, readableTotal)} / ${readableTotal}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${count === null ? 0 : pct}%` }}
        />
      </div>
    </div>
  )
}
