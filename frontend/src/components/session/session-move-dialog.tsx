import { CheckIcon, FolderInputIcon, FolderSearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  mockSessionProjects,
  type MockSessionProjectId,
  type MockSessionRecord,
} from "@/data/mock-session-management"

type SessionMoveDialogProps = {
  open: boolean
  session: MockSessionRecord
  onOpenChange: (open: boolean) => void
  onMove: (projectId: MockSessionProjectId) => void
}

export function SessionMoveDialog({
  open,
  session,
  onOpenChange,
  onMove,
}: SessionMoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>移动到项目</DialogTitle>
          <DialogDescription>
            为“{session.title}”选择新的项目上下文。
          </DialogDescription>
        </DialogHeader>

        <Command className="border-y">
          <CommandInput placeholder="搜索项目…" />
          <CommandList className="max-h-72">
            <CommandEmpty>没有找到匹配项目。</CommandEmpty>
            <CommandGroup heading="项目">
              {mockSessionProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.label} ${project.id}`}
                  onSelect={() => onMove(project.id)}
                >
                  <FolderSearchIcon />
                  <span>{project.label}</span>
                  {project.id === session.projectId ? (
                    <CheckIcon className="ml-auto" aria-label="当前项目" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <DialogFooter className="px-4 pb-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button disabled>
            <FolderInputIcon data-icon="inline-start" />
            选择一个项目
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
