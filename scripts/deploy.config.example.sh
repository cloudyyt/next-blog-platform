#!/usr/bin/env bash
# 部署配置示例 —— 复制为 deploy.config.sh 后填入真实值
#
# 用法：cp scripts/deploy.config.example.sh scripts/deploy.config.sh
#       然后编辑 scripts/deploy.config.sh
#
# ⚠️ deploy.config.sh 已在 .gitignore 中（含服务器真实信息，勿提交）
#
# 各项含义见 docs/0726-部署上线与数据同步.md

# 服务器 SSH 用户（一般是 root 或你的云账号）
DEPLOY_USER="root"

# 服务器公网 IP
DEPLOY_HOST="8.134.238.183"

# 服务器项目目录（绝对路径）
DEPLOY_DIR="/www/wwwroot/next-blog-platform"

# pm2 进程名
DEPLOY_PM2_NAME="blog"

# SSH 端口（一般 22，改过的话填实际端口）
DEPLOY_SSH_PORT="22"

# 本次部署是否需要灌 Agent 指南数据
#   true  = 服务器跑 db:seed:guide（首次部署或内容大改时设 true）
#   false = 跳过 seed（只更新代码/部署，不动 guide 数据）
DEPLOY_SEED_GUIDE="true"

# seed-guide 是否用 --force（覆盖已存在的章节内容）
#   ⚠️ true 会覆盖线上 admin 手动编辑的内容，慎用！
#   首次部署可以 true；日常更新建议 false（只插新章）
DEPLOY_SEED_FORCE="false"

# 本次部署是否需要跑 migrate deploy（建表/改表结构）
#   true  = 跑 prisma migrate deploy
#   false = 跳过（纯前端改动时设 false）
DEPLOY_MIGRATE="true"
