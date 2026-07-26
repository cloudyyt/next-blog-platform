/**
 * OSS 联调测试文件清理脚本
 *
 * 用途：test-oss.ts 会往 uploads/test/ 上传测试图，跑通后用这个脚本清掉。
 *   只删 uploads/test/ 前缀下的文件，绝对不会动其他目录（业务数据安全）。
 *
 * 用法：pnpm tsx scripts/cleanup-oss-test.ts
 */

import OSS from "ali-oss";
import { config as loadEnv } from "dotenv";

loadEnv();

const REGION = process.env.OSS_REGION;
const BUCKET = process.env.OSS_BUCKET;
const ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID;
const ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET;

if (!REGION || !BUCKET || !ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
  console.error("❌ 缺少 OSS_* 环境变量，检查 .env");
  process.exit(1);
}

const client = new OSS({
  region: REGION!,
  accessKeyId: ACCESS_KEY_ID!,
  accessKeySecret: ACCESS_KEY_SECRET!,
  bucket: BUCKET!,
  secure: true,
});

const TEST_PREFIX = "uploads/test/";

async function main() {
  console.log(`\n🧹 清理 ${TEST_PREFIX} 下的测试文件 ...\n`);

  let marker: string | undefined;
  let deleted = 0;

  do {
    const list = await client.list(
      { prefix: TEST_PREFIX, "max-keys": 100, marker },
      {}
    );
    const objects = list.objects || [];

    for (const obj of objects) {
      try {
        await client.delete(obj.name);
        console.log(`   🗑  已删除 ${obj.name}`);
        deleted++;
      } catch (err: any) {
        console.error(`   ⚠️  删除失败 ${obj.name}: ${err.message}`);
      }
    }

    marker = list.isTruncated ? (list.nextMarker as string) : undefined;
  } while (marker);

  console.log(`\n✅ 清理完成，共删除 ${deleted} 个测试文件。\n`);
}

main().catch((err) => {
  console.error("\n💥 脚本异常：", err);
  process.exit(1);
});
