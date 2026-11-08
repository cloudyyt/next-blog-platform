import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth-middleware"
import { buildObjectKey, getStorage } from "@/lib/storage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const IMAGE_MAX_SIZE = 5 * 1024 * 1024
const AUDIO_MAX_SIZE = 30 * 1024 * 1024

/**
 * POST /api/admin/inspirations/upload
 * 灵感池媒体上传。V1 不做转码：图片保留原图，录音保留原始音频；
 * 自动转文字、压缩和 waveform 留到 V2。
 */
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (
      !file ||
      typeof file !== "object" ||
      typeof (file as File).arrayBuffer !== "function" ||
      typeof (file as File).type !== "string"
    ) {
      return NextResponse.json({ message: "请选择文件" }, { status: 400 })
    }

    const uploaded = file as File
    const isImage = uploaded.type.startsWith("image/")
    const isAudio = uploaded.type.startsWith("audio/")
    if (!isImage && !isAudio) {
      return NextResponse.json({ message: "仅支持图片或录音" }, { status: 400 })
    }

    const maxSize = isImage ? IMAGE_MAX_SIZE : AUDIO_MAX_SIZE
    if (uploaded.size > maxSize) {
      return NextResponse.json(
        { message: isImage ? "图片不能超过 5MB" : "录音不能超过 30MB" },
        { status: 400 },
      )
    }

    const extension = uploaded.name.includes(".")
      ? uploaded.name.split(".").pop() ?? (isImage ? "jpg" : "m4a")
      : isImage
        ? "jpg"
        : "m4a"
    const key = buildObjectKey("inspiration", extension)
    const buffer = Buffer.from(await uploaded.arrayBuffer())
    const url = await getStorage().save(buffer, key, uploaded.type)

    return NextResponse.json({
      url,
      key,
      filename: uploaded.name,
      size: uploaded.size,
    })
  } catch (error) {
    console.error("Upload inspiration file error:", error)
    return NextResponse.json({ message: "上传失败，请重试" }, { status: 500 })
  }
}
