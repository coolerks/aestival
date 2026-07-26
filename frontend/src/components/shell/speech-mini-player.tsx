import { useEffect } from "react"
import {
  PauseIcon,
  PlayIcon,
  Settings2Icon,
  SquareIcon,
  Volume2Icon,
} from "lucide-react"

import { IconButton } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  mockSpeechRates,
  mockSpeechVoices,
  type MockSpeechRate,
  type MockSpeechVoice,
} from "@/data/mock-ai-app"
import { useWorkspaceStore } from "@/store/workspace-store"

export function SpeechMiniPlayer() {
  const playback = useWorkspaceStore((state) => state.speechPlayback)
  const toggleMockSpeech = useWorkspaceStore(
    (state) => state.toggleMockSpeech
  )
  const stopMockSpeech = useWorkspaceStore((state) => state.stopMockSpeech)
  const advanceMockSpeech = useWorkspaceStore(
    (state) => state.advanceMockSpeech
  )
  const setMockSpeechRate = useWorkspaceStore(
    (state) => state.setMockSpeechRate
  )
  const setMockSpeechVoice = useWorkspaceStore(
    (state) => state.setMockSpeechVoice
  )
  const returnToSourceConversation = useWorkspaceStore(
    (state) => state.returnToSourceConversation
  )

  useEffect(() => {
    if (!playback?.playing) {
      return
    }
    const timer = window.setInterval(advanceMockSpeech, 180)
    return () => window.clearInterval(timer)
  }, [advanceMockSpeech, playback?.playing])

  if (!playback) {
    return null
  }

  const chooseRate = (values: readonly string[]) => {
    const rate = values[0] as MockSpeechRate | undefined
    if (rate) {
      setMockSpeechRate(rate)
    }
  }

  return (
    <section
      className="shrink-0 border-t bg-background px-3 py-2"
      aria-label="朗读迷你控制条"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Volume2Icon aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="link"
              size="sm"
              className="h-auto min-w-0 p-0"
              onClick={returnToSourceConversation}
            >
              <span className="truncate">{playback.sourceTitle}</span>
            </Button>
            <Badge variant="secondary">Mock 朗读</Badge>
          </div>
          <Progress
            value={playback.progress}
            className="mt-1 gap-1"
          >
            <ProgressLabel className="sr-only">
              朗读进度
            </ProgressLabel>
            <ProgressValue className="text-[11px]">
              {(_formatted, value) =>
                `${Math.round(value ?? 0)}%`
              }
            </ProgressValue>
          </Progress>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {playback.voice} · {playback.rate}×
        </span>
        <IconButton
          label={playback.playing ? "暂停朗读" : "继续朗读"}
          onClick={toggleMockSpeech}
        >
          {playback.playing ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="朗读设置"
              />
            }
          >
            <Settings2Icon />
          </PopoverTrigger>
          <PopoverContent align="end" side="top">
            <PopoverHeader>
              <PopoverTitle>朗读设置</PopoverTitle>
              <PopoverDescription>
                当前仅模拟播放状态，不调用系统语音服务。
              </PopoverDescription>
            </PopoverHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="speech-voice">语音</FieldLabel>
                <Select
                  value={playback.voice}
                  onValueChange={(value) => {
                    if (value) {
                      setMockSpeechVoice(value as MockSpeechVoice)
                    }
                  }}
                >
                  <SelectTrigger id="speech-voice" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {mockSpeechVoices.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <FieldSet>
                <FieldLegend variant="label">语速</FieldLegend>
                <ToggleGroup
                  value={[playback.rate]}
                  onValueChange={chooseRate}
                  variant="outline"
                  spacing={0}
                  aria-label="朗读语速"
                  className="max-w-full flex-wrap"
                >
                  {mockSpeechRates.map((rate) => (
                    <ToggleGroupItem key={rate} value={rate}>
                      {rate}×
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            </FieldGroup>
          </PopoverContent>
        </Popover>
        <IconButton label="停止朗读" onClick={stopMockSpeech}>
          <SquareIcon />
        </IconButton>
      </div>
    </section>
  )
}
