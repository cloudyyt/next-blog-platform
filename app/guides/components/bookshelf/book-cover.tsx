import {
  Compass,
  Layers,
  Workflow,
  Blocks,
  Link2,
  Hammer,
  Library,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * CSS 生成的书封（纯展示组件，书架 / 书目页共用）
 *
 * 竖版 2:3，系列主题色封面 + 奶油纸文字 + 暖金装饰线；
 * 右侧奶油纸页截面 + 左侧书脊压痕 → 实体书厚度感。
 * 零图片依赖：书名改了封面跟着改，深浅色恒定（书房世界固定浅色）。
 */

const ICONS: Record<string, LucideIcon> = {
  Compass,
  Layers,
  Workflow,
  Blocks,
  Link2,
  Hammer,
}

export interface BookPalette {
  from: string
  to: string
  text: string
  accent: string
}

export const SERIES_PALETTES: Record<string, BookPalette> = {
  "agent-guide": {
    from: "#2C5980",
    to: "#1C3D5C",
    text: "#F5EDDC",
    accent: "#D9A85C",
  },
  "agent-stack": {
    from: "#37624A",
    to: "#24422F",
    text: "#F5EDDC",
    accent: "#D9A85C",
  },
}

export function getBookPalette(series: string): BookPalette {
  return (
    SERIES_PALETTES[series] ?? {
      from: "#4A5568",
      to: "#2D3748",
      text: "#F5EDDC",
      accent: "#D9A85C",
    }
  )
}

export function getSeriesIcon(iconName?: string): LucideIcon {
  return (iconName && ICONS[iconName]) || Library
}

interface BookCoverProps {
  title: string
  subtitle?: string | null
  badge?: string
  iconName?: string
  palette: BookPalette
  /** 阅读进度圆环（null = 不显示） */
  progressPct?: number | null
  done?: boolean
  /** detail 尺寸放大字号（书目页大封面） */
  size?: "shelf" | "detail"
  className?: string
}

export function BookCover({
  title,
  subtitle,
  badge,
  iconName,
  palette,
  progressPct = null,
  done = false,
  size = "shelf",
  className,
}: BookCoverProps) {
  const Icon = getSeriesIcon(iconName)
  const R = 10
  const C = 2 * Math.PI * R

  return (
    <div
      className={cn(
        "relative aspect-[2/3] rounded-l-[3px] rounded-r-md",
        size === "detail" && "rounded-l-[4px] rounded-r-lg",
        className
      )}
      style={{
        boxShadow:
          size === "detail"
            ? "0 20px 32px -14px rgba(58,34,14,0.55), 0 3px 8px rgba(58,34,14,0.25)"
            : "0 16px 22px -10px rgba(58,34,14,0.55), 0 2px 6px rgba(58,34,14,0.25)",
      }}
    >
      {/* 右侧纸页截面 */}
      <div
        aria-hidden
        className={cn(
          "absolute right-0 top-[3px] bottom-[3px] rounded-r-md",
          size === "detail" ? "w-[7px]" : "w-[5px]"
        )}
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, #F0E6CF 0 2px, #DFD2B4 2px 3px)",
        }}
      />
      {/* 封面主体 */}
      <div
        className="absolute inset-0 overflow-hidden rounded-l-[3px] rounded-r-md"
        style={{
          background: `linear-gradient(160deg, ${palette.from} 0%, ${palette.to} 100%)`,
        }}
      >
        {/* 纸纹 + 高光 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "9px 9px",
            opacity: 0.5,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 20% 0%, rgba(255,255,255,0.10), transparent 55%)",
          }}
        />
        {/* 书脊压痕 */}
        <div
          aria-hidden
          className={cn(
            "absolute left-0 top-0 bottom-0",
            size === "detail" ? "w-[11px]" : "w-[8px]"
          )}
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.32), rgba(0,0,0,0.10) 70%, transparent)",
          }}
        />

        {/* 封面内容 */}
        <div
          className={cn(
            "relative flex h-full flex-col",
            size === "detail" ? "p-6 pl-9" : "p-3.5 pl-5"
          )}
        >
          <div className="flex items-start justify-between gap-1.5">
            <span
              className={cn(
                "flex items-center justify-center rounded-md border",
                size === "detail" ? "h-9 w-9" : "h-7 w-7"
              )}
              style={{
                borderColor: "rgba(245,237,220,0.28)",
                color: palette.text,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <Icon
                className={size === "detail" ? "h-4.5 w-4.5" : "h-3.5 w-3.5"}
                strokeWidth={1.8}
              />
            </span>
            {badge && (
              <span
                className={cn(
                  "mt-0.5 rounded-full border px-1.5 py-px leading-tight",
                  size === "detail" ? "text-[10px]" : "text-[8px]"
                )}
                style={{
                  borderColor: "rgba(245,237,220,0.30)",
                  color: "rgba(245,237,220,0.78)",
                }}
              >
                {badge}
              </span>
            )}
          </div>

          <div className="mt-auto">
            <div
              aria-hidden
              className={cn(
                "mb-2 h-[2px] rounded-full",
                size === "detail" ? "w-10" : "w-7"
              )}
              style={{ background: palette.accent }}
            />
            <h3
              className={cn(
                "font-display font-bold leading-snug",
                size === "detail" ? "text-2xl" : "text-[15px] sm:text-base"
              )}
              style={{ color: palette.text }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={cn(
                  "mt-1 line-clamp-2 leading-relaxed",
                  size === "detail" ? "text-xs" : "text-[9px]"
                )}
                style={{ color: "rgba(245,237,220,0.62)" }}
              >
                {subtitle}
              </p>
            )}
            <p
              className={cn(
                "mt-2 tracking-[0.2em]",
                size === "detail" ? "text-[9px]" : "text-[8px]"
              )}
              style={{ color: "rgba(245,237,220,0.45)" }}
            >
              ZIJIELEO DOCS
            </p>
          </div>
        </div>

        {/* 进度圆环 */}
        {progressPct !== null && (
          <div
            className={cn(
              "absolute",
              size === "detail" ? "bottom-4 right-5" : "bottom-2.5 right-3.5"
            )}
          >
            <svg
              width={size === "detail" ? 38 : 30}
              height={size === "detail" ? 38 : 30}
              viewBox="0 0 30 30"
              aria-hidden
            >
              <circle
                cx="15" cy="15" r={R}
                fill="rgba(0,0,0,0.18)"
                stroke="rgba(245,237,220,0.25)"
                strokeWidth="2.5"
              />
              <circle
                cx="15" cy="15" r={R}
                fill="none"
                stroke={palette.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - (C * progressPct) / 100}
                transform="rotate(-90 15 15)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
              <text
                x="15" y="15"
                textAnchor="middle" dominantBaseline="central"
                fill={palette.text}
                fontSize={size === "detail" ? 9 : 8.5}
                fontWeight="700"
              >
                {progressPct}%
              </text>
            </svg>
          </div>
        )}

        {/* 读完章 */}
        {done && (
          <div
            aria-hidden
            className={cn(
              "absolute flex -rotate-12 items-center justify-center rounded-full border-[1.5px] font-bold",
              size === "detail"
                ? "right-3.5 top-12 h-10 w-10 text-xs"
                : "right-2.5 top-9 h-8 w-8 text-[10px]"
            )}
            style={{
              borderColor: palette.accent,
              color: palette.accent,
              background: "rgba(0,0,0,0.16)",
            }}
          >
            完
          </div>
        )}
      </div>
    </div>
  )
}
