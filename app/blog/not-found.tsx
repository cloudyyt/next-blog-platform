import Link from "next/link"
import { FileQuestion } from "lucide-react"

export default function BlogNotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center space-y-6">
      <div className="flex justify-center">
        <FileQuestion className="w-16 h-16 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold">页面未找到</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        你访问的页面不存在，请检查地址是否正确。
      </p>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}
