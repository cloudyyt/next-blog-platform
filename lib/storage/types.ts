/**
 * 存储层抽象 —— 文档见 docs/0725-oss-接入调研与接入草案.md 第六节
 *
 * 设计目的：让"图片存哪"对业务代码透明。
 * 当前实现 OSS 驱动；将来如需本地/其他对象存储，新增一个驱动即可。
 */

/** 允许的目录（folder），对应 Bucket 下 uploads/ 的子目录 */
export const ALLOWED_FOLDERS = [
  "avatar",
  "cover/post",
  "cover/guide",
  "content",
] as const

export type UploadFolder = (typeof ALLOWED_FOLDERS)[number]

/** 存储驱动接口 */
export interface StorageDriver {
  /**
   * 上传文件
   * @param file 文件字节流
   * @param key  对象 key（相对 Bucket 根，如 uploads/avatar/xxx.webp）
   * @param contentType MIME（如 image/webp）
   * @returns 可公网访问的 URL
   */
  save(file: Buffer, key: string, contentType: string): Promise<string>

  /**
   * 删除文件
   * @param key 对象 key
   */
  remove(key: string): Promise<void>
}

/** save 返回的结果 */
export interface StoredFile {
  url: string
  key: string
  filename: string
  size: number
}
