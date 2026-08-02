import { useMemo } from "react"
import {
  ArchiveIcon,
  AppWindowIcon,
  CalendarClockIcon,
  ChartNoAxesCombinedIcon,
  DownloadIcon,
  FolderInputIcon,
  GitForkIcon,
  LibraryBigIcon,
  MessageSquareIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
  BlocksIcon,
} from "lucide-react"

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
import {
  sessionActionLabels,
  sortMockSessions,
} from "@/data/mock-session-management"
import { commandItems } from "@/data/mock-workspace"
import { useKnowledgeStore } from "@/store/knowledge-store"
import { useAppStore } from "@/store/app-store"
import { useCapabilityStore } from "@/store/capability-store"
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
  "settings",
])

export function GlobalCommand() {
  const open = useWorkspaceStore((state) => state.commandOpen)
  const setOpen = useWorkspaceStore((state) => state.setCommandOpen)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const sessions = useWorkspaceStore((state) => state.sessions)
  const conversationId = useWorkspaceStore((state) => state.conversationId)
  const messages = useWorkspaceStore((state) => state.messages)
  const openMockConversation = useWorkspaceStore(
    (state) => state.openMockConversation
  )
  const toggleSessionStar = useWorkspaceStore(
    (state) => state.toggleSessionStar
  )
  const setSessionArchived = useWorkspaceStore(
    (state) => state.setSessionArchived
  )
  const openSessionDialog = useWorkspaceStore(
    (state) => state.openSessionDialog
  )
  const setStatsOpen = useWorkspaceStore((state) => state.setStatsOpen)
  const setForkDialogOpen = useWorkspaceStore(
    (state) => state.setForkDialogOpen
  )
  const setExportDialogOpen = useWorkspaceStore(
    (state) => state.setExportDialogOpen
  )
  const knowledgeBases = useKnowledgeStore((state) => state.knowledgeBases)
  const setKnowledgeTab = useKnowledgeStore((state) => state.setActiveTab)
  const openKnowledgeDetails = useKnowledgeStore(
    (state) => state.openKnowledgeDetails
  )
  const currentSession = sessions.find(
    (session) => session.id === conversationId
  )
  const visibleSessions = sortMockSessions(
    sessions.filter((session) => !session.archived)
  )

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

  const runSessionCommand = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="全局搜索"
      description="搜索功能、会话、聊天记录、本地文件与知识库"
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
          {currentSession ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="当前会话">
                <CommandItem
                  value={`${currentSession.starred
                    ? sessionActionLabels.unstar
                    : sessionActionLabels.star} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      toggleSessionStar(currentSession.id)
                    )
                  }
                >
                  <StarIcon />
                  <span>
                    {currentSession.starred
                      ? sessionActionLabels.unstar
                      : sessionActionLabels.star}
                  </span>
                  <CommandShortcut>⌘⇧S</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.rename} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      openSessionDialog("rename", currentSession.id)
                    )
                  }
                >
                  <PencilIcon />
                  <span>{sessionActionLabels.rename}</span>
                  <CommandShortcut>F2</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.fork} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      setForkDialogOpen(
                        true,
                        messages[messages.length - 1]?.id
                      )
                    )
                  }
                >
                  <GitForkIcon />
                  <span>{sessionActionLabels.fork}</span>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.move} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      openSessionDialog("move", currentSession.id)
                    )
                  }
                >
                  <FolderInputIcon />
                  <span>{sessionActionLabels.move}</span>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.schedule} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      openSessionDialog("schedule", currentSession.id)
                    )
                  }
                >
                  <CalendarClockIcon />
                  <span>{sessionActionLabels.schedule}</span>
                  <CommandShortcut>⌘⌥N</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.stats} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() => setStatsOpen(true))
                  }
                >
                  <ChartNoAxesCombinedIcon />
                  <span>{sessionActionLabels.stats}</span>
                  <CommandShortcut>⌘⌥I</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.export} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      setExportDialogOpen(true, "conversation")
                    )
                  }
                >
                  <DownloadIcon />
                  <span>{sessionActionLabels.export}</span>
                  <CommandShortcut>⌘⇧E</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value={`${currentSession.archived
                    ? sessionActionLabels.unarchive
                    : sessionActionLabels.archive} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      setSessionArchived(
                        currentSession.id,
                        !currentSession.archived
                      )
                    )
                  }
                >
                  <ArchiveIcon />
                  <span>
                    {currentSession.archived
                      ? sessionActionLabels.unarchive
                      : sessionActionLabels.archive}
                  </span>
                  <CommandShortcut>⌘⇧A</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value={`${sessionActionLabels.delete} 当前会话`}
                  onSelect={() =>
                    runSessionCommand(() =>
                      openSessionDialog("delete", currentSession.id)
                    )
                  }
                >
                  <Trash2Icon />
                  <span>{sessionActionLabels.delete}</span>
                  <CommandShortcut>⌘⌫</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          ) : null}
          <CommandSeparator />
          <CommandGroup heading="会话">
            {visibleSessions.map((session) => (
              <CommandItem
                key={session.id}
                value={`${session.title} 会话`}
                onSelect={() =>
                  runSessionCommand(() => openMockConversation(session.id))
                }
              >
                <MessageSquareIcon />
                <span className="min-w-0 flex-1 truncate">
                  {session.title}
                </span>
                {session.starred ? (
                  <StarIcon
                    className="text-muted-foreground"
                    fill="currentColor"
                    aria-label="已 Star"
                  />
                ) : null}
                <CommandShortcut>{session.relativeTime}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="聊天记录">
            {messages.slice(-5).map((message) => (
              <CommandItem
                key={message.id}
                value={`${message.content} 聊天记录 ${message.role}`}
                onSelect={() =>
                  runSessionCommand(() => {
                    if (currentSession) {
                      openMockConversation(currentSession.id)
                    }
                  })
                }
              >
                <MessageSquareIcon />
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    {message.role === "user" ? "你" : "Aestival"}：{message.content}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {currentSession?.title ?? "当前 Mock 会话"}
                  </div>
                </div>
                <CommandShortcut>{message.createdAt}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="知识库">
            {knowledgeBases.map((knowledgeBase) => (
              <CommandItem
                key={knowledgeBase.id}
                value={`# ${knowledgeBase.name} ${knowledgeBase.description} ${knowledgeBase.sourceLabel} ${knowledgeBase.tags.join(" ")}`}
                onSelect={() =>
                  runSessionCommand(() => {
                    setActivePage("knowledge")
                    setKnowledgeTab("libraries")
                    openKnowledgeDetails(knowledgeBase.id)
                  })
                }
              >
                <LibraryBigIcon />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{knowledgeBase.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {knowledgeBase.sourceLabel} · {knowledgeBase.description}
                  </div>
                </div>
                <CommandShortcut>#</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          {open ? <LocalAppCommandGroup /> : null}
          {open ? <LocalCapabilityCommandGroup /> : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

function LocalCapabilityCommandGroup() {
  const records = useCapabilityStore((state) => state.records)
  const setCapabilityTab = useCapabilityStore((state) => state.setActiveTab)
  const openDetails = useCapabilityStore((state) => state.openDetails)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const setOpen = useWorkspaceStore((state) => state.setCommandOpen)

  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="能力">
        {records.map((record) => (
          <CommandItem
            key={record.id}
            value={`${record.name} ${record.description} ${record.source} ${record.type}`}
            onSelect={() => {
              setActivePage("capabilities")
              setCapabilityTab(record.tab)
              openDetails(record.id)
              setOpen(false)
            }}
          >
            <BlocksIcon />
            <div className="min-w-0 flex-1">
              <div className="truncate">{record.name}</div>
              <div className="truncate text-xs text-muted-foreground">{record.description}</div>
            </div>
            <CommandShortcut>能力</CommandShortcut>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  )
}

function LocalAppCommandGroup() {
  const apps = useAppStore((state) => state.apps)
  const openAppEditor = useAppStore((state) => state.openEditor)
  const setActivePage = useWorkspaceStore((state) => state.setActivePage)
  const setOpen = useWorkspaceStore((state) => state.setCommandOpen)

  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="本地应用">
        {apps.map((app) => (
          <CommandItem
            key={app.id}
            value={`${app.name} ${app.description} 本地应用`}
            onSelect={() => {
              setActivePage("apps")
              openAppEditor(app.id)
              setOpen(false)
            }}
          >
            <AppWindowIcon />
            <div className="min-w-0 flex-1">
              <div className="truncate">{app.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {app.description}
              </div>
            </div>
            <CommandShortcut>应用</CommandShortcut>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  )
}
