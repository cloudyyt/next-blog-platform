import { NextRequest, NextResponse } from "next/server"
import { verifyToken, JWTPayload } from "./auth"

export async function verifyAdmin(request: NextRequest): Promise<{
  error: NextResponse | null
  user: JWTPayload | null
}> {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value

    if (!token) {
      return {
        error: NextResponse.json({ message: "未授权" }, { status: 401 }),
        user: null,
      }
    }

    const payload = verifyToken(token)
    if (!payload) {
      return {
        error: NextResponse.json({ message: "无效的token" }, { status: 401 }),
        user: null,
      }
    }

    if (payload.role !== "admin") {
      return {
        error: NextResponse.json({ message: "需要管理员权限" }, { status: 403 }),
        user: null,
      }
    }

    return {
      error: null,
      user: payload,
    }
  } catch (error) {
    return {
      error: NextResponse.json({ message: "认证失败" }, { status: 401 }),
      user: null,
    }
  }
}

