/**
 * 存储层入口 —— 业务代码统一从这里取驱动
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md 第六节。
 *
 * 将来要加本地驱动过渡：把 getStorage() 改成按 env 选驱动即可，
 * 调用方（upload API）零改动。
 */
import { randomUUID } from "crypto"
import { ossDriver } from "./oss"
import type { StorageDriver, UploadFolder, StoredFile } from "./types"

export { ALLOWED_FOLDERS } from "./types"
export type { UploadFolder, StoredFile }

/** 取当前存储驱动（OSS） */
export function getStorage(): StorageDriver {
  return ossDriver
}

/**
 * 校验 folder 是否在白名单内（防路径注入：folder 直接拼进 key）
 */
export function isAllowedFolder(folder: string): folder is UploadFolder {
  return (["avatar", "cover/post", "cover/guide", "content"] as const).includes(
    folder as UploadFolder
  )
}

/**
 * 生成对象 key：uploads/{folder}/{uuid}-{timestamp}.{ext}
 *
 * - 用 uuid + timestamp 防冲突、防覆盖（替换头像/封面时旧图保留或单独删）
 * - ext 由调用方按处理后真实格式给（webp / gif）
 */
export function buildObjectKey(folder: UploadFolder, ext: string): string {
  const ts = Date.now()
  const id = randomUUID().slice(0, 8)
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "webp"
  return `uploads/${folder}/${ts}-${id}.${safeExt}`
}
