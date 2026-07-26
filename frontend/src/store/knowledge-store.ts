import { create } from "zustand"

import {
  createMockKnowledgeBase,
  createMockKnowledgeConnection,
  initialMockKnowledgeBases,
  initialMockKnowledgeConnections,
  initialMockKnowledgeContents,
  initialMockSyncRecords,
  mockRetrievalResults,
  type CreateMockConnectionInput,
  type CreateMockKnowledgeBaseInput,
  type KnowledgeBaseStatus,
  type KnowledgeConnectionStatus,
  type KnowledgeSourceType,
  type KnowledgeTab,
  type KnowledgeViewMode,
  type MockKnowledgeBase,
  type MockKnowledgeConnection,
  type MockKnowledgeContent,
  type MockRetrievalResult,
  type MockSyncRecord,
} from "@/data/mock-knowledge"

export type KnowledgeSort =
  | "recent"
  | "name"
  | "records"
  | "retrievals"

export type RetrievalView = "results" | "json" | "process"
export type RetrievalRunState = "idle" | "running" | "success" | "error"

type KnowledgeState = {
  activeTab: KnowledgeTab
  viewMode: KnowledgeViewMode
  searchQuery: string
  typeFilter: KnowledgeSourceType | "all"
  statusFilter: KnowledgeBaseStatus | "all"
  connectionStatusFilter: KnowledgeConnectionStatus | "all"
  sort: KnowledgeSort
  knowledgeBases: MockKnowledgeBase[]
  connections: MockKnowledgeConnection[]
  contents: MockKnowledgeContent[]
  syncRecords: MockSyncRecord[]
  selectedKnowledgeId: string | null
  selectedConnectionId: string | null
  newConnectionOpen: boolean
  newKnowledgeOpen: boolean
  deleteKnowledgeId: string | null
  disconnectConnectionId: string | null
  clearHistoryOpen: boolean
  retrievalQuery: string
  retrievalKnowledgeIds: string[]
  retrievalView: RetrievalView
  retrievalRunState: RetrievalRunState
  retrievalResults: MockRetrievalResult[]
  topK: number
  threshold: number
  hybridWeight: number
  rerankEnabled: boolean
  partialFailureDismissed: boolean
  setActiveTab: (tab: KnowledgeTab) => void
  setViewMode: (mode: KnowledgeViewMode) => void
  setSearchQuery: (query: string) => void
  setTypeFilter: (type: KnowledgeSourceType | "all") => void
  setStatusFilter: (status: KnowledgeBaseStatus | "all") => void
  setConnectionStatusFilter: (
    status: KnowledgeConnectionStatus | "all"
  ) => void
  setSort: (sort: KnowledgeSort) => void
  openKnowledgeDetails: (id: string | null) => void
  openConnectionDetails: (id: string | null) => void
  setNewConnectionOpen: (open: boolean) => void
  setNewKnowledgeOpen: (open: boolean) => void
  createConnection: (input: CreateMockConnectionInput) => string
  createKnowledgeBase: (input: CreateMockKnowledgeBaseInput) => string | null
  requestDeleteKnowledge: (id: string | null) => void
  deleteKnowledgeBase: (id: string) => void
  requestDisconnectConnection: (id: string | null) => void
  disconnectConnection: (id: string, removeIndexes: boolean) => void
  syncKnowledgeBase: (id: string) => void
  completeKnowledgeSync: (id: string) => void
  setClearHistoryOpen: (open: boolean) => void
  clearSyncHistory: () => void
  setRetrievalQuery: (query: string) => void
  toggleRetrievalKnowledge: (id: string) => void
  setRetrievalView: (view: RetrievalView) => void
  startRetrieval: () => void
  completeRetrieval: () => void
  failRetrieval: () => void
  setTopK: (topK: number) => void
  setThreshold: (threshold: number) => void
  setHybridWeight: (hybridWeight: number) => void
  setRerankEnabled: (enabled: boolean) => void
  dismissPartialFailure: () => void
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  activeTab: "libraries",
  viewMode: "list",
  searchQuery: "",
  typeFilter: "all",
  statusFilter: "all",
  connectionStatusFilter: "all",
  sort: "recent",
  knowledgeBases: initialMockKnowledgeBases,
  connections: initialMockKnowledgeConnections,
  contents: initialMockKnowledgeContents,
  syncRecords: initialMockSyncRecords,
  selectedKnowledgeId: null,
  selectedConnectionId: null,
  newConnectionOpen: false,
  newKnowledgeOpen: false,
  deleteKnowledgeId: null,
  disconnectConnectionId: null,
  clearHistoryOpen: false,
  retrievalQuery: "全局标题栏中的名称应该放在哪里？",
  retrievalKnowledgeIds: [
    "knowledge-product-docs",
    "knowledge-engineering",
  ],
  retrievalView: "results",
  retrievalRunState: "idle",
  retrievalResults: [],
  topK: 5,
  threshold: 0.68,
  hybridWeight: 0.55,
  rerankEnabled: true,
  partialFailureDismissed: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setConnectionStatusFilter: (connectionStatusFilter) =>
    set({ connectionStatusFilter }),
  setSort: (sort) => set({ sort }),
  openKnowledgeDetails: (selectedKnowledgeId) =>
    set({ selectedKnowledgeId }),
  openConnectionDetails: (selectedConnectionId) =>
    set({ selectedConnectionId }),
  setNewConnectionOpen: (newConnectionOpen) => set({ newConnectionOpen }),
  setNewKnowledgeOpen: (newKnowledgeOpen) => set({ newKnowledgeOpen }),
  createConnection: (input) => {
    const connection = createMockKnowledgeConnection(input)
    set((state) => ({
      connections: [connection, ...state.connections],
      newConnectionOpen: false,
      selectedConnectionId: connection.id,
      activeTab: "connections",
    }))
    return connection.id
  },
  createKnowledgeBase: (input) => {
    let createdId: string | null = null
    set((state) => {
      const connection = state.connections.find(
        (item) => item.id === input.connectionId
      )
      if (!connection) {
        return state
      }
      const knowledgeBase = createMockKnowledgeBase(input, connection)
      createdId = knowledgeBase.id
      return {
        knowledgeBases: [knowledgeBase, ...state.knowledgeBases],
        connections: state.connections.map((item) =>
          item.id === connection.id
            ? {
                ...item,
                linkedKnowledgeCount: item.linkedKnowledgeCount + 1,
              }
            : item
        ),
        newKnowledgeOpen: false,
        selectedKnowledgeId: knowledgeBase.id,
        activeTab: "libraries",
      }
    })
    return createdId
  },
  requestDeleteKnowledge: (deleteKnowledgeId) =>
    set({ deleteKnowledgeId }),
  deleteKnowledgeBase: (id) =>
    set((state) => {
      const knowledgeBase = state.knowledgeBases.find(
        (item) => item.id === id
      )
      return {
        knowledgeBases: state.knowledgeBases.filter((item) => item.id !== id),
        connections: knowledgeBase
          ? state.connections.map((item) =>
              item.id === knowledgeBase.connectionId
                ? {
                    ...item,
                    linkedKnowledgeCount: Math.max(
                      0,
                      item.linkedKnowledgeCount - 1
                    ),
                  }
                : item
            )
          : state.connections,
        contents: state.contents.filter(
          (item) => item.knowledgeBaseId !== id
        ),
        selectedKnowledgeId:
          state.selectedKnowledgeId === id
            ? null
            : state.selectedKnowledgeId,
        deleteKnowledgeId: null,
      }
    }),
  requestDisconnectConnection: (disconnectConnectionId) =>
    set({ disconnectConnectionId }),
  disconnectConnection: (id, removeIndexes) =>
    set((state) => ({
      connections: state.connections.filter((item) => item.id !== id),
      knowledgeBases: state.knowledgeBases.map((item) =>
        item.connectionId === id
          ? {
              ...item,
              status: "disabled",
              vectorCount: removeIndexes ? 0 : item.vectorCount,
              lastSync: "连接已移除",
            }
          : item
      ),
      selectedConnectionId:
        state.selectedConnectionId === id
          ? null
          : state.selectedConnectionId,
      disconnectConnectionId: null,
    })),
  syncKnowledgeBase: (id) =>
    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((item) =>
        item.id === id
          ? { ...item, status: "syncing", lastSync: "正在同步" }
          : item
      ),
      syncRecords: [
        {
          id: `sync-${Date.now()}`,
          knowledgeBaseId: id,
          knowledgeBaseName:
            state.knowledgeBases.find((item) => item.id === id)?.name ??
            "知识库",
          trigger: "手动",
          startedAt: "刚刚",
          endedAt: "进行中",
          scanned: 0,
          created: 0,
          updated: 0,
          deleted: 0,
          failed: 0,
          embeddingTokens: 0,
          estimatedCost: "正在估算",
          status: "running",
        },
        ...state.syncRecords,
      ],
    })),
  completeKnowledgeSync: (id) =>
    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "ready",
              vectorCount: Math.max(item.vectorCount, item.recordCount),
              pendingSources: 0,
              lastSync: "刚刚",
              indexSize:
                item.indexSize === "正在估算" ? "3.8 MB" : item.indexSize,
            }
          : item
      ),
      syncRecords: state.syncRecords.map((item) =>
        item.knowledgeBaseId === id && item.status === "running"
          ? {
              ...item,
              endedAt: "刚刚",
              scanned: 146,
              created: 12,
              updated: 28,
              embeddingTokens: 8_240,
              estimatedCost: "Mock ¥0.06",
              status: "completed",
            }
          : item
      ),
    })),
  setClearHistoryOpen: (clearHistoryOpen) => set({ clearHistoryOpen }),
  clearSyncHistory: () =>
    set((state) => ({
      syncRecords: state.syncRecords.filter(
        (record) => record.status === "running"
      ),
      clearHistoryOpen: false,
    })),
  setRetrievalQuery: (retrievalQuery) => set({ retrievalQuery }),
  toggleRetrievalKnowledge: (id) =>
    set((state) => ({
      retrievalKnowledgeIds: state.retrievalKnowledgeIds.includes(id)
        ? state.retrievalKnowledgeIds.filter((item) => item !== id)
        : [...state.retrievalKnowledgeIds, id],
    })),
  setRetrievalView: (retrievalView) => set({ retrievalView }),
  startRetrieval: () =>
    set({ retrievalRunState: "running", retrievalResults: [] }),
  completeRetrieval: () =>
    set((state) => ({
      retrievalRunState: "success",
      retrievalResults: mockRetrievalResults
        .filter((result) =>
          state.retrievalKnowledgeIds.includes(result.knowledgeBaseId)
        )
        .slice(0, state.topK),
    })),
  failRetrieval: () =>
    set({ retrievalRunState: "error", retrievalResults: [] }),
  setTopK: (topK) => set({ topK }),
  setThreshold: (threshold) => set({ threshold }),
  setHybridWeight: (hybridWeight) => set({ hybridWeight }),
  setRerankEnabled: (rerankEnabled) => set({ rerankEnabled }),
  dismissPartialFailure: () => set({ partialFailureDismissed: true }),
}))
