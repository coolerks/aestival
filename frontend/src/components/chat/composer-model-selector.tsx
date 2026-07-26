import { useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { mockModels } from "@/data/mock-composer"
import { useWorkspaceStore } from "@/store/workspace-store"

export function ComposerModelSelector() {
  const [open, setOpen] = useState(false)
  const selectedModelId = useWorkspaceStore(
    (state) => state.selectedModelId
  )
  const setSelectedModelId = useWorkspaceStore(
    (state) => state.setSelectedModelId
  )
  const selected =
    mockModels.find((model) => model.id === selectedModelId) ?? mockModels[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            aria-label={`选择模型，当前为${selected.name}`}
          />
        }
      >
        <span>{selected.name}</span>
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 p-0">
        <Command>
          <CommandInput placeholder="搜索模型…" />
          <CommandList>
            <CommandEmpty>没有匹配的模型</CommandEmpty>
            <CommandGroup heading="单模型">
              {mockModels.map((model) => {
                const Icon = model.icon
                return (
                  <CommandItem
                    key={model.id}
                    value={`${model.name} ${model.provider} ${model.description}`}
                    onSelect={() => {
                      setSelectedModelId(model.id)
                      setOpen(false)
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.context}
                        </span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {model.provider} · {model.description}
                      </span>
                    </span>
                    {model.id === selectedModelId ? (
                      <CheckIcon aria-hidden="true" />
                    ) : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
