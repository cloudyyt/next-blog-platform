import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function LegacyNewLifePostPage() {
  redirect("/admin/life/content/new?kind=article")
}
