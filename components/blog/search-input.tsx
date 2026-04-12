"use client"

import { useRef, useState } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  const query = searchParams.get("q") || ""

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // The URL is already updated via onChange, just prevent page reload
  }

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("q", value.trim())
    } else {
      params.delete("q")
    }
    // Remove tag/category when searching
    params.delete("tag")
    params.delete("category")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          "flex items-center rounded-lg border transition-all duration-200",
          "h-9",
          focused
            ? "border-primary/50 ring-2 ring-primary/20 bg-background/90 w-48 sm:w-56"
            : "border-border/40 bg-background/30 w-36 sm:w-44",
        )}
      >
        <Search className="w-3.5 h-3.5 ml-3 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "flex-1 bg-transparent px-2 text-sm h-full",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none",
            "font-body min-w-0"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 p-0.5 rounded hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
            aria-label="清除搜索"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </form>
  )
}
