# Vercel 官方文档对照与修复清单

基于 [Vercel 官方文档](https://vercel.com/docs)（截至 2025/2026）整理，用于排查「构建成功但网页打不开 / API 显示 ---」等问题。

---

## 一、官方要点摘要

### 1. Next.js 部署（[Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)）

- **零配置**：Vercel 自动识别 Next.js，无需单独设 `outputDirectory`。
- **构建命令**：默认使用 `package.json` 的 `build`（即 `next build`）；若需先生成 Prisma，可在 `vercel.json` 里覆盖 `buildCommand`。
- **不要**为 Next.js 项目设置 `outputDirectory`，否则会破坏默认输出。

### 2. 构建配置（[Configuring a Build](https://vercel.com/docs/deployments/configure-a-build)）

- **Build Command**：Next.js 时优先用 `package.json` 的 `build`；可在此或 `vercel.json` 的 `buildCommand` 覆盖。
- **Install Command**：有 `pnpm-lock.yaml` 时自动用 `pnpm install`，一般无需在 `vercel.json` 写；写了则以 `vercel.json` 为准。
- **Output Directory**：仅在不使用框架或静态站点时覆盖；**Next.js 不要设**。

### 3. 函数超时（[Configuring Maximum Duration](https://vercel.com/docs/functions/configuring-functions/duration)）

- **Next.js ≥ 13.5**：应在**路由/API 文件内**设置 `maxDuration`，而不是只依赖 `vercel.json`。
  - 在路由文件顶部：`export const maxDuration = 60`（单位：秒）。
- **vercel.json 的 `functions`**：适用于「非 Next.js 13.5+」或其它运行时；Next.js 14 下以**代码里的 `maxDuration` 优先**。
- **Hobby + Fluid Compute 默认**：300s 默认 / 300s 上限；关闭 Fluid 时默认 10s、上限 60s。

### 4. Fluid Compute（[Fluid compute](https://vercel.com/docs/functions/fluid-compute)）

- **默认开启**：新项目默认启用，可减少冷启动、支持并发等。
- **显式开启**：在 `vercel.json` 中设置 `"fluid": true` 即可。
- **Bytecode 缓存**：Node.js 20+ 时生产环境有字节码缓存，有利于冷启动；Node 版本在 Dashboard 或 `engines` 中设置。

### 5. 项目配置（[Project Configuration](https://vercel.com/docs/project-configuration)）

- **合法字段**：`buildCommand`、`installCommand`、`framework`、`functions`、`fluid`、`regions`、`crons` 等；可用 `$schema` 做校验。
- **regions**：指定部署区域；若只填单一区域（如 `hkg1`）且你本地到该区域网络差，可能出现连接超时，可先不设或改用多区域/默认。

### 6. Next.js 14 的 next.config（[Next.js 14 文档](https://nextjs.org/docs/14)）

- **14.x**：Prisma 等不打包进 Server 时，使用 **`experimental.serverComponentsExternalPackages`**（不是顶层 `serverExternalPackages`，后者为 15+）。
- 若在 14.x 使用顶层 `serverExternalPackages`，会报 `Unrecognized key(s): 'serverExternalPackages'`，需改为放在 `experimental` 下。

### 7. Prisma + Vercel（[KB: Next.js Prisma Postgres](https://vercel.com/kb/guide/nextjs-prisma-postgres)）

- **postinstall**：建议在 `package.json` 中有 `"postinstall": "prisma generate"`。
- **Vercel Postgres / Accelerate**：使用 `PRISMA_DATABASE_URL`（`prisma://...`）时，构建用 `prisma generate --no-engine`，无需本地引擎。

---

## 二、本项目已按官方文档做的修改

| 项目 | 官方建议 | 当前做法 |
|------|----------|----------|
| **next.config.js** | 14.x 用 `experimental.serverComponentsExternalPackages` | 已使用 `experimental.serverComponentsExternalPackages: ['@prisma/client', 'prisma']`，未使用顶层 `serverExternalPackages` |
| **vercel.json** | 使用 `$schema`、可设 `fluid`、Next 超时以代码为准 | 已加 `$schema`、`"fluid": true`，`functions` 仅保留 `app/api/**/*.ts` 的 `maxDuration` 作兜底 |
| **API 超时** | Next.js ≥13.5 在路由内设 `maxDuration` | 已在 `app/api/blog/categories`、`tags`、`posts`、`posts/[slug]`、`config` 的 route 中 `export const maxDuration = 60` |
| **Output Directory** | Next.js 不要设 | 未设置 |
| **Build Command** | 需先生成 Prisma 时覆盖 | `buildCommand`: `pnpm prisma generate --no-engine && pnpm run build` |
| **Node 版本** | 可选 20.x 以用字节码缓存 | `package.json` 中 `engines.node: "18.x"`；若需更好冷启动可改为 `"20.x"` |
| **Prisma 单例** | 避免 Serverless 重复实例化 | `lib/prisma.ts` 使用 `globalThis.prisma` 单例 |
| **预热** | 可选 Cron 调用轻量接口 | 提供 `/api/warmup`，可在 Vercel Cron 或手动调用 |

---

## 三、仍可能出现「---」或打不开的原因（官方+经验）

1. **冷启动**  
   首次请求会冷启动，耗时长；部分请求在超时前未返回会显示 `---`。  
   - **做法**：开启 Fluid Compute（已设 `fluid: true`）、在路由内设 `maxDuration`、部署后先访问几次 `/api/warmup` 或 `/api/health` 做预热。

2. **网络/区域**  
   你本机到 Vercel 所在区域（如 iad1）被墙或很慢，会表现为「服务端日志 200 但浏览器超时」。  
   - **做法**：换网络或 VPN 测试；若必须指定区域，可在 `vercel.json` 设 `regions`（注意单一区域可能加重超时）。

3. **环境变量**  
   `PRISMA_DATABASE_URL`、`JWT_SECRET` 未在 Vercel 对应环境中配置或未勾选 Production/Preview。  
   - **做法**：在 Vercel 项目 → Settings → Environment Variables 中核对并勾选环境。

4. **访问地址**  
   用了旧部署或错误域名（如历史 `next-blog-platform-chi.vercel.app`），该地址可能已不可用。  
   - **做法**：始终用当前部署的 **Visit** 链接（Deployments 里最新一次）。

---

## 四、建议自检顺序

1. **Vercel Dashboard**  
   - Settings → Environment Variables：确认 `PRISMA_DATABASE_URL`、`JWT_SECRET` 存在且勾选 Production。  
   - Settings → Functions：确认 Fluid Compute 已开启（或依赖 `vercel.json` 的 `fluid: true`）。  
   - Deployments：用最新一次部署的 **Visit** 链接访问。

2. **本地/脚本**  
   - 先访问 `https://<当前域名>/api/warmup` 或 `/api/health` 若干次，再访问 `https://<当前域名>/blog`。  
   - 若 `/api/health` 正常、`/blog` 仍超时，多为 `/blog` 或前端请求的冷启动/网络；若 `/api/health` 也超时，多为网络/区域/防火墙。

3. **Node 版本（可选）**  
   - 在 `package.json` 将 `engines.node` 改为 `"20.x"` 并重新部署，可利用 Node 20+ 的字节码缓存减轻冷启动。

---

## 五、参考链接

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)  
- [Configuring a Build](https://vercel.com/docs/deployments/configure-a-build)  
- [Configuring Maximum Duration](https://vercel.com/docs/functions/configuring-functions/duration)  
- [Fluid compute](https://vercel.com/docs/functions/fluid-compute)  
- [Project Configuration](https://vercel.com/docs/project-configuration)  
- [Next.js Prisma Postgres (Vercel KB)](https://vercel.com/kb/guide/nextjs-prisma-postgres)  
