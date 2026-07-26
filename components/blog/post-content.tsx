"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { MermaidDiagram } from "@/components/ui/mermaid-diagram"
import { ALLOWED_SVG_TAGS } from "@/lib/markdown/rehype-schema"

interface PostContentProps {
  content: string
}

export function PostContent({ content }: PostContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        // 只用 rehype-raw 解析 markdown 里混写的原始 HTML/SVG。
        // 不接 rehype-sanitize：它默认 schema 不处理 SVG 命名空间（foreign），
        // 会把整个 <svg> 删掉只剩文字残骸。
        // XSS 防护靠下方 components 里对 SVG 标签的白名单透传（PostContent 只渲染博主内容，
        // admin 鉴权后写入 DB，非用户输入，风险低）。
        rehypeRaw,
      ]}
      components={{
        // SVG 白名单标签透传为对应小写元素（让内联 SVG banner 能渲染）
        ...Object.fromEntries(
          ALLOWED_SVG_TAGS.map((tag) => [
            tag,
            ({ node, ...props }: any) => {
              const Comp = tag as any
              return <Comp {...props} />
            },
          ])
        ),
        // 代码块 / 行内代码
        // react-markdown v9 的 inline 参数不可靠，改用内容特征判断：
        //   块级 code（fenced ```）的 children 含换行，或带 language- className
        //   行内 code（反引号）的 children 是纯文本、无换行
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "")
          const text = String(children ?? "")
          const isBlock = match !== null || text.includes("\n")
          if (isBlock && match?.[1] === "mermaid") {
            return <MermaidDiagram chart={text} />
          }
          if (isBlock && mounted) {
            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match?.[1] ?? "text"}
                PreTag="div"
                className="code-block rounded-lg my-4"
                customStyle={{ background: "var(--code-bg)" }}
                {...props}
              >
                {text.replace(/\n$/, "")}
              </SyntaxHighlighter>
            )
          }
          // 行内代码（反引号）
          return (
            <code className={cn("bg-secondary px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
              {children}
            </code>
          )
        },
        // 图片
        img({ node, src, alt, ...props }: any) {
          if (!src) return null
          return (
            <div className="my-6 rounded-lg overflow-hidden">
              <Image
                src={src}
                alt={alt || ""}
                width={800}
                height={400}
                className="w-full h-auto"
                unoptimized
                {...props}
              />
              {alt && (
                <p className="text-sm text-muted-foreground text-center mt-2">{alt}</p>
              )}
            </div>
          )
        },
        // 标题 - 添加锚点
        h1: ({ children, ...props }: any) => (
          <h1 id={getHeadingId(children)} className="scroll-mt-20 text-3xl font-bold mt-8 mb-4" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }: any) => (
          <h2 id={getHeadingId(children)} className="scroll-mt-20 text-2xl font-bold mt-6 mb-3" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }: any) => (
          <h3 id={getHeadingId(children)} className="scroll-mt-20 text-xl font-semibold mt-4 mb-2" {...props}>
            {children}
          </h3>
        ),
        // 链接
        a: ({ href, children, ...props }: any) => (
          <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-primary hover:underline"
            {...props}
          >
            {children}
          </a>
        ),
        // 段落
        p: ({ children, ...props }: any) => (
          <p className="mb-4 leading-7" {...props}>
            {children}
          </p>
        ),
        // 列表
        ul: ({ children, ...props }: any) => (
          <ul className="mb-4 pl-6 list-disc" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }: any) => (
          <ol className="mb-4 pl-6 list-decimal" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }: any) => (
          <li className="mb-2" {...props}>
            {children}
          </li>
        ),
        // 引用
        blockquote: ({ children, ...props }: any) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props}>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// 生成标题ID（用于目录锚点）
function getHeadingId(children: any): string {
  if (typeof children === "string") {
    return children.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
  }
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === "string") return child
        if (typeof child === "object" && child?.props?.children) {
          return getHeadingId(child.props.children)
        }
        return ""
      })
      .join("")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }
  return ""
}

