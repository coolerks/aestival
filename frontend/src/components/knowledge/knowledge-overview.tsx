import {
  ArrowDownAZIcon,
  ArrowDownWideNarrowIcon,
  BoxesIcon,
  DatabaseIcon,
  Grid2X2Icon,
  ListIcon,
  MoreHorizontalIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  KnowledgeBaseStatusBadge,
  KnowledgeMetric,
  KnowledgeSourceIcon,
  formatCount,
  knowledgeBaseStatusCopy,
  knowledgeSearchText,
} from "@/components/knowledge/knowledge-shared"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getKnowledgeSourceDefinition,
  knowledgeSourceDefinitions,
} from "@/data/mock-knowledge"
import { useKnowledgeStore } from "@/store/knowledge-store"

function KnowledgeActions({ id }: { id: string }) {
  const openKnowledgeDetails = useKnowledgeStore(
    (state) => state.openKnowledgeDetails
  )
  const requestDeleteKnowledge = useKnowledgeStore(
    (state) => state.requestDeleteKnowledge
  )
  const setActiveTab = useKnowledgeStore((state) => state.setActiveTab)
  const syncKnowledgeBase = useKnowledgeStore(
    (state) => state.syncKnowledgeBase
  )

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="知识库更多操作"
                />
              }
            />
          }
        >
          <MoreHorizontalIcon />
        </TooltipTrigger>
        <TooltipContent>更多操作</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openKnowledgeDetails(id)}>
          <BoxesIcon />
          打开详情
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setActiveTab("retrieval")
            toast.info("已带入检索测试（前端 Mock）")
          }}
        >
          <PlayIcon />
          测试检索
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            syncKnowledgeBase(id)
            toast.success("已开始前端 Mock 同步")
          }}
        >
          <RefreshCwIcon />
          立即同步
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => requestDeleteKnowledge(id)}
        >
          <Trash2Icon />
          删除知识库
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function KnowledgeOverview() {
  const knowledgeBases = useKnowledgeStore((state) => state.knowledgeBases)
  const viewMode = useKnowledgeStore((state) => state.viewMode)
  const searchQuery = useKnowledgeStore((state) => state.searchQuery)
  const typeFilter = useKnowledgeStore((state) => state.typeFilter)
  const statusFilter = useKnowledgeStore((state) => state.statusFilter)
  const sort = useKnowledgeStore((state) => state.sort)
  const partialFailureDismissed = useKnowledgeStore(
    (state) => state.partialFailureDismissed
  )
  const setViewMode = useKnowledgeStore((state) => state.setViewMode)
  const setSearchQuery = useKnowledgeStore((state) => state.setSearchQuery)
  const setTypeFilter = useKnowledgeStore((state) => state.setTypeFilter)
  const setStatusFilter = useKnowledgeStore((state) => state.setStatusFilter)
  const setSort = useKnowledgeStore((state) => state.setSort)
  const setNewKnowledgeOpen = useKnowledgeStore(
    (state) => state.setNewKnowledgeOpen
  )
  const openKnowledgeDetails = useKnowledgeStore(
    (state) => state.openKnowledgeDetails
  )
  const dismissPartialFailure = useKnowledgeStore(
    (state) => state.dismissPartialFailure
  )
  const setActiveTab = useKnowledgeStore((state) => state.setActiveTab)
  const recordCount = knowledgeBases.reduce(
    (total, item) => total + item.recordCount,
    0
  )
  const pendingCount = knowledgeBases.reduce(
    (total, item) => total + item.pendingSources,
    0
  )
  const retrievalCount = knowledgeBases.reduce(
    (total, item) => total + item.retrievals24h,
    0
  )
  const filtered = [...knowledgeBases]
    .filter((item) => {
      const searchMatch =
        !searchQuery ||
        knowledgeSearchText(item).includes(searchQuery.toLocaleLowerCase())
      const typeMatch =
        typeFilter === "all" || item.sourceType === typeFilter
      const statusMatch =
        statusFilter === "all" || item.status === statusFilter
      return searchMatch && typeMatch && statusMatch
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "zh-CN")
      if (sort === "records") return b.recordCount - a.recordCount
      if (sort === "retrievals") return b.retrievals24h - a.retrievals24h
      return a.id.localeCompare(b.id)
    })

  return (
    <div className="flex flex-col gap-4">
      {!partialFailureDismissed ? (
        <Alert>
          <RefreshCwIcon />
          <AlertTitle>有 1 个来源同步失败</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            已有索引仍可检索；可前往同步记录查看失败项。
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("sync")}
              >
                查看记录
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissPartialFailure}
              >
                忽略
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-stretch rounded-lg border">
        <KnowledgeMetric
          label="知识库总数"
          value={String(knowledgeBases.length)}
          onClick={() => setStatusFilter("all")}
        />
        <Separator orientation="vertical" className="h-auto" />
        <KnowledgeMetric label="已索引条目" value={formatCount(recordCount)} />
        <Separator orientation="vertical" className="h-auto" />
        <KnowledgeMetric
          label="待同步来源"
          value={String(pendingCount)}
          onClick={() => setStatusFilter("needs-update")}
        />
        <Separator orientation="vertical" className="h-auto" />
        <KnowledgeMetric
          label="24 小时检索"
          value={formatCount(retrievalCount)}
          onClick={() => setSort("retrievals")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="min-w-52 flex-1">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索名称、来源或标签"
            aria-label="搜索知识库"
          />
        </InputGroup>
        <Select
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as typeof typeFilter)
          }
        >
          <SelectTrigger className="w-40" aria-label="筛选连接类型">
            <SelectValue>
              {typeFilter === "all"
                ? "全部类型"
                : getKnowledgeSourceDefinition(typeFilter)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">全部类型</SelectItem>
              {knowledgeSourceDefinitions.map((source) => (
                <SelectItem key={source.type} value={source.type}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as typeof statusFilter)
          }
        >
          <SelectTrigger className="w-32" aria-label="筛选知识库状态">
            <SelectValue>
              {statusFilter === "all"
                ? "全部状态"
                : knowledgeBaseStatusCopy[statusFilter].label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="ready">就绪</SelectItem>
              <SelectItem value="syncing">同步中</SelectItem>
              <SelectItem value="needs-update">需更新</SelectItem>
              <SelectItem value="error">错误</SelectItem>
              <SelectItem value="disabled">已停用</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                {sort === "name" ? (
                  <ArrowDownAZIcon data-icon="inline-start" />
                ) : (
                  <ArrowDownWideNarrowIcon data-icon="inline-start" />
                )}
                排序
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSort("recent")}>
              最近更新
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("name")}>
              名称
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("records")}>
              条目数
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort("retrievals")}>
              检索次数
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToggleGroup
          value={[viewMode]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === "list" || next === "grid") setViewMode(next)
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="知识库视图"
        >
          <ToggleGroupItem value="list" aria-label="列表视图">
            <ListIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="网格视图">
            <Grid2X2Icon />
          </ToggleGroupItem>
        </ToggleGroup>
        <Button size="sm" onClick={() => setNewKnowledgeOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          新建知识库
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Empty className="min-h-72 rounded-lg border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DatabaseIcon />
            </EmptyMedia>
            <EmptyTitle>没有匹配的知识库</EmptyTitle>
            <EmptyDescription>
              调整搜索或筛选条件，也可以新建一个知识库。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="gap-3 py-4">
              <CardHeader className="gap-1 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <KnowledgeSourceIcon
                      type={item.sourceType}
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <CardTitle className="truncate">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  <KnowledgeActions id={item.id} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-4 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{item.sourceLabel}</span>
                  <KnowledgeBaseStatusBadge status={item.status} />
                </div>
                <span>
                  {formatCount(item.recordCount)} 条 ·{" "}
                  {formatCount(item.vectorCount)} 向量
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between px-4 text-xs text-muted-foreground">
                <span>{item.lastSync}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openKnowledgeDetails(item.id)}
                >
                  查看
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>知识库</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>模型</TableHead>
                <TableHead className="text-right">条目 / 向量</TableHead>
                <TableHead>最近同步</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">操作</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => openKnowledgeDetails(item.id)}
                >
                  <TableCell>
                    <div className="flex max-w-64 items-start gap-2">
                      <KnowledgeSourceIcon
                        type={item.sourceType}
                        className="mt-0.5 size-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{item.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-44 truncate">
                    {item.sourceLabel}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.embeddingModel}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCount(item.recordCount)} /{" "}
                    {formatCount(item.vectorCount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.lastSync}
                  </TableCell>
                  <TableCell>
                    <KnowledgeBaseStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <KnowledgeActions id={item.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
