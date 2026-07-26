import { useEffect, useState } from "react"
import { PencilIcon } from "lucide-react"

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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { MockSessionRecord } from "@/data/mock-session-management"

type SessionRenameDialogProps = {
  open: boolean
  session: MockSessionRecord
  onOpenChange: (open: boolean) => void
  onRename: (title: string) => void
}

export function SessionRenameDialog({
  open,
  session,
  onOpenChange,
  onRename,
}: SessionRenameDialogProps) {
  const [title, setTitle] = useState(session.title)
  const invalid = title.trim().length === 0

  useEffect(() => {
    if (open) {
      setTitle(session.title)
    }
  }, [open, session.title])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!invalid) {
              onRename(title)
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>重命名</DialogTitle>
            <DialogDescription>
              修改会话在标题栏、侧栏和全局搜索中的名称。
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor="session-title">会话名称</FieldLabel>
              <Input
                id="session-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={invalid}
                autoFocus
                maxLength={80}
              />
              <FieldDescription>
                最多 80 个字符；仅更新前端 Mock 状态。
              </FieldDescription>
              {invalid ? <FieldError>请输入会话名称。</FieldError> : null}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={invalid}>
              <PencilIcon data-icon="inline-start" />
              保存名称
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
