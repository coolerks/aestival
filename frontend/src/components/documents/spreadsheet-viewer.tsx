import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import {
  BarChart3Icon,
  FileSpreadsheetIcon,
  Grid3X3Icon,
  PrinterIcon,
} from "lucide-react"
import { toast } from "sonner"

import { DocumentPreviewToolbar } from "@/components/documents/document-preview-toolbar"
import { DocumentPreviewShell } from "@/components/documents/document-preview-shell"
import { useDocumentPinchZoom } from "@/components/documents/use-document-pinch-zoom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { loadWorkbookManifest } from "@/services/document-preview-service"
import {
  createDocumentPreviewState,
  useDocumentPreviewStore,
} from "@/store/document-preview-store"
import type {
  DocumentPreviewDescriptor,
  SpreadsheetViewMode,
  WorkbookCell,
  WorkbookManifest,
  WorkbookSheet,
} from "@/types/document-preview"

const PagedDocumentViewer = lazy(() => import("@/components/documents/paged-document-viewer"))

type SpreadsheetDescriptor = Extract<DocumentPreviewDescriptor, { kind: "spreadsheet" }>

type SpreadsheetViewerProps = {
  editorId: string
  descriptor: SpreadsheetDescriptor
}

function columnName(column: number) {
  let value = column
  let name = ""
  while (value > 0) {
    const remainder = (value - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    value = Math.floor((value - 1) / 26)
  }
  return name
}

function parseAddress(address: string) {
  const match = /^([A-Z]+)(\d+)$/i.exec(address)
  if (!match) return { row: 1, column: 1 }
  const column = match[1].toUpperCase().split("").reduce(
    (value, character) => value * 26 + character.charCodeAt(0) - 64,
    0,
  )
  return { row: Number(match[2]), column }
}

function cellAddress(row: number, column: number) {
  return `${columnName(column)}${row}`
}

type MergedCell = {
  anchor: string
  rowSpan: number
  columnSpan: number
}

function mergedCellMap(ranges: string[]) {
  const result = new Map<string, MergedCell>()
  for (const range of ranges) {
    const [startAddress, endAddress = startAddress] = range.replace(/\$/g, "").split(":")
    const start = parseAddress(startAddress)
    const end = parseAddress(endAddress)
    const minRow = Math.min(start.row, end.row)
    const maxRow = Math.max(start.row, end.row)
    const minColumn = Math.min(start.column, end.column)
    const maxColumn = Math.max(start.column, end.column)
    const anchor = cellAddress(minRow, minColumn)
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let column = minColumn; column <= maxColumn; column += 1) {
        result.set(cellAddress(row, column), {
          anchor,
          rowSpan: maxRow - minRow + 1,
          columnSpan: maxColumn - minColumn + 1,
        })
      }
    }
  }
  return result
}

