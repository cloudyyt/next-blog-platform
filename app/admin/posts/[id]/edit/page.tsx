"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"
import { Skeleton } from "@/components/ui/skeleton"
import { authFetch } from "@/lib/admin-fetch"

interface PostData {
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await authFetch(`/api/admin/posts/${params.id}`)
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        if (response.ok) {
          const data = await response.json()
          setPost(data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
          <div className="w-80 space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">文章不存在</h2>
        <p className="text-muted-foreground">找不到该文章，可能已被删除。</p>
        <button
          onClick={() => router.push("/admin/posts")}
          className="text-primary hover:underline"
        >
          返回文章列表
        </button>
      </div>
    )
  }

  if (!post) return null

  return (
    <PostEditor
      mode="edit"
      postId={params.id as string}
      initialData={{
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        coverImage: post.coverImage || "",
        categoryIds: post.categories.map((c) => c.id),
        tagIds: post.tags.map((t) => t.id),
      }}
    />
  )
}
