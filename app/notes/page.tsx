import type { Metadata } from "next"
import { NotesCapture } from "@/components/admin-next/notes-capture"

export const metadata: Metadata = {
  title: "笔记",
  robots: { index: false, follow: false },
}

export default function NotesPage() {
  return <NotesCapture />
}
