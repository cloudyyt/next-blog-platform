import { NextResponse } from 'next/server'

/**
 * 预热/健康探测端点：供外部定时调用或监控探活。
 * 部署在 ECS + pm2 常驻进程下没有 Serverless 冷启动问题，保留此端点用于探活。
 * 不连数据库，仅返回状态。
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
