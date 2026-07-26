import {
  CircleAlertIcon,
  HistoryIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useKnowledgeStore } from "@/store/knowledge-store"

const statusCopy = {
  completed: { label: "完成", variant: "secondary" as const },
  running: { label: "运行中", variant: "outline" as const },
  partial: { label: "部分失败", variant: "outline" as const },
  failed: { label: "失败", variant: "destructive" as const },
}

export function KnowledgeSyncRecords() {
  const records = useKnowledgeStore((state) => state.syncRecords)
  const setClearHistoryOpen = useKnowledgeStore(
    (state) => state.setClearHistoryOpen
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          展示本地 Mock 同步过程，不产生真实嵌入 token 或费用。
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setClearHistoryOpen(true)}
          disabled={records.length === 0}
        >
          <Trash2Icon data-icon="inline-start" />
          清理历史
        </Button>
      </div>
      {records.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-lg border">
          <HistoryIcon className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">暂无同步记录</p>
          <p className="text-xs text-muted-foreground">
            新建知识库或手动同步后会在这里显示。
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>知识库</TableHead>
                <TableHead>触发方式</TableHead>
                <TableHead>开始 / 结束</TableHead>
                <TableHead>扫描</TableHead>
                <TableHead>变更</TableHead>
                <TableHead>失败</TableHead>
                <TableHead>Token / 费用</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">操作</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const copy = statusCopy[record.status]
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.knowledgeBaseName}
                    </TableCell>
                    <TableCell>{record.trigger}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      <div>{record.startedAt}</div>
                      <div className="text-muted-foreground">
                        {record.endedAt}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {record.scanned}
                    </TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      +{record.created} / ~{record.updated} / -
                      {record.deleted}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {record.failed}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      <div>{record.embeddingTokens}</div>
                      <div className="text-muted-foreground">
                        {record.estimatedCost}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={copy.variant}>{copy.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {record.status === "failed" ||
                      record.status === "partial" ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`重试 ${record.knowledgeBaseName} 失败项`}
                          onClick={() =>
                            toast.success("已重试失败项（前端 Mock）")
                          }
                        >
                          <RefreshCwIcon />
                        </Button>
                      ) : record.status === "running" ? (
                        <CircleAlertIcon
                          className="size-4 text-muted-foreground"
                          aria-label="正在运行"
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
