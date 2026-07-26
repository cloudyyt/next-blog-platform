# Phase 2 · Python 速通（前端工程师版）

> Python 是 LLM 生态的主战语言——这是工程事实，不是偏见。
> 但 TS 工程师转型 Agent 有独特优势：类型系统直觉、用户视角、前端工程化经验。
> 这一章帮你把 TS 能力快速迁移到 Python，**不学 Python 语法细节，只学差异点**。

---

## 本章你将解决什么

读完这一章，你应该能：

- 读懂 90% 的 Agent 开源项目（LangChain.py、LlamaIndex、Dify 源码）
- 把任意一段 TypeScript 代码"翻译"成等价 Python
- 在工程协作中和 Python 工程师顺畅沟通
- **同时**理解为什么 TS 工程师做 Agent 有独特优势（不局限于某个市场）

> 前置知识：会写 TypeScript（这是迁移起点），不需要任何 Python 基础。

---

## 为什么 TS 工程师做 Agent 有独特优势

LLM 工程生态以 Python 为主，但纯 Python 工程师普遍缺这几样能力：

- **用户视角**：纯 Python 工程师做出来的产品 UI 通常很糟糕
- **前端工程化**：构建、测试、CI/CD 的最佳实践
- **全栈交付能力**：能独立做出"能用的产品"，不只是"能跑的脚本"
- **类型系统直觉**：Python type hint 普及率低，TS 工程师写的 Python 通常更规范

**正确定位**：以 Python 为主战语言跟上 LLM 生态，保留 TS 作为全栈交付能力。这两种能力的组合在工程实践里非常稀缺——不局限于某个市场。

---

## Why 1：为什么 LLM 生态以 Python 为主（不是技术原因，是生态原因）

很多前端困惑：**JavaScript 也能调 LLM API，为什么非要 Python？**

答案不是"Python 比 JS 好"，而是**生态锁定**：

1. **算法工程师只写 Python**：团队里 80% 是算法/数据科学背景，他们的微调脚本、训练 notebook、数据处理全部 Python。要和他们协作，必须能读懂他们的代码。
2. **微调生态锁死 Python**：PyTorch、HuggingFace Transformers、PEFT、TRL——这些微调必备库**没有 JS 版**。你想做 Fine-tuning？必须 Python。
3. **开源 Agent 框架 Python 版更新更快**：LangChain、LlamaIndex、AutoGen、CrewAI 都是 Python 优先，JS 版滞后 1-3 个月。
4. **数据科学生态在 Python**：numpy、pandas、scikit-learn、matplotlib——LLM 工程经常要处理数据，这些库在 Python 里是一等公民。

### 但 TS 工程师有独特优势

参考上面"为什么 TS 工程师做 Agent 有独特优势"。**两种语言都熟悉，是 LLM 工程师的稀缺画像**——不局限于某个市场。

---

## Why 2：为什么这一章不学 Python 语法细节

很多"前端学 Python"教程的问题：**从变量、循环、函数讲起**。

对会 TS 的人来说，这些**根本不用学**——Python 和 TS 在 90% 的基础语法上是相似的（`if/else/while/for/def` 几乎一一对应）。

真正需要学的，是**那些"看着像但行为不同"的陷阱**：

| 陷阱类别 | TS 直觉 | Python 实际 |
|---------|---------|-----------|
| 作用域 | 块级 `{}` | 函数级 `def`（**没有真正的块级作用域**）|
| 可变性 | 默认不可变思维 | 默认可变（list/dict 都是可变对象）|
| 默认参数 | 每次调用重新求值 | **默认参数只在函数定义时求值一次**（经典坑）|
| 字符串 | 模板字符串 `` `${x}` `` | f-string `f"{x}"` |
| 异步 | Promise + async/await | asyncio + async/await（看起来一样，模型完全不同）|
| 类型 | 类型推断强大 | type hint 可选且不强制 |

