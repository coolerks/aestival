import assert from "node:assert/strict"
import test from "node:test"

import { createMemoryDocumentPreviewAdapter } from "../src/services/document-preview-service.ts"
import { useDocumentPreviewStore } from "../src/store/document-preview-store.ts"

const pdf = { kind: "pdf", sourceUrl: "/fixture.pdf" }
const workbook = {
  kind: "spreadsheet",
  sourceUrl: "/fixture.xlsx",
  workbookManifestUrl: "data:application/json,%7B%22version%22%3A1%2C%22sheets%22%3A%5B%5D%7D",
  printPdfUrl: "/fixture.print.pdf",
}

test("内存适配器只返回已登记的文档预览", async () => {
  const adapter = createMemoryDocumentPreviewAdapter({ pdf, workbook })
  assert.deepEqual(adapter.getDescriptor("pdf"), pdf)
  assert.equal(adapter.getDescriptor("missing"), null)
  assert.deepEqual(await adapter.loadWorkbook(workbook), { version: 1, sheets: [] })
})

test("相同文档的不同编辑器实例保持独立预览状态", () => {
  const store = useDocumentPreviewStore.getState()
  store.reset()
  store.ensureState("editor-a", "pdf")
  store.ensureState("editor-b", "pdf")
  store.updateState("editor-a", { page: 7, zoom: 150, navigationMode: "outline" })
  store.updateState("editor-b", { page: 2, zoom: 75, navigationMode: "thumbnails" })

  assert.equal(useDocumentPreviewStore.getState().states["editor-a"].page, 7)
  assert.equal(useDocumentPreviewStore.getState().states["editor-b"].page, 2)
  assert.equal(useDocumentPreviewStore.getState().states["editor-a"].zoom, 150)
  assert.equal(useDocumentPreviewStore.getState().states["editor-b"].zoom, 75)
})

test("关闭编辑器时可只清理对应预览状态", () => {
  const store = useDocumentPreviewStore.getState()
  store.reset()
  store.ensureState("editor-a", "presentation")
  store.ensureState("editor-b", "spreadsheet")
  store.removeState("editor-a")

  assert.equal(useDocumentPreviewStore.getState().states["editor-a"], undefined)
  assert.equal(useDocumentPreviewStore.getState().states["editor-b"].spreadsheetView, "grid")
})
