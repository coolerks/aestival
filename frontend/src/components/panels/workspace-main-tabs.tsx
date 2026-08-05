import { CopyIcon, FileIcon, MessageSquareIcon, PinIcon, XIcon } from "lucide-react"
import { lazy, Suspense, type ReactNode } from "react"
import { toast } from "sonner"

import { IconButton } from "@/components/shell/icon-button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockFiles } from "@/data/mock-workspace-panels"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"

const WorkspaceFilePreview = lazy(() =>
  import("./workspace-file-preview").then((module) => ({
    default: module.WorkspaceFilePreview,
  }))
)

export function WorkspaceMainTabs({ chat }: { chat: ReactNode }) {
  const openFiles = useWorkspacePanelStore((state) => state.openFiles)
  const active = useWorkspacePanelStore((state) => state.activeMainTab)
  return (
    <div className="flex size-full min-h-0 min-w-0 flex-col">
      <Tabs
        value={active}
        onValueChange={useWorkspacePanelStore.getState().setActiveMainTab}
        className="min-w-0 shrink-0 gap-0"
      >
        <TabsList
          variant="line"
          className="h-9 w-full min-w-0 justify-start overflow-x-auto overflow-y-hidden no-scrollbar border-b px-2 py-0"
        >
          <TabsTrigger value="chat" className="flex-none after:bottom-0!">
            <MessageSquareIcon />
            聊天
          </TabsTrigger>
          {openFiles.map((tab) => {
            const file = mockFiles.find((item) => item.id === tab.fileId)
            if (!file) return null

            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger className="flex shrink-0 items-center">
                  <HoverCard>
                    <HoverCardTrigger
                      render={
                        <TabsTrigger
                          value={file.id}
                          className="flex-none after:bottom-0!"
                        >
                          <FileIcon />
                          {file.name}
                          {file.dirty ? (
                            <span
                              className="size-1.5 rounded-full bg-foreground"
                              aria-label="未保存"
                            />
                          ) : null}
                        </TabsTrigger>
                      }
                    />
                    <HoverCardContent align="start">
                      <p className="truncate text-xs font-medium">{file.path}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {file.language} · {file.size} · {file.modifiedAt}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                  <IconButton
                    label={`关闭 ${file.name}`}
                    className="-ml-1 size-6"
                    onClick={() =>
                      useWorkspacePanelStore.getState().requestCloseFile(file.id)
                    }
                  >
                    <XIcon />
                  </IconButton>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuGroup>
                    <ContextMenuItem
                      onClick={() =>
                        useWorkspacePanelStore.getState().pinFile(file.id)
                      }
                    >
                      <PinIcon />
                      固定页签
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => toast.success("文件路径已复制（Mock）")}
                    >
                      <CopyIcon />
                      复制路径
                      <ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        useWorkspacePanelStore.getState().requestCloseFile(file.id)
                      }
                    >
                      <XIcon />
                      关闭页签
                      <ContextMenuShortcut>⌘W</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </TabsList>
      </Tabs>
      <div className="min-h-0 min-w-0 flex-1">
        {active === "chat" ? (
          chat
        ) : (
          <Suspense
            fallback={
              <div className="grid size-full place-items-center text-xs text-muted-foreground">
                正在加载文件预览…
              </div>
            }
          >
            <WorkspaceFilePreview fileId={active} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
