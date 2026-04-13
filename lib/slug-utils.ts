import { pinyin } from "pinyin-pro"

export function slugifyName(name: string): string {
  const trimmed = (name || "").trim()
  if (!trimmed) return ""

  const hasChinese = /[\u4e00-\u9fa5]/.test(trimmed)

  const base = hasChinese
    ? pinyin(trimmed, { toneType: "none", type: "array" }).join(" ")
    : trimmed

  return base
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function withRandomSuffix(baseSlug: string): string {
  const suffix = Math.random().toString(36).slice(2, 6)
  return baseSlug ? `${baseSlug}-${suffix}` : suffix
}

