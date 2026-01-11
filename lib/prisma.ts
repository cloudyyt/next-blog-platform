import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 确保 PRISMA_DATABASE_URL 存在（Vercel Postgres 自动提供）
if (!process.env.PRISMA_DATABASE_URL) {
  console.error('❌ PRISMA_DATABASE_URL is not set. Database operations will fail.')
  console.error('Please ensure Vercel Postgres database is connected to your project.')
}

// 延迟连接，避免启动时立即连接数据库
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // 不立即连接，等待第一次查询时再连接
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

