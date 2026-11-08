import type { Metadata } from "next"
import { InspirationPoolApp } from "@/components/admin-next/inspiration-pool-app"

export const metadata: Metadata = {
  title: "灵感池 · 管理后台",
}

export default function AdminInspirationsPage() {
  return <InspirationPoolApp />
}
