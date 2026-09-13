-- 电子书多系列改造：
-- 1. guide_chapters 加 series 列（存量回填 'agent-guide'），slug 唯一改为 (series, slug) 复合唯一
-- 2. 索引按系列重建
-- 3. guide_series_config 从 singleton 变多行（存量 'singleton' 行改名 'agent-guide'）
-- 注：slug 唯一在建表历史上可能是 CONSTRAINT 也可能是 UNIQUE INDEX（本地 db push / 线上 migration），
--     两种形态都防御性清理。

-- 1. chapters 加 series 列
ALTER TABLE "guide_chapters" ADD COLUMN IF NOT EXISTS "series" TEXT NOT NULL DEFAULT 'agent-guide';

-- 2. 唯一约束：slug 全局唯一 → (series, slug)（兼容约束/索引两种旧形态）
ALTER TABLE "guide_chapters" DROP CONSTRAINT IF EXISTS "guide_chapters_slug_key";
DROP INDEX IF EXISTS "guide_chapters_slug_key";
ALTER TABLE "guide_chapters" ADD CONSTRAINT "guide_chapters_series_slug_key" UNIQUE ("series", "slug");

-- 3. 索引重建（旧索引删除，按系列建新）
DROP INDEX IF EXISTS "guide_chapters_group_order_idx";
DROP INDEX IF EXISTS "guide_chapters_published_idx";
CREATE INDEX IF NOT EXISTS "guide_chapters_series_group_order_idx" ON "guide_chapters"("series", "group", "order");
CREATE INDEX IF NOT EXISTS "guide_chapters_series_published_idx" ON "guide_chapters"("series", "published");

-- 4. series config：singleton 行改名为 agent-guide（多行制的第一本书）
UPDATE "guide_series_config" SET "id" = 'agent-guide' WHERE "id" = 'singleton';
