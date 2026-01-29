/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 14.x 使用 experimental；15+ 可用顶层 serverExternalPackages
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
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

