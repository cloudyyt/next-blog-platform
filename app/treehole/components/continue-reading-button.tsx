"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"

const STORAGE_KEY = "treehole-book:last-read"

export function ContinueReadingButton({
  defaultSlug,
  defaultTitle,
}: {
  defaultSlug: string
  defaultTitle: string
}) {
  const [item, setItem] = useState<{ slug: string; title: string } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.slug && parsed?.title) setItem(parsed)
      }
    } catch {
      // Ignore malformed local storage.
    }
  }, [])

  const target = item ?? { slug: defaultSlug, title: defaultTitle }

  return (
    <Link
      href={`/treehole/${target.slug}`}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_14px_26px_-15px_rgba(104,61,25,.98)] transition hover:-translate-y-0.5"
    >
      <BookOpen className="h-4 w-4" />
      {item ? `继续读《${item.title}》` : "翻开本书"}
    </Link>
  )
}
