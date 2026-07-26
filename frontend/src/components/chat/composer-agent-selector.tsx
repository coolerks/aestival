import { useState } from "react"
import { CheckIcon } from "lucide-react"

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
import { mockAgents } from "@/data/mock-composer"
import { useWorkspaceStore } from "@/store/workspace-store"

export function ComposerAgentSelector() {
  const [open, setOpen] = useState(false)
  const mode = useWorkspaceStore((state) => state.mode)
  const selectedAgentId = useWorkspaceStore(
    (state) => state.selectedAgentId
  )
  const setSelectedAgentId = useWorkspaceStore(
    (state) => state.setSelectedAgentId
  )
  const selected =
    mockAgents.find((agent) => agent.id === selectedAgentId) ?? mockAgents[0]
  const SelectedIcon = selected.icon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            aria-label={`选择智能体，当前为${selected.name}`}
          />
        }
      >
        <SelectedIcon data-icon="inline-start" />
        <span className="hidden md:inline">{selected.name}</span>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-0">
        <Command>
          <CommandInput placeholder="搜索智能体…" />
          <CommandList>
            <CommandEmpty>没有匹配的智能体</CommandEmpty>
            <CommandGroup heading="智能体">
              {mockAgents.map((agent) => {
                const Icon = agent.icon
                const disabled = mode === "chat" && agent.agentOnly

                return (
                  <CommandItem
                    key={agent.id}
                    value={`${agent.name} ${agent.description}`}
                    disabled={disabled}
                    onSelect={() => {
                      setSelectedAgentId(agent.id)
                      setOpen(false)
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{agent.name}</span>
                        {disabled ? (
                          <span className="text-xs text-muted-foreground">
                            聊天模式不可用
                          </span>
                        ) : null}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {agent.description} · {agent.tools}
                      </span>
                    </span>
                    {agent.id === selectedAgentId ? (
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
