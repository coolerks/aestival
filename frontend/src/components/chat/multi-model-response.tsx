import { useState } from "react"
import {
  Columns2Icon,
  GitCompareArrowsIcon,
  ListIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  mockModelResponses,
  type ComparisonLayout,
  type MockModelResponse,
} from "@/data/mock-conversation-insights"

function ModelResult({ response }: { response: MockModelResponse }) {
  return (
    <article className="app-selectable-content flex min-w-0 flex-1 flex-col gap-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{response.model}</span>
        <Badge variant="outline">{response.provider}</Badge>
        <span className="text-xs text-muted-foreground">
          {response.latency}
        </span>
      </div>
      <p className="text-sm leading-6">{response.content}</p>
      <Separator />
      <dl className="grid grid-cols-3 gap-3 text-xs">
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">输入</dt>
          <dd>{response.inputTokens.toLocaleString()} Token</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">输出</dt>
          <dd>{response.outputTokens.toLocaleString()} Token</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">费用</dt>
          <dd>{response.estimatedCost} 估算</dd>
        </div>
      </dl>
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() =>
          toast.info(`已选择 ${response.model} 作为 Mock 执行模型`, {
            description: "当前不会继续调用工具、模型或产生费用。",
          })
        }
      >
        <SparklesIcon data-icon="inline-start" />
        选为执行模型
      </Button>
    </article>
  )
}

export function MultiModelResponse() {
  const [layout, setLayout] = useState<ComparisonLayout>("tabs")

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="multi-model-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitCompareArrowsIcon aria-hidden="true" />
          <h2 id="multi-model-heading" className="text-sm font-medium">
            同一轮次 · 多模型比较
          </h2>
          <Badge variant="secondary">Mock</Badge>
        </div>
        <ToggleGroup
          value={[layout]}
          onValueChange={(value) => {
            const next = value[0] as ComparisonLayout | undefined
            if (next) {
              setLayout(next)
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="多模型展示方式"
        >
          <ToggleGroupItem value="tabs" aria-label="模型页签">
            <ListIcon data-icon="inline-start" />
            页签
          </ToggleGroupItem>
          <ToggleGroupItem value="side-by-side" aria-label="并排比较">
            <Columns2Icon data-icon="inline-start" />
            并排
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {layout === "tabs" ? (
        <Tabs defaultValue={mockModelResponses[0]?.id}>
          <TabsList variant="line">
            {mockModelResponses.map((response) => (
              <TabsTrigger key={response.id} value={response.id}>
                {response.model}
              </TabsTrigger>
            ))}
          </TabsList>
          {mockModelResponses.map((response) => (
            <TabsContent key={response.id} value={response.id}>
              <ModelResult response={response} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ScrollArea className="w-full">
          <div className="grid min-w-[720px] grid-cols-2 gap-0">
            {mockModelResponses.map((response, index) => (
              <div
                key={response.id}
                className={index > 0 ? "border-l pl-5" : "pr-5"}
              >
                <ModelResult response={response} />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </section>
  )
}
