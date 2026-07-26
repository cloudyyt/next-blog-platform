/**
 * 通用图片上传接口
 *
 * POST /api/admin/upload
 *   Content-Type: multipart/form-data
 *   body: { file: File, folder: "avatar" | "cover/post" | "cover/guide" | "content" }
 *   鉴权: verifyAdmin
 *
 * 处理：
 *   1. 校验类型（image/*）、大小（≤5MB）、folder 白名单
 *   2. sharp 按文件夹 resize + 转 webp（GIF 保留动图，跳过 sharp）
 *   3. 上传到 OSS，返回 { url, key, filename, size }
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md 第 6.3 节。
 */
import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth-middleware"
import { getStorage, isAllowedFolder, buildObjectKey } from "@/lib/storage"

export const runtime = "nodejs"
// sharp 是原生模块，动态 import 避免 Next 收集阶段在 edge runtime 加载它失败
// （Node 版本要求 ≥ 20.9.0，服务器为 20.x，本地 18.x 会报错属预期）

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// 允许的 MIME 前缀（Content-Type 校验）
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export async function POST(request: NextRequest) {
  // 1. 鉴权
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    // 2. 解析 multipart
    const formData = await request.formData()
    const file = formData.get("file")
    const folderRaw = formData.get("folder")

    // 用鸭子类型校验（不依赖全局 File，Node 18 服务端 File 非全局会抛 ReferenceError）
    // 文件类对象有 arrayBuffer 方法和 type/size 字段；普通表单字段是 string
    if (
      !file ||
      typeof file !== "object" ||
      typeof (file as any).arrayBuffer !== "function"
    ) {
      return NextResponse.json({ message: "请选择要上传的文件" }, { status: 400 })
    }
    if (typeof folderRaw !== "string" || !isAllowedFolder(folderRaw)) {
      return NextResponse.json({ message: "非法的上传目录" }, { status: 400 })
    }

    // 3. 类型校验
    if (!file.type || !ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { message: `不支持的文件类型：${file.type || "未知"}（仅支持 jpg/png/webp/gif/avif）` },
        { status: 400 }
      )
    }

    // 4. 大小校验
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: `文件过大：${(file.size / 1024 / 1024).toFixed(1)}MB（上限 5MB）` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const isGif = file.type.toLowerCase() === "image/gif"

    // 5. sharp 处理（GIF 跳过，保留动图；其余按 folder resize + 转 webp）
    let processed: { data: Buffer; ext: string; contentType: string }
    if (isGif) {
      processed = { data: buffer, ext: "gif", contentType: "image/gif" }
    } else {
      // 动态 import sharp（原生模块，运行时才加载）
      const { default: sharp } = await import("sharp")
      const pipeline = sharp(buffer, { failOn: "none" })

      let resized = pipeline
      switch (folderRaw) {
        case "avatar":
          // 头像：正方形 512，cover 裁剪（强制正方形）
          resized = pipeline.resize(512, 512, { fit: "cover" })
          break
        case "cover/post":
        case "cover/guide":
          // 封面：宽 1600，等比缩放
          resized = pipeline.resize(1600, undefined, { fit: "inside", withoutEnlargement: true })
          break
        case "content":
          // 正文插图：宽 1200，等比缩放（省流量）
          resized = pipeline.resize(1200, undefined, { fit: "inside", withoutEnlargement: true })
          break
      }

      const data = await resized.webp({ quality: 82 }).toBuffer()
      processed = { data, ext: "webp", contentType: "image/webp" }
    }

    // 6. 存储到 OSS
    const key = buildObjectKey(folderRaw, processed.ext)
    const storage = getStorage()
    const url = await storage.save(processed.data, key, processed.contentType)

    return NextResponse.json({
      url,
      key,
      filename: key.split("/").pop() || key,
      size: processed.data.length,
    })
  } catch (err: any) {
    console.error("Upload error:", err)
    // OSS 鉴权/网络错误的友好提示
    const msg = err?.code || err?.message || "上传失败"
    if (/InvalidAccessKeyId|SignatureDoesNotMatch|AccessDenied/i.test(msg)) {
      return NextResponse.json(
        { message: "OSS 权限或密钥错误，请检查环境变量配置" },
        { status: 500 }
      )
    }
    return NextResponse.json({ message: "上传失败" }, { status: 500 })
  }
}
