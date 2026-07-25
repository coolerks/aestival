import { useMemo } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { commandItems } from "@/data/mock-workspace"
import {
  type AppPage,
  useWorkspaceStore,
} from "@/store/workspace-store"

const navigablePages = new Set<AppPage>([
  "new-task",
  "knowledge",
  "apps",
  "capabilities",
  "tasks",
])

export function GlobalCommand() {
  const open = useWorkspaceStore((state) => state.commandOpen)
  const setOpen = useWorkspaceStore((state) => state.setCommandOpen)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)

  const groupedItems = useMemo(
    () =>
      commandItems.reduce<Record<string, typeof commandItems[number][]>>(
        (groups, item) => {
          groups[item.group] ??= []
          groups[item.group].push(item)
          return groups
        },
        {},
      ),
    [],
  )

  const runCommand = (id: string) => {
    if (navigablePages.has(id as AppPage)) {
      setActivePage(id as AppPage)
    }
    setOpen(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="全局搜索"
      description="搜索功能、会话、聊天记录与本地文件"
      className="sm:max-w-xl"
    >
      <Command>
        <CommandInput placeholder="搜索功能、会话、聊天记录与文件…" />
        <CommandList>
          <CommandEmpty>没有找到匹配结果。</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items], index) => (
            <div key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${group}`}
                      onSelect={() => runCommand(item.id)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                      {"shortcut" in item && item.shortcut ? (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
