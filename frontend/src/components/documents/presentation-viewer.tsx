import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlayIcon, PresentationIcon } from "lucide-react"

import { DocumentPreviewToolbar } from "@/components/documents/document-preview-toolbar"
import { DocumentPreviewShell } from "@/components/documents/document-preview-shell"
import { PdfPageCanvas, usePdfDocument } from "@/components/documents/pdf-runtime"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import {
  createDocumentPreviewState,
  useDocumentPreviewStore,
} from "@/store/document-preview-store"
import type { DocumentPreviewDescriptor } from "@/types/document-preview"

type PresentationDescriptor = Extract<DocumentPreviewDescriptor, { kind: "presentation" }>

type PresentationViewerProps = {
  editorId: string
  descriptor: PresentationDescriptor
}

function PresentationNavigation({
  document,
  slides,
  page,
  onPageChange,
}: {
  document: NonNullable<ReturnType<typeof usePdfDocument>["document"]>
  slides: PresentationDescriptor["slides"]
  page: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex size-full min-h-0 flex-col bg-muted/20">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b px-3 text-xs font-medium">
        <PresentationIcon className="size-4" aria-hidden="true" />幻灯片
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-3">
          {slides.map((slide) => (
            <button
              type="button"
              key={slide.index}
              className={cn(
                "flex w-full flex-col gap-1 rounded-md p-1 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                slide.index === page ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
              )}
              onClick={() => onPageChange(slide.index)}
            >
              <PdfPageCanvas
                document={document}
                pageNumber={slide.index}
                scale={0.23}
                renderText={false}
                className="relative mx-auto max-w-full overflow-hidden border bg-background shadow-sm"
              />
              <span className="flex w-full items-start gap-2 px-1">
                <span className="tabular-nums text-muted-foreground">{slide.index}</span>
                <span className="line-clamp-2 min-w-0 flex-1">{slide.title || `幻灯片 ${slide.index}`}</span>
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default function PresentationViewer({ editorId, descriptor }: PresentationViewerProps) {
  const runtime = usePdfDocument(descriptor.previewPdfUrl)
  const rootRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimer = useRef<number | null>(null)
  const ensureState = useDocumentPreviewStore((store) => store.ensureState)
  const updateState = useDocumentPreviewStore((store) => store.updateState)
  const storedState = useDocumentPreviewStore((store) => store.states[editorId])
  const state = storedState ?? createDocumentPreviewState("presentation")
  const narrow = size.width > 0 && size.width < 720

  useEffect(() => ensureState(editorId, "presentation"), [editorId, ensureState])
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
    const element = rootRef.current
    if (!element) return
    const update = () => {
      const rect = element.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (narrow) updateState(editorId, { sidebarOpen: false })
  }, [editorId, narrow, updateState])
  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === rootRef.current
      updateState(editorId, { fullscreen })
      setControlsVisible(true)
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [editorId, updateState])

  const pageCount = runtime.status === "ready" ? runtime.document.numPages : descriptor.slides.length
  const setPage = useCallback((page: number) => updateState(editorId, {
    page: Math.min(pageCount, Math.max(1, page)),
  }), [editorId, pageCount, updateState])
  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    if (state.fullscreen) hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2200)
  }, [state.fullscreen])
  const enterFullscreen = async (fromStart: boolean) => {
    if (fromStart) setPage(1)
    try {
      await rootRef.current?.requestFullscreen()
      showControls()
    } catch {
      updateState(editorId, { fullscreen: false })
    }
  }
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!state.fullscreen && !root.contains(document.activeElement)) return
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault(); setPage(state.page + 1)
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault(); setPage(state.page - 1)
      } else if (event.key === "Home") {
        event.preventDefault(); setPage(1)
      } else if (event.key === "End") {
        event.preventDefault(); setPage(pageCount)
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault(); updateState(editorId, { zoom: Math.min(400, state.zoom + 25), scaleMode: "custom" })
      } else if (event.key === "-") {
        event.preventDefault(); updateState(editorId, { zoom: Math.max(25, state.zoom - 25), scaleMode: "custom" })
      }
      showControls()
    }
    root.addEventListener("keydown", onKeyDown)
    return () => root.removeEventListener("keydown", onKeyDown)
  }, [editorId, pageCount, setPage, showControls, state.fullscreen, state.page, state.zoom, updateState])
  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
  }, [])

  const availableWidth = Math.max(320, size.width - (state.sidebarOpen && !narrow ? 240 : 0) - 32)
  const availableHeight = Math.max(240, size.height - 84)
  const fitScale = Math.min(availableWidth / 960, availableHeight / 540)
  const computedZoom = state.scaleMode === "custom"
    ? state.zoom
    : Math.max(25, Math.min(400, Math.round(fitScale * 100)))
  const scale = (computedZoom / 100) * 1.25
  const activeSlide = useMemo(
    () => descriptor.slides.find((slide) => slide.index === state.page),
    [descriptor.slides, state.page],
  )

  if (runtime.status === "loading") {
    return <div ref={rootRef} className="grid size-full place-items-center bg-muted/20"><div className="flex w-80 flex-col gap-3"><Skeleton className="aspect-video" /><span className="text-center text-xs text-muted-foreground">正在准备幻灯片…</span></div></div>
  }
  if (runtime.status === "error") {
    return <div ref={rootRef} className="grid size-full place-items-center p-6"><Alert variant="destructive" className="max-w-lg"><PresentationIcon /><AlertTitle>无法打开演示文稿</AlertTitle><AlertDescription>{runtime.error.message}</AlertDescription></Alert></div>
  }

  const navigation = (
    <PresentationNavigation
      document={runtime.document}
      slides={descriptor.slides}
      page={state.page}
      onPageChange={setPage}
    />
  )
  const stage = (
    <div className={cn("relative grid size-full min-h-0 place-items-center overflow-auto bg-muted/30 p-4", state.fullscreen && "bg-black p-8")}>
      <PdfPageCanvas
        key={`${state.page}-${scale}`}
        document={runtime.document}
        pageNumber={state.page}
        scale={scale}
        renderText={false}
        className="relative overflow-hidden bg-white shadow-lg ring-1 ring-black/10"
      />
      {state.fullscreen && activeSlide?.title ? (
        <div className="pointer-events-none absolute right-4 bottom-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white/80">{state.page} / {pageCount}</div>
      ) : null}
    </div>
  )

  return (
    <DocumentPreviewShell
      ref={rootRef}
      kind="presentation"
      className="outline-none"
      tabIndex={0}
      onMouseMove={showControls}
      toolbar={
        <div className={cn("transition-opacity", state.fullscreen && !controlsVisible && "pointer-events-none opacity-0")}>
          <DocumentPreviewToolbar
            sidebarOpen={state.sidebarOpen}
            onSidebarOpenChange={(sidebarOpen) => updateState(editorId, { sidebarOpen })}
            page={state.page}
            pageCount={pageCount}
            onPageChange={setPage}
            zoom={computedZoom}
            minZoom={25}
            maxZoom={400}
            onZoomChange={(zoom) => updateState(editorId, { zoom, scaleMode: "custom" })}
            scaleMode={state.scaleMode}
            onScaleModeChange={(scaleMode) => updateState(editorId, { scaleMode })}
            onFullscreen={() => void enterFullscreen(false)}
            leading={
              <Button variant="ghost" size="sm" onClick={() => void enterFullscreen(true)}>
                <PlayIcon data-icon="inline-start" />从头放映
              </Button>
            }
            compact={narrow}
          />
        </div>
      }
      statusBar={!state.fullscreen ? (
        <div className="flex h-7 shrink-0 items-center gap-3 border-t px-3 text-[11px] text-muted-foreground">
          <PresentationIcon className="size-3" aria-hidden="true" />静态保真放映
          <span className="truncate">{activeSlide?.title ?? `幻灯片 ${state.page}`}</span>
          <span className="ml-auto">{state.page} / {pageCount} · {computedZoom}%</span>
        </div>
      ) : null}
    >
      {narrow || state.fullscreen ? stage : state.sidebarOpen ? (
          <ResizablePanelGroup orientation="horizontal" className="min-h-0">
            <ResizablePanel id={`${editorId}-presentation-navigation`} defaultSize="220px" minSize="180px" maxSize="320px">{navigation}</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id={`${editorId}-presentation-stage`} minSize="360px">{stage}</ResizablePanel>
          </ResizablePanelGroup>
        ) : stage}
      {narrow && !state.fullscreen ? (
        <Sheet open={state.sidebarOpen} onOpenChange={(sidebarOpen) => updateState(editorId, { sidebarOpen })}>
          <SheetContent side="left" className="w-[min(86vw,320px)] p-0" showCloseButton={false}>
            <SheetHeader className="sr-only"><SheetTitle>幻灯片导航</SheetTitle><SheetDescription>选择要查看的幻灯片</SheetDescription></SheetHeader>
            {navigation}
          </SheetContent>
        </Sheet>
      ) : null}
    </DocumentPreviewShell>
  )
}
