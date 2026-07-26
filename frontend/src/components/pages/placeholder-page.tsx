import {
  Component,
  lazy,
  Suspense,
  type ErrorInfo,
  type ReactNode,
} from "react"
import { ConstructionIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { pageCopy } from "@/data/mock-workspace"
import {
  type AppPage,
  useWorkspaceStore,
} from "@/store/workspace-store"

const MockAppDraftPage = lazy(() =>
  import("@/components/pages/mock-app-draft-page").then((module) => ({
    default: module.MockAppDraftPage,
  }))
)

const KnowledgePage = lazy(() =>
  import("@/components/knowledge/knowledge-page").then((module) => ({
    default: module.KnowledgePage,
  }))
)

type PlaceholderPageProps = {
  page: Exclude<AppPage, "new-task">
}

class PageErrorBoundary extends Component<
  { children: ReactNode; pageName: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`页面“${this.props.pageName}”渲染失败`, error, info)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ConstructionIcon />
          </EmptyMedia>
          <EmptyTitle>{this.props.pageName}暂时无法显示</EmptyTitle>
          <EmptyDescription>
            {this.state.error.message || "页面组件发生未知错误。"}
          </EmptyDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ error: null })}
          >
            重试
          </Button>
        </EmptyHeader>
      </Empty>
    )
  }
}

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  const copy = pageCopy[page]
  const mockAppDraft = useWorkspaceStore((state) => state.mockAppDraft)

  if (page === "apps" && mockAppDraft) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="min-h-0 flex-1 rounded-xl" />
          </div>
        }
      >
        <MockAppDraftPage draft={mockAppDraft} />
      </Suspense>
    )
  }

  if (page === "knowledge") {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-8 w-96 max-w-full" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="min-h-0 flex-1 rounded-lg" />
          </div>
        }
      >
        <PageErrorBoundary pageName="知识库">
          <KnowledgePage />
        </PageErrorBoundary>
      </Suspense>
    )
  }

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
