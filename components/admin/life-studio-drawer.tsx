"use client"

/**
 * 树洞书房 · 发布设置抽屉（纸质风）
 *
 * 元信息（分区 / 日期 / 配图 / 摘要）的唯一入口，写作过程零打扰。
 */
import { X, FolderTree, CalendarDays, Images, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUploader } from "@/components/ui/image-uploader"
import type { LifeCategoryOption } from "./life-writing-studio"

interface LifeStudioDrawerProps {
  open: boolean
  onClose: () => void
  categories: LifeCategoryOption[]
  categoryId: string
  onCategoryChange: (id: string) => void
  dateStr: string
  onDateChange: (v: string) => void
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages: number
  isLongform: boolean
  description: string
  onDescriptionChange: (v: string) => void
  submitting: boolean
  onSaveDraft: () => void
  onPublish: () => void
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold tracking-wide text-[#6B6355]">
      <Icon className="h-3.5 w-3.5 text-[#B3402A]/70" />
      {children}
    </h3>
  )
}

export function LifeStudioDrawer({
  open,
  onClose,
  categories,
  categoryId,
  onCategoryChange,
  dateStr,
  onDateChange,
  images,
  onImagesChange,
  maxImages,
  isLongform,
  description,
  onDescriptionChange,
  submitting,
  onSaveDraft,
  onPublish,
}: LifeStudioDrawerProps) {
  const setImageAt = (index: number, url: string) => {
    const next = [...images]
    next[index] = url
    onImagesChange(next)
  }

  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-[#2A2620]/25 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="发布设置"
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(92vw,26rem)] flex-col border-l border-[#E8E2D5] bg-[#FFFEFA] shadow-[-16px_0_48px_rgba(42,38,32,0.10)] transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E8E2D5]/80 px-5">
          <h2 className="font-brush text-xl text-[#1A1A1A]">手记设置</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭手记设置"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#6B6355] transition-colors duration-200 hover:bg-[#B3402A]/8 hover:text-[#B3402A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          {/* 分区 */}
          <section>
            <SectionTitle icon={FolderTree}>分区</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategoryChange(c.id)}
                  aria-pressed={categoryId === c.id}
                  className={cn(
                    "font-handwriting cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
                    categoryId === c.id
                      ? "border-[#B3402A]/50 bg-[#B3402A]/8 text-[#B3402A]"
                      : "border-[#E8E2D5] text-[#8A8171] hover:border-[#B3402A]/30 hover:text-[#6B6355]"
                  )}
                >
                  {c.name}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="font-handwriting text-sm text-[#A89D87]">
                  还没有分区，请先在数据库中添加。
                </p>
              )}
            </div>
          </section>

          {/* 日期 */}
          <section>
            <SectionTitle icon={CalendarDays}>展示日期</SectionTitle>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => onDateChange(e.target.value)}
              aria-label="展示日期"
              className="w-full cursor-pointer rounded-md border border-[#E8E2D5] bg-[#FDFBF7] px-3 py-2 text-sm text-[#1A1A1A] outline-none transition-colors duration-200 focus:border-[#B3402A]/50 focus:ring-2 focus:ring-[#B3402A]/15"
            />
            <p className="font-handwriting mt-2 text-xs text-[#A89D87]">
              可以补记过去的某一天
            </p>
          </section>

          {/* 配图 */}
          <section>
            <SectionTitle icon={Images}>配图</SectionTitle>
            <div className="flex gap-3">
              {Array.from({ length: maxImages }).map((_, i) => (
                <div key={i} className="w-28">
                  <ImageUploader
                    value={images[i] ?? ""}
                    onChange={(u) => setImageAt(i, u ?? "")}
                    folder="life"
                    shape="square"
                    aspect={4 / 3}
                    compact
                  />
                </div>
              ))}
            </div>
            <p className="font-handwriting mt-2 text-xs text-[#A89D87]">
              最多 {maxImages} 张{isLongform ? "，第一张作封面" : ""}，可不配
            </p>
          </section>

          {/* 摘要（仅长文） */}
          {isLongform && (
            <section>
              <SectionTitle icon={FileText}>摘要</SectionTitle>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="不填会自动截取正文开头……"
                rows={3}
                aria-label="长文摘要"
                className="font-handwriting w-full resize-none rounded-md border border-[#E8E2D5] bg-[#FDFBF7] px-3 py-2 text-sm leading-relaxed text-[#1A1A1A] placeholder:text-[#C0B69F] outline-none transition-colors duration-200 focus:border-[#B3402A]/50 focus:ring-2 focus:ring-[#B3402A]/15"
              />
            </section>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-[#E8E2D5]/80 bg-[#FFFEFA] px-5 py-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={submitting}
            className="h-9 flex-1 cursor-pointer rounded-md border border-[#E8E2D5] text-sm font-medium text-[#6B6355] transition-colors duration-200 hover:border-[#B3402A]/40 hover:text-[#B3402A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            存私密
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={submitting}
            className="h-9 flex-1 cursor-pointer rounded-md bg-[#B3402A] text-sm font-medium text-[#FDF6EC] shadow-sm transition-colors duration-200 hover:bg-[#993622] disabled:cursor-not-allowed disabled:opacity-50"
          >
            收进树洞
          </button>
        </div>
      </aside>
    </div>
  )
}
