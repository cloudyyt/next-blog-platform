-- Treehole book v4: weather/mood chapter copy and prose paste normalization.

ALTER TABLE "treehole_sections" ADD COLUMN IF NOT EXISTS "moodTags" TEXT;
ALTER TABLE "treehole_sections" ADD COLUMN IF NOT EXISTS "leadSentence" TEXT;
ALTER TABLE "treehole_sections" ADD COLUMN IF NOT EXISTS "parallelSentence" TEXT;
ALTER TABLE "treehole_sections" ADD COLUMN IF NOT EXISTS "readerQuestion" TEXT;
ALTER TABLE "treehole_sections" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "treehole_sections" ADD COLUMN IF NOT EXISTS "imageAlt" TEXT;

-- Pages / Notes prose often arrives with four leading spaces, which CommonMark
-- renders as an indented code block. Preserve text but remove that indentation.
UPDATE "treehole_entries"
SET "content" = regexp_replace("content", '(^|\n)[ \t]{4,}', '\1', 'g')
WHERE "slug" = 'zhen-zheng-de-zhi-cheng';

INSERT INTO "treehole_sections" (
  "id", "slug", "element", "title", "tone", "plannedTitles",
  "moodTags", "leadSentence", "parallelSentence", "readerQuestion",
  "published", "order", "createdAt", "updatedAt"
)
SELECT
  'seed-section-cold-rain', 'cold-rain', 'rain', '冷雨叩窗•心碎•灯火失温',
  '心碎 / 被放下 / 深夜未愈', '被比较
被删除
深夜自我怀疑',
  '心碎 / 被放下 / 深夜未愈',
  '给刚被放下、却还在替对方留灯的人。',
  '窗外的雨有声音，屋里的解释没有；有人转身很快，有人收灯很慢。',
  '你是不是还在等一句其实已经有答案的话？',
  TRUE, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "treehole_sections" WHERE "slug" = 'cold-rain');

UPDATE "treehole_sections" SET
  "element" = 'rain', "title" = '春霖初落•迟疑•微光将醒',
  "tone" = '想改变 / 还没敢 / 正在萌芽',
  "moodTags" = '想改变 / 还没敢 / 正在萌芽',
  "leadSentence" = '给还想再等一等、但心里已经有动静的人。',
  "parallelSentence" = '雨来得很轻，疑心很重；芽还没出土，春天已经开始。',
  "readerQuestion" = '你是不是有点想改变，但先被自己的犹豫按住了？',
  "imageAlt" = '初春雨后的泥土与新草，远处有微弱晨光',
  "order" = 10
WHERE "slug" = 'sprout';

UPDATE "treehole_sections" SET
  "element" = 'sea', "title" = '海雾漫岸•迷航•灯塔失焦',
  "tone" = '迷茫 / 内耗 / 看不清自己',
  "moodTags" = '低压 / 迷茫 / 内耗',
  "leadSentence" = '给站在雾里、连自己都暂时看不清的人。',
  "parallelSentence" = '海在附近，岸也在附近；只有方向暂时不见了。',
  "readerQuestion" = '你是不是不是不想走，而是暂时不知道该往哪里走？',
  "imageAlt" = '海雾覆盖海岸线，远处灯塔在雾中失焦',
  "order" = 20
WHERE "slug" = 'cloudy';

UPDATE "treehole_sections" SET
  "element" = 'light', "title" = '烈日翻山•不甘•影子很短',
  "tone" = '愤怒 / 不甘 / 还有力气',
  "moodTags" = '热烈 / 愤怒 / 不甘',
  "leadSentence" = '给心里还有火、又被现实晒得发烫的人。',
  "parallelSentence" = '光越强，影子越短；话越少，心里越响。',
  "readerQuestion" = '你是不是不甘心被这样安排，所以还想再翻一次山？',
  "imageAlt" = '强日光翻过山脊，山路投下短而硬的影子',
  "order" = 40
WHERE "slug" = 'blazing';

UPDATE "treehole_sections" SET
  "element" = 'snow', "title" = '落雪封径•无声•与己和解',
  "tone" = '安静 / 沉淀 / 和解',
  "moodTags" = '沉默 / 疲惫 / 想先放下',
  "leadSentence" = '给暂时不想说话、只想把事情放下来的人。',
  "parallelSentence" = '雪把路盖住，也把争吵盖住；不是所有和解，都需要当场完成。',
  "readerQuestion" = '你是不是不是好了，只是终于允许自己先停下来？',
  "imageAlt" = '雪覆盖山径，远处山体被雾雪压低',
  "order" = 50
WHERE "slug" = 'snow';

UPDATE "treehole_sections" SET
  "element" = 'wind', "title" = '长风渡海•漂泊•无岸也行',
  "tone" = '漂泊 / 自由 / 想离开',
  "moodTags" = '想逃 / 自由 / 漂泊',
  "leadSentence" = '给想去远方、但被现实拉住衣角的人。',
  "parallelSentence" = '风没有承诺方向，海没有承诺岸；人还是要往前走一段。',
  "readerQuestion" = '你是不是想离开的不是地方，而是现在的自己？',
  "imageAlt" = '长风掠过海岸草甸，远处海面有轻微波光',
  "order" = 60
WHERE "slug" = 'wind';

-- Move existing works into their new emotional weather chapters.
UPDATE "treehole_entries" SET "sectionId" = (
  SELECT "id" FROM "treehole_sections" WHERE "slug" = 'cold-rain'
) WHERE "slug" = 'heartbreak';

UPDATE "treehole_entries" SET "sectionId" = (
  SELECT "id" FROM "treehole_sections" WHERE "slug" = 'snow'
) WHERE "slug" = 'because-this-is-my-life';

UPDATE "treehole_book_configs"
SET "subtitle" = '天气 · 山海 · 光'
WHERE "id" = 'singleton';

UPDATE "treehole_sections" SET "imageUrl" = 'https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443866650-251ac693-treehole-spring-rain.webp' WHERE "slug" = 'sprout';
UPDATE "treehole_sections" SET "imageUrl" = 'https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443893081-a57a6a6a-treehole-sea-fog.webp' WHERE "slug" = 'cloudy';
UPDATE "treehole_sections" SET "imageUrl" = 'https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443920626-9daef434-treehole-cold-rain.webp' WHERE "slug" = 'cold-rain';
UPDATE "treehole_sections" SET "imageUrl" = 'https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793443948060-7f9cc4e5-treehole-blazing-light.webp' WHERE "slug" = 'blazing';
UPDATE "treehole_sections" SET "imageUrl" = 'https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793444278332-ec6f72ca-treehole-silent-snow.webp' WHERE "slug" = 'snow';
UPDATE "treehole_sections" SET "imageUrl" = 'https://blog-zijieleo-oss.oss-cn-guangzhou.aliyuncs.com/uploads/life/1793444288697-98115577-treehole-endless-wind.webp' WHERE "slug" = 'wind';
