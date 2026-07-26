/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 14.x 使用 experimental；15+ 可用顶层 serverExternalPackages / turbopack
  // ali-oss/sharp/prisma 都是 Node 原生 SDK（动态 require / 原生二进制），
  // 必须标记为外部包，否则 Next/Turbopack 打包会因解析动态 require 报错
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'sharp', 'ali-oss'],
    optimizePackageImports: ['lucide-react'],
    // Turbopack（pnpm dev）兜底：ali-oss 依赖的 urllib 里有动态 require('proxy-agent')，
    // Turbopack 解析不到该模块会报错。指向空模块（仅走代理时才用到，本项目无 HTTP_PROXY）
    turbo: {
      resolveAlias: {
        'proxy-agent': require('path').join(__dirname, 'scripts/empty-module.js'),
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/', destination: '/blog', permanent: false },
    ]
  },
}

module.exports = nextConfig

