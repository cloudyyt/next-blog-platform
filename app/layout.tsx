/**
 * App Router 根布局（必须存在）
 * B 方向「有机/自然」：标题 Fraunces，正文 Nunito
 */
import type { Metadata } from "next"
import { Fraunces, Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { VisualThemeProvider } from "@/components/providers/visual-theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A modern blog platform built with Next.js",
  icons: {
    icon: [
      { url: "/icon", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VisualThemeProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </VisualThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

