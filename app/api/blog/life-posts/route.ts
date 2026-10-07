import { NextResponse } from "next/server"

/**
 * 旧树洞时间线公开接口已下线。
 * 新树洞是电子书页面，内容由服务端渲染，不再暴露时间线分页 API。
 */
export async function GET() {
  return NextResponse.json(
    { message: "树洞时间线已下线，请访问 /treehole 阅读电子书。" },
    { status: 410 },
  )
}
