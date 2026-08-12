import { useEffect, useRef, useState } from "react"
import { CircleAlertIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { NoteEditorMode } from "@/types/project-workspace"

type VditorInstance = import("vditor").default
type VditorConstructor = typeof import("vditor").default

function vditorAssetRoot() {
  if (import.meta.env.DEV) return `${window.location.origin}/__vditor`
  return new URL("./vditor", document.baseURI).href.replace(/\/$/, "")
}

export function VditorSurface({
  noteId,
  markdown,
  mode,
  onChange,
}: {
  noteId: string
  markdown: string
  mode: NoteEditorMode
  onChange: (markdown: string) => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<VditorInstance | null>(null)
  const constructorRef = useRef<VditorConstructor | null>(null)
  const latestMarkdown = useRef(markdown)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    latestMarkdown.current = markdown
    const editor = editorRef.current
    if (editor && editor.getValue() !== markdown) editor.setValue(markdown, false)
    if (mode === "preview" && hostRef.current && constructorRef.current) {
      void constructorRef.current.preview(hostRef.current, markdown, {
        cdn: vditorAssetRoot(),
        mode: resolvedTheme === "dark" ? "dark" : "light",
        theme: { current: resolvedTheme === "dark" ? "dark" : "light" },
      })
    }
  }, [markdown, mode, resolvedTheme])

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return
    editorRef.current?.destroy()
    editorRef.current = null
    host.replaceChildren()
    setStatus("loading")

    void Promise.all([import("vditor"), import("vditor/dist/index.css")])
      .then(async ([module]) => {
        if (cancelled || !host.isConnected) return
        const Vditor = module.default
        constructorRef.current = Vditor
        if (mode === "preview") {
          host.className = "vditor-reset app-selectable-content size-full overflow-auto px-8 py-6"
          await Vditor.preview(host, latestMarkdown.current, {
            cdn: vditorAssetRoot(),
            mode: resolvedTheme === "dark" ? "dark" : "light",
            theme: { current: resolvedTheme === "dark" ? "dark" : "light" },
          })
          if (!cancelled) setStatus("ready")
          return
        }

        host.className = "size-full"
        const editor = new Vditor(host, {
          cdn: vditorAssetRoot(),
          cache: { enable: false },
          lang: "zh_CN",
          mode: mode === "instant" ? "ir" : "sv",
          preview: {
            mode: mode === "split" ? "both" : "editor",
            theme: { current: resolvedTheme === "dark" ? "dark" : "light" },
          },
          theme: resolvedTheme === "dark" ? "dark" : "classic",
          icon: "material",
          height: "100%",
          minHeight: 240,
          width: "100%",
          value: latestMarkdown.current,
          placeholder: "开始记录…",
          toolbar: [
            "headings",
            "bold",
            "italic",
            "strike",
            "link",
            "|",
            "list",
            "ordered-list",
            "check",
            "code",
            "inline-code",
            "table",
            "|",
            "undo",
            "redo",
          ],
          input(value) {
            latestMarkdown.current = value
            onChange(value)
          },
          after() {
            if (!cancelled) setStatus("ready")
          },
        })
        editorRef.current = editor
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => {
      cancelled = true
      editorRef.current?.destroy()
      editorRef.current = null
      host.replaceChildren()
    }
  }, [mode, noteId, onChange, resolvedTheme])

  return (
    <div className="relative size-full min-h-0 bg-background">
      <div ref={hostRef} className="size-full" />
      {status === "loading" ? (
        <div className="absolute inset-0 flex flex-col gap-3 bg-background p-6" aria-label="正在加载 Markdown 编辑器">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : null}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlertIcon />
            <AlertTitle>Markdown 编辑器加载失败</AlertTitle>
            <AlertDescription>
              Vditor 本地资源未能加载。现有 Markdown Buffer 保持不变，可切换页签后重试。
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
    </div>
  )
}
