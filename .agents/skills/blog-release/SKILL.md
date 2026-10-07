---
name: blog-release
description: Release this Next.js blog with logically grouped commits, one GitHub push, and the existing Aliyun deploy script while keeping command output small. Use for explicit ship/push/deploy/release requests in this repository; do not trigger for ordinary code changes.
---

# Blog release workflow

This repository deploys to the production domain **`https://zijieleo.cn`**. Deployment is performed by the existing `scripts/deploy.local.sh`; its real connection settings live in git-ignored `scripts/deploy.config.sh` and must never be printed or committed.

The release cost problem is output and redundant verification, not the number of necessary Git objects. Keep inspection narrow, commit semantically, push once, and deploy once.

## Required workflow

1. Inspect the working tree once with:
   ```bash
   git status --short --branch
   git diff --stat
   ```
   Avoid showing full diffs unless a specific hunk is unclear.

2. If there are uncommitted changes, group them into small conventional commits by responsibility—for example data model/migration, public UI, admin UI, deployment/ops, or a small follow-up fix. Stage files explicitly. Do **not** use `git add -A`: unrelated untracked content such as `garden-gpt-image-2/` may exist.

3. Before committing, run the quiet preflight helper:
   ```bash
   bash .agents/skills/blog-release/scripts/preflight-quiet.sh
   ```
   It runs `git diff --check`, `pnpm lint`, and `pnpm exec tsc --noEmit` while redirecting verbose output to a temporary log. On failure it prints only the relevant log tail. A standalone production build is intentionally omitted because `deploy.local.sh` already builds once.

4. After creating commits and ensuring no tracked file remains modified, run:
   ```bash
   bash .agents/skills/blog-release/scripts/ship-quiet.sh
   ```
   The helper pushes the current `HEAD` once, invokes the existing deploy script once, redirects build/upload/scp/ssh output to a temporary log, verifies `https://www.zijieleo.cn/api/health`, and prints only a concise success summary or failure tail. Do not manually run `git push`, `deploy.local.sh`, and deployment verification separately when this helper is available.

5. Report the commit range, latest commit SHA, helper log path, health-check result, and any concrete failure. Do not paste large deploy logs.

## Project invariants

- Production domain: `https://zijieleo.cn`.
- Until the apex certificate includes `zijieleo.cn`, use the valid `www.zijieleo.cn` host for automated health checks. The current certificate SAN only contains `www.zijieleo.cn`.
- GitHub remote: `origin`.
- Existing deployment entrypoint: `scripts/deploy.local.sh`.
- Git-ignored deployment secrets: `scripts/deploy.config.sh`.
- Prisma migrations must be committed; the server runs `prisma migrate deploy`.
- The release archive and build output are not source artifacts and must not be committed.
- Only execute push/deploy when the user explicitly asks to ship, push, deploy, or release. Ordinary implementation/testing requests stop before remote mutation.
- If a release fails, inspect only the tail of the generated log (the helper already does this) and fix the specific failure rather than rerunning the full pipeline blindly.
