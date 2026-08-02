import {
  BotIcon,
  CheckIcon,
  CopyIcon,
  GitForkIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilLineIcon,
  RefreshCwIcon,
  ShareIcon,
  ShieldQuestionIcon,
  Volume2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { AiCodeBundle } from "@/components/chat/ai-code-bundle"
import { ComposerAttachments } from "@/components/chat/composer-attachments"
import { DropdownMenuIconTrigger, IconButton } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
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
  mockAiCodeBundle,
  type MockAppDraft,
  type MockAppDraftInput,
  type MockCodeFile,
} from "@/data/mock-ai-app"
import type {
  ConversationRunState,
  MockConversationMessage,
} from "@/data/mock-conversation"
import { cn } from "@/lib/utils"

type ConversationMessageProps = {
  message: MockConversationMessage
  isLatestAssistant: boolean
  runState: ConversationRunState
  onFork: (messageId: string) => void
  onRegenerate: (messageId: string) => void
  onExport: (messageId: string) => void
  onRead: (messageId: string, content: string) => void
  isReading: boolean
  showCodeBundle: boolean
  conversationTitle: string
  createdDraft: MockAppDraft | null
  onCreateDraft: (
    input: MockAppDraftInput,
    files: MockCodeFile[]
  ) => void
  onOpenEditor: () => void
}

const activeRunStates: ConversationRunState[] = [
  "waiting",
  "thinking",
  "awaiting-approval",
  "streaming",
]

function mockAction(label: string) {
  toast.info(`${label}为前端 Mock`, {
    description: "当前不会调用模型、写入文件或创建新会话。",
  })
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
  showCodeBundle,
  conversationTitle,
  createdDraft,
  onCreateDraft,
  onOpenEditor,
}: ConversationMessageProps) {
  const isUser = message.role === "user"
  const isRunning =
    isLatestAssistant && activeRunStates.includes(runState)
  const isAwaitingApproval =
    isLatestAssistant && runState === "awaiting-approval"

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content)
    toast.success("已复制消息")
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={cn(
          "group/message relative flex w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <article
          className={cn(
            "app-selectable-content min-w-0",
            isUser
              ? "max-w-[78%] rounded-2xl bg-muted px-4 py-3"
              : "w-full max-w-3xl"
          )}
          aria-label={isUser ? "用户消息" : "Aestival Mock 回复"}
        >
          {!isUser ? (
            <div className="mb-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted">
                <BotIcon aria-hidden="true" />
              </span>
              <span className="font-medium text-foreground">本地 Mock</span>
              <span>{message.createdAt}</span>
              {isAwaitingApproval ? (
                <Badge variant="secondary">
                  <ShieldQuestionIcon data-icon="inline-start" />
                  等待审批
                </Badge>
              ) : isRunning ? (
                <Badge variant="secondary">运行中</Badge>
              ) : runState === "cancelled" && isLatestAssistant ? (
                <Badge variant="outline">已停止</Badge>
              ) : runState === "completed" && isLatestAssistant ? (
                <Badge variant="outline">
                  <CheckIcon data-icon="inline-start" />
                  已完成
                </Badge>
              ) : null}
            </div>
          ) : null}

          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.content}
          </p>
          {!isUser && showCodeBundle ? (
            <AiCodeBundle
              bundle={mockAiCodeBundle}
              conversationTitle={conversationTitle}
              messageId={message.id}
              createdDraft={createdDraft}
              onCreateDraft={onCreateDraft}
              onOpenEditor={onOpenEditor}
            />
          ) : null}
          {message.attachments?.length ? (
            <div className="mt-3">
              <ComposerAttachments attachments={message.attachments} />
            </div>
          ) : null}
        </article>
        <div
          className={cn(
            "pointer-events-none absolute -bottom-7 z-10 flex items-center gap-1 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100",
            isUser ? "right-0 justify-end" : "left-0 justify-start"
          )}
        >
            <IconButton
              className="pointer-events-auto"
              label="复制消息"
              size="icon-xs"
              onClick={() => void copyMessage()}
            >
              <CopyIcon />
            </IconButton>
            {isUser ? (
              <IconButton
                className="pointer-events-auto"
                label="编辑并重新发送"
                size="icon-xs"
                onClick={() => mockAction("编辑并重新发送")}
              >
                <PencilLineIcon />
              </IconButton>
            ) : (
              <>
                <IconButton
                  className="pointer-events-auto"
                  label="重新生成"
                  size="icon-xs"
                  onClick={() => onRegenerate(message.id)}
                >
                  <RefreshCwIcon />
                </IconButton>
                <IconButton
                  className="pointer-events-auto"
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
                className="pointer-events-auto"
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
      </ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => void copyMessage()}>
            <CopyIcon />
            复制纯文本
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
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
