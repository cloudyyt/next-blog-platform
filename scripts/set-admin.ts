import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setAdmin(username?: string) {
  try {
    // 从命令行参数获取用户名，如果没有提供则使用环境变量
    const name = username || process.env.ADMIN_USERNAME

    if (!name) {
      console.error("❌ 请提供用户名")
      console.log("用法: npm run set-admin <用户名>")
      console.log("或设置环境变量: ADMIN_USERNAME=<用户名> npm run set-admin")
      process.exit(1)
    }

    const user = await prisma.user.update({
      where: { name },
      data: { role: "admin" },
    })
    console.log(`✅ 用户 ${user.name} 已设置为管理员`)
  } catch (error: any) {
    if (error.code === "P2025") {
      console.error("❌ 用户不存在，请先注册该用户")
    } else {
      console.error("❌ 更新失败:", error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// 从命令行参数获取用户名
const username = process.argv[2]
setAdmin(username)

