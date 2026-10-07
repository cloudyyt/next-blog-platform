import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function LegacyEditLifePostPage() {
  redirect("/admin/life/content")
}
