import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 确保 DATABASE_URL 存在
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Database operations will fail.')
  console.error('Please configure DATABASE_URL in Vercel environment variables.')
}

// 延迟连接，避免启动时立即连接数据库
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // 不立即连接，等待第一次查询时再连接
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

