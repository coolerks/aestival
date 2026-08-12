import { Fragment, useEffect, useState, type ReactNode } from "react"
import {
  Columns2Icon,
  FilesIcon,
  MessageSquareIcon,
  NetworkIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"

import { NoteEditor } from "@/components/notes/note-editor"
import { NoteGraph } from "@/components/notes/note-graph"
import { IconButton } from "@/components/shell/icon-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import { useWorkspaceStore } from "@/store/workspace-store"
import type {
  NoteEditorGroup,
  NoteEditorMode,
  NoteTab,
} from "@/types/project-workspace"

const modeLabels: Record<NoteEditorMode, string> = {
  source: "源码",
  split: "并排",
  instant: "即时",
  preview: "预览",
}

function TabIcon({ tab }: { tab: NoteTab }) {
  if (tab.kind === "chat") return <MessageSquareIcon />
  if (tab.kind === "graph") return <NetworkIcon />
  return <PencilIcon />
}

function NoteTabMenu({
  projectId,
  group,
  tab,
  onClose,
}: {
  projectId: string
  group: NoteEditorGroup
  tab: NoteTab
  onClose: (tab: NoteTab) => void
}) {
  const split = useProjectWorkspaceStore((state) => state.splitActiveNote)
  const setMode = useProjectWorkspaceStore((state) => state.setNoteEditorMode)
  return (
    <ContextMenuContent className="w-52">
      {tab.kind === "note" && tab.resourceId ? (
        <>
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => split(projectId)}><Columns2Icon />在侧边打开</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger><PencilIcon />编辑模式</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {(Object.keys(modeLabels) as NoteEditorMode[]).map((mode) => (
                  <ContextMenuItem key={mode} onClick={() => setMode(projectId, group.id, tab.resourceId as string, mode)}><PencilIcon />{modeLabels[mode]}</ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
          <ContextMenuSeparator />
        </>
      ) : null}
      <ContextMenuItem disabled={tab.kind === "chat"} onClick={() => onClose(tab)}><XIcon />关闭页签</ContextMenuItem>
    </ContextMenuContent>
  )
}

function NoteEditorGroupView({
  projectId,
  group,
  chat,
}: {
  projectId: string
  group: NoteEditorGroup
  chat: ReactNode
}) {
  const workspace = useProjectWorkspaceStore((state) => state.noteWorkspaces[projectId])
  const buffers = useProjectWorkspaceStore((state) => state.noteBuffers)
  const setActive = useProjectWorkspaceStore((state) => state.setActiveNoteTab)
  const closeTab = useProjectWorkspaceStore((state) => state.closeNoteTab)
  const focusGroup = useProjectWorkspaceStore((state) => state.focusNoteGroup)
  const closeGroup = useProjectWorkspaceStore((state) => state.closeNoteGroup)
  const markSaved = useProjectWorkspaceStore((state) => state.markNoteSaved)
  const discardChanges = useProjectWorkspaceStore((state) => state.discardNoteChanges)
  const [pendingClose, setPendingClose] = useState<
    | { kind: "tab"; tabId: string; noteIds: string[] }
    | { kind: "group"; noteIds: string[] }
    | null
  >(null)
  const activeTab = group.tabs.find((tab) => tab.id === group.activeTabId) ?? group.tabs[0]
  if (!workspace || !activeTab) return null

  const lastDirtyReferences = (tabs: NoteTab[]) => {
    const closingIds = new Set(tabs.map((tab) => tab.id))
    return Array.from(
      new Set(
        tabs
          .filter(
            (tab) =>
              tab.kind === "note" &&
              tab.resourceId &&
              buffers[tab.resourceId]?.status === "dirty" &&
              !workspace.groups.some((candidateGroup) =>
                candidateGroup.tabs.some(
                  (candidateTab) =>
                    candidateTab.resourceId === tab.resourceId &&
                    !closingIds.has(candidateTab.id),
                ),
              ),
          )
          .map((tab) => tab.resourceId as string),
      ),
    )
  }

  const requestTabClose = (tab: NoteTab) => {
    const noteIds = lastDirtyReferences([tab])
    if (noteIds.length) {
      setPendingClose({ kind: "tab", tabId: tab.id, noteIds })
      return
    }
    closeTab(projectId, group.id, tab.id)
  }

  const requestGroupClose = () => {
    const noteIds = lastDirtyReferences(group.tabs)
    if (noteIds.length) {
      setPendingClose({ kind: "group", noteIds })
      return
    }
    closeGroup(projectId, group.id)
  }

  const finishPendingClose = (save: boolean) => {
    if (!pendingClose) return
    pendingClose.noteIds.forEach((noteId) =>
      save ? markSaved(noteId) : discardChanges(noteId),
    )
    if (pendingClose.kind === "tab") {
      closeTab(projectId, group.id, pendingClose.tabId)
    } else {
      closeGroup(projectId, group.id)
    }
    setPendingClose(null)
  }

  return (
    <>
      <section
        className={cn("flex size-full min-h-0 flex-col bg-background", workspace.focusedGroupId === group.id && "ring-1 ring-inset ring-border")}
        onPointerDownCapture={() => focusGroup(projectId, group.id)}
      >
        <div className="flex h-9 shrink-0 items-center border-b bg-muted/15 px-1">
          <Tabs value={group.activeTabId} onValueChange={(value) => setActive(projectId, group.id, value)} className="min-w-0 flex-1 gap-0">
            <TabsList variant="line" className="h-8 max-w-full justify-start overflow-x-auto">
              {group.tabs.map((tab) => {
                const dirty = tab.resourceId ? buffers[tab.resourceId]?.status === "dirty" : false
                return (
                  <ContextMenu key={tab.id}>
                    <ContextMenuTrigger render={<div className="group/tab flex items-center" />}>
                      <TabsTrigger value={tab.id} className="max-w-56 gap-1.5">
                        <TabIcon tab={tab} />
                        <span className={cn("truncate", tab.preview && "italic")}>{tab.title}</span>
                        {dirty ? <span className="size-1.5 shrink-0 rounded-full bg-foreground" aria-label="未保存" /> : null}
                      </TabsTrigger>
                      {tab.kind !== "chat" ? (
                        <IconButton
                          label={`关闭${tab.title}`}
                          className={cn("-ml-1 size-6", tab.id !== group.activeTabId && "opacity-0 group-hover/tab:opacity-100 group-focus-within/tab:opacity-100")}
                          onClick={(event) => { event.stopPropagation(); requestTabClose(tab) }}
                        ><XIcon /></IconButton>
                      ) : null}
                    </ContextMenuTrigger>
                    <NoteTabMenu projectId={projectId} group={group} tab={tab} onClose={requestTabClose} />
                  </ContextMenu>
                )
              })}
            </TabsList>
          </Tabs>
          {group.id !== "group-main" ? <IconButton label="关闭编辑组" onClick={requestGroupClose}><XIcon /></IconButton> : null}
        </div>
        <div className="min-h-0 flex-1">
          {activeTab.kind === "chat" ? chat : activeTab.kind === "graph" ? <NoteGraph projectId={projectId} /> : activeTab.resourceId ? <NoteEditor projectId={projectId} groupId={group.id} noteId={activeTab.resourceId} /> : null}
        </div>
      </section>
      <AlertDialog open={Boolean(pendingClose)} onOpenChange={(open) => !open && setPendingClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>关闭前处理未保存更改？</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingClose?.noteIds.length ?? 0} 篇笔记只在当前关闭范围内打开。保存只会更新内存 Mock Buffer，不会写入本地文件。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => finishPendingClose(false)}>不保存</AlertDialogAction>
            <AlertDialogAction onClick={() => finishPendingClose(true)}>保存并关闭</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function NoteWorkspacePage({ chat }: { chat: ReactNode }) {
  const projectId = useProjectWorkspaceStore((state) => state.activeProjectId)
  const project = useProjectWorkspaceStore((state) => state.projects.find((item) => item.id === state.activeProjectId))
  const workspace = useProjectWorkspaceStore((state) => state.noteWorkspaces[state.activeProjectId])
  const rightOpen = useWorkspaceStore((state) => state.rightPanelOpen)
  const bottomOpen = useWorkspaceStore((state) => state.bottomPanelOpen)

  useEffect(() => {
    if (!workspace) return
    if (workspace.rightPanelOpen !== rightOpen) {
      useProjectWorkspaceStore.getState().setNotePanelOpen(projectId, "right", rightOpen)
    }
    if (workspace.bottomPanelOpen !== bottomOpen) {
      useProjectWorkspaceStore.getState().setNotePanelOpen(projectId, "bottom", bottomOpen)
    }
  }, [bottomOpen, projectId, rightOpen, workspace])

  if (!project || project.kind !== "note" || !workspace) {
    return <Empty className="h-full rounded-none border-0"><EmptyHeader><EmptyMedia variant="icon"><FilesIcon /></EmptyMedia><EmptyTitle>笔记工作区不可用</EmptyTitle><EmptyDescription>当前项目快照缺失，请切换项目后重试。</EmptyDescription></EmptyHeader></Empty>
  }

  if (workspace.groups.length === 1) {
    const group = workspace.groups[0]
    return group ? <NoteEditorGroupView projectId={projectId} group={group} chat={chat} /> : null
  }

  return (
    <ResizablePanelGroup orientation="horizontal">
      {workspace.groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? <ResizableHandle /> : null}
          <ResizablePanel id={`note-${group.id}`} minSize="320px" defaultSize={`${100 / workspace.groups.length}%`}>
            <NoteEditorGroupView projectId={projectId} group={group} chat={chat} />
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  )
}
