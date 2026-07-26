"use client"

/**
 * <CoverImage> —— 封面图通用组件（固定高度 + cover 铺满）
 *
 * 设计：
 *   - 容器固定高度（由调用方传 className，如 h-40 / h-64）
 *   - 图片 object-cover 铺满容器（会裁切，但视觉整齐，不会出现"中间一小条"）
 *   - 这是所有博客（掘金/知乎/公众号）的默认封面行为
 *
 * 配合 admin ImageUploader 的 16:9 预览框 → 所见即所得
 * （admin 看到 cover 怎么裁，前台就怎么显示）
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
      {/* cover 铺满：会裁切非标准比例图，但视觉整齐，不出现缩成一小条 */}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        className="object-cover"
        sizes={sizes}
      />
      {/* 叠加层（渐变遮罩 / 分类标签等） */}
      {overlay}
    </div>
  )
}
