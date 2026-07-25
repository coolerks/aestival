import { useState, type KeyboardEvent } from "react"
import {
  ArrowUpIcon,
  BlocksIcon,
  FilePlusIcon,
  FolderPlusIcon,
  ImagePlusIcon,
  ListTodoIcon,
  MicIcon,
  MoreHorizontalIcon,
  PackagePlusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  ShieldQuestionIcon,
  TargetIcon,
} from "lucide-react"
import { toast } from "sonner"

import { IconButton } from "@/components/shell/icon-button"
import { Button } from "@/components/ui/button"
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
import { useWorkspaceStore } from "@/store/workspace-store"

type ApprovalPolicy = "request" | "auto" | "bypass"

const approvalLabels: Record<ApprovalPolicy, string> = {
  request: "请求审批",
  auto: "自动审批",
  bypass: "绕过审批",
}

export function PromptComposer() {
  const [approvalPolicy, setApprovalPolicy] =
    useState<ApprovalPolicy>("request")
  const mode = useWorkspaceStore((state) => state.mode)
  const draft = useWorkspaceStore((state) => state.draft)
  const setDraft = useWorkspaceStore((state) => state.setDraft)

  const submitDraft = () => {
    const content = draft.trim()
    if (!content) {
      return
    }
    toast.info("Mock 交互：模型与业务服务尚未接入", {
      description: "草稿保留在本地 UI 状态中，当前不会发送或产生费用。",
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      submitDraft()
    }
  }

  return (
    <div className="w-full max-w-[840px]">
      <InputGroup className="min-h-[126px] flex-col items-stretch rounded-xl bg-background shadow-sm has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-disabled:bg-background has-disabled:opacity-100">
        <InputGroupTextarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="随心输入，描述你想完成的任务…"
          aria-label="任务输入"
          className="min-h-[72px] max-h-[188px] px-4 pt-3 text-sm"
        />
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
                  <DropdownMenuItem>
                    <FilePlusIcon />
                    引用文件
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FolderPlusIcon />
                    引用文件夹
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ImagePlusIcon />
                    添加图片
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>模式</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <ListTodoIcon />
                    计划模式
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TargetIcon />
                    目标模式
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled={mode === "chat"}>
                    <PackagePlusIcon />
                    初始化项目
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={mode === "chat"}>
                    <BlocksIcon />
                    选择 Skill
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="sm" variant="ghost" />}
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
                  onValueChange={(value) =>
                    setApprovalPolicy(value as ApprovalPolicy)
                  }
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
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <IconButton label="输入选项">
              <MoreHorizontalIcon />
            </IconButton>
            <Button size="sm" variant="ghost">
              本地 Mock
            </Button>
            <IconButton label="语音输入">
              <MicIcon />
            </IconButton>
            <Button
              size="icon"
              aria-label="发送任务"
              disabled={!draft.trim()}
              onClick={submitDraft}
              className="rounded-full"
            >
              <ArrowUpIcon />
            </Button>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
