import { useState } from "react"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleSlash2Icon,
  FolderSearchIcon,
  ShieldQuestionIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import type { MockToolCall } from "@/data/mock-conversation"

type ToolCallCardProps = {
  toolCall: MockToolCall
  onDecision: (decision: "once" | "session" | "reject") => void
}

const stateLabels: Record<MockToolCall["state"], string> = {
  pending: "等待审批",
  running: "运行中",
  succeeded: "已完成",
  rejected: "已拒绝",
}

export function ToolCallCard({
  toolCall,
  onDecision,
}: ToolCallCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <Card size="sm" className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderSearchIcon aria-hidden="true" />
          {toolCall.name}
        </CardTitle>
        <CardDescription>{toolCall.target}</CardDescription>
        <CardAction>
          <Badge
            variant={
              toolCall.state === "rejected" ? "destructive" : "secondary"
            }
          >
            {toolCall.state === "running" ? (
              <Spinner aria-label="Mock 工具运行中" />
            ) : toolCall.state === "succeeded" ? (
              <CheckCircle2Icon data-icon="inline-start" />
            ) : toolCall.state === "rejected" ? (
              <CircleSlash2Icon data-icon="inline-start" />
            ) : (
              <ShieldQuestionIcon data-icon="inline-start" />
            )}
            {stateLabels[toolCall.state]}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm">{toolCall.summary}</p>

        {toolCall.state === "running" ? (
          <Progress value={58}>
            <ProgressLabel>生成 Mock 工具结果</ProgressLabel>
          </Progress>
        ) : null}

        {toolCall.state === "rejected" ? (
          <Alert variant="destructive">
            <CircleSlash2Icon aria-hidden="true" />
            <AlertTitle>审批已拒绝</AlertTitle>
            <AlertDescription>
              没有执行工具，也没有访问真实文件。
            </AlertDescription>
          </Alert>
        ) : null}

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger
            render={<Button variant="ghost" size="sm" />}
          >
            {detailsOpen ? (
              <ChevronDownIcon data-icon="inline-start" />
            ) : (
              <ChevronRightIcon data-icon="inline-start" />
            )}
            查看影响范围
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2 px-2 pt-2 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">风险：</span>
              {toolCall.risk}
            </p>
            <p>
              <span className="font-medium text-foreground">范围：</span>
              {toolCall.impact}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      {toolCall.state === "pending" ? (
        <>
          <Separator />
          <CardFooter className="flex flex-wrap justify-end gap-2 border-t-0 bg-transparent pt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDecision("reject")}
            >
              拒绝
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDecision("session")}
            >
              本会话允许
            </Button>
            <Button size="sm" onClick={() => onDecision("once")}>
              允许一次
            </Button>
          </CardFooter>
        </>
      ) : null}
    </Card>
  )
}
