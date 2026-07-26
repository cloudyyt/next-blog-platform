# 0726 · admin/guide 静态预渲染大坑（build 时把本地 DB 数据烤死）

> 本文档记录 2026-07-26 排查"线上 admin 指南编辑页 404"的完整过程与根因。
> **这是 Next.js App Router + Prisma server component 的经典陷阱**，值得所有类似项目警惕。

---

## 一、现象

线上 `https://www.zijieleo.cn/admin/guide` 列表页显示的章节，点"编辑"按钮 → **404**。

- 本地 dev 一切正常
- 线上服务器内 `curl localhost:3000/admin/guide/<真实id>/edit` → **200**
- 线上服务器内 `curl https://www.zijieleo.cn/admin/guide` → **200**
- 浏览器直接访问真实 id 的编辑页 URL → **能进**
- 但从列表页点编辑 → 跳转的 URL 用了一个**线上 DB 根本不存在的 id** → 404

---

## 二、排查过程的弯路（避免重蹈）

排查走了大量弯路，记录每个被推翻的错误假设：

| # | 错误假设 | 被什么推翻 |
|---|---------|-----------|
| 1 | 浏览器缓存了旧 id | 无痕窗口也复现 |
| 2 | 线上代码是旧的、缺功能 | 用户本地构建上传，代码是最新的 |
| 3 | Nginx/宝塔拦截了 `/admin` 路径 | curl 用域名访问返回 200，error 日志无相关记录 |
| 4 | Next.js Router Cache（客户端路由缓存） | 硬刷新（Cmd+Shift+R）也不解决 |
| 5 | DB 里有两批 id（旧 seed 残留） | psql 查 `cmrw_count = 0`，DB 里全是 `cms1...` |
| 6 | Postico 连的不是服务器 DB | 用户确认连的就是服务器 DB |

**弯路的教训**：当 server component 直接查 Prisma 时，**永远要怀疑"build 时数据被烤死"**，这是第一假设，不要先怀疑缓存/网络/Nginx。

---

## 三、根因（铁证）

### 关键矛盾

用同一个连接串 `postgresql://blog_user:***@127.0.0.1:5432/blog_platform`：

| 数据源 | chapter id |
|--------|-----------|
| psql 直连查询（运行时） | `cms1oogke...`（线上 DB 真实数据）|
| curl 抓列表页 HTML（Next.js 渲染） | `cmrwdflam...`（**本地 DB 的 id**）|
| 浏览器点编辑跳转的 URL | `cmrwdflam...`（和列表页一致）|

**同一个库、同一个表，psql 查到 `cms1...`，但 Next.js 列表页渲染出 `cmrw...`——重启 pm2 都不变。**

### 决定性证据

```bash
# build 输出
├ ○ /admin/guide          ← ○ = 静态预渲染（Static prerendered）
├ ƒ /admin/guide/[id]/edit  ← ƒ = 动态（Dynamic，运行时渲染）
```

`/admin/guide` 是 server component（直接 `prisma.guideChapter.findMany()`），**没有声明 `dynamic` 或 `revalidate`**，Next.js 默认把它当**静态页**处理——在 `pnpm build` 那一刻执行查询，把结果**烤进 `.next` 静态产物**。

### 完整因果链

1. 本地 `pnpm build` → Next.js 执行 `prisma.guideChapter.findMany()` → 拿到**本地 DB** 的数据（id = `cmrw...`）
2. Next.js 把这份数据**烤进 `.next/server/app/admin/guide/page.{html,rsc}`** 静态产物
3. `deploy.local.sh` 把 `.next` 上传到服务器
4. 线上 `next start` 跑的是这份"本地数据快照"静态页
5. 访问 `/admin/guide` → 返回 build 时烤死的 `cmrw...`（不是线上 DB 的 `cms1...`）
6. 点编辑 → 用 `cmrw...` → 编辑页是动态路由（`ƒ`），实时查 DB 找不到 `cmrw...` → **404**

### 为什么其他 admin 列表页没问题

`/admin/posts`、`/admin/users`、`/admin/categories`、`/admin/tags`、`/admin/comments` 都是 `"use client"` 客户端组件——它们用 `useEffect` + fetch API 运行时拿数据，**不会被 build 烤死**。

