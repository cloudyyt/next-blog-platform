-- 树洞（生活区）：分区 + 帖子
-- 设计见 docs_memo/0917-树洞生活区设计方案.md

CREATE TABLE "life_categories" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "life_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "life_categories_key_key" ON "life_categories"("key");

CREATE TABLE "life_posts" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "images" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "life_posts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "life_posts_categoryId_date_idx" ON "life_posts"("categoryId", "date" DESC);
CREATE INDEX "life_posts_published_date_idx" ON "life_posts"("published", "date" DESC);

ALTER TABLE "life_posts" ADD CONSTRAINT "life_posts_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "life_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 初始分区（单机游戏 / 动漫·影视 / 生活随笔）
INSERT INTO "life_categories" ("id", "key", "name", "icon", "order") VALUES
  ('lc_game',   'game',   '单机游戏', 'Gamepad2',   10),
  ('lc_anime',  'anime',  '动漫·影视', 'Clapperboard', 20),
  ('lc_essay',  'essay',  '生活随笔', 'Feather',    30);
