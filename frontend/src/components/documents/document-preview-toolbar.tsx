import type { ReactNode } from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  MinusIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  ScanIcon,
  SearchIcon,
  StretchHorizontalIcon,
} from "lucide-react"

import { IconButton } from "@/components/shell/icon-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { DocumentScaleMode } from "@/types/document-preview"

type DocumentPreviewToolbarProps = {
  sidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  zoom: number
  minZoom: number
  maxZoom: number
  onZoomChange: (zoom: number) => void
  scaleMode?: DocumentScaleMode
  onScaleModeChange?: (mode: DocumentScaleMode) => void
  searchQuery?: string
  searchMatches?: number
  onSearchQueryChange?: (query: string) => void
  onPreviousSearchMatch?: () => void
  onNextSearchMatch?: () => void
  onFullscreen?: () => void
  leading?: ReactNode
  trailing?: ReactNode
  compact?: boolean
}

export function DocumentPreviewToolbar({
  sidebarOpen,
  onSidebarOpenChange,
  page,
  pageCount,
  onPageChange,
  zoom,
  minZoom,
  maxZoom,
  onZoomChange,
  scaleMode,
  onScaleModeChange,
  searchQuery,
  searchMatches = 0,
  onSearchQueryChange,
  onPreviousSearchMatch,
  onNextSearchMatch,
  onFullscreen,
  leading,
  trailing,
  compact = false,
}: DocumentPreviewToolbarProps) {
  const setPage = (next: number) => {
    if (!onPageChange || !pageCount) return
    onPageChange(Math.min(pageCount, Math.max(1, next)))
  }
  const setZoom = (next: number) => {
    onZoomChange(Math.min(maxZoom, Math.max(minZoom, next)))
  }

  return (
    <div
      data-document-zoom-ignore
      className="flex h-10 shrink-0 items-center gap-1 overflow-hidden border-b bg-background px-2 text-xs"
      onWheel={(event) => event.stopPropagation()}
    >
      {onSidebarOpenChange ? (
        <IconButton
          label={sidebarOpen ? "收起文档导航" : "打开文档导航"}
          onClick={() => onSidebarOpenChange(!sidebarOpen)}
        >
          {sidebarOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
        </IconButton>
      ) : null}
      {leading}
      {page && pageCount && onPageChange ? (
        <>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <IconButton label="上一页" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeftIcon />
          </IconButton>
          <label className="flex items-center gap-1 text-muted-foreground">
            <Input
              aria-label="当前页码"
              className="h-7 w-12 px-1 text-center tabular-nums"
              inputMode="numeric"
              value={page}
              onChange={(event) => {
                const next = Number(event.target.value)
                if (Number.isFinite(next)) setPage(next)
              }}
            />
            <span className="whitespace-nowrap">/ {pageCount}</span>
          </label>
          <IconButton label="下一页" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>
            <ChevronRightIcon />
          </IconButton>
        </>
      ) : null}
      <span className="min-w-2 flex-1" />
      {onSearchQueryChange ? (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="搜索文档">
                <SearchIcon />
              </Button>
            }
          />
          <PopoverContent align="end" className="w-80">
            <div className="flex items-center gap-1">
              <Input
                autoFocus
                aria-label="搜索文档内容"
                placeholder="搜索文档…"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
              <IconButton label="上一个匹配项" onClick={onPreviousSearchMatch} disabled={!searchMatches}>
                <ChevronLeftIcon />
              </IconButton>
              <IconButton label="下一个匹配项" onClick={onNextSearchMatch} disabled={!searchMatches}>
                <ChevronRightIcon />
              </IconButton>
            </div>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? `共 ${searchMatches} 个匹配项` : "输入关键词后在整份文档中查找"}
            </p>
          </PopoverContent>
        </Popover>
      ) : null}
      <IconButton label="缩小" disabled={zoom <= minZoom} onClick={() => setZoom(zoom - 25)}>
        <MinusIcon />
      </IconButton>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="ghost" size="sm" className="min-w-16 px-2 tabular-nums" aria-label="调整缩放比例">
              {zoom}% <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent align="end" className="w-48">
          {[50, 75, 100, 125, 150, 200].filter((value) => value >= minZoom && value <= maxZoom).map((value) => (
            <Button key={value} variant={zoom === value ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={() => setZoom(value)}>
              {value}%
            </Button>
          ))}
        </PopoverContent>
      </Popover>
      <IconButton label="放大" disabled={zoom >= maxZoom} onClick={() => setZoom(zoom + 25)}>
        <PlusIcon />
      </IconButton>
      {!compact && onScaleModeChange ? (
        <>
          <IconButton
            label="适合宽度"
            aria-pressed={scaleMode === "fit-width"}
            onClick={() => onScaleModeChange("fit-width")}
          >
            <StretchHorizontalIcon />
          </IconButton>
          <IconButton
            label="适合页面"
            aria-pressed={scaleMode === "fit-page"}
            onClick={() => onScaleModeChange("fit-page")}
          >
            <ScanIcon />
          </IconButton>
        </>
      ) : null}
      {onFullscreen ? (
        <IconButton label="全屏放映" onClick={onFullscreen}>
          <Maximize2Icon />
        </IconButton>
      ) : null}
      {trailing}
    </div>
  )
}
