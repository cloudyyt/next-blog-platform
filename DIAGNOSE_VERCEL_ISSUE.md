# Vercel 部署问题诊断文档（供其他 AI / 人工排查）

## 一、问题现象

- **构建**：Vercel 上构建无报错，部署成功。
- **服务端日志**：Vercel Logs 中 `GET /blog` 多次返回 **200**，`GET /` 返回 **307** 重定向到 `/blog`；部分 `GET /api/blog/posts`、`/api/blog/tags`、`/api/blog/categories` 显示 **200**，部分显示 **---**（无状态码，可能超时或未返回）。
- **浏览器表现**：
  - 访问 **错误/旧域名**（如 `next-blog-platform-chi.vercel.app`）时：**ERR_CONNECTION_REFUSED**（连接被拒绝）。
  - 访问 **正确部署链接**（如 `next-blog-platform-xxxxx-zijieleos-projects.vercel.app/blog`）时：**ERR_CONNECTION_TIMED_OUT**（响应时间过长 / 连接超时）。
- **矛盾点**：服务端日志显示 `/blog` 已返回 200，但用户浏览器无法打开页面（连接超时或被拒绝）。

---

## 二、项目结构（目录树）

```
blog-platform/
├── app/
│   ├── layout.tsx          # 根布局（必需）
│   ├── page.tsx            # 根页面，重定向 / → /blog（必需）
│   ├── globals.css
│   ├── admin/              # 管理后台路由
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── posts/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── tags/page.tsx
│   │   ├── users/page.tsx
│   │   └── comments/page.tsx
│   ├── blog/               # 博客前台路由
│   │   ├── layout.tsx
│   │   ├── page.tsx        # 博客列表
│   │   ├── error.tsx       # 错误边界
│   │   ├── [slug]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── api/
│       ├── route.ts        # GET /api
│       ├── health/route.ts # GET /api/health（轻量健康检查）
│       ├── auth/...
│       ├── blog/
│       │   ├── posts/route.ts
│       │   ├── posts/[slug]/route.ts
│       │   ├── categories/route.ts
│       │   ├── tags/route.ts
│       │   └── config/route.ts
│       ├── admin/...
│       └── comments/...
├── components/
├── lib/
│   ├── prisma.ts           # Prisma 单例
│   ├── db-utils.ts         # withTimeout / safeQuery
│   ├── auth.ts
│   └── api/blog.ts         # 前端请求封装
├── prisma/
│   └── schema.prisma
├── next.config.js
├── vercel.json
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 三、关键配置文件内容

### 1. `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/', destination: '/blog', permanent: false },
    ]
  },
}
module.exports = nextConfig
```

### 2. `vercel.json`

```json
{
  "buildCommand": "pnpm prisma generate --no-engine && pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

说明：曾用过 `"regions": ["hkg1"]`，已移除，改为使用 Vercel 默认区域。

### 3. `package.json`（节选）

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postinstall": "prisma generate",
    "prisma:generate:prod": "prisma generate --no-engine"
  },
  "dependencies": {
    "@prisma/client": "^5.19.0",
    "next": "^14.2.0",
    "react": "^18.3.0"
  },
  "devDependencies": {
    "prisma": "^5.19.0"
  }
}
```

### 4. `prisma/schema.prisma`（datasource + generator）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("PRISMA_DATABASE_URL")
}
```

数据库为 **Vercel Postgres**，使用 `PRISMA_DATABASE_URL`（Prisma Accelerate 协议，需以 `prisma://` 开头）。

### 5. `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

if (!process.env.PRISMA_DATABASE_URL) {
  console.error('❌ PRISMA_DATABASE_URL is not set. ...')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => { await prisma.$disconnect() })
}
```

### 6. `app/layout.tsx`（根布局）

- 存在且正常：`html`、`body`、ThemeProvider、VisualThemeProvider、AuthProvider、ToastProvider 包裹 `{children}`。
- 使用 Next.js 字体 `Inter`，引入 `globals.css`。

### 7. `app/page.tsx`（根页面）

- 存在且正常：服务端 `redirect("/blog")`（生产/预览）；本地在 `PORT=3001` 或 `ADMIN_PORT=true` 时 `redirect("/admin")`。
- `export const dynamic = "force-dynamic"`。

### 8. `.env.example`（预期环境变量）

```env
# 本地
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"

