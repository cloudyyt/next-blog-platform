"use client"

/**
 * <CoverImage> —— 封面图通用组件（完整显示 + 模糊放大背景）
 *
 * 解决"图片只能看到中间一部分"的问题：
 *   底层：同图 object-cover + blur + scale 放大，填满容器（做背景）
 *   上层：同图 object-contain，居中完整显示（不裁切）
 *   效果：类似 Spotify 专辑卡 / B 站缩略图，视觉自然无突兀色块
 *
 * 用法：
 *   <CoverImage src={url} alt="标题" className="h-40" />
 *   容器 className 控制尺寸（h-40 / h-64 等），组件内部填满。
 *
 * 文档：图片显示策略见 docs/0726 相关讨论
 */
import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface CoverImageProps {
  src: string
  alt: string
  /** 容器尺寸类（如 "h-40"、"h-64 md:h-80"），控制整体高度 */
  className?: string
  /** 叠加层（如渐变遮罩、分类标签），渲染在最上层 */
  overlay?: React.ReactNode
  /** 是否优先加载（首屏大图用） */
  priority?: boolean
  /** 加载失败回调（用于 fallback 到渐变） */
  onError?: () => void
  /** sizes 属性（next/image 优化用） */
  sizes?: string
}

export function CoverImage({
  src,
  alt,
  className,
  overlay,
  priority,
  onError,
  sizes,
}: CoverImageProps) {
  // 加载失败：上层 contain 图隐藏，只剩模糊背景（若也失败则全空，由父容器底色兜底）
  const [mainFailed, setMainFailed] = React.useState(false)

  return (
    <div className={cn("relative w-full overflow-hidden bg-muted", className)}>
      {/* 底层：模糊放大背景（填满容器，做氛围） */}
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        unoptimized
        className="object-cover scale-125 blur-2xl brightness-75"
        sizes={sizes}
        onError={onError}
      />
      {/* 上层：完整显示的主图（居中，不裁切）。失败则不渲染，露出模糊背景 */}
      {!mainFailed && (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          className="relative object-contain"
          sizes={sizes}
          onError={() => setMainFailed(true)}
        />
      )}
      {/* 叠加层（渐变遮罩 / 分类标签等） */}
      {overlay}
    </div>
  )
}
