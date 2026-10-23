import { NextRequest, NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/auth-middleware"
import { getTreeholeAdminData, getTreeholeAdminEntry } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/treehole/studio?entryId=xxx
 * 树洞写作间的初始数据。路由页面本身不预载私密内容，
 * 客户端确认管理员身份后再调用此接口。
 */
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const entryId = new URL(request.url).searchParams.get("entryId")
    const [data, entry] = await Promise.all([
      getTreeholeAdminData(),
      entryId ? getTreeholeAdminEntry(entryId) : Promise.resolve(null),
    ])

    if (entryId && !entry) {
      return NextResponse.json({ message: "内容不存在" }, { status: 404 })
    }

    return NextResponse.json({ ...data, entry })
  } catch (error) {
    console.error("Fetch treehole studio data error:", error)
    return NextResponse.json({ message: "读取写作间数据失败" }, { status: 500 })
  }
}
