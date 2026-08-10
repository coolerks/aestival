import { lazy, Suspense } from "react"
import { FileWarningIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { mockDocumentPreviewAdapter } from "@/data/mock-document-preview-adapter"
import type { MockFile } from "@/data/mock-workspace-panels"

const PagedDocumentViewer = lazy(() => import("@/components/documents/paged-document-viewer"))
const PresentationViewer = lazy(() => import("@/components/documents/presentation-viewer"))
const SpreadsheetViewer = lazy(() => import("@/components/documents/spreadsheet-viewer"))

export function DocumentPreview({ editorId, file }: { editorId: string; file: MockFile }) {
  const descriptor = mockDocumentPreviewAdapter.getDescriptor(file.id)
  if (!descriptor) {
    return (
      <div className="grid size-full place-items-center p-6">
        <Alert className="max-w-lg">
          <FileWarningIcon />
          <AlertTitle>暂无本地预览产物</AlertTitle>
          <AlertDescription>
            当前文件没有登记可用的本地预览产物。首版不会上传到外部 Office 服务，也不会伪造预览结果。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="grid size-full place-items-center bg-muted/20">
          <div className="flex w-72 flex-col gap-3">
            <Skeleton className="h-9" />
            <Skeleton className="aspect-[1/1.414]" />
            <span className="text-center text-xs text-muted-foreground">正在加载文档查看器…</span>
          </div>
        </div>
      }
    >
      {descriptor.kind === "pdf" || descriptor.kind === "word" ? (
        <PagedDocumentViewer editorId={editorId} descriptor={descriptor} />
      ) : descriptor.kind === "presentation" ? (
        <PresentationViewer editorId={editorId} descriptor={descriptor} />
      ) : (
        <SpreadsheetViewer editorId={editorId} descriptor={descriptor} />
      )}
    </Suspense>
  )
}
