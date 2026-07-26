import { useEffect } from "react"
import {
  BracesIcon,
  CheckIcon,
  CircleAlertIcon,
  ListFilterIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  WorkflowIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useKnowledgeStore } from "@/store/knowledge-store"

export function KnowledgeRetrievalTest() {
  const knowledgeBases = useKnowledgeStore((state) => state.knowledgeBases)
  const query = useKnowledgeStore((state) => state.retrievalQuery)
  const selectedIds = useKnowledgeStore(
    (state) => state.retrievalKnowledgeIds
  )
  const view = useKnowledgeStore((state) => state.retrievalView)
  const runState = useKnowledgeStore((state) => state.retrievalRunState)
  const results = useKnowledgeStore((state) => state.retrievalResults)
  const topK = useKnowledgeStore((state) => state.topK)
  const threshold = useKnowledgeStore((state) => state.threshold)
  const hybridWeight = useKnowledgeStore((state) => state.hybridWeight)
  const rerankEnabled = useKnowledgeStore((state) => state.rerankEnabled)
  const setQuery = useKnowledgeStore((state) => state.setRetrievalQuery)
  const toggleKnowledge = useKnowledgeStore(
    (state) => state.toggleRetrievalKnowledge
  )
  const setView = useKnowledgeStore((state) => state.setRetrievalView)
  const startRetrieval = useKnowledgeStore((state) => state.startRetrieval)
  const completeRetrieval = useKnowledgeStore(
    (state) => state.completeRetrieval
  )
  const setTopK = useKnowledgeStore((state) => state.setTopK)
  const setThreshold = useKnowledgeStore((state) => state.setThreshold)
  const setHybridWeight = useKnowledgeStore(
    (state) => state.setHybridWeight
  )
  const setRerankEnabled = useKnowledgeStore(
    (state) => state.setRerankEnabled
  )

  useEffect(() => {
    if (runState !== "running") return
    const timeout = window.setTimeout(() => {
      completeRetrieval()
      toast.success("Mock 检索完成")
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [completeRetrieval, runState])

  const run = () => {
    if (!query.trim() || selectedIds.length === 0) {
      toast.error("请输入查询，并至少选择一个知识库")
      return
    }
    startRetrieval()
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入要验证的查询"
            onKeyDown={(event) => {
              if (event.key === "Enter") run()
            }}
          />
          <Button onClick={run} disabled={runState === "running"}>
            <PlayIcon data-icon="inline-start" />
            {runState === "running" ? "检索中" : "运行"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {knowledgeBases.map((knowledgeBase) => (
            <label
              key={knowledgeBase.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
            >
              <Checkbox
                checked={selectedIds.includes(knowledgeBase.id)}
                onCheckedChange={() => toggleKnowledge(knowledgeBase.id)}
              />
              <span>{knowledgeBase.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <section className="flex flex-col gap-4 rounded-lg border p-3">
          <div>
            <h3 className="text-sm font-medium">检索参数</h3>
            <p className="text-xs text-muted-foreground">
              仅影响本次前端 Mock 结果。
            </p>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="knowledge-top-k">
                Top K：{topK}
              </FieldLabel>
              <Slider
                id="knowledge-top-k"
                min={1}
                max={12}
                step={1}
                value={[topK]}
                onValueChange={(value) => setTopK(value[0] ?? topK)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="knowledge-threshold">
                相似度阈值：{threshold.toFixed(2)}
              </FieldLabel>
              <Slider
                id="knowledge-threshold"
                min={0}
                max={1}
                step={0.01}
                value={[threshold]}
                onValueChange={(value) =>
                  setThreshold(value[0] ?? threshold)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="knowledge-hybrid">
                混合权重：{hybridWeight.toFixed(2)}
              </FieldLabel>
              <Slider
                id="knowledge-hybrid"
                min={0}
                max={1}
                step={0.05}
                value={[hybridWeight]}
                onValueChange={(value) =>
                  setHybridWeight(value[0] ?? hybridWeight)
                }
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="knowledge-rerank">启用重排</FieldLabel>
              <Switch
                id="knowledge-rerank"
                checked={rerankEnabled}
                onCheckedChange={setRerankEnabled}
              />
              <FieldDescription>Mock Rerank v2</FieldDescription>
            </Field>
          </FieldGroup>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium">结果与调试</h3>
              <p className="text-xs text-muted-foreground">
                查询过程不包含凭据或隐藏推理。
              </p>
            </div>
            <ToggleGroup
              value={[view]}
              onValueChange={(value) => {
                const next = value[0]
                if (
                  next === "results" ||
                  next === "json" ||
                  next === "process"
                ) {
                  setView(next)
                }
              }}
              variant="outline"
              size="sm"
              spacing={0}
            >
              <ToggleGroupItem value="results">
                <SearchIcon />
                结果
              </ToggleGroupItem>
              <ToggleGroupItem value="json">
                <BracesIcon />
                JSON
              </ToggleGroupItem>
              <ToggleGroupItem value="process">
                <WorkflowIcon />
                过程
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {runState === "running" ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border">
              <Progress value={58} className="w-56" />
              <p className="text-sm text-muted-foreground">
                正在组合本地 Mock 检索结果…
              </p>
            </div>
          ) : runState === "idle" ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg border text-center">
              <ListFilterIcon className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">运行一次检索以查看结果</p>
              <p className="text-xs text-muted-foreground">
                不会访问真实数据库或嵌入服务。
              </p>
            </div>
          ) : view === "json" ? (
            <pre className="max-h-[460px] overflow-auto rounded-lg border bg-muted/30 p-4 text-xs">
              {JSON.stringify(
                {
                  query,
                  knowledgeBaseIds: selectedIds,
                  parameters: {
                    topK,
                    threshold,
                    hybridWeight,
                    rerankEnabled,
                  },
                  results,
                },
                null,
                2
              )}
            </pre>
          ) : view === "process" ? (
            <ItemGroup className="gap-0 rounded-lg border p-2">
              {[
                ["查询规范化", "移除多余空格并保留中文标点"],
                ["知识库路由", `选择 ${selectedIds.length} 个本地索引`],
                ["混合召回", `向量/关键词权重 ${hybridWeight.toFixed(2)}`],
                ["结果重排", rerankEnabled ? "Mock Rerank v2" : "已跳过"],
                ["阈值过滤", `保留分数 ≥ ${threshold.toFixed(2)} 的结果`],
              ].map(([title, description]) => (
                <Item key={title} size="sm">
                  <ItemMedia variant="icon">
                    <CheckIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{title}</ItemTitle>
                    <ItemDescription>{description}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          ) : results.length === 0 ? (
            <Alert>
              <CircleAlertIcon />
              <AlertTitle>没有达到阈值的结果</AlertTitle>
              <AlertDescription>
                可降低相似度阈值，或选择其他知识库后重新运行。
              </AlertDescription>
            </Alert>
          ) : (
            <ItemGroup className="gap-0 rounded-lg border p-2">
              {results.map((result) => (
                <Item key={result.id} size="sm" className="items-start">
                  <ItemMedia className="mt-0.5">
                    <Badge variant="secondary">#{result.rank}</Badge>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {result.knowledgeBaseName}
                      <Badge variant="outline">
                        {result.score.toFixed(2)}
                      </Badge>
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none">
                      {result.excerpt}
                    </ItemDescription>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{result.source}</span>
                      <span>{result.location}</span>
                      <span>向量 {result.vectorScore.toFixed(2)}</span>
                      <span>关键词 {result.keywordScore.toFixed(2)}</span>
                      <span>重排 {result.rerankScore.toFixed(2)}</span>
                    </div>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toast.info("已加入当前会话上下文（前端 Mock）")
                      }
                    >
                      <PlusIcon data-icon="inline-start" />
                      加入会话
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </section>
      </div>
    </div>
  )
}