**这一章只讲这些差异点**。语法细节查[Python 官方教程](https://docs.python.org/zh-cn/3/tutorial/)即可，不用记。

---

## TS → Python 速查表

### 1. 变量与类型

```typescript
// TypeScript
let count: number = 0
const name: string = "qwen"
const items: Array<{ id: number }> = [{ id: 1 }]
type User = { id: number; name: string }
interface Post { title: string }
```

```python
# Python
count: int = 0
name: str = "qwen"
items: list[dict[str, int]] = [{"id": 1}]  # 或 list[TypedDict]
from typing import TypedDict
class User(TypedDict):
    id: int
    name: str
```

**关键差异**：
- Python **没有 `let`/`const` 关键字**。约定：大写首字母 = 常量，小写 = 变量
- Python **没有 `interface`**，用 `TypedDict` 或 `dataclass`
- Python 类型提示**不强制**，运行时不检查。但用 `mypy` 或 `pyright` 可以静态检查

### 2. 函数与默认参数（最大坑）

```typescript
// TypeScript：每次调用重新创建空数组
function addItem(item: string, list: string[] = []) {
  list.push(item)
  return list
}
```

```python
# Python ⚠️ 经典陷阱：默认参数只求值一次
def add_item(item: str, lst: list = []):  # ❌ 错误！lst 会被所有调用共享
    lst.append(item)
    return lst

# ✅ 正确写法：用 None 哨兵
def add_item(item: str, lst: list | None = None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

**为什么 Python 这么设计**：因为 `def` 是语句，执行时求值默认参数（不是每次调用时）。这是 Python 最经典的坑，工程实践中经常遇到。

### 3. 字符串与格式化

```typescript
const name = "qwen"
const model = `qwen-plus-${version}`  // 模板字符串
const multi = `line 1
line 2`  // 多行
```

```python
name = "qwen"
model = f"qwen-plus-{version}"  # f-string（Python 3.6+）

multi = """line 1
line 2"""  # 三引号
multi_2 = ("line 1\n"
           "line 2")  # 隐式字符串拼接（很 Pythonic）
```

**f-string 是核心**。所有动态字符串都用 `f"..."`。Python 3.12+ 还支持嵌套 f-string，比模板字符串更强。

### 4. 字典与对象

```typescript
// TS：对象字面量
const user = { name: "qwen", version: 3 }
const name = user.name
const { name: n, version } = user  // 解构

// Map / Set
const map = new Map<string, number>()
```

```python
# Python：dict（无序但保插入序，3.7+）
user = {"name": "qwen", "version": 3}
name = user["name"]  # ⚠️ key 不存在会 KeyError
name_safe = user.get("name", "default")  # 安全访问

name, version = user["name"], user["version"]  # 解构（按 key 不能直接，要转 items）
for k, v in user.items():
    ...

# dict / set
d: dict[str, int] = {}
s: set[int] = {1, 2, 3}
```

**关键差异**：Python 用 `.` 访问属性（如 `obj.attr`），用 `[]` 访问字典（如 `d["key"]`）。这是 TS 工程师最容易混的地方。

### 5. 异步（最重要的一节）

TS 和 Python 的 `async/await` **语法几乎一样，但执行模型完全不同**。

```typescript
// TS：基于事件循环 + Promise，天然多并发
async function fetchAll(urls: string[]) {
  const results = await Promise.all(urls.map(u => fetch(u)))
  return results
}
```

```python
# Python：基于 asyncio 单线程事件循环
import asyncio
import httpx  # 或 aiohttp

async def fetch_all(urls: list[str]) -> list:
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[client.get(u) for u in urls])
        return results

# 必须用 asyncio.run 启动
asyncio.run(fetch_all(["https://qwen.example.com"]))
```

**关键差异**：

| 维度 | TypeScript | Python |
|------|-----------|--------|
| 并发模型 | 事件循环（libuv） | asyncio 单线程事件循环 |
| 阻塞操作 | 自动让出 | **必须显式 `await`，否则阻塞整个循环** |
| 多核利用 | Node 进程模型 | asyncio 不利用多核，多核靠多进程 |
| 库兼容性 | 几乎所有库都是 async-ready | **同步库和异步库不互通**（如 `requests` 不能在 async 函数里直接用） |

**实战警告**：在 async 函数里调用同步阻塞函数（如 `time.sleep` 或 `requests.get`），会**阻塞整个事件循环**，所有协程都卡住。这是 Python 异步最大的坑。

### 6. 类与继承

```typescript
class Animal {
  constructor(public name: string, protected age: number) {}
  protected makeSound(): void {}
}
class Dog extends Animal {
  bark() { console.log(`${this.name} says woof`) }
}
```

```python
from dataclasses import dataclass
from typing import ClassVar

@dataclass
class Animal:
    name: str
    age: int  # 默认 public

    def make_sound(self) -> None:  # ⚠️ self 必须显式
        pass

class Dog(Animal):
    def bark(self):
        print(f"{self.name} says woof")
```

**关键差异**：
- Python **必须显式 `self`** 作为方法第一个参数
- Python 没有 `private`/`protected` 关键字，约定 `_name` 是私有，`__name` 是名称改写
- `@dataclass` 是 Python 写"数据类"的现代方式，类似 TS 的 interface + 工厂函数

### 7. 模块与导入

```typescript
// TS
import express from "express"
import { Router } from "express"
export function foo() {}
export default class App {}
```

```python
# Python
import express  # 不存在，但语法演示
from express import Router
from express import *  # ❌ 不推荐

def foo(): ...
class App: ...

