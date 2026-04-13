"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { authFetch } from "@/lib/admin-fetch"

interface Category {
  id: string
  name: string
}

interface CategorySelectorProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await authFetch("/api/admin/categories?limit=100")
      if (response.ok) {
        const { data } = await response.json()
        setCategories(data)
      }
    } catch {
      // Silent fail — categories will be empty
    }
  }

  const toggleCategory = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">分类</label>
        {selected.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            已选 {selected.length}
          </Badge>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="搜索分类..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <div className="max-h-48 overflow-auto space-y-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">
            {search ? "未找到匹配的分类" : "暂无分类"}
          </p>
        ) : (
          filtered.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="rounded border-input"
              />
              <span>{category.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
