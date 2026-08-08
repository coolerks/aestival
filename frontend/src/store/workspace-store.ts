import { create } from "zustand"

import {
  createMockAppDraft,
  type MockAppDraft,
  type MockAppDraftInput,
  type MockCodeFile,
  type MockSpeechPlayback,
  type MockSpeechRate,
  type MockSpeechVoice,
} from "@/data/mock-ai-app"
import {
  createMockAttachment,
  type ApprovalPolicy,
  type ComposerMode,
  type MockAttachmentKind,
  type MockComposerAttachment,
} from "@/data/mock-composer"
import {
  createMockCompressionEvent,
  type MockCompressionEvent,
} from "@/data/mock-conversation-insights"
import {
  appendMockVersion,
  createMockVersionSet,
  type MockExportFormat,
  type MockForkRelation,
  type MockExportScope,
  type MockVersionSet,
} from "@/data/mock-conversation-management"
import {
  createMockConversationTitle,
  createMockMessage,
  mockAssistantCopy,
  type ConversationRunState,
  type MockConversationMessage,
} from "@/data/mock-conversation"
import {
  createMockScheduledTask,
  initialMockSessions,
  mockSessionProjects,
  type MockScheduledTaskInput,
  type MockScheduledTaskRecord,
  type MockSessionProjectId,
  type MockSessionRecord,
  type SessionDialogKind,
  type SessionDialogState,
} from "@/data/mock-session-management"

export type AgentMode = "agent" | "chat"
export type AppPage = "new-task" | "project-board" | "knowledge" | "apps" | "capabilities" | "tasks" | "settings"

function createEmptyConversationPatch() {
  return {
    conversationId: null,
    conversationTitle: "新建任务",
    messages: [],
    runState: "idle" as const,
    multiModelEnabled: false,
    statsOpen: false,
    compressionEvent: null,
    isTemporaryConversation: false,
    temporaryCloseOpen: false,
    forkDialogOpen: false,
    forkMessageId: null,
    exportDialogOpen: false,
    exportScopePreset: "conversation" as const,
    exportFormatPreset: "markdown" as const,
    versionSet: null,
    forkRelation: null,
    draft: "",
    attachments: [],
  }
}

function updateMessageContent(
  message: MockConversationMessage,
  content: string
): MockConversationMessage {
  return {
    ...message,
    content,
    lastDeltaSequence: message.lastDeltaSequence ?? 0,
  }
}

