import type { RefObject } from "react"
import {
  ClipboardCopyIcon,
  CopyIcon,
  ExpandIcon,
  MoreHorizontalIcon,
  ScissorsIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { ComposerAttachments } from "@/components/chat/composer-attachments"
import { IconButton } from "@/components/shell/icon-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspaceStore } from "@/store/workspace-store"

type ComposerOptionsProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  fullscreenOpen: boolean
  onFullscreenOpenChange: (open: boolean) => void
}

export function ComposerOptions({
  textareaRef,
  fullscreenOpen,
  onFullscreenOpenChange,
}: ComposerOptionsProps) {
  const draft = useWorkspaceStore((state) => state.draft)
  const attachments = useWorkspaceStore((state) => state.attachments)
  const setDraft = useWorkspaceStore((state) => state.setDraft)
  const removeAttachment = useWorkspaceStore(
    (state) => state.removeAttachment
  )
  const clearComposer = useWorkspaceStore((state) => state.clearComposer)
  const restoreComposer = useWorkspaceStore(
    (state) => state.restoreComposer
  )

  const selectedText = () => {
    const textarea = textareaRef.current
    if (!textarea) {
      return ""
    }
    return draft.slice(textarea.selectionStart, textarea.selectionEnd)
  }

  const copyText = async () => {
    const content = selectedText() || draft
    if (!content) {
      return
    }
    await navigator.clipboard.writeText(content)
    toast.success("已复制输入内容")
  }

  const cutText = async () => {
    const textarea = textareaRef.current
    const content = selectedText() || draft
    if (!content) {
      return
    }
    await navigator.clipboard.writeText(content)

    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
      setDraft(
        `${draft.slice(0, textarea.selectionStart)}${draft.slice(
          textarea.selectionEnd
        )}`
      )
    } else {
      setDraft("")
    }
    toast.success("已剪切输入内容")
  }

  const clearWithUndo = () => {
    const previousDraft = draft
    const previousAttachments = attachments
    clearComposer()
    toast("已清空输入与未发送附件", {
      action: {
        label: "撤销",
        onClick: () =>
          restoreComposer(previousDraft, previousAttachments),
      },
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton label="输入选项">
              <MoreHorizontalIcon />
            </IconButton>
          }
        />
        <DropdownMenuContent side="top" align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => onFullscreenOpenChange(true)}
            >
              <ExpandIcon />
              全屏输入
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={!draft}
              onClick={() => void copyText()}
            >
              <CopyIcon />
              复制
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!draft}
              onClick={() => void cutText()}
            >
              <ScissorsIcon />
              剪切
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!draft && attachments.length === 0}
              onClick={clearWithUndo}
            >
              <Trash2Icon />
              清空
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={fullscreenOpen}
        onOpenChange={onFullscreenOpenChange}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>全屏输入</DialogTitle>
            <DialogDescription>
              与底部输入框共用同一份草稿和附件。
            </DialogDescription>
          </DialogHeader>
          <ComposerAttachments
            attachments={attachments}
            onRemove={removeAttachment}
          />
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="全屏任务输入"
            placeholder="描述你想完成的任务…"
            className="min-h-[50vh] resize-none"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => void copyText()}
              disabled={!draft}
            >
              <ClipboardCopyIcon data-icon="inline-start" />
              复制
            </Button>
            <Button onClick={() => onFullscreenOpenChange(false)}>
              完成编辑
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
