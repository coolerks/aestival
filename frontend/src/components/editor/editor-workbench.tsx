import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { FileDiffIcon, FileIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { EditorFileIcon } from "@/components/editor/editor-file-icon"
import {
  EditorGroupHeader,
  type EditorTabDragData,
  type EditorTabStripDropData,
} from "@/components/editor/editor-group-header"
import { EditorToolbar } from "@/components/editor/editor-toolbar"
import { WorkspaceEditorSurface } from "@/components/editor/workspace-editor-surface"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { MonacoEditorInstance } from "@/components/shared/monaco-context-menu"
import { mockFiles, type MockFile } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"
import {
  collectLayoutGroupIds,
  type EditorDropEdge,
  type EditorGroupState,
  type EditorInput,
  type EditorLayoutNode,
} from "@/store/editor-layout"
import {
  useEditorWorkbenchStore,
  type EditorBuffer,
} from "@/store/editor-workbench-store"

type EditorEdgeDropData = {
  type: "editor-edge"
  groupId: string
  edge: EditorDropEdge
}

function editorLabel(editor: EditorInput, filesById: Map<string, MockFile>) {
  if (editor.kind === "chat") return "聊天"
  const file = filesById.get(editor.resourceId)
  return editor.kind === "diff" ? `${file?.name ?? "文件"}（比较）` : file?.name ?? "文件"
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = ref.current
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
  return [ref, size] as const
}

function EditorEdgeDropZone({
  groupId,
  edge,
}: {
  groupId: string
  edge: EditorDropEdge
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `editor-edge:${groupId}:${edge}`,
    data: { type: "editor-edge", groupId, edge } satisfies EditorEdgeDropData,
  })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute pointer-events-auto transition-colors",
        edge === "top" && "inset-x-[20%] top-9 h-1/5",
        edge === "bottom" && "inset-x-[20%] bottom-0 h-1/5",
        edge === "left" && "inset-y-1/4 left-0 w-1/4",
        edge === "right" && "inset-y-1/4 right-0 w-1/4",
        isOver ? "bg-primary/20 ring-2 ring-inset ring-primary" : "bg-primary/5",
      )}
      aria-hidden="true"
    />
  )
}

type GroupPaneProps = {
  group: EditorGroupState
  filesById: Map<string, MockFile>
  buffers: Record<string, EditorBuffer>
  editors: Record<string, EditorInput>
  active: boolean
  groupIds: string[]
  primaryGroupId: string
  chat: ReactNode
  draggingEditor: boolean
}

