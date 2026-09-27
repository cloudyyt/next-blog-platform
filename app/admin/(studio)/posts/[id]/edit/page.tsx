"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PenLine } from "lucide-react"
import { WritingStudio } from "@/components/admin/writing-studio"
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <PenLine className="h-7 w-7 animate-pulse text-[#B3402A]/70" />
        <p className="font-handwriting text-sm tracking-widest text-[#8A8171]">
          正在翻开这篇手记……
        </p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="font-brush text-2xl text-[#1A1A1A]">文章不存在</h2>
        <p className="font-handwriting text-sm text-[#8A8171]">
          找不到这篇文章，可能已被删除。
        </p>
        <button
          onClick={() => router.push("/admin/posts")}
          className="font-handwriting cursor-pointer text-sm text-[#B3402A] hover:underline"
        >
          返回文章列表 →
        </button>
      </div>
    )
  }

  if (!post) return null

  return (
    <WritingStudio
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
