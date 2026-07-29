/**
 * 用户头像上传接口（专用）
 *
 * POST /api/auth/upload-avatar
 *   Content-Type: multipart/form-data
 *   body: { file: File }
 *   鉴权: 任意登录用户（verifyToken），写入「当前用户」的 avatar 字段
 *
 * 与 /api/admin/upload 的区别：
 *   - admin/upload 是通用上传（任意 folder），需 admin 权限
 *   - 本接口只接受头像上传（folder 固定 avatar），登录即可，更安全
 *
 * 处理：校验 → sharp 512x512 cover 裁剪 + webp → 上传 OSS → 写入当前 user.avatar
 */
import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"
import { getStorage, buildObjectKey } from "@/lib/storage"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs" // sharp 原生模块

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export async function POST(request: NextRequest) {
  // 1. 鉴权：任意登录用户
  const token = getTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ message: "Token 无效，请重新登录" }, { status: 401 })
  }

  try {
    // 2. 解析 multipart
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || typeof file !== "object" || typeof (file as any).arrayBuffer !== "function") {
      return NextResponse.json({ message: "请选择要上传的头像" }, { status: 400 })
    }

    // 3. 类型校验
    if (!file.type || !ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { message: `不支持的文件类型：${file.type || "未知"}（仅支持 jpg/png/webp/gif/avif）` },
        { status: 400 },
      )
    }

    // 4. 大小校验
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: `文件过大：${(file.size / 1024 / 1024).toFixed(1)}MB（上限 5MB）` },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const isGif = file.type.toLowerCase() === "image/gif"

    // 5. sharp 处理（头像固定 512x512 cover 正方形）
    let processed: { data: Buffer; ext: string; contentType: string }
    if (isGif) {
      processed = { data: buffer, ext: "gif", contentType: "image/gif" }
    } else {
      const { default: sharp } = await import("sharp")
      const data = await sharp(buffer, { failOn: "none" })
        .resize(512, 512, { fit: "cover" })
        .webp({ quality: 82 })
        .toBuffer()
      processed = { data, ext: "webp", contentType: "image/webp" }
    }

    // 6. 上传 OSS（folder 固定 avatar）
    const key = buildObjectKey("avatar", processed.ext)
    const storage = getStorage()
    const url = await storage.save(processed.data, key, processed.contentType)

    // 7. 写入当前用户的 avatar
    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: { avatar: url },
      select: { id: true, name: true, avatar: true, bio: true, role: true, createdAt: true },
    })

    return NextResponse.json({
      url,
      key,
      user: { ...updated, createdAt: updated.createdAt.toISOString() },
    })
  } catch (err: any) {
    console.error("Upload avatar error:", err)
    const msg = err?.code || err?.message || "上传失败"
    if (/InvalidAccessKeyId|SignatureDoesNotMatch|AccessDenied/i.test(msg)) {
      return NextResponse.json({ message: "OSS 权限或密钥错误" }, { status: 500 })
    }
    return NextResponse.json({ message: "上传失败" }, { status: 500 })
  }
}
