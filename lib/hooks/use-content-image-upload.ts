"use client"

/**
 * 正文插图上传逻辑（共享给按钮 / 粘贴 / 拖拽三处触发）
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md 第 6.4、6.6 节。
 *
 * 用法：
 *   const { upload, uploading } = useContentImageUpload({
 *     onInsert: (markdown) => insertText(markdown),
 *   })
 *   await upload(file)         // 按钮：选图后调
 *   // 粘贴/拖拽：从事件取 file 后调 upload(file)
 *
 * 校验、上传、插入 markdown、toast 全在这里，三处触发零重复。
 */
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { authFetch } from "@/lib/admin-fetch"

export interface UseContentImageUploadOptions {
  /** 插入回调：传入完整 markdown（如 `![图片](url)`），由父组件定位光标插入 */
  onInsert: (markdown: string) => void
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB，与 upload API 一致

/**
 * 把 File 上传到 OSS content/ 并回调插入 markdown。
 * 返回 true 表示成功（可用于粘贴时阻止默认行为等）。
 */
export function useContentImageUpload({
  onInsert,
}: UseContentImageUploadOptions) {
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(
    async (file: File): Promise<boolean> => {
      if (!file.type.startsWith("image/")) {
        toast.error("仅支持图片文件")
        return false
      }
      if (file.size > MAX_SIZE) {
        toast.error("图片过大（上限 5MB）")
        return false
      }

      setUploading(true)
      try {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("folder", "content")
        const res = await authFetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || "上传失败")
        }
        // alt 用文件名（去扩展名），粘贴的图（无文件名）用"图片"
        const alt = (file.name || "图片").replace(/\.[^.]+$/, "") || "图片"
        onInsert(`![${alt}](${data.url})`)
        toast.success("图片已插入")
        return true
      } catch (err: any) {
        toast.error(err.message || "上传失败")
        return false
      } finally {
        setUploading(false)
      }
    },
    [onInsert]
  )

  return { upload, uploading }
}

/**
 * 从剪贴板/拖拽事件里提取第一张图片 File（没有则返回 null）。
 * 粘贴和拖拽的 DataTransfer 结构一致，共用此函数。
 */
export function getImageFromDataTransfer(
  dataTransfer: DataTransfer
): File | null {
  // 优先用 items（能拿到 kind=image）
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i]
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) return file
      }
    }
  }
  // 兜底用 files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i]
      if (file.type.startsWith("image/")) return file
    }
  }
  return null
}
