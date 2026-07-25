import { ConstructionIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { pageCopy } from "@/data/mock-workspace"
import type { AppPage } from "@/store/workspace-store"

type PlaceholderPageProps = {
  page: Exclude<AppPage, "new-task">
}

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  const copy = pageCopy[page]

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Aestival</p>
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Badge variant="outline">后续阶段</Badge>
      </header>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ConstructionIcon />
          </EmptyMedia>
          <EmptyTitle>{copy.title}页面骨架已接入</EmptyTitle>
          <EmptyDescription>
            本轮先完成全局外壳与新建任务首屏；该页面的数据、表单和详情将在后续任务中实现。
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}
