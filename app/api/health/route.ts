import { NextResponse } from 'next/server'

/**
 * 轻量健康检查：不依赖 Prisma/DB，用于确认部署是否可达。
 * 若 /api/health 能通但 /blog 超时，多为 /blog 冷启动或网络；若 /api/health 也超时，多为网络/域名/区域。
 */
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ ok: true, t: Date.now() })
}
