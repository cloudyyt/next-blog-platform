"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
      components={{
        // 代码块
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "")
          // 只在客户端渲染代码高亮，避免SSR问题
          if (!inline && match && mounted) {
            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-lg my-4"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            )
          }
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

