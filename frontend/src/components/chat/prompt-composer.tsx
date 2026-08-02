import {
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import {
  ArrowUpIcon,
  BlocksIcon,
  ClipboardPasteIcon,
  CopyIcon,
  FilePlusIcon,
  FolderPlusIcon,
  ImagePlusIcon,
  ListTodoIcon,
  MicIcon,
  PackagePlusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  ShieldQuestionIcon,
  ScissorsIcon,
  SquareIcon,
  TargetIcon,
  TextSelectIcon,
  TimerIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ComposerAgentSelector } from "@/components/chat/composer-agent-selector"
import { ComposerAttachments } from "@/components/chat/composer-attachments"
import { ComposerModelSelector } from "@/components/chat/composer-model-selector"
import { ComposerOptions } from "@/components/chat/composer-options"
import { SlashCommandMenu } from "@/components/chat/slash-command-menu"
import { IconButton } from "@/components/shell/icon-button"
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
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  slashCommands,
  type ApprovalPolicy,
  type ComposerMode,
  type SlashCommandOption,
} from "@/data/mock-composer"
import { useWorkspaceStore } from "@/store/workspace-store"

const approvalLabels: Record<ApprovalPolicy, string> = {
  request: "请求审批",
  auto: "自动审批",
  bypass: "绕过审批",
}

const composerModeLabels: Record<
  Exclude<ComposerMode, "standard">,
  string
> = {
  plan: "计划模式",
  goal: "目标模式",
}

const ContextUsagePopover = lazy(() =>
  import("@/components/chat/context-usage-popover").then((module) => ({
    default: module.ContextUsagePopover,
  }))
)

