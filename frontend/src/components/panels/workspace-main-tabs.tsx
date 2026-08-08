import { lazy, Suspense, type ReactNode } from "react"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import { mockFiles } from "@/data/mock-workspace-panels"
import { useEditorWorkbenchStore } from "@/store/editor-workbench-store"

const EditorWorkbench = lazy(() =>
  import("@/components/editor/editor-workbench").then((module) => ({
    default: module.EditorWorkbench,
  })),
)

function EditorCloseDialog() {
  const pending = useEditorWorkbenchStore((state) => state.pendingClose)
  const buffers = useEditorWorkbenchStore((state) => state.editorBuffers)
  const cancel = useEditorWorkbenchStore((state) => state.cancelPendingClose)
  const confirm = useEditorWorkbenchStore((state) => state.confirmPendingClose)
  const compare = useEditorWorkbenchStore((state) => state.comparePendingClose)
  const resourceId = pending?.type === "group" ? pending.resourceIds[0] : pending?.resourceId
  const file = mockFiles.find((candidate) => candidate.id === resourceId)
  const buffer = resourceId ? buffers[resourceId] : undefined
  const externalChange = Boolean(buffer?.externalChange)
  const multiple = pending?.type === "group" && pending.resourceIds.length > 1

  return (
    <AlertDialog open={Boolean(pending)} onOpenChange={(open) => { if (!open) cancel() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {externalChange
              ? "文件已在外部改变"
              : multiple
                ? `保存 ${pending.resourceIds.length} 个文件的更改？`
                : `保存 ${file?.name ?? "文件"} 的更改？`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {externalChange
              ? "关闭前可以比较外部版本，或选择保留当前工作副本。当前 Mock 不会写入真实文件。"
              : "关闭前请选择如何处理未保存内容；当前操作只改变前端工作副本。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          {externalChange && pending?.type !== "group" ? (
            <Button variant="outline" onClick={compare}><RefreshCwIcon data-icon="inline-start" />比较</Button>
          ) : null}
          <Button variant="outline" onClick={() => confirm(false)}>不保存</Button>
          <AlertDialogAction onClick={() => {
            confirm(true)
            toast.success("已保存到工作副本")
          }}>
            保存
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function WorkspaceMainTabs({ chat }: { chat: ReactNode }) {
  return (
    <div className="size-full min-h-0 min-w-0">
      <Suspense
        fallback={
          <div className="grid size-full place-items-center text-xs text-muted-foreground">
            正在加载文件编辑器…
          </div>
        }
      >
        <EditorWorkbench chat={chat} />
      </Suspense>
      <EditorCloseDialog />
    </div>
  )
}
