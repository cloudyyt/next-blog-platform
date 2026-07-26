"use client"

/**
 * <CoverImage> —— 封面图通用组件（完整显示，高度跟随图片比例）
 *
 * 设计：单层图，w-full h-auto。
 *   - 图片完整显示，不裁切
 *   - 卡片高度由图片自身宽高比决定（竖图卡片高，横图卡片矮）
 *   - 无模糊背景、无留白、无突兀色块 —— 最干净的方案
 *
 * 用法：
 *   <CoverImage src={url} alt="标题" />            // 高度自适应
 *   <CoverImage src={url} alt="标题" className="max-h-96" />  // 可选限高
 *
 * overlay（渐变遮罩/标签）渲染在图片上层，用 absolute 定位。
 */
import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface CoverImageProps {
  src: string
  alt: string
  /** 可选的容器约束类（如 max-h-96 限高），一般不传，让高度自适应 */
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
      {/* 单层图：宽度撑满，高度自适应图片比例 —— 完整显示不裁切 */}
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        unoptimized
        priority={priority}
        className="w-full h-auto"
        sizes={sizes}
      />
      {/* 叠加层（渐变遮罩 / 分类标签等） */}
      {overlay}
    </div>
  )
}
