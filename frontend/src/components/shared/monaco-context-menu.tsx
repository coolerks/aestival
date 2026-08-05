import type { ReactNode } from "react"
import type { OnMount } from "@monaco-editor/react"
import {
  AlignLeftIcon,
  ClipboardPasteIcon,
  CommandIcon,
  CopyIcon,
  CornerDownRightIcon,
  ListTreeIcon,
  MessageSquarePlusIcon,
  PencilIcon,
  ScissorsIcon,
  ScanSearchIcon,
  SparklesIcon,
  TextSelectIcon,
  WandSparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export type MonacoEditorInstance = Parameters<OnMount>[0]
export type MonacoEditorRef = { current: MonacoEditorInstance | null }

type MonacoContextMenuProps = {
  children: ReactNode
  editorRef: MonacoEditorRef
  readOnly?: boolean
}

function runEditorAction(
  editorRef: MonacoEditorRef,
  actionId: string,
  onMissing?: () => void,
) {
  const editor = editorRef.current
  if (!editor) {
    onMissing?.()
    return
  }
  const action = editor.getAction(actionId)
  if (!action) {
    onMissing?.()
    return
  }
  void action.run()
}

function triggerEditorAction(editorRef: MonacoEditorRef, actionId: string) {
  const editor = editorRef.current
  if (!editor) return
  editor.trigger("aestival-context-menu", actionId, null)
}

export function MonacoContextMenu({
  children,
  editorRef,
  readOnly = false,
}: MonacoContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="size-full min-h-0 select-text"
        data-context-menu-owned="monaco"
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuGroup>
          <ContextMenuLabel>编辑器</ContextMenuLabel>
          <ContextMenuItem
            onClick={() =>
              runEditorAction(editorRef, "editor.action.goToDeclaration", () =>
                toast.info("当前语言服务未提供定义跳转"),
              )
            }
          >
            <CornerDownRightIcon />
            转到定义
            <ContextMenuShortcut>F12</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              runEditorAction(editorRef, "editor.action.peekDeclaration", () =>
                toast.info("当前语言服务未提供定义预览"),
              )
            }
          >
            <ScanSearchIcon />
            查看定义
            <ContextMenuShortcut>⌥F12</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              runEditorAction(
                editorRef,
                "editor.action.referenceSearch.trigger",
                () => toast.info("当前语言服务未提供引用搜索"),
              )
            }
          >
            <ListTreeIcon />
            查找所有引用
            <ContextMenuShortcut>⇧F12</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              runEditorAction(editorRef, "editor.action.rename", () =>
                toast.info("当前语言服务未提供符号重命名"),
              )
            }
          >
            <PencilIcon />
            重命名符号
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              runEditorAction(editorRef, "editor.action.formatDocument", () =>
                toast.info("当前语言服务未提供格式化"),
              )
            }
          >
            <AlignLeftIcon />
            格式化文档
            <ContextMenuShortcut>⇧⌥F</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>选区与对话</ContextMenuLabel>
          <ContextMenuItem
            onClick={() => toast.info("已将当前选区加入对话（Mock）")}
          >
            <MessageSquarePlusIcon />
            将选区添加到对话
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => toast.info("选区解释将在后续聊天交互中接入")}
          >
            <SparklesIcon />
            让代理解释选区
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => toast.info("选区修改将在后续聊天交互中接入")}
          >
            <WandSparklesIcon />
            让代理修改选区
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>剪贴板</ContextMenuLabel>
          <ContextMenuItem
            disabled={readOnly}
            onClick={() => triggerEditorAction(editorRef, "editor.action.clipboardCutAction")}
          >
            <ScissorsIcon />
            剪切
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => triggerEditorAction(editorRef, "editor.action.clipboardCopyAction")}
          >
            <CopyIcon />
            复制
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            disabled={readOnly}
            onClick={() => triggerEditorAction(editorRef, "editor.action.clipboardPasteAction")}
          >
            <ClipboardPasteIcon />
            粘贴
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => triggerEditorAction(editorRef, "editor.action.selectAll")}
          >
            <TextSelectIcon />
            全选
            <ContextMenuShortcut>⌘A</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() =>
            runEditorAction(editorRef, "editor.action.quickCommand", () =>
              toast.info("命令面板尚未准备好"),
            )
          }
        >
          <CommandIcon />
          打开命令面板
          <ContextMenuShortcut>F1</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