export function PromptComposer() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [bypassConfirmOpen, setBypassConfirmOpen] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [slashDismissed, setSlashDismissed] = useState(false)
  const [slashSelectedValue, setSlashSelectedValue] = useState("")
  const mode = useWorkspaceStore((state) => state.mode)
  const draft = useWorkspaceStore((state) => state.draft)
  const runState = useWorkspaceStore((state) => state.runState)
  const conversationId = useWorkspaceStore(
    (state) => state.conversationId
  )
  const composerMode = useWorkspaceStore((state) => state.composerMode)
  const approvalPolicy = useWorkspaceStore(
    (state) => state.approvalPolicy
  )
  const attachments = useWorkspaceStore((state) => state.attachments)
  const setDraft = useWorkspaceStore((state) => state.setDraft)
  const setComposerMode = useWorkspaceStore(
    (state) => state.setComposerMode
  )
  const setApprovalPolicy = useWorkspaceStore(
    (state) => state.setApprovalPolicy
  )
  const addMockAttachment = useWorkspaceStore(
    (state) => state.addMockAttachment
  )
  const completeAttachment = useWorkspaceStore(
    (state) => state.completeAttachment
  )
  const removeAttachment = useWorkspaceStore(
    (state) => state.removeAttachment
  )
  const submitMockPrompt = useWorkspaceStore(
    (state) => state.submitMockPrompt
  )
  const stopMockRun = useWorkspaceStore((state) => state.stopMockRun)
  const setStatsOpen = useWorkspaceStore((state) => state.setStatsOpen)
  const createCompressionEvent = useWorkspaceStore(
    (state) => state.createCompressionEvent
  )
  const startTemporaryConversation = useWorkspaceStore(
    (state) => state.startTemporaryConversation
  )
  const setForkDialogOpen = useWorkspaceStore(
    (state) => state.setForkDialogOpen
  )
  const isRunning =
    runState === "waiting" ||
    runState === "thinking" ||
    runState === "awaiting-approval" ||
    runState === "streaming"
  const slashToken = draft.trimStart().split(/\s/, 1)[0]
  const slashQuery = slashToken.startsWith("/")
    ? slashToken.slice(1).toLowerCase()
    : ""
  const filteredSlashCommands = useMemo(
    () =>
      slashCommands.filter(
        (command) =>
          command.command.slice(1).includes(slashQuery) ||
          command.keywords.toLowerCase().includes(slashQuery)
      ),
    [slashQuery]
  )
  const slashOpen =
    !slashDismissed &&
    draft.trimStart().startsWith("/") &&
    filteredSlashCommands.length > 0
  const effectiveSlashValue = filteredSlashCommands.some(
    (command) => command.command === slashSelectedValue
  )
    ? slashSelectedValue
    : (filteredSlashCommands[0]?.command ?? "")

  useEffect(() => {
    const processing = attachments.find(
      (attachment) => attachment.state === "processing"
    )
    if (!processing) {
      return
    }

    const timer = window.setTimeout(
      () => completeAttachment(processing.id),
      800
    )
    return () => window.clearTimeout(timer)
  }, [attachments, completeAttachment])

  const submitDraft = () => {
    const content =
      draft.trim() ||
      (attachments.length > 0 ? "请分析已添加的附件。" : "")
    if (!content || isRunning) {
      return
    }
    submitMockPrompt(content)
    toast.info("已启动前端 Mock 会话", {
      description: "状态流转、工具与审批均为本地演示，不会产生费用。",
    })
  }

  const executeSlashCommand = (command: SlashCommandOption) => {
    if (mode === "chat" && command.agentOnly) {
      toast.warning("聊天模式不调用工具", {
        description: `${command.command} 仅在代理模式可用。`,
      })
      return
    }

    if (command.id === "plan") {
      setComposerMode(composerMode === "plan" ? "standard" : "plan")
      toast.success(
        composerMode === "plan" ? "已关闭计划模式" : "已开启计划模式"
      )
    } else if (command.id === "goal") {
      setComposerMode(composerMode === "goal" ? "standard" : "goal")
      toast.success(
        composerMode === "goal" ? "已关闭目标模式" : "已开启目标模式"
      )
    } else if (command.id === "stats") {
      if (conversationId) {
        setStatsOpen(true)
      } else {
        toast.warning("当前还没有可统计的会话")
      }
    } else if (command.id === "compact") {
      createCompressionEvent()
      toast.success("已生成 Mock 上下文压缩事件", {
        description: "未读取、改写或持久化真实会话内容。",
      })
    } else if (command.id === "fork") {
      if (conversationId) {
        setForkDialogOpen(true)
      } else {
        toast.warning("发送第一条消息后才能创建分支")
      }
    } else {
      toast.info(`${command.label}为前端 Mock`, {
        description: "命令不会发送给模型，也不会修改真实会话或文件。",
      })
    }

    setDraft("")
    setSlashDismissed(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return
    }

    if (slashOpen) {
      const currentIndex = Math.max(
        0,
        filteredSlashCommands.findIndex(
          (command) => command.command === effectiveSlashValue
        )
      )

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        const direction = event.key === "ArrowDown" ? 1 : -1
        const nextIndex =
          (currentIndex + direction + filteredSlashCommands.length) %
          filteredSlashCommands.length
        setSlashSelectedValue(
          filteredSlashCommands[nextIndex]?.command ?? ""
        )
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setSlashDismissed(true)
        return
      }

      if (event.key === "Tab" || event.key === "Enter") {
        event.preventDefault()
        const command =
          filteredSlashCommands[currentIndex] ?? filteredSlashCommands[0]
        if (command) {
          executeSlashCommand(command)
        }
        return
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submitDraft()
    }
  }

  const addAttachment = (
    kind: "file" | "folder" | "image"
  ) => {
    addMockAttachment(kind)
    toast.info("已添加 Mock 附件", {
      description: "未打开系统选择器，也未读取任何真实文件。",
    })
  }

  const setModeTag = (nextMode: Exclude<ComposerMode, "standard">) => {
    if (mode === "chat") {
      toast.warning("聊天模式不支持任务模式")
      return
    }
    setComposerMode(composerMode === nextMode ? "standard" : nextMode)
  }

  const copySelection = async (cut = false) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = draft.slice(start, end)
    if (!selected) {
      toast.info("请先选择要复制的文本")
      return
    }
    await navigator.clipboard.writeText(selected)
    if (cut) {
      setDraft(`${draft.slice(0, start)}${draft.slice(end)}`)
    }
  }

  const pasteFromClipboard = async () => {
    const textarea = textareaRef.current
    if (!textarea) return
    try {
      const content = await navigator.clipboard.readText()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      setDraft(`${draft.slice(0, start)}${content}${draft.slice(end)}`)
    } catch {
      toast.warning("无法读取剪贴板，请使用系统粘贴快捷键")
    }
  }

  return (
    <div className="w-full max-w-[840px]">
      <ContextMenu>
      <ContextMenuTrigger className="block">
      <InputGroup className="min-h-[126px] flex-col items-stretch rounded-xl bg-background shadow-sm has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-disabled:bg-background has-disabled:opacity-100">
        {attachments.length > 0 || composerMode !== "standard" ? (
          <InputGroupAddon
            align="block-start"
            className="flex-col items-stretch gap-1 px-3 pt-2"
          >
            {composerMode !== "standard" ? (
              <Button
                variant="secondary"
                size="xs"
                className="w-fit"
                onClick={() => setComposerMode("standard")}
              >
                {composerMode === "plan" ? (
                  <ListTodoIcon data-icon="inline-start" />
                ) : (
                  <TargetIcon data-icon="inline-start" />
                )}
                {composerModeLabels[composerMode]}
                <XIcon data-icon="inline-end" />
              </Button>
            ) : null}
            <ComposerAttachments
              attachments={attachments}
              onRemove={removeAttachment}
            />
          </InputGroupAddon>
        ) : null}

        <Popover open={slashOpen}>
          <InputGroupTextarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setSlashDismissed(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder="随心输入，描述你想完成的任务…"
            aria-label="任务输入"
            className="field-sizing-content min-h-[72px] max-h-[188px] px-4 pt-3 text-sm"
          />
          <PopoverContent
            anchor={textareaRef}
            side="top"
            align="start"
            className="w-(--anchor-width) p-0"
            initialFocus={false}
          >
            <SlashCommandMenu
              commands={filteredSlashCommands}
              mode={mode}
              selectedValue={effectiveSlashValue}
              onSelectedValueChange={setSlashSelectedValue}
              onSelect={executeSlashCommand}
            />
          </PopoverContent>
        </Popover>

        <InputGroupAddon
          align="block-end"
          className="justify-between gap-2 px-2.5 pb-2"
        >
          <div className="flex min-w-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <InputGroupButton
                    aria-label="添加上下文或切换任务模式"
                    size="icon-sm"
                  />
                }
              >
                <PlusIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>引用</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => addAttachment("file")}>
                    <FilePlusIcon />
                    引用文件
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => addAttachment("folder")}
                  >
                    <FolderPlusIcon />
                    引用文件夹
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addAttachment("image")}>
                    <ImagePlusIcon />
                    添加图片
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>模式</DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={mode === "chat"}
                    onClick={() => setModeTag("plan")}
                  >
                    <ListTodoIcon />
                    计划模式
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={mode === "chat"}
                    onClick={() => setModeTag("goal")}
                  >
                    <TargetIcon />
                    目标模式
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={Boolean(conversationId)}
                    onClick={startTemporaryConversation}
                  >
                    <TimerIcon />
                    新建临时会话
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={mode === "chat"}
                    onClick={() =>
                      toast.info("初始化项目为前端 Mock", {
                        description: "不会创建目录或写入文件。",
                      })
                    }
                  >
                    <PackagePlusIcon />
                    初始化项目
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={mode === "chat"}
                    onClick={() =>
                      toast.info("Skill 选择将在能力阶段继续完善")
                    }
                  >
                    <BlocksIcon />
                    选择 Skill
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={
                      mode === "chat"
                        ? "审批策略，聊天模式工具已禁用"
                        : `审批策略，当前为${approvalLabels[approvalPolicy]}`
                    }
                  />
                }
              >
                {approvalPolicy === "request" ? (
                  <ShieldQuestionIcon data-icon="inline-start" />
                ) : approvalPolicy === "auto" ? (
                  <ShieldCheckIcon data-icon="inline-start" />
                ) : (
                  <ShieldOffIcon data-icon="inline-start" />
                )}
                <span className="hidden sm:inline">
                  {mode === "chat"
                    ? "工具已禁用"
                    : approvalLabels[approvalPolicy]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-64">
                <DropdownMenuRadioGroup
                  value={approvalPolicy}
                  onValueChange={(value) => {
                    const policy = value as ApprovalPolicy
                    if (policy === "bypass") {
                      setBypassConfirmOpen(true)
                      return
                    }
                    setApprovalPolicy(policy)
                  }}
                >
                  <DropdownMenuRadioItem
                    value="request"
                    disabled={mode === "chat"}
                  >
                    <ShieldQuestionIcon />
                    请求审批
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="auto"
                    disabled={mode === "chat"}
                  >
                    <ShieldCheckIcon />
                    自动审批
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="bypass"
                    disabled={mode === "chat"}
                  >
                    <ShieldOffIcon />
                    绕过审批
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <ComposerAgentSelector />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ComposerOptions
              textareaRef={textareaRef}
              fullscreenOpen={fullscreenOpen}
              onFullscreenOpenChange={setFullscreenOpen}
            />
            <Suspense
              fallback={
                <Skeleton
                  className="size-7 rounded-full"
                  aria-label="正在加载上下文用量"
                />
              }
            >
              <ContextUsagePopover />
            </Suspense>
            <ComposerModelSelector />
            <IconButton
              label="语音输入"
              onClick={() =>
                toast.info("语音输入为前端 Mock", {
                  description: "当前不会请求麦克风权限或开始录音。",
                })
              }
            >
              <MicIcon />
            </IconButton>
            <IconButton
              label={isRunning ? "停止 Mock 运行" : "发送任务"}
              size="icon"
              variant="default"
              disabled={
                !isRunning && !draft.trim() && attachments.length === 0
              }
              onClick={isRunning ? stopMockRun : submitDraft}
              className="rounded-full"
            >
              {isRunning ? <SquareIcon /> : <ArrowUpIcon />}
            </IconButton>
          </div>
        </InputGroupAddon>
      </InputGroup>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => void copySelection()}><CopyIcon />复制<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => void copySelection(true)}><ScissorsIcon />剪切<ContextMenuShortcut>⌘X</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => void pasteFromClipboard()}><ClipboardPasteIcon />粘贴<ContextMenuShortcut>⌘V</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onClick={() => { textareaRef.current?.focus(); textareaRef.current?.select() }}><TextSelectIcon />全选<ContextMenuShortcut>⌘A</ContextMenuShortcut></ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
      </ContextMenu>

      <AlertDialog
        open={bypassConfirmOpen}
        onOpenChange={setBypassConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ShieldOffIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>确认使用绕过审批？</AlertDialogTitle>
            <AlertDialogDescription>
              真实接入后，工具会在已授予范围内跳过逐项确认。本轮仅切换前端
              Mock 展示，不会执行任何工具。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setApprovalPolicy("bypass")
                setBypassConfirmOpen(false)
              }}
            >
              仅切换 Mock 策略
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