# Vercel 生产（在 Dashboard 配置）
# PRISMA_DATABASE_URL 由 Vercel Postgres 自动注入
# JWT_SECRET 需在 Vercel → Settings → Environment Variables 手动添加
```

---

## 四、已做过的排查与修改

1. **Prisma**：schema 使用 `PRISMA_DATABASE_URL`；曾出现 “URL must start with the protocol `prisma://`”，已确认 Vercel 使用该变量且为 Prisma Accelerate 链接。
2. **构建**：`vercel.json` 使用 `prisma generate --no-engine` + `pnpm run build`；`next.config.js` 中 `serverExternalPackages: ['@prisma/client', 'prisma']` 已配置。
3. **App Router**：已确认存在 `app/layout.tsx`、`app/page.tsx`，无缺失。
4. **区域**：已从 `vercel.json` 移除 `regions: ["hkg1"]`，避免单区域导致部分用户连接超时。
5. **前端**：博客列表页有 12 秒保底结束 loading、10 秒请求超时；`app/blog/error.tsx` 错误边界已加；API 有 8 秒整体超时与空数组兜底。
6. **访问地址**：已尝试使用 Deployments 里当前部署的 Visit 链接（非旧域名 `next-blog-platform-chi.vercel.app`），仍出现连接超时。

---

## 五、Vercel 环境变量（请确认）

在 **Vercel 项目 → Settings → Environment Variables** 中需有：

| 变量名 | 来源 | 说明 |
|--------|------|------|
| `PRISMA_DATABASE_URL` | Vercel Postgres 自动注入（或从 Storage → Connection 复制） | 必须以 `prisma://` 开头 |
| `JWT_SECRET` | 手动添加 | 建议 32+ 字符随机串 |

并确认勾选 **Production**（以及如需要 Preview）。

---

## 六、需要协助分析的方向

1. **为何 Vercel 日志显示 `/blog` 200，但浏览器却 ERR_CONNECTION_TIMED_OUT？**  
   是否可能为地域/运营商、DNS、防火墙导致仅部分请求到达 Vercel，或日志与用户请求并非同一次？

2. **API 日志中部分请求显示 `---` 无状态码**：是否表示 Function 超时或未正常返回？与 Vercel 的 Function 超时、冷启动或 Prisma 连接是否有关系？

3. **Next.js 14 + Prisma + Vercel**：  
   当前 `serverExternalPackages`、`prisma generate --no-engine`、单例 Prisma 的用法是否存在已知问题或更推荐配置？

4. **除配置与代码外**：  
   是否还应从 Vercel 项目设置（如 Function Region、Timeout）、或用户侧网络（VPN、换网、移动热点）进一步排查？

---

## 七、复现步骤（供他人复现）

1. 使用 Vercel 部署本仓库（连接 GitHub，自动构建）。
2. 在 Vercel 中配置 `PRISMA_DATABASE_URL`（Vercel Postgres）和 `JWT_SECRET`。
3. 部署完成后，在 Deployments 中复制当前部署的 **Visit** 链接。
4. 在浏览器中访问 `https://<Visit 链接>/blog`。
5. 观察：部分环境下出现 ERR_CONNECTION_TIMED_OUT，而 Vercel Logs 中同一时段可能有 `/blog` 200 记录。

---

## 八、已按「冷启动/超时」诊断实施的修改

1. **lib/prisma.ts**：改为 `globalThis` 单例，避免 Serverless 每次请求重复实例化。
2. **next.config.js**：增加 `experimental.optimizePackageImports`、`images.formats`，未使用 `output: 'standalone'`（Vercel 不推荐）。
3. **vercel.json**：增加 `functions` 下 API/页面路由的 `maxDuration`（API 60s，页面 30s）。
4. **lib/db-utils.ts**：`withTimeout` 支持超时后返回 `fallback`，避免只 reject；默认 8s。
5. **app/api/warmup/route.ts**：新增预热端点，供 Cron 或手动调用。
6. **package.json**：增加 `engines.node >= 18`。

**未采纳项**：`output: 'standalone'`（会改变 Vercel 部署方式）；`regions: ["hkg1"]`（此前曾导致你这边连接超时，如需可自行加回）；Prisma `datasources` 运行时覆盖（Accelerate 使用生成时 env 即可）。

**建议**：部署后先访问几次 `/api/warmup` 或 `/api/health` 做预热，再访问 `/blog`。可选在 API 路由中加 `export const maxDuration = 60`。详见 `docs/WARMUP_CRON.md`。

---

*文档生成自当前代码与配置，便于提供给其他 AI 或开发者做进一步诊断。*
