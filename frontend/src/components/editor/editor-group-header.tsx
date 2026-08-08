import { useDroppable } from "@dnd-kit/core"
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Columns2Icon,
  CopyIcon,
  FileDiffIcon,
  MessageSquareIcon,
  MoveRightIcon,
  PinIcon,
  Rows2Icon,
  XIcon,
} from "lucide-react"
import type { CSSProperties } from "react"
import { toast } from "sonner"

import { EditorFileIcon } from "@/components/editor/editor-file-icon"
import { IconButton } from "@/components/shell/icon-button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MockFile } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"
import type {
  EditorGroupState,
  EditorInput,
} from "@/store/editor-layout"
import {
  useEditorWorkbenchStore,
  type EditorBuffer,
} from "@/store/editor-workbench-store"

export type EditorTabDragData = {
  type: "editor-tab"
  groupId: string
  editorId: string
  index: number
}

export type EditorTabStripDropData = {
  type: "editor-tab-strip"
  groupId: string
}

type EditorTabProps = {
  group: EditorGroupState
  editor: EditorInput
  index: number
  file?: MockFile
  buffer?: EditorBuffer
  groupIds: string[]
}

function editorLabel(editor: EditorInput, file?: MockFile) {
  if (editor.kind === "chat") return "聊天"
  if (editor.kind === "diff") return `${file?.name ?? "文件"}（比较）`
  return file?.name ?? "文件"
}

