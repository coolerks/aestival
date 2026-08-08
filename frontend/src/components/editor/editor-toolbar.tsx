import { Fragment } from "react"
import {
  AlignLeftIcon,
  EyeIcon,
  FileCode2Icon,
  GitCompareArrowsIcon,
  LightbulbIcon,
  SaveIcon,
  SearchIcon,
} from "lucide-react"

import { IconButton } from "@/components/shell/icon-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { MockFile } from "@/data/mock-workspace-panels"
import type {
  EditorContentView,
  EditorDiffMode,
  EditorInput,
} from "@/store/editor-layout"

export type EditorToolbarProps = {
  editor: EditorInput
  file: MockFile
  dirty: boolean
  readonly: boolean
  externalChange: boolean
  onSave: () => void
  onFormat: () => void
  onFind: () => void
  onSuggest: () => void
  onOpenDiff: () => void
  onContentViewChange: (view: EditorContentView) => void
  onDiffModeChange: (mode: EditorDiffMode) => void
}

export function EditorToolbar({
  editor,
  file,
  dirty,
  readonly,
  externalChange,
  onSave,
  onFormat,
  onFind,
  onSuggest,
  onOpenDiff,
  onContentViewChange,
  onDiffModeChange,
}: EditorToolbarProps) {
  const pathParts = file.path.split("/").filter(Boolean)
  const textCapable = file.kind === "code" || file.kind === "json" || file.kind === "markdown"

  return (
    <div className="flex min-h-9 shrink-0 items-center gap-1 border-b px-2 text-xs">
      <FileCode2Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Breadcrumb className="min-w-0 max-w-[min(28rem,40vw)]" title={file.path}>
        <BreadcrumbList className="flex-nowrap gap-1 text-xs">
          {pathParts.slice(0, -1).map((part, index) => (
            <Fragment key={`${part}-${index}`}>
              <BreadcrumbItem className="min-w-0 max-w-24 truncate">{part}</BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem className="min-w-0 max-w-40">
            <BreadcrumbPage className="truncate">{file.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <span className="flex-1" />
      {editor.kind === "file" && file.kind === "markdown" ? (
        <ToggleGroup
          value={[editor.contentView]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === "source" || next === "preview" || next === "split") {
              onContentViewChange(next)
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Markdown 显示方式"
        >
          <ToggleGroupItem value="source">源码</ToggleGroupItem>
          <ToggleGroupItem value="preview">预览</ToggleGroupItem>
          <ToggleGroupItem value="split">并排</ToggleGroupItem>
        </ToggleGroup>
      ) : null}
      {editor.kind === "diff" ? (
        <ToggleGroup
          value={[editor.mode]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === "side-by-side" || next === "inline") onDiffModeChange(next)
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="差异显示方式"
        >
          <ToggleGroupItem value="side-by-side">并排</ToggleGroupItem>
          <ToggleGroupItem value="inline">行内</ToggleGroupItem>
        </ToggleGroup>
      ) : null}
      {textCapable && editor.kind !== "diff" ? (
        <>
          <IconButton label="查找和替换" onClick={onFind}><SearchIcon /></IconButton>
          <IconButton label="显示本地代码提示" onClick={onSuggest}><LightbulbIcon /></IconButton>
          <IconButton label="格式化文档" onClick={onFormat} disabled={readonly}><AlignLeftIcon /></IconButton>
        </>
      ) : null}
      {editor.kind === "file" && textCapable ? (
        <IconButton label="比较已保存内容与工作副本" onClick={onOpenDiff}>
          <GitCompareArrowsIcon />
        </IconButton>
      ) : null}
      {editor.kind === "file" && file.kind === "markdown" ? (
        <EyeIcon className="size-3.5 text-muted-foreground" aria-label="支持 Markdown 预览" />
      ) : null}
      <IconButton
        label={readonly ? "只读文件" : dirty ? "保存文件" : "已保存"}
        onClick={onSave}
        disabled={readonly || !dirty}
      >
        <SaveIcon />
      </IconButton>
      {externalChange ? <span className="text-muted-foreground" role="status">外部变更</span> : null}
      {dirty ? <span className="text-muted-foreground">未保存</span> : null}
    </div>
  )
}
