import { TimerIcon, Trash2Icon } from "lucide-react"

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

type TemporaryConversationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onDiscard: () => void
}

export function TemporaryConversationDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
}: TemporaryConversationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TimerIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>关闭临时会话？</AlertDialogTitle>
          <AlertDialogDescription>
            临时会话不会进入普通历史，也不会写入记忆。保存只会切换当前前端
            Mock 状态，不会持久化到数据库。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDiscard}>
            <Trash2Icon data-icon="inline-start" />
            直接丢弃
          </AlertDialogAction>
          <AlertDialogAction onClick={onSave}>
            保存到任务项目
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
