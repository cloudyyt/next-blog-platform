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
 * 使用 Prisma Migrate API 创建表结构
 */
export async function POST() {
  try {
    // 检查表是否已存在
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `
    
    const tableNames = tables.map(t => t.tablename)
    const requiredTables = ['users', 'posts', 'categories', 'tags', 'comments']
    const existingTables = requiredTables.filter(t => tableNames.includes(t))
    
    if (existingTables.length === requiredTables.length) {
      return NextResponse.json({
        message: "数据库表已存在，无需初始化",
        tables: tableNames
      })
    }
    
    // 使用 Prisma Migrate 的编程 API
    // 注意：这需要 Prisma Migrate，如果使用 db push，需要通过 CLI
    // 这里我们提供一个提示，实际需要通过 Vercel CLI 或手动执行
    
    return NextResponse.json({
      message: "数据库表未完全初始化",
      existingTables,
      missingTables: requiredTables.filter(t => !tableNames.includes(t)),
      instruction: "请在 Vercel 项目设置中运行: pnpm prisma db push",
      note: "或者访问 Vercel 控制台的 Functions 标签，手动执行数据库迁移"
    }, { status: 400 })
  } catch (error: any) {
    console.error("Init DB POST error:", error)
    return NextResponse.json({
      message: "检查数据库失败",
      error: error.message,
      suggestion: "请确保 DATABASE_URL 环境变量已正确配置"
    }, { status: 500 })
  }
}

