/**
 * OSS 接入联调验证脚本
 *
 * 用途：在写业务代码前，验证 RAM 子账号 AccessKey + Bucket 配置是否正确。
 * 跑通 = OSS 配置全部完成，可以开始写 ImageUploader / upload API 等业务代码。
 *
 * 用法：
 *   1. 确保 .env 已配置 OSS_REGION / OSS_BUCKET / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET
 *   2. pnpm tsx scripts/test-oss.ts
 *
 * 脚本会做 4 件事：
 *   ① 上传一张 1x1 测试图（webp）到 uploads/test/
 *   ② 返回公网 URL
 *   ③ 用 HEAD 请求验证 URL 真能访问（200）
 *   ④ 可选：清理测试文件（默认保留，方便你浏览器打开看效果）
 *
 * 这个脚本是一次性的联调工具，OSS 接入稳定后可删。
 */

import OSS from "ali-oss";
import { config as loadEnv } from "dotenv";

// 手动加载 .env（脚本不在 Next.js 运行时内，不会自动加载）
loadEnv();

// ─── 1. 读取并校验环境变量 ───────────────────────────────────────────
const REGION = process.env.OSS_REGION;
const BUCKET = process.env.OSS_BUCKET;
const ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID;
const ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET;

const missing: string[] = [];
if (!REGION) missing.push("OSS_REGION");
if (!BUCKET) missing.push("OSS_BUCKET");
if (!ACCESS_KEY_ID) missing.push("OSS_ACCESS_KEY_ID");
if (!ACCESS_KEY_SECRET) missing.push("OSS_ACCESS_KEY_SECRET");

if (missing.length > 0) {
  console.error("\n❌ 缺少环境变量：" + missing.join(", "));
  console.error("   请在项目根目录 .env 文件中配置以下 4 个变量：");
  console.error("   OSS_REGION=oss-cn-guangzhou");
  console.error("   OSS_BUCKET=blog-zijieleo-oss");
  console.error("   OSS_ACCESS_KEY_ID=你的AccessKeyId");
  console.error("   OSS_ACCESS_KEY_SECRET=你的AccessKeySecret");
  process.exit(1);
}

console.log("\n📋 配置信息：");
console.log(`   Region:   ${REGION}`);
console.log(`   Bucket:   ${BUCKET}`);
console.log(`   AccessKeyId: ${ACCESS_KEY_ID!.slice(0, 8)}${"*".repeat(12)}（已脱敏）`);
console.log("");

// ─── 2. 初始化 OSS 客户端 ────────────────────────────────────────────
// ⚠️ 生产环境关键差异（写业务代码时务必注意）：
//   - 本地开发 / 本脚本：用公网 endpoint（region 自动推导为 oss-cn-guangzhou.aliyuncs.com）
//   - ECS 服务器上传：    必须用内网 endpoint（oss-cn-guangzhou-internal.aliyuncs.com），
//                          走内网免流量费、速度快几十倍。
//   业务代码建议在 lib/storage/oss.ts 里根据 env（如 OSS_INTERNAL=true）切换 endpoint。
const client = new OSS({
  region: REGION!,
  accessKeyId: ACCESS_KEY_ID!,
  accessKeySecret: ACCESS_KEY_SECRET!,
  bucket: BUCKET!,
  secure: true, // 强制 HTTPS
});

// ─── 3. 构造一张 1x1 透明 webp 测试图 ─────────────────────────────────
// 这是一个最小的合法 webp 文件（1x1 透明像素），无需依赖 sharp 生成
const WEBP_1x1_TRANSPARENT = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00,
  0x00, 0x00,
]);

