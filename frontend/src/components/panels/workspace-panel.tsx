import {
  FilesIcon,
  PanelBottomIcon,
  SearchIcon,
  TerminalIcon,
  XIcon,
} from "lucide-react"

import { IconButton } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { useWorkspaceStore } from "@/store/workspace-store"

type WorkspacePanelProps = {
  placement: "right" | "bottom"
}

export function WorkspacePanel({ placement }: WorkspacePanelProps) {
  const toggleRightPanel = useWorkspaceStore((state) => state.toggleRightPanel)
  const toggleBottomPanel = useWorkspaceStore((state) => state.toggleBottomPanel)
  const closePanel =
    placement === "right" ? toggleRightPanel : toggleBottomPanel

  return (
    <aside className="flex size-full min-h-0 flex-col bg-muted/20">
      <header className="flex h-9 shrink-0 items-center gap-2 px-3">
        {placement === "right" ? <FilesIcon className="size-4" /> : <TerminalIcon className="size-4" />}
        <span className="text-xs font-medium">
          {placement === "right" ? "文件" : "终端 1"}
        </span>
        <Badge variant="outline" className="ml-1">Mock</Badge>
        <div className="ml-auto flex items-center gap-1">
          {placement === "right" ? (
            <IconButton label="移到底部">
              <PanelBottomIcon />
            </IconButton>
          ) : null}
          <IconButton label={placement === "right" ? "关闭右侧栏" : "关闭底部面板"} onClick={closePanel}>
            <XIcon />
          </IconButton>
        </div>
      </header>
      <Separator />
      <Empty className="rounded-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {placement === "right" ? <FilesIcon /> : <TerminalIcon />}
          </EmptyMedia>
          <EmptyTitle>
            {placement === "right"
              ? "当前任务没有工作目录"
              : "终端服务尚未接入"}
          </EmptyTitle>
          <EmptyDescription>
            {placement === "right"
              ? "选择一个本地文件夹后，这里会显示使用 Material 图标的文件树。"
              : "本轮只实现面板布局与交互外壳，不会模拟真实命令执行。"}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {placement === "right" ? (
            <div className="flex gap-2">
              <Button variant="outline">
                <FilesIcon data-icon="inline-start" />
                打开文件夹
              </Button>
              <Button variant="ghost">
                <SearchIcon data-icon="inline-start" />
                最近项目
              </Button>
            </div>
          ) : null}
        </EmptyContent>
      </Empty>
    </aside>
  )
}
