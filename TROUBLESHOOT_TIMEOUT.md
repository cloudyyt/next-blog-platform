# 解决页面超时问题

## 当前问题
- ✅ Vercel Logs 显示 200（服务器正常响应）
- ❌ 浏览器访问超时（`ERR_CONNECTION_TIMED_OUT`）

## 可能的原因

### 1. 域名不匹配
你访问的是：`next-blog-platform-chi.vercel.app`
但项目名可能是：`next-blog-platform`

**解决方案**：
1. 在 Vercel Dashboard → Settings → Domains 查看正确的域名
2. 或访问：`https://next-blog-platform.vercel.app/blog`（使用项目名）

### 2. 环境变量未配置到生产环境
**检查步骤**：
1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 找到 `PRISMA_DATABASE_URL`
3. **重要**：点击编辑，确认 "Environment" 选择了：
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. 同样检查 `JWT_SECRET`

### 3. 数据库连接字符串格式问题
Vercel 提供了两个连接字符串：
- `PRISMA_DATABASE_URL`（Prisma Accelerate，格式：`prisma+postgres://...`）
- `POSTGRES_URL`（直接连接，格式：`postgres://...`）

**当前配置**：使用 `PRISMA_DATABASE_URL`（Prisma Accelerate）

**如果 Prisma Accelerate 有问题，可以尝试直接连接**：
1. 在 `prisma/schema.prisma` 中改为：
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL")  // 改为直接连接
   }
   ```
2. 在 `lib/prisma.ts` 中检查 `POSTGRES_URL`
3. 重新部署

### 4. 数据库表未初始化
**检查步骤**：
1. 本地运行：
   ```bash
   npx vercel env pull .env.local
   pnpm prisma db push
   ```
2. 如果成功，说明数据库表已创建
3. 如果失败，查看错误信息

### 5. Vercel 冷启动问题
**症状**：第一次访问超时，第二次访问正常

**解决方案**：
- 已优化超时时间（从 3 秒增加到 5 秒）
- 如果还是超时，可能需要使用 Vercel Pro 计划（更快的冷启动）

## 立即检查清单

### ✅ 步骤 1：确认正确的域名
在 Vercel Dashboard → Deployments → 最新部署，查看 "Domains" 部分，找到正确的生产域名。

### ✅ 步骤 2：测试 API 端点
直接访问：
```
https://你的正确域名.vercel.app/api
```
如果返回 JSON，说明服务器正常。

### ✅ 步骤 3：检查 Function Logs
在 Vercel Dashboard → Deployments → 生产部署 → Functions → `/blog`：
- 查看是否有错误日志
- 查看响应时间（如果超过 10 秒，可能是数据库连接慢）

### ✅ 步骤 4：检查环境变量
在 Vercel Dashboard → Settings → Environment Variables：
- 确认 `PRISMA_DATABASE_URL` 存在
- 确认选择了 "Production" 环境
- 确认值不为空

### ✅ 步骤 5：重新部署
如果修改了环境变量或代码：
1. 在 Deployments 中找到生产部署
2. 点击 "..." → "Redeploy"
3. 等待部署完成
4. 再次测试

## 如果问题仍然存在

### 方案 A：使用直接数据库连接（不使用 Prisma Accelerate）
1. 修改 `prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL")
   }
   ```
2. 修改 `lib/prisma.ts`：
   ```typescript
   if (!process.env.POSTGRES_URL) {
     console.error('❌ POSTGRES_URL is not set.')
   }
   ```
3. 重新部署

### 方案 B：检查数据库区域
1. 在 Vercel Dashboard → Storage → 你的数据库 → Settings
2. 确认区域是 `hkg1`（与 `vercel.json` 中的 `regions` 一致）
3. 如果不一致，修改 `vercel.json` 中的 `regions` 或迁移数据库

### 方案 C：联系 Vercel 支持
如果以上都检查过了，可能是 Vercel 平台问题，可以：
1. 在 Vercel Dashboard → Help → Contact Support
2. 提供部署日志和 Function Logs

## 已优化的内容
- ✅ 增加数据库查询超时时间（3秒 → 5秒）
- ✅ 优化错误处理（超时时返回空数据，而不是崩溃）
- ✅ 添加更详细的错误日志
