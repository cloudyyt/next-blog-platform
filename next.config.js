/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  // 添加重定向配置，确保根路径正确重定向到 /blog
  async redirects() {
    return [
      {
        source: '/',
        destination: '/blog',
        permanent: false, // 使用临时重定向（307），而不是永久重定向（308）
      },
    ]
  },
}

module.exports = nextConfig

