import assert from "node:assert/strict"
import test from "node:test"

import {
  appendProjectRoots,
  projectRootFromPath,
  rootsOverlap,
  validateProjectDraft,
} from "../src/lib/project-workspace.ts"
import { useProjectWorkspaceStore } from "../src/store/project-workspace-store.ts"

test("目录冲突按路径段判断，不把相似前缀误判为父子目录", () => {
  const app = projectRootFromPath("/work/app")
  const application = projectRootFromPath("/work/application")
  const child = projectRootFromPath("/work/app/docs")

  assert.equal(rootsOverlap(app, application), false)
  assert.equal(rootsOverlap(app, child), true)
})

test("项目草稿覆盖名称、根目录与默认目录校验", () => {
  const root = projectRootFromPath("/work/notes")
  assert.deepEqual(
    validateProjectDraft({ name: "", kind: null, roots: [], defaultRootId: null }),
    {
      name: "请输入项目名称",
      kind: "请选择项目类型",
      roots: "请至少添加一个文件夹",
      defaultRootId: "请选择默认根目录",
    },
  )
  assert.deepEqual(
    validateProjectDraft({ name: "研究", kind: "note", roots: [root], defaultRootId: root.id }),
    {},
  )
})

test("追加目录拒绝重复与父子重叠", () => {
  const root = projectRootFromPath("/work/notes")
  const duplicate = projectRootFromPath("/work/notes/")
  const child = projectRootFromPath("/work/notes/archive")

  assert.match(appendProjectRoots([root], [duplicate]).error ?? "", /已经添加/)
  assert.match(appendProjectRoots([root], [child]).error ?? "", /父子目录重叠/)
})

test("新笔记项目只创建内存快照并保留固定聊天页签", () => {
  const root = projectRootFromPath("/work/product-notes")
  const project = useProjectWorkspaceStore.getState().createProject({
    name: "产品笔记",
    kind: "note",
    roots: [root],
    defaultRootId: root.id,
  })
  const snapshot = useProjectWorkspaceStore.getState().noteWorkspaces[project.id]

  assert.equal(project.createdInCurrentRun, true)
  assert.equal(snapshot?.groups[0]?.tabs[0]?.kind, "chat")
  assert.equal(snapshot?.activeRightPanel, "files")
  assert.equal(snapshot?.bottomPanelOpen, false)
  assert.equal(
    useProjectWorkspaceStore.getState().createNoteEntry(project.id, null, "不会写入", "markdown"),
    null,
    "真实目录项目在文件服务接入前不得伪造文件",
  )
})

test("示例笔记文件动作与共享 Buffer 只更新内存状态", () => {
  const store = useProjectWorkspaceStore.getState()
  const noteId = store.createNoteEntry("research-notes", "folder-inbox", "临时观察", "markdown")
  assert.ok(noteId)
  if (!noteId) return

  store.renameNoteEntry(noteId, "已整理观察")
  assert.equal(
    useProjectWorkspaceStore.getState().noteEntries.find((entry) => entry.id === noteId)?.name,
    "已整理观察.md",
  )
  store.moveNoteEntry(noteId, "folder-research")
  assert.equal(
    useProjectWorkspaceStore.getState().noteEntries.find((entry) => entry.id === noteId)?.parentId,
    "folder-research",
  )
  store.updateNoteBuffer(noteId, "# 已整理观察\n\n共享 Buffer。")
  assert.equal(useProjectWorkspaceStore.getState().noteBuffers[noteId]?.status, "dirty")
  store.markNoteSaved(noteId)
  store.updateNoteBuffer(noteId, "# 尚未保存\n")
  store.discardNoteChanges(noteId)
  assert.equal(
    useProjectWorkspaceStore.getState().noteBuffers[noteId]?.markdown,
    "# 已整理观察\n\n共享 Buffer。",
  )
  store.trashNoteEntry(noteId)
  assert.equal(useProjectWorkspaceStore.getState().noteEntries.some((entry) => entry.id === noteId), false)
  assert.equal(useProjectWorkspaceStore.getState().noteBuffers[noteId], undefined)
})

test("文件夹重命名与移动会级联相对路径并拒绝冲突或循环", () => {
  const store = useProjectWorkspaceStore.getState()
  const folderId = store.createNoteEntry(
    "research-notes",
    "folder-notes-root",
    "层级 A",
    "folder",
  )
  const targetId = store.createNoteEntry(
    "research-notes",
    "folder-notes-root",
    "目标",
    "folder",
  )
  assert.ok(folderId)
  assert.ok(targetId)
  if (!folderId || !targetId) return

  const childId = store.createNoteEntry(
    "research-notes",
    folderId,
    "子笔记",
    "markdown",
  )
  const innerId = store.createNoteEntry(
    "research-notes",
    folderId,
    "内层",
    "folder",
  )
  assert.ok(childId)
  assert.ok(innerId)
  if (!childId || !innerId) return

  assert.equal(store.moveNoteEntry(folderId, innerId), false)
  assert.equal(store.renameNoteEntry(folderId, "层级 B"), true)
  assert.equal(
    useProjectWorkspaceStore.getState().noteEntries.find((entry) => entry.id === childId)?.relativePath,
    "层级 B/子笔记.md",
  )
  assert.equal(store.moveNoteEntry(folderId, targetId), true)
  assert.equal(
    useProjectWorkspaceStore.getState().noteEntries.find((entry) => entry.id === innerId)?.relativePath,
    "目标/层级 B/内层",
  )

  const conflictId = store.createNoteEntry(
    "research-notes",
    targetId,
    "冲突",
    "folder",
  )
  assert.ok(conflictId)
  assert.equal(store.renameNoteEntry(folderId, "冲突"), false)

  store.trashNoteEntry(targetId)
})
