import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 确保 PRISMA_DATABASE_URL 存在（Vercel Postgres 自动提供）
if (!process.env.PRISMA_DATABASE_URL) {
  console.error('❌ PRISMA_DATABASE_URL is not set. Database operations will fail.')
  console.error('Please ensure Vercel Postgres database is connected to your project.')
}

// 创建 Prisma 客户端实例
// 在 Vercel 环境中，每次请求都会创建新的实例，所以不需要全局缓存
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// 只在非生产环境缓存 Prisma 实例（开发环境）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