只有 `/admin/guide` 是 server component 直接查 Prisma，触发了静态预渲染。

---

## 四、修复

`app/admin/guide/page.tsx` 加一行：

```ts
// 强制运行时渲染（动态）：避免 build 时用本地 DB 数据把列表页"烤死"成静态产物。
export const dynamic = "force-dynamic"
```

修复后 build 输出：
```
├ ƒ /admin/guide          ← 变成 ƒ（动态），每次请求实时查 DB
```

---

## 五、规律与防范（重要）

### 什么时候会踩这个坑

**server component 直接查 Prisma + 不带任何动态声明** → 会被静态预渲染。

具体来说，如果一个 page：
1. 是 server component（没有 `"use client"`）
2. 直接调 `prisma.*.findMany()` / `findUnique()` 等
3. 没有声明 `export const dynamic` / `export const revalidate`
4. 查询结果不依赖 request 专属信息（headers、cookies、searchParams）

→ Next.js 会判定它是"可静态化的"，在 build 时执行查询、烤死数据。

### 防范原则

**所有 admin/后台的 server component 列表页，都应该加 `export const dynamic = "force-dynamic"`。**

理由：后台数据必须实时反映 DB（admin 改了内容要立刻看到），静态化毫无意义，反而会把本地构建时的数据带到线上。

### 已知会踩坑的页面（本项目）

- ✅ `app/admin/guide/page.tsx` —— 已修复（force-dynamic）
- 其他 admin 列表页都是 `"use client"`，不受影响

### 未来新增 admin 页面时

如果新页面是 server component 查 Prisma，**默认就加 `force-dynamic`**，不要等出问题再补。

---

## 六、验证方法

部署后，在服务器跑：

```bash
# 列表页渲染的 id 应该等于 DB 真实 id
curl -s https://www.zijieleo.cn/admin/guide | grep -oE "cms[a-z0-9]+|cmr[a-z0-9]+" | sort -u
# 应该全是 cms1...（和 psql 查的一致）
```

如果 curl 抓到的 id 和 psql 查的一致 → 修复生效。

---

## 附：排查命令清单（复现时用）

```bash
ssh root@<SERVER_IP>
cd /www/wwwroot/next-blog-platform

PSQL=/www/server/pgsql/bin/psql
DB="postgresql://blog_user:***@127.0.0.1:5432/blog_platform"

# 1. DB 真实 id
$PSQL "$DB" -c 'SELECT id, slug FROM guide_chapters LIMIT 5;'

# 2. 列表页渲染的 id
curl -s https://<域名>/admin/guide | grep -oE "cmr[a-z0-9]+|cms[a-z0-9]+" | sort -u

# 3. 对比 1 和 2：不一致 = 数据被烤死（静态化问题）

# 4. build 标记
# 本地 pnpm build | grep "admin/guide" → ○ 是静态、ƒ 是动态
```

---

## 七、续：真凶是 Nginx proxy_cache（三重缓存叠加）

> 加了 `force-dynamic` 重新部署后，**问题依旧**。继续深挖，发现是**三重缓存叠加**——这才是完整的真相，也是最有博文价值的部分。

### 现象复盘

加了 `force-dynamic`、清了 `.next/cache`、重启 pm2 后：
- `curl http://localhost:3000/admin/guide`（直连 Next.js）→ ✅ `cms1...`（正确）
- `curl https://www.zijieleo.cn/admin/guide`（经 Nginx）→ ❌ `cmrw...`（旧）+ `x-nextjs-cache: HIT`

**同一个 Next.js 进程，直连正确、走域名错误**——必然是 Nginx 层缓存。

### 关键诊断命令（一锤定音）

```bash
# 1. 带随机 query 绕过缓存
curl "https://www.zijieleo.cn/admin/guide?nocache=$(date +%s)"
# → 返回 cms1...（正确）= 缓存按 URL key

# 2. 用域名 Host 打 localhost（隔离变量）
curl -H "Host: www.zijieleo.cn" http://localhost:3000/admin/guide
# → 返回 cms1...（正确）= Next.js 按 Host 缓存的假设被推翻

# 3. 用 IP + HTTPS + 域名 Host（走 Nginx）
curl -sk -H "Host: www.zijieleo.cn" https://127.0.0.1/admin/guide
# → 返回 cmrw...（错误）+ x-nextjs-cache: HIT = 确认是 Nginx 层
```

