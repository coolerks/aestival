import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CalendarClockIcon,
  ChartNoAxesCombinedIcon,
  DownloadIcon,
  FileCode2Icon,
  FileTextIcon,
  FolderInputIcon,
  GitForkIcon,
  MessageSquareIcon,
  PencilIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"

import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import type { MockExportFormat } from "@/data/mock-conversation-management"
import {
  mockSessionProjects,
  sessionActionLabels,
  type MockSessionProjectId,
} from "@/data/mock-session-management"
import { useWorkspaceStore } from "@/store/workspace-store"

type SessionMenuContentProps = {
  sessionId: string
}

function useSessionMenuActions(sessionId: string) {
  const sessions = useWorkspaceStore((state) => state.sessions)
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const openMockConversation = useWorkspaceStore(
    (state) => state.openMockConversation
  )
  const toggleSessionStar = useWorkspaceStore(
    (state) => state.toggleSessionStar
  )
  const setSessionArchived = useWorkspaceStore(
    (state) => state.setSessionArchived
  )
  const moveSession = useWorkspaceStore((state) => state.moveSession)
  const openSessionDialog = useWorkspaceStore(
    (state) => state.openSessionDialog
  )
  const setStatsOpen = useWorkspaceStore((state) => state.setStatsOpen)
  const setForkDialogOpen = useWorkspaceStore(
    (state) => state.setForkDialogOpen
  )
  const setExportDialogOpen = useWorkspaceStore(
    (state) => state.setExportDialogOpen
  )
  const session = sessions.find((item) => item.id === sessionId)

  const ensureOpen = () => {
    if (conversationId !== sessionId) {
      openMockConversation(sessionId)
    }
  }

  return {
    session,
    open: ensureOpen,
    toggleStar: () => {
      if (!session) {
        return
      }
      toggleSessionStar(session.id)
      toast.success(
        session.starred ? "已取消 Star" : "已 Star",
        { description: "会话排序已在前端 Mock 列表中更新。" }
      )
    },
    rename: () => openSessionDialog("rename", sessionId),
    moveDialog: () => openSessionDialog("move", sessionId),
    move: (projectId: MockSessionProjectId) => {
      moveSession(sessionId, projectId)
      toast.success("会话已移动", {
        description: "仅更新前端 Mock 项目归属。",
      })
    },
    schedule: () => openSessionDialog("schedule", sessionId),
    remove: () => openSessionDialog("delete", sessionId),
    archive: () => {
      if (!session) {
        return
      }
      setSessionArchived(session.id, !session.archived)
      toast.success(
        session.archived ? "已取消归档" : "会话已归档",
        { description: "未写入本地文件或业务数据库。" }
      )
    },
    stats: () => {
      ensureOpen()
      setStatsOpen(true)
    },
    fork: () => {
      ensureOpen()
      const state = useWorkspaceStore.getState()
      setForkDialogOpen(
        true,
        state.messages[state.messages.length - 1]?.id
      )
    },
    export: (format: MockExportFormat) => {
      ensureOpen()
      setExportDialogOpen(true, "conversation", format)
    },
  }
}

function ContextMoveSubmenu({
  projectId,
  onMove,
  onSearch,
}: {
  projectId: MockSessionProjectId
  onMove: (projectId: MockSessionProjectId) => void
  onSearch: () => void
}) {
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <FolderInputIcon />
        {sessionActionLabels.move}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-48">
        <ContextMenuGroup>
          {mockSessionProjects.map((project) => (
            <ContextMenuItem
              key={project.id}
              disabled={project.id === projectId}
              onClick={() => onMove(project.id)}
            >
              <FolderInputIcon />
              {project.label}
            </ContextMenuItem>
          ))}
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={onSearch}>
            <SearchIcon />
            搜索项目…
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

function ContextExportSubmenu({
  onExport,
}: {
  onExport: (format: MockExportFormat) => void
}) {
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <DownloadIcon />
        {sessionActionLabels.export}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-44">
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => onExport("markdown")}>
            <FileCode2Icon />
            Markdown
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onExport("html")}>
            <FileCode2Icon />
            HTML
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onExport("pdf")}>
            <FileTextIcon />
            PDF
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onExport("word")}>
            <FileTextIcon />
            Word
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

