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
