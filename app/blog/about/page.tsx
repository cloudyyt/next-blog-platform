"use client"

import { useEffect, useState } from "react"
import { AuthorCard } from "@/components/blog/author-card"
import { Loading } from "@/components/ui/loading"
import { getBlogConfig } from "@/lib/api/blog"
import { BlogConfig } from "@/lib/types/blog"
import { Code, BookOpen, Coffee, Github, ExternalLink } from "lucide-react"

export default function AboutPage() {
  const [config, setConfig] = useState<BlogConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const configData = await getBlogConfig()
        setConfig(configData)
      } catch (err) {
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

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* 作者卡片 */}
        {config?.author && (
          <div>
            <AuthorCard author={config.author} />
          </div>
        )}

        {/* 关于我 */}
        <section className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-bold">关于我</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              你好，欢迎来到我的博客。我是一名前端工程师，日常工作主要使用 React 和 TypeScript 构建产品。
              写代码之余，我喜欢读技术书、折腾新工具、偶尔跑步。
            </p>
            <p>
              建这个博客的初衷很简单——把学习和工作中踩过的坑记录下来。一方面是给自己复盘，
              另一方面如果能帮到遇到同样问题的人，那就更好了。
            </p>
            <p>
              博客的名字叫「大胖天的树洞」，取自一个很朴素的愿望：希望这里是一个可以自由表达、
              记录成长的地方。技术文章为主，偶尔也会写点生活随笔。
            </p>
          </div>
        </section>

        {/* 技术成长路线 */}
        <section className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            技术成长路线
          </h2>
          <div className="space-y-6">
            <TimelineItem
              year="2024"
              title="深入全栈开发"
              description="学习 Next.js App Router 和服务端组件，开始独立构建全栈应用。数据库用 Prisma + PostgreSQL，部署在 Cloudflare 和阿里云。"
            />
            <TimelineItem
              year="2023"
              title="前端工程化实践"
              description="从 Webpack 迁移到 Vite，学习 CI/CD 和 Docker，搭建了团队的组件库和文档站。开始关注性能优化和监控。"
            />
            <TimelineItem
              year="2022"
              title="React 生态深入"
              description="系统学习 React Hooks、状态管理和 TypeScript。从 Vue 转到 React，理解了函数式编程在前端的应用。"
            />
            <TimelineItem
              year="2021"
              title="前端入行"
              description="从 HTML/CSS/JavaScript 基础开始，学习了 Vue 2 和 Element UI，做了第一个管理后台项目。"
            />
          </div>
        </section>

        {/* 技术栈 */}
        <section className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-bold">技术栈</h2>
          <p className="text-muted-foreground">
            日常使用和持续学习的技术：
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <TechCategory label="框架" items={["React", "Vue 3", "Next.js"]} />
            <TechCategory label="语言" items={["TypeScript", "JavaScript", "HTML/CSS"]} />
            <TechCategory label="工具链" items={["Vite", "Tailwind", "Prisma"]} />
            <TechCategory label="部署" items={["Cloudflare", "Docker", "GitHub Actions"]} />
            <TechCategory label="数据库" items={["PostgreSQL", "Redis", "SQLite"]} />
            <TechCategory label="学习中" items={["Rust", "WebAssembly", "系统设计"]} />
          </div>
        </section>

        {/* 阅读与兴趣 */}
        <section className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            阅读与兴趣
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              保持阅读习惯是我这几年受益最大的事。技术类和非技术类混着读，交替进行不容易疲劳。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
              <h4 className="font-semibold text-sm">技术书单</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>《重构：改善既有代码的设计》</li>
                <li>《代码整洁之道》</li>
                <li>《设计数据密集型应用》</li>
                <li>《深入理解 TypeScript》</li>
                <li>《Rust 程序设计语言》</li>
              </ul>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
              <h4 className="font-semibold text-sm">其他爱好</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>跑步 — 每周 3 次，保持运动习惯</li>
                <li>推理小说 — 东野圭吾、阿加莎</li>
                <li>咖啡 — 业余手冲爱好者</li>
                <li>绿植 — 阳台种了三盆绿萝</li>
                <li>播客 — 通勤路上听技术播客</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 联系方式 */}
        <section className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="w-6 h-6 text-primary" />
            联系我
          </h2>
          <p className="text-muted-foreground">
            欢迎通过以下方式与我交流，无论是技术讨论、文章反馈还是闲聊都可以：
          </p>
          <div className="flex flex-wrap gap-3">
            {config?.author?.socialLinks?.github && (
              <SocialLink
                href={config.author.socialLinks.github}
                icon={<Github className="w-4 h-4" />}
                label="GitHub"
              />
            )}
            {config?.author?.socialLinks?.website && (
              <SocialLink
                href={config.author.socialLinks.website}
                icon={<ExternalLink className="w-4 h-4" />}
                label="个人网站"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            也可以在文章下方评论区留言，我会尽量回复每一条评论。
          </p>
        </section>

      </div>
    </div>
  )
}

// --- Sub-components ---

function TimelineItem({ year, title, description }: { year: string; title: string; description: string }) {
  return (
    <div className="relative pl-8 border-l-2 border-primary/20 pb-2">
      <div className="absolute left-0 top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
      <div className="text-xs text-primary font-medium mb-1">{year}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function TechCategory({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2 text-primary">{label}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((tech) => (
          <span
            key={tech}
            className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-sm"
    >
      {icon}
      {label}
    </a>
  )
}
