import {
  ChevronRightIcon,
  ClipboardCopyIcon,
  FilePlusIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockFiles, mockFileTree, type MockFileTreeNode } from "@/data/mock-workspace-panels"
import { cn } from "@/lib/utils"
import { useWorkspacePanelStore } from "@/store/workspace-panel-store"

import folderProject from "@/assets/icons/material/folder-project.svg"
import folderSrc from "@/assets/icons/material/folder-src.svg"
import folderDocs from "@/assets/icons/material/folder-docs.svg"
import reactTs from "@/assets/icons/material/react_ts.svg"
import markdown from "@/assets/icons/material/markdown.svg"
import json from "@/assets/icons/material/json.svg"
import document from "@/assets/icons/material/document.svg"
import image from "@/assets/icons/material/image.svg"
import pdf from "@/assets/icons/material/pdf.svg"

const icons = { "folder-project": folderProject, "folder-src": folderSrc, "folder-docs": folderDocs, react_ts: reactTs, markdown, json, document, image, pdf }

function TreeNode({ node, depth = 0 }: { node: MockFileTreeNode; depth?: number }) {
  const expandedFolders = useWorkspacePanelStore((state) => state.expandedFolders)
  const selectedFileIds = useWorkspacePanelStore((state) => state.selectedFileIds)
  const toggleFolder = useWorkspacePanelStore((state) => state.toggleFolder)
  const selectFile = useWorkspacePanelStore((state) => state.selectFile)
  const openFile = useWorkspacePanelStore((state) => state.openFile)

  if (node.kind === "folder") {
    const open = expandedFolders.includes(node.id)
    return (
      <Collapsible open={open} onOpenChange={() => toggleFolder(node.id)}>
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <CollapsibleTrigger className="flex h-7 w-full items-center gap-1 rounded-md pr-2 text-left text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            }
          >
            <span style={{ width: depth * 14 }} className="shrink-0" />
            <ChevronRightIcon className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-90")} />
            <img src={icons[node.icon ?? "folder-project"]} alt="" className="size-4" />
            <span className="truncate font-medium">{node.name}</span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => toast.info("Mock：新建文件尚未写入本地")}> <FilePlusIcon />新建文件</ContextMenuItem>
            <ContextMenuItem onClick={() => toast.info("Mock：新建文件夹尚未写入本地")}> <FolderPlusIcon />新建文件夹</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => toast.success("路径已复制（Mock）")}><ClipboardCopyIcon />复制路径<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut></ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          {node.children?.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const file = mockFiles.find((item) => item.id === node.fileId)
  if (!file) return null
  const selected = selectedFileIds.includes(file.id)
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<Button variant="ghost" />}
        className={cn("flex h-7 w-full items-center gap-1 rounded-md pr-2 text-left text-xs hover:bg-accent", selected && "bg-accent text-accent-foreground")}
        style={{ paddingLeft: depth * 14 + 20 }}
        onClick={(event) => {
          selectFile(file.id, event.metaKey || event.ctrlKey)
          openFile(file.id, false)
        }}
        onDoubleClick={() => openFile(file.id, true)}
      >
        <img src={icons[file.icon]} alt="" className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{file.name}</span>
        {node.status ? <span className="text-[10px] text-muted-foreground">{node.status}</span> : null}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openFile(file.id, true)}><FolderOpenIcon />固定打开<ContextMenuShortcut>Enter</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem onClick={() => toast.success("路径已复制（Mock）")}><ClipboardCopyIcon />复制路径<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => toast.info("Mock：在系统文件管理器中显示")}> <SearchIcon />在文件管理器中显示</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function FilesPanel() {
  const mockWorkspaceOpen = useWorkspacePanelStore((state) => state.mockWorkspaceOpen)
  const openMockWorkspace = useWorkspacePanelStore((state) => state.openMockWorkspace)
  if (!mockWorkspaceOpen) {
    return (
      <Empty className="h-full rounded-none">
        <EmptyHeader>
          <EmptyMedia variant="icon"><FolderOpenIcon /></EmptyMedia>
          <EmptyTitle>当前任务没有工作目录</EmptyTitle>
          <EmptyDescription>打开本地文件夹后，这里会显示文件树。当前操作只加载 Mock 工作区。</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row">
          <Button variant="outline" onClick={() => { openMockWorkspace(); toast.success("已加载 Mock 工作区") }}><FolderOpenIcon data-icon="inline-start" />打开文件夹</Button>
          <Button variant="ghost" onClick={() => { openMockWorkspace(); toast.success("已打开最近的 Mock 项目") }}><RefreshCwIcon data-icon="inline-start" />最近项目</Button>
        </EmptyContent>
      </Empty>
    )
  }
  return (
    <div className="flex size-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1 p-1" tabIndex={0}>
        <TreeNode node={mockFileTree} />
      </ScrollArea>
    </div>
  )
}
