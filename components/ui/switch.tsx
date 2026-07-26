"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Switch 开关（基于原生 button，避免引入 @radix-ui/react-switch）
 * API 与 shadcn/ui 保持一致：
 *   <Switch checked={bool} onCheckedChange={fn} />
 */
export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  "aria-labelledby"?: string
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    { checked, defaultChecked, onCheckedChange, disabled, id, className, ...rest },
    ref
  ) {
    const [internal, setInternal] = React.useState<boolean>(
      defaultChecked ?? false
    )
    const isControlled = checked !== undefined
    const value = isControlled ? checked : internal

    const handleClick = () => {
      if (disabled) return
      const next = !value
      if (!isControlled) setInternal(next)
      onCheckedChange?.(next)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={value}
        id={id}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          value ? "bg-primary" : "bg-input",
          className
        )}
        {...rest}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
            value ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    )
  }
)
