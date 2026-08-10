import { mockFiles } from "@/data/mock-workspace-panels"
import { createMemoryDocumentPreviewAdapter } from "@/services/document-preview-service"
import type { DocumentPreviewDescriptor } from "@/types/document-preview"

const descriptors = Object.fromEntries(
  mockFiles.flatMap((file) => file.preview
    ? [[file.id, file.preview] as const]
    : []),
) satisfies Record<string, DocumentPreviewDescriptor>

export const mockDocumentPreviewAdapter = createMemoryDocumentPreviewAdapter(descriptors)
