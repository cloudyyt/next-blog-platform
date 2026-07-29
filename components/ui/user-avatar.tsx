"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * 通用用户头像
 *
 * - 有 src：渲染 next/image（圆形 cover）
 * - 无 src：取 name 首字符（中文取首字、英文取首字母大写）做字母占位
 *
 * 统一收口所有头像位：评论、侧边栏作者卡、about 作者卡、admin 头部、用户列表。
 * size 控制直径（px），默认 40。
 */
export interface UserAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  name?: string | null
  size?: number
}

export function UserAvatar({
  src,
  name,
  size = 40,
  className,
  ...props
}: UserAvatarProps) {
  const initial = React.useMemo(() => {
    if (!name) return "?"
    // 中文取第一个字；英文取首字母大写
    const first = name.trim().charAt(0)
    return /[a-zA-Z]/.test(first) ? first.toUpperCase() : first
  }, [name])

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-bold ring-1 ring-primary/15",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "头像"}
          fill
          sizes={`${size}px`}
          className="object-cover object-top"
          // 远程 OSS 图走 unoptimized，与封面图(cover-image)保持一致：
          // 线上 next/image 优化器对远程图返回 400（remotePatterns 未生效），
          // 且 OSS 已在上传时做 sharp 压缩转 webp，无需二次优化。
          unoptimized
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </span>
  )
}
