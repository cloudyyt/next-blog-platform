-- AlterTable
ALTER TABLE "about_config" ALTER COLUMN "id" SET DEFAULT 'singleton';

-- AlterTable
ALTER TABLE "guide_series_config" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "inspiration_items" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "audioSeconds" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'inbox',
    "source" TEXT NOT NULL DEFAULT 'notes',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspiration_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_topics" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'growing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspiration_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_topic_links" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspiration_topic_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_draft_links" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspiration_draft_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspiration_items_createdAt_idx" ON "inspiration_items"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "inspiration_items_status_createdAt_idx" ON "inspiration_items"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inspiration_items_type_createdAt_idx" ON "inspiration_items"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inspiration_topics_status_updatedAt_idx" ON "inspiration_topics"("status", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "inspiration_topic_links_topicId_createdAt_idx" ON "inspiration_topic_links"("topicId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inspiration_topic_links_itemId_idx" ON "inspiration_topic_links"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "inspiration_topic_links_itemId_topicId_key" ON "inspiration_topic_links"("itemId", "topicId");

-- CreateIndex
CREATE INDEX "inspiration_draft_links_topicId_createdAt_idx" ON "inspiration_draft_links"("topicId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "inspiration_draft_links_topicId_entryId_key" ON "inspiration_draft_links"("topicId", "entryId");

-- AddForeignKey
ALTER TABLE "inspiration_topic_links" ADD CONSTRAINT "inspiration_topic_links_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inspiration_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_topic_links" ADD CONSTRAINT "inspiration_topic_links_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "inspiration_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_draft_links" ADD CONSTRAINT "inspiration_draft_links_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "inspiration_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_draft_links" ADD CONSTRAINT "inspiration_draft_links_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "treehole_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

