import type { MockComposerAttachment } from "@/data/mock-composer"
import type { ConversationRunState, MockConversationMessage } from "@/data/mock-conversation"

export type ConversationMessageRole = "user" | "assistant" | "system"

export type ConversationMessageStatus =
  | "preparing"
  | "waiting"
  | "thinking"
  | "streaming"
  | "awaiting-approval"
  | "tool-running"
  | "compacting"
  | "completed"
  | "failed"
  | "cancelled"

export type ConversationPart =
  | {
      type: "markdown"
      id: string
      source: string
      streaming?: boolean
    }
  | {
      type: "thinking"
      id: string
      summary?: string
      state: "running" | "completed"
    }
  | {
      type: "status"
      id: string
      state: ConversationMessageStatus
      text: string
    }
  | {
      type: "tool"
      id: string
      toolCallId: string
    }
  | {
      type: "attachment"
      id: string
      attachmentId: string
    }

export type ConversationMessage = {
  id: string
  role: ConversationMessageRole
  createdAt: string
  parts: ConversationPart[]
  status?: ConversationMessageStatus
  attachments?: MockComposerAttachment[]
}

export type ConversationUiEvent =
  | {
      type: "message-start"
      messageId: string
      role: ConversationMessageRole
    }
  | {
      type: "message-delta"
      messageId: string
      partId: string
      sequence: number
      text: string
    }
  | {
      type: "status"
      messageId: string
      state: ConversationMessageStatus
      sequence: number
    }
  | {
      type: "thinking"
      messageId: string
      partId: string
      summary: string
    }
  | {
      type: "tool"
      messageId: string
      toolCallId: string
    }
  | {
      type: "error"
      messageId: string
      message: string
    }
  | {
      type: "message-end"
      messageId: string
      sequence: number
    }

export function mapRunStateToMessageStatus(
  state: ConversationRunState
): ConversationMessageStatus | undefined {
  if (state === "idle") return undefined
  return state
}

export function adaptMockConversationMessage(
  message: MockConversationMessage,
  runState: ConversationRunState,
  isLatest: boolean
): ConversationMessage {
  const status = isLatest ? mapRunStateToMessageStatus(runState) : undefined
  return {
    id: message.id,
    role: message.role,
    createdAt: message.createdAt,
    status,
    attachments: message.attachments,
    parts: [
      {
        type: "markdown",
        id: `${message.id}-markdown`,
        source: message.content,
        streaming: status === "streaming",
      },
      ...(message.attachments ?? []).map((attachment) => ({
        type: "attachment" as const,
        id: `${message.id}-${attachment.id}`,
        attachmentId: attachment.id,
      })),
    ],
  }
}

