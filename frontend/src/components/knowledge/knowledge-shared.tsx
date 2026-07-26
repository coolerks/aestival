import {
  DatabaseIcon,
  DatabaseZapIcon,
  FilesIcon,
  SearchCheckIcon,
  WaypointsIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type {
  KnowledgeBaseStatus,
  KnowledgeConnectionStatus,
  KnowledgeSourceType,
  MockKnowledgeBase,
} from "@/data/mock-knowledge"

export const knowledgeBaseStatusCopy: Record<
  KnowledgeBaseStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  ready: { label: "就绪", variant: "secondary" },
  syncing: { label: "同步中", variant: "outline" },
  "needs-update": { label: "需更新", variant: "outline" },
  error: { label: "错误", variant: "destructive" },
  disabled: { label: "已停用", variant: "secondary" },
}

export const connectionStatusCopy: Record<
  KnowledgeConnectionStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  online: { label: "在线", variant: "secondary" },
  offline: { label: "离线", variant: "outline" },
  "auth-error": { label: "认证失败", variant: "destructive" },
  untested: { label: "未测试", variant: "outline" },
}

export function KnowledgeSourceIcon({
  type,
  className,
}: {
  type: KnowledgeSourceType
  className?: string
}) {
  if (type === "milvus" || type === "weaviate" || type === "chroma") {
    return <WaypointsIcon className={className} />
  }
  if (type === "elasticsearch") {
    return <SearchCheckIcon className={className} />
  }
  if (type === "redis") {
    return <DatabaseZapIcon className={className} />
  }
  if (type === "files") {
    return <FilesIcon className={className} />
  }
  return <DatabaseIcon className={className} />
}

export function KnowledgeBaseStatusBadge({
  status,
}: {
  status: KnowledgeBaseStatus
}) {
  const copy = knowledgeBaseStatusCopy[status]
  return <Badge variant={copy.variant}>{copy.label}</Badge>
}

export function ConnectionStatusBadge({
  status,
}: {
  status: KnowledgeConnectionStatus
}) {
  const copy = connectionStatusCopy[status]
  return <Badge variant={copy.variant}>{copy.label}</Badge>
}

export function KnowledgeMetric({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
      onClick={onClick}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-medium tabular-nums">{value}</span>
    </button>
  )
}

export function knowledgeSearchText(item: MockKnowledgeBase) {
  return [
    item.name,
    item.description,
    item.sourceLabel,
    item.embeddingModel,
    item.tags.join(" "),
  ]
    .join(" ")
    .toLocaleLowerCase()
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value)
}
