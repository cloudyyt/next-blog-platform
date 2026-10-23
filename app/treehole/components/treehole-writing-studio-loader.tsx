"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { authFetch } from "@/lib/admin-fetch"
import type { TreeholeAdminEntry, TreeholeAdminSection } from "@/components/admin/treehole/types"
import { TreeholeWritingStudio } from "./treehole-writing-studio"

interface StudioData {
  sections: TreeholeAdminSection[]
  entry?: TreeholeAdminEntry | null
}

export function TreeholeWritingStudioLoader({
  mode,
  entryId,
  initialKind,
  initialSectionId,
}: {
  mode: "create" | "edit"
  entryId?: string
  initialKind?: "article" | "note"
  initialSectionId?: string
}) {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [data, setData] = useState<StudioData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/admin/login")
    }
  }, [authLoading, isAuthenticated, user?.role, router])

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "admin") return

    const load = async () => {
      try {
        const query = entryId ? `?entryId=${encodeURIComponent(entryId)}` : ""
        const res = await authFetch(`/api/admin/treehole/studio${query}`)
        const payload = await res.json()
        if (!res.ok) {
          setError(payload?.message || "读取失败")
          return
        }
        setData({ sections: payload.sections, entry: payload.entry })
      } catch {
        setError("网络错误")
      }
    }
    void load()
  }, [authLoading, isAuthenticated, user?.role, entryId])

  if (error) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div>
          <p className="font-handwriting text-2xl">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">请刷新页面或返回书目</p>
        </div>
      </div>
    )
  }

  if (authLoading || !data) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-handwriting">正在打开树洞写作间…</span>
        </div>
      </div>
    )
  }

  if (mode === "edit" && !data.entry) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <p className="font-handwriting text-2xl">这份手记不存在</p>
      </div>
    )
  }

  return (
    <TreeholeWritingStudio
      mode={mode}
      sections={data.sections}
      entry={data.entry ?? undefined}
      initialKind={initialKind}
      initialSectionId={initialSectionId}
    />
  )
}
