import { useEffect, useRef, useState } from "react"
import {
  AnnotationMode,
  getDocument,
  GlobalWorkerOptions,
  TextLayer,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from "pdfjs-dist"
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export type PdfRuntimeState =
  | { status: "loading"; document: null; error: null }
  | { status: "ready"; document: PDFDocumentProxy; error: null }
  | { status: "error"; document: null; error: Error }

export function usePdfDocument(sourceUrl: string): PdfRuntimeState {
  const [state, setState] = useState<PdfRuntimeState>({
    status: "loading",
    document: null,
    error: null,
  })

  useEffect(() => {
    let active = true
    let task: PDFDocumentLoadingTask | null = null
    setState({ status: "loading", document: null, error: null })
    try {
      task = getDocument({
        url: sourceUrl,
        isEvalSupported: false,
        enableXfa: false,
        disableAutoFetch: false,
      })
      void task.promise.then((document) => {
        if (active) setState({ status: "ready", document, error: null })
        else void document.destroy()
      }).catch((reason: unknown) => {
        const error = reason instanceof Error ? reason : new Error("PDF 解析失败")
        if (active) setState({ status: "error", document: null, error })
      })
    } catch (reason) {
      const error = reason instanceof Error ? reason : new Error("PDF 解析失败")
      setState({ status: "error", document: null, error })
    }
    return () => {
      active = false
      if (task) void task.destroy()
    }
  }, [sourceUrl])

  return state
}

type PdfPageCanvasProps = {
  document: PDFDocumentProxy
  pageNumber: number
  scale: number
  renderText?: boolean
  searchQuery?: string
  className?: string
  onText?: (pageNumber: number, text: string) => void
  onAspectRatio?: (ratio: number) => void
}

export function PdfPageCanvas({
  document,
  pageNumber,
  scale,
  renderText = true,
  searchQuery = "",
  className,
  onText,
  onAspectRatio,
}: PdfPageCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [size, setSize] = useState({ width: 595 * scale, height: 842 * scale })
  const renderGenerationRef = useRef(0)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: "700px 300px" },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    void document.getPage(pageNumber).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      setSize((current) => current.width === viewport.width && current.height === viewport.height
        ? current
        : { width: viewport.width, height: viewport.height })
      onAspectRatio?.(viewport.width / viewport.height)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [document, onAspectRatio, pageNumber, scale])

  useEffect(() => {
    const generation = ++renderGenerationRef.current
    if (!visible) return
    let cancelled = false
    let renderTask: RenderTask | null = null
    let textLayer: TextLayer | null = null
    void document.getPage(pageNumber).then(async (page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const nextCanvas = window.document.createElement("canvas")
      nextCanvas.width = Math.floor(viewport.width * ratio)
      nextCanvas.height = Math.floor(viewport.height * ratio)
      const nextContext = nextCanvas.getContext("2d", { alpha: false })
      if (!nextContext) return
      renderTask = page.render({
        canvasContext: nextContext,
        viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
        annotationMode: AnnotationMode.DISABLE,
      })
      await renderTask.promise
      if (cancelled || generation !== renderGenerationRef.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext("2d", { alpha: false })
      if (!context) return
      canvas.width = nextCanvas.width
      canvas.height = nextCanvas.height
      context.drawImage(nextCanvas, 0, 0)
      setSize({ width: viewport.width, height: viewport.height })
      setRendered(true)
      onAspectRatio?.(viewport.width / viewport.height)
      if (!renderText || !textLayerRef.current) return
      const textContent = await page.getTextContent({ includeMarkedContent: true })
      if (cancelled || generation !== renderGenerationRef.current || !textLayerRef.current) return
      textLayerRef.current.replaceChildren()
      textLayerRef.current.style.setProperty("--scale-factor", String(scale))
      textLayer = new TextLayer({
        textContentSource: textContent,
        container: textLayerRef.current,
        viewport,
      })
      await textLayer.render()
      if (cancelled || generation !== renderGenerationRef.current) return
      const pageText = textLayer.textContentItemsStr.join(" ")
      onText?.(pageNumber, pageText)
      for (const [index, element] of textLayer.textDivs.entries()) {
        element.dataset.pdfText = textLayer.textContentItemsStr[index] ?? ""
      }
    }).catch(() => undefined)
    return () => {
      cancelled = true
      renderTask?.cancel()
      textLayer?.cancel()
    }
  }, [document, onAspectRatio, onText, pageNumber, renderText, scale, visible])

  useEffect(() => {
    const layer = textLayerRef.current
    if (!layer) return
    const query = searchQuery.trim().toLocaleLowerCase()
    for (const element of layer.querySelectorAll<HTMLElement>("[data-pdf-text]")) {
      const hit = Boolean(query) && (element.dataset.pdfText ?? "").toLocaleLowerCase().includes(query)
      element.classList.toggle("pdf-search-hit", hit)
    }
  }, [searchQuery, size])

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: size.width, height: size.height }}
      data-pdf-page={pageNumber}
    >
      {visible || rendered ? (
        <>
          <canvas ref={canvasRef} className="absolute inset-0 block size-full" aria-label={`第 ${pageNumber} 页`} />
          {renderText ? <div ref={textLayerRef} className="textLayer app-selectable-content" /> : null}
        </>
      ) : null}
    </div>
  )
}

export type PdfOutlineItem = {
  id: string
  title: string
  page: number | null
  children: PdfOutlineItem[]
}

type PdfOutlineNode = {
  title: string
  dest: string | Array<unknown> | null
  items: PdfOutlineNode[]
}

export async function readPdfOutline(document: PDFDocumentProxy): Promise<PdfOutlineItem[]> {
  const outline = await document.getOutline() as PdfOutlineNode[] | null
  if (!outline) return []
  const resolvePage = async (destination: PdfOutlineNode["dest"]): Promise<number | null> => {
    if (!destination) return null
    const explicit = typeof destination === "string"
      ? await document.getDestination(destination)
      : destination
    const reference = explicit?.[0]
    if (!reference || typeof reference !== "object") return null
    try {
      return (await document.getPageIndex(reference as never)) + 1
    } catch {
      return null
    }
  }
  const convert = async (items: PdfOutlineNode[], prefix = "outline"): Promise<PdfOutlineItem[]> => Promise.all(
    items.map(async (item, index) => ({
      id: `${prefix}-${index}`,
      title: item.title || "未命名章节",
      page: await resolvePage(item.dest),
      children: await convert(item.items ?? [], `${prefix}-${index}`),
    })),
  )
  return convert(outline)
}

export async function readPdfPageTexts(
  document: PDFDocumentProxy,
  options: {
    signal?: AbortSignal
    onPage?: (pageNumber: number, text: string) => void
  } = {},
): Promise<Record<number, string>> {
  const texts: Record<number, string> = {}
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    if (options.signal?.aborted) throw new DOMException("文档文本提取已取消", "AbortError")
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent({ includeMarkedContent: true })
    const text = content.items.flatMap((item) => (
      "str" in item && typeof item.str === "string" ? [item.str] : []
    )).join(" ")
    texts[pageNumber] = text
    options.onPage?.(pageNumber, text)
  }
  return texts
}