function SpreadsheetModeToggle({
  value,
  onChange,
}: {
  value: SpreadsheetViewMode
  onChange: (value: SpreadsheetViewMode) => void
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(values) => {
        const next = values[0]
        if (next === "grid" || next === "print") onChange(next)
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="工作簿查看模式"
    >
      <ToggleGroupItem value="grid"><Grid3X3Icon data-icon="inline-start" />网格</ToggleGroupItem>
      <ToggleGroupItem value="print"><PrinterIcon data-icon="inline-start" />打印预览</ToggleGroupItem>
    </ToggleGroup>
  )
}

function selectedBounds(activeCell: string, anchor: string | null) {
  const active = parseAddress(activeCell)
  const start = anchor ? parseAddress(anchor) : active
  return {
    minRow: Math.min(active.row, start.row),
    maxRow: Math.max(active.row, start.row),
    minColumn: Math.min(active.column, start.column),
    maxColumn: Math.max(active.column, start.column),
  }
}

function SpreadsheetGrid({
  sheet,
  zoom,
  activeCell,
  selectionAnchor,
  onActiveCellChange,
  onSelectionAnchorChange,
}: {
  sheet: WorkbookSheet
  zoom: number
  activeCell: string
  selectionAnchor: string | null
  onActiveCellChange: (address: string) => void
  onSelectionAnchorChange: (address: string | null) => void
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const dragSelectionRef = useRef<{
    pointerId: number
    startAddress: string
    lastAddress: string
    moved: boolean
    extending: boolean
  } | null>(null)
  const cells = useMemo(
    () => new Map(sheet.cells.map((cell) => [cell.address, cell])),
    [sheet.cells],
  )
  const mergedCells = useMemo(() => mergedCellMap(sheet.merges), [sheet.merges])
  const scale = zoom / 100
  const rowHeaderWidth = 46
  const defaultColumnWidth = 112
  const columnWidths = Array.from({ length: sheet.maxColumn }, (_, index) => {
    const width = sheet.columnWidths[columnName(index + 1)]
    return Math.max(56, Math.min(240, (width ? width * 7 : defaultColumnWidth) * scale))
  })
  const rowHeights = Array.from({ length: sheet.maxRow }, (_, index) =>
    Math.max(24, (sheet.rowHeights[String(index + 1)] ?? 26) * scale),
  )
  const bounds = selectedBounds(activeCell, selectionAnchor)

  const copySelection = async () => {
    const rows: string[] = []
    for (let row = bounds.minRow; row <= bounds.maxRow; row += 1) {
      const values: string[] = []
      for (let column = bounds.minColumn; column <= bounds.maxColumn; column += 1) {
        values.push(cells.get(cellAddress(row, column))?.value ?? "")
      }
      rows.push(values.join("\t"))
    }
    try {
      await navigator.clipboard.writeText(rows.join("\n"))
      toast.success("已复制为 TSV")
    } catch {
      toast.warning("无法写入剪贴板")
    }
  }

  const moveCell = (rowDelta: number, columnDelta: number, extend: boolean) => {
    const current = parseAddress(activeCell)
    const row = Math.min(sheet.maxRow, Math.max(1, current.row + rowDelta))
    const column = Math.min(sheet.maxColumn, Math.max(1, current.column + columnDelta))
    if (extend && !selectionAnchor) onSelectionAnchorChange(activeCell)
    if (!extend) onSelectionAnchorChange(null)
    const address = cellAddress(row, column)
    onActiveCellChange(address)
    gridRef.current?.querySelector<HTMLElement>(`[data-cell-address="${address}"]`)?.focus()
  }

  return (
    <div
      ref={gridRef}
      data-document-zoom-surface
      className="min-h-0 flex-1 touch-pan-x touch-pan-y select-none overflow-auto bg-background outline-none"
      role="grid"
      aria-label={`${sheet.name} 工作表，只读`}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        const cell = event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-cell-address]")
          : null
        const address = cell?.dataset.cellAddress
        if (!address) return
        event.preventDefault()
        const startAddress = event.shiftKey ? (selectionAnchor ?? activeCell) : address
        dragSelectionRef.current = {
          pointerId: event.pointerId,
          startAddress,
          lastAddress: address,
          moved: false,
          extending: event.shiftKey,
        }
        onSelectionAnchorChange(startAddress)
        onActiveCellChange(address)
        gridRef.current?.setPointerCapture(event.pointerId)
        cell.focus()
      }}
      onPointerMove={(event) => {
        const drag = dragSelectionRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-cell-address]")
        const address = cell?.dataset.cellAddress
        if (!address || address === drag.lastAddress) return
        drag.lastAddress = address
        drag.moved = true
        onActiveCellChange(address)
      }}
      onPointerUp={(event) => {
        const drag = dragSelectionRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        if (!drag.moved && !drag.extending) onSelectionAnchorChange(null)
        if (gridRef.current?.hasPointerCapture(event.pointerId)) {
          gridRef.current.releasePointerCapture(event.pointerId)
        }
        dragSelectionRef.current = null
      }}
      onPointerCancel={(event) => {
        if (gridRef.current?.hasPointerCapture(event.pointerId)) {
          gridRef.current.releasePointerCapture(event.pointerId)
        }
        dragSelectionRef.current = null
      }}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "c") {
          event.preventDefault(); void copySelection(); return
        }
        const mapping: Record<string, [number, number]> = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
        }
        const delta = mapping[event.key]
        if (delta) {
          event.preventDefault()
          moveCell(delta[0], delta[1], event.shiftKey)
        }
      }}
    >
      <div
        className="relative grid min-w-max text-xs"
        style={{
          gridTemplateColumns: `${rowHeaderWidth}px ${columnWidths.map((width) => `${width}px`).join(" ")}`,
          gridTemplateRows: `28px ${rowHeights.map((height) => `${height}px`).join(" ")}`,
          fontSize: `${Math.max(10, 12 * scale)}px`,
        }}
      >
        <div
          className="sticky top-0 left-0 z-30 border-r border-b bg-[var(--spreadsheet-header)]"
          style={{ gridColumn: 1, gridRow: 1 }}
          aria-hidden="true"
        />
        {Array.from({ length: sheet.maxColumn }, (_, index) => index + 1).map((column) => (
          <div
            key={`column-${column}`}
            className="sticky top-0 z-20 flex items-center justify-center border-r border-b bg-[var(--spreadsheet-header)] font-medium text-muted-foreground"
            style={{ gridColumn: column + 1, gridRow: 1 }}
            role="columnheader"
          >
            {columnName(column)}
          </div>
        ))}
        {Array.from({ length: sheet.maxRow }, (_, rowIndex) => rowIndex + 1).flatMap((row) => [
          <div
            key={`row-${row}`}
            className="sticky left-0 z-10 flex items-center justify-center border-r border-b bg-[var(--spreadsheet-header)] text-muted-foreground"
            style={{ gridColumn: 1, gridRow: row + 1 }}
            role="rowheader"
          >
            {row}
          </div>,
          ...Array.from({ length: sheet.maxColumn }, (_, columnIndex) => columnIndex + 1).map((column) => {
            const address = cellAddress(row, column)
            const cell = cells.get(address)
            const merge = mergedCells.get(address)
            if (merge && merge.anchor !== address) return null
            const selected = row >= bounds.minRow && row <= bounds.maxRow && column >= bounds.minColumn && column <= bounds.maxColumn
            const active = address === activeCell
            return (
              <button
                type="button"
                key={address}
                data-cell-address={address}
                className="relative overflow-hidden border-r border-b px-1.5 text-left outline-none focus:z-[2]"
                style={{
                  gridColumn: `${column + 1} / span ${merge?.columnSpan ?? 1}`,
                  gridRow: `${row + 1} / span ${merge?.rowSpan ?? 1}`,
                  backgroundColor: cell?.style?.fill ?? (selected ? "var(--spreadsheet-selection)" : undefined),
                  color: cell?.style?.fontColor ?? undefined,
                  fontWeight: cell?.style?.bold ? 600 : undefined,
                  fontStyle: cell?.style?.italic ? "italic" : undefined,
                  textAlign: cell?.style?.horizontal === "center" ? "center" : cell?.style?.horizontal === "right" ? "right" : "left",
                  whiteSpace: cell?.style?.wrapText ? "normal" : "nowrap",
                  boxShadow: active
                    ? "inset 0 0 0 2px var(--spreadsheet-accent)"
                    : selected && cell?.style?.fill
                      ? "inset 0 0 0 9999px color-mix(in srgb, var(--spreadsheet-selection) 72%, transparent)"
                      : undefined,
                }}
                role="gridcell"
                aria-selected={selected}
              >
                <span className="block truncate">{cell?.value ?? ""}</span>
              </button>
            )
          }),
        ])}
      </div>
    </div>
  )
}

