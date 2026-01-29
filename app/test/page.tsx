/**
 * 测试页面 - 用于诊断 Vercel 部署问题
 * 不依赖任何客户端 fetch，纯服务端渲染
 */
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function TestDatabase() {
  try {
    // 简单的数据库连接测试
    await prisma.$connect()
    const userCount = await prisma.user.count()
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800 font-semibold">✅ 数据库连接成功</p>
        <p className="text-green-700 text-sm">用户数量: {userCount}</p>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-semibold">❌ 数据库连接失败</p>
        <p className="text-red-700 text-sm font-mono">{error.message}</p>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}

export default async function TestPage() {
  const env = {
    nodeEnv: process.env.NODE_ENV,
    hasPrismaUrl: !!process.env.PRISMA_DATABASE_URL,
    prismaUrlPrefix: process.env.PRISMA_DATABASE_URL?.substring(0, 20) + '...',
    hasJwtSecret: !!process.env.JWT_SECRET,
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    vercelUrl: process.env.VERCEL_URL || 'unknown',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Vercel 部署诊断页面</h1>

        {/* 环境信息 */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">🔧 环境变量</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium">NODE_ENV:</dt>
              <dd className="font-mono">{env.nodeEnv}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">PRISMA_DATABASE_URL:</dt>
              <dd className={env.hasPrismaUrl ? "text-green-600" : "text-red-600"}>
                {env.hasPrismaUrl ? `✅ ${env.prismaUrlPrefix}` : "❌ 未设置"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">JWT_SECRET:</dt>
              <dd className={env.hasJwtSecret ? "text-green-600" : "text-red-600"}>
                {env.hasJwtSecret ? "✅ 已设置" : "❌ 未设置"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">VERCEL_REGION:</dt>
              <dd className="font-mono">{env.vercelRegion}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">VERCEL_URL:</dt>
              <dd className="font-mono">{env.vercelUrl}</dd>
            </div>
          </dl>
        </div>

        {/* 数据库测试 */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">🗄️ 数据库连接</h2>
          <TestDatabase />
        </div>

        {/* 快速链接 */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">🔗 快速测试链接</h2>
          <div className="space-y-2">
            <a href="/api/health" className="block p-2 bg-blue-50 hover:bg-blue-100 rounded">
              /api/health - 健康检查（不连数据库）
            </a>
            <a href="/api/warmup" className="block p-2 bg-blue-50 hover:bg-blue-100 rounded">
              /api/warmup - 预热端点
            </a>
            <a href="/api/blog/config" className="block p-2 bg-blue-50 hover:bg-blue-100 rounded">
              /api/blog/config - 博客配置（连数据库）
            </a>
            <a href="/blog" className="block p-2 bg-blue-50 hover:bg-blue-100 rounded">
              /blog - 博客主页
            </a>
          </div>
        </div>

        {/* 说明 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-900">📝 如何使用此页面</h3>
          <ol className="list-decimal list-inside mt-2 text-sm text-yellow-800 space-y-1">
            <li>如果此页面能正常打开 → 说明 Next.js 运行正常</li>
            <li>检查"环境变量"部分是否都是 ✅</li>
            <li>检查"数据库连接"是否显示 ✅</li>
            <li>逐个点击"快速测试链接"看哪个能打开</li>
            <li>将此页面的截图发给我分析</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
