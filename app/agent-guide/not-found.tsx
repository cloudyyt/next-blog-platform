import Link from "next/link"
import { ArrowLeft, FileQuestion } from "lucide-react"

export default function DocsNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
        <FileQuestion className="w-8 h-8 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-bold font-display mb-3">
        章节未找到
      </h1>

      <p className="text-muted-foreground leading-relaxed mb-8">
        这个章节可能还在准备中，或者地址有误。
        <br />
        可以回到总览页看看所有可用章节。
      </p>

      <Link
        href="/agent-guide"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        返回总览
      </Link>
    </div>
  )
}
