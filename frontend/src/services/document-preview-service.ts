import type {
  DocumentPreviewDescriptor,
  WorkbookManifest,
} from "@/types/document-preview"

export interface DocumentPreviewAdapter {
  getDescriptor(fileId: string): DocumentPreviewDescriptor | null
  loadWorkbook(descriptor: Extract<DocumentPreviewDescriptor, { kind: "spreadsheet" }>): Promise<WorkbookManifest>
}

export function createMemoryDocumentPreviewAdapter(
  descriptors: Readonly<Record<string, DocumentPreviewDescriptor>>,
): DocumentPreviewAdapter {
  return {
    getDescriptor: (fileId) => descriptors[fileId] ?? null,
    loadWorkbook: loadWorkbookManifest,
  }
}

function isWorkbookManifest(value: unknown): value is WorkbookManifest {
  if (!value || typeof value !== "object") return false
  const candidate = value as { version?: unknown; sheets?: unknown }
  return typeof candidate.version === "number" && Array.isArray(candidate.sheets)
}

export async function loadWorkbookManifest(
  descriptor: Extract<DocumentPreviewDescriptor, { kind: "spreadsheet" }>,
): Promise<WorkbookManifest> {
  const response = await fetch(descriptor.workbookManifestUrl)
  if (!response.ok) throw new Error(`无法加载工作簿预览清单（${response.status}）`)
  const payload: unknown = await response.json()
  if (!isWorkbookManifest(payload)) throw new Error("工作簿预览清单格式无效")
  return payload
}
