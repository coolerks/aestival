import { useEffect, useState } from "react"
import type { ComponentProps, CSSProperties, ReactNode } from "react"
import {
  ClipboardIcon,
  DownloadIcon,
  FilePlus2Icon,
  Loader2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { IconButton } from "@/components/shell/icon-button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CodeToken = {
  content: string
  color?: string
  fontStyle?: number
}

type HighlightedLine = CodeToken[]

type CodeBlockProps = {
  source: string
  language?: string
  streaming?: boolean
  className?: string
}

const languageAliases: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  jsx: "jsx",
  ts: "typescript",
  typescript: "typescript",
  tsx: "tsx",
  html: "html",
  xml: "html",
  css: "css",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  python: "python",
  py: "python",
  go: "go",
  rust: "rust",
  rs: "rust",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  markdown: "markdown",
  md: "markdown",
  json: "json",
  text: "text",
  txt: "text",
}

function normalizeLanguage(language: string | undefined) {
  const normalized = language?.trim().toLowerCase() ?? "text"
  return languageAliases[normalized] ?? null
}

function displayLanguage(language: string | undefined) {
  return language?.trim() || "text"
}

async function copyText(source: string) {
  if (!navigator.clipboard) {
    toast.error("当前环境不支持剪贴板")
    return
  }

  await navigator.clipboard.writeText(source)
  toast.success("已复制代码")
}

function mockFileAction(action: string) {
  toast.info(`${action}为前端 Mock`, {
    description: "当前不会写入磁盘或创建真实应用文件。",
  })
}

function getTokenStyle(token: CodeToken): CSSProperties {
  const style: CSSProperties = {}
  if (token.color) style.color = token.color
  if (token.fontStyle && token.fontStyle & 1) style.fontStyle = "italic"
  if (token.fontStyle && token.fontStyle & 2) style.fontWeight = 700
  if (token.fontStyle && token.fontStyle & 4) style.textDecoration = "underline"
  return style
}

function TokenizedCode({ lines }: { lines: HighlightedLine[] }) {
  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={`line-${lineIndex}`} className="block min-h-[1.5em]">
          {line.map((token, tokenIndex) => (
            <span
              key={`token-${lineIndex}-${tokenIndex}`}
              style={getTokenStyle(token)}
            >
              {token.content}
            </span>
          ))}
        </span>
      ))}
    </>
  )
}

function CodeActionButton({
  label,
  children,
  ...props
}: ComponentProps<typeof Button> & { label: string; children: ReactNode }) {
  return (
    <IconButton label={label} size="icon-xs" {...props}>
      {children}
    </IconButton>
  )
}

export function CodeBlock({
  source,
  language,
  streaming = false,
  className,
}: CodeBlockProps) {
  const [lines, setLines] = useState<HighlightedLine[] | null>(null)
  const [highlighting, setHighlighting] = useState(false)
  const normalizedLanguage = normalizeLanguage(language)
  const canAddToApp = ["html", "css", "javascript"].includes(
    normalizedLanguage ?? ""
  )

  useEffect(() => {
    let cancelled = false

    if (streaming || !normalizedLanguage) {
      setLines(null)
      setHighlighting(false)
      return () => {
        cancelled = true
      }
    }

    setHighlighting(true)
    setLines(null)
    void import("shiki")
      .then(async ({ codeToTokens }) => {
        const result = await codeToTokens(source, {
          lang: normalizedLanguage as import("shiki").BundledLanguage,
          theme: "github-light",
        })
        if (!cancelled) {
          setLines(
            result.tokens.map((line) =>
              line.map((token) => ({
                content: token.content,
                color: token.color,
                fontStyle: token.fontStyle,
              }))
            )
          )
        }
      })
      .catch(() => {
        if (!cancelled) setLines(null)
      })
      .finally(() => {
        if (!cancelled) setHighlighting(false)
      })

    return () => {
      cancelled = true
    }
  }, [normalizedLanguage, source, streaming])

  return (
    <section
      className={cn(
        "my-4 overflow-hidden rounded-lg border bg-muted/30",
        className
      )}
      aria-label={`${displayLanguage(language)} 代码块`}
    >
      <header className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {displayLanguage(language)}
          {streaming ? " · 生成中" : null}
        </span>
        <div className="flex items-center gap-0.5">
          {highlighting ? (
            <Loader2Icon className="animate-spin text-muted-foreground" aria-label="正在高亮代码" />
          ) : null}
          <CodeActionButton
            label="复制代码"
            onClick={() => void copyText(source)}
          >
            <ClipboardIcon />
          </CodeActionButton>
          <CodeActionButton
            label="保存为文件（Mock）"
            onClick={() => mockFileAction("保存为文件")}
          >
            <DownloadIcon />
          </CodeActionButton>
          {canAddToApp ? (
            <CodeActionButton
              label="添加到应用（Mock）"
              onClick={() => mockFileAction("添加到应用")}
            >
              <FilePlus2Icon />
            </CodeActionButton>
          ) : null}
        </div>
      </header>
      <pre className="app-selectable-content max-h-[28rem] overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
        <code>{lines ? <TokenizedCode lines={lines} /> : source}</code>
      </pre>
      {streaming ? (
        <footer className="flex items-center gap-2 border-t px-3 py-1.5 text-xs text-muted-foreground">
          <Loader2Icon className="animate-spin" aria-hidden="true" />
          流式内容尚未闭合，暂以纯文本显示
        </footer>
      ) : null}
    </section>
  )
}