type WorkspaceState = {
  mode: AgentMode
  activePage: AppPage
  boardReturnPage: Exclude<AppPage, "project-board">
  activeProjectId: MockSessionProjectId
  commandOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  draft: string
  composerMode: ComposerMode
  approvalPolicy: ApprovalPolicy
  attachments: MockComposerAttachment[]
  selectedAgentId: string
  selectedModelId: string
  autoCompact: boolean
  contextSize: "auto" | "128k" | "200k"
  multiModelEnabled: boolean
  statsOpen: boolean
  compressionEvent: MockCompressionEvent | null
  isTemporaryConversation: boolean
  temporaryCloseOpen: boolean
  forkDialogOpen: boolean
  forkMessageId: string | null
  exportDialogOpen: boolean
  exportScopePreset: MockExportScope
  exportFormatPreset: MockExportFormat
  versionSet: MockVersionSet | null
  forkRelation: MockForkRelation | null
  mockAppDraft: MockAppDraft | null
  speechPlayback: MockSpeechPlayback | null
  conversationId: string | null
  conversationTitle: string
  messages: MockConversationMessage[]
  runState: ConversationRunState
  sessions: MockSessionRecord[]
  sessionSearchQuery: string
  showArchivedSessions: boolean
  sessionVisibleCounts: Record<MockSessionProjectId, number>
  sessionDialog: SessionDialogState | null
  scheduledTasks: MockScheduledTaskRecord[]
  setMode: (mode: AgentMode) => void
  setActivePage: (page: AppPage) => void
  setActiveProjectId: (projectId: MockSessionProjectId) => void
  openProjectBoard: () => void
  returnFromProjectBoard: () => void
  setCommandOpen: (open: boolean) => void
  toggleRightPanel: () => void
  toggleBottomPanel: () => void
  setDraft: (draft: string) => void
  setComposerMode: (mode: ComposerMode) => void
  setApprovalPolicy: (policy: ApprovalPolicy) => void
  addMockAttachment: (kind: MockAttachmentKind) => void
  completeAttachment: (id: string) => void
  removeAttachment: (id: string) => void
  clearComposer: () => void
  restoreComposer: (
    draft: string,
    attachments: MockComposerAttachment[]
  ) => void
  setSelectedAgentId: (id: string) => void
  setSelectedModelId: (id: string) => void
  setAutoCompact: (enabled: boolean) => void
  setContextSize: (size: "auto" | "128k" | "200k") => void
  setMultiModelEnabled: (enabled: boolean) => void
  setStatsOpen: (open: boolean) => void
  createCompressionEvent: () => void
  startTemporaryConversation: () => void
  setTemporaryCloseOpen: (open: boolean) => void
  convertTemporaryConversation: () => void
  discardTemporaryConversation: () => void
  setForkDialogOpen: (open: boolean, messageId?: string) => void
  createMockFork: (title: string, messageId: string) => void
  navigateMockFork: (target: "origin" | "branch") => void
  setExportDialogOpen: (
    open: boolean,
    scope?: MockExportScope,
    format?: MockExportFormat
  ) => void
  regenerateMockResponse: (messageId: string) => void
  selectMockVersion: (versionId: string) => void
  createMockApplicationDraft: (
    input: MockAppDraftInput,
    files: MockCodeFile[]
  ) => void
  openMockAppEditor: () => void
  returnToSourceConversation: () => void
  startMockSpeech: (
    messageId: string,
    content: string,
    sourceTitle: string
  ) => void
  toggleMockSpeech: () => void
  stopMockSpeech: () => void
  advanceMockSpeech: () => void
  setMockSpeechRate: (rate: MockSpeechRate) => void
  setMockSpeechVoice: (voice: MockSpeechVoice) => void
  submitMockPrompt: (content: string) => void
  openMockConversation: (sessionId: string) => void
  setMockRunState: (
    state: Exclude<ConversationRunState, "idle">
  ) => void
  appendMockDelta: (
    messageId: string,
    sequence: number,
    text: string
  ) => void
  completeMockRun: () => void
  stopMockRun: () => void
  retryMockRun: () => void
  resetConversation: () => void
  setSessionSearchQuery: (query: string) => void
  setShowArchivedSessions: (show: boolean) => void
  loadMoreSessions: (projectId: MockSessionProjectId) => void
  openSessionDialog: (
    kind: SessionDialogKind,
    sessionId: string
  ) => void
  closeSessionDialog: () => void
  toggleSessionStar: (sessionId: string) => void
  renameSession: (sessionId: string, title: string) => void
  moveSession: (
    sessionId: string,
    projectId: MockSessionProjectId
  ) => void
  setSessionArchived: (sessionId: string, archived: boolean) => void
  deleteSession: (sessionId: string) => void
  createScheduledTask: (input: MockScheduledTaskInput) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: "agent",
  activePage: "new-task",
  boardReturnPage: "new-task",
  activeProjectId: "task",
  commandOpen: false,
  rightPanelOpen: false,
  bottomPanelOpen: false,
  draft: "",
  composerMode: "standard",
  approvalPolicy: "request",
  attachments: [],
  selectedAgentId: "general",
  selectedModelId: "local-mock",
  autoCompact: true,
  contextSize: "auto",
  multiModelEnabled: false,
  statsOpen: false,
  compressionEvent: null,
  isTemporaryConversation: false,
  temporaryCloseOpen: false,
  forkDialogOpen: false,
  forkMessageId: null,
  exportDialogOpen: false,
  exportScopePreset: "conversation",
  exportFormatPreset: "markdown",
  versionSet: null,
  forkRelation: null,
  mockAppDraft: null,
  speechPlayback: null,
  conversationId: null,
  conversationTitle: "新建任务",
  messages: [],
  runState: "idle",
  sessions: initialMockSessions,
  sessionSearchQuery: "",
  showArchivedSessions: false,
  sessionVisibleCounts: Object.fromEntries(
    mockSessionProjects.map((project) => [project.id, 5])
  ) as Record<MockSessionProjectId, number>,
  sessionDialog: null,
  scheduledTasks: [],
  setMode: (mode) =>
    set((state) => ({
      mode,
      composerMode: mode === "chat" ? "standard" : state.composerMode,
    })),
  setActivePage: (activePage) => set((state) => activePage === "project-board"
    ? {
        activePage,
        boardReturnPage:
          state.activePage === "project-board" ? state.boardReturnPage : state.activePage,
      }
    : { activePage, boardReturnPage: activePage }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
  openProjectBoard: () => set((state) => ({
    activePage: "project-board",
    boardReturnPage:
      state.activePage === "project-board" ? state.boardReturnPage : state.activePage,
  })),
  returnFromProjectBoard: () => set((state) => ({ activePage: state.boardReturnPage })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  toggleRightPanel: () =>
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  toggleBottomPanel: () =>
    set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  setDraft: (draft) => set({ draft }),
  setComposerMode: (composerMode) => set({ composerMode }),
  setApprovalPolicy: (approvalPolicy) => set({ approvalPolicy }),
  addMockAttachment: (kind) =>
    set((state) => ({
      attachments: [...state.attachments, createMockAttachment(kind)],
    })),
  completeAttachment: (id) =>
    set((state) => ({
      attachments: state.attachments.map((attachment) =>
        attachment.id === id
          ? {
              ...attachment,
              state: "done",
              description:
                attachment.kind === "image"
                  ? "PNG · Mock 引用"
                  : attachment.description,
            }
          : attachment
      ),
    })),
  removeAttachment: (id) =>
    set((state) => ({
      attachments: state.attachments.filter(
        (attachment) => attachment.id !== id
      ),
    })),
  clearComposer: () => set({ draft: "", attachments: [] }),
  restoreComposer: (draft, attachments) => set({ draft, attachments }),
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setAutoCompact: (autoCompact) => set({ autoCompact }),
  setContextSize: (contextSize) => set({ contextSize }),
  setMultiModelEnabled: (multiModelEnabled) => set({ multiModelEnabled }),
  setStatsOpen: (statsOpen) => set({ statsOpen }),
  createCompressionEvent: () =>
    set((state) => ({
      compressionEvent: createMockCompressionEvent(state.compressionEvent),
    })),
  startTemporaryConversation: () =>
    set({
      activePage: "new-task",
      conversationId: `temporary-${Date.now()}`,
      conversationTitle: "临时会话",
      messages: [
        createMockMessage(
          "assistant",
          "这是临时会话 Mock：不会进入普通历史，默认不写入记忆。你可以随时转为普通会话或关闭。"
        ),
      ],
      runState: "completed",
      multiModelEnabled: false,
      statsOpen: false,
      compressionEvent: null,
      isTemporaryConversation: true,
      temporaryCloseOpen: false,
      versionSet: null,
      forkRelation: null,
      exportDialogOpen: false,
      draft: "",
      attachments: [],
    }),
  setTemporaryCloseOpen: (temporaryCloseOpen) =>
    set({ temporaryCloseOpen }),
  convertTemporaryConversation: () =>
    set((state) => {
      const title =
        state.conversationTitle === "临时会话"
          ? "已保存的临时会话"
          : state.conversationTitle
      const sessionId =
        state.conversationId ?? `conversation-${Date.now()}`
      const activityRank =
        Math.max(0, ...state.sessions.map((session) => session.activityRank)) +
        1

      return {
        isTemporaryConversation: false,
        temporaryCloseOpen: false,
        conversationId: sessionId,
        conversationTitle: title,
        sessions: [
          {
            id: sessionId,
            title,
            projectId: state.activeProjectId,
            relativeTime: "刚刚",
            activityRank,
            starred: false,
            archived: false,
            status: "completed",
          },
          ...state.sessions.filter((session) => session.id !== sessionId),
        ],
      }
    }),
  discardTemporaryConversation: () =>
    set(createEmptyConversationPatch()),
  setForkDialogOpen: (forkDialogOpen, messageId) =>
    set({
      forkDialogOpen,
      forkMessageId: forkDialogOpen ? (messageId ?? null) : null,
    }),
  createMockFork: (title, messageId) =>
    set((state) => {
      const branchPointIndex = state.messages.findIndex(
        (message) => message.id === messageId
      )
      const safeIndex =
        branchPointIndex >= 0 ? branchPointIndex : state.messages.length - 1
      const branchMessages = [
        ...state.messages.slice(0, safeIndex + 1),
        createMockMessage(
          "assistant",
          "已打开本地 Mock 分支。原会话快照保持不变，可通过分叉关系在两个视图之间切换。"
        ),
      ]
      const relation: MockForkRelation = {
        branchPointId: messageId,
        originTitle: state.conversationTitle,
        branchTitle: title,
        originMessages: state.messages,
        branchMessages,
        active: "branch",
      }
      const conversationId = `fork-${Date.now()}`
      const activityRank =
        Math.max(0, ...state.sessions.map((session) => session.activityRank)) +
        1

      return {
        conversationId,
        conversationTitle: title,
        messages: branchMessages,
        runState: "completed",
        forkDialogOpen: false,
        forkMessageId: null,
        forkRelation: relation,
        versionSet: null,
        sessions: [
          {
            id: conversationId,
            title,
            projectId: state.activeProjectId,
            relativeTime: "刚刚",
            activityRank,
            starred: false,
            archived: false,
            status: "completed",
          },
          ...state.sessions,
        ],
      }
    }),
  navigateMockFork: (target) =>
    set((state) => {
      if (!state.forkRelation) {
        return state
      }
      return {
        conversationTitle:
          target === "origin"
            ? state.forkRelation.originTitle
            : state.forkRelation.branchTitle,
        messages:
          target === "origin"
            ? state.forkRelation.originMessages
            : state.forkRelation.branchMessages,
        forkRelation: { ...state.forkRelation, active: target },
        versionSet: null,
      }
    }),
  setExportDialogOpen: (
    exportDialogOpen,
    exportScopePreset,
    exportFormatPreset
  ) =>
    set((state) => ({
      exportDialogOpen,
      exportScopePreset:
        exportScopePreset ?? state.exportScopePreset,
      exportFormatPreset:
        exportFormatPreset ?? state.exportFormatPreset,
    })),
  regenerateMockResponse: (messageId) =>
    set((state) => {
      const message = state.messages.find(
        (item) => item.id === messageId && item.role === "assistant"
      )
      if (!message) {
        return state
      }
      return {
        versionSet:
          state.versionSet?.messageId === messageId
            ? appendMockVersion(state.versionSet)
            : createMockVersionSet(message),
      }
    }),
  selectMockVersion: (versionId) =>
    set((state) => ({
      versionSet: state.versionSet
        ? { ...state.versionSet, selectedId: versionId }
        : null,
    })),
  createMockApplicationDraft: (input, files) =>
    set({
      mockAppDraft: createMockAppDraft(input, files),
    }),
  openMockAppEditor: () =>
    set((state) => ({
      activePage: state.mockAppDraft ? "apps" : state.activePage,
    })),
  returnToSourceConversation: () => set({ activePage: "new-task" }),
  startMockSpeech: (messageId, content, sourceTitle) =>
    set((state) => {
      if (state.speechPlayback?.messageId === messageId) {
        return {
          speechPlayback: {
            ...state.speechPlayback,
            playing:
              state.speechPlayback.progress >= 100
                ? true
                : !state.speechPlayback.playing,
            progress:
              state.speechPlayback.progress >= 100
                ? 0
                : state.speechPlayback.progress,
          },
        }
      }

      return {
        speechPlayback: {
          messageId,
          sourceTitle,
          content,
          playing: true,
          progress: 0,
          rate: state.speechPlayback?.rate ?? "1",
          voice: state.speechPlayback?.voice ?? "云舟",
        },
      }
    }),
  toggleMockSpeech: () =>
    set((state) => ({
      speechPlayback: state.speechPlayback
        ? {
            ...state.speechPlayback,
            playing:
              state.speechPlayback.progress >= 100
                ? true
                : !state.speechPlayback.playing,
            progress:
              state.speechPlayback.progress >= 100
                ? 0
                : state.speechPlayback.progress,
          }
        : null,
    })),
  stopMockSpeech: () => set({ speechPlayback: null }),
  advanceMockSpeech: () =>
    set((state) => {
      if (!state.speechPlayback?.playing) {
        return state
      }
      const progress = Math.min(
        100,
        state.speechPlayback.progress +
          2.5 * Number(state.speechPlayback.rate)
      )
      return {
        speechPlayback: {
          ...state.speechPlayback,
          progress,
          playing: progress < 100,
        },
      }
    }),
  setMockSpeechRate: (rate) =>
    set((state) => ({
      speechPlayback: state.speechPlayback
        ? { ...state.speechPlayback, rate }
        : null,
    })),
  setMockSpeechVoice: (voice) =>
    set((state) => ({
      speechPlayback: state.speechPlayback
        ? { ...state.speechPlayback, voice }
        : null,
    })),
  submitMockPrompt: (content) =>
    set((state) => {
      const conversationId =
        state.conversationId ?? `conversation-${Date.now()}`
      const conversationTitle = state.conversationId
        ? state.conversationTitle
        : createMockConversationTitle(content)
      const existingSession = state.sessions.find(
        (session) => session.id === conversationId
      )
      const activityRank =
        Math.max(0, ...state.sessions.map((session) => session.activityRank)) +
        1
      const currentSession: MockSessionRecord = existingSession
        ? {
            ...existingSession,
            title: conversationTitle,
            relativeTime: "刚刚",
            activityRank,
            archived: false,
            status: "running",
          }
        : {
            id: conversationId,
            title: conversationTitle,
            projectId: state.activeProjectId,
            relativeTime: "刚刚",
            activityRank,
            starred: false,
            archived: false,
            status: "running",
          }

      return {
        conversationId,
        conversationTitle,
        sessions: [
          currentSession,
          ...state.sessions.filter(
            (session) => session.id !== conversationId
          ),
        ],
        messages: [
          ...state.messages,
          createMockMessage("user", content, state.attachments),
          createMockMessage("assistant", mockAssistantCopy.waiting),
        ],
        runState: "waiting",
        compressionEvent: null,
        versionSet: null,
        forkRelation: null,
        draft: "",
        attachments: [],
      }
    }),
  openMockConversation: (sessionId) =>
    set((state) => {
      const session = state.sessions.find((item) => item.id === sessionId)
      if (!session) {
        return state
      }

      return {
        activePage: "new-task",
        boardReturnPage: "new-task",
        activeProjectId: session.projectId,
        conversationId: session.id,
        conversationTitle: session.title,
        messages: [
          createMockMessage(
            "user",
            `请继续处理“${session.title}”，先展示当前 Mock 会话状态。`
          ),
          createMockMessage(
            "assistant",
            "这是只读的本地 Mock 会话。消息操作和状态展示可交互，但不会调用模型或访问真实项目数据。"
          ),
        ],
        runState: "completed",
        compressionEvent: null,
        isTemporaryConversation: false,
        versionSet: null,
        forkRelation: null,
        draft: "",
        attachments: [],
      }
    }),
  setMockRunState: (runState) =>
    set((state) => ({
      runState,
      messages:
        state.messages.length === 0
          ? state.messages
          : state.messages.map((message, index) =>
              index === state.messages.length - 1 &&
              message.role === "assistant"
                ? {
                    ...updateMessageContent(
                      message,
                      runState === "streaming"
                        ? ""
                        : mockAssistantCopy[runState]
                    ),
                    lastDeltaSequence:
                      runState === "streaming"
                        ? 0
                        : message.lastDeltaSequence ?? 0,
                  }
                : message
            ),
    })),
  appendMockDelta: (messageId, sequence, text) =>
    set((state) => {
      const message = state.messages.find((item) => item.id === messageId)
      const lastSequence = message?.lastDeltaSequence ?? 0
      if (!message || message.role !== "assistant" || sequence <= lastSequence) {
        return state
      }

      return {
        messages: state.messages.map((item) =>
          item.id === messageId
            ? updateMessageContent(
                { ...item, lastDeltaSequence: sequence },
                `${item.content}${text}`
              )
            : item
        ),
      }
    }),
  completeMockRun: () =>
    set((state) => ({
      runState: "completed",
      messages: state.messages.map((message, index) =>
        index === state.messages.length - 1 && message.role === "assistant"
          ? updateMessageContent(
              message,
              message.content.trim()
                ? message.content
                : mockAssistantCopy.completed
            )
          : message
      ),
    })),
  stopMockRun: () =>
    set((state) => ({
      runState: "cancelled",
      messages: state.messages.map((message, index) =>
        index === state.messages.length - 1 && message.role === "assistant"
          ? updateMessageContent(
              message,
              message.content.trim() ? message.content : mockAssistantCopy.cancelled
            )
          : message
      ),
    })),
  retryMockRun: () =>
    set((state) => ({
      runState: "waiting",
      multiModelEnabled: false,
      statsOpen: false,
      compressionEvent: null,
      versionSet: null,
      messages: state.messages.map((message, index) =>
        index === state.messages.length - 1 && message.role === "assistant"
          ? {
              ...updateMessageContent(message, mockAssistantCopy.waiting),
              lastDeltaSequence: 0,
            }
          : message
      ),
    })),
  resetConversation: () =>
    set(createEmptyConversationPatch()),
  setSessionSearchQuery: (sessionSearchQuery) =>
    set({ sessionSearchQuery }),
  setShowArchivedSessions: (showArchivedSessions) =>
    set({ showArchivedSessions }),
  loadMoreSessions: (projectId) =>
    set((state) => ({
      sessionVisibleCounts: {
        ...state.sessionVisibleCounts,
        [projectId]: state.sessionVisibleCounts[projectId] + 5,
      },
    })),
  openSessionDialog: (kind, sessionId) =>
    set({ sessionDialog: { kind, sessionId } }),
  closeSessionDialog: () => set({ sessionDialog: null }),
  toggleSessionStar: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, starred: !session.starred }
          : session
      ),
    })),
  renameSession: (sessionId, rawTitle) =>
    set((state) => {
      const title = rawTitle.trim()
      if (!title) {
        return state
      }

      return {
        sessions: state.sessions.map((session) =>
          session.id === sessionId ? { ...session, title } : session
        ),
        conversationTitle:
          state.conversationId === sessionId
            ? title
            : state.conversationTitle,
        sessionDialog: null,
      }
    }),
  moveSession: (sessionId, projectId) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, projectId, relativeTime: "刚刚" }
          : session
      ),
      activeProjectId:
        state.conversationId === sessionId ? projectId : state.activeProjectId,
      sessionDialog: null,
    })),
  setSessionArchived: (sessionId, archived) =>
    set((state) => {
      const closesCurrent =
        archived && state.conversationId === sessionId
      return {
        sessions: state.sessions.map((session) =>
          session.id === sessionId ? { ...session, archived } : session
        ),
        ...(closesCurrent
          ? {
              activePage: "new-task" as const,
              ...createEmptyConversationPatch(),
            }
          : {}),
      }
    }),
  deleteSession: (sessionId) =>
    set((state) => {
      const closesCurrent = state.conversationId === sessionId
      return {
        sessions: state.sessions.filter(
          (session) => session.id !== sessionId
        ),
        sessionDialog: null,
        ...(closesCurrent
          ? {
              activePage: "new-task" as const,
              ...createEmptyConversationPatch(),
            }
          : {}),
      }
    }),
  createScheduledTask: (input) =>
    set((state) => ({
      scheduledTasks: [
        createMockScheduledTask(input),
        ...state.scheduledTasks,
      ],
      sessionDialog: null,
    })),
}))
