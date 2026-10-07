"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, List, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ReaderTocGroup {
  slug: string
  title: string
  elementLabel: string
  items: { slug: string; title: string; meta: string }[]
}

export function TreeholeReaderShell({
  bookTitle,
  sectionTitle,
  articleTitle,
  currentSlug,
  groups,
  children,
}: {
  bookTitle: string
  sectionTitle: string
  articleTitle: string
  currentSlug: string
  groups: ReaderTocGroup[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = document.querySelector("main[data-treehole-scroll]") as HTMLElement | null
    if (!container) return

    const update = () => {
      const total = container.scrollHeight - container.clientHeight
      setProgress(total > 0 ? Math.min(100, Math.round((container.scrollTop / total) * 100)) : 0)
    }
    update()
    container.addEventListener("scroll", update, { passive: true })
    return () => container.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        "treehole-book:last-read",
        JSON.stringify({ slug: currentSlug, title: articleTitle }),
      )
    } catch {
      // Ignore storage failures.
    }
  }, [currentSlug, articleTitle])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div>
      <div className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/treehole#book-toc"
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">书目</span>
          </Link>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-handwriting text-sm leading-tight">
              {bookTitle}
              <span className="mx-1.5 text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">{sectionTitle}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="打开目录"
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <div aria-hidden className="h-[2px] w-full bg-border/50">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {children}

      <div
        className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="章节目录"
          className={cn(
            "absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-border bg-card shadow-[16px_0_48px_rgba(60,35,15,.18)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/70 px-4">
            <p className="font-handwriting text-base font-bold">
              目录
              <span className="ml-2 text-xs font-normal text-muted-foreground">{bookTitle}</span>
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="关闭目录"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 pb-8">
            {groups.map((group) => (
              <section key={group.slug} className="mb-3">
                <p className="px-2 py-2 text-xs font-semibold tracking-wide text-muted-foreground">
                  {group.elementLabel} · {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/treehole/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md border-l-2 px-3 py-2 text-sm transition",
                        item.slug === currentSlug
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <span className="block">{item.title}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {item.meta}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