function EditorTab({
  group,
  editor,
  index,
  file,
  buffer,
  groupIds,
}: EditorTabProps) {
  const activateEditor = useEditorWorkbenchStore((state) => state.activateEditor)
  const pinEditor = useEditorWorkbenchStore((state) => state.pinEditor)
  const requestCloseEditor = useEditorWorkbenchStore((state) => state.requestCloseEditor)
  const splitEditor = useEditorWorkbenchStore((state) => state.splitEditor)
  const moveEditor = useEditorWorkbenchStore((state) => state.moveEditor)
  const sortable = useSortable({
    id: editor.id,
    disabled: editor.kind === "chat",
    data: {
      type: "editor-tab",
      groupId: group.id,
      editorId: editor.id,
      index,
    } satisfies EditorTabDragData,
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.45 : undefined,
  }
  const targetGroupIds = groupIds.filter((id) => id !== group.id)
  const close = () => requestCloseEditor(group.id, editor.id)
  const label = editorLabel(editor, file)
  const {
    role: _sortableRole,
    tabIndex: _sortableTabIndex,
    "aria-disabled": _sortableDisabled,
    ...sortableAttributes
  } = sortable.attributes

  return (
    <ContextMenu>
      <ContextMenuTrigger
        ref={sortable.setNodeRef}
        className="group/editor-tab-wrap relative flex h-9 shrink-0 items-stretch"
        style={style}
      >
        <TabsTrigger
          value={editor.id}
          className={cn(
            "group/editor-tab h-9 max-w-56 min-w-28 flex-none justify-start rounded-none border-x border-transparent px-2 pr-7 text-xs font-normal after:bottom-0! data-active:border-x-border data-active:bg-background",
            editor.kind === "file" && editor.preview && "italic",
          )}
          title={file?.path ?? label}
          onDoubleClick={() => {
            if (editor.kind === "file") pinEditor(group.id, editor.id)
          }}
          {...(editor.kind === "chat" ? {} : sortableAttributes)}
          {...(editor.kind === "chat" ? {} : sortable.listeners)}
          onPointerDown={(event) => {
            activateEditor(group.id, editor.id)
            if (editor.kind !== "chat") sortable.listeners?.onPointerDown?.(event)
          }}
        >
          {editor.kind === "chat" ? (
            <MessageSquareIcon />
          ) : editor.kind === "diff" ? (
            <FileDiffIcon />
          ) : file ? (
            <EditorFileIcon file={file} />
          ) : null}
          <span className="min-w-0 truncate">{label}</span>
          {buffer?.dirty ? (
            <span className="size-1.5 shrink-0 rounded-full bg-foreground" aria-label="未保存" />
          ) : null}
        </TabsTrigger>
        {editor.kind !== "chat" ? (
          <button
            type="button"
            className={cn(
              "absolute right-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/editor-tab-wrap:opacity-100 group-focus-within/editor-tab-wrap:opacity-100",
              group.activeEditorId === editor.id && "opacity-100",
            )}
            aria-label={`关闭 ${label}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              close()
            }}
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-52">
        <ContextMenuGroup>
          {editor.kind === "file" ? (
            <ContextMenuItem
              disabled={editor.pinned}
              onClick={() => pinEditor(group.id, editor.id)}
            >
              <PinIcon />固定页签
            </ContextMenuItem>
          ) : null}
          {editor.kind !== "chat" ? (
            <ContextMenuItem onClick={() => toast.success("文件路径已复制（Mock）")}>
              <CopyIcon />复制路径<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
            </ContextMenuItem>
          ) : null}
        </ContextMenuGroup>
        {editor.kind !== "chat" ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem onClick={() => splitEditor(group.id, editor.id, "right")}>
                <Columns2Icon />向右拆分
              </ContextMenuItem>
              <ContextMenuItem onClick={() => splitEditor(group.id, editor.id, "down")}>
                <Rows2Icon />向下拆分
              </ContextMenuItem>
              {targetGroupIds.length > 0 ? (
                <>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger><MoveRightIcon />移动到编辑组</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuGroup>
                        {targetGroupIds.map((targetGroupId) => (
                          <ContextMenuItem
                            key={targetGroupId}
                            onClick={() => moveEditor(
                              group.id,
                              editor.id,
                              targetGroupId,
                              useEditorWorkbenchStore.getState().workbench.groups[targetGroupId]?.editorIds.length ?? 0,
                            )}
                          >
                            <MoveRightIcon />编辑组 {groupIds.indexOf(targetGroupId) + 1}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuGroup>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger><CopyIcon />复制到编辑组</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuGroup>
                        {targetGroupIds.map((targetGroupId) => (
                          <ContextMenuItem
                            key={targetGroupId}
                            onClick={() => moveEditor(
                              group.id,
                              editor.id,
                              targetGroupId,
                              useEditorWorkbenchStore.getState().workbench.groups[targetGroupId]?.editorIds.length ?? 0,
                              true,
                            )}
                          >
                            <CopyIcon />编辑组 {groupIds.indexOf(targetGroupId) + 1}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuGroup>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                </>
              ) : null}
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem onClick={close}>
                <XIcon />关闭页签<ContextMenuShortcut>⌘W</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}

type EditorGroupHeaderProps = {
  group: EditorGroupState
  filesById: Map<string, MockFile>
  buffers: Record<string, EditorBuffer>
  editors: Record<string, EditorInput>
  groupIds: string[]
  primaryGroupId: string
  active: boolean
  canSplitRight: boolean
  canSplitDown: boolean
}

export function EditorGroupHeader({
  group,
  filesById,
  buffers,
  editors,
  groupIds,
  primaryGroupId,
  active,
  canSplitRight,
  canSplitDown,
}: EditorGroupHeaderProps) {
  const activateEditor = useEditorWorkbenchStore((state) => state.activateEditor)
  const requestCloseGroup = useEditorWorkbenchStore((state) => state.requestCloseGroup)
  const splitEditor = useEditorWorkbenchStore((state) => state.splitEditor)
  const { setNodeRef, isOver } = useDroppable({
    id: `editor-tab-strip:${group.id}`,
    data: { type: "editor-tab-strip", groupId: group.id } satisfies EditorTabStripDropData,
  })
  const activeEditor = editors[group.activeEditorId]

  return (
    <header className={cn("flex h-9 shrink-0 items-stretch border-b bg-muted/20", active && "bg-muted/30")}>
      <Tabs
        value={group.activeEditorId}
        onValueChange={(editorId) => activateEditor(group.id, editorId)}
        className="min-w-0 flex-1 gap-0"
      >
        <TabsList
          ref={setNodeRef}
          variant="line"
          className={cn(
            "no-scrollbar h-9 w-full min-w-0 justify-start gap-0 overflow-x-auto overflow-y-hidden rounded-none bg-transparent p-0",
            isOver && "bg-accent/70",
          )}
        >
          <SortableContext items={group.editorIds} strategy={horizontalListSortingStrategy}>
            {group.editorIds.map((editorId, index) => {
              const editor = editors[editorId]
              if (!editor) return null
              const file = editor.kind === "chat" ? undefined : filesById.get(editor.resourceId)
              const buffer = editor.kind === "chat" ? undefined : buffers[editor.resourceId]
              return (
                <EditorTab
                  key={editor.id}
                  group={group}
                  editor={editor}
                  index={index}
                  file={file}
                  buffer={buffer}
                  groupIds={groupIds}
                />
              )
            })}
          </SortableContext>
        </TabsList>
      </Tabs>
      <div className="flex shrink-0 items-center border-l bg-background/70 px-0.5">
        <IconButton
          label="向右拆分当前编辑器"
          disabled={!activeEditor || activeEditor.kind === "chat" || !canSplitRight}
          onClick={() => activeEditor && splitEditor(group.id, activeEditor.id, "right")}
        >
          <Columns2Icon />
        </IconButton>
        <IconButton
          label="向下拆分当前编辑器"
          disabled={!activeEditor || activeEditor.kind === "chat" || !canSplitDown}
          onClick={() => activeEditor && splitEditor(group.id, activeEditor.id, "down")}
        >
          <Rows2Icon />
        </IconButton>
        {group.id !== primaryGroupId ? (
          <IconButton label="关闭编辑组" onClick={() => requestCloseGroup(group.id)}>
            <XIcon />
          </IconButton>
        ) : null}
      </div>
    </header>
  )
}