第 3 步是决定性的：**localhost 直连正确，但经过 Nginx 就变旧**——缓存一定在 Nginx。

### 找到缓存源

```bash
# 查 Nginx 全局配置（不只看站点配置！）
nginx -T 2>/dev/null | grep -A2 "proxy_cache"

# 输出：
# /www/server/nginx/conf/proxy.conf:
# proxy_cache_path /www/server/nginx/proxy_cache_dir ... keys_zone=cache_one ... inactive=1d
# proxy_cache cache_one;
```

**宝塔的 `proxy.conf` 全局开启了 `proxy_cache cache_one`**——所有反代请求被缓存到 `/www/server/nginx/proxy_cache_dir`，1 天失效。

### 完整因果链（三重缓存）

```
用户请求 /admin/guide
  ↓
Nginx proxy_cache（第 1 重，宝塔全局开）
  命中 → 返回旧的缓存响应（含旧的 cmrw... id + 旧的 x-nextjs-cache: HIT header）
  未命中 ↓
Next.js ISR cache（第 2 重，.next/cache）
  命中 → 返回缓存的 RSC payload
  未命中 ↓
Next.js 静态预渲染（第 3 重，build 时烤死）
  → 用 build 时的 DB 数据渲染
```

三重缓存，每一重都可能返回旧数据。即使修了第 3 重（force-dynamic）、清了第 2 重（.next/cache），**第 1 重（Nginx）还在返回旧响应**。

### `x-nextjs-cache: HIT` 的误导性

这个 header 是 **Next.js 响应里自带的**，被 Nginx 连同整个响应（body + headers）一起缓存了。所以 Nginx 返回的 `x-nextjs-cache: HIT` 是**旧的 Next.js header**，不是 Nginx 自己加的——极其误导，让人以为是 Next.js ISR 缓存。

### 修复

**第 1 步（临时）**：清 Nginx 缓存目录
```bash
rm -rf /www/server/nginx/proxy_cache_dir/*
nginx -s reload
```

**第 2 步（根治）**：站点配置关掉 proxy_cache（Next.js 不需要 Nginx 再缓存一层）

在站点 Nginx 配置的 `location /` 里加一行：
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_cache off;          # ← 关掉宝塔全局的 proxy_cache
    ...
}
```

### 为什么 Next.js 应用不该开 Nginx proxy_cache

| 维度 | Nginx proxy_cache | Next.js 自带缓存 |
|------|------------------|----------------|
| 机制 | 按 URL 缓存完整 HTTP 响应 | ISR（按路由缓存 RSC payload）+ 静态预渲染 |
| 失效 | 时间过期（inactive=1d）或手动清 | revalidatePath/revalidateTag 精准失效 |
| 问题 | admin 改了内容，Nginx 不知道，继续返回旧缓存 | Next.js 知道（revalidatePath 触发），能精准更新 |

Next.js 有自己的、**精准的**缓存失效机制（`revalidatePath`）。Nginx 的 proxy_cache 是**粗糙的按时间失效**，会盖过 Next.js 的精准失效——导致"代码里调了 revalidatePath 但页面不更新"。所以 Next.js 应用必须 `proxy_cache off`。

---

## 八、博文素材价值标注

这个排查过程适合写成技术博文，素材点：

1. **三重缓存叠加的诡异现象**：同一个进程、同一个 DB，localhost 正确、域名错误——这种"幽灵 bug"很抓眼球
2. **6 个错误假设逐一被推翻**：缓存/代码/Nginx 拦截/Router Cache/DB 双库/Postico 连错——展现工程师排查的真实弯路
3. **`x-nextjs-cache: HIT` 的误导性**：看起来是 Next.js 缓存，实际是 Nginx 缓存的旧 header——深入到 HTTP 协议层
4. **隔离变量法**：localhost vs 域名、IP+Host vs 域名、带 query vs 不带——系统化的二分排查
5. **宝塔默认配置的坑**：proxy.conf 全局开 proxy_cache，本意给 PHP 加速，却坑了 Node 应用——运维视角的洞察

**建议标题**：《一次诡异的 404：三重缓存如何让我排查到凌晨》或《Next.js 部署踩坑：当 Nginx proxy_cache 遇上 ISR》

