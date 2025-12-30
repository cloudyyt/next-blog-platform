import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateToken, validateName, validatePassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json()

    // 验证输入
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { message: nameValidation.error },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.error },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { name },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "该昵称已被使用" },
        { status: 409 }
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        role: "user",
      },
    })

    // 生成 Token
    const token = generateToken({
      userId: user.id,
      name: user.name,
      role: user.role,
    })

    // 返回用户信息（不包含密码）
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { message: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}

