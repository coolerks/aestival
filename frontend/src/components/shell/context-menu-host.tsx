import { useEffect, useMemo, useState } from "react"
import {
  ClipboardPasteIcon,
  CopyIcon,
  EraserIcon,
  Redo2Icon,
  ScissorsIcon,
  TextSelectIcon,
  Undo2Icon,
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
import {
  copyTextToClipboard,
  inputHasSelection,
  readTextFromClipboard,
  replaceInputSelection,
  selectElementContents,
  selectedText,
} from "@/lib/context-menu-utils"

type EditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement

type ContextTarget =
  | {
      kind: "editable"
      element: EditableElement
      selectedText: string
      hasSelection: boolean
    }
  | {
      kind: "selectable"
      element: HTMLElement
      selectedText: string
    }

type ContextPosition = { x: number; y: number }

function isTextInput(element: HTMLInputElement) {
  return !["button", "checkbox", "color", "date", "file", "hidden", "image", "radio", "range", "reset", "submit", "time"].includes(element.type)
}

function getEditableTarget(target: EventTarget | null): EditableElement | null {
  if (!(target instanceof Element)) return null
  if (target instanceof HTMLInputElement) {
    return isTextInput(target) ? target : null
  }
  if (target instanceof HTMLTextAreaElement) return target
  const editable = target.closest<HTMLElement>('[contenteditable="true"], [role="textbox"]')
  return editable
}

function getSelectableTarget(
  target: EventTarget | null,
  hasSelection: boolean,
): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const selectable = target.closest<HTMLElement>(
    ".app-selectable-content, [data-app-selectable-content=\"true\"]",
  )
  if (!selectable) return null
  // 空白管理页和普通正文区域不提供“复制全部”菜单；只有真实选区才进入
  // 通用文本菜单。文件预览、终端、Monaco 等需要全文操作的区域使用各自
  // 的专用 ContextMenu。
  return hasSelection || selectable.dataset.contextMenuCopyAll === "true"
    ? selectable
    : null
}

function copyText(text: string) {
  if (!text) {
    toast.info("没有可复制的文本")
    return
  }
  void copyTextToClipboard(text).then((copied) => {
    if (copied) {
      toast.success("已复制")
    } else {
      toast.warning("无法写入剪贴板")
    }
  })
}

function executeEditableCommand(target: ContextTarget & { kind: "editable" }, command: string) {
  target.element.focus()
  document.execCommand(command)
}

function EditableMenu({ target }: { target: Extract<ContextTarget, { kind: "editable" }> }) {
  const element = target.element
  const inputElement = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
  const hasValue = inputElement ? element.value.length > 0 : Boolean(element.textContent)
  return (
    <>
      <ContextMenuGroup>
        <ContextMenuLabel>编辑</ContextMenuLabel>
        <ContextMenuItem onClick={() => executeEditableCommand(target, "undo")}>
          <Undo2Icon />撤销<ContextMenuShortcut>⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => executeEditableCommand(target, "redo")}>
          <Redo2Icon />重做<ContextMenuShortcut>⇧⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!target.hasSelection}
          onClick={() => {
            if (inputElement) {
              copyText(target.selectedText)
              replaceInputSelection(element, "")
            } else {
              executeEditableCommand(target, "cut")
            }
          }}
        >
          <ScissorsIcon />剪切<ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!target.hasSelection}
          onClick={() => copyText(target.selectedText)}
        >
          <CopyIcon />复制<ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            if (inputElement) {
              void readTextFromClipboard().then((value) => {
                if (value === null) {
                  toast.warning("无法读取剪贴板，请使用系统粘贴快捷键")
                  return
                }
                replaceInputSelection(element, value)
              })
            } else {
              executeEditableCommand(target, "paste")
            }
          }}
        >
          <ClipboardPasteIcon />粘贴<ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            element.focus()
            if (inputElement) element.select()
            else document.execCommand("selectAll")
          }}
        >
          <TextSelectIcon />全选<ContextMenuShortcut>⌘A</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuItem
        disabled={!hasValue}
        onClick={() => {
          if (inputElement) {
            element.focus()
            element.select()
            document.execCommand("delete")
            element.dispatchEvent(new Event("input", { bubbles: true }))
          } else {
            executeEditableCommand(target, "selectAll")
            document.execCommand("delete")
          }
        }}
      >
        <EraserIcon />清空内容
      </ContextMenuItem>
    </>
  )
}

function SelectableMenu({ target }: { target: Extract<ContextTarget, { kind: "selectable" }> }) {
  const text = target.selectedText || target.element.textContent?.trim() || ""
  return (
    <>
      <ContextMenuGroup>
        <ContextMenuLabel>文本</ContextMenuLabel>
        <ContextMenuItem onClick={() => copyText(text)}>
          <CopyIcon />{target.selectedText ? "复制选中文本" : "复制全部内容"}<ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => selectElementContents(target.element)}>
          <TextSelectIcon />全选<ContextMenuShortcut>⌘A</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>
    </>
  )
}

export function ContextMenuHost() {
  const [target, setTarget] = useState<ContextTarget | null>(null)
  const [position, setPosition] = useState<ContextPosition>({ x: 0, y: 0 })
  const [open, setOpen] = useState(false)
  const anchor = useMemo(
    () => ({
      getBoundingClientRect: () =>
        DOMRect.fromRect({
          width: 0,
          height: 0,
          x: position.x,
          y: position.y,
        }),
    }),
    [position],
  )

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null
      if (
        !element ||
        element.closest("[data-slot=\"context-menu-trigger\"], [data-slot=\"context-menu-content\"]")
      ) {
        return
      }

      const editable = getEditableTarget(event.target)
      const pageSelection = selectedText()
      const inputSelection =
        editable instanceof HTMLInputElement || editable instanceof HTMLTextAreaElement
          ? editable.value.slice(
              editable.selectionStart ?? 0,
              editable.selectionEnd ?? editable.selectionStart ?? 0,
            )
          : pageSelection
      const selectable = editable
        ? null
        : getSelectableTarget(event.target, Boolean(pageSelection))
      const nextTarget: ContextTarget | null = editable
        ? {
            kind: "editable",
            element: editable,
            selectedText: inputSelection,
            hasSelection:
              editable instanceof HTMLInputElement || editable instanceof HTMLTextAreaElement
                ? inputHasSelection(editable)
                : Boolean(pageSelection),
          }
        : selectable
          ? { kind: "selectable", element: selectable, selectedText: pageSelection }
          : null

      if (!nextTarget) {
        setOpen(false)
        setTarget(null)
        return
      }

      event.preventDefault()
      setPosition({ x: event.clientX, y: event.clientY })
      setTarget(nextTarget)
      setOpen(true)
    }

    document.addEventListener("contextmenu", handleContextMenu)
    return () => document.removeEventListener("contextmenu", handleContextMenu)
  }, [])

  return (
    <ContextMenu open={open} onOpenChange={setOpen}>
      <ContextMenuTrigger
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none fixed size-px"
        style={{ left: position.x, top: position.y }}
      />
      <ContextMenuContent anchor={anchor} className="w-64">
        {target?.kind === "editable" ? <EditableMenu target={target} /> : null}
        {target?.kind === "selectable" ? <SelectableMenu target={target} /> : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}
