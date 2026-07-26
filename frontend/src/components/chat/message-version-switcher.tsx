import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { MockVersionSet } from "@/data/mock-conversation-management"

type MessageVersionSwitcherProps = {
  versionSet: MockVersionSet
  onSelect: (versionId: string) => void
}

export function MessageVersionSwitcher({
  versionSet,
  onSelect,
}: MessageVersionSwitcherProps) {
  const selected = versionSet.versions.find(
    (version) => version.id === versionSet.selectedId
  )

  return (
    <div className="flex max-w-3xl flex-wrap items-center justify-between gap-3 border-t pt-3">
      <Tabs value={versionSet.selectedId} onValueChange={onSelect}>
        <TabsList variant="line">
          {versionSet.versions.map((version) => (
            <TabsTrigger key={version.id} value={version.id}>
              {version.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {versionSet.versions.map((version) => (
          <TabsContent
            key={version.id}
            value={version.id}
            className="sr-only"
          >
            当前展示{version.label}，消息正文已在上方同步更新。
          </TabsContent>
        ))}
      </Tabs>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {selected?.createdAt}
        <Badge variant="outline">
          {selected?.estimatedExtraCost ?? "Mock"}
        </Badge>
      </span>
    </div>
  )
}
