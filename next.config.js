/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prisma 不打包进 serverless，减少冷启动、避免 Vercel 超时
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  // 根路径重定向到 /blog
  async redirects() {
    return [
      {
        source: '/',
        destination: '/blog',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig

