import { ConstructionIcon } from "lucide-react"

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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ConstructionIcon />
          </EmptyMedia>
          <EmptyTitle>页面骨架已接入</EmptyTitle>
          <EmptyDescription>
            {copy.description}{" "}
            本轮先完成全局外壳与新建任务首屏；数据、表单和详情将在后续任务中实现。
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}
