import { useEffect, useMemo, useState } from "react"
import { GitForkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  mockForkProjects,
} from "@/data/mock-conversation-management"
import type { MockConversationMessage } from "@/data/mock-conversation"

type ConversationForkDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: MockConversationMessage[]
  initialMessageId: string | null
  conversationTitle: string
  onCreate: (title: string, messageId: string) => void
}

const inheritanceOptions = [
  {
    id: "attachments",
    label: "附件",
    description: "继承已引用的附件目录与描述。",
  },
  {
    id: "references",
    label: "固定引用",
    description: "继承固定在上下文中的引用。",
  },
  {
    id: "memory",
    label: "记忆",
    description: "仅继承 Mock 记忆设置，不写入真实记忆。",
  },
  {
    id: "mode",
    label: "模式与审批",
    description: "沿用当前代理/聊天模式和审批展示。",
  },
] as const

export function ConversationForkDialog({
  open,
  onOpenChange,
  messages,
  initialMessageId,
  conversationTitle,
  onCreate,
}: ConversationForkDialogProps) {
  const fallbackMessageId = messages[messages.length - 1]?.id ?? ""
  const [messageId, setMessageId] = useState(
    initialMessageId ?? fallbackMessageId
  )
  const [title, setTitle] = useState(`${conversationTitle} · 分支`)
  const [projectId, setProjectId] = useState("task")
  const [inheritance, setInheritance] = useState<string[]>(
    inheritanceOptions.map((option) => option.id)
  )

  useEffect(() => {
    if (!open) {
      return
    }
    setMessageId(initialMessageId ?? fallbackMessageId)
    setTitle(`${conversationTitle} · 分支`)
    setProjectId("task")
    setInheritance(inheritanceOptions.map((option) => option.id))
  }, [
    conversationTitle,
    fallbackMessageId,
    initialMessageId,
    open,
  ])

  const branchIndex = useMemo(
    () => messages.findIndex((message) => message.id === messageId),
    [messageId, messages]
  )
  const estimatedTokens = Math.max(960, (branchIndex + 1) * 1160)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>从当前会话分叉</DialogTitle>
            <Badge variant="secondary">Mock</Badge>
          </div>
          <DialogDescription>
            原会话快照保持不变。当前仅在前端内存中创建可切换的分支关系。
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fork-title">新会话标题</FieldLabel>
            <Input
              id="fork-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="输入分支标题"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="fork-message">分叉点</FieldLabel>
            <Select
              value={messageId}
              onValueChange={(value) => {
                if (value) {
                  setMessageId(value)
                }
              }}
            >
              <SelectTrigger id="fork-message" className="w-full">
                <SelectValue placeholder="选择消息">
                  {(value) => {
                    const index = messages.findIndex(
                      (message) => message.id === value
                    )
                    const message = messages[index]
                    return message
                      ? `第 ${index + 1} 条 · ${
                          message.role === "user" ? "用户" : "Aestival"
                        }`
                      : "选择消息"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {messages.map((message, index) => (
                    <SelectItem key={message.id} value={message.id}>
                      第 {index + 1} 条 ·
                      {message.role === "user" ? "用户" : "Aestival"}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              预计继承 {estimatedTokens.toLocaleString()} Token（Mock 估算）。
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="fork-project">目标项目</FieldLabel>
            <Select
              value={projectId}
              onValueChange={(value) => {
                if (value) {
                  setProjectId(value)
                }
              }}
            >
              <SelectTrigger id="fork-project" className="w-full">
                <SelectValue>
                  {(value) =>
                    mockForkProjects.find(
                      (project) => project.id === value
                    )?.label ?? "选择项目"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {mockForkProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <FieldSet>
            <FieldLegend variant="label">继承内容</FieldLegend>
            <FieldGroup data-slot="checkbox-group">
              {inheritanceOptions.map((option) => (
                <Field
                  key={option.id}
                  orientation="horizontal"
                >
                  <Checkbox
                    id={`fork-${option.id}`}
                    checked={inheritance.includes(option.id)}
                    onCheckedChange={(checked) =>
                      setInheritance((current) =>
                        checked
                          ? [...current, option.id]
                          : current.filter((id) => id !== option.id)
                      )
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`fork-${option.id}`}>
                      {option.label}
                    </FieldLabel>
                    <FieldDescription>
                      {option.description}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            disabled={!title.trim() || !messageId}
            onClick={() => onCreate(title.trim(), messageId)}
          >
            <GitForkIcon data-icon="inline-start" />
            创建 Mock 分支
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
