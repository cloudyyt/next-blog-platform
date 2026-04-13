"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { authFetch } from "@/lib/admin-fetch"

interface Tag {
  id: string
  name: string
}

interface TagSelectorProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await authFetch("/api/admin/tags?limit=100")
      if (response.ok) {
        const { data } = await response.json()
        setTags(data)
      }
    } catch {
      // Silent fail — tags will be empty
    }
  }

  const toggleTag = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">标签</label>
        {selected.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            已选 {selected.length}
          </Badge>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="搜索标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <div className="max-h-48 overflow-auto space-y-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">
            {search ? "未找到匹配的标签" : "暂无标签"}
          </p>
        ) : (
          filtered.map((tag) => (
            <label
              key={tag.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
                className="rounded border-input"
              />
              <span>{tag.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
