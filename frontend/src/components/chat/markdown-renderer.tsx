import * as React from "react"
import { Component, type ReactNode } from "react"
import Markdown, { type Components } from "react-markdown"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"

import { CodeBlock } from "@/components/chat/code-block"
import { MermaidBlock } from "@/components/chat/mermaid-block"
import { cn } from "@/lib/utils"

type MarkdownRendererProps = {
  source: string
  streaming?: boolean
  className?: string
}

type Fence = {
  prefix: string
  language: string
  source: string
}

type CodeElementProps = {
  className?: string
  children?: ReactNode
}

const allowedTags = (defaultSchema.tagNames ?? []).filter(
  (tagName) =>
    ![
      "img",
      "input",
      "picture",
      "source",
      "audio",
      "video",
      "iframe",
      "object",
      "embed",
      "script",
      "style",
      "link",
      "form",
      "button",
    ].includes(tagName)
)

const markdownSchema = {
  ...defaultSchema,
  tagNames: allowedTags,
  attributes: {
    ...defaultSchema.attributes,
    a: ["ariaLabel", "ariaDescribedBy", "ariaLabelledBy", "href", "title"],
    code: [["className", /^language-[\w-]+$/]],
    div: ["className"],
    span: ["className", "ariaLabel"],
    table: ["ariaLabel", "title"],
    td: ["colSpan", "rowSpan", "align"],
    th: ["colSpan", "rowSpan", "align", "scope"],
    ol: ["className", "start"],
    ul: ["className"],
    li: ["className"],
    details: ["open"],
    summary: ["ariaLabel", "title"],
    "*": ["ariaHidden", "ariaLabel", "title"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: [],
  },
  strip: ["script", "style", "iframe", "object", "embed", "link"],
}

function safeUrlTransform(url: string): string | undefined {
  const trimmed = url.trim()
  if (!trimmed) return ""

  if (/^(?:https?:|mailto:)/i.test(trimmed)) return trimmed
  if (/^(?:javascript:|data:|vbscript:|file:)/i.test(trimmed)) return undefined
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed)) return undefined
  return trimmed
}

function textFromNode(node: ReactNode): string {
  return React.Children.toArray(node)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
    .join("")
}

function findUnclosedFence(source: string, streaming: boolean): Fence | null {
  if (!streaming) return null

  const lines = source.split("\n")
  let openingLine = -1
  let language = "text"

  lines.forEach((line, index) => {
    const opening = line.match(/^\s*```([^`]*)$/)
    if (!opening) return
    if (openingLine === -1) {
      openingLine = index
      language = opening[1]?.trim() || "text"
    } else {
      openingLine = -1
      language = "text"
    }
  })

  if (openingLine === -1) return null

  return {
    prefix: lines.slice(0, openingLine).join("\n").trimEnd(),
    language,
    source: lines.slice(openingLine + 1).join("\n"),
  }
}

function MarkdownPre({ children, className }: React.ComponentProps<"pre">) {
  const child = React.Children.toArray(children)[0]
  if (!React.isValidElement(child)) {
    return <pre className={className}>{children}</pre>
  }

  const childProps = child.props as CodeElementProps
  const source = textFromNode(childProps.children)
  const language = childProps.className?.match(/language-([\w-]+)/)?.[1] ?? "text"

  if (language.toLowerCase() === "mermaid") {
    return <MermaidBlock source={source} />
  }

  return <CodeBlock source={source} language={language} />
}

const markdownComponents: Components = {
  pre: MarkdownPre,
  img: ({ alt }) => (
    <span className="rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground">
      {alt ? `图片附件：${alt}` : "图片附件需通过附件入口添加"}
    </span>
  ),
  code: ({ className, children, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  span: ({ className, children, ...props }) => {
    const formulaError = className?.split(/\s+/).includes("katex-error")
    return (
      <span
        className={cn(
          className,
          formulaError &&
            "rounded border border-dashed border-destructive/40 px-1 text-destructive"
        )}
        {...props}
      >
        {children}
        {formulaError ? (
          <small className="ml-1 text-[0.75em] text-destructive">
            公式渲染失败
          </small>
        ) : null}
      </span>
    )
  },
  a: ({ href, children, ...props }) => (
    <a href={safeUrlTransform(href ?? "")} {...props}>
      {children}
    </a>
  ),
}

class MarkdownErrorBoundary extends Component<
  { source: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex flex-col gap-2" role="alert">
        <p className="text-xs text-destructive">消息渲染失败，已保留原始 Markdown。</p>
        <pre className="app-selectable-content max-h-72 overflow-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs leading-6">
          {this.props.source}
        </pre>
      </div>
    )
  }
}

function MarkdownDocument({ source, streaming }: Pick<MarkdownRendererProps, "source" | "streaming">) {
  const fence = findUnclosedFence(source, Boolean(streaming))
  const markdown = fence ? fence.prefix : source

  return (
    <>
      {markdown ? (
        <Markdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, markdownSchema],
            [rehypeKatex, { throwOnError: false, strict: false }],
          ]}
          components={markdownComponents}
          urlTransform={safeUrlTransform}
        >
          {markdown}
        </Markdown>
      ) : null}
      {fence ? (
        fence.language.toLowerCase() === "mermaid" ? (
          <MermaidBlock source={fence.source} streaming />
        ) : (
          <CodeBlock source={fence.source} language={fence.language} streaming />
        )
      ) : null}
    </>
  )
}

export function MarkdownRenderer({
  source,
  streaming = false,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content app-selectable-content", className)}>
      <MarkdownErrorBoundary source={source}>
        <MarkdownDocument source={source} streaming={streaming} />
      </MarkdownErrorBoundary>
    </div>
  )
}
