#!/usr/bin/env bash
#
# 部署前自检脚本 —— 本地跑，不碰服务器
#
# 用法：bash scripts/preflight-check.sh
#
# 检查所有可能导致部署失败的问题，提前暴露风险：
#   1. 工作区是否干净（未提交的改动部署后会丢）
#   2. build 是否通过
#   3. 迁移文件是否齐全且已提交
#   4. seed-guide 依赖的 docs/agent-guide 是否完整
#   5. package.json 关键依赖是否就位
#   6. 打包内容预览（确认会带上哪些目录）
#
# 文档见 docs/0726-部署上线与数据同步.md

set -uo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
PASS=0; WARN=0; FAIL=0

ok()   { echo -e "${GREEN}✓${NC} $1"; PASS=$((PASS+1)); }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; WARN=$((WARN+1)); }
fail() { echo -e "${RED}✗${NC} $1"; FAIL=$((FAIL+1)); }
sec()  { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

echo "部署前自检（本地，不碰服务器）"
echo "项目：$PROJECT_DIR"
echo ""

# ─── 1. 工作区状态 ───
sec "1. 工作区状态"
if [[ -z "$(git status --short)" ]]; then
  ok "工作区干净（所有改动已提交）"
else
  warn "工作区有未提交改动："
  git status --short | head -10 | sed 's/^/    /'
  echo "    部署时这些改动不会被打包，建议先 commit 或 stash"
fi

# ─── 2. 当前分支和最近 commit ───
sec "2. Git 状态"
echo "分支: $(git branch --show-current)"
echo "最近 3 个 commit:"
git log --oneline -3 | sed 's/^/    /'
ok "git 状态已显示"

# ─── 3. build 检查 ───
sec "3. 构建检查（pnpm build）"
if [[ ! -d node_modules ]]; then
  fail "node_modules 不存在，先 pnpm install"
  exit 1
fi

echo "正在 build（这可能需要 1-2 分钟）..."
if pnpm build > /tmp/preflight-build.log 2>&1; then
  ok "build 通过"
else
  fail "build 失败，日志尾部："
  tail -20 /tmp/preflight-build.log | sed 's/^/    /'
  echo "    必须先修复 build 错误才能部署"
  exit 1
fi

# ─── 4. 迁移文件检查 ───
sec "4. 数据库迁移文件"
MIGRATIONS_DIR="prisma/migrations"
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  fail "prisma/migrations 目录不存在"
else
  MIG_COUNT=$(find "$MIGRATIONS_DIR" -name "migration.sql" | wc -l | tr -d ' ')
  if [[ "$MIG_COUNT" -eq 0 ]]; then
    fail "没有迁移文件"
  else
    ok "找到 $MIG_COUNT 个迁移文件"
    find "$MIGRATIONS_DIR" -name "migration.sql" | sort | sed 's/^/    /'

    # 检查迁移是否已提交到 git（之前踩过坑：被 gitignore 了）
    if git check-ignore "$MIGRATIONS_DIR" >/dev/null 2>&1; then
      fail "$MIGRATIONS_DIR 被 .gitignore 忽略！部署致命，请修复 .gitignore"
    else
      ok "迁移目录未被 gitignore 忽略"
    fi

    # 检查每个迁移是否已提交
    UNTRACKED_MIG=$(git ls-files --others --exclude-standard "$MIGRATIONS_DIR" | wc -l | tr -d ' ')
    if [[ "$UNTRACKED_MIG" -gt 0 ]]; then
      warn "有 $UNTRACKED_MIG 个迁移文件未提交到 git"
    else
      ok "所有迁移文件已提交"
    fi
  fi
fi

# ─── 5. seed-guide 依赖检查 ───
sec "5. seed-guide 数据源依赖"
# seed-guide 读 docs/agent-guide/manifest.ts + *.md
if [[ ! -f "docs/agent-guide/manifest.ts" ]]; then
  fail "docs/agent-guide/manifest.ts 不存在（seed-guide 编译会失败）"
else
  ok "docs/agent-guide/manifest.ts 存在"
fi

MD_COUNT=$(find docs/agent-guide -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$MD_COUNT" -lt 10 ]]; then
  warn "docs/agent-guide/ 下只有 $MD_COUNT 个 md（manifest 定义了 11 章，缺的章节 seed 会建成空章）"
else
  ok "docs/agent-guide/ 下有 $MD_COUNT 个 md"
fi

# seed-guide.ts 本身
if [[ ! -f "prisma/seed-guide.ts" ]]; then
  fail "prisma/seed-guide.ts 不存在"
else
  ok "prisma/seed-guide.ts 存在"
fi

# ─── 6. 关键依赖检查 ───
sec "6. 关键依赖"
check_dep() {
  local dep=$1
  if [[ -d "node_modules/$dep" ]]; then
    ok "$dep 已安装"
  else
    fail "$dep 未安装"
  fi
}
check_dep "ali-oss"
check_dep "sharp"
check_dep "rehype-raw"
check_dep "@prisma/client"

# ─── 7. 打包内容预览 ───
sec "7. 打包内容预览（deploy.local.sh 会打包这些）"
PACK_FILES=".next package.json pnpm-lock.yaml prisma docs/agent-guide"
for f in $PACK_FILES; do
  if [[ -e "$f" ]]; then
    SIZE=$(du -sh "$f" 2>/dev/null | awk '{print $1}')
    ok "$f ($SIZE)"
  else
    fail "$f 不存在（打包会失败）"
  fi
done

# ─── 8. 本地 .env 检查（仅提示，不读内容）───
sec "8. 本地 .env 检查"
if [[ -f ".env" ]]; then
  ok ".env 存在"
  # 检查关键变量是否配置（只看有没有，不看值）
  for var in PRISMA_DATABASE_URL JWT_SECRET NEXT_PUBLIC_BASE_URL OSS_REGION OSS_BUCKET OSS_ACCESS_KEY_ID OSS_ACCESS_KEY_SECRET; do
    if grep -q "^${var}=" .env 2>/dev/null; then
      ok ".env 含 $var"
    else
      warn ".env 缺 $var（服务器上需要配）"
    fi
  done
else
  warn ".env 不存在（本地开发可能用 .env.local，但服务器必须配 .env）"
fi

# ─── 9. 部署配置文件检查 ───
sec "9. 部署配置"
if [[ -f "scripts/deploy.config.sh" ]]; then
  ok "scripts/deploy.config.sh 存在（含服务器真实信息）"
  # 检查是否被 gitignore（必须忽略）
  if git check-ignore scripts/deploy.config.sh >/dev/null 2>&1; then
    ok "deploy.config.sh 被 gitignore（正确，含敏感信息）"
  else
    fail "deploy.config.sh 未被 gitignore！会泄露服务器信息，请修复 .gitignore"
  fi
else
  warn "scripts/deploy.config.sh 不存在，需先创建：cp scripts/deploy.config.example.sh scripts/deploy.config.sh"
fi

# ─── 总结 ───
sec "自检总结"
echo "通过: $PASS  警告: $WARN  失败: $FAIL"
echo ""
if [[ "$FAIL" -gt 0 ]]; then
  echo -e "${RED}✗ 有 $FAIL 项失败，必须修复后才能部署${NC}"
  exit 1
elif [[ "$WARN" -gt 0 ]]; then
  echo -e "${YELLOW}⚠ 有 $WARN 项警告，建议处理后再部署（不阻塞）${NC}"
else
  echo -e "${GREEN}✓ 全部通过，可以部署${NC}"
fi
echo ""
echo "下一步："
echo "  1. 确认 scripts/deploy.config.sh 已填服务器信息"
echo "  2. 运行 bash scripts/deploy.local.sh 一键部署"
echo "  3. 部署遇坑参考 docs/0726-部署上线与数据同步.md 第四节"
