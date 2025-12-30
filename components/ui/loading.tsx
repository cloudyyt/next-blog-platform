import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

// 全屏加载
export function LoadingScreen({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <Loading size="lg" text={text} />
    </div>
  )
}

// 内联加载
export function LoadingInline({ className, text }: { className?: string; text?: string }) {
  return <Loading className={className} size="sm" text={text} />
}

