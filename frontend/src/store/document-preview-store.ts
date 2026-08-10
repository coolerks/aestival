import { create } from "zustand"

import type {
  DocumentPreviewKind,
  DocumentPreviewState,
} from "@/types/document-preview"

type DocumentPreviewStore = {
  states: Record<string, DocumentPreviewState>
  ensureState: (editorId: string, kind: DocumentPreviewKind) => void
  updateState: (
    editorId: string,
    update: Partial<DocumentPreviewState> | ((state: DocumentPreviewState) => Partial<DocumentPreviewState>),
  ) => void
  removeState: (editorId: string) => void
  reset: () => void
}

function initialState(kind: DocumentPreviewKind): DocumentPreviewState {
  return {
    status: "idle",
    sidebarOpen: true,
    navigationMode: kind === "presentation" ? "thumbnails" : "outline",
    page: 1,
    zoom: 100,
    scaleMode: kind === "spreadsheet" ? "custom" : "fit-width",
    searchQuery: "",
    searchMatch: 0,
    fullscreen: false,
    spreadsheetView: "grid",
    sheetId: null,
    activeCell: "A1",
    selectionAnchor: null,
  }
}

export const useDocumentPreviewStore = create<DocumentPreviewStore>((set) => ({
  states: {},
  ensureState: (editorId, kind) => set((store) => store.states[editorId]
    ? store
    : {
        states: {
          ...store.states,
          [editorId]: initialState(kind),
        },
      }),
  updateState: (editorId, update) => set((store) => {
    const current = store.states[editorId]
    if (!current) return store
    const patch = typeof update === "function" ? update(current) : update
    return {
      states: {
        ...store.states,
        [editorId]: { ...current, ...patch },
      },
    }
  }),
  removeState: (editorId) => set((store) => {
    if (!store.states[editorId]) return store
    const states = { ...store.states }
    delete states[editorId]
    return { states }
  }),
  reset: () => set({ states: {} }),
}))

export function createDocumentPreviewState(kind: DocumentPreviewKind) {
  return initialState(kind)
}
