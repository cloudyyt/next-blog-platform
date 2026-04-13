import { pinyin } from "pinyin-pro"
import { prisma } from "./prisma"

/**
 * Generate a URL-friendly slug from a title.
 * Chinese characters are converted to pinyin, other characters are slugified.
 */
export function generateSlug(title: string): string {
  if (!title) return ""

  // Check if the string contains Chinese characters
  const hasChinese = /[\u4e00-\u9fa5]/.test(title)

  let slug: string

  if (hasChinese) {
    // Convert Chinese to pinyin (no tone, with spaces as separators)
    const pinyinStr = pinyin(title, {
      toneType: "none",
      type: "array",
    }).join(" ")

    slug = pinyinStr
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  } else {
    slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  return slug
}

/**
 * Generate a unique slug by checking the database for duplicates.
 * Appends a short random suffix if a duplicate is found.
 * @param title - The title to generate a slug from
 * @param existingId - If editing, pass the post ID to exclude it from the uniqueness check
 */
export async function generateUniqueSlug(
  title: string,
  existingId?: string
): Promise<string> {
  const baseSlug = generateSlug(title)

  if (!baseSlug) return baseSlug

  // Check if slug already exists (excluding current post if editing)
  const existing = await prisma.post.findFirst({
    where: {
      slug: baseSlug,
      ...(existingId && { id: { not: existingId } }),
    },
  })

  if (!existing) return baseSlug

  // Append random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${baseSlug}-${suffix}`
}
