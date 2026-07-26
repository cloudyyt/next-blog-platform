"use client"

/**
 * <ImageUploader> —— 封面 / 头像 / og:image 专用上传组件
 *
 * 交互（沿用项目"确认才上传"决策，0724 附录2）：
 *   1. 点选图（input file）
 *   2. 客户端即时预览（URL.createObjectURL，此时未上传）
 *   3. 「确认使用 / 重选」按钮
 *   4. 确认才调 POST /api/admin/upload（multipart，authFetch 自动带 token）
 *   5. 成功 → onChange(url)
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md 第 6.4 节。
 *
 * value 为空：空态显示上传图标
 * 已有 value：显示当前 URL 的图片 + "重新上传"按钮
 *
 * 注意：onChange 收到的是 URL 字符串（或空字符串表示清空）。
 * 不同调用方对"空值"的约定不一致（post-editor 用 ""，guide 用 null），
 * 在调用处转换：onChange={u => update("ogImage", u || null)}
 */
import * as React from "react"
import { ImagePlus, Loader2, Trash2, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { authFetch } from "@/lib/admin-fetch"

export interface ImageUploaderProps {
  /** 当前 URL（受控）。空字符串或 undefined 都视为"无图" */
  value?: string
  /** URL 变化回调。清空时传空字符串 */
  onChange: (url: string) => void
  /** 形状：头像圆形 / 封面方形圆角 */
  shape?: "circle" | "square"
  /** 预览框尺寸（px），头像常用 96，封面常用 240 宽。square 时宽高按 aspect */
  size?: number
  /** 封面宽高比，仅 shape=square 生效。默认 16/9 */
  aspect?: number
  /** 上传目录：avatar / cover-post / cover-guide（API 侧文件夹名用斜杠） */
  folder: "avatar" | "cover/post" | "cover/guide"
  /** 顶部标签文案 */
  label?: string
  /** 提示文案（显示在标签下） */
  hint?: string
  className?: string
}

export function ImageUploader({
  value,
  onChange,
  shape = "square",
  size = 96,
  aspect = 16 / 9,
  folder,
  label,
  hint,
  className,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)

  // 选图后生成客户端预览（未上传）
  React.useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  // 显示的图：优先选中的预览，其次已存的 value
  const displayUrl = previewUrl || value || ""

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片过大（上限 5MB）")
      return
    }
    setPendingFile(file)
    // 重置 input 以便重选同一文件
    e.target.value = ""
  }

  const upload = async () => {
    if (!pendingFile) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", pendingFile)
      fd.append("folder", folder)
      // 不要设 Content-Type，让浏览器自动加 multipart boundary；authFetch 会补 Authorization
      const res = await authFetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "上传失败")
      }
      onChange(data.url)
      setPendingFile(null)
      toast.success("图片已上传")
    } catch (err: any) {
      toast.error(err.message || "上传失败")
    } finally {
      setUploading(false)
    }
  }

  const clear = () => {
    setPendingFile(null)
    onChange("")
  }

  const triggerPick = () => inputRef.current?.click()

  const isCircle = shape === "circle"

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div>
          <p className="text-xs font-medium text-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />

      {/* 预览区 */}
      <div
        className={cn(
          "relative overflow-hidden border bg-muted/30 flex items-center justify-center group",
          isCircle ? "rounded-full" : "rounded-lg",
          !displayUrl && "cursor-pointer hover:border-primary/50"
        )}
        style={
          isCircle
            ? { width: size, height: size }
            : { width: "100%", aspectRatio: `1 / ${1 / aspect}` }
        }
        onClick={!displayUrl ? triggerPick : undefined}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt="预览"
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <span className="text-[10px]">点击上传</span>
          </div>
        )}

        {/* 上传中遮罩 */}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-1">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-[10px] text-muted-foreground">上传中…</span>
          </div>
        )}
      </div>

      {/* 操作按钮组 */}
      <div className="flex items-center gap-2 flex-wrap">
        {!pendingFile ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerPick}
              disabled={uploading}
            >
              <ImagePlus className="h-3.5 w-3.5 mr-1" />
              {displayUrl ? "重新选择" : "选择图片"}
            </Button>
            {displayUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                disabled={uploading}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                移除
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              onClick={upload}
              disabled={uploading}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              确认上传
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPendingFile(null)}
              disabled={uploading}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              重选
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
