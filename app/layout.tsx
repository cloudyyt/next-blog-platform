import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { VisualThemeProvider } from "@/components/providers/visual-theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A modern blog platform built with Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
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