// ─── 4. 主流程 ────────────────────────────────────────────────────────
async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const objectKey = `uploads/test/test-${timestamp}.webp`;
  const publicUrl = `https://${BUCKET}.${REGION}.aliyuncs.com/${objectKey}`;

  // ── 4.1 上传 ──
  console.log(`⬆️  正在上传测试图到 ${objectKey} ...`);
  try {
    const result = await client.put(objectKey, WEBP_1x1_TRANSPARENT, {
      mime: "image/webp",
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
    console.log(`✅ 上传成功`);
    console.log(`   返回的 URL: ${result.url}`);
  } catch (err: any) {
    console.error("\n❌ 上传失败！");
    diagnoseError(err);
    process.exit(1);
  }

  // ── 4.2 验证公网可访问（HEAD 请求，不下载正文）──
  console.log(`\n🔍 验证公网访问 ${publicUrl} ...`);
  try {
    const res = await fetch(publicUrl, { method: "HEAD" });
    if (res.ok) {
      console.log(`✅ 访问成功：HTTP ${res.status}`);
      console.log(`   Content-Type:   ${res.headers.get("content-type")}`);
      console.log(`   Content-Length: ${res.headers.get("content-length")} bytes`);
    } else {
      console.error(`❌ 访问异常：HTTP ${res.status} ${res.statusText}`);
      if (res.status === 403) {
        console.error("   → Bucket 可能不是「公共读」，去 OSS 控制台改读写权限");
      }
      if (res.status === 404) {
        console.error("   → 文件未找到，可能上传其实没成功");
      }
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`❌ 网络请求失败：${err.message}`);
    process.exit(1);
  }

  // ── 4.3 列出 Bucket 里的测试文件（验证 ListObjects 权限）──
  console.log(`\n📂 验证 ListObjects 权限 ...`);
  try {
    const list = await client.list({ prefix: "uploads/test/", "max-keys": 10 }, {});
    const objects = list.objects || [];
    console.log(`✅ 列举成功，uploads/test/ 下当前有 ${objects.length} 个文件`);
  } catch (err: any) {
    console.error(`⚠️  ListObjects 失败（不影响上传，但 admin 列图功能会受限）`);
    diagnoseError(err);
  }

  // ── 4.4 总结 ──
  console.log("\n─────────────────────────────────────────────────");
  console.log("🎉 OSS 配置全部正确！");
  console.log("");
  console.log("   你可以在浏览器打开下面这个链接，应该看到一张 1x1 透明小图：");
  console.log(`   ${publicUrl}`);
  console.log("");
  console.log("   ✅ 配置环节全部完成，可以开始写业务代码了：");
  console.log("      - POST /api/admin/upload（sharp 处理 + 上传）");
  console.log("      - <ImageUploader> 组件");
  console.log("      - User.avatar 字段 + 作者信息迁 DB");
  console.log("      - 接入头像 / 博客封面 / Agent 指南封面");
  console.log("─────────────────────────────────────────────────\n");
}

// ─── 5. 错误诊断 ──────────────────────────────────────────────────────
function diagnoseError(err: any) {
  const code = err.code || err.status;
  const msg = err.message || String(err);
  console.error(`   错误码: ${code || "(无)"}`);
  console.error(`   错误信息: ${msg}`);

  switch (code) {
    case "InvalidAccessKeyId":
      console.error("   → AccessKeyId 错误或拼写有误，检查 .env 里的 OSS_ACCESS_KEY_ID");
      break;
    case "SignatureDoesNotMatch":
      console.error("   → AccessKeySecret 错误（签名不匹配），检查 OSS_ACCESS_KEY_SECRET");
      console.error("     常见原因：复制 Secret 时多了空格/换行，或大小写错误");
      break;
    case "AccessDenied":
    case "Forbidden":
      console.error("   → 权限不足。检查：");
      console.error("     1. RAM 子账号是否授权了自定义策略");
      console.error("     2. 策略 Resource 是否写成了你的 Bucket 名（blog-zijieleo-oss）");
      console.error("     3. 策略是否包含了对应 Action（PutObject / GetObject / ListObjects）");
      break;
    case "NoSuchBucket":
      console.error(`   → Bucket 「${BUCKET}」不存在，检查 OSS_BUCKET 拼写`);
      break;
    default:
      if (/getaddrinfo|ENOTFOUND|network/i.test(msg)) {
        console.error("   → 网络问题，检查地区/Endpoint 拼写，或本地网络");
      }
  }
  console.error("");
}

main().catch((err) => {
  console.error("\n💥 脚本异常退出：", err);
  process.exit(1);
});
