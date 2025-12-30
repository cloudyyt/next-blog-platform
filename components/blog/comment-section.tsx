"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Comment } from "@/lib/types/comment"
import { toast } from "sonner"
import { Send, MessageSquare } from "lucide-react"
import { CommentItem } from "./comment-item"

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 加载评论
  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/comments?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.info("请先登录", {
        description: "登录后即可发表评论",
      })
      router.push(`/blog/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (!content.trim()) {
      toast.error("评论内容不能为空")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          postId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "发表评论失败")
      }

      const newComment = await response.json()
      setComments((prev) => [newComment, ...prev])
      setContent("")
      toast.success("评论发表成功")
    } catch (error: any) {
      toast.error(error.message || "发表评论失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-2xl font-bold">评论</h2>
        {comments.length > 0 && (
          <span className="text-sm text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </div>

      {/* 评论输入框 */}
      <div className="rounded-lg border bg-card p-4">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>以</span>
              <span className="font-medium text-foreground">{user?.name}</span>
              <span>身份发表评论</span>
            </div>
            <Textarea
              placeholder="写下你的想法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/2000
              </span>
              <Button type="submit" disabled={submitting || !content.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "发表中..." : "发表评论"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              登录后即可发表评论
            </p>
            <Button
              onClick={() => {
                router.push(
                  `/blog/login?redirect=${encodeURIComponent(window.location.pathname)}`
                )
              }}
            >
              立即登录
            </Button>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          加载评论中...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无评论，快来发表第一条评论吧！
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplySuccess={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  )
}

