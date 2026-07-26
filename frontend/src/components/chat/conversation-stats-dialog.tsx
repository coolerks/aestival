import {
  ChartNoAxesCombinedIcon,
  CircleDollarSignIcon,
  Clock3Icon,
  CoinsIcon,
  MessageSquareTextIcon,
  WrenchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
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
import { mockConversationStats } from "@/data/mock-conversation-insights"

type ConversationStatsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MetricStrip() {
  const metrics = [
    {
      label: "总 Token",
      value: "14,596",
      icon: ChartNoAxesCombinedIcon,
    },
    {
      label: "预计费用",
      value: "¥0.42",
      icon: CircleDollarSignIcon,
    },
    {
      label: "消息",
      value: "8",
      icon: MessageSquareTextIcon,
    },
    {
      label: "运行时长",
      value: "3:42",
      icon: Clock3Icon,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.label}
            className={
              index === 0
                ? "flex flex-col gap-1 py-2 sm:pr-4"
                : "flex flex-col gap-1 border-l py-2 pl-4"
            }
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon aria-hidden="true" />
              {metric.label}
            </span>
            <strong className="text-base font-medium">{metric.value}</strong>
          </div>
        )
      })}
    </div>
  )
}

function KeyValueTable({
  rows,
}: {
  rows: readonly (readonly string[])[]
}) {
  return (
    <Table>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.join("-")}>
            <TableCell className="text-muted-foreground">
              {row[0]}
            </TableCell>
            <TableCell>{row[1]}</TableCell>
            {row[2] ? <TableCell>{row[2]}</TableCell> : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function ConversationStatsDialog({
  open,
  onOpenChange,
}: ConversationStatsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[82vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>会话统计</DialogTitle>
            <Badge variant="secondary">Mock 估算</Badge>
          </div>
          <DialogDescription>
            当前数据仅用于验证统计布局，不代表真实模型用量、价格或结算结果。
          </DialogDescription>
        </DialogHeader>

        <MetricStrip />
        <Separator />

        <Tabs defaultValue="overview">
          <TabsList
            variant="line"
            className="max-w-full overflow-x-auto"
          >
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="tokens">Token</TabsTrigger>
            <TabsTrigger value="costs">费用</TabsTrigger>
            <TabsTrigger value="billing">计费段</TabsTrigger>
            <TabsTrigger value="tools">工具</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <KeyValueTable rows={mockConversationStats.overview} />
          </TabsContent>
          <TabsContent value="tokens">
            <KeyValueTable rows={mockConversationStats.tokens} />
          </TabsContent>
          <TabsContent value="costs">
            <KeyValueTable rows={mockConversationStats.costs} />
          </TabsContent>
          <TabsContent value="billing">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>价格区间</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>单价</TableHead>
                  <TableHead>预计金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConversationStats.billingSegments.map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell) => (
                      <TableCell key={cell}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="tools">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <WrenchIcon aria-hidden="true" />
              2 次 Mock 调用，成功率 100%
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工具</TableHead>
                  <TableHead>次数</TableHead>
                  <TableHead>结果</TableHead>
                  <TableHead>耗时</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConversationStats.tools.map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell) => (
                      <TableCell key={cell}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CoinsIcon aria-hidden="true" />
          费用统一标为估算；未接服务商账单、真实计费段或持久化。
        </div>
      </DialogContent>
    </Dialog>
  )
}
