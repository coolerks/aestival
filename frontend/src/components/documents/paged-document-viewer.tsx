import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  BookOpenTextIcon,
  FileLock2Icon,
  ImagesIcon,
  LockIcon,
  SearchXIcon,
} from "lucide-react"
import type { PDFDocumentProxy } from "pdfjs-dist"

import { DocumentPreviewToolbar } from "@/components/documents/document-preview-toolbar"
import { DocumentPreviewShell } from "@/components/documents/document-preview-shell"
import {
  PdfPageCanvas,
  readPdfPageTexts,
  readPdfOutline,
  usePdfDocument,
  type PdfOutlineItem,
} from "@/components/documents/pdf-runtime"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  createDocumentPreviewState,
  useDocumentPreviewStore,
} from "@/store/document-preview-store"
import type {
  DocumentPreviewDescriptor,
  DocumentPreviewKind,
} from "@/types/document-preview"

type PagedDescriptor = Extract<DocumentPreviewDescriptor, { kind: "pdf" | "word" }>

type PagedDocumentViewerProps = {
  editorId: string
  descriptor: PagedDescriptor
  embedded?: boolean
  toolbarLeading?: ReactNode
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => setWidth(element.getBoundingClientRect().width)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

function OutlineTree({
  items,
  currentPage,
  onSelect,
  level = 0,
}: {
  items: PdfOutlineItem[]
  currentPage: number
  onSelect: (page: number) => void
  level?: number
}) {
  return items.map((item) => (
    <div key={item.id}>
      <button
        type="button"
        className={cn(
          "flex min-h-7 w-full items-start gap-2 rounded-md py-1 pr-2 text-left text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          item.page === currentPage && "bg-accent text-accent-foreground",
        )}
        style={{ paddingLeft: level * 14 + 8 }}
        disabled={!item.page}
        onClick={() => item.page && onSelect(item.page)}
      >
        <span className="min-w-0 flex-1 leading-5">{item.title}</span>
        {item.page ? <span className="tabular-nums text-muted-foreground">{item.page}</span> : null}
      </button>
      {item.children.length ? (
        <OutlineTree items={item.children} currentPage={currentPage} onSelect={onSelect} level={level + 1} />
      ) : null}
    </div>
  ))
}

function DocumentNavigation({
  document,
  outline,
  outlineReady,
  page,
  navigationMode,
  onNavigationModeChange,
  onPageChange,
}: {
  document: PDFDocumentProxy
  outline: PdfOutlineItem[]
  outlineReady: boolean
  page: number
  navigationMode: "thumbnails" | "outline"
  onNavigationModeChange: (mode: "thumbnails" | "outline") => void
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex size-full min-h-0 flex-col bg-muted/20">
      <div className="flex h-10 shrink-0 items-center border-b px-2">
        <ToggleGroup
          value={[navigationMode]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === "thumbnails" || next === "outline") onNavigationModeChange(next)
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="w-full"
          aria-label="文档导航模式"
        >
          <ToggleGroupItem className="flex-1" value="thumbnails"><ImagesIcon data-icon="inline-start" />缩略图</ToggleGroupItem>
          <ToggleGroupItem className="flex-1" value="outline" disabled={outlineReady && outline.length === 0}><BookOpenTextIcon data-icon="inline-start" />目录</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {navigationMode === "outline" ? (
          outlineReady && outline.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-xs text-muted-foreground">
              <SearchXIcon className="size-5" />此文档未定义目录
            </div>
          ) : outlineReady ? (
            <nav className="p-1" aria-label="文档目录">
              <OutlineTree items={outline} currentPage={page} onSelect={onPageChange} />
            </nav>
          ) : (
            <div className="flex flex-col gap-2 p-3"><Skeleton className="h-7" /><Skeleton className="h-7 w-4/5" /><Skeleton className="h-7 w-3/5" /></div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3">
            {Array.from({ length: document.numPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={cn(
                  "mx-auto flex w-full max-w-40 flex-col items-center gap-1 rounded-md p-1 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pageNumber === page && "bg-accent text-accent-foreground",
                )}
                onClick={() => onPageChange(pageNumber)}
              >
                <PdfPageCanvas
                  document={document}
                  pageNumber={pageNumber}
                  scale={0.2}
                  renderText={false}
                  className="relative max-w-full overflow-hidden border bg-background shadow-sm"
                />
                <span>{pageNumber}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function DocumentPages({
  document,
  page,
  scrollRequest,
  scale,
  searchQuery,
  onPageChange,
  onPageText,
}: {
  document: PDFDocumentProxy
  page: number
  scrollRequest: number
  scale: number
  searchQuery: string
  onPageChange: (page: number) => void
  onPageText: (page: number, text: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef(new Map<number, HTMLElement>())

  useEffect(() => {
    if (scrollRequest === 0) return
    const element = pageRefs.current.get(page)
    if (element) {
      element.scrollIntoView({ block: "start", behavior: "smooth" })
    }
  }, [page, scrollRequest])

  useEffect(() => {
    const root = rootRef.current
    const viewport = root?.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']")
    if (!viewport) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      const next = Number((visible?.target as HTMLElement | undefined)?.dataset.pageNumber)
      if (Number.isFinite(next) && next > 0) onPageChange(next)
    }, { root: viewport, threshold: [0.25, 0.55, 0.8] })
    for (const element of pageRefs.current.values()) observer.observe(element)
    return () => observer.disconnect()
  }, [document, onPageChange])

  return (
    <ScrollArea ref={rootRef} className="app-selectable-content size-full bg-muted/30">
      <div className="mx-auto flex min-w-fit flex-col items-center gap-4 p-4">
        {Array.from({ length: document.numPages }, (_, index) => index + 1).map((pageNumber) => (
          <section
            key={pageNumber}
            ref={(element) => {
              if (element) pageRefs.current.set(pageNumber, element)
              else pageRefs.current.delete(pageNumber)
            }}
            data-page-number={pageNumber}
            data-current={pageNumber === page}
            className="scroll-mt-4"
            aria-label={`第 ${pageNumber} 页`}
          >
            <PdfPageCanvas
              document={document}
              pageNumber={pageNumber}
              scale={scale}
              searchQuery={searchQuery}
              onText={onPageText}
              className="relative overflow-hidden bg-white shadow-sm ring-1 ring-border"
            />
          </section>
        ))}
      </div>
    </ScrollArea>
  )
}

export default function PagedDocumentViewer({
  editorId,
  descriptor,
  embedded = false,
  toolbarLeading,
}: PagedDocumentViewerProps) {
  const sourceUrl = descriptor.kind === "word" ? descriptor.previewPdfUrl : descriptor.sourceUrl
  const runtime = usePdfDocument(sourceUrl)
  const ensureState = useDocumentPreviewStore((store) => store.ensureState)
  const updateState = useDocumentPreviewStore((store) => store.updateState)
  const storedState = useDocumentPreviewStore((store) => store.states[editorId])
  const state = storedState ?? createDocumentPreviewState(descriptor.kind as DocumentPreviewKind)
  const [outline, setOutline] = useState<PdfOutlineItem[]>([])
  const [outlineReady, setOutlineReady] = useState(false)
  const [pageTexts, setPageTexts] = useState<Record<number, string>>({})
  const [pageScrollRequest, setPageScrollRequest] = useState(0)
  const [rootRef, width] = useElementWidth<HTMLDivElement>()
  const narrow = width > 0 && width < 720

  useEffect(() => ensureState(editorId, descriptor.kind), [descriptor.kind, editorId, ensureState])
  useEffect(() => {
    if (runtime.status === "loading") {
      updateState(editorId, { status: "loading", errorMessage: undefined })
    } else if (runtime.status === "ready") {
      updateState(editorId, { status: "ready", errorMessage: undefined })
    } else {
      updateState(editorId, { status: "error", errorMessage: runtime.error.message })
    }
  }, [editorId, runtime, updateState])
  useEffect(() => {
    if (!narrow) return
    updateState(editorId, { sidebarOpen: false })
  }, [editorId, narrow, updateState])

  useEffect(() => {
    if (runtime.status !== "ready") return
    let active = true
    setOutlineReady(false)
    void readPdfOutline(runtime.document).then((items) => {
      if (!active) return
      setOutline(items)
      setOutlineReady(true)
      if (
        items.length === 0
        && useDocumentPreviewStore.getState().states[editorId]?.navigationMode === "outline"
      ) {
        updateState(editorId, { navigationMode: "thumbnails" })
      }
    }).catch(() => {
      if (active) setOutlineReady(true)
    })
    return () => { active = false }
  }, [editorId, runtime, updateState])

  useEffect(() => {
    if (runtime.status !== "ready") return
    const controller = new AbortController()
    setPageTexts({})
    void readPdfPageTexts(runtime.document, {
      signal: controller.signal,
      onPage: (pageNumber, text) => {
        setPageTexts((current) => current[pageNumber] === text
          ? current
          : { ...current, [pageNumber]: text })
      },
    }).catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) {
        console.warn("Document text extraction failed", reason)
      }
    })
    return () => controller.abort()
  }, [runtime])

  const onPageText = useCallback((pageNumber: number, text: string) => {
    setPageTexts((current) => current[pageNumber] === text
      ? current
      : { ...current, [pageNumber]: text })
  }, [])
  const query = state.searchQuery.trim().toLocaleLowerCase()
  const matchedPages = useMemo(() => {
    if (!query) return []
    return Object.entries(pageTexts).flatMap(([pageNumber, text]) => {
      const normalized = text.toLocaleLowerCase()
      let offset = 0
      const matches: number[] = []
      while ((offset = normalized.indexOf(query, offset)) >= 0) {
        matches.push(Number(pageNumber))
        offset += Math.max(query.length, 1)
      }
      return matches
    })
  }, [pageTexts, query])

  const contentWidth = Math.max(320, width - (state.sidebarOpen && !narrow ? 230 : 0) - 32)
  const computedZoom = state.scaleMode === "fit-width"
    ? Math.max(25, Math.min(400, Math.round((contentWidth / 595) * 80)))
    : state.scaleMode === "fit-page"
      ? Math.max(25, Math.min(400, Math.round((Math.min(contentWidth / 595, 650 / 842)) * 80)))
      : state.zoom
  const scale = (computedZoom / 100) * 1.25
  const setPage = useCallback((page: number) => {
    updateState(editorId, { page })
  }, [editorId, updateState])
  const jumpToPage = useCallback((page: number) => {
    updateState(editorId, { page })
    setPageScrollRequest((request) => request + 1)
  }, [editorId, updateState])
  const moveSearch = (direction: -1 | 1) => {
    if (!matchedPages.length) return
    const current = Math.min(Math.max(state.searchMatch, 0), matchedPages.length - 1)
    const next = (current + direction + matchedPages.length) % matchedPages.length
    updateState(editorId, { searchMatch: next, page: matchedPages[next] })
    setPageScrollRequest((request) => request + 1)
  }

  if (runtime.status === "loading") {
    return (
      <div ref={rootRef} className="flex size-full min-h-0 flex-col">
        <DocumentPreviewToolbar zoom={100} minZoom={25} maxZoom={400} onZoomChange={() => undefined} />
        <div className="grid min-h-0 flex-1 place-items-center bg-muted/20">
          <div className="flex w-64 flex-col gap-3"><Skeleton className="h-5 w-32" /><Skeleton className="aspect-[1/1.414] w-full" /><span className="text-center text-xs text-muted-foreground">正在解析本地文档…</span></div>
        </div>
      </div>
    )
  }
  if (runtime.status === "error") {
    return (
      <div ref={rootRef} className="grid size-full place-items-center p-6">
        <Alert variant="destructive" className="max-w-xl">
          <FileLock2Icon />
          <AlertTitle>无法打开文档</AlertTitle>
          <AlertDescription>{runtime.error.message || "文件可能已损坏、加密或预览产物缺失。"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const navigation = (
    <DocumentNavigation
      document={runtime.document}
      outline={outline}
      outlineReady={outlineReady}
      page={state.page}
      navigationMode={state.navigationMode}
      onNavigationModeChange={(navigationMode) => updateState(editorId, { navigationMode })}
      onPageChange={jumpToPage}
    />
  )
  const pages = (
    <DocumentPages
      document={runtime.document}
      page={state.page}
      scrollRequest={pageScrollRequest}
      scale={scale}
      searchQuery={state.searchQuery}
      onPageChange={setPage}
      onPageText={onPageText}
    />
  )

  return (
    <DocumentPreviewShell
      ref={rootRef}
      kind={descriptor.kind}
      toolbar={
        <DocumentPreviewToolbar
          sidebarOpen={state.sidebarOpen}
          onSidebarOpenChange={(sidebarOpen) => updateState(editorId, { sidebarOpen })}
          page={state.page}
          pageCount={runtime.document.numPages}
          onPageChange={jumpToPage}
          zoom={computedZoom}
          minZoom={25}
          maxZoom={400}
          onZoomChange={(zoom) => updateState(editorId, { zoom, scaleMode: "custom" })}
          scaleMode={state.scaleMode}
          onScaleModeChange={(scaleMode) => updateState(editorId, { scaleMode })}
          searchQuery={state.searchQuery}
          searchMatches={matchedPages.length}
          onSearchQueryChange={(searchQuery) => updateState(editorId, { searchQuery, searchMatch: 0 })}
          onPreviousSearchMatch={() => moveSearch(-1)}
          onNextSearchMatch={() => moveSearch(1)}
          leading={toolbarLeading}
          compact={embedded}
        />
      }
      statusBar={
        <div className="flex h-7 shrink-0 items-center gap-3 border-t px-3 text-[11px] text-muted-foreground">
          <LockIcon className="size-3" aria-hidden="true" />
          <span>只读安全预览</span>
          <span>{outline.length ? `${outline.length} 个顶层目录` : "无目录"}</span>
          <span className="ml-auto">第 {state.page} / {runtime.document.numPages} 页 · {computedZoom}%</span>
        </div>
      }
    >
      {narrow ? pages : state.sidebarOpen ? (
          <ResizablePanelGroup orientation="horizontal" className="min-h-0">
            <ResizablePanel id={`${editorId}-document-navigation`} defaultSize="220px" minSize="170px" maxSize="320px">{navigation}</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id={`${editorId}-document-pages`} minSize="360px">{pages}</ResizablePanel>
          </ResizablePanelGroup>
        ) : pages}
      {narrow ? (
        <Sheet open={state.sidebarOpen} onOpenChange={(sidebarOpen) => updateState(editorId, { sidebarOpen })}>
          <SheetContent side="left" className="w-[min(86vw,320px)] p-0" showCloseButton={false}>
            <SheetHeader className="sr-only"><SheetTitle>文档导航</SheetTitle><SheetDescription>浏览缩略图或文档目录</SheetDescription></SheetHeader>
            {navigation}
          </SheetContent>
        </Sheet>
      ) : null}
    </DocumentPreviewShell>
  )
}
