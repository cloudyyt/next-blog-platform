import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

if (!process.env.PRISMA_DATABASE_URL) {
  console.warn('PRISMA_DATABASE_URL is not set. Database operations may fail.')
}

function prismaClientSingleton(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })
}

// 使用 globalThis 避免 Serverless 冷启动时重复实例化
export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
} else {
  globalThis.prisma = prisma
}

export default prisma
