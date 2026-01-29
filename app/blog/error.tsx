"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Blog segment error:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12 text-center space-y-4">
      <p className="text-destructive">加载出错，请刷新或重试</p>
      <Button onClick={reset} variant="outline">
        重试
      </Button>
    </div>
  )
}
