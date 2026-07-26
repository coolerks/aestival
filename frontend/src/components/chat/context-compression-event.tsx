import { useState } from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GitForkIcon,
  RotateCwIcon,
  ShrinkIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import type { MockCompressionEvent } from "@/data/mock-conversation-insights"

type ContextCompressionEventProps = {
  event: MockCompressionEvent
  onRecompress: () => void
}

export function ContextCompressionEvent({
  event,
  onRecompress,
}: ContextCompressionEventProps) {
  const [open, setOpen] = useState(false)
  const saved = event.beforeTokens - event.afterTokens

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex max-w-3xl flex-col gap-3 border-y py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShrinkIcon aria-hidden="true" />
          <span className="text-sm font-medium">上下文已压缩</span>
          <Badge variant="secondary">Mock</Badge>
          <span className="text-xs text-muted-foreground">
            {event.updatedAt}
          </span>
        </div>
        <CollapsibleTrigger
          render={<Button variant="ghost" size="sm" />}
        >
          {open ? (
            <ChevronDownIcon data-icon="inline-start" />
          ) : (
            <ChevronRightIcon data-icon="inline-start" />
          )}
          {open ? "收起摘要" : "查看摘要"}
        </CollapsibleTrigger>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">压缩前</dt>
          <dd>{event.beforeTokens.toLocaleString()} Token</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">压缩后</dt>
          <dd>{event.afterTokens.toLocaleString()} Token</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">预计节省</dt>
          <dd>{saved.toLocaleString()} Token</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">消息范围</dt>
          <dd>{event.range}</dd>
        </div>
      </dl>

      <CollapsibleContent className="flex flex-col gap-3">
        <Separator />
        <p className="app-selectable-content text-sm leading-6 text-muted-foreground">
          {event.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onRecompress}>
            <RotateCwIcon data-icon="inline-start" />
            重新压缩
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              toast.info("压缩前分叉为前端 Mock", {
                description: "不会创建、保存或切换真实会话。",
              })
            }
          >
            <GitForkIcon data-icon="inline-start" />
            从压缩前分叉
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
