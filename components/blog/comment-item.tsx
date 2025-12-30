"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Comment } from "@/lib/types/comment"
import { toast } from "sonner"
import { Reply, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface CommentItemProps {
  comment: Comment
  postId: string
  onReplySuccess: () => void
}

export function CommentItem({ comment, postId, onReplySuccess }: CommentItemProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.info("请先登录", {
        description: "登录后即可回复评论",
      })
      router.push(`/blog/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (!replyContent.trim()) {
      toast.error("回复内容不能为空")
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
          content: replyContent.trim(),
          postId,
          parentId: comment.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "回复失败")
      }

      setReplyContent("")
      setShowReply(false)
      toast.success("回复成功")
      onReplySuccess()
    } catch (error: any) {
      toast.error(error.message || "回复失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>

      {/* 回复按钮 */}
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!isAuthenticated) {
              toast.info("请先登录")
              router.push(
                `/blog/login?redirect=${encodeURIComponent(window.location.pathname)}`
              )
              return
            }
            setShowReply(!showReply)
          }}
        >
          <Reply className="w-4 h-4 mr-1" />
          回复
        </Button>
      </div>

      {/* 回复输入框 */}
      {showReply && (
        <div className="mt-4 pl-4 border-l-2">
          <form onSubmit={handleReply} className="space-y-3">
            <Textarea
              placeholder={`回复 ${comment.author.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={submitting}
              rows={3}
              maxLength={2000}
              className="resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowReply(false)
                  setReplyContent("")
                }}
              >
                取消
              </Button>
              <Button type="submit" size="sm" disabled={submitting || !replyContent.trim()}>
                <Send className="w-4 h-4 mr-1" />
                {submitting ? "回复中..." : "回复"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 子评论 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3 pl-4 border-l-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="rounded-md bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{reply.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

