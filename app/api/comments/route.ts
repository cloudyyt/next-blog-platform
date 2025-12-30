import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// 获取评论列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { message: "缺少 postId 参数" },
        { status: 400 }
      )
    }

    // 获取所有顶级评论（没有 parentId）
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { message: "获取评论失败" },
      { status: 500 }
    )
  }
}

// 创建评论
export async function POST(request: Request) {
  try {
    // 验证登录
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { message: "请先登录" },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: "Token 无效" },
        { status: 401 }
      )
    }

    const { content, postId, parentId } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "评论内容不能为空" },
        { status: 400 }
      )
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { message: "评论内容不能超过2000个字符" },
        { status: 400 }
      )
    }

    if (!postId) {
      return NextResponse.json(
        { message: "缺少 postId 参数" },
        { status: 400 }
      )
    }

    // 验证文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { message: "文章不存在" },
        { status: 404 }
      )
    }

    // 如果 parentId 存在，验证父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment) {
        return NextResponse.json(
          { message: "父评论不存在" },
          { status: 404 }
        )
      }
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: payload.userId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json(
      { message: "发表评论失败，请稍后重试" },
      { status: 500 }
    )
  }
}

