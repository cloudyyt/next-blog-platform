"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown, Loader2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LifeCategoryView, LifeFeedItem } from "@/lib/types/life"

/**
 * 树洞时间线 feed（client）
 *
 * - 分区 chips：全部 + 各分区，切换走 query（?c=key，SSR 友好、可分享）
 * - 短记（title 空）：时间线小卡——圆点连线 + 日期/分区徽章 + 正文 + 配图
 * - 长文（有 title）：大卡——标题 + 摘要 + 封面（images[0]），点击进详情
 * - 加载更多：fetch /api/blog/life-posts 追加
 */
const PAGE_SIZE = 10

/** 分区图标（lucide） */
import { Gamepad2, Clapperboard, Feather, CircleDot } from "lucide-react"
const CATEGORY_ICONS: Record<string, typeof Gamepad2> = {
  game: Gamepad2,
  anime: Clapperboard,
  essay: Feather,
}

export function TreeholeFeed({
  categories,
  activeKey,
  initialItems,
  total,
}: {
  categories: LifeCategoryView[]
  activeKey?: string
  initialItems: LifeFeedItem[]
  total: number
}) {
  const [items, setItems] = useState(initialItems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const hasMore = items.length < total

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(PAGE_SIZE),
      })
      if (activeKey) params.set("category", activeKey)
      const res = await fetch(`/api/blog/life-posts?${params}`, {
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        if (data.posts?.length) {
          setItems((prev) => [
            ...prev,
            ...data.posts.map((p: LifeFeedItem & { content: string }) => ({
              ...p,
              excerpt:
                p.description?.trim() ||
                p.content.replace(/\s+/g, " ").slice(0, 80) + "…",
            })),
          ])
          setPage(page + 1)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* ─── 轻 hero ─────────────────────── */}
      <section className="mb-6 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight mb-2">
          树<span className="text-primary">洞</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
          技术之外——游戏、动漫、随笔，所见所闻所感，随手记下。
        </p>
      </section>

      {/* ─── 分区 chips ──────────────────── */}
      <nav className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-border/40">
        <CategoryChip label="全部" href="/treehole" active={!activeKey} icon={null} />
        {categories.map((c) => {
          const Icon = CATEGORY_ICONS[c.key] ?? CircleDot
          return (
            <CategoryChip
              key={c.key}
              label={c.name}
              href={`/treehole?c=${c.key}`}
              active={activeKey === c.key}
              icon={<Icon className="w-3.5 h-3.5" />}
            />
          )
        })}
      </nav>

      {/* ─── 时间线 ─────────────────────── */}
      <div className="relative">
        {/* 左侧连线（贯穿全部条目） */}
        <span
          className="absolute left-[7px] top-4 bottom-4 w-px bg-border/50"
          aria-hidden
        />

        <ul className="space-y-6">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.2) }}
              className="relative pl-8"
            >
              {/* 节点圆点 */}
              <span
                className="absolute left-0 top-2 w-[15px] h-[15px] rounded-full bg-primary ring-4 ring-background"
                aria-hidden
              />

              {/* 元信息行：日期 + 分区 */}
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-display text-xs tracking-wide text-primary/70">
                  {formatDateCN(item.date)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/60 text-muted-foreground">
                  {item.categoryName}
                </span>
              </div>

              <PostCard item={item} />
            </motion.li>
          ))}
        </ul>
      </div>

      {/* 空态 */}
      {items.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground/60">
          这个分区还没有内容。
        </div>
      )}

      {/* 加载更多 */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-full",
              "border border-border/60 text-sm text-muted-foreground",
              "hover:text-foreground hover:border-primary/40 hover:bg-accent/40",
              "transition-all cursor-pointer disabled:opacity-60",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>加载中</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>再翻翻</span>
                <span className="tabular-nums">({items.length}/{total})</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── 统一卡型：左封面 + 右标题/概述 + 右下角读全文 ──
 * 短记（title 空）：首行截断作标题，正文作概述，无图用分区色渐变+图标占位
 * 长文：title/description，封面取 images[0]
 */
function PostCard({ item }: { item: LifeFeedItem }) {
  const cover = item.images[0]
  const Icon = CATEGORY_ICONS[item.categoryKey] ?? CircleDot
  // 短记标题：正文首行截断
  const title = item.title ?? firstLine(item.content)
  const excerpt = item.title
    ? item.excerpt
    : item.content.replace(/\n+/g, " ").trim()

  const inner = (
    <>
      {/* 左：封面 / 渐变占位 */}
      <div className="relative w-full sm:w-44 h-36 sm:h-auto sm:min-h-[132px] shrink-0 overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/25 flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary/40" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* 右：标题 + 概述 */}
      <div className="flex flex-col flex-1 min-w-0 p-4">
        <h2 className="text-base font-bold font-display leading-snug mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 flex-1">
          {excerpt}
        </p>
        {/* 读全文：右下角 */}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary self-end mt-2">
          读全文
          <BookOpen className="w-3.5 h-3.5" />
        </span>
      </div>
    </>
  )

  // 长文进详情页；短记（无独立详情页）不可点整卡
  if (item.title) {
    return (
      <Link
        href={`/treehole/${item.id}`}
        className={cn(
          "group flex flex-col sm:flex-row rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-soft",
          "overflow-hidden transition-all cursor-pointer",
          "hover:shadow-soft-lg hover:border-primary/30 hover:-translate-y-0.5",
        )}
      >
        {inner}
      </Link>
    )
  }
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-soft",
        "overflow-hidden",
      )}
    >
      {inner}
    </div>
  )
}

/** 正文首行（≤22 字截断） */
function firstLine(content: string): string {
  const line = content.trim().split("\n")[0]
  return line.length > 22 ? `${line.slice(0, 22)}…` : line
}

/* ─── chips ──────────────────────────── */

function CategoryChip({
  label,
  href,
  active,
  icon,
}: {
  label: string
  href: string
  active: boolean
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
        "border transition-all cursor-pointer",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/40",
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

/** ISO → 「2026年9月14日」 */
function formatDateCN(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
