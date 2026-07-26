"use client"

/**
 * <CoverImage> —— 封面图通用组件（固定高度 + 完整显示 + 纯色底）
 *
 * 设计：
 *   - 容器固定高度（由调用方传 className，如 h-40 / h-64）
 *   - 图片 object-contain 居中完整显示（不裁切）
 *   - 留白用 bg-muted 纯色底填充（与卡片背景融合，不突兀）
 *
 * 用法：
 *   <CoverImage src={url} alt="标题" className="h-40" />
 *
 * overlay（渐变遮罩/标签）渲染在图片上层，用 absolute 定位。
 */
import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface CoverImageProps {
  src: string
  alt: string
  /** 容器尺寸类（必传，如 "h-40"、"h-64 md:h-80"），控制固定高度 */
  className?: string
  /** 叠加层（渐变遮罩、分类标签），渲染在最上层 */
  overlay?: React.ReactNode
  /** 是否优先加载（首屏大图用） */
  priority?: boolean
  /** sizes 属性（next/image 优化用） */
  sizes?: string
}

export function CoverImage({
  src,
  alt,
  className,
  overlay,
  priority,
  sizes,
}: CoverImageProps) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-muted", className)}>
      {/* 完整显示：object-contain 居中，不裁切。留白由容器 bg-muted 填充 */}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        className="object-contain"
        sizes={sizes}
      />
      {/* 叠加层（渐变遮罩 / 分类标签等） */}
      {overlay}
    </div>
  )
}
