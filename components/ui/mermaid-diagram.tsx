"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Minus, Plus, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/* Mermaid */
export function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId()
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const lastThemeRef = useRef<"dark" | "default" | null>(null)
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const fitZoomRef = useRef(1)
  const viewportRef = useRef<HTMLDivElement>(null)

  const normalizedChart = useMemo(() => chart.trim(), [chart])

  // Mermaid 对 edge label（|...|）里的部分符号比较敏感。
  // 这里仅对 label 内容做轻量预处理，避免影响节点形状语法（例如 DB[(...)]）。
  const preprocessedChart = useMemo(() => {
    if (!normalizedChart) return ""
    return normalizedChart.replace(/\|([^|]*)\|/g, (_m, label: string) => {
      const safe = label
        .replace(/\(/g, "（")
        .replace(/\)/g, "）")
      return `|${safe}|`
    })
  }, [normalizedChart])

  const zoomIn = () => setZoom((z) => Math.min(6, Math.round((z + 0.1) * 10) / 10))
  const zoomOut = () => setZoom((z) => Math.max(0.2, Math.round((z - 0.1) * 10) / 10))
  const zoomReset = () => setZoom(fitZoomRef.current || 1)

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      setError("")

      if (!preprocessedChart) {
        setSvg("")
        return
      }

      try {
        const isDark = document.documentElement.classList.contains("dark")
        const theme: "dark" | "default" = isDark ? "dark" : "default"

        const imported = await import("mermaid")
        const mermaid = (imported as any).default ?? imported

        // Mermaid initialize should be stable; only re-init when theme changes
        if (lastThemeRef.current !== theme) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme,
          })
          lastThemeRef.current = theme
        }

        // Fail fast on syntax errors with a clearer message
        await mermaid.parse(preprocessedChart)

        const renderId = `mmd-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
        const { svg } = await mermaid.render(renderId, preprocessedChart)
        if (!cancelled) setSvg(svg)
      } catch (e: any) {
        if (!cancelled) {
          setSvg("")
          setError(e?.message || String(e) || "Mermaid 渲染失败")
        }
      }
    }

    render()

    return () => {
      cancelled = true
    }
  }, [id, normalizedChart])

  // When dialog opens (and svg is ready), compute a "fit to viewport" zoom so the diagram
  // is readable by default instead of tiny in the corner.
  useEffect(() => {
    if (!open) return
    if (!svg) return

    const viewport = viewportRef.current
    if (!viewport) return

    const computeFit = () => {
      const svgEl = viewport.querySelector("svg")
      if (!svgEl) return

      const box = svgEl.viewBox?.baseVal
      const svgWidth = box?.width || svgEl.getBBox().width || svgEl.clientWidth
      const svgHeight = box?.height || svgEl.getBBox().height || svgEl.clientHeight
      if (!svgWidth || !svgHeight) return

      const padding = 24
      const vw = Math.max(1, viewport.clientWidth - padding)
      const vh = Math.max(1, viewport.clientHeight - padding)
      const fit = Math.min(vw / svgWidth, vh / svgHeight)

      // Keep within a sensible range; user can still zoom further.
      const clamped = Math.max(0.2, Math.min(6, Math.round(fit * 100) / 100))
      fitZoomRef.current = clamped
      setZoom(clamped)
    }

    computeFit()

    const ro = new ResizeObserver(() => computeFit())
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [open, svg])

  if (error) {
    return (
      <div className="my-4 rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="font-medium text-destructive">流程图渲染失败</div>
        <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words">
          {error}
        </div>
        <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">
          {normalizedChart}
        </pre>
      </div>
    )
  }

  if (!svg) return null

  return (
    <>
      <div className="my-4 rounded-lg border bg-background">
        <button
          type="button"
          onClick={() => {
            setOpen(true)
          }}
          className="block w-full overflow-x-auto p-2 text-left"
          title="点击放大查看"
        >
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 h-[90vh]">
          <DialogHeader className="flex-row items-center justify-between gap-3">
            <DialogTitle>流程图</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 0.2}
                title="缩小"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-16 text-center text-sm tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 6}
                title="放大"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={zoomReset}
                title="重置"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="sm" title="关闭">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div ref={viewportRef} className="h-[calc(90vh-56px)] overflow-auto p-4">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} className="inline-block">
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

