import { useEffect, useMemo, useRef, useState } from "react"
import type { Core, EventObjectNode } from "cytoscape"
import {
  CircleAlertIcon,
  FocusIcon,
  Maximize2Icon,
  NetworkIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react"

import { IconButton } from "@/components/shell/icon-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  sampleGraphEdges,
  sampleGraphNodes,
} from "@/data/mock-project-workspace"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"

function localNodeIds(
  center: string,
  depth: number,
  direction: "both" | "incoming" | "outgoing",
) {
  const selected = new Set([center])
  let frontier = new Set([center])
  for (let level = 0; level < depth; level += 1) {
    const next = new Set<string>()
    sampleGraphEdges.forEach((edge) => {
      if ((direction === "both" || direction === "outgoing") && frontier.has(edge.sourceId)) next.add(edge.targetId)
      if ((direction === "both" || direction === "incoming") && frontier.has(edge.targetId)) next.add(edge.sourceId)
    })
    next.forEach((id) => selected.add(id))
    frontier = next
  }
  return selected
}

export function NoteGraph({
  projectId,
  variant = "global",
}: {
  projectId: string
  variant?: "global" | "local"
}) {
  const project = useProjectWorkspaceStore((state) =>
    state.projects.find((item) => item.id === projectId),
  )
  const workspace = useProjectWorkspaceStore(
    (state) => state.noteWorkspaces[projectId],
  )
  const noteEntries = useProjectWorkspaceStore((state) => state.noteEntries)
  const noteEntryIds = useMemo(
    () => new Set(noteEntries.map((entry) => entry.id)),
    [noteEntries],
  )
  const setQuery = useProjectWorkspaceStore((state) => state.setGraphQuery)
  const setRootFilter = useProjectWorkspaceStore((state) => state.setGraphRootFilter)
  const setShowOrphans = useProjectWorkspaceStore((state) => state.setGraphShowOrphans)
  const selectNode = useProjectWorkspaceStore((state) => state.selectGraphNode)
  const openNote = useProjectWorkspaceStore((state) => state.openNote)
  const setDepth = useProjectWorkspaceStore((state) => state.setLocalGraphDepth)
  const setDirection = useProjectWorkspaceStore((state) => state.setLocalGraphDirection)
  const canvasRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<Core | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const graphQuery = workspace?.graphQuery ?? ""
  const graphRootFilter = workspace?.graphRootFilter ?? "all"
  const graphShowOrphans = workspace?.graphShowOrphans ?? true
  const selectedGraphNodeId = workspace?.selectedGraphNodeId ?? null
  const localCenterNodeId = variant === "local" ? selectedGraphNodeId : null
  const localGraphDepth = workspace?.localGraphDepth ?? 1
  const localGraphDirection = workspace?.localGraphDirection ?? "both"

  const visibleNodes = useMemo(() => {
    if (!project?.sample) return []
    const query = graphQuery.trim().toLocaleLowerCase()
    const localIds =
      localCenterNodeId
        ? localNodeIds(
            localCenterNodeId,
            localGraphDepth,
            localGraphDirection,
          )
        : null
    return sampleGraphNodes.filter(
      (node) =>
        noteEntryIds.has(node.id) &&
        (!localIds || localIds.has(node.id)) &&
        (graphRootFilter === "all" || node.rootId === graphRootFilter) &&
        (graphShowOrphans || !node.orphan) &&
        (!query || `${node.title} ${node.relativePath} ${node.tags.join(" ")}`.toLocaleLowerCase().includes(query)),
    )
  }, [graphQuery, graphRootFilter, graphShowOrphans, localCenterNodeId, localGraphDepth, localGraphDirection, noteEntryIds, project?.sample])

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  )
  const visibleEdges = useMemo(
    () =>
      sampleGraphEdges.filter(
        (edge) => visibleNodeIds.has(edge.sourceId) && visibleNodeIds.has(edge.targetId),
      ),
    [visibleNodeIds],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visibleNodes.length) return
    let cancelled = false
    setLoading(true)
    setFailed(false)
    void import("cytoscape")
      .then(({ default: cytoscape }) => {
        if (cancelled || !canvas.isConnected) return
        graphRef.current?.destroy()
        const dark = document.documentElement.classList.contains("dark")
        const foreground = dark ? "#e8e8e8" : "#262626"
        const background = dark ? "#242424" : "#ffffff"
        const border = dark ? "#666666" : "#a3a3a3"
        const primary = dark ? "#f0f0f0" : "#303030"
        const cy = cytoscape({
          container: canvas,
          elements: [
            ...visibleNodes.map((node) => ({ data: { id: node.id, label: node.title, rootId: node.rootId } })),
            ...visibleEdges.map((edge) => ({ data: { id: edge.id, source: edge.sourceId, target: edge.targetId, kind: edge.kind } })),
          ],
          style: [
            {
              selector: "node",
              style: {
                label: "data(label)",
                color: foreground,
                "background-color": background,
                "border-color": border,
                "border-width": 1.5,
                "font-size": 10,
                "text-valign": "bottom",
                "text-margin-y": 7,
                width: 28,
                height: 28,
              },
            },
            {
              selector: 'node[rootId = "root-library"]',
              style: { shape: "round-rectangle", width: 34 },
            },
            {
              selector: "node:selected",
              style: { "border-color": primary, "border-width": 3, "background-color": primary },
            },
            {
              selector: "edge",
              style: {
                width: 1.2,
                "line-color": border,
                "target-arrow-color": border,
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
              },
            },
            {
              selector: 'edge[kind = "wiki-link"]',
              style: { "line-style": "dashed" },
            },
          ],
          layout: {
            name: variant === "local" ? "breadthfirst" : "cose",
            animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            fit: true,
            padding: 36,
          },
          minZoom: 0.35,
          maxZoom: 2.4,
        })
        cy.on("tap", "node", (event: EventObjectNode) => {
          selectNode(projectId, event.target.id())
        })
        const observer = new ResizeObserver(() => {
          cy.resize()
          cy.fit(undefined, 28)
        })
        observer.observe(canvas)
        cy.one("destroy", () => observer.disconnect())
        graphRef.current = cy
        if (selectedGraphNodeId) {
          cy.getElementById(selectedGraphNodeId).select()
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          setFailed(true)
        }
      })
    return () => {
      cancelled = true
      graphRef.current?.destroy()
      graphRef.current = null
      canvas.replaceChildren()
    }
  }, [projectId, selectNode, variant, visibleEdges, visibleNodes])

  useEffect(() => {
    const cy = graphRef.current
    if (!cy) return
    cy.nodes().unselect()
    if (selectedGraphNodeId) cy.getElementById(selectedGraphNodeId).select()
  }, [selectedGraphNodeId])

  if (!workspace || !project) return null
  if (!project.sample) {
    return (
      <Empty className="h-full rounded-none border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon"><NetworkIcon /></EmptyMedia>
          <EmptyTitle>尚无可展示的知识图谱</EmptyTitle>
          <EmptyDescription>
            文件读取与链接索引服务尚未接入。Aestival 不会根据你选择的真实目录伪造节点或关系。
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex size-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-2">
        <div className="relative min-w-44 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={workspace.graphQuery}
            className="h-8 pl-8"
            placeholder="搜索笔记节点"
            onChange={(event) => setQuery(projectId, event.target.value)}
          />
        </div>
        {variant === "global" ? (
          <>
            <Select value={workspace.graphRootFilter} onValueChange={(value) => value && setRootFilter(projectId, value)}>
              <SelectTrigger size="sm" aria-label="筛选根目录"><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="all">全部根目录</SelectItem>
                {project.roots.map((root) => <SelectItem key={root.id} value={root.id}>{root.displayName}</SelectItem>)}
              </SelectGroup></SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={workspace.graphShowOrphans} onCheckedChange={(checked) => setShowOrphans(projectId, checked)} />
              孤立笔记
            </label>
          </>
        ) : (
          <>
            <ToggleGroup value={[String(workspace.localGraphDepth)]} onValueChange={(values) => {
              const depth = Number(values[0]) as 1 | 2 | 3
              if (depth) setDepth(projectId, depth)
            }} variant="outline" size="sm" spacing={0} aria-label="局部图谱深度">
              {[1, 2, 3].map((depth) => <ToggleGroupItem key={depth} value={String(depth)}>{depth} 层</ToggleGroupItem>)}
            </ToggleGroup>
            <Select value={workspace.localGraphDirection} onValueChange={(value) => value && setDirection(projectId, value as typeof workspace.localGraphDirection)}>
              <SelectTrigger size="sm" aria-label="链接方向"><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="both">双向</SelectItem>
                <SelectItem value="incoming">只看入链</SelectItem>
                <SelectItem value="outgoing">只看出链</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
          </>
        )}
        <IconButton label="适配图谱视图" onClick={() => graphRef.current?.fit(undefined, 30)}><Maximize2Icon /></IconButton>
        <IconButton label="重置图谱布局" onClick={() => graphRef.current?.layout({ name: variant === "local" ? "breadthfirst" : "cose", animate: false, fit: true, padding: 36 }).run()}><RotateCcwIcon /></IconButton>
      </div>
      {variant === "global" ? (
        <Alert className="m-2 mb-0 rounded-md py-2">
          <CircleAlertIcon />
          <AlertTitle>示例索引 · 部分结果</AlertTitle>
          <AlertDescription>5 个示例节点、5 条显式链接；另有 1 条未链接提及，不会生成图谱边。</AlertDescription>
        </Alert>
      ) : null}
      {failed ? (
        <Alert variant="destructive" className="m-2">
          <CircleAlertIcon /><AlertTitle>图谱引擎加载失败</AlertTitle>
          <AlertDescription>节点列表仍可使用；关闭并重新打开图谱可重试。</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative min-h-64 overflow-hidden border-b bg-muted/10 lg:border-r lg:border-b-0">
          <div ref={canvasRef} className="size-full" aria-label="知识图谱画布" />
          {loading ? <Skeleton className="absolute inset-4" /> : null}
          {!loading && visibleNodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">当前筛选没有匹配节点。</div>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3 text-xs font-medium">
            <FocusIcon className="size-4" />同步节点列表
            <Badge variant="outline" className="ml-auto">{visibleNodes.length}</Badge>
          </div>
          <ScrollArea className="min-h-0 flex-1 p-1">
            {visibleNodes.map((node) => (
              <Button
                key={node.id}
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
                aria-pressed={workspace.selectedGraphNodeId === node.id}
                onFocus={() => selectNode(projectId, node.id)}
                onClick={() => openNote(projectId, node.id, true)}
              >
                <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{node.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{node.relativePath}</span>
                </span>
              </Button>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
