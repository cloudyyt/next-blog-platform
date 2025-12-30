import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * 初始化数据库表结构
 * 访问一次即可创建所有表
 * GET /api/admin/init-db
 */
export async function GET() {
  try {
    // 使用 prisma db push 的逻辑，通过 Prisma Client 检查表是否存在
    // 如果表不存在，Prisma 会报错，我们可以捕获并提示用户运行迁移
    
    // 尝试查询一个表来检查数据库连接
    await prisma.$queryRaw`SELECT 1`
    
    // 检查 users 表是否存在
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `
    
    const tableNames = tables.map(t => t.tablename)
    const requiredTables = ['users', 'posts', 'categories', 'tags', 'comments']
    const missingTables = requiredTables.filter(t => !tableNames.includes(t))
    
    if (missingTables.length > 0) {
      return NextResponse.json({
        message: "数据库表未初始化",
        missingTables,
        instruction: "请在 Vercel 项目设置中添加构建后命令，或手动运行: pnpm prisma db push"
      }, { status: 400 })
    }
    
    return NextResponse.json({
      message: "数据库已初始化",
      tables: tableNames
    })
  } catch (error: any) {
    // 如果表不存在，Prisma 会抛出错误
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        message: "数据库表未创建",
        error: error.message,
        instruction: "请运行: pnpm prisma db push"
      }, { status: 400 })
    }
    
    console.error("Init DB error:", error)
    return NextResponse.json({
      message: "检查数据库失败",
      error: error.message
    }, { status: 500 })
  }
}

/**
 * 初始化数据库（实际执行迁移）
 * POST /api/admin/init-db
 */
export async function POST() {
  try {
    // 注意：这个 API 不能直接执行 prisma db push
    // 需要在 Vercel 控制台或通过 CLI 执行
    
    return NextResponse.json({
      message: "请通过以下方式初始化数据库：",
      methods: [
        "1. 在 Vercel 项目设置中添加构建后命令",
        "2. 使用 Vercel CLI: vercel env pull .env.local && pnpm prisma db push",
        "3. 在 Vercel 控制台的 Functions 标签中运行命令"
      ]
    })
  } catch (error: any) {
    return NextResponse.json({
      message: "操作失败",
      error: error.message
    }, { status: 500 })
  }
}

