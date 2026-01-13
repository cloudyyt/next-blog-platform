import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 检查环境变量
  const hasPrismaUrl = !!process.env.PRISMA_DATABASE_URL
  const hasJwtSecret = !!process.env.JWT_SECRET
  const isVercel = !!process.env.VERCEL
  
  return NextResponse.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: {
      isVercel,
      hasPrismaUrl,
      hasJwtSecret,
      nodeEnv: process.env.NODE_ENV,
    }
  })
}

