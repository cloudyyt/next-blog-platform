-- CreateTable
CREATE TABLE "treehole_book_configs" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "coverStyle" TEXT NOT NULL DEFAULT 'wind-cloud',
    "defaultView" TEXT NOT NULL DEFAULT 'cover',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treehole_book_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treehole_sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "plannedTitles" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treehole_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treehole_entries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'article',
    "title" TEXT,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "weather" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treehole_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "treehole_sections_slug_key" ON "treehole_sections"("slug");

-- CreateIndex
CREATE INDEX "treehole_sections_published_order_idx" ON "treehole_sections"("published", "order");

-- CreateIndex
CREATE UNIQUE INDEX "treehole_entries_slug_key" ON "treehole_entries"("slug");

-- CreateIndex
CREATE INDEX "treehole_entries_sectionId_order_idx" ON "treehole_entries"("sectionId", "order");

-- CreateIndex
CREATE INDEX "treehole_entries_published_date_idx" ON "treehole_entries"("published", "date" DESC);

-- AddForeignKey
ALTER TABLE "treehole_entries" ADD CONSTRAINT "treehole_entries_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "treehole_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

