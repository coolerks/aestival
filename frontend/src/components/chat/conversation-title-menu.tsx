import {
  ChartNoAxesCombinedIcon,
  DownloadIcon,
  GitCompareArrowsIcon,
  GitForkIcon,
  MoreHorizontalIcon,
  SaveIcon,
  ShrinkIcon,
  XIcon,
} from "lucide-react"

import { SessionDropdownMenuContent } from "@/components/session/session-menu-content"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWorkspaceStore } from "@/store/workspace-store"

function ConversationQuickActions() {
  const multiModelEnabled = useWorkspaceStore(
    (state) => state.multiModelEnabled
  )
  const setMultiModelEnabled = useWorkspaceStore(
    (state) => state.setMultiModelEnabled
  )
  const setStatsOpen = useWorkspaceStore((state) => state.setStatsOpen)
  const createCompressionEvent = useWorkspaceStore(
    (state) => state.createCompressionEvent
  )

  return (
    <>
      <DropdownMenuItem
        onClick={() => setMultiModelEnabled(!multiModelEnabled)}
      >
        <GitCompareArrowsIcon />
        {multiModelEnabled ? "关闭多模型比较" : "多模型比较"}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setStatsOpen(true)}>
        <ChartNoAxesCombinedIcon />
        会话统计
      </DropdownMenuItem>
      <DropdownMenuItem onClick={createCompressionEvent}>
        <ShrinkIcon />
        压缩上下文
      </DropdownMenuItem>
    </>
  )
}

export function ConversationTitleMenu() {
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const isTemporaryConversation = useWorkspaceStore(
    (state) => state.isTemporaryConversation
  )
  const messages = useWorkspaceStore((state) => state.messages)
  const setForkDialogOpen = useWorkspaceStore(
    (state) => state.setForkDialogOpen
  )
  const setExportDialogOpen = useWorkspaceStore(
    (state) => state.setExportDialogOpen
  )
  const convertTemporaryConversation = useWorkspaceStore(
    (state) => state.convertTemporaryConversation
  )
  const setTemporaryCloseOpen = useWorkspaceStore(
    (state) => state.setTemporaryCloseOpen
  )

  if (!conversationId) {
    return null
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  className="app-no-drag pointer-events-auto shrink-0"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="会话更多操作"
                />
              }
            />
          }
        >
          <MoreHorizontalIcon />
        </TooltipTrigger>
        <TooltipContent>会话更多操作</TooltipContent>
      </Tooltip>
      {!isTemporaryConversation ? (
        <SessionDropdownMenuContent
          sessionId={conversationId}
          leadingItems={<ConversationQuickActions />}
        />
      ) : (
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <ConversationQuickActions />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                setForkDialogOpen(
                  true,
                  messages[messages.length - 1]?.id
                )
              }
            >
              <GitForkIcon />
              分叉会话
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setExportDialogOpen(true, "conversation")}
            >
              <DownloadIcon />
              导出会话
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={convertTemporaryConversation}>
              <SaveIcon />
              保存为普通会话
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setTemporaryCloseOpen(true)}
            >
              <XIcon />
              关闭临时会话
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
