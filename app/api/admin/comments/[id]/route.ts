import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// DELETE /api/admin/comments/[id] - 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    // Prisma的级联删除会自动删除所有回复
    await prisma.comment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "评论不存在" }, { status: 404 })
    }
    console.error("Delete comment error:", error)
    return NextResponse.json({ message: "删除评论失败" }, { status: 500 })
  }
}

