"use client"

import { useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Eye,
  PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarkdownEditorProps {
  value: string
  onChange: (v: string) => void
}

const toolbarActions = [
  { icon: Bold, label: "粗体", prefix: "**", suffix: "**", block: false },
  { icon: Italic, label: "斜体", prefix: "*", suffix: "*", block: false },
  { icon: Heading1, label: "标题1", prefix: "# ", suffix: "", block: true },
  { icon: Heading2, label: "标题2", prefix: "## ", suffix: "", block: true },
  { icon: Heading3, label: "标题3", prefix: "### ", suffix: "", block: true },
  { icon: Link, label: "链接", prefix: "[", suffix: "](url)", block: false },
  { icon: Image, label: "图片", prefix: "![", suffix: "](url)", block: false },
  { icon: Code, label: "代码块", prefix: "```\n", suffix: "\n```", block: true },
  { icon: ListOrdered, label: "有序列表", prefix: "1. ", suffix: "", block: true },
  { icon: List, label: "无序列表", prefix: "- ", suffix: "", block: true },
  { icon: Quote, label: "引用", prefix: "> ", suffix: "", block: true },
]

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor")

  const insertMarkdown = (
    prefix: string,
    suffix: string,
    block: boolean
  ) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    // Add newline before block-level insertions if needed
    const needNewlineBefore =
      block && beforeText.length > 0 && !beforeText.endsWith("\n")
    const prefixWithNewline = needNewlineBefore ? "\n" + prefix : prefix

    const newText = selectedText || "文本"
    const inserted = prefixWithNewline + newText + suffix

    onChange(beforeText + inserted + afterText)

    // Set cursor position after the inserted text
    requestAnimationFrame(() => {
      textarea.focus()
      const newCursorPos = start + prefixWithNewline.length
      textarea.setSelectionRange(
        newCursorPos,
        newCursorPos + newText.length
      )
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card/80 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30 flex-wrap">
        {/* Mobile tab switcher */}
        <div className="flex md:hidden items-center mr-2 border-r pr-2">
          <Button
            variant={mobileTab === "editor" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setMobileTab("editor")}
          >
            <PenLine className="h-3.5 w-3.5 mr-1" />
            编辑
          </Button>
          <Button
            variant={mobileTab === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setMobileTab("preview")}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            预览
          </Button>
        </div>

        {toolbarActions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title={action.label}
            onClick={() =>
              insertMarkdown(action.prefix, action.suffix, action.block)
            }
          >
            <action.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor + Preview panels */}
      <div className="flex flex-col md:flex-row">
        {/* Left panel: textarea */}
        <div
          className={cn(
            "md:w-1/2 flex flex-col",
            mobileTab !== "editor" && "hidden md:flex"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 min-h-[500px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
            placeholder="在此输入 Markdown 内容..."
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-border" />

        {/* Right panel: preview */}
        <div
          className={cn(
            "md:w-1/2 min-h-[500px] p-4 overflow-auto",
            mobileTab !== "preview" && "hidden md:block"
          )}
        >
          {value ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "")
                    if (match) {
                      return (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg my-4"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      )
                    }
                    return (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  a: ({ href, children, ...props }: any) => (
                    <a
                      href={href}
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={
                        href?.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-primary hover:underline"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children, ...props }: any) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              预览区域
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
