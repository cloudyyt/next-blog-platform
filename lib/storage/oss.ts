/**
 * 阿里云 OSS 存储驱动
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md 第 2.3、6.2 节。
 *
 * 关键坑：endpoint 内外网切换
 *   - 本地开发 / 本脚本：用外网 endpoint（{region}.aliyuncs.com），走公网
 *   - ECS 服务器：        用内网 endpoint（{region}-internal.aliyuncs.com），走内网免流量费、快几十倍
 *   切换由 env OSS_USE_INTERNAL 控制（服务器设 "true"）。
 *
 * 本文件只导出 getOSS() 一个工厂（单例），不直接 new OSS，便于测试和将来切换驱动。
 */
import OSS from "ali-oss"
import type { StorageDriver } from "./types"

let client: OSS | null = null

function getOSSClient(): OSS {
  if (client) return client

  const region = process.env.OSS_REGION
  const bucket = process.env.OSS_BUCKET
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET

  if (!region || !bucket || !accessKeyId || !accessKeySecret) {
    throw new Error(
      "OSS 环境变量缺失，请检查 .env：OSS_REGION / OSS_BUCKET / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET"
    )
  }

  const useInternal = process.env.OSS_USE_INTERNAL === "true"
  // 内网 endpoint 仅在阿里云 ECS 同地域内可达；本地必须用外网
  const endpoint = useInternal
    ? `https://${region}-internal.aliyuncs.com`
    : `https://${region}.aliyuncs.com`

  client = new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    endpoint,
    secure: true,
  })

  return client
}

/** OSS 驱动实现 */
export const ossDriver: StorageDriver = {
  async save(file: Buffer, key: string, contentType: string): Promise<string> {
    const oss = getOSSClient()
    const result = await oss.put(key, file, {
      mime: contentType,
      headers: {
        // 静态图片长期缓存；avatar/cover 替换时用新 key（带时间戳）避免旧缓存
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
    return result.url
  },

  async remove(key: string): Promise<void> {
    const oss = getOSSClient()
    try {
      await oss.delete(key)
    } catch (err) {
      // 删除失败不阻断主流程（如替换头像时删旧图），仅记日志
      console.error(`[oss] 删除失败 key=${key}:`, err)
    }
  },
}
