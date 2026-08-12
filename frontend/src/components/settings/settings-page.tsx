import {
  BarChart3Icon,
  BellIcon,
  CableIcon,
  InfoIcon,
  KeyboardIcon,
  MenuIcon,
  PaletteIcon,
  RssIcon,
  SearchIcon,
  ServerCogIcon,
} from "lucide-react"

import { SettingsContent } from "@/components/settings/settings-sections"
import { ManagementSearch } from "@/components/shared/management-search"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { settingsCategories, type SettingsCategory } from "@/data/mock-settings"
import { useNarrowWorkspace } from "@/hooks/use-narrow-workspace"
import { useSettingsStore } from "@/store/settings-store"

const icons: Record<SettingsCategory, typeof ServerCogIcon> = {
  models: ServerCogIcon,
  statistics: BarChart3Icon,
  connections: CableIcon,
  reading: RssIcon,
  notifications: BellIcon,
  appearance: PaletteIcon,
  shortcuts: KeyboardIcon,
  about: InfoIcon,
}

export function SettingsPage() {
  const narrow = useNarrowWorkspace()
  const active = useSettingsStore((state) => state.activeCategory)
  const sheetOpen = useSettingsStore((state) => state.categorySheetOpen)
  const setSheetOpen = useSettingsStore((state) => state.setCategorySheetOpen)
  const category = settingsCategories.find((item) => item.id === active) ?? settingsCategories[0]

  return <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
    {narrow ? <>
      <div className="flex items-center gap-2 border-b px-4 py-2"><Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}><MenuIcon data-icon="inline-start" />设置分类</Button><div className="min-w-0"><div className="truncate text-sm font-medium">{category.label}</div><div className="truncate text-xs text-muted-foreground">{category.description}</div></div></div>
      <div className="min-h-0 flex-1 overflow-y-auto"><SettingsContent category={active} /></div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}><SheetContent side="left"><SheetHeader><SheetTitle>设置分类</SheetTitle><SheetDescription>搜索并切换 Aestival 本地设置。</SheetDescription></SheetHeader><CategoryList /></SheetContent></Sheet>
    </> : <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel id="settings-navigation" defaultSize="24%" minSize="220px" maxSize="340px"><aside className="flex h-full flex-col bg-muted/20"><div className="p-4 pb-2"><SettingsSearch /></div><div className="min-h-0 flex-1 overflow-y-auto p-2 pt-0"><CategoryList /></div></aside></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="settings-content" defaultSize="76%" minSize="480px"><div className="h-full overflow-y-auto"><SettingsContent category={active} /></div></ResizablePanel>
    </ResizablePanelGroup>}
  </section>
}

function SettingsSearch() {
  const search = useSettingsStore((state) => state.search)
  const setSearch = useSettingsStore((state) => state.setSearch)
  return <ManagementSearch value={search} onValueChange={setSearch} placeholder="搜索设置…" label="搜索设置" className="bg-background" />
}

function CategoryList() {
  const active = useSettingsStore((state) => state.activeCategory)
  const search = useSettingsStore((state) => state.search)
  const setActive = useSettingsStore((state) => state.setActiveCategory)
  const query = search.trim().toLowerCase()
  const results = settingsCategories.filter((item) => !query || `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(query))
  return <div className="flex flex-col gap-2"><div className="lg:hidden"><SettingsSearch /></div><div className="flex flex-col gap-1">{results.length ? results.map((item) => { const Icon=icons[item.id]; return <Button key={item.id} variant="ghost" aria-current={active === item.id ? "page" : undefined} className="h-auto w-full justify-start rounded-lg p-0 text-left font-normal aria-[current=page]:bg-accent" onClick={() => setActive(item.id)}><Item size="sm" className="w-full"><ItemMedia variant="icon"><Icon /></ItemMedia><ItemContent><ItemTitle>{item.label}</ItemTitle><ItemDescription>{item.description}</ItemDescription></ItemContent></Item></Button> }) : <Empty className="py-8"><EmptyHeader><EmptyMedia variant="icon"><SearchIcon /></EmptyMedia><EmptyTitle>未找到匹配设置</EmptyTitle><EmptyDescription>清除搜索词后可查看全部设置分类。</EmptyDescription></EmptyHeader></Empty>}</div></div>
}
