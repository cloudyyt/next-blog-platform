"use client"

/**
 * 博文写作台 · 发布设置抽屉（科技简约，随主题）
 *
 * 元信息（slug / 封面 / 摘要 / 分类 / 标签）的唯一入口：
 * - 写作过程中完全不可见（零打扰）
 * - 点顶栏「发布」或小齿轮时展开
 * - 确认发布 / 存草稿都在抽屉底部完成
 */
import { X, LinkIcon, FolderTree, Tags as TagsIcon, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUploader } from "@/components/ui/image-uploader"
import { CategorySelector } from "./category-selector"
import { TagSelector } from "./tag-selector"
import { Loader2 } from "lucide-react"

interface WritingStudioDrawerProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  slug: string
  onSlugChange: (value: string) => void
  onSlugReset: () => void
  slugManuallyEdited: boolean
  excerpt: string
  onExcerptChange: (value: string) => void
  coverImage: string
  onCoverImageChange: (url: string) => void
  categoryIds: string[]
  onCategoryIdsChange: (ids: string[]) => void
  tagIds: string[]
  onTagIdsChange: (ids: string[]) => void
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
    <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary/70" />
      {children}
    </h3>
  )
}

const fieldClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-200 focus:border-primary/50 focus:ring-2 focus:ring-ring/20"

export function WritingStudioDrawer({
  open,
  onClose,
  mode,
  slug,
  onSlugChange,
  onSlugReset,
  slugManuallyEdited,
  excerpt,
  onExcerptChange,
  coverImage,
  onCoverImageChange,
  categoryIds,
  onCategoryIdsChange,
  tagIds,
  onTagIdsChange,
  submitting,
  onSaveDraft,
  onPublish,
}: WritingStudioDrawerProps) {
  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* 背板 */}
      <div
        className={cn(
          "absolute inset-0 bg-foreground/20 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* 抽屉本体 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="发布设置"
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(92vw,26rem)] flex-col border-l border-border bg-background shadow-[-16px_0_48px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* 头部 */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
          <h2 className="font-display text-xl font-semibold">发布设置</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭发布设置"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          {/* 链接 slug */}
          <section>
            <SectionTitle icon={LinkIcon}>文章链接</SectionTitle>
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-mono text-sm text-muted-foreground">
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="url-slug"
                aria-label="文章链接 slug"
                className={fieldClass}
              />
              {slugManuallyEdited && (
                <button
                  type="button"
                  onClick={onSlugReset}
                  className="shrink-0 cursor-pointer rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                >
                  自动
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              未手动修改时会随标题自动生成
            </p>
          </section>

          {/* 封面 */}
          <section>
            <SectionTitle icon={FileText}>封面图片</SectionTitle>
            <ImageUploader
              folder="cover/post"
              shape="square"
              aspect={16 / 9}
              value={coverImage || undefined}
              onChange={(url) => onCoverImageChange(url ?? "")}
              hint="建议 1600×900，上传后自动压缩为 WebP"
            />
          </section>

          {/* 摘要 */}
          <section>
            <SectionTitle icon={FileText}>摘要</SectionTitle>
            <textarea
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="不填会自动截取正文开头……"
              rows={3}
              aria-label="文章摘要"
              className={cn(fieldClass, "resize-none leading-relaxed")}
            />
          </section>

          {/* 分类 */}
          <section>
            <SectionTitle icon={FolderTree}>分类</SectionTitle>
            <CategorySelector selected={categoryIds} onChange={onCategoryIdsChange} />
          </section>

          {/* 标签 */}
          <section>
            <SectionTitle icon={TagsIcon}>标签</SectionTitle>
            <TagSelector selected={tagIds} onChange={onTagIdsChange} />
          </section>
        </div>

        {/* 底部操作 */}
        <div className="flex shrink-0 items-center gap-2 border-t bg-background px-5 py-4">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={submitting}
            className="h-9 flex-1 cursor-pointer rounded-md border border-border text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            存草稿
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={submitting}
            className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === "create" ? "确认发布" : "发布更新"}
          </button>
        </div>
      </aside>
    </div>
  )
}
