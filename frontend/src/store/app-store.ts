import { create } from "zustand"

import {
  appFromConversationDraft,
  initialMockApps,
  type AppPermissions,
  type AppSort,
  type AppSource,
  type AppStatus,
  type AppViewMode,
  type MockLocalApp,
} from "@/data/mock-app-center"
import { type MockAppDraft } from "@/data/mock-ai-app"

type AppCenterView = "library" | "editor"
type AppDialog = "create" | "import" | "details" | "permissions" | "icon" | "delete" | null

type AppStore = {
  apps: MockLocalApp[]
  view: AppCenterView
  selectedAppId: string | null
  activeFileId: string | null
  consumedDraftId: string | null
  search: string
  sourceFilter: "all" | AppSource
  statusFilter: "all" | AppStatus
  sort: AppSort
  viewMode: AppViewMode
  dialog: AppDialog
  dialogAppId: string | null
  debugOpen: boolean
  previewSize: "desktop" | "tablet" | "mobile"
  importConflict: "overwrite" | "keep" | "cancel"
  setSearch: (value: string) => void
  setSourceFilter: (value: "all" | AppSource) => void
  setStatusFilter: (value: "all" | AppStatus) => void
  setSort: (value: AppSort) => void
  setViewMode: (value: AppViewMode) => void
  setDialog: (dialog: AppDialog, appId?: string | null) => void
  setImportConflict: (value: "overwrite" | "keep" | "cancel") => void
  hydrateConversationDraft: (draft: MockAppDraft) => void
  createBlankApp: () => void
  openEditor: (appId: string) => void
  closeEditor: () => void
  setActiveFile: (fileId: string) => void
  updateActiveFile: (content: string) => void
  saveApp: () => void
  duplicateApp: (appId: string) => void
  deleteApp: (appId: string) => void
  toggleDisabled: (appId: string) => void
  updatePermission: (appId: string, key: keyof AppPermissions, enabled: boolean) => void
  setDebugOpen: (open: boolean) => void
  setPreviewSize: (value: "desktop" | "tablet" | "mobile") => void
}

const cloneInitialApps = () => initialMockApps.map((app) => ({
  ...app,
  files: app.files.map((file) => ({ ...file })),
  permissions: { ...app.permissions },
}))

export const useAppStore = create<AppStore>((set) => ({
  apps: cloneInitialApps(),
  view: "library",
  selectedAppId: null,
  activeFileId: null,
  consumedDraftId: null,
  search: "",
  sourceFilter: "all",
  statusFilter: "all",
  sort: "updated",
  viewMode: "grid",
  dialog: null,
  dialogAppId: null,
  debugOpen: true,
  previewSize: "desktop",
  importConflict: "keep",
  setSearch: (search) => set({ search }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSort: (sort) => set({ sort }),
  setViewMode: (viewMode) => set({ viewMode }),
  setDialog: (dialog, dialogAppId = null) => set({ dialog, dialogAppId }),
  setImportConflict: (importConflict) => set({ importConflict }),
  hydrateConversationDraft: (draft) => set((state) => {
    if (state.consumedDraftId === draft.id) {
      return state
    }
    const incoming = appFromConversationDraft(draft)
    const exists = state.apps.some((app) => app.id === incoming.id)
    return {
      apps: exists ? state.apps : [incoming, ...state.apps],
      consumedDraftId: draft.id,
      view: "editor",
      selectedAppId: incoming.id,
      activeFileId: incoming.files[0]?.id ?? null,
    }
  }),
  createBlankApp: () => set((state) => {
    const id = `local-app-${Date.now()}`
    const app: MockLocalApp = {
      id,
      name: "未命名应用",
      description: "尚未填写应用说明。",
      source: "manual",
      status: "draft",
      updatedAt: "刚刚",
      lastRunAt: null,
      runCount: 0,
      entryFile: "index.html",
      files: [
        {
          id: `${id}-index-html`,
          name: "index.html",
          language: "html",
          content: `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>未命名应用</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main>
      <h1>未命名应用</h1>
      <p>从这里开始构建你的本地应用。</p>
    </main>
    <script src="script.js"></script>
  </body>
</html>`,
        },
        {
          id: `${id}-styles-css`,
          name: "styles.css",
          language: "css",
          content: `body {
  margin: 0;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}`,
        },
        {
          id: `${id}-script-js`,
          name: "script.js",
          language: "javascript",
          content: `console.info("Aestival 本地应用已就绪")`,
        },
      ],
      permissions: { network: false, files: false, clipboard: false, externalLinks: false, notifications: false },
    }
    return {
      apps: [app, ...state.apps],
      view: "editor",
      selectedAppId: id,
      activeFileId: app.files[0]?.id ?? null,
      dialog: null,
      dialogAppId: null,
    }
  }),
  openEditor: (selectedAppId) => set((state) => ({
    view: "editor",
    selectedAppId,
    activeFileId: state.apps.find((app) => app.id === selectedAppId)?.files[0]?.id ?? null,
  })),
  closeEditor: () => set({ view: "library", selectedAppId: null, activeFileId: null }),
  setActiveFile: (activeFileId) => set({ activeFileId }),
  updateActiveFile: (content) => set((state) => ({
    apps: state.apps.map((app) => app.id !== state.selectedAppId ? app : {
      ...app,
      status: "draft",
      updatedAt: "尚未保存",
      files: app.files.map((file) => file.id === state.activeFileId ? { ...file, content } : file),
    }),
  })),
  saveApp: () => set((state) => ({
    apps: state.apps.map((app) => app.id === state.selectedAppId ? {
      ...app,
      status: "runnable",
      updatedAt: "刚刚",
      errorMessage: undefined,
    } : app),
  })),
  duplicateApp: (appId) => set((state) => {
    const source = state.apps.find((app) => app.id === appId)
    if (!source) return state
    const id = `${appId}-copy-${Date.now()}`
    return { apps: [{ ...source, id, name: `${source.name} 副本`, status: "draft", files: source.files.map((file) => ({ ...file, id: `${id}-${file.id}` })) }, ...state.apps] }
  }),
  deleteApp: (appId) => set((state) => ({ apps: state.apps.filter((app) => app.id !== appId), dialog: null, dialogAppId: null })),
  toggleDisabled: (appId) => set((state) => ({
    apps: state.apps.map((app) => app.id === appId ? { ...app, status: app.status === "disabled" ? "runnable" : "disabled" } : app),
  })),
  updatePermission: (appId, key, enabled) => set((state) => ({
    apps: state.apps.map((app) => app.id === appId ? { ...app, permissions: { ...app.permissions, [key]: enabled }, updatedAt: "刚刚" } : app),
  })),
  setDebugOpen: (debugOpen) => set({ debugOpen }),
  setPreviewSize: (previewSize) => set({ previewSize }),
}))
