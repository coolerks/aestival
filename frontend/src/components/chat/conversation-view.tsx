import { useEffect, useRef, useState } from "react"
import {
  AlertTriangleIcon,
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  RotateCwIcon,
} from "lucide-react"

import { ContextCompressionEvent } from "@/components/chat/context-compression-event"
import { ConversationExportDialog } from "@/components/chat/conversation-export-dialog"
import { ConversationForkDialog } from "@/components/chat/conversation-fork-dialog"
import { ConversationStatsDialog } from "@/components/chat/conversation-stats-dialog"
import { ConversationMessage } from "@/components/chat/conversation-message"
import { ForkRelationBar } from "@/components/chat/fork-relation-bar"
import { MessageVersionSwitcher } from "@/components/chat/message-version-switcher"
import { MultiModelResponse } from "@/components/chat/multi-model-response"
import { PromptComposer } from "@/components/chat/prompt-composer"
import { TemporaryConversationDialog } from "@/components/chat/temporary-conversation-dialog"
import { ToolCallCard } from "@/components/chat/tool-call-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import type { ConversationRunState } from "@/data/mock-conversation"
import { useWorkspaceStore } from "@/store/workspace-store"

const runLabels: Partial<Record<ConversationRunState, string>> = {
  waiting: "等待 Mock 模型",
  thinking: "整理思考大纲",
  "awaiting-approval": "等待审批",
  streaming: "生成 Mock 结果",
}

