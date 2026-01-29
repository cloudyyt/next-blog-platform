import { NextResponse } from 'next/server'

/**
 * 预热端点：供 Vercel Cron 或外部定时调用，减少 Serverless 冷启动。
 * 不连数据库，仅返回状态与区域信息。
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? 'unknown',
  })
}
