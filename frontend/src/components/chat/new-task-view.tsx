import { useState } from "react"

import appIcon from "@/assets/icons/application/icon.svg"
import { PromptComposer } from "@/components/chat/prompt-composer"
import { Button } from "@/components/ui/button"
import {
  formatWelcomePoem,
  pickPromptPlaceholder,
  pickWelcomePoem,
} from "@/data/new-task-content"
import { pickQuickSuggestions } from "@/data/quick-suggestions"
import { useSettingsStore } from "@/store/settings-store"
import { useWorkspaceStore } from "@/store/workspace-store"

export function NewTaskView() {
  const setDraft = useWorkspaceStore((state) => state.setDraft)
  const poemMetadataMode = useSettingsStore(
    (state) => state.welcomePoemMetadata
  )
  const [welcomePoem] = useState(() => pickWelcomePoem())
  const [placeholder] = useState(() => pickPromptPlaceholder())
  const [suggestions] = useState(() => pickQuickSuggestions(4))

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
        <div className="welcome-content flex w-full max-w-[840px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src={appIcon}
              alt="Aestival"
              className="size-24"
            />
            <h1 className="text-balance text-2xl font-medium tracking-tight sm:text-3xl">
              {formatWelcomePoem(welcomePoem, poemMetadataMode)}
            </h1>
          </div>
          <div className="welcome-suggestions grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon
              return (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  className="h-auto min-h-24 items-start rounded-2xl shadow-xs justify-start whitespace-normal p-4 text-left"
                  onClick={() => setDraft(suggestion.prompt)}
                >
                  <span className="flex flex-col items-start gap-4 p-2">
                    <Icon data-icon="inline-start" />
                    <span>{suggestion.title}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-4 sm:px-8 sm:pb-6">
        <div className="mx-auto flex max-w-[840px] flex-col items-center gap-2">
          <PromptComposer placeholder={placeholder} />
          <p className="text-center text-[11px] text-muted-foreground">
            当前为前端 Mock，内容不会发送给模型或写入本地文件。
          </p>
        </div>
      </div>
    </section>
  )
}
