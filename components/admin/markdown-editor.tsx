"use client"

import { useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"
import { MermaidDiagram } from "@/components/ui/mermaid-diagram"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Code,
  List,
  ListOrdered,
  Quote,
  Eye,
  PenLine,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentImageUploadButton } from "@/components/admin/content-image-upload-button"
import {
  useContentImageUpload,
  getImageFromDataTransfer,
} from "@/lib/hooks/use-content-image-upload"

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

  /**
   * 在光标处插入任意文本（供 ContentImageUploadButton 插入图片 markdown 用）。
   * 图片视为 block：如需要自动在前面补换行。
   */
  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    const needNewlineBefore =
      beforeText.length > 0 && !beforeText.endsWith("\n")
    const inserted = (needNewlineBefore ? "\n" : "") + text
    onChange(beforeText + inserted + afterText)

    requestAnimationFrame(() => {
      textarea.focus()
      const newCursorPos = start + inserted.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
  }

  // 正文插图上传（按钮 / 粘贴 / 拖拽三处共用同一份逻辑）
  const { upload: uploadImage, uploading: imageUploading } =
    useContentImageUpload({ onInsert: insertText })

  // 拖拽视觉反馈
  const [dragging, setDragging] = useState(false)

  // 粘贴：剪贴板里有图就上传，否则放行（让文字正常粘贴）
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = getImageFromDataTransfer(e.clipboardData)
    if (file) {
      e.preventDefault() // 阻止把图片当文件名粘贴
      await uploadImage(file)
    }
  }

  // 拖拽：dragOver 必须阻止默认行为，drop 才会触发。
  // 用泛型 element 类型，让 handlers 既能绑到外层 div 也能绑到 textarea
  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault()
      setDragging(true)
    }
  }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = async (e: React.DragEvent<HTMLElement>) => {
    const file = getImageFromDataTransfer(e.dataTransfer)
    if (file) {
      e.preventDefault() // 阻止浏览器打开图片
      setDragging(false)
      await uploadImage(file)
    } else {
      setDragging(false)
    }
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

        {/* 正文插图：上传到 OSS 并插入 markdown */}
        <ContentImageUploadButton onInsert={insertText} />
      </div>

      {/* Editor + Preview panels */}
      <div className="flex flex-col md:flex-row">
        {/* Left panel: textarea */}
        <div
          className={cn(
            "md:w-1/2 flex flex-col relative",
            mobileTab !== "editor" && "hidden md:flex"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            className="flex-1 min-h-[500px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
            placeholder="在此输入 Markdown 内容..."
            spellCheck={false}
          />

          {/* 拖拽/上传中遮罩 */}
          {(dragging || imageUploading) && (
            <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none border-2 border-dashed border-primary/50 m-2 rounded-md">
              {imageUploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">正在上传图片…</span>
                </>
              ) : (
                <span className="text-sm font-medium text-primary">
                  松开鼠标即可上传图片
                </span>
              )}
            </div>
          )}
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
                    if (match?.[1] === "mermaid") {
                      return <MermaidDiagram chart={String(children)} />
                    }
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
