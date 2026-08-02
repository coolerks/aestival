import { useEffect, useId, useRef, useState } from "react"
import {
  CheckIcon,
  ClipboardIcon,
  DownloadIcon,
  Maximize2Icon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  Loader2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { IconButton } from "@/components/shell/icon-button"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type MermaidBlockProps = {
  source: string
  streaming?: boolean
  className?: string
}

type MermaidExportFormat = "svg" | "png"

const allowedSvgAttributes = new Set([
  "aria-label",
  "class",
  "clip-path",
  "clip-rule",
  "color",
  "dominant-baseline",
  "fill",
  "fill-opacity",
  "fill-rule",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "height",
  "id",
  "marker-end",
  "marker-height",
  "marker-start",
  "marker-width",
  "opacity",
  "points",
  "preserveAspectRatio",
  "r",
  "rx",
  "ry",
  "stroke",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "style",
  "text-anchor",
  "transform",
  "viewBox",
  "width",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
])

const forbiddenSvgTags = new Set([
  "foreignObject",
  "iframe",
  "object",
  "script",
])

function sanitizeMermaidSvg(svg: string) {
  if (typeof DOMParser === "undefined") return null
  const document = new DOMParser().parseFromString(svg, "image/svg+xml")
  const root = document.documentElement
  if (root.tagName.toLowerCase() !== "svg") return null

  const elements = [root, ...Array.from(root.querySelectorAll("*"))]
  for (const element of elements) {
    if (forbiddenSvgTags.has(element.tagName)) {
      element.remove()
      continue
    }

    if (element.tagName.toLowerCase() === "style") {
      const css = element.textContent ?? ""
      if (/(?:@import|javascript:|data:|https?:|expression\()/i.test(css)) {
        element.remove()
      }
      continue
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name
      const value = attribute.value
      const lowerName = name.toLowerCase()
      const unsafeValue =
        /(?:javascript:|data:|https?:|@import|expression\()/i.test(value) ||
        (/url\(/i.test(value) && !/url\(#[\w:.-]+\)/i.test(value))

      if (
        lowerName.startsWith("on") ||
        !allowedSvgAttributes.has(name) ||
        unsafeValue
      ) {
        element.removeAttribute(name)
      }
    }
  }

  return new XMLSerializer().serializeToString(root)
}

async function copyText(source: string) {
  if (!navigator.clipboard) {
    toast.error("当前环境不支持剪贴板")
    return
  }

  await navigator.clipboard.writeText(source)
  toast.success("已复制 Mermaid 源码")
}

export function MermaidBlock({
  source,
  streaming = false,
  className,
}: MermaidBlockProps) {
  const rawId = useId()
  const renderIdRef = useRef(0)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [exporting, setExporting] = useState<MermaidExportFormat | null>(null)

  useEffect(() => {
    let cancelled = false
    if (streaming || !source.trim()) {
      setRendering(false)
      setError(null)
      return () => {
        cancelled = true
      }
    }

    setSvg(null)
    setRendering(true)
    setError(null)
    const timer = window.setTimeout(() => {
      const renderId = `aestival-mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}-${renderIdRef.current++}`
      void import("mermaid")
        .then(async ({ default: mermaid }) => {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            suppressErrorRendering: true,
            htmlLabels: false,
          })
          const result = await mermaid.render(renderId, source)
          const sanitized = sanitizeMermaidSvg(result.svg)
          if (!sanitized) throw new Error("SVG 清洗后为空")
          if (!cancelled) setSvg(sanitized)
        })
        .catch((reason: unknown) => {
          if (!cancelled) {
            setError(
              reason instanceof Error ? reason.message : "Mermaid 语法解析失败"
            )
          }
        })
        .finally(() => {
          if (!cancelled) setRendering(false)
        })
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [rawId, source, streaming])

  const handleExport = (format: MermaidExportFormat) => {
    setExporting(format)
    window.setTimeout(() => {
      setExporting(null)
      toast.success(`已生成 ${format.toUpperCase()} 导出 Mock`, {
        description: "当前只展示前端反馈，不会写入磁盘。",
      })
    }, 450)
  }

  const preview = svg ? (
    <div className="relative min-h-52 overflow-auto bg-background p-4">
      <div
        className="flex min-h-44 min-w-full items-center justify-center transition-transform"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center top" }}
        // Mermaid SVG is rendered only after the explicit SVG allowlist pass above.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  ) : (
    <div className="flex min-h-52 items-center justify-center px-6 text-sm text-muted-foreground">
      {streaming ? "图表代码尚未闭合，等待继续生成…" : "暂无可用预览"}
    </div>
  )

  return (
    <section
      className={cn("my-4 overflow-hidden rounded-lg border", className)}
      aria-label="Mermaid 图表"
    >
      <header className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span>Mermaid</span>
          {rendering || streaming ? (
            <span className="flex items-center gap-1 text-muted-foreground" aria-live="polite">
              <Loader2Icon className="animate-spin" aria-hidden="true" />
              生成中
            </span>
          ) : null}
          {error ? <span className="text-destructive">预览失败</span> : null}
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton label="复制 Mermaid 源码" size="icon-xs" onClick={() => void copyText(source)}>
            <ClipboardIcon />
          </IconButton>
          <IconButton
            label="导出 SVG（Mock）"
            size="icon-xs"
            disabled={Boolean(exporting)}
            onClick={() => handleExport("svg")}
          >
            {exporting === "svg" ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
          </IconButton>
          <IconButton
            label="导出 PNG（Mock）"
            size="icon-xs"
            disabled={Boolean(exporting)}
            onClick={() => handleExport("png")}
          >
            {exporting === "png" ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
          </IconButton>
        </div>
      </header>

      <Tabs defaultValue="preview" className="gap-0">
        <div className="flex items-center justify-between border-b bg-muted/20 px-3">
          <TabsList className="h-8 rounded-none bg-transparent p-0" variant="line">
            <TabsTrigger value="preview" className="h-8 px-2 text-xs">
              预览
            </TabsTrigger>
            <TabsTrigger value="source" className="h-8 px-2 text-xs">
              源码
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-0.5">
            <IconButton label="缩小图表" size="icon-xs" onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))}>
              <MinusIcon />
            </IconButton>
            <Button
              variant="ghost"
              size="xs"
              className="min-w-12 font-mono text-xs"
              onClick={() => setZoom(1)}
              aria-label="适应图表窗口"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <IconButton label="放大图表" size="icon-xs" onClick={() => setZoom((value) => Math.min(2, value + 0.1))}>
              <PlusIcon />
            </IconButton>
            <IconButton label="适应图表窗口" size="icon-xs" onClick={() => setZoom(1)}>
              <Maximize2Icon />
            </IconButton>
            <IconButton label="重置图表缩放" size="icon-xs" onClick={() => setZoom(1)}>
              <RotateCcwIcon />
            </IconButton>
          </div>
        </div>
        <TabsContent value="preview" className="m-0">
          {preview}
          {error ? (
            <div className="border-t px-4 py-2 text-xs text-destructive" role="alert">
              {error}，请切换到“源码”检查图表定义。
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="source" className="m-0">
          <pre className="app-selectable-content max-h-80 overflow-auto bg-muted/20 p-4 font-mono text-xs leading-6">
            <code>{source}</code>
          </pre>
          <div className="flex items-center gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
            {svg && !error ? <CheckIcon aria-hidden="true" /> : null}
            {streaming ? "源码正在流式生成" : error ? "保留源码以便修复" : "源码可复制或继续编辑"}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
