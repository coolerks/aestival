import { useEffect, useMemo, useRef, useState } from "react"
import {
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  NotebookPenIcon,
  TerminalSquareIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import {
  appendProjectRoots,
  validateProjectDraft,
} from "@/lib/project-workspace"
import {
  createPreviewProjectRoot,
  pickProjectFolders,
} from "@/services/project-folder-picker"
import { activateWorkspaceProject } from "@/services/project-workspace-navigation"
import { useProjectWorkspaceStore } from "@/store/project-workspace-store"
import type {
  ProjectDraft,
  ProjectDraftErrors,
  ProjectKind,
} from "@/types/project-workspace"

const emptyDraft: ProjectDraft = {
  name: "",
  kind: null,
  roots: [],
  defaultRootId: null,
}

export function ProjectCreateDialog() {
  const open = useProjectWorkspaceStore((state) => state.projectDialogOpen)
  const requestId = useProjectWorkspaceStore(
    (state) => state.projectDialogRequestId,
  )
  const setOpen = useProjectWorkspaceStore(
    (state) => state.setProjectDialogOpen,
  )
  const createProject = useProjectWorkspaceStore(
    (state) => state.createProject,
  )
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft)
  const [errors, setErrors] = useState<ProjectDraftErrors>({})
  const [status, setStatus] = useState<"idle" | "dirty" | "loading" | "error">(
    "idle",
  )
  const [pickerMessage, setPickerMessage] = useState<string | null>(null)
  const pickerSequence = useRef(1)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const submitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (submitTimerRef.current !== null) {
      window.clearTimeout(submitTimerRef.current)
      submitTimerRef.current = null
    }
    if (!open) return
    setDraft(emptyDraft)
    setErrors({})
    setStatus("idle")
    setPickerMessage(null)
  }, [open, requestId])

  useEffect(
    () => () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current)
      }
    },
    [],
  )

  const defaultRoot = useMemo(
    () => draft.roots.find((root) => root.id === draft.defaultRootId),
    [draft.defaultRootId, draft.roots],
  )

  const patchDraft = (patch: Partial<ProjectDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setStatus("dirty")
    setErrors({})
  }

  const appendRoots = (roots: ProjectDraft["roots"]) => {
    const result = appendProjectRoots(draft.roots, roots)
    const defaultRootId =
      draft.defaultRootId ?? result.roots.find((root) => root.availability === "ready")?.id ?? null
    setDraft((current) => ({ ...current, roots: result.roots, defaultRootId }))
    setStatus("dirty")
    setErrors(result.error ? { roots: result.error } : {})
  }

  const chooseFolders = async () => {
    setStatus("loading")
    setPickerMessage(null)
    const result = await pickProjectFolders()
    if (result.status === "selected") {
      appendRoots(result.roots)
      setStatus("dirty")
      return
    }
    if (result.status === "unavailable") {
      setPickerMessage(result.message)
      setStatus("error")
      return
    }
    setStatus(draft.name || draft.kind || draft.roots.length ? "dirty" : "idle")
  }

  const addPreviewRoot = () => {
    appendRoots([createPreviewProjectRoot(pickerSequence.current)])
    pickerSequence.current += 1
    setPickerMessage(null)
  }

  const submit = () => {
    const nextErrors = validateProjectDraft(draft)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setStatus("error")
      if (nextErrors.name) nameInputRef.current?.focus()
      return
    }
    setStatus("loading")
    submitTimerRef.current = window.setTimeout(() => {
      submitTimerRef.current = null
      const project = createProject(draft)
      activateWorkspaceProject(project.id, { openFiles: true })
      toast.success(`已添加“${project.name}”`, {
        description: "项目仅保存在本次运行的前端 Mock 状态中；尚未读取目录内容。",
      })
    }, 240)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[min(760px,90vh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>添加项目</DialogTitle>
          <DialogDescription>
            选择工作区类型与一个或多个根目录。类型创建后不可转换。
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 px-6">
          <FieldGroup className="pb-6">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="project-name">名称</FieldLabel>
              <Input
                ref={nameInputRef}
                id="project-name"
                autoFocus
                value={draft.name}
                aria-invalid={Boolean(errors.name)}
                placeholder="例如：产品研究"
                onChange={(event) => patchDraft({ name: event.target.value })}
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.kind)}>
              <FieldLabel>类型</FieldLabel>
              <RadioGroup
                value={draft.kind ?? ""}
                aria-invalid={Boolean(errors.kind)}
                className="grid gap-2 md:grid-cols-2"
                onValueChange={(value) =>
                  patchDraft({ kind: value as ProjectKind })
                }
              >
                <Item
                  variant="outline"
                  render={<label htmlFor="project-kind-project" />}
                  className="cursor-pointer items-start"
                >
                  <ItemMedia variant="icon">
                    <RadioGroupItem id="project-kind-project" value="project" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <TerminalSquareIcon />项目
                    </ItemTitle>
                    <ItemDescription>
                      文件、终端、搜索、日志、会话调试与项目看板。
                    </ItemDescription>
                  </ItemContent>
                </Item>
                <Item
                  variant="outline"
                  render={<label htmlFor="project-kind-note" />}
                  className="cursor-pointer items-start"
                >
                  <ItemMedia variant="icon">
                    <RadioGroupItem id="project-kind-note" value="note" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <NotebookPenIcon />笔记
                    </ItemTitle>
                    <ItemDescription>
                      Markdown 编辑、预览、大纲、反向链接、属性与知识图谱；不提供终端和看板。
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </RadioGroup>
              <FieldDescription>
                若以后需要更换类型，请新建工作区并显式迁移内容。
              </FieldDescription>
              <FieldError>{errors.kind}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.roots)}>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel>根目录</FieldLabel>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={status === "loading"}
                  onClick={() => void chooseFolders()}
                >
                  {status === "loading" ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <FolderPlusIcon data-icon="inline-start" />
                  )}
                  添加文件夹
                </Button>
              </div>
              {draft.roots.length ? (
                <ItemGroup className="gap-2">
                  {draft.roots.map((root) => (
                    <Item key={root.id} variant="outline" size="sm">
                      <ItemMedia variant="icon"><FolderIcon /></ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {root.displayName}
                          {root.id === draft.defaultRootId ? (
                            <span className="text-xs font-normal text-muted-foreground">默认</span>
                          ) : null}
                        </ItemTitle>
                        <ItemDescription className="app-selectable-content break-all">
                          {root.path}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        {root.id !== draft.defaultRootId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => patchDraft({ defaultRootId: root.id })}
                          >
                            设为默认
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`移除文件夹 ${root.displayName}`}
                          onClick={() => {
                            const roots = draft.roots.filter((item) => item.id !== root.id)
                            patchDraft({
                              roots,
                              defaultRootId:
                                draft.defaultRootId === root.id
                                  ? roots[0]?.id ?? null
                                  : draft.defaultRootId,
                            })
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              ) : (
                <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center">
                  <FolderOpenIcon className="size-5 text-muted-foreground" />
                  <p className="text-sm font-medium">尚未选择文件夹</p>
                  <p className="text-xs text-muted-foreground">
                    目录选择只取得路径，不会扫描、读取或建立索引。
                  </p>
                </div>
              )}
              {pickerMessage ? (
                <Alert>
                  <FolderOpenIcon />
                  <AlertTitle>系统目录选择器不可用</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-2">
                    <span>{pickerMessage}</span>
                    <Button variant="outline" size="sm" onClick={addPreviewRoot}>
                      添加示例文件夹
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
              <FieldError>{errors.roots}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.defaultRootId)}>
              <FieldLabel>默认根目录</FieldLabel>
              <FieldDescription>
                新文件、附件与普通项目终端默认使用：
                {defaultRoot ? ` ${defaultRoot.displayName}` : " 尚未选择"}
              </FieldDescription>
              <FieldError>{errors.defaultRootId}</FieldError>
            </Field>
          </FieldGroup>
        </ScrollArea>
        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <Button variant="outline" disabled={status === "loading"} onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button disabled={status === "loading"} onClick={submit}>
            {status === "loading" ? <Spinner data-icon="inline-start" /> : null}
            添加项目
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
