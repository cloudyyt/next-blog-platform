import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * 初始化数据库表结构
 * 访问一次即可创建所有表
 * GET /api/admin/init-db
 */
export async function GET() {
  // 添加超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('数据库连接超时')), 5000) // 5秒超时
  })

  try {
    // 使用 Promise.race 实现超时
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise
    ])
    
    // 检查表是否存在（也添加超时）
    const tables = await Promise.race([
      prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `,
      timeoutPromise
    ]) as Array<{ tablename: string }>
    
    const tableNames = tables.map(t => t.tablename)
    const requiredTables = ['users', 'posts', 'categories', 'tags', 'comments']
    const missingTables = requiredTables.filter(t => !tableNames.includes(t))
    
    if (missingTables.length > 0) {
      return NextResponse.json({
        message: "数据库表未初始化",
        missingTables,
        instruction: "数据库连接正常，但表未创建。请在 Vercel 项目设置中运行: pnpm prisma db push"
      }, { status: 400 })
    }
    
    return NextResponse.json({
      message: "数据库已初始化",
      tables: tableNames
    })
  } catch (error: any) {
    console.error("Init DB error:", error)
    
    // 超时错误
    if (error.message === '数据库连接超时') {
      return NextResponse.json({
        message: "数据库连接超时",
        error: "无法连接到数据库服务器",
        possibleCauses: [
          "DATABASE_URL 环境变量未正确配置",
          "数据库服务器无法访问",
          "网络连接问题"
        ],
        instruction: "请检查 Vercel 项目设置中的 DATABASE_URL 环境变量"
      }, { status: 504 }) // Gateway Timeout
    }
    
    // 表不存在错误
    const errorMessage = error.message || ''
    if (error.code === 'P2021' || 
        errorMessage.includes('does not exist') || 
        (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
      return NextResponse.json({
        message: "数据库表未创建",
        error: error.message,
        instruction: "请运行: pnpm prisma db push"
      }, { status: 400 })
    }
    
    // 其他数据库错误
    return NextResponse.json({
      message: "检查数据库失败",
      error: error.message || 'Unknown error',
      code: error.code,
      suggestion: "请检查 DATABASE_URL 环境变量是否正确配置"
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

