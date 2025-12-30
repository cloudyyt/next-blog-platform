"use client"

/**
 * 公共组件使用示例
 * 这个文件展示了如何使用项目中封装的公共组件
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Loading, LoadingScreen, LoadingInline } from "@/components/ui/loading"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "@/lib/toast"

export function UsageExamples() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  // Toast 使用示例
  const handleToastExamples = () => {
    toast.success("操作成功", "这是一条成功消息")
    setTimeout(() => toast.error("操作失败", "这是一条错误消息"), 1000)
    setTimeout(() => toast.info("提示信息", "这是一条信息消息"), 2000)
    setTimeout(() => toast.warning("警告信息", "这是一条警告消息"), 3000)
  }

  // Promise Toast 示例
  const handlePromiseToast = async () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("成功") : reject("失败")
      }, 2000)
    })

    toast.promise(promise, {
      loading: "处理中...",
      success: (data) => `操作成功: ${data}`,
      error: (err) => `操作失败: ${err}`,
    })
  }

  // 确认对话框示例
  const handleConfirm = async () => {
    // 这里执行删除操作
    console.log("确认删除")
    toast.success("删除成功")
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">公共组件使用示例</h1>

      {/* 主题切换 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">主题切换</h2>
        <ThemeToggle />
      </section>

      {/* Toast 示例 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Toast 通知</h2>
        <div className="flex gap-2">
          <Button onClick={handleToastExamples}>显示各种 Toast</Button>
          <Button onClick={handlePromiseToast} variant="outline">
            Promise Toast
          </Button>
        </div>
      </section>

      {/* Loading 示例 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Loading 加载</h2>
        <div className="flex gap-4 items-center">
          <Loading size="sm" text="小号加载" />
          <Loading size="md" text="中号加载" />
          <Loading size="lg" text="大号加载" />
          <LoadingInline text="内联加载" />
        </div>
        <Button onClick={() => setShowLoading(!showLoading)}>
          {showLoading ? "隐藏" : "显示"}全屏加载
        </Button>
        {showLoading && <LoadingScreen text="正在加载..." />}
      </section>

      {/* 确认对话框示例 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">确认对话框</h2>
        <Button onClick={() => setShowConfirm(true)} variant="destructive">
          删除操作
        </Button>
        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="确认删除"
          description="此操作不可撤销，确定要删除吗？"
          confirmText="删除"
          cancelText="取消"
          variant="destructive"
          onConfirm={handleConfirm}
        />
      </section>
    </div>
  )
}

