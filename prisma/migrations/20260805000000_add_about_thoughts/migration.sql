-- 碎碎念（关于页时间线，短句/情绪记录）
CREATE TABLE "thoughts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "weather" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thoughts_pkey" PRIMARY KEY ("id")
);

-- 关于页配置（singleton，整站一份）
CREATE TABLE "about_config" (
    "id" TEXT NOT NULL,
    "tagline" TEXT,
    "intro" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_config_pkey" PRIMARY KEY ("id")
);

-- 列表分页：published + createdAt 倒序
CREATE INDEX "thoughts_published_createdAt_idx" ON "thoughts"("published", "createdAt" DESC);
