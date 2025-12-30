import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken, validateName, validatePassword } from "@/lib/auth"

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

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { name },
    })

    if (!user) {
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      )
    }

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
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "登录失败，请稍后重试" },
      { status: 500 }
    )
  }
}

