import {
  BookOpenCheckIcon,
  BugIcon,
  CodeXmlIcon,
  SparklesIcon,
} from "lucide-react"
import { useState } from "react"

import appIcon from "@/assets/icons/application/icon.svg"
import { PromptComposer } from "@/components/chat/prompt-composer"
import { Button } from "@/components/ui/button"
import {
  formatWelcomePoem,
  pickPromptPlaceholder,
  pickWelcomePoem,
} from "@/data/new-task-content"
import { useSettingsStore } from "@/store/settings-store"
import { useWorkspaceStore } from "@/store/workspace-store"

const suggestions = [
  {
    icon: CodeXmlIcon,
    title: "探索并理解代码",
    prompt: "先阅读当前项目结构，说明前端入口和关键约束。",
  },
  {
    icon: SparklesIcon,
    title: "构建新功能或工具",
    prompt: "根据设计方案实现一个新的本地工作区功能。",
  },
  {
    icon: BookOpenCheckIcon,
    title: "审查代码并给出建议",
    prompt: "审查当前前端实现，找出与设计规范不一致的地方。",
  },
  {
    icon: BugIcon,
    title: "修复问题和失败",
    prompt: "定位当前构建或交互失败的原因并给出修复方案。",
  },
] as const

export function NewTaskView() {
  const setDraft = useWorkspaceStore((state) => state.setDraft)
  const poemMetadataMode = useSettingsStore(
    (state) => state.welcomePoemMetadata
  )
  const [welcomePoem] = useState(() => pickWelcomePoem())
  const [placeholder] = useState(() => pickPromptPlaceholder())

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
        <div className="welcome-content flex w-full max-w-[840px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src={appIcon}
              alt="Aestival"
              className="size-12"
            />
            <p className="text-sm text-muted-foreground">Aestival 默认任务</p>
            <h1 className="text-balance text-2xl font-medium tracking-tight sm:text-3xl">
              {formatWelcomePoem(welcomePoem, poemMetadataMode)}
            </h1>
          </div>
          <div className="welcome-suggestions grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon
              return (
                <Button
                  key={suggestion.title}
                  variant="outline"
                  className="h-auto min-h-24 items-start justify-start whitespace-normal p-4 text-left"
                  onClick={() => setDraft(suggestion.prompt)}
                >
                  <span className="flex flex-col items-start gap-4">
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
