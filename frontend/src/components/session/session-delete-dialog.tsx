import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { ConversationRunState } from "@/data/mock-conversation"
import type { MockSessionRecord } from "@/data/mock-session-management"

type SessionDeleteDialogProps = {
  open: boolean
  session: MockSessionRecord
  currentRunState: ConversationRunState
  isCurrent: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}

export function SessionDeleteDialog({
  open,
  session,
  currentRunState,
  isCurrent,
  onOpenChange,
  onDelete,
}: SessionDeleteDialogProps) {
  const running =
    isCurrent &&
    (currentRunState === "waiting" ||
      currentRunState === "thinking" ||
      currentRunState === "streaming")
  const awaitingApproval =
    isCurrent && currentRunState === "awaiting-approval"
  const actionLabel = running
    ? "停止并删除"
    : awaitingApproval
      ? "撤销审批并删除"
      : "删除会话"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>删除“{session.title}”？</AlertDialogTitle>
          <AlertDialogDescription>
            {running
              ? "当前 Mock 运行会先停止，然后从会话列表移除。"
              : awaitingApproval
                ? "当前待审批请求会被撤销，然后从会话列表移除。"
                : "该会话会从前端 Mock 列表中移除，本轮不删除任何本地文件。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            <Trash2Icon data-icon="inline-start" />
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
