import { useMemo } from "react"
import { MessageSquareTextIcon, ShrinkIcon } from "lucide-react"
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspaceStore } from "@/store/workspace-store"

const contextChartConfig = {
  used: {
    label: "已用上下文",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ContextUsagePopover() {
  const draft = useWorkspaceStore((state) => state.draft)
  const attachments = useWorkspaceStore((state) => state.attachments)
  const messages = useWorkspaceStore((state) => state.messages)
  const autoCompact = useWorkspaceStore((state) => state.autoCompact)
  const setAutoCompact = useWorkspaceStore((state) => state.setAutoCompact)
  const contextSize = useWorkspaceStore((state) => state.contextSize)
  const setContextSize = useWorkspaceStore((state) => state.setContextSize)
  const contextPercent = Math.min(
    96,
    12 +
      messages.length * 4 +
      attachments.length * 3 +
      Math.ceil(draft.length / 180)
  )
  const chartData = useMemo(
    () => [{ name: "used", used: contextPercent, fill: "var(--color-used)" }],
    [contextPercent]
  )

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger render={<PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`上下文已使用 ${contextPercent}%，估算`} className="relative rounded-full p-0" />} />}>
        <ChartContainer
          config={contextChartConfig}
          className="pointer-events-none size-7 aspect-square"
          initialDimension={{ width: 28, height: 28 }}
        >
          <RadialBarChart
            data={chartData}
            innerRadius={9}
            outerRadius={13}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              dataKey="used"
              tick={false}
            />
            <RadialBar dataKey="used" background cornerRadius={8} />
          </RadialBarChart>
        </ChartContainer>
        <span className="pointer-events-none absolute text-[8px] font-medium tabular-nums">
          {contextPercent}%
        </span>
        </TooltipTrigger>
        <TooltipContent>上下文已使用 {contextPercent}%（估算）</TooltipContent>
      </Tooltip>

      <PopoverContent side="top" align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>上下文用量</PopoverTitle>
          <PopoverDescription>
            当前为前端估算，最终 token 以未来服务商结果为准。
          </PopoverDescription>
        </PopoverHeader>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquareTextIcon aria-hidden="true" />
              消息
            </span>
            <span className="tabular-nums">{messages.length * 620} token</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">系统指令</span>
            <span className="tabular-nums">1,280 token</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">附件</span>
            <span className="tabular-nums">
              {attachments.length * 420} token
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">预留输出</span>
            <span className="tabular-nums">8,192 token</span>
          </div>
        </div>

        <Separator />

        <label className="flex items-center justify-between gap-3 text-sm">
          <span className="flex flex-col">
            <span>自动压缩</span>
            <span className="text-xs text-muted-foreground">
              达到 90% 时生成 Mock 压缩事件
            </span>
          </span>
          <Switch
            checked={autoCompact}
            onCheckedChange={setAutoCompact}
            aria-label="自动压缩上下文"
          />
        </label>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">上下文大小</span>
          <Select
            value={contextSize}
            onValueChange={(value) =>
              setContextSize(value as "auto" | "128k" | "200k")
            }
          >
            <SelectTrigger size="sm" aria-label="上下文大小">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                <SelectItem value="auto">自动</SelectItem>
                <SelectItem value="128k">128K</SelectItem>
                <SelectItem value="200k">200K</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast.info("上下文压缩为前端 Mock", {
              description: "不会修改真实消息，也不会调用模型生成摘要。",
            })
          }
        >
          <ShrinkIcon data-icon="inline-start" />
          立即压缩
        </Button>
      </PopoverContent>
    </Popover>
  )
}
