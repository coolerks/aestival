import { useEffect, useRef } from "react"
import {
  AlertTriangleIcon,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { mockStreamingMarkdown } from "@/data/mock-conversation"
import { useWorkspaceStore } from "@/store/workspace-store"

export function ConversationView() {
  const streamMessageIdRef = useRef<string | null>(null)
  const streamCursorRef = useRef(0)
  const streamSequenceRef = useRef(0)
  const messages = useWorkspaceStore((state) => state.messages)
  const runState = useWorkspaceStore((state) => state.runState)
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
  const speechPlayback = useWorkspaceStore(
    (state) => state.speechPlayback
  )
  const setMockRunState = useWorkspaceStore(
    (state) => state.setMockRunState
  )
  const appendMockDelta = useWorkspaceStore(
    (state) => state.appendMockDelta
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
      const timer = window.setTimeout(
        () => setMockRunState("streaming"),
        1100
      )
      return () => window.clearTimeout(timer)
    }

  }, [
    runState,
    setMockRunState,
  ])

  const latestMessage = messages[messages.length - 1]
  const latestAssistantId =
    latestMessage?.role === "assistant" ? latestMessage.id : null

  useEffect(() => {
    if (runState !== "streaming" || !latestAssistantId) {
      if (runState !== "streaming") {
        streamMessageIdRef.current = null
        streamCursorRef.current = 0
        streamSequenceRef.current = 0
      }
      return
    }

    if (streamMessageIdRef.current !== latestAssistantId) {
      streamMessageIdRef.current = latestAssistantId
      streamCursorRef.current = 0
      streamSequenceRef.current = 0
    }

    const timer = window.setInterval(() => {
      const cursor = streamCursorRef.current
      if (cursor >= mockStreamingMarkdown.length) {
        window.clearInterval(timer)
        completeMockRun()
        return
      }

      const sequence = streamSequenceRef.current + 1
      const chunkSize = 12 + (sequence % 3) * 4
      const chunk = mockStreamingMarkdown.slice(cursor, cursor + chunkSize)
      streamCursorRef.current += chunk.length
      streamSequenceRef.current = sequence
      appendMockDelta(latestAssistantId, sequence, chunk)
    }, 40)

    return () => window.clearInterval(timer)
  }, [
    appendMockDelta,
    completeMockRun,
    latestAssistantId,
    runState,
  ])

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <MessageScrollerProvider
        autoScroll
        defaultScrollPosition="end"
        scrollEdgeThreshold={72}
      >
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport aria-label="聊天消息">
            <MessageScrollerContent className="mx-auto w-full max-w-4xl gap-8 px-5 py-8 sm:px-8">
          {forkRelation ? (
            <MessageScrollerItem messageId="fork-relation">
              <ForkRelationBar
                relation={forkRelation}
                onNavigate={navigateMockFork}
              />
            </MessageScrollerItem>
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
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={index === messages.length - 1}
                className="flex flex-col gap-3"
              >
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
                />
                {versionSet?.messageId === message.id ? (
                  <MessageVersionSwitcher
                    versionSet={versionSet}
                    onSelect={selectMockVersion}
                  />
                ) : null}
              </MessageScrollerItem>
            )
          })}

          {compressionEvent ? (
            <MessageScrollerItem messageId="context-compression">
              <ContextCompressionEvent
                event={compressionEvent}
                onRecompress={createCompressionEvent}
              />
            </MessageScrollerItem>
          ) : null}

          {multiModelEnabled && runState === "completed" ? (
            <MessageScrollerItem messageId="multi-model-response">
              <MultiModelResponse />
            </MessageScrollerItem>
          ) : null}

          {runState === "failed" ? (
            <MessageScrollerItem messageId="run-failed">
              <Alert variant="destructive" className="max-w-3xl">
                <AlertTriangleIcon aria-hidden="true" />
                <AlertTitle>Mock 运行失败</AlertTitle>
                <AlertDescription>
                  已生成内容和草稿均已保留，可以从当前状态重试。
                </AlertDescription>
              </Alert>
            </MessageScrollerItem>
          ) : null}

          {runState === "failed" || runState === "cancelled" ? (
            <MessageScrollerItem messageId="run-retry">
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={retryMockRun}
              >
                <RotateCwIcon data-icon="inline-start" />
                重试 Mock 运行
              </Button>
            </MessageScrollerItem>
          ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton
            direction="end"
            size="sm"
            aria-label="回到最新消息"
          >
            回到最新消息
          </MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="shrink-0 px-4 pb-4 sm:px-8 sm:pb-5">
        <div className="mx-auto flex max-w-[840px] flex-col items-center gap-2">
          <PromptComposer />
          <p className="text-center text-[11px] text-muted-foreground">
            当前为前端 Mock，消息与交互状态不会离开本地 UI。
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
