import { useRef, useState, type ReactNode } from "react"
import {
  BinaryIcon,
  CopyIcon,
  FileWarningIcon,
  Grid3X3Icon,
  PanelLeftIcon,
  PrinterIcon,
  RotateCcwIcon,
  SearchIcon,
  TextSelectIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import appIcon from "@/assets/icons/application/logo.svg"
import { MarkdownRenderer } from "@/components/chat/markdown-renderer"
import { DocumentPreview } from "@/components/documents/document-preview"
import { DiffEditorSurface, EditorSurface } from "@/components/editor/editor-surface"
import { EditorStatusBar } from "@/components/editor/editor-status-bar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MonacoEditorInstance } from "@/components/shared/monaco-context-menu"
import type { MockFile } from "@/data/mock-workspace-panels"
import { copyTextToClipboard, selectElementContents, selectedText } from "@/lib/context-menu-utils"
import type { EditorInput } from "@/store/editor-layout"
import {
  createEditorDiffSession,
  useEditorWorkbenchStore,
  type EditorBuffer,
} from "@/store/editor-workbench-store"
import { useDocumentPreviewStore } from "@/store/document-preview-store"

type WorkspaceEditorSurfaceProps = {
  groupId: string
  editor: EditorInput
  file: MockFile
  buffer: EditorBuffer
  onEditorMount?: (editor: MonacoEditorInstance) => void
  onEditorFocus?: () => void
}

function CsvPreview({ source }: { source: string }) {
  const rows = source.split("\n").map((row) => row.split(","))
  return (
    <ScrollArea className="app-selectable-content size-full p-4">
      <Table>
        <TableHeader><TableRow>{rows[0]?.map((cell) => <TableHead key={cell}>{cell}</TableHead>)}</TableRow></TableHeader>
        <TableBody>
          {rows.slice(1).map((row) => (
            <TableRow key={row.join("-")}>{row.map((cell, index) => <TableCell key={`${cell}-${index}`}>{cell}</TableCell>)}</TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

function StaticPreview({ file, source }: { file: MockFile; source: string }) {
  if (file.kind === "csv") return <CsvPreview source={source} />
  if (file.kind === "image") {
    return (
      <div className="grid size-full place-items-center bg-muted/20 p-8">
        <AspectRatio ratio={16 / 9} className="w-full max-w-xl rounded-lg border bg-background">
          <img src={appIcon} alt="Aestival 应用图标安全预览" className="size-full object-contain p-12" />
        </AspectRatio>
      </div>
    )
  }
  return (
    <div className="flex size-full flex-col gap-4 p-6">
      <Alert variant="destructive">
        <FileWarningIcon />
        <AlertTitle>大型二进制文件</AlertTitle>
        <AlertDescription>{file.size}，默认不加载完整内容，以防内存占用过高。</AlertDescription>
      </Alert>
      <div className="app-selectable-content rounded-lg border bg-muted/20 p-4 font-mono text-xs">
        <BinaryIcon className="mb-3 size-5" />{source}
      </div>
    </div>
  )
}

function PreviewContextMenu({
  groupId,
  editorId,
  file,
  source,
  children,
}: {
  groupId: string
  editorId: string
  file: MockFile
  source: string
  children: ReactNode
}) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const copySurfaceText = () => {
    const selection = selectedText()
    void copyTextToClipboard(selection || source).then((copied) => {
      if (copied) toast.success(selection ? "已复制选中文本" : "已复制文件内容")
      else toast.warning("无法写入剪贴板")
    })
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger className="min-h-0 flex-1">
        <div ref={surfaceRef} className="app-selectable-content size-full">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => toast.success("文件路径已复制（Mock）")}><CopyIcon />复制路径<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => useEditorWorkbenchStore.getState().requestCloseEditor(groupId, editorId)}><XIcon />关闭文件<ContextMenuShortcut>⌘W</ContextMenuShortcut></ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={copySurfaceText}><CopyIcon />复制选中文本/文件内容<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => toast.info("请在当前文件预览中使用系统查找")}><SearchIcon />查找文本<ContextMenuShortcut>⌘F</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => surfaceRef.current && selectElementContents(surfaceRef.current)}><TextSelectIcon />全选内容<ContextMenuShortcut>⌘A</ContextMenuShortcut></ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function DocumentPreviewContextMenu({
  groupId,
  editorId,
  file,
  children,
}: {
  groupId: string
  editorId: string
  file: MockFile
  children: ReactNode
}) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const state = useDocumentPreviewStore((store) => store.states[editorId])
  const updateState = useDocumentPreviewStore((store) => store.updateState)
  const copySelection = () => {
    const selection = selectedText()
    if (!selection) {
      toast.info("请先选择要复制的文档内容")
      return
    }
    void copyTextToClipboard(selection).then((copied) => {
      if (copied) toast.success("已复制选中文本")
      else toast.warning("无法写入剪贴板")
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="min-h-0 flex-1">
        <div ref={surfaceRef} className="app-selectable-content size-full">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => toast.success("文件路径已复制（Mock）")}>
            <CopyIcon />复制文件路径<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => useEditorWorkbenchStore.getState().requestCloseEditor(groupId, editorId)}>
            <XIcon />关闭文档<ContextMenuShortcut>⌘W</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={copySelection}><CopyIcon />复制选中文本<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => surfaceRef.current && selectElementContents(surfaceRef.current)}><TextSelectIcon />全选文档内容<ContextMenuShortcut>⌘A</ContextMenuShortcut></ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          {file.kind !== "spreadsheet" ? (
            <ContextMenuItem onClick={() => updateState(editorId, { sidebarOpen: !state?.sidebarOpen })}>
              <PanelLeftIcon />{state?.sidebarOpen ? "收起文档导航" : "打开文档导航"}
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => {
              const spreadsheetView = state?.spreadsheetView === "print" ? "grid" : "print"
              updateState(editorId, {
                spreadsheetView,
                zoom: spreadsheetView === "grid"
                  ? Math.min(200, Math.max(50, state?.zoom ?? 100))
                  : Math.min(400, Math.max(25, state?.zoom ?? 100)),
              })
            }}>
              {state?.spreadsheetView === "print" ? <Grid3X3Icon /> : <PrinterIcon />}
              {state?.spreadsheetView === "print" ? "切换到网格" : "切换到打印预览"}
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => updateState(editorId, {
            zoom: 100,
            scaleMode: file.kind === "spreadsheet" ? "custom" : "fit-width",
          })}>
            <RotateCcwIcon />重置视图
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function MarkdownPreview({ source }: { source: string }) {
  return (
    <ScrollArea className="app-selectable-content size-full">
      <article className="mx-auto max-w-3xl p-8"><MarkdownRenderer source={source} /></article>
    </ScrollArea>
  )
}

export function WorkspaceEditorSurface({
  groupId,
  editor,
  file,
  buffer,
  onEditorMount,
  onEditorFocus,
}: WorkspaceEditorSurfaceProps) {
  const setEditorSource = useEditorWorkbenchStore((state) => state.setEditorSource)
  const setEditorLanguage = useEditorWorkbenchStore((state) => state.setEditorLanguage)
  const setEditorTabSize = useEditorWorkbenchStore((state) => state.setEditorTabSize)
  const setEditorEncoding = useEditorWorkbenchStore((state) => state.setEditorEncoding)
  const setEditorLineEnding = useEditorWorkbenchStore((state) => state.setEditorLineEnding)
  const [line, setLine] = useState(1)
  const [column, setColumn] = useState(1)
  const textCapable = file.kind === "code" || file.kind === "json" || file.kind === "markdown"
  const modelPath = `${file.path}?group=${groupId}&editor=${editor.id}`
  const editorSurface = (
    <EditorSurface
      key={`${groupId}-${editor.id}-${buffer.languageId}`}
      fileId={file.id}
      modelPath={modelPath}
      language={buffer.languageId}
      value={buffer.workingSource}
      readOnly={buffer.readonly}
      tabSize={buffer.tabSize}
      onChange={(source) => setEditorSource(groupId, editor.id, file.id, source)}
      onMount={onEditorMount}
      onFocus={onEditorFocus}
      onCursorPositionChange={(nextLine, nextColumn) => {
        setLine(nextLine)
        setColumn(nextColumn)
      }}
    />
  )

  const diffSession = createEditorDiffSession(editor, buffer)
  if (editor.kind === "diff" && diffSession?.resourceId === file.id) {
    return (
      <DiffEditorSurface
        original={diffSession.left.source}
        modified={diffSession.right.source}
        language={buffer.languageId}
        mode={diffSession.mode}
      />
    )
  }

  if (editor.kind === "file" && file.kind === "markdown") {
    const content = editor.contentView === "source"
      ? editorSurface
      : editor.contentView === "preview"
        ? <MarkdownPreview source={buffer.workingSource} />
        : (
          <ResizablePanelGroup orientation="horizontal" className="min-h-0">
            <ResizablePanel id={`${editor.id}-source`} minSize="280px">{editorSurface}</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id={`${editor.id}-preview`} minSize="280px"><MarkdownPreview source={buffer.workingSource} /></ResizablePanel>
          </ResizablePanelGroup>
        )
    return (
      <div className="flex size-full min-h-0 flex-col">
        <div className="min-h-0 flex-1">{content}</div>
        <EditorStatusBar
          languageId={buffer.languageId}
          line={line}
          column={column}
          encoding={buffer.encoding}
          lineEnding={buffer.lineEnding}
          tabSize={buffer.tabSize}
          fileSize={file.size}
          dirty={buffer.dirty}
          readonly={buffer.readonly}
          onTabSizeChange={(tabSize) => setEditorTabSize(file.id, tabSize)}
          onEncodingChange={(encoding) => setEditorEncoding(file.id, encoding)}
          onLineEndingChange={(lineEnding) => setEditorLineEnding(file.id, lineEnding)}
          onLanguageChange={(languageId) => setEditorLanguage(file.id, languageId)}
        />
      </div>
    )
  }

  if (textCapable) {
    return (
      <div className="flex size-full min-h-0 flex-col">
        <div className="min-h-0 flex-1">{editorSurface}</div>
        <EditorStatusBar
          languageId={buffer.languageId}
          line={line}
          column={column}
          encoding={buffer.encoding}
          lineEnding={buffer.lineEnding}
          tabSize={buffer.tabSize}
          fileSize={file.size}
          dirty={buffer.dirty}
          readonly={buffer.readonly}
          onTabSizeChange={(tabSize) => setEditorTabSize(file.id, tabSize)}
          onEncodingChange={(encoding) => setEditorEncoding(file.id, encoding)}
          onLineEndingChange={(lineEnding) => setEditorLineEnding(file.id, lineEnding)}
          onLanguageChange={(languageId) => setEditorLanguage(file.id, languageId)}
        />
      </div>
    )
  }

  if (["pdf", "word", "presentation", "spreadsheet"].includes(file.kind)) {
    return (
      <div className="flex size-full min-h-0 flex-col">
        <DocumentPreviewContextMenu groupId={groupId} editorId={editor.id} file={file}>
          <DocumentPreview editorId={editor.id} file={file} />
        </DocumentPreviewContextMenu>
      </div>
    )
  }

  return (
    <div className="flex size-full min-h-0 flex-col">
      <PreviewContextMenu groupId={groupId} editorId={editor.id} file={file} source={buffer.workingSource}>
        <StaticPreview file={file} source={buffer.workingSource} />
      </PreviewContextMenu>
      <div className="flex h-7 shrink-0 items-center gap-3 border-t px-3 text-[11px] text-muted-foreground">
        <span>{file.language}</span><span>{file.encoding}</span><span>{file.lineEnding}</span><span className="ml-auto">{file.size} · {file.modifiedAt}</span>
      </div>
    </div>
  )
}
