export type DocumentPreviewKind =
  | "pdf"
  | "word"
  | "presentation"
  | "spreadsheet"

export type PresentationSlide = {
  index: number
  title?: string
  description?: string
}

export type DocumentPreviewDescriptor =
  | {
      kind: "pdf"
      sourceUrl: string
    }
  | {
      kind: "word"
      sourceUrl: string
      previewPdfUrl: string
    }
  | {
      kind: "presentation"
      sourceUrl: string
      previewPdfUrl: string
      slides: PresentationSlide[]
    }
  | {
      kind: "spreadsheet"
      sourceUrl: string
      workbookManifestUrl: string
      printPdfUrl: string
    }

export type WorkbookCellStyle = {
  bold: boolean
  italic: boolean
  fontColor: string | null
  fill: string | null
  horizontal: string | null
  vertical: string | null
  wrapText: boolean
  numberFormat: string | null
  border: boolean
}

export type WorkbookCell = {
  address: string
  row: number
  column: number
  value: string
  formula?: string | null
  style?: WorkbookCellStyle
}

export type WorkbookSheet = {
  id: string
  name: string
  maxRow: number
  maxColumn: number
  cells: WorkbookCell[]
  merges: string[]
  rowHeights: Record<string, number>
  columnWidths: Record<string, number>
  hasCharts?: boolean
}

export type WorkbookManifest = {
  version: number
  sheets: WorkbookSheet[]
  hasCharts?: boolean
}

export type DocumentNavigationMode = "thumbnails" | "outline"
export type DocumentScaleMode = "custom" | "fit-width" | "fit-page"
export type SpreadsheetViewMode = "grid" | "print"

export type DocumentPreviewState = {
  status: "idle" | "loading" | "ready" | "error"
  sidebarOpen: boolean
  navigationMode: DocumentNavigationMode
  page: number
  zoom: number
  scaleMode: DocumentScaleMode
  searchQuery: string
  searchMatch: number
  fullscreen: boolean
  spreadsheetView: SpreadsheetViewMode
  sheetId: string | null
  activeCell: string
  selectionAnchor: string | null
  errorMessage?: string
}