function EditorGroupPane({
  group,
  filesById,
  buffers,
  editors,
  active,
  groupIds,
  primaryGroupId,
  chat,
  draggingEditor,
}: GroupPaneProps) {
  const focusGroup = useEditorWorkbenchStore((state) => state.focusGroup)
  const saveEditorBuffer = useEditorWorkbenchStore((state) => state.saveEditorBuffer)
  const openDiff = useEditorWorkbenchStore((state) => state.openDiff)
  const setEditorContentView = useEditorWorkbenchStore((state) => state.setEditorContentView)
  const setDiffMode = useEditorWorkbenchStore((state) => state.setDiffMode)
  const closeDiff = useEditorWorkbenchStore((state) => state.closeDiff)
  const acceptDiffSide = useEditorWorkbenchStore((state) => state.acceptDiffSide)
  const editorRefs = useRef(new Map<string, MonacoEditorInstance>())
  const [paneRef, paneSize] = useElementSize<HTMLElement>()
  const editor = editors[group.activeEditorId]
  const file = editor?.kind === "chat" ? undefined : filesById.get(editor.resourceId)
  const buffer = editor?.kind === "chat" ? undefined : buffers[editor.resourceId]
  const canSplitRight = paneSize.width >= 640
  const canSplitDown = paneSize.height >= 460

  const runAction = (actionId: string, fallback: string) => {
    const action = editor ? editorRefs.current.get(editor.id)?.getAction(actionId) : undefined
    if (action) void action.run()
    else toast.info(fallback)
  }

  return (
    <section
      ref={paneRef}
      className={cn(
        "relative flex size-full min-h-0 min-w-0 flex-col bg-background",
        active && "outline outline-1 -outline-offset-1 outline-ring/30",
      )}
      aria-label={file ? `${file.name} 编辑组` : "聊天编辑组"}
      onPointerDownCapture={() => {
        if (!active) focusGroup(group.id)
      }}
    >
      <EditorGroupHeader
        group={group}
        filesById={filesById}
        buffers={buffers}
        editors={editors}
        groupIds={groupIds}
        primaryGroupId={primaryGroupId}
        active={active}
        canSplitRight={canSplitRight}
        canSplitDown={canSplitDown}
      />
      {editor && file && buffer ? (
        <EditorToolbar
          editor={editor}
          file={file}
          dirty={buffer.dirty}
          readonly={buffer.readonly}
          externalChange={buffer.externalChange}
          onSave={() => {
            saveEditorBuffer(file.id)
            toast.success("已保存到工作副本")
          }}
          onFormat={() => runAction("editor.action.formatDocument", "当前语言未提供格式化服务")}
          onFind={() => runAction("actions.find", "当前预览不支持文本查找")}
          onSuggest={() => runAction("aestival.trigger-local-completion", "当前预览不支持代码提示")}
          onOpenDiff={() => openDiff(
            file.id,
            buffer.externalChange ? "working-external" : "saved-working",
            group.id,
          )}
          onContentViewChange={(view) => setEditorContentView(group.id, editor.id, view)}
          onDiffModeChange={(mode) => setDiffMode(group.id, editor.id, mode)}
        />
      ) : null}
      <div className="min-h-0 min-w-0 flex-1">
        {editor?.kind === "chat" ? (
          chat
        ) : editor && file && buffer ? (
          <WorkspaceEditorSurface
            groupId={group.id}
            editor={editor}
            file={file}
            buffer={buffer}
            onEditorMount={(instance) => {
              editorRefs.current.set(editor.id, instance)
            }}
            onEditorFocus={() => focusGroup(group.id)}
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">从文件树打开文件以开始编辑</div>
        )}
      </div>
      {editor?.kind === "diff" ? (
        <div className="flex h-9 shrink-0 items-center justify-end gap-2 border-t px-2">
          <Button variant="outline" size="sm" onClick={() => acceptDiffSide(group.id, editor.id, "left")}>采用左侧</Button>
          <Button size="sm" onClick={() => acceptDiffSide(group.id, editor.id, "right")}>采用右侧</Button>
          <Button variant="ghost" size="sm" onClick={() => closeDiff(group.id, editor.id)}><XIcon data-icon="inline-start" />取消</Button>
        </div>
      ) : null}
      {draggingEditor ? (
        <div className="pointer-events-none absolute inset-0">
          {(["top", "right", "bottom", "left"] as const).map((edge) => (
            <EditorEdgeDropZone key={edge} groupId={group.id} edge={edge} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

type LayoutNodeViewProps = Omit<GroupPaneProps, "group" | "active"> & {
  node: EditorLayoutNode
  groups: Record<string, EditorGroupState>
  activeGroupId: string
}

function layoutChildId(node: EditorLayoutNode) {
  return node.type === "group" ? node.groupId : node.id
}

function EditorLayoutNodeView({
  node,
  groups,
  filesById,
  buffers,
  editors,
  activeGroupId,
  groupIds,
  primaryGroupId,
  chat,
  draggingEditor,
}: LayoutNodeViewProps) {
  const setLayoutSizes = useEditorWorkbenchStore((state) => state.setLayoutSizes)
  if (node.type === "group") {
    const group = groups[node.groupId]
    if (!group) return null
    return (
      <EditorGroupPane
        group={group}
        filesById={filesById}
        buffers={buffers}
        editors={editors}
        active={group.id === activeGroupId}
        groupIds={groupIds}
        primaryGroupId={primaryGroupId}
        chat={chat}
        draggingEditor={draggingEditor}
      />
    )
  }

  const panelIds = node.children.map(layoutChildId)
  const defaultLayout = Object.fromEntries(panelIds.map((panelId, index) => [panelId, node.sizes[index] ?? 100 / panelIds.length]))
  return (
    <ResizablePanelGroup
      id={node.id}
      orientation={node.orientation}
      defaultLayout={defaultLayout}
      className="min-h-0 min-w-0"
      onLayoutChanged={(layout, meta) => {
        if (!meta.isUserInteraction) return
        setLayoutSizes(node.id, panelIds.map((panelId, index) => layout[panelId] ?? node.sizes[index] ?? 0))
      }}
    >
      {node.children.map((child, index) => {
        const panelId = panelIds[index]!
        return (
          <Fragment key={panelId}>
            {index > 0 ? <ResizableHandle withHandle /> : null}
            <ResizablePanel
              id={panelId}
              defaultSize={`${node.sizes[index] ?? 100 / panelIds.length}%`}
              minSize={node.orientation === "horizontal" ? "320px" : "220px"}
            >
              <EditorLayoutNodeView
                node={child}
                groups={groups}
                filesById={filesById}
                buffers={buffers}
                editors={editors}
                activeGroupId={activeGroupId}
                groupIds={groupIds}
                primaryGroupId={primaryGroupId}
                chat={chat}
                draggingEditor={draggingEditor}
              />
            </ResizablePanel>
          </Fragment>
        )
      })}
    </ResizablePanelGroup>
  )
}

export function EditorWorkbench({ chat }: { chat: ReactNode }) {
  const workbench = useEditorWorkbenchStore((state) => state.workbench)
  const buffers = useEditorWorkbenchStore((state) => state.editorBuffers)
  const moveEditor = useEditorWorkbenchStore((state) => state.moveEditor)
  const splitWithEditor = useEditorWorkbenchStore((state) => state.splitWithEditor)
  const reorderEditor = useEditorWorkbenchStore((state) => state.reorderEditor)
  const [draggedEditorId, setDraggedEditorId] = useState<string | null>(null)
  const copyModifier = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const filesById = useMemo(() => new Map(mockFiles.map((file) => [file.id, file])), [])
  const groupIds = collectLayoutGroupIds(workbench.layout)

  useEffect(() => {
    const update = (event: KeyboardEvent) => {
      copyModifier.current = /Mac|iPhone|iPad/.test(navigator.platform) ? event.altKey : event.ctrlKey
    }
    const clear = () => { copyModifier.current = false }
    window.addEventListener("keydown", update)
    window.addEventListener("keyup", update)
    window.addEventListener("blur", clear)
    return () => {
      window.removeEventListener("keydown", update)
      window.removeEventListener("keyup", update)
      window.removeEventListener("blur", clear)
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as EditorTabDragData | undefined
    if (data?.type !== "editor-tab") return
    const editor = workbench.editors[data.editorId]
    if (!editor || editor.kind === "chat") return
    useEditorWorkbenchStore.getState().pinEditor(data.groupId, data.editorId)
    setDraggedEditorId(data.editorId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const source = event.active.data.current as EditorTabDragData | undefined
    const target = event.over?.data.current as EditorTabDragData | EditorTabStripDropData | EditorEdgeDropData | undefined
    setDraggedEditorId(null)
    if (!source || source.type !== "editor-tab" || !target) return
    const copy = copyModifier.current
    if (target.type === "editor-edge") {
      splitWithEditor(source.groupId, source.editorId, target.groupId, target.edge, copy)
      return
    }
    if (target.type === "editor-tab") {
      if (source.groupId === target.groupId) reorderEditor(source.groupId, source.editorId, target.index)
      else moveEditor(source.groupId, source.editorId, target.groupId, target.index, copy)
      return
    }
    const targetGroup = workbench.groups[target.groupId]
    if (targetGroup) moveEditor(source.groupId, source.editorId, target.groupId, targetGroup.editorIds.length, copy)
  }

  const draggedEditor = draggedEditorId ? workbench.editors[draggedEditorId] : undefined
  const draggedFile = draggedEditor?.kind === "chat" ? undefined : draggedEditor ? filesById.get(draggedEditor.resourceId) : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragCancel={() => setDraggedEditorId(null)}
      onDragEnd={handleDragEnd}
    >
      <section className="size-full min-h-0 min-w-0" aria-label="文件编辑工作台">
        <EditorLayoutNodeView
          node={workbench.layout}
          groups={workbench.groups}
          filesById={filesById}
          buffers={buffers}
          editors={workbench.editors}
          activeGroupId={workbench.activeGroupId}
          groupIds={groupIds}
          primaryGroupId={workbench.primaryGroupId}
          chat={chat}
          draggingEditor={Boolean(draggedEditorId)}
        />
      </section>
      <DragOverlay>
        {draggedEditor ? (
          <div className="flex h-8 max-w-56 items-center gap-2 rounded-md bg-popover px-3 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10">
            {draggedEditor.kind === "diff" ? <FileDiffIcon className="size-4" /> : draggedFile ? <EditorFileIcon file={draggedFile} /> : <FileIcon className="size-4" />}
            <span className="truncate">{editorLabel(draggedEditor, filesById)}</span>
            {copyModifier.current ? <span className="text-muted-foreground">复制</span> : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
