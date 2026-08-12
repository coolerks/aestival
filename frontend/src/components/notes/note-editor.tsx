import { useCallback } from "react"
import {
  Columns2Icon,
  EyeIcon,
  FileCode2Icon,
  PanelRightOpenIcon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { VditorSurface } from "@/components/notes/vditor-surface"
import { IconButton } from "@/components/shell/icon-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { noteEditorKey } from "@/lib/project-workspace"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import type { NoteEditorMode } from "@/types/project-workspace"

const modes: Array<{
  id: NoteEditorMode
  label: string
  icon: typeof FileCode2Icon
}> = [
  { id: "source", label: "源码", icon: FileCode2Icon },
  { id: "split", label: "并排", icon: Columns2Icon },
  { id: "instant", label: "即时", icon: SparklesIcon },
  { id: "preview", label: "预览", icon: EyeIcon },
]

export function NoteEditor({
  projectId,
  groupId,
  noteId,
}: {
  projectId: string
  groupId: string
  noteId: string
}) {
  const workspace = useProjectWorkspaceStore(
    (state) => state.noteWorkspaces[projectId],
  )
  const buffer = useProjectWorkspaceStore((state) => state.noteBuffers[noteId])
  const setMode = useProjectWorkspaceStore((state) => state.setNoteEditorMode)
  const updateBuffer = useProjectWorkspaceStore((state) => state.updateNoteBuffer)
  const markSaved = useProjectWorkspaceStore((state) => state.markNoteSaved)
  const splitActiveNote = useProjectWorkspaceStore((state) => state.splitActiveNote)
  const mode = workspace?.editorModes[noteEditorKey(groupId, noteId)] ?? "instant"
  const handleChange = useCallback(
    (value: string) => updateBuffer(noteId, value),
    [noteId, updateBuffer],
  )
  const saveBuffer = useCallback(() => {
    if (buffer?.status !== "dirty") return
    markSaved(noteId)
    toast.success("已保存到内存 Buffer（Mock）", {
      description: "尚未写入本地文件。",
    })
  }, [buffer?.status, markSaved, noteId])

  if (!workspace || !buffer) return null

  return (
    <div
      className="flex size-full min-h-0 flex-col bg-background"
      onKeyDownCapture={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "s") {
          event.preventDefault()
          event.stopPropagation()
          saveBuffer()
        }
      }}
    >
      <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-2 border-b px-2 py-1">
        <ToggleGroup
          value={[mode]}
          onValueChange={(values) => {
            const value = values[0] as NoteEditorMode | undefined
            if (value) setMode(projectId, groupId, noteId, value)
          }}
          variant="outline"
          spacing={0}
          size="sm"
          aria-label="Markdown 编辑模式"
        >
          {modes.map((item) => {
            const Icon = item.icon
            return (
              <ToggleGroupItem key={item.id} value={item.id} aria-label={item.label}>
                <Icon data-icon="inline-start" />
                <span className="hidden xl:inline">{item.label}</span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
        <Separator orientation="vertical" className="h-5" />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={buffer.status !== "dirty"}
                onClick={saveBuffer}
              />
            }
          >
            <SaveIcon data-icon="inline-start" />
            {buffer.status === "dirty" ? "保存" : "已保存"}
          </TooltipTrigger>
          <TooltipContent>保存到前端 Mock Buffer · ⌘S</TooltipContent>
        </Tooltip>
        <span className="min-w-0 flex-1" />
        {workspace.groups.length < 2 ? (
          <IconButton label="在侧边打开当前笔记" onClick={() => splitActiveNote(projectId)}>
            <PanelRightOpenIcon />
          </IconButton>
        ) : null}
        <Badge variant="outline">Mock Buffer · v{buffer.version}</Badge>
      </div>
      <div className="min-h-0 flex-1">
        <VditorSurface
          noteId={noteId}
          markdown={buffer.markdown}
          mode={mode}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
