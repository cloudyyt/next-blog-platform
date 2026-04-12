import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../lib/auth"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 开始创建测试数据...")

  // 1. 创建管理员用户（博主）
  console.log("📝 创建用户...")
  const adminPassword = await hashPassword("admin123")
  const admin = await prisma.user.upsert({
    where: { name: "博主" },
    update: {},
    create: {
      name: "博主",
      password: adminPassword,
      role: "admin",
    },
  })
  console.log("✅ 用户创建成功:", admin.name)

  // 2. 创建分类
  console.log("📁 创建分类...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "react-learning" },
      update: {},
      create: {
        name: "React学习",
        slug: "react-learning",
        description: "React 框架相关文章",
      },
    }),
    prisma.category.upsert({
      where: { slug: "frontend-engineering" },
      update: {},
      create: {
        name: "前端工程化",
        slug: "frontend-engineering",
        description: "前端工程化实践",
      },
    }),
    prisma.category.upsert({
      where: { slug: "network-basics" },
      update: {},
      create: {
        name: "网络基础",
        slug: "network-basics",
        description: "计算机网络基础知识",
      },
    }),
    prisma.category.upsert({
      where: { slug: "life-essay" },
      update: {},
      create: {
        name: "生活随笔",
        slug: "life-essay",
        description: "日常记录与思考",
      },
    }),
    prisma.category.upsert({
      where: { slug: "reading-notes" },
      update: {},
      create: {
        name: "读书笔记",
        slug: "reading-notes",
        description: "读书摘录与读后感",
      },
    }),
    prisma.category.upsert({
      where: { slug: "css-layout" },
      update: {},
      create: {
        name: "CSS 与布局",
        slug: "css-layout",
        description: "样式与响应式布局",
      },
    }),
  ])
  console.log("✅ 分类创建成功:", categories.length, "个")

  // 3. 创建标签
  console.log("🏷️ 创建标签...")
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react" },
    }),
    prisma.tag.upsert({
      where: { slug: "vue3" },
      update: {},
      create: { name: "Vue3", slug: "vue3" },
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript" },
    }),
    prisma.tag.upsert({
      where: { slug: "frontend-engineering" },
      update: {},
      create: { name: "前端工程化", slug: "frontend-engineering" },
    }),
    prisma.tag.upsert({
      where: { slug: "network-basics" },
      update: {},
      create: { name: "网络基础", slug: "network-basics" },
    }),
    prisma.tag.upsert({
      where: { slug: "vanilla-js" },
      update: {},
      create: { name: "原生JavaScript", slug: "vanilla-js" },
    }),
    prisma.tag.upsert({
      where: { slug: "vite" },
      update: {},
      create: { name: "Vite", slug: "vite" },
    }),
    prisma.tag.upsert({
      where: { slug: "css" },
      update: {},
      create: { name: "CSS", slug: "css" },
    }),
    prisma.tag.upsert({
      where: { slug: "essay" },
      update: {},
      create: { name: "随笔", slug: "essay" },
    }),
    prisma.tag.upsert({
      where: { slug: "reading" },
      update: {},
      create: { name: "读书", slug: "reading" },
    }),
    prisma.tag.upsert({
      where: { slug: "tailwind" },
      update: {},
      create: { name: "Tailwind", slug: "tailwind" },
    }),
  ])
  console.log("✅ 标签创建成功:", tags.length, "个")

  // 4. 创建文章
  console.log("📄 创建文章...")
  
  const reactTag = tags.find(t => t.slug === "react")!
  const tsTag = tags.find(t => t.slug === "typescript")!
  const nextjsTag = tags.find(t => t.slug === "nextjs")!
  const feTag = tags.find(t => t.slug === "frontend-engineering")!
  const networkTag = tags.find(t => t.slug === "network-basics")!
  const viteTag = tags.find(t => t.slug === "vite")!
  const cssTag = tags.find(t => t.slug === "css")!
  const essayTag = tags.find(t => t.slug === "essay")!
  const readingTag = tags.find(t => t.slug === "reading")!
  const tailwindTag = tags.find(t => t.slug === "tailwind")!
  const vueTag = tags.find(t => t.slug === "vue3")!
  
  const post1 = await prisma.post.upsert({
    where: { slug: "learning-react-from-hooks-part-1" },
    update: {},
    create: {
      title: "从React hooks学习React系列 (一)",
      slug: "learning-react-from-hooks-part-1",
      content: `# 从React hooks学习React系列 (一)

个人觉得hook的学习是一个很好的React框架学习切入点，通过理解基本使用、常见使用场景来逐渐掌握框架脉络。

## 为什么从Hooks开始？

React Hooks 是 React 16.8 引入的新特性，它让我们可以在函数组件中使用状态和其他 React 特性。学习 Hooks 有以下几个优势：

1. **函数式编程思维**：Hooks 鼓励使用函数组件，代码更简洁
2. **逻辑复用**：自定义 Hooks 可以轻松复用状态逻辑
3. **更好的性能**：函数组件通常比类组件性能更好
4. **未来趋势**：React 团队推荐使用 Hooks

## useState - 状态管理的基础

\`useState\` 是 React 中最基础的 Hook，用于在函数组件中添加状态。

### 基本用法

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        点击增加
      </button>
    </div>
  );
}
\`\`\`

### 使用场景

- 表单输入
- 开关状态
- 计数器
- 任何需要响应式更新的数据

## useEffect - 副作用处理

\`useEffect\` 用于处理副作用，如数据获取、订阅、手动 DOM 操作等。

### 基本用法

\`\`\`tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 组件挂载或 userId 变化时执行
    fetchUser(userId).then(setUser);
  }, [userId]); // 依赖数组

  return <div>{user?.name}</div>;
}
\`\`\`

## 总结

通过理解 \`useState\` 和 \`useEffect\`，我们已经掌握了 React Hooks 的基础。这两个 Hook 是构建 React 函数组件的基石。

提示:实践是最好的老师,建议多写代码来加深理解。`,
      excerpt: "从 React Hooks 开始学习 React，理解 useState 和 useEffect 的基本用法和使用场景。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[0].id }],
      },
      tags: {
        connect: [reactTag.id, tsTag.id].map(id => ({ id })),
      },
    },
  })

  const post2 = await prisma.post.upsert({
    where: { slug: "understanding-http-protocol" },
    update: {},
    create: {
      title: "深入理解 HTTP 协议",
      slug: "understanding-http-protocol",
      content: `# 深入理解 HTTP 协议

HTTP（HyperText Transfer Protocol）是互联网上应用最广泛的网络协议之一。

## HTTP 基础

HTTP 是一个**无状态**的协议，每个请求都是独立的，服务器不会记住之前的请求。

### HTTP 请求方法

- **GET**: 获取资源
- **POST**: 创建资源
- **PUT**: 更新资源
- **DELETE**: 删除资源
- **PATCH**: 部分更新资源

### HTTP 状态码

- **200**: 成功
- **404**: 未找到
- **500**: 服务器错误
- **301**: 永久重定向

## HTTPS 与安全

HTTPS 是 HTTP 的安全版本，通过 TLS/SSL 加密传输数据。

## 总结

理解 HTTP 协议对于前端开发至关重要，它帮助我们更好地理解网络请求和响应。`,
      excerpt: "深入理解 HTTP 协议的基本概念、请求方法、状态码以及 HTTPS 安全机制。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[2].id }],
      },
      tags: {
        connect: [{ id: networkTag.id }],
      },
    },
  })

  const post3 = await prisma.post.upsert({
    where: { slug: "modern-frontend-build-tools" },
    update: {},
    create: {
      title: "现代前端构建工具对比",
      slug: "modern-frontend-build-tools",
      content: `# 现代前端构建工具对比

前端构建工具的发展经历了从 Grunt、Gulp 到 Webpack、Vite 的演进。

## Webpack

Webpack 是目前最流行的模块打包器，功能强大但配置复杂。

### 特点

- 支持多种模块格式
- 强大的插件系统
- 代码分割和懒加载
- 热模块替换（HMR）

## Vite

Vite 是新一代的前端构建工具，由 Vue 作者尤雨溪开发。

### 特点

- 极速的开发服务器启动
- 基于 ES 模块的构建
- 原生支持 TypeScript
- 开箱即用的优化

## 选择建议

- **大型项目**: 选择 Webpack（生态成熟）
- **新项目**: 选择 Vite（开发体验更好）
- **React 项目**: 两者都支持，根据团队熟悉度选择

## 总结

选择合适的构建工具可以大大提升开发效率和项目性能。`,
      excerpt: "对比 Webpack 和 Vite 等现代前端构建工具的特点和适用场景。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[1].id }],
      },
      tags: {
        connect: [feTag.id, nextjsTag.id].map(id => ({ id })),
      },
    },
  })

  const post4 = await prisma.post.upsert({
    where: { slug: "typescript-best-practices" },
    update: {},
    create: {
      title: "TypeScript 最佳实践",
      slug: "typescript-best-practices",
      content: `# TypeScript 最佳实践

TypeScript 为 JavaScript 添加了类型系统，让代码更加健壮和可维护。

## 类型定义

### 基础类型

\`\`\`typescript
let name: string = "John"
let age: number = 30
let isActive: boolean = true
\`\`\`

### 接口和类型别名

\`\`\`typescript
interface User {
  id: number
  name: string
  email?: string // 可选属性
}

type Status = "pending" | "approved" | "rejected"
\`\`\`

## 最佳实践

1. **严格模式**: 启用 \`strict: true\`
2. **避免使用 \`any\`**: 尽量使用具体类型
3. **利用类型推断**: 让 TypeScript 自动推断类型
4. **使用泛型**: 提高代码复用性

## 总结

TypeScript 的类型系统可以帮助我们在开发阶段发现错误，提高代码质量。`,
      excerpt: "学习 TypeScript 的类型定义、接口使用和最佳实践，提升代码质量。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[0].id }],
      },
      tags: {
        connect: [tsTag.id, reactTag.id].map(id => ({ id })),
      },
    },
  })

  // 更多 mock 文章 - 用于首页展示效果
  const lifeEssayCat = categories.find(c => c.slug === "life-essay")!
  const readingCat = categories.find(c => c.slug === "reading-notes")!
  const cssLayoutCat = categories.find(c => c.slug === "css-layout")!

  await prisma.post.upsert({
    where: { slug: "vite-vs-webpack-2024" },
    update: {},
    create: {
      title: "Vite 与 Webpack 在 2024 年的选择",
      slug: "vite-vs-webpack-2024",
      content: `# Vite 与 Webpack 在 2024 年的选择

前端构建工具的格局在近两年发生了巨大变化。Vite 的崛起让 Webpack 不再是唯一的选项，但两者各有适用场景。

## 开发体验对比

### 启动速度

Vite 基于 ES 模块，开发服务器启动几乎是即时的——无论项目有多大，启动时间都在几百毫秒内。相比之下，Webpack 需要在启动前打包整个应用，项目越大越慢。

\`\`\`bash
# Vite 启动
$ vite
  VITE v5.2.0  ready in 320ms

# Webpack 启动（同样项目）
$ webpack serve
  Compiled successfully in 12s
\`\`\`

### 热更新（HMR）

Vite 的 HMR 速度与项目规模无关，因为它只重新编译修改的模块。Webpack 在项目变大后 HMR 也会变慢，尽管有各种优化手段（如 \`thread-loader\`、缓存），但本质上还是需要重新打包。

## 构建产物对比

Vite 生产构建使用 Rollup，输出的代码通常比 Webpack 更小更高效。但 Webpack 的代码分割能力更成熟，对于大型应用的分包策略有更精细的控制。

## 什么时候选 Webpack？

- 现有大型项目已经在用，迁移成本高
- 依赖大量 Webpack 专有插件（Module Federation 等）
- 团队对 Webpack 配置非常熟悉

## 什么时候选 Vite？

- 新项目，不需要考虑历史包袱
- 追求极致的开发体验
- 项目以 React / Vue / Svelte 为主
- 希望配置简单、开箱即用

## 迁移建议

如果决定从 Webpack 迁移到 Vite，可以分步进行：

1. 先用 Vite 搭建新项目验证可行性
2. 用 \`vite-plugin-webpack\` 处理兼容性问题
3. 逐个替换 Webpack 插件为 Vite 等价方案
4. 充分测试构建产物的一致性

## 总结

2024 年，**新项目直接上 Vite**，老项目继续用 Webpack 不丢人。不必为了追新而迁移，但如果有机会重构，Vite 的开发体验确实好很多。`,
      excerpt: "新项目更推荐 Vite，老项目可继续用 Webpack。生态与性能的权衡。",
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[1].id }] },
      tags: { connect: [feTag.id, viteTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "tailwind-css-practice" },
    update: {},
    create: {
      title: "Tailwind CSS 实战：从零搭一个博客 UI",
      slug: "tailwind-css-practice",
      content: `# Tailwind CSS 实战：从零搭一个博客 UI

从手写 CSS 到 Tailwind，最大的感受是：**不用再想类名了**。这一篇记录用 Tailwind 搭建博客 UI 的全过程。

## 项目初始化

\`\`\`bash
npm init vite@latest my-blog -- --template react-ts
cd my-blog
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

配置 \`tailwind.config.js\`：

\`\`\`js
export default {
  content: ['./index.html', './src/**/*.{vue,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
\`\`\`

## 布局系统

博客的典型布局是两栏：主内容 + 侧边栏。用 Grid 很容易实现：

\`\`\`html
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <main class="lg:col-span-8">
    <!-- 文章列表 -->
  </main>
  <aside class="lg:col-span-4">
    <!-- 侧边栏 -->
  </aside>
</div>
\`\`\`

## 暗色模式

Tailwind 的 \`dark:\` 前缀让暗色模式变得非常简单：

\`\`\`html
<div class="bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
  <h1 class="text-3xl font-bold">博客标题</h1>
  <p class="text-gray-600 dark:text-gray-400 mt-2">
    这是一段博客描述...
  </p>
</div>
\`\`\`

切换暗色模式只需要在 \`<html>\` 上添加或移除 \`dark\` class。

## 响应式卡片

文章卡片是博客最常见的组件。一个典型的卡片：

\`\`\`html
<article class="rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
  <img src="cover.jpg" class="w-full h-48 object-cover" alt="封面" />
  <div class="p-4 space-y-2">
    <h2 class="font-semibold text-lg line-clamp-2">文章标题</h2>
    <p class="text-sm text-muted-foreground line-clamp-3">文章摘要...</p>
    <div class="flex items-center gap-2 text-xs text-gray-500">
      <span>2024-03-15</span>
      <span>·</span>
      <span>5 分钟阅读</span>
    </div>
  </div>
</article>
\`\`\`

## 小技巧

- \`line-clamp-2\` / \`line-clamp-3\` 可以截断多行文本
- \`backdrop-blur-sm\` 实现毛玻璃效果
- \`ring-2 ring-primary/20\` 实现聚焦高亮
- 用 \`space-y-4\` 替代重复的 \`mb-4\`

## 总结

Tailwind 的 utility-first 思想在构建 UI 时效率极高。配合 \`@apply\` 抽取公共样式，可以兼顾效率与可维护性。`,
      excerpt: "用 Tailwind 做间距、颜色、暗色模式与组件的实践记录。",
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: cssLayoutCat.id }] },
      tags: { connect: [cssTag.id, tailwindTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "nextjs-app-router-tips" },
    update: {},
    create: {
      title: "Next.js App Router 使用小记",
      slug: "nextjs-app-router-tips",
      content: `# Next.js App Router 使用小记

从 Pages Router 迁移到 App Router 后，踩了不少坑，也发现了一些好用的模式。这篇记录下实际项目中的使用心得。

## 服务端组件 vs 客户端组件

App Router 最大的变化是**默认所有组件都是服务端组件**。只有需要交互的组件才加 \`"use client"\`。

### 什么时候用服务端组件？

- 直接访问数据库
- 调用后端 API（不需要暴露到客户端）
- SEO 关键内容（标题、正文）
- 大型依赖库（不会打包到客户端）

### 什么时候用客户端组件？

- 使用 \`useState\`、\`useEffect\` 等 Hooks
- 事件监听（onClick、onChange）
- 使用浏览器 API（localStorage、window）
- 使用 Context

## 数据请求模式

App Router 推荐在组件中直接 \`async/await\`：

\`\`\`tsx
// app/blog/page.tsx — 服务端组件
export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
\`\`\`

不再需要 \`getServerSideProps\` 或 \`getStaticProps\`，数据获取变得自然多了。

## Loading 和 Error 边界

App Router 的 \`loading.tsx\` 和 \`error.tsx\` 配合 Suspense 非常好用：

\`\`\`
app/
  blog/
    page.tsx        # 页面组件
    loading.tsx     # 自动显示加载状态
    error.tsx       # 错误边界
    [slug]/
      page.tsx
      not-found.tsx # 404 页面
\`\`\`

\`loading.tsx\` 会自动包裹在 Suspense 中，数据加载时会显示：

\`\`\`tsx
export default function BlogLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}
\`\`\`

## 路由分组

用括号 \`()\` 创建路由分组，不影响 URL：

\`\`\`
app/
  (marketing)/
    about/page.tsx    → /about
    contact/page.tsx  → /contact
  (blog)/
    blog/page.tsx     → /blog
  (auth)/
    login/page.tsx    → /login
\`\`\`

每组可以有自己的 \`layout.tsx\`，非常灵活。

## 流式渲染

App Router 天然支持流式渲染，配合 Suspense 可以逐步发送内容：

\`\`\`tsx
export default async function Page() {
  return (
    <div>
      <Header />           {/* 立即渲染 */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />   {/* 流式渲染 */}
      </Suspense>
    </div>
  )
}
\`\`\`

## 踩坑记录

1. \`"use client"\` 必须在文件第一行，否则不生效
2. 客户端组件不能直接 \`async\`，需要用 \`useEffect\` 或第三方库
3. \`useRouter\` 在 App Router 中从 \`next/navigation\` 导入（不是 \`next/router\`）
4. \`searchParams\` 在 Page props 中是 \`Promise\` 类型了，需要 \`await\`

## 总结

App Router 的学习曲线比 Pages Router 陡，但理解了服务端/客户端组件的边界后，开发体验确实好了很多。数据获取更自然，代码组织更清晰。`,
      excerpt: "App Router 下的数据请求、loading 与 error 边界使用心得。",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [nextjsTag.id, reactTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "weekend-reading-list" },
    update: {},
    create: {
      title: "本周在读：几本技术书与一本小说",
      slug: "weekend-reading-list",
      content: `# 本周在读：几本技术书与一本小说

周末整理了一下最近在读的书，技术类和休闲类混着读，保持输入节奏。

## 《重构：改善既有代码的设计》（第 2 版）

Martin Fowler 的经典之作，第 2 版把示例语言从 Java 换成了 JavaScript。

### 印象深刻的几个观点

> "任何傻瓜都能写出计算机能理解的代码。优秀的程序员写出人类能理解的代码。"

重构的核心原则：

1. **小步前进**：每次只做一个小改动，跑完测试再继续
2. **先测试再重构**：没有测试的重构是耍流氓
3. **代码的坏味道**： duplicated code、过长函数、过大类、过长参数列表

### 实际应用

最近在重构博客后台时用了几个手法：

- **提取函数**：一个 200 行的页面组件拆成 5 个子组件
- **以查询取代临时变量**：把复杂的计算逻辑移到单独的工具函数
- **搬移函数**：把不应该在组件里的数据库查询移到 service 层

## 《代码整洁之道》

Robert C. Martin（Uncle Bob）的另一本经典。

关键实践：

- 有意义的命名：变量名应该解释"为什么"而不是"是什么"
- 函数应该短小：一个函数只做一件事
- 注释不能弥补糟糕的代码
- 格式化：团队统一代码风格比具体风格更重要

## 《嫌疑人 X 的献身》

东野圭吾的推理小说，闲暇时看的。数学天才石神为了暗恋的邻居，设计了一个"完美的诡计"。

最触动我的不是诡计本身，而是石神那种**极致的逻辑思维**——程序员多少能从这个角色身上看到一点自己的影子：用逻辑去构建一个世界。

## 《设计数据密集型应用》（DDIA）

这本书被誉为后端工程师的圣经，虽然我主要做前端，但理解数据流对全栈视角很有帮助。

目前读到第二部分"分布式数据"，重点笔记：

- **复制**：单主复制 vs 多主复制 vs 无主复制
- **分区**：按 key range 分区 vs 按 hash 分区
- **一致性**：强一致性 vs 最终一致性的取舍

## 阅读方法

我的习惯是**同时读 2-3 本**，技术书白天读（需要思考），小说晚上读（放松），交替进行不容易疲劳。每读完一章会用 Notion 记要点，方便日后回顾。

## 总结

保持阅读习惯是长期投资。技术书提升专业能力，非技术书拓宽视野。两者结合，比单纯刷技术文章更有收获。`,
      excerpt: "《重构》《代码整洁之道》与一本推理小说的阅读进度。",
      coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: readingCat.id }] },
      tags: { connect: [readingTag.id, essayTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "vue3-composition-api-basics" },
    update: {},
    create: {
      title: "Vue 3 Composition API 入门",
      slug: "vue3-composition-api-basics",
      content: `# Vue 3 Composition API 入门

Vue 3 最大的变化就是 Composition API。这篇笔记记录从 Options API 过渡到 Composition API 的关键概念。

## 为什么需要 Composition API？

Options API 的问题是**逻辑分散**。一个功能的代码被拆到 \`data\`、\`methods\`、\`computed\`、\`watch\` 等多个选项中，组件变大后很难维护。

Composition API 允许按**功能**组织代码，而不是按选项类型。

## ref 与 reactive

### ref — 单值响应式

\`\`\`typescript
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello')

// 读取/修改时需要 .value
console.log(count.value) // 0
count.value++
\`\`\`

在模板中使用时自动解包，不需要 \`.value\`：

\`\`\`html
<template>
  <p>{{ count }}</p>
  <button @click="count++">+1</button>
</template>
\`\`\`

### reactive — 对象响应式

\`\`\`typescript
import { reactive } from 'vue'

const state = reactive({
  name: '张三',
  age: 25,
  hobbies: ['编程', '阅读'],
})

// 直接访问属性，不需要 .value
state.name = '李四'
state.hobbies.push('游戏')
\`\`\`

**选择建议**：基础类型用 \`ref\`，对象/数组用 \`reactive\`。

## computed — 计算属性

\`\`\`typescript
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

const fullName = computed(() => firstName.value + lastName.value)

// 只读，修改会警告
fullName.value = '李四' // ❌ Warn
\`\`\`

可写的 computed：

\`\`\`typescript
const fullName = computed({
  get: () => firstName.value + lastName.value,
  set: (val) => {
    firstName.value = val[0]
    lastName.value = val.slice(1)
  },
})
\`\`\`

## watch 与 watchEffect

\`\`\`typescript
import { ref, watch, watchEffect } from 'vue'

const keyword = ref('')

// 精确监听
watch(keyword, (newVal, oldVal) => {
  console.log('搜索词变化:', oldVal, '→', newVal)
  fetchResults(newVal)
})

// 自动追踪依赖
watchEffect(() => {
  // 自动知道依赖了 keyword
  console.log('执行搜索:', keyword.value)
})
\`\`\`

\`watch\` vs \`watchEffect\`：

- \`watch\`：显式指定监听源，可访问旧值
- \`watchEffect\`：自动追踪依赖，立即执行一次

## 生命周期

Composition API 中生命周期钩子加 \`on\` 前缀：

\`\`\`typescript
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('组件挂载了')
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
\`\`\`

对照表：

| Options API | Composition API |
|---|---|
| \`created\` | \`setup()\` 本身 |
| \`mounted\` | \`onMounted\` |
| \`updated\` | \`onUpdated\` |
| \`unmounted\` | \`onUnmounted\` |

## 自定义组合函数（Composables）

这是 Composition API 最强大的地方——提取可复用逻辑：

\`\`\`typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
\`\`\`

在组件中使用：

\`\`\`vue
<script setup lang="ts">
import { useMouse } from '@/composables/useMouse'
const { x, y } = useMouse()
</script>

<template>
  <p>鼠标位置: {{ x }}, {{ y }}</p>
</template>
\`\`\`

## 总结

Composition API 的核心思想是**按功能组织代码**，通过自定义 Composables 实现逻辑复用。从 Options API 迁移不需要一步到位，可以用 \`<script setup>\` 渐进式过渡。`,
      excerpt: "从 Options API 过渡到 Composition API 的笔记与示例。",
      coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [vueTag.id, tsTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "css-grid-flexbox-layout" },
    update: {},
    create: {
      title: "用 Grid 和 Flexbox 做常见布局",
      slug: "css-grid-flexbox-layout",
      content: `# 用 Grid 和 Flexbox 做常见布局

Grid 和 Flexbox 是现代 CSS 布局的两大支柱。很多人分不清什么时候用哪个，这篇做一个系统整理。

## 核心区别

> **Flexbox 是一维布局，Grid 是二维布局。**

- Flexbox：处理行**或**列方向上的元素排列
- Grid：同时控制行**和**列，适合整体页面骨架

简单判断：**排列元素用 Flex，划分区域用 Grid。**

## 常见布局实现

### 1. 居中对齐（Flexbox）

\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

这是 Flexbox 最经典的用法，三行代码搞定水平+垂直居中。

### 2. 导航栏（Flexbox）

\`\`\`html
<nav class="flex items-center justify-between px-6 py-4">
  <div class="font-bold">Logo</div>
  <div class="flex gap-6">
    <a href="#">首页</a>
    <a href="#">关于</a>
    <a href="#">联系</a>
  </div>
</nav>
\`\`\`

### 3. 卡片网格（Grid）

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
\`\`\`

\`repeat(auto-fill, minmax(300px, 1fr))\` 是 Grid 最强大的用法之一：
- 每列最小 300px
- 自动填充可用空间
- 窗口变小时自动折行

### 4. 圣杯布局（Grid）

经典的 header + sidebar + main + footer 布局：

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
\`\`\`

### 5. 粘性底部（Flexbox）

内容不够时 footer 依然在底部：

\`\`\`css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
\`\`\`

### 6. 等高列（Grid 或 Flexbox）

Grid 天然等高：

\`\`\`css
.equal-height {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: stretch; /* 默认值 */
}
\`\`\`

Flexbox 也能做到：

\`\`\`css
.equal-height {
  display: flex;
  gap: 1rem;
}

.equal-height > * {
  flex: 1;
}
\`\`\`

## 响应式套路

### 移动端优先

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr; /* 手机：单列 */
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr); /* 平板：两列 */
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr); /* 桌面：三列 */
  }
}
\`\`\`

或者用 \`auto-fill\` + \`minmax\` 一步到位：

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
\`\`\`

## 总结

| 场景 | 推荐方案 |
|---|---|
| 居中、导航栏、工具栏 | Flexbox |
| 卡片网格、页面骨架 | Grid |
| 等高列 | 都可以 |
| 响应式网格 | Grid + auto-fill |

不要纠结"只能用一种"，实际项目中两者混用才是常态。`,
      excerpt: "什么时候用 Grid、什么时候用 Flex，以及简单的响应式套路。",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: cssLayoutCat.id }] },
      tags: { connect: [cssTag.id, feTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "daily-log-march" },
    update: {},
    create: {
      title: "三月碎笔：开工与作息",
      slug: "daily-log-march",
      content: `# 三月碎笔：开工与作息

三月了，春节后终于回到正常节奏。这一周主要在调整作息和恢复工作状态。

## 作息调整

假期养成的坏习惯——凌晨两点睡、中午起——得改。

试了几种方法：

- **10 点半手机强制锁屏**（用屏幕使用时间限制）
- **早起跑步**：6:30 起来跑 3 公里，出一身汗后人就精神了
- **午后不喝咖啡**：之前下午 3 点还来一杯美式，晚上当然睡不着

目前稳定在 11:30 睡、7:00 起，感觉好了很多。

## 开工第一周

项目上主要做了这些事：

1. **博客平台重构**：把列表页从 CSR 改成 SSR，文章详情页也加了 SEO。改动不小，但为了搜索引擎收录必须做。
2. **代码 Review**：积攒了一堆 PR 没看，花了一天半处理完。发现几个有意思的问题——有人在一个 \`useEffect\` 里做了三件不相关的事，拆开后逻辑清晰多了。
3. **学习计划**：今年想系统学一下 Rust，买了一本《Rust 程序设计语言》。前端工具链越来越多用 Rust 写的（SWC、Turbopack、Biome），了解一下底层原理没坏处。

## 日常

> "生活不是等待暴风雨过去，而是学会在雨中跳舞。"

周末去了趟咖啡馆，带了一本推理小说，坐了一下午。这种不带电脑、不刷手机的纯粹阅读时间，感觉很奢侈但也很有必要。

给阳台的绿萝换了盆，希望这次不要再养死了。

## 本周产出

- 博客文章 3 篇（技术 2 + 随笔 1）
- PR Review 12 个
- Rust 学习到第四章"所有权"
- 跑步 3 次，总计 12 公里

下周目标：继续调整作息，把 Rust 第五章看完，博客加个 RSS 功能。`,
      excerpt: "早睡早起、减少熬夜的一周记录。",
      coverImage: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: lifeEssayCat.id }] },
      tags: { connect: [{ id: essayTag.id }] },
    },
  })

  await prisma.post.upsert({
    where: { slug: "https-tls-basics" },
    update: {},
    create: {
      title: "HTTPS 与 TLS 简要说明",
      slug: "https-tls-basics",
      content: `# HTTPS 与 TLS 简要说明

每个前端开发者都应该理解 HTTPS 的基本原理。这篇用通俗的方式解释对称加密、非对称加密和证书链。

## 为什么需要 HTTPS？

HTTP 是明文传输，存在三个风险：

1. **窃听**：中间人可以读取传输内容（密码、Token）
2. **篡改**：中间人可以修改响应内容（注入广告、恶意脚本）
3. **冒充**：中间人可以伪装成服务器（钓鱼网站）

HTTPS = HTTP + TLS，在传输层对数据进行加密，解决以上三个问题。

## 对称加密 vs 非对称加密

### 对称加密

加密和解密用**同一把钥匙**。就像用同一个钥匙锁门和开门。

- 优点：速度快
- 缺点：密钥怎么安全地告诉对方？

常见算法：AES、ChaCha20

### 非对称加密

有一对钥匙：**公钥**和**私钥**。公钥加密的数据只能用私钥解密，反之亦然。

- 公钥：公开给所有人
- 私钥：只有自己知道

就像一个信箱：任何人都可以把信塞进去（公钥加密），但只有持有钥匙的人能打开信箱（私钥解密）。

常见算法：RSA、ECC

## TLS 握手过程

TLS 把两种加密方式结合起来：用非对称加密安全地交换密钥，再用对称加密传输数据。

简化版握手流程：

1. **Client Hello**：客户端说"我想建立安全连接，这些是我支持的加密套件"
2. **Server Hello**：服务器说"好的，我们用这个加密套件，这是我的证书（包含公钥）"
3. **验证证书**：客户端检查证书是否可信（由可信 CA 签发、未过期、域名匹配）
4. **密钥交换**：客户端生成一个随机的"会话密钥"，用服务器的公钥加密后发给服务器
5. **服务器解密**：服务器用私钥解密，拿到会话密钥
6. **开始通信**：双方用会话密钥进行对称加密通信

## 证书链

证书不是凭空产生的，它是由 **CA（Certificate Authority）** 签发的。

信任链是这样的：

\`根 CA\` → \`中间 CA\` → \`你的服务器证书\`

- 浏览器内置了根 CA 的公钥
- 根 CA 签发中间 CA 的证书
- 中间 CA 签发你的服务器证书
- 浏览器从你的证书逐级验证到根 CA，形成信任链

如果链条中任何一环验证失败，浏览器就会显示"不安全"警告。

## 在前端开发中的注意点

1. **混合内容**：HTTPS 页面加载 HTTP 资源会被浏览器阻止
2. **本地开发**：用 \`mkcert\` 生成本地可信证书，避免浏览器警告
3. **HSTS**：HTTP Strict Transport Security，告诉浏览器以后都用 HTTPS
4. **CSP**：Content Security Policy，限制页面能加载哪些资源

## 总结

HTTPS 不是"可选的加分项"，而是现代 Web 的基础设施。理解 TLS 的工作原理有助于排查证书相关的问题，也能在前端面试中回答"HTTP 和 HTTPS 的区别"。`,
      excerpt: "为什么需要 HTTPS，以及 TLS 握手在做什么。",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[2].id }] },
      tags: { connect: [{ id: networkTag.id }] },
    },
  })

  await prisma.post.upsert({
    where: { slug: "react-performance-optimization" },
    update: {},
    create: {
      title: "React 性能优化实战手册",
      slug: "react-performance-optimization",
      content: `# React 性能优化实战手册

React 应用变慢是渐进式的——刚写的时候很快，功能越加越慢。这篇整理常用的优化手段和排查方法。

## 先测量，再优化

不要凭感觉优化。用 React DevTools Profiler 录制一次交互，看哪些组件在频繁重渲染。

### 性能排查清单

1. 打开 Chrome DevTools → Performance 标签
2. 录制一次页面操作
3. 查看火焰图中的长任务（红色三角标记）
4. 用 React DevTools Profiler 查看组件渲染次数

## React.memo — 阻止不必要的重渲染

当父组件更新时，所有子组件默认都会重新渲染，即使 props 没变。

\`\`\`tsx
// 没有 memo：每次父组件更新都会重渲染
function UserCard({ name, avatar }: UserCardProps) {
  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
      <span>{name}</span>
    </div>
  )
}

// 用 memo 包裹：props 不变时不重渲染
const UserCard = React.memo(function UserCard({ name, avatar }: UserCardProps) {
  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
      <span>{name}</span>
    </div>
  )
})
\`\`\`

**注意**：不要滥用 memo。如果组件本身很轻（几个 DOM 节点），memo 的比较成本可能比重渲染还高。

## useMemo 和 useCallback

\`\`\`tsx
function SearchResults({ query, data }) {
  // ❌ 每次渲染都重新计算
  const filtered = data.filter(item =>
    item.name.includes(query)
  )

  // ✅ 只在 query 或 data 变化时重新计算
  const filtered = useMemo(
    () => data.filter(item => item.name.includes(query)),
    [query, data]
  )

  return (
    <ul>
      {filtered.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

\`useCallback\` 同理，用于稳定函数引用：

\`\`\`tsx
// ✅ handleClick 引用稳定，不会导致子组件重渲染
const handleClick = useCallback((id: string) => {
  setSelected(id)
}, [])
\`\`\`

## 虚拟列表

渲染 10000 条数据时，不要全部渲染。用 \`react-window\` 或 \`@tanstack/react-virtual\`：

\`\`\`tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function BigList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              width: '100%',
              height: virtualItem.size,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
\`\`\`

## 图片优化

\`\`\`tsx
import Image from 'next/image'

// ✅ 使用 Next.js Image 组件
<Image
  src={post.coverImage}
  alt={post.title}
  width={800}
  height={400}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
\`\`\`

关键参数：
- \`loading="lazy"\`：视口外图片延迟加载
- \`sizes\`：告诉浏览器实际显示尺寸，避免下载过大的图
- \`priority\`：首屏图片加这个，提前加载

## 代码分割

用 \`React.lazy\` + \`Suspense\` 按需加载：

\`\`\`tsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))
const AdminPanel = lazy(() => import('./AdminPanel'))

function App() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
\`\`\`

## 状态管理优化

把状态放到"最近的共同父组件"：

\`\`\`tsx
// ❌ 状态在顶层，所有组件都会重渲染
function App() {
  const [search, setSearch] = useState('')
  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      <Sidebar />          {/* 不需要 search，但也会重渲染 */}
      <MainContent />       {/* 不需要 search，但也会重渲染 */}
    </div>
  )
}

// ✅ 状态下放到使用它的组件
function App() {
  return (
    <div>
      <SearchSection />     {/* search 状态在这里 */}
      <Sidebar />
      <MainContent />
    </div>
  )
}
\`\`\`

## 总结

性能优化的优先级：

1. **用 Profiler 找瓶颈** — 不要猜
2. **React.memo** — 防止不必要的重渲染
3. **虚拟列表** — 大量数据必备
4. **图片优化** — lazy loading + 正确尺寸
5. **代码分割** — 减少首屏 JS 体积
6. **useMemo/useCallback** — 热路径上使用

记住：**过早优化是万恶之源**，先写正确的代码，遇到性能问题再优化。`,
      excerpt: "从 Profiler 定位瓶颈到 memo、虚拟列表、代码分割的实战优化路径。",
      coverImage: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[0].id }] },
      tags: { connect: [reactTag.id, tsTag.id, feTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "git-workflow-team-guide" },
    update: {},
    create: {
      title: "Git 团队协作流程指南",
      slug: "git-workflow-team-guide",
      content: `# Git 团队协作流程指南

Git 是前端团队的日常工具，但很多人只会 \`add\` → \`commit\` → \`push\`。这篇整理团队协作中的 Git 最佳实践。

## 分支策略

### Git Flow（适合版本发布型项目）

\`\`\`
main        ──●────────────────●────────── 生产分支
             \\                /
develop     ──●──●──●──●──●──●──────── 开发分支
                \\     /
feature     ────●──●──●────────────── 功能分支
\`\`\`

### GitHub Flow（适合持续部署的项目）

\`\`\`
main        ──●────●────●────●────●── 永远可部署
                \\        /
feature     ────●──●──●──────────── PR 合入
\`\`\`

**大多数前端项目用 GitHub Flow 就够了。**

## Commit 规范

使用 Conventional Commits：

\`\`\`
feat: 添加文章搜索功能
fix: 修复移动端导航栏溢出
docs: 更新 README 部署说明
style: 统一缩进为 2 空格
refactor: 提取 PostCard 为独立组件
perf: 虚拟列表优化长列表渲染
test: 添加搜索功能单元测试
chore: 升级 Next.js 到 14.1
\`\`\`

好处：
- 自动生成 CHANGELOG
- git log 一目了然
- 配合 semantic-release 自动管理版本号

## 日常工作流

### 开始新功能

\`\`\`bash
# 从最新的 main 拉分支
git checkout main
git pull origin main
git checkout -b feature/blog-search

# 开发过程中定期同步 main
git fetch origin
git rebase origin/main

# 推送到远程
git push origin feature/blog-search
\`\`\`

### 提交代码

\`\`\`bash
# 查看改动
git status
git diff

# 暂存相关文件（不要 git add .）
git add src/components/SearchBar.tsx
git add src/hooks/useSearch.ts

# 写有意义的提交信息
git commit -m "feat: 添加文章搜索 API 和搜索组件"
\`\`\`

### 处理冲突

\`\`\`bash
# rebase 过程中遇到冲突
git rebase origin/main

# 解决冲突后
git add <resolved-files>
git rebase --continue

# 如果搞砸了，可以重来
git rebase --abort
\`\`\`

## 常见问题

### 撤销最后一次 commit（还没 push）

\`\`\`bash
git reset --soft HEAD~1   # 保留改动在暂存区
git reset --mixed HEAD~1  # 保留改动在工作区（默认）
git reset --hard HEAD~1   # 丢弃所有改动 ⚠️
\`\`\`

### 修改最后一次 commit

\`\`\`bash
git add <forgot-files>
git commit --amend --no-edit
\`\`\`

### 暂存当前工作

\`\`\`bash
git stash               # 暂存
git stash pop            # 恢复
git stash list           # 查看暂存列表
\`\`\`

### 查看某个文件的修改历史

\`\`\`bash
git log --oneline -- src/components/Header.tsx
git log -p -- src/components/Header.tsx  # 显示每次修改的 diff
\`\`\`

## PR / Code Review 规范

### 写好 PR 描述

\`\`\`markdown
## 改动内容
- 添加全站搜索 API（/api/search）
- 搜索框组件支持 debounce
- 搜索结果高亮匹配关键词

## 测试
- [x] 搜索中文关键词
- [x] 搜索英文关键词
- [x] 搜索标签名
- [x] 空结果页面展示
- [x] 移动端适配

## 截图
（附上改动前后的截图）
\`\`\`

### Review 检查项

- 功能是否正确
- 代码风格是否统一
- 是否有安全风险（XSS、注入）
- 是否有性能问题（N+1 查询、不必要的状态）
- 是否需要更新文档

## 总结

好的 Git 习惯能让团队协作更顺畅。核心原则：

1. **小步提交**：每个 commit 只做一件事
2. **频繁同步**：每天至少 rebase 一次 main
3. **写好信息**：commit message 和 PR 描述是给未来自己看的
4. **Code Review**：每个人的代码至少一个人看过`,
      excerpt: "分支策略、Commit 规范、日常工作流和 Code Review 最佳实践。",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[1].id }] },
      tags: { connect: [feTag.id].map(id => ({ id })) },
    },
  })

  await prisma.post.upsert({
    where: { slug: "docker-for-frontend-developers" },
    update: {},
    create: {
      title: "前端工程师的 Docker 入门课",
      slug: "docker-for-frontend-developers",
      content: `# 前端工程师的 Docker 入门课

Docker 不只是后端工程师的工具。部署博客、搭本地数据库、CI/CD 环境一致——前端也能受益很多。

## Docker 是什么？

Docker 是一个**容器化**工具。把应用和它的所有依赖打包到一个"容器"里，确保在任何环境都能一致运行。

和虚拟机的区别：容器共享宿主系统内核，更轻量、启动更快。

## 核心概念

- **Image（镜像）**：只读模板，包含运行应用所需的一切（代码、依赖、配置）
- **Container（容器）**：镜像的运行实例
- **Dockerfile**：描述如何构建镜像的脚本
- **docker-compose**：定义和运行多容器应用

## Dockerfile 实战

一个 Next.js 项目的 Dockerfile：

\`\`\`dockerfile
# 阶段 1：安装依赖
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 阶段 2：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 阶段 3：生产镜像
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

### 多阶段构建

上面的例子用了三个阶段（deps → builder → runner），最终镜像只包含运行所需的文件，体积从 1GB+ 缩减到 ~100MB。

## docker-compose 搭建本地数据库

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: blog123
      POSTGRES_DB: blog_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
\`\`\`

启动：

\`\`\`bash
docker compose up -d      # 后台启动
docker compose down        # 停止并删除容器
docker compose logs -f     # 查看日志
\`\`\`

这样不需要在本机安装 PostgreSQL 和 Redis，一个命令就有完整开发环境。

## 常用命令速查

\`\`\`bash
# 镜像
docker build -t my-blog .              # 构建镜像
docker images                           # 查看所有镜像
docker rmi <image-id>                   # 删除镜像

# 容器
docker run -p 3000:3000 my-blog         # 运行容器
docker ps                               # 查看运行中的容器
docker ps -a                            # 查看所有容器
docker stop <container-id>              # 停止容器
docker rm <container-id>                # 删除容器

# 调试
docker logs <container-id>              # 查看日志
docker exec -it <container-id> sh       # 进入容器 shell
docker inspect <container-id>           # 查看容器详情
\`\`\`

## .dockerignore

像 .gitignore 一样，告诉 Docker 哪些文件不需要复制进镜像：

\`\`\`
node_modules
.next
.git
*.md
.env*
\`\`\`

## CI/CD 中的 Docker

GitHub Actions 构建并推送镜像：

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:latest
\`\`\`

## 总结

前端开发者掌握 Docker 的核心收益：

1. **环境一致**：不再有"我本地能跑"的问题
2. **快速搭建依赖**：数据库、缓存等服务一键启动
3. **部署简化**：构建镜像后到处都能跑
4. **CI/CD 集成**：自动化构建和部署

不需要成为 Docker 专家，理解基本概念和常用命令就够了。`,
      excerpt: "Dockerfile 多阶段构建、docker-compose 本地数据库、常用命令速查。",
      coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
      published: true,
      authorId: admin.id,
      categories: { connect: [{ id: categories[1].id }] },
      tags: { connect: [feTag.id, viteTag.id].map(id => ({ id })) },
    },
  })

  console.log("✅ 文章创建成功: 15 篇")

  // 5. 创建一些测试用户和评论
  console.log("💬 创建测试用户和评论...")
  
  const testUserPassword = await hashPassword("test123")
  const testUser = await prisma.user.upsert({
    where: { name: "测试用户" },
    update: {},
    create: {
      name: "测试用户",
      password: testUserPassword,
      role: "user",
    },
  })

  // 为第一篇文章创建评论
  await prisma.comment.create({
    data: {
      content: "这篇文章写得很好，让我对 React Hooks 有了更深入的理解！",
      postId: post1.id,
      authorId: testUser.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: "感谢分享，useEffect 的依赖数组确实容易出错，需要仔细理解。",
      postId: post1.id,
      authorId: admin.id,
    },
  })

  console.log("✅ 评论创建成功")

  console.log("\n🎉 测试数据创建完成！")
  console.log("\n📊 数据统计:")
  console.log(`   - 用户: 2 个 (1 个管理员, 1 个普通用户)`)
  console.log(`   - 分类: ${categories.length} 个`)
  console.log(`   - 标签: ${tags.length} 个`)
  console.log(`   - 文章: 15 篇`)
  console.log(`   - 评论: 2 条`)
  console.log("\n🔑 测试账号:")
  console.log(`   管理员: 博主 / admin123`)
  console.log(`   普通用户: 测试用户 / test123`)
}

main()
  .catch((e) => {
    console.error("❌ 创建测试数据失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
