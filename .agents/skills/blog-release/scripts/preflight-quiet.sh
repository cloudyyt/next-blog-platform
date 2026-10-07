#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
LOG="${TMPDIR:-/tmp}/blog-release-preflight-$(date +%Y%m%d-%H%M%S).log"

cd "$PROJECT_DIR"

run_step() {
  local label="$1"
  shift
  echo "▸ $label" >>"$LOG"
  if ! "$@" >>"$LOG" 2>&1; then
    echo "preflight failed: $label"
    echo "log: $LOG"
    echo "--- log tail ---"
    tail -n 120 "$LOG"
    exit 1
  fi
}

: >"$LOG"
run_step "git diff --check" git diff --check
run_step "pnpm lint" pnpm lint
run_step "pnpm exec tsc --noEmit" pnpm exec tsc --noEmit

echo "preflight passed: git diff --check, lint, tsc"
echo "log: $LOG"
