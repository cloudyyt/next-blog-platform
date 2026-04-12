"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowUp, Share2, Link as LinkIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
interface PostDetailClientProps {
  title: string
}

export function PostDetailClient({ title }: PostDetailClientProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const [showBackToTop, setShowBackToTop] = useState(false)

  const [scrollProgress, setScrollProgress] = useState(0)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the scrollable main container (layout uses overflow-y-auto on <main>)
  const getScrollContainer = useCallback(() => {
    return document.querySelector("main.overflow-y-auto") as HTMLElement | null
  }, [])

  // Scroll listeners
  useEffect(() => {
    if (!mounted) return

    const scrollContainer = getScrollContainer()
    if (!scrollContainer) return

    function handleScroll() {
      const el = document.querySelector("main.overflow-y-auto") as HTMLElement | null
      if (!el) return
      const scrollTop = el.scrollTop
      setShowBackToTop(scrollTop > 400)

      const scrollHeight = el.scrollHeight - el.clientHeight
      if (scrollHeight > 0) {
        setScrollProgress(Math.min((scrollTop / scrollHeight) * 100, 100))
      }
    }

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [mounted, getScrollContainer])

  // Copy link handler
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success("链接已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("复制链接失败")
    }
  }, [])

  // Share handler
  const handleShareNative = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: window.location.href })
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink()
    }
  }, [title, handleCopyLink])

  // Back to top handler
  const handleBackToTop = () => {
    const el = document.querySelector("main.overflow-y-auto") as HTMLElement | null
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Reading progress bar — sits on top of everything */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1">
        {/* Track background */}
        <div className="absolute inset-0 bg-border/40" />
        {/* Progress fill */}
        <div
          className={cn(
            "h-full bg-primary transition-all duration-150 ease-out",
            scrollProgress === 0 && "opacity-0"
          )}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Toolbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareNative}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
              {copied ? "已复制" : "复制链接"}
            </Button>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        aria-label="回到顶部"
        onClick={handleBackToTop}
        className={cn(
          "fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-lg transition-all duration-300 hover:bg-accent",
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  )
}
