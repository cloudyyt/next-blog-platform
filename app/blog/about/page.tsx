"use client"

import { useEffect, useState } from "react"
import { AuthorCard } from "@/components/blog/author-card"
import { Loading } from "@/components/ui/loading"
import { getBlogConfig } from "@/lib/api/blog"
import { BlogConfig } from "@/lib/types/blog"

export default function AboutPage() {
  const [config, setConfig] = useState<BlogConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const configData = await getBlogConfig()
        setConfig(configData)
      } catch (err) {
        setError("加载数据失败，请稍后重试")
        console.error("Failed to fetch config:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading size="lg" text="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* 作者卡片 */}
        {config?.author && (
          <div className="mb-8">
            <AuthorCard author={config.author} />
          </div>
        )}

        {/* 博客介绍 */}
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">关于博客</h2>
            <p className="text-muted-foreground leading-relaxed">
              {config?.siteDescription || "这是一个技术博客，分享前端开发经验和技术思考。"}
            </p>
          </div>

          {/* 技术栈 */}
          <div>
            <h3 className="text-xl font-semibold mb-3">技术栈</h3>
            <div className="flex flex-wrap gap-2">
              {["React", "Vue3", "Next.js", "TypeScript", "Tailwind CSS", "Prisma"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 联系信息 */}
          {config?.author?.socialLinks && (
            <div>
              <h3 className="text-xl font-semibold mb-3">联系方式</h3>
              <p className="text-muted-foreground">
                欢迎通过以下方式与我交流：
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

