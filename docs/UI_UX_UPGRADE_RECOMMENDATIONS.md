# 博客客户端样式改造建议（基于 UI/UX Pro Max Skill）

基于已安装的 UI/UX Pro Max 规则与 Pre-Delivery Checklist，对当前 blog 端样式做的诊断与升级建议。

---

## 一、已做得好的地方

- **图标**：全局使用 Lucide（User、Calendar、Hash、Folder、FileText、Tag 等），无 emoji 作图标 ✓  
- **主题与动效**：已支持 `prefers-reduced-motion`，主题背景在 reduce-motion 下减弱 ✓  
- **响应式**：有 768px / 640px 断点，容器用 `container mx-auto`，布局统一 ✓  
- **Prose**：文章内容用主题色、标题/链接/代码块样式统一 ✓  

---

## 二、按 Skill 规则建议的改动

### 1. 交互与光标（Interaction & Cursor）

| 规则 | 现状 | 建议 |
|------|------|------|
| **cursor-pointer** | 仅部分组件显式写了 `cursor-pointer`，导航链接、卡片、标签/分类链接依赖浏览器默认 | 为所有可点击区域显式加上 `cursor-pointer`（导航链接、PostCard 容器、TagList/CategoryList 的 Link、筛选栏的「清除筛选」） |
| **Hover 反馈** | 有 hover 颜色/背景 | 保持；可对卡片增加轻微 `hover:shadow-md` 或 `hover:border-primary/20` 强化反馈 |
| **过渡时长** | 多为 `duration-300`，部分 `transition-all` | 仅改颜色时用 `transition-colors duration-200`，避免 `transition-all` 造成不必要的 layout 重绘 |

### 2. 悬停与布局稳定（Stable Hover States）

| 规则 | 现状 | 建议 |
|------|------|------|
| **不用 scale 造成布局偏移** | `PostCard` 内封面图使用 `group-hover:scale-105` | 图片在 `overflow-hidden` 内，虽不直接推挤布局，但 Skill 建议用颜色/透明度替代。可改为：`hover:brightness-105` 或 `hover:opacity-95` + 卡片整体 `hover:shadow-lg`，去掉图片 scale |

### 3. 亮色模式与玻璃态（Light/Dark Contrast）

| 规则 | 现状 | 建议 |
|------|------|------|
| **玻璃卡片亮色模式** | 卡片为 `bg-card/50 backdrop-blur-sm`，亮色下偏透 | 亮色下提高不透明度：用 `bg-card/80` 或条件化「亮色用 80、暗色用 50」，保证亮色下玻璃卡片仍清晰可读 |
| **正文对比度** | `--foreground: 222.2 84% 4.9%` 已较深 | 保持；正文避免使用过浅的 muted（见下） |
| **Muted 文本亮色** | `--muted-foreground: 215.4 16.3% 46.9%`（约 slate-500） | Skill 建议至少 slate-600 级别。可将 light 的 `--muted-foreground` 调深一档（例如 43% 或 40%），或直接用 `hsl(215 20% 42%)` 提升可读性 |
| **边框可见** | 使用 `border-border` | 亮色下确保边框可见（例如 light 下 `--border` 不要过浅） |

### 4. 布局与导航（Layout & Spacing）

| 规则 | 现状 | 建议 |
|------|------|------|
| **导航栏** | Header 顶边贴齐 `top-0`，全宽 | 若希望「浮动」效果：给 header 加 `top-4 left-4 right-4 rounded-xl` 并 `position: fixed`，main 加 `pt-24` 或等价 padding 避免被遮挡；若保持当前全宽导航，可不变 |
| **内容不被固定栏遮挡** | 当前为 flex 布局，main 在 header 下，无遮挡 | 若改为 fixed 导航，务必给 main 预留 `padding-top` ✓ 已注意 |

### 5. 无障碍与焦点（Accessibility）

| 规则 | 现状 | 建议 |
|------|------|------|
| **Focus 可见** | 未看到统一的 `focus-visible:ring-2` 等 | 为导航链接、按钮、Tag/Category 的 Link、PostCard 的 Link 增加 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| **图片 alt** | PostCard 的 Image 有 `alt={post.title}` | 保持 ✓ |
| **表单** | 登录/注册等表单需保证 label 与 input 关联 | 若存在表单，检查 `id`/`htmlFor` 与可见 label |

---

## 三、实施优先级建议

1. **高（立刻可做）**  
   - 所有可点击元素加 `cursor-pointer`。  
   - PostCard：去掉图片 `scale-105`，改为亮度/阴影等不引起布局变化的 hover。  
   - 玻璃卡片：亮色下使用 `bg-card/80`（或 80/50 按主题切换）。  

2. **中（短期）**  
   - 统一 focus 样式（ring + offset）。  
   - 将仅颜色变化的过渡改为 `transition-colors duration-200`。  
   - 亮色下 `--muted-foreground` 调深一档。  

3. **低（可选）**  
   - 导航栏改为浮动样式（top/left/right + rounded + main padding）。  
   - 为关键 CTA（如「登录」「清除筛选」）做更明显的 hover/focus 状态。  

---

## 四、与 Pre-Delivery Checklist 的对应

- **Visual**：无 emoji 图标 ✓；图标统一 Lucide ✓；hover 建议去掉 scale、加强阴影/亮度 ✓。  
- **Interaction**：补充 cursor-pointer ✓；统一 150–300ms 过渡 ✓；补充 focus-visible ✓。  
- **Light/Dark**：玻璃卡片亮色不透明度 ✓；muted 对比度 ✓；边框可见 ✓。  
- **Layout**：若用固定导航则加 padding ✓；响应式已具备 ✓。  
- **Accessibility**：alt、label、非仅靠颜色、reduce-motion 已考虑 ✓；补 focus 样式即可。  

按上述顺序改完后，再跑一遍 Skill 里的 Pre-Delivery Checklist 即可持续保持水准。
