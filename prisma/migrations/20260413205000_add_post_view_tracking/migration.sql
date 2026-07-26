-- Add view count to posts
ALTER TABLE "posts" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- Create post view events table (append-only)
CREATE TABLE "post_view_events" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipHash" TEXT NOT NULL,
  "uaHash" TEXT,
  "referer" TEXT,
  "path" TEXT,

  CONSTRAINT "post_view_events_pkey" PRIMARY KEY ("id")
);

-- Foreign key
ALTER TABLE "post_view_events"
ADD CONSTRAINT "post_view_events_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for analytics queries
CREATE INDEX "post_view_events_postId_createdAt_idx"
ON "post_view_events"("postId", "createdAt");

CREATE INDEX "post_view_events_createdAt_idx"
ON "post_view_events"("createdAt");