# 没有默认导出概念
# 一个 .py 文件就是一个模块，模块名 = 文件名
```

---

## Why 3：为什么 2026 年应该用 uv / pyproject.toml

Python 生态在 2024-2025 经历了一次**包管理大换代**。如果你看老的 Python 教程，会看到 `pip` + `requirements.txt` + `virtualenv` 这套。**2026 年这套已经被 `uv` + `pyproject.toml` 取代**。

### `uv` 是什么

`uv` 是 Rust 写的 Python 包管理器（作者就是写 `pip` 的那批人），2024 年发布后迅速成为事实标准。比 `pip` 快 10-100 倍，集成了：

- Python 版本管理（替代 `pyenv`）
- 虚拟环境（替代 `venv` / `virtualenv`）
- 包安装（替代 `pip`）
- 项目管理（替代 `poetry`）
- 发布（替代 `twine`）

### 现代项目结构（2026 标准）

```bash
# 初始化
uv init my-agent
cd my-agent

# 添加依赖
uv add openai httpx fastapi
uv add --dev pytest ruff mypy

# 跑代码
uv run python main.py

# 跑测试
uv run pytest
```

生成的 `pyproject.toml`（≈ `package.json`）：

```toml
[project]
name = "my-agent"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "openai>=1.50.0",
    "httpx>=0.27.0",
    "fastapi>=0.115.0",
]

[dependency-groups]
dev = ["pytest", "ruff", "mypy"]
```

**关键记忆**：

| 概念 | npm/pnpm 对应 | uv 命令 |
|------|-------------|---------|
| 项目清单 | `package.json` | `pyproject.toml` |
| 锁文件 | `pnpm-lock.yaml` | `uv.lock` |
| 安装依赖 | `pnpm install` | `uv sync` |
| 加依赖 | `pnpm add xxx` | `uv add xxx` |
| 跑脚本 | `pnpm run xxx` | `uv run xxx` |

如果你看完这个表，**已经能在 Python 项目里干 80% 的活了**。

---

## Why 4：为什么 LangChain 是必学框架（即使你不爱用它）

很多前端会问：**"我不喜欢 LangChain，太重了，能不能不用？"**

答案：**生产环境可以不用，但必须能读懂它**。

原因：
1. LangChain 是 Agent 框架的"通用语言"——其他框架（LlamaIndex、AutoGen、CrewAI）的 API 设计都受它影响
2. 90% 的 Agent 开源项目用 LangChain 写，看不懂等于看不懂整个生态
3. LangChain 的抽象（Chain、Agent、Tool、Memory）是理解 Agent 工程的核心概念

### LangChain.py 最小可用代码

```python
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# 用 OpenAI 兼容协议接阿里云 Qwen（关键：换 baseURL）
client = ChatOpenAI(
    model="qwen-plus",
    api_key="sk-xxx",  # 阿里云百炼 API Key
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

# 最简调用
response = client.invoke([HumanMessage(content="用一句话解释 LLM")])
print(response.content)
```

**核心迁移点**：
- `ChatOpenAI` 是 LangChain 对 OpenAI 兼容 API 的封装
- 换 `base_url` 就能接 Qwen / DeepSeek / Kimi 等所有 OpenAI 兼容协议的模型
- `HumanMessage` / `AIMessage` / `SystemMessage` 是消息类型（对应 OpenAI 的 `role`）

---

## Python 工程师的"两个生态"（必知）

Python 在 LLM 领域有两个并行的生态，**都要认识**：

### 生态 A：OpenAI 兼容协议（推荐入门）

```python
# 直接用 openai SDK + 任何 OpenAI 兼容服务（Qwen/DeepSeek/Kimi）
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxx",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
response = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "你好"}],
)
```

**优点**：API 稳定、生态丰富（LangChain/LlamaIndex 都基于这个）、跨模型可迁移
**适合**：80% 的应用层开发

### 生态 B：阿里云 dashscope 原生 SDK

```python
import dashscope

dashscope.api_key = "sk-xxx"
response = dashscope.Generation.call(
    model="qwen-plus",
    prompt="你好",
)
```

**优点**：能用到 Qwen 特有能力（如长文档、多模态某些参数）
**适合**：深度使用 Qwen 的项目，或在阿里云上部署的项目

**建议**：从生态 A 入门，遇到 Qwen 特有能力时再用 B。**前端转 Agent 不要一开始就学 dashscope，会让你的代码不可迁移**。

---

## 实战：用 Python 写一个 30 行的 Chatbot

把以上所有知识综合起来，写一个能跑的 Python Chatbot。**对比你用 TS 写同样功能的代码，你会发现 90% 是一样的**。

```python
"""
最小 Qwen Chatbot - Python 版
依赖：uv add openai
"""
import sys
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxx",  # 替换成你的阿里云百炼 API Key
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

messages = [
    {"role": "system", "content": "你是一个简洁的中文助手，回答不超过两句话。"}
]

