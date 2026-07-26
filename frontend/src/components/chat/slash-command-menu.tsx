import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import type {
  SlashCommandOption,
} from "@/data/mock-composer"
import type { AgentMode } from "@/store/workspace-store"

type SlashCommandMenuProps = {
  commands: SlashCommandOption[]
  mode: AgentMode
  selectedValue: string
  onSelectedValueChange: (value: string) => void
  onSelect: (command: SlashCommandOption) => void
}

export function SlashCommandMenu({
  commands,
  mode,
  selectedValue,
  onSelectedValueChange,
  onSelect,
}: SlashCommandMenuProps) {
  return (
    <Command
      value={selectedValue}
      onValueChange={onSelectedValueChange}
      shouldFilter={false}
    >
      <CommandList className="max-h-64">
        <CommandEmpty>没有匹配的命令</CommandEmpty>
        <CommandGroup heading="Slash Command">
          {commands.map((command) => {
            const Icon = command.icon
            const disabled = mode === "chat" && command.agentOnly

            return (
              <CommandItem
                key={command.id}
                value={command.command}
                disabled={disabled}
                onSelect={() => onSelect(command)}
              >
                <Icon aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span>{command.command}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {disabled
                      ? `${command.label} · 聊天模式不可用`
                      : command.label}
                  </span>
                </span>
                <CommandShortcut>Tab</CommandShortcut>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
