import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 确保 PRISMA_DATABASE_URL 存在（Vercel Postgres 自动提供）
if (!process.env.PRISMA_DATABASE_URL) {
  console.error('❌ PRISMA_DATABASE_URL is not set. Database operations will fail.')
  console.error('Please ensure Vercel Postgres database is connected to your project.')
  console.error('If you are using direct connection, set POSTGRES_URL instead.')
}

// 创建 Prisma 客户端实例
// 在 Vercel 环境中，使用 Prisma Accelerate 连接池
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // Prisma Accelerate 会自动处理连接池，无需手动配置
})

// 在 Vercel 环境中，每次请求都可能创建新实例，但为了性能，我们仍然使用全局缓存
// 这可以避免在同一个请求中创建多个 Prisma Client 实例
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

// 优雅关闭连接（在开发环境中）
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