print("Chatbot 启动，输入 exit 退出\n")

while True:
    user_input = input("你: ").strip()
    if user_input.lower() in ("exit", "quit"):
        break
    if not user_input:
        continue

    messages.append({"role": "user", "content": user_input})

    # 流式输出
    stream = client.chat.completions.create(
        model="qwen-plus",
        messages=messages,
        stream=True,
    )

    print("AI: ", end="", flush=True)
    full_reply = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        print(delta, end="", flush=True)
        full_reply += delta
    print()  # 换行

    messages.append({"role": "assistant", "content": full_reply})
```

跑起来：

```bash
uv add openai
export OPENAI_API_KEY="sk-xxx"  # 或直接写代码里
uv run python chatbot.py
```

**这个 30 行代码里用到的 Python 特性**：
- 类型推断（没有 type hint 也能跑）
- 字典字面量 `{"role": "user", "content": ...}`
- 列表 `append` 方法
- `while True` 循环 + `break`
- f-string（没有用到，但你可以试试 `print(f"你说: {user_input}")`）
- 模块导入 `from openai import OpenAI`

**如果你能读懂这段代码**，你就具备后续章节所有 Python 示例的阅读基础了。

---

## 一份"读后即走"的速查卡

| 我想做的事 | TypeScript | Python |
|----------|-----------|--------|
| 定义变量 | `let x = 1` / `const y = 2` | `x = 1` / `y = 2`（无 const 关键字） |
| 字符串插值 | `` `Hello ${name}` `` | `f"Hello {name}"` |
| 异步函数 | `async function foo()` | `async def foo()` |
| 等待异步 | `await promise` | `await coroutine` |
| 并发等待 | `await Promise.all([...])` | `await asyncio.gather(...)` |
| 列表 | `[1, 2, 3]` | `[1, 2, 3]` |
| 字典 | `const m: Record<string, number> = {}` | `m: dict[str, int] = {}` |
| 安全取值 | `obj?.key ?? "default"` | `obj.get("key", "default")` |
| 空值 | `null` / `undefined`（两个！） | `None`（只有一个） |
| 类 | `class Foo extends Bar {}` | `class Foo(Bar):` |
| 接口 | `interface Foo {}` | `class Foo(TypedDict):` 或 `@dataclass` |
| 加依赖 | `pnpm add xxx` | `uv add xxx` |
| 跑脚本 | `pnpm run dev` | `uv run python xxx.py` |
| 测试 | `pnpm test` | `uv run pytest` |

把这张图存起来，**遇到不认识的 Python 代码反向查就行**。

---

## 常见坑（来自一线 code review）

> **坑 1：在 async 函数里用 `requests.get`**
> `requests` 是同步阻塞库，会卡死事件循环。**async 函数里必须用 `httpx.AsyncClient` 或 `aiohttp`**。

> **坑 2：可变默认参数**
> 见上面的 "函数与默认参数" 章节。这是 Python 第一大坑，没之一。

> **坑 3：把 TS 的 `===` 习惯带过来**
> Python 没有 `===`，只有 `==`。但 `is` 用于身份比较（`a is b` 等价 `a === b`）。`None` 比较用 `is None`，不用 `== None`。

> **坑 4：缩进错误**
> Python 用缩进表示代码块，混用 tab 和 space 会报错。**项目里永远用 4 个空格**（VS Code / PyCharm 默认正确处理）。

> **坑 5：不理解 GIL（全局解释器锁）**
> Python 多线程**不能利用多核 CPU**（GIL 锁）。CPU 密集任务用多进程（`multiprocessing`），IO 密集任务用 asyncio。这点和 Node 几乎一样，但前端工程师常误解"Python 多线程没用"。

---

## 本章检查清单

- [ ] 我能解释为什么 LLM 生态以 Python 为主（生态原因）
- [ ] 我知道 TS 工程师转型做 Agent 有什么独特优势
- [ ] 我能讲清 Python 默认参数的经典坑
- [ ] 我知道为什么 async 函数里不能用 `requests` 库
- [ ] 我能列出 `uv` / `pyproject.toml` / `pip` 三者关系
- [ ] 我读懂了本章末尾的 30 行 Python Chatbot 代码
- [ ] 我知道 OpenAI 兼容协议 vs dashscope 原生 SDK 的取舍

---

## 下一步

Python 工具链就位了。接下来进入 **Phase 3 · 接入阿里云 Qwen，跑通第一个调用**——用百炼平台的 API Key + OpenAI 兼容协议，把这里的 Chatbot 升级成"能上网部署的版本"。

如果你 Python 已经很熟，可以直接跳过本章进入 Phase 3——但本章的"为什么 LLM 生态以 Python 为主"和"TS 工程师的独特优势"这两段，建议至少看一眼，对理解后续章节的代码示例有帮助。
