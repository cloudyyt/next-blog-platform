# Vercel 预热与 Cron 配置（减轻冷启动超时）

## 1. 预热端点

已提供两个轻量端点，可用于预热或健康检查（不连数据库）：

- **`/api/health`**：Edge 运行时，返回 `{ ok: true, t }`
- **`/api/warmup`**：返回 `{ status: 'ok', timestamp, region }`，适合 Cron 或监控

部署后先访问几次：`https://你的域名.vercel.app/api/warmup`，再访问 `/blog`，有助于减少冷启动超时。

## 2. Vercel Cron 配置（可选）

若使用 Vercel Pro，可在项目根目录添加 `vercel.json` 的 `crons`（或使用 Dashboard）：

```json
{
  "crons": [
    {
      "path": "/api/warmup",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

即每 5 分钟请求一次 `/api/warmup`，保持 Function 温热。

**在 Dashboard 中配置**：Vercel 项目 → Settings → Crons（若计划支持）或通过 Git 在 `vercel.json` 中配置。

## 3. 在 API 路由中单独设置超时（推荐）

Next.js 13.5+ 可在路由文件中导出 `maxDuration`：

```ts
// app/api/blog/posts/route.ts
export const maxDuration = 60 // 秒
export const dynamic = 'force-dynamic'
// ...
```

对易超时的 API 可逐文件设置，无需只依赖 `vercel.json`。