export function SessionContextMenuContent({
  sessionId,
}: SessionMenuContentProps) {
  const actions = useSessionMenuActions(sessionId)
  if (!actions.session) {
    return null
  }

  return (
    <ContextMenuContent className="w-64">
      <ContextMenuGroup>
        <ContextMenuItem onClick={actions.open}>
          <MessageSquareIcon />
          {sessionActionLabels.open}
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={actions.toggleStar}>
          <StarIcon />
          {actions.session.starred
            ? sessionActionLabels.unstar
            : sessionActionLabels.star}
          <ContextMenuShortcut>⌘⇧S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={actions.rename}>
          <PencilIcon />
          {sessionActionLabels.rename}
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={actions.fork}>
          <GitForkIcon />
          {sessionActionLabels.fork}
        </ContextMenuItem>
        <ContextMoveSubmenu
          projectId={actions.session.projectId}
          onMove={actions.move}
          onSearch={actions.moveDialog}
        />
        <ContextMenuItem onClick={actions.schedule}>
          <CalendarClockIcon />
          {sessionActionLabels.schedule}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={actions.stats}>
          <ChartNoAxesCombinedIcon />
          {sessionActionLabels.stats}
        </ContextMenuItem>
        <ContextExportSubmenu onExport={actions.export} />
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuItem onClick={actions.archive}>
          {actions.session.archived ? (
            <ArchiveRestoreIcon />
          ) : (
            <ArchiveIcon />
          )}
          {actions.session.archived
            ? sessionActionLabels.unarchive
            : sessionActionLabels.archive}
          <ContextMenuShortcut>⌘⇧A</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={actions.remove}>
          <Trash2Icon />
          {sessionActionLabels.delete}
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  )
}

function DropdownMoveSubmenu({
  projectId,
  onMove,
  onSearch,
}: {
  projectId: MockSessionProjectId
  onMove: (projectId: MockSessionProjectId) => void
  onSearch: () => void
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <FolderInputIcon />
        {sessionActionLabels.move}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-48">
        <DropdownMenuGroup>
          {mockSessionProjects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              disabled={project.id === projectId}
              onClick={() => onMove(project.id)}
            >
              <FolderInputIcon />
              {project.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onSearch}>
            <SearchIcon />
            搜索项目…
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

function DropdownExportSubmenu({
  onExport,
}: {
  onExport: (format: MockExportFormat) => void
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <DownloadIcon />
        {sessionActionLabels.export}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onExport("markdown")}>
            <FileCode2Icon />
            Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("html")}>
            <FileCode2Icon />
            HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("pdf")}>
            <FileTextIcon />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("word")}>
            <FileTextIcon />
            Word
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

export function SessionDropdownMenuContent({
  sessionId,
  leadingItems,
}: SessionMenuContentProps & {
  leadingItems?: ReactNode
}) {
  const actions = useSessionMenuActions(sessionId)
  if (!actions.session) {
    return null
  }

  return (
    <DropdownMenuContent align="end" className="w-64">
      {leadingItems ? (
        <>
          <DropdownMenuGroup>{leadingItems}</DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      ) : null}
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={actions.toggleStar}>
          <StarIcon />
          {actions.session.starred
            ? sessionActionLabels.unstar
            : sessionActionLabels.star}
          <DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={actions.rename}>
          <PencilIcon />
          {sessionActionLabels.rename}
          <DropdownMenuShortcut>F2</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={actions.fork}>
          <GitForkIcon />
          {sessionActionLabels.fork}
        </DropdownMenuItem>
        <DropdownMoveSubmenu
          projectId={actions.session.projectId}
          onMove={actions.move}
          onSearch={actions.moveDialog}
        />
        <DropdownMenuItem onClick={actions.schedule}>
          <CalendarClockIcon />
          {sessionActionLabels.schedule}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {!leadingItems ? (
          <DropdownMenuItem onClick={actions.stats}>
            <ChartNoAxesCombinedIcon />
            {sessionActionLabels.stats}
          </DropdownMenuItem>
        ) : null}
        <DropdownExportSubmenu onExport={actions.export} />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={actions.archive}>
          {actions.session.archived ? (
            <ArchiveRestoreIcon />
          ) : (
            <ArchiveIcon />
          )}
          {actions.session.archived
            ? sessionActionLabels.unarchive
            : sessionActionLabels.archive}
          <DropdownMenuShortcut>⌘⇧A</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={actions.remove}>
          <Trash2Icon />
          {sessionActionLabels.delete}
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}
