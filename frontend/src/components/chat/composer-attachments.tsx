import { XIcon } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import {
  attachmentKindIcons,
  type MockComposerAttachment,
} from "@/data/mock-composer"

type ComposerAttachmentsProps = {
  attachments: MockComposerAttachment[]
  onRemove?: (id: string) => void
}

export function ComposerAttachments({
  attachments,
  onRemove,
}: ComposerAttachmentsProps) {
  if (attachments.length === 0) {
    return null
  }

  return (
    <AttachmentGroup aria-label="已添加的附件">
      {attachments.map((attachment) => {
        const Icon = attachmentKindIcons[attachment.kind]

        return (
          <Attachment
            key={attachment.id}
            size="xs"
            state={attachment.state}
          >
            <AttachmentMedia>
              {attachment.state === "processing" ? (
                <Spinner aria-label={`${attachment.name} 处理中`} />
              ) : (
                <Icon aria-hidden="true" />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{attachment.name}</AttachmentTitle>
              <AttachmentDescription>
                {attachment.description}
              </AttachmentDescription>
            </AttachmentContent>
            {onRemove ? (
              <AttachmentActions>
                <AttachmentAction
                  aria-label={`移除 ${attachment.name}`}
                  onClick={() => onRemove(attachment.id)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            ) : null}
          </Attachment>
        )
      })}
    </AttachmentGroup>
  )
}
