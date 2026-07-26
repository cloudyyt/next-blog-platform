#!/usr/bin/env bash
#
# 本地部署脚本 —— 一键完成（build + 打包 + 上传 + 触发服务器部署）
#
# 用法：
#   1. 首次：cp scripts/deploy.config.example.sh scripts/deploy.config.sh 并填值
#   2. 执行：bash scripts/deploy.local.sh
#
# 流程：
#   Step 0  本地 pnpm build
#   Step 1  打包 release.tgz（含 .next / package.json / pnpm-lock.yaml / prisma / docs/agent-guide）
#   Step 2  scp 上传到服务器
#   Step 3  ssh 触发服务器端 deploy.server.sh（解压 + 装依赖 + migrate + 清缓存 + 重启）
#
# 日常部署只更新代码，不碰业务数据。
# 需要初始化 Agent 指南数据时，用独立脚本：bash scripts/init-guide-data.sh
#
# 文档见 docs/0726-部署上线与数据同步.md

set -euo pipefail

# ─── 颜色 ───
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
die()   { echo -e "${RED}✗${NC} $1"; exit 1; }

# ─── 加载配置 ───
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/deploy.config.sh"

cd "$PROJECT_DIR"

if [[ ! -f "$CONFIG_FILE" ]]; then
  die "配置文件不存在：$CONFIG_FILE
请先复制模板：cp scripts/deploy.config.example.sh scripts/deploy.config.sh
然后编辑填入服务器信息。"
fi
# shellcheck disable=SC1090
source "$CONFIG_FILE"

# 校验必填项
[[ -z "${DEPLOY_HOST:-}" ]] && die "DEPLOY_HOST 未配置"
[[ -z "${DEPLOY_DIR:-}" ]] && die "DEPLOY_DIR 未配置"
[[ -z "${DEPLOY_PM2_NAME:-}" ]] && die "DEPLOY_PM2_NAME 未配置"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"

info "部署目标：${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}  (pm2: ${DEPLOY_PM2_NAME})"
echo ""

# ─── Step 0: 本地构建 ───
info "Step 0/3  本地构建（pnpm build）..."
# 确认依赖装好
if [[ ! -d node_modules ]]; then
  warn "node_modules 不存在，先 pnpm install"
  pnpm install
fi
pnpm build
ok "Step 0  构建完成"
echo ""

# ─── Step 1: 打包 ───
info "Step 1/3  打包 release.tgz..."
# 关键：必须带 docs/agent-guide，否则服务器 seed-guide 读不到内容
PACK_FILES=".next package.json pnpm-lock.yaml prisma docs/agent-guide"
# 检查必要文件都在
for f in $PACK_FILES; do
  [[ -e "$f" ]] || die "缺少必要文件/目录：$f"
done
# 在项目根目录打包
tar -czf release.tgz $PACK_FILES
PACK_SIZE=$(du -h release.tgz | awk '{print $1}')
ok "Step 1  打包完成（release.tgz, ${PACK_SIZE}）"
echo ""

# ─── Step 2: 上传 ───
info "Step 2/3  上传到服务器（scp）..."
SCP_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}/release.tgz"
scp -P "$DEPLOY_SSH_PORT" release.tgz "$SCP_TARGET"
ok "Step 2  上传完成 → ${SCP_TARGET}"
echo ""

# 顺便把服务器端脚本也传上去（保持服务器脚本最新）
scp -P "$DEPLOY_SSH_PORT" \
  "$SCRIPT_DIR/deploy.server.sh" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_DIR}/deploy.server.sh" 2>/dev/null && \
  info "已同步服务器端脚本 deploy.server.sh" || warn "服务器端脚本同步失败（不影响主流程）"

# ─── Step 3: ssh 触发服务器端部署 ───
info "Step 3/3  触发服务器端部署（ssh）..."
echo ""
echo "──────────────────────────────────────────────"
echo "  以下输出来自服务器，请关注是否有报错"
echo "──────────────────────────────────────────────"

# 把 pm2 名传给服务器脚本（ssh 的 VAR=val 写在 remote 命令字符串里才生效）
ssh -p "$DEPLOY_SSH_PORT" "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "DEPLOY_PM2_NAME='${DEPLOY_PM2_NAME}' bash ${DEPLOY_DIR}/deploy.server.sh"

echo ""
ok "全部部署步骤完成"
info "下一步：打开浏览器访问 http://${DEPLOY_HOST}/ 验证"
info "验证清单见 docs/0726-部署上线与数据同步.md 第六节"
