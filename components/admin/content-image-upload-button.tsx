"use client"

/**
 * <ContentImageUploadButton> —— Markdown 编辑器内"点击上传图片"按钮
 *
 * 上传逻辑（校验/上传/插 markdown）抽到 lib/hooks/use-content-image-upload.ts，
 * 与粘贴 / 拖拽三处共用，本组件只负责"点按钮 → 选图 → 调 upload"。
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md 第 6.4、6.6 节。
 */
import * as React from "react"
import { Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContentImageUpload } from "@/lib/hooks/use-content-image-upload"

export interface ContentImageUploadButtonProps {
  /** 插入回调：传入完整 markdown（如 `![图片](url)`），由父组件定位光标插入 */
  onInsert: (markdown: string) => void
}

export function ContentImageUploadButton({
  onInsert,
}: ContentImageUploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { upload, uploading } = useContentImageUpload({ onInsert })

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 重置 input 以便重选同一文件
    e.target.value = ""
    if (file) await upload(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        title="插入图片（上传到 OSS）"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
    </>
  )
}
