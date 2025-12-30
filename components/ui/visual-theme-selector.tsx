"use client"

import * as React from "react"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"
import { visualThemes, type VisualTheme } from "@/lib/themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"

export function VisualThemeSelector() {
  // 安全地获取 Context，如果不存在则返回 null
  const context = React.useContext(VisualThemeContext)
  
  if (!context) {
    return null
  }
  
  const { theme, setTheme } = context

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">选择视觉主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(visualThemes) as VisualTheme[]).map((themeId) => {
          const themeConfig = visualThemes[themeId]
          return (
            <DropdownMenuItem
              key={themeId}
              onClick={() => setTheme(themeId)}
              className={cn(
                "cursor-pointer",
                theme === themeId && "bg-accent"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{themeConfig.name}</span>
                <span className="text-xs text-muted-foreground">
                  {themeConfig.description}
                </span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


