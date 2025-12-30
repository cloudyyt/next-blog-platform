import { NextResponse } from "next/server"

export async function POST() {
  // 客户端负责清除 localStorage
  // 服务端可以在这里添加额外的清理逻辑（如清除服务端 session）
  return NextResponse.json({ message: "登出成功" })
}