export function ConversationView() {
  const [outlineOpen, setOutlineOpen] = useState(false)
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const messages = useWorkspaceStore((state) => state.messages)
  const runState = useWorkspaceStore((state) => state.runState)
  const toolCall = useWorkspaceStore((state) => state.toolCall)
  const multiModelEnabled = useWorkspaceStore(
    (state) => state.multiModelEnabled
  )
  const statsOpen = useWorkspaceStore((state) => state.statsOpen)
  const compressionEvent = useWorkspaceStore(
    (state) => state.compressionEvent
  )
  const conversationTitle = useWorkspaceStore(
    (state) => state.conversationTitle
  )
  const temporaryCloseOpen = useWorkspaceStore(
    (state) => state.temporaryCloseOpen
  )
  const forkDialogOpen = useWorkspaceStore(
    (state) => state.forkDialogOpen
  )
  const forkMessageId = useWorkspaceStore(
    (state) => state.forkMessageId
  )
  const exportDialogOpen = useWorkspaceStore(
    (state) => state.exportDialogOpen
  )
  const exportScopePreset = useWorkspaceStore(
    (state) => state.exportScopePreset
  )
  const exportFormatPreset = useWorkspaceStore(
    (state) => state.exportFormatPreset
  )
  const versionSet = useWorkspaceStore((state) => state.versionSet)
  const forkRelation = useWorkspaceStore((state) => state.forkRelation)
  const mockAppDraft = useWorkspaceStore((state) => state.mockAppDraft)
  const speechPlayback = useWorkspaceStore(
    (state) => state.speechPlayback
  )
  const setMockRunState = useWorkspaceStore(
    (state) => state.setMockRunState
  )
  const requestMockApproval = useWorkspaceStore(
    (state) => state.requestMockApproval
  )
  const decideMockApproval = useWorkspaceStore(
    (state) => state.decideMockApproval
  )
  const completeMockRun = useWorkspaceStore(
    (state) => state.completeMockRun
  )
  const retryMockRun = useWorkspaceStore((state) => state.retryMockRun)
  const setStatsOpen = useWorkspaceStore((state) => state.setStatsOpen)
  const createCompressionEvent = useWorkspaceStore(
    (state) => state.createCompressionEvent
  )
  const setTemporaryCloseOpen = useWorkspaceStore(
    (state) => state.setTemporaryCloseOpen
  )
  const convertTemporaryConversation = useWorkspaceStore(
    (state) => state.convertTemporaryConversation
  )
  const discardTemporaryConversation = useWorkspaceStore(
    (state) => state.discardTemporaryConversation
  )
  const setForkDialogOpen = useWorkspaceStore(
    (state) => state.setForkDialogOpen
  )
  const createMockFork = useWorkspaceStore(
    (state) => state.createMockFork
  )
  const navigateMockFork = useWorkspaceStore(
    (state) => state.navigateMockFork
  )
  const setExportDialogOpen = useWorkspaceStore(
    (state) => state.setExportDialogOpen
  )
  const regenerateMockResponse = useWorkspaceStore(
    (state) => state.regenerateMockResponse
  )
  const selectMockVersion = useWorkspaceStore(
    (state) => state.selectMockVersion
  )
  const createMockApplicationDraft = useWorkspaceStore(
    (state) => state.createMockApplicationDraft
  )
  const openMockAppEditor = useWorkspaceStore(
    (state) => state.openMockAppEditor
  )
  const startMockSpeech = useWorkspaceStore(
    (state) => state.startMockSpeech
  )

  useEffect(() => {
    if (runState === "waiting") {
      const timer = window.setTimeout(
        () => setMockRunState("thinking"),
        700
      )
      return () => window.clearTimeout(timer)
    }

    if (runState === "thinking") {
      const timer = window.setTimeout(requestMockApproval, 1100)
      return () => window.clearTimeout(timer)
    }

    if (runState === "streaming") {
      const timer = window.setTimeout(completeMockRun, 1200)
      return () => window.clearTimeout(timer)
    }
  }, [
    completeMockRun,
    requestMockApproval,
    runState,
    setMockRunState,
  ])

  useEffect(() => {
    const viewport = scrollRootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages, runState, toolCall])

  const isActive =
    runState === "waiting" ||
    runState === "thinking" ||
    runState === "awaiting-approval" ||
    runState === "streaming"

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <ScrollArea ref={scrollRootRef} className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 sm:px-8">
          {forkRelation ? (
            <ForkRelationBar
              relation={forkRelation}
              onNavigate={navigateMockFork}
            />
          ) : null}

          {messages.map((message, index) => {
            const selectedVersion =
              versionSet?.messageId === message.id
                ? versionSet.versions.find(
                    (version) => version.id === versionSet.selectedId
                  )
                : undefined
            const displayedMessage = selectedVersion
              ? { ...message, content: selectedVersion.content }
              : message

            return (
              <div key={message.id} className="flex flex-col gap-3">
                <ConversationMessage
                  message={displayedMessage}
                  isLatestAssistant={
                    message.role === "assistant" &&
                    index === messages.length - 1
                  }
                  runState={runState}
                  onFork={(messageId) =>
                    setForkDialogOpen(true, messageId)
                  }
                  onRegenerate={regenerateMockResponse}
                  onExport={() =>
                    setExportDialogOpen(true, "selection")
                  }
                  onRead={(messageId, content) =>
                    startMockSpeech(
                      messageId,
                      content,
                      conversationTitle
                    )
                  }
                  isReading={
                    speechPlayback?.messageId === message.id &&
                    speechPlayback.playing
                  }
                  showCodeBundle={
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    runState === "completed"
                  }
                  conversationTitle={conversationTitle}
                  createdDraft={mockAppDraft}
                  onCreateDraft={createMockApplicationDraft}
                  onOpenEditor={openMockAppEditor}
                />
                {versionSet?.messageId === message.id ? (
                  <MessageVersionSwitcher
                    versionSet={versionSet}
                    onSelect={selectMockVersion}
                  />
                ) : null}
              </div>
            )
          })}

          {runState === "thinking" ||
          runState === "awaiting-approval" ||
          runState === "streaming" ||
          runState === "completed" ? (
            <Collapsible
              open={outlineOpen}
              onOpenChange={setOutlineOpen}
              className="max-w-3xl"
            >
              <CollapsibleTrigger
                render={<Button variant="ghost" size="sm" />}
              >
                {outlineOpen ? (
                  <ChevronDownIcon data-icon="inline-start" />
                ) : (
                  <ChevronRightIcon data-icon="inline-start" />
                )}
                <BrainIcon data-icon="inline-start" />
                思考大纲
                {runState === "thinking" ? (
                  <Spinner aria-label="正在生成思考大纲" />
                ) : null}
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-2 border-l pl-5 text-sm text-muted-foreground">
                <p>1. 核对 UI 约束与现有组件。</p>
                <p>2. 将任务拆分为消息、工具与审批状态。</p>
                <p>3. 使用 Mock 事件验证完整交互链路。</p>
              </CollapsibleContent>
            </Collapsible>
          ) : null}

          {toolCall ? (
            <ToolCallCard
              toolCall={toolCall}
              onDecision={decideMockApproval}
            />
          ) : null}

          {compressionEvent ? (
            <ContextCompressionEvent
              event={compressionEvent}
              onRecompress={createCompressionEvent}
            />
          ) : null}

          {multiModelEnabled && runState === "completed" ? (
            <MultiModelResponse />
          ) : null}

          {runState === "failed" ? (
            <Alert variant="destructive" className="max-w-3xl">
              <AlertTriangleIcon aria-hidden="true" />
              <AlertTitle>Mock 运行失败</AlertTitle>
              <AlertDescription>
                已生成内容和草稿均已保留，可以从当前状态重试。
              </AlertDescription>
            </Alert>
          ) : null}

          {runState === "failed" || runState === "cancelled" ? (
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={retryMockRun}
            >
              <RotateCwIcon data-icon="inline-start" />
              重试 Mock 运行
            </Button>
          ) : null}
        </div>
      </ScrollArea>

      <div className="shrink-0 px-4 pb-4 sm:px-8 sm:pb-5">
        <div className="mx-auto flex max-w-[840px] flex-col items-center gap-2">
          {isActive ? (
            <div
              className="flex w-full items-center gap-2 text-xs text-muted-foreground"
              aria-live="polite"
            >
              <Spinner aria-label={runLabels[runState] ?? "Mock 运行中"} />
              {runLabels[runState]}
            </div>
          ) : null}
          <PromptComposer />
          <p className="text-center text-[11px] text-muted-foreground">
            当前为前端 Mock，消息、工具与审批决定不会离开本地 UI。
          </p>
        </div>
      </div>

      <ConversationStatsDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
      />
      <ConversationForkDialog
        open={forkDialogOpen}
        onOpenChange={(open) => setForkDialogOpen(open)}
        messages={messages}
        initialMessageId={forkMessageId}
        conversationTitle={conversationTitle}
        onCreate={createMockFork}
      />
      <ConversationExportDialog
        open={exportDialogOpen}
        onOpenChange={(open) => setExportDialogOpen(open)}
        initialScope={exportScopePreset}
        initialFormat={exportFormatPreset}
        conversationTitle={conversationTitle}
      />
      <TemporaryConversationDialog
        open={temporaryCloseOpen}
        onOpenChange={setTemporaryCloseOpen}
        onSave={convertTemporaryConversation}
        onDiscard={discardTemporaryConversation}
      />
    </section>
  )
}
