import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/posts - 获取文章列表
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - 创建新文章
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, authorId, categoryIds, tagIds } = body

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        authorId,
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || [],
        },
        tags: {
          connect: tagIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        author: true,
        categories: true,
        tags: true,
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

