-- Agent 指南章节表（独立于 posts 的内容类型）
CREATE TABLE "guide_chapters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 10,
    "readingTime" INTEGER,
    "comingSoon" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "ogImage" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_chapters_pkey" PRIMARY KEY ("id")
);

-- Agent 指南系列配置（singleton，整站一份）
CREATE TABLE "guide_series_config" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "coverImage" TEXT,
    "badge" TEXT NOT NULL DEFAULT '连载中',
    "cta" TEXT,
    "valueCard1" TEXT,
    "valueCard2" TEXT,
    "valueCard4" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "groups" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_series_config_pkey" PRIMARY KEY ("id")
);

-- 唯一约束
CREATE UNIQUE INDEX "guide_chapters_slug_key" ON "guide_chapters"("slug");

-- 索引
CREATE INDEX "guide_chapters_group_order_idx" ON "guide_chapters"("group", "order");
CREATE INDEX "guide_chapters_published_idx" ON "guide_chapters"("published");

-- 外键：章节作者
ALTER TABLE "guide_chapters"
ADD CONSTRAINT "guide_chapters_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
