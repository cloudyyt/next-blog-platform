"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Save, Send, LinkIcon } from "lucide-react"
import { MarkdownEditor } from "@/components/admin/markdown-editor"
import { CategorySelector } from "@/components/admin/category-selector"
import { TagSelector } from "@/components/admin/tag-selector"
import { authFetch } from "@/lib/admin-fetch"
import { generateSlug } from "@/lib/slugify"

interface PostEditorProps {
  mode: "create" | "edit"
  postId?: string
  initialData?: {
    title: string
    slug: string
    content: string
    excerpt: string
    coverImage: string
    categoryIds: string[]
    tagIds: string[]
  }
}

export function PostEditor({ mode, postId, initialData }: PostEditorProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "")
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categoryIds || []
  )
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds || [])

  // Track whether user has manually edited slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === "edit"
  )

  // Auto-generate slug from title
  useEffect(() => {
    if (slugManuallyEdited || !title) return
    const newSlug = generateSlug(title)
    setSlug(newSlug)
  }, [title, slugManuallyEdited])

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
    setSlugManuallyEdited(true)
  }, [])

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) {
      toast.error("请输入文章标题")
      return
    }
    if (!content.trim()) {
      toast.error("请输入文章内容")
      return
    }
    if (!slug.trim()) {
      toast.error("请输入文章 slug")
      return
    }

    setSubmitting(true)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim() || null,
      coverImage: coverImage.trim() || null,
      published: publish,
      categoryIds,
      tagIds,
    }

    try {
      let response: Response

      if (mode === "create") {
        response = await authFetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        response = await authFetch(`/api/admin/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        toast.success(publish ? "文章已发布" : "草稿已保存")
        router.push("/admin/posts")
      } else {
        const error = await response.json()
        toast.error(error.message || "操作失败")
      }
    } catch {
      toast.error("操作失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/posts")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "新建文章" : "编辑文章"}
          </h1>
        </div>
      </div>

      {/* Main layout: editor + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: editor area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="text-2xl font-bold h-14 border-0 bg-card/80 backdrop-blur-sm rounded-lg px-4 focus-visible:ring-1"
            />
          </div>

          {/* Slug */}
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-slug"
              className="h-8 text-sm text-muted-foreground bg-card/80 backdrop-blur-sm border-0 rounded-md focus-visible:ring-1"
            />
            {slugManuallyEdited && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs shrink-0"
                onClick={() => {
                  setSlugManuallyEdited(false)
                  setSlug(generateSlug(title))
                }}
              >
                自动生成
              </Button>
            )}
          </div>

          {/* Markdown editor */}
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* Right: metadata sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Action buttons (top of sidebar) */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4 space-y-3">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                保存草稿
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
              >
                <Send className="h-4 w-4 mr-2" />
                发布文章
              </Button>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4 space-y-3">
            <Label className="text-sm font-medium">封面图片 URL</Label>
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="h-8 text-sm"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4 space-y-3">
            <Label className="text-sm font-medium">摘要</Label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="文章摘要（可选）"
              rows={3}
              className="w-full text-sm bg-background rounded-md border border-input px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Categories */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4">
            <CategorySelector
              selected={categoryIds}
              onChange={setCategoryIds}
            />
          </div>

          {/* Tags */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4">
            <TagSelector selected={tagIds} onChange={setTagIds} />
          </div>
        </div>
      </div>
    </div>
  )
}
