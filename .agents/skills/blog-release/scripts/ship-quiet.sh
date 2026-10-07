#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LOG="${TMPDIR:-/tmp}/blog-release-ship-$(date +%Y%m%d-%H%M%S).log"
PRODUCTION_HEALTH="https://www.zijeleo.cn/api/health"

cd "$PROJECT_DIR"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ship aborted: tracked changes are uncommitted."
  echo "Commit or stash them first. Untracked files do not block this helper."
  exit 1
fi

run_release() {
  echo "▸ git push origin HEAD"
  git push origin HEAD || return 1

  echo "▸ scripts/deploy.local.sh"
  bash scripts/deploy.local.sh || return 1
}

if ! run_release >"$LOG" 2>&1; then
  echo "ship failed: push or deployment"
  echo "log: $LOG"
  echo "--- log tail ---"
  tail -n 120 "$LOG"
  exit 1
fi

echo "▸ production health check"
if ! curl -fsS "$PRODUCTION_HEALTH" >/dev/null; then
  echo "ship failed: production health check"
  echo "url: $PRODUCTION_HEALTH"
  echo "log: $LOG"
  echo "--- log tail ---"
  tail -n 120 "$LOG"
  exit 1
fi

COMMIT="$(git rev-parse HEAD)"
echo "ship passed"
echo "commit: $COMMIT"
echo "health: $PRODUCTION_HEALTH"
echo "log: $LOG"
echo "--- deploy summary ---"
tail -n 35 "$LOG"