function activeCellValue(sheet: WorkbookSheet, address: string): WorkbookCell | undefined {
  return sheet.cells.find((cell) => cell.address === address)
}

export default function SpreadsheetViewer({ editorId, descriptor }: SpreadsheetViewerProps) {
  const ensureState = useDocumentPreviewStore((store) => store.ensureState)
  const updateState = useDocumentPreviewStore((store) => store.updateState)
  const storedState = useDocumentPreviewStore((store) => store.states[editorId])
  const state = storedState ?? createDocumentPreviewState("spreadsheet")
  const [manifest, setManifest] = useState<WorkbookManifest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useDocumentPinchZoom({
    rootRef,
    zoom: state.zoom,
    minZoom: 50,
    maxZoom: 200,
    enabled: state.spreadsheetView === "grid",
    onZoomChange: (zoom) => updateState(editorId, { zoom, scaleMode: "custom" }),
  })

  useEffect(() => ensureState(editorId, "spreadsheet"), [editorId, ensureState])
  useEffect(() => {
    let active = true
    setError(null)
    setManifest(null)
    updateState(editorId, { status: "loading", errorMessage: undefined })
    void loadWorkbookManifest(descriptor).then((workbook) => {
      if (!active) return
      setManifest(workbook)
      const firstSheet = workbook.sheets[0]
      const currentSheetId = useDocumentPreviewStore.getState().states[editorId]?.sheetId
      updateState(editorId, {
        sheetId: currentSheetId || firstSheet?.id || null,
        status: "ready",
        errorMessage: undefined,
      })
    }).catch((reason: unknown) => {
      if (!active) return
      const message = reason instanceof Error ? reason.message : "工作簿预览加载失败"
      setError(message)
      updateState(editorId, { status: "error", errorMessage: message })
    })
    return () => { active = false }
  }, [descriptor, editorId, updateState])

  const activeSheet = manifest?.sheets.find((sheet) => sheet.id === state.sheetId) ?? manifest?.sheets[0]
  const activeCell = activeSheet ? activeCellValue(activeSheet, state.activeCell) : undefined
  const hasCharts = Boolean(manifest?.sheets.some((sheet) => sheet.hasCharts))
  const setView = (spreadsheetView: SpreadsheetViewMode) => updateState(editorId, {
    spreadsheetView,
    zoom: spreadsheetView === "grid"
      ? Math.min(200, Math.max(50, state.zoom))
      : Math.min(400, Math.max(25, state.zoom)),
  })

  if (state.spreadsheetView === "print") {
    return (
      <Suspense fallback={<div className="grid size-full place-items-center"><Skeleton className="aspect-[1/1.414] w-72" /></div>}>
        <PagedDocumentViewer
          editorId={editorId}
          descriptor={{ kind: "pdf", sourceUrl: descriptor.printPdfUrl }}
          embedded
          toolbarLeading={<SpreadsheetModeToggle value="print" onChange={setView} />}
        />
      </Suspense>
    )
  }

  if (error) {
    return <div ref={rootRef} className="grid size-full place-items-center p-6"><Alert variant="destructive" className="max-w-lg"><FileSpreadsheetIcon /><AlertTitle>无法打开工作簿</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>
  }
  if (!manifest || !activeSheet) {
    return <div ref={rootRef} className="flex size-full flex-col"><DocumentPreviewToolbar zoom={100} minZoom={50} maxZoom={200} onZoomChange={() => undefined} leading={<SpreadsheetModeToggle value="grid" onChange={setView} />} /><div className="grid min-h-0 flex-1 place-items-center"><div className="flex w-64 flex-col gap-3"><Skeleton className="h-8" /><Skeleton className="h-52" /><span className="text-center text-xs text-muted-foreground">正在加载工作簿网格…</span></div></div></div>
  }

  return (
    <DocumentPreviewShell
      ref={rootRef}
      kind="spreadsheet"
      contentClassName="flex flex-col"
      toolbar={
        <DocumentPreviewToolbar
          zoom={state.zoom}
          minZoom={50}
          maxZoom={200}
          onZoomChange={(zoom) => updateState(editorId, { zoom, scaleMode: "custom" })}
          leading={<SpreadsheetModeToggle value="grid" onChange={setView} />}
          trailing={hasCharts ? <span className="hidden items-center gap-1 text-muted-foreground lg:flex"><BarChart3Icon className="size-3.5" />打印预览包含图表</span> : null}
        />
      }
    >
      <div className="grid h-9 shrink-0 grid-cols-[72px_minmax(0,1fr)] border-b bg-[var(--spreadsheet-header)]">
        <Input className="h-9 rounded-none border-0 border-r bg-transparent text-center font-mono text-xs focus-visible:ring-1" value={state.activeCell} readOnly aria-label="活动单元格名称" />
        <div className="flex min-w-0 items-center gap-2 px-2">
          <span className="font-serif text-sm italic text-[var(--spreadsheet-accent)]" aria-hidden="true">fx</span>
          <Input className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" value={activeCell?.formula || activeCell?.value || ""} readOnly aria-label="只读公式栏" />
        </div>
      </div>
      <SpreadsheetGrid
        sheet={activeSheet}
        zoom={state.zoom}
        activeCell={state.activeCell}
        selectionAnchor={state.selectionAnchor}
        onActiveCellChange={(activeCellAddress) => updateState(editorId, { activeCell: activeCellAddress })}
        onSelectionAnchorChange={(selectionAnchor) => updateState(editorId, { selectionAnchor })}
      />
      <div data-document-zoom-ignore className="flex h-9 shrink-0 items-center border-t bg-[var(--spreadsheet-header)] px-2">
        <Tabs value={activeSheet.id} onValueChange={(sheetId) => updateState(editorId, { sheetId, activeCell: "A1", selectionAnchor: null })}>
          <TabsList className="h-8 gap-0 overflow-visible rounded-none bg-transparent p-0">
            {manifest.sheets.map((sheet) => (
              <TabsTrigger
                key={sheet.id}
                value={sheet.id}
                className="h-8 rounded-none border-0 bg-transparent px-4 shadow-none after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[var(--spreadsheet-accent)] data-active:bg-transparent data-active:shadow-none data-active:after:opacity-100"
              >
                {sheet.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="ml-auto text-[11px] text-muted-foreground">只读 · {activeSheet.maxRow} 行 × {activeSheet.maxColumn} 列</span>
      </div>
    </DocumentPreviewShell>
  )
}
