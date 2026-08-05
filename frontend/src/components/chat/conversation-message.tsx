import { useState } from "react"
import {
  BanIcon,
  BotIcon,
  CheckIcon,
  CircleAlertIcon,
  CopyIcon,
  CircleXIcon,
  GitForkIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilLineIcon,
  RefreshCwIcon,
  QuoteIcon,
  ShareIcon,
  Volume2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { ComposerAttachments } from "@/components/chat/composer-attachments"
import { MarkdownRenderer } from "@/components/chat/markdown-renderer"
import { DropdownMenuIconTrigger, IconButton } from "@/components/shell/icon-button"
import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import { Spinner } from "@/components/ui/spinner"
import type {
  ConversationRunState,
  MockConversationMessage,
} from "@/data/mock-conversation"
import {
  adaptMockConversationMessage,
  type ConversationMessageStatus,
} from "@/data/conversation-ui"
import { cn } from "@/lib/utils"
import { copyTextToClipboard, selectedText } from "@/lib/context-menu-utils"

type ConversationMessageProps = {
  message: MockConversationMessage
  isLatestAssistant: boolean
  runState: ConversationRunState
  onFork: (messageId: string) => void
  onRegenerate: (messageId: string) => void
  onExport: (messageId: string) => void
  onRead: (messageId: string, content: string) => void
  isReading: boolean
}

function mockAction(label: string) {
  toast.info(`${label}为前端 Mock`, {
    description: "当前不会调用模型、写入文件或创建新会话。",
  })
}

const statusLabels: Partial<Record<ConversationMessageStatus, string>> = {
  preparing: "准备中",
  waiting: "等待模型",
  thinking: "思考中",
  streaming: "生成中",
  completed: "已完成",
  failed: "失败",
  cancelled: "已停止",
}

function StatusMarker({ status }: { status?: ConversationMessageStatus }) {
  if (!status) return null

  const visibleStatuses: ConversationMessageStatus[] = [
    "preparing",
    "waiting",
    "thinking",
    "streaming",
    "completed",
    "failed",
    "cancelled",
  ]
  if (!visibleStatuses.includes(status)) return null
  const label = statusLabels[status]
  if (!label) return null

  const active = [
    "preparing",
    "waiting",
    "thinking",
    "streaming",
  ].includes(status)

  const icon = active ? (
    <Spinner aria-label={label} />
  ) : status === "completed" ? (
    <CheckIcon />
  ) : status === "cancelled" ? (
    <BanIcon />
  ) : status === "failed" ? (
    <CircleXIcon />
  ) : (
    <CircleAlertIcon />
  )

  return (
    <Marker
      role={active ? "status" : undefined}
      className={cn(
        "w-fit gap-1.5 text-xs",
        status === "failed" && "text-destructive"
      )}
    >
      <MarkerIcon>{icon}</MarkerIcon>
      <MarkerContent>{label}</MarkerContent>
    </Marker>
  )
}

export function ConversationMessage({
  message,
  isLatestAssistant,
  runState,
  onFork,
  onRegenerate,
  onExport,
  onRead,
  isReading,
}: ConversationMessageProps) {
  const isUser = message.role === "user"
  const uiMessage = adaptMockConversationMessage(
    message,
    runState,
    isLatestAssistant
  )
  const markdownPart = uiMessage.parts.find(
    (part): part is Extract<(typeof uiMessage.parts)[number], { type: "markdown" }> =>
      part.type === "markdown"
  )
  const [contextSelection, setContextSelection] = useState("")
  const copyMessage = async (text = message.content) => {
    const copied = await copyTextToClipboard(text)
    if (copied) toast.success(text === message.content ? "已复制消息" : "已复制选中文本")
    else toast.warning("无法写入剪贴板")
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="group/message relative flex w-full"
        onContextMenu={() => setContextSelection(selectedText())}
      >
        <Message
          align={isUser ? "end" : "start"}
          className="w-full"
          aria-label={isUser ? "用户消息" : "Aestival Mock 回复"}
        >
          {!isUser ? (
            <MessageAvatar className="mt-1 size-7 bg-muted">
              <BotIcon aria-hidden="true" />
            </MessageAvatar>
          ) : null}
          <MessageContent
            className={cn(
              "min-w-0",
              isUser ? "max-w-[78%]" : "max-w-3xl"
            )}
          >
            {!isUser ? (
              <MessageHeader className="gap-2 px-0">
                <span className="font-medium text-foreground">本地 Mock</span>
                <span>{message.createdAt}</span>
              </MessageHeader>
            ) : null}

            <Bubble
              variant={isUser ? "secondary" : "ghost"}
              align={isUser ? "end" : "start"}
              className="max-w-full"
            >
              <BubbleContent
                className={cn(
                  "app-selectable-content",
                  isUser ? "px-4 py-3" : "px-0 py-0"
                )}
              >
                <MarkdownRenderer
                  source={markdownPart?.source ?? message.content}
                  streaming={markdownPart?.streaming}
                />
                {message.attachments?.length ? (
                  <div className="mt-3">
                    <ComposerAttachments attachments={message.attachments} />
                  </div>
                ) : null}
              </BubbleContent>
            </Bubble>

            <MessageFooter className="min-h-7 gap-2 px-0">
              {isLatestAssistant ? (
                <StatusMarker status={uiMessage.status} />
              ) : null}
              <div
                className={cn(
                  "pointer-events-none ml-auto flex items-center gap-1 opacity-0 transition-opacity group-focus-within/message:pointer-events-auto group-focus-within/message:opacity-100 group-hover/message:pointer-events-auto group-hover/message:opacity-100",
                  isUser && "mr-0"
                )}
              >
                <IconButton
                  label="复制消息"
                  size="icon-xs"
                  onClick={() => void copyMessage()}
                >
                  <CopyIcon />
                </IconButton>
                {isUser ? (
                  <IconButton
                    label="编辑并重新发送"
                    size="icon-xs"
                    onClick={() => mockAction("编辑并重新发送")}
                  >
                    <PencilLineIcon />
                  </IconButton>
                ) : (
                  <>
                    <IconButton
                      label="重新生成"
                      size="icon-xs"
                      onClick={() => onRegenerate(message.id)}
                    >
                      <RefreshCwIcon />
                    </IconButton>
                    <IconButton
                      label={isReading ? "暂停朗读" : "朗读"}
                      size="icon-xs"
                      onClick={() => onRead(message.id, message.content)}
                    >
                      {isReading ? <PauseIcon /> : <Volume2Icon />}
                    </IconButton>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuIconTrigger
                    label="更多消息操作"
                    size="icon-xs"
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuIconTrigger>
                  <DropdownMenuContent align={isUser ? "end" : "start"}>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => onFork(message.id)}>
                        <GitForkIcon />
                        从此处分叉
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport(message.id)}>
                        <ShareIcon />
                        导出此消息
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void copyMessage()}>
                        <CopyIcon />
                        复制 Markdown
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </MessageFooter>

          </MessageContent>
        </Message>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => void copyMessage(contextSelection || message.content)}>
            <CopyIcon />
            {contextSelection ? "复制选中文本" : "复制纯文本"}
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => void copyMessage(message.content)}>
            <CopyIcon />
            复制 Markdown
          </ContextMenuItem>
          <ContextMenuItem onClick={() => mockAction("引用到输入框")}>
            <QuoteIcon />
            引用到输入框
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onFork(message.id)}>
            <GitForkIcon />
            从此处分叉
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          {isUser ? (
            <ContextMenuItem onClick={() => mockAction("编辑并重新发送")}>
              <PencilLineIcon />
              编辑并重新发送
            </ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem onClick={() => onRegenerate(message.id)}>
                <RefreshCwIcon />
                重新生成
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onRead(message.id, message.content)}
              >
                {isReading ? <PauseIcon /> : <Volume2Icon />}
                {isReading ? "暂停朗读" : "朗读"}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
