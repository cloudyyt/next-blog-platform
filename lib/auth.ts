/**
 * 认证相关工具函数
 */

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

/**
 * 读取 JWT 密钥（缺失即拒绝工作，不回退到默认值）。
 *
 * 不在模块顶层抛错：seed 等脚本会 import 本文件的 hashPassword，
 * 顶层抛错会连带阻断与令牌无关的调用方。真正的签发/校验走到这里时才 fail fast。
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "JWT_SECRET 未配置：拒绝签发/校验登录令牌。请在环境变量中配置强随机密钥（≥32 字符）。"
    )
  }
  return secret
}

export interface JWTPayload {
  userId: string
  name: string
  role: string
}

/**
 * 密码加密
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" })
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * 从请求头获取 Token
 */
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

/**
 * 验证昵称格式
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "昵称不能为空" }
  }
  
  if (name.length < 2) {
    return { valid: false, error: "昵称至少需要2个字符" }
  }
  
  if (name.length > 20) {
    return { valid: false, error: "昵称不能超过20个字符" }
  }
  
  // 只允许中文、英文、数字、下划线
  const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/
  if (!nameRegex.test(name)) {
    return { valid: false, error: "昵称只能包含中文、英文、数字和下划线" }
  }
  
  return { valid: true }
}

/**
 * 验证密码格式
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { valid: false, error: "密码不能为空" }
  }
  
  if (password.length < 6) {
    return { valid: false, error: "密码至少需要6个字符" }
  }
  
  if (password.length > 50) {
    return { valid: false, error: "密码不能超过50个字符" }
  }
  
  return { valid: true }
}

