-- Add the first locally tested treehole book article.
-- Idempotent: production edits made after deployment are never overwritten.
INSERT INTO "treehole_entries" (
  "id",
  "slug",
  "sectionId",
  "kind",
  "title",
  "excerpt",
  "content",
  "weather",
  "date",
  "published",
  "order",
  "createdAt",
  "updatedAt"
)
SELECT
  'seed-entry-real-support',
  'zhen-zheng-de-zhi-cheng',
  "treehole_sections"."id",
  'article',
  '真正的支撑',
  NULL,
  '一年内的三两次恍然大悟，后一次总是推翻前一次，原先以为支撑只要不是人就可以，因为人心易变，当时悻悻以为自己理解还算深刻，过多一年，又有新的理解。其实支撑也许正是那些回忆中的人，或者正是那些得不到的人和物。一直以来，我把所谓的<支撑>功能想的太强大，一个人似乎有了支撑就能披荆斩棘，无坚不摧，现在我理解的<支撑>很纯粹，它仅是支撑，一种兜底的承载，除此别无它用，就想往水壶里加水，水壶底部就是水的支撑，而这个底部再漂亮好看又能改变些什么呢？所以，人的<支撑>未必是龙场悟道，未必是永不磨灭的希望火焰，未必是熬过一切苦难的精神动力，它犯不着这么伟大，它可以大道至简：<支撑>就是底部，它上面的东西不会再往下了。',
  NULL,
  TIMESTAMP '2026-10-23 00:00:00',
  TRUE,
  10,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "treehole_sections"
WHERE "treehole_sections"."slug" = 'sprout'
ON CONFLICT ("slug") DO NOTHING;
