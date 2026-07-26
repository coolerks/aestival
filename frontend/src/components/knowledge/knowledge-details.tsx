import { useEffect, useState } from "react"
import {
  CableIcon,
  CircleAlertIcon,
  DatabaseIcon,
  FileTextIcon,
  PlayIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  ConnectionStatusBadge,
  KnowledgeBaseStatusBadge,
  KnowledgeSourceIcon,
  formatCount,
} from "@/components/knowledge/knowledge-shared"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useKnowledgeStore } from "@/store/knowledge-store"

function DefinitionList({
  rows,
}: {
  rows: Array<[string, string | number]>
}) {
  return (
    <dl className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="truncate text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function KnowledgeDetails() {
  const selectedId = useKnowledgeStore(
    (state) => state.selectedKnowledgeId
  )
  const knowledgeBases = useKnowledgeStore((state) => state.knowledgeBases)
  const allContents = useKnowledgeStore((state) => state.contents)
  const allSyncRecords = useKnowledgeStore((state) => state.syncRecords)
  const knowledgeBase = knowledgeBases.find((item) => item.id === selectedId)
  const contents = allContents.filter(
    (item) => item.knowledgeBaseId === selectedId
  )
  const syncRecords = allSyncRecords.filter(
    (item) => item.knowledgeBaseId === selectedId
  )
  const openKnowledgeDetails = useKnowledgeStore(
    (state) => state.openKnowledgeDetails
  )
  const setActiveTab = useKnowledgeStore((state) => state.setActiveTab)
  const syncKnowledgeBase = useKnowledgeStore(
    (state) => state.syncKnowledgeBase
  )
  const completeKnowledgeSync = useKnowledgeStore(
    (state) => state.completeKnowledgeSync
  )
  const requestDeleteKnowledge = useKnowledgeStore(
    (state) => state.requestDeleteKnowledge
  )
  const [topK, setTopK] = useState(5)
  const [threshold, setThreshold] = useState(0.68)
  const [automaticRetrieval, setAutomaticRetrieval] = useState(true)

  useEffect(() => {
    if (!knowledgeBase || knowledgeBase.status !== "syncing") return
    const timeout = window.setTimeout(
      () => completeKnowledgeSync(knowledgeBase.id),
      1200
    )
    return () => window.clearTimeout(timeout)
  }, [completeKnowledgeSync, knowledgeBase])

  if (!knowledgeBase) {
    return null
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) openKnowledgeDetails(null)
      }}
    >
      <SheetContent className="w-[760px] max-w-[92vw] sm:max-w-[760px]">
        <SheetHeader className="border-b">
          <div className="flex items-start gap-2 pr-8">
            <KnowledgeSourceIcon
              type={knowledgeBase.sourceType}
              className="mt-0.5 size-4"
            />
            <div className="min-w-0">
              <SheetTitle>{knowledgeBase.name}</SheetTitle>
              <SheetDescription>{knowledgeBase.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <Tabs defaultValue="overview" className="min-h-0 flex-1 px-4 pb-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="content">内容</TabsTrigger>
            <TabsTrigger value="retrieval">检索配置</TabsTrigger>
            <TabsTrigger value="sync">同步</TabsTrigger>
            <TabsTrigger value="permissions">权限</TabsTrigger>
          </TabsList>
          <TabsContent
            value="overview"
            className="mt-4 flex flex-col gap-4 overflow-auto"
          >
            <div className="flex flex-wrap items-center gap-2">
              <KnowledgeBaseStatusBadge status={knowledgeBase.status} />
              {knowledgeBase.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            {knowledgeBase.status === "syncing" ? (
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>初次/增量同步</span>
                  <span className="text-muted-foreground">Mock 68%</span>
                </div>
                <Progress value={68} />
              </div>
            ) : null}
            <DefinitionList
              rows={[
                ["来源", knowledgeBase.sourceLabel],
                ["嵌入模型", knowledgeBase.embeddingModel],
                ["文档 / 记录", `${formatCount(knowledgeBase.documentCount)} / ${formatCount(knowledgeBase.recordCount)}`],
                ["向量数量", formatCount(knowledgeBase.vectorCount)],
                ["索引大小", knowledgeBase.indexSize],
                ["最近同步", knowledgeBase.lastSync],
                ["24 小时检索", knowledgeBase.retrievals24h],
                ["可使用范围", knowledgeBase.agentScope],
              ]}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  syncKnowledgeBase(knowledgeBase.id)
                  toast.success("已开始前端 Mock 同步")
                }}
              >
                <RefreshCwIcon data-icon="inline-start" />
                立即同步
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  openKnowledgeDetails(null)
                  setActiveTab("retrieval")
                }}
              >
                <PlayIcon data-icon="inline-start" />
                测试检索
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("编辑配置为前端 Mock")}
              >
                编辑
              </Button>
            </div>
          </TabsContent>
          <TabsContent
            value="content"
            className="mt-4 flex min-h-0 flex-col gap-3 overflow-auto"
          >
            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                placeholder="搜索文档、记录或来源"
                aria-label="搜索知识库内容"
              />
              <Button variant="outline" size="icon-sm" aria-label="筛选内容">
                <SearchIcon />
              </Button>
            </div>
            {contents.length === 0 ? (
              <Empty className="min-h-56 rounded-lg border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon />
                  </EmptyMedia>
                  <EmptyTitle>暂无已索引内容</EmptyTitle>
                  <EmptyDescription>
                    完成初次同步后会显示文档、记录和切片状态。
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>内容</TableHead>
                      <TableHead>切片</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow
                        key={content.id}
                        className="cursor-pointer"
                        onClick={() =>
                          toast.info(
                            `${content.title} 原文预览为前端 Mock`
                          )
                        }
                      >
                        <TableCell>
                          <div className="max-w-80">
                            <div className="truncate font-medium">
                              {content.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {content.source}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{content.chunkCount}</TableCell>
                        <TableCell>{content.updatedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              content.status === "failed"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {content.status === "indexed"
                              ? "已索引"
                              : content.status === "excluded"
                                ? "已排除"
                                : "失败"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="retrieval"
            className="mt-4 flex flex-col gap-5 overflow-auto"
          >
            <Field>
              <FieldLabel htmlFor="detail-top-k">Top K：{topK}</FieldLabel>
              <Slider
                id="detail-top-k"
                min={1}
                max={20}
                step={1}
                value={[topK]}
                onValueChange={(value) => setTopK(value[0] ?? topK)}
              />
              <FieldDescription>每次检索最多返回的候选项。</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="detail-threshold">
                相似度阈值：{threshold.toFixed(2)}
              </FieldLabel>
              <Slider
                id="detail-threshold"
                min={0}
                max={1}
                step={0.01}
                value={[threshold]}
                onValueChange={(value) =>
                  setThreshold(value[0] ?? threshold)
                }
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="detail-rerank">结果重排</FieldLabel>
              <Switch id="detail-rerank" defaultChecked />
              <FieldDescription>Mock Rerank v2</FieldDescription>
            </Field>
            <Button
              className="self-start"
              size="sm"
              onClick={() => toast.success("检索配置已保存到前端内存")}
            >
              保存配置
            </Button>
          </TabsContent>
          <TabsContent
            value="sync"
            className="mt-4 flex flex-col gap-4 overflow-auto"
          >
            <DefinitionList
              rows={[
                ["同步策略", "文件变化 + 启动时"],
                ["上次同步", knowledgeBase.lastSync],
                ["下次同步", "检测到本地变化时"],
                ["增量游标", "mock:cursor:7f2"],
              ]}
            />
            <Button
              className="self-start"
              size="sm"
              onClick={() => syncKnowledgeBase(knowledgeBase.id)}
            >
              <RefreshCwIcon data-icon="inline-start" />
              立即同步
            </Button>
            <ItemGroup className="gap-0 rounded-lg border p-2">
              {syncRecords.map((record) => (
                <Item key={record.id} size="sm">
                  <ItemContent>
                    <ItemTitle>{record.startedAt} · {record.trigger}</ItemTitle>
                    <ItemDescription>
                      扫描 {record.scanned}，新增 {record.created}，更新{" "}
                      {record.updated}，失败 {record.failed}
                    </ItemDescription>
                  </ItemContent>
                  <Badge
                    variant={
                      record.status === "failed"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {record.status}
                  </Badge>
                </Item>
              ))}
            </ItemGroup>
          </TabsContent>
          <TabsContent
            value="permissions"
            className="mt-4 flex flex-col gap-4 overflow-auto"
          >
            <Field orientation="horizontal">
              <FieldLabel htmlFor="auto-retrieval">
                允许代理自动检索
              </FieldLabel>
              <Switch
                id="auto-retrieval"
                checked={automaticRetrieval}
                onCheckedChange={setAutomaticRetrieval}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="full-source">允许查看完整来源</FieldLabel>
              <Switch id="full-source" defaultChecked />
            </Field>
            <DefinitionList
              rows={[
                ["允许的智能体", knowledgeBase.agentScope],
                ["数据脱敏", "凭据、Token、环境变量值"],
                ["聊天模式", "禁止自动检索"],
                ["代理模式", "遵循审批策略"],
              ]}
            />
          </TabsContent>
        </Tabs>
        <div className="border-t p-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => requestDeleteKnowledge(knowledgeBase.id)}
          >
            <Trash2Icon data-icon="inline-start" />
            删除知识库
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ConnectionDetails() {
  const selectedId = useKnowledgeStore(
    (state) => state.selectedConnectionId
  )
  const connections = useKnowledgeStore((state) => state.connections)
  const knowledgeBases = useKnowledgeStore((state) => state.knowledgeBases)
  const connection = connections.find((item) => item.id === selectedId)
  const linked = knowledgeBases.filter(
    (item) => item.connectionId === selectedId
  )
  const openConnectionDetails = useKnowledgeStore(
    (state) => state.openConnectionDetails
  )
  const requestDisconnectConnection = useKnowledgeStore(
    (state) => state.requestDisconnectConnection
  )

  if (!connection) return null

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) openConnectionDetails(null)
      }}
    >
      <SheetContent className="w-[620px] max-w-[92vw] sm:max-w-[620px]">
        <SheetHeader className="border-b">
          <div className="flex items-start gap-2 pr-8">
            <KnowledgeSourceIcon
              type={connection.type}
              className="mt-0.5 size-4"
            />
            <div>
              <SheetTitle>{connection.name}</SheetTitle>
              <SheetDescription>
                {connection.address} ·{" "}
                {connection.readOnly ? "只读" : "可写"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <Tabs defaultValue="overview" className="min-h-0 flex-1 px-4 pb-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="linked">关联知识库</TabsTrigger>
            <TabsTrigger value="permissions">权限</TabsTrigger>
            <TabsTrigger value="diagnostic">测试与诊断</TabsTrigger>
            <TabsTrigger value="usage">使用记录</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
            <div className="flex gap-2">
              <ConnectionStatusBadge status={connection.status} />
              {connection.capabilities.map((capability) => (
                <Badge key={capability} variant="outline">
                  {capability}
                </Badge>
              ))}
            </div>
            <DefinitionList
              rows={[
                ["地址", connection.address],
                ["关联知识库", connection.linkedKnowledgeCount],
                ["最近测试", connection.lastTest],
                ["存储策略", connection.readOnly ? "只读" : "可写"],
              ]}
            />
          </TabsContent>
          <TabsContent value="linked" className="mt-4">
            {linked.length ? (
              <ItemGroup className="gap-0 rounded-lg border p-2">
                {linked.map((item) => (
                  <Item key={item.id} size="sm">
                    <ItemContent>
                      <ItemTitle>{item.name}</ItemTitle>
                      <ItemDescription>{item.sourceLabel}</ItemDescription>
                    </ItemContent>
                    <KnowledgeBaseStatusBadge status={item.status} />
                  </Item>
                ))}
              </ItemGroup>
            ) : (
              <Empty className="min-h-52 rounded-lg border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <DatabaseIcon />
                  </EmptyMedia>
                  <EmptyTitle>暂无关联知识库</EmptyTitle>
                  <EmptyDescription>
                    创建知识库时可选择这个连接。
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>
          <TabsContent
            value="permissions"
            className="mt-4 flex flex-col gap-3"
          >
            <Field orientation="horizontal">
              <FieldLabel htmlFor="connection-read-only">只读访问</FieldLabel>
              <Switch
                id="connection-read-only"
                checked={connection.readOnly}
                disabled
              />
              <FieldDescription>
                当前阶段不允许数据库写操作。
              </FieldDescription>
            </Field>
            <DefinitionList
              rows={[
                ["密钥存储", "未保存（Mock）"],
                ["环境变量值", "不展示、不持久化"],
                ["代理访问", "按现有审批策略"],
                ["网络测试", "未发起真实请求"],
              ]}
            />
          </TabsContent>
          <TabsContent
            value="diagnostic"
            className="mt-4 flex flex-col gap-3"
          >
            <div className="rounded-lg border p-3 text-sm">
              {connection.diagnostic}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  toast.success("前端 Mock 测试完成，未发起网络请求")
                }
              >
                <ShieldCheckIcon data-icon="inline-start" />
                重新测试
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("脱敏诊断已复制（Mock）")}
              >
                复制诊断
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
            <ItemGroup className="gap-0 rounded-lg border p-2">
              <Item size="sm">
                <ItemContent>
                  <ItemTitle>测试连接</ItemTitle>
                  <ItemDescription>{connection.lastTest}</ItemDescription>
                </ItemContent>
              </Item>
              <Item size="sm">
                <ItemContent>
                  <ItemTitle>本地索引读取</ItemTitle>
                  <ItemDescription>
                    仅显示前端 Mock 使用记录。
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          </TabsContent>
        </Tabs>
        <div className="border-t p-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => requestDisconnectConnection(connection.id)}
          >
            <CableIcon data-icon="inline-start" />
            断开连接
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function KnowledgeManagementDialogs() {
  const deleteId = useKnowledgeStore((state) => state.deleteKnowledgeId)
  const disconnectId = useKnowledgeStore(
    (state) => state.disconnectConnectionId
  )
  const clearHistoryOpen = useKnowledgeStore(
    (state) => state.clearHistoryOpen
  )
  const knowledgeBases = useKnowledgeStore((state) => state.knowledgeBases)
  const connections = useKnowledgeStore((state) => state.connections)
  const knowledgeBase = knowledgeBases.find((item) => item.id === deleteId)
  const connection = connections.find((item) => item.id === disconnectId)
  const deleteKnowledgeBase = useKnowledgeStore(
    (state) => state.deleteKnowledgeBase
  )
  const requestDeleteKnowledge = useKnowledgeStore(
    (state) => state.requestDeleteKnowledge
  )
  const disconnectConnection = useKnowledgeStore(
    (state) => state.disconnectConnection
  )
  const requestDisconnectConnection = useKnowledgeStore(
    (state) => state.requestDisconnectConnection
  )
  const setClearHistoryOpen = useKnowledgeStore(
    (state) => state.setClearHistoryOpen
  )
  const clearSyncHistory = useKnowledgeStore(
    (state) => state.clearSyncHistory
  )
  const [removeIndexes, setRemoveIndexes] = useState(false)

  return (
    <>
      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) requestDeleteKnowledge(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>删除“{knowledgeBase?.name}”？</AlertDialogTitle>
            <AlertDialogDescription>
              将移除该知识库的 Mock 配置、内容和本地索引记录，不会删除来源文件或数据库数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteId) deleteKnowledgeBase(deleteId)
                toast.success("知识库已从前端 Mock 中删除")
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(disconnectId)}
        onOpenChange={(open) => {
          if (!open) {
            requestDisconnectConnection(null)
            setRemoveIndexes(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <CircleAlertIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>断开“{connection?.name}”？</AlertDialogTitle>
            <AlertDialogDescription>
              {connection?.linkedKnowledgeCount ?? 0} 个关联知识库将被停用。来源数据不会被修改。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <Checkbox
              checked={removeIndexes}
              onCheckedChange={(checked) =>
                setRemoveIndexes(checked === true)
              }
            />
            <span>
              同时移除本地索引
              <span className="block text-xs text-muted-foreground">
                不勾选时仅移除连接配置，保留不可更新的本地索引。
              </span>
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (disconnectId) {
                  disconnectConnection(disconnectId, removeIndexes)
                }
                toast.success("连接已从前端 Mock 中移除")
              }}
            >
              断开
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={clearHistoryOpen}
        onOpenChange={setClearHistoryOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>清理同步历史？</AlertDialogTitle>
            <AlertDialogDescription>
              已完成和失败的 Mock 记录会被移除，正在运行的记录会保留。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clearSyncHistory()
                toast.success("同步历史已清理")
              }}
            >
              清理
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
