import { toast } from "sonner"

import { ScheduledTaskDialog } from "@/components/session/scheduled-task-dialog"
import { SessionDeleteDialog } from "@/components/session/session-delete-dialog"
import { SessionMoveDialog } from "@/components/session/session-move-dialog"
import { SessionRenameDialog } from "@/components/session/session-rename-dialog"
import { useWorkspaceStore } from "@/store/workspace-store"

export function SessionManagementDialogs() {
  const dialog = useWorkspaceStore((state) => state.sessionDialog)
  const sessions = useWorkspaceStore((state) => state.sessions)
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const runState = useWorkspaceStore((state) => state.runState)
  const closeDialog = useWorkspaceStore((state) => state.closeSessionDialog)
  const renameSession = useWorkspaceStore((state) => state.renameSession)
  const moveSession = useWorkspaceStore((state) => state.moveSession)
  const deleteSession = useWorkspaceStore((state) => state.deleteSession)
  const createScheduledTask = useWorkspaceStore(
    (state) => state.createScheduledTask
  )
  const session = dialog
    ? sessions.find((item) => item.id === dialog.sessionId)
    : undefined

  if (!dialog || !session) {
    return null
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
    }
  }

  return (
    <>
      <SessionRenameDialog
        open={dialog.kind === "rename"}
        session={session}
        onOpenChange={handleOpenChange}
        onRename={(title) => {
          renameSession(session.id, title)
          toast.success("会话已重命名", {
            description: "标题栏、侧栏和全局搜索已同步更新。",
          })
        }}
      />
      <SessionMoveDialog
        open={dialog.kind === "move"}
        session={session}
        onOpenChange={handleOpenChange}
        onMove={(projectId) => {
          moveSession(session.id, projectId)
          toast.success("会话已移动", {
            description: "仅更新前端 Mock 项目归属。",
          })
        }}
      />
      <SessionDeleteDialog
        open={dialog.kind === "delete"}
        session={session}
        currentRunState={runState}
        isCurrent={conversationId === session.id}
        onOpenChange={handleOpenChange}
        onDelete={() => {
          deleteSession(session.id)
          toast.success("Mock 会话已删除", {
            description: "未删除任何本地文件或业务数据。",
          })
        }}
      />
      <ScheduledTaskDialog
        open={dialog.kind === "schedule"}
        session={session}
        onOpenChange={handleOpenChange}
        onCreate={(input) => {
          createScheduledTask(input)
          toast.success("Mock 定时任务已创建", {
            description: "已记录在前端状态，未注册真实调度服务。",
          })
        }}
      />
    </>
  )
}
